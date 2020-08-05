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
import * as idex from '@idexio/idex-sdk-js';

const publicClient = new idex.client.rest.Public({
  sandbox: true,
});
console.log(await publicClient.getServerTime());
```

In-depth usage documentation by endpoint is [available here](https://github.com/idexio/idex-sdk-js/blob/master/API.md).

## Contracts

View the provided [contract](https://github.com/idexio/idex-sdk-js/blob/master/contracts/Signatures.sol) for a
corresponding Solidity implementation of order signature verification.

## License

The IDEX Javascript SDK is released under the [MIT License](https://opensource.org/licenses/MIT).
