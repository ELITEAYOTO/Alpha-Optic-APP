import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { isTauri } from "@tauri-apps/api/core";
import { destinations, type Destination } from "../navigation";
import { NavigationIcon } from "./NavigationIcon";
import { OFFLINE_CONTROL_STATUS, summarizeControlStatus } from "../../contracts/control-status";

const offlinePresentation = summarizeControlStatus(OFFLINE_CONTROL_STATUS);

interface Props {
  active: Destination;
  onNavigate: (value: Destination) => void;
  children: ReactNode;
  selectedProjectName: string | null;
}

type WindowAction = "minimize" | "maximize" | "close";

export function DesktopShell({ active, onNavigate, children, selectedProjectName }: Props) {
  const [explorerHidden, setExplorerHidden] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");
  const [windowError, setWindowError] = useState<string | null>(null);
  const commandInput = useRef<HTMLInputElement>(null);
  const commandTrigger = useRef<HTMLButtonElement>(null);
  const nativeWindowAvailable = isTauri();

  const matchedDestinations = useMemo(() => {
    const query = commandQuery.trim().toLocaleLowerCase("fr");
    return destinations.filter(({ label }) => label.toLocaleLowerCase("fr").includes(query));
  }, [commandQuery]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(open => !open);
      } else if (event.key === "Escape") {
        setCommandOpen(false);
      }
    }
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (commandOpen) commandInput.current?.focus();
  }, [commandOpen]);

  function openDestination(destination: Destination) {
    onNavigate(destination);
    setCommandOpen(false);
    setCommandQuery("");
    commandTrigger.current?.focus();
  }

  function performWindowAction(action: WindowAction) {
    if (!nativeWindowAvailable) return;
    setWindowError(null);
    const current = getCurrentWindow();
    const operation = action === "minimize" ? current.minimize()
      : action === "maximize" ? current.toggleMaximize()
      : current.close();
    void operation.catch(() => setWindowError("Cette commande de fenêtre n'a pas pu être exécutée."));
  }

  return (
    <div className="desktop-shell">
      <header className="titlebar" data-tauri-drag-region>
        <div className="titlebar-main" data-tauri-drag-region>
          <div className="identity" aria-label="Optic" data-tauri-drag-region>
            <img className="optic-logo" src="/assets/optic-logo-48.png" alt="" width="30" height="30" />
            <strong>optic</strong><span className="identity-caption">DESKTOP</span>
          </div>
          <div className="breadcrumb" data-tauri-drag-region>
            / Espace de travail / {destinations.find(({ id }) => id === active)?.label}
          </div>
        </div>
          <button type="button" className="command-trigger" ref={commandTrigger}
            aria-haspopup="dialog" aria-controls="command-palette" aria-expanded={commandOpen}
            title="Rechercher une commande (Ctrl+K)" onClick={() => setCommandOpen(open => !open)}>
            <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="1.7" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" />
            </svg>
            <span>Rechercher une commande…</span><kbd>Ctrl K</kbd>
          </button>
        <div className="titlebar-tools">

          <div className="title-actions">
            <span className="bridge-state"><span className="state-dot" />Bridge non connecté</span>
            <button type="button" disabled title="Bridge non connecté : démarrage indisponible">Démarrer</button>
            <button type="button" disabled title="Bridge non connecté : arrêt indisponible">Arrêter</button>
          </div>
          <div className="window-controls" role="group" aria-label="Fenêtre Optic">
            <button type="button" aria-label="Réduire la fenêtre" title="Réduire"
              disabled={!nativeWindowAvailable} onClick={() => performWindowAction("minimize")}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="M3 8h10" /></svg>
            </button>
            <button type="button" aria-label="Agrandir ou restaurer la fenêtre" title="Agrandir / Restaurer"
              disabled={!nativeWindowAvailable} onClick={() => performWindowAction("maximize")}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><rect x="3.25" y="3.25" width="9.5" height="9.5" /></svg>
            </button>
            <button type="button" className="window-close" aria-label="Fermer la fenêtre" title="Fermer"
              disabled={!nativeWindowAvailable} onClick={() => performWindowAction("close")}>
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true"><path d="m3.5 3.5 9 9m0-9-9 9" /></svg>
            </button>
          </div>
        </div>
        {commandOpen && (
          <div className="command-palette" role="dialog" aria-label="Recherche de commandes" id="command-palette">
            <input ref={commandInput} type="search" value={commandQuery} aria-label="Rechercher une destination"
              placeholder="Rechercher une page…" onChange={event => setCommandQuery(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter" && matchedDestinations[0]) openDestination(matchedDestinations[0].id);
              }} />
            <div className="command-results">
              {matchedDestinations.length > 0
                ? matchedDestinations.map(destination => (
                  <button type="button" key={destination.id}
                    onClick={() => openDestination(destination.id)}>
                    {destination.label}
                  </button>
                ))
                : <p>Aucune page trouvée.</p>}
            </div>
            <div className="command-hint">Navigation uniquement. Aucune commande native ou permission Bridge.</div>
          </div>
        )}
        {windowError && <div className="titlebar-error" role="alert">{windowError}</div>}
      </header>

      <div className={`workspace${explorerHidden ? " explorer-collapsed" : ""}`}>
        <nav className="icon-rail" aria-label="Navigation principale">
          <button
            type="button"
            className="explorer-toggle"
            title={explorerHidden ? "Afficher l’explorateur" : "Masquer l’explorateur"}
            aria-label={explorerHidden ? "Afficher l’explorateur" : "Masquer l’explorateur"}
            aria-controls="optic-explorer"
            aria-expanded={!explorerHidden}
            onClick={() => setExplorerHidden(hidden => !hidden)}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
              <path d={explorerHidden ? "m13 10 3 2-3 2" : "m16 10-3 2 3 2"} />
            </svg>
          </button>
          <span className="rail-divider" aria-hidden="true" />
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
        <aside id="optic-explorer" className="explorer" aria-label="Explorateur Optic" hidden={explorerHidden}>
          <div className="explorer-kicker">EXPLORATEUR</div>
          <div className="project-selector">
            <span className="project-glyph"><NavigationIcon name="projects" /></span>
            <span><strong>{selectedProjectName ?? "Aucun projet"}</strong><small>{selectedProjectName ? "Brouillon local · aucun accès" : "Mode démonstration"}</small></span>
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
