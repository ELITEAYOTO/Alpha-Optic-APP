interface Props {
  /** Application-level navigation intent. Supervision never imports the app router. */
  onReturnHome: () => void;
}

/**
 * Explicitly offline UI. A real event stream must come from an authenticated
 * and versioned Rust adapter, never a CLI example or fabricated events.
 */
export function SupervisionScreen({ onReturnHome }: Props) {
  return (
    <section className="module-screen supervision-screen" aria-labelledby="supervision-title">
      <div className="eyebrow">SUPERVISION / LECTURE SEULE</div>
      <h1 id="supervision-title">Console de supervision</h1>
      <p className="intro">Le journal présentera les événements vérifiés du Bridge, avec leur origine, leur date et leur état.</p>

      <div className="tool-panel" aria-label="Journal de supervision">
        <div className="tool-panel-header">
          <strong>Journal d'événements</strong>
          <span className="state-pill">SOURCE NON CONNECTÉE</span>
        </div>
        <div className="supervision-offline" role="status">
          <strong className="supervision-offline-title">Flux d'événements indisponible</strong>
          <p>
            Cette version d'Optic n'est pas reliée au Bridge.
            Aucun événement authentifié ne peut être affiché.
          </p>
          <button type="button" className="supervision-back" onClick={onReturnHome}>
            Retour au bureau <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div className="supervision-facts" aria-label="État des sources de supervision">
        <div>
          <span>CONNEXION BRIDGE</span>
          <strong>Non établie</strong>
        </div>
        <div>
          <span>FLUX AUTHENTIFIÉ</span>
          <strong>Non disponible</strong>
        </div>
        <div>
          <span>HISTORIQUE</span>
          <strong>Non accessible</strong>
        </div>
      </div>
      <p className="supervision-footnote">
        Aucun journal réel n'est chargé et cette vue n'émet aucune commande.
        La supervision sera activée uniquement après validation du contrat de connexion avec le Bridge.
      </p>
    </section>
  );
}
