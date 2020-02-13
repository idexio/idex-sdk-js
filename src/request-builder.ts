import { ethers } from 'ethers';
import { v1 as uuidv1 } from 'uuid';

import * as models from './models';

export default class RequestBuilder {
  private wallet: ethers.Wallet;

  public constructor(wallet: ethers.Wallet) {
    this.wallet = wallet;
  }

  public async createOrder(order: models.Order) {
    const nonce = uuidv1();
    return {
      order,
      wallet: {
        address: this.wallet.address,
        nonce,
        signature: await this.wallet.signMessage(
          models.getOrderHash(order, this.wallet.address, nonce),
        ),
      },
    };
  }
}
