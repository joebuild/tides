<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import x from '$src/icons/x.svg?src';
  import { linesCollection } from 'svelte-lightweight-charts/internal/lines';

  const dispatch = createEventDispatcher();

  export let txLink = '';
  export let error;
  export let type = 'error';
  export let dismissible = true;

  function parseErrorMessage(e) {
    let eString = '';

    if (!e) {
      return '';
    } else if (Array.isArray(e)) {
      const lines = e.filter(
        l => l.includes('Error') || l.includes('assertion failed'),
      );
      eString = lines[0];
    } else if (typeof e === 'string' && e.length > 0) {
      eString = e;
    } else if (e.logs) {
      const lines = e.logs.filter(
        l => l.includes('Error') || l.includes('assertion failed'),
      );
      eString = lines[0];
    } else {
      return '';
    }

    if (!eString) {
      eString = e.logs.join();
    }

    let split = [];
    if (eString.includes('Error Message:')) {
      split = eString.split('Error Message:');
    } else if (eString.includes('Error:')) {
      split = eString.split('Error:');
      return split[1].trim();
    } else if (eString.includes('assertion failed')) {
      split = eString.split('assertion failed:');
      return 'assertion failed: ' + split[1].trim();
    }

    let message = '';

    if (split.length > 1 && split[1].includes('.')) {
      return split[1].split('.')[0].trim();
    }

    return message;
  }
</script>

<div class="toast toast-start toast-bottom z-50">
  <div
    class="alert alert-{type} rounded-lg {type === 'success'
      ? 'bg-success-content'
      : 'bg-error-content'} border"
  >
    <div class="grid justify-items-start">
      <slot />
      {parseErrorMessage(error)}
      <a href={txLink} target="_blank" class="underline"> transaction </a>
    </div>
    {#if dismissible}
      <button class="close icon" on:click={() => dispatch('dismiss')}>
        {@html x}
      </button>
    {/if}
  </div>
</div>
