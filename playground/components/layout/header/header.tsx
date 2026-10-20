import { FC } from 'react';
import Link from 'next/link';
import { LidoLogo } from '@lidofinance/lido-ui';
import {
  HeaderStyle,
  HeaderLogoStyle,
  HeaderActionsStyle,
  HeaderTitleStyle,
} from './headerStyles';
import HeaderWallet from './headerWallet';

const Header: FC = () => (
  <HeaderStyle size="full" forwardedAs="header">
    <HeaderLogoStyle>
      <Link href="/">
        <LidoLogo />
      </Link>
    </HeaderLogoStyle>
    <HeaderTitleStyle>SDK Playground</HeaderTitleStyle>
    <HeaderActionsStyle>
      <HeaderWallet />
    </HeaderActionsStyle>
  </HeaderStyle>
);

export default Header;
