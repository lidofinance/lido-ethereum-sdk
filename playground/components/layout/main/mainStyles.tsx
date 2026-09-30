import { Container } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const MAX_CONTENT_WIDTH = 1440;

export const MainStyle = styled(Container)`
  position: relative;
  max-width: ${MAX_CONTENT_WIDTH}px;
  margin-top: ${({ theme }) => theme.spaceMap.sm}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.xxl}px;
`;
