import fs from "node:fs";
import path from "node:path";
import { createHash, verify } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const SHA256 = /^[a-f0-9]{64}$/i;
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const REPOSITORY_URL = "https://github.com/loveawayss/JustReleases";
const SIGNATURE_KEY_ID = "justprivate-app-update-prod-2026-q3-v2";
const SIGNATURE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEU6II+HT9VKtv6p33BjMgqF6zqoR7
NR+DMZVVNltkG3YcW5RPfAl1xemgNRHaLUnVhQgU55z425U2QiagQHqhlw==
-----END PUBLIC KEY-----`;

const PRODUCTS = Object.freeze({
  justhub: {
    name: "Just HUB",
    manifest: "products/justhub.json",
    tag(version) {
      return `justhub-v${version}`;
    },
    artifacts(version) {
      return [{ fileName: "JustHUBInstaller.exe" }];
    },
  },
  justcleaner: {
    name: "Just Cleaner",
    manifest: "products/justcleaner.json",
    tag(version) {
      return `justcleaner-v${version}`;
    },
    artifacts(version) {
      return [{ fileName: "JustCleanerInstaller.exe" }];
    },
  },
  justprivate: {
    name: "JustPrivate",
    manifest: "products/justprivate.json",
    tag(version) {
      return `justprivate-v${version}`;
    },
    artifacts(version) {
      return [
        { fileName: "JustPrivateInstaller.exe" },
        { fileName: `JustPrivate-update-${version}-full.zip` },
      ];
    },
  },
  justfree: {
    name: "Just Free Tweaks",
    manifest: "products/justfree.json",
    tag(version) {
      return `justfree-v${version}`;
    },
    artifacts(version) {
      return [{ fileName: "JustFreeTweaks.zip" }];
    },
  },
});

const PRODUCT_FILES = new Set([
  ...Object.values(PRODUCTS).map(({ manifest }) => manifest),
  "products/justprivate-update-manifest.json",
  "products/justprivate-update-manifest.sig",
]);

function fail(message) {
  throw new Error(message);
}

function requireValue(condition, message) {
  if (!condition) {
    fail(message);
  }
}

function requireExactKeys(value, expected, label) {
  requireValue(
    value && typeof value === "object" && !Array.isArray(value),
    `${label}: expected object`,
  );
  const actual = Object.keys(value).sort();
  const allowed = [...expected].sort();
  requireValue(
    actual.length === allowed.length &&
      actual.every((key, index) => key === allowed[index]),
    `${label}: unexpected or missing fields`,
  );
}

function requireSemver(value, label) {
  requireValue(
    typeof value === "string" && SEMVER.test(value),
    `${label}: invalid SemVer`,
  );
}

function compareSemver(left, right) {
  const a = left.split(".").map(BigInt);
  const b = right.split(".").map(BigInt);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) {
      return a[index] < b[index] ? -1 : 1;
    }
  }
  return 0;
}

function requireSha256(value, label) {
  requireValue(
    typeof value === "string" && SHA256.test(value),
    `${label}: invalid SHA-256`,
  );
}

function requireNotes(value, label) {
  const validString = typeof value === "string" && value.trim().length > 0;
  const validList =
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === "string" && item.trim().length > 0);
  requireValue(validString || validList, `${label}: invalid notes`);
}

function requireDate(value, label) {
  requireValue(
    typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T/.test(value) &&
      Number.isFinite(Date.parse(value)),
    `${label}: invalid timestamp`,
  );
}

function parseStrictHttpsUrl(value, label) {
  requireValue(typeof value === "string", `${label}: expected URL string`);
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`${label}: invalid URL`);
  }
  requireValue(url.protocol === "https:", `${label}: HTTPS required`);
  requireValue(url.hostname === "github.com", `${label}: invalid host`);
  requireValue(url.port === "", `${label}: custom port is forbidden`);
  requireValue(
    url.username === "" && url.password === "",
    `${label}: credentials are forbidden`,
  );
  requireValue(
    url.search === "" && url.hash === "",
    `${label}: query and fragment are forbidden`,
  );
  return url;
}

function requireReleaseUrl(value, tag, label) {
  const url = parseStrictHttpsUrl(value, label);
  requireValue(
    url.pathname === `/loveawayss/JustReleases/releases/tag/${tag}`,
    `${label}: release path mismatch`,
  );
}

function requireDownloadUrl(value, tag, fileName, label) {
  const url = parseStrictHttpsUrl(value, label);
  requireValue(
    url.pathname ===
      `/loveawayss/JustReleases/releases/download/${tag}/${fileName}`,
    `${label}: download path mismatch`,
  );
}

function validateArtifact(artifact, tag, expectedFileName, label) {
  requireExactKeys(
    artifact,
    ["platform", "architecture", "fileName", "downloadUrl", "sha256"],
    label,
  );
  requireValue(artifact.platform === "windows", `${label}: Windows required`);
  requireValue(artifact.architecture === "x64", `${label}: x64 required`);
  requireValue(
    artifact.fileName === expectedFileName &&
      path.basename(artifact.fileName) === artifact.fileName,
    `${label}: unexpected file name`,
  );
  requireDownloadUrl(
    artifact.downloadUrl,
    tag,
    expectedFileName,
    `${label}.downloadUrl`,
  );
  requireSha256(artifact.sha256, `${label}.sha256`);
}

function validateProduct(product, id) {
  const contract = PRODUCTS[id];
  requireExactKeys(
    product,
    [
      "schemaVersion",
      "id",
      "name",
      "version",
      "channel",
      "releaseUrl",
      "notes",
      "artifacts",
    ],
    `product ${id}`,
  );
  requireValue(product.schemaVersion === 1, `product ${id}: schemaVersion`);
  requireValue(product.id === id, `product ${id}: identity mismatch`);
  requireValue(product.name === contract.name, `product ${id}: name mismatch`);
  requireSemver(product.version, `product ${id}.version`);
  requireValue(product.channel === "stable", `product ${id}: stable required`);
  requireNotes(product.notes, `product ${id}.notes`);

  const tag = contract.tag(product.version);
  requireReleaseUrl(product.releaseUrl, tag, `product ${id}.releaseUrl`);

  const expectedArtifacts = contract.artifacts(product.version);
  requireValue(
    Array.isArray(product.artifacts) &&
      product.artifacts.length === expectedArtifacts.length,
    `product ${id}: unexpected artifact count`,
  );
  product.artifacts.forEach((artifact, index) => {
    validateArtifact(
      artifact,
      tag,
      expectedArtifacts[index].fileName,
      `product ${id}.artifacts[${index}]`,
    );
  });
}

function validateCatalog(catalog) {
  requireExactKeys(
    catalog,
    ["schemaVersion", "catalogId", "repository", "updatedAt", "products"],
    "catalog",
  );
  requireValue(catalog.schemaVersion === 1, "catalog: schemaVersion");
  requireValue(catalog.catalogId === "just-releases", "catalog: catalogId");
  requireValue(catalog.repository === REPOSITORY_URL, "catalog: repository");
  requireDate(catalog.updatedAt, "catalog.updatedAt");
  requireValue(
    Array.isArray(catalog.products) &&
      catalog.products.length === Object.keys(PRODUCTS).length,
    "catalog: unexpected product count",
  );

  catalog.products.forEach((entry) => {
    requireExactKeys(
      entry,
      ["id", "name", "manifest", "channels"],
      "catalog product",
    );
    const contract = PRODUCTS[entry.id];
    requireValue(Boolean(contract), `catalog: unknown product ${entry.id}`);
    requireValue(
      entry.name === contract.name,
      `catalog: name mismatch ${entry.id}`,
    );
    requireValue(
      entry.manifest === contract.manifest,
      `catalog: manifest mismatch ${entry.id}`,
    );
    requireValue(
      Array.isArray(entry.channels) &&
        entry.channels.length === 1 &&
        entry.channels[0] === "stable",
      `catalog: channel mismatch ${entry.id}`,
    );
  });
  requireValue(
    new Set(catalog.products.map(({ id }) => id)).size ===
      catalog.products.length,
    "catalog: duplicate product",
  );
}

function validateHubUpdateInfo(updateInfo, hub) {
  requireExactKeys(
    updateInfo,
    ["version", "notes", "downloadUrl", "sha256"],
    "update_info",
  );
  requireSemver(updateInfo.version, "update_info.version");
  requireNotes(updateInfo.notes, "update_info.notes");
  requireValue(
    updateInfo.version === hub.version,
    "update_info: version mismatch",
  );
  requireValue(
    JSON.stringify(updateInfo.notes) === JSON.stringify(hub.notes),
    "update_info: notes mismatch",
  );
  requireValue(
    updateInfo.downloadUrl === hub.artifacts[0].downloadUrl,
    "update_info: URL mismatch",
  );
  requireValue(
    updateInfo.sha256 === hub.artifacts[0].sha256,
    "update_info: SHA-256 mismatch",
  );
}

function validatePrivateUpdate(manifest, signature, product) {
  requireExactKeys(
    manifest,
    [
      "product",
      "channel",
      "latestVersion",
      "minimumSupportedVersion",
      "mandatory",
      "assetName",
      "downloadUrl",
      "sha256",
      "releaseNotesUrl",
      "publishedAt",
      "rollout",
    ],
    "JustPrivate update manifest",
  );
  requireValue(
    manifest.product === "JustPrivate",
    "JustPrivate update: product mismatch",
  );
  requireValue(
    manifest.channel === "stable",
    "JustPrivate update: channel mismatch",
  );
  requireSemver(manifest.latestVersion, "JustPrivate update.latestVersion");
  requireSemver(
    manifest.minimumSupportedVersion,
    "JustPrivate update.minimumSupportedVersion",
  );
  requireValue(
    compareSemver(manifest.minimumSupportedVersion, manifest.latestVersion) <=
      0,
    "JustPrivate update: minimum version exceeds latest version",
  );
  requireValue(
    manifest.latestVersion === product.version,
    "JustPrivate update: version mismatch",
  );
  requireValue(
    manifest.mandatory === true,
    "JustPrivate update: mandatory policy required",
  );
  requireValue(
    typeof manifest.publishedAt === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(manifest.publishedAt) &&
      Number.isFinite(Date.parse(manifest.publishedAt)),
    "JustPrivate update: publishedAt must use UTC whole seconds",
  );
  requireExactKeys(manifest.rollout, ["percentage"], "JustPrivate rollout");
  requireValue(
    Number.isInteger(manifest.rollout.percentage) &&
      manifest.rollout.percentage >= 0 &&
      manifest.rollout.percentage <= 100,
    "JustPrivate update: invalid rollout",
  );

  const artifact = product.artifacts[1];
  requireValue(
    manifest.assetName === artifact.fileName,
    "JustPrivate update: asset mismatch",
  );
  requireValue(
    manifest.downloadUrl === artifact.downloadUrl,
    "JustPrivate update: URL mismatch",
  );
  requireValue(
    manifest.sha256 === artifact.sha256,
    "JustPrivate update: SHA-256 mismatch",
  );
  requireValue(
    manifest.releaseNotesUrl === product.releaseUrl,
    "JustPrivate update: release URL mismatch",
  );

  requireExactKeys(
    signature,
    [
      "signatureAlgorithm",
      "signatureKeyId",
      "signature",
      "canonicalSha256",
      "signedAt",
    ],
    "JustPrivate signature",
  );
  requireValue(
    signature.signatureAlgorithm === "ECDSA_P256_SHA256",
    "JustPrivate signature: unsupported algorithm",
  );
  requireValue(
    signature.signatureKeyId === SIGNATURE_KEY_ID,
    "JustPrivate signature: untrusted key id",
  );
  requireValue(
    typeof signature.signature === "string" &&
      /^[A-Za-z0-9+/]+={0,2}$/.test(signature.signature) &&
      Buffer.from(signature.signature, "base64").length === 64,
    "JustPrivate signature: invalid encoding",
  );
  requireSha256(
    signature.canonicalSha256,
    "JustPrivate signature.canonicalSha256",
  );
  requireDate(signature.signedAt, "JustPrivate signature.signedAt");

  const canonicalJson = JSON.stringify({
    assetName: manifest.assetName,
    channel: manifest.channel,
    downloadUrl: manifest.downloadUrl,
    latestVersion: manifest.latestVersion,
    minimumSupportedVersion: manifest.minimumSupportedVersion,
    mandatory: manifest.mandatory,
    product: manifest.product,
    publishedAt: manifest.publishedAt.replace(/Z$/, ".0000000+00:00"),
    releaseNotesUrl: manifest.releaseNotesUrl,
    rollout: { percentage: manifest.rollout.percentage },
    sha256: manifest.sha256,
  }).replaceAll("+", "\\u002B");
  const canonicalManifest = Buffer.from(canonicalJson);
  const canonicalSha256 = createHash("sha256")
    .update(canonicalManifest)
    .digest("hex");
  requireValue(
    signature.canonicalSha256.toLowerCase() === canonicalSha256,
    "JustPrivate signature: canonical SHA-256 mismatch",
  );
  requireValue(
    verify(
      "sha256",
      canonicalManifest,
      { key: SIGNATURE_PUBLIC_KEY, dsaEncoding: "ieee-p1363" },
      Buffer.from(signature.signature, "base64"),
    ),
    "JustPrivate signature: cryptographic verification failed",
  );
}

export function validateDocuments(documents) {
  validateCatalog(documents.catalog);
  for (const id of Object.keys(PRODUCTS)) {
    validateProduct(documents.products[id], id);
  }
  validateHubUpdateInfo(documents.updateInfo, documents.products.justhub);
  validatePrivateUpdate(
    documents.privateUpdateManifest,
    documents.privateUpdateSignature,
    documents.products.justprivate,
  );
}

function readJson(root, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

export function loadDocuments(root) {
  return {
    catalog: readJson(root, "catalog.json"),
    updateInfo: readJson(root, "update_info.json"),
    products: Object.fromEntries(
      Object.entries(PRODUCTS).map(([id, { manifest }]) => [
        id,
        readJson(root, manifest),
      ]),
    ),
    privateUpdateManifest: readJson(
      root,
      "products/justprivate-update-manifest.json",
    ),
    privateUpdateSignature: readJson(
      root,
      "products/justprivate-update-manifest.sig",
    ),
  };
}

export function validateRepository(root) {
  const actualProductFiles = fs
    .readdirSync(path.join(root, "products"))
    .map((name) => `products/${name}`);
  requireValue(
    actualProductFiles.length === PRODUCT_FILES.size &&
      actualProductFiles.every((file) => PRODUCT_FILES.has(file)),
    "products: unexpected or missing metadata file",
  );
  validateDocuments(loadDocuments(root));
}

const invokedPath =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedPath === import.meta.url) {
  const root = fileURLToPath(new URL("..", import.meta.url));
  validateRepository(root);
  console.log("Manifest validation passed: 4 products.");
}
