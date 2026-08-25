"""V1 acceptance tests for Forge and its SAD boundary."""

import json
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from unittest.mock import patch

import progress
from curriculum import MISSIONS, get_mission
from forge_app import ForgeCoach
from sad_interface import build_coaching_request, validate_coaching_response
from sad_interface import SadCoachClient, SadLearningReporter


class ForgeV1Tests(unittest.TestCase):
    def setUp(self):
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.original_progress_file = progress.PROGRESS_FILE
        progress.PROGRESS_FILE = Path(self.temporary_directory.name) / "progress.json"

    def tearDown(self):
        progress.PROGRESS_FILE = self.original_progress_file
        self.temporary_directory.cleanup()

    def test_curriculum_has_six_unique_beginner_missions(self):
        self.assertEqual(len(MISSIONS), 6)
        self.assertEqual(len({mission.mission_id for mission in MISSIONS}), 6)

    def test_each_mission_accepts_its_documented_answer(self):
        for mission in MISSIONS:
            with self.subTest(mission=mission.mission_id):
                self.assertTrue(mission.check(mission.accepted_answers[0]))

    def test_correct_answer_completes_mission_without_executing_code(self):
        coach = ForgeCoach()
        with patch("builtins.exec") as execute:
            result = coach.evaluate("variables", 'robot_name = "Bolt"', 1)
        self.assertTrue(result["correct"])
        execute.assert_not_called()
        self.assertEqual(progress.load_progress()["completed_missions"], ["variables"])

    def test_incorrect_answer_gets_age_appropriate_hint(self):
        result = ForgeCoach().evaluate("loops", "repeat three times", 1)
        self.assertFalse(result["correct"])
        self.assertIn("Hint:", result["feedback"])
        self.assertEqual(progress.load_progress()["completed_missions"], [])

    def test_sad_request_is_bounded_and_versioned(self):
        request = build_coaching_request(get_mission("variables"), "x" * 1000, 2)
        self.assertEqual(request["protocol_version"], "forge-sad-v1")
        self.assertEqual(len(request["student_answer"]), 500)
        self.assertEqual(request["attempt_number"], 2)

    def test_valid_sad_feedback_is_used(self):
        def sad_coach(request):
            self.assertEqual(request["protocol_version"], "forge-sad-v1")
            return {"protocol_version": "forge-sad-v1", "feedback": "Nice reasoning. Check the quotation marks."}

        result = ForgeCoach(sad_coach).evaluate("variables", "robot_name = Bolt", 1)
        self.assertEqual(result["feedback"], "Nice reasoning. Check the quotation marks.")

    def test_invalid_sad_feedback_falls_back_safely(self):
        result = ForgeCoach(lambda _request: {"feedback": "x" * 1000}).evaluate("variables", "wrong", 1)
        self.assertIn("Hint:", result["feedback"])

    def test_invalid_sad_feedback_is_reported_without_blocking_fallback(self):
        class FakeReporter:
            def __init__(self):
                self.reports = []

            def report(self, exact_failure, evidence):
                self.reports.append((exact_failure, evidence))
                return {"status": "pending_human_approval"}

        reporter = FakeReporter()
        coach = ForgeCoach(lambda request: {"protocol_version": "wrong"}, reporter)
        result = coach.evaluate("variables", "wrong", 2)

        self.assertIn("Hint:", result["feedback"])
        self.assertEqual(len(reporter.reports), 1)
        self.assertEqual(reporter.reports[0][1]["mission_id"], "variables")
        self.assertEqual(reporter.reports[0][1]["attempt_number"], 2)

    def test_reporter_outage_never_blocks_local_fallback(self):
        class OfflineReporter:
            def report(self, exact_failure, evidence):
                raise OSError("SAD is offline")

        coach = ForgeCoach(lambda request: None, OfflineReporter())
        result = coach.evaluate("variables", "wrong", 1)

        self.assertIn("Hint:", result["feedback"])

    def test_response_validator_rejects_wrong_protocol(self):
        with self.assertRaises(ValueError):
            validate_coaching_response({"protocol_version": "other", "feedback": "Hi"})

    def test_corrupt_progress_recovers_to_empty(self):
        progress.PROGRESS_FILE.write_text("not-json", encoding="utf-8")
        self.assertEqual(progress.load_progress(), {"completed_missions": []})

    def test_concurrent_completions_preserve_every_mission(self):
        with ThreadPoolExecutor(max_workers=6) as pool:
            mission_ids = [mission.mission_id for mission in MISSIONS]
            list(pool.map(progress.mark_complete, mission_ids * 20))
        self.assertEqual(set(progress.load_progress()["completed_missions"]), set(mission_ids))
        json.loads(progress.PROGRESS_FILE.read_text(encoding="utf-8"))

    def test_unknown_mission_is_rejected(self):
        with self.assertRaises(ValueError):
            ForgeCoach().evaluate("unknown", "answer", 1)

    def test_learning_result_is_reported_without_sharing_student_answer(self):
        class Reporter:
            def __init__(self): self.calls = []
            def report(self, *args): self.calls.append(args)
        reporter = Reporter()
        ForgeCoach(learning_reporter=reporter).evaluate("variables", 'robot_name = "Bolt"', 2)
        self.assertEqual(reporter.calls, [("variables", True, 2)])

    def test_learning_reporter_requires_loopback_sad(self):
        with self.assertRaises(ValueError):
            SadLearningReporter("https://example.com")

    def test_coach_client_requires_loopback_sad(self):
        with self.assertRaises(ValueError):
            SadCoachClient("https://example.com")

    def test_coaching_request_includes_only_bounded_mission_hint(self):
        request = build_coaching_request(get_mission("loops"), "wrong", 1)
        self.assertEqual(request["hint"], get_mission("loops").hint)
        self.assertLessEqual(len(request["hint"]), 500)

    def test_learning_reporter_outage_never_blocks_learning(self):
        class Offline:
            def report(self, *_args): raise OSError("offline")
        result = ForgeCoach(learning_reporter=Offline()).evaluate("loops", "wrong", 1)
        self.assertFalse(result["correct"])


if __name__ == "__main__":
    unittest.main()
