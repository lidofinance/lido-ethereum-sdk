import { LidoSDKCore } from '../core/index.js';

import { LidoSDKWithdrawContract } from './withdraw-contract.js';
import { LidoSDKWithdrawViews } from './withdraw-views.js';
import { LidoSDKWithdrawRequestsInfo } from './withdraw-requests-info.js';
import { LidoSDKWithdrawClaim } from './claim/claim.js';
import {
  LidoSDKWithdrawRequest,
  LidoSDKWithdrawApprove,
} from './request/index.js';
import { type LidoSDKWithdrawProps } from './types.js';

export class Bus {
  private version: string | undefined;

  private coreInstance: LidoSDKCore;
  private contractInstance: LidoSDKWithdrawContract | undefined;
  private viewsInstance: LidoSDKWithdrawViews | undefined;
  private requestsInfoInstance: LidoSDKWithdrawRequestsInfo | undefined;
  private approvalInstance: LidoSDKWithdrawApprove | undefined;
  private claimInstance: LidoSDKWithdrawClaim | undefined;
  private requestInstance: LidoSDKWithdrawRequest | undefined;

  constructor(props: LidoSDKWithdrawProps, version?: string) {
    this.version = version;

    if (props.core) this.coreInstance = props.core;
    else this.coreInstance = new LidoSDKCore(props, this.version);
  }

  // core

  get core(): LidoSDKCore {
    return this.coreInstance;
  }

  // Contract

  get contract(): LidoSDKWithdrawContract {
    if (!this.contractInstance) {
      this.contractInstance = new LidoSDKWithdrawContract({
        bus: this,
        version: this.version,
      });
    }
    return this.contractInstance;
  }

  // Views

  get views(): LidoSDKWithdrawViews {
    if (!this.viewsInstance) {
      this.viewsInstance = new LidoSDKWithdrawViews({
        bus: this,
        version: this.version,
      });
    }
    return this.viewsInstance;
  }

  // Requests Info

  get requestsInfo(): LidoSDKWithdrawRequestsInfo {
    if (!this.requestsInfoInstance) {
      this.requestsInfoInstance = new LidoSDKWithdrawRequestsInfo({
        bus: this,
        version: this.version,
      });
    }
    return this.requestsInfoInstance;
  }

  // Approval

  get approval(): LidoSDKWithdrawApprove {
    if (!this.approvalInstance) {
      this.approvalInstance = new LidoSDKWithdrawApprove({
        bus: this,
        version: this.version,
      });
    }
    return this.approvalInstance;
  }

  // Claim

  get claim(): LidoSDKWithdrawClaim {
    if (!this.claimInstance) {
      this.claimInstance = new LidoSDKWithdrawClaim({
        bus: this,
        version: this.version,
      });
    }
    return this.claimInstance;
  }

  // Request

  get request(): LidoSDKWithdrawRequest {
    if (!this.requestInstance) {
      this.requestInstance = new LidoSDKWithdrawRequest({
        bus: this,
        version: this.version,
      });
    }
    return this.requestInstance;
  }
}
