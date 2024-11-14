import type * as _types from '#index';

/**
 * Can be used to easily provide the {@link _types.RestRequestGetCandles.interval interval} parameter
 * in a get candles request.
 *
 * @example
 * ```typescript
 * import { RestPublicClient } from '@idexio/idex-sdk';
 *
 * const publicClient = new RestPublicClient();
 *
 * const candles = await publicClient.getCandles({
 *  // always has an up-to-date enumeration of valid intervals
 *  // handled by the server.
 *  interval: CandleInterval.ONE_HOUR,
 *  market: 'ETH-USD',
 * })
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see client  {@link _types.RestPublicClient.getCandles RestPublicClient.getCandles}
 * @see request {@link _types.RestRequestGetCandles RestRequestGetCandles}
 * @see related {@link _types.IDEXCandle IDEXCandle}
 *
 * @category Enums - Request Parameters
 * @category IDEX - Get Candles
 * @enum
 */
export const CandleInterval = Object.freeze({
  /**
   * - Receives candles at an interval of 1 minute.
   */
  ONE_MINUTE: '1m',
  /**
   * - Receives candles at an interval of 5 minutes.
   */
  FIVE_MINUTES: '5m',
  /**
   * - Receives candles at an interval of 15 minutes.
   */
  FIFTEEN_MINUTES: '15m',
  /**
   * - Receives candles at an interval of 30 minutes.
   */
  THIRTY_MINUTES: '30m',
  /**
   * - Receives candles at an interval of 1 hour.
   */
  ONE_HOUR: '1h',
  /**
   * - Receives candles at an interval of 6 hours.
   */
  FOUR_HOURS: '4h',
  /**
   * - Receives candles at an interval of 1 day.
   */
  ONE_DAY: '1d',
} as const);

export type CandleInterval =
  (typeof CandleInterval)[keyof typeof CandleInterval];

/**
 * Time in force policies specify the behavior of a {@link _types.IDEXOrder limit order} upon execution.
 *
 * @see docs    [IDEX API Documentation: Time in Force Explained](https://api-docs-v4.idex.io/#time-in-force)
 * @see request {@link _types.RestRequestOrderBase.timeInForce RestRequestOrder.timeInForce}
 *  > This enum is most useful when calling the {@link _types.RestAuthenticatedClient.createOrder RestAuthenticatedClient.createOrder}
 *    method to provide inline completion and documentation for the `timeInForce` parameter.
 * @see related {@link _types.IDEXOrder IDEXOrder}
 *  > The `IDEXOrder` interface provides the shape for orders and are returned whenever an order is created or queried.
 *
 * @category Enums - Request Parameters
 * @category IDEX - Create Order
 * @enum
 */
export const TimeInForce = Object.freeze({
  /**
   * **Good Till Canceled (gtc)**
   *
   * - The `gtc` time in force policy keeps a limit order open until it is either filled or manually canceled by the trader.
   * - This is the default behavior for limit orders if the {@link _types.RestRequestOrderBase.timeInForce timeInForce}
   *   parameter is not provided.
   *
   * ---
   *
   * **Characteristics:**
   * - **Persistence**: A `gtc` order remains active on the order book until it is executed or canceled.
   * - **Default Option**: If you do not specify a time in force, `gtc` is assumed.
   *
   * ---
   *
   * @example
   * ```typescript
   * import { TimeInForce, OrderType } from '@idexio/idex-sdk';
   *
   * authenticatedClient.createOrder({
   *   type: OrderType.limit,
   *   timeInForce: TimeInForce.gtc,
   *   // ... other limit order parameters
   * });
   * ```
   *
   * @see docs [IDEX API Documentation: Time in Force Explained](https://api-docs-v4.idex.io/#time-in-force)
   */
  gtc: 'gtc',

  /**
   * **Good Til Crossing (gtx)**
   *
   * - The `gtx` time in force policy ensures that a limit order will only execute if it does not immediately match with an existing order.
   * - This policy is used to guarantee that an order will only add liquidity to the market and not take liquidity away.
   * - Applicable to all limit orders, `gtx` is particularly useful for traders who wish to avoid paying taker fees.
   *
   * ---
   *
   * **Characteristics:**
   * - **Post-Only**:          A `gtx` order is rejected if it would immediately match with an existing order upon submission.
   * - **Liquidity Addition**: Ensures the order contributes liquidity, qualifying it for potential maker fee rebates.
   *
   * ---
   *
   * @example
   * ```typescript
   * import { TimeInForce, OrderType } from '@idexio/idex-sdk';
   *
   * authenticatedClient.createOrder({
   *   type: OrderType.limit,
   *   timeInForce: TimeInForce.gtx,
   *   // ... other limit order parameters
   * });
   * ```
   *
   * @see docs [IDEX API Documentation: Time in Force Explained](https://api-docs-v4.idex.io/#time-in-force)
   */
  gtx: 'gtx',

  /**
   * **Immediate Or Cancel (ioc)**
   *
   * - An `ioc` time in force policy is used for limit orders that should be executed immediately.
   * - Any portion of the order that cannot be filled right away is canceled, ensuring no part of the order remains on the order book.
   * - This policy is ideal for traders who prioritize speed of execution over full order fulfillment.
   *
   * ---
   *
   * **Characteristics:**
   * - **Immediate Execution**: An `ioc` order attempts to fill immediately upon placement.
   * - **Partial Fulfillment**: If the full order cannot be executed, the unfilled portion is immediately canceled.
   * - **No Resting Orders**:   `ioc` orders do not become resting orders on the book, preventing any residual market impact.
   *
   * ---
   *
   * @example
   * ```typescript
   * import { TimeInForce, OrderType } from '@idexio/idex-sdk';
   *
   * authenticatedClient.createOrder({
   *   type: OrderType.limit,
   *   timeInForce: TimeInForce.ioc,
   *   // ... other limit order parameters
   * });
   * ```
   *
   * @see docs [IDEX API Documentation: Time in Force Explained](https://api-docs-v4.idex.io/#time-in-force)
   */
  ioc: 'ioc',

  /**
   * **Fill Or Kill (fok)**
   *
   * - The `fok` time in force policy requires that a limit order be filled in its entirety immediately upon placement or not at all.
   * - This policy is used by traders who need a guarantee that their order will be executed as a single transaction at a known price.
   * - `fok` orders are particularly useful for large orders that could be subject to price slippage if executed in smaller increments.
   * - `fok` orders must specify the {@link SelfTradePrevention.cn | SelfTradePrevention.cn} (Cancel Newest)
   *   {@link _types.RestRequestOrderBase.selfTradePrevention selfTradePrevention} policy.
   *
   * ---
   *
   * **Characteristics:**
   * - **All-or-Nothing**: A `fok` order must be completely filled with a single transaction or it is entirely canceled.
   * - **Price Certainty**: Ensures that the order will execute at a single price point, providing full cost transparency.
   * - **No Partial Fills**: Eliminates the possibility of partial order execution, which can be critical for certain trading strategies.
   *
   * ---
   *
   * @example
   * ```typescript
   * import { TimeInForce, OrderType } from '@idexio/idex-sdk';
   *
   * authenticatedClient.createOrder({
   *   type: OrderType.limit,
   *   timeInForce: TimeInForce.fok,
   *   // ... other limit order parameters
   * });
   * ```
   *
   * @see docs [IDEX API Documentation: Time in Force Explained](https://api-docs-v4.idex.io/#time-in-force)
   * @see enum {@link SelfTradePrevention}
   *  > `fok` time in force policy requires that the {@link _types.RestRequestOrderBase.selfTradePrevention selfTradePrevention}
   *    parameter is set to {@link SelfTradePrevention.cn} (Cancel Newest)
   */
  fok: 'fok',
} as const);

export type TimeInForce = (typeof TimeInForce)[keyof typeof TimeInForce];

/**
 * Can be used as a convenience when specifying your orders to benefit from
 * inline documentation and auto-complete.
 *
 * @see docs    [API Documentation: Order Types](https://api-docs-v4.idex.io/#order-types)
 * @see request {@link _types.RestRequestOrderBase.type RestRequestOrder.type}
 * @see related {@link _types.IDEXOrder IDEXOrder}
 *
 * @category Enums - Request Parameters
 * @category IDEX - Create Order
 * @enum
 *
 * @example
 * ```typescript
 *  const order = { type: OrderType.limit, ...rest }
 * ```
 */
export const OrderType = Object.freeze({
  /**
   * A market order is an order to buy or sell a specified quantity of an asset at the best available current price.
   *
   * ---
   *
   * **Characteristics:**
   * - A market order requires specifying the {@link _types.RestRequestOrderBase.quantity quantity} in base terms
   *   to be traded
   * - **For market `buy` orders:**
   *   - The trade executes immediately for the specified `quantity` at the current best available sell price.
   * - **For market `sell` orders:**
   *   - The trade executes immediately for the specified `quantity` at the current best available buy price.
   * - Market orders prioritize speed of execution over price and are filled using the best available prices
   *   until the order `quantity` is met.
   * - Since market orders are filled immediately, they always remove liquidity from the order book and are
   *   subject to taker fees.
   * - Market orders do not enter the order book as they do not have a price specified and are executed at
   *   the current market rate.
   *
   * ---
   *
   * @see request {@link _types.RestRequestOrderTypeMarket RestRequestOrderTypeMarket}
   *  > The interface that provides the necessary request parameters to create a `market` order when calling
   *    the {@link _types.RestAuthenticatedClient.createOrder RestAuthenticatedClient.createOrder} method.
   */
  market: 'market',

  /**
   * A limit order is an order to buy or sell a specified quantity of an asset at a price that is equal to or
   * more favorable than a given threshold.
   *
   * ---
   *
   * **Characteristics:**
   * - A limit order requires specifying the {@link _types.RestRequestOrderBase.quantity quantity}
   *   to be traded (in base terms) and the limit {@link _types.RestRequestOrderBase.price price}
   *   (in quote terms).
   * - **For limit `buy` orders:**
   *   - The trade executes up to the specified `quantity`, provided the market price is at or below the provided limit `price`.
   * - **For limit `sell` orders:**
   *   - The trade executes up to the specified `quantity`, provided the market price is at or above the limit `price`.
   * - Limit orders that are priced to **cross the existing spread** execute immediately and remove liquidity from the order book
   *   - *(i.e. buy orders priced above the current lowest sell price, or sell orders priced below the current highest buy price)*
   * - Any unfilled portion of a limit order enters the order book, adhering to the specified
   *   {@link _types.RestRequestOrderBase.timeInForce timeInForce} constraints and the maker trade minimum requirements as detailed
   *   in [IDEX API Documentation - Minimums](https://api-docs-v4.idex.io/#minimums).
   *
   * ---
   *
   * @see request {@link _types.RestRequestOrderTypeLimit RestRequestOrderTypeLimit}
   *  > The interface that provides the necessary request parameters to create a `limit` order when calling
   *    the {@link _types.RestAuthenticatedClient.createOrder RestAuthenticatedClient.createOrder} method.
   * @see enum    {@link _types.TimeInForce TimeInForce}
   *  > An enum which can be used when defining the {@link _types.RestRequestOrderBase.timeInForce timeInForce}
   *    request parameter.
   */
  limit: 'limit',

  /**
   * A stop-loss market order is an order to `buy` or `sell` a specified quantity of an asset when
   * its price moves past a particular point, ensuring a higher probability of achieving a predetermined
   * entry or exit price, limiting the traders loss or locking in a profit. Once the stop price is reached,
   * the stop-loss order becomes a market order.
   *
   * ---
   *
   * **Characteristics:**
   * - A `stopLossMarket` order requires specifying the following request parameters:
   *   - {@link _types.RestRequestOrderBase.quantity quantity} to be traded (in base terms)
   *   - the stop {@link _types.RestRequestOrderBase.triggerPrice triggerPrice} (in quote terms)
   *   - {@link _types.RestRequestOrderBase.triggerType triggerType} (enum: {@link _types.TriggerType TriggerType})
   *     which determines the price type for the provided `triggerPrice`.
   * - **Activation:**
   *   - The order is not active and will not execute until the market price reaches the
   *     specified trigger price.
   * - **Execution:**
   *   - Once activated, it executes as a market order at the current best available price.
   * - **Purpose:**
   *   - This type of order is used to limit losses or protect profits in a position.
   * - `stopLossMarket` orders are subject to slippage in fast-moving market conditions.
   * - These orders do not guarantee an execution at or near the trigger price.
   *
   * ---
   *
   * @see request {@link _types.RestRequestOrderTypeStopLossMarket RestRequestOrderTypeStopLossMarket}
   *  > The interface that provides the necessary request parameters to create a `stopLossMarket` order when calling
   *    the {@link _types.RestAuthenticatedClient.createOrder RestAuthenticatedClient.createOrder} method, including trigger price and type.
   * @see enum {@link _types.TriggerType TriggerType}
   *  > An enum that should be used when providing the {@link _types.RestRequestOrderBase.triggerType triggerType} parameter
   *    to provide inline IDE completion and documentation.
   */
  stopLossMarket: 'stopLossMarket',

  /**
   * A `stopLossLimit` order is an order to `buy` or `sell` a specified quantity of an asset at a specified limit price,
   * only after the asset's price has reached a specified stop price.
   *
   * - When the stop price is reached, the stop-loss order becomes a limit order to buy or sell at the limit price or better.
   *
   * ---
   *
   * **Characteristics:**
   * - A `stopLossLimit` order requires specifying the following request parameters:
   *   - {@link _types.RestRequestOrderBase.quantity quantity} to be traded (in base terms)
   *   - the stop {@link _types.RestRequestOrderBase.triggerPrice triggerPrice}
   *     (in quote terms) at which the order is triggered
   *   - and the limit {@link _types.RestRequestOrderBase.price price} at which the order
   *     should execute.
   *   - {@link _types.RestRequestOrderBase.triggerType triggerType} (enum: {@link _types.TriggerType TriggerType})
   *     which determines the price type for the provided `triggerPrice`
   * - **Activation:**
   *   - The order is not active and will not execute until the market price reaches the specified trigger price.
   * - **Execution:**
   *   - Once activated, it becomes a limit order that will only execute at the specified limit price or better.
   * - **Purpose:**
   *   - This type of order is used to limit losses or protect profits in a position while providing control over the price at which the order fills.
   * - Stop-loss limit orders provide precision in execution price but are not guaranteed to execute if the market does not reach the limit price.
   * - These orders can help prevent slippage by setting a specific limit price at which the order can execute.
   *
   * ---
   *
   * @see request {@link _types.RestRequestOrderTypeStopLossLimit RestRequestOrderTypeStopLossLimit}
   *  > The interface that provides the necessary request parameters to create a `stopLossLimit` order when calling
   *    the {@link _types.RestAuthenticatedClient.createOrder RestAuthenticatedClient.createOrder} method, including trigger price, type, and limit price.
   * @see enum {@link _types.TriggerType TriggerType}
   *  > An enum that should be used when providing the {@link _types.RestRequestOrderBase.triggerType triggerType} parameter
   *    to provide inline IDE completion and documentation.
   */
  stopLossLimit: 'stopLossLimit',

  /**
   * A `takeProfitMarket` order is an order to sell or buy a specified quantity of an asset when its price reaches a specified
   * profit target, ensuring a profit can be realized. Once the take-profit price is reached, the take-profit order becomes a market order.
   *
   * ---
   *
   * **Characteristics:**
   * - A `takeProfitMarket` order requires specifying the following request parameters:
   *   - {@link _types.RestRequestOrderBase.quantity quantity} to be traded (in base terms)
   *   - the take-profit {@link _types.RestRequestOrderBase.triggerPrice triggerPrice}
   *     (in quote terms) at which the order is triggered.
   *   - {@link _types.RestRequestOrderBase.triggerType triggerType} (enum: {@link _types.TriggerType TriggerType})
   *     which determines the price type for the provided `triggerPrice`
   * - **Activation:**
   *   - The order is not active and will not execute until the market price reaches the specified trigger price.
   * - **Execution:**
   *   - Once activated, it executes as a market order at the current best available price.
   * - **Purpose:**
   *   - This type of order is used to lock in profits when the asset's price reaches a level that satisfies the trader's profit target.
   * - `takeProfitMarket` orders are subject to slippage in fast-moving market conditions.
   * - These orders do not guarantee an execution at or near the trigger price.
   *
   * ---
   *
   * @see request {@link _types.RestRequestOrderTypeTakeProfitMarket RestRequestOrderTypeTakeProfitMarket}
   *  > The interface that provides the necessary request parameters to create a `takeProfitMarket` order when calling
   *    the {@link _types.RestAuthenticatedClient.createOrder RestAuthenticatedClient.createOrder} method, including trigger price and type.
   * @see enum {@link _types.TriggerType TriggerType}
   *  > An enum that should be used when providing the {@link _types.RestRequestOrderBase.triggerType triggerType} parameter
   *    to provide inline IDE completion and documentation.
   */
  takeProfitMarket: 'takeProfitMarket',

  /**
   * A take-profit limit order is an order to sell or buy a specified quantity of an asset at a specified limit price,
   * only after the asset's price has reached a specified profit target. When the take-profit price is reached, the take-profit order
   * becomes a limit order to sell or buy at the limit price or better.
   *
   * ---
   *
   * **Characteristics:**
   * - A take-profit limit order requires specifying the {@link _types.RestRequestOrderBase.quantity quantity}
   *   to be traded (in base terms), the take-profit {@link _types.RestRequestOrderBase.triggerPrice triggerPrice}
   *   (in quote terms) at which the order is triggered, and the limit {@link _types.RestRequestOrderBase.price price}
   *   at which the order should execute.
   * - Additionally, the {@link _types.RestRequestOrderBase.triggerType triggerType} must be specified,
   *   indicating the price type for the trigger price (e.g., "last" or "index").
   * - **Activation:**
   *   - The order is not active and will not execute until the market price reaches the specified trigger price.
   * - **Execution:**
   *   - Once activated, it becomes a limit order that will only execute at the specified limit price or better.
   * - **Purpose:**
   *   - This type of order is used to lock in profits when the asset's price reaches a level that satisfies the trader's profit target,
   *     while providing control over the price at which the order fills.
   * - Take-profit limit orders provide precision in execution price but are not guaranteed to execute if the market does not reach the limit price.
   * - These orders can help prevent slippage by setting a specific limit price at which the order can execute.
   *
   * ---
   *
   * @see request {@link _types.RestRequestOrderTypeTakeProfitLimit RestRequestOrderTypeTakeProfitLimit}
   *  > The interface that provides the necessary request parameters to create a `takeProfitLimit` order when calling
   *    the {@link _types.RestAuthenticatedClient.createOrder RestAuthenticatedClient.createOrder} method, including trigger price, type, and limit price.
   * @see enum {@link _types.TriggerType TriggerType}
   *  > An enum that should be used when providing the {@link _types.RestRequestOrderBase.triggerType triggerType} parameter
   *    to provide inline IDE completion and documentation.
   */
  takeProfitLimit: 'takeProfitLimit',

  /**
   * A `trailingStopMarket` order is an order that allows you to sell or buy at the market price once your asset has moved
   * unfavorably by a specified distance (the trailing amount) from its peak price achieved after order placement.
   *
   * - It's designed to protect gains by enabling a trade to remain open and continue to profit as long as the price is moving
   *   in the favorable direction, but closes the trade if the price changes direction by a specified trailing amount.
   *
   * ---
   *
   * **Characteristics:**
   * - A `trailingStopMarket` order requires specifying the following request parameters:
   *   - {@link _types.RestRequestOrderBase.quantity quantity} to be traded (in base terms)
   *   - the activation {@link _types.RestRequestOrderBase.triggerPrice triggerPrice}
   *     (in quote terms) at which the order is triggered.
   *   - {@link _types.RestRequestOrderBase.triggerType triggerType} (enum: {@link _types.TriggerType TriggerType})
   *     which determines the price type for the provided `triggerPrice`
   *   - (Coming Soon: `callbackRate`%, `conditionalOrderId` for added flexibility options)
   * - **Activation:**
   *   - The order is active immediately upon placement, but the trigger price is dynamic and trails
   *     the peak price by the specified trailing amount.
   * - **Execution:**
   *   - If the asset's price moves unfavorably by the trailing amount from its peak price, the order
   *     becomes a market order and executes at the current best available price.
   * - **Purpose:**
   *   - This type of order is used to secure profits while maintaining a position that could potentially
   *     benefit from further price movement.
   * - `trailingStopMarket` orders are subject to slippage in fast-moving market conditions.
   * - These orders do not guarantee an execution at or near the trigger price once activated.
   *
   * ---
   *
   * @see request {@link _types.RestRequestOrderTypeTrailingStopMarket RestRequestOrderTypeTrailingStopMarket}
   *  > The interface that provides the necessary request parameters to create a `trailingStopMarket` order when calling
   *    the {@link _types.RestAuthenticatedClient.createOrder RestAuthenticatedClient.createOrder} method, including trailing amount and trigger type.
   * @see enum {@link _types.TriggerType TriggerType}
   *  > An enum that should be used when providing the {@link _types.RestRequestOrderBase.triggerType triggerType} parameter
   *    to provide inline IDE completion and documentation.
   */
  trailingStopMarket: 'trailingStopMarket',

  /**
   * @internal
   */
  conditionalStopLossMarket: 'conditionalStopLossMarket',

  /**
   * @internal
   */
  conditionalTakeProfitMarket: 'conditionalTakeProfitMarket',
} as const);

export type OrderType = (typeof OrderType)[keyof typeof OrderType];

/**
 * @see request {@link _types.RestRequestOrderBase.side RestRequestOrder.side}
 * @see related {@link _types.IDEXOrder IDEXOrder Interface}
 * @see related {@link _types.IDEXFill IDEXFill Interface}
 *
 * @category Enums - Request Parameters
 * @category IDEX - Create Order
 * @enum
 */
export const OrderSide = Object.freeze({
  buy: 'buy',
  sell: 'sell',
} as const);

export type OrderSide = (typeof OrderSide)[keyof typeof OrderSide];

/**
 * Provides all available self-trade prevention policies in a way that provides inline documentation,
 * auto-completion, and linking for easy type/code navigation.
 *
 * @see docs    [API Documentation: Self-Trade Prevention](https://api-docs-v4.idex.io/#self-trade-prevention)
 * @see request {@link _types.RestRequestOrderBase.selfTradePrevention RestRequestOrder.selfTradePrevention}
 * @see related {@link _types.IDEXOrder IDEXOrder}
 *
 * @category Enums - Request Parameters
 * @category IDEX - Create Order
 * @enum
 */
export const SelfTradePrevention = Object.freeze({
  /**
   * ### Decrement And Cancel (dc)
   *
   * - When two orders from the same user cross, the smaller order will
   *   be canceled and the larger order size will be decremented by the smaller order size.
   * - If the two orders are the same size, both will be canceled.
   */
  dc: 'dc',
  /**
   * ### Cancel Oldest (co)
   *
   * - Cancel the older (maker) order in full
   */
  co: 'co',
  /**
   * ### Cancel Newest (cn)
   *
   * - Cancel the newer, taker order and leave the older, resting order on the
   *   order book.
   * - This is the only valid option when {@link TimeInForce timeInForce} is set to {@link TimeInForce.fok TimeInForce.fok (Fill Or Kill)}
   */
  cn: 'cn',
  /**
   * ### Cancel Both (cb)
   *
   * - Cancel both orders
   */
  cb: 'cb',
} as const);

export type SelfTradePrevention =
  (typeof SelfTradePrevention)[keyof typeof SelfTradePrevention];

/**
 * The available payout programs to use for the payout program endpoints.
 *
 * @category Enums - Request Parameters
 * @category IDEX - Get Payouts
 * @category IDEX - Authorize Payout
 * @enum
 */
export const PayoutProgram = Object.freeze({
  /**
   * The rewards programs for points.
   */
  pointsRewards: 'pointsRewards',
  /**
   * The rewards program for qualified Market Makers.
   */
  marketMakerRewards: 'marketMakerRewards',
  /**
   * The rewards program for referrals.
   */
  referralRewards: 'referralRewards',
  /**
   * The trading competition program.
   */
  tradingCompetitions: 'tradingCompetitions',
  /**
   * The IDEX Trading Rewards program.
   */
  tradingRewardsV2: 'tradingRewardsV2',
} as const);

export type PayoutProgram = (typeof PayoutProgram)[keyof typeof PayoutProgram];

/**
 * Supported Bridge Targets
 *
 * @enum
 */
export const BridgeTarget = {
  XCHAIN_XCHAIN: 'xchain.xchain',
  STARGATE_ARBITRUM: 'stargate.arbitrum',
  STARGATE_AURORA: 'stargate.aurora',
  STARGATE_AVALANCHE: 'stargate.avalanche',
  STARGATE_BASE: 'stargate.base',
  STARGATE_BNB: 'stargate.bnb',
  STARGATE_ETHEREUM: 'stargate.ethereum',
  STARGATE_IOTA: 'stargate.iota',
  STARGATE_KLAYTN: 'stargate.klaytn',
  STARGATE_MANTLE: 'stargate.mantle',
  STARGATE_OPTIMISM: 'stargate.optimism',
  STARGATE_POLYGON: 'stargate.polygon',
  STARGATE_SCROLL: 'stargate.scroll',
  STARGATE_RARI: 'stargate.rari',
  STARGATE_SEI: 'stargate.sei',
  STARGATE_TAIKO: 'stargate.taiko',
} as const;

export type BridgeTarget = (typeof BridgeTarget)[keyof typeof BridgeTarget];

/**
 * @internal
 *
 * All possible values for deposit bridgeSource.
 *
 * @enum
 */
export const DepositSource = {
  ...BridgeTarget,
  XCHAIN_REFERRAL_REWARD: 'xchain.referralReward',
  XCHAIN_WALLET_BANKROLL: 'xchain.walletBankroll',
} as const;

export type DepositSource = (typeof DepositSource)[keyof typeof DepositSource];

/**
 * @internal
 *
 * All supported Stargate V2 targets for withdrawal.
 *
 * @enum
 */
export const StargateV2Target = {
  ...BridgeTarget,
} as const;

export type StargateV2Target =
  (typeof StargateV2Target)[keyof typeof StargateV2Target];

/**
 * An enumeration providing all possible events that the {@link OrderBookRealTimeClient} can emit.
 *
 * @enum
 *
 * @category Enums - Request Parameters
 */
export const OrderBookRealTimeClientEvent = {
  /**
   * Emitted when the client is ready to receive messages.
   */
  ready: 'ready',
  /**
   * Emitted when the client connects to the WebSocket server.
   */
  connected: 'connected',
  /**
   * Emitted when the client disconnects from the WebSocket server.
   */
  disconnected: 'disconnected',
  /**
   * Emitted when the client receives an error from the WebSocket server.
   *
   * - Includes an {@link Error} argument with more details about the error
   *   that occurred.
   */
  error: 'error',
  /**
   * Emitted when the orderbook requires a sync from the REST API due to
   * thrashing or an unexpected sequence number.
   */
  sync: 'sync',
  /**
   * Emitted when the client receives a message from the WebSocket server.
   *
   * - Includes the market string as an argument made to the handler
   *   so that the appropriate request can be made to
   *   {@link OrderBookRealTimeClient.getOrderBookL1}
   */
  l1: 'l1',
  /**
   * Emitted when the client receives a message from the WebSocket server.
   *
   * - Includes the market string as an argument made to the handler
   *   so that the appropriate request can be made to
   *   {@link OrderBookRealTimeClient.getOrderBookL2}
   */
  l2: 'l2',
} as const;

export type OrderBookRealTimeClientEvent =
  (typeof OrderBookRealTimeClientEvent)[keyof typeof OrderBookRealTimeClientEvent];

/**
 * All possible WebSocket Subscription Names that require authenticated
 * WebSocket connections.
 *
 * @example
 * ```typescript
 *  import {
 *    WebSocketClient,
 *    SubscriptionNameAuthenticated
 *  } from '@idexio/idex-sdk';
 *
 *  const client = new WebSocketClient({
 *    auth: {
 *      apiKey: '...',
 *      apiSecret: '...',
 *      wallet: '0x...'
 *    }
 *  })
 *
 *  client.onMessage(message => {
 *    console.log('Received WebSocket Message: ', message)
 *  })
 *
 *  await client.subscribeAuthenticated([
 *    { name: SubscriptionNameAuthenticated.positions },
 *    { name: SubscriptionNameAuthenticated.orders },
 *  ])
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see request {@link _types.WebSocketClient.subscribeAuthenticated WebSocketClient.subscribeAuthenticated}
 * @see related {@link SubscriptionNamePublic}
 *
 * @category Enums - Request Parameters
 * @category WebSocket - Subscribe
 * @enum
 */
export const SubscriptionNameAuthenticated = {
  /**
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXDepositEvent IDEXDepositEvent} WebSocket updates via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXDepositEventData IDEXDepositEventData}
   */
  deposits: 'deposits',
  /**
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXFundingPaymentEvent IDEXFundingPaymentEvent} WebSocket updates via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXFundingPaymentEventData IDEXFundingPaymentEventData}
   */
  fundingPayments: 'fundingPayments',
  /**
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXOrderEvent IDEXOrderEvent} WebSocket updates via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXOrderEventData IDEXOrderEventData}
   */
  orders: 'orders',
  /**
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXPositionEvent IDEXPositionEvent} WebSocket updates via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXPositionEventData IDEXPositionEventData}
   */
  positions: 'positions',
  /**
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXWithdrawalEvent IDEXWithdrawalEvent} WebSocket updates via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXWithdrawalEventData IDEXWithdrawalEventData}
   */
  withdrawals: 'withdrawals',
  /**
   * @internal
   */
  webclient: 'webclient',
} as const;

export type SubscriptionNameAuthenticated =
  (typeof SubscriptionNameAuthenticated)[keyof typeof SubscriptionNameAuthenticated];

/**
 * All possible WebSocket Subscription Names that require authenticated
 * WebSocket connections.
 *
 * @example
 * ```typescript
 *  import {
 *    WebSocketClient,
 *    SubscriptionNamePublic,
 *    CandleInterval
 *  } from '@idexio/idex-sdk';
 *
 *  const client = new WebSocketClient();
 *
 *  client.onMessage(message => {
 *    console.log('Received WebSocket Message: ', message)
 *  })
 *
 *  await client.subscribePublic([
 *    // will inherit markets from the markets array
 *    { name: SubscriptionNamePublic.tickers },
 *  ], ['ETH-USD'])
 * ```
 *
 * <br />
 *
 * ---
 *
 * @see request {@link _types.WebSocketClient.subscribePublic WebSocketClient.subscribePublic}
 * @see related {@link SubscriptionNameAuthenticated}
 *
 * @category Enums - Request Parameters
 * @category WebSocket - Subscribe
 * @enum
 */
export const SubscriptionNamePublic = Object.freeze({
  /**
   * **Subscribe Requirements:**
   *
   * - Requires a `markets` array to subscribe to.
   *
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXTickerEvent IDEXTickerEvent} WebSocket updates via the
   *   {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXTickerEventData IDEXTickerEventData}
   */
  tickers: 'tickers',
  /**
   * **Subscribe Requirements:**
   *
   * - Requires a `markets` array to subscribe to.
   *
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXTradeEvent IDEXTradeEvent} WebSocket updates via the
   *   {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXTradeEventData IDEXTradeEventData}
   */
  trades: 'trades',
  /**
   * **Subscribe Requirements:**
   *
   * - Requires a `markets` array to subscribe to.
   *
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXLiquidationEvent IDEXLiquidationEvent} WebSocket updates via the
   *   {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXLiquidationEventData IDEXLiquidationEventData}
   */
  liquidations: 'liquidations',
  /**
   * **Subscribe Requirements:**
   *
   * - Requires a `markets` array to subscribe to.
   * - Requires a {@link _types.CandleInterval CandleInterval} property
   *
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXCandleEvent IDEXCandleEvent} WebSocket updates via the
   *   {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXCandleEventData IDEXCandleEventData}
   */
  candles: 'candles',
  /**
   * **Subscribe Requirements:**
   *
   * - Requires a `markets` array to subscribe to.
   *
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXOrderBookLevel1Event IDEXOrderBookLevel1Event} WebSocket updates via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXOrderBookLevel1EventData IDEXOrderBookLevel1EventData}
   */
  l1orderbook: 'l1orderbook',
  /**
   * **Subscribe Requirements:**
   *
   * - Requires a `markets` array to subscribe to.
   *
   * **Subscription Update Events:**
   *
   * - Receives {@link _types.IDEXOrderBookLevel2Event IDEXOrderBookLevel2Event} WebSocket updates via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   * - `event.data` will match {@link _types.IDEXOrderBookLevel2EventData IDEXOrderBookLevel2EventData}
   */
  l2orderbook: 'l2orderbook',
  /**
   * @internal
   */
  webclient: 'webclient',
} as const);

export type SubscriptionNamePublic =
  (typeof SubscriptionNamePublic)[keyof typeof SubscriptionNamePublic];

/**
 * A combination of {@link SubscriptionNameAuthenticated} and {@link SubscriptionNamePublic}
 * provided as a convenience.
 *
 * - Generally using the separated enums is useful as it makes it obvious which subscriptions
 *   are accepted by the {@link _types.WebSocketClient.subscribeAuthenticated WebSocketClient.subscribeAuthenticated}
 *   and {@link _types.WebSocketClient.subscribePublic WebSocketClient.subscribePublic} methods.
 *
 * @see related {@link SubscriptionNameAuthenticated}
 * @see related {@link SubscriptionNamePublic}
 *
 * @category Enums - Request Parameters
 * @category WebSocket - Subscribe
 * @enum
 */
export const SubscriptionName = {
  ...SubscriptionNamePublic,
  ...SubscriptionNameAuthenticated,
} as const;

export type SubscriptionName =
  (typeof SubscriptionName)[keyof typeof SubscriptionName];

/**
 * @internal
 *
 * Available WebSocket Request Methods
 *
 * @enum
 */
export const WebSocketRequestMethod = Object.freeze({
  /**
   * Creates a new subscription or subscriptions
   *
   * **Subscription Update Events:**
   *
   * - Receives a {@link _types.IDEXSubscriptionsListEvent IDEXSubscriptionsListEvent} WebSocket response via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler listing all active
   *   subscriptions.
   * - Begins receiving {@link _types.IDEXSubscriptionEvent IDEXSubscriptionEvent}'s for all subscribed
   *   subscriptions via the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler.
   */
  subscribe: 'subscribe',
  /**
   * Unsubscribes from a subscription or subscriptions
   *
   * **Subscription Update Events:**
   *
   * - Receives a {@link _types.IDEXSubscriptionsListEvent IDEXSubscriptionsListEvent} WebSocket response via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler listing all active
   *   subscriptions..
   */
  unsubscribe: 'unsubscribe',
  /**
   * List all active subscriptions
   *
   * **Subscription Update Events:**
   *
   * - Receives a {@link _types.IDEXSubscriptionsListEvent IDEXSubscriptionsListEvent} WebSocket response via
   *   the {@link _types.WebSocketClient.onMessage WebSocketClient.onMessage} handler listing all active
   *   subscriptions.
   */
  subscriptions: 'subscriptions',
  /**
   * Ping the server to check if the connection is still alive
   * and to maintain the connection (indicate we are still active).
   *
   * A `pong` is dispatched automatically from the server.
   */
  ping: 'ping',
  /**
   * @internal
   *
   * **WARNING:***
   *
   * This uses a propietary internal mechanism that is automatically handled by
   * most WebSocket libraries.
   *
   * It is here for internal use and attempting to make a request of this value
   * will result in a runtime error.
   */
  pong: 'pong',
} as const);

export type WebSocketRequestMethod =
  (typeof WebSocketRequestMethod)[keyof typeof WebSocketRequestMethod];
