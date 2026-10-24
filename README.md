# Optic — application Windows

Application desktop Windows d’**Optic AI Bridge**.

Ce dépôt contient l’interface, l’expérience utilisateur et le contrôleur desktop prévus pour **Tauri 2 + Rust + React/TypeScript**. Le moteur de permissions, les services et les transports MCP restent dans le dépôt distinct [Optic AI Bridge](https://github.com/ELITEAYOTO/Optic-AI-Bridge-).

## État

**Initialisation de l’architecture uniquement.** Aucun exécutable Windows, runtime Tauri, terminal ConPTY, console reliée au Bridge ou intégration MCP externe n’est livré dans ce dépôt à ce stade. La baseline React V1.6.2 existe séparément ; elle devra être inspectée et intégrée sans réécriture.

## Principes

- Modularité explicite par fonctionnalités, interfaces publiques et adaptateurs.
- L’autorité de sécurité appartient exclusivement au Bridge Rust.
- Figma UI D est la direction visuelle validée ; « Optic » est le nom de l’application. Pas de « Lab » dans les noms produits.
- Les thèmes sont des données validées ; les extensions de commandes nécessiteront un modèle d’autorisation distinct.
- Un mode démonstration est possible, mais aucune donnée fictive ne doit être présentée comme un état réel du Bridge.
- L’application et le Bridge évoluent dans des dépôts séparés, avec des contrats versionnés.

## Reprise

Après le socle initial, lire `AGENTS.md`, `docs/architecture/OVERVIEW.md`, `docs/architecture/MODULE_BOUNDARIES.md`, `docs/security/SECURITY_MODEL.md` et `docs/engineering/HANDOFF.md` avant de commencer une fonctionnalité.
