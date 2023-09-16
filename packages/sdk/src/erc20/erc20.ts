import { EtherValue, LidoSDKCore } from '../core/index.js';
import { version } from '../version.js';
import {
  AllowanceProps,
  ApproveProps,
  LidoSDKErc20Props,
  NoCallback,
  ParsedTransactionProps,
  SignTokenPermitProps,
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
  encodeFunctionData,
  getContract,
} from 'viem';
import { NOOP, PERMIT_MESSAGE_TYPES } from '../common/constants.js';
import { parseValue } from '../common/utils/parse-value.js';
import { PermitSignature, TransactionResult } from '../core/types.js';
import invariant from 'tiny-invariant';
import { splitSignature } from '@ethersproject/bytes';

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
  @ErrorHandler('Error:')
  public async balance(address: Address): Promise<bigint> {
    const contract = await this.getContract();
    return contract.read.balanceOf([address]);
  }

  // Transfer

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async transfer(props: TransferProps): Promise<TransactionResult> {
    const parsedProps = this.parseProps(props);
    const { account, amount, to, from = account } = parsedProps;
    const isTransferFrom = from !== account;
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

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async populateTransfer(props: NoCallback<TransferProps>) {
    const {
      account,
      amount,
      to,
      from = props.account,
    } = this.parseProps(props);
    const isTransferFrom = from !== account;
    const address = await this.contractAddress();

    return {
      to: address,
      from: account,
      data: isTransferFrom
        ? encodeFunctionData({
            abi: erc20abi,
            functionName: 'transferFrom',
            args: [from, to, amount],
          })
        : encodeFunctionData({
            abi: erc20abi,
            functionName: 'transfer',
            args: [to, amount],
          }),
    };
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async simulateTransfer(props: NoCallback<TransferProps>) {
    const {
      account,
      amount,
      to,
      from = props.account,
    } = this.parseProps(props);
    const isTransferFrom = from !== account;
    const contract = await this.getContract();
    return isTransferFrom
      ? contract.simulate.transferFrom([from, to, amount], { account })
      : contract.simulate.transfer([to, amount], { account });
  }

  // PERMIT
  @Logger('Permit:')
  @ErrorHandler('Error:')
  public async signPermit(
    props: SignTokenPermitProps,
  ): Promise<PermitSignature> {
    const payload = await this.populatePermit(props);
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    const signature = await this.core.web3Provider.signTypedData(payload);
    const { s, r, v } = splitSignature(signature);

    return {
      v,
      r: r as `0x${string}`,
      s: s as `0x${string}`,
      value: props.amount,
      deadline: payload.message.deadline,
      nonce: payload.message.nonce,
      chainId: BigInt(this.core.chain.id),
      owner: payload.message.owner,
      spender: payload.message.spender,
    };
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async populatePermit(props: SignTokenPermitProps) {
    const {
      amount,
      account,
      spender,
      deadline = LidoSDKCore.INFINITY_DEADLINE_VALUE,
    } = props;
    const contract = await this.getContract();
    const domain = await this.erc721Domain();
    const nonce = await contract.read.nonces([account]);

    const message = {
      owner: account,
      spender,
      value: amount,
      nonce,
      deadline,
    };

    return {
      account,
      domain,
      types: PERMIT_MESSAGE_TYPES,
      primaryType: 'Permit',
      message,
    } as const;
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

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async populateApprove(props: NoCallback<ApproveProps>) {
    const { account, amount, to } = this.parseProps(props);
    const address = await this.contractAddress();

    return {
      to: address,
      from: account,
      data: encodeFunctionData({
        abi: erc20abi,
        functionName: 'approve',
        args: [to, amount],
      }),
    };
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async simulateApprove(props: NoCallback<ApproveProps>) {
    const { account, amount, to } = this.parseProps(props);

    const contract = await this.getContract();
    return contract.simulate.approve([to, amount], { account });
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
  public async totalSupply(): Promise<bigint> {
    return (await this.getContract()).read.totalSupply();
  }
  @Logger('Views:')
  @ErrorHandler('Error:')
  public async nonces(address: Address): Promise<bigint> {
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
