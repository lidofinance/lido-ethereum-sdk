import { Accordion } from '@lidofinance/lido-ui';
import type { EarnVaultId } from '@lidofinance/lido-ethereum-sdk';
import { EarnReadsDemo } from './reads';
import { EarnTransactionsDemo } from './transactions';
import { useEarnVault } from './use-earn-vault';

const EarnVaultDemo = ({ id, title }: { id: EarnVaultId; title: string }) => {
  const info = useEarnVault(id);

  if (!info.deployment) {
    return (
      <Accordion summary={title}>
        Earn is deployed on Ethereum mainnet only. Switch the network to use{' '}
        {title}.
      </Accordion>
    );
  }

  return (
    <>
      <EarnReadsDemo title={title} info={info} />
      <EarnTransactionsDemo title={title} info={info} />
    </>
  );
};

export const EarnDemo = () => (
  <>
    <EarnVaultDemo id="eth" title="Earn ETH" />
    <EarnVaultDemo id="usd" title="Earn USD" />
  </>
);
