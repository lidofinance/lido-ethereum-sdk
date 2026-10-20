import { Container } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const HeaderStyle = styled(Container)`
  padding-top: 18px;
  padding-bottom: 18px;
  display: flex;
  align-items: center;
`;

export const HeaderLogoStyle = styled.div`
  overflow: hidden;
  flex-shrink: 0;
  margin-right: ${({ theme }) => theme.spaceMap.md}px;

  ${({ theme }) => theme.mediaQueries.md} {
    width: 14px;
  }
`;

export const HeaderActionsStyle = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-shrink: 1;
  overflow: hidden;
`;

export const HeaderTitleStyle = styled.span`
  padding-left: ${({ theme }) => theme.spaceMap.md}px;
  border-left: 1px solid var(--lido-color-border);
  font-weight: 700;
  color: var(--lido-color-textSecondary);
  white-space: nowrap;

  ${({ theme }) => theme.mediaQueries.lg} {
    display: none;
  }
`;
