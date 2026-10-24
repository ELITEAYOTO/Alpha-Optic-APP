# Optic — application Windows

**Optic** est l'application Desktop de **Optic AI Bridge**. Produit Windows-first, direction visuelle UI D (Figma). Ne pas appeler le produit « Lab ».

> **Statut : bootstrap expérimental / démonstration uniquement.** Aucune connexion de contrôle réelle au Bridge, aucune permission effective, aucun shell interactif et aucun installateur prêt à distribuer.

## Déjà présent

- Tauri 2 / Rust hôte minimal et React / TypeScript / Vite.
- Navigation modulaire, accueil, supervision en lecture seule et terminal développeur séparés mais **inactifs**.
- Projection d'événements offline validée, historique visuel borné avec tests.
- Manifeste de thème communautaire **déclaratif offline** validé et testé (pas de marketplace ni d'activation UI).
- CI GitHub Actions : Node/React Windows et Ubuntu, contrôle Rust sur runner Windows ; dépendances npm/Cargo verrouillées.

## Répartition des responsabilités

- **Ce dépôt Desktop :** UI, thèmes, navigation, contrôleur Tauri minimal, contrats de projection sans autorité.
- **<https://github.com/ELITEAYOTO/Optic-AI-Bridge-> :** moteur Rust et *seule* autorité sur les sessions, permissions et opérations. Il est développé simultanément par une **autre IA**. Ne pas y écrire depuis ce chantier.
- Contrat de liaison Desktop ↔ Bridge encore à négocier ; interfaces fake/offline clairement signalées.

## Développement

Avec Node >=22.12, npm, Rust stable et prérequis Tauri Windows :

```bash
npm ci
npm run check
npm run tauri dev
```

Le build source réussi en CI **n'est pas** un test d'installateur, une validation du PC utilisateur ou une connexion réelle au Bridge. Le packaging est désactivé et l'icône du bootstrap n'est pas le logo officiel.

## Distribution et premier démarrage (planifiés)

Le projet suit explicitement le [packaging Windows / versions / WebView2 (#12)](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/12) et l'[assistant de configuration UI D (#13)](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/13). Plans : [distribution](docs/engineering/WINDOWS_DISTRIBUTION.md), [écrans Figma](docs/design/INSTALLATION_SETUP.md), [ADR-0006](docs/decisions/ADR-0006-INSTALLATION-BOUNDARIES.md).

**Aucun installateur prêt à distribuer.** Node/npm/Rust ne devront pas être installés manuellement par l'utilisateur final d'une future release. WebView2 et Bridge ont des responsabilités de version distinctes.

## Lire avant toute modification

1. [AGENTS.md](AGENTS.md) : règles non négociables, interdiction d'écriture dans le Bridge.
2. [Handoff canonique](docs/engineering/HANDOFF.md) : branche/PR/CI exacts, avancement et prochains travaux.
3. [Méthode](docs/engineering/WORKFLOW.md), [frontières des modules](docs/architecture/MODULE_BOUNDARIES.md) et [sécurité](docs/security/SECURITY_MODEL.md).
4. [Design UI D](docs/design/UI_D.md), [observabilité](docs/architecture/OBSERVABILITY_UI_CONTRACT.md), [thèmes](docs/architecture/THEMES.md).

**Priorités :** vérifier la source V1.6.2 et migrer fidèlement Figma UI D ; concevoir le contrat IPC authentifié sans toucher au Bridge ; poursuivre les modules dans de petites PR vérifiées sur le SHA exact.
