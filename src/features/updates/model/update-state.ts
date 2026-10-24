/**
 * UI-only update lifecycle. No network, file, signature verification or install authority.
 * Only a future Rust/Tauri adapter may authenticate and deliver backend events.
 */
export type UpdateChannel = "stable" | "preview";

export interface DisplayRelease {
  readonly version: string;
  readonly channel: UpdateChannel;
  readonly notes: string;
}

export type UpdateUiState =
  | { readonly phase: "unconfigured" }
  | { readonly phase: "checking" }
  | { readonly phase: "current" }
  | { readonly phase: "available"; readonly release: DisplayRelease }
  | { readonly phase: "downloading"; readonly release: DisplayRelease; readonly received: number; readonly total: number | null }
  | { readonly phase: "ready"; readonly release: DisplayRelease }
  | { readonly phase: "installing"; readonly release: DisplayRelease }
  | { readonly phase: "deferred"; readonly release: DisplayRelease }
  | { readonly phase: "failed"; readonly stage: "check" | "download" | "install"; readonly message: string };

export type UpdateDisplayEvent =
  | { readonly type: "begin-check" }
  | { readonly type: "up-to-date" }
  | { readonly type: "found"; readonly release: unknown }
  | { readonly type: "start-download" }
  | { readonly type: "download-progress"; readonly received: number; readonly total: number | null }
  | { readonly type: "download-finished" }
  | { readonly type: "install-started" }
  | { readonly type: "defer" }
  | { readonly type: "failed"; readonly stage: "check" | "download" | "install"; readonly message: string }
  | { readonly type: "reset" };

export const UPDATER_UNCONFIGURED: UpdateUiState = Object.freeze({ phase: "unconfigured" });

const VERSION = /^(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-(?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9][0-9]*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*)?$/;

export function parseDisplayRelease(value: unknown): DisplayRelease | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const keys = Reflect.ownKeys(value);
  if (keys.length !== 3 || !keys.every(k => typeof k === "string" && ["version", "channel", "notes"].includes(k))) return null;
  for (const key of ["version", "channel", "notes"]) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !Object.hasOwn(descriptor, "value")) return null;
  }
  const release = value as Record<string, unknown>;
  if (typeof release.version !== "string" || release.version.length > 80 || !VERSION.test(release.version)) return null;
  if (release.channel !== "stable" && release.channel !== "preview") return null;
  if (typeof release.notes !== "string" || release.notes.length > 4000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(release.notes)) return null;
  return Object.freeze({ version: release.version, channel: release.channel, notes: release.notes });
}

/**
 * Presentation transitions, not permission to download/install. In particular
 * begin-check cannot leave unconfigured state without an app-owned adapter.
 * Real backend operations must still enforce signatures, session quiescence and consent.
 */
export function updateUiTransition(current: UpdateUiState, event: UpdateDisplayEvent): UpdateUiState {
  if (event.type === "reset") return UPDATER_UNCONFIGURED;
  if (current.phase === "unconfigured") return current;
  switch (event.type) {
    case "begin-check":
      return current.phase === "downloading" || current.phase === "installing" ? current : { phase: "checking" };
    case "up-to-date":
      return current.phase === "checking" ? { phase: "current" } : current;
    case "found": {
      if (current.phase !== "checking") return current;
      const release = parseDisplayRelease(event.release);
      return release ? { phase: "available", release } : { phase: "failed", stage: "check", message: "Métadonnées de version invalides" };
    }
    case "start-download":
      return current.phase === "available" ? { phase: "downloading", release: current.release, received: 0, total: null } : current;
    case "download-progress":
      if (current.phase !== "downloading" || !Number.isSafeInteger(event.received) || event.received < current.received ||
        event.received < 0 || (event.total !== null && (!Number.isSafeInteger(event.total) || event.total <= 0 || event.received > event.total)) ||
        (current.total !== null && event.total !== current.total)) return current;
      return { ...current, received: event.received, total: event.total };
    case "download-finished":
      return current.phase === "downloading" ? { phase: "ready", release: current.release } : current;
    case "install-started":
      return current.phase === "ready" ? { phase: "installing", release: current.release } : current;
    case "defer":
      return current.phase === "available" || current.phase === "ready" ? { phase: "deferred", release: current.release } : current;
    case "failed":
      return current.phase !== "installing" && current.phase !== "downloading" && current.phase !== "checking" ? current :
        { phase: "failed", stage: event.stage, message: "Mise à jour interrompue" };
  }
}

export function updaterDisplayMessage(state: UpdateUiState): string {
  switch (state.phase) {
    case "unconfigured": return "Service de mise à jour non configuré dans cette version expérimentale.";
    case "checking": return "Recherche d'une nouvelle version…";
    case "current": return "Aucune nouvelle version détectée lors de la dernière vérification.";
    case "available": return `Optic ${state.release.version} est disponible.`;
    case "downloading": return "Téléchargement en cours…";
    case "ready": return `Optic ${state.release.version} est prêt à être installé.`;
    case "installing": return "Installation en cours…";
    case "deferred": return `La mise à jour ${state.release.version} est reportée.`;
    case "failed": return "Échec de la mise à jour. Aucune installation n'a été confirmée.";
  }
}
