import type {
  FillType,
  FillTypeOrder,
  FillTypeSystem,
} from '#types/enums/response';
import type { KumaOrderFill } from '#types/rest/index';

/**
 * [[include:base.md]]
 *
 * @category Base Types
 */
export interface KumaOrderFillEventDataBase
  extends Omit<KumaOrderFill, 'type' | 'makerSide' | 'sequence' | 'liquidity'> {
  /**
   * @inheritDoc
   */
  type: FillType;
}

/**
 * Fills of type {@link FillTypeSystem}
 *
 * - These types of fills do not include values from {@link KumaOrderFill}
 *   that other fill types include:
 *   - {@link KumaOrderFill.makerSide makerSide}
 *   - {@link KumaOrderFill.sequence sequence}
 *   - {@link KumaOrderFill.liquidity liquidity}
 *
 * @see type {@link FillTypeSystem}
 * @category Kuma - Get Orders
 */
export interface KumaOrderFillEventDataSystem
  extends KumaOrderFillEventDataBase {
  /**
   * @inheritDoc
   */
  type: FillTypeSystem;
}

/**
 * Non-liquidation Order Fill Type
 *
 * @see type {@link FillTypeOrder}
 * @category Kuma - Get Orders
 */
export interface KumaOrderFillEventDataGeneral
  extends KumaOrderFillEventDataBase,
    Pick<KumaOrderFill, 'makerSide' | 'sequence' | 'liquidity'> {
  /**
   * @inheritDoc
   */
  type: FillTypeOrder;
}

/**
 * An orders `fills` will potentially have a different shape
 * dependent on the `type` property of the fill.
 *
 * @category Kuma - Get Orders
 */
export type KumaOrderFillEventData =
  | KumaOrderFillEventDataSystem
  | KumaOrderFillEventDataGeneral;

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link KumaOrderFillEventData.type}
   */
  y: KumaOrderFillEventDataBase['type'];
  /**
   * @see inflated {@link KumaOrderFillEventData.fillId}
   */
  i: KumaOrderFillEventDataGeneral['fillId'];
  /**
   * @see inflated {@link KumaOrderFillEventData.price}
   */
  p: KumaOrderFillEventDataGeneral['price'];
  /**
   * @see inflated {@link KumaOrderFillEventData.quantity}
   */
  q: KumaOrderFillEventDataGeneral['quantity'];
  /**
   * @see inflated {@link KumaOrderFillEventData.quoteQuantity}
   */
  Q: KumaOrderFillEventDataGeneral['quoteQuantity'];
  /**
   * @see inflated {@link KumaOrderFillEventData.realizedPnL}
   */
  rn: KumaOrderFillEventDataGeneral['realizedPnL'];
  /**
   * @see inflated {@link KumaOrderFillEventData.time}
   */
  t: KumaOrderFillEventDataGeneral['time'];
  /**
   * @see inflated {@link KumaOrderFillEventData.fee}
   */
  f?: KumaOrderFillEventDataGeneral['fee'];
  /**
   * @see inflated {@link KumaOrderFillEventData.action}
   */
  a: KumaOrderFillEventDataGeneral['action'];
  /**
   * @see inflated {@link KumaOrderFillEventData.position}
   */
  P: KumaOrderFillEventDataGeneral['position'];
  /**
   * @see inflated {@link KumaOrderFillEventData.txId}
   */
  T: KumaOrderFillEventDataGeneral['txId'];
  /**
   * @see inflated {@link KumaOrderFillEventData.txStatus}
   */
  S: KumaOrderFillEventDataGeneral['txStatus'];
}

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortSystem
  extends WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link KumaOrderFillEventData.type}
   */
  y: KumaOrderFillEventDataSystem['type'];
}

/**
 * @internal
 */
export interface WebSocketResponseOrderFillShortGeneral
  extends WebSocketResponseOrderFillShortBase {
  /**
   * @see inflated {@link KumaOrderFillEventData.type}
   */
  y: KumaOrderFillEventDataGeneral['type'];
  /**
   * @see inflated {@link KumaOrderFillEventData.makerSide}
   */
  s: {} & KumaOrderFillEventDataGeneral['makerSide'];
  /**
   * @see inflated {@link KumaOrderFillEventData.sequence}
   */
  u: {} & KumaOrderFillEventDataGeneral['sequence'];
  /**
   * @see inflated {@link KumaOrderFillEventData.liquidity}
   */
  l: {} & KumaOrderFillEventDataGeneral['liquidity'];
}

/**
 * @internal
 */
export type WebSocketResponseOrderFillShort =
  | WebSocketResponseOrderFillShortSystem
  | WebSocketResponseOrderFillShortGeneral;
