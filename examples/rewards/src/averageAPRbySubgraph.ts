/* eslint-disable no-console */
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

const getRewardsSubgraph = async () => {
  const rewardsQuery = await lidoSDK.rewards.getRewardsFromSubgraph({
    address: mockAddress,
    back: {
      days: 1n,
    },
    includeOnlyRebases: true,
    stepEntities: 500, // defaults to 1000,  max entities per one request to endpoint
    getSubgraphUrl() {
      return `https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/Sxx812XgeKyzQPaBpR5YZWmGV5fZuBaPdh7DFhzSwiQ`;
    },
  });

  return rewardsQuery;
};

const getAverageAPR = async () => {
  const rewards = (await getRewardsSubgraph()).rewards;
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
