"""Fail-closed Python-subset runtime for Forge learning missions.

This module interprets a deliberately small AST. It never calls exec/eval,
imports student code, opens files, starts processes, or provides network APIs.
"""

from __future__ import annotations

import ast
import re
import time
import uuid
from dataclasses import dataclass

MAX_SOURCE_BYTES = 1_000
MAX_AST_NODES = 64
MAX_STATEMENTS = 12
MAX_TEXT_LENGTH = 80
MAX_NUMBER = 1_000_000
NAME_PATTERN = re.compile(r"^[A-Za-z_][A-Za-z0-9_]{0,31}$")

MISSION_POLICIES = {
    "variables": {"required_name": "robot_name", "expected": "Bolt"},
}


class RuntimeRejected(ValueError):
    """Student source is outside the permitted learning subset."""


@dataclass(frozen=True)
class RuntimeEvidence:
    result_id: str
    mission_id: str
    status: str
    duration_ms: int
    commands: tuple[dict, ...]
    diagnostics: tuple[dict, ...]

    def as_dict(self) -> dict:
        return {
            "protocol_version": "forge-runtime-v1",
            "result_id": self.result_id,
            "mission_id": self.mission_id,
            "status": self.status,
            "duration_ms": self.duration_ms,
            "commands": list(self.commands),
            "diagnostics": list(self.diagnostics),
        }


class SafeInterpreter:
    def __init__(self) -> None:
        self.values: dict[str, str | int | float | bool | None] = {}

    def run(self, tree: ast.Module) -> dict[str, object]:
        if len(tree.body) > MAX_STATEMENTS:
            raise RuntimeRejected("Too many statements.")
        for statement in tree.body:
            if not isinstance(statement, ast.Assign) or len(statement.targets) != 1 or not isinstance(statement.targets[0], ast.Name):
                raise RuntimeRejected("Only simple variable assignments are allowed in this mission.")
            name = statement.targets[0].id
            if not NAME_PATTERN.fullmatch(name) or name.startswith("__"):
                raise RuntimeRejected("That variable name is not allowed.")
            self.values[name] = self._expression(statement.value)
        return dict(self.values)

    def _expression(self, node: ast.expr):
        if isinstance(node, ast.Constant) and isinstance(node.value, (str, int, float, bool, type(None))):
            return self._bounded(node.value)
        if isinstance(node, ast.Name):
            if node.id not in self.values:
                raise RuntimeRejected(f"Unknown variable: {node.id}")
            return self.values[node.id]
        if isinstance(node, ast.UnaryOp) and isinstance(node.op, (ast.UAdd, ast.USub)):
            value = self._number(self._expression(node.operand))
            return self._bounded(value if isinstance(node.op, ast.UAdd) else -value)
        if isinstance(node, ast.BinOp) and isinstance(node.op, (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.FloorDiv, ast.Mod)):
            left, right = self._expression(node.left), self._expression(node.right)
            if isinstance(node.op, ast.Add) and isinstance(left, str) and isinstance(right, str):
                return self._bounded(left + right)
            left_number, right_number = self._number(left), self._number(right)
            if isinstance(node.op, ast.Add): result = left_number + right_number
            elif isinstance(node.op, ast.Sub): result = left_number - right_number
            elif isinstance(node.op, ast.Mult): result = left_number * right_number
            elif isinstance(node.op, ast.Div): result = left_number / right_number
            elif isinstance(node.op, ast.FloorDiv): result = left_number // right_number
            else: result = left_number % right_number
            return self._bounded(result)
        raise RuntimeRejected(f"Unsupported Python element: {type(node).__name__}")

    @staticmethod
    def _number(value):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise RuntimeRejected("This operation requires numbers.")
        return value

    @staticmethod
    def _bounded(value):
        if isinstance(value, str) and len(value) > MAX_TEXT_LENGTH:
            raise RuntimeRejected("Text result is too long.")
        if isinstance(value, (int, float)) and not isinstance(value, bool) and abs(value) > MAX_NUMBER:
            raise RuntimeRejected("Number result is outside the mission limit.")
        return value


def run_mission(mission_id: str, source: str) -> dict:
    started = time.monotonic()
    result_id = str(uuid.uuid4())
    policy = MISSION_POLICIES.get(mission_id)
    if policy is None:
        return _evidence(result_id, mission_id, "rejected", started, (), (diagnostic("unknown_mission", "This mission cannot run code yet."),))
    if not isinstance(source, str) or len(source.encode("utf-8")) > MAX_SOURCE_BYTES:
        return _evidence(result_id, mission_id, "rejected", started, (), (diagnostic("source_limit", "Code must be 1,000 bytes or less."),))
    try:
        tree = ast.parse(source, mode="exec")
        if sum(1 for _ in ast.walk(tree)) > MAX_AST_NODES:
            raise RuntimeRejected("Code has too many elements.")
        values = SafeInterpreter().run(tree)
        observed = values.get(policy["required_name"])
        passed = observed == policy["expected"]
        commands = (
            ({"type": "say", "actor": "companion", "value": str(observed)[:MAX_TEXT_LENGTH]},
             {"type": "unlock", "target": "gate"},
             {"type": "collect", "target": "crystal"})
            if passed else
            ({"type": "say", "actor": "companion", "value": "Check the variable name and value."},
             {"type": "shake", "target": "companion"})
        )
        return _evidence(result_id, mission_id, "passed" if passed else "failed", started, commands, ())
    except SyntaxError as error:
        return _evidence(result_id, mission_id, "failed", started, (), (diagnostic("syntax_error", error.msg, error.lineno),))
    except (RuntimeRejected, ZeroDivisionError) as error:
        return _evidence(result_id, mission_id, "rejected", started, (), (diagnostic("not_allowed", str(error)),))


def diagnostic(code: str, message: str, line: int | None = None) -> dict:
    item = {"code": code, "message": str(message)[:160]}
    if isinstance(line, int) and line > 0:
        item["line"] = line
    return item


def _evidence(result_id, mission_id, status, started, commands, diagnostics):
    return RuntimeEvidence(result_id, str(mission_id)[:64], status, max(0, round((time.monotonic() - started) * 1000)), tuple(commands), tuple(diagnostics)).as_dict()
