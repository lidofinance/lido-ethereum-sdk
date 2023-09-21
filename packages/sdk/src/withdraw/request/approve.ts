import { type Address } from 'viem';
import invariant from 'tiny-invariant';

import { EtherValue, type LidoSDKCoreProps } from '../../core/index.js';
import { Logger, Cache, ErrorHandler } from '../../common/decorators/index.js';
import { version } from '../../version.js';

import { Bus } from '../bus.js';
import { type ApproveProps, ApproveCallbackStages } from './types.js';
import { NOOP } from '../../common/constants.js';
import { parseValue } from '../../common/utils/parse-value.js';

export class LidoSDKWithdrawApprove {
  private readonly bus: Bus;

  constructor(props: LidoSDKCoreProps & { bus?: Bus }) {
    if (props.bus) this.bus = props.bus;
    else this.bus = new Bus(props, version);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approve(props: ApproveProps) {
    const { account } = props;
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const isContract = await this.bus.core.isContract(account);

    if (isContract) return this.approveMultisigByToken(props);
    else return this.approveByToken(props);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveEOA(props: ApproveProps) {
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    return this.approveByToken(props);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveMultisig(props: ApproveProps) {
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');

    return this.approveMultisigByToken(props);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveSteth(props: Omit<ApproveProps, 'token'>) {
    return this.approveByToken({ ...props, token: 'stETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approveWsteth(props: Omit<ApproveProps, 'token'>) {
    return this.approveByToken({ ...props, token: 'wstETH' });
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  private async approveByToken(props: ApproveProps) {
    const { account, amount: _amount, callback = NOOP, token } = props;
    const amount = parseValue(_amount);
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const isSteth = token === 'stETH';
    let tokenApproveMethod;
    let gasLimitMethod;

    const addressWithdrawalsQueue =
      await this.bus.contract.contractAddressWithdrawalQueue();
    if (isSteth) {
      tokenApproveMethod = (await this.bus.contract.getContractStETH()).write
        .approve;
      gasLimitMethod = this.approveStethGasLimit;
    } else {
      tokenApproveMethod = (await this.bus.contract.getContractWstETH()).write
        .approve;
      gasLimitMethod = this.approveWstethGasLimit;
    }

    callback({ stage: ApproveCallbackStages.GAS_LIMIT });

    const gasLimit = await gasLimitMethod.call(this, amount, account);
    const feeData = await this.bus.core.getFeeData();
    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    callback({ stage: ApproveCallbackStages.SIGN, payload: gasLimit });

    const transaction = await tokenApproveMethod.call(
      this,
      [addressWithdrawalsQueue, amount],
      { chain: this.bus.core.chain, ...overrides, gas: gasLimit },
    );

    callback({
      stage: ApproveCallbackStages.RECEIPT,
      payload: transaction,
    });

    const transactionReceipt =
      await this.bus.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    callback({
      stage: ApproveCallbackStages.CONFIRMATION,
      payload: transactionReceipt,
    });

    const confirmations =
      await this.bus.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    callback({
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
    const { account, amount: _amount, callback = NOOP, token } = props;
    const amount = parseValue(_amount);
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');

    const isSteth = token === 'stETH';
    let tokenApproveMethod;

    if (isSteth)
      tokenApproveMethod = (await this.bus.contract.getContractStETH()).write
        .approve;
    else
      tokenApproveMethod = (await this.bus.contract.getContractWstETH()).write
        .approve;

    const addressWithdrawalsQueue =
      await this.bus.contract.contractAddressWithdrawalQueue();

    callback({ stage: ApproveCallbackStages.SIGN });

    const transaction = await tokenApproveMethod.call(
      this,
      [addressWithdrawalsQueue, amount],
      { chain: this.bus.core.chain, account },
    );

    callback({
      stage: ApproveCallbackStages.MULTISIG_DONE,
    });

    return { hash: transaction };
  }

  // Utils

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async approveStethGasLimit(amount: EtherValue, account: Address) {
    return this.approveGasLimitByToken(amount, account, 'stETH');
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async approveWstethGasLimit(amount: EtherValue, account: Address) {
    return this.approveGasLimitByToken(amount, account, 'stETH');
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['bus.core.chain.id'])
  private async approveGasLimitByToken(
    amount: EtherValue,
    account: Address,
    token: 'stETH' | 'wstETH',
  ) {
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');
    const value = parseValue(amount);
    const isSteth = token === 'stETH';
    let estimateGasMethod;

    if (isSteth)
      estimateGasMethod = (await this.bus.contract.getContractStETH())
        .estimateGas.approve;
    else
      estimateGasMethod = (await this.bus.contract.getContractWstETH())
        .estimateGas.approve;

    const addressWithdrawalsQueue =
      await this.bus.contract.contractAddressWithdrawalQueue();

    const gasLimit = await estimateGasMethod.call(
      this,
      [addressWithdrawalsQueue, value],
      { account },
    );

    return gasLimit;
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async checkAllowanceSteth(amount: EtherValue, account: Address) {
    return this.checkAllowanceByToken({ amount, account, token: 'wstETH' });
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async checkAllowanceWsteth(amount: EtherValue, account: Address) {
    return this.checkAllowanceByToken({ amount, account, token: 'wstETH' });
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async getAllowanceByToken({
    account,
    token,
  }: {
    account: Address;
    token: 'stETH' | 'wstETH';
  }) {
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const isSteth = token === 'stETH';
    let allowanceMethod;

    if (isSteth)
      allowanceMethod = (await this.bus.contract.getContractStETH()).read
        .allowance;
    else
      allowanceMethod = (await this.bus.contract.getContractWstETH()).read
        .allowance;

    const addressWithdrawalsQueue =
      await this.bus.contract.contractAddressWithdrawalQueue();

    const allowance = await allowanceMethod.call(
      this,
      [account, addressWithdrawalsQueue],
      { account },
    );

    return allowance;
  }

  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async checkAllowanceByToken({
    amount: _amount,
    account,
    token,
  }: {
    amount: EtherValue;
    account: Address;
    token: 'stETH' | 'wstETH';
  }) {
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');
    const amount = parseValue(_amount);
    const isSteth = token === 'stETH';
    let allowanceMethod;

    if (isSteth)
      allowanceMethod = (await this.bus.contract.getContractStETH()).read
        .allowance;
    else
      allowanceMethod = (await this.bus.contract.getContractWstETH()).read
        .allowance;

    const addressWithdrawalsQueue =
      await this.bus.contract.contractAddressWithdrawalQueue();

    const allowance = await allowanceMethod.call(
      this,
      [account, addressWithdrawalsQueue],
      { account },
    );
    const isNeedApprove = allowance < amount;

    return { allowance, isNeedApprove };
  }
}
