# Optic Desktop — architecture et responsabilités

**État réel au 24 octobre 2026 :** bootstrap Tauri 2/Rust + React/TypeScript/Vite implémenté ; **contrôle réel du Bridge non implémenté**. UI D encore partielle, mode démonstration. Aucun service IPC privilégié ni exécution de terminal.

## Couches et frontières

1. **React :** UI D, navigation, formulaires, états affichés, console de supervision (lecture seule), terminal développeur (vue distincte), futur Monaco diff. Aucune décision effective de permissions, pas d'accès arbitraire fichiers/processus.
2. **Desktop host Rust/Tauri :** actuellement un hôte minimal, sans commandes custom. À terme gérer uniquement fenêtre/lifecycle, validation des appels, clients de contrôle autorisés, flux d'événements bornés. Ne pas dupliquer le moteur de politique.
3. **Optic AI Bridge Rust :** DÉPÔT SÉPARÉ, sous développement concurrent par une autre IA ; unique autorité pour droits, sessions, contrôle des effets sensibles, outils MCP, futurs connecteurs externes. Aucun couplage aux détails privés du Bridge sans accord de contrat.
4. **Adaptateurs :** demo/offline et éventuellement live doivent implémenter des interfaces explicites. L'UI doit indiquer clairement si un état est simulé, déconnecté, inconnu ou confirmé réel.

## Flux **cible**, pas encore existant

```
Intent utilisateur React
  -> cas d'usage feature (interface typée)
  -> contrôleur Desktop Rust et IPC restreint
  -> contrat local authentifié, versionné, à définir
  -> Bridge Rust (seul responsable des permissions)
  -> événements structurés et expurgés, canal borné distinct de MCP stdio
  -> état/projection UI en lecture seule
```

Ne pas parser le stdout protocolaire MCP comme un journal. Ne pas prétendre superviser globalement des processus Bridge lancés indépendamment sans instrumentation/autorisation.

## Choix retenus, implementation future

- Console de supervision : événements typés, horodatage, filtre, séquence, gaps, reconnexion et replay négocié.
- Terminal : vue et canal distincts de la supervision ; xterm.js + Windows ConPTY sont des **candidats** à valider avec isolation, Job Objects, propriétaires et fin native prouvée. Pas de PowerShell/CMD arbitraire.
- Modifications des projets : Monaco Diff envisagé, preuve de versions avant/après et droits de lecture contrôlés, attribuer « externe/inconnu » quand la source ne peut être prouvée.
- Serveurs MCP externes (Figma puis d'autres) : registre et routage envisagés **dans le Bridge**, avec credentials par fournisseur, contrôles d'accès et limites. Ne pas créer de proxy privilégié côté React/Tauri.
- Thèmes : validateur déclaratif implémenté en offline ; galerie, activation, import sécurisé, publication et extensions exécutables encore inexistants.
- Installation : prévoir modes portable et Windows installé, prérequis WebView2 et rollback ; aucun packaging prêt.
- Qualité : clavier/focus, contrastes, tests 1280×800 et 1440×900, gestion explicite du hors-ligne et d'états incertains.

## Organisation du dépôt

`src/app/` composition/navigation ; `src/features/<feature>/` UI, modèle, adaptateur propre ; `src/shared/` primitives réutilisables ; `src/contracts/` projections typées versionnées (non équivalentes à une API Bridge confirmée) ; `src-tauri/src/` host/adapters. Le DAG et les interdits sont dans `MODULE_BOUNDARIES.md`.

## Liens
- Desktop : https://github.com/ELITEAYOTO/Alpha-Optic-APP
- Bridge lecture seule : https://github.com/ELITEAYOTO/Optic-AI-Bridge-
- Figma UI D : https://www.figma.com/design/OGItF1Qa9wLGoSp2ieGJk4?node-id=320-130
- Reprise : `docs/engineering/HANDOFF.md`
