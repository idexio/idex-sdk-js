pragma solidity ^0.6.1;
pragma experimental ABIEncoderV2;

import {ECRecovery} from './ECRecovery.sol';

library SignatureVerifier {
  enum OrderSide {Buy, Sell}
  enum OrderType {Limit, Market, StopLimit}

  struct Order {
    uint128 orderId;
    OrderSide side;
    OrderType orderType;
    address walletAddress;
    address baseAssetAddress;
    address quoteAssetAddress;
    uint128 nonce;
    uint64 totalQuantity; // pips
    uint64 limitPrice; // decimal pips * 10^8
    uint64 stopPrice; // decimal pips * 10^8
  }

  function validateOrderSignature(
    Order memory order,
    string memory marketSymbol,
    bytes memory signature
  ) public pure {
    require(
      ECRecovery.isSignatureValid(
        getOrderWalletHash(order, marketSymbol),
        signature,
        order.walletAddress
      ),
      'Invalid wallet signature'
    );
  }

  function getOrderWalletHash(Order memory order, string memory orderMarketSymbol)
    private
    pure
    returns (bytes32)
  {
    return
      keccak256(
        abi.encodePacked(
          abi.encodePacked(
            orderMarketSymbol,
            uint8(order.side),
            uint8(order.orderType),
            order.baseAssetAddress,
            order.quoteAssetAddress
          ),
          abi.encodePacked(
            // Ledger qtys and prices are in pip, but order was signed by wallet owner with decimal values
            pipToDecimal(order.totalQuantity),
            order.limitPrice > 0 ? pipToDecimal(order.limitPrice) : '',
            order.stopPrice > 0 ? pipToDecimal(order.stopPrice) : '',
            order.walletAddress,
            order.nonce
          )
        )
      );
  }

  // Inspired by https://github.com/provable-things/ethereum-api/blob/831f4123816f7a3e57ebea171a3cdcf3b528e475/oraclizeAPI_0.5.sol#L1045-L1062
  function pipToDecimal(uint256 pips) private pure returns (string memory) {
    uint256 copy = pips;
    uint256 length;
    while (copy != 0) {
      length++;
      copy /= 10;
    }
    if (length < 9) {
      length = 9; // a zero before the decimal point plus 8 decimals
    }
    length++; // for the decimal point
    bytes memory decimal = new bytes(length);
    for (uint256 i = length; i > 0; i--) {
      if (length - i == 8) {
        decimal[i - 1] = bytes1(uint8(46)); // period
      } else {
        decimal[i - 1] = bytes1(uint8(48 + (pips % 10)));
        pips /= 10;
      }
    }
    return string(decimal);
  }
}
