import assert from "node:assert/strict";
import { describe, it } from "node:test";
import jwt from "jsonwebtoken";
import { requireAuth, requireSelf, signToken } from "../middleware/auth.js";

const SECRET = "test-secret-that-is-long-enough-for-hs256";

function run(middleware, req) {
  let outcome;
  middleware({ app: { get: () => SECRET }, headers: {}, params: {}, ...req }, {}, (error) => {
    outcome = error ?? null;
  });
  return outcome;
}

describe("requireAuth", () => {
  it("accepts a token issued by signToken and exposes the user id", () => {
    const req = { headers: { authorization: `Bearer ${signToken({ _id: "abc123" }, SECRET)}` } };
    const context = { app: { get: () => SECRET }, params: {}, ...req };
    let error;
    requireAuth(context, {}, (e) => (error = e));
    assert.equal(error, undefined);
    assert.equal(context.userId, "abc123");
  });

  it("rejects a missing header", () => {
    assert.equal(run(requireAuth, {}).status, 401);
  });

  it("rejects tokens signed with another secret", () => {
    const token = jwt.sign({ id: "abc123" }, "another-secret");
    assert.equal(run(requireAuth, { headers: { authorization: `Bearer ${token}` } }).status, 401);
  });

  it("rejects expired tokens", () => {
    const token = jwt.sign({ id: "abc123" }, SECRET, { expiresIn: -10 });
    assert.equal(run(requireAuth, { headers: { authorization: `Bearer ${token}` } }).status, 401);
  });
});

describe("requireSelf", () => {
  it("allows the account owner", () => {
    assert.equal(run(requireSelf, { userId: "a", params: { id: "a" } }), null);
  });

  it("blocks access to another account", () => {
    assert.equal(run(requireSelf, { userId: "a", params: { id: "b" } }).status, 403);
  });
});
