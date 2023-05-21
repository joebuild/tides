<script lang="ts">
  import {
    oraclePrices,
    strikePrices,
    callPrices,
    putPrices,
  } from '$src/stores/timestream';
  import { Chart, CandlestickSeries } from 'svelte-lightweight-charts';

  export let optionSide: 'put' | 'call', width: number, height: number;

  let candleSeries = null;

  function handleCandleSeriesReference(ref) {
    candleSeries = ref;
  }

  let candleLegend = 'PRICE';

  function handleCandleCrosshairMove({ detail: param }) {
    if (param.time && param.seriesPrices.get(candleSeries)) {
      const price = param.seriesPrices.get(candleSeries);
      candleLegend =
        'PRICE' +
        '   Open ' +
        price.open.toFixed(4) +
        '   High ' +
        price.high.toFixed(4) +
        '   Low ' +
        price.low.toFixed(4) +
        '   Close ' +
        price.close.toFixed(4);
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
      mode: 1,
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
        on:crosshairMove={handleCandleCrosshairMove}
      >
        <CandlestickSeries
          data={optionSide === 'call' ? $callPrices : $putPrices}
          priceScaleId="left"
          ref={handleCandleSeriesReference}
        />
      </Chart>
      <div class="candle-legend">{candleLegend}</div>
    </div>
  {/key}
{/key}

<style>
  .container {
    position: relative;
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
