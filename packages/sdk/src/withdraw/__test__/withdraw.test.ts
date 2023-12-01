import { expect, describe, test } from '@jest/globals';
import {
  LIDO_CONTRACT_NAMES,
  LidoSDKCore,
  LidoSDKWithdraw,
} from '../../index.js';

import { expectSDKModule } from '../../../tests/utils/expect/expect-sdk-module.js';
import { useWithdraw } from '../../../tests/utils/fixtures/use-withdraw.js';
import { BusModule } from '../bus-module.js';
import { LidoSDKCacheable } from '../../common/class-primitives/cacheable.js';
import { useRpcCore } from '../../../tests/utils/fixtures/use-core.js';
import { expectAddress } from '../../../tests/utils/expect/expect-address.js';
import { expectContract } from '../../../tests/utils/expect/expect-contract.js';

const expectBusModule = (module: BusModule) => {
  expect(module).toBeInstanceOf(BusModule);
  expect(module).toBeInstanceOf(LidoSDKCacheable);
};

describe('withdraw test', () => {
  const withdraw = useWithdraw();
  const core = useRpcCore();
  test('is correct module', () => {
    expectSDKModule(LidoSDKWithdraw);
  });

  test('has all modules', () => {
    expect(withdraw.core).toBeInstanceOf(LidoSDKCore);
    expectBusModule(withdraw.approval);
    expectBusModule(withdraw.claim);
    expectBusModule(withdraw.contract);
    expectBusModule(withdraw.request);
    expectBusModule(withdraw.requestsInfo);
    expectBusModule(withdraw.views);
  });

  test('has correct address', async () => {
    const addressCore = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const address = await withdraw.contract.contractAddressWithdrawalQueue();
    expectAddress(addressCore, address);
  });

  test('has correct contract', async () => {
    const addressCore = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.withdrawalQueue,
    );
    const contract = await withdraw.contract.getContractWithdrawalQueue();
    expectContract(contract, addressCore);
  });

  test('has correct steth address', async () => {
    const addressCore = await core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
    const address = await withdraw.contract.contractAddressStETH();
    expectAddress(address, addressCore);
  });

  test('has correct steth contract', async () => {
    const addressCore = await core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
    const contract = await withdraw.contract.getContractStETH();
    expectContract(contract, addressCore);
  });

  test('has correct wsteth address', async () => {
    const addressCore = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    const address = await withdraw.contract.contractAddressWstETH();
    expectAddress(address, addressCore);
  });

  test('has correct wsteth contract', async () => {
    const addressCore = await core.getContractAddress(
      LIDO_CONTRACT_NAMES.wsteth,
    );
    const contract = await withdraw.contract.getContractWstETH();
    expectContract(contract, addressCore);
  });
});
