export const stETH = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_sharesAmount",
        type: "uint256"
      }
    ],
    name: "getPooledEthByShares",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
] as const;
