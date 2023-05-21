<script lang="ts">
  import { Panel, TxButton } from '$lib';
  import type { Market, OptionSide } from '$src/types';
  import BN from 'bn.js';
  import { tidesClient } from '$utils/clients';
  import { PublicKey } from '@solana/web3.js';

  let quoteSymbol = '';
  let baseSymbol = '';

  let quoteMint = '';
  let oraclePriceFeed = '';
</script>

<div>
  <p class="text-center py-2">Add Market</p>
  <Panel class="overflow-x-auto w-md max-w-3xl">
    <div class="flex flex-col justify-center">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">
        <span class="label-text mr-5">Quote Symbol</span>
      </label>
      <input
        class="input input-bordered input-md max-w-xs"
        bind:value={quoteSymbol}
      />

      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">
        <span class="label-text mr-5">Base Symbol</span>
      </label>
      <input
        class="input input-bordered input-md max-w-xs"
        bind:value={baseSymbol}
      />

      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">
        <span class="label-text mr-5">Quote Mint</span>
      </label>
      <input
        class="input input-bordered input-md min-w-lg"
        bind:value={quoteMint}
      />

      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">
        <span class="label-text mr-5">Oracle Price Feed</span>
      </label>
      <input
        class="input input-bordered input-md min-w-lg"
        bind:value={oraclePriceFeed}
      />

      <a
        href="https://pyth.network/price-feeds/?asset-type=crypto"
        class="underline text-sm"
      >
        Price Feeds
      </a>

      <br />

      <TxButton
        klass="btn btn-secondary flex-1"
        rpcCall={async () =>
          $tidesClient.marketAdd(
            quoteSymbol,
            baseSymbol,
            new PublicKey(quoteMint),
            new PublicKey(oraclePriceFeed),
          )}
      >
        Add Market
      </TxButton>
    </div>
  </Panel>
</div>
