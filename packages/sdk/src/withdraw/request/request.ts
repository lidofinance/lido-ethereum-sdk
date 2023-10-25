import invariant from 'tiny-invariant';

import { Logger, ErrorHandler } from '../../common/decorators/index.js';
import { NOOP } from '../../common/constants.js';
import {
  TransactionCallbackStage,
  type PerformTransactionGasLimit,
  type PerformTransactionSendTransaction,
  type TransactionResult,
} from '../../core/types.js';

import { BusModule } from '../bus-module.js';

import type {
  RequestWithPermitProps,
  RequestProps,
  SignedPermit,
} from './types.js';

export class LidoSDKWithdrawRequest extends BusModule {
  // Calls
  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestApproved(
    props: RequestProps,
  ): Promise<TransactionResult> {
    const {
      account,
      requests,
      token,
      receiver = account,
      callback = NOOP,
    } = props;
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

    return this.bus.core.performTransaction(
      {
        account,
        callback,
      },
      getGasLimit,
      sendTransaction,
    );
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async requestWithPermit(
    props: RequestWithPermitProps,
  ): Promise<TransactionResult> {
    const {
      account,
      requests,
      token,
      receiver = account,
      callback = NOOP,
      permit: permitProp,
    } = props;
    const isSteth = token === 'stETH';
    const contract = await this.bus.contract.getContractWithdrawalQueue();

    let permit: SignedPermit;
    if (permitProp) {
      permit = permitProp;
    } else {
      callback({ stage: TransactionCallbackStage.PERMIT });
      const isContract = await this.bus.core.isContract(account);
      invariant(!isContract, 'Cannot sign permit for contract');
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

    return this.bus.core.performTransaction(
      {
        account,
        callback,
      },
      getGasLimit,
      sendTransaction,
    );
  }

  // TODO
  // simulate && populate methods
}
