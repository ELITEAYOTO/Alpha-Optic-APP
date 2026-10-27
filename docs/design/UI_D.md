# Optic UI D — direction visuelle approuvée

Source : https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=320-130

Direction Desktop **UI D** choisie : design Windows professionnel et sobre. Thème sombre **Carbone et corail** par défaut ; variante claire **Lin et grenat**. Logo officiel multicolore, dès que les assets d'origine sont vérifiés. Nom produit **Optic** ; moteur **Optic AI Bridge**, jamais « Lab ».

Références existantes :
- [Accueil sombre](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=349-444) et [clair](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=349-310)
- [Console de supervision](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=352-474)
- [Autorisation explicite](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=378-1046)
- [Tokens et états](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=384-1138)
- [Fenêtre compacte 1280×800](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=398-1782)
- [Parcours UX](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=399-1832)
- [Première ouverture](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=391-1138)
- [Demandes d'accès](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=391-1429)
- [Diagnostics](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=394-1506)
- [États du Bridge](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=394-1645)

Contraintes visuelles : rail outils 70 px et explorateur contextuel pour 1440×900, barre de statut bas de fenêtre ; page d'accueil sans scroll aux tailles de référence ; app sobre, pas d'esthétique gaming/néon/dashboard encombré. Afficher statuts exacts : simulation ≠ connecté, demande ≠ droit, arrêt demandé ≠ terminaison prouvée.

Le **terminal interactif développeur** est un outil différent de la console supervision : cadrer en Figma ses états (ouvert, sans droit, erreur, arrêt incertain) avant branchement réel. Prévoir thème communautaire via tokens, pas CSS tiers arbitraire.

L'utilisateur a fourni une **image de proposition du parcours installation/configuration** et l'a ajoutée à son espace de design : la considérer comme une référence de conception **distincte** du bureau UI D. Ne pas générer d'autres images ni prétendre que cet asset est présent dans GitHub sans vérification.

**Référence d'installation et configuration :** les cadres [`407:1659`](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=407-1659) et [`407:1676`](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=407-1676) ont été vérifiés et seront préservés. Voir `docs/design/INSTALLATION_SETUP.md` ; conception native de distribution #12 et wizard UI #13 séparés. Aucun **installateur signé distribuable** n'est disponible ; un NSIS expérimental est fabriqué, exécuté et désinstallé uniquement en CI Windows (#18–#20).

**État du code (24 octobre 2026) :** la source originale React V1.6.2 a été retrouvée et auditée statiquement (voir `docs/engineering/V162_SOURCE_AUDIT.md`). L'accueil UI D dispose d'un premier lot de mise en page responsive 1440 × 900 / 1280 × 800 et du logo multicolore d'origine, rééchantillonné en 48 × 48 PNG transparent pour l'en-tête (`public/assets/optic-logo-48.png`, SHA-256 `4df69967a73d21299a6e1497e003d531efdd29790ea09f8987ca27629965bc8f`). L'archive V1.6.2 complète n'a **pas** été migrée ; la fidélité visuelle et l'absence de défilement doivent encore être confirmées en rendu réel, notamment sur Windows/WebView2.

## Ajustements issus du premier test Windows utilisateur (24 octobre 2026)

Le premier `npm run tauri dev` compilé sur Windows a confirmé la fenêtre et
la fidélité générale du bureau, et a révélé quatre priorités :
**barre de titre native blanche**, **icônes natives encore provisoires**
(alors que l'en-tête React utilise le bon logo), **explorateur non rétractable**
et **survol/focus trop discret**.

- L'explorateur peut désormais être replié via le bouton accessible de la
  barre d'outils ; les raccourcis restent disponibles et la zone de travail
  récupère exactement sa largeur. Le contrôle annonce correctement son état
  `aria-expanded` et respecte les préférences de réduction des animations.
- Les hovers doivent rester légers, à contrastes contrôlés, sans saut de layout
  excessif, et rester compatibles clavier/souris.
- Correction des icônes natives Windows et de la couleur de barre de titre :
  **lot distinct**, sans remplacer arbitrairement la fenêtre système tant que
  le déplacement, la maximisation, le snap et l'accessibilité ne sont pas testés.
- **Animation d'ouverture professionnelle à prévoir** : durée courte,
  aucun blocage de chargement, pas de faux statut de connexion,
  désactivée sous `prefers-reduced-motion`; implémentation et validation
  dans un lot séparé après design UI D approuvé.

## Supervision sans Bridge : revue Windows du 24 octobre 2026

La capture utilisateur confirme une barre native sombre, le vrai logo
Optic et le rail seul après réduction de l'explorateur. Les premières
corrections Windows sont **visuellement constatées**.

La page Supervision, en revanche, montrait un bloc « terminal » vide
sur toute la hauteur, avec le faux exemple `$ optic events --follow`.
Elle doit rester une page d'observation, **pas** un terminal développeur.
L'état déconnecté emploie dorénavant un panneau compact, trois statuts
précis, et un retour au Bureau. Garder la densité calme, sans fausses
statistiques ni faux événements. La connexion et l'historique réels
restent non implémentés jusqu'au contrat Bridge.

## Revue utilisateur Windows et finition UI D — 27 octobre 2026 (preuves des captures du 24/10)

Les captures réelles valident **barre de titre native sombre**, **logo Optic dans la fenêtre et la barre des tâches**, **rail seul avec explorateur rétracté**, affichage du Bureau et accès à Supervision. Les captures ne prouvent ni l'absence de scroll aux deux résolutions 1440×900 et 1280×800, ni les états focus/survol complets, Alt+Tab, DPI 125/150 % ou une UI D pixel-perfect.

- PR #21 : explorateur repliable et premiers états hover/focus ; PR #22 : icône officielle native 48px et fenêtre native sombre avec décorations préservées.
- PR #25 : **Supervision revue après ces captures**, supprimant le faux prompt terminal et le grand vide, état déconnecté clair et retour au Bureau. **Une nouvelle capture de cette version n'a pas encore été reçue.** Ne pas attribuer un verdict visuel aux seuls tests CI.
- À faire : contrôle réel de Supervision #25, densité navigation à 1280×800, contraste du rail/titres, accès clavier aux boutons et à la navigation, motion réduite, stabilité Windows Snap/DPI, icône HD multisize, éventuels raffinements d'animation de démarrage après design validé.
- Référence canonique du changement de chat : `docs/engineering/HANDOFF.md` (et prompt de reprise 2026-10-27).
