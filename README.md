# Software Engineering Journey

A public portfolio built around shipping small, testable software and documenting the boundaries honestly.

The repository currently centers on **Forge**, a beginner-friendly learning platform for ages 11–14. A separate **Atlas Maintenance Log** project is being developed locally as a Python fundamentals project before its first public checkpoint.

## What this repository demonstrates

- Python fundamentals and application structure
- automated Python and web tests in GitHub Actions
- local persistence and bounded data handling
- HTTP/JSON integration boundaries
- fail-closed validation for learner-facing software
- responsive web UI and Windows-oriented beta tooling
- iterative delivery through branches, commits and pull requests

## Current project: Forge

Forge turns short Python and responsible-AI lessons into guided missions. The current learning loop is:

1. Read a short concept, example and practice steps.
2. Enter a Python answer and run the mission.
3. Receive deterministic feedback and validated visual world changes.
4. Use a hint, retry or move to the next lesson.
5. Save progress and XP in the browser.
6. Export or reset the learner's local progress record.

Forge also includes interactive AI-judgment lessons and a local assistant-blueprint builder. No account or public chat is required.

### Implementation status

| Capability | Current status |
| --- | --- |
| Guided learning content | Six Python foundation quests and four responsible-AI checks are implemented. |
| Visual code world | Implemented. Deterministic mission results become a small allowlisted set of visual commands. Invalid command data resets the scene instead of being rendered. |
| Python-subset runtime | Implemented for the **Variables** mission only. It interprets a bounded AST without `exec` or `eval`; imports, calls, loops, file access and unsupported missions are rejected. |
| Progress | Implemented in browser-local storage with JSON export and explicit reset. There are no learner accounts or cloud sync. |
| SAD integration | Optional loopback integration is implemented for bounded coaching, result metadata and failure reporting. Forge falls back to local feedback when SAD is unavailable. |
| Family beta path | Implemented for 5–10 invited testers on a private network, with separate family/runtime secrets and a responsive phone, tablet and desktop layout. |
| Windows launcher | Implemented. The PowerShell launcher generates secrets, runs test gates, starts the web and runtime services and records only those processes for shutdown. |

### Readiness boundary

Forge is an **early family beta**, not a production release. The repository does not claim public-hosting readiness, multi-user isolation, individual accounts, cloud sync, a teacher dashboard, unrestricted Python execution, purchases, messaging or leaderboards.

The beta must remain on a trusted private network. Real-device and remote-deployment acceptance are still required, and testing must stop for unauthorized access, cross-user progress leakage, runtime crashes, unbounded resource use, unsafe coaching output or lost progress. See [BETA.md](BETA.md) for the operating gate.

### Safety and integration boundaries

The runtime listens only on `127.0.0.1`, accepts requests up to 4 KiB and returns versioned evidence plus allowlisted world commands. Source size, AST size, statement count, identifiers, text and numeric values are bounded.

`SadCoachClient` sends bounded quest context and the current answer transiently to local SAD. `SadLearningReporter` stores only mission ID, correctness and attempt number. `SadFailureReporter` submits bounded, versioned evidence as `pending_human_approval`; Forge has no API for approving, applying, merging or deploying changes.

Family access uses `FORGE_FAMILY_KEY`. The browser stores the key only in session storage. Server routes enforce same-origin requests, request-size ceilings and family-wide rate limiting. The runtime uses a separate `FORGE_RUNTIME_KEY`.

The child-safety design was independently implemented after reviewing the fail-closed input/output pipeline used by `snflwr-ai/snflwr.ai`, the mastery approach in `skillcoco/skillcoco` and OWASP prompt-injection guidance. No third-party source code or branding was copied.

## Run Forge

Run the original local Python app:

```powershell
python forge_app.py
```

Run the optional loopback-only Variables mission runtime:

```powershell
$env:FORGE_RUNTIME_KEY = "use-a-long-random-local-key"
python forge_runtime_http.py
```

For the invited Windows family beta, follow [BETA.md](BETA.md). The launcher runs the test gates before starting either service:

```powershell
.\start_forge_beta.ps1
```

Stop only the beta processes recorded by the launcher:

```powershell
.\stop_forge_beta.ps1
```

## Test

```powershell
python -m unittest -v
cd web
npm ci
npm test
```

GitHub Actions runs the Python suite, Python compilation, web suite and PowerShell syntax checks. Passing automated checks supports the documented beta scope; it is not proof of production readiness.

## Next public milestone: Atlas Maintenance Log

Atlas is the learning-through-building track. The current local project is a maintenance issue logger designed to turn industrial workflow knowledge into software-engineering practice.

Its first public checkpoint is planned to include multiple issues per run, functions, a menu loop, JSON persistence, missing-file handling, issue status, tests and documented design decisions. Atlas will be added only after the local version is understood, tested and ready for a clean Git checkpoint.

## Engineering principle

The goal is not repository volume. The goal is visible progression: understand the code, test the behavior, document the tradeoffs, then commit a clean checkpoint.
