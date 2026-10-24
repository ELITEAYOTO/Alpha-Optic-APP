# ADR-0006 — Installation native et première ouverture sont distinctes

**Statut : accepté pour la conception, non implémenté (24 octobre 2026).**

## Contexte

Figma comporte un panneau d'installation/progression `407:1659` et une surface de configuration `407:1676` proposant Portable / Installation Windows ; l'UI D de première ouverture se trouve aussi à `391:1138`. Ces références sont validées et ne doivent pas être remplacées par de nouveaux visuels.

La configuration actuelle `src-tauri/tauri.conf.json` déclare `bundle.active=false` ; aucun installeur ni ZIP portable réellement validé n'est disponible.

## Décisions

1. **La distribution précède le premier lancement** : l'utilisateur choisit l'artefact (setup Windows ou portable) avant d'exécuter Optic. L'application déjà ouverte peut décrire son mode actuel, mais pas « convertir » rétroactivement son installation à l'aide d'une radio React.
2. **L'installateur est natif** : NSIS par utilisateur en première cible (pas d'élévation par défaut), MSI entreprise évalué plus tard ; mode portable construit et testé séparément. La maquette Figma peut guider le branding, sans se substituer à l'installateur natif.
3. **WebView2 se gère avant React** : si le runtime manque, l'UI Tauri ne peut pas afficher un assistant de réparation. Prévoir stratégie d'installation en ligne et paquet offline validé. Aucune commande cachée, source non authentifiée ou élévation implicite.
4. **Onboarding après lancement** : modèle React pur et testé, diagnostics natifs limités, projets et assistants choisis explicitement, reprise/annulation, résumé fidèle. Valeurs par défaut : démarrage manuel, aucun grant, aucun Bridge lancé.
5. **Bridge est indépendant** : moteur géré par un autre dépôt/une autre IA. Pas de téléchargement, installation, démarrage, mise à jour ou suppression du moteur avant contrat authentifié et concertation expresse. Une version inconnue ou incompatible désactive les contrôles liés.
6. **Versions indépendantes** : version Optic, build/canal, distribution, version WebView2, version Bridge et version du protocole ne sont pas interchangeables. Compatibilité par plage négociée et preuve, jamais par numéro ressemblant.
7. **Distribution fiable** : chaîne reproductible, hachages, signature de code Windows à définir, updates Tauri signées obligatoirement, tests de setup/uninstall/upgrade/portable sur vrai Windows. Préserver les projets et données utilisateur par défaut lors d'une désinstallation.

## Conséquences

Les issues #12 (packaging) et #13 (UI first-run) sont distinctes ; #4 concerne le contrat Bridge. Voir `docs/engineering/WINDOWS_DISTRIBUTION.md` et `docs/design/INSTALLATION_SETUP.md`.

**L'ADR n'active aucune fonction de packaging, commande native ou connecteur Bridge.**
