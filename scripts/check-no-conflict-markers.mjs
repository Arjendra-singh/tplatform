import fs from "node:fs";
import { execSync } from "node:child_process";

const files = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const markerPattern = /^(<<<<<<<|=======|>>>>>>>)( .*)?$/m;
const offenders = [];

for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  if (markerPattern.test(content)) {
    offenders.push(file);
  }
}

if (offenders.length > 0) {
  console.error("Found unresolved merge conflict markers in:");
  for (const file of offenders) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log("OK: no merge conflict markers found");
