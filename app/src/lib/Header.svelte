<script lang="ts">
  import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
  import { NavBar } from '$lib';
  import { page } from '$app/stores';
  import { WalletMultiButton } from '@svelte-on-solana/wallet-adapter-ui';
</script>

<header>
  <div class="flex justify-between">
    {#if $walletStore.connected}
      <div class="flex flex-row">
        <div class="text-left text-2xl mt-4 mb-4 ml-8 mr-2">Tides</div>
        <div class="badge badge-accent mt-4">Alpha</div>
      </div>
    {:else}
      <div />
    {/if}

    <div class="flex justify-end mx-5 my-2 space-x-3">
      {#if $walletStore.connected}
        <NavBar />
      {/if}
      {#if $page.url.pathname !== '/restricted'}
        <WalletMultiButton />
      {/if}
    </div>
  </div>

  {#if $walletStore.connected}
    <div class="border-b border-gray-700" />
  {/if}
</header>
