import type {
  WebClientEvent,
  WebClientEventExchangeStatusAction,
} from '#types/enums/index';
import type { AnyObj } from '#types/utils';
import type { KumaWebClientEventDataBase } from '../base.js';

interface KumaWebClientEventDataExchangeStatusBase
  extends KumaWebClientEventDataBase {
  readonly event: typeof WebClientEvent.exchange_status_updated;
  /**
   * @see enum {@link WebClientEventExchangeStatusAction}
   */
  readonly action: WebClientEventExchangeStatusAction;
  readonly payload?: AnyObj;
}

export interface KumaWebClientEventDataExchangeStatusExchange
  extends KumaWebClientEventDataExchangeStatusBase {
  readonly action: typeof WebClientEventExchangeStatusAction.controls_exchange;
  readonly wallet?: undefined;
  readonly payload?: undefined;
}

export interface KumaWebClientEventDataExchangeStatusMarket
  extends KumaWebClientEventDataExchangeStatusBase {
  readonly action: typeof WebClientEventExchangeStatusAction.controls_market;
  readonly wallet?: undefined;
  readonly payload: {
    market: string;
  };
}

export interface KumaWebClientEventDataExchangeStatusWallet
  extends KumaWebClientEventDataExchangeStatusBase {
  readonly action: typeof WebClientEventExchangeStatusAction.controls_wallet;
  readonly wallet: string;
  readonly payload?: undefined;
}

export type KumaWebClientEventDataExchangeStatus =
  | KumaWebClientEventDataExchangeStatusExchange
  | KumaWebClientEventDataExchangeStatusMarket
  | KumaWebClientEventDataExchangeStatusWallet;
