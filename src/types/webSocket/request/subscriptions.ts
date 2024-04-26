import type {
  CandleInterval,
  SubscriptionNameAuthenticated,
  SubscriptionNamePublic,
  MessageEventType,
} from '#types/enums/index';
import type { IDEXEventBase } from '#types/webSocket/base';
import type * as ResponseTypes from '#types/webSocket/response/index';

/**
 * All the messages which may result from the corresponding WebSocket subscription.
 */
export type IDEXSubscriptionEvent =
  | ResponseTypes.IDEXTickerEvent
  | ResponseTypes.IDEXTradeEvent
  | ResponseTypes.IDEXLiquidationEvent
  | ResponseTypes.IDEXCandleEvent
  | ResponseTypes.IDEXOrderBookLevel1Event
  | ResponseTypes.IDEXOrderBookLevel2Event
  | ResponseTypes.IDEXOrderEvent
  | ResponseTypes.IDEXDepositEvent
  | ResponseTypes.IDEXWithdrawalEvent
  | ResponseTypes.IDEXPositionEvent
  | ResponseTypes.IDEXFundingPaymentEvent
  | ResponseTypes.IDEXWebClientEvent;

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
export interface IDEXErrorEvent extends IDEXEventBase {
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
export interface IDEXSubscriptionsListEvent extends IDEXEventBase {
  /**
   * @inheritDoc
   */
  type: typeof MessageEventType.subscriptions;
  data?: undefined;
  /**
   * @inheritDoc
   *
   * @see type {@link IDEXSubscribeType}
   */
  subscriptions: IDEXSubscribeType[];
}

/**
 * The possible WebSocket messages that should be handled by the WebSocketClient's `onMessage` handler.
 *
 * @see related {@link IDEXErrorEvent}
 * @see related {@link IDEXSubscriptionsListEvent}
 * @see related {@link IDEXSubscriptionEvent}
 */
export type IDEXMessageEvent =
  | IDEXErrorEvent
  | IDEXSubscriptionsListEvent
  | IDEXSubscriptionEvent;

/**
 * <div>
 * [[include:base.md]]
 * </div>
 *
 * - All WebSocket subscriptions are based upon this interface, which provides for
 *   appropriate type narrowing based on the subscription being requested.
 *
 * @see docs [WebSocket API Docs](https://api-docs-v4.idex.io/#websocket-api-interaction)
 *
 * @category Base Types
 */
interface IDEXSubscribeBase {
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
   *   and the request is a {@link IDEXSubscribeTypePublic public subscription}
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
 * @see related {@link IDEXSubscribeTypeAuthenticated}
 *
 * @category Base Types
 */
export interface IDEXSubscribeAuthenticatedBase extends IDEXSubscribeBase {
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
 * @see related {@link IDEXSubscribeTypePublic}
 *
 * @category Base Types
 */
export interface IDEXSubscribePublicBase extends IDEXSubscribeBase {
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
 *   {@link IDEXSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs [Tickers Subscription API Documentation](https://api-docs-v4.idex.io/#tickers)
 *
 * @category WebSocket - Subscribe
 * @category IDEX - Get Tickers
 */
export interface IDEXSubscribeTickers extends IDEXSubscribePublicBase {
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
 *   {@link IDEXSubscribePublicBase.markets markets},
 *   {@link CandleInterval interval}
 * ---
 *
 * @see docs [Candles Subscription API Documentation](https://api-docs-v4.idex.io/#candles)
 *
 * @category WebSocket - Subscribe
 * @category IDEX - Get Candles
 */
export interface IDEXSubscribeCandles extends IDEXSubscribePublicBase {
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
 *   {@link IDEXSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs [Trades Subscription API Documentation](https://api-docs-v4.idex.io/#trades)
 *
 * @category WebSocket - Subscribe
 * @category IDEX - Get Trades
 */
export interface IDEXSubscribeTrades extends IDEXSubscribePublicBase {
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
 *   {@link IDEXSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs [Liquidations Subscription API Documentation](https://api-docs-v4.idex.io/#liquidations)
 *
 * @category WebSocket - Subscribe
 * @category IDEX - Get Liquidations
 */
export interface IDEXSubscribeLiquidations extends IDEXSubscribePublicBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNamePublic.liquidations;
  interval?: undefined;
}

/**
 * Provides real-time **Level-1** order book data for a market.
 *
 * - {@link IDEXSubscribeOrderBookLevel1 Level-1} order book data is limited to the best bid and ask
 *   for a market.
 * - {@link IDEXSubscribeOrderBookLevel2 Level-2} order book data includes `price` and `quantity` information
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
 *   {@link IDEXSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs    [OrderBook Level 1 Subscription API Documentation](https://api-docs-v4.idex.io/#l1-order-book)
 * @see related {@link IDEXSubscribeOrderBookLevel2}
 *
 * @category WebSocket - Subscribe
 * @category IDEX - Get OrderBook
 */
export interface IDEXSubscribeOrderBookLevel1 extends IDEXSubscribePublicBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNamePublic.l1orderbook;
  interval?: undefined;
}

/**
 * Provides real-time **Level-2** order book data for a market.
 *
 * - {@link IDEXSubscribeOrderBookLevel1 Level-1} order book data is limited to the best `bid` and `ask`
 *   for a market.
 * - {@link IDEXSubscribeOrderBookLevel2 Level-2} order book data includes `price` and `quantity` information
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
 *   {@link IDEXSubscribePublicBase.markets markets}
 * ---
 *
 * @see docs    [OrderBook Level 2 Subscription API Documentation](https://api-docs-v4.idex.io/#l2-order-book)
 * @see related {@link IDEXSubscribeOrderBookLevel1}
 *
 * @category WebSocket - Subscribe
 * @category IDEX - Get OrderBook
 */
export interface IDEXSubscribeOrderBookLevel2 extends IDEXSubscribePublicBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNamePublic.l2orderbook;
  interval?: undefined;
}

/**
 * @internal
 */
export interface IDEXSubscribeWebClient extends IDEXSubscribeAuthenticatedBase {
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
 * @category IDEX - Get Orders
 */
export interface IDEXSubscribeOrders extends IDEXSubscribeAuthenticatedBase {
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
 * @see related {@link IDEXSubscribePositions}
 * @see related {@link IDEXSubscribeWithdrawals}
 *
 * @category WebSocket - Subscribe
 * @category IDEX - Get Deposits
 */
export interface IDEXSubscribeDeposits extends IDEXSubscribeAuthenticatedBase {
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
 * @see related {@link IDEXSubscribeDeposits}
 * @see related {@link IDEXSubscribePositions}
 *
 * @category WebSocket - Subscribe
 * @category IDEX - Get Withdrawals
 */
export interface IDEXSubscribeWithdrawals
  extends IDEXSubscribeAuthenticatedBase {
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
 * @see related {@link IDEXSubscribeDeposits}
 * @see related {@link IDEXSubscribeWithdrawals}
 *
 * @category WebSocket - Subscribe
 * @category IDEX - Get Positions
 */
export interface IDEXSubscribePositions extends IDEXSubscribeAuthenticatedBase {
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
 * @category IDEX - Get Funding Payments
 */
export interface IDEXSubscribeFundingPayments
  extends IDEXSubscribeAuthenticatedBase {
  /**
   * @inheritDoc
   */
  name: typeof SubscriptionNameAuthenticated.fundingPayments;
}

/**
 * All WebSocket Subscribe types as a union.
 *
 * @see related {@link IDEXSubscribeTypeAuthenticated}
 * @see related {@link IDEXSubscribeTypePublic}
 *
 * @category WebSocket - Subscribe
 */
export type IDEXSubscribeType =
  | IDEXSubscribeTypeAuthenticated
  | IDEXSubscribeTypePublic;

/**
 * - Subscribing to these requires the {@link WebSocketClient} to be constructed with the
 *   `auth` object.
 *
 * @see related {@link IDEXSubscribeType}
 * @see related {@link IDEXSubscribeTypePublic}
 *
 * @category WebSocket - Subscribe
 */
export type IDEXSubscribeTypeAuthenticated =
  | IDEXSubscribeOrders
  | IDEXSubscribeDeposits
  | IDEXSubscribeWithdrawals
  | IDEXSubscribePositions
  | IDEXSubscribeFundingPayments
  | IDEXSubscribeWebClient;

/**
 * All WebSocket Subscribe types which are public and do not require
 * authentication to subscribe to.
 *
 * @see related {@link IDEXSubscribeType}
 * @see related {@link IDEXSubscribeTypeAuthenticated}
 *
 * @category WebSocket - Subscribe
 */
export type IDEXSubscribeTypePublic =
  | IDEXSubscribeTickers
  | IDEXSubscribeTrades
  | IDEXSubscribeLiquidations
  | IDEXSubscribeOrderBookLevel1
  | IDEXSubscribeOrderBookLevel2
  | IDEXSubscribeCandles
  | IDEXSubscribeWebClient;

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
  IDEXSubscribeTypePublic | IDEXSubscribeTypeAuthenticated
> & { name: WebSocketRequestUnsubscribeShortNames };
