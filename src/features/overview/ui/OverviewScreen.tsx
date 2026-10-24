import { overviewDisplay } from "../model/demo";

type OverviewDestination = "projects" | "connections" | "permissions" | "sessions" | "supervision";

const context = [
  { label: "PROJET", ...overviewDisplay.project },
  { label: "ASSISTANT", ...overviewDisplay.assistant },
  { label: "SESSION", ...overviewDisplay.session },
] as const;

const checks: ReadonlyArray<{
  label: string;
  detail: string;
  action: string;
  destination: OverviewDestination;
}> = [
  { label: "Connexion au Bridge", detail: "Service local non vérifié", action: "Consulter →", destination: "connections" },
  { label: "Autorisations du projet", detail: "Droits effectifs non vérifiés", action: "Examiner →", destination: "permissions" },
  { label: "Durée et arrêt de session", detail: "Aucune session réelle vérifiée", action: "Voir les sessions →", destination: "sessions" },
];

export function OverviewScreen({ onNavigate }: { onNavigate: (section: OverviewDestination) => void }) {
  return (
    <section className="overview" aria-labelledby="overview-title">
      <header className="overview-heading">
        <div className="overview-path">BUREAU / OPTIC</div>
        <h1 id="overview-title">Votre bureau</h1>
        <p className="intro">Préparez votre environnement sans perdre votre contexte.</p>
      </header>

      <div className="feature-strip" aria-label="Prochaine action">
        <div>
          <div className="eyebrow">VOTRE PROCHAINE ACTION</div>
          <h2>Créer une session sécurisée</h2>
          <p>Commencez par sélectionner un projet. Aucun droit réel n'est encore disponible.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => onNavigate("projects")}>Voir les projets →</button>
      </div>

      <section aria-labelledby="context-title">
        <div className="section-heading"><h2 id="context-title">Votre contexte</h2></div>
        <div className="context-grid">
          {context.map(({ label, title, detail }) => (
            <div className="context-item" key={label}>
              <small>{label}</small>
              <strong>{title}</strong>
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="checks-title">
        <div className="section-heading"><h2 id="checks-title">À vérifier avant le lancement</h2></div>
        <div className="check-list">
          {checks.map(({ label, detail, action, destination }) => (
            <div key={label}>
              <strong>{label}</strong>
              <span>{detail}</span>
              <button type="button" onClick={() => onNavigate(destination)} aria-label={action + " " + label}>{action}</button>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="activity-title">
        <div className="section-heading activity-heading">
          <h2 id="activity-title">Activité récente</h2>
          <button type="button" className="activity-link" onClick={() => onNavigate("supervision")}>Ouvrir le journal →</button>
        </div>
        <p className="empty-activity">Aucun événement réel disponible. Le Bridge n'est pas connecté.</p>
      </section>
    </section>
  );
}
