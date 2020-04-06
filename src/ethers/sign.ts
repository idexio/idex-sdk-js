import { ethers } from 'ethers';

export const signHashWithPrivateKey = (
  walletPrivateKey: string,
  hashToSign: string,
): Promise<string> =>
  new ethers.Wallet(walletPrivateKey).signMessage(
    ethers.utils.arrayify(hashToSign),
  );
