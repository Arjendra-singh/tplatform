import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createServer, createAppState } from "../src/server.js";
import { signJwt } from "../src/lib/jwt.js";

async function startTestServer() {
  const state = createAppState();
  const server = createServer({ state, adapter: "memory" });
  await new Promise((resolve) => server.listen(0, resolve));
  const address = server.address();
  return { server, baseUrl: `http://127.0.0.1:${address.port}`, state };
}

async function register(baseUrl, email = "owner@doc.com") {
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fullName: "Owner", email, password: "pass123", organizationName: "DocOrg" })
  });
  return response.json();
}

test("document folder lifecycle and role restrictions", async () => {
  const { server, baseUrl, state } = await startTestServer();
  try {
    const owner = await register(baseUrl);
    const auth = { authorization: `Bearer ${owner.accessToken}`, "content-type": "application/json" };

    const create = await fetch(`${baseUrl}/api/v1/documents/folders`, { method: "POST", headers: auth, body: JSON.stringify({ name: "Registration Docs" }) });
    const created = await create.json();
    assert.equal(create.status, 201);

    const list = await fetch(`${baseUrl}/api/v1/documents/folders`, { headers: { authorization: `Bearer ${owner.accessToken}` } });
    const listed = await list.json();
    assert.equal(list.status, 200);
    assert.equal(listed.data.length, 1);

    const memberId = "USR-DOC-MEMBER";
    state.users.push({ id: memberId, fullName: "Member", email: "member@doc.com", passwordHash: "x", organizationId: owner.organization.id, role: "member", createdAt: new Date().toISOString() });
    state.memberships.push({ id: crypto.randomUUID(), userId: memberId, orgId: owner.organization.id, role: "member", createdAt: new Date().toISOString() });
    const memberToken = signJwt({ sub: memberId, type: "access", orgId: owner.organization.id, role: "member" }, process.env.JWT_SECRET || "changeme", 600);

    const renameDenied = await fetch(`${baseUrl}/api/v1/documents/folders/${created.data.id}`, { method: "PATCH", headers: { authorization: `Bearer ${memberToken}`, "content-type": "application/json" }, body: JSON.stringify({ name: "x" }) });
    assert.equal(renameDenied.status, 403);

    const ownerRename = await fetch(`${baseUrl}/api/v1/documents/folders/${created.data.id}`, { method: "PATCH", headers: auth, body: JSON.stringify({ name: "Updated Folder" }) });
    assert.equal(ownerRename.status, 200);
  } finally {
    server.close();
  }
});

test("file create + versioning + list", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const owner = await register(baseUrl, "owner2@doc.com");
    const auth = { authorization: `Bearer ${owner.accessToken}`, "content-type": "application/json" };

    const folderRes = await fetch(`${baseUrl}/api/v1/documents/folders`, { method: "POST", headers: auth, body: JSON.stringify({ name: "Bids" }) });
    const folder = await folderRes.json();

    const fileRes = await fetch(`${baseUrl}/api/v1/documents/folders/${folder.data.id}/files`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ name: "bid.pdf", mimeType: "application/pdf", sizeBytes: 1024, checksum: "abc", storageKey: "k1" })
    });
    const fileBody = await fileRes.json();
    assert.equal(fileRes.status, 201);
    assert.equal(fileBody.data.currentVersion, 1);

    const addVersion = await fetch(`${baseUrl}/api/v1/documents/files/${fileBody.data.id}/versions`, {
      method: "POST",
      headers: auth,
      body: JSON.stringify({ sizeBytes: 2048, checksum: "def", storageKey: "k2" })
    });
    assert.equal(addVersion.status, 201);

    const versions = await fetch(`${baseUrl}/api/v1/documents/files/${fileBody.data.id}/versions`, { headers: { authorization: `Bearer ${owner.accessToken}` } });
    const versionsBody = await versions.json();
    assert.equal(versions.status, 200);
    assert.equal(versionsBody.data.length, 2);
    assert.equal(versionsBody.data[1].version, 2);
  } finally {
    server.close();
  }
});

test("document validations and unauthorized handling", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const owner = await register(baseUrl, "owner3@doc.com");
    const auth = { authorization: `Bearer ${owner.accessToken}`, "content-type": "application/json" };

    const folderRes = await fetch(`${baseUrl}/api/v1/documents/folders`, { method: "POST", headers: auth, body: JSON.stringify({ name: "Fin" }) });
    const folder = await folderRes.json();

    const badMime = await fetch(`${baseUrl}/api/v1/documents/folders/${folder.data.id}/files`, { method: "POST", headers: auth, body: JSON.stringify({ name: "mal.exe", mimeType: "application/x-msdownload", sizeBytes: 10 }) });
    assert.equal(badMime.status, 400);

    const unauth = await fetch(`${baseUrl}/api/v1/documents/folders`);
    assert.equal(unauth.status, 401);
  } finally {
    server.close();
  }
});
