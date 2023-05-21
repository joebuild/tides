<script lang="ts">
  export let value: number,
    name = 'Range component',
    max: number,
    min: number,
    step: number,
    unit = '',
    subunit = '';

  $: nameFormatted = name.replace(/\s/g, '-').toLowerCase();
  $: subunitValue = value * (value + 1) * 0.5;
</script>

<div class="form-control border-0 bg-base-100">
  <label class="label" for={nameFormatted}>
    <span class="label-text">{name}</span>
    {#if unit}
      <span class="label-text">{value} {unit}</span>
      {#if subunit}
        <span class="label-text">({subunitValue} {subunit})</span>
      {/if}
    {/if}
  </label>
  <input
    type="range"
    {max}
    {min}
    {step}
    bind:value
    class="range"
    name={nameFormatted}
    id={nameFormatted}
  />
</div>
