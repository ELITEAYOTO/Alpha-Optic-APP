# Handoff — modular foundation

Date: 2026-10-24
Scope: `Alpha-Optic-APP` initial documentation and static architectural gate only.

- Repo is separate from `ELITEAYOTO/Optic-AI-Bridge-`; this phase does not modify Bridge.
- UI D chosen in Figma; desktop stack planned Tauri 2, Rust, React, TypeScript.
- Approved boundaries: React views -> feature adapters -> versioned contracts -> Tauri host -> authenticated Bridge control contract (to be designed). Bridge holds sole security authority.
- Future features: supervision journal, separate interactive terminal (ConPTY design candidate, NOT authorized shell), file diffs, sessions, permissions, project registry, themes, MCP federation.
- Production Windows Bridge still not declared ready. Verify current blockers directly from its canonical status before each integration.
- No source from the standalone React V1.6.2 ZIP is present in this repo. Obtain exact archive before migration. No compiled app, runtime, terminal or live MCP connector is implied.
- Next: review the foundation PR, decide frontend project scaffolding versions in a separate PR, add tests and CI, then stage original React migration.
- Update this file with actual merged SHAs and verified workflows; do not invent evidence.
