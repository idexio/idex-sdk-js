import { ethers } from 'ethers';
import { v1 as uuidv1 } from 'uuid';

import * as models from './models';
import RequestBuilder from './request-builder';
import RequestVerifier from './request-verifier';

const limitOrder: models.LimitOrder = {
  market: 'IDEX-ETH',
  side: 'buy',
  type: 'limit',
  quantity: '1.20000000',
  price: '0.50000000',
  // customClientOrderId: '6f392746-4dd9-11ea-ba35-05698b78935d'
};

const marketOrder: models.MarketOrder = {
  market: 'IDEX-ETH',
  side: 'sell',
  type: 'market',
  quantity: '1.20000000',
  // customClientOrderId: '6f392747-4dd9-11ea-ba35-05698b78935d'
};

const stopLimitOrder: models.StopLimitOrder = {
  market: 'IDEX-ETH',
  side: 'buy',
  type: 'stopLimit',
  quantity: '1.20000000',
  price: '0.50000000',
  stopPrice: '0.60000000',
  // customClientOrderId: '6f392748-4dd9-11ea-ba35-05698b78935d'
};

async function runForOrder(
  order: models.Order,
  type: string,
  requestBuilder: RequestBuilder,
) {
  const request = await requestBuilder.createOrder(order);
  console.log(`\n*** ${type} Order ***`);
  console.log(request);
  console.log(
    RequestVerifier.createOrder(request)
      ? 'Signature verified ✅'
      : 'Signature invalid ❌',
  );
}

async function run() {
  const wallet = new ethers.Wallet(
    '0x3141592653589793238462643383279502884197169399375105820974944592',
  );
  const requestBuilder = new RequestBuilder(wallet);

  await runForOrder(limitOrder, 'Limit', requestBuilder);
  await runForOrder(marketOrder, 'Market', requestBuilder);
  await runForOrder(stopLimitOrder, 'Stop Limit', requestBuilder);
}

run();
