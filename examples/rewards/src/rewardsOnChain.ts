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

const getRewardsOnChain = async () => {
  const rewardsQuery = await lidoSDK.rewards.getRewardsFromChain({
    address: mockAddress,
    stepBlock: 10000, // max blocks in 1 query - depend on the RPC capabilities and pricing plans
    back: {
      days: 1n,
    },
  });

  return rewardsQuery;
};

const main = async () => {
  const rewards = await getRewardsOnChain();

  console.log('rewards', rewards);
};

main();
