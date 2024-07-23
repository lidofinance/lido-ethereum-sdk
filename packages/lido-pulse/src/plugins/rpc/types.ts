export type PARAMS =
  | { [key: string]: { __type: string; value: any } | string | number }
  | (string | number)[];

export type RPC_DATA = {
  id: string;
  method: string;
  jsonrpc: string;
  params: PARAMS;
};

export type RPC_RESPONSE =
  | {
      jsonrpc: string;
      result: any;
      id: string | null;
    }
  | {
      jsonrpc: string;
      error: {
        code: number;
        message: string;
        data: any;
      };
      id: string | null;
    }
  | null;
