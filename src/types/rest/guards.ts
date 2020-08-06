/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  RestRequestWithdrawalBySymbol,
  RestRequestWithdrawalByAddress,
  RestRequestWithdrawal,
  RestRequestCancelOrders,
  RestRequestCancelOrder,
} from './request';

export function isWithdrawalByAssetSymbolRequest(
  value: RestRequestWithdrawal,
): value is RestRequestWithdrawalBySymbol {
  return (
    typeof value.asset === 'string' &&
    typeof value.assetContractAddress !== 'string' &&
    typeof value.quantity === 'string'
  );
}

export function isWithdrawalByAssetAddressRequest(
  value: RestRequestWithdrawal,
): value is RestRequestWithdrawalByAddress {
  return (
    typeof value.asset !== 'string' &&
    typeof value.assetContractAddress === 'string' &&
    typeof value.quantity === 'string'
  );
}

export function isRestRequestCancelOrder(
  value: any,
): value is RestRequestCancelOrder {
  return (
    typeof value.orderId === 'string' &&
    typeof value.market === 'undefined' &&
    typeof value.wallet === 'string'
  );
}

export function isRestRequestCancelOrders(
  value: any,
): value is RestRequestCancelOrders {
  return (
    typeof value.orderId === 'undefined' && typeof value.wallet === 'string'
  );
}
