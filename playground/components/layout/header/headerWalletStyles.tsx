import styled from 'styled-components';

export const HeaderWalletChainStyle = styled.span<{ $color: string }>`
  margin-right: ${({ theme }) => theme.spaceMap.xl}px;
  color: ${({ $color }) => $color};
  line-height: 1.2em;
`;
