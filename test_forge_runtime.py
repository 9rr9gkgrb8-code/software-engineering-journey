import unittest

from forge_runtime import MAX_SOURCE_BYTES, run_mission


class ForgeRuntimeTests(unittest.TestCase):
    def test_valid_variable_mission_returns_evidence_and_commands(self):
        result = run_mission("variables", 'robot_name = "Bolt"')
        self.assertEqual(result["protocol_version"], "forge-runtime-v1")
        self.assertEqual(result["status"], "passed")
        self.assertEqual([item["type"] for item in result["commands"]], ["say", "unlock", "collect"])
        self.assertTrue(result["result_id"])

    def test_wrong_value_fails_without_unlock(self):
        result = run_mission("variables", 'robot_name = "Other"')
        self.assertEqual(result["status"], "failed")
        self.assertNotIn("unlock", [item["type"] for item in result["commands"]])

    def test_import_calls_attributes_and_control_flow_are_rejected(self):
        attacks = [
            "import os",
            'open("secret.txt").read()',
            '__import__("os").system("id")',
            "while True:\n    pass",
            "[x for x in range(100)]",
            "robot_name.__class__",
        ]
        for source in attacks:
            with self.subTest(source=source):
                result = run_mission("variables", source)
                self.assertEqual(result["status"], "rejected")
                self.assertEqual(result["commands"], [])

    def test_resource_limits_fail_closed(self):
        self.assertEqual(run_mission("variables", "x" * (MAX_SOURCE_BYTES + 1))["status"], "rejected")
        self.assertEqual(run_mission("variables", "robot_name = 999999 * 999999")["status"], "rejected")
        self.assertEqual(run_mission("variables", 'robot_name = "x" * 1000')["status"], "rejected")

    def test_unknown_mission_is_rejected(self):
        result = run_mission("filesystem", 'robot_name = "Bolt"')
        self.assertEqual(result["status"], "rejected")
        self.assertEqual(result["diagnostics"][0]["code"], "unknown_mission")

    def test_syntax_error_has_bounded_line_evidence(self):
        result = run_mission("variables", "robot_name =")
        self.assertEqual(result["status"], "failed")
        self.assertEqual(result["diagnostics"][0]["code"], "syntax_error")
        self.assertEqual(result["diagnostics"][0]["line"], 1)


if __name__ == "__main__":
    unittest.main()
