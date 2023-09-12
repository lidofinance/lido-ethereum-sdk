import { type Address, Hash } from 'viem';
import invariant from 'tiny-invariant';

import { Logger, Cache, ErrorHandler } from '../../common/decorators/index.js';
import { LIDO_TOKENS, noop } from '../../common/constants.js';
import { type LidoSDKCoreProps } from '../../core/index.js';
import {
  type PermitSignature,
  TransactionCallbackStage,
  TransactionCallback,
} from '../../core/types.js';
import { version } from '../../version.js';

import { Bus } from '../bus.js';

import { type RequestWithPermitProps, type RequestProps } from './types.js';

export class LidoSDKWithdrawalsRequest {
  private readonly bus: Bus;

  constructor(props: LidoSDKCoreProps & { bus?: Bus }) {
    if (props.bus) this.bus = props.bus;
    else this.bus = new Bus(props, version);
  }

  // Calls

  @Logger('Call:')
  public async requestByToken(props: RequestWithPermitProps) {
    const { account } = props;
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const isContract = await this.bus.core.isContract(account);

    if (isContract) return this.requestMultisigByToken(props);
    else return this.requestWithPermitByToken(props);
  }

  @Logger('Call:')
  public async requestWithoutPermit(props: RequestProps) {
    const { account } = props;
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const isContract = await this.bus.core.isContract(account);

    if (isContract) return this.requestMultisigByToken(props);
    else return this.requestWithoutPermitByToken(props);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestStethWithPermit(
    props: Omit<RequestWithPermitProps, 'token'>,
  ) {
    this.requestWithPermitByToken({ ...props, token: LIDO_TOKENS.steth });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWstethWithPermit(
    props: Omit<RequestWithPermitProps, 'token'>,
  ) {
    this.requestWithPermitByToken({ ...props, token: LIDO_TOKENS.steth });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestStethWithoutPermit(props: Omit<RequestProps, 'token'>) {
    this.requestWithoutPermitByToken({ ...props, token: LIDO_TOKENS.steth });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWstethWithoutPermit(props: Omit<RequestProps, 'token'>) {
    this.requestWithoutPermitByToken({ ...props, token: LIDO_TOKENS.steth });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestStethMultisig(props: Omit<RequestProps, 'token'>) {
    return this.requestMultisigByToken({ ...props, token: LIDO_TOKENS.steth });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWstethMultisig(props: Omit<RequestProps, 'token'>) {
    return this.requestMultisigByToken({ ...props, token: LIDO_TOKENS.wsteth });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWithoutPermitByToken(props: RequestProps) {
    const { account, requests, callback = noop, token } = props;
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.bus.contract.getContractWithdrawalsQueue();

    const isSteth = token === 'stETH';
    let tokenRequestMethod;

    if (isSteth) {
      tokenRequestMethod = contract.write.requestWithdrawals;
    } else {
      tokenRequestMethod = contract.write.requestWithdrawalsWstETH;
    }

    const params = [requests, account] as const;

    callback({ stage: TransactionCallbackStage.GAS_LIMIT });

    const gasLimit = await this.requestGasLimitByToken(
      account,
      requests,
      token,
    );
    const { maxFeePerGas, maxPriorityFeePerGas } =
      await this.bus.core.getFeeData();
    const overrides = {
      account,
      maxPriorityFeePerGas,
      maxFeePerGas,
    };

    callback({ stage: TransactionCallbackStage.SIGN, payload: gasLimit });

    const transaction = await tokenRequestMethod.call(this, params, {
      ...overrides,
      gas: gasLimit,
      chain: this.bus.core.chain,
    });

    return this.waitTransactionLifecycle(transaction, callback);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWithPermitByToken(props: RequestWithPermitProps) {
    const { account, requests, callback = noop, token } = props;

    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.bus.contract.getContractWithdrawalsQueue();

    const isSteth = token === LIDO_TOKENS.steth;
    let tokenRequestMethod;

    if (isSteth) {
      tokenRequestMethod = contract.write.requestWithdrawalsWithPermit;
    } else {
      tokenRequestMethod = contract.write.requestWithdrawalsWstETHWithPermit;
    }

    callback({ stage: TransactionCallbackStage.PERMIT });

    const amount = requests.reduce((sum, request) => sum + request);
    const signature = await this.bus.core.signPermit({
      account,
      spender: contract.address,
      amount,
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

    callback({ stage: TransactionCallbackStage.GAS_LIMIT });

    const gasLimit = await this.requestWithPermitGasLimitByToken(
      account,
      signature,
      requests,
      token,
    );
    const feeData = await this.bus.core.getFeeData();
    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    callback({ stage: TransactionCallbackStage.SIGN, payload: gasLimit });

    const transaction = await tokenRequestMethod.call(this, params, {
      chain: this.bus.core.chain,
      gas: gasLimit,
      ...overrides,
    });

    return this.waitTransactionLifecycle(transaction, callback);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestMultisigByToken(props: RequestProps) {
    const { account, requests, callback = noop, token } = props;
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.bus.contract.getContractWithdrawalsQueue();

    const isSteth = token === 'stETH';
    let tokenRequestMethod;

    if (isSteth) tokenRequestMethod = contract.write.requestWithdrawals;
    else tokenRequestMethod = contract.write.requestWithdrawalsWstETH;

    callback({ stage: TransactionCallbackStage.SIGN });

    const params = [requests, account] as const;
    const transaction = await tokenRequestMethod.call(this, params, {
      account,
      chain: this.bus.core.chain,
    });

    callback({ stage: TransactionCallbackStage.MULTISIG_DONE });

    return { hash: transaction };
  }

  // Utils

  @Logger('Utils:')
  @Cache(30 * 1000, ['bus.core.chain.id'])
  private async requestWithPermitGasLimitByToken(
    account: Address,
    signature: PermitSignature,
    requests: readonly bigint[],
    token: 'stETH' | 'wstETH',
  ): Promise<bigint> {
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.bus.contract.getContractWithdrawalsQueue();

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

    const gasLimit = await tokenRequestMethod.call(this, params, {
      account,
    });

    return gasLimit;
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['bus.core.chain.id'])
  private async requestGasLimitByToken(
    account: Address,
    requests: readonly bigint[],
    token: 'stETH' | 'wstETH',
  ): Promise<bigint> {
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.bus.contract.getContractWithdrawalsQueue();

    const isSteth = token === 'stETH';
    let tokenRequestMethod;
    if (isSteth) tokenRequestMethod = contract.estimateGas.requestWithdrawals;
    else tokenRequestMethod = contract.estimateGas.requestWithdrawalsWstETH;

    const params = [requests, account] as const;
    const gasLimit = await tokenRequestMethod.call(this, params, {
      account,
    });

    return gasLimit;
  }

  @Logger('Utils:')
  private async waitTransactionLifecycle(
    transaction: Hash,
    callback: TransactionCallback = noop,
  ) {
    callback({
      stage: TransactionCallbackStage.RECEIPT,
      payload: transaction,
    });

    const transactionReceipt =
      await this.bus.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback({
      stage: TransactionCallbackStage.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.bus.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback({
      stage: TransactionCallbackStage.DONE,
      payload: confirmations,
    });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }
}
