# Source officielle des icônes Windows haute définition

## État et provenance

Le premier prototype utilisait une icône native de **48 px** (PR #22), qui
était identique au logo de l'en-tête React mais restait peu adaptée à Alt+Tab,
aux DPI élevés et à un installateur diffusé.

Le logo officiel 512×512 sur fond transparent, transmis par l'utilisateur, a
été vérifié hors dépôt le 24 octobre 2026 :

- Source : `optic-logo-512.png` (PNG RGBA 8 bits, 512×512).
- SHA-256 exact : `d353f8a07d908dd43d6db9e169c913e8e6de5ef0509eab9369c373b690b01c2d`.
- La source originale est distincte de l'icône 48 px déjà versionnée. Ne pas
  rééchantillonner le 48 px pour prétendre obtenir un véritable 512 px.
- Source et pack ICO multi-tailles réunis dans un **ZIP de préparation**
  de cette conversation. Ils ne sont **pas encore intégrés** au dépôt.

## Génération reproductible sans dépendance supplémentaire

Depuis la racine du projet et avec `npm ci` déjà effectué, utiliser la
commande Tauri 2 officielle sur le PNG 512 px fourni :

```powershell
npm run tauri -- icon -o "src-tauri/icons-candidate" "CHEMIN_VERS/optic-logo-512.png"
```

Puis contrôler la sortie, **sans modifier les icônes actuelles** :

```powershell
npm run check:icon-candidate -- "CHEMIN_VERS/optic-logo-512.png" "src-tauri/icons-candidate"
```

Le validateur `scripts/check-native-icon-candidate.mjs` refuse une image
source autre que le logo original (SHA-256), un PNG final non RGBA 512 px,
ou un ICO sans calques Windows **16, 24, 32, 48, 64 et 256 px**.
Il est **entièrement en lecture seule**. Les tests unitaires vérifient
aussi son refus des chemins/entêtes invalides et des icônes de bootstrap 48 px.

Tauri recommande un ICO multi-tailles, avec la couche 32 px placée en
première position pour une bonne apparence durant le développement.
Voir : https://v2.tauri.app/develop/icons/ et
https://v2.tauri.app/reference/cli/ .

## Intégration réelle (autre lot)

Après inspection du jeu généré et **revue visuelle** des tailles 16/32/48/256
sur Windows et des écrans 100%, 125% et 150% DPI :
- Importer séparément les vrais assets binaires `icon.ico` et `icon.png`
  et, si validé, ajouter la source 512 px au dépôt.
- Mettre à jour le test temporaire `tests/native-window-icons.test.mjs`
  qui vérifie actuellement le conteneur 48 px ; il doit continuer à contrôler
  l'identité du logo sans exiger une couche unique 48 px.
- Vérifier CI frontend + Rust/NSIS, installation du binaire, Alt+Tab et
  barre des tâches avec Windows cachant parfois d'anciennes icônes.
- Ne pas confondre la validation de structure/empreinte avec la validation
  visuelle, les signatures Authenticode et une release approuvée.

**Aucune installation, mise à jour, intervention sur le PC utilisateur ou
écriture dans le moteur Bridge n'est impliquée par ce lot.**
