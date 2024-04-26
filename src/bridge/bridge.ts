import { ethers } from 'ethers';

import { assetUnitsToDecimal, decimalToPip } from '#pipmath';

import { getExchangeAddressAndChainFromApi } from '#client/rest/public';
import {
  ExchangeStargateAdapter__factory,
  IPool__factory,
  IStargateFeeLibrary__factory,
  IStargateRouter__factory,
} from '#typechain-types/index';
import { BridgeTarget } from '#types/enums/request';

import { StargateConfig, StargateConfigByStargateChainID } from './config';

import type {
  DecodedStargatePayload,
  EncodedStargatePayload,
} from '#types/bridge';
import type { StargateTarget } from '#types/enums/request';

/**
 * Get a stargate config with strict typing to allow narrowing on the
 * `config.supported` boolean
 *
 * @example
 * ```typescript
 * const config = getStargateTargetConfig(StargateTarget.STARGATE_ARBITRUM, true);
 * ```
 */
export function getStargateTargetConfig<
  T extends StargateTarget,
  S extends true | false,
>(stargateTarget: T, sandbox: S) {
  const targetConfig =
    sandbox ?
      StargateConfig.testnet[stargateTarget]
    : StargateConfig.mainnet[stargateTarget];

  if (!targetConfig) {
    throw new Error(
      `No config found for ${stargateTarget} (testnet/sandbox? ${String(sandbox)})`,
    );
  }

  return targetConfig as S extends true ? (typeof StargateConfig.testnet)[T]
  : (typeof StargateConfig.mainnet)[T];
}

export const StargateMainnetChainIDs = Object.values(
  StargateConfigByStargateChainID.mainnet,
).map((value) => {
  return value.stargateChainId;
});

export const StargateTestNetChainIDs = Object.values(
  StargateConfigByStargateChainID.testnet,
).map((value) => {
  return value.stargateChainId;
});

export type StargateChainIDsMainnet = (typeof StargateMainnetChainIDs)[number];

export type StargateChainIDsTestNet = (typeof StargateTestNetChainIDs)[number];

export function isStargateMainnetChainID(
  stargateChainID: number,
): stargateChainID is StargateChainIDsMainnet {
  return StargateMainnetChainIDs.includes(
    stargateChainID as StargateChainIDsMainnet,
  );
}

export function isStargateTestNetChainID(
  stargateChainID: number,
): stargateChainID is StargateChainIDsTestNet {
  return StargateTestNetChainIDs.includes(
    stargateChainID as StargateChainIDsTestNet,
  );
}

export function getStargateConfigByChainId(stargateChainId: number) {
  if (isStargateMainnetChainID(stargateChainId)) {
    return StargateConfigByStargateChainID.mainnet[stargateChainId];
  }
  if (isStargateTestNetChainID(stargateChainId)) {
    return StargateConfigByStargateChainID.testnet[stargateChainId];
  }

  return null;
}

export function stargateTargetForChainId(
  stargateChainId: number,
  sandbox: boolean,
) {
  if (!sandbox && isStargateMainnetChainID(stargateChainId)) {
    return getStargateConfigByChainId(stargateChainId)?.target ?? null;
  }
  if (sandbox && isStargateTestNetChainID(stargateChainId)) {
    return getStargateConfigByChainId(stargateChainId)?.target ?? null;
  }

  return null;
}

/**
 * Deposit funds cross-chain into the Exchange using Stargate
 */
export async function depositViaStargate(
  sourceBridgeTarget: BridgeTarget,
  parameters: {
    exchangeStargateAdapterAddress?: string;
    minimumQuantityInAssetUnits: string;
    nativeGasFeeInAssetUnits: string;
    quantityInAssetUnits: string;
    wallet: string;
  },
  signer: ethers.Signer,
  sandbox: boolean,
): Promise<string> {
  const sourceConfig =
    sandbox ?
      StargateConfig.testnet[sourceBridgeTarget]
    : StargateConfig.mainnet[sourceBridgeTarget];

  const targetConfig =
    sandbox ?
      StargateConfig.testnet[BridgeTarget.XCHAIN_XCHAIN]
    : StargateConfig.mainnet[BridgeTarget.XCHAIN_XCHAIN];

  if (!sourceConfig || !sourceConfig.isSupported || !targetConfig.isSupported) {
    throw new Error(
      `Stargate deposits not supported from chain ${sourceConfig.target} (Stargate Chain ID: ${String(sourceConfig.stargateChainId)}) to chain ${targetConfig.target} (Stargate Chain ID: ${String(targetConfig.stargateChainId)})`,
    );
  }

  const [{ stargateBridgeAdapterContractAddress }] =
    parameters.exchangeStargateAdapterAddress ?
      [
        {
          stargateBridgeAdapterContractAddress:
            parameters.exchangeStargateAdapterAddress,
        },
      ]
    : await getExchangeAddressAndChainFromApi();

  const response = await IStargateRouter__factory.connect(
    sourceConfig.stargateComposerAddress,
    signer,
  ).swap(
    targetConfig.stargateChainId,
    sourceConfig.quoteTokenStargatePoolId,
    targetConfig.quoteTokenStargatePoolId,
    parameters.wallet, // Refund address - extra gas (if any) is returned to this address
    parameters.quantityInAssetUnits, // Quantity to swap
    parameters.minimumQuantityInAssetUnits, // The min qty you would accept on the destination
    {
      dstGasForCall: StargateConfig.settings.swapDestinationGasLimit,
      dstNativeAmount: 0,
      dstNativeAddr: '0x',
    },
    stargateBridgeAdapterContractAddress, // The address to send the tokens to on the destination
    ethers.AbiCoder.defaultAbiCoder().encode(['address'], [parameters.wallet]), // Payload
    {
      from: parameters.wallet,
      gasLimit: StargateConfig.settings.swapSourceGasLimit,
      value: parameters.nativeGasFeeInAssetUnits,
    }, // Native gas to pay for the cross chain message fee
  );

  return response.hash;
}

/**
 * Decode an ABI-encoded hex string representing Stargate withdrawal parameters
 */
export function decodeStargatePayload(
  payload: EncodedStargatePayload,
): DecodedStargatePayload {
  const result = ethers.AbiCoder.defaultAbiCoder().decode(
    ['uint16', 'uint256', 'uint256'],
    payload,
  );

  return {
    targetChainId: parseInt(result[0].toString(), 10),
    sourcePoolId: parseInt(result[1].toString(), 10),
    targetPoolId: parseInt(result[2].toString(), 10),
  };
}

/**
 * ABI-encode Stargate withdrawal parameters
 */
export function encodeStargatePayload({
  targetChainId,
  sourcePoolId,
  targetPoolId,
}: DecodedStargatePayload): EncodedStargatePayload {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['uint16', 'uint256', 'uint256'],
    [targetChainId, sourcePoolId, targetPoolId],
  );
}

/**
 * Returns the encoded `bridgeAdapterPayload`
 */
export function getEncodedWithdrawalPayloadForBridgeTarget(
  bridgeTarget: BridgeTarget,
  sandbox = false,
): EncodedStargatePayload {
  const targetConfig =
    sandbox ?
      StargateConfig.testnet[bridgeTarget]
    : StargateConfig.mainnet[bridgeTarget];

  const sourceConfig =
    sandbox ?
      StargateConfig.testnet[BridgeTarget.XCHAIN_XCHAIN]
    : StargateConfig.mainnet[BridgeTarget.XCHAIN_XCHAIN];

  if (!targetConfig || !sourceConfig.isSupported || !targetConfig.isSupported) {
    throw new Error(
      `Stargate withdrawals not supported from chain ${sourceConfig.target} (Chain ID: ${String(sourceConfig.stargateChainId)}) to chain ${targetConfig.target} (Chain ID: ${String(targetConfig.stargateChainId)})`,
    );
  }

  return encodeStargatePayload({
    sourcePoolId: sourceConfig.quoteTokenStargatePoolId,
    targetPoolId: targetConfig.quoteTokenStargatePoolId,
    targetChainId: targetConfig.stargateChainId,
  });
}

/**
 * Estimate native gas fee needed to deposit funds cross-chain into the Exchange using Stargate
 */
export async function estimateStargateDepositGasFeeInNativeAssetUnits(
  sourceStargateTarget: StargateTarget,
  parameters: {
    exchangeStargateAdapterAddress?: string;
    wallet: string;
  },
  provider: ethers.Provider,
  sandbox: boolean,
): Promise<string> {
  const sourceConfig =
    sandbox ?
      StargateConfig.testnet[sourceStargateTarget]
    : StargateConfig.mainnet[sourceStargateTarget];

  const targetConfig =
    sandbox ?
      StargateConfig.testnet[BridgeTarget.XCHAIN_XCHAIN]
    : StargateConfig.mainnet[BridgeTarget.XCHAIN_XCHAIN];

  if (!sourceConfig || !sourceConfig.isSupported || !targetConfig.isSupported) {
    throw new Error(
      `Stargate deposits not supported from chain ${sourceConfig.target} (Chain ID: ${String(sourceConfig.stargateChainId)}) to chain ${targetConfig.target} (Chain ID: ${String(targetConfig.stargateChainId)})`,
    );
  }

  const [{ stargateBridgeAdapterContractAddress }] =
    parameters.exchangeStargateAdapterAddress ?
      [
        {
          stargateBridgeAdapterContractAddress:
            parameters.exchangeStargateAdapterAddress,
        },
      ]
    : await getExchangeAddressAndChainFromApi();

  const [gasFee] = await IStargateRouter__factory.connect(
    sourceConfig.stargateComposerAddress,
    provider,
  ).quoteLayerZeroFee(
    targetConfig.stargateChainId,
    // https://stargateprotocol.gitbook.io/stargate/developers/function-types
    1, // Function type should be 1 for swap
    stargateBridgeAdapterContractAddress,
    ethers.AbiCoder.defaultAbiCoder().encode(['address'], [parameters.wallet]),
    {
      dstGasForCall: StargateConfig.settings.swapDestinationGasLimit,
      dstNativeAmount: 0,
      dstNativeAddr: '0x',
    },
    { from: parameters.wallet },
  );

  return gasFee.toString();
}

/**
 * Estimate the quantity of tokens delivered to IDEX via Stargate deposit after slippage
 */
export async function estimateStargateDepositQuantityInDecimalAfterPoolFees(
  sourceStargateTarget: StargateTarget,
  parameters: {
    wallet: string;
    quantityInAssetUnits: string;
  },
  provider: ethers.Provider,
  sandbox: boolean,
): Promise<string> {
  const sourceConfig =
    sandbox ?
      StargateConfig.testnet[sourceStargateTarget]
    : StargateConfig.mainnet[sourceStargateTarget];

  const targetConfig =
    sandbox ?
      StargateConfig.testnet[BridgeTarget.XCHAIN_XCHAIN]
    : StargateConfig.mainnet[BridgeTarget.XCHAIN_XCHAIN];

  if (!sourceConfig.isSupported || !targetConfig.isSupported) {
    throw new Error(
      `Stargate deposits not supported from chain ${sourceConfig.target} (Chain ID: ${String(sourceConfig.stargateChainId)}) to chain ${targetConfig.target} (Chain ID: ${String(targetConfig.stargateChainId)})`,
    );
  }

  const [fees, poolDecimals] = await Promise.all([
    IStargateFeeLibrary__factory.connect(
      sourceConfig.stargateFeeLibraryAddress,
      provider,
    ).getFees(
      sourceConfig.quoteTokenStargatePoolId,
      targetConfig.quoteTokenStargatePoolId,
      targetConfig.stargateChainId,
      parameters.wallet,
      parameters.quantityInAssetUnits,
    ),
    IPool__factory.connect(
      sourceConfig.stargatePoolAddress,
      provider,
    ).sharedDecimals(),
  ]);

  const netPoolFees =
    fees.protocolFee + fees.lpFee + fees.eqFee - fees.eqReward;

  return assetUnitsToDecimal(
    BigInt(parameters.quantityInAssetUnits) - netPoolFees,
    Number(poolDecimals),
  );
}

/**
 * Estimate the quantity of tokens delivered to the target chain via Stargate withdrawal after slippage
 */
export async function estimateStargateWithdrawQuantityInDecimalAfterPoolFees(
  parameters: {
    exchangeStargateAdapterAddress: string;
    payload: string;
    wallet: string;
    quantityInDecimal: string;
  },
  provider: ethers.Provider,
) {
  const exchangeStargateAdapter = ExchangeStargateAdapter__factory.connect(
    parameters.exchangeStargateAdapterAddress,
    provider,
  );

  const [
    estimatedWithdrawQuantityInAssetUnits,
    minimumWithdrawQuantityInAssetUnits,
    poolDecimals,
  ] =
    await exchangeStargateAdapter.estimateWithdrawQuantityInAssetUnitsAfterPoolFees(
      parameters.payload,
      decimalToPip(parameters.quantityInDecimal).toString(),
      parameters.wallet,
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
