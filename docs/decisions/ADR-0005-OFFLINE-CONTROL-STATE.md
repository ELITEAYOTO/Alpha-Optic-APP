# ADR-0005 — Offline control-state projections are not authority

Status: accepted for the Desktop offline prototype
Date: 2026-10-24

## Decision

Optic Desktop models five **independent** state axes for **presentation only**:
Bridge availability, session lifecycle, authorization lifecycle, revocation progress,
and verified native termination. In the current implementation
`src/contracts/control-status.ts` accepts **only** `offline` or `demo`
sources with a strict version-1 allowlist. An `offline` snapshot requires
all five axes to be `unknown`. This projection cannot represent a trusted
Bridge connection and is not intended to become its wire schema unmodified.

Revocation acknowledged does not imply native termination; an approved request
does not imply an effective grant; a completed session does not prove native
quiescence. The renderer's status summary contains **no authorization boolean
or command execution capability**. Every demonstrated effective authorization
remains explicitly simulated.

## Consequences

- Renderer labels must explicitly identify simulated/offline origin.
- No persistence of an effective right and no automatic grant hydration.
- A future authenticated Rust control adapter needs **separate** versioned
  handshake, source identity, connection health, lifecycle and fail-closed
  conversion, with compatibility review by the Bridge maintainer.
- Unknown/changed state during reconnect must remain unknown until a fresh,
  authenticated observation. Never infer past status from this projection.
- Bridge Rust remains the only authority. No native commands or live IPC are
  introduced by this ADR.
