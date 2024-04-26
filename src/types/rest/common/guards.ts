/**
 * @module guards
 */

import { CandleInterval } from '#types/enums/request';

import type {
  RestRequestCancelOrder,
  RestRequestCancelOrders,
  RestRequestCancelOrdersByDelegatedKey,
  RestRequestCancelOrdersByMarket,
} from '#types/rest/endpoints/CancelOrders';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @see {@link RestRequestCancelOrder}
 *
 * @internal
 */
export function isRestRequestCancelOrder(
  request: any,
): request is RestRequestCancelOrder {
  return (
    typeof request.orderId === 'string' &&
    typeof request.market === 'undefined' &&
    typeof request.wallet === 'string'
  );
}

/**
 * @see {@link RestRequestCancelOrders}
 *
 * @internal
 */
export function isRestRequestCancelOrders(
  request: any,
): request is RestRequestCancelOrders {
  return (
    typeof request.orderId === 'undefined' && typeof request.wallet === 'string'
  );
}

/**
 * @see {@link RestRequestCancelOrdersByDelegatedKey}
 *
 * @internal
 */
export function isRestRequestCancelOrdersByDelegatedKey(
  request: any,
): request is RestRequestCancelOrdersByDelegatedKey {
  return (
    request.orderDelegatedKey &&
    typeof request.orderDelegatedKey === 'string' &&
    isRestRequestCancelOrders(request)
  );
}

/**
 * @see {@link RestRequestCancelOrdersByMarket}
 *
 * @internal
 */
export function isRestRequestCancelOrdersByMarket(
  request: any,
): request is RestRequestCancelOrdersByMarket {
  return (
    typeof request.market === 'string' && isRestRequestCancelOrders(request)
  );
}

const intervals = Object.values(CandleInterval);

/**
 * @see {@link RestRequestCancelOrdersByMarket}
 *
 * @internal
 */
export function isCandleInterval(value: any): value is CandleInterval {
  return intervals.includes(value);
}
