<script lang="ts">
  import { onMount } from 'svelte';
  import { Panel } from '$lib';
  import { TokenIcon } from '$lib/blocks/dashboard';
  import {
    tokens,
    getTokenList,
    selectedToken,
    selectedMarket,
    markets,
  } from '$src/stores/markets';
  import type { Market, Markets } from '$src/types';
  import { bytesToString } from '$src/utils/misc';
  import type { TokenInfo } from '@solana/spl-token-registry';
  import {
    setCallPrices,
    setOraclePrices,
    setPutPrices,
    setStrikePrices,
  } from '$src/stores/timestream';
  import { timestreamClient } from '$src/utils/clients';
  import { network } from '$src/stores/network';

  let searchInput = '';

  onMount(async () => {
    tokens.set(await getTokenList());
  });

  $: symbolList =
    ($markets &&
      $markets.markets &&
      ($markets.markets as Market[])
        .filter(m => m.initialized && !m.marketPaused)
        .map(m => bytesToString(m.symbolQuote))
        .filter(symbol =>
          searchInput === ''
            ? true
            : symbol.includes(searchInput.toUpperCase()),
        )) ||
    [];

  $: token =
    $selectedToken || $tokens.find(t => t?.symbol && t.symbol === 'SOL');
  $: token && selectedToken.set(token);

  $: market =
    token &&
    $markets.markets &&
    ($markets.markets as Market[]).find(
      m => bytesToString(m.symbolQuote) === token.symbol,
    );

  $: market && selectedMarket.set(market);

  function getTokenMetadataFromSymbol(symbol: string) {
    return $tokens.find(t => t.symbol === symbol);
  }

  function updateSelectedTokenAndMarket(token: TokenInfo) {
    selectedToken.set(token);

    let selectedM = ($markets.markets as Market[]).find(
      m => bytesToString(m.symbolQuote) === token.symbol,
    );

    selectedMarket.set(selectedM);

    const quoteSymbol = bytesToString($selectedMarket.symbolQuote);

    setOraclePrices(quoteSymbol, $network, $timestreamClient);
    setStrikePrices(quoteSymbol, $network, $timestreamClient);
    setCallPrices(quoteSymbol, $network, $timestreamClient);
    setPutPrices(quoteSymbol, $network, $timestreamClient);
  }
</script>

<Panel class="flex flex-col grow-0">
  <div class="text-center mb-3">Markets</div>
  <div class="mb-3">
    <input
      class="input input-bordered input-md w-40"
      type="text"
      placeholder="search.."
      bind:value={searchInput}
    />
  </div>
  <div class="flex flex-col gap-2">
    {#each symbolList as symbol}
      {#if $selectedToken && $selectedToken.symbol && getTokenMetadataFromSymbol(symbol) && getTokenMetadataFromSymbol(symbol).symbol}
        <button
          class="btn {$selectedToken.symbol === symbol ? 'btn-primary' : ''}"
          on:click={() =>
            updateSelectedTokenAndMarket(getTokenMetadataFromSymbol(symbol))}
        >
          <TokenIcon token={getTokenMetadataFromSymbol(symbol)} />
          <p class="w-10 ml-3">{getTokenMetadataFromSymbol(symbol).symbol}</p>
        </button>
      {/if}
    {/each}
  </div>
</Panel>
