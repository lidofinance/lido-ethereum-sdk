import { test, expect, describe } from '@jest/globals';

import { useWeb3Core } from '../../../tests/utils/fixtures/use-core.js';
import { getContract, maxUint256, parseEther } from 'viem';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { useTestsEnvs } from '../../../tests/utils/fixtures/use-test-envs.js';
import { expectNonNegativeBn } from '../../../tests/utils/expect/expect-bn.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';

const permitAbi = [
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'value', type: 'uint256' },
      { internalType: 'uint256', name: 'deadline', type: 'uint256' },
      { internalType: 'uint8', name: 'v', type: 'uint8' },
      { internalType: 'bytes32', name: 'r', type: 'bytes32' },
      { internalType: 'bytes32', name: 's', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

describe('Core Wallet Tests', () => {
  const { chainId } = useTestsEnvs();
  const web3Core = useWeb3Core();

  const testPermit = async (isSteth: boolean) => {
    const spender = await web3Core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const value = 1n;
    const contractAddress = await web3Core.getContractAddress(
      isSteth ? LIDO_CONTRACT_NAMES.lido : LIDO_CONTRACT_NAMES.wsteth,
    );
    const address = await web3Core.getWeb3Address();
    const {
      chainId: permitChainId,
      deadline,
      nonce,
      owner,
      spender: permitSpender,
      value: permitValue,
      r,
      s,
      v,
    } = await web3Core.signPermit({
      amount: value,
      spender,
      token: isSteth ? 'stETH' : 'wstETH',
    });

    expect(permitChainId).toBe(BigInt(chainId));
    expect(deadline).toBe(maxUint256);
    expectNonNegativeBn(nonce);
    expectAddress(owner, address);
    expectAddress(permitSpender, spender);
    expect(permitValue).toBe(value);

    expect(r).toBeDefined();
    expect(s).toBeDefined();
    expect(v).toBeDefined();

    const contract = getContract({
      abi: permitAbi,
      address: contractAddress,
      publicClient: web3Core.rpcProvider,
    });

    await contract.simulate.permit([
      owner,
      permitSpender,
      permitValue,
      deadline,
      v,
      r,
      s,
    ]);
  };

  test('web3provider is available', () => {
    const provider = web3Core.useWeb3Provider();
    expect(provider).toBeDefined();
  });

  test('account is available', async () => {
    const address = await web3Core.getWeb3Address();
    expect(address).toBeDefined();
    expectAddress(address);
  });

  test('account has sufficient balance for testing, >5 ETH', async () => {
    const address = await web3Core.getWeb3Address();
    const balance = await web3Core.balanceETH(address);
    expect(balance).toBeGreaterThan(parseEther('5'));
  });

  test('sign permit for stETH', async () => {
    await expect(testPermit(true)).resolves.not.toThrow();
  });

  test('sign permit for wstETH', async () => {
    await expect(testPermit(false)).resolves.not.toThrow();
  });
});
