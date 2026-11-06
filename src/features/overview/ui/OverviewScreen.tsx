import { overviewDisplay, exampleRecentProjects } from "../model/demo";

interface OverviewProject { readonly id: string; readonly name: string; readonly createdAt: string }
type OverviewDestination = "projects" | "sessions";

interface Props {
  onNavigate: (section: OverviewDestination) => void;
  localProjects: readonly OverviewProject[];
  selectedProjectId: string | null;
  onNewProject: () => void;
  onResumeLocal: (id: string) => void;
}

export function OverviewScreen({ onNavigate, localProjects, selectedProjectId,
  onNewProject, onResumeLocal }: Props) {
  const chosen = localProjects.find(project => project.id === selectedProjectId);
  const context = [
    { label: "PROJET", title: chosen?.name ?? overviewDisplay.project.title,
      detail: chosen ? "Brouillon local — aucun dossier ouvert" : overviewDisplay.project.detail },
    { label: "ASSISTANT", ...overviewDisplay.assistant },
    { label: "SESSION", ...overviewDisplay.session },
  ];
  const recentRows = [
    ...localProjects.map(project => ({
      id: project.id, name: project.name,
      detail: "Brouillon local · non lancé", local: true,
    })),
    ...exampleRecentProjects.map(project => ({
      id: project.id, name: project.name,
      detail: `${project.date} · ${project.duration} de travail · Exemple fictif`, local: false,
    })),
  ].slice(0, 3);

  return (
    <section className="overview" aria-labelledby="overview-title">
      <header className="overview-heading">
        <div className="overview-topline">
          <div className="overview-path">BUREAU / OPTIC</div>
        </div>
        <h1 id="overview-title">Votre bureau</h1>
        <p className="intro">Préparez votre environnement sans perdre votre contexte.</p>
      </header>

      <div className="feature-strip" aria-label="Prochaine action">
        <div>
          <div className="eyebrow">VOTRE PROCHAINE ACTION</div>
          <h2>Créer une session sécurisée</h2>
          <p>Commencez par sélectionner un projet. Aucun droit réel n'est encore disponible.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => onNavigate("sessions")}>
          Préparer une session →
        </button>
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

      <section aria-labelledby="recent-projects-title" className="recent-projects">
        <div className="section-heading recent-heading">
          <h2 id="recent-projects-title">Projets récents</h2>
          <button type="button" className="new-project-link" onClick={onNewProject}>
            + Nouveau projet
          </button>
        </div>
        <p className="recent-example-notice">
          {localProjects.length > 0
            ? "Vos brouillons locaux apparaissent en premier. Les autres lignes restent fictives."
            : "Exemples fictifs — aucune reprise réelle disponible dans cette démonstration."}
        </p>
        <div className="recent-project-list">
          {recentRows.map(project => (
            <div className="recent-project" key={project.id}>
              <div className="recent-project-name"><span className="recent-project-dot" aria-hidden="true" />
                <strong>Projet : {project.name}</strong>
              </div>
              <span className="recent-project-meta">{project.detail}</span>
              <button type="button" className="recent-project-resume" disabled={!project.local}
                title={project.local ? "Ouvrir le brouillon local" : "Exemple fictif : reprise indisponible"}
                onClick={() => project.local && onResumeLocal(project.id)}
                aria-label={project.local ? "Reprendre le brouillon " + project.name : "Reprise indisponible : " + project.name}>
                Reprendre →
              </button>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
