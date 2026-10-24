# Engineering workflow

1. Read AGENTS.md and current design/security docs. Check GitHub main SHA and open PRs before edits.
2. One concern per small branch and PR. Do not bundle platform packaging, native privilege and theme code in one PR.
3. Require docs for new contracts and an ADR for lasting architecture choices.
4. Tests / checkers must pass on the exact PR head; re-verify CI after merge before release claims.
5. Never add a dependency for convenience without assessing license, maintenance, bundle/attack surface and alternative.
6. Choose feature module boundaries before implementation; `app` is composition only. Cross-feature changes get an explicit integration point.
7. Tests should have a reproducible failure case, no network secrets or production user projects. Don't weaken checks to make CI green.
8. Keep prototype/mock and live Bridge adapters separate. Simulated data must remain labeled at runtime.
9. When changing UI contract or styles, update docs/design/UI_D.md. For host-to-Bridge protocol change, open a corresponding Bridge design review; do not silently change both sides.
10. Before feature completion: verify narrow imports, failure states, teardown, accessibility, keyboard, 1280×800 and 1440×900, and bounded event buffering.
11. Development on owner's Windows PC needs fresh explicit permission; hosted CI does not prove physical Windows acceptance.
12. Prefer squash-merging reviewed PRs and write an exact commit/CI-based handoff. No automatic release.
