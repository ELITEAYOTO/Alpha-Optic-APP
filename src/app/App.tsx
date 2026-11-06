import { useState, type CSSProperties } from "react";
import { destinations, type Destination } from "./navigation";
import { DesktopShell } from "./layout/DesktopShell";
import { OverviewScreen } from "../features/overview";
import { SupervisionScreen } from "../features/supervision";
import { DeveloperTerminalScreen } from "../features/terminal";
import { SettingsScreen } from "../features/settings";
import { ThemePicker } from "../features/themes";
import { UpdatesPanel } from "../features/updates";
import packageInfo from "../../package.json";
import { DEFAULT_THEME_ID, findBuiltinTheme } from "../features/themes/model/builtin-themes";
import { themeToCssVariables } from "../features/themes/model/theme-manifest";

const THEME_PREFERENCE_KEY = "optic.ui.theme-id";

function readThemePreference(): string {
  try {
    const id = window.localStorage.getItem(THEME_PREFERENCE_KEY);
    return findBuiltinTheme(id)?.id ?? DEFAULT_THEME_ID;
  } catch {
    return DEFAULT_THEME_ID;
  }
}

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
  const [selectedThemeId, setSelectedThemeId] = useState(readThemePreference);
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);
  const renderedTheme = findBuiltinTheme(previewThemeId) ?? findBuiltinTheme(selectedThemeId)!;

  function selectTheme(id: string) {
    const theme = findBuiltinTheme(id);
    if (!theme) return;
    setSelectedThemeId(theme.id);
    setPreviewThemeId(null);
    try { window.localStorage.setItem(THEME_PREFERENCE_KEY, theme.id); }
    catch { /* Theme stays active for this session if storage is unavailable. */ }
  }
  function navigateTo(destination: Destination) {
    // Preview is only temporary while browsing the appearance settings.
    // Clear it synchronously even when navigation unmounts a hovered theme card.
    setPreviewThemeId(null);
    setSection(destination);
  }

  const item = destinations.find(({ id }) => id === section);
  const content = section === "home"
    ? <OverviewScreen onNavigate={navigateTo} />
    : section === "supervision"
      ? <SupervisionScreen onReturnHome={() => navigateTo("home")} />
      : section === "terminal"
        ? <DeveloperTerminalScreen />
        : section === "settings"
          ? <SettingsScreen updatesSection={<UpdatesPanel prototypeVersion={packageInfo.version} />}
              appearanceSection={<ThemePicker activeThemeId={selectedThemeId}
                previewThemeId={previewThemeId}
                onPreviewTheme={setPreviewThemeId}
                onSelectTheme={selectTheme} />} />
          : (
          <section className="placeholder" aria-labelledby="placeholder-title">
            <div className="eyebrow">MODULE EN PRÉPARATION</div>
            <h1 id="placeholder-title">{item?.label}</h1>
            <p>{descriptions[section]}</p>
            <div className="notice">Aucune connexion au Bridge n'est établie dans cette version. Les fonctions réelles restent désactivées.</div>
          </section>
        );

  return (
    <div className="optic-theme-root" data-theme={renderedTheme.id}
      style={{ ...themeToCssVariables(renderedTheme), colorScheme: renderedTheme.appearance } as CSSProperties}>
      <DesktopShell active={section} onNavigate={navigateTo}>
        {content}
      </DesktopShell>
    </div>
  );
}
