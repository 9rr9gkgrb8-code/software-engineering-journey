# Forge Family Beta Gate

This beta is limited to 5–10 invited family testers. It is not a public launch.

## Included

- six deterministic Python foundation quests
- one executable Variables mission through the restricted local runtime
- interactive world feedback using allowlisted commands
- local progress and portfolio export
- optional loopback SAD coaching with safe local fallback
- shared family access code
- phone, tablet and desktop responsive layout

## Start

On Windows, the launcher generates and preserves two different cryptographic secrets, runs the test gates, starts both services and displays the private-network address and family access code.

```powershell
.\start_forge_beta.ps1
```

Stop both recorded processes after testing:

```powershell
.\stop_forge_beta.ps1
```

Manual startup remains available when diagnosing a launcher problem. Use two different long random values for the family key and runtime key.

```powershell
$env:FORGE_RUNTIME_KEY = "runtime-secret"
python forge_runtime_http.py

cd web
$env:FORGE_FAMILY_KEY = "family-secret"
$env:FORGE_RUNTIME_KEY = "runtime-secret"
npm run dev:network
```

Learners open the PC's private-network address and enter the family access code. Do not expose either service directly to the public internet.

## Beta acceptance check

- run `python -m unittest -v`
- run `npm test` from `web`
- confirm an incorrect family code receives HTTP 401
- confirm `robot_name = "Bolt"` unlocks the Variables mission world
- confirm imports, file access, calls, loops and oversized inputs are rejected
- test one phone and one desktop before inviting learners
- export and reset one test portfolio

## Stop conditions

Pause the beta for any unauthorized access, cross-user progress leak, runtime crash, unbounded resource use, unsafe coaching response or loss of progress.

## Explicitly deferred

- public hosting
- individual learner accounts or cloud sync
- teacher dashboard
- unrestricted Python
- purchases, public chat, messaging or leaderboards
