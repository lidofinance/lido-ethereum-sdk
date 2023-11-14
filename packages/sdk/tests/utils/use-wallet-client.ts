import { privateKeyToAccount } from 'viem/accounts';
import { Hash, createWalletClient, http } from 'viem';
import { useTestsEnvs } from './use-test-envs.js';

export const useWalletClient = () => {
  const { privateKey } = useTestsEnvs();
  const account = privateKeyToAccount(privateKey as Hash);

  return createWalletClient({
    account,
    transport: http(
      'https://fb55-2403-6200-8851-318c-78af-dbe-6f34-837.ngrok-free.app',
    ),
  });
};
