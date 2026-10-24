import test from "node:test";
import assert from "node:assert/strict";
import { parseSupervisionEvent, MAX_EVENT_SUMMARY_LENGTH } from "../src/contracts/telemetry.ts";
import { createJournal, appendJournalEvent } from "../src/features/supervision/model/journal.ts";

const valid = (sequence, source = "bridge.instance-A") => ({
  schema_version: 1,
  source_instance_id: source,
  sequence,
  monotonic_elapsed_ms: sequence * 8,
  wall_time: "2026-10-24T13:24:00.000Z",
  category: "mcp.request.received",
  severity: "info",
  status: "observed",
  summary: "Demande reçue, en attente de contrôle",
});

test("parse safe event and ignore extra untrusted data", () => {
  const parsed = parseSupervisionEvent({ ...valid(1), token: "SECRET", payload: { credentials: "SECRET" } });
  assert.ok(parsed);
  assert.equal(parsed.sequence, 1);
  assert.equal(Object.hasOwn(parsed, "token"), false);
  assert.equal(Object.hasOwn(parsed, "payload"), false);
  assert.equal(Object.isFrozen(parsed), true);
});

test("fail closed on unknown schema, malformed envelope and unsafe content", () => {
  const mutations = [
    { schema_version: 2 },
    { sequence: -1 },
    { sequence: 1.5 },
    { sequence: Number.MAX_SAFE_INTEGER + 1 },
    { monotonic_elapsed_ms: -9 },
    { source_instance_id: "../bridge" },
    { category: "mcp.request/<script>" },
    { severity: "granted" },
    { status: "authorized" },
    { summary: "hello\u001b[2J" },
    { summary: "x".repeat(MAX_EVENT_SUMMARY_LENGTH + 1) },
    { wall_time: "not-a-date" },
    { session_id: "invalid / path" },
  ];
  for (const change of mutations) {
    assert.equal(parseSupervisionEvent({ ...valid(1), ...change }), null, JSON.stringify(change));
  }
  assert.equal(parseSupervisionEvent([]), null);
  assert.equal(parseSupervisionEvent(null), null);
  assert.equal(parseSupervisionEvent(new Date()), null);
});

test("bounded journal detects gaps and disregards duplicates", () => {
  let journal = createJournal();
  journal = appendJournalEvent(journal, parseSupervisionEvent(valid(1)), 2);
  journal = appendJournalEvent(journal, parseSupervisionEvent(valid(4)), 2);
  assert.equal(journal.missingEvents, 2);
  journal = appendJournalEvent(journal, parseSupervisionEvent(valid(4)), 2);
  assert.equal(journal.staleOrDuplicateEvents, 1);
  assert.equal(journal.entries.length, 2);
  journal = appendJournalEvent(journal, parseSupervisionEvent(valid(5)), 2);
  assert.deepEqual(journal.entries.map((e) => e.sequence), [4, 5]);
  assert.equal(journal.lastSequence, 5);
});

test("source instance switch clears cursor instead of mixing streams", () => {
  let state = appendJournalEvent(createJournal(), parseSupervisionEvent(valid(9, "A")), 2);
  state = appendJournalEvent(state, parseSupervisionEvent(valid(1, "B")), 2);
  assert.equal(state.sourceInstanceId, "B");
  assert.equal(state.sourceChanges, 1);
  assert.deepEqual(state.entries.map((e) => e.source_instance_id), ["B"]);
  assert.equal(state.lastSequence, 1);
  assert.equal(state.missingEvents, 0);
});

test("journal refuses invalid storage capacities", () => {
  assert.throws(() => appendJournalEvent(createJournal(), parseSupervisionEvent(valid(1)), 0), RangeError);
  assert.throws(() => appendJournalEvent(createJournal(), parseSupervisionEvent(valid(1)), 2001), RangeError);
});
