import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { appendLocalProject, MAX_LOCAL_PROJECTS, normalizeProjectName,
  parseLocalProjects, serializeLocalProjects, renameLocalProject, removeLocalProject } from "../src/features/projects/model/local-drafts.ts";

const id = "draft-123e4567-e89b-42d3-a456-426614174000";
const date = "2026-11-06T09:00:00.000Z";
const app = readFileSync(new URL("../src/app/App.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../src/features/overview/ui/OverviewScreen.tsx", import.meta.url), "utf8");
const projects = readFileSync(new URL("../src/features/projects/ui/ProjectsScreen.tsx", import.meta.url), "utf8");
const sessions = readFileSync(new URL("../src/features/sessions/ui/SessionPreparationScreen.tsx", import.meta.url), "utf8");
const main = readFileSync(new URL("../src/main.tsx", import.meta.url), "utf8");
const picker = readFileSync(new URL("../src/features/themes/ui/ThemePicker.tsx", import.meta.url), "utf8");

test("local project drafts are well-formed, strictly data-only and survive round trip", () => {
  const result = appendLocalProject([], "  Portfolio   web  ", id, date);
  assert.equal(result.created.name, "Portfolio web");
  assert.equal(result.projects.length, 1);
  assert.deepEqual(parseLocalProjects(serializeLocalProjects(result.projects)), result.projects);
  assert.equal(MAX_LOCAL_PROJECTS, 20);
  assert.doesNotMatch(serializeLocalProjects(result.projects), /path|permission|grant|session|credential/i);
});

test("invalid project names, duplicates, full collections and bad IDs are rejected", () => {
  for (const name of ["", ".", "..", "a/secret", "C:\\Windows", "bad*name", "a".repeat(65)]) {
    assert.equal(normalizeProjectName(name), null, name);
  }
  const sample = appendLocalProject([], "Portfolio", id, date).projects;
  assert.throws(() => appendLocalProject(sample, "PORTFOLIO", "draft-123e4567-e89b-42d3-a456-426614174001", date), /existe déjà/);
  assert.throws(() => appendLocalProject([], "Nouveau", "not-a-uuid", date), /Identifiant local/);
  const full = Array.from({ length: MAX_LOCAL_PROJECTS }, (_, i) => ({
    id: "draft-123e4567-e89b-42d3-a456-" + String(i).padStart(12, "0"),
    name: "Test " + i, createdAt: date,
  }));
  assert.throws(() => appendLocalProject(full, "Plus", "draft-123e4567-e89b-42d3-a456-426614174001", date), /Limite/);
});

test("untrusted localStorage content cannot claim authorities or pollute a draft", () => {
  assert.deepEqual(parseLocalProjects("{"), []);
  assert.deepEqual(parseLocalProjects(null), []);
  assert.deepEqual(parseLocalProjects(" ".repeat(12001)), []);
  assert.deepEqual(parseLocalProjects(JSON.stringify({ schemaVersion: 2, projects: [] })), []);
  assert.deepEqual(parseLocalProjects(JSON.stringify({
    schemaVersion: 1,
    projects: [{ id, name: "Projet", createdAt: date, grants: ["fs_write"] }],
  })), []);
  assert.deepEqual(parseLocalProjects(JSON.stringify({ schemaVersion: 1, projects: [{ id, name: "Projet", createdAt: date }, { id, name: "Projet 2", createdAt: date }] })), []);
  assert.deepEqual(parseLocalProjects(JSON.stringify({ schemaVersion: 1, projects: [], script: "invoke" })), []);
});

test("home flows into projects/session wizard but never executes a real Bridge action", () => {
  assert.match(home, /onClick=\{\(\) => onNavigate\("sessions"\)\}/);
  assert.match(home, /onNewProject/);
  assert.match(home, /disabled=\{!project.local\}/);
  assert.match(projects, /Enregistrer le brouillon/);
  assert.match(projects, /onPrepare\(selectedProject.id\)/);
  assert.match(projects, /PROJET SÉLECTIONNÉ/);
  assert.match(projects, /ACTIONS DU PROJET/);
  assert.match(projects, /EXEMPLE FICTIF/);
  assert.match(projects, /aria-pressed=\{selectedProjectId === project.id\}/);
  assert.match(app, /<ProjectsScreen projects=\{projects\}/);
  assert.match(app, /<SessionPreparationScreen projects=\{projects\}/);
  assert.match(app, /window.localStorage.setItem\(LOCAL_PROJECTS_KEY/);
  assert.match(app, /if \(destination !== "projects"\) setProjectCreateOpen\(false\)/);
  assert.match(main, /ProjectsScreen\.css/);
  assert.match(main, /SessionPreparationScreen\.css/);
  for (const src of [projects, sessions]) {
    assert.doesNotMatch(src, /\binvoke\(|\bfetch\(|\bspawn\(|@tauri-apps\/api|fs_write|shell\.open/);
  }
});

test("four reviewable steps keep actual launch disabled without Bridge authority", () => {
  for (const label of ["Projet et ressources", "Assistant local", "Autorisations", "Vérification"]) {
    assert.ok(sessions.includes(label), label);
  }
  assert.match(sessions, /disabled=\{step === 1 && !project\}/);
  assert.match(sessions, /Démarrer la session — indisponible/);
  assert.match(sessions, /type="button" disabled title="Bridge non connecté/);
  assert.match(sessions, /Aucune permission implicite/);
  assert.match(sessions, /Session réelle/);
  assert.match(sessions, /Non créée/);
});

test("settings theme preview retains React-safe plain object (#45 fix)", () => {
  assert.ok(picker.includes("style={{ ...themeToCssVariables(theme) } as CSSProperties}"));
});

test("rename and removal operate strictly on browser draft records", () => {
  const first = appendLocalProject([], "Portfolio", id, date).projects;
  const renamed = renameLocalProject(first, id, " Portfolio UI ");
  assert.equal(renamed[0].name, "Portfolio UI");
  assert.equal(renamed[0].id, id);
  assert.equal(renamed[0].createdAt, date);
  assert.equal(first[0].name, "Portfolio");
  assert.deepEqual(parseLocalProjects(serializeLocalProjects(renamed)), renamed);
  assert.throws(() => renameLocalProject(first, id, "C:\\Windows"), /nom valide/);
  assert.throws(() => renameLocalProject(first, "not-an-id", "New"), /introuvable/);
  const secondId = "draft-123e4567-e89b-42d3-a456-426614174001";
  const two = appendLocalProject(first, "Other", secondId, date).projects;
  assert.throws(() => renameLocalProject(two, id, "other"), /existe déjà/);
  assert.deepEqual(removeLocalProject(two, id), [two[0]]);
  assert.throws(() => removeLocalProject([], id), /introuvable/);
});

test("local project controls require explicit confirmation and no filesystem API", () => {
  assert.match(projects, /Retirer du navigateur/);
  assert.match(projects, /Confirmer le retrait local/);
  assert.match(projects, /onRename\(id, renameName\)/);
  assert.match(projects, /onRemove\(id\)/);
  assert.match(app, /window.localStorage.setItem\(LOCAL_PROJECTS_KEY, serializeLocalProjects\(updated\)\)/);
  assert.doesNotMatch(projects, /\binvoke\(|\bfetch\(|fs_delete\(|process_start\(/);
});

test("session uses real MCP tool names only as visible data and avoids real execution", async () => {
  const { PREVIEW_TOOL_CATALOG, buildPreparationChecks, buildPreviewTrace } =
    await import("../src/features/sessions/model/bridge-preview-contract.ts");
  for (const tool of ["session_info", "fs_list", "fs_read", "fs_write", "fs_delete",
    "fs_create_directory", "git_status", "process_start"]) {
    assert.ok(PREVIEW_TOOL_CATALOG.some(item => item.name === tool), tool);
  }
  const checks = buildPreparationChecks("Demo", ["read", "delete"]);
  assert.equal(checks.some(item => item.key === "bridge" && item.result === "preview-ready"), false);
  assert.equal(checks.some(item => item.key === "draft" && item.result === "preview-ready"), true);
  const trace = buildPreviewTrace("Demo", ["read"]);
  assert.ok(trace.some(event => /REFUS SIMULÉ/.test(event.result)));
  assert.ok(trace.some(event => /aucun appel transmis/.test(event.result)));
  assert.doesNotMatch(JSON.stringify(trace), /action_id|session_handle|job_id|grant_token/i);
  assert.match(sessions, /Tester le parcours \(simulation\)/);
  assert.match(sessions, /Aucun outil n'est appelé et aucun droit n'est accordé/);
  assert.match(sessions, /Démarrer la session — indisponible/);
  assert.doesNotMatch(sessions, /\binvoke\(|\bfetch\(|\bspawn\(/);
});

test("project resource editor ends at its content instead of stretching to stepper height", () => {
  const css = readFileSync(new URL("../src/features/sessions/ui/SessionPreparationScreen.css", import.meta.url), "utf8");
  assert.match(css, /\.session-layout \{[^}]*align-items: start/);
  assert.match(css, /\.session-editor \{[^}]*min-height: 0/);
  assert.match(css, /\.session-screen\[data-step="1"\] \.session-editor/);
  assert.doesNotMatch(css, /min-height: 510px/);
});
