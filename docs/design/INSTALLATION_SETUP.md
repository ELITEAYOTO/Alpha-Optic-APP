# UI D — installation et première configuration

**Direction visuelle : références fournies par l'utilisateur, à préserver.** Ne pas créer de nouvelle maquette à leur place.

- [Panneau de progression 460 × 900, Figma `407:1659`](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=407-1659)
- [Surface principale de configuration 980 × 900, Figma `407:1676`](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=407-1676)
- [Première ouverture UI D 1440 × 900, Figma `391:1138`](https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=391-1138)

Références inspectées le 24 octobre 2026 : panneau vertical sombre, logo officiel multicolore, progression numérotée, typographie éditoriale, deux options « Portable » / « Installation Windows », préférences de démarrage manuel et permissions non automatiques. Garder cette maturité visuelle, et éviter l'esthétique dashboard/gaming.

## Deux parcours techniquement distincts

**Avant que l'application ne tourne** : choix de la variante sur la distribution/le setup, destination et raccourcis, contrôle du runtime WebView2, installation native NSIS et gestion d'erreur. React Tauri **ne peut pas** montrer un écran de réparation si WebView2 est absent. Le style de l'écran Figma inspire l'installeur, mais ne doit pas faire croire que le contenu React tourne pendant NSIS.

**Après lancement** : l'édition (portable ou installée) existe déjà ; montrer l'édition réellement constatée et un assistant guidé, sans proposer une conversion fictive. Harmoniser les étapes de `407` avec la direction `391`, pas deux assistants incohérents.

## Assistant de première utilisation — intentions

1. **Préflight / démarrage** : montrer Optic et sa version, état local, Bridge inconnu/non vérifié, chemin « Continuer hors connexion » et remédiation. Aucun téléchargement ou installation de programme externe par un clic simulé.
2. **Premier projet** : choix volontaire de dossier et périmètre, avec consentement ; ne pas attribuer de droits effectifs.
3. **Connexion IA** : fournisseur affiché seulement s'il est réellement pris en charge, connexion et secrets gérés par le bon adaptateur ; jamais de credential en log ou localStorage générique.
4. **Récapitulatif** : distinguer étapes réellement validées vs inconnues/restantes. « Terminer » ne démarre pas le Bridge, ne crée pas de session et ne donne aucune permission.

Le design `391:1138` présente Bridge/Assistant/Projet/Validation ; regrouper les mêmes intentions sans supprimer des vérifications de sécurité. Ne pas déclencher une opération sensible à partir d'une transition UI.

## Critères qualité

- Étapes numérotées, retour, reprise et annulation sans perte ni action cachée, chargement réversible, textes d'erreur et focus visibles ; navigation clavier, `aria-live` contextualisée, pas de piège focus.
- Ne pas afficher une progression fictive pour une installation bloquée ; distinguer téléchargement, vérification, copie et confirmation native.
- Démarrage au login, permissions projet, service Bridge et connexions IA sont **désactivés par défaut** ; jamais d'élévation Windows ou d'accès implicite.
- État inconnu ≠ indisponible ≠ incompatible ≠ confirmé. Les informations de version Bridge sont authentifiées côté Rust **avant** de les présenter comme vérités.
- `setup_completed` ne signifie pas `bridge_ready` ni `permission_effective` ; pas de réhydratation de grants depuis une préférence.
- Responsables de modules : `src/features/onboarding/ui/` pour vues et CSS, `model/` pour progression pure/testée ; futur préflight via Rust contrôlé, jamais commande OS directe dans React.
- Vérifier rendu à 1440 × 900 et 1280 × 800, zoom et WebView2 sur Windows, en plus des validations statiques.

**État vérifié au 27 octobre 2026 :** UI first-run toujours **en conception** (#13). Un NSIS **non signé d'essai** a été créé, installé, lancé avec WebView2 puis désinstallé **sur runner GitHub-hosted** (#18–#20), mais **aucun vrai installateur utilisateur prêt à diffuser**. La distinction avant/après lancement reste impérative. Voir #12, #15 et `WINDOWS_DISTRIBUTION.md`.
