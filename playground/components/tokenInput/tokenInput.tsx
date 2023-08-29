import { Input } from '@lidofinance/lido-ui';
import MaxButton from 'components/tokenInput/maxButton';
import { TokenInputStyle } from './tokenInputStyles';
import { TokenInputComponent } from './types';

const handleWheel: React.WheelEventHandler<HTMLInputElement> = (event) => {
  event.currentTarget.blur();
};

const TokenInput: TokenInputComponent = ({ onMax, disabled, ...rest }) => {
  return (
    <TokenInputStyle>
      <Input
        fullwidth
        min={0}
        step="any"
        type="number"
        onWheel={handleWheel}
        rightDecorator={
          <MaxButton disabled={disabled} tabIndex={-1} onClick={onMax} />
        }
        disabled={disabled}
        {...rest}
      />
    </TokenInputStyle>
  );
};

export default TokenInput;
