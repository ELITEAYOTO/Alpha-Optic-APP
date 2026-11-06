/**
 * DISPLAY-ONLY adaptation of public Optic AI Bridge MCP tool contracts.
 * Reference (read-only): ELITEAYOTO/Optic-AI-Bridge-/docs/specs/MCP_TOOL_CONTRACTS.md
 * Tool visibility is NOT permission. NO Bridge transport, path, lease, token,
 * native command, or session operation belongs in this frontend model.
 */
export type PermissionIntent = "read" | "modify" | "create" | "delete";

export interface PreviewTool {
  readonly name: string;
  readonly category: "base" | "conditional" | "operator";
  readonly description: string;
  readonly requestedIntent?: PermissionIntent;
}
export const PREVIEW_TOOL_CATALOG: readonly PreviewTool[] = [
  { name: "session_info", category: "base", description: "Observer une session existante (si l'hôte l'a créée)" },
  { name: "fs_list", category: "base", description: "Lister un chemin relatif au périmètre validé", requestedIntent: "read" },
  { name: "fs_read", category: "base", description: "Lire un fichier dans des limites bornées", requestedIntent: "read" },
  { name: "fs_write", category: "conditional", description: "Écriture conditionnelle et versionnée", requestedIntent: "modify" },
  { name: "fs_apply_patch", category: "conditional", description: "Patch déterministe avec version préalable", requestedIntent: "modify" },
  { name: "fs_create_directory", category: "conditional", description: "Création d'un seul dossier avec autorisation distincte", requestedIntent: "create" },
  { name: "fs_delete", category: "conditional", description: "Suppression avec autorisation distincte", requestedIntent: "delete" },
  { name: "git_status", category: "operator", description: "GitRead exige un exécutable Git validé" },
  { name: "process_start", category: "operator", description: "Démarrage exige une TaskLease et un exécutable autorisés" },
];

export interface PreparationCheck {
  readonly key: string;
  readonly label: string;
  readonly result: "preview-ready" | "not-connected";
  readonly detail: string;
}
export function buildPreparationChecks(projectName: string | null, requested: readonly PermissionIntent[]): PreparationCheck[] {
  return [
    { key: "draft", label: "Brouillon local", result: projectName ? "preview-ready" : "not-connected",
      detail: projectName ? "Nom enregistré dans le navigateur, sans dossier" : "Sélectionner un brouillon" },
    { key: "tools", label: "Catalogue des outils", result: "preview-ready",
      detail: "Contrats de lecture seuls affichés ; aucun appel réel" },
    { key: "authority", label: "Autorité d'exécution", result: "not-connected",
      detail: requested.length ? "Intentions enregistrées pour cette visite, non accordées" : "Aucune permission demandée" },
    { key: "bridge", label: "Session et hôte Bridge", result: "not-connected",
      detail: "Bridge non connecté : démarrage et révocation non testés" },
  ];
}

export interface DemoTraceEntry {
  readonly stage: string;
  readonly result: string;
}
/** Deterministic educational trace. There is no real clock, transport, spawn or I/O. */
export function buildPreviewTrace(projectName: string | null, requested: readonly PermissionIntent[]): readonly DemoTraceEntry[] {
  return [
    { stage: "01 · Contexte local", result: projectName ? "Brouillon présent (UI uniquement)" : "Aucun brouillon sélectionné" },
    { stage: "02 · Catalogue MCP", result: "Contrats connus : session_info, fs_list, fs_read" },
    { stage: "03 · Politique / TaskLease", result: requested.length
      ? `${requested.length} intention(s) non autorisée(s) — aucune TaskLease`
      : "Aucun droit demandé ou accordé" },
    { stage: "04 · Admission", result: "REFUS SIMULÉ — Bridge hors ligne, aucun appel transmis" },
  ];
}

/** An entirely in-memory exercise; inputs and output are hard-coded virtual samples. */
export type VirtualToolName = "session_info" | "fs_list" | "fs_read";
export const VIRTUAL_TOOLS: readonly VirtualToolName[] = ["session_info", "fs_list", "fs_read"];

export interface VirtualExampleResult {
  readonly tool: VirtualToolName;
  readonly sampleInput: Readonly<Record<string, string>>;
  readonly sampleOutput: Readonly<Record<string, unknown>>;
  readonly simulation: true;
}
export function runVirtualExample(tool: VirtualToolName): VirtualExampleResult {
  if (tool === "session_info") {
    return { tool, sampleInput: {}, sampleOutput: {
      session: "none", host: "not-connected", authority: "not-granted",
      note: "Exemple virtuel : aucune interrogation de l'hôte"
    }, simulation: true };
  }
  if (tool === "fs_list") {
    return { tool, sampleInput: { path: "." }, sampleOutput: {
      entries: [{ name: "README.md", type: "file" }, { name: "src", type: "directory" }],
      next_cursor: null, note: "Liste fictive en mémoire — pas de dossier parcouru"
    }, simulation: true };
  }
  if (tool === "fs_read") {
    return { tool, sampleInput: { path: "README.md" }, sampleOutput: {
      example_text: "# Projet fictif\\nCe contenu n'existe que dans la Preview.",
      note: "Texte illustratif, pas une réponse MCP brute ni un fichier lu"
    }, simulation: true };
  }
  throw new Error("Exemple virtuel non autorisé.");
}
