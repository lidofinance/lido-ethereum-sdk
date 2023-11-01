export const calcShareRate = (
  totalEther: bigint,
  totalShares: bigint,
  precision: bigint,
): number => Number((totalEther * precision) / totalShares) / Number(precision);

export const sharesToSteth = (
  shares: bigint,
  totalEther: bigint,
  totalShares: bigint,
  precision: bigint,
): bigint => (shares * totalEther * precision) / (totalShares * precision);

export const requestWithBlockStep = async <TResultEntry>(
  step: number,
  fromBlock: bigint,
  toBlock: bigint,
  request: (fromBlock: bigint, toBlock: bigint) => Promise<TResultEntry[]>,
): Promise<TResultEntry[]> => {
  let from = fromBlock;
  const result: TResultEntry[] = [];
  while (from <= toBlock) {
    const to = from + BigInt(step);
    const nextResult = await request(from, to > toBlock ? toBlock : to);
    result.push(...nextResult);
    from = to + 1n;
  }
  return result;
};
