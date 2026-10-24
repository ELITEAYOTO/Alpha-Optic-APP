// Demo-only display content. Never use this state to authorize or infer Bridge operations.
export const overviewDisplay = {
  project: { title: "Aucun projet", detail: "Sélection manuelle nécessaire" },
  assistant: { title: "Non configuré", detail: "Connexion à définir" },
  session: { title: "Non vérifiée", detail: "Bridge non connecté" },
} as const;
