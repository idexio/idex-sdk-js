import type { RestRequestPagination, RestRequestByWallet } from '#index';

/**
 * Get Historical PnL
 *
 * @see response {@link RestResponseGetHistoricalPnL}
 * @see type {@link IDEXHistoricalProfitLoss}
 *
 * @category IDEX - Get Historical PnL
 */
export interface RestRequestGetHistoricalPnL
  extends RestRequestByWallet,
    RestRequestPagination {}

/**
 * @category IDEX - Get Historical PnL
 * @category IDEX Interfaces
 */
export interface IDEXHistoricalProfitLoss {
  /** Total account value */
  equity: string;
  /**
   * Total PnL for account since first deposit
   */
  totalPnL: string;
  /**
   * Net quantity deposited and withdrawn since the last data point in quote terms
   */
  netDepositsWithdrawals: string;
  /**
   * The timestamp indicating when the item was created.
   */
  time: number;
}

/**
 * @see type {@link IDEXHistoricalProfitLoss}
 * @see request {@link RestRequestGetHistoricalPnL}
 *
 * @category IDEX - Get Historical PnL
 */
export type RestResponseGetHistoricalPnL = IDEXHistoricalProfitLoss[];
