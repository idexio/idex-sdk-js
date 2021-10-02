<!-- markdownlint-disable MD033 -->
# <img src="assets/logo.png" alt="IDEX" height="36px" valign="top"> JavaScript SDK

![Discord](https://img.shields.io/discord/455246457465733130?label=Discord&style=flat-square)
![GitHub](https://img.shields.io/github/license/idexio/idex-sdk-js?style=flat-square)
![npm](https://img.shields.io/npm/v/@idexio/idex-sdk?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/idexio/idex-sdk-js?style=flat-square)


![Twitter Follow](https://img.shields.io/twitter/follow/idexio?style=social)


The official library for [IDEX v3's](https://idex.io) REST and WebSocket APIs.

- Written in TypeScript with full typings for all requests and responses
- Supports both Node.js and browser environments
- Implements a real time order book including support for [hybrid liquidity](https://api-docs-v3.idex.io/#hybrid-liquidity)

Complete documentation for the IDEX v3 API is available at https://api-docs-v3.idex.io.

## Installation

```bash
yarn add @idexio/idex-sdk@beta
// or
npm install --save @idexio/idex-sdk@beta
```

## Getting Started

Get IDEX v3 sandbox [API keys](https://api-docs-v3.idex.io/#sandbox).

```typescript
import * as idex from '@idexio/idex-sdk';

const publicClient = new idex.RestPublicClient({
  sandbox: true,
});
console.log(await publicClient.getServerTime());
```

In-depth usage documentation by endpoint is [available here](API.md).

## Contract ABIs

Included in the `contracts/` directory contains the ABIs necessary for interacting with IDEX v3's smart contracts.

- The [Exchange ABI](contracts/Exchange.abi.json) can be used to query contract state, [deposit funds](https://api-docs-v3.idex.io/#deposit-funds), [add liquidity](https://api-docs-v3.idex.io/#add-liquidity-via-smart-contract-function-call), [remove liquidity](https://api-docs-v3.idex.io/#remove-liquidity-via-smart-contract-function-call) or [exit wallets](https://api-docs-v3.idex.io/#exit-wallet).
- The [FaucetToken ABI](contracts/FaucetToken.abi.json) is implemented by the [API sandbox](https://api-docs-v3.idex.io/#sandbox) testnet tokens and features a [faucet](https://api-docs-v3.idex.io/#faucets)
function for dispensing tokens.

## License

The IDEX JavaScript SDK is released under the [MIT License](https://opensource.org/licenses/MIT).
