---
sidebar_position: 1
title: Introduction
---

# Erlang and Lido Ethereum SDK Interaction

## Introduction

This examples demonstrate the interaction between Erlang and Lido Ethereum SDK processes. The Erlang process launches a Node.js process and sends commands to retrieve result from the Lido SDK methods.

- `main.erl`: Erlang module that manages launching and interacting with the Node.js process.
- `sdk.js`: Lido SDK script that processes commands received from the Erlang process and returns results.
