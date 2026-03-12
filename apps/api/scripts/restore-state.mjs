import { restoreBackupSnapshot, validateBackupPayload } from "../src/lib/dr.js";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node apps/api/scripts/restore-state.mjs <snapshot-file>");
  process.exit(1);
}

const snapshot = restoreBackupSnapshot(file);
if (!validateBackupPayload(snapshot)) {
  console.error("Invalid backup snapshot payload");
  process.exit(2);
}

console.log(JSON.stringify({ restored: true, tables: snapshot.data.tables.length }));
