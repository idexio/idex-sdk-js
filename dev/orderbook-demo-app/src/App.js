import { useEffect, useState } from 'react';
import { OrderBookRealTimeClient } from '../../../dist/index';

const config = {
  restBaseURL: 'https://api-staging-sub-matic.idex-dev.com/v1',
  websocketBaseURL: 'wss://websocket-staging-sub-matic.idex-dev.com/v1',
  chain: 'matic',
  sandbox: true,

  market: 'IDEX-USD',
  limit: 100,
  tickSize: 1,
  overrideRates: {
      takerIdexFeeRate: "0.0005",
      takerLiquidityProviderFeeRate: "0.0020",
      takerTradeMinimum: "0.10000000"
  }
}

let incrementer = 0;

const client = new OrderBookRealTimeClient({
  multiverseChain: config.chain,
  sandbox: config.sandbox,
  restBaseURL: config.restBaseURL,
  websocketBaseURL: config.websocketBaseURL,
}, config.overrideRates);

// Uncomment to debug issue with shifted data
// client.removeAllListeners();
// client.stop();

client.start([config.market]);

function App() {
  const [events, setEvents] = useState([]);
  const [books, setBooks] = useState([]);

  const trackEvent = (event) => {
    setEvents((events) => [
      ...events,
      {
        localId: incrementer++,
        time: new Date().toLocaleTimeString(),
        event,
      },
    ]);
  };

  useEffect(() => {
    async function refreshOrderBook() {
      const l2 = await client.getOrderBookL2(
        config.market,
        config.limit,
        window.BigInt(config.tickSize)
      );
      setBooks((books) => [
        {
          localId: incrementer++,
          time: new Date().toLocaleTimeString(),
          l2: {
            ...l2,
            asks: l2.asks.map(item => item).reverse(),
          },
        },
        ...books,
      ]);
    }
    client.on('ready', () => {
      trackEvent('ready');
      refreshOrderBook();
    });

    client.on('l2', () => {
      trackEvent('l2');
      refreshOrderBook();
    });

    client.on('l1', () => {
      trackEvent('l1');
    });

    client.on('connected', () => {
      trackEvent('connected');
    });

    client.on('disconnect', () => {
      trackEvent('disconnect');
    });

    return () => {
      client.removeAllListeners();
    };
  }, []);

  const renderBook = (bookState) => {
    console.log(bookState);
    if (!bookState?.l2?.bids) {
      return 'Error';
    }
    const firstAsk = bookState.l2.asks[0];
    const lastBid = bookState.l2.bids[bookState.l2.bids.length - 1];
    const spread = bookState.l2.asks[0] ? Math.round((firstAsk[0] - lastBid[0]) * 10000) / 10000 : '?'
    return (
      <>
        ASKS:
        {bookState.l2.asks.map((ask) => (
          <div key={JSON.stringify(ask)}>{JSON.stringify(ask)}</div>
        ))}
        BIDS  <small>\ Spread {spread}</small>
        {bookState.l2.bids.map((bid) => (
          <div key={JSON.stringify(bid)}>{JSON.stringify(bid)}</div>
        ))}
      </>
    );
  };

  return (
    <div>
      <h2>Orderbook {config.market}</h2>
      <p>{JSON.stringify(config)}</p>
      <br />
      {books[0] && renderBook(books[0])}
      <br />
      <h2>Events:</h2>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {events.map((event) => (
          <div key={event.localId}>{JSON.stringify(event)}</div>
        ))}
      </div>
      <br />
      <h2>History:</h2>
      {books.map((book) => (
        <div key={book.localId}>
          <u>Orderbook at {book.time} [Sequence {book?.l2?.sequence}]:</u>
          <br />
          {renderBook(book)}
          <br />
        </div>
      ))}
    </div>
  );
}

export default App;
