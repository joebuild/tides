<script lang="ts">
  import { onMount } from 'svelte';
  import BN from 'bn.js';
  import { Modal, TxButton } from '$lib';
  import { getModal } from '$lib/Modal.svelte';
  import { tidesClient } from '$utils/clients';
  import { setUserData } from '$stores/user';
  import type { Market } from '$src/types';

  let amount = 0;

  export let market: Market = undefined;

  onMount(async () => {
    await setUserData($tidesClient);
  });

  async function openModal() {
    amount = 0;
    await getModal('cvdeposit-' + market.index).open();
  }

  async function deposit() {
    const tx = await $tidesClient.collateralVaultPositionOpenBothSides(
      market.index,
      new BN(amount * 10 ** market.collateralDecimals),
    );
    await getModal('cvdeposit-' + market.index).close();
    return tx;
  }
</script>

<button class="h-auto btn btn-xs btn-secondary" on:click={() => openModal()}>
  Open Collateral Vault Position
</button>

<Modal id={'cvdeposit-' + market.index}>
  <div slot="header" class="px-1 mb-4">
    <h5
      class="text-lg pb-2 border-bottom border-solid border-base-content text-center"
    >
      Open Collateral Vault Position
    </h5>
    <h5 class="text-xs text-center">
      (split 50/50 between call and put sides)
    </h5>
  </div>
  <div class="flex flex-row content-center w-full mb-5 ml-24">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">
      <span class="label-text mr-3">USDC</span>
    </label>
    <input
      class="input input-bordered input-md w-1/2 max-w-xs"
      type="number"
      bind:value={amount}
      min="0"
    />
  </div>
  <div class="flex justify-center space-between">
    <TxButton
      klass="h-auto btn btn-sm btn-secondary"
      rpcCall={async () => deposit()}
    >
      Open Position
    </TxButton>
  </div>
</Modal>
