export type SDKErrorProps = {
  code?: number | string;
  error?: unknown;
  message?: string;
};

export class SDKError extends Error {
  public code: number | string | undefined;

  public errorMessage: string | undefined;

  constructor({ code, error = {}, message }: SDKErrorProps) {
    super(message);
    Object.assign(this, error);
    this.code = code;
    this.errorMessage = message;
  }
}
