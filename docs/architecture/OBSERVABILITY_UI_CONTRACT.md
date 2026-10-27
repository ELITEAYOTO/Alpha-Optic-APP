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

## Offline empty state (issue utilisateur, 24 octobre 2026)

Dans la capture Windows 1280/1536 px fournie, la console affichait
`$ optic events --follow` comme faux prompt et un grand panneau vide. Cette
commande n'était pas exécutable : la vue ne possède aucun abonnement réel.

Le nouveau composant `features/supervision/ui/SupervisionScreen` ne fait
aucune inférence à partir du journal en mémoire : il signale clairement
**source non connectée**, **flux authentifié non disponible** et
**historique non accessible**. Il n'affiche ni compteur zéro trompeur ni
fausse CLI, ni événement de démonstration. Son unique action utilisateur
retourne à l'accueil via un callback fourni par `src/app`, sans
dépendance à l'implémentation du routeur.

Le contrat `telemetry.ts` et le buffer borné `journal.ts` restent inchangés.
Le jour d'une connexion réelle, un adaptateur Rust authentifié devra
fournir explicitement ses états ; supprimer l'écran offline sans preuve
d'authentification serait incorrect. Aucun accès au moteur Bridge ajouté.

## État de livraison et garde de compatibilité — 27 octobre 2026

- PR #25 **fusionnée** sur `main` du Desktop (base confirmée
  `c5c89006d4041362dd4e791675af5c504be6d25c`, CI post-fusion 4/4).
- La vue Supervision offline compactée comporte un simple bouton **Retour au bureau**
  passé par composition `src/app`, sans commande système, sans faux
  `$ optic events --follow`, sans faux événements. Les modèles
  `telemetry.ts` et `journal.ts` restent offline inchangés.
- L'utilisateur a photographié **l'ancienne Supervision**, qui a motivé
  cette amélioration ; **aucune nouvelle preuve visuelle Windows de #25** reçue
  à ce point. Un futur agent ne doit pas annoncer que cette nouvelle vue
  a été approuvée visuellement.
- Le prochain contrat live devra **authentifier et versionner** la source en
  Rust/Tauri avant projection d'événements, distinguer absence de source,
  transport interrompu et retard/gap de séquence, et traiter les exports avec
  expurgation des secrets. Une connexion réelle reste strictement **non implémentée**.
