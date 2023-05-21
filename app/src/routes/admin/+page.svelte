<script lang="ts">
  import { onMount } from 'svelte';
  import { Title, Panel, TxButton } from '$lib';
  import { AdminPanelLayout } from '$lib/blocks/admin';
  import { tidesClient } from '$utils/clients';
  import BN from 'bn.js';
  import { getAddresses } from '$src/utils/constants';
  import { network } from '$src/stores/network';
  import { markets, setMarkets } from '$src/stores/markets';
  import AddMarketForm from '$lib/blocks/admin/AddMarketForm.svelte';
  import { config, setConfig } from '$src/stores/config';

  onMount(async () => {
    await setMarkets($tidesClient.program);
    await setConfig($tidesClient.program);
  });

  let tab = 'markets';

  let amountReadable = 0;
  $: amount = $markets && amountReadable * 10 ** 6;
</script>

<Title page="admin" />

<div class="flex flex-col p-2 gap-2 overflow-y-scroll">
  <div class="flex justify-center">
    <div class="tabs">
      <!-- svelte-ignore a11y-missing-attribute -->
      <a
        class="tab text-lg {tab === 'markets' ? 'tab-active' : ''}"
        on:click={() => (tab = 'markets')}>Markets</a
      >
      <!-- svelte-ignore a11y-missing-attribute -->
      <a
        class="tab text-lg {tab === 'add-market' ? 'tab-active' : ''}"
        on:click={() => (tab = 'add-market')}>Add Market</a
      >
    </div>
  </div>

  {#if tab === 'markets'}
    <div class="flex gap-2">
      <Panel class="flex-1 capitalize">
        <h2 class="text-center pb-2 capitalize">Exchange</h2>
        <div class="flex gap-2">
          <TxButton
            klass="btn btn-secondary flex-1"
            rpcCall={async () =>
              $tidesClient.initialize(getAddresses($network).USDC)}
            disabled={$markets.initialized}
          >
            Initialize
          </TxButton>
          <TxButton
            klass="btn btn-secondary flex-1 {$config.exchangePaused
              ? 'btn-success'
              : 'btn-warning'}"
            rpcCall={$config.exchangePaused
              ? async () => $tidesClient.exchangeResume()
              : async () => $tidesClient.exchangePause()}
            disabled={!$config.initialized}
          >
            {$config.exchangePaused ? 'Resume' : 'Pause'}
          </TxButton>
          <TxButton
            klass="btn btn-secondary flex-1"
            rpcCall={async () => $tidesClient.marketsDestroy()}
            disabled={!$config.exchangePaused}
          >
            Destroy Markets
          </TxButton>
        </div>
      </Panel>
      <Panel class="flex-1 capitalize">
        <h2 class="text-center pb-2 capitalize">global collateral</h2>
        <div class="flex gap-2">
          <TxButton klass="btn btn-secondary flex-1" disabled>Deposit</TxButton>
          <TxButton
            klass="btn btn-secondary flex-1"
            rpcCall={async () =>
              $tidesClient.globalCollateralWithdraw(new BN(amount))}
            >withdraw</TxButton
          >
        </div>
      </Panel>
      <Panel class="flex-1">
        <h2 class="text-center pb-2 capitalize">global insurance</h2>
        <div class="flex gap-2">
          <TxButton klass="btn btn-secondary flex-1" disabled>Deposit</TxButton>
          <TxButton
            klass="btn btn-secondary flex-1"
            rpcCall={async () => $tidesClient.insuranceWithdraw(new BN(amount))}
          >
            withdraw
          </TxButton>
        </div>
      </Panel>
      <Panel class="flex-1">
        <h2 class="text-center pb-2 capitalize">global treasury</h2>
        <TxButton klass="btn btn-secondary flex-1 w-full" disabled>
          Withdraw
        </TxButton>
      </Panel>
    </div>

    <div class="flex justify-center my-10">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label">
        <span class="label-text mr-5">USDC</span>
      </label>
      <input
        class="input input-bordered input-md w-1/2 max-w-xs"
        type="number"
        bind:value={amountReadable}
        min="0"
      />
    </div>

    <!-- admin panels -->
    <AdminPanelLayout {amount} />
  {/if}

  {#if tab === 'add-market'}
    <AddMarketForm />
  {/if}
</div>

<!-- <div class="">
  <button class="btn" on:click={() => airdropAndSetMintForDev($tidesClient)}>
    Airdrop + Set Mint (Local)
  </button>
</div>
<div class="">
  <button
    class="btn"
    on:click={() => $tidesClient.initialize(getAddresses($network).USDC)}
  >
    Initialize (Devnet)
  </button>
  <button
    class="btn"
    on:click={async () => {
      await $tidesClient.marketAdd(
        'SOL',
        'USDC',
        SOL_MINT_ADDRESS,
        getAddresses($network).PYTH_PRICE_FEED_SOL,
      );
    }}
  >
    Add Sol Market (Devnet)
  </button>
  <button
    class="btn"
    on:click={async () => {
      await $tidesClient.marketSideDeposit(
        0,
        OptionSide.Call,
        new BN(10 ** 10),
      );

      await $tidesClient.marketSideDeposit(0, OptionSide.Put, new BN(10 ** 10));
    }}
  >
    Add Collateral to Sol Market (Devnet)
  </button>
</div> -->
