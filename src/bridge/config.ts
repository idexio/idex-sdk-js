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
      // TODO Not yet in Stargate V2 docs
      stargateOFTAddress: '0x17d65bF79E77B6Ab21d8a0afed3bC8657d8Ee0B2',
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_BERACHAIN]: {
      target: StargateV2Target.STARGATE_BERACHAIN,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 80094,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#bera
      layerZeroEndpointId: 30362,
      // TODO Not yet in Stargate V2 docs
      stargateOFTAddress: '0xAF54BE5B6eEc24d6BFACf1cce4eaF680A8239398',
      // TODO Not yet in LZ docs
      tokenDecimals: 6,
    },
  } as const,
  testnet: {
    [StargateV2Target.XCHAIN_XCHAIN]: {
      target: StargateV2Target.XCHAIN_XCHAIN,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 64002,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#xchain-testnet
      layerZeroEndpointId: 40282,
      // TODO Not a Stargate contract
      stargateOFTAddress: '0x54a04EfABCBd81A0488E4a9Ad22264E04A48329B',
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_BERACHAIN]: {
      target: StargateV2Target.STARGATE_BERACHAIN,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 80000,
      // TODO Not yet in LZ docs
      layerZeroEndpointId: 40346,
      // TODO Not a Stargate contract
      stargateOFTAddress: '0xb1487b8C46e68e15ed3B01cC5AA4A1E6aFEfd6d4',
      // TODO Not yet in LZ docs
      tokenDecimals: 6,
    },
  } as const,
} as const;

export const StargateV2ConfigByLayerZeroEndpointId = {
  mainnet: {
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_BERACHAIN]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_BERACHAIN],
  },
  testnet: {
    [StargateV2Config.testnet[StargateV2Target.STARGATE_BERACHAIN]
      .layerZeroEndpointId]:
      StargateV2Config.testnet[StargateV2Target.STARGATE_BERACHAIN],
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
