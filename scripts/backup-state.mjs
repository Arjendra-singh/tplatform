import fs from "fs";

const snapshot = {
  timestamp: new Date().toISOString(),
  status: "ok"
};

fs.writeFileSync("backup-snapshot.json", JSON.stringify(snapshot, null, 2));

console.log("backup snapshot created");
