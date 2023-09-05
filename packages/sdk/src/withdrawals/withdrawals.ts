import { maxUint256, parseEther, type Address, type Account } from 'viem';
import invariant from 'tiny-invariant';

import { LidoSDKCore } from '../core/index.js';
import { Logger, Cache, ErrorHandler } from '../common/decorators/index.js';
import { version } from '../version.js';

import { LidoSDKWithdrawalsContract } from './withdrawalsContract.js';
import { LidoSDKWithdrawalsViews } from './withdrawalsViews.js';
import { LidoSDKWithdrawalsRequestsInfo } from './withdrawalsRequestsInfo.js';
import { LidoSDKWithdrawalsPermit } from './withdrawalsPermit.js';
import { LidoSDKWithdrawalsApprove } from './withdrawalsApprove.js';
import {
  type LidoSDKWithdrawalsProps,
  type RequestWithPermitProps,
  type RequestProps,
  type Signature,
  RequestCallbackStages,
} from './types.js';

const INFINITY_DEADLINE_VALUE = maxUint256;

export class LidoSDKWithdrawals {
  readonly core: LidoSDKCore;
  readonly contract: LidoSDKWithdrawalsContract;
  readonly views: LidoSDKWithdrawalsViews;
  readonly requestsInfo: LidoSDKWithdrawalsRequestsInfo;
  readonly permit: LidoSDKWithdrawalsPermit;
  readonly approval: LidoSDKWithdrawalsApprove;

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
    this.approval = new LidoSDKWithdrawalsApprove({
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

    if (isContract) return this.requestMultisigByToken(props);
    else return this.requestWithPermitByToken(props);
  }

  @Logger('Call:')
  public async requestWithoutPermit(props: RequestProps) {
    const { account } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const isContract = await this.core.isContract(account);

    if (isContract) return this.requestMultisigByToken(props);
    else return this.requestWithoutPermitByToken(props);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestStethWithPermit(
    props: Omit<RequestWithPermitProps, 'token'>,
  ) {
    this.requestWithPermitByToken({ ...props, token: 'stETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWstethWithPermit(
    props: Omit<RequestWithPermitProps, 'token'>,
  ) {
    this.requestWithPermitByToken({ ...props, token: 'stETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestStethWithoutPermit(props: Omit<RequestProps, 'token'>) {
    this.requestWithoutPermitByToken({ ...props, token: 'stETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWstethWithoutPermit(props: Omit<RequestProps, 'token'>) {
    this.requestWithoutPermitByToken({ ...props, token: 'wstETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestStethMultisig(props: Omit<RequestProps, 'token'>) {
    return this.requestMultisigByToken({ ...props, token: 'stETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWstethMultisig(props: Omit<RequestProps, 'token'>) {
    return this.requestMultisigByToken({ ...props, token: 'wstETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWithoutPermitByToken(props: RequestProps) {
    const { account, requests, callback, token } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();

    const isSteth = token === 'stETH';
    let tokenRequestMethod;

    if (isSteth) {
      tokenRequestMethod = contract.write.requestWithdrawals;
    } else {
      tokenRequestMethod = contract.write.requestWithdrawalsWstETH;
    }

    const params = [requests, account] as const;

    callback?.({ stage: RequestCallbackStages.GAS_LIMIT });

    const gasLimit = await this.requestGasLimitByToken(
      account,
      requests,
      token,
    );
    const feeData = await this.core.getFeeData();
    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    callback?.({ stage: RequestCallbackStages.SIGN, payload: gasLimit });

    const transaction = await tokenRequestMethod([...params], {
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
  public async requestWithPermitByToken(props: RequestWithPermitProps) {
    const { account, amount, requests, callback, token } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();

    const isSteth = token === 'stETH';
    let tokenRequestMethod;

    if (isSteth) {
      tokenRequestMethod = contract.write.requestWithdrawalsWithPermit;
    } else {
      tokenRequestMethod = contract.write.requestWithdrawalsWstETHWithPermit;
    }

    callback?.({ stage: RequestCallbackStages.PERMIT });

    const signature = await this.permit.permitSignature({
      account,
      spender: contract.address,
      deadline: INFINITY_DEADLINE_VALUE,
      amount: parseEther(amount),
      token,
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

    const gasLimit = await this.requestWithPermitGasLimitByToken(
      account,
      signature,
      requests,
      token,
    );
    const feeData = await this.core.getFeeData();
    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    callback?.({ stage: RequestCallbackStages.SIGN, payload: gasLimit });

    const transaction = await tokenRequestMethod([...params], {
      chain: this.core.chain,
      gas: gasLimit,
      ...overrides,
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
  public async requestMultisigByToken(props: RequestProps) {
    const { account, requests, callback, token } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();

    const isSteth = token === 'stETH';
    let tokenRequestMethod;

    if (isSteth) tokenRequestMethod = contract.write.requestWithdrawals;
    else tokenRequestMethod = contract.write.requestWithdrawalsWstETH;

    const params = [requests, account] as const;

    callback?.({ stage: RequestCallbackStages.SIGN });

    const transaction = await tokenRequestMethod([...params], {
      account,
      chain: this.core.chain,
    });

    callback?.({ stage: RequestCallbackStages.MULTISIG_DONE });

    return { hash: transaction };
  }

  // Utils

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async requestWithPermitGasLimitByToken(
    account: Address,
    signature: Signature,
    requests: readonly bigint[],
    token: 'stETH' | 'wstETH',
  ): Promise<bigint> {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();

    const isSteth = token === 'stETH';
    let tokenRequestMethod;

    if (isSteth)
      tokenRequestMethod = contract.estimateGas.requestWithdrawalsWithPermit;
    else
      tokenRequestMethod =
        contract.estimateGas.requestWithdrawalsWstETHWithPermit;

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

    const gasLimit = await tokenRequestMethod([...params], { account });

    return gasLimit;
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async requestGasLimitByToken(
    account: Address,
    requests: readonly bigint[],
    token: 'stETH' | 'wstETH',
  ): Promise<bigint> {
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();

    const isSteth = token === 'stETH';
    let tokenRequestMethod;
    if (isSteth) tokenRequestMethod = contract.estimateGas.requestWithdrawals;
    else tokenRequestMethod = contract.estimateGas.requestWithdrawalsWstETH;

    const params = [requests, account] as const;
    const gasLimit = await tokenRequestMethod([...params], { account });

    return gasLimit;
  }
}
