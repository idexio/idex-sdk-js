import { OrderBookRealTimeClient } from './OrderBookRealTimeClient';
import { isAxiosError } from '../utils';

const chain = 'matic';
const isSandbox = true;
const market = 'MATIC-USD';
const l2LevelsToDisplay = 5;

const client = new OrderBookRealTimeClient({
  multiverseChain: chain,
  sandbox: isSandbox,
});

let RECONNECT_TIMEOUT = 1000;

async function reconnect() {
  if (RECONNECT_TIMEOUT > 60000) {
    throw new Error('Gave up trying to connect to orderbook');
  }
  setTimeout(() => {
    console.log(`ORDER BOOK RECONNECTING IN ${RECONNECT_TIMEOUT}... ======>`);
    start();
  }, RECONNECT_TIMEOUT);
  RECONNECT_TIMEOUT *= 2;
}

async function start() {
  try {
    await client.start([market]);
  } catch (e) {
    if (isAxiosError(e)) {
      console.log(`client.start axios error (REST API) ${e.name}`, e.message);
      reconnect();
      return;
    }
    if (e instanceof Error) {
      console.log(`client.start ${e.name}`, e.message);
      reconnect();
    }
  }
}

const demo = async function demo(): Promise<void> {
  start();

  client.on('connected', () => {
    console.log('ORDER BOOK CONNECTED ==========>');
    RECONNECT_TIMEOUT = 1000;
  });

  client.on('disconnected', () => {
    console.log('ORDER BOOK DISCONNECTED ==========>');
    reconnect();
  });

  client.on('error', (e: Error) => {
    console.log(e);
    client.stop();
    reconnect();
  });

  client.on('ready', (readyMarket: string) => {
    console.log('ORDER BOOK READY ==========>');
    client.getOrderBookL2(readyMarket, l2LevelsToDisplay).then(console.log);
  });

  // trades generate multiple L2 events (one for token price(s), one for l2update)
  // we can throttle updates with a dirty flag here
  let orderBookIsDirtyL1 = false;
  let orderBookIsDirtyL2 = false;
  const orderBookRefreshDelay = 100;

  client.on('l1', (readyMarket: string) => {
    console.log('L1 EVENT ==========>');
    if (!orderBookIsDirtyL1) {
      orderBookIsDirtyL1 = true;
      setTimeout(() => {
        console.log('L1 ORDER BOOK UPDATED ==========>');
        client.getOrderBookL1(readyMarket).then(console.log);
        orderBookIsDirtyL1 = false;
      }, orderBookRefreshDelay);
    }
  });

  client.on('l2', (readyMarket: string) => {
    console.log('L2 EVENT ==========>');
    if (!orderBookIsDirtyL2) {
      orderBookIsDirtyL2 = true;
      setTimeout(() => {
        console.log('L2 ORDER BOOK UPDATED ==========>');
        client.getOrderBookL2(readyMarket, l2LevelsToDisplay).then(console.log);
        orderBookIsDirtyL2 = false;
      }, orderBookRefreshDelay * 2);
    }
  });
};

demo();
