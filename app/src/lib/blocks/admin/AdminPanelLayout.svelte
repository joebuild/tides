<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { AdminPanel, MarketPanel } from '$lib/blocks/admin';
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

  export let amount = 0;

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
    <AdminPanel
      class="w-2/5"
      {marketsList}
      title="Call"
      collateralArray={callCollateralArray}
      callOrPut={OptionSide.Call}
      {amount}
    />
    <AdminPanel
      class="w-2/5"
      {marketsList}
      title="Put"
      collateralArray={putCollateralArray}
      callOrPut={OptionSide.Put}
      {amount}
    />
  </div>
{/if}
