/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RestRequestWithdrawalBySymbol,
  RestRequestWithdrawalByAddress,
  RestRequestWithdrawal,
  RestRequestCancelOrders,
  RestRequestCancelOrder,
} from './request';

// TODO - add these to the docs

export function isWithdrawalByAssetSymbolRequest(
  request: RestRequestWithdrawal,
): request is RestRequestWithdrawalBySymbol {
  return (
    typeof request.asset === 'string' &&
    typeof request.assetContractAddress !== 'string' &&
    typeof request.quantity === 'string'
  );
}

export function isWithdrawalByAssetAddressRequest(
  request: RestRequestWithdrawal,
): request is RestRequestWithdrawalByAddress {
  return (
    typeof request.asset !== 'string' &&
    typeof request.assetContractAddress === 'string' &&
    typeof request.quantity === 'string'
  );
}

export function isRestRequestCancelOrder(
  request: any,
): request is RestRequestCancelOrder {
  return (
    typeof request.orderId === 'string' &&
    typeof request.market === 'undefined' &&
    typeof request.wallet === 'string'
  );
}

export function isRestRequestCancelOrders(
  request: any,
): request is RestRequestCancelOrders {
  return (
    typeof request.orderId === 'undefined' && typeof request.wallet === 'string'
  );
}
