import { BackArgumentType } from '@lidofinance/lido-ethereum-sdk/dist/types/core/types';
import { InputGroup, Select, Input, Option } from '@lidofinance/lido-ui';
import { useState } from 'react';

type BackArgumentInputProps = {
  label?: string;
  value: BackArgumentType;
  onChange?: (value: BackArgumentType) => void;
};
const NOOP = () => {};

const extractType = (value: BackArgumentType): keyof BackArgumentType => {
  if (value['blocks'] !== undefined) return 'blocks';
  if (value['days'] !== undefined) return 'days';
  if (value['seconds'] !== undefined) return 'seconds';
  return 'blocks';
};

const getLabel = (type: keyof BackArgumentType) => {
  if (type === 'blocks') return 'blocks back';
  if (type === 'days') return 'days back';
  if (type === 'seconds') return 'seconds back';
};

const getDefault = (): BackArgumentType => ({
  blocks: BigInt(100000),
});

export const useBackArgumentState = (defaultValue?: BackArgumentType) =>
  useState<BackArgumentType>(defaultValue ?? getDefault);

export const BackArgumentInput = ({
  label,
  value,
  onChange = NOOP,
}: BackArgumentInputProps) => {
  const type = extractType(value);
  return (
    <div>
      {label && <span>{label}</span>}
      <InputGroup>
        <Select
          onChange={(updatedType) =>
            onChange({ [updatedType]: value[type] } as BackArgumentType)
          }
          themeOverride="light"
          value={type}
        >
          <Option value={'blocks'}>Blocks</Option>
          <Option value={'days'}>Days</Option>
          <Option value={'seconds'}>Seconds</Option>
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
              } as unknown as BackArgumentType);
            } catch {
              // NOOP
            }
          }}
        />
      </InputGroup>
    </div>
  );
};
