import { type Address } from 'viem';

import { EtherValue, TransactionResult } from '../../core/index.js';
import { NOOP } from '../../common/constants.js';
import { parseValue } from '../../common/utils/parse-value.js';
import { Logger, Cache, ErrorHandler } from '../../common/decorators/index.js';

import { Bus } from '../bus.js';
import { LidoSDKWithdrawModuleProps } from '../types.js';
import type { WithdrawableTokens, WithdrawApproveProps } from './types.js';

export class LidoSDKWithdrawApprove {
  private readonly bus: Bus;

  constructor(props: LidoSDKWithdrawModuleProps) {
    this.bus = props.bus;
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async approve(
    props: WithdrawApproveProps,
  ): Promise<TransactionResult> {
    this.bus.core.useWeb3Provider();
    const { account, token, callback = NOOP, amount: _amount } = props;
    const amount = parseValue(_amount);
    const addressWithdrawalsQueue =
      await this.bus.contract.contractAddressWithdrawalQueue();

    const isSteth = token === 'stETH';

    const contract = isSteth
      ? await this.bus.contract.getContractStETH()
      : await this.bus.contract.getContractWstETH();

    return this.bus.core.performTransaction({
      account,
      callback,
      getGasLimit: (options) =>
        contract.estimateGas.approve(
          [addressWithdrawalsQueue, amount],
          options,
        ),
      sendTransaction: (options) =>
        // weird ts error
        //@ts-expect-error
        contract.write.approve([addressWithdrawalsQueue, amount], options),
    });
  }

  // Utils

  // TODO props&return typings
  @Logger('Utils:')
  @Cache(30 * 1000, ['bus.core.chain.id'])
  public async approveGasLimit(
    amount: EtherValue,
    account: Address,
    token: WithdrawableTokens,
  ) {
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

  // TODO props&return typings
  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async getAllowance({
    account,
    token,
  }: {
    account: Address;
    token: WithdrawableTokens;
  }) {
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

  // TODO props&return typings
  @Logger('Utils:')
  @ErrorHandler('Error:')
  public async checkAllowance({
    amount: _amount,
    account,
    token,
  }: {
    amount: EtherValue;
    account: Address;
    token: WithdrawableTokens;
  }) {
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
