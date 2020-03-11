/**
 * @readonly
 * @enum {string}
 */
export enum MarketStatus {
  /**
   * No orders or cancels accepted
   * @type {string}
   */
  inactive,
  /**
   * Cancels accepted but not trades
   * @type {string}
   */
  cancelsOnly,
  /**
   * Trades and cancels accepted
   * @type {string}
   */
  active,
}

/**
 * @readonly
 * @enum {string}
 */
export enum OrderSide {
  /** @type {string} */
  buy,
  /** @type {string} */
  sell,
}

/**
 * @readonly
 * @enum {string}
 */
export enum OrderStatus {
  /**
   * Stop order exists on the order book
   * @type {string}
   */
  active,
  /**
   * Limit order exists on the order book
   * @type {string}
   */
  open,
  /**
   * Limit order has completed fills but has remaining open quantity
   * @type {string}
   */
  partiallyFilled,
  /**
   * Limit order is completely filled and is no longer on the book; market order was filled
   * @type {string}
   */
  filled,
  /**
   * Limit order was cancelled prior to execution completion but may be partially filled
   * @type {string}
   */
  cancelled,
  /**
   * Order was rejected by the trading engine
   * @type {string}
   */
  rejected,
  /**
   * GTT limit order expired prior to execution completion but may be partially filled
   * @type {string}
   */
  expired,
  /**
   * Order submitted to the test endpoint and accepted by the trading engine, not executed
   * @type {string}
   */
  testOnlyAccepted,
  /**
   * Order submitted to the test endpoint and rejected by validation or the trading engine, not executed
   * @type {string}
   */
  testOnlyRejected,
}

/**
 * @readonly
 * @enum {string}
 */
export enum OrderType {
  /** @type {string} */
  market,
  /** @type {string} */
  limit,
  /** @type {string} */
  limitMaker,
  /** @type {string} */
  stopLoss,
  /** @type {string} */
  stopLossLimit,
  /** @type {string} */
  takeProfit,
  /** @type {string} */
  takeProfitLimit,
}

/**
 * @readonly
 * @enum {string}
 */
export enum OrderTimeInForce {
  /**
   * Good until cancelled (default)
   * @type {string}
   */
  gtc,
  /**
   * Good until time
   * @type {string}
   */
  gtt,
  /**
   * Immediate or cancel
   * @type {string}
   */
  ioc,
  /**
   * Fill or kill
   * @type {string}
   */
  fok,
}

/**
 * @readonly
 * @enum {string}
 */
export enum OrderSelfTradePrevention {
  /**
   * When two orders from the same user cross, the smaller order will be canceled and the larger order size will be
   * decremented by the smaller order size. If the two orders are the same size, both will be canceled.
   * @type {string}
   */
  decreaseAndCancel,
  /**
   * Cancel the older (maker) order in full
   * @type {string}
   */
  cancelOldest,
  /**
   * Cancel the newer (taker) order in full
   * @type {string}
   */
  cancelNewest,
  /**
   * Cancel both orders
   * @type {string}
   */
  cancelBoth,
}
