<script lang="ts">
  import { onMount } from 'svelte';
  import { Panel } from '$lib';
  import {
    AssetStrikePriceChart,
    OptionPriceChart,
  } from '$lib/blocks/dashboard';
  import Chart from 'svelte-frappe-charts';
  import { fundingData } from '$src/stores/funding';
  import type { FundingRecord, FundingRecordsTier, Point } from '$src/types';
  import { selectedMarket } from '$src/stores/markets';

  const height = 425; // This is the fixed height for charts

  let chartSelection = 'asset-strike';
  let innerWidth = 0;
  let innerHeight = 0;
  let days = '1';
  let side: OptionPriceChart['$$prop_def']['optionSide'] = 'call';
  let chartContainer: HTMLDivElement;
  let chartContainerWidth: number;

  onMount(() => {
    defineChartContainerWidth();
  });

  $: marketFundingData = $selectedMarket && $fundingData[$selectedMarket.index];
  $: fundingDataSelection =
    side === 'call'
      ? marketFundingData?.callFunding
      : marketFundingData?.putFunding;

  $: tierSelection =
    days === '1'
      ? fundingDataSelection?.fundingRecordsTier0
      : days === '10'
      ? fundingDataSelection?.fundingRecordsTier1
      : fundingDataSelection?.fundingRecordsTier2;

  function getSeriesFromFundingTier(fundingTier: FundingRecordsTier): Point[] {
    const records = fundingTier.fundingRecords as FundingRecord[];
    return records
      .filter(x => x.startTs.toNumber() > 0)
      .sort((a, b) => (a.startTs.toNumber() > b.startTs.toNumber() ? 1 : -1))
      .map(x => {
        return {
          label: new Date(x.startTs.toNumber() * 1000).toLocaleString(),
          value: x.fundingRate.toNumber() / 10 ** 6,
        };
      });
  }

  $: callTier0 = marketFundingData && getSeriesFromFundingTier(tierSelection);

  $: fundingChartData = marketFundingData && {
    labels: callTier0.map(x => x.label),
    datasets: [
      {
        values: callTier0.map(x => x.value),
      },
    ],
  };

  function defineChartContainerWidth() {
    chartContainerWidth = chartContainer.clientWidth;
  }
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight
  on:resize={defineChartContainerWidth}
/>

<Panel>
  <div class="flex flex-row justify-between mb-3">
    <div class="flex flex-row gap-2">
      <button
        class="h-auto btn btn-xs capitalize {chartSelection !== 'asset-strike'
          ? 'btn-outline'
          : 'btn-active'}"
        on:click={() => (chartSelection = 'asset-strike')}
      >
        Asset/Strike Prices
      </button>
      <button
        class="h-auto btn btn-xs capitalize {chartSelection !== 'option'
          ? 'btn-outline'
          : 'btn-active'}"
        on:click={() => (chartSelection = 'option')}
      >
        Option Prices
      </button>
      <button
        class="h-auto btn btn-xs capitalize {chartSelection !== 'funding'
          ? 'btn-outline'
          : 'btn-active'}"
        on:click={() => (chartSelection = 'funding')}
      >
        Funding Rates
      </button>
    </div>
    <div class="flex flex-row gap-2">
      <!-- <button
                        class="h-auto btn btn-xs capitalize {days !== '1' ? "btn-outline" : "btn-active"}" selected
                        on:click={() => days = '1'}
                    >
                        1D
                    </button>
                    <button
                        class="h-auto btn btn-xs capitalize {days !== '10' ? "btn-outline" : "btn-active"}"
                        on:click={() => days = '10'}
                    >
                        10D
                    </button>
                    <button
                        class="h-auto btn btn-xs capitalize {days !== '100' ? "btn-outline" : "btn-active"}"
                        on:click={() => days = '100'}
                    >
                        100D
                    </button>
                    <div class="mx-5"></div> -->
      {#if chartSelection === 'funding' || chartSelection === 'option'}
        <button
          class="h-auto btn btn-xs capitalize {side !== 'call'
            ? 'btn-outline'
            : 'btn-active'}"
          on:click={() => (side = 'call')}
        >
          Call
        </button>
        <button
          class="h-auto btn btn-xs capitalize {side !== 'put'
            ? 'btn-outline'
            : 'btn-active'}"
          on:click={() => (side = 'put')}
        >
          Put
        </button>
      {/if}
    </div>
  </div>

  <div bind:this={chartContainer}>
    {#key $selectedMarket.index}
      {#if chartSelection === 'asset-strike'}
        <AssetStrikePriceChart width={chartContainerWidth} {height} />
      {:else if chartSelection === 'option'}
        {#key side}
          <OptionPriceChart
            optionSide={side}
            width={chartContainerWidth}
            {height}
          />
        {/key}
      {:else if marketFundingData}
        <Chart
          data={fundingChartData}
          type="bar"
          barOptions={{ spaceRatio: '0.1' }}
          axisOptions={{ xIsSeries: 1, xAxisMode: 'tick' }}
          animate={false}
          width={chartContainerWidth}
          {height}
        />
      {:else}
        <div class="h-full" />
      {/if}
    {/key}
  </div>
</Panel>
