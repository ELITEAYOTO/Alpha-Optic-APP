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

**État du code :** le shell React actuel s'inspire de l'UI D, mais l'ancienne **V1.6.2 React originale** n'a **pas** été auditée/importée. Obtenir l'archive d'origine, inspecter les composants/ressources, migrer progressivement et effectuer tests visuels Windows. Ne pas reconstruire de zéro sur la base d'un souvenir.
