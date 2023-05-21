<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Title } from '$lib';
  import {
    DashboardCharts,
    MarketsSidebar,
    MarketStatsHeader,
    Positions,
    UserCollateralPanel,
  } from '$lib/blocks/dashboard';
  import { selectedMarket, setMarkets } from '$src/stores/markets';
  import { tidesClient, timestreamClient } from '$utils/clients';
  import { setFundingData } from '$src/stores/funding';
  import {
    setCallPrices,
    setOraclePrices,
    setPutPrices,
    setStrikePrices,
  } from '$src/stores/timestream';
  import type { MarketSideData } from '$src/types';
  import { dev } from '$app/environment';
  import { bytesToString } from '$src/utils/misc';
  import { network } from '$src/stores/network';

  $: callMarketData = $selectedMarket?.callMarketData as MarketSideData;
  $: putMarketData = $selectedMarket?.putMarketData as MarketSideData;

  $: callMarkPrice = (callMarketData?.markPrice.toNumber() || 0) / decimalScale;
  $: putMarkPrice = (putMarketData?.markPrice.toNumber() || 0) / decimalScale;

  $: decimalScale =
    $selectedMarket.collateralDecimals &&
    10 ** $selectedMarket.collateralDecimals;
  $: assetPrice =
    ($selectedMarket &&
      $selectedMarket?.oraclePrice &&
      $selectedMarket?.oraclePrice.toNumber() / decimalScale) ||
    0;

  onMount(async () => {
    await setMarkets($tidesClient.program);
    await setFundingData($tidesClient.program);

    const quoteSymbol = bytesToString($selectedMarket.symbolQuote);

    setOraclePrices(quoteSymbol, $network, $timestreamClient, assetPrice);
    setStrikePrices(quoteSymbol, $network, $timestreamClient);
    setCallPrices(quoteSymbol, $network, $timestreamClient, callMarkPrice);
    setPutPrices(quoteSymbol, $network, $timestreamClient, putMarkPrice);
  });

  const interval = setInterval(() => {
    setMarkets($tidesClient.program);
    setFundingData($tidesClient.program);

    const quoteSymbol = bytesToString($selectedMarket.symbolQuote);

    setOraclePrices(quoteSymbol, $network, $timestreamClient, assetPrice);
    setStrikePrices(quoteSymbol, $network, $timestreamClient);
    setCallPrices(quoteSymbol, $network, $timestreamClient, callMarkPrice);
    setPutPrices(quoteSymbol, $network, $timestreamClient, putMarkPrice);
  }, 60 * 1000);

  onDestroy(() => clearInterval(interval));
</script>

<Title page="dashboard" />

<div
  class="flex grow justify-between p-2 gap-2 h-max max-h-screen overflow-y-scroll w-full no-scrollbar"
>
  <MarketsSidebar />
  <div class="flex flex-col grow gap-2 w-1/2">
    <MarketStatsHeader />
    <DashboardCharts />
    <div class="flex-1">
      <Positions />
    </div>
  </div>
  <UserCollateralPanel
    hasNetworkSelector={dev}
    hasCollateralAssets
    hasTradePanel
    hasStatsPanel
  />
</div>
