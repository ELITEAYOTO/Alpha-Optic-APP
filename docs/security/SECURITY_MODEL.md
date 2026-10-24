# Optic Desktop security rules

**Authority boundary:** Optic AI Bridge Rust is the sole effective capability/policy authority. Desktop Tauri capabilities restrict UI-to-native access but do not replace Bridge policy.

1. A `PermissionRequest` is not a grant. Restore/hydration is never implicit reauthorization; epochs, expirations, leases and revocation must be validated against Bridge state.
2. OS/process controls, native Job membership and confirmed quiescence are not equivalent to an icon saying stopped. Preserve termination-uncertain state.
3. No `cmd.exe`, PowerShell or ConPTY interactive shell by default. A permitted tool profile does not imply permission for arbitrary commands entered later. Native interactive execution needs a reviewed isolation boundary.
4. Bridge MCP JSON-RPC stdout must stay protocol-pure; diagnostics and structured events use separate bounded channels.
5. Read-only supervision output may contain untrusted text: sanitize/encode, bound size and remove secrets before storage/export.
6. Prevent injection through terminal escape sequences, hyperlink actions, clipboard, unsafe renderers and external files; never grant shell access from terminal UI alone.
7. MCP federation uses provider-scoped credentials, endpoint identity, discovery/allowlisting and independently approved outbound actions. External MCP responses are untrusted and cannot authorize themselves.
8. Themes are declarative data, validated and schema-versioned. Remote code, inline scripts, arbitrary CSS and plugins with command execution are separate future trust classes.
9. Unknown/error/disconnected states fail closed; retries do not replay mutations without idempotency contracts.
10. Tests: malformed payloads, authorization conflicts, cancellation, stale policy epoch, replay gaps, process failure and crash cleanup. Validate actual Windows behavior on independent controlled infrastructure.

The Bridge's release blockers (#317, #323, #176/#182 and other gates) are not resolved by implementing Desktop. No production use claim.
