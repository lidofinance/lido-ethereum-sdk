import { LidoSDKCore } from '../core/index.js';

import { LidoSDKWithdrawalsContract } from './withdrawalsContract.js';
import { LidoSDKWithdrawalsViews } from './withdrawalsViews.js';
import { LidoSDKWithdrawalsRequestsInfo } from './withdrawalsRequestsInfo.js';
import { LidoSDKWithdrawalsApprove } from './withdrawalsApprove.js';
import { type LidoSDKWithdrawalsProps } from './types.js';

export class Bus {
  props: LidoSDKWithdrawalsProps;
  version: string | undefined;

  coreInstance: LidoSDKCore | undefined;
  contractInstance: LidoSDKWithdrawalsContract | undefined;
  viewsInstance: LidoSDKWithdrawalsViews | undefined;
  requestsInfoInstance: LidoSDKWithdrawalsRequestsInfo | undefined;
  approvalInstance: LidoSDKWithdrawalsApprove | undefined;

  constructor(props: LidoSDKWithdrawalsProps, version?: string) {
    this.props = props;
    this.version = version;

    if (props.core) this.core = props.core;
  }

  // core

  get core(): LidoSDKCore {
    if (!this.coreInstance) {
      this.coreInstance = new LidoSDKCore(this.props, this.version);
      return this.coreInstance;
    }
    return this.coreInstance;
  }

  set core(core: LidoSDKCore) {
    this.coreInstance = core;
  }

  // Contract

  get contract(): LidoSDKWithdrawalsContract {
    if (!this.contractInstance) {
      this.contractInstance = new LidoSDKWithdrawalsContract({
        ...this.props,
        bus: this,
      });
      return this.contractInstance;
    }
    return this.contractInstance;
  }

  set contract(contract: LidoSDKWithdrawalsContract) {
    this.contractInstance = contract;
  }

  // Views

  get views(): LidoSDKWithdrawalsViews {
    if (!this.viewsInstance) {
      this.viewsInstance = new LidoSDKWithdrawalsViews({
        ...this.props,
        bus: this,
      });
      return this.viewsInstance;
    }
    return this.viewsInstance;
  }

  set views(views: LidoSDKWithdrawalsViews) {
    this.viewsInstance = views;
  }

  // Requests Info

  get requestsInfo(): LidoSDKWithdrawalsRequestsInfo {
    if (!this.requestsInfoInstance) {
      this.requestsInfoInstance = new LidoSDKWithdrawalsRequestsInfo({
        ...this.props,
        bus: this,
      });
      return this.requestsInfoInstance;
    }
    return this.requestsInfoInstance;
  }

  set requestsInfo(requestsInfo: LidoSDKWithdrawalsRequestsInfo) {
    this.requestsInfoInstance = requestsInfo;
  }

  // Approval

  get approval(): LidoSDKWithdrawalsApprove {
    if (!this.approvalInstance) {
      this.approvalInstance = new LidoSDKWithdrawalsApprove({
        ...this.props,
        bus: this,
      });
      return this.approvalInstance;
    }
    return this.approvalInstance;
  }

  set approval(approve: LidoSDKWithdrawalsApprove) {
    this.approvalInstance = approve;
  }
}
