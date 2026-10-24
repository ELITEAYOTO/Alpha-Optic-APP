# ADR-0002 — Feature modules and extensions

Status: accepted design, implementation pending
Date: 2026-10-24

Adopt feature-owned modules, public APIs and acyclic dependencies. The `app` composes features; no private sibling imports. A theme is validated declarative data. Future user interface extensions, commands and MCP federation require explicit capability/identity controls and cannot inherit theme privileges.

Reject: monolithic `App.tsx`, `utils.ts`, `services.ts`, global shared stores with every domain, direct Tauri commands from views, and arbitrary plugin JavaScript. Do not create layers without a real responsibility.
