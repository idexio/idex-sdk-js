# idex-node

The official Node.js wrapper for the IDEX API

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

-   [Clients](#clients)
    -   [PublicClient](#publicclient)
        -   [Parameters](#parameters)
        -   [ping](#ping)
        -   [getServerTime](#getservertime)
        -   [getExchangeInfo](#getexchangeinfo)
    -   [AuthenticatedClient](#authenticatedclient)
        -   [Parameters](#parameters-1)
-   [Types](#types)
    -   [ExchangeInfo](#exchangeinfo)
        -   [Properties](#properties)

### Clients




#### PublicClient

Public API client

```typescript
const publicClient = new PublicClient('https://api-sandbox.idex.io/api/v1');
```

##### Parameters

-   `baseURL` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

##### ping

Test connectivity to the REST API

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void>** 

##### getServerTime

Get the current server time

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)>** 

##### getExchangeInfo

Get basic exchange info

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;types.ExchangeInfo>** 

#### AuthenticatedClient

Authenticated API client

```typescript
const config = {
  baseURL: 'https://api-sandbox.idex.io/api/v1',
  apiKey:
    'MTQxMA==.MQ==.TlRnM01qSmtPVEF0TmpJNFpDMHhNV1ZoTFRrMU5HVXROMlJrTWpRMVpEUmlNRFU0',
  apiSecret: 'axuh3ywgg854aq7m73oy6gnnpj5ar9a67szuw5lclbz77zqu0j',
  walletPrivateKey:
    '0x3141592653589793238462643383279502884197169399375105820974944592',
};
const authenticatedClient = new AuthenticatedClient(
  config.baseURL,
  config.apiKey,
  config.apiSecret,
  new ethers.Wallet(config.walletPrivateKey),
);
```

##### Parameters

-   `baseURL` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `apiKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `apiSecret` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `wallet` **ethers.Wallet** 

### Types




#### ExchangeInfo

Basic exchange info

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

##### Properties

-   `timeZone` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** UTC
-   `serverTime` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** UNIX epoch time in ms
-   `ethereumDepositContractAddress` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `ethUsdPrice` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `gasPrice` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** In gwei
-   `usdVolume24h` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 24h volume in USD
-   `makerFeeRate` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `takerFeeRate` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## Contracts

View the provided [contract](https://github.com/idexio/idex-node/blob/master/contracts/SignatureVerifier.sol) for a
corresponding Solidity implementation of order signature verification.
