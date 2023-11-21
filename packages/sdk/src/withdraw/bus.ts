import { LidoSDKWithdrawContract } from './withdraw-contract.js';
import { LidoSDKWithdrawViews } from './withdraw-views.js';
import { LidoSDKWithdrawRequestsInfo } from './withdraw-requests-info.js';
import { LidoSDKWithdrawClaim } from './claim/claim.js';
import {
  LidoSDKWithdrawRequest,
  LidoSDKWithdrawApprove,
} from './request/index.js';
import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';

export class Bus extends LidoSDKModule {
  private version: string | undefined;

  private contractInstance: LidoSDKWithdrawContract | undefined;
  private viewsInstance: LidoSDKWithdrawViews | undefined;
  private requestsInfoInstance: LidoSDKWithdrawRequestsInfo | undefined;
  private approvalInstance: LidoSDKWithdrawApprove | undefined;
  private claimInstance: LidoSDKWithdrawClaim | undefined;
  private requestInstance: LidoSDKWithdrawRequest | undefined;

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
