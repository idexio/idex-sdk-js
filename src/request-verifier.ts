import { ethers } from 'ethers';

import * as models from './models';

export default class RequestVerifier {
  public static createOrder(request: models.CreateOrderRequest): boolean {
    const hash = models.getOrderHash(
      request.order,
      request.wallet.address,
      request.wallet.nonce,
    );

    return (
      ethers.utils.verifyMessage(hash, request.wallet.signature) ===
      request.wallet.address
    );
  }
}
