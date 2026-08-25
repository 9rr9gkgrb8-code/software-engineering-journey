# Forge

Forge is a beginner-friendly coding coach for middle-school learners. It turns short Python lessons into missions, checks answers without executing student code, gives hints, and stores progress locally.

## V2 learning platform

1. Choose a mission.
2. Read one short lesson and example.
3. Enter an answer.
4. Receive deterministic, encouraging feedback.
5. Ask for a hint or try again.
6. Save completion locally.

The matching web lab adds responsible-AI lessons, a guided assistant blueprint,
and a device-local learner portfolio that can be exported for a parent or
teacher. No account or public chat is required.

Forge exposes narrow JSON contracts for optional local SAD integration. SAD may
provide validated feedback and receive mission/result metadata, but student
answers are excluded from result reports. Forge remains responsible for
progress and student-facing safety boundaries.

## Implemented and intentionally limited

Implemented: six matching Python quests, deterministic answer checks without
executing student code, local progress, portfolio export/reset, responsible-AI
instruction, assistant blueprinting, bounded SAD coaching and failure requests,
and privacy-preserving learning-result reports.

Still limited: there are no accounts, cloud sync, teacher dashboard, free-form code execution, production SAD service connection, or purchases. The SAD interface remains optional and falls back to local hints whenever a response is absent or invalid.

## Local SAD failure reporting

`SadLearningReporter` sends only mission id, correctness, and attempt number to
the loopback SAD result endpoint. It never sends the student's answer, name, or
profile, and an outage never interrupts learning.

`SadFailureReporter` sends bounded, versioned failure evidence to SAD over
loopback HTTP. Forge continues locally if SAD is offline or rejects a request.
SAD acknowledges every accepted report as `pending_human_approval`; Forge has
no API for approval, patching, export, merge, or deployment.

## Run

```powershell
python forge_app.py
```

## Test

```powershell
python -m unittest -v
```
