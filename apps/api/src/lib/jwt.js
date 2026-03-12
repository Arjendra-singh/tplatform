import crypto from "node:crypto";

function toBase64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function fromBase64Url(input) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signPart(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function signJwt(payload, secret, expiresInSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const encodedHeader = toBase64Url(JSON.stringify(header));
  const encodedPayload = toBase64Url(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = signPart(data, secret);

  return `${data}.${signature}`;
}

export function verifyJwt(token, secret) {
  if (!token || token.split(".").length !== 3) {
    return { valid: false, reason: "invalid" };
  }

  const [encodedHeader, encodedPayload, signature] = token.split(".");
  const data = `${encodedHeader}.${encodedPayload}`;
  const expected = signPart(data, secret);

  if (signature !== expected) {
    return { valid: false, reason: "invalid" };
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || now >= payload.exp) {
      return { valid: false, reason: "expired" };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: "invalid" };
  }
}
