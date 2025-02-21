import type { RestRequestWithSignature } from '#types/utils';
import type * as idex from '@idexio/idex-sdk/types';

/**
 * [[include:unexported.md]]
 *
 * @category Base Types
 */
interface RestRequestCancelOrdersBase
  extends idex.RestRequestByWallet,
    idex.DelegatedKeyParams,
    idex.RestRequestByMarketOptional {
  /**
   * - When specified, cancels multiple orders by orderId or clientOrderId.
   *   - You may provide an orders {@link idex.KumaOrder.orderId orderId}
   *   - You may provide an orders {@link idex.KumaOrder.clientOrderId clientOrderId}
   *     by prefixing it with `client:`
   *
   * @throws {BAD_REQUEST} If `orderIds` array is empty
   */
  readonly orderIds?: string[];
  /**
   * - Delegated key used for the order, if any
   * - This is only allowed when using the `cancelOrders` client method.
   */
  readonly orderDelegatedKey?: string;
}

/**
 * Allows cancelling all open orders for a given wallet.
 *
 * @category Kuma - Cancel Order
 *
 * @see request {@link RestRequestCancelOrders}
 */
export interface RestRequestCancelOrdersByWallet
  extends RestRequestCancelOrdersBase {
  market?: undefined;
  orderDelegatedKey?: undefined;
  orderIds?: undefined;
}

/**
 * Allows cancelling all open orders by one or more orderId's or clientOrderId's.
 *
 * @category Kuma - Cancel Order
 *
 * @see request {@link RestRequestCancelOrders}
 */
export interface RestRequestCancelOrdersByOrderIds
  extends RestRequestCancelOrdersBase {
  market?: undefined;
  orderDelegatedKey?: undefined;
  /**
   * @inheritDoc
   */
  readonly orderIds: string[];
}

/**
 * Allows cancelling all open orders of a wallet for a given market.
 *
 * @category Kuma - Cancel Order
 *
 * @see request {@link RestRequestCancelOrders}
 */
export interface RestRequestCancelOrdersByMarket
  extends RestRequestCancelOrdersBase {
  /**
   * @inheritDoc
   */
  readonly market: string;
  orderDelegatedKey?: undefined;
  orderIds?: undefined;
}

/**
 * Allows cancelling all open orders of a wallet using the given delegated key.
 *
 * @category Kuma - Cancel Order
 *
 * @see request {@link RestRequestCancelOrders}
 */
export interface RestRequestCancelOrdersByDelegatedKey
  extends RestRequestCancelOrdersBase {
  market?: undefined;
  orderIds?: undefined;
  /**
   * @inheritDoc
   */
  readonly orderDelegatedKey: string;
}

/**
 * Cancel Orders can be done with various parameter combinations depending on
 * the desired behavior.
 *
 * - {@link RestRequestCancelOrdersByWallet} - Cancel all open orders for a given wallet.
 * - {@link RestRequestCancelOrdersByOrderIds} - Cancel all orders for a given wallet by one or more orderId's or clientOrderId's.
 * - {@link RestRequestCancelOrdersByMarket} - Cancel all open orders for a given wallet on a specific market.
 * - {@link RestRequestCancelOrdersByDelegatedKey} - Cancel all open orders for a given wallet using a specific delegated key.
 *
 * @see related {@link RestRequestCancelOrder} - Cancel a single order by its `orderId`.
 *
 * @category Kuma - Cancel Order
 */
export type RestRequestCancelOrders =
  | RestRequestCancelOrdersByOrderIds
  | RestRequestCancelOrdersByMarket
  | RestRequestCancelOrdersByDelegatedKey
  | RestRequestCancelOrdersByWallet;

/**
 * Response to "cancel order" requests (single or multiple orders). Includes
 * one object for each successfully canceled order.
 *
 * @category Kuma Interfaces
 * @category Kuma - Cancel Order
 */
export interface KumaCanceledOrder {
  /**
   * Exchange-assigned order identifier. Will not be present for client order IDs
   * that were not found on the books and were not filled
   */
  readonly orderId?: string;
  /**
   * If the order was created with a `clientOrderId`, it will be included
   * within the cancel object when cancelled by any of your requests.
   */
  readonly clientOrderId?: string;
  /**
   * Current order status, either canceled or notFound if provided ID was not on the books
   *
   * @see enum {@link OrderStatus}
   */
  status: Extract<idex.OrderStatus, 'canceled' | 'notFound'>;
}

/**
 * @see type {@link KumaCanceledOrder}
 *
 * @category Kuma - Cancel Order
 */
export type RestResponseCancelOrders = KumaCanceledOrder[];

/**
 * The raw request body for the `DELETE /v1/orders` endpoint
 * including `signature` and the body in `parameters`.
 *
 * @internal
 */
export type RestRequestCancelOrdersSigned =
  RestRequestWithSignature<RestRequestCancelOrders>;
