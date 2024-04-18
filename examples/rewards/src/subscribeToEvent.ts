import { LidoSDK, RebaseEvent } from '@lidofinance/lido-ethereum-sdk';
import { createPublicClient, http } from 'viem';
import { holesky } from 'viem/chains';

const mockAddress = '0x';
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

const rebaseEventCallback = async (logs: RebaseEvent[]) => {
  // User's balance in shares before the event
  const oldBalanceInShares = await lidoSDK.shares.balance(mockAddress);

  const lastRebaseEvent = logs[logs.length - 1];
  if (!lastRebaseEvent) return;

  // Event arguments
  const { preTotalShares, preTotalEther, postTotalShares, postTotalEther } =
    lastRebaseEvent.args;

  // Calculation of the user's balance in stETH before the event
  const oldBalanceStETH = (oldBalanceInShares * preTotalEther) / preTotalShares;
  // Calculation of the user's balance in stETH after the event
  const newBalanceStETH =
    (oldBalanceInShares * postTotalEther) / postTotalShares;

  // Calculate user's updated balance per Rebase event
  const rewardsInStETH = newBalanceStETH - oldBalanceStETH;

  console.log('rewardsInStETH', rewardsInStETH);
};

const main = async () => {
  subscribeRebaseEvent(rebaseEventCallback);
};

main();
