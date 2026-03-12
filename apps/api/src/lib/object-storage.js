export class InMemoryObjectStorage {
  constructor() {
    this.objects = new Map();
  }

  putObject(key, metadata = {}) {
    this.objects.set(key, { key, metadata, createdAt: new Date().toISOString() });
    return { key };
  }

  getObject(key) {
    return this.objects.get(key) || null;
  }
}
