<script lang="ts">
  import { Title } from '$lib';
  import {
    CollateralVaultPanelLayout,
    CollateralVaultPositions,
  } from '$lib/blocks/vaults';
</script>

<Title page="vaults" />

<div
  class="flex grow flex-col p-2 gap-2 h-max max-h-screen overflow-y-scroll w-full no-scrollbar"
>
  <CollateralVaultPanelLayout />
  <CollateralVaultPositions />
</div>
