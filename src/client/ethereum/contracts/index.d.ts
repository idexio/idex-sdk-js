import { BigNumberish } from 'ethers';

export class TransactionOverrides {
  nonce?: BigNumberish | Promise<BigNumberish>;

  gasLimit?: BigNumberish | Promise<BigNumberish>;

  gasPrice?: BigNumberish | Promise<BigNumberish>;

  value?: BigNumberish | Promise<BigNumberish>;

  chainId?: number | Promise<number>;
}
