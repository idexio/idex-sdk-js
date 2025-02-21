import * as factories from '#typechain-types/factories/index';

/**
 * A typechain factory for interacting with Kuma's Earnings Escrow contract.
 *
 * @category Smart Contracts
 */
export const EarningsEscrowContract =
  factories.contracts.EarningsEscrow__factory;

/**
 * A typechain factory for interacting with Kuma's Exchange v1 contract.
 *
 * @category Smart Contracts
 */
export const Exchangev1Contract =
  factories.contracts.exchangeSol.Exchange_v1__factory;

/**
 * A typechain factory for interacting with ERC20 contracts.
 *
 * @category Smart Contracts
 */
export const ERC20Contract =
  factories.openzeppelin.contracts.token.erc20.ERC20__factory;
