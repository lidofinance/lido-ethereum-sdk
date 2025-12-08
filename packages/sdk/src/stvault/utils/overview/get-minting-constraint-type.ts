type GetMintingConstraintTypeArgs = {
  minimalReserve: bigint;
  collateral: bigint;
  totalMintingCapacityShares: bigint;
  vaultShareLimit: bigint;
  tierShareLimit: bigint;
  tierId: bigint;
  groupShareLimit: bigint;
  lidoTVLSharesLimit: bigint;
};

export type MintingConstraintType =
  | 'minimalReserve'
  | 'reserveRatio'
  | 'vault'
  | 'tier'
  | 'group'
  | 'lido';

export const getMintingConstraintType = ({
  minimalReserve,
  collateral,
  totalMintingCapacityShares,
  vaultShareLimit,
  tierShareLimit,
  tierId,
  groupShareLimit,
  lidoTVLSharesLimit,
}: GetMintingConstraintTypeArgs): MintingConstraintType => {
  const isDefaultTier = tierId === 0n;

  // Binding-constraint detection:
  // - totalMintingCapacityShares is the current effective capacity (RR-based and already
  //   reduced by any active caps).
  // - We compare it against raw caps (vault / tier / group / Lido) and pick the minimum to
  //   identify what actually constrains minting right now.
  // - In case of equality, we attribute the constraint to the specific cap (not RR), because
  //   ties resolve to the later entry in the list below.
  // Example: RR=100, vault=80, tier=90, group=85, Lido=120 => binding is 'vault'.
  if (minimalReserve === collateral) {
    return 'minimalReserve';
  }

  return (
    [
      {
        label: 'reserveRatio',
        value: totalMintingCapacityShares,
      },
      {
        label: 'vault',
        value: vaultShareLimit,
      },
      { label: 'tier', value: tierShareLimit },
      {
        label: 'group',
        value: isDefaultTier ? tierShareLimit : groupShareLimit, // Default tier doesn't have group cap
      },
      { label: 'lido', value: lidoTVLSharesLimit },
    ] as const
  ).reduce((acc, val) => {
    return val.value <= acc.value ? val : acc;
  }).label;
};
