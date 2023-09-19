import { useState } from 'react';
import { Address } from 'viem';

export const useAddressState = (defaultValue: Address = '0x0') =>
  useState<Address>(defaultValue);
