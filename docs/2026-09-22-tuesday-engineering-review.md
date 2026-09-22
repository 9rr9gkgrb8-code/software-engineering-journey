# Tuesday Engineering Review — September 22, 2026

## Hard truth

The project is still generating strong architecture experiments faster than it is closing the release-critical integration path. That is useful research, but it becomes a liability if new prototypes continue to outrun one integrated SAD-Core candidate and real-device evidence.

The right move is not to stop learning. It is to keep research branches narrow, review them rigorously, and prevent them from stealing the execution lane from the remote learner milestone.

## Verified progress since the September 18 review

### SAD: new credentialless-worker/retrieval experiment

SAD PR #32 is a new draft experiment created September 21. It adds three isolated concepts:

- a credentialless fixed-task worker path using the existing Egress Broker and Action Gateway;
- a headless Forge task/evaluator contract with host-side result verification;
- a read-only structured-fact retrieval verification gate.

The PR remains explicitly **draft / tested prototype / not runtime-integrated**, which is the correct status.

Its reported evidence includes:

- full Python 3.12.14 suite: 261 discovered, 258 passed, 3 skipped;
- Ruff: PASS;
- compileall: PASS;
- local focused/adversarial suite: 55 passed;
- physical Linux namespace proof for the fixed AST-inventory worker on a supported local host;
- actual broker and physical sandbox evidence separately, but not yet one zero-skip combined broker -> physical sandbox -> host evaluator journey.

The branch also states that real provider transport, real authenticated human sessions, Windows, the private PC, durable grant recovery and runtime promotion remain unproven.

### SAD: prototype stack is now three lanes deep

The other experimental branches remain open:

- PR #24 — pre-tool context routing, draft;
- PR #31 — governed refinements/evidence lifecycle/review coverage, draft;
- PR #32 — credentialless workers/task evaluation/retrieval verification, draft.

PR #31 is especially useful because it measures rather than hides memory-governance gaps: 6 of 12 expectations currently pass and 6 remain unmet. That is better engineering evidence than a green unit-test count presented as proof of a complete memory model.

### SAD-Core: the release path has not materially moved

The four open release/readiness PRs remain:

- #32 — cloud/mobile private alpha and signup path;
- #35 — production-readiness probe;
- #39 — runtime readiness and beta UX;
- #40 — governed journey observability.

They are individually mergeable, but the integration problem identified last week still exists. The next release evidence still needs to come from one current-mainline candidate, not four separately green branches.

## Code-review exercise applied today

I reviewed SAD PR #32 using the system-level review lens from Google Engineering Practices rather than treating passing tests as sufficient.

Two concrete review findings were recorded on the PR:

1. **Executor identity continuity needs stronger binding.** `CredentiallessHost.execute()` captures an initial executor but later rechecks only that *some* valid executor is present. A mid-flight revocation of the original executor combined with principal substitution could allow execution to continue while the final event is still attributed to the original executor. The execution should be bound to the exact original principal/session or a derived execution token and revalidated at each boundary.
2. **Retrieval temporal semantics are underspecified.** Two admitted values with different `event_at` timestamps currently become an unconditional conflict. If `fact_key` values can legitimately change over time, the gate needs explicit as-of semantics such as latest-valid-event selection. If fact keys are intended to be immutable, that rule needs to be stated and tested.

These are not arguments to abandon the experiment. They are examples of why architecture review must ask whether the design behaves correctly in the larger system, not merely whether the happy-path tests pass.

## What I learned today

1. **Passing tests are evidence, not a verdict.** A review still has to challenge identity continuity, temporal semantics, lifecycle behavior, integration boundaries and user-visible consequences.
2. **Audit attribution must bind to the same identity that performed the work.** Rechecking only a role is weaker than rechecking the exact authenticated principal/session that started the operation.
3. **Time-aware retrieval requires an explicit model of change.** "Conflict" and "newer fact" are not the same thing. The data contract must decide which one a pair of records represents.
4. **Good prototypes state their non-claims.** PR #32 is stronger because it says what has *not* been proven: real credentials, real auth, Windows, restart recovery and the combined physical journey.
5. **Research velocity can hide delivery stagnation.** The project added another sophisticated draft while the learner-facing release candidate remains unintegrated. That is now the execution risk to manage.

## Reading: Google Engineering Practices — What to look for in a code review

Source: https://google.github.io/eng-practices/review/reviewer/looking-for.html

The article's most useful review order for this project is:

- design first;
- functionality from the user's and future developer's perspective;
- unnecessary complexity and over-engineering;
- tests that actually fail when behavior breaks;
- documentation updated with behavior changes;
- every changed line reviewed in the context of the whole system.

The point that matters most for SAD is that code health is cumulative. A small change can still make the whole system harder to reason about, so the reviewer has to look beyond the diff and ask whether the change improves or degrades the architecture around it.

## Applied decision

Use two lanes and do not let them blur together:

### Release lane

1. Recreate/rebase SAD-Core #35 on current main because it is the least-coupled release slice.
2. Reconcile SAD-Core #39 + #32 deliberately on one integration branch.
3. Add #40 after the API/runtime shape is stable.
4. Run all gates against the exact integrated SHA.
5. Deploy through HTTPS while keeping SAD Core loopback-only.
6. Prove one complete remote-phone learner journey and persistence/privilege boundaries.

### Research lane

1. Keep SAD #24, #31 and #32 draft.
2. Fix only evidence-backed review findings.
3. Do not add another parallel prototype until the current drafts are either promoted, deferred or closed.
4. Require one clean combined broker -> physical sandbox -> host evaluator proof before treating PR #32 as a runtime candidate.

## Portfolio decision

The portfolio does not need another README rewrite today. The stronger artifact is this dated engineering review plus the actual review comment on SAD PR #32, because it demonstrates code-review judgment rather than feature-count storytelling.

## Next engineering milestone

**One exact SAD-Core candidate SHA with green integrated gates and one successful real-phone learner journey.**

The acceptance path remains:

invite/signup -> learner login -> starter lesson/real homework quest -> hint if needed -> mastery/boss gate -> close/reconnect -> progress persists -> student cannot reach Owner/developer surfaces -> metadata-only observability confirms the journey.

## Direct execution rule

Until that milestone exists, any proposed new architecture experiment must answer one question first: **does this directly unblock the release candidate, or is it stealing time from it?** If the answer is the latter, defer it.