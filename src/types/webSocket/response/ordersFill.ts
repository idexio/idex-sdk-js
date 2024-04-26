import type { FillType } from '#types/enums/response';
import type { IDEXOrderFill } from '#types/rest/index';

/**
 * [[include:base.md]]
 *
 * @category Base Types
 */
export interface IDEXOrderFillEventDataBase
  extends Omit<IDEXOrderFill, 'type' | 'makerSide' | 'sequence' | 'liquidity'> {
  /**
   * @inheritDoc
   */
  type: FillType;
}

/**
 * Deleverage Order Fill Type
 *
 * @category IDEX - Get Orders
 */
export interface IDEXOrderFillEventDataDeleverage
  extends IDEXOrderFillEventDataBase {
  /**
   * @inheritDoc
   */
  type: typeof FillType.deleverage;
}

/**
 * liquidation Order Fill Type
 *
 * @category IDEX - Get Orders
 */
export interface IDEXOrderFillEventDataLiquidation
  extends IDEXOrderFillEventDataBase {
  /**
   * @inheritDoc
   */
  type: typeof FillType.liquidation;
}

/**
 * Non-liquidation Order Fill Type
 *
 * @category IDEX - Get Orders
 */
export interface IDEXOrderFillEventDataGeneral
  extends IDEXOrderFillEventDataBase,
    Pick<IDEXOrderFill, 'makerSide' | 'sequence' | 'liquidity'> {
  /**
   * @inheritDoc
   */
  type: Exclude<
    FillType,
    typeof FillType.liquidation | typeof FillType.deleverage
  >;
}

/**
 * An orders `fills` will potentially have a different shape
 * dependent on the `type` property of the fill.
 *
 * @category IDEX - Get Orders
 */
export type IDEXOrderFillEventData =
  | IDEXOrderFillEventDataDeleverage
  | IDEXOrderFillEventDataLiquidation
  | IDEXOrderFillEventDataGeneral;

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link IDEXOrderFillEventData.type}
   */
  y: IDEXOrderFillEventDataBase['type'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.fillId}
   */
  i: IDEXOrderFillEventDataGeneral['fillId'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.price}
   */
  p: IDEXOrderFillEventDataGeneral['price'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.quantity}
   */
  q: IDEXOrderFillEventDataGeneral['quantity'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.quoteQuantity}
   */
  Q: IDEXOrderFillEventDataGeneral['quoteQuantity'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.realizedPnL}
   */
  rn: IDEXOrderFillEventDataGeneral['realizedPnL'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.time}
   */
  t: IDEXOrderFillEventDataGeneral['time'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.fee}
   */
  f?: IDEXOrderFillEventDataGeneral['fee'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.action}
   */
  a: IDEXOrderFillEventDataGeneral['action'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.position}
   */
  P: IDEXOrderFillEventDataGeneral['position'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.txId}
   */
  T: IDEXOrderFillEventDataGeneral['txId'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.txStatus}
   */
  S: IDEXOrderFillEventDataGeneral['txStatus'];
}

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortDeleverage
  extends WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link IDEXOrderFillEventData.type}
   */
  y: IDEXOrderFillEventDataDeleverage['type'];
}

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortLiquidation
  extends WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link IDEXOrderFillEventData.type}
   */
  y: IDEXOrderFillEventDataLiquidation['type'];
}

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortGeneral
  extends WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link IDEXOrderFillEventData.type}
   */
  y: IDEXOrderFillEventDataGeneral['type'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.makerSide}
   */
  s: {} & IDEXOrderFillEventDataGeneral['makerSide'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.sequence}
   */
  u: {} & IDEXOrderFillEventDataGeneral['sequence'];
  /**
   * @see inflated {@link IDEXOrderFillEventData.liquidity}
   */
  l: {} & IDEXOrderFillEventDataGeneral['liquidity'];
}

/**
 * @internal
 */
export type WebSocketResponseOrderFillShort =
  | WebSocketResponseOrderFillShortDeleverage
  | WebSocketResponseOrderFillShortGeneral
  | WebSocketResponseOrderFillShortLiquidation;
