/* eslint-disable @typescript-eslint/no-floating-promises */
import {
  LidoSDK,
  GetRewardsFromChainResult,
} from '@lidofinance/lido-ethereum-sdk';
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

const getRewardsOnChain = async (): Promise<GetRewardsFromChainResult> => {
  const rewardsQuery = await lidoSDK.rewards.getRewardsFromChain({
    address: mockAddress,
    stepBlock: 10000, // defaults to 50000, max block range per 1 query
    back: {
      days: 1n,
    },
    includeOnlyRebases: true,
  });

  return rewardsQuery;
};

const getAverageAPR = async () => {
  const rewards = (await getRewardsOnChain()).rewards;
  const totalAPR = rewards.reduce(
    (acc: number, reward: any) => acc + reward.apr,
    0,
  );

  return totalAPR / rewards.length;
};

const main = async () => {
  const averageApr = await getAverageAPR();

  console.log('average apr', averageApr);
};

main();
