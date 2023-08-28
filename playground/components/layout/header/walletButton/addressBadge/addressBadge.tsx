import { useBreakpoint } from '@lidofinance/lido-ui';
import { AddressBadgeStyle } from './addressBadgeStyles';
import { AddressBadgeComponent } from './types';

const AddressBadge: AddressBadgeComponent = ({ address, ...rest }) => {
  const isMobile = useBreakpoint('md');

  return (
    <AddressBadgeStyle
      symbols={isMobile ? 3 : 6}
      address={address ?? ''}
      {...rest}
    />
  );
};

export default AddressBadge;
