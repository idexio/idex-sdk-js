import {
  OrderBookRealTimeClient,
  OrderBookRealTimeClientEvent,
} from '@idexio/idex-sdk';

const isSandbox = true;
const market = 'ETH-USD';
const l2LevelsToDisplay = 5;

const client = new OrderBookRealTimeClient({
  sandbox: isSandbox,
});

async function main(): Promise<void> {
  client.on(OrderBookRealTimeClientEvent.connected, () => {
    console.log('ORDER BOOK CONNECTED ==========>');
  });

  client.on(OrderBookRealTimeClientEvent.disconnected, () => {
    console.log('ORDER BOOK DISCONNECTED ==========>');
  });

  client.on(OrderBookRealTimeClientEvent.error, (e) => {
    console.log(e);
  });

  client.on(OrderBookRealTimeClientEvent.ready, (readyMarket) => {
    console.log('ORDER BOOK READY ==========>');
    client.getOrderBookL2(readyMarket, l2LevelsToDisplay).then(console.log);
  });

  // trades generate multiple L2 events (one for token price(s), one for l2update)
  // we can throttle updates with a dirty flag here
  let orderBookIsDirtyL1 = false;
  let orderBookIsDirtyL2 = false;
  const orderBookRefreshDelay = 100;

  client.on(OrderBookRealTimeClientEvent.l1, (readyMarket) => {
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

  client.on(OrderBookRealTimeClientEvent.l2, (readyMarket) => {
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

  await start();
}

async function start() {
  try {
    await client.start([market]);
  } catch (e) {
    if (e instanceof Error) {
      console.log(`client.start ${e.name}`, e.message);
    } else {
      throw e;
    }
  }
}

main().catch((error) => {
  console.error('Error During Demo Setup: ', error);
});
