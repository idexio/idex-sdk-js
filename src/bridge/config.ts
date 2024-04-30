import {
  BridgeTarget,
  StargateTarget,
  StargateV2Target,
} from '#types/enums/request';

import type { BridgeV2Target } from '#types/enums/request';

export const StargateBridgeTargetsArray = Object.values(BridgeTarget);
export const StargateTargetsArray = Object.values(StargateTarget);
export const StargateV2BridgeTargetsArray = [
  StargateV2Target.STARGATE_BNB,
  StargateV2Target.STARGATE_AVALANCHE,
];
export const StargateV2TargetsArray = Object.values(StargateV2Target);

/**
 * TODO_IKON - These configs need to be completed in some areas and should be confirmed as valid
 *
 * @see [evmChainId](https://gist.github.com/melwong/c30eb1e21eda17549996a609c35dafb3#file-list-of-chain-ids-for-metamask-csv)
 * @see testnet [stargateRouterAddress](https://stargateprotocol.gitbook.io/stargate/developers/contract-addresses/testnet)
 *
 * @category Stargate
 */
export const StargateConfig = {
  settings: {
    swapSourceGasLimit: 450_000,
    swapDestinationGasLimit: 350_000,
    localBridgeTarget: StargateTarget.XCHAIN_XCHAIN,
  },
  // better way to handle the idex config as it doesnt have a
  // BridgeTarget assignment?

  testnet: {
    [StargateTarget.XCHAIN_XCHAIN]: {
      target: StargateTarget.XCHAIN_XCHAIN,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },

      evmChainId: 671276500,
      /**
       * - was 10237
       * - docs have 10219?
       */
      stargateChainId: 10237,
      quoteTokenStargatePoolId: 1,
      stargatePoolAddress: '0xE46b556A4d04f02eC2581761fE329EE056Da094F',
      stargateRouterAddress: '0x7a33a93cc6de8daC0E0340C34E36493F2363C58C',
      stargateComposerAddress: '0x5bd83cFd936ee3B36ad917d741634C8fD1368Bce',
      stargateFeeLibraryAddress: '0xc99BcD83C6726c55E9c1e7A5572132139aABC922',
      quoteTokenAddress: null,
    },
    [StargateTarget.STARGATE_ETHEREUM]: {
      target: StargateTarget.STARGATE_ETHEREUM,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 10161,
      /**
/80       * @see chain [Ethereum Sepolia](https://chainlist.org/chain/11155111)
       */
      evmChainId: 11155111, // Sepolia
      quoteTokenStargatePoolId: 1,
      stargatePoolAddress: '0xA3b5d5D34dC3062815685cA93a6Ab8d71FE72969',
      stargateRouterAddress: '0x2836045A50744FB50D3d04a9C8D18aD7B5012102',
      stargateComposerAddress: '0x4febD509277f485A5feB90fb20DC0D3FAe6Bf856',
      stargateFeeLibraryAddress: '0x332559fd86985962EfB3753Fa1f9453F0358ae40',
      quoteTokenAddress: '0xd63Ce8C84BabC99DD7f8d5112d88793b77470125',
    },
    [StargateTarget.STARGATE_POLYGON]: {
      target: StargateTarget.STARGATE_POLYGON,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      // stargateChainId: 10109,
      stargateChainId: null,
      /**
       * @see chain [Polygon Mumbai](https://chainlist.org/chain/80001)
       */
      evmChainId: 80_001,
      quoteTokenStargatePoolId: null,
      stargatePoolAddress: null,
      stargateRouterAddress: null,
      stargateComposerAddress: null,
      stargateFeeLibraryAddress: null,
      quoteTokenAddress: null,
    },
    [StargateTarget.STARGATE_ARBITRUM]: {
      target: StargateTarget.STARGATE_ARBITRUM,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 10231,
      /**
       * @see chain [Arbitrum Sepolia](https://chainlist.org/chain/421614)
       */
      evmChainId: 421614,
      quoteTokenStargatePoolId: 1,
      stargatePoolAddress: null,
      stargateRouterAddress: '0x2a4C2F5ffB0E0F2dcB3f9EBBd442B8F77ECDB9Cc',
      stargateComposerAddress: '0xb2d85b2484c910A6953D28De5D3B8d204f7DDf15',
      stargateFeeLibraryAddress: '0x275C6D07DEaeab44075a8F97A0145Ec079117a75',
      quoteTokenAddress: '0x3253a335E7bFfB4790Aa4C25C4250d206E9b9773',
    },
    [StargateTarget.STARGATE_OPTIMISM]: {
      target: StargateTarget.STARGATE_OPTIMISM,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 10232,
      /**
       * @see chain [OP Sepolia](https://chainlist.org/chain/11155420)
       */
      evmChainId: 11155420,
      quoteTokenStargatePoolId: 1,
      quoteTokenAddress: '0x488327236B65C61A6c083e8d811a4E0D3d1D4268',
      stargatePoolAddress: null,
      stargateRouterAddress: '0xa2dfFdDc372C6aeC3a8e79aAfa3953e8Bc956D63',
      stargateComposerAddress: '0x285304CB4FeFCCfb8a59F4cb583987643FAA3791',
      stargateFeeLibraryAddress: '0x82B3085dB28eBd45A453f8e64f349E27c47073CB',
    },

    // Unsupported Bridge Target Network Configs:

    [StargateTarget.STARGATE_BNB]: {
      target: StargateTarget.STARGATE_BNB,
      /**
       * Stargate supports this on testnet but we do not have values for
       * some of the config values.
       */
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 10102,
      /**
       * @see chain [BNB Smart Chain TestNet](https://chainlist.org/chain/97)
       */
      evmChainId: 97,
      stargatePoolAddress: null,
      // NOT SUPPORTED? Only USDT and BUSD
      quoteTokenStargatePoolId: null,
      stargateRouterAddress: '0xB606AaA7E2837D4E6FC1e901Ba74045B29D2EB36',
      stargateComposerAddress: '0x75D573607f5047C728D3a786BE3Ba33765712875',
      stargateFeeLibraryAddress: '0x89C1D24fFb34020a9Be5463bD2578fF966E9f303',
      // Only USDT: 0xe37Bdc6F09DAB6ce6E4eBC4d2E72792994Ef3765
      quoteTokenAddress: null,
    },

    [StargateTarget.STARGATE_AVALANCHE]: {
      target: StargateTarget.STARGATE_AVALANCHE,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 10106,
      /**
       * @see chain [Avalanche Fuji TestNet](https://chainlist.org/chain/43113)
       */
      evmChainId: 43113,
      quoteTokenStargatePoolId: 1,
      stargatePoolAddress: '0xe5B57A342f91A4378a2f84036638D58dF455cd25',
      stargateRouterAddress: '0x5C4948d523943090bd3AEbD06227272A6b581691',
      stargateComposerAddress: '0xd2b97823982380A980d686Ed7B7c3285875386ed',
      stargateFeeLibraryAddress: '0x6c6F6c03f48ac83dFAb7cfCC248DcC9791ded308',
      quoteTokenAddress: '0x89C1D24fFb34020a9Be5463bD2578fF966E9f303',
    },

    [StargateTarget.STARGATE_METIS]: {
      target: StargateTarget.STARGATE_METIS,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      // stargateChainId: 10151,
      stargateChainId: null,
      /**
       * @see chain [Metis Goerli](https://chainlist.org/chain/599)
       */
      evmChainId: 599,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: null,
      stargateComposerAddress: null,
      stargateFeeLibraryAddress: null,
    },
    [StargateTarget.STARGATE_FANTOM]: {
      target: StargateTarget.STARGATE_FANTOM,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      // stargateChainId: 10112,
      stargateChainId: null,
      /**
       * @see chain [Fantom TestNet](https://chainlist.org/chain/4002)
       */
      evmChainId: 4002,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: null,
      stargateFeeLibraryAddress: null,
    },
    [StargateTarget.STARGATE_LINEA]: {
      target: StargateTarget.STARGATE_LINEA,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      // stargateChainId: 10157,
      stargateChainId: null,
      /**
       * @see chain [Linea TestNet](https://chainlist.org/chain/59140)
       */
      evmChainId: 59140,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: null,
      stargateFeeLibraryAddress: null,
    },
    [StargateTarget.STARGATE_KAVA]: {
      target: StargateTarget.STARGATE_KAVA,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: null,
      /**
       * @see [Kava TestNet](https://chainlist.org/chain/2221)
       */
      evmChainId: 2221,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: null,
      stargateFeeLibraryAddress: null,
    },
    [StargateTarget.STARGATE_MANTLE]: {
      target: StargateTarget.STARGATE_MANTLE,
      isSupported: false,
      isBridgeTarget: false,
      stargateChainId: null,
      /**
       * @see chain [Mantle Sepolia](https://chainlist.org/chain/5003)
       */
      evmChainId: 5003,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: null,
      stargateFeeLibraryAddress: null,
    },
    [StargateTarget.STARGATE_BASE]: {
      target: StargateTarget.STARGATE_BASE,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: null,
      /**
       * @see chain [Base Sepolia](https://chainlist.org/chain/84532)
       */
      evmChainId: 84532,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: null,
      stargateFeeLibraryAddress: null,
    },
  } as const,
  mainnet: {
    [StargateTarget.XCHAIN_XCHAIN]: {
      target: StargateTarget.XCHAIN_XCHAIN,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: null,
      evmChainId: null,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: null,
      stargateFeeLibraryAddress: null,
    },
    [StargateTarget.STARGATE_ETHEREUM]: {
      target: StargateTarget.STARGATE_ETHEREUM,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 101,
      evmChainId: 1,
      quoteTokenStargatePoolId: 1,
      quoteTokenAddress: null,
      stargatePoolAddress: '0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56',
      stargateRouterAddress: '0x8731d54E9D02c286767d56ac03e8037C07e01e98',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0x8C3085D9a554884124C998CDB7f6d7219E9C1e6F',
    },
    [StargateTarget.STARGATE_POLYGON]: {
      target: StargateTarget.STARGATE_POLYGON,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 109,
      evmChainId: 137,
      quoteTokenStargatePoolId: 1,
      quoteTokenAddress: null,
      stargatePoolAddress: '0x1205f31718499dBf1fCa446663B532Ef87481fe1',
      stargateRouterAddress: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0xb279b324Ea5648bE6402ABc727173A225383494C',
    },
    [StargateTarget.STARGATE_ARBITRUM]: {
      target: StargateTarget.STARGATE_ARBITRUM,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 110,
      /**
       * @see chain [Arbitrum One](https://chainlist.org/chain/42161)
       */
      evmChainId: 42161,
      quoteTokenStargatePoolId: 1,
      quoteTokenAddress: null,
      stargatePoolAddress: '0x892785f33CdeE22A30AEF750F285E18c18040c3e',
      stargateRouterAddress: '0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0x1cF31666c06ac3401ed0C1c6346C4A9425dd7De4',
    },
    [StargateTarget.STARGATE_OPTIMISM]: {
      target: StargateTarget.STARGATE_OPTIMISM,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 111,
      /**
       * @see chain [OP MainNet](https://chainlist.org/chain/10)
       */
      evmChainId: 10,
      quoteTokenStargatePoolId: 1,
      quoteTokenAddress: null,
      stargatePoolAddress: '0xDecC0c09c3B5f6e92EF4184125D5648a66E35298',
      stargateRouterAddress: '0xB0D502E938ed5f4df2E681fE6E419ff29631d62b',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: ' 0x505eCDF2f14Cd4f1f413d04624b009A449D38D7E',
    },

    // Unsupported Bridge Target Network Configs:

    [StargateTarget.STARGATE_BNB]: {
      target: StargateTarget.STARGATE_BNB,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 102,
      evmChainId: 56,
      quoteTokenStargatePoolId: null, // no USDC on BSC
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: '0x4a364f8c717cAAD9A442737Eb7b8A55cc6cf18D8',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0xCA6522116e8611A346D53Cc2005AC4192e3fc2BC',
    },
    [StargateTarget.STARGATE_AVALANCHE]: {
      target: StargateTarget.STARGATE_AVALANCHE,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 106,
      /**
       * @see chain [Avalanche C-Chain](https://chainlist.org/chain/43114)
       */
      evmChainId: 43114,
      quoteTokenStargatePoolId: 1,
      quoteTokenAddress: null,
      stargatePoolAddress: '0x1205f31718499dBf1fCa446663B532Ef87481fe1',
      stargateRouterAddress: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0x5E8eC15ACB5Aa94D5f0589E54441b31c5e0B992d',
    },

    [StargateTarget.STARGATE_METIS]: {
      target: StargateTarget.STARGATE_METIS,
      /**
       * @see docs [Stargate Metis Docs](https://stargateprotocol.gitbook.io/stargate/developers/contract-addresses/mainnet#metis)
       */
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 151,
      /**
       * @see chain [Metis Andromeda](https://chainlist.org/chain/1088)
       */
      evmChainId: 1088,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0x55bDb4164D28FBaF0898e0eF14a589ac09Ac9970',
    },
    [StargateTarget.STARGATE_FANTOM]: {
      target: StargateTarget.STARGATE_FANTOM,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 112,
      /**
       * @see chain [Fantom Opera](https://chainlist.org/chain/250)
       */
      evmChainId: 250,
      quoteTokenStargatePoolId: 21,
      quoteTokenAddress: null,
      stargatePoolAddress: '0xc647ce76ec30033aa319d472ae9f4462068f2ad7',
      stargateRouterAddress: '0xAf5191B0De278C7286d6C7CC6ab6BB8A73bA2Cd6',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0x616a68BD6DAd19e066661C7278611487d4072839',
    },
    [StargateTarget.STARGATE_LINEA]: {
      target: StargateTarget.STARGATE_LINEA,
      /**
       * @see docs [Stargate Linea Documentation](https://stargateprotocol.gitbook.io/stargate/developers/contract-addresses/mainnet#linea)
       */
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 183,
      /**
       * @see chain [Linea](https://chainlist.org/chain/59144)
       */
      evmChainId: 59144,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
    },
    [StargateTarget.STARGATE_KAVA]: {
      target: StargateTarget.STARGATE_KAVA,
      isSupported: false,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 177,
      /**
       * @see [Kava MainNet](https://chainlist.org/chain/2222)
       */
      evmChainId: 2222,
      quoteTokenStargatePoolId: null,
      quoteTokenAddress: null,
      stargatePoolAddress: null,
      stargateRouterAddress: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0x45a01e4e04f14f7a4a6702c74187c5f6222033cd',
    },
    [StargateTarget.STARGATE_MANTLE]: {
      target: StargateTarget.STARGATE_MANTLE,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 181,
      /**
       * @see chain [Mantle](https://chainlist.org/chain/5000)
       */
      evmChainId: 5000,
      quoteTokenStargatePoolId: 1,
      quoteTokenAddress: null,
      stargatePoolAddress: '0xAad094F6A75A14417d39f04E690fC216f080A41a',
      stargateRouterAddress: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
      stargateComposerAddress: '0x296F55F8Fb28E498B858d0BcDA06D955B2Cb3f97',
      stargateFeeLibraryAddress: '0x45A01E4e04F14f7A4a6702c74187c5F6222033cd',
    },
    [StargateTarget.STARGATE_BASE]: {
      target: StargateTarget.STARGATE_BASE,
      isSupported: true,
      get isBridgeTarget() {
        return isValidBridgeTarget(this.target);
      },
      stargateChainId: 184,
      /**
       * @see chain [Base](https://chainlist.org/chain/8453)
       */
      evmChainId: 8453,
      quoteTokenStargatePoolId: 1,
      quoteTokenAddress: null,
      stargatePoolAddress: '0x4c80E24119CFB836cdF0a6b53dc23F04F7e652CA',
      stargateRouterAddress: '0x45f1A95A4D3f3836523F5c83673c797f4d4d263B',
      stargateComposerAddress: '0xeCc19E177d24551aA7ed6Bc6FE566eCa726CC8a9',
      stargateFeeLibraryAddress: '0x9d1b1669c73b033dfe47ae5a0164ab96df25b944',
    },
  } as const,
} as const;

export const StargateConfigByStargateChainID = {
  mainnet: {
    [StargateConfig.mainnet[StargateTarget.STARGATE_ARBITRUM].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_ARBITRUM],
    [StargateConfig.mainnet[StargateTarget.STARGATE_ETHEREUM].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_ETHEREUM],
    [StargateConfig.mainnet[StargateTarget.STARGATE_BNB].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_BNB],
    [StargateConfig.mainnet[StargateTarget.STARGATE_AVALANCHE].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_AVALANCHE],
    [StargateConfig.mainnet[StargateTarget.STARGATE_OPTIMISM].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_OPTIMISM],
    [StargateConfig.mainnet[StargateTarget.STARGATE_METIS].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_METIS],
    [StargateConfig.mainnet[StargateTarget.STARGATE_FANTOM].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_FANTOM],
    [StargateConfig.mainnet[StargateTarget.STARGATE_LINEA].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_LINEA],
    [StargateConfig.mainnet[StargateTarget.STARGATE_KAVA].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_KAVA],
    [StargateConfig.mainnet[StargateTarget.STARGATE_MANTLE].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_MANTLE],
    [StargateConfig.mainnet[StargateTarget.STARGATE_BASE].stargateChainId]:
      StargateConfig.mainnet[StargateTarget.STARGATE_BASE],
  },
  testnet: {
    [StargateConfig.testnet[StargateTarget.XCHAIN_XCHAIN].stargateChainId]:
      StargateConfig.testnet[StargateTarget.XCHAIN_XCHAIN],
    [StargateConfig.testnet[StargateTarget.STARGATE_ETHEREUM].stargateChainId]:
      StargateConfig.testnet[StargateTarget.STARGATE_ETHEREUM],
    [StargateConfig.testnet[StargateTarget.STARGATE_BNB].stargateChainId]:
      StargateConfig.testnet[StargateTarget.STARGATE_BNB],

    [StargateConfig.testnet[StargateTarget.STARGATE_ARBITRUM].stargateChainId]:
      StargateConfig.testnet[StargateTarget.STARGATE_ARBITRUM],
    [StargateConfig.testnet[StargateTarget.STARGATE_AVALANCHE].stargateChainId]:
      StargateConfig.testnet[StargateTarget.STARGATE_AVALANCHE],
    [StargateConfig.testnet[StargateTarget.STARGATE_OPTIMISM].stargateChainId]:
      StargateConfig.testnet[StargateTarget.STARGATE_OPTIMISM],

    // [StargateConfig.testnet[StargateTarget.STARGATE_POLYGON].stargateChainId]:
    // StargateConfig.testnet[StargateTarget.STARGATE_POLYGON],
    // [StargateConfig.testnet[StargateTarget.STARGATE_METIS].stargateChainId]: StargateConfig.testnet[StargateTarget.STARGATE_METIS],
    // [StargateConfig.testnet[StargateTarget.STARGATE_FANTOM].stargateChainId]: StargateConfig.testnet[StargateTarget.STARGATE_FANTOM],
    // [StargateConfig.testnet[StargateTarget.STARGATE_LINEA].stargateChainId]: StargateConfig.testnet[StargateTarget.STARGATE_LINEA],
    // [StargateConfig.testnet[StargateTarget.STARGATE_KAVA].stargateChainId]: StargateConfig.testnet[StargateTarget.STARGATE_KAVA],,
  },
} as const;

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
    localBridgeTarget: StargateTarget.STARGATE_AVALANCHE,
  },
  // better way to handle the idex config as it doesnt have a
  // BridgeTarget assignment?

  testnet: {
    [StargateTarget.STARGATE_AVALANCHE]: {
      target: StargateTarget.STARGATE_AVALANCHE,
      isSupported: true,
      get isBridgeTarget() {
        return isValidStargateV2BridgeTarget(this.target);
      },

      evmChainId: 43113,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints#fuji-avalanche-testnet
      layerZeroEndpointId: 40106,
      // https://github.com/stargate-protocol/x-stargate-v2/blob/05de001e429a82234b184290656b14b4fcac3a5f/packages/stg-evm-v2/deployments/avalanche-testnet/StargatePoolUSDT.json#L2
      stargateOFTAddress: '0xbB936075d22caCe5df6a9F622befE50a1c037eC4',
    },
    [StargateTarget.STARGATE_BNB]: {
      target: StargateTarget.STARGATE_BNB,
      isSupported: true,
      get isBridgeTarget() {
        return isValidStargateV2BridgeTarget(this.target);
      },

      evmChainId: 97,
      // https://docs.layerzero.network/v2/developers/evm/technical-reference/endpoints#bnb-chain-testnet
      layerZeroEndpointId: 40102,
      // https://github.com/stargate-protocol/x-stargate-v2/blob/05de001e429a82234b184290656b14b4fcac3a5f/packages/stg-evm-v2/deployments/bsc-testnet/StargatePoolUSDT.json#L2C15-L2C57
      stargateOFTAddress: '0x95f697F6215ee2653325679709AB37162eaeB13A',
    },
  } as const,
  mainnet: {
    [StargateTarget.STARGATE_AVALANCHE]: {
      target: StargateTarget.STARGATE_AVALANCHE,
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
    [StargateTarget.STARGATE_BNB]: {
      target: StargateTarget.STARGATE_BNB,
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
 * A type guard that checks if the given value is a valid {@link StargateTarget} value.
 *
 * - This will not validate that the value is a {@link BridgeTarget} as that is  a subset of
 *   {@link StargateTarget}, use {@link isValidBridgeTarget} for that.
 *
 * @internal
 */

export function isValidStargateTarget(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is StargateTarget {
  return value && StargateTargetsArray.includes(value as StargateTarget);
}

/**
 * A type guard that checks if the given value is a valid {@link BridgeTarget} (which will also
 * mean it is a valid {@link StargateTarget})
 *
 * - You can also use {@link isValidStargateTarget} to check if the value is a {@link StargateTarget}
 *
 * @internal
 */
export function isValidBridgeTarget(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is BridgeTarget {
  return value && StargateBridgeTargetsArray.includes(value as BridgeTarget);
}

export function isValidStargateV2BridgeTarget(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
): value is BridgeV2Target {
  return (
    value && StargateV2BridgeTargetsArray.includes(value as BridgeV2Target)
  );
}
