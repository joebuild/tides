<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { Stretch } from 'svelte-loading-spinners';
  import { WalletProvider } from '@svelte-on-solana/wallet-adapter-ui';
  import { AnchorConnectionProvider } from '@svelte-on-solana/wallet-adapter-anchor';
  import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
  import type { Adapter } from '@solana/wallet-adapter-base';
  import {
    ClientProvider,
    Header,
    CreateUserModal,
    Toasts,
    Footer,
  } from '$lib';
  import { tidesClient } from '$utils/clients';
  import { default as ProgramIDLJson } from '$idl/program_id.json';
  import '../styles/app.css';
  import { network, Network } from '$src/stores/network';

  const localStorageKey = 'walletAdapter';

  $: networkUrl =
    $network && $network === Network.Devnet
      ? 'https://solitary-light-pond.solana-devnet.quiknode.pro/8b519031fe8ed437593cc604fe76e5adb66e119c/'
      : 'https://polished-little-thunder.solana-mainnet.quiknode.pro/';

  let wallets: Adapter[],
    spinnerVisible = true;

  onMount(async () => {
    if ($page.url.pathname !== '/restricted') {
      await setWallets();
    }
  });

  async function setWallets() {
    const {
      PhantomWalletAdapter,
      SolflareWalletAdapter,
      GlowWalletAdapter,
      SalmonWalletAdapter,
      SolletExtensionWalletAdapter,
    } = await import('@solana/wallet-adapter-wallets');

    wallets = [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
      new SalmonWalletAdapter(),
      new SolletExtensionWalletAdapter(),
    ];
  }

  function closeSpinner() {
    setTimeout(() => {
      spinnerVisible = false;
    }, 500);
  }

  // route protections
  $: {
    if (browser) {
      // wallet disconnected
      if (!$walletStore.connected) {
        if (
          $page.url.pathname === '/' ||
          $page.url.pathname === '/restricted'
        ) {
          closeSpinner();
        } else if ($walletStore.disconnecting) {
          goto('/');
        } else if ($page.url.pathname !== '/') {
          // this should be handle by a callback
          setTimeout(() => {
            if ($walletStore.connected && $tidesClient) {
              closeSpinner();
            } else {
              goto('/');
            }
          }, 500);
        }
        // wallet connected
      } else if ($walletStore.connected && $tidesClient) {
        if ($page.url.pathname === '/') {
          goto('/options');
        } else if ($page.url.pathname !== '/') {
          closeSpinner();
        }
      }
    }
  }
</script>

<Toasts />
<WalletProvider {localStorageKey} {wallets} autoConnect />
<AnchorConnectionProvider network={networkUrl} idl={ProgramIDLJson} />
<ClientProvider />

<main class="flex flex-col h-screen max-h-screen relative">
  <!-- Header -->
  <Header />

  {#if $page.url.pathname !== '/restricted' && $walletStore.connected}
    <CreateUserModal />
  {/if}

  {#if spinnerVisible}
    <div class="flex grow justify-center items-center">
      <Stretch size="60" color="#3ABFF8" unit="px" duration="2s" />
    </div>
  {:else}
    <!-- routes content -->
    <slot />
  {/if}

  {#if $page.url.pathname === '/' || $page.url.pathname === '/restricted'}
    <Footer />
  {/if}
</main>
