# Engineering Review — September 29, 2026

Fresh SAD-Core comparison shows #32 at 11 ahead / 1 behind, #35 at 1 ahead / 1 behind, #39 at 10 ahead / 0 behind, and #40 at 5 ahead / 0 behind current main. The next release move is to reduce branch count before adding features: replay #35 on current main, reconcile #39 with #32 around the learner web shell, then apply #40 after the API shape is stable. All four current PR heads have successful SAD Core CI runs.

Today’s engineering lesson: independently green branches are not a release. Integration proof must exist on one exact candidate SHA.

Reading: Martin Fowler, Branch By Abstraction. The useful principle is to make large changes incrementally while keeping the system buildable and releasable.
