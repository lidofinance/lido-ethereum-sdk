import styled, { css } from 'styled-components';

const BREAKPOINT_TWO_COLUMNS = 1100;

export const ActionCard = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
  align-items: start;
  gap: ${({ theme }) => theme.spaceMap.md}px;
  padding: ${({ theme }) => theme.spaceMap.sm}px
    ${({ theme }) => theme.spaceMap.md}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  background: var(--lido-color-foreground);
  color: var(--lido-color-text);

  @media screen and (max-width: ${BREAKPOINT_TWO_COLUMNS}px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

/** Generic padded block for custom controls placed between actions. */
export const ActionBlock = styled.div`
  padding: ${({ theme }) => theme.spaceMap.md}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  background: var(--lido-color-foreground);
`;

export const ActionMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  min-width: 0;
`;

export const ActionHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px
    ${({ theme }) => theme.spaceMap.sm}px;
`;

export const ActionTitle = styled.h4`
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  font-weight: 700;
  line-height: 1.3em;
  overflow-wrap: anywhere;
`;

export const ActionMethod = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  color: var(--lido-color-textSecondary);
`;

export const Badge = styled.span<{ $tone?: 'default' | 'warning' }>`
  padding: 1px 6px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.xs}px;
  font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
  font-weight: 700;
  line-height: 16px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--lido-color-textSecondary);
  border: 1px solid var(--lido-color-border);

  ${({ $tone }) =>
    $tone === 'warning' &&
    css`
      color: var(--lido-color-warning);
      border-color: var(--lido-color-warning);
    `}
`;

export const Controls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const RunRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  margin-top: auto;
`;

export const Hint = styled.span`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  color: var(--lido-color-textSecondary);
`;

export const ResultPanel = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;
  border: 1px solid var(--lido-color-border);
  background: var(--lido-color-background);
  overflow: hidden;
`;

export const ResultHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  min-height: 32px;
  padding: 0 ${({ theme }) => theme.spaceMap.xs}px 0
    ${({ theme }) => theme.spaceMap.sm}px;

  & + * {
    border-top: 1px solid var(--lido-color-border);
  }
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
`;

export const ResultHeaderActions = styled.div`
  display: flex;
  margin-left: auto;
  gap: 6px;
`;

export const ResultStatus = styled.span<{
  $status: 'idle' | 'loading' | 'success' | 'error';
}>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: ${({ $status }) =>
    ({
      idle: 'var(--lido-color-textSecondary)',
      loading: 'var(--lido-color-primary)',
      success: 'var(--lido-color-success)',
      error: 'var(--lido-color-error)',
    })[$status]};

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
`;

export const ResultBody = styled.div`
  flex: 1;
  max-height: 480px;
  overflow: auto;
  padding: ${({ theme }) => theme.spaceMap.sm}px;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;

  .react-json-view {
    background: transparent !important;
  }
`;

export const ResultPlaceholder = styled.div`
  margin: auto;
  padding: ${({ theme }) => theme.spaceMap.md}px;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  color: var(--lido-color-textSecondary);
  text-align: center;
`;

export const ResultCode = styled.pre`
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
`;

export const ErrorDetails = styled.details`
  margin-top: ${({ theme }) => theme.spaceMap.sm}px;

  summary {
    cursor: pointer;
    color: var(--lido-color-textSecondary);
  }

  pre {
    margin-top: ${({ theme }) => theme.spaceMap.xs}px;
    font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
    color: var(--lido-color-textSecondary);
  }
`;

export const SuccessMessage = styled.span`
  color: ${({ theme }) => theme.colors.success};
`;

export const ErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
`;
