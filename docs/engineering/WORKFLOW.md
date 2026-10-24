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
