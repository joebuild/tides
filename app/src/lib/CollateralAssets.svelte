<script lang="ts">
  import { page } from '$app/stores';
  import { DepositModal, WithdrawModal } from '$lib/blocks/dashboard';
  import { Panel } from '$lib';
  import { userData } from '$src/stores/user';
  import { markets } from '$src/stores/markets';
  import { positions } from '$src/stores/positions';
  import { getOptionSideFromData } from '$src/utils/markets';
  import { fundingData } from '$src/stores/funding';
  import { getUpdatedFundingForPosition } from '$src/utils/funding';
  import {
    OptionSide,
    type Market,
    type MarketSideData,
    type Position,
  } from '$src/types';

  $: collateral =
    ($userData?.collateral && $userData?.collateral.toNumber() / 10 ** 6) || 0;
  $: netAssets =
    ($fundingData &&
      $positions &&
      $positions.reduce((acc, x) => acc + getNetValueReadable(x), 0)) ||
    0;

  $: marketsArray = $markets && ($markets.markets as Market[]);

  function getQuoteAssetReadable(position: Position): number {
    if (position && marketsArray) {
      const market = marketsArray[position.marketIndex] as Market;
      return (
        position.quoteAssetAmount.toNumber() / 10 ** market.collateralDecimals
      );
    } else {
      return 0;
    }
  }

  function getNetValueReadable(position: Position): number {
    if (position && marketsArray) {
      const optionSide = getOptionSideFromData(position.side);
      const market = marketsArray[position.marketIndex] as Market;
      const marketSideData = (
        optionSide === OptionSide.Call
          ? market.callMarketData
          : market.putMarketData
      ) as MarketSideData;

      const quoteAmount = getQuoteAssetReadable(position);

      if (quoteAmount > 0) {
        return (
          (quoteAmount * marketSideData.markPrice.toNumber()) /
            10 ** market.collateralDecimals +
          positionFunding(position) / 10 ** market.collateralDecimals +
          position.additionalCollateralDeposits.toNumber() /
            10 ** market.collateralDecimals
        );
      } else {
        return (
          2 *
            (position.totalCollateralDeposits.toNumber() /
              10 ** market.collateralDecimals) -
          position.additionalCollateralDeposits.toNumber() /
            10 ** market.collateralDecimals -
          (Math.abs(quoteAmount) * marketSideData.markPrice.toNumber()) /
            10 ** market.collateralDecimals +
          positionFunding(position) / 10 ** market.collateralDecimals
        );
      }
    } else {
      return 0;
    }
  }

  function positionFunding(position: Position): number {
    const optionSide = getOptionSideFromData(position.side);

    if ($fundingData && $fundingData[position.marketIndex]) {
      const marketFundingData = $fundingData[position.marketIndex];
      const fundingObj =
        optionSide === OptionSide.Call
          ? marketFundingData.callFunding
          : marketFundingData.putFunding;
      return getUpdatedFundingForPosition(position, fundingObj);
    } else {
      return 0;
    }
  }
</script>

{#if $page.url.pathname === '/options'}
  <Panel>
    <div class="flex flex-row justify-around space-x-3 mb-4">
      <DepositModal />
      <WithdrawModal />
    </div>
    <div class="flex flex-row items-center justify-between">
      <div class="text-info text-xs uppercase">Collateral</div>
      <div class="">
        ${collateral.toFixed(2)}
      </div>
    </div>
    <div class="flex flex-row items-center justify-between">
      <div class="text-info text-xs uppercase">Assets</div>
      <div class="">
        ${netAssets.toFixed(2)}
      </div>
    </div>
    <div class="flex flex-row items-center justify-between">
      <div class="text-info text-xs uppercase">Total</div>
      <div class="">
        ${(collateral + netAssets).toFixed(2)}
      </div>
    </div>
  </Panel>
{:else if $page.url.pathname === '/account'}
  <Panel class="flex justify-center gap-4">
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Collateral</div>
        <div class="stat-value">${collateral.toFixed(2)}</div>
      </div>
    </div>
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Assets</div>
        <div class="stat-value">${netAssets.toFixed(2)}</div>
      </div>
    </div>
    <div class="stats shadow">
      <div class="stat">
        <div class="stat-title">Total</div>
        <div class="stat-value">${(collateral + netAssets).toFixed(2)}</div>
      </div>
    </div>
  </Panel>
{/if}
