import crypto from "node:crypto";
import fs from "node:fs";

const [privateKeyPath, id] = process.argv.slice(2);
if (!privateKeyPath || !["justcleaner", "justprivate", "justfree"].includes(id)) {
  throw new Error("Usage: node scripts/sign-product-manifest.mjs <private-key> <justcleaner|justprivate|justfree>");
}
const key = crypto.createPrivateKey(fs.readFileSync(privateKeyPath));
if (crypto.createPublicKey(key).export({ format: "jwk" }).x !== "w3GpXs-EpzBlAV51R7INreB8_loWo-AxBu6AoCOFM6s") {
  throw new Error("Wrong Just HUB signing key.");
}
const path = new URL(`../products/${id}.json`, import.meta.url);
const body = fs.readFileSync(path);
const signature = crypto.sign(null,
  Buffer.concat([Buffer.from("justhub-product-manifest-v1\n"), body]), key);
fs.writeFileSync(new URL(`../products/${id}.json.sig`, import.meta.url), `${signature.toString("base64url")}\n`);
console.log(`Signed ${id} product manifest.`);
