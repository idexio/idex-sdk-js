import type {
  PayoutProgram,
  WebClientEvent,
  WebClientEventTxSettledAction,
} from '#types/enums/index';
import type { AnyObj } from '#types/utils';
import type { IDEXWebClientEventDataBase } from '../base.js';

interface IDEXWebClientEventDataTxSettledBase
  extends IDEXWebClientEventDataBase {
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

export interface IDEXWebClientEventDataTxSettledPayout
  extends IDEXWebClientEventDataTxSettledBase {
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
    asset: 'USDC' | 'IDEX';
    amountPaid: string;
    nonce: string;
    txHash: string;
  };
}

export interface IDEXWebClientEventDataTxSettledWithdraw
  extends IDEXWebClientEventDataTxSettledBase {
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

export interface IDEXWebClientEventDataTxSettledExecuteTrade
  extends IDEXWebClientEventDataTxSettledBase {
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

export type IDEXWebClientEventDataTxSettled =
  | IDEXWebClientEventDataTxSettledPayout
  | IDEXWebClientEventDataTxSettledWithdraw
  | IDEXWebClientEventDataTxSettledExecuteTrade;
