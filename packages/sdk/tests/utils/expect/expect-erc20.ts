import { getContract } from 'viem';
import { expect, describe, test } from '@jest/globals';
import { AbstractLidoSDKErc20 } from '../../../src/erc20/erc20.js';
import {
  LIDO_CONTRACT_NAMES,
  LIDO_L2_CONTRACT_NAMES,
} from '../../../src/index.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';
import { erc20abi } from '../../../src/erc20/abi/erc20abi.js';
import { expectBn } from '../../../tests/utils/expect/expect-bn.js';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import { LidoSDKCommonProps } from '../../../src/core/types.js';

type expectERC20Options<I> = {
  contractName: LIDO_CONTRACT_NAMES | LIDO_L2_CONTRACT_NAMES;
  constructedWithRpcCore: I;
  constructedWithWeb3Core: I;
  ModulePrototype: new (props: LidoSDKCommonProps) => I;
  isL2?: boolean;
};

export const expectERC20 = <I extends AbstractLidoSDKErc20>({
  contractName,
  constructedWithRpcCore,
  constructedWithWeb3Core,
  ModulePrototype,
  isL2 = false,
}: expectERC20Options<I>) => {
  const token = constructedWithWeb3Core;
  const tokenRpc = constructedWithRpcCore;
  const web3Core = token.core;
  const rpcCore = tokenRpc.core;

  const getTokenAddress = async () => {
    const address = await (isL2
      ? constructedWithRpcCore.core.getL2ContractAddress(
          contractName as LIDO_L2_CONTRACT_NAMES,
        )
      : constructedWithRpcCore.core.getContractAddress(
          contractName as LIDO_CONTRACT_NAMES,
        ));
    return address;
  };

  const getTokenContract = async () => {
    const address = await getTokenAddress();
    return getContract({
      address,
      abi: erc20abi,
      client: {
        public: rpcCore.rpcProvider,
        wallet: web3Core.web3Provider,
      },
    });
  };

  describe('constructModulePrototype', () => {
    test('is correct module', () => {
      expectSDKModule(ModulePrototype);
    });
  });

  describe('read methods', () => {
    test('contract address', async () => {
      const tokenAddress = await token.contractAddress();
      const tokenAddressCheck = await getTokenAddress();
      expectAddress(tokenAddress);
      expect(tokenAddress).toBe(tokenAddressCheck);
    });

    test('contract', async () => {
      expectContract(await token.getContract());
    });

    test('balance', async () => {
      const { address } = await token.core.useAccount();
      const contract = await token.getContract();
      const balanceViaRawContract = await contract.read.balanceOf([address]);
      const balanceViaClass = await token.balance(address);
      expect(balanceViaClass).toEqual(balanceViaRawContract);
    });

    test('allowance', async () => {
      const contract = await getTokenContract();
      const { address: account } = useAccount();
      const allowance = await token.allowance({ account, to: account });
      const allowanceFromContract = await contract.read.allowance([
        account,
        account,
      ]);
      expectBn(allowance);
      expect(allowance).toBe(allowanceFromContract);
    });

    test('erc20Metadata', async () => {
      const metadata = await token.erc20Metadata();
      expect(metadata).toHaveProperty('decimals');
      expect(metadata).toHaveProperty('name');
      expect(metadata).toHaveProperty('symbol');
      expect(metadata).toHaveProperty('domainSeparator');
    });

    test('totalSupply', async () => {
      const contract = await getTokenContract();
      const totalSupply = await token.totalSupply();
      const totalSupplyFromContract = await contract.read.totalSupply();
      expect(totalSupply).toBe(totalSupplyFromContract);
    });

    test('nonces', async () => {
      const { address } = await token.core.useAccount();
      const nonces = await token.nonces(address);
      expectBn(nonces);
    });

    test('erc721Domain', async () => {
      const erc721Domain = await token.erc721Domain();
      expect(erc721Domain).toHaveProperty('name');
      expect(erc721Domain).toHaveProperty('version');
      expect(erc721Domain).toHaveProperty('chainId');
      expect(erc721Domain).toHaveProperty('verifyingContract');
    });
  });
};
