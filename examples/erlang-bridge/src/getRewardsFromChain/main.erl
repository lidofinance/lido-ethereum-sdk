-module(main).
-export([start/0, get_rewards_from_chain/2]).

start() ->
    Port = open_port({spawn, "node sdk.js"}, [binary, exit_status]),
    io:format("Started Node.js process with Port: ~p~n", [Port]),
    receive
        {Port, {data, <<"{\"ready\":true}">>}} ->
            io:format("Node.js process is ready~n"),
            {ok, Port};
        {Port, {data, Data}} ->
            io:format("Unexpected message: ~p~n", [Data]),
            {error, unexpected_message}
    end.

get_rewards_from_chain(Port, Params) ->
    %% Convert Params to JSON
    JSONParams = jsx:encode(Params),
    io:format("Encoded Params: ~s~n", [JSONParams]),

    Command = jsx:encode([
        {<<"action">>, <<"getRewardsFromChain">>}, {<<"params">>, jsx:encode(Params)}
    ]),
    io:format("Encoded Command: ~s~n", [Command]),

    %% Send command to Node.js process
    port_command(Port, <<Command/binary, "\n">>),
    %% Wait for response
    receive
        {Port, {data, Data}} ->
            io:format("Received Data: ~s~n", [Data]),
            {ok, jsx:decode(Data)};
        {Port, {exit_status, Status}} ->
            io:format("Node.js process exited with status: ~p~n", [Status]),
            {error, Status}
    after 5000 ->
        {error, timeout}
    end.
