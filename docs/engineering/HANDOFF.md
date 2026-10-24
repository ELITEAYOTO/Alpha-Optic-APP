# Optic Desktop — handoff canonique (24 octobre 2026)

**Ce fichier est la source de reprise.** Il remplace les anciens statuts narratifs. Lire aussi `AGENTS.md`, `docs/engineering/WORKFLOW.md`, `docs/architecture/MODULE_BOUNDARIES.md`, `docs/security/SECURITY_MODEL.md`, `docs/design/UI_D.md`, `docs/architecture/OBSERVABILITY_UI_CONTRACT.md` et `docs/architecture/THEMES.md`.

## 1. Repositories — STRICT

- **Écrire UNIQUEMENT dans** `ELITEAYOTO/Alpha-Optic-APP` : https://github.com/ELITEAYOTO/Alpha-Optic-APP
- **Bridge externe, lecture seule** : `ELITEAYOTO/Optic-AI-Bridge-` : https://github.com/ELITEAYOTO/Optic-AI-Bridge-
- Une AUTRE IA développe activement le Bridge. Aucun commit, branche, issue, PR, modification, fusion ou action de workflow dans le dépôt Bridge sans mandat nouveau et explicite. Éviter également de supposer qu'un ancien SHA/contrat du Bridge est encore actuel.
- Si une évolution de Bridge est nécessaire, la documenter dans le dépôt Desktop et préparer une proposition de contrat à soumettre à l'utilisateur/à l'autre IA, **sans action GitHub côté Bridge**.

## 2. GitHub vérifié à cette passation

La branche `main` du Desktop **avant la PR de cette mise à jour documentaire** : `6e67fb7cea325bca08bbae3d681329889d60a654`.

| PR | Résultat vérifié |
| --- | --- |
| #1 Fondation modulaire | Fusionnée, `9a4e78e` |
| #2 Bootstrap React/Tauri | Fusionnée, `479b545` |
| #5 Responsabilité CSS | Fusionnée, `52530ac` |
| #6 Journal d'événements offline | Fusionnée, `dffffa4` |
| #7 Thèmes déclaratifs | Fusionnée, `6e67fb7` ; tests exact-head `534b4c8` verts avant fusion |

Au contrôle précédant ce document, aucune PR n'était ouverte ; les issues **#3** (migration de la V1.6.2 réelle) et **#4** (contrat authentifié Desktop ↔ Bridge) restaient ouvertes. Le contrôle Foundation sur `6e67fb7` était vert, la CI Desktop du *merge commit* était encore en cours. **Revérifier état/SHAs/CI en début de nouveau chat : ceci est un instantané, pas une vérité permanente.**

## 3. Stack, implémentation réelle et limites

- **Implémenté dans le dépôt :** Tauri 2 / Rust hôte minimal ; React 19 + TypeScript + Vite ; shell de démonstration inspiré de l'UI D ; navigation Bureau/Projets/Sessions/Autorisations/Supervision/Terminal/Connexions/Paramètres ; écran d'accueil ; vues séparées de supervision et de terminal **inactives** ; tokens CSS ; CSS réparti par propriétaire ; `package-lock.json` et `src-tauri/Cargo.lock` ; CI Node Windows+Ubuntu et `cargo check --locked` Windows.
- **Contrats offline implémentés :** `src/contracts/telemetry.ts` filtre/rejette les événements inconnus/malformés ; `src/features/supervision/model/journal.ts` gère un buffer UI borné, ordre, doublons, lacunes et changement de source ; `tests/supervision-contract.test.mjs`.
- **Projection de contrôle hors ligne implémentée :** `src/contracts/control-status.ts` distingue Bridge, session, autorisation, révocation et terminaison native ; source `offline/demo` strictement validée, sans revendication de connexion authentifiée. `DesktopShell` affiche les états hors ligne via cette projection ; `tests/control-status.test.mjs` couvre versions, champs inconnus et axes indépendants. Aucun IPC ni permission réelle. Voir ADR-0005.
- **Accueil UI D (premier lot) :** mise en page compacte 1280 × 800 (rail 60 px, explorateur 215 px), densité 1440 × 900, navigation accessible et logo multicolore vérifié, dérivé 48 px. Aucun IPC ni statut réel ajouté. **Revue visuelle Windows et absence de scroll non encore validées**. Voir issue #3 et `docs/design/UI_D.md`.
- **Thèmes offline implémentés :** `src/features/themes/model/theme-manifest.ts` valide le manifeste déclaratif, 14 couleurs, contraste principal >= 4.5:1, rayon, projection de variables CSS ; `tests/theme-manifest.test.mjs`. Ce code n'active pas encore les thèmes dans l'UI ; aucune galerie, téléchargement ni exécution tierce.
- **NON implémentés :** liaison réelle au Bridge, IPC authentifié, moteur d'autorisation dans Desktop, abonnement aux événements Bridge, journal d'audit persistant, ConPTY, shell interactif, xterm.js, Monaco diff, watchers FS, passerelle MCP externe, mise à jour, packaging MSI/portable, marketplace de thèmes/extensions.
- Le logo/icon actuel est **temporaire**. La fenêtre Tauri utilise encore les décorations natives Windows. `bundle.active=false`. Aucun exécutable final / installation Windows utilisateur n'a été validé.
- **IMPORTANT :** la **source originale React V1.6.2 a été retrouvée et auditée statiquement** le 24 octobre (archive SHA-256 `0d305e732d21be4771b09dbb6ca70ad795d47139877a431d0a977801af130cef`) ; voir `docs/engineering/V162_SOURCE_AUDIT.md`. Elle n'a **pas** été migrée dans ce dépôt ni testée sur Windows ; le shell actuel reste un bootstrap expérimental.

## 4. Objectif produit & décisions validées

Nom affiché : **Optic** ; moteur : **Optic AI Bridge** ; ne jamais renommer le produit « Lab ». Windows-first. UI **D Carbone et corail** validée, variante claire Lin et grenat. Figma https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=320-130 ; références détaillées dans `docs/design/UI_D.md`. L'utilisateur a ajouté dans son espace de design une image de configuration/installation : inspiration distincte pour le parcours initial, **pas un asset déjà importé** ni autorisation de génération d'autres images.

Deux consoles réellement distinctes à terme :
1. **Supervision**, lecture seule, démarrage automatique avec Bridge lancé par Optic ; logs réels structurés, horodatés, filtrables, bornés et récupérables sous contrat.
2. **Terminal développeur**, interactif seulement après validation Rust ; xterm.js + ConPTY candidats, profiles autorisés, isolement Windows réel nécessaire ; jamais d'exécution PowerShell/CMD libre par défaut.

Afficher modifications de code par fichier et lignes ajoutées/supprimées (Monaco Diff candidat), corrélées aux opérations et permissions effectives. Thèmes communautaires : données déclaratives, sans scripts/CSS arbitraire. Extensions/boutons ajoutés par utilisateurs : future catégorie **séparée**, à permissions explicites. Préparer prise en charge de MCP tiers (Figma et autres) côté Bridge **après revue des contrats, compatibilités et authentification** ; ne pas prétendre une connexion Figma fonctionnelle.

## 5. Invariants sécurité / architecture

- **Bridge Rust est l'unique autorité sur droits, sessions et effets sensibles.** Tauri n'est pas un second PolicyEngine ; React n'accorde aucun droit. Demande ≠ accord ≠ droit effectif ; révocation ≠ processus terminé ; état inconnu ≠ « arrêté ».
- Respecter DAG `app -> features -> shared` et `features -> contracts/shared` ; jamais import direct d'une feature sœur ou dans `app` depuis une feature. Composition dans `src/app`; composants/styles dans modules propriétaires. Le garde-fou `scripts/check-boundaries.mjs` est une base statique **non exhaustive**.
- Pas de `App.tsx` géant, `utils.ts` transversal, contexte mondial de permissions ou fichier Rust unique combinant tous les services.
- Isoler les adaptateurs `demo/offline/live`. Ne jamais convertir une simulation en statut réel ni lire le stdout JSON-RPC de MCP comme un flux de logs.
- Les sorties du terminal et des serveurs MCP sont non fiables ; pas de secrets dans logs/exports. Les thèmes ne donnent aucun accès au système.
- Bridge Windows V1 était **NO-GO au dernier audit historique** ; le prochain chat doit vérifier le statut actuel avec le propriétaire Bridge, sans déclarer une résolution sur la base du code Desktop.

## 6. Méthode de travail

1. À chaque reprise, vérifier dépôt, `main` exact, PR ouvertes, éventuelles contributions externes, issues et résultats des CI récentes **dans le seul repo Desktop**.
2. Lire `AGENTS.md`, règles/ADR et fichiers concernés. Prendre une seule responsabilité à la fois ; ouvrir **petite branche et PR**, pas d'écriture directement sur `main` sauf exception motivée.
3. Ajouter tests unitaires/contrats sur erreurs, bornes, annulation, reconnexion et invariants. Utiliser `npm ci`, `npm run check`, `cargo check --locked --manifest-path src-tauri/Cargo.toml` et GitHub Actions. Pas de dépendance ajoutée sans raison documentée.
4. Examiner toutes les CI sur **le SHA exact** avant squash-merge, puis vérifier l'exécution post-fusion ; si CI en cours, laisser la PR ouverte.
5. Ne pas toucher au PC local de l'utilisateur ni déclencher des tests/installeurs physiques sans accord spécifique.
6. Garder `HANDOFF.md` court, fidèle à GitHub et à jour lors de chaque fin de chantier ; ne pas accumuler des fichiers « HANDOFF_NEXT_CHAT » redondants.

## 6 bis. Installation et configuration — chantier identifié, pas encore développé

- **Issue #12 :** NSIS professionnel, portable distinct, WebView2, dépendances utilisateur vs développement, versions/compatibilité, signature, updates et validations Windows.
- **Issue #13 :** assistant de première utilisation UI D fondé sur les cadres Figma `407:1659`, `407:1676`, puis `391:1138` ; ne pas les redessiner arbitrairement.
- Voir `docs/engineering/WINDOWS_DISTRIBUTION.md`, `docs/design/INSTALLATION_SETUP.md` et ADR-0006 (native installation ≠ app first-run).
- **Aucune release installable, aucun mode portable vérifié, aucune installation automatique de Bridge.** `bundle.active=false`. Node/Rust sont les outils de build, pas des prérequis à demander à l'utilisateur final.

## 6 ter. Mises à jour — socle d'affichage, non activé

- **Issue #15** : updater signé Tauri 2, canaux, métadonnées, consentement et vérifications Windows ; dépend de #12 (artefact réellement installable) et #4 (quiescence Bridge).
- `src/features/updates/` apporte un modèle UI borné et une section des Paramètres clairement **non activée**, avec tests et ADR-0007. Pas de plugin updater branché, pas d'endpoint ou de clé publique, pas de téléchargement ni installation, `bundle.active=false` inchangé.
- Ne pas appeler cela « mises à jour disponibles » tant qu'il n'y a pas de release/signature/pubkey/CI Windows et d'adaptateur natif.

- **Garde-fou release :** `scripts/check-release-gates.mjs` contrôle automatiquement cohérence version/identité et interdit une configuration updater active ou incomplète ; `npm run check:release-candidate` reste volontairement rouge tant que le package Windows n'est pas prêt (issue #12 et #15). Ces validations sont statiques, **pas une preuve de signature ou de packaging**.

- **NSIS CI smoke (#12.A) :** profil `src-tauri/tauri.nsis-smoke.conf.json` et workflow Windows isolé, sans signature ni installation et sans release publique. Tester la construction et recueillir checksum / provenance uniquement ; voir `docs/engineering/WINDOWS_DISTRIBUTION.md`. Une CI packaging verte ne certifie **pas** un installeur prêt pour les utilisateurs.

- **NSIS cycle de vie CI (#12.B première tranche) :** script `scripts/windows/test-nsis-lifecycle.ps1` et workflow isolé : installation silencieuse uniquement sur runner GitHub hébergé, vérification registre/fichiers, désinstallation/cleanup et rapport temporaire. **Ne déclarer testé qu'après CI NSIS verte sur le SHA exact.** Pas de UI/WebView2 absent/upgrade, pas de signature ni de publication.

- **WebView2 GUI CI (#12.B) :** test de fenêtre Win32 et processus `msedgewebview2.exe` enfant de l'application installée, avant désinstallation NSIS. Runner GitHub hébergé uniquement ; aucune validation de pixels/React réel. Résultat à confirmer sur SHA CI avant fusion.

- **Test visuel utilisateur Windows :** app source compilée et ouverte ; barre de titre blanche, icônes natives provisoires, explorer à replier, hovers à revoir. Lot explorer/hover sans droits natifs, lot titre/logo séparé ; animation de démarrage planifiée mais pas activée. Voir `docs/design/UI_D.md`.

## 7. Prochaines priorités recommandées

1. **Issue #3 :** reprendre l'audit statique de l'archive récupérée (voir `docs/engineering/V162_SOURCE_AUDIT.md`), importer l'asset logo vérifié puis migrer en petites PR les interactions du prototype vers les modules UI D ; vérifier 1440×900 et 1280×800, clavier/focus, absence de scroll accueil et simulations explicites.
2. **Issue #4 :** détailler côté Desktop les interfaces `BridgeState / SessionState / AuthorizationState`, protocole proposé avec version, identité d'instance, authentification, event cursor, reconnexion, expurgation ; **pas d'implémentation live** sans accord/revue du Bridge.
3. Faire apparaître dans l'UI des **états purement offline** et les composants de thèmes prévisualisables (sans import réseau) avec tests ; ne pas connecter des appels Rust encore hypothétiques.
4. Préparer le design du terminal/supervision/connexion MCP externe via ADR, sans lancer de shell ni ajouter un proxy MCP privilégié.
5. Améliorer progressivement les checks de modules (imports dynamiques, TS resolver), tests d'interface, accessibilité, réduction des écarts Figma, audit du processus Windows.

**Aucun développement GitHub côté Bridge n'est une tâche du successeur.**
