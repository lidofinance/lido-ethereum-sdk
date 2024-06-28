/* eslint-disable @typescript-eslint/no-floating-promises */
import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
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

const getLastRebaseEvent = async () => {
  const lastRebaseEvent = await lidoSDK.events.stethEvents.getLastRebaseEvent();
  if (!lastRebaseEvent) return null;

  const { preTotalShares, preTotalEther, postTotalShares, postTotalEther } =
    lastRebaseEvent.args;

  return {
    preTotalShares,
    preTotalEther,
    postTotalShares,
    postTotalEther,
  };
};

const main = async () => {
  // User's balance in shares before the event
  const balanceInShares = await lidoSDK.shares.balance(mockAddress);

  const lastEventData = await getLastRebaseEvent();
  if (!lastEventData) return;

  // Calculation of the user's balance in stETH before the event
  const preBalanceStETH =
    (balanceInShares * lastEventData.preTotalEther) /
    lastEventData.preTotalShares;
  // Calculation of the user's balance in stETH after the event
  const postBalanceStETH =
    (balanceInShares * lastEventData.postTotalEther) /
    lastEventData.postTotalShares;

  // Calculate user's balance change per Rebase event
  const rewardsInStETH = postBalanceStETH - preBalanceStETH;

  console.log('rewardsInStETH', rewardsInStETH);
};

main();
