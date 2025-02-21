import type {
  CandleInterval,
  SubscriptionNameAuthenticated,
  SubscriptionNamePublic,
  MessageEventType,
} from '#types/enums/index';
import type { KumaEventBase } from '#types/webSocket/base';
import type * as ResponseTypes from '#types/webSocket/response/index';

/**
 * All the messages which may result from the corresponding WebSocket subscription.
 */
export type KumaSubscriptionEvent =
  | ResponseTypes.KumaTickerEvent
  | ResponseTypes.KumaTradeEvent
  | ResponseTypes.KumaLiquidationEvent
  | ResponseTypes.KumaCandleEvent
  | ResponseTypes.KumaOrderBookLevel1Event
  | ResponseTypes.KumaOrderBookLevel2Event
  | ResponseTypes.KumaOrderEvent
  | ResponseTypes.KumaDepositEvent
  | ResponseTypes.KumaWithdrawalEvent
  | ResponseTypes.KumaPositionEvent
  | ResponseTypes.KumaFundingPaymentEvent
  | ResponseTypes.KumaWebClientEvent;

/**
 * @internal
 *
 * Short-hand response payloads
 */
export type WebSocketResponseSubscriptionMessageShort =
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortTickers
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortTrades
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortLiquidations
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortCandles
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortL1Orderbook
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortL2Orderbook
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortOrders
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortDeposits
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortWithdrawals
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortPositions
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortFundingPayments
  | ResponseTypes.WebSocketResponseSubscriptionMessageShortWebClient;

/**
 * When an error occurs during evaluation by the WebSocket Server, this
 * error message will be provided to the message handler.
 */
export interface KumaErrorEvent extends KumaEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.error;
  /**
   * @inheritDoc
   */
  data: {
    /**
     * error short code
     */
    code: string;
    /**
     * human readable error message
     */
    message: string;
  };
}

/**
 * Subscriptions Response
 */
export interface KumaSubscriptionsListEvent extends KumaEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.subscriptions;
  data?: undefined;
  /**
   * @inheritDoc
   *
   * @see type {@link KumaSubscribeType}
   */
  subscriptions: KumaSubscribeType[];
}

/**
 * The possible WebSocket messages that should be handled by the WebSocketClient's `onMessage` handler.
 *
 * @see related {@link KumaErrorEvent}
 * @see related {@link KumaSubscriptionsListEvent}
 * @see related {@link KumaSubscriptionEvent}
 */
export type KumaMessageEvent =
  | KumaErrorEvent
  | KumaSubscriptionsListEvent
  | KumaSubscriptionEvent;

/**
 * <div>
 * [[include:base.md]]
 * </div>
 *
 * - All WebSocket subscriptions are based upon this interface, which provides for
 *   appropriate type narrowing based on the subscription being requested.
 *
 * @see docs [WebSocket API Docs](https://api-docs-v1.kuma.bid/#websocket-api-interaction)
 *
 * @category Base Types
 */
interface KumaSubscribeBase {
  /**
   * Subscription to subscribe to.
   *
   * @see related {@link SubscriptionNamePublic}
   * @see related {@link SubscriptionNameAuthenticated}
   */
  name: SubscriptionNamePublic | SubscriptionNameAuthenticated;

  /**
   * Array of Market Symbols
   *
   * - Overrides the markets array at the top-level subscription object, if provided.
   * - Required if the top-level subscription does not define `markets`
   *   and the request is a {@link KumaSubscribeTypePublic public subscription}
   */
  markets?: string[] | undefined;
  /**
   * Candle Interval to subscribe to
   *
   * - Only applicable for {@link SubscriptionNamePublic.candles candles} subscription
   *
   * @see enum {@link CandleInterval}
   */
  interval?: CandleInterval;
}

/**
 * <div>
 * [[include:base.md]]
 * </div>
 *
 * A Base type that all authenticated WebSocket subscriptions extend upon.
 *
 * @see names   {@link SubscriptionNameAuthenticated}
 * @see related {@link KumaSubscribeTypeAuthenticated}
 *
 * @category Base Types
 */
export interface KumaSubscribeAuthenticatedBase extends KumaSubscribeBase {
  /**
   * @inheritDoc
   */
  name: SubscriptionNameAuthenticated;
  markets?: undefined;
  interval?: undefined;
}

/**
 * <div>
 * [[include:base.md]]
 * </div>
 *
 * A Base type that all public WebSocket subscriptions extend upon.
 *
 * @see names   {@link SubscriptionNamePublic}
 * @see related {@link KumaSubscribeTypePublic}
 *
 * @category Base Types
 */
export interface KumaSubscribePublicBase extends KumaSubscribeBase {
  /**
   * @inheritDoc
   */
  name: SubscriptionNamePublic;
  /**
   * @inheritDoc
   */
  markets?: string[];
  /**
   * @inheritDoc
   */
  interval?: CandleInterval;
}

/**
 * Provides ticker data updates for a market.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNamePublic.tickers tickers}
 * > - **Authentication:**     **None**
 * > - **Update Speed:**       1 second
 * > - **Required Parameters:**
 *   {@link KumaSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs [Tickers Subscription API Documentation](https://api-docs-v1.kuma.bid/#tickers)
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get Tickers
 */
export interface KumaSubscribeTickers extends KumaSubscribePublicBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNamePublic.tickers;
  interval?: undefined;
}

/**
 * Provides candle (OHLCV) data updates for a market.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNamePublic.candles candles}
 * > - **Authentication:**     None
 * > - **Update Speed:**       1 second
 * > - **Required Parameters:**
 *   {@link KumaSubscribePublicBase.markets markets},
 *   {@link CandleInterval interval}
 * ---
 *
 * @see docs [Candles Subscription API Documentation](https://api-docs-v1.kuma.bid/#candles)
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get Candles
 */
export interface KumaSubscribeCandles extends KumaSubscribePublicBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNamePublic.candles;
  /**
   * @inheritDoc
   */
  interval: CandleInterval;
}

/**
 * Provides real-time trade data for a market.
 *
 * - In this documentation:
 *   - `trades` refers to public information about trades
 *   - Whereas `fills` refers to detailed non-public information about trades
 *     resulting from orders placed by the authenticated API account.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNamePublic.trades trades}
 * > - **Authentication:**     None
 * > - **Update Speed:**       Real-time
 * >  - updates on new trades
 * > - **Required Parameters:**
 *   {@link KumaSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs [Trades Subscription API Documentation](https://api-docs-v1.kuma.bid/#trades)
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get Trades
 */
export interface KumaSubscribeTrades extends KumaSubscribePublicBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNamePublic.trades;
  interval?: undefined;
}

/**
 * Provides real-time liquidation data for a market.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNamePublic.liquidations liquidations}
 * > - **Authentication:**     None
 * > - **Update Speed:**       Real-time
 * >   - updates on new liquidations
 * > - **Required Parameters:**
 *   {@link KumaSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs [Liquidations Subscription API Documentation](https://api-docs-v1.kuma.bid/#liquidations)
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get Liquidations
 */
export interface KumaSubscribeLiquidations extends KumaSubscribePublicBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNamePublic.liquidations;
  interval?: undefined;
}

/**
 * Provides real-time **Level-1** order book data for a market.
 *
 * - {@link KumaSubscribeOrderBookLevel1 Level-1} order book data is limited to the best bid and ask
 *   for a market.
 * - {@link KumaSubscribeOrderBookLevel2 Level-2} order book data includes `price` and `quantity` information
 *   for all limit order price levels in the order book.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNamePublic.l1orderbook l1orderbook}
 * > - **Authentication:**     None
 * > - **Update Speed:**       Real-time
 * >   - updates on new best ask, best bid, or related quantities
 * > - **Required Parameters:**
 *   {@link KumaSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs    [OrderBook Level 1 Subscription API Documentation](https://api-docs-v1.kuma.bid/#l1-order-book)
 * @see related {@link KumaSubscribeOrderBookLevel2}
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get OrderBook
 */
export interface KumaSubscribeOrderBookLevel1 extends KumaSubscribePublicBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNamePublic.l1orderbook;
  interval?: undefined;
}

/**
 * Provides real-time **Level-2** order book data for a market.
 *
 * - {@link KumaSubscribeOrderBookLevel1 Level-1} order book data is limited to the best `bid` and `ask`
 *   for a market.
 * - {@link KumaSubscribeOrderBookLevel2 Level-2} order book data includes `price` and `quantity` information
 *   for all limit order price levels in the order book.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNamePublic.l2orderbook l2orderbook}
 * > - **Authentication:**     None
 * > - **Update Speed:**       Real-time
 * >   - updates on any order book change
 * > - **Required Parameters:**
 *   {@link KumaSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs    [OrderBook Level 2 Subscription API Documentation](https://api-docs-v1.kuma.bid/#l2-order-book)
 * @see related {@link KumaSubscribeOrderBookLevel1}
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get OrderBook
 */
export interface KumaSubscribeOrderBookLevel2 extends KumaSubscribePublicBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNamePublic.l2orderbook;
  interval?: undefined;
}

/**
 * @internal
 */
export interface KumaSubscribeWebClient extends KumaSubscribeAuthenticatedBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNameAuthenticated.webclient;
}

/**
 * Provides real-time updates on orders issued by a wallet.
 *
 * - Detailed order execution information is only available to the placing wallet.
 * - This subscription includes granular updates for all order-related
 *   activity, including placement, cancelation, fills and stop triggers.
 * - In this documentation:
 *   - `trades` refers to public information about trades,
 *   - Whereas `fills` refers to detailed non-public information about trades resulting
 *     from orders placed by the API account.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNameAuthenticated.orders orders}
 * > - **Authentication:**     **Authenticated**
 * > - **Update Speed:**       Real-time
 * >   - updates on any state change of an order placed by the wallet
 * > - **Request Parameters:** None
 * ---
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get Orders
 */
export interface KumaSubscribeOrders extends KumaSubscribeAuthenticatedBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNameAuthenticated.orders;
}

/**
 * Provides real-time `deposit` information for a wallet.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNameAuthenticated.deposits deposits}
 * > - **Authentication:**     **Authenticated**
 * > - **Update Speed:**       Real-time
 * >   - updates sent on deposit confirmation
 * > - **Request Parameters:** None
 * ---
 *
 * @see related {@link KumaSubscribePositions}
 * @see related {@link KumaSubscribeWithdrawals}
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get Deposits
 */
export interface KumaSubscribeDeposits extends KumaSubscribeAuthenticatedBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNameAuthenticated.deposits;
}

/**
 * Provides real-time `withdrawal` information for a wallet.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNameAuthenticated.withdrawals withdrawals}
 * > - **Authentication:**     **Authenticated**
 * > - **Update Speed:**       Real-time
 * >   - updates sent on user withdrawal
 * > - **Request Parameters:** None
 * ---
 *
 * @see related {@link KumaSubscribeDeposits}
 * @see related {@link KumaSubscribePositions}
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get Withdrawals
 */
export interface KumaSubscribeWithdrawals
  extends KumaSubscribeAuthenticatedBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNameAuthenticated.withdrawals;
}

/**
 * Provides real-time `position` information for a wallet.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNameAuthenticated.positions positions}
 * > - **Authentication:**     **Authenticated**
 * > - **Update Speed:**       Real-time
 * >   - updates on any position change of the wallet
 * > - **Request Parameters:** None
 * ---
 *
 * @see related {@link KumaSubscribeDeposits}
 * @see related {@link KumaSubscribeWithdrawals}
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get Positions
 */
export interface KumaSubscribePositions extends KumaSubscribeAuthenticatedBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNameAuthenticated.positions;
}

/**
 * Provides real-time `funding payments` information for a wallet.
 *
 * ---
 * **Subscription Parameters**
 *
 * > - **Subscription:**       {@link SubscriptionNameAuthenticated.fundingPayments fundingPayments}
 * > - **Authentication:**     **Authenticated**
 * > - **Update Speed:**       Real-time
 * >   - updates on updated funding payments data
 * > - **Request Parameters:** None
 * ---
 *
 * @category WebSocket - Subscribe
 * @category Kuma - Get Funding Payments
 */
export interface KumaSubscribeFundingPayments
  extends KumaSubscribeAuthenticatedBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNameAuthenticated.fundingPayments;
}

/**
 * All WebSocket Subscribe types as a union.
 *
 * @see related {@link KumaSubscribeTypeAuthenticated}
 * @see related {@link KumaSubscribeTypePublic}
 *
 * @category WebSocket - Subscribe
 */
export type KumaSubscribeType =
  | KumaSubscribeTypeAuthenticated
  | KumaSubscribeTypePublic;

/**
 * - Subscribing to these requires the {@link WebSocketClient} to be constructed with the
 *   `auth` object.
 *
 * @see related {@link KumaSubscribeType}
 * @see related {@link KumaSubscribeTypePublic}
 *
 * @category WebSocket - Subscribe
 */
export type KumaSubscribeTypeAuthenticated =
  | KumaSubscribeOrders
  | KumaSubscribeDeposits
  | KumaSubscribeWithdrawals
  | KumaSubscribePositions
  | KumaSubscribeFundingPayments
  | KumaSubscribeWebClient;

/**
 * All WebSocket Subscribe types which are public and do not require
 * authentication to subscribe to.
 *
 * @see related {@link KumaSubscribeType}
 * @see related {@link KumaSubscribeTypeAuthenticated}
 *
 * @category WebSocket - Subscribe
 */
export type KumaSubscribeTypePublic =
  | KumaSubscribeTickers
  | KumaSubscribeTrades
  | KumaSubscribeLiquidations
  | KumaSubscribeOrderBookLevel1
  | KumaSubscribeOrderBookLevel2
  | KumaSubscribeCandles
  | KumaSubscribeWebClient;

/**
 * @category WebSocket - Unsubscribe
 */
export type WebSocketRequestUnsubscribeShortNames =
  | SubscriptionNamePublic
  | SubscriptionNameAuthenticated;

/**
 * - Subscription Objects in unsubscribe must have name but all other properties are
 *   considered optional
 *
 * @category WebSocket - Unsubscribe
 */
export type WebSocketRequestUnsubscribeSubscription = Partial<
  KumaSubscribeTypePublic | KumaSubscribeTypeAuthenticated
> & { name: WebSocketRequestUnsubscribeShortNames };
