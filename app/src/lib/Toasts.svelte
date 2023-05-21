<script lang="ts">
  import { TxToast } from '$lib';
  import { dismissToast, toasts } from '$src/stores/toasts';
</script>

{#if $toasts}
  <section>
    {#each $toasts as toast (toast.id)}
      <TxToast
        type={toast.type}
        txLink={toast.txLink}
        error={toast?.error}
        dismissible={toast.dismissible}
        on:dismiss={() => dismissToast(toast.id)}
      >
        <div>{toast.type === 'success' ? 'Success' : 'Error'}</div>
        <div>{toast.message}</div>
      </TxToast>
    {/each}
  </section>
{/if}
