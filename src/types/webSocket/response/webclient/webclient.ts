import type { MessageEventType } from '#types/enums/index';
import type { KumaSubscriptionEventBase } from '#types/webSocket/base';
import type {
  KumaWebClientEventDataReloadBanners,
  KumaWebClientEventDataExchangeStatus,
  KumaWebClientEventDataTxSettled,
} from './events/index.js';

export type KumaWebClientEventData =
  | KumaWebClientEventDataReloadBanners
  | KumaWebClientEventDataExchangeStatus
  | KumaWebClientEventDataTxSettled;

export interface KumaWebClientEvent extends KumaSubscriptionEventBase {
  /**
   * @inheritDoc
   */
  readonly type: typeof MessageEventType.webclient;
  readonly data: KumaWebClientEventData;
}

export type WebSocketResponseSubscriptionMessageShortWebClient =
  KumaWebClientEvent;
