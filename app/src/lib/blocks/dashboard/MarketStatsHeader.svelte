<script lang="ts">
  import { Panel } from '$lib';
  import { MarketStat } from '$lib/blocks/dashboard';
  import { selectedMarket } from '$src/stores/markets';
  import { getOptionSideFromData, getPayoff } from '$src/utils/markets';
  import type { MarketSideData } from '$src/types';
  import { bytesToString } from '$src/utils/misc';

  $: symbol =
    $selectedMarket &&
    $selectedMarket.symbolQuote &&
    bytesToString($selectedMarket.symbolQuote);

  $: decimalScale =
    $selectedMarket.collateralDecimals &&
    10 ** $selectedMarket.collateralDecimals;

  $: callMarketData = $selectedMarket?.callMarketData as MarketSideData;
  $: putMarketData = $selectedMarket?.putMarketData as MarketSideData;

  $: assetPrice =
    ($selectedMarket &&
      $selectedMarket?.oraclePrice &&
      $selectedMarket?.oraclePrice.toNumber() / decimalScale) ||
    0;
  $: strikePrice =
    ($selectedMarket &&
      $selectedMarket?.emaNumeratorSum &&
      $selectedMarket?.emaNumeratorSum
        .div($selectedMarket?.emaDenominatorSum)
        .toNumber() / decimalScale) ||
    0;

  $: callMarkPrice = (callMarketData?.markPrice.toNumber() || 0) / decimalScale;
  $: putMarkPrice = (putMarketData?.markPrice.toNumber() || 0) / decimalScale;

  $: callFundingFee =
    callMarketData?.fundingRate.toNumber() / decimalScale || 0;
  $: putFundingFee = putMarketData?.fundingRate.toNumber() / decimalScale || 0;

  $: callImpliedVol =
    (callMarketData?.markVolatility.toNumber() / decimalScale) * 365 ** 0.5 ||
    0;
  $: putImpliedVol =
    (putMarketData?.markVolatility.toNumber() / decimalScale) * 365 ** 0.5 || 0;

  $: callEstNextFundingFee =
    (callMarketData && estNextFundingFee(callMarketData)) || 0;
  $: putEstNextFundingFee =
    (putMarketData && estNextFundingFee(putMarketData)) || 0;

  $: callDailyFunding =
    Math.sign(callEstNextFundingFee) *
    ((Math.abs(callEstNextFundingFee) * 100 * 100) / callMarkPrice); // *100 for funding frequency, *100 to turn into a percent
  $: putDailyFunding =
    Math.sign(putEstNextFundingFee) *
    ((Math.abs(putEstNextFundingFee) * 100 * 100) / putMarkPrice); // *100 for funding frequency, *100 to turn into a percent

  $: callPayoff = Math.max(assetPrice - strikePrice, 0);
  $: putPayoff = Math.max(strikePrice - assetPrice, 0);

  // $: callOILong = (callMarketData?.quoteAssetAmountLong || 0) / decimalScale
  // $: callOIShort = (callMarketData?.quoteAssetAmountShort || 0) / decimalScale

  // $: putOILong = (putMarketData?.quoteAssetAmountLong || 0) / decimalScale
  // $: putOIShort = (putMarketData?.quoteAssetAmountShort || 0) / decimalScale

  function dailyFundingReadable(apr: number): string {
    if (apr > 1000) {
      return '> +1000.0';
    } else if (apr < -1000) {
      return '< -1000.0';
    } else {
      return apr.toFixed(2);
    }
  }

  function estNextFundingFee(marketSideData: MarketSideData): number {
    const payoff = getPayoff(
      getOptionSideFromData(marketSideData.side),
      assetPrice,
      strikePrice,
    );
    const mark =
      marketSideData.markPrice.toNumber() /
      10 ** $selectedMarket.collateralDecimals;
    return (mark - payoff) / 100;
  }
</script>

<div class="w-full gap-2">
  <div class="flex gap-2">
    <Panel class="flex flex-col grid justify-items-center gap-1 px-6 w-36">
      <div class="">
        {symbol}
      </div>
      <MarketStat label={'Price'} stat={assetPrice.toFixed(4)} />
      <MarketStat label={'Strike'} stat={strikePrice.toFixed(4)} />
    </Panel>
    <div class="flex flex-col grow gap-2">
      <Panel class="">
        <div class="flex justify-between items-center gap-3">
          <div class="w-8">Call</div>
          <MarketStat label={'Mark Price'} stat={callMarkPrice.toFixed(6)} />
          <MarketStat label={'Payoff'} stat={callPayoff.toFixed(6)} />
          <MarketStat
            label={'Implied Vol.'}
            stat={callImpliedVol.toFixed(2)}
            suffix=" %"
          />
          <MarketStat
            label={'Current Funding Fee'}
            stat={callFundingFee.toFixed(6)}
          />
          <!-- <div class="tooltip tooltip-bottom z-40" data-tip="Every 864 seconds (14.4 min)"> -->
          <MarketStat
            label={'Est. Next Funding Fee'}
            stat={callEstNextFundingFee.toFixed(6)}
          />
          <!-- </div> -->
          <MarketStat
            label={'Est. Funding % 24 hr'}
            stat={dailyFundingReadable(callDailyFunding)}
            suffix=" %"
          />
          <!-- <MarketStat
                        label={"OI Long"}
                        stat={callOILong.toFixed(2)}
                    />
                    <MarketStat
                        label={"OI Short"}
                        stat={callOIShort.toFixed(2)}
                    /> -->
        </div>
      </Panel>
      <Panel class="">
        <div class="flex justify-between items-center gap-2">
          <div class="w-8">Put</div>
          <MarketStat label={'Mark Price'} stat={putMarkPrice.toFixed(6)} />
          <MarketStat label={'Payoff'} stat={putPayoff.toFixed(6)} />
          <MarketStat
            label={'Implied Vol.'}
            stat={putImpliedVol.toFixed(2)}
            suffix=" %"
          />
          <MarketStat
            label={'Current Funding Fee'}
            stat={putFundingFee.toFixed(6)}
          />
          <!-- <div class="tooltip tooltip-bottom z-40" data-tip="Every 864 seconds (14.4 min)"> -->
          <MarketStat
            label={'Est. Next Funding Fee'}
            stat={putEstNextFundingFee.toFixed(6)}
          />
          <!-- </div> -->
          <MarketStat
            label={'Est. Funding % 24 hr'}
            stat={dailyFundingReadable(putDailyFunding)}
            suffix=" %"
          />
          <!-- <MarketStat
                        label={"OI Long"}
                        stat={putOILong.toFixed(2)}
                    />
                    <MarketStat
                        label={"OI Short"}
                        stat={putOIShort.toFixed(2)}
                    /> -->
        </div>
      </Panel>
    </div>
  </div>
</div>
