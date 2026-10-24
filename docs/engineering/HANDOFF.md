# Handoff — desktop scaffold

Date: 2026-10-24

## Foundation
PR #1 was squash-merged into main at 9a4e78e0f1f0d0c4e610907734e411794921a35d after green exact-head CI.

## Merged bootstrap
PR #2 was squash-merged as `479b545d6b0ab5c3984e68f8a30ab2c1ec57067c` after exact-head push CI at `097c82563f1ff0559f459200f708db1bb3edb12e` passed frontend Windows/Linux and Windows Rust `cargo check --locked`. The merge commit requires its own independent post-merge validation.

This source introduces initial React + TypeScript modular UI and minimum Tauri 2 Rust host. New UI is demonstration only and must not be described as connected to Optic AI Bridge. Supervision and terminal surfaces are distinct and disabled pending contracts and native safety work.

UI D Figma remains source of design intent, but original React V1.6.2 source has **not** been audited/migrated. Temporary icon is not the official asset. Native titlebar remains decorated until a separate UX/security step.

## Release gates
- Desktop: `package-lock.json` and `src-tauri/Cargo.lock` are committed; frontend and hosted Windows Rust checks use locked dependencies. Keep verifying exact commit CI.
- Bridge: independently remains Windows V1 NO-GO at last review; current state must be re-read.
- No release or Windows physical test claims until actual evidence.

## Next
Complete scoped PR, verify exact-head CI, generate verified lockfiles, tighten CI for reproducible builds, then make UI/IPC changes as separate PRs.

## Dependency reproducibility
Both \`package-lock.json\` and \`src-tauri/Cargo.lock\` were resolved in a temporary isolated hosted workflow and committed to the feature branch. The temporary contents-write workflow must be deleted before merging; subsequent CI uses read-only permissions, \`npm ci\` and \`cargo check --locked\`. Exact-head checks after this change are required.

## Current follow-up
A scoped `refactor/feature-owned-styles` branch isolates layout, feature and shared CSS from the initial `base.css`. No runtime/security change or logo migration is intended.
