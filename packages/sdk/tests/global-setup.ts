import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const getFreePort = (): Promise<number> =>
  new Promise((resolve) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const port = (srv.address() as net.AddressInfo).port;
      srv.close(() => resolve(port));
    });
  });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const getLatestBlockNumber = async (rpcUrl: string): Promise<bigint> => {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    }),
  });
  const { result } = (await res.json()) as { result: string };
  return BigInt(result);
};

/**
 * Vitest globalSetup — runs in the main process before any test worker starts.
 * Anvil processes are started here and their ports written to process.env so that
 * forked test workers (which inherit the env) can connect via HTTP.
 *
 * Requires the `anvil` binary from Foundry:
 *   https://book.getfoundry.sh/getting-started/installation
 */
export const setup = async () => {
  if (!process.env.TEST_RPC_URL || !process.env.TEST_CHAIN_ID) {
    // No network env configured — unit tests only, nothing to start.
    return;
  }

  const { createAnvil } = await import('@viem/anvil');

  const startAnvil = async (forkUrl: string) => {
    // forkChainId is intentionally omitted: Anvil inherits the chain ID from
    // the fork automatically.
    //
    // forkBlockNumber is fetched dynamically so Anvil does not fall back to the
    // 'finalized' block tag.
    //
    // Port is chosen dynamically so parallel/repeated runs don't collide.
    const [port, forkBlockNumber] = await Promise.all([
      getFreePort(),
      getLatestBlockNumber(forkUrl),
    ]);
    const anvil = createAnvil({ forkUrl, port, forkBlockNumber });
    await anvil.start();
    return anvil;
  };

  const instances: Array<Awaited<ReturnType<typeof startAnvil>>> = [];

  const anvil = await startAnvil(process.env.TEST_RPC_URL);
  process.env.VITEST_ANVIL_PORT = String(anvil.port);
  instances.push(anvil);

  if (process.env.TEST_L2_RPC_URL) {
    const l2Anvil = await startAnvil(process.env.TEST_L2_RPC_URL);
    process.env.VITEST_L2_ANVIL_PORT = String(l2Anvil.port);
    instances.push(l2Anvil);
  }

  return async () => {
    await Promise.allSettled(instances.map((a) => a.stop()));
  };
};
