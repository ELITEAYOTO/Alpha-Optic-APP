# OPTIC DESKTOP — passation canonique Windows (état vérifié le 27 octobre 2026)

**Dépôt autorisé :** https://github.com/ELITEAYOTO/Alpha-Optic-APP  
**main GitHub confirmé après la PR #33 (27/10/2026) :** `ca8f987b2f2cccdba3e5d5de669e21e776755c08`, squash-merge de la [PR #33](https://github.com/ELITEAYOTO/Alpha-Optic-APP/pull/33). **Re-vérifier `main` au début du prochain chat ; cet instantané devient caduc après cette PR documentaire.**  
**Preuves exact-head PR #31, #32, #33 :** Foundation/architecture, Desktop source Windows/Ubuntu/Rust et Windows NSIS Preview **verts sur leurs têtes respectives**. #31 : réinstallation même version + préservation d'une sonde AppData. #32 : démarrage Win32/WebView2 du binaire Preview. #33 : refus contrôlé d'un hash invalide et d'une signature absente. **La recherche d'Actions utilisée ne donne pas les runs `push` de `main` ; ne pas affirmer une CI post-fusion verte.**  
**Statut de distribution :** candidat NSIS privé de CI **non signé, non distribué et NON approuvé pour installation sur le PC utilisateur**. Pas d'updater réel, pas de release, pas de Bridge intégré. **Prochaine lecture : `docs/engineering/PRIVATE_PREVIEW_RELEASE_GATES.md`**, puis `NSIS_PREVIEW.md`.  
**Rappel :** aucune commande/installateur sur le PC utilisateur sans accord spécifique ; GitHub Actions est distinct. L'alerte « Optic prêt à installer » contrôle les futures Releases, et ne doit pas notifier sur des artefacts `PRIVATE-UNSIGNED`.

## 1. Périmètre et autorité — impératifs

- **Écriture autorisée EXCLUSIVEMENT dans `ELITEAYOTO/Alpha-Optic-APP`**, logiciel Windows **Optic**, Tauri 2 + Rust minimal, React 19/TypeScript/Vite. Le moteur **Optic AI Bridge** est développé par une autre IA dans https://github.com/ELITEAYOTO/Optic-AI-Bridge- : **lecture seule**, même pour les issues et les workflows. Ne pas toucher non plus à `ELITEAYOTO/REL`.
- La frontière d'autorité **Bridge Rust** reste la seule source de permissions effectives, sessions, révocations et preuves d'arrêt des processus ; Desktop React/Tauri n'est ni un deuxième PolicyEngine ni une autorité. Demande ≠ autorisation accordée ≠ droit effectif ; révocation ≠ terminaison confirmée ; absence de mesure ≠ service arrêté.
- **Aucun accès, commande, installation, test, lecture ni modification sur le PC utilisateur sans autorisation explicite pour l'opération concernée.** Le mandat de travailler dans GitHub ne donne aucun consentement d'exécution locale. Les tests GitHub-hosted Windows sont distincts du PC.
- Ne pas lancer de Codex/Work/autre conversation/tâche/automation à la place de l'utilisateur. Utiliser les **outils GitHub réellement disponibles**, contrôler nom du dépôt avant chaque écriture, rapporter toute limite sans inventer.
- Ne jamais présenter un faux Bridge « connecté », des données d'événement fictives, un serveur MCP opérationnel, un shell interactif ni un updater « prêt ». `bundle.active=false` pour le bootstrap normal ; aucun exécutable final certifié.

## 2. Lecture initiale obligatoire

1. `AGENTS.md`, `README.md`, `docs/engineering/HANDOFF.md`, `docs/engineering/WORKFLOW.md`, `docs/engineering/NEXT_CHAT_PROMPT_OPTIC_DESKTOP_2026-10-27.md`.
2. `docs/architecture/{OVERVIEW,MODULE_BOUNDARIES,CONTRACTS,OBSERVABILITY_UI_CONTRACT,THEMES}.md`, `docs/security/SECURITY_MODEL.md`.
3. `docs/decisions/ADR-0001` à `ADR-0007` (vérifier les fichiers existants), `docs/design/{UI_D,INSTALLATION_SETUP,NATIVE_WINDOW_CHROME}.md`, `docs/engineering/{WINDOWS_DISTRIBUTION,ICON_ASSETS,V162_SOURCE_AUDIT}.md`.
4. Inspecter **vraies sources** de la fonctionnalité avant édition : `src/app/`, `src/features/`, `src/contracts/`, `src-tauri/`, tests, scripts, workflows. Ne jamais se fier au seul texte d'un vieux handoff.

## 3. État réel du produit

**Fonctionnel comme prototype :**
- Application **Optic — démonstration** compilée et **lancée par l'utilisateur sur Windows** après réparation de son installation MSVC ; captures du Bureau 1440 × 900 environ et d'une Supervision explorateur replié. La barre de titre **native sombre**, le logo **Optic** (fenêtre + barre des tâches) et le bouton replier/réafficher explorateur ont été **visuellement observés**. La capture ne constitue pas un test de rendu exhaustif ou multi-DPI.
- `src/app/layout/DesktopShell.tsx/.css` : rail toujours visible, explorateur repliable, états hors ligne et boutons inactifs quand requis. `src/features/overview/` : accueil compact UI D. Navigation Bureau, Projets, Sessions, Autorisations, Supervision, Terminal, Connexions, Paramètres. Plusieurs modules restent **écrans de préparation**.
- PR #25 : `src/features/supervision/ui/SupervisionScreen.tsx/.css` : état hors ligne compact **sans faux `$ optic events --follow`**, indique « source non connectée », « flux authentifié non disponible », « historique non accessible » ; `Retour au bureau` via callback composé dans `src/app/App.tsx`. **Ce nouvel écran n'a pas encore été photographié par l'utilisateur après mise à jour locale.**
- `src/contracts/telemetry.ts` : parseur de proposition d'événements redacts, typés et bornés ; `src/features/supervision/model/journal.ts` : buffer en mémoire max 500 défaut/2000 limite, suivi trous, doublons, changement de source. **Aucun événement du Bridge réel.**
- `src/contracts/control-status.ts` : 5 axes indépendants Bridge/session/permission/révocation/fin native ; offline doit rester inconnu. **Aucun état authentifié live.**
- `src/features/updates/` : interface **Paramètres → Mises à jour** affichant une version et état **non activé** ; aucun plugin updater, téléchargement, endpoint, clé ou installation. `src/features/themes/model/theme-manifest.ts` valide les thèmes déclaratifs offline ; pas de chargement dynamique tiers, aucun script autorisé.
- `src/features/terminal/` : Terminal développeur UI distinct de Supervision, **aucun shell**, ConPTY ou commande arbitraire en service.
- Native `src-tauri/tauri.conf.json` : `productName=Optic`, `version=0.0.1`, identifiant `dev.optic.desktop` **provisoire**, `theme=Dark`, `decorations=true`, `bundle.active=false`. L'icône native actuellement versionnée reprend le logo officiel approuvé **48 px** (PR #22) ; ICO haute définition et signature à finaliser.
- `package.json` et `Cargo.lock` versionnés ; Node >=22.12, frontend React 19/Vite 8, Tauri 2. Tests via `npm ci`, `npm run check`, Rust Windows `cargo check --locked --manifest-path src-tauri/Cargo.toml` et workflows GitHub.

**Non implémenté ou non prouvé :** configuration first-run en véritable UI, projet/dossier sous permissions Rust, liaison IPC authentifiée Desktop↔Bridge, lecture réelle du journal Bridge, terminal natif, marketplace/extensions, MCP externes (Figma, etc.), assistant IA connecté, véritable installateur utilisateur signé/portable, updater, rollback, migration, WebView2 absent, accessibilité exhaustive, visual pixel-perfect UI D, logo 512 intégré, animation startup et titre entièrement custom.

## 4. Progrès PR et preuves — historique condensé

| PR | Changement réel |
| --- | --- |
| #1 / #2 / #5–#7 | architecture modulaire, bootstrap React/Tauri, CSS possédé par module, journal offline, thèmes déclaratifs |
| #8 | handoff documentaire ancien, désormais remplacé par le présent |
| #9 | audit **statique** archive React V1.6.2 originale, **pas migration intégrale** |
| #10 | états de contrôle offline honnêtes, non authentifiés |
| #11 | premier accueil compact UI D et logo React |
| #14 | plan installation NSIS, préflight, versions, design première utilisation |
| #16 / #17 | modèle UX updater **hors ligne**, garde-fous release config (pas updater réel) |
| #18 | premier NSIS **non signé** compilé en GitHub Actions |
| #19 | installation et désinstallation silencieuses Windows GitHub-hosted réussies ; HKCU/versions/fichiers contrôlés |
| #20 | lancement réel de la fenêtre Win32 avec processus WebView2 enfant du PID Optic, fermeture puis désinstallation : réussi **sur runner**, pas preuve de rendu React |
| #21 | bouton explorateur rétractable, hover/focus/reduced-motion |
| #22 | icône native corrigée en logo Optic **48 px**, thème natif sombre, décorations Windows conservées |
| #24 | validateur candidat logo officiel **512 px** (SHA-256 ci-dessous), **pas intégration HD réelle** |
| #25 | Supervision hors ligne compacte et véridique ; faux terminal supprimé, retour au Bureau |

- CI smoke NSIS : `.github/workflows/windows-nsis-smoke.yml`, profil `src-tauri/tauri.nsis-smoke.conf.json`, scripts `scripts/windows/test-nsis-lifecycle.ps1` et `test-webview2-launch.ps1`. Artefact `UNSIGNED-DO-NOT-INSTALL` conservé 2 jours. **Ce build n'est pas une release à faire installer** ; pas de signature Authenticode ou Tauri updater.
- NSIS smoke se lance seulement sur PR internes ciblées ou déclenchement manuel ; `main` a normalement **4 contrôles** source, le smoke supplémentaire est contrôlé sur la **tête de PR exacte** quand déclenché. Après squash, revalider les 4 sur le nouveau `main`.
- Windows utilisateur : les captures confirment lancement, barre sombre, logo de barre tâches, rail/explorateur ; la capture Supervision initiale avec fausse commande motivait #25. **Aucun résultat utilisateur post-#25** à ce jour.

## 5. Provenance design / source originale

- Figma officiel : https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=320-130.
- Direction **UI D Carbone et corail** sombre validée, variante claire **Lin et grenat**. Pas de néons/gradients ou fausse ambiance gaming. Accueil 1440×900 : `349:444`, compacte 1280×800 : `398:1782`, supervision : `352:474`, première ouverture : `391:1138`, installation/configuration : `407:1659` et `407:1676` (460×900/980×900), préparation : `378:1046`. Figma peut afficher des labels historiques « optic-lab » : **ne pas les reprendre**, nom = Optic.
- Archive React antérieure `Optic-Desktop-V1.6.2-Accueil-Compact-Windows.zip`, SHA-256 `0d305e732d21be4771b09dbb6ca70ad795d47139877a431d0a977801af130cef`. Audit en `V162_SOURCE_AUDIT.md`, 71 fichiers, frontend seulement, démos/localStorage. **Ne pas importer monolithiquement CSS 96 Ko ni permissions simulées**.
- PNG logo utilisateur **512×512 RGBA** SHA-256 `d353f8a07d908dd43d6db9e169c913e8e6de5ef0509eab9369c373b690b01c2d`. Source et pack HD préparés dans **une conversation antérieure**, pas encore versionnés dans Desktop. Un nouveau chat ne doit **pas inventer de chemin sandbox** : retrouver via les outils fichiers, demande d'upload si requis, ou source officielle auditée ; **pas d'upscale depuis 48 px**.
- Source du 48px déjà versionnée : `public/assets/optic-logo-48.png`. `npm run check:icon-candidate -- SOURCE_PNG ICON_DIR` vérifie un candidat HD en lecture seule ; ne remplace pas l'icône active.
- Animations de démarrage : intention future seulement ; brèves, sans progrès/connexion fictifs, aucune attente artificielle ; `prefers-reduced-motion`. Barre native Dark préférable en attendant une étude complète Windows Snap/Alt+Tab/DPI/accès clavier d'une fenêtre non décorée.

## 6. Environnement et tests utilisateur — NE PAS ENVAHIR LE PC

- Utilisateur sous **Windows 10**, dossier de clone rapporté : `E:\Optic-App\Optic-App-Github\Alpha-Optic-APP`. Il a explicitement testé les commandes qu'on lui a fournies ; cela **n'autorise pas** un agent à exécuter maintenant ses propres commandes sur son PC.
- Pour compiler, une version **Rust 1.90.0 MSVC** a été installée pour la session PowerShell (`$env:RUSTUP_TOOLCHAIN = "1.90.0-x86_64-pc-windows-msvc"`). MSVC Visual Studio Community 2026 `14.51.36231` avait `excpt.h` et `vcruntime.h` absents ; l'utilisateur a complété la charge **Développement Desktop en C++** dans Installer. L'application a alors compilé et démarré. SDK Windows `10.0.26100.0`, Node 22.15.1, npm 11.3.0, tests frontend réussis.
- Historique `git status` local montrait `HEAD (no branch)`, `M src-tauri/Cargo.toml` (ajout `features=[]` sans effet) et `?? src-tauri/gen/` (généré). Il avait reçu des **commandes de stash ciblé, switch main et pull --ff-only**, mais **n'a pas fourni de preuve finale de l'état Git local**. Ne pas supposer que le stash existe ou que l'arbre est propre ; demander/recevoir `git status -sb` et `git log -1 --oneline` **avant des instructions mutantes**. Ne jamais effacer `src-tauri/gen/` sans inspection, ni `git reset --hard` / `git clean -fd`.
- Prochain test local, **sur action volontaire de l'utilisateur** : fermer le prototype, obtenir un statut Git propre ou sauvegarder changements, `git switch main`, `git pull --ff-only origin main`, vérifier SHA de `main` courant, `npm run check`, `npm run tauri dev` ; photographier **Supervision nouvelle version #25**, accueil replié/déplié, comportements aux résolutions 1440×900 et 1280×800, clavier, titre et icônes. Aucune installation de paquet NSIS non signé.
- L'utilisateur veut être guidé **pas à pas** avec lignes PowerShell exactes pour toute installation/MAJ et diagnostics réels ; pas d'opération autonome locale, pas de supposition que son OS ou clone ont changé.

## 7. Issues ouvertes vérifiées

- **#3** migration fidélité UI D depuis la véritable source V1.6.2 ; ne jamais prendre ses simulations pour des droits.
- **#4** futur contrat authentifié Rust Desktop↔Bridge, observabilité, versioning, cycle de vie ; **ne pas changer le Bridge**.
- **#12** installateur professionnel Windows NSIS, portable distinct, WebView2, dépendances et versions, signature ; smoke expérimental réussi, distribution **NO-GO**.
- **#13** assistant first-run UI D (Figma `407:1659`, `407:1676`, `391:1138`), états offline et préflight ; choisir portable/installé **avant** de lancer React, pas fausse option a posteriori.
- **#15** updater **signé** sur stable/preview, consentement, canal, erreurs et anti-downgrade ; pas de plugin ou endpoint réel.
- **#23** chrome Windows premium, ICO haute résolution, animation de lancement, DPI/Alt+Tab/keyboard/Snap, ne pas supprimer décorations sans validation.

## 7 bis. Nouvelle étape NSIS Preview — PR #29 (27 octobre 2026)

- **Issue #28** : besoin explicite de l'utilisateur de pouvoir installer Optic rapidement sur plusieurs PC Windows, puis de recevoir des mises à jour signées. **Ne pas confondre réinstallation simple et synchronisation automatique des réglages entre PC**, non implémentée.
- Branche de développement fusionnée : `feat/nsis-private-preview-profile-2026-10-27`. Fichier `src-tauri/tauri.nsis-preview.conf.json`, identité isolée **Optic Preview**, paquet NSIS `currentUser` FR/EN, WebView2 `downloadBootstrapper`, **updater désactivé** ; configuration normale toujours `bundle.active=false`.
- Workflow `.github/workflows/windows-nsis-preview.yml` : Windows GitHub-hosted, compilation NSIS, statut `NotSigned`, SHA-256, artefact court de 2 jours **PRIVATE-UNSIGNED-OPTIC-PREVIEW**, **pas de GitHub Release**.
- Nouveau protocole `scripts/windows/test-nsis-preview-lifecycle.ps1` limité à GitHub-hosted : installation, HKCU, version, binaire, désinstallation/cleanup sans suppression arbitraire. Succès natif **sur SHA exact #29** ; pas de test PC utilisateur.
- `scripts/check-nsis-preview.mjs`, `tests/nsis-preview.test.mjs` et `npm run check:nsis-preview` interdisent updater/secrets, publication, privilèges inattendus, écrasement `app.windows` et omission du test natif.
- **Non acquis :** certificate Authenticode, signing key updater Tauri, HTTPS endpoint, version stable, icône HD intégrée, portable, Windows 10/11 réel propre, upgrade/rollback, WebView2 absent, visuel React effectif, onboarding first-run et Bridge live. Ne pas conseiller d'installer l'artefact non signé sur un PC utilisateur.
- Prochain lot recommandé : planifier les vérifications d'upgrade/réinstallation Preview et conservation des données sur runner avant d'activer un pipeline signé ; coordination release/Bridge seulement après contrats et approbation.

## 7 ter. Conditions de première Preview privée après #31–#33

- **[#31](https://github.com/ELITEAYOTO/Alpha-Optic-APP/pull/31)** `5dafd45246ccd2fdf88bc0dfd3b49f5eaaf77f06` : NSIS Preview installé, désinstallé, réinstallé dans la **même version** sur GitHub-hosted Windows ; sonde de test AppData conservée. **Pas** de vraie migration des réglages ni synchronisation multi-PC.
- **[#32](https://github.com/ELITEAYOTO/Alpha-Optic-APP/pull/32)** `310c98afd2432321099d82d42c98f2cd66a44e93` : **binaire Preview installé** lancé, fenêtre Win32 et processus enfant WebView2 observés, fermé avant désinstallation. **Pas** de preuve visuelle React/Figma ou Windows 10 vierge.
- **[#33](https://github.com/ELITEAYOTO/Alpha-Optic-APP/pull/33)** `ca8f987b2f2cccdba3e5d5de669e21e776755c08` : `scripts/windows/verify-optic-installer.ps1` vérifie SHA-256 + signature Authenticode valide + thumbprint éditeur connu, **en lecture seule**. CI refuse le mauvais SHA ainsi que l'unsigned CI. Aucun vrai certificat de publication n'est encore fourni.
- La **première installation privée signée** peut être approuvée **avant** l'activation des mises à jour automatiques Tauri, si publication/provenance, éditeur/certificat, tests Windows 10/11, WebView2 et retour arrière sont établis. Lire la checklist `PRIVATE_PREVIEW_RELEASE_GATES.md`. Ne pas demander au propriétaire d'installer des artefacts `PRIVATE-UNSIGNED` ou de contourner SmartScreen.
- Saisie volontaire nécessaire ultérieurement : décision d'identité/éditeur et de solution de signature Windows. **Ne pas inventer de certificat, domaine, clé ou version.** Pas de Bridge installé/contrôlé.

## 8. Suite priorisée et méthode autonome

1. **Tout de suite :** recontrôler GitHub, tests, PR et docs de cette passation ; corriger toute incohérence avant développement.
2. **Sécuriser des preuves visuelles** (quand utilisateur volontaire) de #25, mesure absence de scroll et focus aux deux résolutions ; conserver captures sans secrets. Ne pas confondre validation de code et qualité visuelle.
3. **Un petit lot à la fois :** par exemple modèle purement offline/testé de first-run (#13), ou amélioration accessible de Supervision/accueil, ou réellement intégrer la source icon HD si ses octets vérifiés sont accessibles, ou qualité du champ statut; ne pas mélanger Figma, setup natif, Bridge et mises à jour dans une même PR.
4. **Packaging :** le NSIS Preview expérimental est déjà construit et installé/désinstallé en CI, mais aucun installeur utilisateur n'est prêt. Poursuivre variante portable distincte, signatures Authenticode et updater, gestion WebView2 absent/offline, upgrade/downgrade/rollback, versions distinctes application/Bridge/protocole, jamais installation automatique d'un Bridge non autorisé. Aucun Node/Rust chez l'utilisateur final attendu.
5. Contrat Bridge : préparer une **proposition** dans le dépôt Desktop seulement ; tester identité, version, canaux, changements d'état, révocation, fin native avant de rendre de vraies commandes actives. Pas d'inférence de permission côté React.

**Discipline :** confirmer `repository_full_name` sur chaque écriture ; branche isolée issue du SHA `main` vérifié ; petite PR diff/test/documentation ; CI exact-head `architecture`, `frontend (windows-latest)`, `frontend (ubuntu-latest)`, `windows-rust` + NSIS smoke si déclenché ; aucun merge pendant échec/en cours ; squash avec SHA attendu ; `main` postmerge 4/4 ; issues et ce handoff synchronisés ; annonce exacte des preuves et non-preuves. Ne pas entretenir deux documents de passation contradictoires : celui-ci fait foi, le fichier `NEXT_CHAT_PROMPT...` est une instruction à copier, pas une source historique autonome.
