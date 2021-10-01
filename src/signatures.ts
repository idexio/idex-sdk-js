import { ethers } from 'ethers';

import * as constants from './constants';

import { LiquidityChangeType, LiquidityChangeOrigination } from './types/enums';
import {
  RestRequestAddLiquidity,
  RestRequestOrder,
  RestRequestOrderByBaseQuantity,
  RestRequestOrderByQuoteQuantity,
  RestRequestOrderWithPrice,
  RestRequestOrderWithStopPrice,
  RestRequestRemoveLiquidity,
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
  MultiverseChain,
} from './types';

/**
 * A function that accepts a string and returns a Promise resolving on its ECDSA signature
 *
 * @typedef {Function} MessageSigner
 */
export type MessageSigner = (message: string) => Promise<string>;

/**
 * Returns an ethers Wallet signer which takes a message and signs
 * it with the originally provided private key.
 *
 * @param {string} walletPrivateKey - The private key to use when signing any given messages
 * @returns {MessageSigner}
 *
 * @example
 * const signMessage = createPrivateKeyMessageSigner(myPrivateKey)
 * const signed = await signMessage(myMessageToSign)
 */
export function createPrivateKeyMessageSigner(
  walletPrivateKey: string,
): MessageSigner {
  return (message: string) =>
    new ethers.Wallet(walletPrivateKey).signMessage(
      ethers.utils.arrayify(message),
    );
}

// compatibility layer for previously documented method
/**
 * @deprecated - use createPrivateKeyMessageSigner directly
 * @see {createPrivateKeyMessageSigner}
 */
export const privateKeySigner = createPrivateKeyMessageSigner;

function signatureHashVersion(
  multiverseChain: MultiverseChain,
  sandbox: boolean,
):
  | typeof constants.ORDER_SIGNATURE_HASH_VERSION_MATIC
  | typeof constants.ORDER_SIGNATURE_HASH_VERSION_MATIC_SANDBOX {
  if (multiverseChain === 'matic') {
    return sandbox
      ? constants.ORDER_SIGNATURE_HASH_VERSION_MATIC_SANDBOX
      : constants.ORDER_SIGNATURE_HASH_VERSION_MATIC;
  }

  throw new Error(`Invalid multiverse chain: ${multiverseChain}`);
}

export function createOrderSignature(
  order: RestRequestOrder,
  multiverseChain: MultiverseChain,
  sandbox: boolean,
): string {
  const quantity =
    (order as RestRequestOrderByBaseQuantity).quantity ||
    (order as RestRequestOrderByQuoteQuantity).quoteOrderQuantity;
  const isQuantityInQuote = !!(order as RestRequestOrderByQuoteQuantity)
    .quoteOrderQuantity;

  return solidityHashOfParams([
    ['uint8', signatureHashVersion(multiverseChain, sandbox)],
    ['uint128', uuidToUint8Array(order.nonce)],
    ['address', order.wallet],
    ['string', order.market],
    ['uint8', OrderType[order.type]],
    ['uint8', OrderSide[order.side]],
    ['string', quantity],
    ['bool', isQuantityInQuote],
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
  uint256: string;
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

export function createAddLiquiditySignature(
  addLiquidity: RestRequestAddLiquidity,
  multiverseChain: MultiverseChain,
  sandbox: boolean,
): string {
  return solidityHashOfParams([
    ['uint8', signatureHashVersion(multiverseChain, sandbox)],
    ['uint8', LiquidityChangeType.Addition],
    ['uint8', LiquidityChangeOrigination.OffChain],
    ['uint128', uuidToUint8Array(addLiquidity.nonce)],
    ['address', addLiquidity.wallet],
    ['address', addLiquidity.tokenA],
    ['address', addLiquidity.tokenB],
    ['uint256', addLiquidity.amountADesired],
    ['uint256', addLiquidity.amountBDesired],
    ['uint256', addLiquidity.amountAMin],
    ['uint256', addLiquidity.amountBMin],
    ['address', addLiquidity.to],
    ['uint256', 0], // off chain deadline
  ]);
}

export function createRemoveLiquiditySignature(
  removeLiquidity: RestRequestRemoveLiquidity,
  multiverseChain: MultiverseChain,
  sandbox: boolean,
): string {
  return solidityHashOfParams([
    ['uint8', signatureHashVersion(multiverseChain, sandbox)],
    ['uint8', LiquidityChangeType.Removal],
    ['uint8', LiquidityChangeOrigination.OffChain],
    ['uint128', uuidToUint8Array(removeLiquidity.nonce)],
    ['address', removeLiquidity.wallet],
    ['address', removeLiquidity.tokenA],
    ['address', removeLiquidity.tokenB],
    ['uint256', removeLiquidity.liquidity],
    ['uint256', removeLiquidity.amountAMin],
    ['uint256', removeLiquidity.amountBMin],
    ['address', removeLiquidity.to],
    ['uint256', 0], // off chain deadline
  ]);
}

/**
 * Generates the signature for the associate wallet request
 * @private
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
