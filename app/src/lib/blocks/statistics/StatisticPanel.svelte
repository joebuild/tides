<script lang="ts">
  import { Panel } from '$lib';
  import { OptionSide, type Market, type MarketSideData } from '$src/types';
  import { getExposure } from '$src/utils/markets';

  export let title = 'title panel',
    marketsList: Market[],
    collateralArray: number[],
    callOrPut: OptionSide;

  function getOILong(market: Market) {
    const marketSide: MarketSideData =
      callOrPut === OptionSide.Call
        ? market?.callMarketData
        : market?.putMarketData;

    return (
      marketSide.quoteAssetAmountLong.toNumber() /
      10 ** market?.collateralDecimals
    );
  }

  function getOIShort(market: Market) {
    const marketSide: MarketSideData =
      callOrPut === OptionSide.Call
        ? market?.callMarketData
        : market?.putMarketData;

    return (
      marketSide.quoteAssetAmountShort.toNumber() /
      10 ** market?.collateralDecimals
    );
  }

  function getSideExposure(market: Market) {
    const marketSide: MarketSideData =
      callOrPut === OptionSide.Call
        ? market?.callMarketData
        : market?.putMarketData;

    return getExposure(market, marketSide);
  }

  let klass = '';
  export { klass as class };
</script>

<div class={klass}>
  <p class="text-center py-2">{title}</p>
  <Panel class="overflow-x-auto">
    <table class="table table-compact w-full">
      <thead>
        <tr>
          <th class="text-xs">Collateral</th>
          <th class="text-xs">OI Long</th>
          <th class="text-xs">OI Short</th>

          <th class="text-xs">Asset Exposure</th>
          <th class="text-xs">Funding Exposure</th>
          <th class="text-xs">Exposure %</th>
        </tr>
      </thead>
      <tbody>
        {#if marketsList && collateralArray}
          {#each marketsList as market, i}
            <tr>
              <td>
                {(
                  collateralArray[i] /
                  10 ** market?.collateralDecimals
                ).toFixed(2)}
              </td>

              <td>{getOILong(market).toFixed(2)}</td>
              <td>{getOIShort(market).toFixed(2)}</td>

              <td>{getSideExposure(market).assetExposure.toFixed(2)}</td>
              <td>{getSideExposure(market).fundingExposure.toFixed(2)}</td>

              <td
                >{(
                  (100 * getSideExposure(market).totalExposure) /
                  (collateralArray[i] / 10 ** market?.collateralDecimals)
                ).toFixed(2)} %</td
              >
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </Panel>
</div>
