import type { ReactNode } from "react";
import { destinations, type Destination } from "../navigation";
import { NavigationIcon } from "./NavigationIcon";
import { OFFLINE_CONTROL_STATUS, summarizeControlStatus } from "../../contracts/control-status";

const offlinePresentation = summarizeControlStatus(OFFLINE_CONTROL_STATUS);

interface Props {
  active: Destination;
  onNavigate: (value: Destination) => void;
  children: ReactNode;
}

export function DesktopShell({ active, onNavigate, children }: Props) {
  return (
    <div className="desktop-shell">
      <header className="titlebar">
        <div className="identity" aria-label="Optic">
          <img className="optic-logo" src="/assets/optic-logo-48.png" alt="" width="30" height="30" />
          <strong>optic</strong><span className="identity-caption">DESKTOP</span>
        </div>
        <div className="breadcrumb">/ Espace de travail / {destinations.find(({ id }) => id === active)?.label}</div>
        <div className="title-actions">
          <span className="simulation-mark" aria-label="Mode hors ligne">{offlinePresentation.source}</span>
          <span className="bridge-state"><span className="state-dot" />{offlinePresentation.bridge}</span>
          <button type="button" disabled title="Contrat Bridge non connecté">Démarrer</button>
        </div>
      </header>
      <div className="workspace">
        <nav className="icon-rail" aria-label="Navigation principale">
          {destinations.map(({ id, label }) => (
            <button
              type="button"
              key={id}
              title={label}
              aria-label={label}
              aria-current={id === active ? "page" : undefined}
              onClick={() => onNavigate(id)}
            >
              <NavigationIcon name={id} />
            </button>
          ))}
        </nav>
        <aside className="explorer" aria-label="Explorateur Optic">
          <div className="explorer-kicker">EXPLORATEUR</div>
          <div className="project-selector">
            <span className="project-glyph"><NavigationIcon name="projects" /></span>
            <span><strong>Aucun projet</strong><small>Mode démonstration</small></span>
          </div>
          <div className="explorer-kicker">ACCÈS RAPIDE</div>
          <div className="explorer-links">
            {destinations.map(({ id, label }) => (
              <button key={id} type="button" className={id === active ? "selected" : ""} aria-current={id === active ? "page" : undefined} onClick={() => onNavigate(id)}>
                {label}
              </button>
            ))}
          </div>
          <div className="explorer-footer">
            <span className="state-dot" />Bridge non connecté
            <small>Autorité réelle indisponible</small>
          </div>
        </aside>
        <main id="main-content" className="workarea">{children}</main>
      </div>
      <footer className="statusbar">
        <span>● {offlinePresentation.source}</span>
        <span>{offlinePresentation.session} · {offlinePresentation.authorization} · {offlinePresentation.nativeTermination}</span>
        <span>Optic 0.0.1</span>
      </footer>
    </div>
  );
}
