import { OrderBookRealTimeClient } from './OrderBookRealTimeClient';
import { isAxiosError } from '../utils';

const chain = 'matic';
const isSandbox = true;
const market = 'MATIC-USD';
const l2LevelsToDisplay = 5;

const restApiUrl = 'https://api-dev-sub-matic-1.idex-dev.com/v1';
const webSocketApiUrl = 'wss://websocket-dev-sub-matic-1.idex-dev.com/v1';

const client = new OrderBookRealTimeClient({
  multiverseChain: chain,
  sandbox: isSandbox,
  restApiUrl,
  webSocketApiUrl,
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
    client.stop(true, false);
    reconnect();
  });

  client.on('ready', (readyMarket: string) => {
    console.log('ORDER BOOK READY ==========>');
    client.getOrderBookL2(readyMarket, l2LevelsToDisplay).then(console.log);
  });

  // trades generate multiple L2 events (one for token price(s), one for l2update)
  // we can throttle updates with a dirty flag here
  let orderBookIsDirty = false;
  const orderBookRefreshDelay = 100;

  client.on('l2', (readyMarket: string) => {
    console.log('L2 EVENT ==========>');
    if (!orderBookIsDirty) {
      orderBookIsDirty = true;
      setTimeout(() => {
        console.log('ORDER BOOK UPDATED ==========>');
        client.getOrderBookL2(readyMarket, l2LevelsToDisplay).then(console.log);
        orderBookIsDirty = false;
      }, orderBookRefreshDelay);
    }
  });
};

demo();
