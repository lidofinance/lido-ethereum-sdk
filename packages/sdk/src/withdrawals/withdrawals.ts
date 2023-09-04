import { type Address, maxUint256, parseEther } from 'viem';
import invariant from 'tiny-invariant';

import { LidoSDKCore } from '../core/index.js';
import { Logger } from '../common/decorators/index.js';
import { version } from '../version.js';

import { LidoSDKWithdrawalsContract } from './withdrawalsContract.js';
import { LidoSDKWithdrawalsViews } from './withdrawalsViews.js';
import { LidoSDKWithdrawalsRequestsInfo } from './withdrawalsRequestsInfo.js';
import { LidoSDKWithdrawalsPermit } from './withdrawalsPermit.js';
import {
  type LidoSDKWithdrawalsProps,
  type RequestWithPermitProps,
  RequestCallbackStage,
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
  public async requestWithPermit(props: RequestWithPermitProps) {
    const { contract, ...rest } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    if (contract === 'stETH') await this.requestStethWithPermit(rest);
    else await this.requestWstethWithPermit(rest);
  }

  @Logger('Call:')
  public async requestStethWithPermit(
    props: Omit<RequestWithPermitProps, 'contract'>,
  ) {
    const { account, amount, requests, callback } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();

    callback?.({ stage: RequestCallbackStage.PERMIT });

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
        r: signature.r as '0x${string}',
        s: signature.s as '0x${string}',
      },
    ] as const;

    callback?.({ stage: RequestCallbackStage.SIGN });

    const transaction = await contract.write.requestWithdrawalsWithPermit(
      [...params],
      {
        account,
        chain: this.core.chain,
      },
    );

    callback?.({ stage: RequestCallbackStage.RECEIPT, payload: transaction });

    const transactionReceipt =
      await this.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback?.({
      stage: RequestCallbackStage.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback?.({ stage: RequestCallbackStage.DONE, payload: confirmations });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('Call:')
  public async requestWstethWithPermit(
    props: Omit<RequestWithPermitProps, 'contract'>,
  ) {
    const { account, amount, requests } = props;
    invariant(this.core.web3Provider, 'Web3 provider is not defined');

    const contract = await this.contract.getContractWithdrawalsQueue();

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
        r: signature.r as '0x${string}',
        s: signature.s as '0x${string}',
      },
    ] as const;

    await contract.write.requestWithdrawalsWithPermit([...params], {
      account,
      chain: this.core.chain,
    });
  }
}
