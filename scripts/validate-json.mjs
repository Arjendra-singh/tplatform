import fs from "node:fs";

const files = [
  "package.json",
  "apps/api/package.json",
  "package-lock.json",
  "ops/monitoring/grafana-dashboard.json"
];

let failed = false;
for (const file of files) {
  try {
    const raw = fs.readFileSync(file, "utf8");
    JSON.parse(raw);
    console.log(`OK ${file}`);
  } catch (error) {
    failed = true;
    console.error(`INVALID JSON: ${file}`);
    console.error(error.message);
  }
}

if (failed) {
  process.exit(1);
}
