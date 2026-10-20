import styled from 'styled-components';

export const Controls = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spaceMap.md}px;

  & > * {
    flex: 1 1 0;
    min-width: 0;
  }
`;

export const StyledBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.lg}px;
  width: 100%;
`;
