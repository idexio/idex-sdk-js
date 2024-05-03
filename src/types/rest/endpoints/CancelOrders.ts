import type { RestRequestWithSignature } from '#types/utils';
import type * as idex from '@idexio/idex-sdk/types';

/**
 * [[include:unexported.md]]
 *
 * @category Base Types
 */
interface RestRequestCancelOrderCommon
  extends idex.RestRequestByWallet,
    idex.DelegatedKeyParams,
    idex.RestRequestByMarketOptional {
  /**
   * - When specified, cancels a single order.
   *   - You may provide an orders {@link idex.IDEXOrder.orderId orderId}
   *   - You may provide an orders {@link idex.IDEXOrder.clientOrderId clientOrderId}
   *     by prefixing it with `client:`
   * - This property is only allowed when using the `cancelOrder` client method.
   */
  readonly orderId?: string;
  /**
   * - When specified, cancels multiple orders by orderId.
   *   - You may provide an orders {@link idex.IDEXOrder.orderId orderId}
   *   - You may provide an orders {@link idex.IDEXOrder.clientOrderId clientOrderId}
   *     by prefixing it with `client:`
   */
  readonly orderIds?: string[];
  /**
   * - Delegated key used for the order, if any
   * - This is only allowed when using the `cancelOrders` client method.
   */
  readonly orderDelegatedKey?: string;
}

/**
 * [[include:unexported.md]]
 *
 * @category Base Types
 */
interface RestRequestCancelOrdersBase extends RestRequestCancelOrderCommon {
  readonly orderId?: undefined;
}

/**
 * @category IDEX - Cancel Order
 *
 * @see related {@link RestRequestCancelOrders}
 */
export interface RestRequestCancelOrder extends RestRequestCancelOrderCommon {
  market?: undefined;
  orderDelegatedKey?: undefined;
  orderIds?: undefined;
  /**
   * @inheritDoc
   */
  readonly orderId: string;
}

/**
 * Allows cancelling all open orders for a given wallet.
 *
 * @category IDEX - Cancel Order
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
 * Allows cancelling all open orders by order ids.
 *
 * @category IDEX - Cancel Order
 *
 * @see request {@link RestRequestCancelOrders}
 */
export interface RestRequestCancelOrdersByOrderIds
  extends RestRequestCancelOrdersBase {
  market?: undefined;
  orderDelegatedKey?: undefined;
  readonly orderIds: string[];
}

/**
 * Allows cancelling all open orders of a wallet for a given market.
 *
 * @category IDEX - Cancel Order
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
}

/**
 * Allows cancelling all open orders of a wallet using the given delegated key.
 *
 * @category IDEX - Cancel Order
 *
 * @see request {@link RestRequestCancelOrders}
 */
export interface RestRequestCancelOrdersByDelegatedKey
  extends RestRequestCancelOrdersBase {
  market?: undefined;
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
 * - {@link RestRequestCancelOrdersByMarket} - Cancel all open orders for a given wallet on a specific market.
 * - {@link RestRequestCancelOrdersByDelegatedKey} - Cancel all open orders for a given wallet using a specific delegated key.
 *
 * @see related {@link RestRequestCancelOrder} - Cancel a single order by its `orderId`.
 *
 * @category IDEX - Cancel Order
 */
export type RestRequestCancelOrders =
  | RestRequestCancelOrdersByWallet
  | RestRequestCancelOrdersByOrderIds
  | RestRequestCancelOrdersByMarket
  | RestRequestCancelOrdersByDelegatedKey;

/**
 * @internal
 */
export type RestRequestCancelOrderOrOrders =
  | RestRequestCancelOrder
  | RestRequestCancelOrders;

/**
 * Response to "cancel order" requests (single or multiple orders). Includes
 * one object for each successfully canceled order.
 *
 * @category IDEX Interfaces
 * @category IDEX - Cancel Order
 */
export interface IDEXCanceledOrder {
  /** Exchange-assigned order identifier */
  readonly orderId: string;
}

/**
 * @see type {@link IDEXCanceledOrder}
 *
 * @category IDEX - Cancel Order
 */
export type RestResponseCancelOrders = IDEXCanceledOrder[];

/**
 * The raw request body for the `DELETE /v4/orders` endpoint
 * including `signature` and the body in `parameters`.
 *
 * @internal
 */
export type RestRequestCancelOrdersSigned =
  RestRequestWithSignature<RestRequestCancelOrderOrOrders>;
