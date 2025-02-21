import type {
  PayoutProgram,
  WebClientEvent,
  WebClientEventTxSettledAction,
} from '#types/enums/index';
import type { AnyObj } from '#types/utils';
import type { KumaWebClientEventDataBase } from '../base.js';

interface KumaWebClientEventDataTxSettledBase
  extends KumaWebClientEventDataBase {
  /**
   * @inheritDoc
   */
  readonly event: typeof WebClientEvent.transaction_settled;
  /**
   * @inheritDoc
   */
  readonly wallet: string;
  /**
   * @inheritDoc
   */
  readonly action?: WebClientEventTxSettledAction;
  /**
   * @inheritDoc
   */
  readonly payload: AnyObj;
}

export interface KumaWebClientEventDataTxSettledPayout
  extends KumaWebClientEventDataTxSettledBase {
  /**
   * @inheritDoc
   */
  readonly action: typeof WebClientEventTxSettledAction.payout;
  /**
   * @inheritDoc
   */
  readonly payload: {
    /**
     * - Will be deprecated in future release
     */
    payoutProgramId: number;
    /**
     * @see enum {@link PayoutProgram}
     */
    program: PayoutProgram;
    asset: 'USDC' | 'KUMA';
    amountPaid: string;
    nonce: string;
    txHash: string;
  };
}

export interface KumaWebClientEventDataTxSettledWithdraw
  extends KumaWebClientEventDataTxSettledBase {
  /**
   * @inheritDoc
   */
  readonly action: typeof WebClientEventTxSettledAction.withdraw;
  /**
   * @inheritDoc
   */
  readonly payload: {
    withdrawalId: string | null;
    asset: 'USDC';
    txHash: string;
  };
}

export interface KumaWebClientEventDataTxSettledExecuteTrade
  extends KumaWebClientEventDataTxSettledBase {
  /**
   * @inheritDoc
   */
  readonly action: typeof WebClientEventTxSettledAction.executeTrade;
  /**
   * @inheritDoc
   */
  readonly payload: {
    fillId: string;
    orderId: string;
    market: string;
    txHash: string;
  };
}

export type KumaWebClientEventDataTxSettled =
  | KumaWebClientEventDataTxSettledPayout
  | KumaWebClientEventDataTxSettledWithdraw
  | KumaWebClientEventDataTxSettledExecuteTrade;
