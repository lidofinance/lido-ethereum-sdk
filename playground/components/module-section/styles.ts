import styled, { css } from 'styled-components';

export const ModuleSectionStyle = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.lg}px;
`;

export const ModuleHeaderStyle = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const ModuleTitleStyle = styled.h1`
  font-size: ${({ theme }) => theme.fontSizesMap.xl}px;
  font-weight: 800;
  line-height: 1.2em;
`;

export const DescriptionStyle = styled.p`
  color: var(--lido-color-textSecondary);
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
`;

export const ActionListStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const ActionGroupStyle = styled.div<{ $sticky: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  border: 1px solid var(--lido-color-border);
  border-radius: ${({ theme }) => theme.borderRadiusesMap.xl}px;

  & + & {
    margin-top: ${({ theme }) => theme.spaceMap.sm}px;
  }

  ${({ $sticky }) =>
    $sticky &&
    css`
      position: sticky;
      top: 0;
      z-index: 2;
      background: var(--lido-color-background);
      box-shadow: ${({ theme }) => theme.boxShadows.sm}
        var(--lido-color-shadowLight);
    `}

  ${({ theme }) => theme.mediaQueries.md} {
    padding: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const ActionGroupHeaderStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 ${({ theme }) => theme.spaceMap.xs}px;
`;

export const ActionGroupTitleStyle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizesMap.md}px;
  font-weight: 800;
  line-height: 1.3em;
`;

export const ActionGroupParamsStyle = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.spaceMap.md}px;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  background: var(--lido-color-foreground);
`;

export const ModulePartTitleStyle = styled.h2`
  margin-top: ${({ theme }) => theme.spaceMap.md}px;
  padding-bottom: ${({ theme }) => theme.spaceMap.xs}px;
  border-bottom: 1px solid var(--lido-color-border);
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lido-color-textSecondary);
`;
