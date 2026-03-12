export class InMemoryRateLimiter {
  constructor({ maxAttempts, windowSec }) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowSec * 1000;
    this.store = new Map();
  }

  check(key) {
    const now = Date.now();
    const arr = this.store.get(key) || [];
    const fresh = arr.filter((t) => now - t < this.windowMs);
    if (fresh.length >= this.maxAttempts) {
      this.store.set(key, fresh);
      return false;
    }
    fresh.push(now);
    this.store.set(key, fresh);
    return true;
  }
}
