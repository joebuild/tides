<script lang="ts">
  export let label = '',
    stat = '',
    prefix = '',
    suffix = '';
</script>

<div class="flex flex-col">
  <div class="text-center text-info text-xs uppercase">
    {label}
  </div>
  <div class="text-center text-sm">
    {prefix}{stat}{suffix}
  </div>
</div>
