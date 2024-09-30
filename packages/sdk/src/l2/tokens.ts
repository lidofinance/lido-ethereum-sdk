/* eslint-disable sonarjs/no-identical-functions */
import {
  getContract,
  type GetContractReturnType,
  type WalletClient,
  type Address,
  encodeFunctionData,
  Hash,
} from 'viem';

import { LIDO_L2_CONTRACT_NAMES, NOOP } from '../common/constants.js';
import { parseValue } from '../common/utils/parse-value.js';
import { Cache, ErrorHandler, Logger } from '../common/decorators/index.js';
import { AbstractLidoSDKErc20 } from '../erc20/erc20.js';

import { rebasableL2StethAbi } from './abi/rebasableL2Steth.js';
import { bridgedWstethAbi } from './abi/brigedWsteth.js';

import type {
  AccountValue,
  EtherValue,
  NoCallback,
  TransactionOptions,
  TransactionResult,
} from '../core/types.js';
import type { SharesTransferProps } from './types.js';

export class LidoSDKL2Wsteth extends AbstractLidoSDKErc20 {
  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public override async contractAddress(): Promise<Address> {
    return this.core.getL2ContractAddress(LIDO_L2_CONTRACT_NAMES.wsteth);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getL2Contract(): Promise<
    GetContractReturnType<typeof bridgedWstethAbi, WalletClient>
  > {
    const address = await this.contractAddress();
    return getContract({
      address,
      abi: bridgedWstethAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public override async erc721Domain(): Promise<{
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: Address;
    fields: Hash;
    salt: Hash;
    extensions: readonly bigint[];
  }> {
    const contract = await this.getL2Contract();
    const [
      fields,
      name,
      version,
      chainId,
      verifyingContract,
      salt,
      extensions,
    ] = await contract.read.eip712Domain();
    return {
      fields,
      name,
      version,
      chainId,
      verifyingContract,
      salt,
      extensions,
    };
  }
}

export class LidoSDKL2Steth extends AbstractLidoSDKErc20 {
  public override async contractAddress(): Promise<Address> {
    return this.core.getL2ContractAddress(LIDO_L2_CONTRACT_NAMES.steth);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getL2Contract(): Promise<
    GetContractReturnType<typeof rebasableL2StethAbi, WalletClient>
  > {
    const address = await this.contractAddress();
    return getContract({
      address,
      abi: rebasableL2StethAbi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public override async erc721Domain(): Promise<{
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: Address;
    fields: Hash;
    salt: Hash;
    extensions: readonly bigint[];
  }> {
    const contract = await this.getL2Contract();
    const [
      fields,
      name,
      version,
      chainId,
      verifyingContract,
      salt,
      extensions,
    ] = await contract.read.eip712Domain();
    return {
      fields,
      name,
      version,
      chainId,
      verifyingContract,
      salt,
      extensions,
    };
  }

  @Logger('Balances:')
  @ErrorHandler()
  public async balanceShares(address?: AccountValue): Promise<bigint> {
    const contract = await this.getL2Contract();
    const account = await this.core.useAccount(address);
    return contract.read.sharesOf([account.address]);
  }

  // convert
  @Logger('Views:')
  @ErrorHandler()
  public async convertToShares(stethAmount: EtherValue): Promise<bigint> {
    const amount = parseValue(stethAmount);
    const contract = await this.getL2Contract();
    return contract.read.getSharesByTokens([amount]);
  }

  // convert
  @Logger('Views:')
  @ErrorHandler()
  public async convertToSteth(sharesAmount: EtherValue): Promise<bigint> {
    const amount = parseValue(sharesAmount);
    const contract = await this.getL2Contract();
    return contract.read.getTokensByShares([amount]);
  }

  // convert
  @Logger('Views:')
  @ErrorHandler()
  public async totalShares(): Promise<bigint> {
    const contract = await this.getL2Contract();
    return contract.read.getTotalShares();
  }

  // TransferShares
  // Transfer

  @Logger('Call:')
  @ErrorHandler()
  public async transferShares({
    account: accountProp,
    to,
    amount: _amount,
    callback = NOOP,
    from: _from,
    ...rest
  }: SharesTransferProps): Promise<TransactionResult> {
    this.core.useWeb3Provider();
    const account = await this.core.useAccount(accountProp);
    const from = _from ?? account.address;
    const amount = parseValue(_amount);

    const isTransferFrom = from !== account.address;
    const contract = await this.getL2Contract();

    const getGasLimit = async (overrides: TransactionOptions) =>
      isTransferFrom
        ? contract.estimateGas.transferSharesFrom([from, to, amount], overrides)
        : contract.estimateGas.transferShares([to, amount], overrides);

    const sendTransaction = async (overrides: TransactionOptions) =>
      isTransferFrom
        ? contract.write.transferSharesFrom([from, to, amount], overrides)
        : contract.write.transferShares([to, amount], overrides);

    return this.core.performTransaction({
      ...rest,
      account,
      callback,
      getGasLimit,
      sendTransaction,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async populateTransferShares({
    account: accountProp,
    to,
    amount: _amount,
    from: _from,
  }: NoCallback<SharesTransferProps>) {
    const account = await this.core.useAccount(accountProp);
    const amount = parseValue(_amount);
    const from = _from ?? account.address;
    const address = await this.contractAddress();
    const isTransferFrom = from !== account.address;

    return {
      to: address,
      from: account.address,
      data: isTransferFrom
        ? encodeFunctionData({
            abi: rebasableL2StethAbi,
            functionName: 'transferSharesFrom',
            args: [from, to, amount],
          })
        : encodeFunctionData({
            abi: rebasableL2StethAbi,
            functionName: 'transferShares',
            args: [to, amount],
          }),
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async simulateTransferShares({
    account: _account,
    to,
    amount: _amount,
    from: _from,
  }: NoCallback<SharesTransferProps>) {
    const amount = parseValue(_amount);
    const account = await this.core.useAccount(_account);
    const from = _from ?? account.address;
    const contract = await this.getL2Contract();
    const isTransferFrom = from !== account.address;
    return isTransferFrom
      ? contract.simulate.transferSharesFrom([from, to, amount], {
          account,
        })
      : contract.simulate.transferShares([to, amount], {
          account,
        });
  }
}
