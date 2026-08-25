"""Small, deterministic Python curriculum for Forge V1."""

from dataclasses import dataclass


@dataclass(frozen=True)
class Mission:
    mission_id: str
    title: str
    lesson: str
    prompt: str
    accepted_answers: tuple[str, ...]
    hint: str

    def check(self, answer: str) -> bool:
        normalized = " ".join(answer.strip().lower().split())
        return normalized in self.accepted_answers


MISSIONS = (
    Mission("variables", "Name a value", "A variable gives a value a reusable name. Example: score = 10", "Create a variable named robot_name containing the text Bolt.", ('robot_name = "bolt"', "robot_name = 'bolt'"), "Text needs quotes. Start with: robot_name ="),
    Mission("conditionals", "Make a decision", "An if statement runs code only when its condition is true.", "Write a condition that checks whether score is at least 10.", ("if score >= 10:",), "Use if, the >= comparison, and finish the line with a colon."),
    Mission("loops", "Repeat an action", "A for loop repeats once for each value in a sequence.", "Start a loop that repeats 3 times using range.", ("for i in range(3):", "for _ in range(3):"), "Try: for i in range(...):"),
    Mission("functions", "Package an action", "A function gives a reusable set of steps a name.", "Define a function named say_hello with no parameters.", ("def say_hello():",), "Start with def, add empty parentheses, and finish with a colon."),
    Mission("lists", "Collect values", "A list keeps several values together in order.", "Create a list named snacks containing apple and popcorn.", ('snacks = ["apple", "popcorn"]', "snacks = ['apple', 'popcorn']"), "Use square brackets and put quotation marks around both snacks."),
    Mission("output", "Show a message", "The print function displays a message.", "Print the text Great job!", ('print("great job!")', "print('great job!')"), "Put the message in quotation marks inside print(...)."),
)


def get_mission(mission_id: str) -> Mission:
    for mission in MISSIONS:
        if mission.mission_id == mission_id:
            return mission
    raise ValueError("Unknown mission.")
