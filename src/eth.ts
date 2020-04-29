import { ethers } from 'ethers';

import * as types from './types';

export const getPrivateKeySigner = (walletPrivateKey: string) => (
  hashToSign: string,
): Promise<string> =>
  new ethers.Wallet(walletPrivateKey).signMessage(
    ethers.utils.arrayify(hashToSign),
  );

export const getOrderHash = (order: types.request.Order): string =>
  solidityHashOfParams([
    ['uint128', uuidToUint8Array(order.nonce)],
    ['address', order.wallet],
    ['string', order.market],
    ['uint8', types.enums.OrderType[order.type]],
    ['uint8', types.enums.OrderSide[order.side]],
    ['uint8', types.enums.OrderTimeInForce[order.timeInForce] || 0],
    ['string', (order as types.request.OrderByBaseQuantity).quantity || ''],
    [
      'string',
      (order as types.request.OrderByQuoteQuantity).quoteOrderQuantity || '',
    ],
    ['string', (order as types.request.OrderWithPrice).price || ''],
    ['string', order.customClientOrderId || ''],
    ['string', (order as types.request.OrderWithStopPrice).stopPrice || ''],
    [
      'uint8',
      types.enums.OrderSelfTradePrevention[order.selfTradePrevention] || 0,
    ],
    ['uint64', order.cancelAfter || 0],
  ]);

export const getDeleteOrderHash = (
  walletAddress: string,
  nonce: string,
  market?: string,
  orderId?: string,
): string =>
  solidityHashOfParams([
    ['string', 'deleteOrders'],
    ['address', walletAddress],
    ['string', market || ''],
    ['string', orderId || ''],
    ['uint128', uuidToUint8Array(nonce)],
  ]);

export const getWithdrawalHash = (
  withdrawal: types.request.Withdrawal,
): string =>
  solidityHashOfParams([
    ['uint128', uuidToUint8Array(withdrawal.nonce)],
    ['address', withdrawal.wallet],
    withdrawal.assetContractAddress
      ? ['address', withdrawal.assetContractAddress]
      : ['string', withdrawal.asset],
    ['string', withdrawal.quantity],
    ['bool', true], // Auto-dispatch
  ]);

type TypeValuePair =
  | ['string' | 'address', string]
  | ['uint128', string | Uint8Array]
  | ['uint8' | 'uint64', number]
  | ['bool', boolean];

const solidityHashOfParams = (params: TypeValuePair[]): string => {
  const fields = params.map(param => param[0]);
  const values = params.map(param => param[1]);
  // TODO: we might let lib users to pick their solidityKeccak256 library, eg. web3.soliditySha3()
  return ethers.utils.solidityKeccak256(fields, values);
};

const uuidToUint8Array = (uuid: string): Uint8Array =>
  ethers.utils.arrayify(`0x${uuid.replace(/-/g, '')}`);
