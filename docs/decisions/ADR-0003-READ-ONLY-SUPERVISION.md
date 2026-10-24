# ADR-0003 — Read-only frontend observability projection

Status: accepted for offline Desktop prototype only
Date: 2026-10-24

Choose a versioned, strictly parsed, redacted `SupervisionEvent` view model in Optic Desktop with a finite in-memory journal. Reserve the actual Bridge ↔ Desktop protocol, endpoint and authentication for cross-repository security review.

A supervision event does not authorize access. The supervision console and developer terminal never share an execution channel. If the Bridge is disconnected, unknown or incompatible, show no fabricated live events.

Rejected: treating raw MCP protocol stdout as logs, unbounded renderer buffers, arbitrary JSON payload pass-through, guessing event owner from project path, assuming that a connection to a transport proves permissions.
