import { useState, type CSSProperties } from "react";
import { destinations, type Destination } from "./navigation";
import { DesktopShell } from "./layout/DesktopShell";
import { OverviewScreen } from "../features/overview";
import { SupervisionScreen } from "../features/supervision";
import { DeveloperTerminalScreen } from "../features/terminal";
import { SettingsScreen } from "../features/settings";
import { ThemePicker } from "../features/themes";
import { ProjectsScreen, LOCAL_PROJECTS_KEY, parseLocalProjects,
  appendLocalProject, serializeLocalProjects, type LocalProjectDraft } from "../features/projects";
import { SessionPreparationScreen } from "../features/sessions";
import { UpdatesPanel } from "../features/updates";
import packageInfo from "../../package.json";
import { DEFAULT_THEME_ID, findBuiltinTheme } from "../features/themes/model/builtin-themes";
import { themeToCssVariables } from "../features/themes/model/theme-manifest";

const THEME_PREFERENCE_KEY = "optic.ui.theme-id";

function readProjectPreference(): LocalProjectDraft[] {
  try { return parseLocalProjects(window.localStorage.getItem(LOCAL_PROJECTS_KEY)); }
  catch { return []; }
}

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
  const [projects, setProjects] = useState<LocalProjectDraft[]>(readProjectPreference);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectCreateOpen, setProjectCreateOpen] = useState(false);
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
    // Theme previews are transient; navigation must not leave a hover preview active.
    setPreviewThemeId(null);
    if (destination !== "projects") setProjectCreateOpen(false);
    setSection(destination);
  }

  function startNewProject() {
    setProjectCreateOpen(true);
    navigateTo("projects");
  }

  function createProject(name: string): { ok: boolean; error?: string } {
    try {
      const result = appendLocalProject(projects, name,
        "draft-" + window.crypto.randomUUID(), new Date().toISOString());
      // Commit to UI state only if the local draft actually persisted.
      window.localStorage.setItem(LOCAL_PROJECTS_KEY, serializeLocalProjects(result.projects));
      setProjects(result.projects);
      setSelectedProjectId(result.created.id);
      setProjectCreateOpen(false);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Enregistrement local impossible." };
    }
  }

  function selectLocalProject(id: string) {
    if (!id) { setSelectedProjectId(null); return; }
    if (projects.some(project => project.id === id)) setSelectedProjectId(id);
  }

  function prepareLocalProject(id: string) {
    if (!projects.some(project => project.id === id)) return;
    setSelectedProjectId(id);
    navigateTo("sessions");
  }

  function resumeLocalProject(id: string) {
    if (!projects.some(project => project.id === id)) return;
    setSelectedProjectId(id);
    navigateTo("projects");
  }

  const item = destinations.find(({ id }) => id === section);
  const content = section === "home"
    ? <OverviewScreen onNavigate={navigateTo} localProjects={projects}
        selectedProjectId={selectedProjectId} onNewProject={startNewProject}
        onResumeLocal={resumeLocalProject} />
    : section === "projects"
      ? <ProjectsScreen projects={projects} selectedProjectId={selectedProjectId}
          createOpen={projectCreateOpen} onStartCreate={() => setProjectCreateOpen(true)}
          onCancelCreate={() => setProjectCreateOpen(false)} onCreate={createProject}
          onSelect={selectLocalProject} onPrepare={prepareLocalProject} />
      : section === "sessions"
        ? <SessionPreparationScreen projects={projects} selectedProjectId={selectedProjectId}
            onSelectProject={selectLocalProject} onCreateProject={startNewProject}
            onCancel={() => navigateTo("home")} />
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
      <DesktopShell active={section} onNavigate={navigateTo}
        selectedProjectName={projects.find(project => project.id === selectedProjectId)?.name ?? null}>
        {content}
      </DesktopShell>
    </div>
  );
}
