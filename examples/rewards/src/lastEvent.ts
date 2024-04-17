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
  // Баланс юзера в шарах до ивента
  const oldBalanceInShares = await lidoSDK.shares.balance(mockAddress);

  const lastEventData = await getLastRebaseEvent();
  if (!lastEventData) return;

  // расчет баланса юзера в stETH до ивента
  const oldBalanceStETH =
    (oldBalanceInShares * lastEventData.preTotalEther) /
    lastEventData.preTotalShares;
  // расчет баланса юзера в stETH после ивента
  const newBalanceStETH =
    (oldBalanceInShares * lastEventData.postTotalEther) /
    lastEventData.postTotalShares;

  // Расчет награды юзера за ребейз
  const rewardsInStETH = newBalanceStETH - oldBalanceStETH;

  console.log('rewardsInStETH', rewardsInStETH);
};

main();
