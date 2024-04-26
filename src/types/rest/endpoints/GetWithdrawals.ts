import type {
  RestRequestPaginationWithFromId,
  RestRequestByWallet,
  BridgeTarget,
  ChainTransactionStatus,
} from '#index';

/**
 * Get a single {@link IDEXWithdrawal}
 *
 * @see response {@link RestResponseGetWithdrawal}
 * @see type     {@link IDEXWithdrawal}
 *
 * @category IDEX - Get Withdrawals
 */
export interface RestRequestGetWithdrawal extends RestRequestByWallet {
  /**
   * Single `withdrawalId` to return
   */
  withdrawalId: string;
}

/**
 *  GET an array of {@link IDEXWithdrawal}
 *
 * @see response {@link RestResponseGetWithdrawals}
 * @see type     {@link IDEXWithdrawal}
 *
 * @category IDEX - Get Withdrawals
 */
export interface RestRequestGetWithdrawals
  extends RestRequestByWallet,
    RestRequestPaginationWithFromId {
  /**
   * @defaultValue 50
   */
  limit?: number;
  /**
   * Only valid with {@link RestRequestGetWithdrawal}
   */
  withdrawalId?: undefined;
}

/**
 * @see request {@link RestRequestGetWithdrawals}
 * @see response {@link RestResponseGetWithdrawals}
 * @see request {@link RestRequestGetWithdrawal}
 * @see response {@link RestResponseGetWithdrawal}
 *
 * @category IDEX - Get Withdrawals
 * @category IDEX - Withdraw Funds
 * @category IDEX Interfaces
 */
export interface IDEXWithdrawal {
  /** Exchange-assigned withdrawal identifier */
  withdrawalId: string;
  /** Asset symbol */
  asset: string;
  /**
   * **Gross** quantity of the withdrawal
   */
  quantity: string;
  /**
   * The gas fee paid for the withdrawal.
   */
  gas: string;
  /** Bridge and target chain of the withdrawal */
  bridgeTarget: BridgeTarget;
  /** Timestamp of withdrawal API request */
  time: number;
  /** Blockchain transaction ID, if available */
  txId: string | null;
  /**
   * Blockchain transaction status
   *
   * @see enum {@link ChainTransactionStatus}
   */
  txStatus: ChainTransactionStatus;
}

/**
 * @see type {@link IDEXWithdrawal}
 * @see request {@link RestRequestGetWithdrawal}
 * @see related {@link RestResponseGetWithdrawals}
 *
 * @category IDEX - Get Withdrawals
 */
export type RestResponseGetWithdrawal = IDEXWithdrawal;

/**
 * @see type {@link IDEXWithdrawal}
 * @see request {@link RestRequestGetWithdrawals}
 * @see related {@link RestResponseGetWithdrawal}
 *
 * @category IDEX - Get Withdrawals
 */
export type RestResponseGetWithdrawals = IDEXWithdrawal[];
