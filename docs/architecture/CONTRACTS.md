# Desktop ↔ Bridge contracts (proposal)

No existing live control plane is assumed. API surface is a design target requiring joint review in the Bridge repo.

Contract envelope: `schema_version`, `request_id`, `source_instance_id`, `project_id?`, `session_id?`, `operation`, `payload`. Validate message length, type, versions, channel identity, authorization and error handling in Rust. Avoid client-owned security identity.

Event envelope: `schema_version`, `sequence`, `monotonic_elapsed_ms`, `wall_time`, `category`, `severity`, `correlation_id?`, `action_id?`, `project_id?`, `session_id?`, `status`, redacted payload. Backpressure, gaps, replay bounds and retention explicitly defined.

Distinguish `BridgeState` (unknown/starting/ready/stopping/stopped/failed), `SessionState` (no session/pending/running/stopping/finished/termination uncertain) and `AuthorizationState` (requested/approved/effective/revoked/expired/denied). Requests and effective grants are NOT interchangeable.

Read-only supervision console subscribes to events, never submits execution. Developer terminal commands are separate, authenticated and policy-mediated; ConPTY alone is not an isolation guarantee.

Diff inspection must bind original action, before/after identities, file path and read authority. Unknown external modifications must remain unattributed.

No client-supplied tool/terminal input is an executable authority. No arbitrary remote MCP passthrough or OAuth token relay by default. Protocol evolution is explicit, fail-closed on unknown versions.

## Offline display-state prototype (not authenticated IPC)

`src/contracts/control-status.ts` provides the version-1 **Desktop presentation**
projection. It rejects unrecognised fields, versions and sources and deliberately
cannot accept `live` or `authenticated`; those require a future Rust-authenticated
adapter and a separately negotiated Bridge protocol. When `source=offline`, all
five axes must be `unknown`: `bridge_state`, `session_state`,
`authorization_state`, `revocation_state`, `native_termination_state`.

In `demo`, statuses may be illustrated but must always be marked simulated.
An acknowledged revocation does not confirm process termination; an authorization
marked effective in demonstration confers **no real access**. The status summary
returns text labels only, no `allowed` or `canRun` decision. See
`docs/decisions/ADR-0005-OFFLINE-CONTROL-STATE.md` and
`tests/control-status.test.mjs`. This is not an authority, handshake, transport,
capability token, or persistent audit log.
