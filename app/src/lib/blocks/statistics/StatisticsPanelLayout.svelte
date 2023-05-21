<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { StatisticPanel, MarketPanel } from '$lib/blocks/statistics';
  import { markets, setMarkets, unsetMarkets } from '$src/stores/markets';
  import { network } from '$src/stores/network';
  import { tidesClient } from '$src/utils/clients';
  import { getAddresses } from '$src/utils/constants';
  import { getTokenBalance } from '$src/utils/tokens';
  import { OptionSide, type Market } from '$src/types';
  import { browser } from '$app/environment';

  let marketsList;
  let putCollateralArray;
  let callCollateralArray;

  onMount(async () => {
    await setMarkets($tidesClient.program);
    defineMarketsData($markets);
  });

  $: browser && Object.keys($markets).length > 0 && defineMarketsData($markets);

  async function defineMarketsData(markets) {
    marketsList = ((markets.markets || []) as Market[]).filter(
      x => x.initialized,
    );
    callCollateralArray = await Promise.all(
      marketsList.map(m =>
        getTokenBalance(
          $tidesClient.provider,
          getAddresses($network).USDC,
          m.callMarketData.collateralVault,
        ),
      ),
    );
    putCollateralArray = await Promise.all(
      marketsList.map(m =>
        getTokenBalance(
          $tidesClient.provider,
          getAddresses($network).USDC,
          m.putMarketData.collateralVault,
        ),
      ),
    );
  }

  onDestroy(async () => {
    await unsetMarkets($tidesClient.program);
  });
</script>

{#if marketsList}
  <div class="flex gap-2">
    <MarketPanel {marketsList} class="w-1/5" title="Market" />
    <StatisticPanel
      class="w-2/5"
      {marketsList}
      title="Call"
      collateralArray={callCollateralArray}
      callOrPut={OptionSide.Call}
    />
    <StatisticPanel
      class="w-2/5"
      {marketsList}
      title="Put"
      collateralArray={putCollateralArray}
      callOrPut={OptionSide.Put}
    />
  </div>
{/if}
