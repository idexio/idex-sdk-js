import { ethers } from 'ethers';
import { v1 as uuidv1 } from 'uuid';

import * as models from './models';
import RequestBuilder from './request-builder';
import RequestVerifier from './request-verifier';

async function run() {
  const wallet = new ethers.Wallet(
    '0x3141592653589793238462643383279502884197169399375105820974944592',
  );
  const requestBuilder = new RequestBuilder(wallet);

  const limitOrder: models.LimitOrder = {
    market: 'IDEX-ETH',
    side: 'buy',
    type: 'limit',
    quantity: '1.20000000',
    price: '0.50000000',
    // customClientOrderId: '6f392746-4dd9-11ea-ba35-05698b78935d'
  };
  const limitRequest = await requestBuilder.createOrder(limitOrder);
  console.log('\n*** Limit Order ***');
  console.log(limitRequest);
  console.log(
    RequestVerifier.createOrder(limitRequest)
      ? 'Signature verified ✅'
      : 'Signature invalid ❌',
  );

  const marketOrder: models.MarketOrder = {
    market: 'IDEX-ETH',
    side: 'sell',
    type: 'market',
    quantity: '1.20000000',
    // customClientOrderId: '6f392747-4dd9-11ea-ba35-05698b78935d'
  };
  const marketRequest = await requestBuilder.createOrder(marketOrder);
  console.log('\n*** Market Order ***');
  console.log(marketRequest);
  console.log(
    RequestVerifier.createOrder(marketRequest)
      ? 'Signature verified ✅'
      : 'Signature invalid ❌',
  );

  const stopLimitOrder: models.StopLimitOrder = {
    market: 'IDEX-ETH',
    side: 'buy',
    type: 'stopLimit',
    quantity: '1.20000000',
    price: '0.50000000',
    stopPrice: '0.60000000',
    // customClientOrderId: '6f392748-4dd9-11ea-ba35-05698b78935d'
  };
  const stopLimitRequest = await requestBuilder.createOrder(stopLimitOrder);
  console.log('\n*** Market Order ***');
  console.log(stopLimitRequest);
  console.log(
    RequestVerifier.createOrder(stopLimitRequest)
      ? 'Signature verified ✅'
      : 'Signature invalid ❌',
  );
}

run();
