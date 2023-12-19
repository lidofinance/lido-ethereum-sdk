import { describe, expect, test } from '@jest/globals';
import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import { LidoSDKUnstETH } from '../unsteth.js';
import { useUnsteth } from '../../../tests/utils/fixtures/use-unsteth.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { LIDO_CONTRACT_NAMES } from '../../index.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectNonNegativeBn } from '../../../tests/utils/expect/expect-bn.js';

describe('unsteth', () => {
  const unsteth = useUnsteth();
  const core = useRpcCore();

  test('is correct module', () => {
    expectSDKModule(LidoSDKUnstETH);
  });

  test('has address', async () => {
    const address = await unsteth.contractAddress();
    expectAddress(
      address,
      await core.getContractAddress(LIDO_CONTRACT_NAMES.withdrawalQueue),
    );
  });

  test('has contract', async () => {
    const contract = await unsteth.getContract();
    expectContract(
      contract,
      await core.getContractAddress(LIDO_CONTRACT_NAMES.withdrawalQueue),
    );
  });

  test('has metadata', async () => {
    const metadata = await unsteth.getContractMetadata();
    expect(metadata).toHaveProperty('name');
    expect(metadata).toHaveProperty('symbol');
    expect(metadata).toHaveProperty('baseURI');
    expectNonNegativeBn(metadata.version);
  });

  test('has token metadata uri', async () => {
    const tokenMetadataURI = await unsteth.getTokenMetadataURI(1n);
    expect(tokenMetadataURI).toBeTruthy();

    const metadata = await fetch(tokenMetadataURI).then((r) => r.json());
    expect(typeof metadata).toBe('object');
  });
});
