import { overviewDisplay, exampleRecentProjects } from "../model/demo";

type OverviewDestination = "projects";
type Appearance = "light" | "dark";

const context = [
  { label: "PROJET", ...overviewDisplay.project },
  { label: "ASSISTANT", ...overviewDisplay.assistant },
  { label: "SESSION", ...overviewDisplay.session },
] as const;

interface Props {
  onNavigate: (section: OverviewDestination) => void;
  appearance: Appearance;
  onToggleAppearance: () => void;
}

export function OverviewScreen({ onNavigate, appearance, onToggleAppearance }: Props) {
  return (
    <section className="overview" aria-labelledby="overview-title">
      <header className="overview-heading">
        <div className="overview-topline">
          <div className="overview-path">BUREAU / OPTIC</div>
          <button type="button" className="theme-toggle" onClick={onToggleAppearance}
            aria-label={appearance === "dark" ? "Activer le thème clair" : "Activer le thème sombre"}
            title="Seules les couleurs de l'interface changent">
            Thème : {appearance === "dark" ? "Carbone et corail" : "Lin et grenat"} <span aria-hidden="true">▾</span>
          </button>
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
        <button type="button" className="primary-button" onClick={() => onNavigate("projects")}>
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
          <button type="button" className="new-project-link" onClick={() => onNavigate("projects")}>
            + Nouveau projet
          </button>
        </div>
        <p className="recent-example-notice">Exemples fictifs — aucune reprise réelle disponible dans cette démonstration.</p>
        <div className="recent-project-list">
          {exampleRecentProjects.map(project => (
            <div className="recent-project" key={project.id}>
              <div className="recent-project-name"><span className="recent-project-dot" aria-hidden="true" />
                <strong>Projet : {project.name}</strong>
              </div>
              <span className="recent-project-meta">{project.date} · {project.duration} de travail</span>
              <button type="button" className="recent-project-resume" disabled
                title="Reprise indisponible : Bridge et accès au projet non connectés"
                aria-label={"Reprendre " + project.name + " (indisponible dans la démonstration)"}>
                Reprendre →
              </button>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
