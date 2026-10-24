# Optic Desktop — architecture overview

**Status: planned, not implemented.** Target: Windows-first Tauri 2 / Rust + React / TypeScript. No native Bridge integration yet.

## Responsibility map
1. **React renderer**: navigation, UI D, forms, themes, session/project visualization, readonly supervision view, developer-terminal presentation, Monaco diff viewer. No security decisions or arbitrary FS/process access.
2. **Desktop host (Rust / Tauri)**: window lifecycle, IPC validation, UX-safe application state, authenticated Bridge client, event delivery and bounded buffering. Cannot create substitute permissions.
3. **Optic AI Bridge (separate repo)**: operator authority, sessions, policy, task leases, MCP transports, filesystem/Git/process runtime and future audited external MCP routing.
4. **Adapters**: mock/test and live providers implement the same versioned contracts; UI must display source and status (demo/offline/live) explicitly.

## Planned data flow
UI intent -> typed application use case -> Tauri command -> authenticated local Bridge control contract -> Bridge policy/authorized service -> bounded structured event stream -> reducer/view model -> UI.

No raw MCP stdout redirected into frontend event parser. Protocol stdout and diagnostic/event output remain separate. No promise of global supervision for externally launched, unmanaged Bridge instances.

## Technical choices to evaluate before code
- IPC: authenticated local channel, lifecycle identity, reconnect and bounded replay.
- Observability: monotonic sequence, source, correlation IDs, redaction, clock and gap reporting.
- Terminal: structured allowed tasks first; ConPTY interactive shell only with reviewed isolation and native job ownership.
- Diffs: before/after evidence gated by read permissions; distinguish external changes from Bridge-attributed actions.
- MCP federation: separate Bridge-side capability and trust model, never blindly proxy external tools or credentials.
- Packaging: portable vs installed, WebView2 dependencies and update rollback.
- Accessibility: keyboard, contrast, window-size behavior and screen reader labels.

## Repository structure
`src/app/`: composition and routes; `src/features/<name>/`: one feature's UI/model/api; `src/shared/`: primitives without feature knowledge; `src/contracts/`: mirror/generated typed protocol clients. `src-tauri/src/`: host/adapters, not security-core copy. `docs/`: decisions and specifications. See MODULE_BOUNDARIES.
