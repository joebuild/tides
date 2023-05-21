<script lang="ts">
  import { onMount } from 'svelte';
  import { setUserData, userExists } from '$stores/user';
  import { tidesClient } from '$utils/clients';
  import { getModal } from '$lib/Modal.svelte';
  import { Modal } from '$lib';

  onMount(async () => {
    await setUserData($tidesClient);
    if (!$userExists) {
      getModal('create-user').open();
    }
  });

  async function createAndUpdate() {
    await $tidesClient.userCreate();
    await setUserData($tidesClient);
    await getModal('create-user').close();
  }

  async function close() {
    await getModal('create-user').close();
  }
</script>

{#if !$userExists}
  <Modal id="create-user">
    <div slot="header" class="px-1 mb-2">
      <h5
        class="text-lg pb-2 border-bottom border-solid border-base-content text-center"
      >
        Create new user account
      </h5>
    </div>
    <div class="flex justify-center space-between space-x-5">
      <button class="w-40 h-auto btn btn-accent" on:click={createAndUpdate}>
        Create new user account
      </button>
      <button class="w-40 h-auto btn" on:click={close}> Maybe later </button>
    </div>
  </Modal>
{/if}
