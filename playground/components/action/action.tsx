import { Button } from '@lidofinance/lido-ui';
import {
  type KeyboardEvent,
  type PropsWithChildren,
  type ReactNode,
  useReducer,
} from 'react';
import copy from 'copy-to-clipboard';
import { ToastInfo } from '@lidofinance/lido-ui';
import { type SDKError } from '@lidofinance/lido-ethereum-sdk';
import { useWeb3 } from 'reef-knot/web3-react';
import { useIsUnsupportedChain } from 'components/unsupported-chain-banner';
import {
  ActionCard,
  ActionHeader,
  ActionMain,
  ActionMethod,
  ActionTitle,
  Badge,
  Controls,
  Hint,
  ResultBody,
  ResultHeader,
  ResultHeaderActions,
  ResultPanel,
  ResultPlaceholder,
  ResultStatus,
  RunRow,
} from './styles';
import {
  defaultRenderError,
  defaultRenderResult,
  stringifyError,
  stringifyResult,
} from './render-default';

type ActionProps<TResult> = PropsWithChildren<{
  action: () => Promise<TResult> | TResult;
  title: string;
  /** SDK method being called, shown under the title, e.g. `stake.stakeEth`. */
  method?: string;
  renderResult?: (result: TResult) => React.JSX.Element;
  renderError?: (error: SDKError) => React.JSX.Element;
  walletAction?: boolean;
}>;

type Status = 'idle' | 'loading' | 'success' | 'error';

type ReducerAction<TResult> =
  | { type: 'loading' }
  | { type: 'error'; error: SDKError; duration: number }
  | { type: 'success'; result: TResult; duration: number }
  | { type: 'reset' };

type ReducerState<TResult> = {
  status: Status;
  error?: SDKError;
  result?: TResult;
  duration?: number;
};

const INITIAL_STATE = { status: 'idle' } as const;

const reducer = <TResult,>(
  state: ReducerState<TResult>,
  action: ReducerAction<TResult>,
): ReducerState<TResult> => {
  switch (action.type) {
    case 'loading':
      return { status: 'loading' };
    case 'error':
      return {
        status: 'error',
        error: action.error,
        duration: action.duration,
      };
    case 'success':
      return {
        status: 'success',
        result: action.result,
        duration: action.duration,
      };
    case 'reset':
      return INITIAL_STATE;
    default:
      return state;
  }
};

const STATUS_LABEL: Record<Status, string> = {
  idle: 'Not run yet',
  loading: 'Running…',
  success: 'Success',
  error: 'Error',
};

// Platform-neutral to keep SSR and client markup identical.
const RUN_SHORTCUT = '⌘/Ctrl + Enter';

export const Action = <TResult,>({
  action,
  title,
  method,
  walletAction = false,
  renderResult = defaultRenderResult,
  renderError = defaultRenderError,
  children,
}: ActionProps<TResult>) => {
  const { active } = useWeb3();
  const isUnsupportedChain = useIsUnsupportedChain();
  const [state, dispatch] = useReducer(
    reducer<TResult>,
    INITIAL_STATE as ReducerState<TResult>,
  );
  const { status, result, error, duration } = state;
  const disabled = walletAction && !active;

  const run = async () => {
    if (disabled || status === 'loading') return;
    dispatch({ type: 'loading' });
    const startedAt = performance.now();
    try {
      const result = await action();
      dispatch({
        type: 'success',
        result,
        duration: performance.now() - startedAt,
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: 'error',
        error: error as SDKError,
        duration: performance.now() - startedAt,
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void run();
    }
  };

  const handleCopy = () => {
    const text =
      status === 'error' && error
        ? stringifyError(error)
        : stringifyResult(result);
    copy(text);
    ToastInfo('Copied to clipboard', { position: 'bottom-center' });
  };

  let body: ReactNode = null;
  if (status === 'success') body = renderResult(result as TResult);
  if (status === 'error' && error) body = renderError(error);
  if (status === 'loading')
    body = <ResultPlaceholder>Waiting for response…</ResultPlaceholder>;

  const hasOutput = status === 'success' || status === 'error';

  return (
    <ActionCard>
      <ActionMain onKeyDown={handleKeyDown}>
        <ActionHeader>
          <ActionTitle>{title}</ActionTitle>
          {walletAction && <Badge $tone="warning">wallet</Badge>}
          {method && <ActionMethod>{method}</ActionMethod>}
        </ActionHeader>
        {children && <Controls>{children}</Controls>}
        <RunRow>
          <Button
            size="sm"
            disabled={disabled}
            loading={status === 'loading'}
            onClick={run}
          >
            Run
          </Button>
          <Hint>
            {disabled
              ? isUnsupportedChain
                ? 'Switch to a supported network to run'
                : 'Connect a wallet to run'
              : children
                ? `${RUN_SHORTCUT} to run`
                : null}
          </Hint>
        </RunRow>
      </ActionMain>

      <ResultPanel aria-live="polite">
        <ResultHeader>
          <ResultStatus $status={status}>{STATUS_LABEL[status]}</ResultStatus>
          {hasOutput && duration !== undefined && (
            <Hint>{Math.round(duration)} ms</Hint>
          )}
          {hasOutput && (
            <ResultHeaderActions>
              <Button size="xxs" variant="ghost" onClick={handleCopy}>
                Copy
              </Button>
              <Button
                size="xxs"
                variant="ghost"
                color="secondary"
                onClick={() => dispatch({ type: 'reset' })}
              >
                Clear
              </Button>
            </ResultHeaderActions>
          )}
        </ResultHeader>
        {status !== 'idle' && <ResultBody>{body}</ResultBody>}
      </ResultPanel>
    </ActionCard>
  );
};
