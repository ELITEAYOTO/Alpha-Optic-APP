import { useState } from "react";
import { destinations, type Destination } from "./navigation";
import { DesktopShell } from "./layout/DesktopShell";
import { OverviewScreen } from "../features/overview";
import { SupervisionScreen } from "../features/supervision";
import { DeveloperTerminalScreen } from "../features/terminal";
import { SettingsScreen } from "../features/settings";
import { UpdatesPanel } from "../features/updates";
import packageInfo from "../../package.json";

const descriptions: Record<Destination, string> = {
  home: "Le point de départ de votre espace de travail.",
  projects: "Un projet n'accorde jamais automatiquement l'accès à ses fichiers.",
  sessions: "L'état des sessions appartient au Bridge, pas à l'interface.",
  permissions: "Les demandes et les droits effectifs restent distincts.",
  supervision: "Observer les événements du Bridge sans autorité d'exécution.",
  terminal: "Exécuter des tâches uniquement après autorisation Rust.",
  connections: "Connexions MCP à configurer après validation des contrats.",
  settings: "Paramètres et thèmes, sans modifier la politique Rust.",
};

export function App() {
  const [section, setSection] = useState<Destination>("home");
  const item = destinations.find(({ id }) => id === section);
  const content = section === "home"
    ? <OverviewScreen onNavigate={setSection} />
    : section === "supervision"
      ? <SupervisionScreen />
      : section === "terminal"
        ? <DeveloperTerminalScreen />
        : section === "settings"
          ? <SettingsScreen updatesSection={<UpdatesPanel prototypeVersion={packageInfo.version} />} />
          : (
          <section className="placeholder" aria-labelledby="placeholder-title">
            <div className="eyebrow">MODULE EN PRÉPARATION</div>
            <h1 id="placeholder-title">{item?.label}</h1>
            <p>{descriptions[section]}</p>
            <div className="notice">Aucune connexion au Bridge n'est établie dans cette version. Les fonctions réelles restent désactivées.</div>
          </section>
        );

  return (
    <DesktopShell active={section} onNavigate={setSection}>
      {content}
    </DesktopShell>
  );
}
