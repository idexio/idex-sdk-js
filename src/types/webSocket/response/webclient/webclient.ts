import type { MessageEventType } from '#types/enums/index';
import type { IDEXSubscriptionEventBase } from '#types/webSocket/base';
import type {
  IDEXWebClientEventDataReloadBanners,
  IDEXWebClientEventDataExchangeStatus,
  IDEXWebClientEventDataTxSettled,
} from './events/index.js';

export type IDEXWebClientEventData =
  | IDEXWebClientEventDataReloadBanners
  | IDEXWebClientEventDataExchangeStatus
  | IDEXWebClientEventDataTxSettled;

export interface IDEXWebClientEvent extends IDEXSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  readonly type: typeof MessageEventType.webclient;
  readonly data: IDEXWebClientEventData;
}

export type WebSocketResponseSubscriptionMessageShortWebClient =
  IDEXWebClientEvent;
