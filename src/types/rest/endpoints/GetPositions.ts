import type { RestRequestByMarketOptional, RestRequestByWallet } from '#index';

/**
 * Get Positions
 *
 * @see response {@link RestResponseGetPositions}
 * @see type {@link KumaPosition}
 * @category Kuma - Get Positions
 */
export interface RestRequestGetPositions
  extends RestRequestByWallet,
    RestRequestByMarketOptional {}

/**
 * @see request {@link RestRequestGetPositions}
 * @see response {@link RestResponseGetPositions}
 * @category Kuma Interfaces
 * @category Kuma - Get Positions
 */
export interface KumaPosition {
  /**
   * Market symbol for the item
   */
  market: string;

  /**
   * Base quantity, negative for short positions
   */
  quantity: string;
  /**
   * Maximum absolute quantity of the position during its existence
   */
  maximumQuantity: string;
  /**
   * Average entry price of the position
   */
  entryPrice: string;
  /**
   * Average exit price of the position
   */
  exitPrice: string;
  /**
   * Current mark price of the market
   */
  markPrice: string;
  /**
   * Current index price of the market
   */
  indexPrice: string;
  /**
   * Index price beyond which the position will be liquidated
   */
  liquidationPrice: string;
  /**
   * Position value at mark price
   */
  value: string;
  /**
   * Realized PnL of the position in quote terms, including funding payments
   */
  realizedPnL: string;
  /**
   * Unrealized PnL of the position in quote terms at the mark price
   */
  unrealizedPnL: string;
  /**
   * Current initial margin requirement of the position
   */
  marginRequirement: string;
  /**
   * Cross-margined position leverage
   */
  leverage: string;
  /** Net total of all funding payments for the position */
  totalFunding: string;
  /**
   * Total of all trade quantities that increased the position in base terms
   */
  totalOpen: string;
  /**
   * Total of all trade quantities that decreased the position in base terms
   */
  totalClose: string;
  /**
   * Position ADL risk, 0-5 (5 is highest risk)
   */
  adlQuintile: number;
  /**
   * Id of the fill that opened the position
   */
  openedByFillId: string;
  /**
   * Id of the fill that most recently updated the position
   */
  lastFillId: string;
  /**
   * The timestamp indicating when the item was created.
   */
  time: number;
}

/**
 * @see type {@link KumaPosition}
 * @see request {@link RestRequestGetPositions}
 *
 * @category Kuma - Get Positions
 */
export type RestResponseGetPositions = KumaPosition[];
