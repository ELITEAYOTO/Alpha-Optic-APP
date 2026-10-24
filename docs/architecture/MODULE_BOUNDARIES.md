# Module boundaries — enforceable rule set

## Frontend dependency DAG
```text
app -> features -> shared
app -> contracts
features -> contracts
features -> shared
contracts -> (no runtime app/feature/shared dependencies)
shared -> (no app/feature/contract dependencies)
```
Features may depend on another feature **only through an explicit integration in src/app**, not direct imports. An adapter specific to one feature belongs inside that feature.

Directory ownership per feature:
```text
src/features/<feature>/
  ui/            presentational components
  model/         pure state, reducers, selectors
  api/           typed adapters to app-assigned contracts
  index.ts       explicitly supported public API
```
Only add directories when used; avoid pre-populating empty trees.

Feature catalogue, names are provisional: bridge, supervision, terminal, projects, sessions, permissions, mcp-connections, changes, themes, onboarding, settings. Shared primitives: shell, design-tokens, accessibility helpers, bounded logging UI.

## Banned patterns
- `src/utils.ts`, `helpers.ts`, `services.ts` or `components.tsx` as a cross-feature dumping ground.
- Feature importing from a sibling feature, `src/app`, or a different feature's private path.
- `shared` reading the Bridge, Tauri globals or mutable feature state.
- Direct Tauri `invoke` from an arbitrary UI component; use an adapter.
- Circular imports and wildcard barrel exports.
- A single Rust `commands.rs` or `state.rs` owning all domains.
- Defaulting unknown Bridge/permission states to success, stopped or allowed.

## Rust host direction
`src-tauri/src/main.rs` boots host; `lib.rs` wires explicit modules; `ipc/<domain>.rs` validates requests; `bridge_client/` owns local authenticated transport; `events/` owns bounded stream; `platform/windows/` wraps OS APIs only. No duplicate PolicyEngine.

## Architecture checks
The dependency contract is checked by `scripts/check-boundaries.mjs` (baseline static checks). Once the implementation is bootstrapped, expand to a resolver-aware checker with TypeScript/ESLint and tests on real modules. This is not a proof of every possible dynamic import.

## CSS ownership
- `src/styles/base.css` contains resets only; `src/styles/tokens.css` contains semantic tokens.
- Layout styles live under `src/app/layout`, feature styles alongside the feature UI, reusable primitives in `src/shared/styles`.
- Do not grow an application-wide `base.css` or import private feature styles from another feature.
- New themes may override named tokens, not inject arbitrary CSS or commands.
