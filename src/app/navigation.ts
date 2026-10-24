export const destinations = [
  { id: "home", label: "Bureau" },
  { id: "projects", label: "Projets" },
  { id: "sessions", label: "Sessions" },
  { id: "permissions", label: "Autorisations" },
  { id: "supervision", label: "Supervision" },
  { id: "terminal", label: "Terminal" },
  { id: "connections", label: "Connexions" },
  { id: "settings", label: "Paramètres" },
] as const;

export type Destination = (typeof destinations)[number]["id"];

export function isDestination(input: string): input is Destination {
  return destinations.some(({ id }) => id === input);
}
