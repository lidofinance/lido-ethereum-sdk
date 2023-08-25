import { collectDefaultMetrics, Registry } from 'prom-client';
import { dynamics } from 'config';
import buildInfoJson from 'build-info.json';
import { collectStartupMetrics } from '@lidofinance/api-metrics';

class Metrics {
  registry = new Registry();

  constructor() {
    this.collectStartupMetricsInit();
    collectDefaultMetrics({ prefix: '', register: this.registry });
  }

  collectStartupMetricsInit() {
    collectStartupMetrics({
      prefix: '',
      registry: this.registry,
      defaultChain: `${dynamics.defaultChain}`,
      supportedChains: dynamics.supportedChains.map((chain) => `${chain}`),
      version: '0',
      commit: buildInfoJson.commit,
      branch: buildInfoJson.branch,
    });
  }
}

export default new Metrics();
