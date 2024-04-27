/**
 * @internal
 */
export enum EthTransactionStatus {
  /**
   * Either not yet submitted or not yet mined
   */
  pending,
  /**
   * Mined, no need for any block confirmation delay
   */
  mined,
  /**
   * Transaction reverted
   */
  failed,
}

/**
 * @internal
 */
export enum MarketType {
  /**
   * Orderbook trades accepted
   */
  perpetual,
}

/**
 * @internal
 */
export enum OrderSelfTradePreventionSigEnum {
  /**
   * Decrement And Cancel (DC) - When two orders from the same user cross, the smaller order will
   * be canceled and the larger order size will be decremented by the smaller order size. If the two
   * orders are the same size, both will be canceled.
   */
  dc,
  /**
   * Cancel Oldest (CO) - Cancel the older (maker) order in full
   */
  co,
  /**
   * Cancel Newest (CN) - Cancel the newer, taker order and leave the older, resting order on the
   * order book. This is the only valid option when time-in-force is set to fill or kill
   */
  cn,
  /**
   * Cancel Both (CB) - Cancel both orders
   */
  cb,
}

/**
 * @internal
 */
export enum OrderSideSigEnum {
  buy,
  sell,
}

/**
 * @internal
 */
export enum OrderTimeInForceSigEnum {
  /**
   * Good until canceled (default)
   */
  gtc,
  /**
   * Good until crossing
   */
  gtx,
  /**
   * Immediate or cancel
   */
  ioc,
  /**
   * Fill or kill
   */
  fok,
}

/**
 * @internal
 */
export enum OrderTriggerTypeSigEnum {
  none,
  last,
  index,
}

/**
 * @internal
 */
export enum OrderTypeSigEnum {
  market,
  limit,
  stopLossMarket,
  stopLossLimit,
  takeProfitMarket,
  takeProfitLimit,
  trailingStopMarket,
  // NOTE: WebSocket also uses liquidation and deleverage
  //       these are represented in the value-based enums
}

/**
 * @internal
 */
export enum TradeType {
  orderBook,
}
