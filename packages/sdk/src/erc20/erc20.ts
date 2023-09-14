import { EtherValue, LidoSDKCore } from '../core/index.js';
import { version } from '../version.js';
import {
  AllowanceProps,
  ApproveProps,
  LidoSDKErc20Props,
  ParsedTransactionProps,
  TransactionProps,
  TransferProps,
} from './types.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { erc20abi } from './abi/erc20abi.js';
import {
  Address,
  GetContractReturnType,
  Hash,
  PublicClient,
  WalletClient,
  getContract,
} from 'viem';
import { NOOP } from '../common/constants.js';
import { parseValue } from '../common/utils/parse-value.js';
import { TransactionResult } from '../core/types.js';

export abstract class AbstractLidoSDKErc20 {
  readonly core: LidoSDKCore;

  constructor(props: LidoSDKErc20Props) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);
  }

  // Contract

  public abstract contractAddress(): Promise<Address>;

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddressWstETH'])
  public async getContract(): Promise<
    GetContractReturnType<typeof erc20abi, PublicClient, WalletClient>
  > {
    const address = await this.contractAddress();
    return getContract({
      address,
      abi: erc20abi,
      publicClient: this.core.rpcProvider,
      walletClient: this.core.web3Provider,
    });
  }

  // Balance

  @Logger('Balances:')
  public async balance(address: Address): Promise<bigint> {
    const contract = await this.getContract();
    return contract.read.balanceOf([address]);
  }

  // Transfer

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async transfer(props: TransferProps): Promise<TransactionResult> {
    const parsedProps = this.parseProps(props);
    const isTransferFrom =
      !!parsedProps.from && parsedProps.from !== parsedProps.account;
    const { account, amount, to, from = account } = parsedProps;
    const contract = await this.getContract();
    return this.core.performTransaction(
      parsedProps,
      async (overrides) => {
        return isTransferFrom
          ? contract.estimateGas.transferFrom([from, to, amount], overrides)
          : contract.estimateGas.transfer([to, amount], overrides);
      },
      (overrides) => {
        return isTransferFrom
          ? contract.write.transferFrom([from, to, amount], overrides)
          : contract.write.transfer([to, amount], overrides);
      },
    );
  }

  // Allowance

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approve(props: ApproveProps): Promise<TransactionResult> {
    const parsedProps = this.parseProps(props);
    const contract = await this.getContract();
    const txArguments = [parsedProps.to, parsedProps.amount] as const;
    return this.core.performTransaction(
      parsedProps,
      async (overrides) => {
        return contract.estimateGas.approve(txArguments, overrides);
      },
      (overrides) => {
        return contract.write.approve(txArguments, overrides);
      },
    );
  }

  @Logger('Views:')
  public async allowance({ account, to }: AllowanceProps): Promise<bigint> {
    return (await this.getContract()).read.allowance([account, to]);
  }

  // Views
  @Logger('Views:')
  @ErrorHandler('Error:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddress'])
  public async erc20Metadata(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    domainSeparator: Hash;
  }> {
    const contract = { address: await this.contractAddress(), abi: erc20abi };
    const [decimals, name, symbol, domainSeparator] =
      await this.core.rpcProvider.multicall({
        allowFailure: false,
        contracts: [
          {
            ...contract,
            functionName: 'decimals',
          },
          {
            ...contract,
            functionName: 'name',
          },
          {
            ...contract,
            functionName: 'symbol',
          },
          {
            ...contract,
            functionName: 'DOMAIN_SEPARATOR',
          },
        ] as const,
      });
    return {
      decimals,
      name,
      symbol,
      domainSeparator,
    };
  }

  @Logger('Views:')
  @ErrorHandler('Error:')
  public async totalSupply(): Promise<BigInt> {
    return (await this.getContract()).read.totalSupply();
  }
  @Logger('Views:')
  @ErrorHandler('Error:')
  public async nonces(address: Address): Promise<BigInt> {
    return (await this.getContract()).read.nonces([address]);
  }

  @Logger('Views:')
  @ErrorHandler('Error:')
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddress'])
  public async erc721Domain(): Promise<{
    name: string;
    version: string;
    chainId: bigint;
    verifyingContract: Address;
  }> {
    const contract = await this.getContract();
    const [name, version, chainId, verifyingContract] =
      await contract.read.eip712Domain();
    return { name, version, chainId, verifyingContract };
  }

  private parseProps<TProps extends TransactionProps & { amount: EtherValue }>(
    props: TProps,
  ): ParsedTransactionProps<TProps> {
    return {
      ...props,
      amount: parseValue(props.amount),
      callback: props.callback ?? NOOP,
    };
  }
}
