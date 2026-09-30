import styled, { css } from 'styled-components';

export const HeaderWalletChainStyle = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: ${({ theme }) => theme.spaceMap.sm}px;
  font-weight: 700;
  line-height: 1.2em;
  white-space: nowrap;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ $color }) => $color};
  }
`;

export const HeaderChipStyle = styled.button<{ $highlighted: boolean }>`
  margin-right: ${({ theme }) => theme.spaceMap.md}px;
  padding: 4px 10px;
  border: 1px solid var(--lido-color-border);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;
  background: transparent;
  color: var(--lido-color-textSecondary);
  font: inherit;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    border-color: var(--lido-color-borderHover);
    color: var(--lido-color-text);
  }

  ${({ $highlighted }) =>
    $highlighted &&
    css`
      border-color: var(--lido-color-warning);
      color: var(--lido-color-warning);
    `}

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`;
