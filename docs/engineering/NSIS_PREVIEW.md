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

## Conditions avant un test utilisateur autorisé

1. Faire réussir les checks source et Windows NSIS Preview (incluant la réinstallation propre) sur le même SHA, relire les artefacts et la provenance.
2. Confirmer les résultats d'installation/désinstallation Preview du runner (identité, HKCU, chemin, nettoyage contrôlé), puis ajouter séparément les tests WebView2 propre à Preview, upgrade/réinstallation et conservation de données.
3. Confirmer une image/logo haute résolution authentique, les textes du programme et l'assistant first-run en français.
4. Définir la politique de signature Authenticode Windows et de distribution. Une version non signée peut susciter SmartScreen : **ne pas conseiller de contourner les protections**.
5. Faire vérifier un installateur approprié sur Windows 10/11 x64 sans outils de développement, avec consentement exprès avant tout test sur un PC personnel.

## Mises à jour futures

Deux signatures distinctes sont nécessaires pour un circuit professionnel : signature du bundle de mise à jour **Tauri Updater 2** (clé publique intégrée, clé privée hors GitHub), et signature Authenticode du setup Windows. Une URL HTTPS et un manifeste réels, avec version/canal cohérents, restent à préparer. La section Paramètres → Mises à jour est aujourd'hui une interface *offline*. Ne pas activer un download + exec sans signature cryptographique. Ne pas inclure Optic AI Bridge dans cette mise à jour : il est développé séparément et reste en lecture seule.

Voir : [plan de distribution](WINDOWS_DISTRIBUTION.md), [ADR-0007](../decisions/ADR-0007-SIGNED-UPDATES.md), [#28](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/28), [#12](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/12) et [#15](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/15).
