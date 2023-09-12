import { Input } from '@lidofinance/lido-ui';
import MaxButton from 'components/tokenInput/maxButton';
import { TokenInputStyle } from './tokenInputStyles';
import { TokenInputComponent } from './types';
import { formatEther, maxUint256, parseEther } from 'viem';
import { useCallback, useEffect, useState } from 'react';

const handleWheel: React.WheelEventHandler<HTMLInputElement> = (event) => {
  event.currentTarget.blur();
};

const TokenInput: TokenInputComponent = ({
  maxValue,
  value,
  onChange,
  disabled,
  ...rest
}) => {
  const [stringValue, setStringValue] = useState(() =>
    value ? formatEther(value) : '',
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Support for devices where inputMode="decimal" showing keyboard with comma as decimal delimiter
      if (e.currentTarget.value.includes(',')) {
        e.currentTarget.value = e.currentTarget.value.replaceAll(',', '.');
      }

      // Prepend zero when user types just a dot symbol for "0."
      if (e.currentTarget.value === '.') {
        e.currentTarget.value = '0.';
      }

      // guards against not numbers (no matter overflow or whitespace)
      // empty whitespace is cast to 0, so not NaN
      if (isNaN(Number(e.currentTarget.value))) {
        return;
      }

      if (e.currentTarget.value.trim() === '') {
        onChange?.(null);
      }

      const value = parseEther(e.currentTarget.value);
      if (value) {
        const cappedValue = value > maxUint256 ? maxUint256 : value;
        onChange?.(cappedValue);
      }

      // we set string value anyway to allow intermediate input
      setStringValue(e.currentTarget.value);
    },
    [onChange],
  );

  useEffect(() => {
    if (!value) setStringValue('');
    else {
      const parsedValue = parseEther(stringValue);
      // only change string state if casted values differ
      // this allows user to enter 0.100 without immediate change to 0.1
      if (!parsedValue || parsedValue !== value) {
        setStringValue(formatEther(value));
      }
    }
  }, [stringValue, value]);

  const handleClickMax =
    onChange && maxValue ? () => onChange(maxValue) : undefined;
  return (
    <TokenInputStyle>
      <Input
        fullwidth
        min={0}
        step="any"
        value={stringValue}
        type="number"
        onChange={handleChange}
        onWheel={handleWheel}
        rightDecorator={
          handleClickMax && (
            <MaxButton
              disabled={disabled}
              tabIndex={-1}
              onClick={handleClickMax}
            />
          )
        }
        disabled={disabled}
        {...rest}
      />
    </TokenInputStyle>
  );
};

export default TokenInput;
