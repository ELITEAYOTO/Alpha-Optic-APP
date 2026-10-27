# Optic — application Windows

**Optic** est l'application Desktop de **Optic AI Bridge**. Produit Windows-first, direction visuelle UI D (Figma). Ne pas appeler le produit « Lab ».

> **Statut : bootstrap expérimental / démonstration uniquement.** Aucune connexion de contrôle réelle au Bridge, aucune permission effective, aucun shell interactif et aucun installateur prêt à distribuer.

## Déjà présent

- Tauri 2 / Rust hôte minimal et React / TypeScript / Vite.
- Navigation modulaire, accueil et explorateur rétractable ; Supervision affiche un état **hors ligne compact** (aucun flux réellement connecté), Terminal développeur distinct **désactivé**.
- Projection d'événements offline typés, modèle de journal borné avec tests **sans abonnement Bridge live**.
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

Le build source réussi en CI ne prouve ni la qualité visuelle ni une connexion au Bridge. **L'utilisateur a réellement compilé et ouvert le prototype Windows** : titre natif sombre, logo Optic et explorateur repliable observés. **Un NSIS non signé de test a été installé/lancé/désinstallé uniquement sur runner hébergé** ; le packaging de distribution normale reste désactivé. L'icône native actuelle utilise le logo Optic officiel **48 px**, pas encore le jeu HD final.

## Distribution et premier démarrage (planifiés)

Le projet suit explicitement le [packaging Windows / versions / WebView2 (#12)](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/12) et l'[assistant de configuration UI D (#13)](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/13). Plans : [distribution](docs/engineering/WINDOWS_DISTRIBUTION.md), [écrans Figma](docs/design/INSTALLATION_SETUP.md), [ADR-0006](docs/decisions/ADR-0006-INSTALLATION-BOUNDARIES.md).

**Aucun installateur prêt à distribuer.** Node/npm/Rust ne devront pas être installés manuellement par l'utilisateur final d'une future release. WebView2 et Bridge ont des responsabilités de version distinctes.

## Mises à jour d'Optic (préparation technique)

La section **Paramètres → Mises à jour** apparaît maintenant en mode **non configuré**, avec version du prototype et explication. Le modèle d'états et ses tests sont présents, sans réseau ou privilège. **Aucune mise à jour réelle n'est disponible** : le workflow signé Tauri 2, les clés, le serveur de publication et les tests Windows sont suivis dans [#15](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/15) ; voir [ADR-0007](docs/decisions/ADR-0007-SIGNED-UPDATES.md). La première release devra utiliser des artefacts signés, pas simplement des liens de téléchargement.

## Test CI d'installateur Windows (sans distribution publique)

Le workflow `windows-nsis-smoke.yml` prépare un installateur **NSIS non signé** sur GitHub Actions Windows, avec empreinte SHA-256 et rétention de 2 jours. `npm run check:nsis-smoke` vérifie l'isolation de son profil de test. **Le workflow teste maintenant une installation et une désinstallation silencieuses sur un runner Windows hébergé temporaire**, en contrôlant le registre HKCU, les fichiers et le nettoyage. Il teste également une **preuve de démarrage natif** (fenêtre Windows et processus WebView2 propre à Optic) ; il ne teste **pas** le rendu React, WebView2 absent, l’upgrade, la signature ou le PC de l’utilisateur ; **le binaire demeure non approuvé pour diffusion**. Le packaging normal d’Optic reste désactivé. Voir [le plan Windows](docs/engineering/WINDOWS_DISTRIBUTION.md) et [issue #12](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/12).

## Optic Preview — installateur Windows expérimental (non signé)

Un profil **Optic Preview** séparé permet maintenant de construire un installeur NSIS `currentUser` sur GitHub Actions Windows, avec contrôles SHA-256 et essai d'installation/désinstallation sur runner hébergé (PR #29). Il n'est **pas** publié dans les Releases et n'est **pas prêt** pour un PC personnel : identité provisoire, non signé, pas de validation Windows 10/11 propre, pas d'updater live ni de fonctionnement garanti sans Internet pour WebView2. Le build normal reste `bundle.active=false`.

Voir le [guide du candidat NSIS](docs/engineering/NSIS_PREVIEW.md), l'[issue #28](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/28) et [ADR-0007](docs/decisions/ADR-0007-SIGNED-UPDATES.md) pour les étapes de signature et de mise à jour.

## Lire avant toute modification

1. [AGENTS.md](AGENTS.md) : règles non négociables, interdiction d'écriture dans le Bridge.
2. [Handoff canonique](docs/engineering/HANDOFF.md) : branche/PR/CI exacts, avancement et prochains travaux.
3. [Méthode](docs/engineering/WORKFLOW.md), [frontières des modules](docs/architecture/MODULE_BOUNDARIES.md) et [sécurité](docs/security/SECURITY_MODEL.md).
4. [Design UI D](docs/design/UI_D.md), [observabilité](docs/architecture/OBSERVABILITY_UI_CONTRACT.md), [thèmes](docs/architecture/THEMES.md).

**Priorités :** poursuivre la migration UI D fidèle depuis l'archive V1.6.2 déjà auditée, vérifier par capture la Supervision hors ligne revue en PR #25, préparer le first-run #13, intégrer le véritable logo haute définition après preuve de source, et proposer un futur contrat IPC authentifié **sans jamais toucher au Bridge**. Toute PR doit passer les CI sur son SHA exact.

**Reprise entre chats (27 octobre 2026) :** lire le [handoff canonique](docs/engineering/HANDOFF.md) puis le [prompt complet à copier](docs/engineering/NEXT_CHAT_PROMPT_OPTIC_DESKTOP_2026-10-27.md). Ne pas prendre l'ancienne documentation de 24 octobre comme un état GitHub actuel.
