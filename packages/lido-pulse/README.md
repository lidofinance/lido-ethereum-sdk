# LidoPulse

A pulse of data from Lido Ethereum SDK through intuitive HTTP requests, providing simple and efficient interaction.

## Use Case

`LidoPulse` is designed to provide developers with a simple and efficient way to interact with the Lido Ethereum SDK using JSON-RPC over HTTP. By abstracting the complexities of direct SDK integration, LidoPulse allows you to easily retrieve protocol parameters and information about addresses interacting with the protocol. This can be particularly useful for:

- Monitoring and analyzing staking activities and protocol parameters.
- Building dashboards and tools that require real-time data from the Lido Ethereum SDK.
- Developing custom integrations and services that leverage Lido's staking information

## Features:

- Smooth and convenient data retrieval from [Lido Ethereum SDK](https://lidofinance.github.io/lido-ethereum-sdk/)
- Intuitive HTTP requests by JSON-RPC

## Security Disclaimer

Important: The API provided by LidoPulse is intended to be run on localhost and is not secure by itself. It is crucial to protect this API behind firewalls and other security measures to prevent unauthorized access and ensure the integrity of your data. Here are some recommendations:

- Run the LidoPulse API on a secure internal network.
- Use firewall rules to restrict access to the API.
- Implement additional security layers, such as VPNs and access controls, to safeguard the API from external threats.

## Fastify RPC Server for Lido SDK

This package is an RPC server designed to interact with the Lido Ethereum SDK. It allows you to easily make requests to the Lido Ethereum SDK using HTTP requests.

## What is RPC?

Remote Procedure Call (RPC) is a protocol that one program can use to request a service from a program located on another computer in a network. It is a method for executing code on a remote system as if it were a local procedure call, abstracting the complexities of network communication.

## Features

- **RPC Server:** Handles JSON-RPC requests for interacting with the Lido Ethereum SDK.
- **Lido SDK Integration:** Facilitates communication with the Lido Ethereum staking protocol.
- **HTTP Interface:** Simplifies making requests to the Lido Ethereum SDK using standard HTTP requests.

## Installation

To get started, clone the repository and install the dependencies:

```bash
git clone https://github.com/lidofinance/lido-ethereum-sdk.git
cd packages/lido-pulse
cp .env.example .env
yarn install
```

Fill in the `.env` file with the required environment variables.

## Running the Server

To start the Fastify server, run:

```bash
yarn start
```

You can also run the server in development mode with hot reloading:

```bash
yarn dev
```

The server will start on port 3000 by default.

## Usage

The server exposes an endpoint at `/rpc` for handling JSON-RPC requests. You can interact with the Lido Ethereum SDK by sending JSON-RPC requests to this endpoint.

### Forming a JSON-RPC Request

To form a JSON-RPC request, you need to specify:

- `jsonrpc`: The JSON-RPC version, which should be `"2.0"`.
- `method`: The method name from the Lido Ethereum SDK.
- `params`: The parameters required by the method.
- `id`: A unique identifier for the request.

The method names and their required parameters can be found in the [Lido SDK documentation](https://lidofinance.github.io/lido-ethereum-sdk/).

### Example JSON-RPC Request

```json
{
  "jsonrpc": "2.0",
  "method": "rewards.getRewardsFromChain",
  "params": {
    "address": "0x2f0EA53F92252167d658963f334a91de0824e322",
    "stepBlock": 10000,
    "back": { "days": { "value": 1, "__type": "bigInt" } }
  },
  "id": 1
}
```

In this example, `"rewards.getRewardsFromChain"` represents calling the `getRewardsFromChain` method within the `rewards` module of the Lido Ethereum SDK. The method names should follow the structure of the SDK, separated by dots to reflect the hierarchy.

### Forming the `params` Field

The `params` field in the JSON-RPC request can include various types of parameters. Parameters can be specified directly or with an additional `__type` field to handle special data types such as `BigInt`.

#### Basic Parameters

For simple parameters like strings or numbers, you can specify them directly in the `params` object.

```json
"params": { "param1": "value1", "param2": 42 }
```

#### Typed Parameters

For more complex types, such as `BigInt`, you should include an additional `__type` field within the parameter object to specify the type.

```json
"params": {
  "param1": "value1",
  "bigNumberParam": { "__type": "bigInt", "value": "9007199254740991" }
}
```

In this example, the `bigNumberParam` is a `BigInt` and is represented by specifying `"__type": "bigInt"` and the string value of the big integer.

### Array Parameters

If the method requires parameters to be passed as non object, you can specify the `params` field as an array directly.

#### Example JSON-RPC Request with Array Parameters

```json
{
  "jsonrpc": "2.0",
  "method": "core.anotherMethod",
  "params": ["value1", 42, { "__type": "bigInt", "value": "9007199254740991" }],
  "id": 2
}
```

In this example, the parameters are passed as an array, and in the SDK method it will be processed like this:

```ts
lidoSDK.core.someMethod('value1', 42, BigInt('9007199254740991'));
```

### Example JSON-RPC Request with Typed Parameters

```json
{
  "jsonrpc": "2.0",
  "method": "lidoSDK.someMethod",
  "params": {
    "param1": "value1",
    "bigNumberParam": { "__type": "bigInt", "value": "9007199254740991" }
  },
  "id": 1
}
```

This structure allows the server to correctly parse and handle different types of parameters according to their specified types.

### Sending a Request

You can use tools like `curl`, Postman, or any HTTP client library to send requests to the server. Here is an example using `curl`:

```bash
curl -X POST http://localhost:3000/rpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "core.getContractAddress",
    "params": ["lido"],
    "id": 1
    }'
```

### Example Response

```json
{
  "jsonrpc": "2.0",
  "result": "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
  "id": 1
}
```

### Batch Requests

The server also supports batch requests, allowing multiple JSON-RPC calls to be sent in a single HTTP request. Each request in the batch will be processed independently, and a single response containing the results of all requests will be returned. Note that the order of responses in the batch response may not match the order of the requests. You should match responses to requests using the `id` field.

#### Example Batch JSON-RPC Request

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

#### Example Batch Response

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

### Handling Errors

The server includes comprehensive error handling. Errors are returned in the standard JSON-RPC format, including an error code and message.

#### Example Error Response

```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32600,
    "message": "Invalid Request"
  },
  "id": null
}
```

## Error Codes

The following error codes are used by the server:

- `-32600`: Invalid Request
- `-32700`: Parse error
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error
- `-32000`: Server error
