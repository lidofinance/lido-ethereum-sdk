# Erlang and Lido Ethereum SDK Interaction

## Introduction

This examples demonstrate the interaction between Erlang and Lido Ethereum SDK processes. The Erlang process launches a Node.js process and sends commands to retrieve result from the Lido SDK methods.

- `main.erl`: Erlang module that manages launching and interacting with the Node.js process.
- `sdk.js`: Lido SDK script that processes commands received from the Erlang process and returns results.

## Installation

### Installing Erlang

Download and install Erlang/OTP from the [official website](https://www.erlang.org/downloads).

### Installing Node.js

Download and install Node.js and NPM from the [official website](https://nodejs.org/).

### Installing Node.js Dependencies

Navigate to the project directory and install the necessary dependencies:

```bash
yarn install
```

## Running the Project

### Starting the Erlang Process

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
