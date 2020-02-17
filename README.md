# IDEX API Node Samples

Sample Node.js code (via Typescript) for using the IDEX API.

## Usage

View [index](https://github.com/idexio/idex-node/blob/master/src/index.ts) to see sample order parameter definitions.

Modify wallet and orders and run to see corresponding request JSON and signature verification results.

```
nvm use
yarn && yarn build
yarn start
```

```
*** Limit Order ***
{
  order: {
    market: 'IDEX-ETH',
    side: 'buy',
    type: 'limit',
    quantity: '1.20000000',
    price: '0.50000000',
    walletAddress: '0x7357589f8e367c2C31F51242fB77B350A11830F3',
    nonce: 'f1359e70-51cd-11ea-994f-db2e1629c1d6'
  },
  signature: '0xf2ac7ad88ccc6d4ef7348c2de255f3fd3e5ded3c55e36dcd3e2ba3d66573106c4d159a0f78038081d0a96c7b4a86a94c71e304fa338ae5e06e67272a2c0dc3261c'
}
Signature verified ✅

*** Market Order ***
{
  order: {
    market: 'IDEX-ETH',
    side: 'sell',
    type: 'market',
    quantity: '1.20000000',
    walletAddress: '0x7357589f8e367c2C31F51242fB77B350A11830F3',
    nonce: 'f1359e71-51cd-11ea-994f-db2e1629c1d6'
  },
  signature: '0x9a504cb4fd0dee0ba55f4d1de65d81ded6d9293d758fb078a04c86fd5e727e1b1a1758d614f85299450d751b620a9960de8204feddf31635eb718ae2fa087e841b'
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
    stopPrice: '0.60000000',
    walletAddress: '0x7357589f8e367c2C31F51242fB77B350A11830F3',
    nonce: 'f1359e72-51cd-11ea-994f-db2e1629c1d6'
  },
  signature: '0xab31c5cb8ebda22baeb28efb1d6785cd44d630cd31e1111b2ef7670906a032485d0198d3f357c3b3a40ea3614c0c2f2700695fc2aedb509ae0c6b2e030d9c7101b'
}
Signature verified ✅
```

## Contracts

View the provided [contract](https://github.com/idexio/idex-node/blob/master/contracts/SignatureVerifier.sol) for a
corresponding Solidity implementation of order signature verification.
