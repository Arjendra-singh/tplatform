import { writeBackupSnapshot } from "../src/lib/dr.js";

const outputDir = process.env.BACKUP_DIR || "./backups";
const payload = {
  metadata: {
    createdAt: new Date().toISOString(),
    source: "tender-sahayak-api",
    strategy: "logical-json-snapshot"
  },
  data: {
    tables: ["users", "organizations", "memberships", "tenders", "bookmarks", "document_files", "document_file_versions", "audit_logs"]
  }
};

const file = writeBackupSnapshot({ outputDir, payload });
console.log(file);
