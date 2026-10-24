# Desktop ↔ Bridge contracts (proposal)

No existing live control plane is assumed. API surface is a design target requiring joint review in the Bridge repo.

Contract envelope: `schema_version`, `request_id`, `source_instance_id`, `project_id?`, `session_id?`, `operation`, `payload`. Validate message length, type, versions, channel identity, authorization and error handling in Rust. Avoid client-owned security identity.

Event envelope: `schema_version`, `sequence`, `monotonic_elapsed_ms`, `wall_time`, `category`, `severity`, `correlation_id?`, `action_id?`, `project_id?`, `session_id?`, `status`, redacted payload. Backpressure, gaps, replay bounds and retention explicitly defined.

Distinguish `BridgeState` (unknown/starting/ready/stopping/stopped/failed), `SessionState` (no session/pending/running/stopping/finished/termination uncertain) and `AuthorizationState` (requested/approved/effective/revoked/expired/denied). Requests and effective grants are NOT interchangeable.

Read-only supervision console subscribes to events, never submits execution. Developer terminal commands are separate, authenticated and policy-mediated; ConPTY alone is not an isolation guarantee.

Diff inspection must bind original action, before/after identities, file path and read authority. Unknown external modifications must remain unattributed.

No client-supplied tool/terminal input is an executable authority. No arbitrary remote MCP passthrough or OAuth token relay by default. Protocol evolution is explicit, fail-closed on unknown versions.
