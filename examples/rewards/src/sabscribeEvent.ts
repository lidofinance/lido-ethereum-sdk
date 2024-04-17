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
  // Баланс юзера в шарах до ивента
  const oldBalanceInShares = await lidoSDK.shares.balance(mockAddress);

  const lastRebaseEvent = logs[logs.length - 1];
  if (!lastRebaseEvent) return;

  // аргументы ивента
  const { preTotalShares, preTotalEther, postTotalShares, postTotalEther } =
    lastRebaseEvent.args;

  // расчет баланса юзера в stETH до ивента
  const oldBalanceStETH = (oldBalanceInShares * preTotalEther) / preTotalShares;
  // расчет баланса юзера в stETH после ивента
  const newBalanceStETH =
    (oldBalanceInShares * postTotalEther) / postTotalShares;

  // Расчет награды юзера за ребейз
  const rewardsInStETH = newBalanceStETH - oldBalanceStETH;

  console.log('rewardsInStETH', rewardsInStETH);
};

const main = async () => {
  subscribeRebaseEvent(rebaseEventCallback);
};

main();
