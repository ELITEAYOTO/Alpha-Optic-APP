import { useState, type FormEvent } from "react";
import type { LocalProjectDraft } from "../model/local-drafts";

interface Props {
  projects: readonly LocalProjectDraft[];
  selectedProjectId: string | null;
  createOpen: boolean;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onCreate: (name: string) => { ok: boolean; error?: string };
  onSelect: (id: string) => void;
  onPrepare: (id: string) => void;
}

/** UI D library: project rows, selected context and actions are distinct views.
 * Nothing here grants Bridge authority or opens a filesystem folder.
 */
export function ProjectsScreen({ projects, selectedProjectId, createOpen,
  onStartCreate, onCancelCreate, onCreate, onSelect, onPrepare }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const selectedProject = projects.find(project => project.id === selectedProjectId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onCreate(name);
    if (!result.ok) { setError(result.error ?? "Création impossible."); return; }
    setName("");
    setError(null);
  }

  return (
    <section className="module-screen projects-screen" aria-labelledby="projects-title">
      <header className="projects-heading">
        <div className="projects-heading-top">
          <span className="projects-kicker">ESPACES DE TRAVAIL / GESTION</span>
          <span className="projects-count">
            {projects.length === 0 ? "1 EXEMPLE FICTIF" : `${projects.length} BROUILLON${projects.length > 1 ? "S" : ""} ${projects.length > 1 ? "LOCAUX" : "LOCAL"}`}
          </span>
        </div>
        <div className="projects-heading-main">
          <div>
            <h1 id="projects-title">Projets</h1>
            <p className="intro">Préparez un projet local, puis définissez les droits de ses sessions.</p>
          </div>
          <button type="button" className="projects-primary" onClick={onStartCreate}>
            Ajouter un projet +
          </button>
        </div>
      </header>

      {createOpen && (
        <form className="projects-create" onSubmit={submit} aria-labelledby="projects-create-title">
          <div className="projects-create-top">
            <h2 id="projects-create-title">Créer un brouillon de projet</h2>
            <button className="projects-text-button" type="button" onClick={() => { setError(null); onCancelCreate(); }}>
              Annuler
            </button>
          </div>
          <label htmlFor="projects-name">Nom du projet</label>
          <div className="projects-form-row">
            <input id="projects-name" autoFocus autoComplete="off" maxLength={64}
              value={name} onChange={event => { setName(event.target.value); setError(null); }}
              placeholder="Ex. Portfolio web" aria-describedby="projects-form-hint projects-form-error" />
            <button className="projects-primary" type="submit">Enregistrer le brouillon</button>
          </div>
          <p id="projects-form-hint">Nom uniquement : aucune création de dossier, aucun accès aux fichiers.</p>
          {error && <p id="projects-form-error" className="projects-error" role="alert">{error}</p>}
        </form>
      )}

      <section className="projects-library" aria-labelledby="projects-library-title">
        <div className="projects-section-label" id="projects-library-title">PROJETS LOCAUX</div>
        <div className="projects-library-list">
          {projects.length === 0 ? (
            <div className="projects-library-card projects-demo-card">
              <div className="projects-library-details">
                <strong>optic-lab</strong>
                <span>Projet de démonstration · Aucun processus en cours</span>
                <small>Exemple fictif — aucun dossier associé</small>
              </div>
              <div className="projects-library-trailing">
                <span>Hors session</span>
                <button type="button" className="projects-text-button" onClick={onStartCreate}>
                  Créer un projet →
                </button>
              </div>
            </div>
          ) : projects.map(project => (
            <div className="projects-library-card" key={project.id}
              data-selected={selectedProjectId === project.id ? "true" : undefined}>
              <div className="projects-library-details">
                <strong>{project.name}</strong>
                <span>Brouillon local · Aucun processus en cours</span>
                <small>Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")} · Aucun dossier associé</small>
              </div>
              <div className="projects-library-trailing">
                <span>{selectedProjectId === project.id ? "Sélectionné" : "Hors session"}</span>
                <button type="button" className="projects-text-button" onClick={() => onSelect(project.id)}
                  aria-pressed={selectedProjectId === project.id}>
                  Ouvrir →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="projects-current" aria-labelledby="projects-current-title">
        <div className="projects-section-label" id="projects-current-title">PROJET SÉLECTIONNÉ</div>
        <div className="projects-context">
          <div>
            <small>SOURCE</small>
            <strong>{selectedProject ? "Brouillon local" : "Aucun dossier"}</strong>
          </div>
          <div>
            <small>ASSISTANT</small>
            <strong>Non connecté</strong>
          </div>
          <div>
            <small>DROITS</small>
            <strong>Aucun droit effectif</strong>
          </div>
        </div>
        <p className="projects-context-note">
          {selectedProject
            ? `« ${selectedProject.name} » est sélectionné, mais aucun dossier réel n'est accessible.`
            : "Choisissez un brouillon local pour préparer sa session. L'exemple optic-lab n'est pas un projet réel."}
        </p>
      </section>

      <section className="projects-actions" aria-labelledby="projects-actions-title">
        <div className="projects-section-label" id="projects-actions-title">ACTIONS DU PROJET</div>
        <button type="button" className="projects-action-row"
          disabled={!selectedProject} onClick={() => selectedProject && onPrepare(selectedProject.id)}>
          <strong>Préparer une session</strong>
          <span>Projet, assistant et intentions de droits</span>
          <span className="projects-chevron" aria-hidden="true">›</span>
        </button>
        <button type="button" className="projects-action-row" disabled
          title="Aucun dossier réel associé à ce brouillon">
          <strong>Ouvrir le dossier</strong>
          <span>Dossier réel non associé</span>
          <span className="projects-chevron" aria-hidden="true">›</span>
        </button>
        <button type="button" className="projects-action-row" disabled
          title="Aucune session réelle disponible sans Bridge">
          <strong>Voir les sessions</strong>
          <span>Aucune session active</span>
          <span className="projects-chevron" aria-hidden="true">›</span>
        </button>
      </section>
      <p className="projects-footnote" role="status">
        Préparation locale uniquement — aucun dossier créé, aucune permission ni session réelle.
      </p>
    </section>
  );
}
