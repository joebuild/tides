<script lang="ts">
  import { Modal, TxButton } from '$lib';
  import { getModal } from '$lib/Modal.svelte';
  import { tidesClient } from '$utils/clients';
  import { getOptionSideFromData } from '$src/utils/markets';
  import type { Position } from '$src/types';

  export let position: Position;
  export let maxCollateralToAdd = 0;

  let amount = 0;

  async function openModal() {
    amount = 0;
    await getModal('addcollateral').open();
  }

  async function addCollateral() {
    await getModal('addcollateral').close();
    const tx = await $tidesClient.positionAddCollateral(
      position.marketIndex,
      getOptionSideFromData(position.side),
      amount * 10 ** 6,
    );
    return tx;
  }
</script>

<button class="h-auto btn btn-xs btn-secondary" on:click={() => openModal()}
  >Add Collateral</button
>

<Modal id="addcollateral">
  <div slot="header" class="px-1 mb-2">
    <h5
      class="text-lg pb-2 border-bottom border-solid border-base-content text-center"
    >
      Add Collateral To Position
    </h5>
  </div>
  <div class="flex flex-row content-center w-full ml-24">
    <input
      class="range range-secondary w-1/2 max-w-xs"
      type="range"
      min="0"
      max={maxCollateralToAdd}
      step="0.01"
      bind:value={amount}
    />
    <button
      class="italic font-bold mx-5 underline"
      on:click={() => (amount = maxCollateralToAdd)}>max</button
    >
  </div>
  <div class="justify-items-center text-center w-full my-3">
    {amount.toFixed(2)}
  </div>
  <div class="flex justify-center space-between">
    <div class="flex justify-center space-between">
      <TxButton
        klass="w-40 h-auto btn btn-accent"
        rpcCall={async () => addCollateral()}
      >
        Add Collateral
      </TxButton>
    </div>
  </div>
</Modal>
