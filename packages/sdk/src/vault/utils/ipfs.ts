import { CID } from 'multiformats';
import { MemoryBlockstore } from 'blockstore-core';
import { importer } from 'ipfs-unixfs-importer';
import { ReportFetchArgs } from '../types.js';

export const IPFS_GATEWAY = 'https://ipfs.io/ipfs';

export const fetchIPFS = async <T>(args: ReportFetchArgs): Promise<T> => {
  const { cid, gateway = IPFS_GATEWAY } = args;

  const { json } = await fetchIPFSDirectAndVerify<T>(cid, gateway);
  return json;
};

// Fetching buffer content by CID through IPFS gateway
export const fetchIPFSBuffer = async (
  args: ReportFetchArgs,
): Promise<Uint8Array> => {
  const { cid, gateway = IPFS_GATEWAY } = args;
  const ipfsUrl = `${gateway}/${cid}`;

  const response = await fetch(ipfsUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch IPFS content: ${response.statusText}`);
  }
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
};

// Recalculate CID using full UnixFS logic (like `ipfs add`)
export const calculateIPFSAddCID = async (
  fileContent: Uint8Array,
): Promise<CID> => {
  const blockstore = new MemoryBlockstore();

  const entries = importer([{ content: fileContent }], blockstore, {
    cidVersion: 0,
    rawLeaves: false, // important! otherwise CID will be v1
  });

  let lastCid: CID | null = null;
  for await (const entry of entries) {
    lastCid = entry.cid;
  }

  if (!lastCid) {
    throw new Error('CID calculation failed — no entries found');
  }

  return lastCid;
};

// Downloading file from IPFS and checking its integrity
export const fetchIPFSDirectAndVerify = async <T>(
  cid: string,
  gateway = IPFS_GATEWAY,
): Promise<{ json: T; fileContent: Uint8Array }> => {
  const originalCID = CID.parse(cid);

  const fileContent = await fetchIPFSBuffer({ cid, gateway });
  const calculatedCID = await calculateIPFSAddCID(fileContent);

  if (!calculatedCID.equals(originalCID)) {
    throw new Error(
      `❌ CID mismatch! Expected ${originalCID}, but got ${calculatedCID}`,
    );
  }

  const json = JSON.parse(new TextDecoder().decode(fileContent)) as T;
  return {
    fileContent,
    json,
  };
};
