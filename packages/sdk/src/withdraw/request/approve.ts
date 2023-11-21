import { type SimulateContractReturnType, encodeFunctionData } from 'viem';

import type {
  NoCallback,
  PopulatedTransaction,
  TransactionResult,
} from '../../core/types.js';
import { NOOP } from '../../common/constants.js';
import { parseValue } from '../../common/utils/parse-value.js';
import { Logger, Cache, ErrorHandler } from '../../common/decorators/index.js';

import type {
  CheckAllowanceProps,
  CheckAllowanceResult,
  GetAllowanceProps,
  WithdrawApproveProps,
} from './types.js';
import { BusModule } from '../bus-module.js';

export class LidoSDKWithdrawApprove extends BusModule {
  @Logger('Call:')
  @ErrorHandler()
  public async approve(
    props: WithdrawApproveProps,
  ): Promise<TransactionResult> {
    this.bus.core.useWeb3Provider();
    const { account, token, callback = NOOP, amount: _amount } = props;
    const amount = parseValue(_amount);
    const addressWithdrawalsQueue =
      await this.bus.contract.contractAddressWithdrawalQueue();

    const isSteth = token === 'stETH';

    // typing is wonky so we cast steth contract as interfaces are the same
    const contract = (
      isSteth
        ? await this.bus.contract.getContractStETH()
        : await this.bus.contract.getContractWstETH()
    ) as Awaited<ReturnType<typeof this.bus.contract.getContractStETH>>;

    return this.bus.core.performTransaction({
      account,
      callback,
      getGasLimit: (options) =>
        contract.estimateGas.approve(
          [addressWithdrawalsQueue, amount],
          options,
        ),
      sendTransaction: (options) =>
        contract.write.approve([addressWithdrawalsQueue, amount], options),
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async approveSimulateTx(
    props: NoCallback<WithdrawApproveProps>,
  ): Promise<SimulateContractReturnType> {
    const { token, account, amount: _amount } = props;
    const amount = parseValue(_amount);
    const isSteth = token === 'stETH';
    const addressWithdrawalsQueue =
      await this.bus.contract.contractAddressWithdrawalQueue();

    const contract = (
      isSteth
        ? await this.bus.contract.getContractStETH()
        : await this.bus.contract.getContractWstETH()
    ) as Awaited<ReturnType<typeof this.bus.contract.getContractStETH>>;

    const result = contract.simulate.approve(
      [addressWithdrawalsQueue, amount],
      { account },
    );

    return result;
  }

  @Logger('Views:')
  @ErrorHandler()
  public async approvePopulateTx(
    props: NoCallback<WithdrawApproveProps>,
  ): Promise<PopulatedTransaction> {
    const { token, account, amount: _amount } = props;
    const accountAddress = await this.bus.core.getWeb3Address(account);
    const amount = parseValue(_amount);
    const isSteth = token === 'stETH';

    const addressWithdrawalsQueue =
      await this.bus.contract.contractAddressWithdrawalQueue();
    const contract = (
      isSteth
        ? await this.bus.contract.getContractStETH()
        : await this.bus.contract.getContractWstETH()
    ) as Awaited<ReturnType<typeof this.bus.contract.getContractStETH>>;

    return {
      from: accountAddress,
      to: contract.address,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName: 'approve',
        args: [addressWithdrawalsQueue, amount],
      }),
    };
  }

  // Utils

  @Logger('Utils:')
  @Cache(30 * 1000, ['bus.core.chain.id'])
  public async approveGasLimit({
    account,
    token,
    amount,
  }: Required<NoCallback<WithdrawApproveProps>>): Promise<bigint> {
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
      { account: account },
    );

    return gasLimit;
  }

  @Logger('Utils:')
  @ErrorHandler()
  public async getAllowance({
    account,
    token,
  }: GetAllowanceProps): Promise<bigint> {
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
  @ErrorHandler()
  public async checkAllowance({
    amount: _amount,
    account,
    token,
  }: CheckAllowanceProps): Promise<CheckAllowanceResult> {
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
    const needsApprove = allowance < amount;

    return { allowance, needsApprove };
  }
}
