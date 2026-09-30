import styled from 'styled-components';

export const BannerStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-left-width: 4px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  background: ${({ theme }) => theme.colors.warningBackground};
  color: ${({ theme }) => theme.colors.textDark};
`;

export const BannerTitleStyle = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.warning};
`;

export const BannerTextStyle = styled.p`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
`;

export const BannerActionsStyle = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;
