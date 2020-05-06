import JSBI from 'jsbi';

import PublicClient from './clients/public';
import WebSocketClient from './clients/webSocket';
import { OrderBookPriceLevel } from './types/response';
import * as webSocketSubscriptionMessages from './types/webSocketSubscriptionMessages';
import * as numbers from './utils/numbers';

export interface L2OrderBookLevelWithPips {
  price: string;
  pricePip: JSBI;
  size: string;
  sizePip: JSBI;
}

interface L2OrderBook {
  bids: L2OrderBookLevelWithPips[];
  asks: L2OrderBookLevelWithPips[];
  sequenceNumber: string;
}

export class OrderBookService {
  // api clients
  private publicClient: PublicClient;
  private webSocketClient: WebSocketClient;

  private fetchOrderBookInterval: NodeJS.Timeout;
  private cachedL2OrderBookEvents: webSocketSubscriptionMessages.L2OrderBookLong[] = [];
  private isRebuildingOrderBook?: boolean;

  private marketSymbol: string;
  private l2OrderBook: L2OrderBook;

  constructor(publicClient: PublicClient, webSocketClient: WebSocketClient) {
    this.publicClient = publicClient;
    this.webSocketClient = webSocketClient;
  }

  private updateOrderBookPriceLevel(
    bidsOrAsks: L2OrderBookLevelWithPips[],
    priceLevelChange: L2OrderBookLevelWithPips,
  ): void {
    const bidOrAsk = bidsOrAsks.find(bidOrAsk =>
      JSBI.equal(bidOrAsk.pricePip, priceLevelChange.pricePip),
    );
    if (!bidOrAsk) {
      bidsOrAsks.push({
        price: priceLevelChange.price,
        pricePip: priceLevelChange.pricePip,
        size: priceLevelChange.size,
        sizePip: priceLevelChange.sizePip,
      });
      return;
    }
    // update the size
    const updatedQuantityPip = JSBI.add(
      bidOrAsk.sizePip,
      priceLevelChange.sizePip,
    );
    bidOrAsk.size = numbers.pipToDecimal(updatedQuantityPip);
    bidOrAsk.sizePip = updatedQuantityPip;
  }

  private applyChangesToOrderBook(
    changes: {
      asks: OrderBookPriceLevel[];
      bids: OrderBookPriceLevel[];
    },
    sequenceNumber: string,
  ) {
    const bids = this.l2OrderBook.bids.slice(0);
    const asks = this.l2OrderBook.asks.slice(0);

    // TODO remove price levels with 0 size

    // bids
    if (changes.bids) {
      changes.bids.forEach(priceLevelChange => {
        this.updateOrderBookPriceLevel(
          bids,
          this.transformL2OrderBookPriceLevel(priceLevelChange),
        );
      });

      this.sortRows(bids);
    }

    // asks
    if (changes.asks) {
      changes.asks.forEach(priceLevelChange => {
        this.updateOrderBookPriceLevel(
          asks,
          this.transformL2OrderBookPriceLevel(priceLevelChange),
        );
      });

      this.sortRows(asks);
    }

    this.setL2OrderBook(asks, bids, sequenceNumber);
  }

  private applyCachedOrderBookChanges() {
    const changes: {
      asks: OrderBookPriceLevel[];
      bids: OrderBookPriceLevel[];
    } = { bids: [], asks: [] };
    let sequenceNumber: string;

    if (!this.cachedL2OrderBookEvents.length) {
      return;
    }

    this.cachedL2OrderBookEvents.forEach(l2OrderBookEvent => {
      changes.asks = [...changes.asks, ...l2OrderBookEvent.asks];
      changes.bids = [...changes.bids, ...l2OrderBookEvent.bids];
      sequenceNumber = l2OrderBookEvent.sequence;
    });
    this.applyChangesToOrderBook(changes, sequenceNumber);
  }

  private transformL2OrderBookPriceLevel(
    priceLevel: OrderBookPriceLevel,
  ): L2OrderBookLevelWithPips {
    return {
      price: priceLevel.price,
      pricePip: numbers.decimalToPip(priceLevel.price),
      size: String(priceLevel.size),
      sizePip: numbers.decimalToPip(String(priceLevel.size)),
    };
  }

  private sortRows(
    priceLevels: L2OrderBookLevelWithPips[],
  ): L2OrderBookLevelWithPips[] {
    return priceLevels.sort((a, b) => {
      if (JSBI.greaterThan(a.pricePip, b.pricePip)) {
        return -1;
      } else if (JSBI.equal(a.pricePip, b.pricePip)) {
        return 0;
      }
      return 1;
    });
  }

  private setL2OrderBook(
    asks: L2OrderBookLevelWithPips[],
    bids: L2OrderBookLevelWithPips[],
    sequenceNumber: string,
  ): void {
    this.l2OrderBook = {
      asks,
      bids,
      sequenceNumber,
    };
  }

  private resetOrderbook(): void {
    this.setL2OrderBook([], [], '0');
  }

  private async fetchAndSaveOrderBook(): Promise<void> {
    const orderBook = await this.publicClient.getOrderBookLevel2(
      this.marketSymbol,
    );
    this.setL2OrderBook(
      orderBook.asks.map(this.transformL2OrderBookPriceLevel),
      orderBook.bids.map(this.transformL2OrderBookPriceLevel),
      orderBook.sequence,
    );
  }

  private cacheOrderBookChanges(
    l2OrderBookEvent: webSocketSubscriptionMessages.L2OrderBookLong,
  ): void {
    this.cachedL2OrderBookEvents = this.cachedL2OrderBookEvents.concat(
      l2OrderBookEvent,
    );
  }

  private setMarket(marketSymbol: string): void {
    this.marketSymbol = marketSymbol;
  }

  private reset(): void {
    this.cachedL2OrderBookEvents = [];
    this.resetOrderbook();
    this.webSocketClient.unsubscribe([{ name: 'l2orderbook', markets: [] }]);
    if (this.fetchOrderBookInterval) {
      clearInterval(this.fetchOrderBookInterval);
    }
  }

  private handleL2OrderBookWebSocketEvent(
    l2OrderBookEvent: webSocketSubscriptionMessages.L2OrderBookLong,
  ): void {
    if (l2OrderBookEvent.market !== this.marketSymbol) {
      return;
    }
    // TODO check if the sequence number is sequential
    if (!this.isRebuildingOrderBook) {
      this.applyChangesToOrderBook(
        { asks: l2OrderBookEvent.asks, bids: l2OrderBookEvent.bids },
        l2OrderBookEvent.sequence,
      );
      return;
    }

    this.cacheOrderBookChanges(l2OrderBookEvent);
  }

  public getOrderBook(): L2OrderBook {
    return this.l2OrderBook;
  }

  public async buildAndMaintainOrderBook(marketSymbol: string): Promise<void> {
    this.reset();
    this.isRebuildingOrderBook = true;
    this.setMarket(marketSymbol);

    this.webSocketClient.subscribe([
      {
        name: 'l2orderbook',
        markets: [marketSymbol],
      },
    ]);
    this.webSocketClient.onResponse(response => {
      if (response.type !== 'l2orderbook') {
        return;
      }
      this.handleL2OrderBookWebSocketEvent(response.data);
    });

    await this.fetchAndSaveOrderBook();

    this.fetchOrderBookInterval = setInterval(async () => {
      try {
        await this.fetchAndSaveOrderBook();

        const matchingSequenceNumberIndex = this.cachedL2OrderBookEvents.findIndex(
          l2OrderBookEvent =>
            l2OrderBookEvent.sequence === this.l2OrderBook.sequenceNumber,
        );
        if (matchingSequenceNumberIndex < 0) {
          return;
        }

        clearInterval(this.fetchOrderBookInterval);

        this.applyCachedOrderBookChanges();
        this.isRebuildingOrderBook = false;
      } catch (error) {
        console.error(error);
      }
    }, 5 * 1000);
  }
}
