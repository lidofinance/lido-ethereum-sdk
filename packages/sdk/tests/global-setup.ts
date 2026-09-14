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
 *
 * A prool proxy server is started here (one for L1, optionally one for L2) and
 * its port written to process.env so that forked test workers (which inherit
 * the env) can connect via HTTP. Each worker connects to
 * `http://127.0.0.1:<port>/<VITEST_POOL_ID>` and prool lazily spawns a
 * dedicated Anvil fork per pool ID, so workers run in parallel on isolated
 * forks of the same block.
 *
 * Requires the `anvil` binary from Foundry:
 *   https://book.getfoundry.sh/getting-started/installation
 */
export const setup = async () => {
  if (!process.env.TEST_RPC_URL || !process.env.TEST_CHAIN_ID) {
    // No network env configured — unit tests only, nothing to start.
    return;
  }

  const { Instance, Server } = await import('prool');

  const startForkServer = async (forkUrl: string) => {
    // forkChainId is intentionally omitted: Anvil inherits the chain ID from
    // the fork automatically.
    //
    // forkBlockNumber is fetched once so Anvil does not fall back to the
    // 'finalized' block tag, and so every worker's fork shares the same block —
    // Anvil's on-disk RPC cache is then shared across instances instead of
    // each one re-fetching state from the upstream RPC.
    //
    // Port is chosen dynamically so parallel/repeated runs don't collide.
    const [port, forkBlockNumber] = await Promise.all([
      getFreePort(),
      getLatestBlockNumber(forkUrl),
    ]);
    const server = Server.create({
      instance: Instance.anvil({ forkUrl, forkBlockNumber }),
      host: '127.0.0.1',
      port,
    });
    await server.start();
    return { server, port };
  };

  const servers: Array<Awaited<ReturnType<typeof startForkServer>>['server']> =
    [];

  const l1 = await startForkServer(process.env.TEST_RPC_URL);
  process.env.VITEST_ANVIL_PORT = String(l1.port);
  servers.push(l1.server);

  if (process.env.TEST_L2_RPC_URL) {
    const l2 = await startForkServer(process.env.TEST_L2_RPC_URL);
    process.env.VITEST_L2_ANVIL_PORT = String(l2.port);
    servers.push(l2.server);
  }

  return async () => {
    await Promise.allSettled(servers.map((s) => s.stop()));
  };
};
