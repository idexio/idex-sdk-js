import { ethers } from 'ethers';

import { assetUnitsToDecimal, decimalToPip, multiplyPips } from '#pipmath';

import { getExchangeAddressAndChainFromApi } from '#client/rest/public';
import { ExchangeStargateV2Adapter__factory } from '#typechain-types/factories/contracts/bridge-adapters/ExchangeStargateV2Adapter.sol/ExchangeStargateV2Adapter__factory';
import { IStargateV2__factory } from '#typechain-types/index';
import { StargateV2Target } from '#types/enums/request';

import {
  StargateV2Config,
  StargateV2ConfigByLayerZeroEndpointId,
} from './config';

import type {
  DecodedStargateV2Payload,
  EncodedStargateV2Payload,
} from '#types/bridge';
import type { BridgeTarget } from '#types/enums/request';

export const StargateV2MainnetLayerZeroEndpointIds = Object.values(
  StargateV2ConfigByLayerZeroEndpointId.mainnet,
).map((value) => {
  return value.layerZeroEndpointId;
});

export type StargateV2LayerZeroEndpointIdsMainnet =
  (typeof StargateV2MainnetLayerZeroEndpointIds)[number];

export function isStargateV2MainnetLayerZeroEndpointId(
  layerZeroEndpointId: number,
): layerZeroEndpointId is StargateV2LayerZeroEndpointIdsMainnet {
  return StargateV2MainnetLayerZeroEndpointIds.includes(
    layerZeroEndpointId as StargateV2LayerZeroEndpointIdsMainnet,
  );
}

/**
 * Get a stargate config with strict typing to allow narrowing on the
 * `config.supported` boolean
 *
 * @example
 * ```typescript
 * const config = getStargateTargetConfig(StargateTarget.STARGATE_ARBITRUM, true);
 * ```
 */
export function getStargateV2TargetConfig<
  T extends StargateV2Target,
  S extends true | false,
>(stargateTarget: T, sandbox: S) {
  if (sandbox) {
    throw new Error('Testnet not supported');
  }

  const targetConfig = StargateV2Config.mainnet[stargateTarget];
  if (!targetConfig) {
    throw new Error(`No config found for ${stargateTarget}`);
  }

  return targetConfig;
}

export function stargateV2TargetForLayerZeroEndpointId(
  layerZeroEndpointId: number,
  sandbox: boolean,
) {
  if (sandbox) {
    throw new Error('Testnet not supported');
  }

  if (isStargateV2MainnetLayerZeroEndpointId(layerZeroEndpointId)) {
    return StargateV2ConfigByLayerZeroEndpointId.mainnet[layerZeroEndpointId]
      .target;
  }

  return null;
}

/**
 * Decode an ABI-encoded hex string representing Stargate V2 withdrawal parameters
 */
export function decodeStargateV2Payload(
  payload: EncodedStargateV2Payload,
): DecodedStargateV2Payload {
  return {
    layerZeroEndpointId: parseInt(
      ethers.AbiCoder.defaultAbiCoder().decode(['uint32'], payload)[0],
      10,
    ),
  };
}

/**
 * ABI-encode Stargate withdrawal parameters
 */
export function encodeStargateV2Payload({
  layerZeroEndpointId,
}: DecodedStargateV2Payload): EncodedStargateV2Payload {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['uint32'],
    [layerZeroEndpointId],
  );
}

/**
 * Returns the encoded `bridgeAdapterPayload`
 */
export function getEncodedWithdrawalPayloadForBridgeTarget(
  bridgeTarget: BridgeTarget,
  sandbox = false,
): EncodedStargateV2Payload {
  if (sandbox) {
    throw new Error('Testnet not supported');
  }

  const targetConfig = StargateV2Config.mainnet[bridgeTarget];

  if (!targetConfig || !targetConfig.isSupported) {
    throw new Error(
      `Stargate withdrawals not supported to chain ${targetConfig.target} (Chain ID: ${String(targetConfig.evmChainId)})`,
    );
  }

  return encodeStargateV2Payload({
    layerZeroEndpointId: targetConfig.layerZeroEndpointId,
  });
}

/**
 * Deposit funds cross-chain into the Exchange using Stargate
 */
export async function depositViaStargateV2(
  sourceStargateTarget: StargateV2Target,
  parameters: {
    exchangeStargateV2AdapterAddress?: string;
    minimumWithdrawQuantityMultiplierInPips: bigint;
    quantityInAssetUnits: bigint;
    wallet: string;
  },
  signer: ethers.Signer,
  sandbox: boolean,
): Promise<string> {
  const { sendParam, sourceConfig } =
    await getStargateV2DepositSendParamAndSourceConfig(
      sourceStargateTarget,
      parameters,
      sandbox,
    );
  const stargate = IStargateV2__factory.connect(
    sourceConfig.stargateOFTAddress,
    signer,
  );
  const messagingFee = await stargate.quoteSend(sendParam, false, {
    from: parameters.wallet,
  });

  const response = await stargate.send(
    sendParam,
    { nativeFee: messagingFee.nativeFee, lzTokenFee: 0 },
    parameters.wallet, // Refund address - extra gas (if any) is returned to this address
    {
      from: parameters.wallet,
      gasLimit: StargateV2Config.settings.swapSourceGasLimit,
      value: messagingFee.nativeFee,
    }, // Native gas to pay for the cross chain message fee
  );

  return response.hash;
}

/**
 * Estimate native gas fee needed to deposit funds cross-chain into the Exchange using Stargate
 */
export async function estimateStargateV2DepositGasFeeAndQuantityDeliveredInAssetUnits(
  sourceStargateTarget: StargateV2Target,
  parameters: {
    exchangeStargateV2AdapterAddress?: string;
    minimumWithdrawQuantityMultiplierInPips: bigint;
    quantityInAssetUnits: bigint;
    wallet: string;
  },
  provider: ethers.Provider,
  sandbox: boolean,
): Promise<{ gasFee: bigint; quantityDeliveredInAssetUnits: bigint }> {
  const { sendParam, sourceConfig } =
    await getStargateV2DepositSendParamAndSourceConfig(
      sourceStargateTarget,
      parameters,
      sandbox,
    );

  const stargate = IStargateV2__factory.connect(
    sourceConfig.stargateOFTAddress,
    provider,
  );
  const [[gasFee], [, , receipt]] = await Promise.all([
    stargate.quoteSend(sendParam, false, {
      from: parameters.wallet,
    }),
    stargate.quoteOFT(sendParam),
  ]);

  return { gasFee, quantityDeliveredInAssetUnits: receipt.amountReceivedLD };
}

async function getStargateV2DepositSendParamAndSourceConfig(
  sourceStargateTarget: StargateV2Target,
  parameters: {
    exchangeStargateV2AdapterAddress?: string;
    minimumWithdrawQuantityMultiplierInPips: bigint;
    quantityInAssetUnits: bigint;
    wallet: string;
  },
  sandbox: boolean,
) {
  if (sandbox) {
    throw new Error('Testnet not supported');
  }

  const sourceConfig = StargateV2Config.mainnet[sourceStargateTarget];
  const targetConfig = StargateV2Config.mainnet[StargateV2Target.XCHAIN_XCHAIN];

  if (!sourceConfig || !sourceConfig.isSupported || !targetConfig.isSupported) {
    throw new Error(
      `Stargate deposits not supported from chain ${sourceConfig.target} (Chain ID: ${String(sourceConfig.evmChainId)}) to chain ${targetConfig.target} (Chain ID: ${String(targetConfig.evmChainId)})`,
    );
  }

  const [{ stargateBridgeAdapterContractAddress }] =
    parameters.exchangeStargateV2AdapterAddress ?
      [
        {
          stargateBridgeAdapterContractAddress:
            parameters.exchangeStargateV2AdapterAddress,
        },
      ]
    : await getExchangeAddressAndChainFromApi();

  // https://github.com/LayerZero-Labs/LayerZero-v2/blob/1fde89479fdc68b1a54cda7f19efa84483fcacc4/oapp/contracts/oapp/libs/OptionsBuilder.sol#L92
  // https://github.com/LayerZero-Labs/LayerZero-v2/blob/1fde89479fdc68b1a54cda7f19efa84483fcacc4/protocol/contracts/messagelib/libs/ExecutorOptions.sol#L82
  const option = ethers.solidityPacked(
    ['uint16', 'uint128'],
    [0, StargateV2Config.settings.swapDestinationGasLimit],
  );
  // https://github.com/LayerZero-Labs/LayerZero-v2/blob/1fde89479fdc68b1a54cda7f19efa84483fcacc4/oapp/contracts/oapp/libs/OptionsBuilder.sol#L133
  // https://github.com/LayerZero-Labs/LayerZero-v2/blob/1fde89479fdc68b1a54cda7f19efa84483fcacc4/protocol/contracts/messagelib/libs/ExecutorOptions.sol#L10
  // https://github.com/LayerZero-Labs/LayerZero-v2/blob/1fde89479fdc68b1a54cda7f19efa84483fcacc4/protocol/contracts/messagelib/libs/ExecutorOptions.sol#L14
  const extraOptions = ethers.solidityPacked(
    ['uint16', 'uint8', 'uint16', 'uint8', 'bytes'],
    [3, 1, 2 + 16 + 1, 3, option],
  );

  const sendParam = {
    dstEid: targetConfig.layerZeroEndpointId,
    to: ethers.zeroPadValue(stargateBridgeAdapterContractAddress, 32),
    amountLD: parameters.quantityInAssetUnits,
    minAmountLD: multiplyPips(
      parameters.quantityInAssetUnits,
      parameters.minimumWithdrawQuantityMultiplierInPips,
    ),
    extraOptions,
    composeMsg: ethers.AbiCoder.defaultAbiCoder().encode(
      ['address'],
      [parameters.wallet],
    ),
    oftCmd: '0x',
  };

  return { sendParam, sourceConfig };
}

/**
 * Estimate the quantity of tokens delivered to the target chain via Stargate v2 withdrawal
 */
export async function estimateStargateV2WithdrawQuantity(
  parameters: {
    exchangeStargateV2AdapterAddress: string;
    payload: string;
    quantityInDecimal: string;
    wallet: string;
  },
  provider: ethers.Provider,
): Promise<{
  estimatedWithdrawQuantityInDecimal: string;
  minimumWithdrawQuantityInDecimal: string;
  willSucceed: boolean;
}> {
  const exchangeStargateAdapter = ExchangeStargateV2Adapter__factory.connect(
    parameters.exchangeStargateV2AdapterAddress,
    provider,
  );

  const [
    estimatedWithdrawQuantityInAssetUnits,
    minimumWithdrawQuantityInAssetUnits,
    poolDecimals,
  ] = await exchangeStargateAdapter.estimateWithdrawQuantityInAssetUnits(
    parameters.wallet,
    decimalToPip(parameters.quantityInDecimal).toString(),
    parameters.payload,
  );

  const estimatedWithdrawQuantityInDecimal = assetUnitsToDecimal(
    estimatedWithdrawQuantityInAssetUnits,
    Number(poolDecimals),
  );

  const minimumWithdrawQuantityInDecimal = assetUnitsToDecimal(
    minimumWithdrawQuantityInAssetUnits,
    Number(poolDecimals),
  );

  const willSucceed =
    BigInt(estimatedWithdrawQuantityInAssetUnits) >=
    BigInt(minimumWithdrawQuantityInAssetUnits);

  return {
    estimatedWithdrawQuantityInDecimal,
    minimumWithdrawQuantityInDecimal,
    willSucceed,
  };
}
