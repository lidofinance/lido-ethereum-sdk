---
sidebar_position: 3
---

# Usage

## Starting the Erlang Process

1. Navigate to the project directory, install deps and start the Erlang shell:

   ```bash
   cd examples/erlang-bridge/src
   ```

   ```bash
   rebar3 get-deps && rebar3 compile
   ```

   ```bash
   erlc main.erl
   ```

   ```bash
   erl -pa _build/default/lib/*/ebin
   ```

2. In the Erlang shell, compile the `main` module:

   ```erlang
   c(main).
   ```

3. Start the Node.js process from Erlang and get the port:

   ```erlang
   {ok, Port} = main:start().
   ```

4. Define the parameters and call the `get_rewards_from_chain` function:

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
