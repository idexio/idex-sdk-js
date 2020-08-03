// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.8;
pragma experimental ABIEncoderV2;

import { ECDSA } from '@openzeppelin/contracts/cryptography/ECDSA.sol';

import { Enums, Structs } from './Interfaces.sol';


/**
 * @notice Enums used in `Withdrawal` struct
 */
contract Enums {
  enum WithdrawalType { BySymbol, ByAddress }
}


/**
 * @notice Struct definitions
 */
contract Structs {
  /**
   * @notice Argument type for `Exchange.executeTrade` and `Signatures.getOrderWalletHash`
   */
  struct Order {
    // Not currently used but reserved for future use. Must be 1
    uint8 signatureHashVersion;
    // UUIDv1 unique to wallet
    uint128 nonce;
    // Wallet address that placed order and signed hash
    address walletAddress;
    // Type of order
    Enums.OrderType orderType;
    // Order side wallet is on
    Enums.OrderSide side;
    // Order quantity in base asset terms
    uint64 quantityInPips;
    // Order quantity in quote asset terms
    uint64 quoteOrderQuantityInPips;
    // For limit orders, price in decimal pips * 10^8 in quote terms
    uint64 limitPriceInPips;
    // For stop orders, stop loss or take profit price in decimal pips * 10^8 in quote terms
    uint64 stopPriceInPips;
    // Optional custom client order ID
    string clientOrderId;
    // TIF option specified by wallet for order
    Enums.OrderTimeInForce timeInForce;
    // STP behavior specified by wallet for order
    Enums.OrderSelfTradePrevention selfTradePrevention;
    // Cancellation time specified by wallet for GTT TIF order
    uint64 cancelAfter;
    // The ECDSA signature of the order hash as produced by Signatures.getOrderWalletHash
    bytes walletSignature;
  }

  /**
   * @notice Argument type for `Exchange.withdraw` and `Signatures.getWithdrawalWalletHash`
   */
  struct Withdrawal {
    // Distinguishes between withdrawals by asset symbol or address
    Enums.WithdrawalType withdrawalType;
    // UUIDv1 unique to wallet
    uint128 nonce;
    // Address of wallet to which funds will be returned
    address payable walletAddress;
    // Asset symbol
    string assetSymbol;
    // Asset address
    address assetAddress; // Used when assetSymbol not specified
    // Withdrawal quantity
    uint64 quantityInPips;
    // Gas fee deducted from withdrawn quantity to cover dispatcher tx costs
    uint64 gasFeeInPips;
    // Not currently used but reserved for future use. Must be true
    bool autoDispatchEnabled;
    // The ECDSA signature of the withdrawal hash as produced by Signatures.getWithdrawalWalletHash
    bytes walletSignature;
  }
}


/**
 * Library helpers for building hashes and verifying wallet signatures on `Order` and `Withdrawal` structs
 */
library Signatures {
  function isSignatureValid(
    bytes32 hash,
    bytes memory signature,
    address signer
  ) internal pure returns (bool) {
    return
      ECDSA.recover(ECDSA.toEthSignedMessageHash(hash), signature) == signer;
  }

  function getOrderWalletHash(
    Structs.Order memory order,
    string memory baseSymbol,
    string memory quoteSymbol
  ) internal pure returns (bytes32) {
    require(
      order.signatureHashVersion == 1,
      'Signature hash version must be 1'
    );
    return
      keccak256(
        // Placing all the fields in a single `abi.encodePacked` call causes a `stack too deep` error
        abi.encodePacked(
          abi.encodePacked(
            order.signatureHashVersion,
            order.nonce,
            order.walletAddress,
            getMarketSymbol(baseSymbol, quoteSymbol),
            uint8(order.orderType),
            uint8(order.side),
            // Ledger qtys and prices are in pip, but order was signed by wallet owner with decimal values
            order.quantityInPips > 0 ? pipToDecimal(order.quantityInPips) : ''
          ),
          abi.encodePacked(
            order.quoteOrderQuantityInPips > 0
              ? pipToDecimal(order.quoteOrderQuantityInPips)
              : '',
            order.limitPriceInPips > 0
              ? pipToDecimal(order.limitPriceInPips)
              : '',
            order.stopPriceInPips > 0
              ? pipToDecimal(order.stopPriceInPips)
              : '',
            order.clientOrderId,
            uint8(order.timeInForce),
            uint8(order.selfTradePrevention),
            order.cancelAfter
          )
        )
      );
  }

  function getWithdrawalWalletHash(Structs.Withdrawal memory withdrawal)
    internal
    pure
    returns (bytes32)
  {
    return
      keccak256(
        abi.encodePacked(
          withdrawal.nonce,
          withdrawal.walletAddress,
          // Ternary branches must resolve to the same type, so wrap in idempotent encodePacked
          withdrawal.withdrawalType == Enums.WithdrawalType.BySymbol
            ? abi.encodePacked(withdrawal.assetSymbol)
            : abi.encodePacked(withdrawal.assetAddress),
          pipToDecimal(withdrawal.quantityInPips),
          withdrawal.autoDispatchEnabled
        )
      );
  }

  /**
   * @dev Combines base and quote asset symbols into the market symbol originally signed by the
   * wallet. For example if base is 'IDEX' and quote is 'ETH', the resulting market symbol is
   * 'IDEX-ETH'. This approach is used rather than passing in the market symbol and splitting it
   * since the latter incurs a higher gas cost
   */
  function getMarketSymbol(string memory baseSymbol, string memory quoteSymbol)
    private
    pure
    returns (string memory)
  {
    bytes memory baseSymbolBytes = bytes(baseSymbol);
    bytes memory hyphenBytes = bytes('-');
    bytes memory quoteSymbolBytes = bytes(quoteSymbol);

    bytes memory marketSymbolBytes = bytes(
      new string(
        baseSymbolBytes.length + quoteSymbolBytes.length + hyphenBytes.length
      )
    );

    uint256 i;
    uint256 j;

    for (i = 0; i < baseSymbolBytes.length; i++) {
      marketSymbolBytes[j++] = baseSymbolBytes[i];
    }

    // Hyphen is one byte
    marketSymbolBytes[j++] = hyphenBytes[0];

    for (i = 0; i < quoteSymbolBytes.length; i++) {
      marketSymbolBytes[j++] = quoteSymbolBytes[i];
    }

    return string(marketSymbolBytes);
  }

  /**
   * @dev Converts an integer pip quantity back into the fixed-precision decimal pip string
   * originally signed by the wallet. For example, 1234567890 becomes '12.34567890'
   */
  function pipToDecimal(uint256 pips) private pure returns (string memory) {
    // Inspired by https://github.com/provable-things/ethereum-api/blob/831f4123816f7a3e57ebea171a3cdcf3b528e475/oraclizeAPI_0.5.sol#L1045-L1062
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
            ? abi.encodePacked(withdrawal.assetSymbol)
            : abi.encodePacked(withdrawal.assetAddress),
          pipToDecimal(withdrawal.quantityInPips),
          withdrawal.autoDispatchEnabled
        )
      );
  }

  /**
   * @dev Combines base and quote asset symbols into the market symbol originally signed by the
   * wallet. For example if base is 'IDEX' and quote is 'ETH', the resulting market symbol is
   * 'IDEX-ETH'. This approach is used rather than passing in the market symbol and splitting it
   * since the latter incurs a higher gas cost
   */
  function getMarketSymbol(string memory baseSymbol, string memory quoteSymbol)
    private
    pure
    returns (string memory)
  {
    bytes memory baseSymbolBytes = bytes(baseSymbol);
    bytes memory hyphenBytes = bytes('-');
    bytes memory quoteSymbolBytes = bytes(quoteSymbol);

    bytes memory marketSymbolBytes = bytes(
      new string(
        baseSymbolBytes.length + quoteSymbolBytes.length + hyphenBytes.length
      )
    );

    uint256 i;
    uint256 j;

    for (i = 0; i < baseSymbolBytes.length; i++) {
      marketSymbolBytes[j++] = baseSymbolBytes[i];
    }

    // Hyphen is one byte
    marketSymbolBytes[j++] = hyphenBytes[0];

    for (i = 0; i < quoteSymbolBytes.length; i++) {
      marketSymbolBytes[j++] = quoteSymbolBytes[i];
    }

    return string(marketSymbolBytes);
  }

  /**
   * @dev Converts an integer pip quantity back into the fixed-precision decimal pip string
   * originally signed by the wallet. For example, 1234567890 becomes '12.34567890'
   */
  function pipToDecimal(uint256 pips) private pure returns (string memory) {
    // Inspired by https://github.com/provable-things/ethereum-api/blob/831f4123816f7a3e57ebea171a3cdcf3b528e475/oraclizeAPI_0.5.sol#L1045-L1062
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
