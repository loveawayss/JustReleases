import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const MAX_TRACKED_BYTES = 1024 * 1024;
const FORBIDDEN_EXTENSIONS = [
  ".exe",
  ".msi",
  ".zip",
  ".7z",
  ".rar",
  ".pfx",
  ".p12",
  ".pem",
  ".key",
  ".log",
  ".tmp",
  ".bak",
];
const FORBIDDEN_NAMES = new Set([
  ".env",
  ".ds_store",
  "thumbs.db",
  "desktop.ini",
  "credentials.json",
  "serviceaccountkey.json",
]);
const SECRET_PATTERNS = [
  new RegExp("gh" + "p_[A-Za-z0-9]{20,}", "i"),
  new RegExp("github" + "_pat_[A-Za-z0-9_]{20,}", "i"),
  new RegExp("sb_" + "secret_[A-Za-z0-9_-]{10,}", "i"),
  new RegExp("AK" + "IA[0-9A-Z]{16}"),
  new RegExp("-----BEGIN [A-Z0-9 ]*PRIVATE " + "KEY-----", "i"),
  new RegExp("loveawayss/" + "JustPrivate(?:\\.git)?", "i"),
];

function fail(message) {
  throw new Error(message);
}

export function validateTrackedFile(root, relativePath) {
  const normalized = relativePath.replaceAll("\\", "/");
  const baseName = path.basename(normalized).toLowerCase();
  const extension = FORBIDDEN_EXTENSIONS.find((item) =>
    baseName.endsWith(item),
  );

  if (FORBIDDEN_NAMES.has(baseName) || extension) {
    fail(`forbidden tracked file: ${normalized}`);
  }

  const absolutePath = path.join(root, relativePath);
  const stats = fs.lstatSync(absolutePath);
  if (!stats.isFile()) {
    fail(`tracked path is not a regular file: ${normalized}`);
  }
  if (stats.size > MAX_TRACKED_BYTES) {
    fail(`tracked file exceeds 1 MiB: ${normalized}`);
  }

  const content = fs.readFileSync(absolutePath, "utf8");
  if (content.includes("\u0000")) {
    fail(`binary content is forbidden: ${normalized}`);
  }
  if (SECRET_PATTERNS.some((pattern) => pattern.test(content))) {
    fail(`sensitive pattern found: ${normalized}`);
  }
}

export function validateRepositorySafety(root) {
  const output = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
  });
  const files = output.split("\u0000").filter(Boolean);
  for (const file of files) {
    validateTrackedFile(root, file);
  }
  return files.length;
}

const invokedPath =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedPath === import.meta.url) {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const count = validateRepositorySafety(root);
  console.log(`Repository safety validation passed: ${count} files.`);
}
