import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { version } from '../version.js';
import {
  UnstethNFT,
  type UnstethApproveAllProps,
  type UnstethApproveProps,
  type UnstethApprovedForProps,
  type UnstethIsApprovedForAllProps,
  type LidoSDKUnstETHProps,
  type ParsedProps,
  type SafeTransferFromArguments,
  type UnstethCommonTransactionProps,
  type UnstethTransferProps,
} from './types.js';
import {
  type Address,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
  getContract,
  zeroAddress,
} from 'viem';
import { unstethAbi } from './abi/unsteth-abi.js';
import invariant from 'tiny-invariant';
import { LIDO_CONTRACT_NAMES, NOOP } from '../common/constants.js';

export class LidoSDKUnstETH {
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKUnstETHProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);
  }

  // Contract

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public contractAddress(): Promise<Address> {
    invariant(this.core.chain, 'Chain is not defined');
    return this.core.getContractAddress(LIDO_CONTRACT_NAMES.withdrawalQueue);
  }

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressWstETH'])
  public async getContract(): Promise<
    GetContractReturnType<typeof unstethAbi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddress();
    return getContract({
      address,
      abi: unstethAbi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  // Balance
  @Logger('Balances:')
  @ErrorHandler('Error:')
  public async getNFTsByAccount(account: Address): Promise<UnstethNFT[]> {
    const contract = await this.getContract();

    const ids = await contract.read.getWithdrawalRequests([account]);
    const statuses = await contract.read.getWithdrawalStatus([ids]);

    return ids.map((id, index) => ({ ...statuses[index], id }) as UnstethNFT);
  }

  @Logger('Balances:')
  @ErrorHandler('Error:')
  public async getAccountByNFT(id: bigint): Promise<Address> {
    const contract = await this.getContract();
    return contract.read.ownerOf([id]);
  }

  // Transfer
  @Logger('Call:')
  @ErrorHandler('Error:')
  public async transfer(props: UnstethTransferProps) {
    const {
      account,
      callback,
      id,
      to,
      from = props.account,
      data,
    } = this.parseProps(props);

    const args = (
      data ? [from, to, id, data] : [from, to, id]
    ) as SafeTransferFromArguments;

    const contract = await this.getContract();
    return this.core.performTransaction({
      callback,
      account,
      getGasLimit: (options) =>
        contract.estimateGas.safeTransferFrom(args, options),
      sendTransaction: (options) =>
        contract.write.safeTransferFrom(args, options),
    });
  }

  // Approve

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async setApprovalFor(props: UnstethApproveProps) {
    const { account, callback, to = zeroAddress, id } = this.parseProps(props);
    const args = [to, id] as const;
    const contract = await this.getContract();
    return this.core.performTransaction({
      callback,
      account,
      getGasLimit: (options) => contract.estimateGas.approve(args, options),
      sendTransaction: (options) => contract.write.approve(args, options),
    });
  }

  @Logger('Views:')
  @ErrorHandler('Error:')
  public async getTokenApprovedFor({ id, account }: UnstethApprovedForProps) {
    const contract = await this.getContract();
    return contract.read.getApproved([id], { account });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async setApprovalForAll(props: UnstethApproveAllProps) {
    const { account, callback, to, allow } = this.parseProps(props);
    const args = [to, allow] as const;
    const contract = await this.getContract();
    return this.core.performTransaction({
      callback,
      account,
      getGasLimit: (options) =>
        contract.estimateGas.setApprovalForAll(args, options),
      sendTransaction: (options) =>
        contract.write.setApprovalForAll(args, options),
    });
  }

  @Logger('Views:')
  @ErrorHandler('Error:')
  public async getIsApprovedForAll({
    account,
    to,
  }: UnstethIsApprovedForAllProps) {
    const contract = await this.getContract();
    return contract.read.isApprovedForAll([account, to]);
  }

  // Metadata

  @Logger('Views:')
  @ErrorHandler('Error:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContractMetadata() {
    const address = await this.contractAddress();
    const common = { abi: unstethAbi, address } as const;
    const [name, version, symbol, baseURI] =
      await this.core.rpcProvider.multicall({
        allowFailure: false,
        contracts: [
          {
            ...common,
            functionName: 'name',
          },
          {
            ...common,
            functionName: 'getContractVersion',
          },
          {
            ...common,
            functionName: 'symbol',
          },
          {
            ...common,
            functionName: 'getBaseURI',
          },
        ] as const,
      });
    return {
      name,
      version,
      symbol,
      baseURI,
    };
  }

  @Logger('Views:')
  @ErrorHandler('Error:')
  public async getTokenMetadataURI(id: bigint): Promise<string> {
    const contract = await this.getContract();
    return contract.read.tokenURI([id]);
  }

  private parseProps<TProps extends UnstethCommonTransactionProps>(
    props: TProps,
  ): ParsedProps<TProps> {
    return {
      ...props,
      callback: props.callback ?? NOOP,
    };
  }
}
