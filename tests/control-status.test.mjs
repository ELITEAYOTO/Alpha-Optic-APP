import test from "node:test";
import assert from "node:assert/strict";
import {
  OFFLINE_CONTROL_STATUS, parseOfflineControlStatus, summarizeControlStatus,
} from "../src/contracts/control-status.ts";

const demo = () => ({
  schema_version: 1,
  source: "demo",
  bridge_state: "ready",
  session_state: "running",
  authorization_state: "effective",
  revocation_state: "acknowledged",
  native_termination_state: "uncertain",
});

test("offline means all five security-sensitive axes remain unknown", () => {
  const state = parseOfflineControlStatus(OFFLINE_CONTROL_STATUS);
  assert.deepEqual(state, OFFLINE_CONTROL_STATUS);
  assert.equal(Object.isFrozen(state), true);
  for (const key of ["bridge_state", "session_state", "authorization_state", "revocation_state", "native_termination_state"]) {
    assert.equal(state[key], "unknown");
    assert.equal(parseOfflineControlStatus({ ...OFFLINE_CONTROL_STATUS, [key]: "ready" }), null);
  }
});

test("a demo revocation neither terminates a session nor proves native termination", () => {
  const snapshot = parseOfflineControlStatus(demo());
  assert.ok(snapshot);
  assert.equal(snapshot.revocation_state, "acknowledged");
  assert.equal(snapshot.session_state, "running");
  assert.equal(snapshot.native_termination_state, "uncertain");
  const copy = summarizeControlStatus(snapshot);
  assert.match(copy.authorization, /simulée/);
  assert.match(copy.nativeTermination, /simulée.*uncertain/);
  assert.equal(copy.source, "SIMULATION");
  assert.equal("allowed" in copy, false);
  assert.equal("canRun" in copy, false);
});

test("rejects live/authenticated sources, foreign fields and versions", () => {
  for (const source of ["live", "authenticated", "trusted", "bridge"]) {
    assert.equal(parseOfflineControlStatus({ ...demo(), source }), null);
  }
  assert.equal(parseOfflineControlStatus({ ...demo(), schema_version: 2 }), null);
  assert.equal(parseOfflineControlStatus({ ...demo(), token: "secret" }), null);
  assert.equal(parseOfflineControlStatus({ ...demo(), grant_id: "fake" }), null);
  assert.equal(parseOfflineControlStatus({ ...demo(), session_state: "terminated" }), null);
  assert.equal(parseOfflineControlStatus({ ...demo(), native_termination_state: "stopped" }), null);
  assert.equal(parseOfflineControlStatus({ ...demo(), authorization_state: "allowed" }), null);
  assert.equal(parseOfflineControlStatus({ ...demo(), revocation_state: "finished" }), null);
  assert.equal(parseOfflineControlStatus({ ...demo(), bridge_state: "healthy" }), null);
  assert.equal(parseOfflineControlStatus({ ...demo(), source: undefined }), null);
  const withSymbol = demo();
  withSymbol[Symbol("hidden")] = "non-displayed metadata";
  assert.equal(parseOfflineControlStatus(withSymbol), null);
  const withHidden = demo();
  Object.defineProperty(withHidden, "hidden", { value: "metadata" });
  assert.equal(parseOfflineControlStatus(withHidden), null);
  const withGetter = demo();
  Object.defineProperty(withGetter, "bridge_state", { enumerable: true, get() { throw Error("untrusted getter executed"); } });
  assert.equal(parseOfflineControlStatus(withGetter), null);
  assert.equal(parseOfflineControlStatus({}), null);
  assert.equal(parseOfflineControlStatus(Object.create({ source: "demo" })), null);
  assert.equal(parseOfflineControlStatus(null), null);
  assert.equal(parseOfflineControlStatus([]), null);
});

test("projects only allowlisted fields and rejects forged render-state inputs", () => {
  const data = parseOfflineControlStatus(Object.assign(Object.create(null), demo()));
  assert.ok(data);
  assert.equal(Object.getPrototypeOf(data), Object.prototype);
  assert.deepEqual(Object.keys(data), [
    "schema_version", "source", "bridge_state", "session_state", "authorization_state", "revocation_state", "native_termination_state",
  ]);
  assert.throws(() => summarizeControlStatus({ ...demo(), source: "live" }), TypeError);
  assert.throws(() => summarizeControlStatus({ ...demo(), injected: "command" }), TypeError);
  const summary = summarizeControlStatus(OFFLINE_CONTROL_STATUS);
  assert.equal(summary.bridge, "Bridge non connecté · état non vérifié");
  assert.equal(summary.nativeTermination, "Terminaison native non vérifiée");
  assert.equal(Object.isFrozen(summary), true);
});
