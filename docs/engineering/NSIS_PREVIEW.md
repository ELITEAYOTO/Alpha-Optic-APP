# Optic Preview — candidat d'installation Windows (NON distribué)

Statut au 27 octobre 2026 : **profil expérimental et non signé**, destiné à la vérification technique sur runner GitHub hébergé. **Ce n'est pas un installeur validé pour les PC de l'utilisateur.**

## Pourquoi cette variante existe

L'utilisateur change souvent d'ordinateur Windows. Une vraie installation par double-clic évitera à terme d'installer les outils de développement (Node, Rust, Visual Studio). La première étape est un **profil NSIS indépendant** de l'application de démonstration.

- Source : `src-tauri/tauri.conf.json` = prototype normal, `bundle.active=false`.
- Extension : `src-tauri/tauri.nsis-preview.conf.json` = `Optic Preview`, identifiant distinct `dev.optic.desktop.preview`, NSIS `currentUser` français/anglais.
- WebView2 : `downloadBootstrapper` **nécessite Internet lorsque le runtime doit être installé** ; ne pas annoncer un installateur entièrement autonome/offline.
- `bundle.windows.allowDowngrades=false` : un installateur NSIS **plus ancien** doit être refusé en mode silencieux/passif/mise à jour lorsqu'une version supérieure est déjà installée. D'après la documentation Tauri, cela n'empêche pas une personne de désinstaller manuellement puis d'installer une version antérieure : ce n'est **pas** une protection de données anti-rollback ni une validation native de deux versions. La CI vérifie le réglage et empêche sa suppression accidentelle. Référence : https://v2.tauri.app/reference/config/#windowsconfig.
- `createUpdaterArtifacts=false` ; aucun plugin updater ou endpoint n'est activé. Le nom/identifiant ne sont **pas définitifs**.
- La configuration de la fenêtre est héritée de la base. Ne pas définir une liste partielle `app.windows` dans la surcouche : Tauri applique JSON Merge Patch et remplacerait la liste entière.

## CI et provenance

Workflow `.github/workflows/windows-nsis-preview.yml` : vérifie le code, fabrique un setup NSIS sur `windows-latest`, exige un nom de fichier exact, contrôle son statut **NotSigned** et son SHA-256. Le script `scripts/windows/test-nsis-preview-lifecycle.ps1` installe ensuite le candidat uniquement sur le runner hébergé, vérifie l'identité, l'enregistrement HKCU, la version, le binaire et l'uninstaller, puis désinstalle proprement. Le rapport temporaire `LIFECYCLE.txt` n'est une preuve que lorsque le job **sur le même SHA** réussit. Artefact temporaire (2 jours) `PRIVATE-UNSIGNED-OPTIC-PREVIEW-...`, jamais GitHub Releases.

Contrôles négatifs `npm run check:nsis-preview` et `tests/nsis-preview.test.mjs` : refusent les changements d'identité inattendus, l'écrasement de la fenêtre, les permissions ou privilèges élargis, les téléchargements WebView2 ignorés, les clés/serveurs d'updater et les actions de publication depuis la CI.

**Preuve limitée :** le protocole Preview installé/désinstallé sur Windows GitHub-hosted n'établit pas le rendu React, la compatibilité Windows 10/11, la réputation SmartScreen, l'antivirus, la restauration après upgrade, ni le fonctionnement hors ligne. **Ne pas annoncer le test réussi avant le résultat CI sur la tête exacte de PR.** Le profil *Smoke Test*, distinct, bénéficie déjà de tests installation/désinstallation et démarrage WebView2 ; leurs résultats ne sont pas automatiquement transférables à Preview.

## Nouveau test de réinstallation propre (CI, validation encore requise)

Le scénario `test-nsis-preview-lifecycle.ps1` est étendu à deux cycles : première installation / désinstallation, puis **réinstallation de la même version `0.0.1` depuis exactement le même setup**, avec seconde désinstallation. À chaque cycle, le test exige l'inscription dans HKCU et l'absence de résidus de l'installation binaire. Entre les deux, il place un fichier de test synthétique, sans secret, sous `%APPDATA%/dev.optic.desktop.preview` (hors du répertoire NSIS `%LOCALAPPDATA%/Optic Preview`), puis vérifie qu'il est inchangé après les désinstallations. Le fichier de test est nettoyé sans supprimer récursivement d'autres données. L'exécution est réservée à un **runner éphémère GitHub-hosted Windows**.

Ce test démontre uniquement que l'installateur n'efface pas ce **fichier factice** sur son runner. Il ne prouve **ni** que les futurs vrais réglages et secrets Optic sont correctement persistés, **ni** une mise à niveau `0.0.1 → 0.0.2`, **ni** une synchronisation entre plusieurs PC. La réussite ne peut être déclarée qu'après vérification de la CI **sur le SHA exact de la PR concernée** ; les signatures et le mécanisme de mise à jour restent inactifs.

## Démarrage natif du binaire installé (contrôle CI supplémentaire)

Le test `test-nsis-preview-gui.ps1` vérifie désormais, pendant la deuxième installation propre et **avant désinstallation**, l'ouverture d'une fenêtre Win32 associée à l'exécutable réellement installé ainsi qu'un processus `msedgewebview2.exe` directement enfant de son PID. Un arrêt borné et la confirmation de fin du processus sont obligatoires avant la désinstallation. Le script refuse toute exécution hors du runner GitHub-hosted Windows et hors du répertoire dédié à **Optic Preview** ; il génère `preview-dist/PREVIEW_GUI_LAUNCH.txt` pour distinguer ses preuves de la compilation du setup.

Ce lot ne démontre ni le rendu React réel, ni la fidélité Figma, ni la compatibilité Windows 10/11 en machine vierge, ni un WebView2 absent, ni une mise à niveau signée. **Les résultats sont seulement confirmés lorsque le workflow passe au vert sur le SHA exact.**

## Préflight de sécurité avant une future installation utilisateur

`scripts/windows/verify-optic-installer.ps1` est un vérificateur PowerShell **en lecture seule** ; il ne télécharge rien, ne lance aucun setup et ne modifie pas les certificats. Il exige trois entrées issues d'une **release officielle vérifiée indépendamment** : le chemin du setup NSIS, l'empreinte SHA-256 exacte (64 caractères hexadécimaux) et l'empreinte du certificat Authenticode de l'éditeur approuvé (40 caractères hexadécimaux). Le script refuse un fichier de taille/nom inattendu, un raccourci/reparse point, un hash différent, une signature absente ou non valide et un éditeur non conforme au certificat attendu. Un contrôle réussi prouve seulement la provenance cryptographique attendue de **ces octets**, pas la sécurité absolue du programme.

La CI Preview exécute **deux contrôles négatifs** sur le setup volontairement non signé : elle exige le rejet d'un faux hash, puis du hash correct faute de signature Authenticode. Ne **jamais** enregistrer le faux thumbprint utilisé dans ce test comme identité éditeur et ne jamais recommander de désactiver SmartScreen. Aucune clé de signature/identité réelle n'est actuellement disponible ; ne pas lancer ce script sur un PC utilisateur sans des valeurs officielles attestées. La clé de signature de Tauri Updater 2 reste un mécanisme **distinct** de la signature Windows.

## Nouveau smoke natif entre deux versions (runner Windows uniquement)

Le workflow autonome `.github/workflows/windows-nsis-upgrade-smoke.yml` fabrique deux installateurs **non signés de test**, à partir du même code source Optic Preview : `0.0.1` et une surcouche **strictement limitée à la version** `0.0.2` (`src-tauri/tauri.nsis-upgrade-test.conf.json`). Il exécute ensuite `scripts/windows/test-nsis-preview-upgrade.ps1` **uniquement sur un runner GitHub Windows hébergé**, jamais sur un ordinateur personnel :

- Installation de `0.0.1` dans HKCU, création d'une sonde AppData factice non sensible.
- Installation silencieuse de `0.0.2` par-dessus `0.0.1`, contrôle du numéro de version Windows et de la sonde.
- Tentative de rétrogradation silencieuse en `0.0.1` ; le test échoue si la version `0.0.2` n'est pas conservée.
- Désinstallation contrôlée de la version restante, vérification HKCU, conservation de la sonde, puis retrait limité à cette sonde (aucune suppression récursive).
- Rapport **texte uniquement** `UPGRADE.txt`, conservé quelques jours ; aucun des deux setups n'est publié comme artefact de téléchargement.

**Attention :** si le workflow échoue, ne pas inférer que l'upgrade fonctionne et corriger sur PR séparée après examen du log. Même une réussite prouverait seulement le remplacement de deux paquets au **même code source** avec métadonnées de version distinctes. Elle **ne** valide **pas** les migrations de vrais paramètres, une montée de version du moteur Rust, un updater Tauri signé, Windows 10/11 propres, les interfaces React ou une distribution utilisable sur PC.

## Variante CI avec WebView2 intégré hors ligne — sans outils développeur sur le PC cible

Le profil historique `tauri.nsis-preview.conf.json` reste un **petit setup** avec `downloadBootstrapper` (Internet nécessaire **uniquement si** WebView2 doit être installé). Une **nouvelle surcouche indépendante et strictement limitée à WebView2**, `src-tauri/tauri.nsis-offline-test.conf.json`, passe en `offlineInstaller` : le bundler Tauri télécharge/intègre, **au moment de construire l'exécutable sur le runner**, l'installateur Evergreen WebView2 officiel. Ce package NSIS plus volumineux peut ensuite installer WebView2 si absent **sans réseau au moment de l'installation**. L'augmentation attendue est d'environ **127 Mo** selon la [documentation Tauri](https://v2.tauri.app/distribute/windows-installer/#webview2-installation-options). Ce n'est **pas** un WebView2 `fixedRuntime` figé à une version.

Le workflow isolé `.github/workflows/windows-nsis-preview-offline.yml` fabrique cette version expérimentale **non signée** sur GitHub-hosted Windows, exige un setup de plus de 50 Mio et un statut `NotSigned`, puis réutilise le test d'installation, de lancement de fenêtre + WebView2, de réinstallation et de désinstallation. **Il ne publie aucun .exe** ; seules les preuves texte sont conservées. La CI ne valide **pas** encore le cas « WebView2 vraiment absent et aucune connexion Internet » sur une machine vierge ; le mode déclaré et la taille ne sont pas suffisants pour en conclure la compatibilité réelle.

**Rust, rustup, cargo, Node.js/npm, Visual Studio et MSVC Build Tools restent uniquement des outils de fabrication sur GitHub ou poste de développeur : ils ne sont pas des prérequis du PC qui installe Optic.** Le code Rust natif et le frontend React sont compilés dans les binaires ; le runtime Windows/WebView2 est traité par NSIS. **Optic AI Bridge n'est pas contenu dans cette Preview** et n'est pas démarré/administré par le setup : ne pas présenter une fenêtre Desktop comme un moteur MCP opérationnel. L'installateur de test est encore **NO-GO sur le PC utilisateur** jusqu'au processus de signature Authenticode, à la source des icônes HD et aux tests Windows 10/11 signés indépendants.

## Conditions avant un test utilisateur autorisé

1. Faire réussir les checks source et Windows NSIS Preview (incluant la réinstallation propre) sur le même SHA, relire les artefacts et la provenance.
2. Confirmer les résultats d'installation/désinstallation Preview du runner (identité, HKCU, chemin, nettoyage contrôlé), puis ajouter séparément les tests WebView2 propre à Preview, upgrade/réinstallation et conservation de données.
3. Confirmer une image/logo haute résolution authentique, les textes du programme et l'assistant first-run en français.
4. Définir la politique de signature Authenticode Windows et de distribution. Une version non signée peut susciter SmartScreen : **ne pas conseiller de contourner les protections**.
5. Faire vérifier un installateur approprié sur Windows 10/11 x64 sans outils de développement, avec consentement exprès avant tout test sur un PC personnel.

## Mises à jour futures

Deux signatures distinctes sont nécessaires pour un circuit professionnel : signature du bundle de mise à jour **Tauri Updater 2** (clé publique intégrée, clé privée hors GitHub), et signature Authenticode du setup Windows. Une URL HTTPS et un manifeste réels, avec version/canal cohérents, restent à préparer. La section Paramètres → Mises à jour est aujourd'hui une interface *offline*. Ne pas activer un download + exec sans signature cryptographique. Ne pas inclure Optic AI Bridge dans cette mise à jour : il est développé séparément et reste en lecture seule.

Voir : [plan de distribution](WINDOWS_DISTRIBUTION.md), [ADR-0007](../decisions/ADR-0007-SIGNED-UPDATES.md), [#28](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/28), [#12](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/12) et [#15](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/15).
