"""Validated data boundary between Forge and a future SAD coaching service."""

import json
import uuid
from dataclasses import asdict, dataclass
from urllib.request import Request, urlopen


PROTOCOL_VERSION = "forge-sad-v1"


@dataclass(frozen=True)
class CoachingRequest:
    protocol_version: str
    mission_id: str
    lesson: str
    prompt: str
    student_answer: str
    answer_is_correct: bool
    attempt_number: int
    hint: str

    def to_dict(self) -> dict:
        return asdict(self)


def build_coaching_request(mission, answer: str, attempt_number: int) -> dict:
    if attempt_number < 1:
        raise ValueError("Attempt number must be positive.")
    return CoachingRequest(PROTOCOL_VERSION, mission.mission_id, mission.lesson, mission.prompt, answer[:500], mission.check(answer), attempt_number, mission.hint).to_dict()


def validate_coaching_response(response: dict) -> str:
    if not isinstance(response, dict) or response.get("protocol_version") != PROTOCOL_VERSION:
        raise ValueError("SAD response uses an unsupported protocol.")
    feedback = response.get("feedback")
    if not isinstance(feedback, str) or not feedback.strip() or len(feedback) > 500:
        raise ValueError("SAD feedback must contain 1 to 500 characters.")
    return feedback.strip()


class SadFailureReporter:
    """Send bounded failure evidence to SAD without gaining repair authority."""

    def __init__(self, base_url="http://127.0.0.1:8765", timeout=2.0):
        if not base_url.startswith(("http://127.0.0.1:", "http://localhost:", "http://[::1]:")):
            raise ValueError("SAD must use a loopback HTTP address")
        self.url = base_url.rstrip("/") + "/v1/forge/failures"
        self.timeout = timeout

    def report(self, exact_failure, evidence, report_id=None, user_correction=""):
        payload = {
            "protocol_version": PROTOCOL_VERSION,
            "report_id": report_id or str(uuid.uuid4()),
            "exact_failure": exact_failure[:2000],
            "user_correction": user_correction[:2000],
            "evidence": evidence,
        }
        request = Request(
            self.url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urlopen(request, timeout=self.timeout) as response:
            result = json.load(response)
        if response.status != 202 or result.get("protocol_version") != PROTOCOL_VERSION:
            raise ValueError("SAD returned an invalid failure acknowledgement")
        if result.get("status") != "pending_human_approval":
            raise ValueError("SAD bypassed the required human-approval state")
        return result


class SadLearningReporter:
    """Share bounded learning evidence with local SAD, never private profile data."""

    def __init__(self, base_url="http://127.0.0.1:8765", timeout=2.0):
        if not base_url.startswith(("http://127.0.0.1:", "http://localhost:", "http://[::1]:")):
            raise ValueError("SAD must use a loopback HTTP address")
        self.url = base_url.rstrip("/") + "/v1/forge/learning-results"
        self.timeout = timeout

    def report(self, mission_id, correct, attempt_number):
        if not isinstance(mission_id, str) or not mission_id or len(mission_id) > 80:
            raise ValueError("Mission id must contain 1 to 80 characters")
        if not isinstance(correct, bool) or not isinstance(attempt_number, int) or attempt_number < 1:
            raise ValueError("Learning result is invalid")
        payload = {
            "protocol_version": PROTOCOL_VERSION,
            "result_id": str(uuid.uuid4()),
            "mission_id": mission_id,
            "correct": correct,
            "attempt_number": attempt_number,
        }
        request = Request(self.url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
        with urlopen(request, timeout=self.timeout) as response:
            result = json.load(response)
        if response.status not in (200, 202) or result.get("protocol_version") != PROTOCOL_VERSION:
            raise ValueError("SAD returned an invalid learning-result acknowledgement")
        return result


class SadCoachClient:
    """Use SAD coaching over loopback while keeping Forge safe offline."""

    def __init__(self, base_url="http://127.0.0.1:8765", timeout=3.0):
        if not base_url.startswith(("http://127.0.0.1:", "http://localhost:", "http://[::1]:")):
            raise ValueError("SAD must use a loopback HTTP address")
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def health(self):
        with urlopen(self.base_url + "/health", timeout=self.timeout) as response:
            result = json.load(response)
        return response.status == 200 and result.get("protocol_version") == PROTOCOL_VERSION

    def __call__(self, payload):
        request = Request(self.base_url + "/v1/forge/coach", data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"}, method="POST")
        with urlopen(request, timeout=self.timeout) as response:
            result = json.load(response)
        if response.status != 200:
            raise ValueError("SAD coaching is unavailable")
        return result
