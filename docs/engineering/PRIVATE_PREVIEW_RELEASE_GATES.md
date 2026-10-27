# Optic — conditions de la première Preview privée installable sur Windows

**État au 27 octobre 2026 : NON AUTORISÉE À L'INSTALLATION SUR PC UTILISATEUR.** Cette page est la liste de décision opérationnelle, pas une release.

## Principe : premier essai distinct de l'updater automatique

L'objectif est un **premier test manuel et réversible d'Optic Desktop** sur un Windows 10/11 x64, sans installation de Node, Rust ou Visual Studio. Ce premier test peut précéder l'activation de **Tauri Updater 2**, à condition de livrer un installeur manuel de provenance approuvée et de ne pas promettre des mises à jour automatiques. Les plugins, le Bridge et le terminal natif restent désactivés / hors périmètre. Une application Desktop qui s'ouvre ne prouve aucune connexion à Optic AI Bridge.

## Preuves déjà présentes (mais limitées)

- NSIS per-user **Optic Preview 0.0.1**, FR/EN, WebView2 `downloadBootstrapper` ; profil isolé `src-tauri/tauri.nsis-preview.conf.json`, config normale `bundle.active=false`.
- PR [#29](https://github.com/ELITEAYOTO/Alpha-Optic-APP/pull/29) : création du setup **unsigned** et installation/désinstallation sur runner Windows hébergé.
- PR [#31](https://github.com/ELITEAYOTO/Alpha-Optic-APP/pull/31) : deux cycles installation → désinstallation / réinstallation **de la même version**. Préservation d'une **sonde synthétique AppData**, pas de réels paramètres Optic.
- PR [#32](https://github.com/ELITEAYOTO/Alpha-Optic-APP/pull/32) : lancement du **binaire Preview installé** avec fenêtre Win32 + processus WebView2 enfant de son PID, arrêt avant désinstallation ; **pas** de preuve visuelle React.
- PR [#33](https://github.com/ELITEAYOTO/Alpha-Optic-APP/pull/33) : vérificateur en lecture seule du SHA-256 et de la signature Authenticode / empreinte éditeur connue, et tests CI qui **refusent** un faux SHA ou le candidat non signé. Aucune signature réelle créée.
- Tous ces éléments ont été fusionnés **après CI exact-head verte**. Cela ne constitue pas une signature du binaire ni une qualification Windows 10 vierge.

## Nouveau contrôle statique de Preview manuelle (non signé)

La commande `npm run check:manual-preview-config` est désormais **distincte** de `npm run check:release-candidate`, qui continue d'exiger la configuration de l'updater signé. Le nouveau mode exige une identité `Optic Preview` non `dev.*`, une version SemVer non-prototype synchronisée avec Cargo/npm/Tauri, NSIS par utilisateur, WebView2 explicite, `allowDowngrades=false`, et la **désactivation** des artefacts et du plugin Tauri Updater. Son rôle est uniquement de vérifier la **configuration de distribution manuelle** : même un résultat vert ne constitue **aucune preuve de signature Authenticode, d'installabilité sur Windows 10/11, ni de publication**. Ces autres portes de sécurité restent à satisfaire indépendamment.

Sur la configuration actuelle de développement (`bundle.active=false`, `0.0.1`), ce contrôle est conçu pour **échouer** ; `npm run check` continue de valider le prototype sans activer le bundling. Une configuration Preview **future** devra être soumise à ce nouveau contrôle puis à la revue de release et à la vérification réelle de signature. Aucun fichier de clé/certificat ni endpoint n'a été ajouté.

## Feu vert : étapes obligatoires pour proposer un setup à l'utilisateur

- [ ] **Éditeur et identité définitive** : choisir un nom de publication, identifiant Tauri stable, version/canal Preview cohérents dans `package.json`, `Cargo.toml`, `tauri.conf.json` et les noms d'artefacts. Ne pas remplacer silencieusement le prototype `0.0.1`.
- [ ] **Icône officielle HD** : intégrer des octets source 512px approuvés, contrôlés par hash ; pas d'agrandissement de la version 48px.
- [ ] **Signature Windows** : décider d'un fournisseur/identité de signature Authenticode et faire signer réellement le binaire et le setup avec clé protégée hors Git. Valider la chaîne de confiance, l'horodatage, et le thumbprint approuvé séparément. La signature peut nécessiter un certificat ou service payant. **Une signature valide ne garantit pas l'absence d'alerte SmartScreen**.
- [ ] **Provenance publique/privée contrôlée** : artefact officiel attaché à la release Preview appropriée, commit précis, SHA-256 indépendant du téléchargement, historique et notes de version. Pas de lien temporaire `PRIVATE-UNSIGNED` Actions présenté comme une distribution.
- [ ] **Tests sur OS cibles** : exécuter le vrai package destiné à l'utilisateur (signé) sur Windows 10 et 11 x64 isolés, avec WebView2 déjà installé et manquant/avec réseau, utilisateur non administrateur, installer → lancer → fermer → désinstaller, vérification de conservation des données. Vérifier fenêtre, captures UI D et log sans secret. CI `windows-latest` n'atteste pas à elle seule ces deux OS.
- [ ] **Retour arrière** : comportement de fermeture, désinstallation, conservation des données, et marche à suivre si Windows bloque la signature/la réputation/l'installation. Ne jamais demander de contourner SmartScreen, de désactiver l'antivirus, ni d'installer un certificat non fiable pour « forcer » le fonctionnement.
- [ ] **Autorisation explicite pour essai sur PC** : après tout ce qui précède, donner le **lien officiel exact**, nom/version, hash attendu, éditeur, exigences (Windows x64 + éventuel accès réseau pour WebView2), sauvegarde préalable et procédure pas-à-pas. L'utilisateur décide alors lui-même d'installer.

### Critères de sortie et statut honnête

Un « installeur prêt pour un essai privé » n'est **ni** une V1 stable, **ni** un updater actif, **ni** une intégration Bridge. Si une seule case obligatoire manque, maintenir **NO-GO** et rapporter précisément les preuves et le blocage. Le script `scripts/windows/verify-optic-installer.ps1` ne doit recevoir que le SHA-256 et le thumbprint authentiques et publiés indépendamment. Aucun chiffre de signature, clé, serveur ou date de livraison ne doit être inventé.

### Deuxième phase — mise à jour signée, non bloquante pour le tout premier essai manuel

L'activation **future** de Tauri Updater 2 exige **une autre paire de clés** de signature, ses secrets privés hors dépôt, clé publique embarquée, endpoint HTTPS réel, manifestes par version/canal, mise à niveau/downgrade/restart et état authentifié de terminaison des opérations Bridge. Le manuel ne doit pas se transformer en installateur réseau non vérifié. L'UI Paramètres → Mises à jour reste explicitement **non activée** jusque-là.

## Références

- [Issue #28](https://github.com/ELITEAYOTO/Alpha-Optic-APP/issues/28) — feuille de route utilisateur.
- [Distribution Windows](WINDOWS_DISTRIBUTION.md) ; [NSIS Preview](NSIS_PREVIEW.md) ; [ADR-0007](../decisions/ADR-0007-SIGNED-UPDATES.md).
- Tauri NSIS : https://v2.tauri.app/distribute/windows-installer/
- Tauri signatures Windows : https://v2.tauri.app/distribute/sign/windows/
- Tauri Updater : https://v2.tauri.app/plugin/updater/
