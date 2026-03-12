import fs from "node:fs";
import path from "node:path";

export function writeBackupSnapshot({ outputDir, payload }) {
  fs.mkdirSync(outputDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(outputDir, `snapshot-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify(payload, null, 2));
  return file;
}

export function restoreBackupSnapshot(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

export function validateBackupPayload(payload) {
  if (!payload || typeof payload !== "object") return false;
  if (!payload.metadata || !payload.data) return false;
  return Array.isArray(payload.data.tables);
}
