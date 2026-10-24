# Handoff — desktop scaffold

Date: 2026-10-24

## Foundation
PR #1 was squash-merged into main at 9a4e78e0f1f0d0c4e610907734e411794921a35d after green exact-head CI.

## In-flight bootstrap
Branch `feat/desktop-bootstrap` introduces initial React + TypeScript modular UI and minimum Tauri 2 Rust host. New UI is demonstration only and must not be described as connected to Optic AI Bridge. Supervision and terminal surfaces are distinct and disabled pending contracts and native safety work.

UI D Figma remains source of design intent, but original React V1.6.2 source has **not** been audited/migrated. Temporary icon is not the official asset. Native titlebar remains decorated until a separate UX/security step.

## Release gates
- Desktop: frontend builds and hosted Windows Rust check must be proven on exact code SHA; pin transitive dependencies in both lockfiles.
- Bridge: independently remains Windows V1 NO-GO at last review; current state must be re-read.
- No release or Windows physical test claims until actual evidence.

## Next
Complete scoped PR, verify exact-head CI, generate verified lockfiles, tighten CI for reproducible builds, then make UI/IPC changes as separate PRs.
