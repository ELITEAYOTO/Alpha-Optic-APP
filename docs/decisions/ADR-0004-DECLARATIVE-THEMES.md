# ADR-0004 — Strict community theme data, separate extensions

Status: accepted for Desktop offline prototype
Date: 2026-10-24

Community themes use versioned, validated semantic tokens only. In UI D, all theme changes must pass allowlisted CSS variables and basic primary contrast checks; invalid, unknown or oversized manifests fail validation.

Reject executable themes, `url(...)` CSS, arbitrary selectors, scriptable palettes, runtime DOM overrides by untrusted sources and any implicit native/MCP permission. User-defined action buttons belong to a distinct, audited, capability-scoped extension system. Bridge Rust remains sole authority for all security-sensitive actions.

This ADR is not a theme marketplace or permission for external code execution.
