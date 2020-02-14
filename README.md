# IDEX API Node Samples

Sample Node.js code (via Typescript) for using the IDEX API.

## Usage

View [index](https://github.com/idexio/idex-node/blob/master/src/index.ts) to see sample order parameter definitions.

Modify wallet and orders and run to see corresponding request JSON and signature verification results.

```
nvm use
yarn && yarn build
node dist/index.js
```

```
*** Limit Order ***
{
  order: {
    market: 'IDEX-ETH',
    side: 'buy',
    type: 'limit',
    quantity: '1.20000000',
    price: '0.50000000'
  },
  wallet: {
    address: '0x7357589f8e367c2C31F51242fB77B350A11830F3',
    nonce: '5ec081a0-4f6f-11ea-b1ec-6508036be2f7',
    signature: '0x8eb63278745323cd19b4ec5d55b2174a79f3fa982fec635adc6c6d15e395e9360ecfbfff1b728b95bc03e9c418a357d74ff6bb950bc144ba1866f0bf023697e31b'
  }
}
Signature verified ✅

*** Market Order ***
{
  order: {
    market: 'IDEX-ETH',
    side: 'sell',
    type: 'market',
    quantity: '1.20000000'
  },
  wallet: {
    address: '0x7357589f8e367c2C31F51242fB77B350A11830F3',
    nonce: '5ec626f0-4f6f-11ea-b1ec-6508036be2f7',
    signature: '0x8beea823f03ce17ebc640591b6cc21e780d192fe44003e971abeb7028c7ab80e2c11db32f0cc45b80997b58e4d2b1465da030a6ce0ad8d063eed19c3409fdd371b'
  }
}
Signature verified ✅

*** Stop Limit Order ***
{
  order: {
    market: 'IDEX-ETH',
    side: 'buy',
    type: 'stopLimit',
    quantity: '1.20000000',
    price: '0.50000000',
    stopPrice: '0.60000000'
  },
  wallet: {
    address: '0x7357589f8e367c2C31F51242fB77B350A11830F3',
    nonce: '5ec897f0-4f6f-11ea-b1ec-6508036be2f7',
    signature: '0x6491044c23a89074e3c6c6a47312e1d6044590035582ac7b33f1952e5368b475254831da554297c71262e795f316cba9d96962b931b8d2a9e8ed3c27f64626a91c'
  }
}
Signature verified ✅
```

## Contracts

View the provided [contract](https://github.com/idexio/idex-node/blob/master/contracts/SignatureVerifier.sol) for a
corresponding Solidity implementation of order signature verification.
