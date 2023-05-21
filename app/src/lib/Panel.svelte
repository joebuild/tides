<script lang="ts">
  let klass = '';
  export { klass as class };
</script>

<div class="rounded border border-gray-700 bg-base-200 p-3 {klass}">
  <slot />
</div>
