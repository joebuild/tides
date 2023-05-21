<script lang="ts">
  import { onMount } from 'svelte';
  import BN from 'bn.js';
  import { Modal, TxButton } from '$lib';
  import { getModal } from '$lib/Modal.svelte';
  import { tidesClient } from '$utils/clients';
  import { getATATokenBalance } from '$utils/tokens';
  import { getAddresses } from '$utils/constants';
  import { setUserData } from '$stores/user';
  import { network } from '$stores/network';

  let amount = 0;
  let maxDeposit = 0;

  onMount(async () => {
    await setUserData($tidesClient);
  });

  async function openModal() {
    amount = 0;
    maxDeposit =
      (
        await getATATokenBalance(
          $tidesClient.provider,
          getAddresses($network).USDC,
          $tidesClient.provider.wallet.publicKey,
        )
      ).toNumber() /
      10 ** 6;
    await getModal('deposit').open();
  }

  async function deposit() {
    const tx = await $tidesClient.userDeposit(
      new BN(amount * 10 ** 6),
      getAddresses($network).USDC,
    );
    await getModal('deposit').close();
    return tx;
  }
</script>

<button class="btn btn-secondary btn-sm" on:click={() => openModal()}
  >Deposit</button
>

<Modal id="deposit">
  <div slot="header" class="px-1 mb-2">
    <h5
      class="text-lg pb-2 border-bottom border-solid border-base-content text-center"
    >
      Deposit USDC
    </h5>
    <h5 class="text-sm text-center">$100 limit while in alpha testing</h5>
  </div>
  <div class="flex flex-row content-center w-full mb-5 ml-24">
    <input
      class="input input-bordered input-md w-1/2 max-w-xs"
      type="number"
      bind:value={amount}
      min="0"
      max={maxDeposit}
    />
    <button
      class="italic font-bold mx-5 underline my-3"
      on:click={() => (amount = maxDeposit)}>max</button
    >
  </div>
  <div class="flex justify-center space-between">
    <TxButton
      klass="w-40 h-auto btn btn-secondary"
      rpcCall={async () => deposit()}
    >
      Deposit
    </TxButton>
  </div>
</Modal>
