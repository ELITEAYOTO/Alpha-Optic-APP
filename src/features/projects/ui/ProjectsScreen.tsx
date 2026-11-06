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

export function ProjectsScreen({ projects, selectedProjectId, createOpen,
  onStartCreate, onCancelCreate, onCreate, onSelect, onPrepare }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = onCreate(name);
    if (!result.ok) { setError(result.error ?? "Création impossible."); return; }
    setName("");
    setError(null);
  }

  return (
    <section className="module-screen projects-screen" aria-labelledby="projects-title">
      <div className="projects-heading">
        <div>
          <div className="eyebrow">ESPACE DE TRAVAIL / PROJETS</div>
          <h1 id="projects-title">Vos projets</h1>
          <p className="intro">Préparez vos projets avant d'ouvrir une session sécurisée.</p>
        </div>
        <button type="button" className="projects-primary" onClick={onStartCreate}>
          + Nouveau projet
        </button>
      </div>
      <p className="projects-security-note" role="status">
        Mode préparation locale : aucun dossier n'est créé ou ouvert sur votre ordinateur.
        Les brouillons ne donnent aucun accès au Bridge.
      </p>

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
          <p id="projects-form-hint">Nom uniquement — aucun dossier, fichier ou droit système.</p>
          {error && <p id="projects-form-error" className="projects-error" role="alert">{error}</p>}
        </form>
      )}

      <div className="projects-list-heading">
        <h2>Brouillons locaux</h2>
        <span>{projects.length} / 20</span>
      </div>
      {projects.length === 0 ? (
        <div className="projects-empty">
          <strong>Aucun projet local enregistré</strong>
          <p>Créez un brouillon pour configurer le contexte d'une prochaine session. Les trois projets du Bureau restent des exemples fictifs.</p>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map(project => (
            <div className="projects-row" key={project.id}>
              <div className="projects-row-details">
                <strong>{project.name}</strong>
                <span>Créé le {new Date(project.createdAt).toLocaleDateString("fr-FR")} · Brouillon local</span>
              </div>
              {selectedProjectId === project.id && <span className="projects-selected">Sélectionné</span>}
              <button className="projects-text-button" type="button" onClick={() => onSelect(project.id)}
                aria-pressed={selectedProjectId === project.id}>Sélectionner</button>
              <button className="projects-outline" type="button" onClick={() => onPrepare(project.id)}>
                Préparer une session →
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
