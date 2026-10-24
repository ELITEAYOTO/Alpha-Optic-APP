/**
 * Desktop-side proposal for a *read-only* Bridge event projection.
 *
 * Not a live Bridge protocol. The Bridge Rust implementation must negotiate an
 * authenticated/versioned contract before events from it are trusted. Nothing
 * in this module grants execution rights, verifies permission, or starts a job.
 */
export const TELEMETRY_SCHEMA_VERSION = 1;
export const MAX_EVENT_SUMMARY_LENGTH = 500;

export type EventSeverity = "debug" | "info" | "warning" | "error";
export type EventStatus = "observed" | "pending" | "completed" | "rejected" | "uncertain";

export interface SupervisionEvent {
  readonly schema_version: 1;
  readonly source_instance_id: string;
  readonly sequence: number;
  readonly monotonic_elapsed_ms: number;
  readonly wall_time: string;
  readonly category: string;
  readonly severity: EventSeverity;
  readonly status: EventStatus;
  readonly summary: string;
  readonly project_id?: string;
  readonly session_id?: string;
  readonly correlation_id?: string;
}

const SEVERITIES: ReadonlySet<string> = new Set(["debug", "info", "warning", "error"]);
const STATUSES: ReadonlySet<string> = new Set(["observed", "pending", "completed", "rejected", "uncertain"]);
const IDENTIFIER = /^[a-zA-Z0-9._:-]{1,128}$/;
const CATEGORY = /^[a-z][a-z0-9]*(?:[._][a-z0-9]+)*$/;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/;

function isRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validIdentifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER.test(value);
}

function validOptionalIdentifier(value: unknown): value is string | undefined {
  return value === undefined || validIdentifier(value);
}

/**
 * Reject invalid/unbounded events and project ONLY the approved display fields.
 * Unknown payload fields (including credentials) never cross into the UI model.
 * This validates shape, NOT authenticity or the underlying Bridge event claim.
 */
export function parseSupervisionEvent(value: unknown): SupervisionEvent | null {
  if (!isRecord(value)) return null;
  if (value.schema_version !== TELEMETRY_SCHEMA_VERSION) return null;
  if (!validIdentifier(value.source_instance_id)) return null;
  if (!Number.isSafeInteger(value.sequence) || (value.sequence as number) < 1) return null;
  if (
    !Number.isSafeInteger(value.monotonic_elapsed_ms) ||
    (value.monotonic_elapsed_ms as number) < 0
  ) return null;
  if (
    typeof value.wall_time !== "string" ||
    value.wall_time.length > 40 ||
    !TIMESTAMP.test(value.wall_time) ||
    Number.isNaN(Date.parse(value.wall_time))
  ) return null;
  if (
    typeof value.category !== "string" ||
    value.category.length > 64 ||
    !CATEGORY.test(value.category)
  ) return null;
  if (!SEVERITIES.has(value.severity as string) || !STATUSES.has(value.status as string)) {
    return null;
  }
  if (
    typeof value.summary !== "string" ||
    !value.summary.length ||
    value.summary.length > MAX_EVENT_SUMMARY_LENGTH ||
    CONTROL_CHARACTER.test(value.summary)
  ) return null;
  if (
    !validOptionalIdentifier(value.project_id) ||
    !validOptionalIdentifier(value.session_id) ||
    !validOptionalIdentifier(value.correlation_id)
  ) return null;

  const event: SupervisionEvent = {
    schema_version: 1,
    source_instance_id: value.source_instance_id,
    sequence: value.sequence as number,
    monotonic_elapsed_ms: value.monotonic_elapsed_ms as number,
    wall_time: value.wall_time,
    category: value.category,
    severity: value.severity as EventSeverity,
    status: value.status as EventStatus,
    summary: value.summary,
    ...(value.project_id === undefined ? {} : { project_id: value.project_id }),
    ...(value.session_id === undefined ? {} : { session_id: value.session_id }),
    ...(value.correlation_id === undefined ? {} : { correlation_id: value.correlation_id }),
  };
  return Object.freeze(event);
}
