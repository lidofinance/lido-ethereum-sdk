import type { FC } from 'react';
import { CoreDemo } from './core';
import { StakeDemo } from './stake';
import { WrapDemo } from './wrap';
import {
  WithdrawalsRequestDemo,
  WithdrawalsViewsDemo,
  WithdrawalsClaimDemo,
  WithdrawalsContractDemo,
} from './withdrawals';
import { StethDemo, WstethDemo } from './tokens';
import { UnstethDemo } from './unsteth';
import { EventsDemo } from './events';
import { StatisticsDemo } from './statistics';
import { RewardsDemo } from './rewards';
import { ShareDemo } from './shares';
import { DualGovernanceDemo } from './dual-governance';
import { StVaultDemo } from './stvault';
import { EarnEthDemo, EarnUsdDemo } from './earn';
import { WrapL2Demo } from './l2/wrap-l2';
import { StethL2Demo, WstethL2Demo } from './l2/tokens';

/** `l1` modules work on Ethereum networks, `l2` ones on L2 networks only. */
export type DemoLayer = 'l1' | 'l2';

export type DemoModule = {
  id: string;
  title: string;
  group: string;
  layer: DemoLayer;
  Component: FC;
};

export const DEMO_MODULES: readonly DemoModule[] = [
  {
    id: 'core',
    title: 'Core',
    group: 'Core',
    layer: 'l1',
    Component: CoreDemo,
  },
  {
    id: 'statistics',
    title: 'Statistics',
    group: 'Core',
    layer: 'l1',
    Component: StatisticsDemo,
  },
  {
    id: 'events',
    title: 'Events',
    group: 'Core',
    layer: 'l1',
    Component: EventsDemo,
  },
  {
    id: 'rewards',
    title: 'Rewards',
    group: 'Core',
    layer: 'l1',
    Component: RewardsDemo,
  },

  {
    id: 'stake',
    title: 'Staking',
    group: 'Staking',
    layer: 'l1',
    Component: StakeDemo,
  },
  {
    id: 'wrap',
    title: 'Wrap',
    group: 'Staking',
    layer: 'l1',
    Component: WrapDemo,
  },
  {
    id: 'steth',
    title: 'stETH',
    group: 'Staking',
    layer: 'l1',
    Component: StethDemo,
  },
  {
    id: 'wsteth',
    title: 'wstETH',
    group: 'Staking',
    layer: 'l1',
    Component: WstethDemo,
  },
  {
    id: 'shares',
    title: 'Shares',
    group: 'Staking',
    layer: 'l1',
    Component: ShareDemo,
  },

  {
    id: 'withdrawals-request',
    title: 'Request',
    group: 'Withdrawals',
    layer: 'l1',
    Component: WithdrawalsRequestDemo,
  },
  {
    id: 'withdrawals-claim',
    title: 'Claim',
    group: 'Withdrawals',
    layer: 'l1',
    Component: WithdrawalsClaimDemo,
  },
  {
    id: 'withdrawals-views',
    title: 'Views',
    group: 'Withdrawals',
    layer: 'l1',
    Component: WithdrawalsViewsDemo,
  },
  {
    id: 'withdrawals-contract',
    title: 'Queue contract',
    group: 'Withdrawals',
    layer: 'l1',
    Component: WithdrawalsContractDemo,
  },
  {
    id: 'unsteth',
    title: 'unstETH (NFT)',
    group: 'Withdrawals',
    layer: 'l1',
    Component: UnstethDemo,
  },

  {
    id: 'stvault',
    title: 'Vault',
    group: 'stVaults',
    layer: 'l1',
    Component: StVaultDemo,
  },

  {
    id: 'earn-eth',
    title: 'Earn ETH',
    group: 'Earn',
    layer: 'l1',
    Component: EarnEthDemo,
  },
  {
    id: 'earn-usd',
    title: 'Earn USD',
    group: 'Earn',
    layer: 'l1',
    Component: EarnUsdDemo,
  },

  {
    id: 'dual-governance',
    title: 'Dual Governance',
    group: 'Governance',
    layer: 'l1',
    Component: DualGovernanceDemo,
  },

  {
    id: 'l2-wrap',
    title: 'Wrap',
    group: 'L2',
    layer: 'l2',
    Component: WrapL2Demo,
  },
  {
    id: 'l2-wsteth',
    title: 'wstETH',
    group: 'L2',
    layer: 'l2',
    Component: WstethL2Demo,
  },
  {
    id: 'l2-steth',
    title: 'stETH',
    group: 'L2',
    layer: 'l2',
    Component: StethL2Demo,
  },
];
