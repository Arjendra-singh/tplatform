import fs from "node:fs";

const files = ["package.json", "apps/api/package.json"];

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  JSON.parse(raw);
  console.log(`OK ${file}`);
}
