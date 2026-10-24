import { UPDATER_UNCONFIGURED, updaterDisplayMessage } from "../model/update-state";

export function UpdatesPanel({ prototypeVersion }: { prototypeVersion: string }) {
  // The production updater is intentionally not wired until endpoint, signature
  // pubkey, native lifecycle checks, installer tests and release keys exist.
  const status = UPDATER_UNCONFIGURED;
  return (
    <section className="updates-panel" aria-labelledby="updates-title">
      <div className="updates-heading">
        <div>
          <h2 id="updates-title">Mises à jour d'Optic</h2>
          <p>Recevez les nouvelles versions et choisissez quand les installer.</p>
        </div>
        <span className="updates-pill">NON ACTIVÉ</span>
      </div>
      <dl className="updates-details">
        <div><dt>Version du prototype</dt><dd>{prototypeVersion}</dd></div>
        <div><dt>Canal de distribution</dt><dd>Non configuré</dd></div>
        <div><dt>Dernière vérification</dt><dd>Jamais — aucun serveur interrogé</dd></div>
      </dl>
      <p className="updates-status" role="status">{updaterDisplayMessage(status)}</p>
      <div className="updates-actions">
        <button type="button" disabled title="Disponible après publication de l'installateur signé et du service de versions">Vérifier les mises à jour</button>
        <span>Le contrôle sera activé après validation des signatures et de l'installateur Windows.</span>
      </div>
    </section>
  );
}
