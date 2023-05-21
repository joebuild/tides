<script lang="ts">
  import { onMount } from 'svelte';
  import { Panel } from '$lib';
  import { tidesClient } from '$utils/clients';
  import { markets, setMarkets } from '$src/stores/markets';
  import { getTokenBalance } from '$src/utils/tokens';
  import { getAddresses } from '$src/utils/constants';
  import { network } from '$src/stores/network';
  import { getGlobalCollateralVaultTA } from '$src/utils/pda';
  import type { Market, MarketSideData } from '$src/types';

  let tvl = 0;

  onMount(async () => {
    await setMarkets($tidesClient.program);
    let marketsList = (($markets.markets || []) as Market[]).filter(
      x => x.initialized,
    );

    let callCollateralArray = await Promise.all(
      marketsList.map(m =>
        getTokenBalance(
          $tidesClient.provider,
          getAddresses($network).USDC,
          (m.callMarketData as MarketSideData).collateralVault,
        ),
      ),
    );
    let putCollateralArray = await Promise.all(
      marketsList.map(m =>
        getTokenBalance(
          $tidesClient.provider,
          getAddresses($network).USDC,
          (m.putMarketData as MarketSideData).collateralVault,
        ),
      ),
    );

    const [collateralVault] = getGlobalCollateralVaultTA(
      $tidesClient.program.programId,
    );
    const globalCollateral = await getTokenBalance(
      $tidesClient.provider,
      getAddresses($network).USDC,
      collateralVault,
    );

    tvl =
      (callCollateralArray.reduce((acc, x) => acc + x.toNumber(), 0) +
        putCollateralArray.reduce((acc, x) => acc + x.toNumber(), 0) +
        globalCollateral.toNumber()) /
      10 ** 6;
  });
</script>

<div class="flex flex-col gap-2 grow-0 w-56">
  <Panel>
    <!-- <div class="text-center mb-3">
      Platform Stats
    </div> -->
    <div class="stats shadow w-40 p-0 m-0 bg-base-200">
      <div class="stat">
        <div class="stat-title">Tides TVL</div>
        <div class="text-lg">${Math.round(tvl)}</div>
      </div>
    </div>
  </Panel>
</div>
