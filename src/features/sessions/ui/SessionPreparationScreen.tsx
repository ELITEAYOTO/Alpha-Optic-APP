import { useState } from "react";

export interface SessionProjectOption { readonly id: string; readonly name: string }
type RequestIntent = "read" | "modify" | "create" | "delete";
const permissionChoices: readonly { id: RequestIntent; label: string; detail: string }[] = [
  { id: "read", label: "Lire", detail: "Consulter des fichiers du futur périmètre" },
  { id: "modify", label: "Modifier", detail: "Modifier après autorisation réelle" },
  { id: "create", label: "Créer", detail: "Créer après autorisation réelle" },
  { id: "delete", label: "Supprimer", detail: "Action sensible à confirmer séparément" },
];
const steps = [
  ["Projet et ressources", "Choisir le périmètre"],
  ["Assistant local", "Vérifier la connexion"],
  ["Autorisations", "Préciser la demande"],
  ["Vérification", "Relire la préparation"],
] as const;

interface Props {
  projects: readonly SessionProjectOption[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onCancel: () => void;
}

export function SessionPreparationScreen({ projects, selectedProjectId,
  onSelectProject, onCreateProject, onCancel }: Props) {
  const [step, setStep] = useState(1);
  const [requests, setRequests] = useState<readonly RequestIntent[]>([]);
  const [duration, setDuration] = useState<15 | 60>(15);
  const project = projects.find(item => item.id === selectedProjectId);

  function toggleRequest(id: RequestIntent) {
    setRequests(items => items.includes(id) ? items.filter(value => value !== id) : [...items, id]);
  }

  return (
    <section className="module-screen session-screen" aria-labelledby="session-title">
      <header className="session-heading">
        <div className="session-heading-line">
          <span className="eyebrow">BROUILLON / CONFIGURATION</span>
          <span className="session-progress-label">ÉTAPE {step} / 4</span>
        </div>
        <h1 id="session-title">Préparer une session</h1>
        <p className="intro">Définissez le contexte de la session. Aucune session n'est encore ouverte.</p>
      </header>

      <div className="session-layout">
        <aside className="session-steps" aria-label="Étapes de préparation">
          <div className="session-steps-caption">ÉTAPES DE PRÉPARATION</div>
          <ol>
            {steps.map(([title, description], index) => (
              <li key={title} aria-current={step === index + 1 ? "step" : undefined}
                className={step === index + 1 ? "active" : ""}>
                <span className="session-step-number">{String(index + 1).padStart(2, "0")}</span>
                <span><strong>{title}</strong><small>{description}</small></span>
              </li>
            ))}
          </ol>
        </aside>
        <div className="session-editor">
          {step === 1 && <>
            <h2>Projet et ressources</h2>
            <p className="session-editor-lead">Choisissez un brouillon local. Le rattachement d'un dossier réel sera proposé après intégration sécurisée.</p>
            <div className="session-field-row">
              <label htmlFor="session-project">PROJET</label>
              <div className="session-field-body">
                <select id="session-project" value={project?.id ?? ""} onChange={event => onSelectProject(event.target.value)}>
                  <option value="">Choisir un projet local</option>
                  {projects.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <small>Aucun accès au système de fichiers n'est attribué.</small>
              </div>
            </div>
            <div className="session-field-row">
              <span className="session-field-label">RESSOURCES</span>
              <div className="session-field-body session-readonly">
                <strong>Pas de dossier associé</strong>
                <small>Choix de dossier indisponible sans contrat Bridge validé.</small>
              </div>
            </div>
            {!project && <button className="session-link" type="button" onClick={onCreateProject}>
              + Créer un brouillon dans Projets
            </button>}
          </>}
          {step === 2 && <>
            <h2>Assistant local</h2>
            <p className="session-editor-lead">L'interface prépare le contexte, sans inventer de connexion active.</p>
            <div className="session-field-row">
              <span className="session-field-label">ASSISTANT</span>
              <div className="session-field-body session-readonly">
                <strong>Aucun assistant vérifié</strong>
                <small>Connexion authentifiée à intégrer ultérieurement.</small>
              </div>
            </div>
            <div className="session-alert">
              <strong>Bridge non connecté</strong>
              <p>Vous pouvez parcourir les étapes pour revoir l'interface, mais aucun assistant ne sera lancé.</p>
            </div>
          </>}
          {step === 3 && <>
            <h2>Autorisations envisagées</h2>
            <p className="session-editor-lead">Cochez uniquement les droits que vous souhaiteriez demander. Ce choix est une intention visuelle, jamais une permission effective.</p>
            <fieldset className="session-permission-grid">
              <legend>Intentions d'accès pour la revue</legend>
              {permissionChoices.map(permission => (
                <label className="session-permission" key={permission.id}>
                  <input type="checkbox" checked={requests.includes(permission.id)}
                    onChange={() => toggleRequest(permission.id)} />
                  <span><strong>{permission.label}</strong><small>{permission.detail}</small></span>
                </label>
              ))}
            </fieldset>
            <div className="session-field-row">
              <label htmlFor="session-duration">DURÉE ENVISAGÉE</label>
              <div className="session-field-body">
                <select id="session-duration" value={duration}
                  onChange={event => setDuration(event.target.value === "60" ? 60 : 15)}>
                  <option value="15">15 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
                <small>Aucune durée ni autorisation transmise au Bridge.</small>
              </div>
            </div>
          </>}
          {step === 4 && <>
            <h2>Vérification du brouillon</h2>
            <p className="session-editor-lead">Résumé de la préparation locale, sans valeur d'autorisation.</p>
            <dl className="session-review">
              <div><dt>Projet</dt><dd>{project?.name ?? "Aucun projet"}</dd></div>
              <div><dt>Dossier</dt><dd>Non associé</dd></div>
              <div><dt>Assistant</dt><dd>Non connecté</dd></div>
              <div><dt>Demandes envisagées</dt><dd>{requests.length
                ? permissionChoices.filter(item => requests.includes(item.id)).map(item => item.label).join(", ")
                : "Aucune"}</dd></div>
              <div><dt>Durée envisagée</dt><dd>{duration} minutes</dd></div>
              <div><dt>Session réelle</dt><dd>Non créée</dd></div>
            </dl>
          </>}
          <div className="session-safety" role="status">
            <strong>Aucune permission implicite</strong>
            <span>Le Bridge est seul habilité à ouvrir une session, attribuer des droits et prouver l'arrêt natif.</span>
          </div>
        </div>
      </div>

      <footer className="session-footer">
        <button type="button" className="session-cancel" onClick={onCancel}>Annuler</button>
        <div className="session-footer-actions">
          {step > 1 && <button type="button" className="session-cancel" onClick={() => setStep(value => value - 1)}>Précédent</button>}
          {step < 4 ? (
            <button type="button" className="session-next" disabled={step === 1 && !project}
              onClick={() => setStep(value => value + 1)}>
              Continuer →
            </button>
          ) : <button className="session-next" type="button" disabled title="Bridge non connecté : création de session indisponible">
            Démarrer la session — indisponible
          </button>}
        </div>
      </footer>
      <p className="session-bottom-note">Préparation d'interface uniquement — aucun lancement, accès, dossier ni permission réelle.</p>
    </section>
  );
}
