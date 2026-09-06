# Forge

Forge is a beginner-friendly coding coach for middle-school learners. It turns short Python lessons into missions, checks answers without executing student code, gives hints, shows validated results in an interactive code world, and stores progress locally.

## V2 learning platform

1. Choose a mission.
2. Read one short lesson and example.
3. Enter an answer and run the mission check.
4. Watch the validated result change the mission world and receive deterministic feedback.
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
executing student code, a responsive interactive code-world feedback scene,
an allowlisted fail-closed visual command translator,
local progress, portfolio export/reset, responsible-AI
instruction, assistant blueprinting, bounded SAD coaching and failure requests,
and privacy-preserving learning-result reports.

Still limited: there are no accounts, cloud sync, teacher dashboard, free-form
code execution, or purchases. The SAD interface is optional and falls back to
verified local hints whenever SAD or its private local model is unavailable.

## Local SAD failure reporting

`SadCoachClient` sends bounded quest text and the current answer transiently to
SAD over loopback. The answer is never stored. `SadLearningReporter` stores
only mission id, correctness, and attempt number. It never stores the student's
answer, name, or profile, and an outage never interrupts learning.

`SadFailureReporter` sends bounded, versioned failure evidence to SAD over
loopback HTTP. Forge continues locally if SAD is offline or rejects a request.
SAD acknowledges every accepted report as `pending_human_approval`; Forge has
no API for approval, patching, export, merge, or deployment.

## Family network access

Set `FORGE_FAMILY_KEY` before starting the web app and enter the same private
code in Forge. The key stays in browser session storage and is cleared when the
browser session ends. The SAD bridge also enforces same-origin requests, a
4 KiB request ceiling, and a family-wide request rate limit.

The layered child-safety design was independently reimplemented after reviewing
the fail-closed input/output pipeline used by `snflwr-ai/snflwr.ai`, the mastery
approach in `skillcoco/skillcoco`, and OWASP's prompt-injection guidance. No
third-party source code or branding was copied.

## Run

```powershell
python forge_app.py
```

Run the optional loopback-only Python-subset mission runtime:

```powershell
$env:FORGE_RUNTIME_KEY = "use-a-long-random-local-key"
python forge_runtime_http.py
```

The runtime listens only on `127.0.0.1:8780`, accepts at most 4 KiB per request,
interprets an allowlisted AST without `exec` or `eval`, and returns versioned
evidence plus allowlisted world commands. The first executable policy covers
the variables mission; unsupported missions fail closed.

For the invited 5–10 learner rollout, follow [BETA.md](BETA.md). The beta is private-network only and requires separate family and runtime secrets.
On Windows, `start_forge_beta.ps1` generates the secrets, runs every beta gate and starts both services; `stop_forge_beta.ps1` stops only the recorded beta processes.

## Test

```powershell
python -m unittest -v
```
