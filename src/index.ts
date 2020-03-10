import { ethers } from 'ethers';
import { v1 as uuidv1 } from 'uuid';

import * as types from './types';

/*
const wallet = new ethers.Wallet(
  '0x3141592653589793238462643383279502884197169399375105820974944592',
);

const limitOrder: types.Order = {
  market: 'IDEX-ETH',
  side: 'buy',
  type: 'limit',
  quantity: '1.20000000',
  // quoteOrderQuantity: '0.60000000',
  price: '0.50000000',
  // customClientOrderId: '6f392746-4dd9-11ea-ba35-05698b78935d',
  wallet: wallet.address,
  nonce: uuidv1(),
};

const marketOrder: types.Order = {
  market: 'IDEX-ETH',
  side: 'sell',
  type: 'market',
  quantity: '1.20000000',
  // quoteOrderQuantity: '0.60000000',
  // customClientOrderId: '6f392747-4dd9-11ea-ba35-05698b78935d',
  wallet: wallet.address,
  nonce: uuidv1(),
};

const stopLimitOrder: types.Order = {
  market: 'IDEX-ETH',
  side: 'buy',
  type: 'stopLoss',
  // quantity: '1.20000000',
  quoteOrderQuantity: '0.60000000',
  stopPrice: '0.60000000',
  // customClientOrderId: '6f392748-4dd9-11ea-ba35-05698b78935d',
  wallet: wallet.address,
  nonce: uuidv1(),
};

async function runForOrder(order: types.Order, type: string) {
  const request = {
    order,
    signature: await wallet.signMessage(types.getOrderHash(order)),
  };
  const isSignatureValid =
    ethers.utils.verifyMessage(
      types.getOrderHash(request.order),
      request.signature,
    ) === request.order.wallet;

  console.log(`\n*** ${type} Order ***`);
  console.log(request);
  console.log(
    isSignatureValid ? 'Signature verified ✅' : 'Signature invalid ❌',
  );
}

async function run() {
  await runForOrder(limitOrder, 'Limit');
  await runForOrder(marketOrder, 'Market');
  await runForOrder(stopLimitOrder, 'Stop Limit');
}

run();
*/
