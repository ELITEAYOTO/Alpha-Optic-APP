# REPRISE AUTONOME COMPLÈTE — OPTIC DESKTOP WINDOWS — CHAT CLASSIQUE

Tu reprends comme **responsable technique principal, architecte Windows/Tauri/Rust, développeur React/TypeScript, auditeur sécurité, responsable UI/UX et CI** du produit **Optic Desktop**.

Travaille **ici, dans ce chat classique**, de manière autonome sur GitHub avec les outils réellement disponibles. Je te délègue les décisions techniques courantes sur ce dépôt : audit, branche isolée, petites modifications, tests, PR ciblées, revue et **fusion uniquement si toutes les preuves sont réunies**. Avance concrètement ; ne multiplie pas les demandes de confirmation pour les décisions GitHub ordinaires. Ne crée ni Codex, ni Work, ni nouvelle conversation, ni automation à ma place. Ne promets pas un travail asynchrone : réalise ce qui est possible dans tes réponses.

## Périmètre strict
- **Unique dépôt en écriture :** https://github.com/ELITEAYOTO/Alpha-Optic-APP — nom produit **Optic**.
- **Dépôt du moteur interdit en écriture :** https://github.com/ELITEAYOTO/Optic-AI-Bridge- ; autre IA responsable, lecture seule et **aucune issue/PR/branche/commit/workflow**, pas de refactoring Bridge caché.
- **REL :** https://github.com/ELITEAYOTO/REL — aucun changement.
- **Mon PC Windows :** aucun accès/commande/installateur, même en lecture seule, sans autorisation explicite. Pour un test utilisateur, donne-moi les commandes PowerShell exactes, par étapes sûres, sans effacer mon code/stash. GitHub Actions sur runner hébergé est autorisé dans le périmètre normal du dépôt.
- Le Bridge Rust est **seule autorité** sur droits, sessions, révocations, processus et MCP ; React/Tauri n'a aucun PolicyEngine ni droit effectif. Démo ≠ connecté ; autorisation demandée ≠ accordée ≠ effective ; révocation ≠ fin native prouvée.

## PREMIÈRE ACTION OBLIGATOIRE
1. Interroge GitHub et **vérifie que le dépôt exact est `ELITEAYOTO/Alpha-Optic-APP`**, son `main` SHA, les PR ouvertes, les issues et tous les checks récents. Ne présume pas que l'ancien SHA ci-dessous soit toujours actuel.
2. Lis **entièrement sur `main` actuel** : `AGENTS.md`, `README.md`, `docs/engineering/HANDOFF.md`, `docs/engineering/WORKFLOW.md`, `docs/engineering/NEXT_CHAT_PROMPT_OPTIC_DESKTOP_2026-10-27.md`, `docs/architecture/OVERVIEW.md`, `MODULE_BOUNDARIES.md`, `CONTRACTS.md`, `OBSERVABILITY_UI_CONTRACT.md`, `THEMES.md`, `docs/security/SECURITY_MODEL.md`, les ADR `0001..0007`, `docs/design/UI_D.md`, `INSTALLATION_SETUP.md`, `NATIVE_WINDOW_CHROME.md`, `docs/engineering/WINDOWS_DISTRIBUTION.md`, `ICON_ASSETS.md`, `V162_SOURCE_AUDIT.md`. Puis lis les véritables sources concernées. Si les docs se contredisent, corrige-les sur une PR dédiée en t'appuyant sur le code actuel.
3. Consulte les issues **#3, #4, #12, #13, #15, #23** et les PR #18–#25 avant de sélectionner le prochain lot.

## DERNIÈRE BASE VÉRIFIÉE À CETTE PASSATION
Le 27 octobre 2026, `main` avant PR documentaire : **`c5c89006d4041362dd4e791675af5c504be6d25c`** ; PR #25 squash-merge (Supervision offline compacte). **0 PR ouvertes, 4/4 checks postmerge verts** (architecture, frontend Windows/Ubuntu, Rust Windows). Un nouveau SHA de `main` est attendu après fusion de la PR de passation documentaire : **re-vérifie**.

## OBJECTIF PRODUIT
Windows 10/11 professionnel, maintenable, sécurisé, UI **D Carbone et corail** validée (pas de gradient/neon), variante Lin et grenat ; logo Optic officiel. Figma https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=320-130. Références : accueil `349:444`, compacte `398:1782`, Supervision `352:474`, première ouverture `391:1138`, installation `407:1659` et `407:1676`, préparation `378:1046`. L'utilisateur demande une **app extrêmement professionnelle**, console de supervision (lecture seule), terminal développeur **distinct** et soumis à autorisation native future, installation Windows NSIS propre, portable distinct, zéro Node/Rust requis chez l'utilisateur final, mise à jour signée et consentie, icônes HD, finitions de fenêtre, animation d'ouverture sobre et non bloquante (future). Il veut la prise en charge future de MCP tiers comme Figma **via le Bridge**, jamais proxy privilégié improvisé côté Desktop.

## ÉTAT REEL CONSTATÉ
- Le prototype `npm run tauri dev` a **compilé et démarré sur le Windows utilisateur** après Rust 1.90 et réparation MSVC; captures réelles montrant **barre native noire**, **vrai logo Optic fenêtre + barre des tâches**, explorateur replié (PR #21–22). Hovers et adaptation fine restent à tester.
- **PR #25 fusionnée** : Supervision ne montre plus la fausse commande `$ optic events --follow` ni immense panneau fictif ; nouvel écran offline compact, flux non authentifié explicite et retour au Bureau. **L'utilisateur n'a pas encore fourni de capture de cette nouvelle page après mise à jour.**
- Contrats `telemetry.ts` et `journal.ts` purement frontend/proposition, pas une API Bridge réelle ; contrôle offline `control-status.ts`. Terminal UI désactivé.
- Démo `0.0.1`, `bundle.active=false`. Les PR #18–20 ont prouvé un **NSIS non signé expérimental** compilé, installé puis désinstallé en GitHub Actions Windows (HKCU), avec fenêtre et WebView2 observés. **Aucun vrai installateur publiable, aucune signature, aucun portable distribué**.
- Mises à jour : page Paramètres et modèle offline, **pas de vrai updater**, signatures, endpoint, publication ni auto-restart ; gates release délibérément bloquants (#15).
- **Icône 48 px active** ; logo officiel 512×512 SHA-256 `d353f8a07d908dd43d6db9e169c913e8e6de5ef0509eab9369c373b690b01c2d`, pack HD préparé dans une conversation précédente mais non intégré dans le dépôt. PR #24 a uniquement ajouté un **validateur de candidats**. Ne jamais inventer une source HD depuis l'icône 48 px.
- Archive React V1.6.2 auditée statiquement, SHA-256 `0d305e732d21be4771b09dbb6ca70ad795d47139877a431d0a977801af130cef` ; pas migrée en bloc ; **ne pas reprendre le PolicyEngine démo ni les permissions simulées**.

## METHODES DE TRAVAIL NON NEGOCIABLES
- Confirmer le dépôt avant **chaque écriture** ; travailler sur **branche dédiée, un sujet par PR** ; respecter modules `app → features → contracts/shared`, aucun import entre features privées, pas de fichiers fourre-tout ni dépendance sans justification.
- CI sur HEAD exact : `npm run check` / frontend Windows Ubuntu / architecture, Rust Windows `cargo check --locked` ; NSIS smoke si le workflow s'est déclenché. Pas de fusion avant **tous** les checks exigés en succès. Si échec, **corriger réellement** ; si en cours, **attendre et vérifier**. Squash avec contrôle SHA/mergeable, puis contrôler le nouveau `main` et sa CI post-fusion.
- Gérer échecs, offline, versions inconnues, annulation, replay, secrets et permission fail-closed. `cargo check` et `npm run check` ne prouvent pas que WebView2 affiche bien React ni que le NSIS est commercialisable.
- Mise à jour doc/docstrings/tests/ADR/issue avec preuve précise et date ; ne pas annoncer fonctionnalité terminée uniquement à partir de Figma ou d'un smoke binaire.
- Ne pas toucher à mon PC. Mon clone signalé `E:\Optic-App\Optic-App-Github\Alpha-Optic-APP` avait historiquement `HEAD (no branch)`, un `Cargo.toml` modifié et `src-tauri/gen/` non suivi ; des commandes `git stash` ont été proposées, **état final non confirmé**. Si je demande un essai, commence par le statut Git, sauvegarde au besoin, **jamais `reset --hard`/`clean -fd` sans consentement** ; ensuite guide-moi pas à pas. Rust 1.90 MSVC, Visual Studio 2026 / Windows SDK présents, Node 22.
- Le Bridge Windows V1 a historiquement des blockers NO-GO ; aucune preuve Desktop ne lève ces blockers. Ne pas y écrire.

## PRIORITES APRES VERIFICATION
1. Me proposer un test visuel simple **seulement si besoin**, pour la nouvelle Supervision #25 à 1440×900 / 1280×800 et explorer replié/déplié ; sinon travailler sur GitHub.
2. Continuer des **petites PR ciblées** : onboarding first-run offline testable (#13), amélioration UX accessible, intégration contrôlée de l'icône 512px si vraie source disponible, contrôle visuel de fenêtres et états de thème. Ne pas mêler cela au vrai Bridge.
3. Pour installation / updates : distinguer release signée du smoke NSIS, WebView2 absent/offline, Authenticode, updater Tauri signatures et protections anti-downgrade/rollback ; laisser la publication NO-GO sans preuves.
4. Tenir le `HANDOFF.md` canonique et les docs à jour à la fin, donner un état SHA/PR/CI honnête.

Je te délègue la suite sur **Optic Desktop uniquement**. Agis de manière rigoureuse, sûre, professionnelle et autonome, sans inventer d'actions ou de validations.
