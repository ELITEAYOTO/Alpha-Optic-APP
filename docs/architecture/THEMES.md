# Optic themes — immutable declarative manifest

Status: first **offline-only schema** in `ELITEAYOTO/Alpha-Optic-APP`; no theme store, network download, zip extraction, custom CSS, dynamic component injection or plugin execution.

## Purpose
The UI D palette is expressed through semantic tokens. Community authors should be able to change visual properties without having access to Bridge permissions or native commands.

### V1 data contract
- JSON object with exactly `schemaVersion`, `id`, `name`, `author`, `appearance`, `colors`, `radius`.
- Version currently `1`. Unknown versions rejected.
- `id` follows a bounded dotted/reverse-DNS-like namespace, metadata bounded to short single-line strings.
- 14 color tokens strictly match `#RRGGBB`: `bg, surface, subtle, rail, explorer, raised, border, text, muted, faint, accent, onAccent, selected, warning`.
- Numeric radius is integer between 0 and 16. All properties required, no extra keys.
- Primary text/background, text/surface and on-accent/accent require contrast >= 4.5:1 for readability. Other accessibility checks will be necessary as themes gain typography and additional states.
- CSS output is a fixed mapping to predefined CSS variables; no concatenated stylesheets, selectors, web URLs, font fetching, scripts, buttons or terminal commands.

## Trust boundaries
A theme is appearance data, **not** an MCP permission, native executable, React component or extension. Third-party UI actions will use a separate signed/approved extension contract in a later security review. Never enable arbitrary CSS or JavaScript to satisfy requests for custom buttons.

The current parser is in `src/features/themes/model/theme-manifest.ts` and is tested by `tests/theme-manifest.test.mjs`. It does not modify the live UI or load external packages. Future installation and publication must add provenance, packaging rules, storage constraints, preview/rollback, input-size limits and security checks before enabling untrusted downloads.

## Styling integration
`src/styles/tokens.css` currently defines the official dark palette. The theme schema maps to existing semantic CSS variables. Before enabling previews, ensure default mode and compact Windows layout remain accessible and that focus/warning states are not hidden.
