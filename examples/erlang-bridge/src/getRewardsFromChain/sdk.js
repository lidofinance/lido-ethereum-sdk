import { LidoSDK } from '@lidofinance/lido-ethereum-sdk';
import { createPublicClient, http } from 'viem';
import { holesky } from 'viem/chains';

import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

const rpcProvider = createPublicClient({
  chain: holesky,
  transport: http('RPC_URL'),
});
const lidoSDK = new LidoSDK({
  chainId: holesky.id,
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
        JSON.stringify({ success: true, result }, (_key, value) =>
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
