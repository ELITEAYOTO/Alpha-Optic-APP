# Issue #3 — audit de la source originale React V1.6.2

Date : 24 octobre 2026. **Audit statique de la source récupérée, pas migration ni validation Windows.**

## Provenance et reproductibilité

- Archive retrouvée dans les fichiers de la bibliothèque de l'utilisateur : `Optic-Desktop-V1.6.2-Accueil-Compact-Windows.zip` (295 702 octets).
- SHA-256 de l'archive **complète** : `0d305e732d21be4771b09dbb6ca70ad795d47139877a431d0a977801af130cef`.
- 71 entrées ZIP, environ 618 748 octets décompressés ; extraction inspectée sans exécuter les scripts Windows.
- L'archive porte le suffixe **V1.6.2**, mais `package.json` indique `version: "1.6.0"` et `docs/RELEASE_V1_6.md` décrit la V1.6. Ne pas interpréter la version du package comme une preuve d'une release native 1.6.2.
- Prototype local **React/TypeScript/Vite, navigateur uniquement** ; `pnpm-lock.yaml`, scripts de vérification Windows et Vitest. **Aucun hôte Tauri/Rust, aucune liaison réelle au Bridge, aucun installateur.**
- Le ZIP n'est **pas** versionné dans ce dépôt ; sa conservation/provenance reste externe à GitHub. Avant de réutiliser des éléments, vérifier les SHA ci-dessous sur la copie source et examiner les licences des dépendances.

| Fichier source | SHA-256 | Observation |
| --- | --- | --- |
| `src/App.tsx` | `1e503c962fa66dc271b2df39739b63ac380b5f491c52acb141ddd3c5a8615ed6` | Composition des pages et modales de démonstration |
| `src/features/HomePage.tsx` | `e200012ef2179174aae330532d610e7b7b14afa4190d88bea17f3fbb7a4a50ba` | Accueil V1.6.2 avec action de préparation |
| `src/demo/reducer.ts` | `3733a8e683b01413045b69fbf8a677f6d3d0abb4ffdf0b12e7822ce15d6fe5f0` | Workflow simulé, pas moteur de permission |
| `src/demo/persistence.ts` | `2c066804db49a43e29049f69d1c4f6a013b92c35da88cc9fedaea4add4fc9432` | Stockage démo V2 et réhydratation |
| `src/index.css` | `4835b371fede3219637aa1c27454152ec7d401db0b4ed1e2b801bcf201488d03` | 96 Ko de styles globaux à redistribuer par propriétaire |
| `src/components/SessionPreparationPanel.tsx` | `8cf64a4f325d4842cc9440bf122801060bedf7627e78192182d6ff7764865571` | Parcours de préparation en 6 étapes |
| `public/assets/optic-logo.png` | `d353f8a07d908dd43d6db9e169c913e8e6de5ef0509eab9369c373b690b01c2d` | PNG RGBA multicolore 512×512, identique au fichier autonome `optic-logo-512.png` de la bibliothèque |

## Inventaire fonctionnel existant

- `src/app/AppShell.tsx` : rail, navigation et chrome du prototype ; `src/components/ui.tsx` : primitives.
- `src/features/HomePage.tsx`, `ProjectsPage.tsx`, `SettingsPage.tsx`, `DeveloperPage.tsx` : interfaces interactives simulées.
- `src/features/WorkspacePages.tsx` : regroupement de plusieurs pages (33,5 Ko), **à découper** : connexions, sessions, permissions, activité.
- `src/features/onboarding/OnboardingFlow.tsx` : assistant de première ouverture ; `src/components/SessionPreparationPanel.tsx` : préparation de session ; modales projet et arrêt.
- `src/demo/{types,reducer,state,persistence,workflow,console}.ts[x]` : démo explicite avec requêtes, grants fictifs, horaires, simulateur Bridge et stockage navigateur. Tests adjacents pour cycle de vie, reprise, onboarding et console.
- `src/demo/console.ts` classifie une activité par **heuristique textuelle** : ne jamais reprendre cette attribution dans la supervision authentifiée. Les exports expurgent quelques motifs mais ne constituent **pas** une garantie globale de non-divulgation.
- Certains styles `@font-face` de `src/index.css` chargent `static.figma.com` : évaluer performance/confidentialité/offline avant migration ; ne pas copier automatiquement ces imports dans Tauri.

## Écart avec l'UI D et avec le nouveau dépôt

1. La source retrouvée est **V1.6.2 web** ; le nouveau dépôt est un **bootstrap Tauri 2 / React 19** encore incomplet. Les deux modèles de navigation et de thème diffèrent.
2. Figma **UI D Carbone et corail** est la direction **validée**, pas un ordre de reproduire aveuglément les couleurs ou les cartes de la V1.6.2. Références : accueil `349:444` (1440×900) et compacte `398:1782` (1280×800).
3. Les références Figma portent parfois le texte historique « optic-lab » ; le **nom produit final est Optic**. Ne pas reprendre ce libellé.
4. Une grande partie du prototype affiche des sessions/grants simulés et utilise `localStorage`; ne pas les confondre avec les objets du Bridge réel, ni les « réhydrater » en droits effectifs.
5. Le logo utilisateur multicolore a été **retrouvé et vérifié par hash** : son introduction dans l'UI doit être une PR dédiée avec un asset versionné, un contrôle visuel et l'accessibilité correcte.
6. La source contient une feuille CSS globale de 96 Ko et de gros composants ; les importer tels quels violerait `MODULE_BOUNDARIES.md`. Le modèle de thèmes V1.6.2 n'est pas automatiquement compatible avec le manifeste déclaratif validé du nouveau Desktop.

## Plan de migration découpé (chaque tranche : branche, tests, PR, CI exact-head)

1. **Base visuelle :** importer seulement les assets approuvés (logo) et établir les captures de référence 1440×900 et 1280×800 ; conserver shell Tauri minimal et mode démo explicite.
2. **Navigation et primitives :** comparer les écrans React source aux composants Figma UI D, extraire les primitives accessibles et transférer leur CSS dans `shared` ou le module propriétaire. Pas de copie du CSS global.
3. **Parcours projet / préparation :** isoler un modèle `demo` indépendant sans IPC ni droits effectifs, migrer le parcours en sous-composants testés (focus, annulation, cohérence du retour arrière).
4. **Sessions et permissions démo :** migrer seulement les invariants justifiés par tests ; états inconnus et expiration ne doivent jamais redevenir des accès valides au rechargement.
5. **Console / paramètres / onboarding :** reprendre les interactions utiles de la source ; la supervision structurée actuelle doit rester l'unique projection future des événements Bridge, sans heuristique de faux auteur.
6. **Revues Windows :** vraie capture UI D aux deux résolutions, navigation clavier, zoom et absence de scroll accueil, tests natifs Tauri/WebView2 avec accord utilisateur. Pas de packaging avant preuves dédiées.

## Validation et garde-fous

**Vérifié ici :** archive et entrées listées, contenu du code et des documents inspecté, hashes recalculés, modèle web-only confirmé, sources Figma `349:444` et `398:1782` contrôlées structurellement.

**Non vérifié :** `pnpm install`, Vitest officiel de la V1.6.2, exécution web/Windows, accessibilité réelle, fidélité pixel, permission de redistribution des fonts. Le compte-rendu historique de l'archive rapporte des tests hors ligne mais ce n'est pas une validation indépendante.

**Interdits pendant migration :** copier un PolicyEngine, brancher un vrai Bridge, activer PowerShell/ConPTY, traiter une approbation simulée comme un droit, attribuer des changements via inférence textuelle, importer des scripts/CSS tiers non validés, toucher au dépôt `Optic-AI-Bridge-`.
