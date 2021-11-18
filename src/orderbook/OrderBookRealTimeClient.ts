import { EventEmitter } from 'events';

import { RestPublicClient } from '../client/rest';
import { WebSocketClient } from '../client/webSocket';

import {
  L1OrderBookToRestResponse,
  L2OrderBookToRestResponse,
  restResponseToL2OrderBook,
  webSocketResponseToL2OrderBook,
} from './apiConversions';

import {
  ORDER_BOOK_FIRST_LEVEL_MULTIPLIER_IN_PIPS,
  ORDER_BOOK_MAX_L2_LEVELS,
  ORDER_BOOK_HYBRID_SLIPPAGE,
} from '../constants';

import { L2LimitOrderBookToHybridOrderBooks } from './hybrid';
import {
  decimalToPip,
  oneInPips,
  multiplyPips,
  pipToDecimal,
} from '../pipmath';
import { L1Equal, L2toL1OrderBook, updateL2Levels } from './utils';

import type {
  L1OrderBook,
  L2OrderBook,
  OrderBookFeeRates,
  OrderBookRealTimeClientOptions,
  RestResponseOrderBookLevel1,
  RestResponseOrderBookLevel2,
  WebSocketResponse,
  WebSocketResponseL2OrderBookLong,
  WebSocketResponseTokenPriceLong,
} from '../types';
import { deriveBaseURL } from '../client/utils';

/**
 * Orderbook API client
 *
 * @example
 * import { OrderBookRealTimeClient } from '@idexio/idex-sdk';
 *
 * const client = new OrderBookRealTimeClient({
 *   multiverseChain: 'matic',
 *   sandbox: false,
 * });
 *
 * const markets = ['IDEX-USD'];
 * client.start(markets);
 *
 * function handleOrderBook(l2: L2OrderBook) {
 *   const l2 = await client.getOrderBookLevel2('IDEX-USD', 10);
 * }
 *
 * client.on('ready', handleOrderBook);
 * client.on('l2Changed', handleOrderBook);
 *
 * @param {OrderBookRealTimeClientOptions} options
 */
export class OrderBookRealTimeClient extends EventEmitter {
  /**
   * Set to the global idex fee rate on start (see: RestResponseExchangeInfo.takerIdexFeeRate).
   * Can be overriden to wallet-specific rates with setCustomFees().
   * Used to calculate synthetic price levels.
   *
   * @private
   */
  private idexFeeRate = BigInt(0);

  private readonly l1OrderBooks: Map<string, L1OrderBook> = new Map();

  private readonly l2OrderBooks: Map<string, L2OrderBook> = new Map();

  private readonly l2OrderBookUpdates = new Map<string, L2OrderBook[]>();

  private markets: string[] = [];

  private readonly marketsByAssetSymbol = new Map<string, Set<string>>();

  private readonly marketIsLoading = new Set<string>();

  /**
   * Set to the global pool fee rate on start (see: RestResponseExchangeInfo.takerLiquidityProviderFeeRate).
   * Can be overriden to wallet-specific rates with setCustomFees().
   * Used to calculate synthetic price levels.
   *
   * @private
   */
  private poolFeeRate = BigInt(0);

  private readonly restPublicClient: RestPublicClient;

  /**
   * Set to the global taker minimum trade size on start (see: RestResponseExchangeInfo.takerTradeMinimum).
   * Can be overriden to wallet-specific rates with setCustomFees().
   * Used to calculate synthetic price levels.
   *
   * @private
   */
  private takerMinimumInNativeAsset = BigInt(0);

  private readonly tokenPrices: Map<string, bigint | null> = new Map();

  private readonly webSocketClient: WebSocketClient;

  private webSocketConnectionListenersConfigured = false;

  private webSocketResponseListenerConfigured = false;

  constructor(options: OrderBookRealTimeClientOptions) {
    super();

    const { multiverseChain = 'matic', sandbox = false } = options;

    const restApiUrl = deriveBaseURL({
      sandbox,
      multiverseChain,
      overrideBaseURL: options.baseURL,
      api: 'rest',
    });
    const webSocketApiUrl = deriveBaseURL({
      sandbox,
      multiverseChain,
      overrideBaseURL: options.baseURL,
      api: 'rest',
    });

    this.restPublicClient = new RestPublicClient({
      apiKey: options.apiKey,
      baseURL: restApiUrl,
    });
    this.webSocketClient = new WebSocketClient({
      baseURL: webSocketApiUrl,
      shouldReconnectAutomatically: true,
      connectTimeout: options.connectTimeout,
    });
  }

  public getCurrentFeeRates(): OrderBookFeeRates {
    return {
      idexFeeRate: pipToDecimal(this.idexFeeRate),
      poolFeeRate: pipToDecimal(this.poolFeeRate),
      takerMinimumInNativeAsset: pipToDecimal(this.takerMinimumInNativeAsset),
    };
  }

  /**
   * Set custom fee rates for synthetic price level calculations.
   * Use this if your wallet has custom fee settings set.
   *
   * @param {Partial<OrderBookFeeRates>} rates
   */

  public setCustomFeeRates(rates: Partial<OrderBookFeeRates>): void {
    if (rates.idexFeeRate) {
      this.idexFeeRate = decimalToPip(rates.idexFeeRate);
    }
    if (rates.poolFeeRate) {
      this.poolFeeRate = decimalToPip(rates.poolFeeRate);
    }
    if (rates.takerMinimumInNativeAsset) {
      this.takerMinimumInNativeAsset = decimalToPip(
        rates.takerMinimumInNativeAsset,
      );
    }
  }

  /**
   * Loads initial state from REST API and begin listening to orderbook updates.
   *
   * @param {string[]} markets
   */
  public async start(markets: string[]): Promise<void> {
    this.markets = markets;
    this.mapTokensToMarkets();
    this.setupInternalWebSocket();
    await Promise.all([this.loadExchangeFeeRates(), this.loadTokenPrices()]);
    await this.webSocketClient.connect(true);
  }

  /**
   * Stop the order book client, and reset internal state.
   * Call this when you are no longer using the client, to release memory and network resources.
   */
  public stop(): void {
    if (this.webSocketClient.isConnected()) {
      this.webSocketClient.unsubscribe(['l2orderbook', 'tokenprice']);
      this.webSocketClient.disconnect();
    }
    this.resetInternalState();
  }

  /**
   * Load the current state of the level 1 orderbook for this market.
   *
   * @param {string} market
   * @return {RestResponseOrderBookLevel1}
   */
  public async getOrderBookL1(
    market: string,
  ): Promise<RestResponseOrderBookLevel1> {
    return L1OrderBookToRestResponse((await this.getHybridBooks(market)).l1);
  }

  /**
   * Load the current state of the level 2 orderbook for this market.
   *
   * @param {string} market
   * @param {number} [limit=100] - Total number of price levels (bids + asks) to return, between 2 and 1000
   * @returns {Promise<RestResponseOrderBookLevel2>}
   */
  public async getOrderBookL2(
    market: string,
    limit = 100,
  ): Promise<RestResponseOrderBookLevel2> {
    return L2OrderBookToRestResponse(
      (await this.getHybridBooks(market)).l2,
      limit,
    );
  }

  private applyOrderBookUpdates(market: string): void {
    const updates = this.l2OrderBookUpdates.get(market);
    if (!updates) {
      return;
    }
    const book = this.l2OrderBooks.get(market);
    if (!book) {
      return;
    }

    const beforeL1 = L2toL1OrderBook(book);
    for (const update of updates) {
      let wasValidUpdate = false;

      // an expected next update has arrived
      if (book.sequence + 1 === update.sequence) {
        updateL2Levels(book, update);
        wasValidUpdate = true;
      }

      // the pool was added or removed (sequence does not increment)
      if (book.sequence === update.sequence) {
        if (
          (beforeL1.pool !== null && update.pool === null) ||
          (beforeL1.pool === null && update.pool !== null)
        ) {
          book.pool = update.pool;
        }
        wasValidUpdate = true;
      }

      if (!wasValidUpdate) {
        this.stop();
        this.emit('error', new Error('unexpected missing websocket update'));
        return;
      }
    }
    const afterL1 = L2toL1OrderBook(book);

    this.l1OrderBooks.set(market, L2toL1OrderBook(book));
    if (!L1Equal(beforeL1, afterL1)) {
      this.emit('l1', market);
    }
    this.emit('l2', market);

    this.l2OrderBookUpdates.delete(market);
  }

  private async getHybridBooks(
    market: string,
  ): Promise<{ l1: L1OrderBook; l2: L2OrderBook }> {
    return L2LimitOrderBookToHybridOrderBooks(
      await this.loadLevel2(market),
      ORDER_BOOK_MAX_L2_LEVELS,
      ORDER_BOOK_HYBRID_SLIPPAGE,
      this.idexFeeRate,
      this.poolFeeRate,
      true,
      this.marketMinimum(market),
    );
  }

  private handleL2OrderBookMessage(
    message: WebSocketResponseL2OrderBookLong,
  ): void {
    // accumulate L2 updates to be applied
    const updatesToApply = this.l2OrderBookUpdates.get(message.market) || [];
    updatesToApply.push(webSocketResponseToL2OrderBook(message));
    this.l2OrderBookUpdates.set(message.market, updatesToApply);

    // apply updates to the in-memory orderbook, or load it for the first time
    this.applyOrderBookUpdates(message.market);
  }

  private handleTokenPriceMessage(
    message: WebSocketResponseTokenPriceLong,
  ): void {
    this.tokenPrices.set(
      message.token,
      message.price ? decimalToPip(message.price) : null,
    );
    const markets = this.marketsByAssetSymbol.get(message.token);
    if (markets) {
      for (const market of Array.from(markets.values())) {
        this.emit('l1', market);
        this.emit('l2', market);
      }
    }
  }

  private async loadExchangeFeeRates(): Promise<void> {
    const exchange = await this.restPublicClient.getExchangeInfo();
    this.poolFeeRate = decimalToPip(exchange.takerLiquidityProviderFeeRate);
    this.idexFeeRate = decimalToPip(exchange.takerIdexFeeRate);
    this.takerMinimumInNativeAsset = multiplyPips(
      ORDER_BOOK_FIRST_LEVEL_MULTIPLIER_IN_PIPS,
      decimalToPip(exchange.takerTradeMinimum),
    );
  }

  private async loadLevel2(market: string): Promise<L2OrderBook> {
    return (
      this.l2OrderBooks.get(market) ||
      restResponseToL2OrderBook(
        await this.restPublicClient.getOrderBookLevel2(market, 1000, true),
      )
    );
  }

  private async loadTokenPrices(): Promise<void> {
    const assets = await this.restPublicClient.getAssets();
    for (const asset of assets) {
      if (!this.tokenPrices.get(asset.symbol)) {
        this.tokenPrices.set(
          asset.symbol,
          asset.maticPrice ? decimalToPip(asset.maticPrice) : null,
        );
      }
    }
  }

  private mapTokensToMarkets(): void {
    for (const market of this.markets) {
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
  }

  private marketMinimum(market: string): bigint | null {
    const quoteSymbol = market.split('-')[1];
    const price = this.tokenPrices.get(quoteSymbol) || null;
    return price ? (this.takerMinimumInNativeAsset * oneInPips) / price : null;
  }

  private setupInternalWebSocket(): void {
    if (!this.webSocketConnectionListenersConfigured) {
      this.webSocketClient.onConnect(this.webSocketHandleConnect.bind(this));
      this.webSocketClient.onDisconnect(
        this.webSocketHandleDisconnect.bind(this),
      );
      this.webSocketClient.onError(this.webSocketHandleError.bind(this));
      this.webSocketConnectionListenersConfigured = true;
    }
  }

  private resetInternalState(): void {
    this.idexFeeRate = BigInt(0);
    this.poolFeeRate = BigInt(0);
    this.takerMinimumInNativeAsset = BigInt(0);
    this.tokenPrices.clear();
    this.l1OrderBooks.clear();
    this.l2OrderBooks.clear();
    this.l2OrderBookUpdates.clear();
    this.marketIsLoading.clear();
    this.marketsByAssetSymbol.clear();
  }

  private async webSocketHandleConnect() {
    if (!this.webSocketResponseListenerConfigured) {
      this.webSocketClient.onResponse(this.webSocketHandleResponse.bind(this));
      this.webSocketResponseListenerConfigured = true;
    }
    this.webSocketClient.subscribe([
      { name: 'l2orderbook', markets: this.markets },
    ]);
    this.webSocketClient.subscribe([
      { name: 'tokenprice', markets: this.markets },
    ]);
    await Promise.all(
      this.markets.map(async (market) => {
        const l2 = await this.loadLevel2(market);
        this.l2OrderBooks.set(market, l2);
        this.emit('ready', market);
      }),
    );
    this.emit('connected');
  }

  private webSocketHandleDisconnect() {
    this.stop();
    this.emit('disconnected');
  }

  private webSocketHandleError(error: Error) {
    this.emit('error', error);
  }

  private webSocketHandleResponse(response: WebSocketResponse): void {
    if (response.type === 'l2orderbook') {
      return this.handleL2OrderBookMessage(response.data);
    }
    if (response.type === 'tokenprice') {
      return this.handleTokenPriceMessage(response.data);
    }
  }
}
