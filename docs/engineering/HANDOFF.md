# Optic Desktop — passation canonique (27 octobre 2026)

> Vérification GitHub du 27 octobre 2026. Cette page décrit l'état observé, non une autorisation de distribuer l'application. **Actualiser les SHA, PR, CI et issues à chaque reprise.**

## Périmètre et garde-fous

- **Seul dépôt modifiable :** `ELITEAYOTO/Alpha-Optic-APP` (branche `main`).
- `ELITEAYOTO/Optic-AI-Bridge-` est développé par une autre IA : **lecture seule, jamais de branche, PR, issue, commit, fusion ou workflow dans ce dépôt** pendant une tâche Desktop.
- REL est également hors périmètre.
- Aucun accès au PC utilisateur, installation, test physique ou commande locale sans accord spécifique. La CI GitHub s'exécute exclusivement sur runners hébergés.
- Produit **Optic**, moteur **Optic AI Bridge**, jamais « Lab ».
- Bridge seul décide des permissions, sessions et effets sensibles. Demande ≠ permission effective ; demande d'arrêt ≠ terminaison native prouvée ; simulation/offline ≠ connexion authentifiée.
- Windows-first ; ne pas représenter le prototype comme une V1 distribuable ni comme un Bridge connecté.

## État GitHub constaté lors de la reprise

- Dernier commit renvoyé par la recherche de commits : `c5c89006d4041362dd4e791675af5c504be6d25c` — `feat: honest offline supervision UX (#25)`, daté du 24/10/2026.
- PR #25 fusionnée via ce commit ; écran de supervision offline compact, suppression de la fausse commande `$ optic events --follow`, retour Bureau, états clairement « non connecté / flux indisponible / historique inaccessible ».
- PR #24 fusionnée via `89ecfc12a4c53bb12c59eb95306d68805f3c59e7` : validateur du candidat logo officiel 512px/ICO multi-tailles **sans remplacer les assets actuels**.
- PR #22 fusionnée via `3c47da1580fd260e91723fcdc20b9c2fe75f0de7` : icône native Optic 48px, barre Windows sombre, décorations natives conservées.
- PR #21 fusionnée via `b0314b0f0181ed9bd427fea31507b28de49f2763` : explorateur rétractable, focus/hover.
- Recherche des PR ouvertes lors de cette reprise : aucune.
- Le détail des vérifications CI de `main` **n'a pas été revérifié pour cette nouvelle passation** : ne pas extrapoler les anciens 4/4.
- Les captures Windows du 24/10 montrent bien le logo, le titre sombre et le rail repliable ; **elles précèdent le rendu réel de la nouvelle Supervision #25**, qui reste donc à vérifier visuellement sur Windows.

## Produit/architecture actuelle

- Tauri 2, hôte Rust minimal, React 19 / TypeScript / Vite ; `package-lock.json`, Cargo verrouillé.
- Prototype UI D sombre **Carbone et corail**, déclinaison claire Lin/grenat, source Figma : https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=320-130
- Navigation Bureau, Projets, Sessions, Autorisations, Supervision, Terminal, Connexions, Paramètres.
- Supervision = lecture seule, offline explicite ; terminal développeur = fonctionnalité distincte, **non interactive tant qu'aucun contrat sécurisé n'est validé**.
- Contrats statiques offline d'états et de journal ; thèmes tiers déclaratifs sans JS/CSS arbitraire.
- Aucun IPC authentifié réel, aucune supervision live, aucune exécution shell, aucun updater actif. `bundle.active=false` sur la configuration normale.
- NSIS CI expérimental : construction, installation/désinstallation isolées et signal fenêtre + enfant WebView2 sur runner Windows. **Cela ne prouve ni rendu React visuel, ni signature, ni disponibilité publique**.
- La source originale React V1.6.2 a fait l'objet d'un audit statique, pas d'une migration complète : voir `docs/engineering/V162_SOURCE_AUDIT.md`.

## Méthode non négociable pour le prochain agent

1. Vérifier d'abord dépôt, `main` exact, PR, issues et CI récentes ; lire `AGENTS.md`, `README.md`, ce fichier, `docs/engineering/WORKFLOW.md`, `docs/architecture/MODULE_BOUNDARIES.md`, `docs/security/SECURITY_MODEL.md`, `docs/design/UI_D.md` et ADR pertinente.
2. Une responsabilité par **branche isolée et petite PR**. Aucune écriture directe sur `main`. Pas de dépendance nouvelle sans étude et justification.
3. Architecture `app -> features -> contracts/shared`; composition dans `src/app`, jamais d'import d'une feature sœur ni de logique de privilèges dans React.
4. Ajouter les tests négatifs et positifs : formats/version IPC, erreurs, états offline, accessibilité, focus, annulation, bornes et nettoyage selon le changement.
5. CI : `npm ci`, `npm run check`, Rust Windows `cargo check --locked --manifest-path src-tauri/Cargo.toml`, jobs GitHub Windows/Ubuntu, NSIS si pertinent. **Valider sur le HEAD exact de la PR**, fusion uniquement après contrôles requis verts, puis CI de `main`.
6. Pour les modifications visuelles : comparer Figma, vérifier 1440×900 et 1280×800, navigation clavier, contraste, reduced motion, absence de scroll non souhaité. Ne pas prétendre à un test utilisateur sans nouvelles captures.
7. Documenter les besoins futurs de Bridge **uniquement dans Desktop** sous forme de contrats/propositions.
8. À la fin, actualiser cette passation avec les vérifications factuelles, SHA, PR, CI et limites ; éviter plusieurs fichiers de handoff concurrents.

## Priorités après la PR #25

1. **Revue utilisateur Windows du rendu Supervision #25**, après mise à jour du clone local en préservant le stash de `Cargo.toml` et `src-tauri/gen/` tant qu'il n'a pas été explicitement vérifié.
2. **Issue #23 :** intégrer le vrai candidat logo officiel 512px haute définition *seulement après accès à la source exacte vérifiée* (SHA-256 `d353f8a07d908dd43d6db9e169c913e8e6de5ef0509eab9369c373b690b01c2d`), tests de structure puis rendu Windows; ne pas agrandir le 48px.
3. **Issue #3 :** poursuivre la migration sélective de V1.6.2 vers les modules UI D, conserver la direction Figma et éviter les faux états live.
4. **Issue #4 :** préparer le contrat IPC Desktop↔Bridge (version, identité, authentification, flux d'événements, curseur, reconnect, révocation, nettoyage), sans toucher au moteur.
5. **Issues #12, #13, #15 :** distribution Windows signée, premier démarrage Figma, mises à jour signées avec limites de confiance claires. Aucune release distribuable tant que les gates ne sont pas prouvées.

## Documents de référence

- `AGENTS.md` ; `docs/engineering/WORKFLOW.md` ; `docs/design/UI_D.md`
- `docs/engineering/ICON_ASSETS.md` ; `docs/design/NATIVE_WINDOW_CHROME.md`
- `docs/architecture/OBSERVABILITY_UI_CONTRACT.md` ; `docs/architecture/MODULE_BOUNDARIES.md`
- `docs/security/SECURITY_MODEL.md` ; `docs/engineering/WINDOWS_DISTRIBUTION.md`
- `docs/engineering/V162_SOURCE_AUDIT.md`

Cette passation remplace les instantanés de commits antérieurs; conserver les documents thématiques pour les détails techniques.
