import { Input, Option, Select } from '@lidofinance/lido-ui';
import { formatUnits, type Address } from 'viem';
import { SuccessMessage } from 'components/action/styles';

export const SHARES_DECIMALS = 18;

type TokenSelectProps<T extends string> = {
  label?: string;
  tokens: readonly T[];
  value: T;
  onChange: (token: T) => void;
};

export const TokenSelect = <T extends string>({
  label = 'token',
  tokens,
  value,
  onChange,
}: TokenSelectProps<T>) => (
  <Select
    label={label}
    value={value}
    onChange={(token) => onChange(token as T)}
  >
    {tokens.map((token) => (
      <Option key={token} value={token}>
        {token}
      </Option>
    ))}
  </Select>
);

type QueueSelectProps = {
  queues: readonly {
    address: Address;
    token: string;
    kind: 'sync' | 'async';
  }[];
  value?: Address;
  onChange: (queue: Address) => void;
};

export const QueueSelect = ({ queues, value, onChange }: QueueSelectProps) => (
  <Select
    label="async deposit queue"
    value={value}
    onChange={(queue) => onChange(queue as Address)}
  >
    {queues.map((queue) => (
      <Option key={queue.address} value={queue.address}>
        {`${queue.token} (${queue.kind}): ${queue.address}`}
      </Option>
    ))}
  </Select>
);

type ReferralInputProps = { value: string; onChange: (value: string) => void };

export const ReferralInput = ({ value, onChange }: ReferralInputProps) => (
  <Input
    label="referral address (optional)"
    placeholder="0x0000000"
    value={value}
    onChange={(e) => onChange(e.currentTarget.value)}
  />
);

export const renderUnits =
  (decimals: number, symbol = '') =>
  (amount: bigint) => (
    <SuccessMessage>
      {formatUnits(amount, decimals)} {symbol}
    </SuccessMessage>
  );

/** Splits a comma/whitespace separated list of bytes32 proof entries. */
export const parseProof = (value: string) =>
  value
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean) as `0x${string}`[];
