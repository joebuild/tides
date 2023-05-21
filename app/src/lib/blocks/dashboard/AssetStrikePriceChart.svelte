<script lang="ts">
  import { oraclePrices, strikePrices } from '$src/stores/timestream';
  import {
    Chart,
    CandlestickSeries,
    LineSeries,
  } from 'svelte-lightweight-charts';

  export let width: number, height: number;

  let lineSeries = null;
  let candleSeries = null;

  function handleLineSeriesReference(ref) {
    lineSeries = ref;
  }

  function handleCandleSeriesReference(ref) {
    candleSeries = ref;
  }

  let strikeLegend = 'STRIKE';
  let candleLegend = 'PRICE';

  function handleStrikeCrosshairMove({ detail: param }) {
    if (param.time && param.seriesPrices.get(lineSeries)) {
      const price = param.seriesPrices.get(lineSeries);
      strikeLegend = 'STRIKE' + '  ' + (price && price.toFixed(2));
    } else {
      strikeLegend = 'STRIKE';
    }
  }

  function handleCandleCrosshairMove({ detail: param }) {
    if (param.time && param.seriesPrices.get(candleSeries)) {
      const price = param.seriesPrices.get(candleSeries);
      candleLegend =
        'PRICE' +
        '   Open ' +
        price.open.toFixed(2) +
        '   High ' +
        price.high.toFixed(2) +
        '   Low ' +
        price.low.toFixed(2) +
        '   Close ' +
        price.close.toFixed(2);
    } else {
      candleLegend = 'PRICE';
    }
  }

  $: options = {
    rightPriceScale: {
      visible: false,
      borderColor: 'rgba(116, 119, 127, 1)',
    },
    leftPriceScale: {
      visible: true,
      borderColor: 'rgba(116, 119, 127, 1)',
    },
    layout: {
      backgroundColor: '#0e1525',
      textColor: 'rgba(179, 197, 239, 1)',
    },
    grid: {
      horzLines: {
        visible: false,
      },
      vertLines: {
        visible: false,
      },
    },
    timeScale: {
      borderColor: 'rgba(116, 119, 127, 1)',
      timeVisible: true,
      secondsVisible: true,
    },
    handleScroll: {
      vertTouchDrag: false,
    },
  };
</script>

{#key $strikePrices}
  {#key $oraclePrices}
    <div class="container">
      <Chart
        {width}
        {height}
        {...options}
        on:crosshairMove={handleStrikeCrosshairMove}
        on:crosshairMove={handleCandleCrosshairMove}
      >
        <LineSeries
          data={$strikePrices}
          priceScaleId="left"
          color="rgba(4, 111, 232, 1)"
          lineWidth={2}
          ref={handleLineSeriesReference}
        />
        <CandlestickSeries
          data={$oraclePrices}
          priceScaleId="left"
          ref={handleCandleSeriesReference}
        />
      </Chart>
      <div class="strike-legend">{strikeLegend}</div>
      <div class="candle-legend">{candleLegend}</div>
    </div>
  {/key}
{/key}

<style>
  .container {
    position: relative;
  }

  .strike-legend {
    position: absolute;
    color: rgb(63, 116, 250);
    left: 60px;
    top: 26px;
    z-index: 1;
    font-size: 12px;
    line-height: 18px;
    font-weight: 300;
  }

  .candle-legend {
    position: absolute;
    color: rgb(232, 229, 255);
    left: 60px;
    top: 12px;
    z-index: 1;
    font-size: 12px;
    line-height: 18px;
    font-weight: 300;
  }
</style>
