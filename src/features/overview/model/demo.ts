// Demo-only display data. Never treat these values as actual project history,
// session authority, Bridge state or permission grants.
export const overviewDisplay = {
  project: { title: "Aucun projet", detail: "Sélection manuelle nécessaire" },
  assistant: { title: "Non configuré", detail: "Connexion à définir" },
  session: { title: "Non vérifiée", detail: "Bridge non connecté" },
} as const;

export const exampleRecentProjects = [
  { id: "demo-pokemon", name: "Traduction Pokemon", date: "23/10/2026", duration: "10 h 23" },
  { id: "demo-portfolio", name: "Portfolio web", date: "18/10/2026", duration: "4 h 15" },
  { id: "demo-notes", name: "Gestionnaire de notes", date: "12/10/2026", duration: "2 h 07" },
] as const;
