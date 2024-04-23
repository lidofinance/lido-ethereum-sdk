import { LidoSDK, RebaseEvent } from '@lidofinance/lido-ethereum-sdk';
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

const subscribeRebaseEvent = async (callback: (logs: any) => void) => {
  const stethContract = await lidoSDK.stake.getContractStETH();

  const unwatch = rpcProvider.watchContractEvent({
    address: stethContract.address,
    abi: stethContract.abi,
    eventName: 'TokenRebased',
    onLogs: callback,
  });

  return unwatch;
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

const rebaseEventCallback = async (logs: RebaseEvent[]) => {
  // User's balance in shares before the event
  const balanceInShares = await getUsersBalancesInShares([
    mockAddress_1,
    mockAddress_2,
    mockAddress_3,
  ]);

  const lastRebaseEvent = logs[logs.length - 1];
  if (!lastRebaseEvent) return;

  // Event arguments
  const { preTotalShares, preTotalEther, postTotalShares, postTotalEther } =
    lastRebaseEvent.args;

  const balancesUpdate = await calcBalancesUpdate(
    balanceInShares,
    preTotalEther,
    preTotalShares,
    postTotalEther,
    postTotalShares,
  );

  balancesUpdate.forEach((balanceUpdate, index) => {
    console.log(`User ${index + 1} updated balance in stETH:`, balanceUpdate);
  });
};

const main = async () => {
  subscribeRebaseEvent(rebaseEventCallback);
};

main();
