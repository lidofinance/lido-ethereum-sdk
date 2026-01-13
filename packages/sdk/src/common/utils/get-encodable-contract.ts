import { encodeFunctionData, type Abi, type Address, type Hex } from 'viem';

// copy from view internals
const getFunctionParameters = (values: unknown[]) => {
  const hasArgs = values.length > 0 && Array.isArray(values[0]);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const args = (hasArgs ? values[0]! : []) as unknown[];
  const options = ((hasArgs ? values[1] : values[0]) ?? {}) as any;
  return { args, options };
};

type ContractType = {
  address: Address;
  abi: Abi;
  read?: {
    [functionName: string]: (...args: any[]) => Promise<any>;
  };
  simulate?: {
    [functionName: string]: (...args: any[]) => Promise<any>;
  };
};

export type EncodableContract<
  TContract extends ContractType,
  TSimulate extends
    TContract['simulate'] = TContract['simulate'] extends undefined
    ? never
    : TContract['simulate'],
  TRead extends TContract['read'] = TContract['read'] extends undefined
    ? never
    : TContract['read'],
  TMethods extends TSimulate & TRead = TSimulate & TRead,
  TFunctionName extends keyof TMethods = keyof TMethods,
> = TContract & {
  prepare: {
    [K in TFunctionName]: (
      ...args: Parameters<
        TMethods[K] extends (...args: any[]) => any ? TMethods[K] : never
      >
    ) => {
      address: TContract['address'];
      abi: TContract['abi'];
      functionName: K;
      args: Parameters<
        TMethods[K] extends (...args: any[]) => any ? TMethods[K] : never
      >[0] extends readonly unknown[]
        ? Parameters<
            TMethods[K] extends (...args: any[]) => any ? TMethods[K] : never
          >[0]
        : undefined;
    };
  };
  encode: {
    [K in TFunctionName]: (
      ...args: Parameters<
        TMethods[K] extends (...args: any[]) => any ? TMethods[K] : never
      >
    ) => {
      to: TContract['address'];
      data: Hex;
      value?: bigint;
    };
  };
};

export const getEncodableContract = <TContract extends ContractType>(
  contract: TContract,
) => {
  (contract as any).prepare = new Proxy(
    {},
    {
      get(_, functionName: string) {
        return (...parameters: unknown[]) => {
          const { args } = getFunctionParameters(parameters);
          return {
            address: contract.address,
            abi: contract.abi,
            functionName,
            args,
          };
        };
      },
    },
  );
  (contract as any).encode = new Proxy(
    {},
    {
      get(_, functionName: string) {
        return (...parameters: unknown[]) => {
          const { args, options } = getFunctionParameters(parameters);
          return {
            to: contract.address,
            data: encodeFunctionData({
              abi: contract.abi,
              functionName,
              args,
            }),
            value: options.value,
          };
        };
      },
    },
  );
  return contract as EncodableContract<TContract>;
};
