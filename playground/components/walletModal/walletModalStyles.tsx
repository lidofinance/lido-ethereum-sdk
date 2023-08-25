import { Button } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const WalletModalContentStyle = styled.div`
  background-color: var(--lido-color-background);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  padding: ${({ theme }) => theme.spaceMap.lg}px;
`;

export const WalletModalConnectedStyle = styled.div`
  display: flex;
  align-items: center;
`;

export const WalletModalConnectorStyle = styled.div`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 1.4em;
  flex-grow: 1;
  padding-right: ${({ theme }) => theme.spaceMap.md}px;
  margin: ${({ theme }) => theme.spaceMap.sm}px 0;
  margin-right: auto;
`;

export const WalletModalDisconnectStyle = styled(Button)`
  flex-shrink: 0;
`;

export const WalletModalAccountStyle = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spaceMap.sm}px 0;
`;

export const WalletModalAddressStyle = styled.div`
  margin-left: ${({ theme }) => theme.spaceMap.sm}px;
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  line-height: 1.2em;
  font-weight: 800;
`;

export const WalletModalActionsStyle = styled.div`
  margin: 0 ${({ theme }) => -theme.spaceMap.sm}px;
  margin-top: ${({ theme }) => theme.spaceMap.md}px;

  button {
    padding-left: ${({ theme }) => theme.spaceMap.sm}px;
    padding-right: ${({ theme }) => theme.spaceMap.sm}px;
    margin-right: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;
