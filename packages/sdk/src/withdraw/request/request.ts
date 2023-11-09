import { Logger, ErrorHandler } from '../../common/decorators/index.js';
import { NOOP } from '../../common/constants.js';
import {
  TransactionCallbackStage,
  type PerformTransactionGasLimit,
  type PerformTransactionSendTransaction,
  type TransactionResult,
  NoCallback,
  PopulatedTransaction,
} from '../../core/types.js';

import { BusModule } from '../bus-module.js';

import type {
  RequestWithPermitProps,
  RequestProps,
  SignedPermit,
  SplitAmountToRequestsProps,
  RequirePermit,
} from './types.js';
import {
  invariant,
  invariantArgument,
  ERROR_CODE,
} from '../../common/utils/sdk-error.js';
import {
  SimulateContractReturnType,
  encodeFunctionData,
  formatEther,
} from 'viem';
import { parseValue } from '../../common/utils/parse-value.js';

export class LidoSDKWithdrawRequest extends BusModule {
  @Logger('Views:')
  public async splitAmountToRequests({
    amount: _amount,
    token,
  }: SplitAmountToRequestsProps): Promise<Array<bigint>> {
    const amount = parseValue(_amount);
    const isSteth = token === 'stETH';
    const [min, max] = await Promise.all([
      isSteth
        ? this.bus.views.minStethWithdrawalAmount()
        : this.bus.views.minWStethWithdrawalAmount(),
      isSteth
        ? this.bus.views.maxStethWithdrawalAmount()
        : this.bus.views.maxWStethWithdrawalAmount(),
    ]);
    invariantArgument(
      amount >= min,
      `Amount is less than minimal withdrawable amount allowed(${formatEther(
        min,
      )} ${token})`,
    );

    const rest = amount % max;
    const requestCount = amount / max;

    const result = Array.from<bigint>({ length: Number(requestCount) }).fill(
      max,
    );
    if (rest > 0n) {
      invariantArgument(
        rest >= min,
        `Amount cannot be split, as last request would be less than minimal withdrawable amount allowed(${formatEther(
          min,
        )} ${token})`,
      );
      result.push(rest);
    }
    return result;
  }

  // Calls
  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWithdrawal(
    props: RequestProps,
  ): Promise<TransactionResult> {
    const accountAddress = await this.bus.core.getWeb3Address(props.account);
    const {
      account,
      token,
      receiver = accountAddress,
      callback = NOOP,
    } = props;

    const requests =
      props.requests ?? (await this.splitAmountToRequests(props));
    const isSteth = token === 'stETH';
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    const getGasLimit: PerformTransactionGasLimit = (options) =>
      isSteth
        ? contract.estimateGas.requestWithdrawals([requests, receiver], options)
        : contract.estimateGas.requestWithdrawalsWstETH(
            [requests, receiver],
            options,
          );
    const sendTransaction: PerformTransactionSendTransaction = (options) =>
      isSteth
        ? contract.write.requestWithdrawals([requests, receiver], options)
        : contract.write.requestWithdrawalsWstETH(
            [requests, receiver],
            options,
          );

    return this.bus.core.performTransaction({
      account,
      callback,
      getGasLimit,
      sendTransaction,
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async requestWithdrawalSimulateTx(
    props: NoCallback<RequestProps>,
  ): Promise<SimulateContractReturnType> {
    const accountAddress = await this.bus.core.getWeb3Address(props.account);
    const {
      token,
      account,
      receiver = accountAddress,
      amount = 0n,
      requests: _requests,
    } = props;
    const requests =
      _requests ?? (await this.splitAmountToRequests({ amount, token }));
    const isSteth = token === 'stETH';
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    const args = [requests, receiver] as const;
    const result = await (isSteth
      ? contract.simulate.requestWithdrawals(args, { account })
      : contract.simulate.requestWithdrawalsWstETH(args, { account }));

    return result;
  }

  @Logger('Views:')
  @ErrorHandler()
  public async requestWithdrawalPopulateTx(
    props: NoCallback<RequestWithPermitProps>,
  ): Promise<PopulatedTransaction> {
    const accountAddress = await this.bus.core.getWeb3Address(props.account);
    const {
      token,
      receiver = accountAddress,
      amount = 0n,
      requests: _requests,
    } = props;
    const requests =
      _requests ?? (await this.splitAmountToRequests({ amount, token }));
    const isSteth = token === 'stETH';
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    const args = [requests, receiver] as const;
    const functionName = isSteth
      ? 'requestWithdrawals'
      : ('requestWithdrawalsWstETH' as const);

    return {
      from: accountAddress,
      to: contract.address,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName,
        args,
      }),
    };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWithdrawalWithPermit(
    props: RequestWithPermitProps,
  ): Promise<TransactionResult> {
    const accountAddress = await this.bus.core.getWeb3Address(props.account);
    const {
      account,
      token,
      receiver = accountAddress,
      callback = NOOP,
      permit: permitProp,
    } = props;
    const requests =
      props.requests ?? (await this.splitAmountToRequests(props));
    const isSteth = token === 'stETH';
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    let permit: SignedPermit;
    if (permitProp) {
      permit = permitProp;
    } else {
      callback({ stage: TransactionCallbackStage.PERMIT });
      const isContract = await this.bus.core.isContract(accountAddress);
      invariant(
        !isContract,
        'Cannot sign permit for contract',
        ERROR_CODE.NOT_SUPPORTED,
      );
      const amount = requests.reduce((sum, request) => sum + request);
      const signature = await this.bus.core.signPermit({
        account,
        spender: contract.address,
        amount,
        token,
      });
      permit = {
        deadline: signature.deadline,
        value: signature.value,
        r: signature.r,
        v: signature.v,
        s: signature.s,
      };
    }

    const getGasLimit: PerformTransactionGasLimit = (options) =>
      isSteth
        ? contract.estimateGas.requestWithdrawalsWithPermit(
            [requests, receiver, permit],
            options,
          )
        : contract.estimateGas.requestWithdrawalsWstETHWithPermit(
            [requests, receiver, permit],
            options,
          );
    const sendTransaction: PerformTransactionSendTransaction = (options) =>
      isSteth
        ? contract.write.requestWithdrawalsWithPermit(
            [requests, receiver, permit],
            options,
          )
        : contract.write.requestWithdrawalsWstETHWithPermit(
            [requests, receiver, permit],
            options,
          );

    return this.bus.core.performTransaction({
      account,
      callback,
      getGasLimit,
      sendTransaction,
    });
  }

  @Logger('Views:')
  @ErrorHandler()
  public async requestWithdrawalWithPermitSimulateTx(
    props: NoCallback<RequirePermit<RequestWithPermitProps>>,
  ): Promise<SimulateContractReturnType> {
    const accountAddress = await this.bus.core.getWeb3Address(props.account);
    const {
      token,
      account,
      receiver = accountAddress,
      permit,
      amount = 0n,
      requests: _requests,
    } = props;
    const requests =
      _requests ?? (await this.splitAmountToRequests({ amount, token }));
    const isSteth = token === 'stETH';
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    const args = [requests, receiver, permit] as const;
    const result = await (isSteth
      ? contract.simulate.requestWithdrawalsWithPermit(args, { account })
      : contract.simulate.requestWithdrawalsWstETHWithPermit(args, {
          account,
        }));

    return result;
  }

  @Logger('Views:')
  @ErrorHandler()
  public async requestWithdrawalWithPermitPopulateTx(
    props: NoCallback<RequirePermit<RequestWithPermitProps>>,
  ): Promise<PopulatedTransaction> {
    const accountAddress = await this.bus.core.getWeb3Address(props.account);
    const {
      token,
      receiver = accountAddress,
      permit,
      amount = 0n,
      requests: _requests,
    } = props;
    const requests =
      _requests ?? (await this.splitAmountToRequests({ amount, token }));
    const isSteth = token === 'stETH';
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    const args = [requests, receiver, permit] as const;
    const functionName = isSteth
      ? 'requestWithdrawalsWithPermit'
      : ('requestWithdrawalsWstETHWithPermit' as const);

    return {
      from: accountAddress,
      to: contract.address,
      data: encodeFunctionData({
        abi: contract.abi,
        functionName,
        args,
      }),
    };
  }
}
