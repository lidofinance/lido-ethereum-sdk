# Lido Frontend Template

Lido Frontend Template is a project template for developing Lido applications. It features the standard Lido frontend stack including Next.js, SWR, ethers, Lido UI and styled-components. The purpose of this template is to standardize Lido frontends and to enable developers to start working on the application as soon as possible with minimal setup required.

> 🚧 CI and deploy
>
> After creating repo from the template make sure that you have correctly filled TARGET_WORKFLOW field in:
>
> - .github/workflows/ci-dev.yml
> - .github/workflows/ci-staging.yml
> - .github/workflows/ci-prod.yml

### Pre-requisites

- Node.js v12+
- Yarn package manager

## Development

Step 0. Read `DOCS.md` in the root of the project

Step 1. Copy the contents of `.env` to `.env.local`

```bash
cp .env .env.local
```

Step 2. Fill out the `.env.local`. You may need to sign up for [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/), if you haven't already, to be able to use Ethereum JSON RPC connection.

Step 3. Install dependencies

```bash
yarn install
```

Step 4. Start the development server

```bash
yarn dev
```

Step 5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment variables

This project uses publicRuntimeConfig in the [next.config.js](./next.config.js) and getServerSideProps on the pages (function may be empty, but it forces Next.js to switch to Server-Side Rendering mode). This is necessary to quickly start the docker container without rebuilding the application. More on that in `DOCS.md`.

Read more about [runtime configuration](https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration) and [automatic static optimization](https://nextjs.org/docs/advanced-features/automatic-static-optimization)

### Content-Security-Policy

In order to improve security, this template includes a Content-Security-Policy boilerplate. Please make sure to customize the policies in [utils/withCsp.ts](utils/withCsp.ts) before shipping the application to production. Learn more about it in [DOCS](/DOCS.md#monitoring).

## Production

```bash
yarn build && yarn start
```

## Release flow

To create new release:

1. Merge all changes to the `main` branch
1. Navigate to Repo => Actions
1. Run action "Prepare release" action against `main` branch
1. When action execution is finished, navigate to Repo => Pull requests
1. Find pull request named "chore(release): X.X.X" review and merge it with "Rebase and merge" (or "Squash and merge")
1. After merge release action will be triggered automatically
1. Navigate to Repo => Actions and see last actions logs for further details
