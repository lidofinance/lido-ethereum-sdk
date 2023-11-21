import { BlockArgumentType } from '@lidofinance/lido-ethereum-sdk';
import { Input, Select, Option, InputGroup } from '@lidofinance/lido-ui';
import { useState } from 'react';
import { NOOP } from 'utils/noop';

type BlockArgumentInputProps = {
  value: BlockArgumentType;
  onChange?: (value: BlockArgumentType) => void;
  label?: string;
};

const extractType = (value: BlockArgumentType) => {
  if (value.block !== undefined) return 'block';
  if (value.timestamp !== undefined) return 'timestamp';
  return 'block';
};

const getLabel = (type: keyof BlockArgumentType) => {
  switch (type) {
    case 'timestamp':
      return 'in seconds since epoch time';
    case 'block':
      return 'block number or tag(e.g. "latest")';
    default:
      return '';
  }
};

const getDefault = (): BlockArgumentType => ({
  block: 'latest',
});

export const DEFAULT_FROM: BlockArgumentType = {
  block: 'earliest',
};

export const useBlockArgumentState = (defaultValue?: BlockArgumentType) =>
  useState<BlockArgumentType>(defaultValue ?? getDefault);

export const BlockArgumentInput = ({
  label,
  value,
  onChange = NOOP,
}: BlockArgumentInputProps) => {
  const type = extractType(value);
  return (
    <div>
      {label && <span>{label}</span>}
      <InputGroup>
        <Select
          onChange={(updatedType) =>
            onChange({ [updatedType]: value[type] } as BlockArgumentType)
          }
          themeOverride="light"
          value={type}
        >
          <Option value={'block'}>Block</Option>
          <Option value={'timestamp'}>Timestamp</Option>
        </Select>
        <Input
          fullwidth
          label={getLabel(type)}
          value={value[type]?.toString() ?? ''}
          onChange={(event) => {
            try {
              if (!event.currentTarget.value) throw new Error('not a bigint');

              const updatedValue = BigInt(event.currentTarget.value);
              onChange({
                [type]: updatedValue,
              } as unknown as BlockArgumentType);
            } catch {
              if (type === 'block') {
                onChange({
                  [type]: event.currentTarget.value,
                } as unknown as BlockArgumentType);
              }
            }
          }}
        />
      </InputGroup>
    </div>
  );
};
