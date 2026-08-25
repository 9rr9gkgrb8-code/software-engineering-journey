"""Forge V1 command-line learning application."""

from curriculum import MISSIONS, get_mission
from progress import load_progress, mark_complete
from sad_interface import SadCoachClient, SadFailureReporter, SadLearningReporter, build_coaching_request, validate_coaching_response


class ForgeCoach:
    def __init__(self, sad_coach=None, failure_reporter=None, learning_reporter=None):
        self.sad_coach = sad_coach
        self.failure_reporter = failure_reporter
        self.learning_reporter = learning_reporter

    def evaluate(self, mission_id: str, answer: str, attempt_number: int) -> dict:
        mission = get_mission(mission_id)
        correct = mission.check(answer)
        request = build_coaching_request(mission, answer, attempt_number)
        feedback = None
        if self.sad_coach is not None:
            try:
                feedback = validate_coaching_response(self.sad_coach(request))
            except (OSError, ValueError, TypeError) as error:
                feedback = None
                if self.failure_reporter is not None:
                    try:
                        self.failure_reporter.report(
                            "Forge rejected an invalid SAD coaching response.",
                            {
                                "mission_id": mission_id,
                                "attempt_number": attempt_number,
                                "error_type": type(error).__name__,
                            },
                        )
                    except (OSError, ValueError, TypeError):
                        pass
        if feedback is None:
            feedback = "You forged it! That answer is correct." if correct else f"Good attempt. Hint: {mission.hint}"
        if correct:
            mark_complete(mission_id)
        if self.learning_reporter is not None:
            try:
                self.learning_reporter.report(mission_id, correct, attempt_number)
            except (OSError, ValueError, TypeError):
                pass
        return {"correct": correct, "feedback": feedback, "request": request}


def choose_mission():
    print("\nForge missions:")
    for index, mission in enumerate(MISSIONS, start=1):
        print(f"  {index}. {mission.title}")
    while True:
        choice = input("Choose a mission number, or q to quit: ").strip().lower()
        if choice == "q":
            return None
        if choice.isdigit() and 1 <= int(choice) <= len(MISSIONS):
            return MISSIONS[int(choice) - 1]
        print("Choose one of the mission numbers shown above.")


def main():
    print("Forge: learn Python by completing small missions.")
    print(f"Completed missions: {len(load_progress()['completed_missions'])}/{len(MISSIONS)}")
    sad = SadCoachClient()
    coach = ForgeCoach(sad_coach=sad, failure_reporter=SadFailureReporter(), learning_reporter=SadLearningReporter())
    try:
        print("SAD coaching: connected locally" if sad.health() else "SAD coaching: safe local fallback")
    except OSError:
        print("SAD coaching: safe local fallback")
    while True:
        mission = choose_mission()
        if mission is None:
            print("Keep forging. Small steps build real skills.")
            return
        print(f"\n{mission.title}\n{mission.lesson}\nMission: {mission.prompt}")
        for attempt in range(1, 4):
            result = coach.evaluate(mission.mission_id, input("Your Python: "), attempt)
            print(result["feedback"])
            if result["correct"]:
                break
        else:
            print(f"Example answer: {mission.accepted_answers[0]}")


if __name__ == "__main__":
    main()
