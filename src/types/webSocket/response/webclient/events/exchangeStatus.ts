import type {
  WebClientEvent,
  WebClientEventExchangeStatusAction,
} from '#types/enums/index';
import type { AnyObj } from '#types/utils';
import type { IDEXWebClientEventDataBase } from '../base.js';

interface IDEXWebClientEventDataExchangeStatusBase
  extends IDEXWebClientEventDataBase {
  readonly event: typeof WebClientEvent.exchange_status_updated;
  /**
   * @see enum {@link WebClientEventExchangeStatusAction}
   */
  readonly action: WebClientEventExchangeStatusAction;
  readonly payload?: AnyObj;
}

export interface IDEXWebClientEventDataExchangeStatusExchange
  extends IDEXWebClientEventDataExchangeStatusBase {
  readonly action: typeof WebClientEventExchangeStatusAction.controls_exchange;
  readonly wallet?: undefined;
  readonly payload?: undefined;
}

export interface IDEXWebClientEventDataExchangeStatusMarket
  extends IDEXWebClientEventDataExchangeStatusBase {
  readonly action: typeof WebClientEventExchangeStatusAction.controls_market;
  readonly wallet?: undefined;
  readonly payload: {
    market: string;
  };
}

export interface IDEXWebClientEventDataExchangeStatusWallet
  extends IDEXWebClientEventDataExchangeStatusBase {
  readonly action: typeof WebClientEventExchangeStatusAction.controls_wallet;
  readonly wallet: string;
  readonly payload?: undefined;
}

export type IDEXWebClientEventDataExchangeStatus =
  | IDEXWebClientEventDataExchangeStatusExchange
  | IDEXWebClientEventDataExchangeStatusMarket
  | IDEXWebClientEventDataExchangeStatusWallet;
