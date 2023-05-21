<script lang="ts">
  import Chart from 'svelte-frappe-charts';
  import { fundingData } from '$src/stores/funding';
  import type { FundingRecord, FundingRecordsTier, Point } from '$src/types';

  export let marketIndex = 0;

  let days = '1';
  let side = 'call';
  let innerWidth = 0;
  let innerHeight = 0;

  $: dimensionSum = innerWidth + innerHeight;
  $: marketFundingData = $fundingData[marketIndex];
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
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div class="flex flex-row justify-between h-fit">
  <div class="text-left ml-2">Funding Rates</div>
  <div class="capitalize">
    {side} - {days} Day
  </div>
  <div class="flex flex-row gap-2">
    <button
      class="h-auto btn btn-xs capitalize {side !== 'call'
        ? 'btn-outline'
        : ''}"
      on:click={() => (side = 'call')}
    >
      Call
    </button>
    <button
      class="h-auto btn btn-xs capitalize {side !== 'put' ? 'btn-outline' : ''}"
      on:click={() => (side = 'put')}
    >
      Put
    </button>
    <div class="mx-5" />
    <button
      class="h-auto btn btn-xs capitalize {days !== '1' ? 'btn-outline' : ''}"
      selected
      on:click={() => (days = '1')}
    >
      1D
    </button>
    <button
      class="h-auto btn btn-xs capitalize {days !== '10' ? 'btn-outline' : ''}"
      on:click={() => (days = '10')}
    >
      10D
    </button>
    <button
      class="h-auto btn btn-xs capitalize {days !== '100' ? 'btn-outline' : ''}"
      on:click={() => (days = '100')}
    >
      100D
    </button>
  </div>
</div>

{#if marketFundingData}
  {#key dimensionSum}
    <Chart
      data={fundingChartData}
      type="bar"
      barOptions={{ spaceRatio: '0.1' }}
      axisOptions={{ xIsSeries: 1, xAxisMode: 'tick' }}
      height={425}
    />
  {/key}
{:else}
  <div class="h-full" />
{/if}
