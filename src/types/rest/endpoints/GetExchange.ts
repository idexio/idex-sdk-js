/**
 * **Endpoint Parameters**
 *
 * > - **HTTP Request**:      `GET /v1/exchange`
 * > - **Endpoint Security:** [Public](https://api-docs-v1.kuma.bid/#endpointSecurityPublic)
 * > - **API Key Scope:**     [None](https://api-docs-v1.kuma.bid/#api-keys)
 */

export interface RestRequestGetExchange {}

/**
 * Basic exchange info
 *
 * @category Kuma - Get Exchange
 * @category Kuma Interfaces
 *
 * @see docs [API Documentation](https://api-docs-v1.kuma.bid/#get-exchange)
 * @see response {@link RestResponseGetExchange}
 */
export interface KumaExchange {
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
   * Address of the quote asset (USDC) on [XCHAIN](https://xchain.io/)
   */
  quoteTokenAddress: string;
  /** Total open interest across all markets in USD */
  totalOpenInterest: string;
  /** Total exchange trading volume for the trailing 24 hours in USD */
  volume24h: string;
  /** Total exchange trading volume for Kuma in USD */
  totalVolume: string;
  /** Total number of trade executions for Kuma */
  totalTrades: number;
  /** Balance of the insurance fund in USD */
  insuranceFundBalance?: string;
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
 * @see docs [API Documentation](https://api-docs-v1.kuma.bid/#get-exchange)
 * @see type {@link KumaExchange}
 *
 * @category Kuma - Get Exchange
 */
export type RestResponseGetExchange = KumaExchange;
