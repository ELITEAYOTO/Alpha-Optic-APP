# Optic Preview — candidat d'installation Windows (NON distribué)

Statut au 27 octobre 2026 : **profil expérimental et non signé**, destiné à la vérification technique sur runner GitHub hébergé. **Ce n'est pas un installeur validé pour les PC de l'utilisateur.**

## Pourquoi cette variante existe

L'utilisateur change souvent d'ordinateur Windows. Une vraie installation par double-clic évitera à terme d'installer les outils de développement (Node, Rust, Visual Studio). La première étape est un **profil NSIS indépendant** de l'application de démonstration.

- Source : `src-tauri/tauri.conf.json` = prototype normal, `bundle.active=false`.
- Extension : `src-tauri/tauri.nsis-preview.conf.json` = `Optic Preview`, identifiant distinct `dev.optic.desktop.preview`, NSIS `currentUser` français/anglais.
- WebView2 : `downloadBootstrapper` **nécessite Internet lorsque le runtime doit être installé** ; ne pas annoncer un installateur entièrement autonome/offline.
- `createUpdaterArtifacts=false` ; aucun plugin updater ou endpoint n'est activé. Le nom/identifiant ne sont **pas définitifs**.
- La configuration de la fenêtre est héritée de la base. Ne pas définir une liste partielle `app.windows` dans la surcouche : Tauri applique JSON Merge Patch et remplacerait la liste entière.

## CI et provenance

Workflow `.github/workflows/windows-nsis-preview.yml` : vérifie le code, fabrique un setup NSIS sur `windows-latest`, exige un nom de fichier exact, contrôle son statut **NotSigned** et son SHA-256. Artefact temporaire (2 jours) `PRIVATE-UNSIGNED-OPTIC-PREVIEW-...`, jamais GitHub Releases.

Contrôles négatifs `npm run check:nsis-preview` et `tests/nsis-preview.test.mjs` : refusent les changements d'identité inattendus, l'écrasement de la fenêtre, les permissions ou privilèges élargis, les téléchargements WebView2 ignorés, les clés/serveurs d'updater et les actions de publication depuis la CI.

**Preuve limitée :** réussir une compilation et obtenir le SHA-256 ne prouve ni installation/désinstallation de ce profil Preview, ni rendu React, ni compatibilité Windows 10/11, ni réputation SmartScreen, ni antivirus ni support offline. Le profil *Smoke Test*, distinct, bénéficie déjà de tests installation/désinstallation et démarrage WebView2 ; leurs résultats ne sont pas automatiquement transférables à Preview.

## Conditions avant un test utilisateur autorisé

1. Faire réussir les checks source et Windows NSIS Preview sur le même SHA, relire les artefacts et la provenance.
2. Tester spécifiquement une installation/désinstallation Preview sur un runner Windows isolé (identité, registre HKCU, chemin, WebView2, nettoyage sans perte de données) puis upgrade/réinstallation.
3. Confirmer une image/logo haute résolution authentique, les textes du programme et l'assistant first-run en français.
4. Définir la politique de signature Authenticode Windows et de distribution. Une version non signée peut susciter SmartScreen : **ne pas conseiller de contourner les protections**.
5. Faire vérifier un installateur approprié sur Windows 10/11 x64 sans outils de développement, avec consentement exprès avant tout test sur un PC personnel.

## Mises à jour futures

Deux signatures distinctes sont nécessaires pour un circuit professionnel : signature du bundle de mise à jour **Tauri Updater 2** (clé publique intégrée, clé privée hors GitHub), et signature Authenticode du setup Windows. Une URL HTTPS et un manifeste réels, avec version/canal cohérents, restent à préparer. La section Paramètres → Mises à jour est aujourd'hui une interface *offline*. Ne pas activer un download + exec sans signature cryptographique. Ne pas inclure Optic AI Bridge dans cette mise à jour : il est développé séparément et reste en lecture seule.

Voir : [plan de distribution](WINDOWS_DISTRIBUTION.md), [ADR-0007](../decisions/ADR-0007-SIGNED-UPDATES.md), [#28](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/28), [#12](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/12) et [#15](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/15).
