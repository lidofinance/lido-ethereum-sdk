import { describe, expect, test } from 'vitest';
import {
  encodeAbiParameters,
  encodeEventTopics,
  getAbiItem,
  getAddress,
  zeroAddress,
  type Abi,
  type AbiEvent,
  type Address,
  type Hex,
  type TransactionReceipt,
} from 'viem';

import { StethEventsPartialAbi } from '../../stake/abi/steth.js';
import { PartialTransferEventAbi } from '../../wrap/abi/steth-partial.js';
import { PartialWithdrawalQueueEventsAbi } from '../../withdraw/abi/withdrawalQueue.js';
import {
  DashboardCreatedEventAbi,
  VaultCreatedEventAbi,
} from '../../stvault/abi/VaultFactory.js';
import { LidoSDKVaultFactory } from '../../stvault/vault-factory.js';
import type { Bus } from '../../stvault/bus.js';
import { LIDO_CONTRACT_NAMES } from '../constants.js';

import { useStake } from '../../../tests/utils/fixtures/use-stake.js';
import { useWrap } from '../../../tests/utils/fixtures/use-wrap.js';
import { useWithdraw } from '../../../tests/utils/fixtures/use-withdraw.js';
import { useL2 } from '../../../tests/utils/fixtures/use-l2.js';
import { useAccount } from '../../../tests/utils/fixtures/use-wallet-client.js';

// EIP-7708 (Glamsterdam): every ETH transfer emits an ERC-20 shaped
// `Transfer` log from SYSTEM_ADDRESS. Receipt parsers must ignore such logs
// and any other look-alike event emitted by a non-Lido contract.
const SYSTEM_ADDRESS: Address = '0xfffffffffffffffffffffffffffffffffffffffe';
const OTHER: Address = '0x00000000000000000000000000000000000000aa';
const FAKE_VALUE = 999_999n;

type Log = { address: Address; topics: Hex[]; data: Hex };

const makeLog = (
  abi: Abi,
  eventName: string,
  address: Address,
  args: Record<string, unknown>,
): Log => {
  const event = getAbiItem({ abi, name: eventName }) as AbiEvent;
  const indexedArgs = Object.fromEntries(
    event.inputs
      .filter((i) => i.indexed)
      .map((i) => [i.name, args[i.name ?? '']]),
  );
  const dataInputs = event.inputs.filter((i) => !i.indexed);
  return {
    address,
    topics: encodeEventTopics({
      abi: [event],
      eventName,
      args: indexedArgs,
    } as Parameters<typeof encodeEventTopics>[0]) as Hex[],
    data: encodeAbiParameters(
      dataInputs,
      dataInputs.map((i) => args[i.name ?? '']),
    ),
  };
};

const transfer = (
  address: Address,
  from: Address,
  to: Address,
  value: bigint,
) => makeLog(PartialTransferEventAbi, 'Transfer', address, { from, to, value });

const toReceipt = (logs: Log[]) => ({ logs }) as unknown as TransactionReceipt;

describe('receipt parsers ignore logs from foreign contracts', () => {
  const { address: user } = useAccount();

  test('stake: submit', async () => {
    const stake = useStake();
    const steth = await stake.contractAddressStETH();
    const receipt = toReceipt([
      transfer(steth, zeroAddress, user, 100n),
      makeLog(StethEventsPartialAbi, 'TransferShares', steth, {
        from: zeroAddress,
        to: user,
        sharesValue: 90n,
      }),
      transfer(SYSTEM_ADDRESS, OTHER, user, FAKE_VALUE),
      makeLog(StethEventsPartialAbi, 'TransferShares', OTHER, {
        from: zeroAddress,
        to: user,
        sharesValue: FAKE_VALUE,
      }),
    ]);

    await expect(stake['submitParseEvents'](receipt, user)).resolves.toEqual({
      stethReceived: 100n,
      sharesReceived: 90n,
    });
  });

  test('stake: fails when only foreign logs match', async () => {
    const stake = useStake();
    const receipt = toReceipt([
      transfer(SYSTEM_ADDRESS, OTHER, user, FAKE_VALUE),
    ]);

    await expect(stake['submitParseEvents'](receipt, user)).rejects.toThrow(
      'could not find Transfer event in stake transaction',
    );
  });

  test('wrap: wrapEth / wrapSteth', async () => {
    const wrap = useWrap();
    const steth = await wrap.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
    const wsteth = await wrap.contractAddressWstETH();
    const receipt = toReceipt([
      transfer(SYSTEM_ADDRESS, user, OTHER, FAKE_VALUE),
      transfer(steth, OTHER, wsteth, 100n),
      transfer(wsteth, zeroAddress, user, 80n),
      transfer(SYSTEM_ADDRESS, user, wsteth, FAKE_VALUE),
      transfer(SYSTEM_ADDRESS, OTHER, user, FAKE_VALUE),
    ]);

    await expect(wrap['wrapParseEvents'](receipt, user)).resolves.toEqual({
      stethWrapped: 100n,
      wstethReceived: 80n,
    });
  });

  test('wrap: unwrap', async () => {
    const wrap = useWrap();
    const steth = await wrap.core.getContractAddress(LIDO_CONTRACT_NAMES.lido);
    const wsteth = await wrap.contractAddressWstETH();
    const receipt = toReceipt([
      transfer(wsteth, user, zeroAddress, 80n),
      transfer(steth, wsteth, user, 100n),
      transfer(SYSTEM_ADDRESS, user, OTHER, FAKE_VALUE),
      transfer(SYSTEM_ADDRESS, OTHER, user, FAKE_VALUE),
    ]);

    await expect(wrap['unwrapParseEvents'](receipt, user)).resolves.toEqual({
      stethReceived: 100n,
      wstethUnwrapped: 80n,
    });
  });

  test('withdraw: request', async () => {
    const withdraw = useWithdraw();
    const queue = await withdraw.contract.contractAddressWithdrawalQueue();
    const requested = {
      requestId: 1n,
      requestor: user,
      owner: user,
      amountOfStETH: 100n,
      amountOfShares: 90n,
    };
    const receipt = toReceipt([
      makeLog(
        PartialWithdrawalQueueEventsAbi,
        'WithdrawalRequested',
        queue,
        requested,
      ),
      makeLog(PartialWithdrawalQueueEventsAbi, 'WithdrawalRequested', OTHER, {
        ...requested,
        requestId: 2n,
      }),
    ]);

    await expect(
      withdraw.request['decodeWithdrawEvents'](receipt),
    ).resolves.toEqual({ requests: [requested] });
  });

  test('withdraw: claim', async () => {
    const withdraw = useWithdraw();
    const queue = await withdraw.contract.contractAddressWithdrawalQueue();
    const claimed = {
      requestId: 1n,
      owner: user,
      receiver: user,
      amountOfETH: 100n,
    };
    const receipt = toReceipt([
      makeLog(
        PartialWithdrawalQueueEventsAbi,
        'WithdrawalClaimed',
        queue,
        claimed,
      ),
      makeLog(PartialWithdrawalQueueEventsAbi, 'WithdrawalClaimed', OTHER, {
        ...claimed,
        requestId: 2n,
      }),
      transfer(SYSTEM_ADDRESS, queue, user, 100n),
    ]);

    await expect(withdraw.claim['decodeClaimEvents'](receipt)).resolves.toEqual(
      { requests: [claimed] },
    );
  });

  test('stvault: createVault', async () => {
    const factoryAddress: Address =
      '0x00000000000000000000000000000000000000fa';
    const vault: Address = '0x00000000000000000000000000000000000000b1';
    const dashboard: Address = '0x00000000000000000000000000000000000000d1';
    const fakeVault: Address = '0x00000000000000000000000000000000000000b2';
    const fakeDashboard: Address = '0x00000000000000000000000000000000000000d2';
    const bus = {
      contracts: {
        getContractVaultFactory: async () => ({ address: factoryAddress }),
      },
      vaultFromAddress: (vault: Address, dashboard?: Address) => ({
        vault,
        dashboard,
      }),
    } as unknown as Bus;
    const factory = new LidoSDKVaultFactory({ bus });
    const receipt = toReceipt([
      makeLog(VaultCreatedEventAbi, 'VaultCreated', factoryAddress, { vault }),
      makeLog(DashboardCreatedEventAbi, 'DashboardCreated', factoryAddress, {
        dashboard,
        vault,
        admin: user,
      }),
      makeLog(VaultCreatedEventAbi, 'VaultCreated', OTHER, {
        vault: fakeVault,
      }),
      makeLog(DashboardCreatedEventAbi, 'DashboardCreated', OTHER, {
        dashboard: fakeDashboard,
        vault: fakeVault,
        admin: user,
      }),
    ]);

    await expect(factory['createVaultParseEvents'](receipt)).resolves.toEqual({
      vault: getAddress(vault),
      dashboard: getAddress(dashboard),
    });
  });

  test('l2: wrap wstETH to stETH', async () => {
    const l2 = useL2();
    const steth = await l2.contractAddress();
    const wsteth = await l2.wsteth.contractAddress();
    const receipt = toReceipt([
      transfer(wsteth, user, steth, 80n),
      transfer(steth, zeroAddress, user, 100n),
      transfer(SYSTEM_ADDRESS, user, OTHER, FAKE_VALUE),
      transfer(SYSTEM_ADDRESS, OTHER, user, FAKE_VALUE),
    ]);

    await expect(
      l2['wrapWstethToStethParseEvents'](receipt, user),
    ).resolves.toEqual({ stethReceived: 100n, wstethWrapped: 80n });
  });

  test('l2: unwrap stETH to wstETH', async () => {
    const l2 = useL2();
    const steth = await l2.contractAddress();
    const wsteth = await l2.wsteth.contractAddress();
    const receipt = toReceipt([
      transfer(steth, user, zeroAddress, 100n),
      transfer(wsteth, steth, user, 80n),
      transfer(SYSTEM_ADDRESS, user, OTHER, FAKE_VALUE),
      transfer(SYSTEM_ADDRESS, OTHER, user, FAKE_VALUE),
    ]);

    await expect(l2['unwrapParseEvents'](receipt, user)).resolves.toEqual({
      stethUnwrapped: 100n,
      wstethReceived: 80n,
    });
  });
});
