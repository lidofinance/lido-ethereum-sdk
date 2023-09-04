import { maxUint256, parseEther, type Address, type Account } from 'viem';
import invariant from 'tiny-invariant';

import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { version } from '../version.js';

import { LidoSDKWithdrawalsContract } from './withdrawalsContract.js';
import { LidoSDKWithdrawalsViews } from './withdrawalsViews.js';
import { LidoSDKWithdrawalsRequestsInfo } from './withdrawalsRequestsInfo.js';
import { LidoSDKWithdrawalsPermit } from './withdrawalsPermit.js';
import {
  type LidoSDKWithdrawalsProps,
  type RequestWithPermitProps,
  type RequestProps,
  type Signature,
  type ApproveProps,
  ApproveCallbackStages,
  RequestCallbackStages,
} from './types.js';

const INFINITY_DEADLINE_VALUE = maxUint256;

export class LidoSDKWithdrawals {
  readonly core: LidoSDKCore;
  readonly contract: LidoSDKWithdrawalsContract;
  readonly views: LidoSDKWithdrawalsViews;
  readonly requestsInfo: LidoSDKWithdrawalsRequestsInfo;
  readonly permit: LidoSDKWithdrawalsPermit;

  constructor(props: LidoSDKWithdrawalsProps) {
    const { core, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);

    this.contract = new LidoSDKWithdrawalsContract(props);
    this.views = new LidoSDKWithdrawalsViews({
      ...props,
      contract: this.contract,
    });
    this.requestsInfo = new LidoSDKWithdrawalsRequestsInfo({
      ...props,
      views: this.views,
    });
    this.permit = new LidoSDKWithdrawalsPermit({
      ...props,
      contract: this.contract,
    });
  }

  // Calls

  @Logger('Call:')
  public async request(props: RequestWithPermitProps) {
    const { account } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const isContract = await this.core.isContract(account);

    if (isContract) return await this.requestMultisig(props);
    else return await this.requestWithPermit(props);
  }

  @Logger('Call:')
  public async requestWithPermit(props: RequestWithPermitProps) {
    const { contract, ...rest } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    if (contract === 'stETH') await this.requestStethWithPermit(rest);
    else await this.requestWstethWithPermit(rest);
  }

  @Logger('Call:')
  public async requestWithoutPermit(props: RequestProps) {
    const { contract, ...rest } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    if (contract === 'stETH') await this.requestStethWithoutPermit(rest);
    else await this.requestWstethWithoutPermit(rest);
  }

  @Logger('Call:')
  public async requestMultisig(props: RequestProps) {
    const { contract, ...rest } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    if (contract === 'stETH') await this.requestStethMultisig(rest);
    else await this.requestWstethMultisig(rest);
  }

  @Logger('Call:')
  public async approve(props: ApproveProps) {
    const { account } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const isContract = await this.core.isContract(account);

    if (isContract) return await this.approveMultisig(props);
    else return await this.approveEOA(props);
  }

  @Logger('Call:')
  public async approveEOA(props: ApproveProps) {
    const { contract, ...rest } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    if (contract === 'stETH') await this.approveSteth(rest);
    else await this.approveWsteth(rest);
  }

  @Logger('Call:')
  public async approveMultisig(props: ApproveProps) {
    const { contract, ...rest } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    if (contract === 'stETH') await this.approveStethMultisig(rest);
    else await this.approveWstethMultisig(rest);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestStethWithPermit(
    props: Omit<RequestWithPermitProps, 'contract'>,
  ) {
    const { account, amount, requests, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();

    callback?.({ stage: RequestCallbackStages.PERMIT });

    const signature = await this.permit.permitSignature({
      account,
      spender: contract.address,
      deadline: INFINITY_DEADLINE_VALUE,
      amount: parseEther(amount),
      contract: 'stETH',
    });

    const params = [
      requests,
      signature.owner,
      {
        value: signature.value,
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      },
    ] as const;

    callback?.({ stage: RequestCallbackStages.GAS_LIMIT });

    const { gasLimit, overrides } = await this.requestStethWithPermitGasLimit(
      account,
      signature,
      requests,
    );

    callback?.({ stage: RequestCallbackStages.SIGN, payload: gasLimit });

    const transaction = await contract.write.requestWithdrawalsWithPermit(
      [...params],
      {
        chain: this.core.chain,
        gas: gasLimit,
        ...overrides,
      },
    );

    callback?.({ stage: RequestCallbackStages.RECEIPT, payload: transaction });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback?.({
      stage: RequestCallbackStages.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback?.({ stage: RequestCallbackStages.DONE, payload: confirmations });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWstethWithPermit(
    props: Omit<RequestWithPermitProps, 'contract'>,
  ) {
    const { account, amount, requests, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();

    callback?.({ stage: RequestCallbackStages.PERMIT });

    const signature = await this.permit.permitSignature({
      account,
      spender: contract.address,
      deadline: INFINITY_DEADLINE_VALUE,
      amount: parseEther(amount),
      contract: 'wstETH',
    });

    const params = [
      requests,
      signature.owner,
      {
        value: signature.value,
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      },
    ] as const;

    callback?.({ stage: RequestCallbackStages.GAS_LIMIT });

    const { gasLimit, overrides } = await this.requestWstethWithPermitGasLimit(
      account,
      signature,
      requests,
    );

    callback?.({ stage: RequestCallbackStages.SIGN, payload: gasLimit });

    const transaction = await contract.write.requestWithdrawalsWstETHWithPermit(
      [...params],
      {
        chain: this.core.chain,
        gas: gasLimit,
        ...overrides,
      },
    );

    callback?.({ stage: RequestCallbackStages.RECEIPT, payload: transaction });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback?.({
      stage: RequestCallbackStages.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback?.({ stage: RequestCallbackStages.DONE, payload: confirmations });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestStethWithoutPermit(
    props: Omit<RequestProps, 'contract'>,
  ) {
    const { account, requests, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();
    const params = [requests, account] as const;

    callback?.({ stage: RequestCallbackStages.GAS_LIMIT });

    const { gasLimit, overrides } = await this.requestStethGasLimit(
      account,
      requests,
    );

    callback?.({ stage: RequestCallbackStages.SIGN, payload: gasLimit });

    const transaction = await contract.write.requestWithdrawals([...params], {
      ...overrides,
      chain: this.core.chain,
    });

    callback?.({ stage: RequestCallbackStages.RECEIPT, payload: transaction });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback?.({
      stage: RequestCallbackStages.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback?.({ stage: RequestCallbackStages.DONE, payload: confirmations });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWstethWithoutPermit(
    props: Omit<RequestProps, 'contract'>,
  ) {
    const { account, requests, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();
    const params = [requests, account] as const;

    callback?.({ stage: RequestCallbackStages.GAS_LIMIT });

    const { gasLimit, overrides } = await this.requestWstethGasLimit(
      account,
      requests,
    );

    callback?.({ stage: RequestCallbackStages.SIGN, payload: gasLimit });

    const transaction = await contract.write.requestWithdrawalsWstETH(
      [...params],
      {
        ...overrides,
        chain: this.core.chain,
      },
    );

    callback?.({ stage: RequestCallbackStages.RECEIPT, payload: transaction });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback?.({
      stage: RequestCallbackStages.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback?.({ stage: RequestCallbackStages.DONE, payload: confirmations });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestStethMultisig(props: Omit<RequestProps, 'contract'>) {
    const { account, requests, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();
    const params = [requests, account] as const;

    callback?.({ stage: RequestCallbackStages.SIGN });

    const transaction = await contract.write.requestWithdrawals([...params], {
      account,
      chain: this.core.chain,
    });

    callback?.({ stage: RequestCallbackStages.MULTISIG_DONE });

    return { hash: transaction };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWstethMultisig(props: Omit<RequestProps, 'contract'>) {
    const { account, requests, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();
    const params = [requests, account] as const;

    callback?.({ stage: RequestCallbackStages.SIGN });

    const transaction = await contract.write.requestWithdrawalsWstETH(
      [...params],
      {
        account,
        chain: this.core.chain,
      },
    );

    callback?.({ stage: RequestCallbackStages.MULTISIG_DONE });

    return { hash: transaction };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveSteth(props: Omit<ApproveProps, 'contract'>) {
    const { account, amount, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();
    const contractSteth = await this.contract.getContractStETH();

    callback?.({ stage: ApproveCallbackStages.GAS_LIMIT });

    const { gasLimit, overrides } = await this.approveStethGasLimit(
      amount,
      account,
    );

    callback?.({ stage: ApproveCallbackStages.SIGN, payload: gasLimit });

    const transaction = await contractSteth.write.approve(
      [addressWithdrawalsQueue, parseEther(amount)],
      { chain: this.core.chain, ...overrides, gas: gasLimit },
    );

    callback?.({
      stage: ApproveCallbackStages.RECEIPT,
      payload: transaction,
    });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback?.({
      stage: ApproveCallbackStages.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback?.({
      stage: ApproveCallbackStages.DONE,
      payload: confirmations,
    });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveWsteth(props: Omit<ApproveProps, 'contract'>) {
    const { account, amount, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();
    const contractWstETH = await this.contract.getContractWstETH();

    callback?.({ stage: ApproveCallbackStages.GAS_LIMIT });

    const { gasLimit, overrides } = await this.approveWstethGasLimit(
      amount,
      account,
    );

    callback?.({ stage: ApproveCallbackStages.SIGN, payload: gasLimit });

    const transaction = await contractWstETH.write.approve(
      [addressWithdrawalsQueue, parseEther(amount)],
      { chain: this.core.chain, ...overrides, gas: gasLimit },
    );

    callback?.({
      stage: ApproveCallbackStages.RECEIPT,
      payload: transaction,
    });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback?.({
      stage: ApproveCallbackStages.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback?.({
      stage: ApproveCallbackStages.DONE,
      payload: confirmations,
    });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveStethMultisig(props: Omit<ApproveProps, 'contract'>) {
    const { account, amount, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();
    const contractSteth = await this.contract.getContractStETH();

    callback?.({ stage: ApproveCallbackStages.SIGN });

    const transaction = await contractSteth.write.approve(
      [addressWithdrawalsQueue, parseEther(amount)],
      { chain: this.core.chain, account },
    );

    callback?.({
      stage: ApproveCallbackStages.MULTISIG_DONE,
    });

    return { hash: transaction };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveWstethMultisig(props: Omit<ApproveProps, 'contract'>) {
    const { account, amount, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();
    const contractWsteth = await this.contract.getContractWstETH();

    callback?.({ stage: ApproveCallbackStages.SIGN });

    const transaction = await contractWsteth.write.approve(
      [addressWithdrawalsQueue, parseEther(amount)],
      { chain: this.core.chain, account },
    );

    callback?.({
      stage: ApproveCallbackStages.MULTISIG_DONE,
    });

    return { hash: transaction };
  }

  // Utils

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async requestStethWithPermitGasLimit(
    account: Address,
    signature: Signature,
    requests: readonly bigint[],
  ): Promise<{
    gasLimit: bigint | undefined;
    overrides: {
      account: Account | Address;
      maxPriorityFeePerGas: bigint | undefined;
      maxFeePerGas: bigint | undefined;
    };
  }> {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const params = [
      requests,
      signature.owner,
      {
        value: signature.value,
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      },
    ] as const;

    const feeData = await this.core.getFeeData();

    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const contract = await this.contract.getContractWithdrawalsQueue();
    const gasLimit = await contract.estimateGas.requestWithdrawalsWithPermit(
      [...params],
      overrides,
    );

    return { gasLimit, overrides };
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async requestWstethWithPermitGasLimit(
    account: Address,
    signature: Signature,
    requests: readonly bigint[],
  ): Promise<{
    gasLimit: bigint | undefined;
    overrides: {
      account: Account | Address;
      maxPriorityFeePerGas: bigint | undefined;
      maxFeePerGas: bigint | undefined;
    };
  }> {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const params = [
      requests,
      signature.owner,
      {
        value: signature.value,
        deadline: signature.deadline,
        v: signature.v,
        r: signature.r,
        s: signature.s,
      },
    ] as const;

    const feeData = await this.core.getFeeData();

    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const contract = await this.contract.getContractWithdrawalsQueue();
    const gasLimit =
      await contract.estimateGas.requestWithdrawalsWstETHWithPermit(
        [...params],
        overrides,
      );

    return { gasLimit, overrides };
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async requestStethGasLimit(
    account: Address,
    requests: readonly bigint[],
  ): Promise<{
    gasLimit: bigint | undefined;
    overrides: {
      account: Account | Address;
      maxPriorityFeePerGas: bigint | undefined;
      maxFeePerGas: bigint | undefined;
    };
  }> {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const feeData = await this.core.getFeeData();

    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const params = [requests, account] as const;

    const contract = await this.contract.getContractWithdrawalsQueue();
    const gasLimit = await contract.estimateGas.requestWithdrawals(
      [...params],
      overrides,
    );

    return { gasLimit, overrides };
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async requestWstethGasLimit(
    account: Address,
    requests: readonly bigint[],
  ): Promise<{
    gasLimit: bigint | undefined;
    overrides: {
      account: Account | Address;
      maxPriorityFeePerGas: bigint | undefined;
      maxFeePerGas: bigint | undefined;
    };
  }> {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const feeData = await this.core.getFeeData();

    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const params = [requests, account] as const;

    const contract = await this.contract.getContractWithdrawalsQueue();
    const gasLimit = await contract.estimateGas.requestWithdrawalsWstETH(
      [...params],
      overrides,
    );

    return { gasLimit, overrides };
  }

  @Logger('Utils:')
  public async approveStethGasLimit(amount: string, account: Address) {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');
    const feeData = await this.core.getFeeData();

    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();
    const contractSteth = await this.contract.getContractStETH();

    const gasLimit = await contractSteth.estimateGas.approve(
      [addressWithdrawalsQueue, parseEther(amount)],
      overrides,
    );

    return { gasLimit, overrides };
  }

  @Logger('Utils:')
  public async approveWstethGasLimit(amount: string, account: Address) {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');
    const feeData = await this.core.getFeeData();

    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();
    const contractWsteth = await this.contract.getContractWstETH();

    const gasLimit = await contractWsteth.estimateGas.approve(
      [addressWithdrawalsQueue, parseEther(amount)],
      overrides,
    );

    return { gasLimit, overrides };
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  public async checkApprovalSteth(amount: string, account: Address) {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();
    const contractSteth = await this.contract.getContractStETH();

    const allowance = await contractSteth.read.allowance(
      [account, addressWithdrawalsQueue],
      { account },
    );
    const isNeedApprove = allowance > parseEther(amount);

    return { allowance, isNeedApprove };
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  public async checkApprovalWsteth(amount: string, account: Address) {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();
    const contractWsteth = await this.contract.getContractWstETH();

    const allowance = await contractWsteth.read.allowance(
      [account, addressWithdrawalsQueue],
      { account },
    );
    const isNeedApprove = allowance > parseEther(amount);

    return { allowance, isNeedApprove };
  }
}
