/**
 * Desktop display-state proposal, NOT the live Bridge protocol or a security authority.
 * It intentionally cannot represent an authenticated Bridge source.
 */
export const CONTROL_STATUS_SCHEMA_VERSION = 1;

export const CONTROL_STATES = {
  bridge: ["unknown", "starting", "ready", "stopping", "stopped", "failed"],
  session: ["unknown", "absent", "pending", "running", "stopping", "finished", "termination_uncertain"],
  authorization: ["unknown", "not_requested", "requested", "approved", "effective", "revoked", "expired", "denied"],
  revocation: ["unknown", "not_requested", "requested", "acknowledged", "failed"],
  nativeTermination: ["unknown", "not_applicable", "pending", "confirmed", "uncertain"],
} as const;

export type BridgeState = (typeof CONTROL_STATES.bridge)[number];
export type SessionState = (typeof CONTROL_STATES.session)[number];
export type AuthorizationState = (typeof CONTROL_STATES.authorization)[number];
export type RevocationState = (typeof CONTROL_STATES.revocation)[number];
export type NativeTerminationState = (typeof CONTROL_STATES.nativeTermination)[number];

/** A state of presentation only. `effective` in demo never means a real grant. */
export interface OfflineControlStatus {
  readonly schema_version: 1;
  readonly source: "offline" | "demo";
  readonly bridge_state: BridgeState;
  readonly session_state: SessionState;
  readonly authorization_state: AuthorizationState;
  readonly revocation_state: RevocationState;
  readonly native_termination_state: NativeTerminationState;
}

const KEYS = [
  "schema_version", "source", "bridge_state", "session_state",
  "authorization_state", "revocation_state", "native_termination_state",
] as const;

const STATE_KEYS = {
  bridge_state: CONTROL_STATES.bridge,
  session_state: CONTROL_STATES.session,
  authorization_state: CONTROL_STATES.authorization,
  revocation_state: CONTROL_STATES.revocation,
  native_termination_state: CONTROL_STATES.nativeTermination,
} as const;

function isPlainRecord(input: unknown): input is Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return false;
  const prototype: unknown = Object.getPrototypeOf(input);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Fail closed on unexpected fields, versions and sources. This validator only
 * accepts offline/demo snapshots; authentication is the future Rust boundary.
 */
export function parseOfflineControlStatus(input: unknown): OfflineControlStatus | null {
  if (!isPlainRecord(input)) return null;
  if (Object.keys(input).length !== KEYS.length || !KEYS.every(key => Object.hasOwn(input, key))) return null;
  if (input.schema_version !== CONTROL_STATUS_SCHEMA_VERSION) return null;
  if (input.source !== "offline" && input.source !== "demo") return null;
  for (const [key, allowed] of Object.entries(STATE_KEYS)) {
    if (!allowed.some(state => state === input[key])) return null;
  }
  // A disconnected local UI has NO observations. It cannot claim a live state.
  if (input.source === "offline" && Object.keys(STATE_KEYS).some(key => input[key] !== "unknown")) return null;
  return Object.freeze({
    schema_version: 1,
    source: input.source,
    bridge_state: input.bridge_state as BridgeState,
    session_state: input.session_state as SessionState,
    authorization_state: input.authorization_state as AuthorizationState,
    revocation_state: input.revocation_state as RevocationState,
    native_termination_state: input.native_termination_state as NativeTerminationState,
  });
}

/** The only status constructed by the current Tauri-free renderer. */
export const OFFLINE_CONTROL_STATUS: OfflineControlStatus = Object.freeze({
  schema_version: 1,
  source: "offline",
  bridge_state: "unknown",
  session_state: "unknown",
  authorization_state: "unknown",
  revocation_state: "unknown",
  native_termination_state: "unknown",
});

/** Display copy only; deliberately returns no `allowed`/`canRun` decision. */
export function summarizeControlStatus(status: OfflineControlStatus) {
  const validated = parseOfflineControlStatus(status);
  if (validated === null) throw new TypeError("Invalid offline control status");
  return Object.freeze({
    source: validated.source === "offline" ? "HORS LIGNE" : "SIMULATION",
    bridge: validated.source === "offline" ? "Bridge non connecté · état non vérifié" : "Bridge simulé : " + validated.bridge_state,
    session: validated.source === "offline" ? "Sessions non vérifiées" : "Session simulée : " + validated.session_state,
    authorization: validated.source === "offline" ? "Autorisations non vérifiées" : "Autorisation simulée : " + validated.authorization_state,
    revocation: validated.source === "offline" ? "Révocations non vérifiées" : "Révocation simulée : " + validated.revocation_state,
    nativeTermination: validated.source === "offline" ? "Terminaison native non vérifiée" : "Terminaison native simulée : " + validated.native_termination_state,
  });
}
