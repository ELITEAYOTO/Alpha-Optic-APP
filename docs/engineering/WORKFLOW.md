# Optic Desktop — méthode de développement

1. **Vérifier le dépôt avant d'écrire :** tout travail de cette piste est ciblé sur `ELITEAYOTO/Alpha-Optic-APP`. L'autre IA développe `ELITEAYOTO/Optic-AI-Bridge-` : **lecture seule**, aucune branche/PR/issue/commit/fusion de notre part.
2. À chaque reprise, lire `AGENTS.md`, `docs/engineering/HANDOFF.md`, l'architecture, le modèle de sécurité et l'ADR concernée ; récupérer `main` et les PR/CI réels, ne pas faire confiance à un ancien SHA isolé.
3. Une responsabilité par branche et PR ; garder les changements petits et révisables. Pas de mélange UI, packaging, permissions natives, transports MCP et mises à jour dans une seule PR.
4. Ajouter un contrat/test pour chaque frontière publique ; tester erreurs, invalidité, bornes, offline, concurrence et annulation. Ne pas désactiver un test pour rendre la CI verte.
5. Respecter le DAG `app/features/shared/contracts`. Éviter `App.tsx` monolithique, `utils.ts` géant, services fourre-tout ou duplication de l'autorité Rust.
6. Faire passer `npm ci`, `npm run check` et les jobs CI, y compris Rust Windows `cargo check --locked`, **sur le SHA exact**. Si des tests échouent ou restent en cours, ne pas fusionner ; contrôler à nouveau la CI après squash-merge.
7. Dépendance nouvelle : évaluer licence, maintenance, sécurité, bundle et compatibilité Windows avant adoption. Garder npm et Cargo lockfiles cohérents.
8. Simulation, mode offline et liaison live doivent être identifiables. Une UI ne prouve ni la permission effective ni l'arrêt d'un processus. Les opérations sensibles appartiennent au Bridge.
9. Pour UI/rendus, suivre `docs/design/UI_D.md` et vérifier au moins 1440×900 et 1280×800, accessibilité, clavier/focus, contrastes et absence de scroll en accueil de référence.
10. Pour une exigence impliquant le Bridge : documenter dans **Desktop** une proposition d'IPC/contrat, signaler à l'utilisateur l'autre IA responsable ; **ne pas ouvrir une PR côté Bridge** sans nouvel accord explicite.
11. Aucun accès au PC utilisateur, installateur, commande shell réelle ou validation physique sans consentement spécifique ; CI GitHub ne prouve pas le packaging Windows réel.
12. Garder `docs/engineering/HANDOFF.md` fidèle et actualisé au passage de relais, sans multiplier les fichiers de reprise redondants. Fournir au prochain chat un prompt de reprise qui commence par une vérification GitHub.

## Protocole de passation de chat et preuves Windows (27 octobre 2026)

1. Pour une nouvelle conversation, utiliser `NEXT_CHAT_PROMPT_OPTIC_DESKTOP_2026-10-27.md`, mais **le présent GitHub (`main` + PR + CI)** l'emporte toujours sur l'ancien SHA cité dans le prompt.
2. En début de session, lire la **version complète** du handoff canonique et les règles `AGENTS.md` ; vérifier source, tests et docs de l'élément étudié avant de produire une PR. Mettre à jour le handoff, les ADR pertinents, la doc de fonctionnalité et l'issue à la fin.
3. Vrai test utilisateur et CI sont deux preuves distinctes. Les captures Windows ont confirmé le logo Optic, la barre native sombre et l'explorateur replié ; elles n'ont pas vérifié le nouvel écran de Supervision (PR #25), Alt+Tab, 125 %/150 % DPI, accessibilité exhaustive ou la version HD.
4. La CI **smoke NSIS actuelle installe réellement**, lance l'application et WebView2, puis désinstalle un binaire **non signé de test** sur GitHub-hosted Windows. Une CI source verte n'est pas une release utilisateur ; une CI NSIS verte ne prouve ni rendu React complet, ni SmartScreen/Authenticode, ni updater, ni Windows 10/11 vierge ou offline WebView2.
5. L'utilisateur choisit lui-même d'exécuter les commandes PowerShell proposées. Toute opération mutante locale exige statut Git préalable, sauvegarde des changements, absence de `reset --hard`/`clean` destructifs sans approbation et chemin de retour clair. Ne jamais agir à sa place sans autorisation.
6. Suite des contrôles GitHub : base `main` vérifiée → branche isolée → changements tests ciblés et revue du diff → PR → vérifier **tous** les checks sur HEAD exact (inclure NSIS si workflow déclenché) → fusion squash avec SHA attendu → contrôles **post-fusion** de `main`, mise à jour d'issues et handoff. Un check non démarré/neutre ne signifie pas succès.
