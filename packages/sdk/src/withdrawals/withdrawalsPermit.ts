import { numberToHex, isHex, stringify } from 'viem';
import { splitSignature } from '@ethersproject/bytes';
import invariant from 'tiny-invariant';

import { Logger } from '../common/decorators/index.js';
import { version } from '../version.js';
import { type LidoSDKCoreProps } from '../core/index.js';

import { Bus } from './bus.js';
import {
  type PermitWstETHStETHProps,
  type PermitProps,
  type Signature,
} from './types.js';

const EIP2612_TYPE = [
  { name: 'owner', type: 'address' },
  { name: 'spender', type: 'address' },
  { name: 'value', type: 'uint256' },
  { name: 'nonce', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
];

const TYPES = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    {
      name: 'chainId',
      type: 'uint256',
    },
    {
      name: 'verifyingContract',
      type: 'address',
    },
  ],
  Permit: EIP2612_TYPE,
};

export class LidoSDKWithdrawalsPermit {
  private readonly bus: Bus;

  constructor(props: LidoSDKCoreProps & { bus?: Bus }) {
    if (props.bus) this.bus = props.bus;
    else this.bus = new Bus(props, version);
  }

  // Calls

  @Logger('Permit:')
  public async permitSignature(props: PermitProps) {
    const { token, ...rest } = props;

    if (token === 'stETH') return this.stethPermitSignature(rest);
    return this.wstethPermitSignature(rest);
  }

  @Logger('Permit:')
  public async stethPermitSignature(
    props: PermitWstETHStETHProps,
  ): Promise<Signature> {
    const { amount, account, spender, deadline } = props;
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');

    const contract = await this.bus.contract.getContractStETH();

    const [name, version, chainId, verifyingContract] =
      await contract.read.eip712Domain();
    const domain = {
      name,
      version,
      chainId: Number(chainId),
      verifyingContract,
    };
    const nonce = await contract.read.nonces([account]);

    const message = {
      owner: account,
      spender,
      value: amount.toString(),
      nonce: numberToHex(nonce),
      deadline: numberToHex(deadline),
    };
    const typedData = stringify(
      { domain, primaryType: 'Permit', types: TYPES, message },
      (_, value) => (isHex(value) ? value.toLowerCase() : value),
    );

    const signature = await this.bus.core.web3Provider.request({
      method: 'eth_signTypedData_v4',
      params: [account, typedData],
    });
    const { s, r, v } = splitSignature(signature);

    return {
      v,
      r: r as `0x${string}`,
      s: s as `0x${string}`,
      value: amount,
      deadline,
      chainId: chainId,
      nonce: message.nonce,
      owner: account,
      spender,
    };
  }

  @Logger('Permit:')
  public async wstethPermitSignature(
    props: PermitWstETHStETHProps,
  ): Promise<Signature> {
    const { amount, account, spender, deadline } = props;
    invariant(this.bus.core.web3Provider, 'Web3 provider is not defined');

    const contract = await this.bus.contract.getContractWstETH();

    const domain = {
      name: 'Wrapped liquid staked Ether 2.0',
      version: '1',
      chainId: this.bus.core.chain.id,
      verifyingContract: contract.address,
    };
    const nonce = await contract.read.nonces([account]);

    const message = {
      owner: account,
      spender,
      value: amount.toString(),
      nonce: numberToHex(nonce),
      deadline: numberToHex(deadline),
    };
    const typedData = stringify(
      { domain, primaryType: 'Permit', TYPES, message },
      (_, value) => (isHex(value) ? value.toLowerCase() : value),
    );

    const signature = await this.bus.core.web3Provider.request({
      method: 'eth_signTypedData_v4',
      params: [account, typedData],
    });
    const { s, r, v } = splitSignature(signature);

    return {
      v,
      r: r as `0x${string}`,
      s: s as `0x${string}`,
      value: amount,
      deadline,
      chainId: this.bus.core.chain.id,
      nonce: message.nonce,
      owner: account,
      spender,
    };
  }
}
