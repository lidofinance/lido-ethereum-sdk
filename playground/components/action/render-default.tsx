import dynamic from 'next/dynamic';
import { useThemeToggle } from '@lidofinance/lido-ui';
import type { SDKError } from '@lidofinance/lido-ethereum-sdk';
import { ErrorDetails, ErrorMessage, ResultCode } from './styles';

const ReactJSON = dynamic(() => import('react-json-view'), {
  ssr: false,
});

const bigintReplacer = (_: string, value: unknown) =>
  typeof value === 'bigint' ? value.toString() : value;

/** Serializes any action result for display and clipboard (bigint-safe). */
export const stringifyResult = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'bigint') return value.toString();
  if (value === undefined) return 'undefined';
  return JSON.stringify(value, bigintReplacer, 2);
};

export const stringifyError = (error: SDKError): string => {
  const code = error.code ?? error.name;
  const message = error.errorMessage ?? error.message;
  return [code, message].filter(Boolean).join(': ');
};

const JsonResult = ({ value }: { value: unknown }) => {
  const { themeName } = useThemeToggle();

  if (value === null || typeof value !== 'object') {
    return <ResultCode>{stringifyResult(value)}</ResultCode>;
  }

  return (
    <ReactJSON
      theme={themeName === 'dark' ? 'ocean' : 'rjv-default'}
      name={null}
      src={JSON.parse(stringifyResult(value))}
      collapsed={2}
      displayDataTypes={false}
      displayObjectSize
      enableClipboard
      collapseStringsAfterLength={80}
    />
  );
};

export const defaultRenderResult = <TResult,>(result: TResult) => (
  <JsonResult value={result} />
);

export const defaultRenderError = (error: SDKError) => {
  const code = error.code ?? error.name;
  const message = error.errorMessage ?? error.message;
  const cause = (error as { cause?: unknown }).cause;
  const details = [
    cause !== undefined && `cause: ${stringifyResult(cause)}`,
    error.stack,
  ]
    .filter(Boolean)
    .join('\n\n');

  return (
    <>
      <ErrorMessage>
        <ResultCode>
          {code && <strong>{code}</strong>}
          {code && message ? '\n' : ''}
          {message}
        </ResultCode>
      </ErrorMessage>
      {details && (
        <ErrorDetails>
          <summary>Details</summary>
          <ResultCode>{details}</ResultCode>
        </ErrorDetails>
      )}
    </>
  );
};
