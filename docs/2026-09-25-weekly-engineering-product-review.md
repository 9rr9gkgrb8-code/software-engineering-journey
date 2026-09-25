# Weekly Engineering & Product Review — September 25, 2026

## Hard truth

This week produced useful research and stronger product positioning, but the release lane did not materially advance. SAD-Core main is still on the September 7 starter-lessons commit while four release-readiness pull requests remain open. The next win is not another feature. It is one integrated release candidate and one real-phone learner journey.

## Verified engineering state

SAD master remains at commit f27067b21c897b05dac765b4fd839f16e030e1bf from September 18. Draft research PRs #24, #31 and #32 remain intentionally unpromoted.

A September 24 MCP Skills compatibility package improved its offline test evidence from 69/69 to 104/104 with zero failures, errors or skips. The decision remains HOLD because the package is still isolated test evidence rather than live SAD runtime evidence.

SAD-Core main remains at commit c7af3df7af112d8cf79ed13501c36196acd97a41 from September 7. The open release/readiness work is still:

- PR #32 — cloud/mobile private alpha and signup path
- PR #35 — production-readiness probe
- PR #39 — runtime readiness and beta UX
- PR #40 — governed journey observability

The missing artifact is one current-mainline integration candidate that combines the intended slices and passes the complete release gate set at one exact SHA.

## Product learning

Thursday's product work sharpened the Sailiga Learn wedge. It should not compete as another generic AI tutor. The stronger category is guided homework mastery:

real homework -> progressive help -> independent mastery check -> parent-visible proof.

The parent-facing promise remains: **Homework help that proves they learned it.**

That product decision should now shape the engineering acceptance test. The first remote learner milestone should prove not only that the software runs, but that the learner can receive help, complete a mastery check, return later with progress intact and generate useful parent-visible evidence.

## What I learned this week

1. Research evidence and release evidence are different currencies. A fully passing offline package can still remain on HOLD when real integration evidence is missing.
2. A release candidate should be identifiable by one exact SHA. Four separately healthy branches are weaker evidence than one integrated candidate with a repeatable test and deployment path.
3. Product strategy should change acceptance criteria. If Sailiga's value proposition is verified learning, engineering must prove mastery and useful parent feedback, not merely successful requests.
4. A private alpha should be treated as a bounded rollout. Start with one learner, evaluate the signals and expand only after the evidence supports it.
5. The strongest portfolio signal now is judgment under constraints. Showing what was deliberately held back and what evidence would change the decision is stronger than another feature-count update.

## Friday reading — Google SRE: Canarying Releases

Source: https://sre.google/workbook/canarying-releases/

The key lesson is that automated tests are necessary but cannot reproduce every real-world condition. A canary release limits risk by exposing a candidate to a small population first, evaluating defined signals and expanding only when the evidence is good.

Applied to Sailiga and SAD-Core, the private alpha should behave like a canary:

- one exact candidate build
- one small learner cohort
- explicit success and failure signals
- easy rollback
- one release train at a time
- expansion only after observed behavior supports it

For the first learner, useful signals include signup success, lesson or quest completion, mastery completion, reconnect persistence, latency, errors and correct parent-facing proof.

## Portfolio decision

This weekly review belongs in the portfolio because it demonstrates release judgment, explicit non-claims, integration-risk recognition, product-to-engineering traceability and bounded-rollout thinking.

The README does not need another rewrite this week. The next README-level update should follow actual remote-user evidence.

## Next engineering milestone

**One exact SAD-Core candidate SHA with green integrated gates and one successful canary learner journey on a real phone.**

Required acceptance path:

invite/signup -> learner login -> real lesson or homework quest -> controlled hint if needed -> independent mastery check -> parent proof generated -> close and reconnect -> progress persists -> role boundaries remain intact -> journey observability confirms the session without collecting unnecessary learner content.

## Next-week execution plan

1. Recreate or rebase PR #35 on current main and verify the readiness probe against the current codebase.
2. Build one integration branch from current main that deliberately reconciles PR #32 and PR #39.
3. Add PR #40 only after the API and runtime shape is stable.
4. Run all required gates against the exact integrated SHA.
5. Deploy the candidate through the approved remote path while preserving the local core boundary.
6. Run one learner as the canary population and capture the full acceptance evidence.
7. Expand the cohort only after that result is clean.

## Direct execution rule

Until the first remote canary learner completes the full journey, new research is allowed only when it directly removes a release blocker. Everything else waits.
