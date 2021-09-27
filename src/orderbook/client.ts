import { EventEmitter } from 'events';

import { RestPublicClient } from '../client/rest';
import { WebSocketClient } from '../client/webSocket';
import {
  ORDER_BOOK_MAX_L2_LEVELS,
  ORDER_BOOK_HYBRID_SLIPPAGE,
} from '../constants';
import { decimalToPip, oneInPips, pipToDecimal } from './numbers';

import {
  L1OrderBook,
  L2OrderBook,
  MultiverseChain,
  OrderBookLevelType,
  OrderBookLevelL2,
  RestResponseOrderBookLevel1,
  RestResponseOrderBookLevel2,
  RestResponseOrderBookPriceLevel,
  WebSocketResponse,
  WebSocketResponseL2OrderBookLong,
  WebSocketResponseTokenPriceLong,
} from '../types';

import { L2LimitOrderBookToHybridOrderBooks } from './quantities';

function getL1BookFromL2Book(l2: L2OrderBook): L1OrderBook {
  return {
    sequence: l2.sequence,
    asks: l2.asks.length
      ? {
          price: l2.asks[0].price,
          size: l2.asks[0].size,
          numOrders: l2.asks[0].numOrders,
        }
      : { price: BigInt(0), size: BigInt(0), numOrders: 0 },
    bids: l2.bids.length
      ? {
          price: l2.bids[0].price,
          size: l2.bids[0].size,
          numOrders: l2.bids[0].numOrders,
        }
      : { price: BigInt(0), size: BigInt(0), numOrders: 0 },
    pool: l2.pool,
  };
}

function L1OrderBookToRestResponse(
  l1: L1OrderBook,
): RestResponseOrderBookLevel1 {
  const asks: [RestResponseOrderBookPriceLevel] = [
    [
      pipToDecimal(l1.asks.price),
      pipToDecimal(l1.asks.size),
      l1.asks.numOrders,
    ],
  ];

  const bids: [RestResponseOrderBookPriceLevel] = [
    [
      pipToDecimal(l1.bids.price),
      pipToDecimal(l1.bids.size),
      l1.bids.numOrders,
    ],
  ];

  return {
    sequence: l1.sequence,
    asks,
    bids,
    pool: l1.pool
      ? {
          baseReserveQuantity: pipToDecimal(l1.pool.baseReserveQuantity),
          quoteReserveQuantity: pipToDecimal(l1.pool.quoteReserveQuantity),
        }
      : null,
  };
}

function L2OrderBookToRestResponse(
  l2: L2OrderBook,
  limit = 500,
): RestResponseOrderBookLevel2 {
  const asks: RestResponseOrderBookPriceLevel[] = l2.asks
    .slice(0, limit)
    .map((ask) => [
      pipToDecimal(ask.price),
      pipToDecimal(ask.size),
      ask.numOrders,
    ]);
  const bids: RestResponseOrderBookPriceLevel[] = l2.bids
    .slice(0, limit)
    .map((bid) => [
      pipToDecimal(bid.price),
      pipToDecimal(bid.size),
      bid.numOrders,
    ]);
  return {
    sequence: l2.sequence,
    asks,
    bids,
    pool: l2.pool
      ? {
          baseReserveQuantity: pipToDecimal(l2.pool.baseReserveQuantity),
          quoteReserveQuantity: pipToDecimal(l2.pool.quoteReserveQuantity),
        }
      : null,
  };
}

function restResponseToL2OrderBook(
  restResponseL2: RestResponseOrderBookLevel2,
): L2OrderBook {
  const type: OrderBookLevelType = 'limit';
  const asks = restResponseL2.asks.map((ask) => {
    return {
      price: decimalToPip(ask[0]),
      size: decimalToPip(ask[1]),
      numOrders: ask[2],
      type,
    };
  });
  const bids = restResponseL2.bids.map((bid) => {
    return {
      price: decimalToPip(bid[0]),
      size: decimalToPip(bid[1]),
      numOrders: bid[2],
      type,
    };
  });
  return {
    sequence: restResponseL2.sequence,
    asks,
    bids,
    pool: restResponseL2.pool
      ? {
          baseReserveQuantity: decimalToPip(
            restResponseL2.pool.baseReserveQuantity,
          ),
          quoteReserveQuantity: decimalToPip(
            restResponseL2.pool.quoteReserveQuantity,
          ),
        }
      : null,
  };
}

function updateL2Levels(book: L2OrderBook, updatedLevels: L2OrderBook): void {
  /* eslint-disable no-param-reassign */
  book.sequence = updatedLevels.sequence;
  book.asks = updateL2Side(true, book.asks, updatedLevels.asks);
  book.bids = updateL2Side(false, book.bids, updatedLevels.bids);
  book.pool = updatedLevels.pool;
  /* eslint-enable no-param-reassign */
}

function updateL2Side(
  isAscending: boolean,
  side: OrderBookLevelL2[],
  updates: OrderBookLevelL2[],
): OrderBookLevelL2[] {
  let nextUpdate = updates.shift();
  if (!nextUpdate) {
    return side;
  }

  const isBefore = function isBefore(
    a: OrderBookLevelL2,
    b: OrderBookLevelL2,
  ): boolean {
    if (isAscending && a.price < b.price) {
      return true;
    }
    if (!isAscending && a.price > b.price) {
      return true;
    }
    return false;
  };

  const newLevels: OrderBookLevelL2[] = [];

  side.forEach((level: OrderBookLevelL2) => {
    // add all new updates before the existing level
    while (nextUpdate && isBefore(nextUpdate, level)) {
      newLevels.push(nextUpdate);
      nextUpdate = updates.shift();
    }

    // add either the next update (if overwriting), or the next level
    if (nextUpdate && level.price === nextUpdate.price) {
      if (nextUpdate.size > BigInt(0)) {
        newLevels.push(nextUpdate);
      }
      nextUpdate = updates.shift();
    } else {
      newLevels.push(level);
    }
  });

  // add all updates that go beyond the end
  while (nextUpdate) {
    newLevels.push(nextUpdate);
    nextUpdate = updates.shift();
  }

  return newLevels;
}

function webSocketResponseToL2OrderBook(
  response: WebSocketResponseL2OrderBookLong,
): L2OrderBook {
  return {
    sequence: response.sequence,
    asks: response.asks.map((ask) => {
      return {
        price: decimalToPip(ask[0]),
        size: decimalToPip(ask[1]),
        numOrders: ask[2],
        type: 'limit',
      };
    }),
    bids: response.bids.map((bid) => {
      return {
        price: decimalToPip(bid[0]),
        size: decimalToPip(bid[1]),
        numOrders: bid[2],
        type: 'limit',
      };
    }),
    pool: response.pool
      ? {
          baseReserveQuantity: decimalToPip(response.pool.baseReserveQuantity),
          quoteReserveQuantity: decimalToPip(
            response.pool.quoteReserveQuantity,
          ),
        }
      : null,
  };
}

export default class OrderBookRealTimeClient extends EventEmitter {
  private readonly assetPrices: Map<string, bigint | null> = new Map();

  private idexFeeRate = BigInt(0);

  private readonly l1OrderBooks: Map<string, L1OrderBook> = new Map();

  private readonly l2OrderBooks: Map<string, L2OrderBook> = new Map();

  private readonly l2OrderBookUpdates = new Map<string, L2OrderBook[]>();

  private readonly marketsByAssetSymbol = new Map<string, Set<string>>();

  private readonly marketIsLoading = new Set<string>();

  private poolFeeRate = BigInt(0);

  private readonly publicClient: RestPublicClient;

  private takerMinimumInNativeAsset = BigInt(0);

  private webSocketClient: WebSocketClient;

  private readonly webSocketSubscriptions = new Set<string>();

  constructor(
    sandbox = false,
    multiverseChain: MultiverseChain,
    restApiUrl?: string,
    webSocketApiUrl?: string,
  ) {
    super();

    this.publicClient = new RestPublicClient({
      multiverseChain,
      sandbox,
      ...(restApiUrl ? { baseURL: restApiUrl } : {}),
    });

    const wsClient = new WebSocketClient({
      multiverseChain,
      sandbox,
      shouldReconnectAutomatically: true,
      ...(restApiUrl ? { baseURL: webSocketApiUrl } : {}),
    });

    this.webSocketClient = wsClient;
  }

  public getCurrentFeeRates(): {
    idexFeeRate: string;
    poolFeeRate: string;
    takerMinimumInNativeAsset: string;
  } {
    return {
      idexFeeRate: pipToDecimal(this.idexFeeRate),
      poolFeeRate: pipToDecimal(this.poolFeeRate),
      takerMinimumInNativeAsset: pipToDecimal(this.takerMinimumInNativeAsset),
    };
  }

  public setCustomFeeRates(options: {
    idexFeeRate?: string;
    poolFeeRate?: string;
    takerMinimumInNativeAsset?: string;
  }): void {
    if (options.idexFeeRate) {
      this.idexFeeRate = decimalToPip(options.idexFeeRate);
    }
    if (options.poolFeeRate) {
      this.poolFeeRate = decimalToPip(options.poolFeeRate);
    }
    if (options.takerMinimumInNativeAsset) {
      this.takerMinimumInNativeAsset = decimalToPip(
        options.takerMinimumInNativeAsset,
      );
    }
  }

  public async start(markets: string[]): Promise<void> {
    // maps tokens to markets, for handling token price updates
    for (const market of markets) {
      const [baseSymbol, quoteSymbol] = market.split('-');
      const marketsByBase =
        this.marketsByAssetSymbol.get(baseSymbol) || new Set<string>();
      marketsByBase.add(market);
      this.marketsByAssetSymbol.set(baseSymbol, marketsByBase);
      const marketsByQuote =
        this.marketsByAssetSymbol.get(quoteSymbol) || new Set<string>();
      marketsByQuote.add(market);
      this.marketsByAssetSymbol.set(quoteSymbol, marketsByQuote);
    }

    // global fee settings
    const exchange = await this.publicClient.getExchangeInfo();
    this.poolFeeRate = decimalToPip(exchange.takerLiquidityProviderFeeRate);
    this.idexFeeRate = decimalToPip(exchange.takerIdexFeeRate);
    this.takerMinimumInNativeAsset =
      BigInt(2) * decimalToPip(exchange.takerTradeMinimum);

    this.webSocketClient.onConnect(() => {
      this.webSocketClient.subscribe([{ name: 'l2orderbook', markets }]);
      this.webSocketClient.subscribe([{ name: 'tokenprice', markets }]);
      markets.forEach((market) => this.webSocketSubscriptions.add(market));
      this.webSocketClient.onResponse((response: WebSocketResponse) => {
        console.log(response);
        if (response.type === 'l2orderbook') {
          return this.handleL2OrderBookMessage(response.data);
        }
        if (response.type === 'tokenprice') {
          return this.handleTokenPriceMessage(response.data);
        }
      });
    });
    await this.webSocketClient.connect(true);
  }

  public stop(): void {
    this.webSocketClient?.disconnect();
  }

  private async loadOrderBookWithMinimumSequence(
    market: string,
    sequence: number,
  ): Promise<void> {
    if (this.marketIsLoading.has(market)) {
      return;
    }
    this.marketIsLoading.add(market);
    let book = restResponseToL2OrderBook(
      await this.publicClient.getOrderBookLevel2(market, 500),
    );
    while (book.sequence < sequence) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // eslint-disable-line
      book = restResponseToL2OrderBook(await this.publicClient.getOrderBookLevel2(market, 500, true)); // eslint-disable-line
    }
    this.l2OrderBooks.set(market, book);
    this.applyOrderBookUpdates(market, book);
    this.marketIsLoading.delete(market);
  }

  private applyOrderBookUpdates(market: string, book: L2OrderBook): void {
    const updates = this.l2OrderBookUpdates.get(market);
    if (!updates) {
      return;
    }
    for (const update of updates) {
      // @todo this is not updating on pool additions, because the sequence did not change
      if (book.sequence === update.sequence - 1) {
        updateL2Levels(book, update);
      }
    }

    this.l1OrderBooks.set(market, getL1BookFromL2Book(book));

    this.emit('l1Changed', market);
    this.emit('l2Changed', market);

    this.l2OrderBookUpdates.set(market, []);
  }

  private async handleL2OrderBookMessage(
    message: WebSocketResponseL2OrderBookLong,
  ): Promise<void> {
    if (!this.webSocketSubscriptions.has(message.market)) {
      return;
    }

    const updatesToApply = this.l2OrderBookUpdates.get(message.market) || [];
    updatesToApply.push(webSocketResponseToL2OrderBook(message));
    this.l2OrderBookUpdates.set(message.market, updatesToApply);

    const l2Book = this.l2OrderBooks.get(message.market);
    if (!l2Book) {
      if (!this.marketIsLoading.has(message.market)) {
        this.loadOrderBookWithMinimumSequence(
          message.market,
          updatesToApply[0].sequence,
        );
      }
      return;
    }
    this.applyOrderBookUpdates(message.market, l2Book);
    this.l2OrderBooks.set(message.market, l2Book);
  }

  private async handleTokenPriceMessage(
    message: WebSocketResponseTokenPriceLong,
  ): Promise<void> {
    console.log('Token price change ', message);
    this.assetPrices.set(
      message.token,
      message.price ? BigInt(message.price) : null,
    );
    const markets = this.marketsByAssetSymbol.get(message.token);
    if (markets) {
      for (const market of Array.from(markets.values())) {
        this.emit('l1Changed', market);
        this.emit('l2Changed', market);
      }
    }
  }

  public async getOrderBookL1(
    market: string,
    isHybrid = true,
  ): Promise<RestResponseOrderBookLevel1> {
    const orderBook = await this.loadL2AndAssets(market);

    if (!isHybrid) {
      return L1OrderBookToRestResponse(getL1BookFromL2Book(orderBook));
    }

    const minimum = this.marketMinimum(market, this.takerMinimumInNativeAsset);
    const [l1] = L2LimitOrderBookToHybridOrderBooks(
      orderBook,
      ORDER_BOOK_MAX_L2_LEVELS,
      ORDER_BOOK_HYBRID_SLIPPAGE,
      this.idexFeeRate,
      this.poolFeeRate,
      true,
      minimum,
    );

    return L1OrderBookToRestResponse(l1);
  }

  public async getOrderBookL2(
    market: string,
    isHybrid = true,
    limit = 50,
  ): Promise<RestResponseOrderBookLevel2> {
    const orderBook = await this.loadL2AndAssets(market);

    if (!isHybrid) {
      return L2OrderBookToRestResponse(orderBook, limit);
    }

    const minimum = this.marketMinimum(market, this.takerMinimumInNativeAsset);
    const [, l2] = L2LimitOrderBookToHybridOrderBooks(
      orderBook,
      ORDER_BOOK_MAX_L2_LEVELS,
      ORDER_BOOK_HYBRID_SLIPPAGE,
      this.idexFeeRate,
      this.poolFeeRate,
      true,
      minimum,
    );

    return L2OrderBookToRestResponse(l2, limit);
  }

  private async loadL2AndAssets(market: string): Promise<L2OrderBook> {
    const orderBook = this.l2OrderBooks.get(market);

    if (orderBook) {
      return orderBook;
    }

    const loadedOrderBook = restResponseToL2OrderBook(
      await this.publicClient.getOrderBookLevel2(market),
    );

    const assets = await this.publicClient.getAssets();
    for (const asset of assets) {
      if (!this.assetPrices.get(asset.symbol)) {
        this.assetPrices.set(
          asset.symbol,
          asset.maticPrice ? decimalToPip(asset.maticPrice) : null,
        );
      }
    }

    return loadedOrderBook;
  }

  private marketMinimum(
    market: string,
    takerMinimumInNativeAsset: bigint | null,
  ): bigint | null {
    if (!takerMinimumInNativeAsset) {
      return null;
    }
    const quoteSymbol = market.split('-')[1];
    const price = this.assetPrices.get(quoteSymbol) || null;
    return price ? (takerMinimumInNativeAsset * oneInPips) / price : null;
  }
}
