import styled from 'styled-components';
import { SIDEBAR_WIDTH } from './sidebar';

export const LayoutBodyStyle = styled.div<{ $withSidebar: boolean }>`
  display: grid;
  grid-template-columns: ${({ $withSidebar }) =>
    $withSidebar ? `${SIDEBAR_WIDTH}px minmax(0, 1fr)` : 'minmax(0, 1fr)'};
  gap: ${({ theme }) => theme.spaceMap.xxl}px;
  align-items: start;

  ${({ theme }) => theme.mediaQueries.lg} {
    grid-template-columns: minmax(0, 1fr);
    gap: ${({ theme }) => theme.spaceMap.md}px;
  }
`;

export const LayoutSidebarStyle = styled.aside`
  display: contents;
`;

export const LayoutContentStyle = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;
