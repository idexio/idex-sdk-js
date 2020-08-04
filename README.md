<!-- markdownlint-disable MD033 -->
# <img src="assets/logo.png" alt="IDEX" height="36px" valign="top"> Javascript SDK

The official library for IDEX's REST and WebSocket APIs

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
