type ERROR_CODE =
  | 'INVALID_ARGUMENT'
  | 'NOT_SUPPORTED'
  | 'PROVIDER_ERROR'
  | 'READ_ERROR'
  | 'TRANSACTION_ERROR'
  | 'UNKNOWN_ERROR';

export type SDKErrorProps = {
  code?: ERROR_CODE;
  error?: unknown;
  message?: string;
};

export class SDKError extends Error {
  public static from(
    error: unknown,
    code: ERROR_CODE = 'UNKNOWN_ERROR',
  ): SDKError {
    if (error instanceof SDKError) return error;
    return new SDKError({
      code,
      error,
      message:
        typeof error === 'object' &&
        error &&
        'message' in error &&
        typeof error.message === 'string'
          ? error.message
          : 'something went wrong',
    });
  }

  public code: ERROR_CODE;

  public errorMessage: string | undefined;

  constructor({ code, error = {}, message }: SDKErrorProps) {
    super(message);
    Object.assign(this, error);
    this.code = code ?? 'UNKNOWN_ERROR';
    this.errorMessage = message;
  }
}
// invariant that throws SDK ERROR
export function invariant(
  condition: any,
  message: string,
  code: ERROR_CODE = 'UNKNOWN_ERROR',
): asserts condition {
  if (condition) return;

  throw new SDKError({ code, message });
}

// shortcut for argument error
export function invariantArgument(
  condition: any,
  message: string,
): asserts condition {
  if (condition) return;

  throw new SDKError({ code: 'INVALID_ARGUMENT', message });
}

export async function withSdkError<TResult>(
  func: Promise<TResult>,
  code?: ERROR_CODE,
): Promise<TResult> {
  try {
    return await func;
  } catch (error) {
    throw SDKError.from(error, code);
  }
}
