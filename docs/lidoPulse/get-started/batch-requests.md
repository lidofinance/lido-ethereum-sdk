---
sidebar_position: 4
---

# Batch Requests

The server also supports batch requests, allowing multiple JSON-RPC calls to be sent in a single HTTP request. Each request in the batch will be processed independently, and a single response containing the results of all requests will be returned. Note that the order of responses in the batch response may not match the order of the requests. You should match responses to requests using the `id` field.

## Example Batch JSON-RPC Request

```json
[
  {
    "jsonrpc": "2.0",
    "method": "shares.balance",
    "params": ["0x2f0EA53F92252167d658963f334a91de0824e322"],
    "id": 1
  },
  {
    "jsonrpc": "2.0",
    "method": "unsteth.getNFTsByAccount",
    "params": ["0x2f0EA53F92252167d658963f334a91de0824e322"],
    "id": 2
  },
  {
    "jsonrpc": "2.0",
    "method": "events.stethEvents.getLastRebaseEvent",
    "params": [],
    "id": 3
  }
]
```

## Example Batch Response

```json
[
  {
    "jsonrpc": "2.0",
    "result": [
      {
        "amountOfStETH": "10000000000000000",
        "amountOfShares": "9995810557743733",
        "owner": "0x",
        "timestamp": "16973450812",
        "isFinalized": true,
        "isClaimed": false,
        "id": "777"
      }
    ],
    "id": 2
  },
  {
    "jsonrpc": "2.0",
    "result": "14066156191713469572",
    "id": 1
  },
  {
    "jsonrpc": "2.0",
    "result": {
      "eventName": "TokenRebased",
      "args": {
        "reportTimestamp": "1721072820",
        "timeElapsed": "4608",
        "preTotalShares": "1079179109989045486885777",
        "preTotalEther": "1093196098970760843229455",
        "postTotalShares": "1079179369664131812438396",
        "postTotalEther": "1093198738453702928397482",
        "sharesMintedAsFees": "260563376065765428"
      },
      "address": "0x3f1c547b21f65e10480de3ad8e19faac46c95034",
      "topics": [
        "0xff08c3ef606d198e316ef5b822193c489965899eb4e3c248cea1a4626c3eda50",
        "0x0000000000000000000000000000000000000000000000000000000066957cb4"
      ],
      "data": "0x000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000e4866ab1ef0fa0ba1b9100000000000000000000000000000000000000000000e77e477e6cbd9ce5f90f00000000000000000000000000000000000000000000e4866e4c7c2d1e2e317c00000000000000000000000000000000000000000000e77e6c1fc07dee9674aa000000000000000000000000000000000000000000000000039db5028fe06034",
      "blockNumber": "1934791",
      "transactionHash": "0x826b3e20a499dfb655828829ba08cab037b81873237397502159ea41f9186246",
      "transactionIndex": 16,
      "blockHash": "0x61ea6638b24ef3b0215556e67bb847e44f52c97e9f24b898452b3b6c426ee82e",
      "logIndex": 43,
      "removed": false
    },
    "id": 3
  }
]
```

Batch requests are useful for optimizing network usage and reducing latency by sending multiple requests at once.
