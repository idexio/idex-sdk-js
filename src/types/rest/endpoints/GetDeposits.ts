import type * as idex from '#index';

/**
 * Get Deposit Request
 *
 * @see request  {@link idex.RestAuthenticatedClient.getDeposit RestAuthenticatedClient.getDeposit}
 * @see related  {@link RestRequestGetDeposits}
 *
 * @category IDEX - Get Deposits
 */
export interface RestRequestGetDeposit extends idex.RestRequestByWallet {
  /**
   * Single `depositId` to return
   */
  depositId: string;
}

/**
 * Get {@link IDEXDeposit Deposits}
 *
 * @see typedoc  [Reference Documentation](https://sdk-js-docs-v4.idex.io/interfaces/RestRequestGetDeposits.html)
 * @see request  {@link idex.RestAuthenticatedClient.getDeposits RestAuthenticatedClient.getDeposits}
 * @see related  {@link RestRequestGetDeposit}
 *
 * @category IDEX - Get Deposits
 */
export interface RestRequestGetDeposits
  extends idex.RestRequestByWallet,
    idex.RestRequestPaginationWithFromId {
  depositId?: undefined;
}

/**
 * An object which represents a single deposit on the exchange.
 *
 * @see request  {@link idex.RestAuthenticatedClient.getDeposit RestAuthenticatedClient.getDeposit}
 * @see request  {@link idex.RestAuthenticatedClient.getDeposits RestAuthenticatedClient.getDeposits}
 *
 * @category IDEX - Get Deposits
 * @category IDEX Interfaces
 */
export interface IDEXDeposit {
  /**
   * IDEX-issued deposit identifier
   */
  depositId: string;
  /**
   * Asset symbol for collateral token
   */
  asset: string;
  /**
   * Deposit amount in asset terms
   */
  quantity: string;
  /**
   * Bridge and source chain of the deposit
   *
   * - Use the {@link idex.BridgeTarget BridgeTarget} enum to narrow
   *   all possible values when needed.
   *
   * @see enum {@link idex.BridgeTarget BridgeTarget}
   */
  bridgeSource: idex.BridgeTarget;
  /**
   * Timestamp of crediting the deposited funds on the exchange
   */
  time: number;
  /**
   * Transaction hash
   */
  txId: string;
}

/**
 * Returns of a single deposit by the `depositId` provided.
 *
 * @see type    {@link IDEXDeposit}
 * @see request {@link RestRequestGetDeposit}
 * @see related {@link RestResponseGetDeposits}
 * @see related {@link RestRequestGetDeposits}
 *
 * @category IDEX - Get Deposits
 */
export type RestResponseGetDeposit = IDEXDeposit;

/**
 * Returns deposits according to the request parameters.
 *
 * @see type    {@link IDEXDeposit}
 * @see request {@link RestRequestGetDeposits}
 * @see related {@link RestResponseGetDeposit}
 * @see related {@link RestRequestGetDeposit}
 *
 * @category IDEX - Get Deposits
 */
export type RestResponseGetDeposits = IDEXDeposit[];
