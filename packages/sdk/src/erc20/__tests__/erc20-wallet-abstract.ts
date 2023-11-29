import { encodeFunctionData, getContract } from 'viem';
import { expect, describe, test, jest } from '@jest/globals';
import { AbstractLidoSDKErc20 } from '../erc20.js';
import { LIDO_CONTRACT_NAMES, PERMIT_MESSAGE_TYPES } from '../../index.js';
import {
  useAccount,
  useAltAccount,
} from '../../../tests/utils/fixtures/use-wallet-client.js';
import {
  expectPopulatedTx,
  expectPopulatedTxToRun,
} from '../../../tests/utils/expect/expect-populated-tx.js';
import { erc20abi } from '../abi/erc20abi.js';
import { expectTxCallback } from '../../../tests/utils/expect/expect-tx-callback.js';
import { expectAlmostEqualBn } from '../../../tests/utils/expect/expect-bn.js';
import {
  SPENDING_TIMEOUT,
  testSpending,
} from '../../../tests/utils/test-spending.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';

describe('erc20 tokens should be tested with this abstract helper', () => {
  test('bypassing abstract', async () => {
    expect(true);
  });
});

const expectPermitMessage = (
  permitMessageData: Awaited<
    ReturnType<AbstractLidoSDKErc20['populatePermit']>
  >['message'],
  checks: {
    address: `0x${string}`;
    spender: `0x${string}`;
    amount: bigint;
    nonce: bigint;
    deadline: bigint;
  },
) => {
  expect(permitMessageData).toHaveProperty('owner');
  expect(permitMessageData).toHaveProperty('spender');
  expect(permitMessageData).toHaveProperty('value');
  expect(permitMessageData).toHaveProperty('nonce');
  expect(permitMessageData).toHaveProperty('deadline');

  expect(permitMessageData.owner).toBe(checks.address);
  expect(permitMessageData.spender).toBe(checks.spender);
  expect(permitMessageData.value).toBe(checks.amount);
  expect(permitMessageData.nonce).toBe(checks.nonce);
  expect(permitMessageData.deadline).toBe(checks.deadline);
};

export const testERC20Wallet = <I extends AbstractLidoSDKErc20>({
  contractName,
  constructedWithRpcCore,
  constructedWithWeb3Core,
}: {
  contractName: LIDO_CONTRACT_NAMES;
  constructedWithRpcCore: I;
  constructedWithWeb3Core: I;
}) => {
  const token = constructedWithWeb3Core;
  const tokenRpc = constructedWithRpcCore;
  const web3Core = token.core;
  const rpcCore = tokenRpc.core;

  const getTokenAddress = async () => {
    const address =
      await constructedWithRpcCore.core.getContractAddress(contractName);
    return address;
  };

  const getTokenContract = async () => {
    const address = await getTokenAddress();
    return getContract({
      address,
      abi: erc20abi,
      publicClient: rpcCore.rpcProvider,
      walletClient: web3Core.web3Provider,
    });
  };

  describe('wallet methods', () => {
    /**
     * Approve
     */
    describe('approve', () => {
      testSpending(
        'approve',
        async () => {
          const { address: account } = useAccount();
          const params = {
            to: account,
            amount: 100n,
            callback: jest.fn(),
          };

          const tx = await token.approve(params);

          const allowance = await token.allowance({ account, to: account });
          expectTxCallback(params.callback, tx);
          expect(allowance).toBe(params.amount);

          const params2 = {
            to: account,
            amount: 200n,
          };
          await token.approve(params2);
          const allowance2 = await token.allowance({ account, to: account });
          expect(allowance2).toBe(params2.amount);
        },
        SPENDING_TIMEOUT,
      );

      testSpending(
        'populateApprove',
        async () => {
          const { address: account } = useAccount();
          const { address: altAccount } = useAltAccount();
          const contractAddress = await getTokenAddress();
          const params = {
            to: altAccount,
            amount: 100n,
          };

          const dataEncoded = encodeFunctionData({
            abi: erc20abi,
            functionName: 'approve',
            args: [params.to, params.amount],
          });

          const tx = await token.populateApprove(params);

          await expectPopulatedTxToRun(tx, rpcCore.rpcProvider);
          expectPopulatedTx(tx, undefined, dataEncoded);
          expect(tx.to).toBe(contractAddress);
          expect(tx.from).toBe(account);
        },
        SPENDING_TIMEOUT,
      );

      test('simulateApprove', async () => {
        const { address: altAddress } = useAltAccount();
        const contractAddress = await getTokenAddress();
        const params = {
          to: altAddress,
          amount: 100n,
        };

        const tx = await token.simulateApprove(params);

        expectAddress(tx.request.address, contractAddress);
        expect(tx.request.functionName).toBe('approve');
        expect(tx.request.args[0]).toBe(params.to);
        expect(tx.request.args[1]).toBe(params.amount);
      });
    });

    /**
     * Transfer
     */
    describe('transfer', () => {
      testSpending(
        'transfer',
        async () => {
          const { address } = useAccount();
          const { address: altAddress } = useAltAccount();
          const balance1Before = await token.balance(address);
          const balance2Before = await token.balance(altAddress);
          const params = {
            to: altAddress,
            from: address,
            amount: 100n,
            callback: jest.fn(),
          };

          const tx = await token.transfer(params);
          const balance1After = await token.balance(address);
          const balance2After = await token.balance(altAddress);

          expectTxCallback(params.callback, tx);
          expectAlmostEqualBn(balance1Before - balance1After, params.amount);
          expectAlmostEqualBn(balance2After - balance2Before, params.amount);
        },
        SPENDING_TIMEOUT,
      );

      test('populateTransfer', async () => {
        const { address } = useAccount();
        const { address: altAddress } = useAltAccount();
        const params = {
          account: address, // TODO: check necesserity of this field
          to: altAddress,
          from: address,
          amount: 100n,
        };

        const dataEncoded = encodeFunctionData({
          abi: erc20abi,
          functionName: 'transfer',
          args: [params.to, params.amount],
        });

        const tx = await token.populateTransfer(params);
        expectPopulatedTx(tx, undefined, dataEncoded);
        await expectPopulatedTxToRun(tx, rpcCore.rpcProvider);
      });

      testSpending(
        'populateTransferFrom',
        async () => {
          const { address } = useAccount();
          const { address: altAddress } = useAltAccount();

          const params = {
            account: altAddress, // TODO: check necesserity of this field
            to: altAddress,
            from: address,
            amount: 100n,
          };

          await token.approve({
            to: altAddress,
            amount: 100n,
          });

          const dataEncoded = encodeFunctionData({
            abi: erc20abi,
            functionName: 'transferFrom',
            args: [params.from, params.to, params.amount],
          });

          const tx = await tokenRpc.populateTransfer(params);
          expectPopulatedTx(tx, undefined, dataEncoded);
          await expectPopulatedTxToRun(tx, rpcCore.rpcProvider);
        },
        SPENDING_TIMEOUT,
      );

      test('simulateTransfer', async () => {
        const { address } = useAccount();
        const { address: altAddress } = useAltAccount();
        const contractAddress = await getTokenAddress();
        const params = {
          account: address, // TODO: check necesserity of this field
          to: altAddress,
          from: address,
          amount: 100n,
        };

        const tx = await token.simulateTransfer(params);

        expectAddress(tx.request.address, contractAddress);
        expect(tx.request.functionName).toBe('transfer');
        expect(tx.request.args[0]).toBe(params.to);
        expect(tx.request.args[1]).toBe(params.amount);
      });

      test('simulateTransferFrom', async () => {
        const { address } = useAccount();
        const { address: altAddress } = useAltAccount();
        const contractAddress = await getTokenAddress();
        const params = {
          account: altAddress, // TODO: check necesserity of this field
          to: altAddress,
          from: address,
          amount: 100n,
        };

        const tx = await token.simulateTransfer(params);

        expectAddress(tx.request.address, contractAddress);
        expect(tx.request.functionName).toBe('transferFrom');
        expect(tx.request.args[0]).toBe(params.from);
        expect(tx.request.args[1]).toBe(params.to);
        expect(tx.request.args[2]).toBe(params.amount);
      });
    });

    /**
     * Permit
     */
    describe('permit', () => {
      test('signPermit', async () => {
        const { address } = useAccount();
        const contract = await getTokenContract();
        const nonce = await contract.read.nonces([address]);
        const chainId = token.core.chainId;

        const params = {
          amount: 100n,
          spender: address,
          deadline: 86400n,
        };

        const tx = await token.signPermit(params);

        expect(tx).toHaveProperty('v');
        expect(tx).toHaveProperty('r');
        expect(tx).toHaveProperty('s');
        expect(tx).toHaveProperty('chainId');

        expect(typeof tx.v).toBe('number');
        expect(typeof tx.r).toBe('string');
        expect(typeof tx.s).toBe('string');
        expect(tx.chainId).toBe(BigInt(chainId));

        const { v, r, s, chainId: _, ...permitMessage } = tx;

        expectPermitMessage(permitMessage, {
          address: address,
          spender: address,
          amount: params.amount,
          nonce,
          deadline: params.deadline,
        });
      });

      testSpending(
        'populatePermit',
        async () => {
          const { address } = useAccount();

          const params = {
            amount: 100n,
            account: address,
            spender: address,
            deadline: 86400n,
          };

          const contract = await getTokenContract();
          const domain = await token.erc721Domain();
          const nonce = await contract.read.nonces([address]);

          const tx = await token.populatePermit(params);

          expect(tx).toHaveProperty('account');
          expect(tx).toHaveProperty('domain');
          expect(tx).toHaveProperty('types');
          expect(tx).toHaveProperty('primaryType');
          expect(tx).toHaveProperty('message');

          expect(tx.account).toBe(params.account);
          expect(tx.domain).toMatchObject(domain);
          expect(tx.types).toBe(PERMIT_MESSAGE_TYPES);
          expect(tx.primaryType).toBe('Permit');
          expectPermitMessage(tx.message, {
            address: address,
            spender: address,
            amount: params.amount,
            nonce,
            deadline: params.deadline,
          });
        },
        SPENDING_TIMEOUT,
      );
    });
  });
};
