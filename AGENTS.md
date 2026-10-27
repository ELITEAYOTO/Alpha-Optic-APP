# Optic — agent rules

Before implementation read README.md, docs/architecture/OVERVIEW.md, docs/architecture/MODULE_BOUNDARIES.md, docs/security/SECURITY_MODEL.md, docs/engineering/WORKFLOW.md and docs/engineering/HANDOFF.md.

## Non-negotiable
- Product names: **Optic** (desktop), **Optic AI Bridge** (engine). No product name "Lab".
- Separate repositories. Do not modify or vendor the Bridge from this repository.
- Never claim simulation is a running Bridge. No real connection until exact contracts and evidence exist.
- Desktop code cannot issue, widen, persist or infer effective grants; the Bridge Rust remains authority. A permission request is never an effective grant.
- Stopping a session, revoking a right and proving native process termination are separate events.
- Production Windows Bridge V1 remains NO-GO until its independently reviewed release gates pass.
- UI D Figma is approved direction; preserve separate React V1.6.2 until its actual archive/source is inspected. Do not rebuild it from memory.
- Do not run binaries/installers on the user's machine without fresh authorization. Never place credentials in fixtures, logs, screenshots or issues.

## Code organization
- One owner feature per capability. No feature importing another feature's private files; communicate through explicit public APIs and typed application composition.
- No god files, feature-wide catch-all services, circular imports, mega contexts or barrel exports of internal implementation.
- React views render and dispatch user intent; Rust adapters coordinate OS calls; Bridge authorizes security-sensitive effects.
- All IPC commands carry a versioned request/response; validate input, scope, identity and error paths. Unknown versions fail closed.
- OS paths, credentials, OAuth, subprocess handles and IPC identities never become ordinary UI theme/config state.
- A third-party theme contains validated tokens and assets only, never JS, executable code, unrestricted CSS or native commands.
- Terminal supervision log is read-only; developer terminal remains a separate surface and cannot bypass the Bridge or expose unrestricted shell by default.

## Work discipline
- Small scoped changes and PRs. Review main state and exact CI before claiming merged or ready.
- Prefer a seam/interface and contract test to a premature general-purpose abstraction.
- Add tests for each new public boundary, malformed input, offline state, cancellation, replay and cleanup.
- Use `docs/decisions/ADR-*.md` for lasting architectural decisions; update handoff only with verified results.
- Do not add dependencies by default; document size, license, platform and security rationale first.

## Strict repository ownership
- **Only write to** `ELITEAYOTO/Alpha-Optic-APP` during Desktop tasks. Resolve and confirm `repository_full_name` before every GitHub write.
- `ELITEAYOTO/Optic-AI-Bridge-` is being developed concurrently by another AI; treat it as a read-only external dependency unless the operator explicitly authorizes a separate Bridge task.
- Never create a PR, issue, branch, commit, or update an existing file in the Bridge repo as part of Desktop development.
- Resolve cross-repository compatibility by local Desktop contracts and a future proposal, not unreviewed edits to Bridge code.

## Canonical continuation (27 October 2026)
- Before starting new development in another chat, read `docs/engineering/HANDOFF.md` and `docs/engineering/NEXT_CHAT_PROMPT_OPTIC_DESKTOP_2026-10-27.md`; both must be checked against **live GitHub** and real code, not considered timeless facts.
- User tested Tauri on Windows: dark native titlebar, official Optic taskbar logo, collapsible explorer confirmed in screenshots. PR #25 makes supervision offline honest; user has not yet shown post-#25 screenshots.
- `windows-nsis-smoke.yml` now **does install, launch WebView2 and uninstall** an unsigned test-only package on a hosted Windows runner. Do not mistake it for a signed installable production release or repeat older docs saying no installation test exists.
- Never infer the user's local Git status; local `Cargo.toml`, `src-tauri/gen/` and stash history require a fresh `git status` before advising mutating commands.
- The approved 512px source is **not checked into this repo**; the current native 48px logo is a real improvement, but multi-resolution release icon remains TODO.
