<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Panel } from '$lib';
  import { CreateUserButton, TxButton } from '$lib';
  import { AddCollateralModal } from '$lib/blocks/dashboard';
  import { setPositions, positions } from '$src/stores/positions';
  import { tidesClient } from '$utils/clients';
  import { getOptionSideFromData } from '$utils/markets';
  import { userExists } from '$src/stores/user';
  import {
    OptionSide,
    type Market,
    type MarketSideData,
    type Position,
  } from '$src/types';
  import { markets } from '$src/stores/markets';
  import {
    positionFunding,
    getNetValueReadable,
    maxCollateralToAddReadable,
    healthPercent,
    getBaseAssetValueReadable,
    getQuoteAssetReadable,
  } from '$src/utils/positions';
  import { fundingData } from '$src/stores/funding';
  import { bytesToString } from '$src/utils/misc';

  onMount(async () => {
    await setPositions(
      $tidesClient.program,
      $tidesClient.provider.wallet.publicKey,
    );
  });

  let updateTriggerCounter = 1;
  $: updateTrigger = updateTriggerCounter;

  $: marketsArray = $markets && ($markets.markets as Market[]);

  async function closePosition(position: Position): Promise<string> {
    const optionSide = getOptionSideFromData(position.side);
    const market = marketsArray[position.marketIndex] as Market;
    const marketSideData = (
      optionSide === OptionSide.Call
        ? market.callMarketData
        : market.putMarketData
    ) as MarketSideData;

    const markPrice = marketSideData.markPrice.toNumber();

    const quoteAmount = position.quoteAssetAmount.toNumber();
    const baseAmount =
      (quoteAmount * markPrice) / 10 ** market.collateralDecimals;

    return $tidesClient.positionChange(
      position.marketIndex,
      getOptionSideFromData(position.side),
      -quoteAmount,
      -baseAmount,
      500,
      true,
      true,
    );
  }

  type PositionRow = {
    positionData: Position;
    market: string;
    optionType: string;
    side: string;
    quoteSize: number;
    baseSize: number;
    funding: number;
    net: number;
    health: number;
  };

  $: positionRows =
    marketsArray &&
    $fundingData &&
    $positions &&
    updateTrigger &&
    $positions.map(position => {
      return {
        positionData: position,
        market: bytesToString(marketsArray[position.marketIndex].symbolQuote),
        optionType: Object.keys(position.side)[0],
        side:
          getQuoteAssetReadable(position, marketsArray) > 0 ? 'Long' : 'Short',
        quoteSize: getQuoteAssetReadable(position, marketsArray),
        baseSize: getBaseAssetValueReadable(position, marketsArray),
        funding: positionFunding(position, $fundingData) / 10 ** 6,
        net: getNetValueReadable(position, marketsArray, $fundingData),
        health: healthPercent(position, marketsArray, $fundingData),
      };
    });

  const interval = setInterval(() => {
    updateTriggerCounter += 1;
  }, 5 * 1000);

  onDestroy(() => clearInterval(interval));
</script>

<Panel class="flex flex-col h-full">
  <div class="text-center">Positions</div>

  {#if !$userExists}
    <div class="flex flex-col grow place-content-center place-items-center">
      <CreateUserButton />
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="table table-compact w-full">
        <thead>
          <tr>
            <th>Market</th>
            <th>Type</th>
            <th>Side</th>
            <th>Position Size (quote)</th>
            <th>Asset Value ($)</th>
            <th>Funding ($)</th>
            <th>Net ($)</th>
            <th>Health</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {#if $positions && marketsArray && positionRows}
            {#key $fundingData}
              {#key $positions}
                {#each positionRows as pRow}
                  <tr>
                    <td>{pRow.market}</td>
                    <td class="capitalize">{pRow.optionType}</td>
                    <th>{pRow.side}</th>
                    <td>{pRow.quoteSize.toFixed(2)}</td>
                    <td>{pRow.baseSize.toFixed(2)}</td>
                    <td>{pRow.funding.toFixed(2)}</td>
                    <td>{pRow.net.toFixed(2)}</td>
                    <td
                      >{pRow.health > 1000
                        ? '>1000.00'
                        : pRow.health.toFixed(2)}%</td
                    >
                    <td class="px-2">
                      {#if pRow.health < 99.9}
                        <AddCollateralModal
                          position={pRow.positionData}
                          maxCollateralToAdd={maxCollateralToAddReadable(
                            pRow.positionData,
                            marketsArray,
                            $fundingData,
                          )}
                        />
                      {/if}
                    </td>
                    <td class="px-2">
                      <TxButton
                        klass="h-auto btn btn-xs btn-secondary"
                        rpcCall={async () => closePosition(pRow.positionData)}
                      >
                        Close
                      </TxButton>
                    </td>
                  </tr>
                {/each}
              {/key}
            {/key}
          {/if}
        </tbody>
      </table>
    </div>
  {/if}
</Panel>
