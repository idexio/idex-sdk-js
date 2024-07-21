import typia from 'typia';

import type * as types from '#types/rest/endpoints/index';

/*
  [Typia](https://typia.io)

  These are used for testing validation and will generate optimized validation functions
  at compile time where each fn returns an object which indicates if the input matches
  the type definition with information on errors if it does not.

  {
    success: false,
    errors: [
      { path: '$input[0].quoteBalance', expected: 'string', value: 2 },
      {
        path: '$input[9].positions[0].markPrice',
        expected: 'string',
        value: 2
      }
    ],
    data: undefined
  }

  @Note : Detailed validation such as "uuidv1" checking is possible but not implemented at this
          time

  @see [Special Tags](https://typia.io/docs/validators/tags/)
*/

export const validateRestResponseAssociateWallet =
  typia.createValidateEquals<types.RestResponseAssociateWallet>();

export const validateRestResponseAuthorizePayout =
  typia.createValidateEquals<types.RestResponseAuthorizePayout>();

export const validateRestResponseCancelOrders =
  typia.createValidateEquals<types.RestResponseCancelOrders>();

export const validateRestResponseGetAuthenticationToken =
  typia.createValidateEquals<types.RestResponseGetAuthenticationToken>();

export const validateRestResponseGetCandles =
  typia.createValidateEquals<types.RestResponseGetCandles>();

// export const validateRestResponseGetDeposit =
//   typia.createValidateEquals<types.RestResponseGetDeposit>();

export const validateRestResponseGetDeposits =
  typia.createValidateEquals<types.RestResponseGetDeposits>();

export const validateRestResponseGetExchange =
  typia.createValidateEquals<types.RestResponseGetExchange>();

// export const validateRestResponseGetFill =
//   typia.createValidateEquals<types.RestResponseGetFill>();

export const validateRestResponseGetFills =
  typia.createValidateEquals<types.RestResponseGetFills>();

export const validateRestResponseGetFundingPayments =
  typia.createValidateEquals<types.RestResponseGetFundingPayments>();

export const validateRestResponseGetFundingRates =
  typia.createValidateEquals<types.RestResponseGetFundingRates>();

export const validateRestResponseGetGasFees =
  typia.createValidateEquals<types.RestResponseGetGasFees>();

export const validateRestResponseGetHistoricalPnL =
  typia.createValidateEquals<types.RestResponseGetHistoricalPnL>();

export const validateRestResponseGetLeverage =
  typia.createValidateEquals<types.RestResponseGetLeverage>();

export const validateRestResponseGetLiquidations =
  typia.createValidateEquals<types.RestResponseGetLiquidations>();

// export const validateRestResponseGetMarketMakerRewardsEpoch =
//   typia.createValidateEquals<types.RestResponseGetMarketMakerRewardsEpoch>();

export const validateRestResponseGetMarketMakerRewardsEpochs =
  typia.createValidateEquals<types.RestResponseGetMarketMakerRewardsEpochs>();

export const validateRestResponseGetMarkets =
  typia.createValidateEquals<types.RestResponseGetMarkets>();

export const validateRestResponseGetOrders =
  typia.createValidateEquals<types.RestResponseGetOrders>();

export const validateRestResponseGetOrderBookLevel1 =
  typia.createValidateEquals<types.RestResponseGetOrderBookLevel1>();

export const validateRestResponseGetOrderBookLevel2 =
  typia.createValidateEquals<types.RestResponseGetOrderBookLevel2>();

export const validateRestResponseGetPayouts =
  typia.createValidateEquals<types.RestResponseGetPayouts>();

// export const validateRestResponseGetPing =
// typia.createValidateEquals<types.RestResponseGetPing>();

export const validateRestResponseGetPositions =
  typia.createValidateEquals<types.RestResponseGetPositions>();

export const validateRestResponseGetTickers =
  typia.createValidateEquals<types.RestResponseGetTickers>();

export const validateRestResponseGetTrades =
  typia.createValidateEquals<types.RestResponseGetTrades>();

export const validateRestResponseGetWallets =
  typia.createValidateEquals<types.RestResponseGetWallets>();

// export const validateRestResponseGetWithdrawal =
// typia.createValidateEquals<types.RestResponseGetWithdrawal>();

export const validateRestResponseGetWithdrawals =
  typia.createValidateEquals<types.RestResponseGetWithdrawals>();

export const validateRestResponseSetLeverage =
  typia.createValidateEquals<types.RestResponseSetLeverage>();

export const validateRestResponseWithdrawFunds =
  typia.createValidateEquals<types.RestResponseWithdrawFunds>();
