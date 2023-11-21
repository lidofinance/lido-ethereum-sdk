import { CommonTransactionProps, TransactionResult } from '../core/index.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';

import type {
  UnstethNFT,
  UnstethApproveAllProps,
  UnstethApproveProps,
  UnstethApprovedForProps,
  UnstethIsApprovedForAllProps,
  ParsedProps,
  SafeTransferFromArguments,
  UnstethTransferProps,
} from './types.js';
import type { NoCallback, PopulatedTransaction } from '../core/types.js';
import {
  type Address,
  type GetContractReturnType,
  type PublicClient,
  type WalletClient,
  getContract,
  zeroAddress,
  encodeFunctionData,
} from 'viem';
import { unstethAbi } from './abi/unsteth-abi.js';
import { LIDO_CONTRACT_NAMES, NOOP } from '../common/constants.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

export class LidoSDKUnstETH extends LidoSDKModule {
  // Contract

  @Logger('Contracts:')
  @Cache(30 * 60 * 1000, ['core.chain.id'])
  public contractAddress(): Promise<Address> {
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
  @ErrorHandler()
  public async getNFTsByAccount(account: Address): Promise<UnstethNFT[]> {
    const contract = await this.getContract();

    const ids = await contract.read.getWithdrawalRequests([account]);
    const statuses = await contract.read.getWithdrawalStatus([ids]);

    return ids.map((id, index) => ({ ...statuses[index], id }) as UnstethNFT);
  }

  @Logger('Balances:')
  @ErrorHandler()
  public async getAccountByNFT(id: bigint): Promise<Address> {
    const contract = await this.getContract();
    return contract.read.ownerOf([id]);
  }

  // Transfer
  @Logger('Call:')
  @ErrorHandler()
  public async transfer(
    props: UnstethTransferProps,
  ): Promise<TransactionResult> {
    const {
      account,
      callback,
      id,
      to,
      from: _from,
      data,
    } = this.parseProps(props);
    const from = _from ?? (await this.core.getWeb3Address(account));
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

  @Logger('Utils:')
  @ErrorHandler()
  public async transferSimulateTx(props: NoCallback<UnstethTransferProps>) {
    const { account, id, to, from: _from, data } = this.parseProps(props);
    const accountAddress = await this.core.getWeb3Address(account);
    const from = _from ?? accountAddress;
    const args = (
      data ? [from, to, id, data] : [from, to, id]
    ) as SafeTransferFromArguments;
    const contract = await this.getContract();
    return contract.simulate.safeTransferFrom(args, {
      account: accountAddress,
    });
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async transferPopulateTx(
    props: NoCallback<UnstethTransferProps>,
  ): Promise<PopulatedTransaction> {
    const { account, id, to, from: _from, data } = this.parseProps(props);
    const accountAddress = await this.core.getWeb3Address(account);
    const from = _from ?? accountAddress;
    const args = (
      data ? [from, to, id, data] : [from, to, id]
    ) as SafeTransferFromArguments;
    const contract = await this.getContract();
    return {
      from: accountAddress,
      to: contract.address,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName: 'safeTransferFrom',
        args,
      }),
    };
  }

  // Approve Single

  @Logger('Views:')
  @ErrorHandler()
  public async getSingleTokenApproval({
    id,
    account,
  }: UnstethApprovedForProps) {
    const contract = await this.getContract();
    return contract.read.getApproved([id], { account });
  }

  @Logger('Call:')
  @ErrorHandler()
  public async setSingleTokenApproval(
    props: UnstethApproveProps,
  ): Promise<TransactionResult> {
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

  @Logger('Utils:')
  @ErrorHandler()
  public async setSingleTokenApprovalPopulateTx(
    props: NoCallback<UnstethApproveProps>,
  ): Promise<PopulatedTransaction> {
    const { account, to = zeroAddress, id } = this.parseProps(props);
    const accountAddress = await this.core.getWeb3Address(account);
    const args = [to, id] as const;
    const contract = await this.getContract();
    return {
      from: accountAddress,
      to: contract.address,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName: 'approve',
        args,
      }),
    };
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async setSingleTokenApprovalSimulateTx(
    props: NoCallback<UnstethApproveProps>,
  ) {
    const { account, to = zeroAddress, id } = this.parseProps(props);
    const accountAddress = await this.core.getWeb3Address(account);
    const args = [to, id] as const;
    const contract = await this.getContract();
    return contract.simulate.approve(args, {
      account: accountAddress,
    });
  }

  // Approval All
  @Logger('Views:')
  @ErrorHandler()
  public async areAllTokensApproved({
    account,
    to,
  }: UnstethIsApprovedForAllProps) {
    const contract = await this.getContract();
    return contract.read.isApprovedForAll([account, to]);
  }

  @Logger('Call:')
  @ErrorHandler()
  public async setAllTokensApproval(
    props: UnstethApproveAllProps,
  ): Promise<TransactionResult> {
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

  @Logger('Call:')
  @ErrorHandler()
  public async setAllTokensApprovalPopulateTx(
    props: NoCallback<UnstethApproveAllProps>,
  ): Promise<PopulatedTransaction> {
    const { account, to, allow } = this.parseProps(props);
    const accountAddress = await this.core.getWeb3Address(account);
    const args = [to, allow] as const;
    const contract = await this.getContract();
    return {
      from: accountAddress,
      to: contract.address,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName: 'setApprovalForAll',
        args,
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler()
  public async setAllTokensApprovalSimulateTx(
    props: NoCallback<UnstethApproveAllProps>,
  ) {
    const { account, to, allow } = this.parseProps(props);
    const accountAddress = await this.core.getWeb3Address(account);
    const args = [to, allow] as const;
    const contract = await this.getContract();
    return contract.simulate.setApprovalForAll(args, {
      account: accountAddress,
    });
  }

  // Metadata

  @Logger('Views:')
  @ErrorHandler()
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
  @ErrorHandler()
  public async getTokenMetadataURI(id: bigint): Promise<string> {
    const contract = await this.getContract();
    return contract.read.tokenURI([id]);
  }

  private parseProps<TProps extends CommonTransactionProps>(
    props: TProps,
  ): ParsedProps<TProps> {
    return {
      ...props,
      callback: props.callback ?? NOOP,
    };
  }
}
