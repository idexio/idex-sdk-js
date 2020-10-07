import {
  ethers,
  providers,
  utils as ethersUtils,
  ContractTransaction,
} from 'ethers';

import { ExchangeFactory } from './contracts/ExchangeFactory';
import { Erc20Factory } from './contracts/Erc20Factory';
import { CONTRACTS, DEFAULT_CLIENT_OPTIONS } from './constants';
import { TransactionOverrides } from './contracts';

// const EXCHANGE_GAS_DEPOSIT_WITHOUT_TRANSFER_FROM_GWEI = 49_494;
// const FAILLBACK_TRANSFER_FROM_GAS_ESTIMATE = '70000';

type RequestType = 'estimate' | 'request';

type EthereumWalletConfig = {
  address: string;
  privateKey: string;
  provider?: ethers.providers.JsonRpcProvider;
};

type TransactionOptions = TransactionOverrides & {
  gasPriceGwei?: number | string;
  amount?: string;
};

type EthereumTokenDescriptor = {
  address: string;
  decimals: number;
};

type DepositEthResponse<A extends RequestType> = A extends 'estimate'
  ? ethers.BigNumber
  : ContractTransaction;

type DepositTokenResponse<A extends RequestType> = A extends 'estimate'
  ? {
      depositEstimate: ethers.BigNumber;
      approveEstimate: ethers.BigNumber;
      totalEstimate: ethers.BigNumber;
      totalGasPriceWei: ethers.BigNumber;
    }
  : {
      deposit: ContractTransaction;
      approve: ContractTransaction;
    };

const getSignerByAction = {
  estimate: (wallet: Required<EthereumWalletConfig>) =>
    wallet.provider.getSigner(wallet.address),
  request(wallet: Required<EthereumWalletConfig>) {
    if (!wallet.privateKey) {
      throw new Error(
        '[ERROR] | Contract calls require a private key unless calling estimate.',
      );
    }
    return new ethers.Wallet(wallet.privateKey, wallet.provider);
  },
} as const;

// export async function depositToken<A extends RequestType>(
//   action: A,
//   _token: {
//     address: string | Token['address'];
//     decimals: Token['decimals'];
//   },
//   wallet: EthereumWalletConfig,
//   transaction: TransactionOptions,
//   exchangeContractAddress: string,
//   onApprove?: (tx: ContractTransaction) => void,
// ): Promise<DepositTokenResponse<A>> {
//   const signer = getSignerByAction[action](wallet);

//   const token = {
//     address: formatFromBuffer(_token.address),
//     decimals: _token.decimals,
//   };

//   const amount = transaction.value
//     ? await transaction.value
//     : transaction.amount && parseUnits(transaction.amount, token.decimals);

//   const txOptions = {
//     gasLimit: parseUnits(MAX_DEPOSIT_GAS, 'wei'),
//     gasPrice:
//       transaction.gasPriceGwei &&
//       parseUnits(String(transaction.gasPriceGwei), 'gwei'),
//     ...transaction,
//   };

//   delete txOptions.gasPriceGwei;
//   delete txOptions.amount;
//   delete txOptions.value;

//   console.log(
//     `[client] Deposit ${action} of token ${token.address} [decimals ${
//       token.decimals
//     }] amount=${amount.toString()}`,
//   );

//   const erc20Contract = Erc20Factory.connect(token.address, signer);
//   const exchangeContract = ExchangeFactory.connect(
//     exchangeContractAddress,
//     signer,
//   );

//   const approveParams = [exchangeContractAddress, amount, txOptions] as const;

//   const depositParams = [token.address, amount, txOptions] as const;

//   if (action === 'estimate') {
//     const approveEstimate = await erc20Contract.estimate.approve(
//       ...approveParams,
//     );

//     // We cannot estimate depositToken because transaction would fail - there is no approve submitted
//     let transferFromEstimate: ethers.BigNumber;

//     try {
//       transferFromEstimate = await erc20Contract.estimate.transferFrom(
//         wallet.address,
//         token.address,
//         0, // Other values not working because allowance
//       );
//     } catch (error) {
//       // This could happen only if contract does not allow 0 value in `transferFrom`.
//       // We should investigate each token where this happened and check if estimate is correct.
//       console.error(
//         `Contract ${token.address} estimation problem [transferFrom]`,
//         error,
//       );
//       transferFromEstimate = ethers.BigNumber.from(
//         FAILLBACK_TRANSFER_FROM_GAS_ESTIMATE,
//       );
//     }
//     const depositEstimate = transferFromEstimate.add(
//       EXCHANGE_GAS_DEPOSIT_WITHOUT_TRANSFER_FROM_GWEI,
//     );
//     const totalEstimate = approveEstimate.add(depositEstimate);
//     const estimations = {
//       approveEstimate,
//       depositEstimate,
//       totalEstimate,
//     };
//     // console.log('Deposit transaction estimations', estimations);
//     return estimations as DepositTokenResponse<A>;
//   }

//   const approve = await erc20Contract.approve(...approveParams);

//   // console.log('Approve submitted', approve);

//   if (onApprove) {
//     // Inform about progress..
//     onApprove(approve);
//   }

//   // Uncomment to re-estimate fuction, see `EXCHANGE_GAS_DEPOSIT_WITHOUT_TRANSFER_FROM_GWEI` above.
//   // const estimationOfDeposit = await exchangeContractInstance.estimateGas.depositTokenByAddress(...depositParams);
//   // console.log('Estimation of estimationOfDeposit is:', estimationOfDeposit.toString());

//   const deposit = await exchangeContract.depositTokenByAddress(
//     ...depositParams,
//   );

//   // console.log('Deposit submitted', deposit);

//   return {
//     approve,
//     deposit,
//   } as DepositTokenResponse<A>;
// }

/**
 * Ethereum Client configuration options
 *
 * @typedef {Object} EthereumClientOptions
 * @property {boolean} sandbox - When true, interacts with the sandbox contract
 * @property {boolean} rpc -The Ethereum RPC url to use
 * @property {string} [walletPrivateKey] - If provided, used to create ECDSA signatures
 */
export type EthereumClientOptions = {
  sandbox?: boolean;
  rpc: string;
  walletPrivateKey: string;
  defaultGasLimit?: string;
};

const CLIENT_OPTIONS = new WeakMap<
  EthereumClient,
  Required<EthereumClientOptions>
>();

export class EthereumClient {
  public contract: string;

  public provider: ethers.providers.JsonRpcProvider;

  constructor(options: EthereumClientOptions) {
    const clientOptions = {
      sandbox: !!options.sandbox,
      ...DEFAULT_CLIENT_OPTIONS,
      ...options,
    };
    this.contract = CONTRACTS[clientOptions.sandbox ? 'sandbox' : 'mainnet'];
    this.provider = new providers.JsonRpcProvider(clientOptions.rpc);
    CLIENT_OPTIONS.set(this, clientOptions);
  }

  /**
   * Gets the ethers contract supplemented with the public contract calls
   */
  public getExchangeContract(
    action: RequestType,
    wallet: EthereumWalletConfig,
  ): ReturnType<typeof ExchangeFactory.connect> {
    return ExchangeFactory.connect(
      this.contract,
      getSignerByAction[action]({
        ...wallet,
        provider: this.provider,
      }),
    );
  }

  /**
   * Gets the ethers erc20 contract supplemented with types
   */
  public getTokenContract(
    action: RequestType,
    address: string,
    wallet: EthereumWalletConfig,
  ): ReturnType<typeof Erc20Factory.connect> {
    return Erc20Factory.connect(
      address,
      getSignerByAction[action]({
        ...wallet,
        provider: this.provider,
      }),
    );
  }

  /**
   * Deposits ETH into the exchange contract for the configured wallet.
   *
   * @example
   *  const transaction = await client.depositEther('request', wallet, {
   *    amount: '4',
   *    gasPriceGwei: '25'
   *  });
   *  // wait until tx confirmed
   *  await transaction.wait()
   */
  public async depositEther<A extends RequestType>(
    action: A,
    wallet: EthereumWalletConfig,
    transaction: TransactionOptions,
  ): Promise<DepositEthResponse<A>> {
    const exchangeContract = this.getExchangeContract(action, wallet);

    const { gasPriceGwei, amount, ...txOptions } = transaction;

    if (gasPriceGwei) {
      txOptions.gasPrice = ethersUtils.parseUnits(String(gasPriceGwei), 'gwei');
    }

    if (amount) {
      txOptions.value = ethersUtils.parseEther(amount);
    }

    if (!txOptions.gasLimit) {
      txOptions.gasLimit = ethersUtils.parseUnits(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        CLIENT_OPTIONS.get(this)!.defaultGasLimit,
        'wei',
      );
    }

    if (action === 'estimate') {
      const depositEstimate = await exchangeContract.estimate.depositEther(
        txOptions,
      );
      return depositEstimate as DepositEthResponse<A>;
    }

    const deposit = await exchangeContract.depositEther(txOptions);

    if (!deposit.hash) {
      throw Error('Problem with transaction');
    }

    return deposit as DepositEthResponse<A>;
  }

  /**
   * Deposits an ERC-20 token into the exchange by the given address
   */
  // public async depositToken<A extends RequestType>(
  //   action: A,
  //   token: EthereumTokenDescriptor,
  //   wallet: EthereumWalletConfig,
  //   transaction: TransactionOptions,
  //   onApprove?: (tx: ContractTransaction) => void,
  // ): Promise<DepositTokenResponse<A>> {
  //   console.log(this, {
  //     action,
  //     token,
  //     wallet,
  //     transaction,
  //     onApprove,
  //   });

  //   const amount = transaction.value
  //     ? await transaction.value
  //     : transaction.amount &&
  //       ethersUtils.parseUnits(transaction.amount, token.decimals);

  //   delete txOptions.gasPriceGwei;
  //   delete txOptions.amount;

  //   return null as any;
  // }
}
