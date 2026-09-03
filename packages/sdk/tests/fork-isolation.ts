import { afterAll, beforeAll } from 'vitest';
import {
  createTestClient,
  http,
  parseEther,
  publicActions,
  walletActions,
  type Address,
  type Hash,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { useAnvilUrl } from './utils/fixtures/use-anvil-url.js';
import {
  CHAINS,
  LIDO_LOCATOR_BY_CHAIN,
  VIEM_CHAINS,
} from '../src/common/constants.js';

const locatorAbi = [
  {
    inputs: [],
    name: 'lido',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'wstETH',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawalQueue',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const stethAbi = [
  {
    inputs: [
      { internalType: 'uint256', name: '_sharesAmount', type: 'uint256' },
    ],
    name: 'getPooledEthByShares',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const withdrawalQueueAbi = [
  {
    inputs: [{ internalType: 'address', name: '_owner', type: 'address' }],
    name: 'getWithdrawalRequests',
    outputs: [
      { internalType: 'uint256[]', name: 'requestsIds', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: '_amounts', type: 'uint256[]' },
      { internalType: 'address', name: '_owner', type: 'address' },
    ],
    name: 'requestWithdrawals',
    outputs: [
      { internalType: 'uint256[]', name: 'requestIds', type: 'uint256[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLastRequestId',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256[]', name: '_batches', type: 'uint256[]' },
      { internalType: 'uint256', name: '_maxShareRate', type: 'uint256' },
    ],
    name: 'prefinalize',
    outputs: [
      { internalType: 'uint256', name: 'ethToLock', type: 'uint256' },
      { internalType: 'uint256', name: 'sharesToBurn', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_lastRequestIdToBeFinalized',
        type: 'uint256',
      },
      { internalType: 'uint256', name: '_maxShareRate', type: 'uint256' },
    ],
    name: 'finalize',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

const erc20Abi = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const SEED_ETH_BALANCE = parseEther('100');
const SEED_STAKE_VALUE = parseEther('10');
const SEED_TOKEN_THRESHOLD = parseEther('0.1');
const SEED_ALLOWANCE = parseEther('1');

const createSeedClient = (url: string, chainId: CHAINS) =>
  createTestClient({
    mode: 'anvil',
    chain: VIEM_CHAINS[chainId],
    transport: http(url),
  })
    .extend(publicActions)
    .extend(walletActions);

/**
 * Funds the test accounts with ETH and seeds stETH/wstETH balances and
 * allowances on the worker's fork, so tests do not depend on the env account
 * holding real testnet funds. Idempotent — token seeding is skipped once the
 * fork already carries the state (from a previous test file on this worker).
 */
const seedAccounts = async (
  client: ReturnType<typeof createSeedClient>,
  chainId: CHAINS,
) => {
  const privateKey = process.env.TEST_PRIVATE_KEY as Hash;
  const account = privateKeyToAccount(privateKey);
  // same alt-account derivation as tests/utils/fixtures/use-wallet-client.ts
  const altAccount = privateKeyToAccount(
    ('0x' + (BigInt(privateKey) + 1n).toString(16)) as Hash,
  );

  await client.setBalance({
    address: account.address,
    value: SEED_ETH_BALANCE,
  });
  await client.setBalance({
    address: altAccount.address,
    value: SEED_ETH_BALANCE,
  });

  const locator = LIDO_LOCATOR_BY_CHAIN[chainId];
  if (!locator) return;

  const [steth, wsteth, withdrawalQueue] = await Promise.all([
    client.readContract({
      address: locator,
      abi: locatorAbi,
      functionName: 'lido',
    }),
    client.readContract({
      address: locator,
      abi: locatorAbi,
      functionName: 'wstETH',
    }),
    client.readContract({
      address: locator,
      abi: locatorAbi,
      functionName: 'withdrawalQueue',
    }),
  ]);

  for (const token of [steth, wsteth] as Address[]) {
    const balance = await client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [account.address],
    });
    if (balance < SEED_TOKEN_THRESHOLD) {
      // Sending ETH to stETH stakes it; sending ETH to wstETH stakes and wraps.
      const hash = await client.sendTransaction({
        account,
        to: token,
        value: SEED_STAKE_VALUE,
      });
      await client.waitForTransactionReceipt({ hash });
    }

    // transferFrom tests rely on this allowance when the spending `approve`
    // tests are skipped (TEST_SKIP_SPENDING_TESTS).
    const allowance = await client.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [account.address, altAccount.address],
    });
    if (allowance < SEED_ALLOWANCE) {
      const hash = await client.writeContract({
        account,
        address: token,
        abi: erc20Abi,
        functionName: 'approve',
        args: [altAccount.address, SEED_ALLOWANCE],
      });
      await client.waitForTransactionReceipt({ hash });
    }
  }

  // Withdrawal-info tests expect the account to own withdrawal requests, at
  // least one of them claimable. Create two requests and finalize the first
  // one, so the account has one claimable and one pending request.
  const ownedRequests = await client.readContract({
    address: withdrawalQueue,
    abi: withdrawalQueueAbi,
    functionName: 'getWithdrawalRequests',
    args: [account.address],
  });
  if (ownedRequests.length === 0) {
    const requestAmount = parseEther('1');
    let hash = await client.writeContract({
      account,
      address: steth,
      abi: erc20Abi,
      functionName: 'approve',
      args: [withdrawalQueue, requestAmount * 2n],
    });
    await client.waitForTransactionReceipt({ hash });
    hash = await client.writeContract({
      account,
      address: withdrawalQueue,
      abi: withdrawalQueueAbi,
      functionName: 'requestWithdrawals',
      args: [[requestAmount, requestAmount], account.address],
    });
    await client.waitForTransactionReceipt({ hash });

    // finalize is normally called by the Lido contract during an oracle
    // report (it holds FINALIZE_ROLE), so impersonate it. ethToLock covers
    // every unfinalized request up to ours, which anvil's setBalance funds.
    const lastRequestId = await client.readContract({
      address: withdrawalQueue,
      abi: withdrawalQueueAbi,
      functionName: 'getLastRequestId',
    });
    const finalizeTo = lastRequestId - 1n;
    const maxShareRate = await client.readContract({
      address: steth,
      abi: stethAbi,
      functionName: 'getPooledEthByShares',
      args: [10n ** 27n],
    });
    const [ethToLock] = await client.readContract({
      address: withdrawalQueue,
      abi: withdrawalQueueAbi,
      functionName: 'prefinalize',
      args: [[finalizeTo], maxShareRate],
    });
    await client.setBalance({
      address: steth,
      value: ethToLock + parseEther('10'),
    });
    await client.impersonateAccount({ address: steth });
    hash = await client.writeContract({
      account: steth,
      address: withdrawalQueue,
      abi: withdrawalQueueAbi,
      functionName: 'finalize',
      args: [finalizeTo, maxShareRate],
      value: ethToLock,
    });
    await client.waitForTransactionReceipt({ hash });
    await client.stopImpersonatingAccount({ address: steth });
  }
};

// Seed the fork, then snapshot it before each test file and revert after it,
// so files never leak state into each other regardless of how Vitest schedules
// them across workers.
const isolateFork = (url: string, chainId: CHAINS) => {
  const client = createSeedClient(url, chainId);

  let snapshotId: `0x${string}`;

  beforeAll(async () => {
    if (process.env.TEST_PRIVATE_KEY) {
      await seedAccounts(client, chainId);
    }
    snapshotId = await client.snapshot();
  });

  afterAll(async () => {
    await client.revert({ id: snapshotId });
  });
};

if (process.env.VITEST_ANVIL_PORT && process.env.TEST_CHAIN_ID) {
  isolateFork(useAnvilUrl(), Number(process.env.TEST_CHAIN_ID) as CHAINS);
}
// The L2 fork is deliberately not isolated here: snapshotting it eagerly would
// cold-start an L2 Anvil in every worker, while only a single test file uses
// L2 (that file seeds its own L2 state — see l2.test.ts). Add it here if more
// L2 test files appear.
