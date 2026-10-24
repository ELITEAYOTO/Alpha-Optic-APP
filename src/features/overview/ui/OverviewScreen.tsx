import type { Destination } from "../../../app/navigation";
import { overviewDisplay } from "../model/demo";

export function OverviewScreen({ onNavigate }: { onNavigate: (section: Destination) => void }) {
  return (
    <section className="overview" aria-labelledby="overview-title">
      <div className="eyebrow">BUREAU / PREMIÈRE UTILISATION</div>
      <h1 id="overview-title">Votre bureau</h1>
      <p className="intro">Préparez votre environnement sans perdre votre contexte.</p>
      <div className="feature-strip">
        <div>
          <div className="eyebrow">VOTRE PROCHAINE ACTION</div>
          <h2>Préparer un espace sécurisé</h2>
          <p>Choisissez d’abord un projet. Les permissions seront vérifiées par le Bridge.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => onNavigate("projects")}>Voir les projets →</button>
      </div>
      <div className="section-heading"><h2>Votre contexte</h2></div>
      <div className="context-grid">
        {Object.entries(overviewDisplay).map(([key, value]) => (
          <div className="context-item" key={key}>
            <small>{key.toUpperCase()}</small>
            <strong>{value.title}</strong>
            <span>{value.detail}</span>
          </div>
        ))}
      </div>
      <div className="section-heading"><h2>À vérifier avant le lancement</h2></div>
      <div className="check-list">
        <div><strong>Connexion au Bridge</strong><span>Service non connecté</span><button onClick={() => onNavigate("connections")}>Consulter →</button></div>
        <div><strong>Autorisations</strong><span>État effectif inconnu</span><button onClick={() => onNavigate("permissions")}>Examiner →</button></div>
        <div><strong>Sessions et supervision</strong><span>Pas de télémétrie réelle</span><button onClick={() => onNavigate("supervision")}>Ouvrir →</button></div>
      </div>
      <div className="section-heading"><h2>Activité récente</h2></div>
      <div className="empty-activity">Aucun événement réel disponible. La console reste inactive tant que le Bridge n'est pas connecté.</div>
    </section>
  );
}
