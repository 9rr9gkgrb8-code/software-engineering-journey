# Forge

Forge is a beginner-friendly coding coach for middle-school learners. It turns short Python lessons into missions, checks answers without executing student code, gives hints, and stores progress locally.

## V1 learning loop

1. Choose a mission.
2. Read one short lesson and example.
3. Enter an answer.
4. Receive deterministic, encouraging feedback.
5. Ask for a hint or try again.
6. Save completion locally.

Forge exposes a narrow JSON coaching contract for future SAD integration. SAD may provide feedback text, but Forge remains responsible for validation, progress, and student-facing safety boundaries.

## Implemented and intentionally limited

Implemented: deterministic answer checks without executing student code, local progress, bounded SAD coaching requests, validated coaching responses, six lessons, homework planning, creative prompts, and repeat-reward protection.

Still limited: there are no accounts, cloud sync, teacher dashboard, free-form code execution, production SAD service connection, or purchases. The SAD interface remains optional and falls back to local hints whenever a response is absent or invalid.

## Local SAD failure reporting

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
