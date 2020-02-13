import { ethers } from 'ethers';
import { v1 as uuidv1 } from 'uuid';

enum OrderSide {
  buy,
  sell,
}

enum OrderType {
  limit,
  market,
  stopLimit,
}

interface Order {
  market: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stopLimit';
  quantity: string;
  price?: string;
  stopPrice?: string;
  customClientOrderId?: string;
}

interface LimitOrder extends Order {
  type: 'limit';
  price: string;
}

interface MarketOrder extends Order {
  type: 'market';
}

interface StopLimitOrder extends Order {
  type: 'stopLimit';
  price: string;
  stopPrice: string;
}

const buildRequest = async (order: Order, wallet: ethers.Wallet) => {
  const nonce = uuidv1();
  return {
    order,
    wallet: {
      address: wallet.address,
      nonce,
      signature: await wallet.signMessage(
        getOrderHash(order, wallet.address, nonce),
      ),
    },
  };
};

const getOrderHash = (order: Order, walletAddress: string, nonce: string) =>
  ethers.utils.solidityKeccak256(
    [
      'string',
      'uint8',
      'uint8',
      'string',
      'string',
      'string',
      'address',
      'uint128',
    ],
    [
      order.market,
      OrderSide[order.side],
      OrderType[order.type],
      order.quantity,
      order.price || '',
      order.stopPrice || '',
      walletAddress,
      uuidToBuffer(nonce),
    ],
  );

const uuidToBuffer = (uuid: string): Buffer =>
  Buffer.from(uuid.replace(/-/g, ''), 'hex');

async function run() {
  const wallet = new ethers.Wallet(
    '0x3141592653589793238462643383279502884197169399375105820974944592',
  );

  const limitOrder: LimitOrder = {
    market: 'IDEX-ETH',
    side: 'buy',
    type: 'limit',
    quantity: '1.20000000',
    price: '0.50000000',
    // customClientOrderId: '6f392746-4dd9-11ea-ba35-05698b78935d'
  };
  console.log(await buildRequest(limitOrder, wallet));

  const marketOrder: MarketOrder = {
    market: 'IDEX-ETH',
    side: 'sell',
    type: 'market',
    quantity: '1.20000000',
    // customClientOrderId: '6f392747-4dd9-11ea-ba35-05698b78935d'
  };
  console.log(await buildRequest(marketOrder, wallet));

  const stopLimitOrder: StopLimitOrder = {
    market: 'IDEX-ETH',
    side: 'buy',
    type: 'stopLimit',
    quantity: '1.20000000',
    price: '0.50000000',
    stopPrice: '0.60000000',
    // customClientOrderId: '6f392747-4dd9-11ea-ba35-05698b78935d'
  };
  console.log(await buildRequest(stopLimitOrder, wallet));
}

run();
