# Optic Desktop — état du bootstrap (24 octobre 2026)

Le dépôt contient un **hôte minimal Tauri 2/Rust** et une **UI React/TypeScript/Vite de démonstration** inspirée de Figma UI D. Ce n'est ni une migration de React V1.6.2 ni un client MCP fonctionnel.

## Présent

- Navigation modulaire Bureau, Projets, Sessions, Autorisations, Supervision, Terminal, Connexions, Paramètres.
- Accueil en mode démonstration. Console de supervision et terminal développeur **séparés visuellement, non connectés et non exécutables**.
- Module de projection d'événements offline : validation typée et journal visuel borné, avec tests.
- Module de thèmes déclaratifs offline : manifeste de couleurs contrôlé, tests de contraste et génération de variables CSS autorisées ; pas d'installation ni preview activée dans l'UI.
- Styles répartis entre `src/app/layout`, `src/features/overview/ui`, `src/shared/styles`; `src/styles/base.css` pour les resets.
- `package-lock.json` et `src-tauri/Cargo.lock` **créés et commités** ; CI avec `npm ci` et `cargo check --locked`.
- Hôte Tauri sans commandes custom et permissions frontend minimales ; icône de compilation **temporaire** ; décorations de fenêtre natives ; `bundle.active=false`.

## Absent / interdit de présumer

Pas de connexion réelle au Bridge, serveur IPC privilégié, processus ConPTY, shell autorisé, journal d'audit durable, outil MCP externe, vrai diff, synchronisation du ZIP React V1.6.2 ni installateur Windows utilisateur.

## Vérification développeur

Prérequis : Node >=22.12, npm, Rust stable et prérequis Tauri Windows.

```bash
npm ci
npm run check
npm run tauri dev
```

`npm run check` inclut vérifications de documents et frontières de modules, tests Node (`npm run test:unit`) et build TypeScript/Vite. Le CI exécute frontend sur Windows + Ubuntu et `cargo check --locked --manifest-path src-tauri/Cargo.toml` sur Windows hébergé.

**Pas de preuve de packaging installable, d'essai en conditions réelles sur le PC du propriétaire ni de conformité sécurité complète.** Toutes les assertions sur la CI doivent porter sur le SHA exact contrôlé.

## Ensuite

- Source V1.6.2 et logo officiel : obtenir les originaux puis comparer sans repartir de zéro.
- Tests visuels UI D à 1440×900 / 1280×800 ; clavier, densité, pas de scroll accueil.
- ADR et contrat d'IPC local authentifié en coordination avec l'IA responsable du Bridge, **sans écrire dans ce dépôt tiers**.
- UI thèmes : preview, rollback, stockage local validé, puis import futur avec contrôle de provenance et taille.
- Développement incrémental derrière des adaptateurs explicites `demo/offline/live` ; les permissions restent du ressort du Bridge Rust.

Voir `docs/engineering/HANDOFF.md` pour l'état GitHub et les priorités.
