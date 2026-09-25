# Weekly Engineering & Product Review — September 25, 2026

## Hard truth

The release lane did not materially advance this week. SAD-Core main still points to the September 7 starter-lessons commit while PRs #32, #35, #39 and #40 remain open. The next win is not another feature. It is one integrated candidate and one real-phone learner journey.

## Verified progress

SAD master remains at the September 18 merge of PR #26. Draft research PRs #24, #31 and #32 remain unpromoted.

The September 24 MCP Skills compatibility package improved offline evidence from 69/69 to 104/104 passing tests. The decision remains HOLD because this is isolated compatibility evidence rather than live runtime evidence.

Thursday's Sailiga Learn work sharpened the product wedge to guided homework mastery: real homework, controlled help, independent mastery and parent-visible proof.

## What I learned

- Research evidence and release evidence are different.
- One exact integrated SHA is stronger than four separately healthy branches.
- Product strategy should change engineering acceptance criteria.
- A private alpha should behave like a canary rollout: small population, explicit signals, easy rollback and deliberate expansion.
- The strongest portfolio signal now is judgment about what not to ship.

## Friday reading

Google SRE, **Canarying Releases**  
https://sre.google/workbook/canarying-releases/

The key lesson is that tests cannot reproduce every real-world condition. A safer release exposes a candidate to a small population first, measures defined success and failure signals and expands only when the evidence is good.

Applied here, the first learner should be the canary. Measure signup success, lesson or quest completion, mastery completion, reconnect persistence, latency, errors and parent-facing proof.

## Next engineering milestone

**One exact SAD-Core candidate SHA with green integrated gates and one successful real-phone learner journey.**

Acceptance path:

invite/signup -> learner login -> real lesson or homework quest -> controlled hint if needed -> independent mastery check -> parent proof -> close and reconnect -> progress persists -> role boundaries remain intact -> journey observability confirms the session.

## Next-week plan

1. Rebase or recreate PR #35 on current main.
2. Reconcile PR #32 and PR #39 on one integration branch.
3. Add PR #40 only after the runtime shape is stable.
4. Run every release gate against the exact integrated SHA.
5. Deploy the approved candidate.
6. Use one learner as the canary.
7. Expand only after the journey succeeds.

## Portfolio decision

No README rewrite yet. The next README-level update should follow actual remote-user evidence.
