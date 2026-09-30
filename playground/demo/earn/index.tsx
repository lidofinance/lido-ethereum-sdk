import type { EarnVaultId } from '@lidofinance/lido-ethereum-sdk';
import { ModulePartTitle, ModuleSection } from 'components/module-section';
import { EarnReadsDemo } from './reads';
import { EarnTransactionsDemo } from './transactions';
import { useEarnVault } from './use-earn-vault';

const EarnVaultDemo = ({ id, title }: { id: EarnVaultId; title: string }) => {
  const info = useEarnVault(id);

  if (!info.deployment) {
    return (
      <ModuleSection
        title={title}
        description={`Earn is deployed on Ethereum mainnet only. Switch the network to use ${title}.`}
      />
    );
  }

  return (
    <ModuleSection title={title} description={`sdk.earn.${id}`}>
      <ModulePartTitle>Reads</ModulePartTitle>
      <EarnReadsDemo info={info} />
      <ModulePartTitle>Transactions</ModulePartTitle>
      <EarnTransactionsDemo info={info} />
    </ModuleSection>
  );
};

export const EarnEthDemo = () => <EarnVaultDemo id="eth" title="Earn ETH" />;
export const EarnUsdDemo = () => <EarnVaultDemo id="usd" title="Earn USD" />;
