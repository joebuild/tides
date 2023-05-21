<script context="module" lang="ts">
  let onTop;
  const modals = {};

  export function getModal(id = '') {
    return modals[id];
  }
</script>

<script lang="ts">
  import { onDestroy } from 'svelte';
  import { fly } from 'svelte/transition';

  export let size: 'lg' | 'xl' | '2xl' = 'lg';

  let topDiv,
    visible = false,
    backdropVisible = false,
    prevOnTop,
    closeCallback;

  export let id = '';

  function keyPress(ev) {
    //only respond if the current modal is the top one
    if (ev.key == 'Escape' && onTop == topDiv) close(); //ESC
  }

  /**  API **/
  function open(callback) {
    closeCallback = callback;
    if (visible) return;
    prevOnTop = onTop;
    onTop = topDiv;
    window.addEventListener('keydown', keyPress);

    //this prevents scrolling of the main window on larger screens
    document.body.style.overflow = 'hidden';

    visible = true;
    backdropVisible = true;
    //Move the modal in the DOM to be the last child of <BODY> so that it can be on top of everything
    document.body.appendChild(topDiv);
  }

  function close(retVal?) {
    if (!visible) return;
    window.removeEventListener('keydown', keyPress);
    onTop = prevOnTop;
    if (onTop == null) document.body.style.overflow = '';
    setTimeout(() => {
      backdropVisible = false;
    }, 300);
    visible = false;
    if (closeCallback) closeCallback(retVal);
  }

  //expose the API
  modals[id] = { open, close };

  onDestroy(() => {
    delete modals[id];
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', keyPress);
    }
  });
</script>

<div
  class="z-[9999] fixed top-0 left-0 right-0 bottom-0 bg-backdrop flex items-center justify-center invisible"
  class:backdropVisible
  bind:this={topDiv}
  on:click={() => close()}
>
  {#if visible}
    <div
      id="modal"
      class:lg={size === 'lg'}
      class:xl={size === 'xl'}
      class:xxl={size === '2xl'}
      class="relative rounded-2xl bg-base-100 p-4 border-2 border-solid"
      on:click|stopPropagation={() => {}}
      transition:fly={{ duration: 300, y: 100 }}
    >
      <slot name="header">
        <h5>Modal header</h5>
      </slot>
      <slot />

      <slot name="footer" />
    </div>
  {/if}
</div>

<style lang="postcss">
  .backdropVisible {
    visibility: visible !important;
  }

  .lg {
    @apply w-full;
    @apply max-w-lg;
  }

  .xl {
    @apply w-full;
    @apply max-w-xl;
  }

  .xxl {
    @apply w-full;
    @apply max-w-2xl;
  }
</style>
