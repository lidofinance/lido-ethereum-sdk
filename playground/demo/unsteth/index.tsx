import { Input, Accordion } from '@lidofinance/lido-ui';
import { useWeb3 } from '@reef-knot/web3-react';
import { Action } from 'components/action';

import { useAddressState } from 'hooks/useAddressState';
import { useLidoSDK } from 'providers/sdk';
import { useState } from 'react';
import { transactionToast } from 'utils/transaction-toast';
import { type Address } from 'viem';

export const UnstethDemo = () => {
  const { unsteth } = useLidoSDK();
  const { account: web3account = '0x0' } = useWeb3();
  const account = web3account as Address;

  // nfts
  const [owner, setOwner] = useAddressState();

  const [nftId, setNftId] = useState<number>(0);
  // transfer
  const [transferId, setTransferId] = useState<number>(0);
  const [toTransfer, setToTransfer] = useAddressState();
  const [fromTransfer, setFromTransfer] = useAddressState('' as Address);

  // Approve
  const [approveNftId, setApproveNftId] = useState<number>(0);
  const [toApprove, setToApprove] = useAddressState('' as Address);
  // Approve for all
  const [toAllApprove, setToAllApprove] = useAddressState();

  return (
    <Accordion summary={'unstETH'}>
      <Action title="NFTs" action={() => unsteth.getNFTsByAccount(owner)}>
        <Input
          label="Owner address"
          placeholder="0x0000000"
          value={owner}
          onChange={(e) => setOwner(e.currentTarget.value as Address)}
        />
      </Action>
      <Action
        title="owner of Token"
        action={() => unsteth.getAccountByNFT(BigInt(nftId))}
      >
        <Input
          label="Token ID"
          value={nftId}
          placeholder="0"
          type="number"
          min={0}
          onChange={(e) => setNftId(e.target.valueAsNumber)}
        />
      </Action>
      <Action
        title="Metadata URI of Token"
        renderResult={(uri) => (
          <a target="_blank" href={uri}>
            NFT #{nftId} metadata
          </a>
        )}
        action={() => unsteth.getTokenMetadataURI(BigInt(nftId))}
      />
      <Action
        title="Transfer"
        action={() =>
          unsteth.transfer({
            account,
            id: BigInt(transferId),
            to: toTransfer,
            from: fromTransfer ? fromTransfer : undefined,
            callback: transactionToast,
          })
        }
      >
        <Input
          label="Token ID"
          value={transferId}
          placeholder="0"
          type="number"
          min={0}
          onChange={(e) => setTransferId(e.target.valueAsNumber)}
        />
        <Input
          label="To address"
          placeholder="0x0000000"
          value={toTransfer}
          onChange={(e) => setToTransfer(e.currentTarget.value as Address)}
        />
        <Input
          label="From address(optional)"
          placeholder="0x0000000"
          value={fromTransfer}
          onChange={(e) => setFromTransfer(e.currentTarget.value as Address)}
        />
      </Action>
      <Action
        title="Approve Token To"
        action={() =>
          unsteth.setApprovalFor({
            id: BigInt(approveNftId),
            to: toApprove ? toApprove : undefined,
            account,
            callback: transactionToast,
          })
        }
      >
        <Input
          label="Token ID"
          value={approveNftId}
          placeholder="0"
          type="number"
          min={0}
          onChange={(e) => setApproveNftId(e.target.valueAsNumber)}
        />
        <Input
          label="To address(empty for revoke)"
          placeholder="0x0000000"
          value={toApprove}
          onChange={(e) => setToApprove(e.currentTarget.value as Address)}
        />
      </Action>
      <Action
        title="Get Token Approved To Address"
        action={() =>
          unsteth.getTokenApprovedFor({ account, id: BigInt(approveNftId) })
        }
      />
      <Action
        title="Approve for all tokens"
        action={() =>
          unsteth.setApprovalForAll({
            account,
            to: toAllApprove,
            allow: true,
            callback: transactionToast,
          })
        }
      >
        <Input
          label="To address"
          placeholder="0x0000000"
          value={toAllApprove}
          onChange={(e) => setToAllApprove(e.currentTarget.value as Address)}
        />
      </Action>
      <Action
        title="Revoke for all tokens"
        action={() =>
          unsteth.setApprovalForAll({
            account,
            to: toAllApprove,
            allow: false,
            callback: transactionToast,
          })
        }
      />
      <Action
        title="Check is approved for all"
        action={() =>
          unsteth.getIsApprovedForAll({ account, to: toAllApprove })
        }
      />
      <Action
        title="Contract Metadata"
        action={() => unsteth.getContractMetadata()}
      />
    </Accordion>
  );
};
