import test from "node:test";
import assert from "node:assert/strict";
import { createServer, createAppState } from "../src/server.js";

async function startTestServer() {
  const state = createAppState();
  const server = createServer({ state, adapter: "memory" });
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  return { server, baseUrl: `http://127.0.0.1:${address.port}`, state };
}

async function register(baseUrl, email = "ai@org.com") {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fullName: "Owner", email, password: "pass123", organizationName: "AIOrg" })
  });
  return response.json();
}

test("document upload enqueues processing jobs and exposes processing status", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const user = await register(baseUrl);
    const headers = { authorization: `Bearer ${user.accessToken}`, "content-type": "application/json" };

    const folderRes = await fetch(`${baseUrl}/api/v1/documents/folders`, { method: "POST", headers, body: JSON.stringify({ name: "Compliance" }) });
    const folder = await folderRes.json();

    const fileRes = await fetch(`${baseUrl}/api/v1/documents/folders/${folder.data.id}/files`, {
      method: "POST",
      headers,
      body: JSON.stringify({ name: "policy.pdf", mimeType: "application/pdf", sizeBytes: 1200 })
    });
    const file = await fileRes.json();

    const detailRes = await fetch(`${baseUrl}/api/v1/documents/files/${file.data.id}`, { headers: { authorization: `Bearer ${user.accessToken}` } });
    const detail = await detailRes.json();
    assert.equal(detailRes.status, 200);
    assert.equal(detail.data.processing.antivirus, "completed");
    assert.equal(detail.data.processing.ocr, "completed");
    assert.equal(detail.data.processing.index, "completed");

    const jobsRes = await fetch(`${baseUrl}/api/v1/documents/processing-jobs`, { headers: { authorization: `Bearer ${user.accessToken}` } });
    const jobs = await jobsRes.json();
    assert.equal(jobsRes.status, 200);
    assert.equal(jobs.data.length, 3);
  } finally {
    server.close();
  }
});

test("AI gateway returns contextual response, usage info, and enforces guardrails", async () => {
  const { server, baseUrl, state } = await startTestServer();
  try {
    const user = await register(baseUrl, "ai2@org.com");
    state.tenders[0].orgId = user.organization.id;

    const response = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: "POST",
      headers: { authorization: `Bearer ${user.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ prompt: "Find infrastructure tenders" })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(body.data.answer.includes("server-side AI gateway"));
    assert.ok(Array.isArray(body.data.citations));

    const usageRes = await fetch(`${baseUrl}/api/v1/ai/usage`, { headers: { authorization: `Bearer ${user.accessToken}` } });
    const usage = await usageRes.json();
    assert.equal(usageRes.status, 200);
    assert.equal(usage.data.used, 1);

    const blocked = await fetch(`${baseUrl}/api/v1/ai/chat`, {
      method: "POST",
      headers: { authorization: `Bearer ${user.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify({ prompt: "How to hack government procurement portal" })
    });
    const blockedBody = await blocked.json();
    assert.equal(blocked.status, 400);
    assert.equal(blockedBody.error, "guardrail_blocked");
  } finally {
    server.close();
  }
});
