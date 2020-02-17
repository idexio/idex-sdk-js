import { ethers } from 'ethers';
import { v1 as uuidv1 } from 'uuid';

import * as models from './models';

const wallet = new ethers.Wallet(
  '0x3141592653589793238462643383279502884197169399375105820974944592',
);

const limitOrder: models.LimitOrder = {
  market: 'IDEX-ETH',
  side: 'buy',
  type: 'limit',
  quantity: '1.20000000',
  price: '0.50000000',
  // customClientOrderId: '6f392746-4dd9-11ea-ba35-05698b78935d',
  walletAddress: wallet.address,
  nonce: uuidv1(),
};

const marketOrder: models.MarketOrder = {
  market: 'IDEX-ETH',
  side: 'sell',
  type: 'market',
  quantity: '1.20000000',
  // customClientOrderId: '6f392747-4dd9-11ea-ba35-05698b78935d',
  walletAddress: wallet.address,
  nonce: uuidv1(),
};

const stopLimitOrder: models.StopLimitOrder = {
  market: 'IDEX-ETH',
  side: 'buy',
  type: 'stopLimit',
  quantity: '1.20000000',
  price: '0.50000000',
  stopPrice: '0.60000000',
  // customClientOrderId: '6f392748-4dd9-11ea-ba35-05698b78935d',
  walletAddress: wallet.address,
  nonce: uuidv1(),
};

async function runForOrder(order: models.Order, type: string) {
  const request = {
    order,
    signature: await wallet.signMessage(models.getOrderHash(order)),
  };
  const isSignatureValid =
    ethers.utils.verifyMessage(
      models.getOrderHash(request.order),
      request.signature,
    ) === request.order.walletAddress;

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
