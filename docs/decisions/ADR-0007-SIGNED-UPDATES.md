# ADR-0007 — Politique de mise à jour Optic (sécurité d'abord)

**Statut : architecture approuvée ; premier module UI offline.** Aucun déploiement actif.

## Décision

1. **Tauri updater 2 natif**, artefacts **signés** et manifestes/version SemVer délivrés depuis **HTTPS**. La clé publique embarquée authentifie le binaire d'update ; une clé privée ne doit jamais vivre dans Git. Un certificat Authenticode Windows est un contrôle de réputation/signature de code différent, à prévoir séparément. Aucune URL ni clé fictive ne sera codée « pour tester » la production.
2. **Détection automatique avec backoff**, éventuellement au lancement puis dans une fréquence bornée, **sans téléchargement ni installation sans consentement**. Bouton manuel, notes de version, canal stable/preview, action « Plus tard », progression, erreurs réseau/serveur/signature distinguées. La décision d'installation doit rester explicite ; ne jamais afficher « à jour » quand l'état est inconnu.
3. **Séparation du Bridge** : update Optic ne modifie ni le moteur Rust Bridge ni ses MCP ni les permissions. Avant fermeture/restart/upgrade, seul un état **authentifié** Rust/Bridge peut prouver que les opérations et processus natifs sont terminés ; état incertain -> reporter.
4. **Distribution** : NSIS par utilisateur en premier, et policy **portable différente**. Un ZIP portable ne s'auto-remplace pas par le workflow NSIS sans tests spécifiques. Prévoir migration, échec partiel, restauration d'une config précédente si elle est compatible, interdiction de downgrade implicite.
5. **Rendu UI** : React affiche uniquement un état de présentation provenant d'un futur adaptateur natif. `src/features/updates/model/update-state.ts` est un modèle **pur et offline** ; il ne vérifie pas les signatures, il ne permet pas le téléchargement ni l'exécution d'artefacts. `UpdatesPanel` affiche explicitement « non activé » tant qu'aucun plugin updater signé n'est câblé.
6. **Activation live (gate bloquant)** : identité/nom de domaine de publication final, paire de clés stable, clé publique en config native, signer et vérifier un réel setup sur Windows, version/canal cohérents, politique de rotation/révocation, tests manuels et CI d'upgrade, capacités Tauri minimales et revue du cycle de vie Bridge. `bundle.active=false` reste inchangé.

## Conséquences et roadmap

Issue #15 dédiée ; dépend de #12 (installateur) et de #4 (autorité de cycle de vie Bridge). Les contrôles actuels testent uniquement le **modèle UI**, pas le mécanisme de mise à jour réelle.

Docs : https://v2.tauri.app/plugin/updater/ ; https://v2.tauri.app/distribute/windows-installer/

## Garde-fou CI offline

`npm run check:release-config` passe sur le bootstrap, mais échoue si les trois versions divergent ou si l'updater est partiellement activé. `npm run check:release-candidate` exige une configuration NSIS signée plus complète et doit échouer avant préparation des releases. Voir `tests/release-gates.test.mjs`. Cela ne garantit **pas** l'authenticité des clés/endpoints ou la réussite du package Windows.
