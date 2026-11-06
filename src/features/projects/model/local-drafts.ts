/** Local display-only project drafts. No filesystem path, Bridge grant, session or credential. */
export interface LocalProjectDraft {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
}

export const LOCAL_PROJECTS_KEY = "optic.ui.project-drafts.v1";
export const MAX_LOCAL_PROJECTS = 20;
const PROJECT_ID = /^draft-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const UNSAFE_NAME = /[\\/<>:"|?*\u0000-\u001f\u007f]/;

export function normalizeProjectName(value: string): string | null {
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || name.length > 64 || name === "." || name === ".." ||
      name.endsWith(".") || UNSAFE_NAME.test(name)) return null;
  return name;
}

function isLocalProject(value: unknown): value is LocalProjectDraft {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  if (Object.keys(entry).sort().join(",") !== "createdAt,id,name") return false;
  return typeof entry.id === "string" && PROJECT_ID.test(entry.id) &&
    typeof entry.name === "string" && normalizeProjectName(entry.name) === entry.name &&
    typeof entry.createdAt === "string" &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(entry.createdAt) &&
    Number.isFinite(Date.parse(entry.createdAt));
}

/** Fail closed on malformed or stale localStorage. Never interpret stored JSON as permissions. */
export function parseLocalProjects(raw: string | null): LocalProjectDraft[] {
  if (raw === null || raw.length > 12000) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || Array.isArray(data)) return [];
    const record = data as Record<string, unknown>;
    if (Object.keys(record).sort().join(",") !== "projects,schemaVersion" ||
        record.schemaVersion !== 1 || !Array.isArray(record.projects) ||
        record.projects.length > MAX_LOCAL_PROJECTS) return [];
    if (!record.projects.every(isLocalProject)) return [];
    const projects: LocalProjectDraft[] = record.projects;
    if (new Set(projects.map(p => p.id)).size !== projects.length ||
        new Set(projects.map(p => p.name.toLocaleLowerCase("fr"))).size !== projects.length) return [];
    return projects;
  } catch { return []; }
}

export function appendLocalProject(
  current: readonly LocalProjectDraft[], nameInput: string, id: string, createdAt: string,
): { projects: LocalProjectDraft[]; created: LocalProjectDraft } {
  const name = normalizeProjectName(nameInput);
  if (!name) throw new Error("Saisissez un nom de projet valide (1 à 64 caractères, sans chemin).");
  if (current.length >= MAX_LOCAL_PROJECTS) throw new Error("Limite de 20 brouillons locaux atteinte.");
  if (!PROJECT_ID.test(id) || Number.isNaN(Date.parse(createdAt))) throw new Error("Identifiant local invalide.");
  if (current.some(p => p.id === id || p.name.toLocaleLowerCase("fr") === name.toLocaleLowerCase("fr")))
    throw new Error("Ce projet existe déjà dans vos brouillons.");
  const created = { id, name, createdAt };
  return { projects: [created, ...current], created };
}

export function serializeLocalProjects(projects: readonly LocalProjectDraft[]): string {
  if (projects.length > MAX_LOCAL_PROJECTS || !projects.every(isLocalProject))
    throw new Error("Brouillons invalides.");
  return JSON.stringify({ schemaVersion: 1, projects });
}

/** UI-only rename of a browser draft; never changes a disk directory. */
export function renameLocalProject(
  current: readonly LocalProjectDraft[], id: string, requestedName: string,
): LocalProjectDraft[] {
  if (!PROJECT_ID.test(id) || !current.some(project => project.id === id))
    throw new Error("Brouillon local introuvable.");
  const name = normalizeProjectName(requestedName);
  if (!name) throw new Error("Saisissez un nom valide (1 à 64 caractères, sans chemin).");
  if (current.some(project => project.id !== id &&
      project.name.toLocaleLowerCase("fr") === name.toLocaleLowerCase("fr")))
    throw new Error("Ce nom existe déjà dans les brouillons.");
  return current.map(project => project.id === id ? { ...project, name } : project);
}

/** Remove only one localStorage draft. No effect on files, processes or Bridge. */
export function removeLocalProject(
  current: readonly LocalProjectDraft[], id: string,
): LocalProjectDraft[] {
  if (!PROJECT_ID.test(id) || !current.some(project => project.id === id))
    throw new Error("Brouillon local introuvable.");
  return current.filter(project => project.id !== id);
}
