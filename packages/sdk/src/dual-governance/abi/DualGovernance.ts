export const dualGovernanceAbi = [
  {
    inputs: [],
    name: "getConfigProvider",
    outputs: [
      {
        internalType: "contract IDualGovernanceConfigProvider",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getStateDetails",
    outputs: [
      {
        components: [
          {
            internalType: "enum State",
            name: "effectiveState",
            type: "uint8"
          },
          {
            internalType: "enum State",
            name: "persistedState",
            type: "uint8"
          },
          {
            internalType: "Timestamp",
            name: "persistedStateEnteredAt",
            type: "uint40"
          },
          {
            internalType: "Timestamp",
            name: "vetoSignallingActivatedAt",
            type: "uint40"
          },
          {
            internalType: "Timestamp",
            name: "vetoSignallingReactivationTime",
            type: "uint40"
          },
          {
            internalType: "Timestamp",
            name: "normalOrVetoCooldownExitedAt",
            type: "uint40"
          },
          {
            internalType: "uint256",
            name: "rageQuitRound",
            type: "uint256"
          },
          {
            internalType: "Duration",
            name: "vetoSignallingDuration",
            type: "uint32"
          }
        ],
        internalType: "struct IDualGovernance.StateDetails",
        name: "stateDetails",
        type: "tuple"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getVetoSignallingEscrow",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
] as const;
