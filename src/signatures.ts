import { ethers } from 'ethers';

import * as constants from '#constants';
import { assertNonceIsValid } from '#utils';

import {
  OrderTypeSigEnum,
  OrderSideSigEnum,
  OrderTimeInForceSigEnum,
  OrderSelfTradePreventionSigEnum,
  OrderTriggerTypeSigEnum,
} from '#types/enums/signature';

import type * as types from '#index';

export type SignTypedData = (
  domain: ethers.TypedDataDomain,
  typeData: Record<string, Array<ethers.TypedDataField>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: Record<string, any>,
) => Promise<string>;

export function createPrivateKeyTypedDataSigner(
  walletPrivateKey: string,
): SignTypedData {
  return (...parameters) =>
    new ethers.Wallet(walletPrivateKey).signTypedData(...parameters);
}

export const getDomainSeparator = (
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
) => {
  return {
    name: constants.EIP_712_DOMAIN_NAME,
    version:
      sandbox ?
        constants.EIP_712_DOMAIN_VERSION_SANDBOX
      : constants.EIP_712_DOMAIN_VERSION,
    chainId,
    verifyingContract: contractAddress,
  } satisfies ethers.TypedDataDomain;
};

export const getWalletAssociationSignatureTypedData = (
  data: types.RestRequestAssociateWallet,
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> => {
  assertNonceIsValid(data.nonce);
  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      WalletAssociation: [
        { name: 'nonce', type: 'uint128' },
        { name: 'wallet', type: 'address' },
      ],
    },
    {
      nonce: uuidToUint128(data.nonce),
      wallet: data.wallet,
    },
  ];
};

export const getWalletUnlockSignatureTypedData = (
  { nonce }: { nonce: string },
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> => {
  assertNonceIsValid(nonce);
  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      WalletUnlock: [
        { name: 'nonce', type: 'uint128' },
        { name: 'message', type: 'string' },
      ],
    },
    {
      nonce: uuidToUint128(nonce),
      message: constants.WALLET_SIGNATURE_MESSAGE,
    },
  ];
};

export const getDelegatedKeyAuthorizationSignatureTypedData = (
  { delegatedKey, nonce }: { delegatedKey: string; nonce: string },
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> => {
  assertNonceIsValid(nonce);
  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      DelegatedKeyAuthorization: [
        { name: 'nonce', type: 'uint128' },
        { name: 'delegatedPublicKey', type: 'address' },
        { name: 'message', type: 'string' },
      ],
    },
    {
      nonce: uuidToUint128(nonce),
      delegatedPublicKey: delegatedKey,
      message: constants.WALLET_SIGNATURE_MESSAGE,
    },
  ];
};

export const getOrderSignatureTypedData = (
  data: types.RestRequestOrder,
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> => {
  assertNonceIsValid(data.nonce);

  const emptyPipString = '0.00000000';

  const { conditionalOrderId, triggerPrice, triggerType } = data;

  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      Order: [
        { name: 'nonce', type: 'uint128' },
        { name: 'wallet', type: 'address' },
        { name: 'marketSymbol', type: 'string' },
        { name: 'orderType', type: 'uint8' },
        { name: 'orderSide', type: 'uint8' },
        { name: 'quantity', type: 'string' },
        { name: 'limitPrice', type: 'string' },
        { name: 'triggerPrice', type: 'string' },
        { name: 'triggerType', type: 'uint8' },
        { name: 'callbackRate', type: 'string' },
        { name: 'conditionalOrderId', type: 'uint128' },
        { name: 'isReduceOnly', type: 'bool' },
        { name: 'timeInForce', type: 'uint8' },
        { name: 'selfTradePrevention', type: 'uint8' },
        { name: 'isLiquidationAcquisitionOnly', type: 'bool' },
        { name: 'delegatedPublicKey', type: 'address' },
        { name: 'clientOrderId', type: 'string' },
      ],
    },
    {
      nonce: uuidToUint128(data.nonce),
      wallet: data.wallet,
      marketSymbol: data.market,
      orderType: OrderTypeSigEnum[data.type],
      orderSide: OrderSideSigEnum[data.side],
      quantity: data.quantity,
      limitPrice: data.price || emptyPipString,
      triggerPrice: triggerPrice || emptyPipString,
      triggerType:
        triggerType !== undefined ?
          OrderTriggerTypeSigEnum[triggerType]
        : OrderTriggerTypeSigEnum.none,
      callbackRate: data.callbackRate || emptyPipString,
      conditionalOrderId:
        conditionalOrderId !== undefined ?
          uuidToUint128(conditionalOrderId)
        : 0,
      isReduceOnly: !!data.reduceOnly,
      timeInForce:
        data.timeInForce ? OrderTimeInForceSigEnum[data.timeInForce] : 0,
      selfTradePrevention:
        data.selfTradePrevention ?
          OrderSelfTradePreventionSigEnum[data.selfTradePrevention]
        : 0,
      isLiquidationAcquisitionOnly: data.isLiquidationAcquisitionOnly ?? false,
      delegatedPublicKey: data.delegatedKey || ethers.ZeroAddress,
      clientOrderId: data.clientOrderId || '',
    },
  ];
};

export const getOrderCancellationByOrderIdSignatureTypedData = (
  data: types.RestRequestCancelOrdersByOrderIds,
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> => {
  assertNonceIsValid(data.nonce);

  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      OrderCancellationByOrderId: [
        { name: 'nonce', type: 'uint128' },
        { name: 'wallet', type: 'address' },
        { name: 'delegatedKey', type: 'address' },
        { name: 'orderIds', type: 'string[]' },
      ],
    },
    {
      nonce: uuidToUint128(data.nonce),
      wallet: data.wallet,
      delegatedKey: data.delegatedKey || ethers.ZeroAddress,
      orderIds: data.orderIds,
    },
  ];
};

export const getOrderCancellationByDelegatedKeySignatureTypedData = (
  data: types.RestRequestCancelOrdersByDelegatedKey,
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> => {
  assertNonceIsValid(data.nonce);

  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      OrderCancellationByDelegatedKey: [
        { name: 'nonce', type: 'uint128' },
        { name: 'wallet', type: 'address' },
        { name: 'delegatedKey', type: 'address' },
        { name: 'orderDelegatedKey', type: 'address' },
      ],
    },
    {
      nonce: uuidToUint128(data.nonce),
      wallet: data.wallet,
      delegatedKey: data.delegatedKey || ethers.ZeroAddress,
      orderDelegatedKey: data.orderDelegatedKey,
    },
  ];
};

export const getOrderCancellationByMarketSymbolSignatureTypedData = (
  data: types.RestRequestCancelOrdersByMarket,
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> => {
  assertNonceIsValid(data.nonce);

  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      OrderCancellationByMarketSymbol: [
        { name: 'nonce', type: 'uint128' },
        { name: 'wallet', type: 'address' },
        { name: 'delegatedKey', type: 'address' },
        { name: 'marketSymbol', type: 'string' },
      ],
    },
    {
      nonce: uuidToUint128(data.nonce),
      wallet: data.wallet,
      delegatedKey: data.delegatedKey || ethers.ZeroAddress,
      marketSymbol: data.market,
    },
  ];
};

export const getOrderCancellationByWalletSignatureTypedData = (
  data: types.RestRequestCancelOrders,
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> => {
  assertNonceIsValid(data.nonce);

  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      OrderCancellationByWallet: [
        { name: 'nonce', type: 'uint128' },
        { name: 'wallet', type: 'address' },
        { name: 'delegatedKey', type: 'address' },
      ],
    },
    {
      nonce: uuidToUint128(data.nonce),
      wallet: data.wallet,
      delegatedKey: data.delegatedKey || ethers.ZeroAddress,
    },
  ];
};

export const getOrderCancellationSignatureTypedData = (
  data: types.RestRequestCancelOrders,
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> => {
  assertNonceIsValid(data.nonce);

  if (data.orderIds) {
    return getOrderCancellationByOrderIdSignatureTypedData(
      data,
      contractAddress,
      chainId,
      sandbox,
    );
  }

  if (data.orderDelegatedKey) {
    return getOrderCancellationByDelegatedKeySignatureTypedData(
      data,
      contractAddress,
      chainId,
      sandbox,
    );
  }

  if (data.market) {
    return getOrderCancellationByMarketSymbolSignatureTypedData(
      data,
      contractAddress,
      chainId,
      sandbox,
    );
  }

  return getOrderCancellationByWalletSignatureTypedData(
    data,
    contractAddress,
    chainId,
    sandbox,
  );
};

export function getWithdrawalSignatureTypedData(
  data: types.RestRequestWithdrawFunds,
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> {
  assertNonceIsValid(data.nonce);

  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      Withdrawal: [
        { name: 'nonce', type: 'uint128' },
        { name: 'wallet', type: 'address' },
        { name: 'quantity', type: 'string' },
        { name: 'maximumGasFee', type: 'string' },
        { name: 'bridgeAdapter', type: 'address' },
        { name: 'bridgeAdapterPayload', type: 'bytes' },
      ],
    },
    {
      nonce: uuidToUint128(data.nonce),
      wallet: data.wallet,
      quantity: data.quantity,
      maximumGasFee: data.maximumGasFee,
      bridgeAdapter: data.bridgeAdapterAddress,
      bridgeAdapterPayload: data.bridgeAdapterPayload,
    },
  ];
}

export function getInitialMarginFractionOverrideSettingsSignatureTypedData(
  data: types.RestRequestSetInitialMarginFractionOverride,
  contractAddress: string,
  chainId: number,
  sandbox: boolean,
): Parameters<SignTypedData> {
  assertNonceIsValid(data.nonce);

  return [
    getDomainSeparator(contractAddress, chainId, sandbox),
    {
      InitialMarginFractionOverrideSettings: [
        { name: 'nonce', type: 'uint128' },
        { name: 'wallet', type: 'address' },
        { name: 'marketSymbol', type: 'string' },
        { name: 'initialMarginFractionOverride', type: 'string' },
        { name: 'delegatedPublicKey', type: 'address' },
      ],
    },
    {
      nonce: uuidToUint128(data.nonce),
      wallet: data.wallet,
      marketSymbol: data.market,
      initialMarginFractionOverride: data.initialMarginFractionOverride ?? '', // Initial Margin Fraction override value, blank if removing override
      delegatedPublicKey: data.delegatedKey || ethers.ZeroAddress,
    },
  ];
}

function uuidToHexString(uuid: string): string {
  return `0x${uuid.replace(/-/g, '')}`;
}

function uuidToUint128(uuid: string): bigint {
  return BigInt.asUintN(128, BigInt(uuidToHexString(uuid)));
}
