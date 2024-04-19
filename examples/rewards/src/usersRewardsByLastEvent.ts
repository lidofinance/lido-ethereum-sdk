import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import { createPublicClient, http, Address } from 'viem';
import { holesky } from 'viem/chains';

const mockAddress_1 = '0x';
const mockAddress_2 = '0x';
const mockAddress_3 = '0x';

const rpcProvider = createPublicClient({
  chain: holesky,
  transport: http(),
});
const lidoSDK = new LidoSDK({
  chainId: holesky.id,
  rpcProvider,
});

const getLastRebaseEvent = async () => {
  const lastRebaseEvent = await lidoSDK.events.stethEvents.getLastRebaseEvent();
  if (!lastRebaseEvent) return null;

  // Event arguments
  const { preTotalShares, preTotalEther, postTotalShares, postTotalEther } =
    lastRebaseEvent.args;

  return {
    preTotalShares,
    preTotalEther,
    postTotalShares,
    postTotalEther,
  };
};

const getUsersBalancesInShares = async (accounts: Address[]) => {
  const balances = await Promise.all(
    accounts.map((account) => lidoSDK.shares.balance(account)),
  );

  return balances;
};

const calcBalancesUpdate = async (
  balanceInShares: bigint[],
  preTotalEther: bigint,
  preTotalShares: bigint,
  postTotalEther: bigint,
  postTotalShares: bigint,
) => {
  const balancesUpdate = balanceInShares.map((balance) => {
    // Calculation of the user's balance in stETH before the event
    const preBalanceStETH = (balance * preTotalEther) / preTotalShares;
    // Calculation of the user's balance in stETH after the event
    const postBalanceStETH = (balance * postTotalEther) / postTotalShares;

    // Calculate user's balance change per Rebase event
    return postBalanceStETH - preBalanceStETH;
  });

  return balancesUpdate;
};

const main = async () => {
  // User's balance in shares before the event
  const balanceInShares = await getUsersBalancesInShares([
    mockAddress_1,
    mockAddress_2,
    mockAddress_3,
  ]);

  const lastRebaseEvent = await getLastRebaseEvent();
  if (!lastRebaseEvent) return;

  const balancesUpdate = await calcBalancesUpdate(
    balanceInShares,
    lastRebaseEvent.preTotalEther,
    lastRebaseEvent.preTotalShares,
    lastRebaseEvent.postTotalEther,
    lastRebaseEvent.postTotalShares,
  );

  balancesUpdate.forEach((balanceUpdate, index) => {
    console.log(`User ${index + 1} updated balance in stETH:`, balanceUpdate);
  });
};

main();
