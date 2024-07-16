---
sidebar_position: 3
---

# Usage

## Starting the Erlang Process

1. Navigate to the project directory and install deps :

   ```bash
   cd examples/erlang-bridge/src

   yarn install
   ```

2. Replace RPC_URL in `sdk.js` with the actual RPC URL and set the `chain` parameter to which chain you want to connect:

   ```ts
   const rpcProvider = createPublicClient({
     chain: mainnet,
     transport: http('RPC_URL'),
   });
   ```

3. Start the Erlang shell:

   ```bash
   rebar3 get-deps && rebar3 compile
   ```

   ```bash
   erlc main.erl
   ```

   ```bash
   erl -pa _build/default/lib/*/ebin
   ```

4. In the Erlang shell, compile the `main` module:

   ```erlang
   c(main).
   ```

5. Start the Node.js process from Erlang and get the port:

   ```erlang
   {ok, Port} = main:start().
   ```

6. Define the parameters and call the `get_rewards_from_chain` function:

   ```erlang
   Params = [
       {<<"address">>, <<"0x">>},
       {<<"stepBlock">>, 10000},
       {<<"back">>, {<<"days">>, 1}}
   ].

   Result = main:get_rewards_from_chain(Port, Params).
   ```

   - address: Ethereum address for which to retrieve rewards.
   - stepBlock: Max blocks in 1 query - depend on the RPC capabilities and pricing plans
   - back.days: Number of days to step back.
