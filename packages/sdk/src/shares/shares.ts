import {
  type GetContractReturnType,
  type Address,
  type PublicClient,
  type WalletClient,
  getContract,
  encodeFunctionData,
} from 'viem';

import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { LIDO_CONTRACT_NAMES, NOOP } from '../common/constants.js';
import { TransactionResult } from '../core/index.js';

import { SharesTotalSupplyResult, SharesTransferProps } from './types.js';
import { stethSharesAbi } from './abi/steth-shares-abi.js';
import { parseValue } from '../common/utils/parse-value.js';
import { EtherValue, NoCallback, TransactionOptions } from '../core/types.js';
import { calcShareRate } from '../rewards/utils.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

export class LidoSDKShares extends LidoSDKModule {
  static readonly PRECISION = 10n ** 27n;

  /// Contract

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async contractAddressStETH(): Promise<Address> {
    return await this.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressStETH'])
  public async getContractStETHshares(): Promise<
    GetContractReturnType<typeof stethSharesAbi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddressStETH();

    return getContract({
      address,
      abi: stethSharesAbi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  @Logger('Balances:')
  @ErrorHandler()
  public async balance(address: Address): Promise<bigint> {
    const contract = await this.getContractStETHshares();
    return contract.read.sharesOf([address]);
  }

  // Transfer

  @Logger('Call:')
  @ErrorHandler()
  public async transfer({
    account,
    to,
    amount: _amount,
    callback = NOOP,
    from: _from,
  }: SharesTransferProps): Promise<TransactionResult> {
    this.core.useWeb3Provider();
    const accountAddress = await this.core.getWeb3Address(account);
    const from = _from ?? accountAddress;
    const amount = parseValue(_amount);

    const isTransferFrom = from !== accountAddress;
    const contract = await this.getContractStETHshares();

    const getGasLimit = async (overrides: TransactionOptions) =>
      isTransferFrom
        ? contract.estimateGas.transferSharesFrom([from, to, amount], overrides)
        : contract.estimateGas.transferShares([to, amount], overrides);

    const sendTransaction = async (overrides: TransactionOptions) =>
      isTransferFrom
        ? contract.write.transferSharesFrom([from, to, amount], overrides)
        : contract.write.transferShares([to, amount], overrides);

    return this.core.performTransaction({
      account,
      callback,
      getGasLimit,
      sendTransaction,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async populateTransfer({
    account,
    to,
    amount: _amount,
    from: _from,
  }: NoCallback<SharesTransferProps>) {
    const accountAddress = await this.core.getWeb3Address(account);
    const amount = parseValue(_amount);
    const from = _from ?? accountAddress;
    const address = await this.contractAddressStETH();
    const isTransferFrom = from !== accountAddress;

    return {
      to: address,
      from: accountAddress,
      data: isTransferFrom
        ? encodeFunctionData({
            abi: stethSharesAbi,
            functionName: 'transferSharesFrom',
            args: [from, to, amount],
          })
        : encodeFunctionData({
            abi: stethSharesAbi,
            functionName: 'transferShares',
            args: [to, amount],
          }),
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async simulateTransfer({
    account,
    to,
    amount: _amount,
    from: _from,
  }: NoCallback<SharesTransferProps>) {
    const amount = parseValue(_amount);
    const accountAddress = await this.core.getWeb3Address(account);
    const from = _from ?? accountAddress;
    const contract = await this.getContractStETHshares();
    const isTransferFrom = from !== accountAddress;
    return isTransferFrom
      ? contract.simulate.transferSharesFrom([from, to, amount], {
          account: accountAddress,
        })
      : contract.simulate.transferShares([to, amount], {
          account: accountAddress,
        });
  }

  // convert
  @Logger('Views:')
  @ErrorHandler()
  public async convertToShares(stethAmount: EtherValue): Promise<bigint> {
    const amount = parseValue(stethAmount);
    const contract = await this.getContractStETHshares();
    return contract.read.getSharesByPooledEth([amount]);
  }

  // convert
  @Logger('Views:')
  @ErrorHandler()
  public async convertToSteth(sharesAmount: EtherValue): Promise<bigint> {
    const amount = parseValue(sharesAmount);
    const contract = await this.getContractStETHshares();
    return contract.read.getPooledEthByShares([amount]);
  }

  // total supply
  @Logger('Views:')
  @ErrorHandler()
  public async getTotalSupply(): Promise<SharesTotalSupplyResult> {
    const sharesContract = await this.getContractStETHshares();
    const contract = {
      address: sharesContract.address,
      abi: sharesContract.abi,
    };
    const [totalShares, totalEther] = await this.core.rpcProvider.multicall({
      allowFailure: false,
      contracts: [
        {
          ...contract,
          functionName: 'getTotalShares',
        },
        {
          ...contract,
          functionName: 'getTotalPooledEther',
        },
      ] as const,
    });
    return { totalEther, totalShares };
  }

  @Logger('Views:')
  @ErrorHandler()
  public async getShareRate(): Promise<number> {
    const { totalEther, totalShares } = await this.getTotalSupply();
    return calcShareRate(totalEther, totalShares, LidoSDKShares.PRECISION);
  }
}
