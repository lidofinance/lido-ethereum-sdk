import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const rpcProvider = createPublicClient({
  chain: mainnet,
  transport: http('RPC_URL'),
});
const lidoSDK = new LidoSDK({
  chainId: mainnet.id,
  rpcProvider,
  logMode: 'none',
});

async function getRewardsFromChain(params) {
  const rewardsQuery = await lidoSDK.rewards.getRewardsFromChain(params);
  return rewardsQuery;
}

process.stdin.on('data', async (data) => {
  const message = JSON.parse(data.toString());

  if (message.action === 'getRewardsFromChain') {
    message.params = JSON.parse(message.params);
    try {
      if (message.params.back && message.params.back.days) {
        message.params.back.days = BigInt(message.params.back.days);
      }

      const result = await getRewardsFromChain(message.params);

      process.stdout.write(
        JSON.stringify({ success: true, result }, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        ) + '\n',
      );
    } catch (error) {
      process.stdout.write(
        JSON.stringify({ success: false, error: error.message }) + '\n',
      );
    }
  }
});

process.stdout.write(JSON.stringify({ ready: true }));
