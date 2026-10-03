import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.resolve(source, "..", "personal-website-sites", "dist");
const files = [
  "index.html",
  "css/styles.css",
  "js/main.js",
  "assets/images/avatar.jpg",
  "assets/images/bjtu-logo.png",
  "assets/images/recast-preview.webp",
  "assets/images/recast-preview.png",
  "assets/images/recast-figures.pdf",
];

for (const file of files) {
  const target = path.join(output, file);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(source, file), target);
}
console.log(`Prepared ${files.length} website files at ${output}`);
