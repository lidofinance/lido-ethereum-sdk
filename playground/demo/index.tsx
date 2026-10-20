import { useChainId } from 'wagmi';
import { L2_CHAINS } from 'providers/web3';
import { DEMO_MODULES, type DemoLayer, type DemoModule } from './registry';

export { DEMO_MODULES, type DemoModule } from './registry';

export const useDemoLayer = (): DemoLayer =>
  L2_CHAINS.includes(useChainId()) ? 'l2' : 'l1';

/** Module to show for the given hash; falls back to the first one available on the layer. */
export const resolveDemoModule = (hash: string, layer: DemoLayer) => {
  const available = DEMO_MODULES.filter((entry) => entry.layer === layer);
  return available.find((entry) => entry.id === hash) ?? available[0];
};

type DemoProps = { module?: DemoModule };

export const Demo = ({ module: entry }: DemoProps) => {
  if (!entry) return null;
  const { Component, id } = entry;
  // key resets module state when switching between modules
  return <Component key={id} />;
};
