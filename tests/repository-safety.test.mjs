import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { validateTrackedFile } from "../scripts/check-repository-safety.mjs";

function fixture(name, content) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "justreleases-safety-"));
  fs.writeFileSync(path.join(root, name), content);
  return root;
}

test("accepts a small text file", () => {
  const root = fixture("README.md", "# Safe");
  assert.doesNotThrow(() => validateTrackedFile(root, "README.md"));
});

test("rejects a tracked executable", () => {
  const root = fixture("installer.exe", "not a real executable");
  assert.throws(
    () => validateTrackedFile(root, "installer.exe"),
    /forbidden tracked file/,
  );
});

test("rejects a credential pattern", () => {
  const credential = "gh" + "p_" + "A".repeat(32);
  const root = fixture("config.txt", credential);
  assert.throws(
    () => validateTrackedFile(root, "config.txt"),
    /sensitive pattern found/,
  );
});

test("rejects files larger than one MiB", () => {
  const root = fixture("large.txt", "x".repeat(1024 * 1024 + 1));
  assert.throws(() => validateTrackedFile(root, "large.txt"), /exceeds 1 MiB/);
});
