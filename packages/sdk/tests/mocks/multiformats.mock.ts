import { vi } from 'vitest';

vi.mock('multiformats/cid', () => {
  class MockCID {
    str: string;
    constructor(str: string) {
      this.str = str;
    }
    toString() {
      return this.str;
    }
    equals(other: any) {
      return other != null && other.str === this.str;
    }
    static parse(str: string) {
      return new MockCID(str);
    }
  }
  return { CID: MockCID };
});

vi.mock('blockstore-core', () => {
  class MockBlockstore {
    store = new Map<string, any>();
    async put(key: any, value: any) {
      this.store.set(key.toString(), value);
    }
    async get(key: any) {
      return this.store.get(key.toString());
    }
    async has(key: any) {
      return this.store.has(key.toString());
    }
    async delete(key: any) {
      this.store.delete(key.toString());
    }
  }
  return { MemoryBlockstore: MockBlockstore };
});

const importer = async function* (entries: any[]) {
  for (const entry of entries) {
    yield {
      cid: { toString: () => `mocked-cid-${entry.path ?? ''}` },
      path: entry.path,
      size: entry.content?.length ?? 0,
    };
  }
};

vi.mock('ipfs-unixfs-importer', () => ({ importer }));
