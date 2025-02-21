import type {
  OrderSide,
  RestRequestByMarket,
  RestRequestPaginationWithFromId,
} from '#index';

/**
 * Get Liquidations
 *
 * @see response {@link RestResponseGetLiquidations}
 * @see type {@link KumaLiquidation}
 *
 * @category Kuma - Get Liquidations
 */
export interface RestRequestGetLiquidations
  extends RestRequestByMarket,
    RestRequestPaginationWithFromId {}

/**
 * @see request {@link RestRequestGetLiquidations}
 * @see response {@link RestResponseGetLiquidations}
 *
 * @category Kuma - Get Liquidations
 * @category Kuma Interfaces
 */
export interface KumaLiquidation {
  /**
   * Liquidation identifier
   */
  fillId: string;
  /**
   * Price of the liquidation in quote terms
   */
  price: string;
  /**
   * Quantity of the liquidation in base terms
   */
  quantity: string;
  /**
   * Quantity of the liquidation in quote terms
   */
  quoteQuantity: string;
  /**
   * Timestamp of the liquidation
   */
  time: number;
  /**
   * Liquidation side of the settlement, `buy` or `sell`
   */
  liquidationSide: OrderSide;
}

/**
 * @see type {@link KumaLiquidation}
 * @see request {@link RestRequestGetLiquidations}
 *
 * @category Kuma - Get Liquidations
 */
export type RestResponseGetLiquidations = KumaLiquidation[];
