import styled from 'styled-components';

export const RequestsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 150px;
  overflow-y: scroll;

  & label {
    margin-bottom: 8px;
  }
`;
