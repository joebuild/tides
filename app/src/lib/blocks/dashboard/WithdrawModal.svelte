<script lang="ts">
  import { onMount } from 'svelte';
  import BN from 'bn.js';
  import { getModal } from '$lib/Modal.svelte';
  import { Modal, TxButton } from '$lib';
  import { tidesClient } from '$utils/clients';
  import { setUserData, userData } from '../../../stores/user';
  import { getAddresses } from '$src/utils/constants';
  import { network } from '$src/stores/network';

  let amount = 0;
  let maxWithdraw = 0;

  onMount(async () => {
    await setUserData($tidesClient);
  });

  async function openModal() {
    amount = 0;
    maxWithdraw = $userData.collateral.toNumber() / 10 ** 6;
    await getModal('withdraw').open();
  }

  async function withdraw() {
    const tx = await $tidesClient.userWithdraw(
      new BN(amount * 10 ** 6),
      getAddresses($network).USDC,
    );
    await getModal('withdraw').close();
    return tx;
  }
</script>

<button class="btn btn-secondary btn-sm" on:click={() => openModal()}
  >Withdraw</button
>

<Modal id="withdraw">
  <div slot="header" class="px-1 mb-2">
    <h5
      class="text-lg pb-2 border-bottom border-solid border-base-content text-center"
    >
      Withdraw USDC
    </h5>
  </div>
  <div class="flex flex-row content-center w-full mb-5 ml-24">
    <input
      class="input input-bordered input-md w-1/2 max-w-xs"
      type="number"
      bind:value={amount}
      min="0"
      max={maxWithdraw}
    />
    <button
      class="italic font-bold mx-5 underline my-3"
      on:click={() => (amount = maxWithdraw)}>max</button
    >
  </div>
  <div class="flex justify-center space-between">
    <TxButton
      klass="w-40 h-auto btn btn-secondary"
      rpcCall={async () => withdraw()}
    >
      Withdraw
    </TxButton>
  </div>
</Modal>
