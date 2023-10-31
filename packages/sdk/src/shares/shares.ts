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
import { LidoSDKCore, TransactionResult } from '../core/index.js';
import { version } from '../version.js';
import { LidoSDKSharesProps, SharesTransferProps } from './types.js';
import { stethSharesAbi } from './abi/steth-shares-abi.js';
import { parseValue } from '../common/utils/parse-value.js';
import { EtherValue, NoCallback } from '../core/types.js';
import { calcShareRate } from '../rewards/utils.js';

export class LidoSDKShares {
  static readonly PRECISION = 10n ** 27n;
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKSharesProps) {
    const { core } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(props, version);
  }

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
    from = account,
  }: SharesTransferProps): Promise<TransactionResult> {
    this.core.useWeb3Provider();
    const amount = parseValue(_amount);
    const contract = await this.getContractStETHshares();

    const args = [from, to, amount] as const;

    return this.core.performTransaction({
      account,
      callback,
      getGasLimit: (options) =>
        contract.estimateGas.transferSharesFrom(args, options),
      sendTransaction: (options) =>
        contract.write.transferSharesFrom(args, options),
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async populateTransfer({
    account,
    to,
    amount: _amount,
    from = account,
  }: NoCallback<SharesTransferProps>) {
    const amount = parseValue(_amount);
    const contract = await this.getContractStETHshares();

    return {
      to: contract.address,
      from: account,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName: 'transferSharesFrom',
        args: [from, to, amount],
      }),
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async simulateTransfer({
    account,
    to,
    amount: _amount,
    from = account,
  }: NoCallback<SharesTransferProps>) {
    const amount = parseValue(_amount);
    const contract = await this.getContractStETHshares();
    return contract.simulate.transferSharesFrom([from, to, amount], {
      account,
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

  // convert
  @Logger('Views:')
  @ErrorHandler()
  public async getShareRate(): Promise<number> {
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
    return calcShareRate(totalEther, totalShares, LidoSDKShares.PRECISION);
  }
}
