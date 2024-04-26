/**
 * **Endpoint Parameters**
 *
 * > - **HTTP Request**:      `GET /v4/exchange`
 * > - **Endpoint Security:** [Public](https://api-docs-v4.idex.io/#endpointSecurityPublic)
 * > - **API Key Scope:**     [None](https://api-docs-v4.idex.io/#api-keys)
 */

export interface RestRequestGetExchange {}

/**
 * Basic exchange info
 *
 * @category IDEX - Get Exchange
 * @category IDEX Interfaces
 *
 * @see docs [API Documentation](https://api-docs-v4.idex.io/#get-exchange)
 * @see response {@link RestResponseGetExchange}
 */
export interface IDEXExchange {
  /** Server time zone, always UTC */
  timeZone: 'UTC';
  /**
   * Current server time
   */
  serverTime: number;
  /**
   * [XCHAIN](https://xchain.io/) address of the exchange smart contract for deposits
   */
  exchangeContractAddress: string;
  /**
   * [Stargate](https://stargateprotocol.gitbook.io/) bridge adapter contract address
   *
   * - Used to define the `stargateBridgeAdapterAddress` properties in withdrawals
   */
  stargateBridgeAdapterContractAddress: string;
  /**
   * [XCHAIN](https://xchain.io/) chain identifier
   */
  chainId: number;
  /**
   * Address of the quote asset (USDC) on Ethereum
   */
  quoteTokenAddressL1: string;
  /**
   * Address of the quote asset (USDC) on [XCHAIN](https://xchain.io/)
   */
  quoteTokenAddressL2: string;
  /** Total open interest across all markets in USD */
  totalOpenInterest: string;
  /** Total exchange trading volume for the trailing 24 hours in USD */
  volume24h: string;
  /** Total exchange trading volume for IDEX in USD */
  totalVolume: string;
  /** Total number of trade executions for IDEX */
  totalTrades: number;
  /** Balance of the insurance fund in USD */
  insuranceFundBalance?: string;
  /** Token contract address for the IDEX token on Ethereum */
  idexTokenAddressEthereum: string;
  /** Token contract address for the IDEX token on L2 Arbitrum */
  idexTokenAddressArbitrum: string;
  /**  Token contract address for the IDEX token on [Polygon PoS](https://polygon.technology/polygon-pos) */
  idexTokenAddressPolygon: string;

  /** Current price of the IDEX token in USD */
  idexTokenPrice: string;
  /** Market capitalization of the IDEX token in USD */
  idexMarketCap: string;
  /** Default exchange-wide maker trade fee rate */
  defaultMakerFeeRate: string;
  /** Default exchange-wide taker trade fee rate */
  defaultTakerFeeRate: string;
  /** Minimum withdrawal amount in USD */
  withdrawalMinimum: string;
  /**
   * Whether withdrawals are enabled
   *
   * - Internal use only, not returned in all circumstances
   *
   * @internal
   */
  depositEnabled?: boolean;
  /**
   * Whether deposits are enabled
   *
   * - Internal use only, not returned in all circumstances
   *
   * @internal
   */
  withdrawEnabled?: boolean;
}

/**
 * @see docs [API Documentation](https://api-docs-v4.idex.io/#get-exchange)
 * @see type {@link IDEXExchange}
 *
 * @category IDEX - Get Exchange
 */
export type RestResponseGetExchange = IDEXExchange;
