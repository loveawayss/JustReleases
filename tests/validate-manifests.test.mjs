import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  loadDocuments,
  validateDocuments,
  validateRepository,
} from "../scripts/validate-manifests.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

function validDocuments() {
  return structuredClone(loadDocuments(root));
}

test("accepts the repository contract", () => {
  assert.doesNotThrow(() => validateRepository(root));
});

test("rejects an unknown product", () => {
  const documents = validDocuments();
  documents.catalog.products.push({
    id: "unknown",
    name: "Unknown",
    manifest: "products/unknown.json",
    channels: ["stable"],
  });
  assert.throws(() => validateDocuments(documents), /product count/);
});

test("rejects an unsupported schema", () => {
  const documents = validDocuments();
  documents.products.justhub.schemaVersion = 2;
  assert.throws(() => validateDocuments(documents), /schemaVersion/);
});

test("rejects SemVer with leading zeroes", () => {
  const documents = validDocuments();
  documents.products.justcleaner.version = "01.1.0";
  assert.throws(() => validateDocuments(documents), /invalid SemVer/);
});

test("rejects a deceptive download host", () => {
  const documents = validDocuments();
  const deceptive = documents.products.justhub.artifacts[0].downloadUrl.replace(
    "github.com/",
    "github.com.example/",
  );
  documents.products.justhub.artifacts[0].downloadUrl = deceptive;
  documents.updateInfo.downloadUrl = deceptive;
  assert.throws(() => validateDocuments(documents), /invalid host/);
});

test("rejects a release path that is not bound to the version", () => {
  const documents = validDocuments();
  const invalid =
    documents.products.justcleaner.artifacts[0].downloadUrl.replace(
      "justcleaner-v1.1.0",
      "justcleaner-v9.9.9",
    );
  documents.products.justcleaner.artifacts[0].downloadUrl = invalid;
  assert.throws(() => validateDocuments(documents), /download path mismatch/);
});

test("rejects encoded release paths", () => {
  const documents = validDocuments();
  documents.products.justcleaner.releaseUrl =
    "https://github.com/loveawayss/JustReleases/releases/tag%2Fjustcleaner-v1.1.0";
  assert.throws(() => validateDocuments(documents), /release path mismatch/);
});

test("rejects unsafe or unexpected file names", () => {
  const documents = validDocuments();
  documents.products.justhub.artifacts[0].fileName = "../JustHUBInstaller.exe";
  assert.throws(() => validateDocuments(documents), /unexpected file name/);
});

test("rejects remote process arguments", () => {
  const documents = validDocuments();
  documents.products.justhub.artifacts[0].arguments = ["/unsafe"];
  assert.throws(
    () => validateDocuments(documents),
    /unexpected or missing fields/,
  );
});

test("rejects inconsistent legacy update metadata", () => {
  const documents = validDocuments();
  documents.updateInfo.sha256 = "0".repeat(64);
  assert.throws(() => validateDocuments(documents), /SHA-256 mismatch/);
});

test("rejects an invalid detached signature", () => {
  const documents = validDocuments();
  documents.privateUpdateSignature.signature = "AAAA";
  assert.throws(() => validateDocuments(documents), /invalid encoding/);
});

test("rejects a cryptographically invalid signature", () => {
  const documents = validDocuments();
  const signature = Buffer.from(
    documents.privateUpdateSignature.signature,
    "base64",
  );
  signature[0] ^= 1;
  documents.privateUpdateSignature.signature = signature.toString("base64");
  assert.throws(
    () => validateDocuments(documents),
    /cryptographic verification failed/,
  );
});

test("rejects an untrusted signature key", () => {
  const documents = validDocuments();
  documents.privateUpdateSignature.signatureKeyId = "untrusted-key";
  assert.throws(() => validateDocuments(documents), /untrusted key id/);
});

test("rejects a minimum version newer than the release", () => {
  const documents = validDocuments();
  documents.privateUpdateManifest.minimumSupportedVersion = "99.0.0";
  assert.throws(
    () => validateDocuments(documents),
    /minimum version exceeds latest version/,
  );
});
