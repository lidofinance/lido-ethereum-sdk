import { LidoSDKModule } from '../common/class-primitives/sdk-module.js';
import type { LidoSDKCommonProps } from '../core/types.js';
import { LidoSDKEarnVault, type EarnVaultOptions } from './vault.js';

export type LidoSDKEarnProps = LidoSDKCommonProps & {
  vaults?: { eth?: EarnVaultOptions; usd?: EarnVaultOptions };
};

export class LidoSDKEarn extends LidoSDKModule {
  readonly eth: LidoSDKEarnVault<'eth'>;
  readonly usd: LidoSDKEarnVault<'usd'>;

  constructor(props: LidoSDKEarnProps) {
    super(props);
    this.eth = new LidoSDKEarnVault(
      { core: this.core },
      'eth',
      props.vaults?.eth,
    );
    this.usd = new LidoSDKEarnVault(
      { core: this.core },
      'usd',
      props.vaults?.usd,
    );
  }
}
