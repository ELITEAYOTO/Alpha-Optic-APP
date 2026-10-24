# Optic Desktop — read-only supervision projection

Status: **Desktop-only prototype; not a negotiated Bridge protocol**. This document affects only `ELITEAYOTO/Alpha-Optic-APP`. It must NOT be used to imply that `ELITEAYOTO/Optic-AI-Bridge-` implements the same JSON fields.

## Scope
The renderer will eventually display structured, redacted observations from an authenticated local Bridge authority. This PR introduces only a **shape validator** and a **bounded, in-memory UI journal**, both independently unit tested.

### Proposed event projection
- Version `schema_version: 1`; reject unknown versions.
- `source_instance_id` opaque source instance identity, with a per-instance monotonic `sequence`.
- Monotonic time since source start, wall time (RFC3339), severity, status, category, summary.
- Optional scoped IDs (`project_id`, `session_id`, `correlation_id`).
- Never accept a raw arbitrary payload or credential block into renderer state.
- `status` is **observability only**: it is NOT a capability token or security decision.

### UI buffer behavior
- Reject invalid/unbounded data.
- Treat a duplicate or older sequence as stale, without rendering again.
- Mark **forward sequence gaps**; do not silently hide lost observations.
- If a new source instance appears, reset the visible stream and count source switches rather than mixing incomparable sequences.
- Keep at most 500 events by default; hard ceiling 2000, no persistence.
- Any reconnect/replay policy must be negotiated in the future local Bridge control contract, not inferred by the UI.
- The first sequence observed cannot prove earlier events are missing, even if the sequence is greater than 1.

### Security boundaries
This is a display-only model. Rust policy remains the sole authority. No IPC transport, process spawn, `stdio` sniffing, filesystem monitoring, terminal input, MCP client, credential handling or grant operations are introduced here.

Parsing untrusted events is **not authentication**. Future Rust boundary must implement message size limits, identity verification, signed/versioned handshake or equivalent local authentication, redaction before transmission, replay consistency, backpressure and teardown; provider MCP stdout stays protocol-pure.

### Compatibility gate with the other AI
The Bridge is maintained concurrently by another developer/AI. Before real integration, propose a separate ADR and review the Bridge's then-current API and release gates. No source change, issue creation or branch mutation in the Bridge repository is authorized here.

### Test evidence
`npm run test:unit` (Node 22+ with type stripping) covers projection filtering, malformed data, unknown versions, duplicate/out-of-order events, gaps, bounded history, source changes and invalid capacity. CI must pass on the exact PR head.
