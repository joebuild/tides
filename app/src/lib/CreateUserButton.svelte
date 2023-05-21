<script lang="ts">
  import { onMount } from 'svelte';
  import { setUserData, userExists } from '$stores/user';
  import { tidesClient } from '$utils/clients';

  onMount(async () => {
    await setUserData($tidesClient);
  });

  async function createAndUpdate() {
    await $tidesClient.userCreate();
    await setUserData($tidesClient);
  }
</script>

{#if !$userExists}
  <button class="w-40 h-auto btn btn-accent" on:click={createAndUpdate}>
    Create new user account
  </button>
{/if}
