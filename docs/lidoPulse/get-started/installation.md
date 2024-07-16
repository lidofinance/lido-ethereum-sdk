---
sidebar_position: 2
---

# Installation

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
