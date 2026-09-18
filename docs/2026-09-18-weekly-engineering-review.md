# Weekly Engineering Review — September 18, 2026

## Weekly outcome

This week moved SAD forward in governance depth while exposing a different bottleneck in Forge: integration and deployment evidence now matter more than adding another capability.

### SAD: authority controls became more concrete

Two substantial hardening PRs merged on September 18:

- PR #25 added evidence-derived repair status, exact hash-bound Owner approval envelopes, idempotency, and a trusted `create_worktree` execution path that revalidates approval immediately before the side effect.
- PR #26 added adversarial repair verification, coverage-ledger requirements, deterministic governance rechecks, and a memory review/aging lifecycle.

The architectural lesson is that approval quality depends on binding the human decision to the exact action, parameters, execution environment, and later evidence. A generic "approved" flag is too weak for consequential operations.

Two experimental lanes remain intentionally unpromoted:

- PR #24: pre-tool context-routing prototype, CI green, still draft.
- PR #31: governed refinement-ledger prototype, CI green, still draft.

Both should stay outside runtime behavior until their promotion gates are explicitly satisfied.

### SAD-Core: integration is the current constraint

Main is still at the September 7 lesson commit (`c7af3df`). Four readiness PRs remain open and CI-green:

- #32 — cloud/mobile private alpha, signup service, invite flow, responsive mobile shell
- #35 — production-readiness probe
- #39 — runtime readiness and beta UX
- #40 — governed end-to-end journey observability

Their structure matters:

- #32 and #35 were cut from the older pre-lesson mainline (`d9c527e`).
- #39 and #40 were cut from current main (`c7af3df`).
- #32 and #39 both modify `web/index.html`.
- #39 and #40 both modify `api.py`.
- #35 changes only `tools/forge_readiness_probe.py` and is the least coupled slice.

That means the right next move is not to merge all four blindly. It is to integrate in dependency order and rerun the gates on the combined result.

## What I learned this week

1. **Approval must bind to executable reality.** The useful unit is not "human said yes"; it is "human approved this exact action under this exact envelope and the executor revalidated it before the effect."
2. **Adversarial verification is stronger than confirmation-only testing.** A verifier should try to falsify the claim, not merely look for evidence that supports it.
3. **Green branch CI is local evidence, not integrated evidence.** Four passing branches can still conflict at shared files, contracts, or runtime assumptions.
4. **Prototype discipline is becoming a strength.** Keeping PRs #24 and #31 draft avoids accidentally promoting research code into trusted runtime behavior.
5. **The product milestone is now operational, not architectural.** Forge needs a real external learner journey more than another internal subsystem.

## Reading: Google SRE — Release Engineering

Source: https://sre.google/sre-book/release-engineering/

The chapter's most relevant ideas for this project are repeatability, high release velocity through smaller changes, hermetic/reproducible builds, policy enforcement, and testing the exact revision that will actually be released.

Applied here, the critical lesson is: **test the integrated candidate, not the ingredients separately.** SAD-Core already has good branch-level gates. The missing evidence is that the actual combined release candidate passes those gates and survives real-device use.

The release process should also match risk. A private learner pilot should use staged rollout: one real device and one learner first, then a small invited cohort after the journey proves stable.

## Portfolio decision

The September 15 review PR passed Forge Checks and was merged into the public portfolio today. I also corrected one overly broad statement in that review: PRs #32/#35 are on the older base, while #39/#40 are on current main. Accuracy is more valuable than a cleaner narrative.

No README rewrite is needed this week. The next portfolio-worthy artifact should be evidence from a successful integrated remote learner journey.

## Next engineering milestone

**Build one current-mainline release candidate and prove a complete real-phone learner journey.**

Recommended integration order:

1. Rebase/recreate PR #35 on current main and merge it if the full gate remains green; it is isolated and useful for later deployment evidence.
2. Reconcile #39 and #32 on one integration branch, resolving their shared `web/index.html` changes deliberately instead of by blind merge.
3. Add #40 after the runtime/API shape is stable, resolving its `api.py` overlap with #39 once.
4. Run the full repository gate on the exact integrated candidate.
5. Deploy through the approved HTTPS boundary while keeping SAD Core loopback-only.
6. Run one real learner through invite/signup → lesson/quest → hint if needed → mastery/boss gate → close/reconnect → persisted progress.
7. Prove the learner cannot access Owner/developer surfaces and capture metadata-only observability evidence.

## Next-week execution plan

### Engineering

- Freeze broad new readiness features until the open SAD-Core work is reconciled.
- Keep SAD PRs #24 and #31 draft unless an explicit runtime-promotion decision is made.
- Produce one integrated SAD-Core candidate instead of another parallel readiness branch.
- Treat real-device UAT as a release gate, not a nice-to-have.

### Evidence

Capture only evidence that changes the release decision:

- exact candidate commit SHA
- CI/gate results on that SHA
- remote HTTPS health/readiness probe
- learner login/signup result
- quest/mastery completion
- reconnect persistence
- privilege-boundary check
- failure/latency observations without sensitive payloads

### Stop condition

If the integrated candidate fails, do not widen scope. Fix the narrowest failing layer, rerun the exact gate, and continue only when the candidate is green again.

## Direct milestone for next Friday

By the next weekly review, the strongest result would be **one exact SAD-Core candidate SHA with green integrated gates and one completed real-phone learner journey**. If that evidence does not exist, the week should be judged incomplete regardless of how many new features were added.
