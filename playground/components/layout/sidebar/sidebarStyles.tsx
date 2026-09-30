import styled, { css } from 'styled-components';

export const SIDEBAR_WIDTH = 232;

export const SidebarStyle = styled.nav<{ $expanded: boolean }>`
  position: sticky;
  top: ${({ theme }) => theme.spaceMap.md}px;
  align-self: start;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
  max-height: calc(100vh - ${({ theme }) => theme.spaceMap.md * 2}px);
  overflow-y: auto;
  padding-right: ${({ theme }) => theme.spaceMap.xs}px;

  ${({ theme }) => theme.mediaQueries.lg} {
    position: static;
    max-height: none;
    padding: ${({ theme }) => theme.spaceMap.sm}px;
    border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
    background: var(--lido-color-foreground);

    & > *:not(:first-child) {
      display: ${({ $expanded }) => ($expanded ? undefined : 'none')};
    }
  }
`;

export const SidebarToggleStyle = styled.button`
  display: none;

  ${({ theme }) => theme.mediaQueries.lg} {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: ${({ theme }) => theme.spaceMap.sm}px;
    border: 0;
    background: transparent;
    color: var(--lido-color-text);
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
`;

export const SidebarGroupStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SidebarGroupTitleStyle = styled.div`
  padding: 0 ${({ theme }) => theme.spaceMap.sm}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.xs}px;
  font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lido-color-textSecondary);
`;

export const SidebarLinkStyle = styled.a<{
  $active: boolean;
  $disabled: boolean;
}>`
  display: block;
  padding: 6px ${({ theme }) => theme.spaceMap.sm}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  line-height: 20px;
  text-decoration: none;
  transition: background ${({ theme }) => theme.duration.fast};

  &,
  &:visited {
    color: var(--lido-color-text);
  }

  &:hover {
    color: var(--lido-color-text);
    background: ${({ theme }) => theme.colors.backgroundDarken};
  }

  ${({ $active }) =>
    $active &&
    css`
      &,
      &:visited,
      &:hover {
        color: var(--lido-color-primaryContrast);
        background: var(--lido-color-primary);
      }
    `}

  ${({ $disabled }) =>
    $disabled &&
    css`
      &,
      &:visited,
      &:hover {
        color: var(--lido-color-textSecondary);
        background: transparent;
        opacity: 0.5;
        cursor: not-allowed;
      }
    `}
`;

export const SidebarEmptyStyle = styled.div`
  padding: 0 ${({ theme }) => theme.spaceMap.sm}px;
  color: var(--lido-color-textSecondary);
`;
