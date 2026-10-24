import type { SupervisionEvent } from "../../../contracts/telemetry";

/** A bounded in-memory presentation model. Never a durable audit log. */
export interface JournalState {
  readonly sourceInstanceId: string | null;
  readonly lastSequence: number | null;
  readonly entries: readonly SupervisionEvent[];
  readonly missingEvents: number;
  readonly staleOrDuplicateEvents: number;
  readonly sourceChanges: number;
}

export function createJournal(): JournalState {
  return {
    sourceInstanceId: null,
    lastSequence: null,
    entries: [],
    missingEvents: 0,
    staleOrDuplicateEvents: 0,
    sourceChanges: 0,
  };
}

/**
 * Append a previously validated event to the UI journal.
 *
 * Reset the cursor if the validated source instance changes; never blend two
 * sequences or treat reconnection as proof that no events were missed.
 * Missing/gap counters are diagnostic only, not an authorization state.
 */
export function appendJournalEvent(
  previous: JournalState,
  incoming: SupervisionEvent,
  capacity = 500,
): JournalState {
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 2000) {
    throw new RangeError("UI journal capacity must be between 1 and 2000");
  }
  if (previous.sourceInstanceId !== incoming.source_instance_id) {
    return {
      sourceInstanceId: incoming.source_instance_id,
      lastSequence: incoming.sequence,
      entries: [incoming],
      // The first sequence in a new stream is not evidence of missing events.
      missingEvents: 0,
      staleOrDuplicateEvents: 0,
      sourceChanges: previous.sourceInstanceId === null ? 0 : previous.sourceChanges + 1,
    };
  }
  const last = previous.lastSequence;
  if (last === null) throw new Error("Invalid journal state: cursor missing");
  if (incoming.sequence <= last) {
    return {
      ...previous,
      staleOrDuplicateEvents: previous.staleOrDuplicateEvents + 1,
    };
  }
  const skipped = incoming.sequence - last - 1;
  return {
    ...previous,
    lastSequence: incoming.sequence,
    entries: [...previous.entries, incoming].slice(-capacity),
    missingEvents: previous.missingEvents + skipped,
  };
}
