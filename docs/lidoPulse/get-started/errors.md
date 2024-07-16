---
sidebar_position: 4
---

# Handling Errors

The server includes comprehensive error handling. Errors are returned in the standard JSON-RPC format, including an error code and message.

## Example Error Response

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
