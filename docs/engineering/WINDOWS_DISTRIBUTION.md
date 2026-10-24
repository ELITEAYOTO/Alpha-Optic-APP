# Windows — packaging professionnel, dépendances et versions

**Statut : plan de développement. Aucun installeur prêt ou publié.** Responsable unique : `ELITEAYOTO/Alpha-Optic-APP` ; dépôt Bridge strictement en lecture seule.

## État vérifié au 24 octobre 2026

| Source | Version / état réel |
| --- | --- |
| `package.json` | Optic `0.0.1`, Node `>=22.12.0` (développement), React `19.3.1`, Vite `8.3.4`, Tauri CLI `2.12.4` |
| `src-tauri/Cargo.toml` | `optic-desktop` `0.0.1`, Tauri Rust `2.12.5` |
| `src-tauri/tauri.conf.json` | `productName=Optic`, `version=0.0.1`, identifiant **provisoire** `dev.optic.desktop`, `bundle.active=false` |
| WebView2 | Runtime Windows nécessaire, seuil minimal **non encore fixé/testé** |
| Bridge | Version / protocole compatibles et artefacts de release **non négociés** |
| Signature et release | Aucune chaîne de distribution Windows attestée, aucun updater actif |

Ces numéros ne doivent pas être pris pour une politique « dernières versions » : revoir à chaque nouvelle livraison.

## Choix de distribution

**Édition installée** : NSIS `-setup.exe` par utilisateur, sans demande de privilèges administrateur par défaut (installation Tauri dans `%LOCALAPPDATA%`). Icône officielle, identité éditeur, langue française, emplacement/raccourcis transparents, désinstallation et logs d'erreur expurgés. MSI ou installation tous utilisateurs uniquement comme offre supplémentaire testée avec UAC explicite.

**Édition portable** : ZIP Windows et politique d'état/données (profil vs dossier local) **définies et testées** ; un `.exe` seul n'établit pas la portabilité. Ne pas promettre le fonctionnement sur PC sans WebView2 ni des droits de lecture/écriture appropriés.

**WebView2** : installateurs Tauri peuvent télécharger un bootstrapper ou intégrer un installateur hors ligne ; `webviewInstallMode=offlineInstaller` ajoute environ 127 Mo selon la documentation actuelle. Le choix de canal doit être explicite, avec signature/provenance de la dépendance et test machine sans Internet. Ne pas adopter `skip` sans solution fiable si runtime absent.

Sources officielles : https://v2.tauri.app/distribute/windows-installer/ ; https://v2.tauri.app/develop/sidecar/

## Ce que l'utilisateur final ne doit pas installer

- **Node.js/npm/Rust/C++ Build Tools** sont des outils développeur ou CI, pas des prérequis de l'utilisateur final pour lancer un binaire publié.
- Le frontend et le contrôleur Rust sont déjà compilés dans l'application distribuée.
- Les packages npm et Cargo sont verrouillés par `package-lock.json` et `Cargo.lock` pour la fabrication ; `npm ci` et `cargo check --locked` ne se lancent **pas** sur le PC de l'utilisateur.
- Les serveurs MCP Figma/GitHub et leurs credentials sont explicitement configurés plus tard ; aucun téléchargement silencieux.
- **Bridge n'est pas inclus à ce stade** : avant d'envisager un sidecar ou un installeur moteur, exiger binaire distribué et signé, contrat de version/transport/authentification, cycle de vie/arrêt vérifié et coordination de l'autre IA.

## Versionnement et compatibilité

Chaque artefact publié devrait exposer `app_version` (SemVer), `build_sha`, `release_channel`, `os_arch`, `distribution_kind`, `artifact_sha256`, `publisher_signature_status`. Le diagnostic runtime distingue **version Optic**, **WebView2**, **Bridge** (lorsqu'authentifié), **protocole de contrôle** et **connecteurs MCP**.

Ne jamais inférer qu'un moteur Bridge est compatible à partir de la version d'Optic. Introduire ensuite un handshake Rust à plages compatibles testées et identité prouvée ; sinon afficher inconnu/incompatible et interdire l'opération.

Mises à jour : artefacts signés, vérification cryptographique Tauri updater obligatoire, certificat de signature Windows distinct, canaux stable/préversion, changelog, reprise après échec et migrations idempotentes. Ne pas mettre à jour Bridge ou des MCP externes implicitement. Une mise à jour ne peut rétablir une autorisation révoquée. Source : https://v2.tauri.app/plugin/updater/ et https://v2.tauri.app/distribute/sign/windows/

## Gates avant « installable »

1. Mettre au point le vrai profil NSIS sans activer le packaging par défaut tant que les prérequis ne sont pas complets ; vérifier les métadonnées et l'identifiant définitif.
2. Build source `npm ci`, `npm run check`, `cargo check --locked --manifest-path src-tauri/Cargo.toml` **et** build installeur séparé sur runner Windows ; publication d'artefacts de test sans release publique.
3. Vérifier hash/signature, provenance et contenu du setup ; tester install, upgrade, uninstall, clean reinstall, erreurs partielles, utilisateur sans droits admin, Windows 10/11 x64 **avant de garantir ces plateformes**.
4. Vérifier WebView2 présent, absent, trop ancien, sans réseau et mise à jour interrompue. Tester le paquet offline indépendamment.
5. Tester l'édition portable : dossier temporaire/disque externe/chemin avec espaces, permissions limitées, profil et données persistées, nettoyage volontaire.
6. Préserver par défaut projets, configurations sensibles et sessions : aucune suppression silencieuse d'un dossier non possédé par l'installeur. Prévoir demande explicite pour une éventuelle purge de données.
7. Mises à jour signées et reprises contrôlées, pas de downgrade incontrôlé, pas de remplacement pendant un processus dont la terminaison est incertaine.
8. Test visuel UI D et first-run à 1440×900 et 1280×800, focus/clavier/zoom. Documenter l'écart entre **CI source**, **exécutable créé** et **installation Windows réellement testée**.
9. Ne jamais exécuter installation ou script sensible sur le PC de l'utilisateur sans consentement spécifique.

## Mises à jour d'Optic

Suivre l'**issue #15** et [ADR-0007](../decisions/ADR-0007-SIGNED-UPDATES.md) : notifications et vérifications bornées, **installation uniquement avec consentement**, mises à jour Tauri signées sur canal stable/preview, clé de signature privée hors Git, identité de publication, tests NSIS Windows et chemin manuel vérifié pour le portable. Le premier `UpdatesPanel` UI D **ne contacte aucun serveur** : ce n'est pas un updater déployé. Ne jamais mettre à jour Bridge ou MCP tiers à sa place. Aucun redémarrage si un processus/système reste en terminaison incertaine.

### Lots recommandés

#12.A paramètres/installateur NSIS + artefact de test non publié ; #12.B tests Windows/WebView2/identité ; #12.C portable réel ; #12.D signatures et updates. En parallèle, #13 traite l'interface **après ouverture** sans couplage à NSIS ; #4 reste dépendance pour tout Bridge réel.

## Préparation de release vérifiée statiquement (PR de garde-fous)

Le script `scripts/check-release-gates.mjs` vérifie automatiquement les trois versions
(`package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`),
le nom produit et l'absence d'updater activé dans le prototype.
Il est exécuté dans `npm run check` sur Windows et Ubuntu.

```bash
npm run check:release-config     # contrôles statiques du bootstrap, doit réussir
npm run check:release-candidate  # exige un profil NSIS signé/configuré ; DOIT échouer actuellement
```

Le mode distribution **nécessite** une identité non provisoire, une version cohérente,
`bundle.active=true`, `targets=nsis`, `currentUser`, `createUpdaterArtifacts=true`,
une clé publique définie, un endpoint HTTPS et un mode d'installation visible.
La clé privée reste hors Git. Aucune URL, clé de production, téléchargement ni package
signé n'a été ajouté.

**Attention :** un contrôle de structure de clé/endpoint ne prouve ni la propriété du
serveur ni une signature cryptographique. Tauri Updater vérifiera celle-ci lors d'une
future installation. La publication restera bloquée jusqu'aux tests Windows indépendants,
signature Authenticode, migration/rollback et confirmation de fin des opérations Bridge.
