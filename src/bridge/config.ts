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
      tokenDecimals: 6,
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
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#arbitrum
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_AURORA]: {
      target: StargateV2Target.STARGATE_AURORA,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 1313161554,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#aurora
      layerZeroEndpointId: 30211,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#aurora
      stargateOFTAddress: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#aurora
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_AVALANCHE]: {
      target: StargateV2Target.STARGATE_AVALANCHE,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 43114,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#avalanche
      layerZeroEndpointId: 30106,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#avalanche
      stargateOFTAddress: '0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#avalanche
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_BASE]: {
      target: StargateV2Target.STARGATE_BASE,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 8453,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#base
      layerZeroEndpointId: 30184,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#base
      stargateOFTAddress: '0x27a16dc786820B16E5c9028b75B99F6f604b5d26',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#base
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_BNB]: {
      target: StargateV2Target.STARGATE_BNB,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 56,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#bnb-chain
      layerZeroEndpointId: 30102,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#bnb-chain
      stargateOFTAddress: '0x962Bd449E630b0d928f308Ce63f1A21F02576057',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#bnb-chain
      tokenDecimals: 18,
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
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#ethereum
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_IOTA]: {
      target: StargateV2Target.STARGATE_IOTA,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 8822,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#iota
      layerZeroEndpointId: 30284,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#iota
      stargateOFTAddress: '0x8e8539e4CcD69123c623a106773F2b0cbbc58746',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#iota
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_KLAYTN]: {
      target: StargateV2Target.STARGATE_KLAYTN,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 8217,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#klaytn
      layerZeroEndpointId: 30150,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#klaytn
      stargateOFTAddress: '0x01A7c805cc47AbDB254CD8AaD29dE5e447F59224',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#klaytn
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_MANTLE]: {
      target: StargateV2Target.STARGATE_MANTLE,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 5000,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#mantle
      layerZeroEndpointId: 30181,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#mantle
      stargateOFTAddress: '0xAc290Ad4e0c891FDc295ca4F0a6214cf6dC6acDC',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#mantle
      tokenDecimals: 6,
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
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#optimism
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_POLYGON]: {
      target: StargateV2Target.STARGATE_POLYGON,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 137,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#polygon
      layerZeroEndpointId: 30109,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#polygon
      stargateOFTAddress: '0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#polygon
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_RARI]: {
      target: StargateV2Target.STARGATE_RARI,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 1380012617,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#rari
      layerZeroEndpointId: 30235,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#rari
      stargateOFTAddress: '0x875bee36739e7Ce6b60E056451c556a88c59b086',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#rari
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_SCROLL]: {
      target: StargateV2Target.STARGATE_SCROLL,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 534352,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#scroll
      layerZeroEndpointId: 30214,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#scroll
      stargateOFTAddress: '0x3Fc69CC4A842838bCDC9499178740226062b14E4',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#scroll
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_SEI]: {
      target: StargateV2Target.STARGATE_SEI,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 1329,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#sei
      layerZeroEndpointId: 30280,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#sei
      stargateOFTAddress: '0x45d417612e177672958dC0537C45a8f8d754Ac2E',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#sei
      tokenDecimals: 6,
    },
    [StargateV2Target.STARGATE_TAIKO]: {
      target: StargateV2Target.STARGATE_TAIKO,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      evmChainId: 167000,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts#taiko
      layerZeroEndpointId: 30290,
      // https://stargateprotocol.gitbook.io/stargate/v/v2-developer-docs/technical-reference/mainnet-contracts#taiko
      stargateOFTAddress: '0x77C71633C34C3784ede189d74223122422492a0f',
      // https://stargateprotocol.gitbook.io/stargate/v2-developer-docs/technical-reference/v2-supported-networks-and-assets#taiko
      tokenDecimals: 6,
    },
  } as const,
} as const;

export const StargateV2ConfigByLayerZeroEndpointId = {
  mainnet: {
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_ARBITRUM]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_ARBITRUM],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_AURORA]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_AURORA],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_AVALANCHE]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_AVALANCHE],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_BASE]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_BASE],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_BNB]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_BNB],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_ETHEREUM]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_ETHEREUM],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_IOTA]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_IOTA],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_KLAYTN]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_KLAYTN],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_MANTLE]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_MANTLE],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_OPTIMISM]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_OPTIMISM],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_POLYGON]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_POLYGON],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_RARI]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_RARI],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_SCROLL]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_SCROLL],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_SEI]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_SEI],
    [StargateV2Config.mainnet[StargateV2Target.STARGATE_TAIKO]
      .layerZeroEndpointId]:
      StargateV2Config.mainnet[StargateV2Target.STARGATE_TAIKO],
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
