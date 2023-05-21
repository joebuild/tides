<script lang="ts">
  export let type: 'button' | 'reset' | 'submit' = 'button',
    active = false,
    style: 'primary' | 'outline' | 'success' | 'error' = 'primary',
    size: 'normal' | 'small' = 'normal',
    loading = false,
    disabled = false;
</script>

<button
  class="btn btn-{style} font-light {style === 'error' && 'text-base-content'}"
  class:active
  class:loading
  class:btn-sm={size === 'small'}
  {type}
  {disabled}
  on:click
>
  <slot>Click</slot>
</button>
