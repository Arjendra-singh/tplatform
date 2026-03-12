const BLOCKED_PATTERNS = [
  /bypass\s+security/i,
  /exploit\s+vulnerability/i,
  /create\s+malware/i,
  /hack\s+government/i
];

export function runGuardrails(input) {
  const text = String(input || "");
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return { allowed: false, reason: "Request violates safety policy" };
    }
  }
  return { allowed: true };
}
