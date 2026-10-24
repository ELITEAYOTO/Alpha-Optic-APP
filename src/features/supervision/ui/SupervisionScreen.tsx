export function SupervisionScreen() {
  return (
    <section className="module-screen" aria-labelledby="supervision-title">
      <div className="eyebrow">OUTIL DE SUPERVISION / LECTURE SEULE</div>
      <h1 id="supervision-title">Console de supervision</h1>
      <p className="intro">Les événements du Bridge seront affichés ici avec leur horodatage, leur origine et leur statut.</p>
      <div className="tool-panel">
        <div className="tool-panel-header">
          <strong>Journal d'événements</strong>
          <span className="state-pill">NON CONNECTÉ</span>
        </div>
        <div className="console-empty" role="status">
          <span className="console-prompt">$ optic events --follow</span>
          <p>Canal d'événements indisponible. Aucun journal réel n'est affiché.</p>
        </div>
      </div>
      <div className="notice">Cette vue n'émet aucune commande et ne traite aucune permission. L'abonnement aux événements Rust sera ajouté après validation du contrat.</div>
    </section>
  );
}
