<!-- markdownlint-disable MD033 -->
# <img src="assets/logo.png" alt="IDEX" height="36px" valign="top"> Javascript SDK

The official library for [IDEX 2.0's](https://idex.io) REST and WebSocket APIs

*Important: This SDK supports the all-new [IDEX 2.0](https://idex.io), now available for integation via a fully-functional [testnet sandbox](https://docs.idex.io/#sandbox). [IDEX 1.0](https://idex.market) and its [API](https://docs.idex.market) will continue to operate for a short period of time as IDEX's mainnet exchange, allowing the community to upgrade integrations. It is not recommended to start any new development for the IDEX 1.0 API.*

Complete documentation for the IDEX 2.0 API is available at https://docs.idex.io.

## Features

- Easy functionality to use in programmatic trading
- A WebSocket-backed real-time order book implementation
- Clients with convenient methods for every API endpoint
- Abstracted interfaces – don't worry about HMAC signing, JSON formatting, or ECDSA signatures; the library does it for you
- Supports both Node.js and browser environments
- Written in Typescript with full typings for all requests and responses

## Installation

```bash
npm install @idexio/idex-sdk
```

## Getting Started

Get IDEX 2.0 sandbox [API keys](https://idex.io).

```typescript
import * as idex from '@idexio/idex-sdk';

const publicClient = new idex.RestPublicClient({
  sandbox: true,
});
console.log(await publicClient.getServerTime());
```

In-depth usage documentation by endpoint is [available here](https://github.com/idexio/idex-sdk-js/blob/master/API.md).

## Contracts

Included in the `contracts/` directory are the Solidity [source](https://github.com/idexio/idex-sdk-js/blob/master/contracts/SandboxToken.sol)
and corresponding [ABI](https://github.com/idexio/idex-sdk-js/blob/master/contracts/SandboxToken.abi.json) for the
[testnet sandbox](https://docs.idex.io/#sandbox) ERC-20 tokens, which feature a [faucet](https://docs.idex.io/#faucets)
function for dispensing tokens.

See the [idex-contracts](https://github.com/idexio/idex-contracts) repo for a reference
[Solidity implementation](https://github.com/idexio/idex-contracts/blob/master/contracts/libraries/Signatures.sol) of
order and withdrawal signature verification that exactly mirrors the [Javascript implementation](https://github.com/idexio/idex-sdk-js/blob/main/src/signatures.ts)
found in this repo.

## License

The IDEX Javascript SDK is released under the [MIT License](https://opensource.org/licenses/MIT).
