import type { WebClientEvent } from '#types/enums/index';
import type { AnyObj } from '#types/utils';

export interface KumaWebClientEventDataBase {
  /**
   * When provided, use the value to narrow the shape of {@link action}
   */
  readonly event: WebClientEvent;
  /**
   * When provided, use to narrow the shape of {@link payload}
   */
  readonly action?: string;
  /**
   * The wallet address to dispatch the event to if provided.
   *
   * - When not given, indicates the event was dispatched as a broadcast or through
   *   some other filter.
   */
  readonly wallet?: string;

  /**
   * The shape of `payload` is dependent upon the {@link event} and {@link action} properties value(s).
   */
  readonly payload?: AnyObj;
}
