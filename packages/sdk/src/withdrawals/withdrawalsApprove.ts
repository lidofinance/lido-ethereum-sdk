import { parseEther, type Address } from 'viem';
import invariant from 'tiny-invariant';

import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { version } from '../version.js';

import { LidoSDKWithdrawalsContract } from './withdrawalsContract.js';

import {
  type ApproveProps,
  type LidoSDKWithdrawalsApproveProps,
  ApproveCallbackStages,
} from './types.js';

export class LidoSDKWithdrawalsApprove {
  private readonly core: LidoSDKCore;
  private readonly contract: LidoSDKWithdrawalsContract;

  constructor(props: LidoSDKWithdrawalsApproveProps) {
    const { core, contract, ...rest } = props;

    if (core) this.core = core;
    else this.core = new LidoSDKCore(rest, version);

    if (contract) this.contract = contract;
    else this.contract = new LidoSDKWithdrawalsContract(props);
  }

  @Logger('Call:')
  public async approve(props: ApproveProps) {
    const { account } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const isContract = await this.core.isContract(account);

    if (isContract) return await this.approveMultisigByToken(props);
    else return await this.approveByToken(props);
  }

  @Logger('Call:')
  public async approveEOA(props: ApproveProps) {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    this.approveByToken(props);
  }

  @Logger('Call:')
  public async approveMultisig(props: ApproveProps) {
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    return this.approveMultisigByToken(props);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveSteth(props: Omit<ApproveProps, 'token'>) {
    this.approveByToken({ ...props, token: 'stETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveWsteth(props: Omit<ApproveProps, 'token'>) {
    this.approveByToken({ ...props, token: 'wstETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  private async approveByToken(props: ApproveProps) {
    const { account, amount, callback, token } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const isSteth = token === 'stETH';
    let tokenApproveMethod;
    let gasLimitMethod;

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();
    if (isSteth) {
      tokenApproveMethod = (await this.contract.getContractStETH()).write
        .approve;
      gasLimitMethod = this.approveStethGasLimit;
    } else {
      tokenApproveMethod = (await this.contract.getContractWstETH()).write
        .approve;
      gasLimitMethod = this.approveWstethGasLimit;
    }

    callback?.({ stage: ApproveCallbackStages.GAS_LIMIT });

    const gasLimit = await gasLimitMethod(amount, account);
    const feeData = await this.core.getFeeData();
    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    callback?.({ stage: ApproveCallbackStages.SIGN, payload: gasLimit });

    const transaction = await tokenApproveMethod(
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
  public async approveStethMultisig(props: Omit<ApproveProps, 'token'>) {
    return this.approveMultisigByToken({ ...props, token: 'stETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveWstethMultisig(props: Omit<ApproveProps, 'token'>) {
    return this.approveMultisigByToken({ ...props, token: 'wstETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  private async approveMultisigByToken(props: ApproveProps) {
    const { account, amount, callback, token } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    const isSteth = token === 'stETH';
    let tokenApproveMethod;

    if (isSteth)
      tokenApproveMethod = (await this.contract.getContractStETH()).write
        .approve;
    else
      tokenApproveMethod = (await this.contract.getContractWstETH()).write
        .approve;

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();

    callback?.({ stage: ApproveCallbackStages.SIGN });

    const transaction = await tokenApproveMethod(
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
  @ErrorHandler('Error:')
  public async approveStethGasLimit(amount: string, account: Address) {
    return this.approveGasLimitByToken(amount, account, 'stETH');
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async approveWstethGasLimit(amount: string, account: Address) {
    return this.approveGasLimitByToken(amount, account, 'stETH');
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async approveGasLimitByToken(
    amount: string,
    account: Address,
    token: 'stETH' | 'wstETH',
  ) {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const isSteth = token === 'stETH';
    let estimateGasMethod;

    if (isSteth)
      estimateGasMethod = (await this.contract.getContractStETH()).estimateGas
        .approve;
    else
      estimateGasMethod = (await this.contract.getContractWstETH()).estimateGas
        .approve;

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();

    const gasLimit = await estimateGasMethod(
      [addressWithdrawalsQueue, parseEther(amount)],
      { account },
    );

    return gasLimit;
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async checkApprovalSteth(amount: string, account: Address) {
    return this.checkApprovalByToken(amount, account, 'wstETH');
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async checkApprovalWsteth(amount: string, account: Address) {
    return this.checkApprovalByToken(amount, account, 'wstETH');
  }

  @Logger('Utils:')
  public async checkApprovalByToken(
    amount: string,
    account: Address,
    token: 'stETH' | 'wstETH',
  ) {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const isSteth = token === 'stETH';
    let allowanceMethod;

    if (isSteth)
      allowanceMethod = (await this.contract.getContractStETH()).read.allowance;
    else
      allowanceMethod = (await this.contract.getContractWstETH()).read
        .allowance;

    const addressWithdrawalsQueue =
      await this.contract.contractAddressWithdrawalsQueue();

    const allowance = await allowanceMethod(
      [account, addressWithdrawalsQueue],
      { account },
    );
    const isNeedApprove = allowance > parseEther(amount);

    return { allowance, isNeedApprove };
  }
}
