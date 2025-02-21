import type {
  RestRequestPaginationWithFromId,
  RestRequestByWallet,
  BridgeTarget,
  ChainTransactionStatus,
} from '#index';

/**
 * Get a single {@link KumaWithdrawal}
 *
 * @see response {@link RestResponseGetWithdrawal}
 * @see type     {@link KumaWithdrawal}
 *
 * @category Kuma - Get Withdrawals
 */
export interface RestRequestGetWithdrawal extends RestRequestByWallet {
  /**
   * Single `withdrawalId` to return
   */
  withdrawalId: string;
}

/**
 *  GET an array of {@link KumaWithdrawal}
 *
 * @see response {@link RestResponseGetWithdrawals}
 * @see type     {@link KumaWithdrawal}
 *
 * @category Kuma - Get Withdrawals
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
 * @category Kuma - Get Withdrawals
 * @category Kuma - Withdraw Funds
 * @category Kuma Interfaces
 */
export interface KumaWithdrawal {
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
  /**
   * Transaction id of the withdrawal transaction on XCHAIN or null if not yet
   * assigned; also queryable for bridge details on https://layerzeroscan.com/
   */
  xchainTxId: string | null;
  /**
   * Status of the withdrawal transaction on XCHAIN
   *
   * @see enum {@link ChainTransactionStatus}
   */
  xchainTxStatus: ChainTransactionStatus;
}

/**
 * @see type {@link KumaWithdrawal}
 * @see request {@link RestRequestGetWithdrawal}
 * @see related {@link RestResponseGetWithdrawals}
 *
 * @category Kuma - Get Withdrawals
 */
export type RestResponseGetWithdrawal = KumaWithdrawal;

/**
 * @see type {@link KumaWithdrawal}
 * @see request {@link RestRequestGetWithdrawals}
 * @see related {@link RestResponseGetWithdrawal}
 *
 * @category Kuma - Get Withdrawals
 */
export type RestResponseGetWithdrawals = KumaWithdrawal[];
