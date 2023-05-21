<script lang="ts">
  import { Title } from '$lib';
  import { OrderHistoryPanel } from '$lib/blocks/account';
  import CollateralAssets from '$lib/CollateralAssets.svelte';
</script>

<Title page="account" />

<div
  class="flex grow flex-col p-2 gap-2 h-max max-h-screen overflow-y-scroll w-full no-scrollbar"
>
  <!-- <div class="flex flex-1 gap-2"> -->
  <CollateralAssets />
  <OrderHistoryPanel />
</div>
