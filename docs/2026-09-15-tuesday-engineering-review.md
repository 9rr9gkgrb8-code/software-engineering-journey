# Tuesday Engineering Review — September 15, 2026

## What changed since the last review

### SAD governance moved forward

Two consequential-action slices merged on September 14:

- PR #22 added the governed sleep manager and a unified action gateway with fail-closed risk policy, append-only receipts, approval requirements, request/result hashing, and idempotency protection.
- PR #23 moved MCP mutations and external connector writes behind that action gateway while preserving their existing subsystem-specific approvals.

The important lesson is architectural: approval should not be scattered across every subsystem. A common policy/receipt layer can reduce duplicated risk handling while each subsystem still keeps its stricter local gate.

### Context-routing work is now a tested prototype

SAD PR #24 is a draft prototype for deciding before tool execution whether output should remain direct, be captured in a bounded form, or be externalized as an artifact. Its focused tests and repository benchmark show large model-visible reductions while preserving exact artifact recovery. GitHub Actions is green for the current head.

This should remain a draft until runtime integration is explicitly approved. Prototype evidence is not the same thing as a production integration decision.

### SAD-Core has an integration-debt problem

SAD-Core still has four older open, CI-green PRs that touch related readiness concerns:

- #32 — cloud/mobile private-alpha and signup scaffolding
- #35 — production-readiness probe
- #39 — runtime readiness and beta UX
- #40 — governed end-to-end journey observability

All four currently have successful CI on their recorded heads, but they are long-lived branches based on earlier mainline states. Green CI on separate branches does not prove that the combined system is green. The next move should be reconciliation, not another overlapping readiness branch.

## What I learned

1. **A shared action boundary is more valuable than duplicated approval logic.** The Action Gateway work creates one place to reason about consequential effects, idempotency, receipt state, and ambiguous failures.
2. **Context efficiency should be designed before execution, not cleaned up afterward.** PR #24 moves the decision point earlier, which is the right direction for large tool outputs.
3. **Passing branch CI is necessary but insufficient.** Several individually green feature branches can still create integration risk when they remain open for days and overlap in scope.
4. **Prototype, integration, and release are three different states.** Calling them by the same name encourages accidental promotion of unfinished work.

## Reading: Continuous Integration

Today’s reading was Martin Fowler’s *Continuous Integration*.

The central idea is that integration risk falls when changes are integrated into mainline frequently and verified in a reference environment. Long-lived feature branches defer the hardest question: whether everyone’s changes actually work together. Small, frequent integration makes failures easier to locate and reduces the amount of hidden merge work accumulating off-mainline.

Applied to SAD and Forge, the lesson is straightforward: do not treat four individually green readiness branches as four nearly finished features. Reconcile them against current mainline, split or close superseded work, and keep the integrated branch green.

## Applied decision

For the next engineering slice:

1. Keep SAD PR #24 draft until there is an explicit decision to wire pre-tool routing into runtime paths.
2. Reconcile SAD-Core PRs #32, #35, #39, and #40 before adding another cloud/mobile/readiness branch.
3. Prefer small integration slices that can merge independently.
4. Preserve the current milestone: one real learner completing the remote phone journey end to end with persisted progress and student-only authority.

## Next engineering milestone

**Produce one integrated, current-mainline candidate that supports a remote learner journey and can be tested on a real phone.**

Acceptance evidence should cover:

- invite/signup or account entry
- HTTPS remote access through the approved boundary
- learner lesson/quest path
- hint and mastery/boss gate
- saved progress after reconnect
- student inability to access Owner/developer surfaces
- observable failure evidence without exposing sensitive payloads

No new broad feature should outrank that evidence.