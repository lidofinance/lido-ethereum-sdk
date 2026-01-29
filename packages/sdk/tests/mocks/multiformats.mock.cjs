jest.mock(
  'multiformats/cid',
  () => {
    class MockCID {
      constructor(str) {
        this.str = str;
      }
      toString() {
        return this.str;
      }
      equals(other) {
        return other && other.str === this.str;
      }
      static parse(str) {
        return new MockCID(str);
      }
    }
    return { CID: MockCID };
  },
  { virtual: true },
);

jest.mock(
  'blockstore-core',
  () => {
    class MockBlockstore {
      constructor() {
        this.store = new Map();
      }
      async put(key, value) {
        this.store.set(key.toString(), value);
      }
      async get(key) {
        return this.store.get(key.toString());
      }
      async has(key) {
        return this.store.has(key.toString());
      }
      async delete(key) {
        this.store.delete(key.toString());
      }
    }
    return { MemoryBlockstore: MockBlockstore };
  },
  { virtual: true },
);

jest.mock(
  'ipfs-unixfs-importer',
  () => {
    // eslint-disable-next-line unicorn/consistent-function-scoping
    const importer = async function* (entries, blockstore) {
      for (const entry of entries) {
        yield {
          cid: { toString: () => `mocked-cid-${entry.path}` },
          path: entry.path,
          size: entry.content.length > 0 || 0,
        };
      }
    };

    return { importer };
  },
  { virtual: true },
);
