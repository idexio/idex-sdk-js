import { ethers } from 'ethers';

import * as types from './types';

const orderSignatureHashVersion = 1;

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

export const orderHash = function getPlaceOrderWalletHash(
  order: types.rest.request.Order,
): string {
  return solidityHashOfParams([
    ['uint8', orderSignatureHashVersion],
    ['uint128', uuidToUint8Array(order.nonce)],
    ['address', order.wallet],
    ['string', order.market],
    ['uint8', types.enums.OrderType[order.type]],
    ['uint8', types.enums.OrderSide[order.side]],
    [
      'string',
      (order as types.rest.request.OrderByBaseQuantity).quantity || '',
    ],
    [
      'string',
      (order as types.rest.request.OrderByQuoteQuantity).quoteOrderQuantity ||
        '',
    ],
    ['string', (order as types.rest.request.OrderWithPrice).price || ''],
    [
      'string',
      (order as types.rest.request.OrderWithStopPrice).stopPrice || '',
    ],
    ['string', order.clientOrderId || ''],
    ['uint8', types.enums.OrderTimeInForce[order.timeInForce] || 0],
    [
      'uint8',
      types.enums.OrderSelfTradePrevention[order.selfTradePrevention] || 0,
    ],
    ['uint64', order.cancelAfter || 0],
  ]);
};

export const cancelOrderHash = function getCancelOrderWalletHash(
  parameters: types.utils.XOR<
    types.rest.request.CancelOrder,
    types.rest.request.CancelOrders
  >,
): string {
  // Validate either single order or multiple orders
  if (
    [
      parameters.orderId,
      (parameters as types.rest.request.CancelOrders).market,
    ].filter((val) => !!val).length > 1
  ) {
    throw new Error(
      'Cancel orders may specify at most one of orderId or market',
    );
  }

  return solidityHashOfParams([
    ['uint128', uuidToUint8Array(parameters.nonce)],
    ['address', parameters.wallet],
    ['string', parameters.orderId || ''],
    ['string', (parameters as types.rest.request.CancelOrders).market || ''],
  ]);
};

export const withdrawalHash = function getWithdrawalWalletHash(
  withdrawal: types.rest.request.Withdrawal,
): string {
  if (
    (withdrawal.asset && withdrawal.assetContractAddress) ||
    (!withdrawal.asset && !withdrawal.assetContractAddress)
  ) {
    throw new Error(
      'Withdrawal must specify exactly one of asset or assetContractAddress',
    );
  }

  return solidityHashOfParams([
    ['uint128', uuidToUint8Array(withdrawal.nonce)],
    ['address', withdrawal.wallet],
    withdrawal.asset
      ? ['string', withdrawal.asset]
      : ['address', withdrawal.assetContractAddress],
    ['string', withdrawal.quantity],
    ['bool', true], // Auto-dispatch
  ]);
};

type TypeValuePair =
  | ['string' | 'address', string]
  | ['uint128', string | Uint8Array]
  | ['uint8' | 'uint64', number]
  | ['bool', boolean];

function solidityHashOfParams(params: TypeValuePair[]): string {
  const fields = params.map((param) => param[0]);
  const values = params.map((param) => param[1]);

  return ethers.utils.solidityKeccak256(fields, values);
}

function uuidToUint8Array(uuid: string): Uint8Array {
  return ethers.utils.arrayify(`0x${uuid.replace(/-/g, '')}`);
}
