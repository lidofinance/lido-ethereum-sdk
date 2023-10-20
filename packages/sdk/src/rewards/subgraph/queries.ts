import { gql } from 'graphql-request';

export const LidoTransfersQuery = gql`
  query LidoTransfers(
    $skip: Int
    $first: Int!
    $fromBlock: Int!
    $toBlock: Int!
    $address: Bytes!
  ) {
    lidoTransfers(
      first: $first
      skip: $skip
      where: {
        and: [
          { or: [{ to: $address }, { from: $address }] }
          { _change_block: { number_gte: $fromBlock } }
        ]
      }
      block: { number: $toBlock }
    ) {
      from
      to
      value

      shares
      sharesBeforeDecrease
      sharesAfterDecrease
      sharesBeforeIncrease
      sharesAfterIncrease

      totalPooledEther
      totalShares

      balanceAfterDecrease
      balanceAfterIncrease

      block
      blockTime
      transactionHash
      transactionIndex
      logIndex
    }
  }
`;

export const TotalRewardsQuery = gql`
  query TotalRewards(
    $skip: Int
    $first: Int!
    $fromBlock: Int!
    $toBlock: Int!
  ) {
    totalRewards(
      first: $first
      skip: $skip
      where: { _change_block: { number_gte: $fromBlock } }
      block: { number: $toBlock }
    ) {
      id

      totalPooledEtherBefore
      totalPooledEtherAfter
      totalSharesBefore
      totalSharesAfter

      apr

      block
      blockTime
      logIndex
    }
  }
`;

export const StatusQuery = gql`
  query {
    _meta {
      block {
        number
        hash
      }
    }
  }
`;

export const InitialStateQuery = gql`
  query BalanceBefore($address: Bytes!, $block: Int!) {
    lidoTransfers(
      first: 1
      skip: 0
      orderBy: block
      orderDirection: desc
      where: { or: [{ to: $address }, { from: $address }] }
      block: { number: $block }
    ) {
      from
      to
      value

      shares
      sharesBeforeDecrease
      sharesAfterDecrease
      sharesBeforeIncrease
      sharesAfterIncrease

      totalPooledEther
      totalShares

      balanceAfterDecrease
      balanceAfterIncrease

      block
      blockTime
      transactionHash
      transactionIndex
      logIndex
    }
    totalRewards(
      first: 1
      skip: 0
      orderBy: block
      orderDirection: desc
      block: { number: $block }
    ) {
      totalPooledEtherBefore
      totalPooledEtherAfter
      totalSharesBefore
      totalSharesAfter

      apr

      block
      blockTime
      logIndex
    }
  }
`;
