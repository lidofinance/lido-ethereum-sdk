---
sidebar_position: 3
---

# Usage

The server exposes an endpoint at `/rpc` for handling JSON-RPC requests. You can interact with the Lido Ethereum SDK by sending JSON-RPC requests to this endpoint.

## Forming a JSON-RPC Request

To form a JSON-RPC request, you need to specify:

- `jsonrpc`: The JSON-RPC version, which should be `"2.0"`.
- `method`: The method name from the Lido Ethereum SDK.
- `params`: The parameters required by the method.
- `id`: A unique identifier for the request.

The method names and their required parameters can be found in the [Lido SDK documentation](/category/modules).

## Example JSON-RPC Request

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

## Forming the `params` Field

The `params` field in the JSON-RPC request can include various types of parameters. Parameters can be specified directly or with an additional `__type` field to handle special data types such as `BigInt`.

### Basic Parameters

For simple parameters like strings or numbers, you can specify them directly in the `params` object.

```json
"params": { "param1": "value1", "param2": 42 }
```

### Typed Parameters

For more complex types, such as `BigInt`, you should include an additional `__type` field within the parameter object to specify the type.

```json
"params": {
  "param1": "value1",
  "bigNumberParam": { "__type": "bigInt", "value": "9007199254740991" }
}
```

In this example, the `bigNumberParam` is a `BigInt` and is represented by specifying `"__type": "bigInt"` and the string value of the big integer.

## Array Parameters

If the method requires parameters to be passed as non object, you can specify the `params` field as an array directly.

### Example JSON-RPC Request with Array Parameters

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

## Example JSON-RPC Request with Typed Parameters

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

## Sending a Request

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

## Example Response

```json
{
  "jsonrpc": "2.0",
  "result": "0x3F1c547b21f65e10480dE3ad8E19fAAC46C95034",
  "id": 1
}
```
