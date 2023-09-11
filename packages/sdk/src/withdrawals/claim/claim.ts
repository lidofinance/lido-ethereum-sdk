import invariant from 'tiny-invariant';

import { type LidoSDKCoreProps } from '../../core/index.js';
import { Logger, Cache, ErrorHandler } from '../../common/decorators/index.js';
import { version } from '../../version.js';

import { Bus } from '../bus.js';

import { ClaimRequestsProps } from './types.js';

export class Claim {
  private readonly bus: Bus;

  constructor(props: LidoSDKCoreProps & { bus?: Bus }) {
    if (props.bus) this.bus = props.bus;
    else this.bus = new Bus(props, version);
  }

  // Calls

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async claimRequests(props: ClaimRequestsProps) {
    const { account } = props;
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const isContract = await this.bus.core.isContract(account);

    if (isContract) return this.claimRequestsMultisig(props);
    else return this.claimRequestsEOA(props);
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async claimRequestsEOA(props: ClaimRequestsProps) {
    const { account, requestsIds, hints } = props;

    const contract = await this.bus.contract.getContractWithdrawalsQueue();

    const feeData = await this.bus.core.getFeeData();
    const gasLimit = await this.claimGasLimit(props);
    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const params = [requestsIds, hints] as const;
    const transaction = await contract.write.claimWithdrawals(params, {
      ...overrides,
      gas: gasLimit,
      chain: this.bus.core.chain,
    });

    const transactionReceipt =
      await this.bus.core.rpcProvider.waitForTransactionReceipt({
        hash: transaction,
      });

    const confirmations =
      await this.bus.core.rpcProvider.getTransactionConfirmations({
        hash: transactionReceipt.transactionHash,
      });

    return { hash: transaction, receipt: transactionReceipt, confirmations };
  }

  @Logger('Call:')
  @ErrorHandler('Error:')
  public async claimRequestsMultisig(props: ClaimRequestsProps) {
    const { account, requestsIds, hints } = props;

    const contract = await this.bus.contract.getContractWithdrawalsQueue();

    const feeData = await this.bus.core.getFeeData();
    const gasLimit = await this.claimGasLimit(props);
    const overrides = {
      account,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
      maxFeePerGas: feeData.maxFeePerGas ?? undefined,
    };

    const params = [requestsIds, hints] as const;
    const transaction = await contract.write.claimWithdrawals(params, {
      ...overrides,
      gas: gasLimit,
      chain: this.bus.core.chain,
    });

    return { hash: transaction };
  }

  @Logger('Utils:')
  @Cache(30 * 1000, ['core.chain.id'])
  private async claimGasLimit(props: ClaimRequestsProps): Promise<bigint> {
    const { account, requestsIds, hints } = props;
    invariant(this.bus.core.rpcProvider, 'RPC provider is not defined');

    const contract = await this.bus.contract.getContractWithdrawalsQueue();

    const params = [requestsIds, hints] as const;
    const gasLimit = await contract.estimateGas.claimWithdrawals(params, {
      account,
    });

    return gasLimit;
  }
}
