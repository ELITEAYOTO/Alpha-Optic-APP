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
