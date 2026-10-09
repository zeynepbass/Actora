import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadEnv } from "../config/env.js";
import { detectImageType } from "../utils/imageType.js";
import { toPublicPost, toPublicUser } from "../utils/serializers.js";

describe("detectImageType", () => {
  it("recognizes supported formats by signature", () => {
    assert.equal(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
    assert.equal(
      detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      "image/png"
    );
    assert.equal(detectImageType(Buffer.from("GIF89a")), "image/gif");
    assert.equal(detectImageType(Buffer.from("RIFF\0\0\0\0WEBP")), "image/webp");
  });

  it("rejects markup and truncated files", () => {
    assert.equal(detectImageType(Buffer.from("<svg onload=alert(1)>")), null);
    assert.equal(detectImageType(Buffer.from([0xff])), null);
  });
});

describe("serializers", () => {
  const viewer = { _id: "u1", email: "Ada@example.com" };

  it("never exposes the password hash", () => {
    const user = toPublicUser({ _id: "u1", email: "a@b.co", parola: "hash", adSoyad: "Ada" });
    assert.equal("parola" in user, false);
    assert.equal(user.id, "u1");
  });

  it("marks ownership and likes without leaking e-mails or liker ids", () => {
    const post = toPublicPost(
      { _id: "p1", baslik: "t", aciklama: "d", email: "ada@example.com", begenenler: ["u1", "u2"] },
      viewer,
      { adSoyad: "Ada", resim: "data:image/png;base64,AAAA" }
    );
    assert.equal(post.benim, true);
    assert.equal(post.begendi, true);
    assert.equal(post.begeniSayisi, 2);
    assert.equal("email" in post, false);
    assert.equal("begenenler" in post, false);
    assert.equal(post.yazar.resim, null);
  });
});

describe("loadEnv", () => {
  const valid = { MONGO_URI: "mongodb://localhost/test", JWT_SECRET: "x".repeat(32) };

  it("applies defaults", () => {
    const env = loadEnv(valid);
    assert.equal(env.port, 5233);
    assert.deepEqual(env.clientOrigins, ["http://localhost:3000"]);
  });

  it("parses a list of allowed origins", () => {
    const env = loadEnv({ ...valid, CLIENT_ORIGIN: "https://a.example, https://b.example" });
    assert.deepEqual(env.clientOrigins, ["https://a.example", "https://b.example"]);
  });

  it("refuses to start without a strong secret", () => {
    assert.throws(() => loadEnv({ MONGO_URI: valid.MONGO_URI }), /JWT_SECRET/);
    assert.throws(() => loadEnv({ ...valid, JWT_SECRET: "short" }), /JWT_SECRET/);
  });
});
