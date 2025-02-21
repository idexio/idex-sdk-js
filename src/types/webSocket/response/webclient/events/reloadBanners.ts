import type { WebClientEvent } from '#types/enums/index';
import type { KumaWebClientEventDataBase } from '../base.js';

type NoticeArea = 'notification' | 'banner';

export interface KumaWebClientEventDataReloadBanners
  extends KumaWebClientEventDataBase {
  readonly event: typeof WebClientEvent.reload_banners;
  readonly action: NoticeArea;
  wallet?: undefined;
  readonly payload: {
    change: 'add' | 'remove';
    /**
     * The id of the notice that was added or removed
     */
    id: string;
  };
}
