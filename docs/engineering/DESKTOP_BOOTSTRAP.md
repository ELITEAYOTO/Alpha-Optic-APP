# Desktop bootstrap — 24 October 2026

The first source iteration provides a **React/TypeScript UI D inspired shell** and a minimal **Tauri 2 Rust host**. This is not a migration of the historical V1.6.2 archive; it is a separately testable scaffold.

## Current scope
- Navigation: Bureau, Projets, Sessions, Autorisations, Supervision, Terminal, Connexions, Paramètres.
- Demo-only welcome screen, with true unknown/unavailable statuses, and two distinct non-interactive console surfaces.
- No Bridge connection, native commands, terminal spawn, ConPTY, MCP federation or filesystem access.
- Native Tauri decorations retained intentionally at this stage; custom titlebar/windows chrome must be reviewed separately. Current icon is explicitly a **temporary build-only placeholder**, not the official Optic logo.
- Package versions are direct-dependency pinned. A verified npm/Cargo lockfile is required before release; bootstrap CI currently resolves dependencies and is **not a reproducible release build**.
- Bundle generation is intentionally disabled.
- Cross-feature imports are forbidden: the shell is in `src/app/layout` because it knows app navigation. Feature pages only receive callbacks from composition.

## Development
- Node >=22.12, npm, Rust stable and Windows Tauri build prerequisites.
- `npm install` ; `npm run check` ; `npm run tauri dev`.
- This file documents expected commands, not proof that a build ran on the owner's PC.
- GitHub Actions runs Node checks on Windows/Linux plus cargo check on hosted Windows.

## Next safeguards
1. Produce, commit and freeze both `package-lock.json` and `src-tauri/Cargo.lock`, then switch CI to `npm ci` and Cargo `--locked`.
2. Use real official logo assets after source provenance is verified.
3. Add screenshots/visual acceptance for 1280×800 and 1440×900.
4. Evaluate V1.6.2 original source and migrate UI D component by component without overwriting it.
5. Version an authenticated local Bridge contract in a subsequent PR; keep non-connected states truthful.
