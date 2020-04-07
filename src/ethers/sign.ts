import { ethers } from 'ethers';

export const getPrivateKeySigner = (walletPrivateKey: string) => (
  hashToSign: string,
): Promise<string> =>
  new ethers.Wallet(walletPrivateKey).signMessage(
    ethers.utils.arrayify(hashToSign),
  );
