<script lang="ts">
  import { onMount } from 'svelte';
  import {
    Panel,
    CreateUserButton,
    TxButton,
    CollateralAssets,
    NetworkSelector,
  } from '$lib';
  import { PlatformStatsPanel } from '$lib/blocks/dashboard';
  import { userExists } from '$src/stores/user';
  import { tidesClient } from '$src/utils/clients';
  import { selectedMarket } from '$src/stores/markets';
  import { setPositions } from '$src/stores/positions';
  import { OptionSide, OrderSide, type MarketSideData } from '$src/types';

  export let hasNetworkSelector = false,
    hasCollateralAssets = false,
    hasTradePanel = false,
    hasStatsPanel = false;
  export { klass as class };

  let klass;
  let callOrPut = OptionSide.Call;
  let quoteAmount = 0;
  let baseAmount = 0;
  let slippage = 250;
  let reduceOnly = false;

  async function placeOrder(side: OrderSide) {
    const orderPolarity = side === OrderSide.Long ? 1 : -1;

    const response = await $tidesClient.positionChange(
      $selectedMarket.index,
      callOrPut,
      orderPolarity * quoteAmount * 10 ** $selectedMarket.collateralDecimals,
      baseAmount * 10 ** $selectedMarket.collateralDecimals,
      slippage,
      false,
      reduceOnly,
    );

    quoteAmount = 0;
    baseAmount = 0;

    return response;
  }

  async function toggleCallPut() {
    callOrPut =
      callOrPut === OptionSide.Call ? OptionSide.Put : OptionSide.Call;
    quoteAmount = 0;
    baseAmount = 0;
  }

  function adjustQuote(event) {
    const marketSideData: MarketSideData =
      callOrPut === OptionSide.Call
        ? $selectedMarket.callMarketData
        : $selectedMarket.putMarketData;
    baseAmount = parseFloat(
      (
        quoteAmount *
        (marketSideData.markPrice.toNumber() /
          10 ** $selectedMarket.collateralDecimals)
      ).toFixed(3),
    );
  }

  function adjustBase(event) {
    const marketSideData: MarketSideData =
      callOrPut === OptionSide.Call
        ? $selectedMarket.callMarketData
        : $selectedMarket.putMarketData;
    quoteAmount = parseFloat(
      (
        (baseAmount * 10 ** $selectedMarket.collateralDecimals) /
        marketSideData.markPrice.toNumber()
      ).toFixed(3),
    );
  }

  onMount(async () => {
    await setPositions(
      $tidesClient.program,
      $tidesClient.provider.wallet.publicKey,
    );
  });
</script>

<div class="flex flex-col gap-2 grow-0 w-56 {klass}">
  {#if hasNetworkSelector}
    <NetworkSelector />
  {/if}
  {#if !$userExists}
    <Panel
      class="flex flex-col grow gap-2 place-content-center place-items-center"
    >
      <CreateUserButton />
    </Panel>
  {:else}
    {#if hasCollateralAssets}
      <CollateralAssets />
    {/if}
    {#if hasTradePanel}
      <Panel class="flex flex-col grow gap-2">
        <div class="text-center mb-3">Trade</div>

        <div class="form-control w-full">
          <label class="label cursor-pointer">
            <span class="label-text capitalize text-lg font-semibold"
              >{callOrPut === OptionSide.Call ? 'Call' : 'Put'}</span
            >
            <input
              type="checkbox"
              class="toggle toggle-primary"
              checked
              on:click={toggleCallPut}
            />
          </label>

          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">
            <span class="label-text text-xs">Quote</span>
          </label>
          <div class="w-full">
            <input
              class="input input-bordered input-sm"
              type="number"
              bind:value={quoteAmount}
              on:input={e => adjustQuote(e)}
              min="0"
            />
          </div>

          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label">
            <span class="label-text text-xs">Base</span>
          </label>
          <div class="w-full">
            <input
              class="input input-bordered input-sm"
              type="number"
              bind:value={baseAmount}
              on:input={e => adjustBase(e)}
              min="0"
            />
          </div>

          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="label mt-2">
            <span class="label-text text-xs">Slippage limit</span>
          </label>
          <label class="label mt-0 pt-0">
            <span class="label-text text-xs">1%</span>
            <input
              type="radio"
              bind:group={slippage}
              name="slippage"
              class="radio"
              value={100}
            />
            <span class="label-text text-xs ml-3">2.5%</span>
            <input
              type="radio"
              bind:group={slippage}
              name="slippage"
              class="radio"
              value={250}
              checked
            />
            <span class="label-text text-xs ml-3">5%</span>
            <input
              type="radio"
              bind:group={slippage}
              name="slippage"
              class="radio"
              value={500}
            />
          </label>

          <label class="label cursor-pointer justify-start gap-3">
            <span class="label-text text-xs">Reduce only</span>
            <input
              type="checkbox"
              bind:checked={reduceOnly}
              class="checkbox checkbox-sm"
            />
          </label>
        </div>

        <div class="form-control" />

        <div class="flex flex-row gap-2 pr-2">
          <TxButton
            klass="btn btn-sm btn-success w-1/2"
            rpcCall={async () => placeOrder(OrderSide.Long)}
          >
            Long
          </TxButton>

          <TxButton
            klass="btn btn-sm btn-error w-1/2"
            rpcCall={async () => placeOrder(OrderSide.Short)}
          >
            Short
          </TxButton>
        </div>
      </Panel>
    {/if}
  {/if}
  {#if hasStatsPanel}
    <PlatformStatsPanel />
  {/if}
</div>
