import { ethers } from 'ethers';

import * as constants from './constants';

import {
  RestRequestOrder,
  RestRequestOrderByBaseQuantity,
  RestRequestOrderByQuoteQuantity,
  RestRequestOrderWithPrice,
  RestRequestOrderWithStopPrice,
  RestRequestWithdrawal,
  OrderType,
  OrderSide,
  OrderTimeInForce,
  OrderSelfTradePrevention,
  isWithdrawalByAssetSymbolRequest,
  isWithdrawalByAssetAddressRequest,
  RestRequestCancelOrderOrOrders,
  isRestRequestCancelOrder,
  isRestRequestCancelOrders,
  RestRequestAssociateWallet,
} from './types';

/**
 * A function that accepts a string and returns a Promise resolving on its ECDSA signature
 *
 * @typedef {Function} signatures.MessageSigner
 */
export type MessageSigner = (message: string) => Promise<string>;

export const privateKeySigner = function getPrivateKeyMessageSigner(
  walletPrivateKey: string,
): MessageSigner {
  return (message: string) =>
    new ethers.Wallet(walletPrivateKey).signMessage(
      ethers.utils.arrayify(message),
    );
};

export function createOrderSignature(order: RestRequestOrder): string {
  return solidityHashOfParams([
    ['uint8', constants.ORDER_SIGNATURE_HASH_VERSION],
    ['uint128', uuidToUint8Array(order.nonce)],
    ['address', order.wallet],
    ['string', order.market],
    ['uint8', OrderType[order.type]],
    ['uint8', OrderSide[order.side]],
    ['string', (order as RestRequestOrderByBaseQuantity).quantity || ''],
    [
      'string',
      (order as RestRequestOrderByQuoteQuantity).quoteOrderQuantity || '',
    ],
    ['string', (order as RestRequestOrderWithPrice).price || ''],
    ['string', (order as RestRequestOrderWithStopPrice).stopPrice || ''],
    ['string', order.clientOrderId || ''],
    ['uint8', order.timeInForce ? OrderTimeInForce[order.timeInForce] : 0],
    [
      'uint8',
      order.selfTradePrevention
        ? OrderSelfTradePrevention[order.selfTradePrevention]
        : 0,
    ],
    ['uint64', order.cancelAfter || 0],
  ]);
}

type TypeValuePairings = {
  string: string;
  address: string;
  uint128: Uint8Array;
  uint8: number;
  uint64: number;
  bool: boolean;
};

export function createCancelOrderSignature(
  parameters: RestRequestCancelOrderOrOrders,
): string {
  // Validate either single order or multiple orders
  if (
    !isRestRequestCancelOrder(parameters) &&
    !isRestRequestCancelOrders(parameters)
  ) {
    throw new Error(
      'Cancel orders may specify at most one of orderId or market',
    );
  }

  return solidityHashOfParams([
    ['uint128', uuidToUint8Array(parameters.nonce)],
    ['address', parameters.wallet],
    ['string', isRestRequestCancelOrder(parameters) ? parameters.orderId : ''],
    [
      'string',
      (isRestRequestCancelOrders(parameters) ? parameters.market : '') ?? '',
    ],
  ]);
}

export function createWithdrawalSignature(
  withdrawal: RestRequestWithdrawal,
): string {
  if (
    !isWithdrawalByAssetSymbolRequest(withdrawal) &&
    !isWithdrawalByAssetAddressRequest(withdrawal)
  ) {
    throw new Error(
      'Withdrawal must specify exactly one of asset or assetContractAddress',
    );
  }

  return solidityHashOfParams([
    ['uint128', uuidToUint8Array(withdrawal.nonce)],
    ['address', withdrawal.wallet],
    isWithdrawalByAssetSymbolRequest(withdrawal)
      ? ['string', withdrawal.asset]
      : ['address', withdrawal.assetContractAddress],
    ['string', withdrawal.quantity],
    ['bool', true], // Auto-dispatch
  ]);
}

/**
 * Generates the signature for the associate wallet request
 */
export function createAssociateWalletSignature(
  associate: RestRequestAssociateWallet,
): string {
  if (!associate.wallet || !associate.nonce) {
    throw new Error('Associate Wallet must provide a wallet and nonce');
  }

  return solidityHashOfParams([
    ['uint128', uuidToUint8Array(associate.nonce)],
    ['address', associate.wallet],
  ]);
}

function solidityHashOfParams<K extends keyof TypeValuePairings>(
  params: Array<[K, TypeValuePairings[K]]>,
): string {
  const fields = params.map((param) => param[0]);
  const values = params.map((param) => param[1]);

  return ethers.utils.solidityKeccak256(fields, values);
}

function uuidToUint8Array(uuid: string): Uint8Array {
  return ethers.utils.arrayify(`0x${uuid.replace(/-/g, '')}`);
}
