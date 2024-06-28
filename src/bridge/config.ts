import { StargateV2Target, BridgeTarget } from '#types/enums/request';

export const StargateV2BridgeTargetsArray = Object.values(BridgeTarget);
export const StargateV2TargetsArray = Object.values(StargateV2Target);

/**
 * TODO_IKON - These configs need to be completed in some areas and should be confirmed as valid
 *
 * @see [evmChainId](https://gist.github.com/melwong/c30eb1e21eda17549996a609c35dafb3#file-list-of-chain-ids-for-metamask-csv)
 *
 * @category Stargate
 */
export const StargateV2Config = {
  settings: {
    swapSourceGasLimit: 450_000,
    swapDestinationGasLimit: 350_000,
    localBridgeTarget: StargateV2Target.XCHAIN_XCHAIN,
  },
  // better way to handle the idex config as it doesnt have a
  // BridgeTarget assignment?
  mainnet: {
    [StargateV2Target.XCHAIN_XCHAIN]: {
      target: StargateV2Target.XCHAIN_XCHAIN,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 94524,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#xchain
      layerZeroEndpointId: 30291,
      // TODO not yet in Stargate V2 docs
      stargateOFTAddress: '0x17d65bF79E77B6Ab21d8a0afed3bC8657d8Ee0B2',
    },
    [StargateV2Target.STARGATE_ARBITRUM]: {
      target: StargateV2Target.STARGATE_ARBITRUM,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 42161,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#arbitrum
      layerZeroEndpointId: 30110,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#arbitrum
      stargateOFTAddress: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
    },
    [StargateV2Target.STARGATE_ETHEREUM]: {
      target: StargateV2Target.STARGATE_ETHEREUM,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 1,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#ethereum
      layerZeroEndpointId: 30101,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#ethereum
      stargateOFTAddress: '0xc026395860Db2d07ee33e05fE50ed7bD583189C7',
    },
    [StargateV2Target.STARGATE_OPTIMISM]: {
      target: StargateV2Target.STARGATE_OPTIMISM,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 10,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#optimism
      layerZeroEndpointId: 30111,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#optimism
      stargateOFTAddress: '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
    },
    [StargateV2Target.STARGATE_POLYGON]: {
      target: StargateV2Target.STARGATE_POLYGON,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 137,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#optimism
      layerZeroEndpointId: 30109,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#optimism
      stargateOFTAddress: '0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4',
    },
  } as const,
} as const;

export const StargateV2ConfigByLayerZeroEndpointId = {
  mainnet: {
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_ARBITRUM]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_ARBITRUM],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_ETHEREUM]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_ETHEREUM],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_OPTIMISM]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_OPTIMISM],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_POLYGON]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_POLYGON],
  },
};

/**
 * A type guard that checks if the given value is a valid {@link StargateV2Target} value.
 *
 * - This will not validate that the value is a {@link BridgeTarget} as that is  a subset of
 *   {@link StargateV2Target}, use {@link isValidBridgeTarget} for that.
 *
 * @internal
 */

export function isValidStargateV2Target(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is StargateV2Target {
  return value && StargateV2TargetsArray.includes(value as StargateV2Target);
}

/**
 * A type guard that checks if the given value is a valid {@link BridgeTarget} (which will also
 * mean it is a valid {@link StargateV2Target})
 *
 * - You can also use {@link isValidStargateV2Target} to check if the value is a {@link StargateV2Target}
 *
 * @internal
 */
export function isValidBridgeTarget(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is BridgeTarget {
  return value && StargateV2BridgeTargetsArray.includes(value as BridgeTarget);
}
