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

  testnet: {
    [StargateV2Target.XCHAIN_XCHAIN]: {
      target: StargateV2Target.XCHAIN_XCHAIN,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },

      evmChainId: 64002,
      // TODO
      layerZeroEndpointId: 0,
      // TODO
      stargateOFTAddress: '0x0000000000000000000000000000000000000000',
    },
    [StargateV2Target.STARGATE_AVALANCHE]: {
      target: StargateV2Target.STARGATE_AVALANCHE,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },

      evmChainId: 43113,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints#fuji-avalanche-testnet
      layerZeroEndpointId: 40106,
      // https://github.com/stargate-protocol/x-stargate-v2/blob/05de001e429a82234b184290656b14b4fcac3a5f/packages/stg-evm-v2/deployments/avalanche-testnet/StargatePoolUSDT.json#L2
      stargateOFTAddress: '0xbB936075d22caCe5df6a9F622befE50a1c037eC4',
    },
    [StargateV2Target.STARGATE_BNB]: {
      target: StargateV2Target.STARGATE_BNB,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },

      evmChainId: 97,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints#bnb-chain-testnet
      layerZeroEndpointId: 40102,
      // https://github.com/stargate-protocol/x-stargate-v2/blob/05de001e429a82234b184290656b14b4fcac3a5f/packages/stg-evm-v2/deployments/bsc-testnet/StargatePoolUSDT.json#L2C15-L2C57
      stargateOFTAddress: '0x95f697F6215ee2653325679709AB37162eaeB13A',
    },
  } as const,
  mainnet: {
    [StargateV2Target.XCHAIN_XCHAIN]: {
      target: StargateV2Target.XCHAIN_XCHAIN,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      // TODO
      evmChainId: 0,
      // TODO
      layerZeroEndpointId: 0,
      // TODO
      stargateOFTAddress: '0x0000000000000000000000000000000000000000',
    },
    [StargateV2Target.STARGATE_AVALANCHE]: {
      target: StargateV2Target.STARGATE_AVALANCHE,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },

      evmChainId: 43114,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints#avalanche
      layerZeroEndpointId: 30106,
      // TODO
      stargateOFTAddress: null,
    },
    [StargateV2Target.STARGATE_BNB]: {
      target: StargateV2Target.STARGATE_BNB,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },

      evmChainId: 56,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints#bnb-chain
      layerZeroEndpointId: 30102,
      // TODO
      stargateOFTAddress: null,
    },
  } as const,
} as const;

export const StargateV2ConfigByLayerZeroEndpointId = {
  mainnet: {
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_AVALANCHE]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_AVALANCHE],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_BNB]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_BNB],
  },
  testnet: {
    [StargateV2Config.testnet[StargateV2Target.STARGATE_AVALANCHE]
      .layerZeroEndpointId]:
      StargateV2Config.testnet[StargateV2Target.STARGATE_AVALANCHE],
    [StargateV2Config.testnet[StargateV2Target.STARGATE_BNB]
      .layerZeroEndpointId]:
      StargateV2Config.testnet[StargateV2Target.STARGATE_BNB],
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
