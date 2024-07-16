---
sidebar_position: 1
title: Introduction
---

# Erlang and Lido Ethereum SDK Interaction

## Introduction

This examples demonstrate the interaction between Erlang and Lido Ethereum SDK processes. The Erlang process launches a Node.js process and sends commands to retrieve result from the Lido SDK methods.

- `main.erl`: Erlang module that manages launching and interacting with the Node.js process.
- `sdk.js`: Lido SDK script that processes commands received from the Erlang process and returns results.

## Use Case

The primary use case for this project is to integrate blockchain reward retrieval functionalities into an Erlang-based application. By leveraging the Lido SDK in a Node.js process, this project provides a way to access blockchain data and perform complex computations that may not be easily achievable within Erlang.
