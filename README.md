# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [Clients](#clients)
    -   [PublicClient](#publicclient)
        -   [Parameters](#parameters)
        -   [ping](#ping)
        -   [getServerTime](#getservertime)
        -   [getAssets](#getassets)
        -   [getExchangeInfo](#getexchangeinfo)
    -   [AuthenticatedClient](#authenticatedclient)
        -   [Parameters](#parameters-1)
        -   [placeOrder](#placeorder)
            -   [Parameters](#parameters-2)
-   [Enums](#enums)
    -   [MarketStatus](#marketstatus)
        -   [inactive](#inactive)
        -   [cancelsOnly](#cancelsonly)
        -   [active](#active)
    -   [OrderType](#ordertype)
        -   [market](#market)
        -   [limit](#limit)
        -   [limitMaker](#limitmaker)
        -   [stopLoss](#stoploss)
        -   [stopLossLimit](#stoplosslimit)
        -   [takeProfit](#takeprofit)
        -   [takeProfitLimit](#takeprofitlimit)
    -   [OrderSide](#orderside)
        -   [buy](#buy)
        -   [sell](#sell)
    -   [OrderTimeInForce](#ordertimeinforce)
        -   [gtc](#gtc)
        -   [gtt](#gtt)
        -   [ioc](#ioc)
        -   [fok](#fok)
-   [Requests](#requests)
    -   [Order](#order)
        -   [Properties](#properties)
-   [Responses](#responses)
    -   [Asset](#asset)
        -   [Properties](#properties-1)
    -   [ExchangeInfo](#exchangeinfo)
        -   [Properties](#properties-2)
    -   [Market](#market-1)
        -   [Properties](#properties-3)

## Clients




### PublicClient

Public API client

```typescript
const publicClient = new PublicClient('https://api-sandbox.idex.io/api/v1');
```

#### Parameters

-   `baseURL` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

#### ping

Test connectivity to the REST API

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;void>** 

#### getServerTime

Get the current server time

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)>** 

#### getAssets

Get comprehensive list of assets

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;types.Asset>>** 

#### getExchangeInfo

Get basic exchange info

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[ExchangeInfo](#exchangeinfo)>** 

### AuthenticatedClient

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

#### Parameters

-   `baseURL` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `apiKey` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `apiSecret` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `wallet` **ethers.Wallet** 

#### placeOrder

Place a new order

##### Parameters

-   `order` **[Order](#order)** 

Returns **[Promise](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;AxiosResponse>** 

## Enums

Sets of named constants used as field types for several requests and responses


### MarketStatus

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### inactive

No orders or cancels accepted

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### cancelsOnly

Cancels accepted but not trades

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### active

Trades and cancels accepted

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

### OrderType

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### market

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### limit

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### limitMaker

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### stopLoss

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### stopLossLimit

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### takeProfit

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### takeProfitLimit

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

### OrderSide

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### buy

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### sell

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

### OrderTimeInForce

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### gtc

Good until cancelled (default)

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### gtt

Good until time

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### ioc

Immediate or cancel

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

#### fok

Fill or kill

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

## Requests




### Order

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `nonce` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** UUIDv1
-   `wallet` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `market` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Base-quote pair e.g. 'IDEX-ETH'
-   `type` **[OrderType](#ordertype)** 
-   `side` **[OrderSide](#orderside)** 
-   `timeInForce` **[OrderTimeInForce](#ordertimeinforce)?** Defaults to gtc
-   `quantity` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Order quantity in base terms, exclusive with quoteOrderQuantity
-   `quoteOrderQuantity` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Order quantity in quote terms, exclusive with quantity
-   `price` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Price in quote terms, optional for market orders
-   `clientOrderId` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Client-supplied order id
-   `stopPrice` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** Stop loss or take profit price, only if stop or take order

## Responses




### Asset

Asset

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `id` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Internal id of the asset
-   `name` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `symbol` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `contractAddress` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `decimals` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `depositMinimum` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** In gwei
-   `tradeMinimum` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 24h volume in USD
-   `withdrawalMinimum` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### ExchangeInfo

Basic exchange info

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `timeZone` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** UTC
-   `serverTime` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** UNIX epoch time in ms
-   `ethereumDepositContractAddress` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `ethUsdPrice` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `gasPrice` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** In gwei
-   `usdVolume24h` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 24h volume in USD
-   `makerFeeRate` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `takerFeeRate` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### Market

Market

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

#### Properties

-   `market` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Base-quote pair e.g. 'IDEX-ETH'
-   `status` **[MarketStatus](#marketstatus)** 
-   `baseAsset` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** e.g. 'IDEX'
-   `baseAssetPrecision` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `quoteAsset` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** e.g. 'ETH'
-   `quoteAssetPrecision` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
-   `makerFeeRate` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `takerFeeRate` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `orderTypes` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[OrderType](#ordertype)>** 
-   `tradeMinimum` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** Minimum quantity in base terms
