# Native Windows window chrome — Optic UI D

## Décision du premier test Windows

L'interface React possède le bon logo multicolore, mais la fenêtre native
avait encore les icônes de démonstration Tauri, y compris dans la barre des
tâches. Le titre Windows blanc du PC testé contraste avec le thème sombre
Carbone et corail.

## Correction de compatibilité (lot #22)

- Fichiers natifs `src-tauri/icons/icon.png` et `icon.ico` remplacés par
  le **même logo Optic officiel déjà utilisé dans la barre React** :
  `public/assets/optic-logo-48.png`. Le conteneur ICO Windows embarque le
  PNG 48×48 original, sans changer son dessin ni simuler un nouveau logo.
- Fenêtre Tauri `theme: Dark`, `decorations: true` : Windows continue de
  gérer déplacement, redimensionnement, minimiser/maximiser/fermer et Snap.
  La couleur effective de la barre de titre dépend de la version Windows
  et doit être observée sur le PC du testeur.
- Aucun plugin, pont IPC, code Rust privilégié, permission frontend ou
  JavaScript de fenêtre externe. La version `bundle.active=false` demeure
  le prototype de développement.

## Limites et lot suivant

L'icône ici provient du PNG validé **48px** du dépôt. Il faudra importer
la source **512px** officielle validée et régénérer un vrai ICO multi-échelles
(16/24/32/48/64/256) avant release finale : un ICO 48px suffit au test du
petit pictogramme mais n'est pas le livrable haute densité.

Une barre de titre **100 % personnalisée**, avec boutons au style du produit,
doit être développée et testée séparément. En particulier, ne pas supprimer
les décorations Windows avant de conserver le déplacement de fenêtre, double
clic de maximisation, Windows Snap, focus clavier, haute densité DPI et
raccourcis système. `theme: Dark` améliore l'intégration sans affirmer que
le thème Windows final a été vu sur la machine utilisateur.

## Animation d'ouverture

Direction proposée : marque Optic discrète, apparition de la fenêtre puis
contenu, durée courte et sans blocage technique. Aucun faux statut
`Bridge connecté`, pas de splash distinct inutile, rien d'exécutable
avant consentement. Respecter `prefers-reduced-motion` ; animation à
dessiner/valider d'abord puis à implémenter dans une PR dédiée.
