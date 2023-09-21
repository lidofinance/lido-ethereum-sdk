import { LidoSDKCore } from '../core/index.js';

import { LidoSDKWithdrawContract } from './withdrawContract.js';
import { LidoSDKWithdrawViews } from './withdrawViews.js';
import { LidoSDKWithdrawRequestsInfo } from './withdrawRequestsInfo.js';
import { LidoSDKWithdrawClaim } from './claim/claim.js';
import {
  LidoSDKWithdrawRequest,
  LidoSDKWithdrawApprove,
} from './request/index.js';
import { type LidoSDKWithdrawProps } from './types.js';

export class Bus {
  private props: LidoSDKWithdrawProps;
  private version: string | undefined;

  private coreInstance: LidoSDKCore | undefined;
  private contractInstance: LidoSDKWithdrawContract | undefined;
  private viewsInstance: LidoSDKWithdrawViews | undefined;
  private requestsInfoInstance: LidoSDKWithdrawRequestsInfo | undefined;
  private approvalInstance: LidoSDKWithdrawApprove | undefined;
  private claimInstance: LidoSDKWithdrawClaim | undefined;
  private requestInstance: LidoSDKWithdrawRequest | undefined;

  constructor(props: LidoSDKWithdrawProps, version?: string) {
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

  get contract(): LidoSDKWithdrawContract {
    if (!this.contractInstance) {
      this.contractInstance = new LidoSDKWithdrawContract({
        ...this.props,
        bus: this,
      });
      return this.contractInstance;
    }
    return this.contractInstance;
  }

  set contract(contract: LidoSDKWithdrawContract) {
    this.contractInstance = contract;
  }

  // Views

  get views(): LidoSDKWithdrawViews {
    if (!this.viewsInstance) {
      this.viewsInstance = new LidoSDKWithdrawViews({
        ...this.props,
        bus: this,
      });
      return this.viewsInstance;
    }
    return this.viewsInstance;
  }

  set views(views: LidoSDKWithdrawViews) {
    this.viewsInstance = views;
  }

  // Requests Info

  get requestsInfo(): LidoSDKWithdrawRequestsInfo {
    if (!this.requestsInfoInstance) {
      this.requestsInfoInstance = new LidoSDKWithdrawRequestsInfo({
        ...this.props,
        bus: this,
      });
      return this.requestsInfoInstance;
    }
    return this.requestsInfoInstance;
  }

  set requestsInfo(requestsInfo: LidoSDKWithdrawRequestsInfo) {
    this.requestsInfoInstance = requestsInfo;
  }

  // Approval

  get approval(): LidoSDKWithdrawApprove {
    if (!this.approvalInstance) {
      this.approvalInstance = new LidoSDKWithdrawApprove({
        ...this.props,
        bus: this,
      });
      return this.approvalInstance;
    }
    return this.approvalInstance;
  }

  set approval(approve: LidoSDKWithdrawApprove) {
    this.approvalInstance = approve;
  }

  // Claim

  get claim(): LidoSDKWithdrawClaim {
    if (!this.claimInstance) {
      this.claimInstance = new LidoSDKWithdrawClaim({
        ...this.props,
        bus: this,
      });
      return this.claimInstance;
    }
    return this.claimInstance;
  }

  set claim(approve: LidoSDKWithdrawClaim) {
    this.claimInstance = approve;
  }

  // Request

  get request(): LidoSDKWithdrawRequest {
    if (!this.requestInstance) {
      this.requestInstance = new LidoSDKWithdrawRequest({
        ...this.props,
        bus: this,
      });
      return this.requestInstance;
    }
    return this.requestInstance;
  }

  set request(approve: LidoSDKWithdrawRequest) {
    this.requestInstance = approve;
  }
}
