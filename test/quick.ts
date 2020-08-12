import { v1 } from 'uuid';
import { ethers } from 'ethers';
import {
  RestAuthenticatedClient,
  createAssociateWalletSignature,
} from '../src';

export async function runQuick() {
  const nonce = 'e10dfbe0-db53-11ea-b362-996ab079425a';
  const wallet = '0xA71C4aeeAabBBB8D2910F41C2ca3964b81F7310d';
  const formattedNonce = `0x${nonce.replace(/-/g, '')}`;
  const nonceAsByteArray = ethers.utils.arrayify(formattedNonce);

  const hash = createAssociateWalletSignature({
    nonce,
    wallet,
  });

  console.log({
    endpoint: '/v1/associate',
    request: {
      nonce,
      wallet,
    },
    formattedNonce,
    nonceAsByteArray,
    nonceAsInt: BigInt(formattedNonce).toString(10),
    hash,
  });

  console.log({
    parameters: {
      nonce,
      wallet,
    },
    signature: hash,
  });
}

runQuick();
