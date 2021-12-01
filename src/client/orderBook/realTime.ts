import { EventEmitter } from 'events';

import { deriveBaseURL } from '../utils';
import { RestPublicClient } from '../rest';
import { WebSocketClient } from '../webSocket';
import { L2LimitOrderBookToHybridOrderBooks } from '../../orderbook/hybrid';
import { L2toL1OrderBook } from '../../orderbook/utils';
import {
  decimalToPip,
  oneInPips,
  multiplyPips,
  pipToDecimal,
} from '../../pipmath';
import { L1Equal, updateL2Levels } from './utils';
import type {
  L1OrderBook,
  L2OrderBook,
  MultiverseChain,
  OrderBookFeesAndMinimums,
  RestResponseOrderBookLevel1,
  RestResponseOrderBookLevel2,
  WebSocketResponse,
  WebSocketResponseTokenPriceLong,
} from '../../types';
import {
  L1OrderBookToRestResponse,
  L2OrderBookToRestResponse,
  restResponseToL2OrderBook,
  webSocketResponseToL2OrderBook,
} from '../../orderbook/apiConversions';
import {
  ORDER_BOOK_FIRST_LEVEL_MULTIPLIER_IN_PIPS,
  ORDER_BOOK_MAX_L2_LEVELS,
  ORDER_BOOK_HYBRID_SLIPPAGE,
} from '../../constants';

/**
 * Orderbook Client Options
 *
 * @typedef {Object} OrderBookRealTimeClientOptions
 * @property {string} [apiKey] - Increases rate limits if provided
 * @property {number} [connectTimeout] - Connection timeout for websocket (default 5000)
 * @property {boolean} [sandbox] - If true, client will point to API sandbox
 * @property {MultiverseChain} [multiverseChain=matic] - Which multiverse chain the client will point to
 */
export interface OrderBookRealTimeClientOptions {
  apiKey?: string;
  connectTimeout?: number;
  sandbox?: boolean;
  multiverseChain?: MultiverseChain;
  restBaseURL?: string;
  websocketBaseURL?: string;
}

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
  private takerIdexFeeRate = BigInt(0);

  private isFeesAndMinimumsLoaded = false;

  private readonly l1OrderBooks: Map<string, L1OrderBook> = new Map();

  private readonly l2OrderBooks: Map<string, L2OrderBook> = new Map();

  private readonly l2OrderBookUpdates = new Map<string, L2OrderBook[]>();

  private markets: string[] = [];

  private readonly marketsByAssetSymbol = new Map<string, Set<string>>();

  /**
   * Set to the global pool fee rate on start (see: RestResponseExchangeInfo.takerLiquidityProviderFeeRate).
   * Can be overriden to wallet-specific rates with setCustomFees().
   * Used to calculate synthetic price levels.
   *
   * @private
   */
  private takerLiquidityProviderFeeRate = BigInt(0);

  private readonly restPublicClient: RestPublicClient;

  /**
   * Set to the global taker minimum trade size on start (see: RestResponseExchangeInfo.takerTradeMinimum).
   * Can be overriden to wallet-specific rates with setCustomFees().
   * Used to calculate synthetic price levels.
   *
   * @private
   */
  private takerTradeMinimum = BigInt(0);

  private readonly tokenPrices: Map<string, bigint | null> = new Map();

  private readonly webSocketClient: WebSocketClient;

  private webSocketConnectionListenersConfigured = false;

  private webSocketResponseListenerConfigured = false;

  constructor(
    options: OrderBookRealTimeClientOptions,
    feesAndMinimumsOverride?: OrderBookFeesAndMinimums,
  ) {
    super();

    const { multiverseChain = 'matic', sandbox = false } = options;

    const restApiUrl = deriveBaseURL({
      sandbox,
      multiverseChain,
      overrideBaseURL: options.restBaseURL,
      api: 'rest',
    });
    const webSocketApiUrl = deriveBaseURL({
      sandbox,
      multiverseChain,
      overrideBaseURL: options.websocketBaseURL,
      api: 'websocket',
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

    if (feesAndMinimumsOverride) {
      this.setFeesAndMinimumsOverride(feesAndMinimumsOverride);
      this.isFeesAndMinimumsLoaded = true;
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
    await this.webSocketClient.connect(true);
  }

  /**
   * Stop the order book client, and reset internal state.
   * Call this when you are no longer using the client, to release memory and network resources.
   */
  public stop(): void {
    if (this.webSocketClient.isConnected()) {
      this.unsubscribe();
      this.webSocketClient.disconnect();
    }
    this.resetInternalState();
  }

  /**
   * Set custom fee rates for synthetic price level calculations. Use this if your wallet has
   * custom fees set.
   *
   * @param {Partial<OrderBookFeeRates>} rates
   */
  public setFeesAndMinimumsOverride(
    feesAndMinimumsOverride: Partial<OrderBookFeesAndMinimums>,
  ): void {
    if (feesAndMinimumsOverride.takerIdexFeeRate) {
      this.takerIdexFeeRate = decimalToPip(
        feesAndMinimumsOverride.takerIdexFeeRate,
      );
    }
    if (feesAndMinimumsOverride.takerLiquidityProviderFeeRate) {
      this.takerLiquidityProviderFeeRate = decimalToPip(
        feesAndMinimumsOverride.takerLiquidityProviderFeeRate,
      );
    }
    if (feesAndMinimumsOverride.takerTradeMinimum) {
      this.takerTradeMinimum = multiplyPips(
        ORDER_BOOK_FIRST_LEVEL_MULTIPLIER_IN_PIPS,
        decimalToPip(feesAndMinimumsOverride.takerTradeMinimum),
      );
    }
  }

  public getCurrentFeesAndMinimums(): OrderBookFeesAndMinimums {
    return {
      takerIdexFeeRate: pipToDecimal(this.takerIdexFeeRate),
      takerLiquidityProviderFeeRate: pipToDecimal(
        this.takerLiquidityProviderFeeRate,
      ),
      takerTradeMinimum: pipToDecimal(this.takerTradeMinimum),
    };
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

  private async getHybridBooks(
    market: string,
  ): Promise<{ l1: L1OrderBook; l2: L2OrderBook }> {
    return L2LimitOrderBookToHybridOrderBooks(
      await this.loadLevel2(market),
      ORDER_BOOK_MAX_L2_LEVELS,
      ORDER_BOOK_HYBRID_SLIPPAGE,
      this.takerIdexFeeRate,
      this.takerLiquidityProviderFeeRate,
      true,
      this.getMarketMinimum(market),
    );
  }

  private async applyOrderBookUpdates(market: string): Promise<void> {
    const updates = this.l2OrderBookUpdates.get(market);
    if (!updates) {
      return;
    }
    const book = this.l2OrderBooks.get(market);
    // If this market has not yet been synchronized from the REST API then halt processing -
    // messages for the market will queue and proccess after it runs
    if (!book) {
      return;
    }

    const beforeL1 = L2toL1OrderBook(book);
    for (const update of updates) {
      // outdated sequence, ignore
      if (book.sequence > update.sequence) {
        // eslint-disable-next-line no-continue
        continue;
      }
      // an expected next update has arrived
      else if (book.sequence + 1 === update.sequence) {
        updateL2Levels(book, update);
      }
      // the pool was updated (sequence does not increment)
      else if (book.sequence === update.sequence) {
        book.pool = update.pool;
      } else {
        // If an invalid update arrives, reset all data and synchronize anew
        this.emit('disconnected');
        this.emit(
          'error',
          new Error(
            `Missing l2 update sequence, current book is ${book.sequence} message was ${update.sequence}`,
          ),
        );
        this.unsubscribe();
        this.resetInternalState();
        this.subscribe();

        // eslint-disable-next-line no-await-in-loop
        await this.synchronizeFromRestApi();

        this.emit('connected');

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

  private applyTokenPriceUpdate(
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

  private async loadFeesAndMinimums(): Promise<void> {
    // Global fee rates only need to be loaded once as they are static and to allow for overriding
    if (this.isFeesAndMinimumsLoaded) {
      return;
    }

    const {
      takerLiquidityProviderFeeRate,
      takerIdexFeeRate,
      takerTradeMinimum,
    } = await this.restPublicClient.getExchangeInfo();
    this.takerLiquidityProviderFeeRate = decimalToPip(
      takerLiquidityProviderFeeRate,
    );
    this.takerIdexFeeRate = decimalToPip(takerIdexFeeRate);
    this.takerTradeMinimum = multiplyPips(
      ORDER_BOOK_FIRST_LEVEL_MULTIPLIER_IN_PIPS,
      decimalToPip(takerTradeMinimum),
    );

    this.isFeesAndMinimumsLoaded = true;
  }

  private async synchronizeFromRestApi(): Promise<void> {
    const sleep = (ms: number) => {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    };
    let reconnectAttempt = 0;

    // Updates cannot be applied until successfully synchronized with the REST API, so keep trying
    // with exponential backoff until success
    while (true) {
      const backoffSeconds = 2 ** reconnectAttempt;
      reconnectAttempt += 1;
      try {
        // Load minimums and token pries first so synthetic orderbook calculations are accurate
        // eslint-disable-next-line no-await-in-loop
        await Promise.all([this.loadFeesAndMinimums(), this.loadTokenPrices()]);

        // eslint-disable-next-line no-await-in-loop
        await Promise.all([
          ...this.markets.map(async (market) => {
            const l2 = await this.loadLevel2(market);
            this.l2OrderBooks.set(market, l2);
            this.emit('ready', market);
          }),
        ]);

        return;
      } catch (error) {
        this.emit('error', error);
        // eslint-disable-next-line no-await-in-loop
        await sleep(backoffSeconds * 1000);
      }
    }
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

  private getMarketMinimum(market: string): bigint | null {
    const quoteSymbol = market.split('-')[1];
    const price = this.tokenPrices.get(quoteSymbol) || null;
    return price ? (this.takerTradeMinimum * oneInPips) / price : null;
  }

  private resetInternalState(): void {
    this.takerIdexFeeRate = BigInt(0);
    this.takerLiquidityProviderFeeRate = BigInt(0);
    this.takerTradeMinimum = BigInt(0);
    this.tokenPrices.clear();
    this.l1OrderBooks.clear();
    this.l2OrderBooks.clear();
    this.l2OrderBookUpdates.clear();
  }

  /* Connection management */

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

  private subscribe(): void {
    this.webSocketClient.subscribe([
      { name: 'l2orderbook', markets: this.markets },
    ]);
    this.webSocketClient.subscribe([
      { name: 'tokenprice', markets: this.markets },
    ]);
  }

  private unsubscribe(): void {
    this.webSocketClient.unsubscribe(['l2orderbook', 'tokenprice']);
  }

  /* Event handlers */

  private async webSocketHandleConnect() {
    if (!this.webSocketResponseListenerConfigured) {
      this.webSocketClient.onResponse(this.webSocketHandleResponse.bind(this));
      this.webSocketResponseListenerConfigured = true;
    }

    this.subscribe();

    await this.synchronizeFromRestApi();

    this.emit('connected');
  }

  private webSocketHandleDisconnect() {
    // Assume messages will be lost during disconnection and clear state. State will be re-synchronized again on reconnect
    this.resetInternalState();

    this.emit('disconnected');
  }

  private webSocketHandleError(error: Error) {
    this.emit('error', error);
  }

  private async webSocketHandleResponse(
    response: WebSocketResponse,
  ): Promise<void> {
    if (response.type === 'l2orderbook') {
      // accumulate L2 updates to be applied
      const updatesToApply =
        this.l2OrderBookUpdates.get(response.data.market) || [];
      updatesToApply.push(webSocketResponseToL2OrderBook(response.data));
      this.l2OrderBookUpdates.set(response.data.market, updatesToApply);

      await this.applyOrderBookUpdates(response.data.market);
    }

    if (response.type === 'tokenprice') {
      return this.applyTokenPriceUpdate(response.data);
    }
  }
}
