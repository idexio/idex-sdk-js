<!-- markdownlint-disable MD033 -->

<div align="center">
  <p align="center">
    <img src="assets/hero.jpeg" width="50%" title="eslint-plus-action">
  </p>
  <h1>
      IDEX v4 Typescript/Javascript SDK
  </h1>
  <p>
   The official Typescript/Javascript SDK for <a href="https://idex.io">IDEX v4</a> REST and WebSocket APIs.
  </p>
</div>

![Discord](https://img.shields.io/discord/455246457465733130?label=Discord&style=flat-square)
![GitHub](https://img.shields.io/github/license/idexio/idex-sdk-js?style=flat-square)
![npm](https://img.shields.io/npm/v/@idexio/idex-sdk?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/idexio/idex-sdk-js?style=flat-square)
![Twitter Follow](https://img.shields.io/twitter/follow/idexio?style=social)

---

## Summary

- 🔥 **Built with TypeScript** - Provides a TypeScript/JavaScript SDK for the [IDEX v4 REST and WebSocket APIs](https://api-docs-v4.idex.io).
- ⭐ **Powerful Documentation** - Provides complete inline IDE documentation and matching 📖 [typedoc-generated reference documentation](https://sdk-js-docs-v4.idex.io).
- 🦺 **End-to-End type safety** - the sdk types are used by IDEX servers and clients so enumerations and types are always up-to-date and accurate.
- 🌐 **Universal Compatibility** - Optimized to work in both Node.js and browser environments for maximum compatibility.

## Links & Resource

- 🏠 [IDEX Homepage](https://idex.io)
- 📈 [IDEX v4 Exchange Sandbox](https://exchange-sandbox.idex.io)
- 📖 [IDEX v4 Typescript SDK Reference Documentation](https://sdk-js-docs-v4.idex.io)
- 📖 [IDEX v4 API Documentation](https://api-docs-v4.idex.io)
- 🔗 [IDEX v4 SDK GitHub](https://github.com/idexio/idex-sdk-js)

## Installation

```bash
npm install @idexio/idex-sdk@beta
```

## Getting Started

```typescript
import * as idex from '@idexio/idex-sdk';

// const publicClient = new idex.RestPublicClient();
// or, for sandbox API:
const publicClient = new idex.RestPublicClient({
  // no params required for production api client
  sandbox: true,
});

const authenticatedClient = new RestAuthenticatedClient({
  sandbox: false,

  // fill these in with your own walletPrivateKey/apiKey/apiSecret
  walletPrivateKey: '0x...',
  apiKey: '1e7c4f52-4af7-4e1b-aa94-94fac8d931aa',
  apiSecret: 'ufuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
});

const markets = await publicClient.getMarkets();

const wallets = await authenticatedClient.getWallets();
```

- Start with **sandbox** testing by getting [IDEX v4 sandbox API keys](https://api-docs-v4.idex.io/#sandbox).

## Node Versions

Minimum supported version is Node v16 with support for import/export map resolution.

> The sdk should work with any JavaScript environment that supports [import maps](https://nodejs.org/dist/latest-v20.x/docs/api/packages.html#imports) & [export maps](https://nodejs.org/dist/latest-v20.x/docs/api/packages.html#exports).

## Typescript Support

Your tsconfig/jsconfig must be setup to ensure TypeScript handles import/export map resolution. This is generally done by setting `module` and `moduleResolution` to `Node16` or `NodeNext`.

> See [resolvePackageJsonExports](https://www.typescriptlang.org/tsconfig#resolvePackageJsonExports) and [resolvePacakageJsonImports](https://www.typescriptlang.org/tsconfig#resolvePackageJsonImports) configuration reference for additional details.

## JavaScript

JavaScript is fully supported, however, it is recommended to add `// @ts-check` at the top of your files so your IDE will inform you of any
type-related errors in your code!

## Typechain

Typechain types and factories for contracts are available by importing them from `/typechain` export directly, they are not
exported from the main export.

```typescript
import * as typechain from '@idexio/idex-sdk/typechain';
```

## License

The IDEX JavaScript SDK is released under the [MIT License](https://opensource.org/licenses/MIT).
