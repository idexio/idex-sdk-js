import JSBI from 'jsbi';

import PublicClient from './clients/public';
import WebSocketClient from './clients/webSocket';
import { OrderBookPriceLevel } from './types/response';
import * as numbers from './numbers';

export interface L2OrderBookRowTransformed {
  price: string;
  pricePip: JSBI;
  quantity: string;
  quantityPip: JSBI;
}

type L2OrderBook = any; // TODO

export class OrderBookService {
  // api clients
  private publicClient: PublicClient;
  private webSocketClient: WebSocketClient;

  private cachedChanges: L2OrderBook[] = [];
  private isRebuildingOrderBook?: boolean;
  private marketSymbol: string;
  private level2Orderbook: {
    bids: L2OrderBookRowTransformed[];
    asks: L2OrderBookRowTransformed[];
    sequenceNumber: string;
  };

  constructor(publicClient: PublicClient, webSocketClient: WebSocketClient) {
    this.publicClient = publicClient;
    this.webSocketClient = webSocketClient;
  }

  /*

  private transformApiOrderBookRowChange(
    row: ApiLevelTwoOrderBookRow,
  ): LevelTwoOrderBookRowChange {
    return {
      price: row[0],
      pricePip: numbers.decimalToPip(row[0]),
      delta: row[1],
      deltaPip: numbers.decimalToPip(row[1]),
    };
  }
  */

  private updateOrderBookPriceLevel(
    levelTwoOrders: LevelTwoOrderBookRow[],
    rowChange: LevelTwoOrderBookRowChange,
  ) {
    const levelTwoOrder = levelTwoOrders.find(
      (levelTwoOrder: LevelTwoOrderBookRow) =>
        JSBI.equal(levelTwoOrder.pricePip, rowChange.pricePip),
    );
    if (!levelTwoOrder) {
      levelTwoOrders.push({
        price: rowChange.price,
        pricePip: rowChange.pricePip,
        quantity: rowChange.delta,
        quantityPip: rowChange.deltaPip,
      });
      return;
    }
    // update the quantity
    const updatedQuantityPip = JSBI.add(
      levelTwoOrder.quantityPip,
      rowChange.deltaPip,
    );
    levelTwoOrder.quantity = numbers.pipToDecimal(updatedQuantityPip);
    levelTwoOrder.quantityPip = updatedQuantityPip;
  }

  private applyChangesToOrderBook(
    changes: OrderBookChanges,
    sequenceNumber: number,
  ) {
    const bids = this.bids;
    const asks = this.asks;

    // bids
    if (changes.bids) {
      changes.bids.forEach(rowChange => {
        this.updateOrderBookPriceLevel(bids, rowChange);
      });

      // remove zero quantities
      const updatedBids = bids.filter(bid =>
        JSBI.greaterThan(bid.quantityPip, numbers.decimalToPip('0')),
      );

      this.sortRows(updatedBids);
      this.setBids(updatedBids, sequenceNumber);
    }

    // asks
    if (changes.asks) {
      changes.asks.forEach(rowChange => {
        this.updateOrderBookPriceLevel(asks, rowChange);
      });

      // remove zero quantities
      const updatedAsks = asks.filter(ask =>
        JSBI.greaterThan(ask.quantityPip, numbers.decimalToPip('0')),
      );
      this.sortRows(updatedAsks);
      this.setAsks(updatedAsks, sequenceNumber);
    }
  }

  private applyCachedOrderBookChanges(cachedChanges: CachedChange[]) {
    this.cachedChanges = [];
    if (!cachedChanges || !cachedChanges.length) {
      return;
    }

    const changes: OrderBookChanges = { bids: [], asks: [] };
    let sequenceNumber = 0;
    cachedChanges.forEach(cachedChange => {
      changes.bids = [...changes.bids, ...cachedChange.changes.bids];
      changes.asks = [...changes.asks, ...cachedChange.changes.asks];
      sequenceNumber = cachedChange.sequenceNumber;
    });
    this.applyChangesToOrderBook(changes, sequenceNumber);
  }

  public async buildInitialOrderBook(marketSymbol?: string) {
    this.cachedChanges = [];
    this.isRebuildingOrderBook = true;
    if (marketSymbol) {
      this.marketSymbol = marketSymbol;
    }
    if (this.fetchOrderBookInterval) {
      clearInterval(this.fetchOrderBookInterval);
    }
    if (this.applyCachedOrderBookChangesInterval) {
      clearInterval(this.applyCachedOrderBookChangesInterval);
    }

    // The order book changes are being cached by the datastream event handler.
    // This function will loop until the sequence number of the fetched order book
    // matches a sequence number of a cached order book change.

    this.sequenceNumberOfLastEvent = 0;
    this.resetOrderbook();
    try {
      if (this.marketSymbol) {
        await this.fetchAndSaveOrderBook(this.marketSymbol);
      }
    } catch (error) {
      console.warn(error);
    }

    this.fetchOrderBookInterval = setInterval(async () => {
      try {
        if (this.marketSymbol) {
          await this.fetchAndSaveOrderBook(this.marketSymbol);
        }
      } catch (error) {
        console.warn(error);
      }
      const matchingSequenceNumberIndex = this.cachedChanges.findIndex(
        (change: { changes: OrderBookChanges; sequenceNumber: number }) =>
          change.sequenceNumber === this.sequenceNumber,
      );
      if (matchingSequenceNumberIndex < 0) {
        return;
      }
      clearInterval(this.fetchOrderBookInterval);

      this.applyCachedOrderBookChanges(
        this.cachedChanges.slice(matchingSequenceNumberIndex + 1),
      );
      this.isRebuildingOrderBook = false;
      this.applyCachedOrderBookChangesInterval = setInterval(() => {
        this.applyCachedOrderBookChanges(this.cachedChanges.slice(0));
      }, 1000);
    }, 5 * 1000);
  }

  /** ******************* updated ****************** */

  private transformOrderBookRow(
    row: OrderBookPriceLevel,
  ): L2OrderBookRowTransformed {
    return {
      price: row[0],
      pricePip: numbers.decimalToPip(row[0]),
      quantity: row[1],
      quantityPip: numbers.decimalToPip(row[1]),
    };
  }

  private sortRows(rows: LevelTwoOrderBookRow[]) {
    return rows.sort((a: LevelTwoOrderBookRow, b: LevelTwoOrderBookRow) => {
      if (JSBI.greaterThan(a.pricePip, b.pricePip)) {
        return -1;
      } else if (JSBI.equal(a.pricePip, b.pricePip)) {
        return 0;
      }
      return 1;
    });
  }

  private setOrderBook(
    asks: L2OrderBook[],
    bids: L2OrderBook[],
    sequenceNumber: string,
  ): void {
    this.level2Orderbook = {
      asks,
      bids,
      sequenceNumber,
    };
  }

  private async fetchAndSaveOrderBook(marketSymbol: string): Promise<void> {
    const orderBook = await this.publicClient.getOrderBookLevel2(marketSymbol);
    this.setOrderBook(orderBook.asks, orderBook.bids, orderBook.sequence);
  }

  private cacheOrderBookChanges(orderBookEvent: L2OrderBook) {
    this.cachedChanges = this.cachedChanges.concat(orderBookEvent);
  }

  public handleL2OrderBookWebSocketEvent(orderBookEvent: L2OrderBook) {
    const { market, sequence, bids, asks } = orderBookEvent;
    if (!this.isRebuildingOrderBook) {
      // TODO apply the incoming event if the sequence number is sequential
    }

    this.cacheOrderBookChanges(orderBookEvent);
  }

  private resetOrderbook() {
    this.setOrderBook([], [], '0');
  }

  private changeMarket(marketSymbol: string) {
    this.marketSymbol = marketSymbol;
  }
}
