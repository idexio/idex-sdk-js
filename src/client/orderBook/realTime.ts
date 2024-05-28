import { EventEmitter } from 'events';

import { decimalToPip, exchangeDecimals } from '#pipmath';

import { L1Equal, updateL2Levels } from '#client/orderBook/utils';
import { RestPublicClient } from '#client/rest/public';
import { WebSocketClient } from '#client/webSocket/index';
import {
  L1OrderBookToRestResponse,
  L2OrderBookToRestResponse,
  restResponseToL2OrderBook,
  webSocketResponseToL2OrderBook,
} from '#orderbook/apiConversions';
import { aggregateL2OrderBookAtTickSize } from '#orderbook/quantities';
import { L2toL1OrderBook } from '#orderbook/utils';
import {
  MessageEventType,
  OrderBookRealTimeClientEvent,
  SubscriptionNamePublic,
} from '#types/enums/index';

import type * as idex from '#index';
import type { IDEXMessageEvent } from '#types/webSocket/request/subscriptions';
import type { ErrorEvent } from 'ws';

/**
 * Orderbook Client Options
 *
 * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/OrderBookRealTimeClient.html)
 */
export interface OrderBookRealTimeClientOptions {
  /**
   * Optionally provide an `apiKey` for increased rate limiting
   */
  apiKey?: string;
  /**
   * Controls whether the production or sandbox endpoints will be used
   */
  sandbox?: boolean;
  /**
   * Optionally provide a custom url to use when making IDEX REST API requests.
   *
   * - Will override the {@link sandbox} option when given.
   */
  baseRestApiURL?: string;
  /**
   * Optionally provide a custom WebSocket API URL to use when connecting to
   * the IDEX WebSocket API.
   *
   * - Will override the {@link sandbox} option when given.
   */
  baseWebSocketURL?: string;
  marketsResponse?: idex.RestResponseGetMarkets;
}

/**
 * Orderbook API client
 *
 * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/OrderBookRealTimeClient.html)
 * @see options  {@link OrderBookRealTimeClientOptions}
 * @see events   {@link OrderBookRealTimeClientEvent}
 *
 * @category API Clients
 *
 * @example
 * ```typescript
 * import {
 *  OrderBookRealTimeClient,
 *  OrderBookRealTimeClientEvent,
 *  type L2OrderBook
 * } from '@idexio/idex-sdk';
 *
 * // type is just to show it will match the form string-string.
 * // actual type will be typed as string
 * type MarketSymbol = `${string}-${string}`;
 *
 * const LIMIT = 10;
 * const MARKETS: MarketSymbol[] = ['IDEX-USD'];
 *
 * const client = new OrderBookRealTimeClient({
 *   sandbox: true,
 * });
 *
 * client.start(MARKETS);
 *
 * const orderbooksMap = new Map<MarketSymbol, L2OrderBook>()
 *
 * async function handleOrderBookLevel2(market: MarketSymbol) {
 *   const levelTwoOrderBook = await client.getOrderBookL2(market, LIMIT);
 *
 *   orderbooksMap.set(market, levelTwoOrderBook)
 *
 *   console.log('Updated OrderBook for market: ', market, levelTwoOrderBook);
 * }
 *
 * client.on(OrderBookRealTimeClientEvent.ready, () => {
 *  MARKETS.forEach(market => {
 *    handleOrderBookLevel2(market)
 *  })
 * });
 *
 * client.on(OrderBookRealTimeClientEvent.l2, handleOrderBookLevel2);
 * ```
 */
export class OrderBookRealTimeClient extends EventEmitter<{
  [OrderBookRealTimeClientEvent.ready]: [market: string];
  [OrderBookRealTimeClientEvent.connected]: [];
  [OrderBookRealTimeClientEvent.disconnected]: [];
  [OrderBookRealTimeClientEvent.error]: [error: Error];
  [OrderBookRealTimeClientEvent.l1]: [market: string];
  [OrderBookRealTimeClientEvent.l2]: [market: string];
  [OrderBookRealTimeClientEvent.sync]: [market: string];
}> {
  private readonly l1OrderBooks: Map<string, idex.L1OrderBook> = new Map();

  private readonly l2OrderBooks: Map<string, idex.L2OrderBook> = new Map();

  private readonly l2OrderBookUpdates = new Map<string, idex.L2OrderBook[]>();

  private markets: string[] = [];

  private readonly marketsByAssetSymbol = new Map<string, Set<string>>();

  /**
   * When creating an {@link OrderBookRealTimeClient}, a public client is automatically
   * created and can be used based to make additional public requests if needed.
   *
   * - Can be utilized to fetch public data instead of creating both clients.
   *
   * @category Accessors
   */

  public readonly public: RestPublicClient;

  private marketsResponse: idex.RestResponseGetMarkets | undefined = undefined;

  private isTickSizesLoaded = false;

  private readonly tickSizesByMarket: Map<string, bigint> = new Map();

  private readonly webSocketClient: WebSocketClient;

  private webSocketConnectionListenersConfigured = false;

  private webSocketResponseListenerConfigured = false;

  /**
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/OrderBookRealTimeClient.html)
   *
   * @category Constructor
   */
  constructor(options: OrderBookRealTimeClientOptions = {}) {
    super();

    const { sandbox = false } = options;

    this.marketsResponse = options.marketsResponse;

    this.public = new RestPublicClient({
      sandbox,
      apiKey: options.apiKey,
      baseURL: options.baseRestApiURL,
    });

    this.webSocketClient = new WebSocketClient({
      sandbox,
      baseRestApiURL: options.baseRestApiURL,
      baseWebSocketURL: options.baseWebSocketURL,
    });
  }

  /**
   * Loads initial state from REST API and begin listening to orderbook updates.
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/OrderBookRealTimeClient.html#start)
   *
   * @category Connection Management
   */
  public async start(
    markets: string[],
    marketsResponse?: idex.RestResponseGetMarkets,
  ) {
    this.markets = markets;
    if (marketsResponse) {
      this.marketsResponse = marketsResponse;
    }
    this.mapTokensToMarkets();
    this.setupInternalWebSocket();
    await this.webSocketClient.connect(true);
  }

  /**
   * Stop the order book client, and reset internal state.
   * Call this when you are no longer using the client, to release memory and network resources.
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/OrderBookRealTimeClient.html#stop)
   *
   * @category Connection Management
   */
  public stop() {
    if (this.webSocketClient.isConnected) {
      this.unsubscribe();
      this.webSocketClient.disconnect();
    }
    this.resetInternalState(true);
  }

  public async getMaximumTickSizeUnderSpread(market: string) {
    const { bids } = await this.getOrderBookL2(market, 1000);
    const minBidPrice = bids.length > 0 && bids[bids.length - 1][0];
    const numDigits =
      minBidPrice ?
        decimalToPip(minBidPrice).toString().length
      : exchangeDecimals;

    return BigInt(10 ** (Math.min(numDigits, exchangeDecimals) - 1));
  }

  /**
   * Load the current state of the level 1 orderbook for this market.
   *
   * @param tickSize
   *   Minimum price movement expressed in pips (10^-8), defaults to market setting
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/OrderBookRealTimeClient.html#getOrderBookL1)
   * @see response {@link RestResponseGetOrderBookLevel1}
   *
   * @category Requests
   */
  public async getOrderBookL1(market: string, tickSize?: bigint | undefined) {
    return L1OrderBookToRestResponse(
      (await this.getOrderBooks(market, tickSize)).l1,
    );
  }

  /**
   * Load the current state of the level 2 orderbook for this market.
   *
   * @param limit
   *   Total number of price levels (bids + asks) to return
   *   - Between 2 and 1000
   *   - Defaults to `100`
   * @param tickSize
   *   Minimum price movement expressed in pips (10^-8), defaults to market setting
   *
   * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/classes/OrderBookRealTimeClient.html#getOrderBookL2)
   * @see response {@link RestResponseGetOrderBookLevel2}
   *
   * @category Requests
   */
  public async getOrderBookL2(
    market: string,
    limit?: number,
    tickSize?: bigint | undefined,
  ) {
    return L2OrderBookToRestResponse(
      (await this.getOrderBooks(market, tickSize)).l2,
      limit ?? 100,
    );
  }

  private async getOrderBooks(
    market: string,
    tickSize?: bigint | undefined,
  ): Promise<{ l1: idex.L1OrderBook; l2: idex.L2OrderBook }> {
    const appliedTickSize =
      tickSize || this.tickSizesByMarket.get(market) || BigInt(1);

    const l2 = aggregateL2OrderBookAtTickSize(
      await this.loadLevel2(market),
      appliedTickSize,
    );

    return { l1: L2toL1OrderBook(l2), l2 };
  }

  private async applyOrderBookUpdates(market: string) {
    const updates = this.l2OrderBookUpdates.get(market);
    if (!updates) {
      return;
    }
    const book = this.l2OrderBooks.get(market);
    // If this market has not yet been synchronized from the REST API, then halt processing -
    // messages for the market will queue and proccess after it runs
    if (!book) {
      return;
    }

    const beforeL1 = L2toL1OrderBook(book);

    for (const update of updates) {
      // outdated sequence, ignore
      if (book.sequence >= update.sequence) {
        // eslint-disable-next-line no-continue
        continue;
      }
      // an expected next update has arrived
      else if (book.sequence + 1 === update.sequence) {
        updateL2Levels(book, update);
      } else {
        // If an invalid update arrives, reset all data and synchronize anew
        this.emit(OrderBookRealTimeClientEvent.disconnected);
        this.emit(
          OrderBookRealTimeClientEvent.error,
          new Error(
            `Missing l2 update sequence, current book is ${book.sequence} message was ${update.sequence}`,
          ),
        );
        // this.unsubscribe();
        this.resetInternalState();
        // this.subscribe();

        // eslint-disable-next-line no-await-in-loop
        await this.synchronizeFromRestApi();

        this.emit(OrderBookRealTimeClientEvent.connected);

        return;
      }
    }

    const afterL1 = L2toL1OrderBook(book);

    this.l1OrderBooks.set(market, L2toL1OrderBook(book));

    if (!L1Equal(beforeL1, afterL1)) {
      this.emit(OrderBookRealTimeClientEvent.l1, market);
    }

    this.emit(OrderBookRealTimeClientEvent.l2, market);

    this.l2OrderBookUpdates.delete(market);
  }

  private async synchronizeFromRestApi() {
    let reconnectAttempt = 0;

    // Updates cannot be applied until successfully synchronized with the REST API, so keep trying
    // with exponential backoff until success
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const backoffSeconds = 2 ** reconnectAttempt;
      reconnectAttempt += 1;
      try {
        // Load minimums and token prices first so synthetic orderbook calculations are accurate
        // eslint-disable-next-line no-await-in-loop
        await this.loadTickSizes();

        // eslint-disable-next-line no-await-in-loop
        await Promise.all([
          ...this.markets.map(async (market) => {
            await this.loadLevel2(market);
            this.emit(OrderBookRealTimeClientEvent.ready, market);
          }),
        ]);

        return;
      } catch (error) {
        this.emit(OrderBookRealTimeClientEvent.error, error);
        // eslint-disable-next-line no-await-in-loop
        await sleep(backoffSeconds * 1000);
      }
    }
  }

  private async loadLevel2(market: string) {
    let l2 = this.l2OrderBooks.get(market);

    if (!l2) {
      this.emit(OrderBookRealTimeClientEvent.sync, market);
      l2 = restResponseToL2OrderBook(
        await this.public.getOrderBookLevel2({
          market,
          limit: 1000,
        }),
      );
    }

    this.l2OrderBooks.set(market, l2);
    return l2;
  }

  private async loadTickSizes() {
    // Market tick sizes only need to be loaded once as they are effectively static
    if (this.isTickSizesLoaded) {
      return;
    }

    this.marketsResponse =
      this.marketsResponse ?? (await this.public.getMarkets());

    for (const market of this.marketsResponse) {
      this.tickSizesByMarket.set(market.market, decimalToPip(market.tickSize));
    }

    this.isTickSizesLoaded = true;
  }

  private mapTokensToMarkets() {
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

  private resetInternalState(includeUpdates = false) {
    this.l1OrderBooks.clear();
    this.l2OrderBooks.clear();
    if (includeUpdates) {
      this.l2OrderBookUpdates.clear();
    }
    //
  }

  /* Connection management */

  private setupInternalWebSocket() {
    if (!this.webSocketConnectionListenersConfigured) {
      this.webSocketClient.onConnect(this.webSocketHandleConnect.bind(this));
      this.webSocketClient.onDisconnect(
        this.webSocketHandleDisconnect.bind(this),
      );
      this.webSocketClient.onError(this.webSocketHandleError.bind(this));
      this.webSocketConnectionListenersConfigured = true;
    }
  }

  private subscribe() {
    this.webSocketClient.subscribePublic(
      [{ name: SubscriptionNamePublic.l2orderbook }],
      this.markets,
    );
  }

  private unsubscribe() {
    this.webSocketClient.unsubscribe([SubscriptionNamePublic.l2orderbook]);
  }

  /* Event handlers */

  private async webSocketHandleConnect() {
    if (!this.webSocketResponseListenerConfigured) {
      this.webSocketClient.onMessage(this.webSocketHandleResponse.bind(this));
      this.webSocketResponseListenerConfigured = true;
    }

    this.subscribe();

    await this.synchronizeFromRestApi();

    this.emit(OrderBookRealTimeClientEvent.connected);
  }

  private webSocketHandleDisconnect() {
    // Assume messages will be lost during disconnection and clear state. State will be re-synchronized again on reconnect
    this.resetInternalState(true);

    this.emit(OrderBookRealTimeClientEvent.disconnected);
  }

  private webSocketHandleError(error: Error | ErrorEvent) {
    this.emit(
      OrderBookRealTimeClientEvent.error,
      error instanceof Error ? error : error.error,
    );
  }

  private async webSocketHandleResponse(response: IDEXMessageEvent) {
    if (response.type === MessageEventType.l2orderbook) {
      // accumulate L2 updates to be applied
      const updatesToApply =
        this.l2OrderBookUpdates.get(response.data.market) || [];
      updatesToApply.push(webSocketResponseToL2OrderBook(response.data));
      this.l2OrderBookUpdates.set(response.data.market, updatesToApply);

      await this.applyOrderBookUpdates(response.data.market);
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
