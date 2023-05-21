<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { markets, setMarkets, unsetMarkets } from '$src/stores/markets';
  import { network } from '$src/stores/network';
  import { tidesClient } from '$src/utils/clients';
  import { getAddresses } from '$src/utils/constants';
  import { getTokenBalance } from '$src/utils/tokens';
  import type { Market } from '$src/types';
  import { browser } from '$app/environment';
  import { Panel } from '$lib';
  import { bytesToString } from '$src/utils/misc';
  import { CollateralVaultDepositModal } from '.';

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
    <div class="w-full">
      <p class="text-center py-2">{'Collateral Vaults'}</p>
      <Panel class="overflow-x-auto">
        <table class="table table-compact w-full ">
          <thead>
            <tr>
              <th class="text-xs">Market</th>
              <th class="text-xs">Call Side Collateral</th>
              <th class="text-xs">Put Side Collateral</th>
              <th class="text-xs" />
            </tr>
          </thead>
          <tbody>
            {#if marketsList && callCollateralArray && putCollateralArray}
              {#each marketsList as market, i}
                <tr>
                  <td>{bytesToString(market.symbolQuote)}</td>
                  <td>
                    {(
                      callCollateralArray[i] /
                      10 ** market?.collateralDecimals
                    ).toFixed(2)}
                  </td>
                  <td>
                    {(
                      putCollateralArray[i] /
                      10 ** market?.collateralDecimals
                    ).toFixed(2)}
                  </td>
                  <td>
                    <CollateralVaultDepositModal {market} />
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </Panel>
    </div>
  </div>
{/if}
