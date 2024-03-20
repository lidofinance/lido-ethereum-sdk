import { expect, describe, test } from '@jest/globals';
import { useWithdraw } from '../../../tests/utils/fixtures/use-withdraw.js';
import { WithdrawalWaitingTimeByRequestIdsParams } from '../types.js';

describe('withdraw waiting time', () => {
  const withdraw = useWithdraw();
  const { waitingTime } = withdraw;

  test('can get withdrawal waiting time by amount', async () => {
    const amount = 110n;
    const requestInfos = await waitingTime.getWithdrawalWaitingTimeByAmount({
      amount,
    });
    expect(typeof requestInfos.status).toEqual('string');
  });

  test('can get withdrawal waiting time by request ids', async () => {
    const requestsIds = [1234n, 1235n];

    const requestInfos = await waitingTime.getWithdrawalWaitingTimeByRequestIds(
      {
        ids: requestsIds,
      } as WithdrawalWaitingTimeByRequestIdsParams,
    );

    expect(Array.isArray(requestInfos)).toEqual(true);
    expect(requestInfos.length).toEqual(requestsIds.length);
  });
});
