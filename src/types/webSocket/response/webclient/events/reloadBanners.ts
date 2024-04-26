import type { WebClientEvent } from '#types/enums/index';
import type { IDEXWebClientEventDataBase } from '../base.js';

type NoticeArea = 'notification' | 'banner';

export interface IDEXWebClientEventDataReloadBanners
  extends IDEXWebClientEventDataBase {
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
