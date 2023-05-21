<script lang="ts">
  export let value = '',
    type = 'text',
    placeholder = '',
    name = 'Input component',
    textarea = false,
    min = null,
    info = '';

  function typeAction(node: HTMLInputElement) {
    node.type = type;
  }

  $: nameFormatted = name.replace(/\s/g, '-').toLowerCase();
</script>

<div class="form-control border-0 bg-base-100">
  <label class="label" for={nameFormatted}>
    <span class="label-text">{name}</span>
  </label>
  {#if !textarea}
    <input
      {placeholder}
      class="input input-bordered text-base-content"
      name={nameFormatted}
      id={nameFormatted}
      {min}
      use:typeAction
      bind:value
    />
  {:else}
    <textarea
      class="textarea h-24 textarea-bordered text-base-content"
      {placeholder}
      bind:value
    />
  {/if}

  {#if info}
    <span class="label label-text-alt">Forgot username?</span>
  {/if}
</div>
