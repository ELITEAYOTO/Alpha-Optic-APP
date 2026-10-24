# Optic — application Windows

Application desktop d'**Optic AI Bridge**. Le nom de l'interface est **Optic**.

**Statut : bootstrap expérimental, interface de démonstration uniquement.** L'application ne contrôle pas encore un Bridge réel, n'exécute aucune commande native et n'accorde aucune autorisation.

## Architecture
- React / TypeScript / Vite : présentation modulaire, issue de la direction UI D de Figma.
- Tauri 2 / Rust : hôte Windows minimal, sans commande privilégiée.
- Optic AI Bridge : moteur Rust développé dans son [dépôt distinct](https://github.com/ELITEAYOTO/Optic-AI-Bridge-), seul détenteur des permissions.
- Une interface de supervision en lecture seule et un terminal développeur distinct seront connectés uniquement après revue des contrats et garanties d'exécution.

## Démarrage développeur (prérequis installés)
```bash
npm ci
npm run check
npm run tauri dev
```
Ces instructions n'impliquent pas que le projet a été compilé ou exécuté sur le PC de l'opérateur.

## État et documentation
- `AGENTS.md` : règles des agents et développeurs.
- `docs/architecture/OVERVIEW.md` et `MODULE_BOUNDARIES.md` : limites des couches.
- `docs/security/SECURITY_MODEL.md` : invariants de sécurité.
- `docs/design/UI_D.md` : référence UI validée.
- `docs/engineering/DESKTOP_BOOTSTRAP.md` : limitations exactes et validations attendues.

**À faire avant distribution :** audit et validation des dépendances verrouillées, validation Windows, logo officiel, migration contrôlée de la V1.6.2 et audit de sécurité. Le Bridge principal reste pré-alpha.

L'ancienne V1.6.2 React n'a pas été copiée ou réécrite ici. Elle devra être inspectée et reprise selon un plan de migration.
