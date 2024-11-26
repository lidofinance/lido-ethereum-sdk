import { EtherValue, LidoSDKCore } from '../core/index.js';
import type {
  AllowanceProps,
  ApproveProps,
  ParsedTransactionProps,
  SignTokenPermitProps,
  TransferProps,
} from './types.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { erc20abi } from './abi/erc20abi.js';
import {
  type Address,
  type GetContractReturnType,
  type Hash,
  type WalletClient,
  encodeFunctionData,
  getContract,
} from 'viem';
import { NOOP, PERMIT_MESSAGE_TYPES } from '../common/constants.js';
import { parseValue } from '../common/utils/parse-value.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import type {
  CommonTransactionProps,
  NoCallback,
  PermitSignature,
  TransactionOptions,
  TransactionResult,
} from '../core/types.js';
import { splitSignature } from '@ethersproject/bytes';

export abstract class AbstractLidoSDKErc20 extends LidoSDKModule {
  // Contract

  public abstract contractAddress(): Promise<Address>;

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public async getContract(): Promise<
    GetContractReturnType<typeof erc20abi, WalletClient>
  > {
    const address = await this.contractAddress();
    return getContract({
      address,
      abi: erc20abi,
      client: {
        public: this.core.rpcProvider,
        wallet: this.core.web3Provider as WalletClient,
      },
    });
  }

  // Balance

  @Logger('Balances:')
  @ErrorHandler()
  public async balance(address?: Address): Promise<bigint> {
    const { address: parsedAddress } = await this.core.useAccount(address);
    const contract = await this.getContract();
    return contract.read.balanceOf([parsedAddress]);
  }

  // Transfer

  @Logger('Call:')
  @ErrorHandler()
  public async transfer(props: TransferProps): Promise<TransactionResult> {
    this.core.useWeb3Provider();
    const parsedProps = await this.parseProps(props);
    const { account, amount, to, from = account.address } = parsedProps;
    const isTransferFrom = from !== account.address;
    const contract = await this.getContract();

    const getGasLimit = async (overrides: TransactionOptions) =>
      isTransferFrom
        ? contract.estimateGas.transferFrom([from, to, amount], overrides)
        : contract.estimateGas.transfer([to, amount], overrides);

    const sendTransaction = async (overrides: TransactionOptions) =>
      isTransferFrom
        ? contract.write.transferFrom([from, to, amount], overrides)
        : contract.write.transfer([to, amount], overrides);

    return this.core.performTransaction({
      ...parsedProps,
      getGasLimit,
      sendTransaction,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async populateTransfer(props: NoCallback<TransferProps>) {
    const parsedProps = await this.parseProps(props);
    const { account, amount, to, from = account.address } = parsedProps;
    const isTransferFrom = from !== account.address;
    const contractAddress = await this.contractAddress();

    return {
      to: contractAddress,
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
  @ErrorHandler()
  public async simulateTransfer(props: NoCallback<TransferProps>) {
    const parsedProps = await this.parseProps(props);
    const { account, amount, to, from = account.address } = parsedProps;
    const isTransferFrom = from !== account.address;

    const contract = await this.getContract();
    return isTransferFrom
      ? contract.simulate.transferFrom([from, to, amount], {
          account,
        })
      : contract.simulate.transfer([to, amount], { account });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async estimateTransfer(props: NoCallback<TransferProps>) {
    const parsedProps = await this.parseProps(props);
    const { account, amount, to, from = account.address } = parsedProps;
    const isTransferFrom = from !== account.address;

    const contract = await this.getContract();
    return isTransferFrom
      ? contract.estimateGas.transferFrom([from, to, amount], {
          account,
        })
      : contract.estimateGas.transfer([to, amount], { account });
  }

  // PERMIT
  @Logger('Permit:')
  @ErrorHandler()
  public async signPermit(
    props: SignTokenPermitProps,
  ): Promise<PermitSignature> {
    const web3Provider = this.core.useWeb3Provider();
    const payload = await this.populatePermit(props);
    const signature = await web3Provider.signTypedData(payload);
    const { s, r, v } = splitSignature(signature);

    return {
      v,
      r: r as `0x${string}`,
      s: s as `0x${string}`,
      chainId: BigInt(this.core.chain.id),
      ...payload.message,
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async populatePermit(props: SignTokenPermitProps) {
    const {
      amount,
      account: accountProp,
      spender,
      deadline = LidoSDKCore.INFINITY_DEADLINE_VALUE,
    } = props;

    const contract = await this.getContract();
    const domain = await this.erc721Domain();
    const account = await this.core.useAccount(accountProp);
    const nonce = await contract.read.nonces([account.address]);

    const message = {
      owner: account.address,
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
  @ErrorHandler()
  public async approve(props: ApproveProps): Promise<TransactionResult> {
    this.core.useWeb3Provider();
    const parsedProps = await this.parseProps(props);
    const contract = await this.getContract();
    const txArguments = [parsedProps.to, parsedProps.amount] as const;
    return this.core.performTransaction({
      ...parsedProps,
      getGasLimit: (options) =>
        contract.estimateGas.approve(txArguments, options),
      sendTransaction: (options) =>
        contract.write.approve(txArguments, options),
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async populateApprove(props: NoCallback<ApproveProps>) {
    const { account, amount, to } = await this.parseProps(props);
    const address = await this.contractAddress();

    return {
      to: address,
      from: account.address,
      data: encodeFunctionData({
        abi: erc20abi,
        functionName: 'approve',
        args: [to, amount],
      }),
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async simulateApprove(props: NoCallback<ApproveProps>) {
    const { account, amount, to } = await this.parseProps(props);
    const contract = await this.getContract();
    return contract.simulate.approve([to, amount], {
      account,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async estimateApprove(props: NoCallback<ApproveProps>) {
    const { account, amount, to } = await this.parseProps(props);
    const contract = await this.getContract();
    return contract.estimateGas.approve([to, amount], {
      account,
    });
  }

  @Logger('Views:')
  public async allowance({
    account: accountProp,
    to,
  }: AllowanceProps): Promise<bigint> {
    const account = await this.core.useAccount(accountProp);
    return (await this.getContract()).read.allowance([account.address, to]);
  }

  // Views
  @Logger('Views:')
  @ErrorHandler()
  @Cache(30 * 60 * 1000, ['core.chain.id', 'contractAddress'])
  public async erc20Metadata(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    domainSeparator: Hash;
  }> {
    if (this.core.rpcProvider.multicall) {
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
    } else {
      const contract = await this.getContract();
      const [decimals, name, symbol, domainSeparator] = await Promise.all([
        contract.read.decimals(),
        contract.read.name(),
        contract.read.symbol(),
        contract.read.DOMAIN_SEPARATOR(),
      ]);
      return {
        decimals,
        name,
        symbol,
        domainSeparator,
      };
    }
  }

  @Logger('Views:')
  @ErrorHandler()
  public async totalSupply(): Promise<bigint> {
    return (await this.getContract()).read.totalSupply();
  }
  @Logger('Views:')
  @ErrorHandler()
  public async nonces(address: Address): Promise<bigint> {
    return (await this.getContract()).read.nonces([address]);
  }

  @Logger('Views:')
  @ErrorHandler()
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

  private async parseProps<
    TProps extends CommonTransactionProps & { amount: EtherValue },
  >(props: TProps): Promise<ParsedTransactionProps<TProps>> {
    return {
      ...props,
      account: await this.core.useAccount(props.account),
      amount: parseValue(props.amount),
      callback: props.callback ?? NOOP,
    };
  }
}
