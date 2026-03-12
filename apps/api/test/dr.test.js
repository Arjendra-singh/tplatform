import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeBackupSnapshot, restoreBackupSnapshot, validateBackupPayload } from "../src/lib/dr.js";

const execFileAsync = promisify(execFile);

test("backup/restore helpers produce valid snapshot", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tender-backup-"));
  const payload = { metadata: { createdAt: new Date().toISOString() }, data: { tables: ["users"] } };
  const file = writeBackupSnapshot({ outputDir: dir, payload });
  const restored = restoreBackupSnapshot(file);

  assert.equal(validateBackupPayload(restored), true);
  assert.deepEqual(restored.data.tables, ["users"]);
});

test("backup/restore scripts work end-to-end", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tender-backup-script-"));
  const backup = await execFileAsync("node", ["scripts/backup-state.mjs"], {
    cwd: process.cwd(),
    env: { ...process.env, BACKUP_DIR: dir }
  });

  const backupPath = backup.stdout.trim();
  assert.equal(fs.existsSync(backupPath), true);

  const restore = await execFileAsync("node", ["scripts/restore-state.mjs", backupPath], {
    cwd: process.cwd()
  });
  const parsed = JSON.parse(restore.stdout.trim());
  assert.equal(parsed.restored, true);
  assert.ok(parsed.tables > 0);
});
