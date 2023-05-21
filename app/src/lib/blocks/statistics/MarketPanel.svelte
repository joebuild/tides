<script lang="ts">
  import { Panel, TxButton } from '$lib';
  import type { Market } from '$src/types';
  import { bytesToString } from '$src/utils/misc';

  export let title = 'title panel',
    marketsList: Market[];

  let klass = '';
  export { klass as class };
</script>

<div class={klass}>
  <p class="text-center py-2">{title}</p>
  <Panel>
    <table class="table table-compact w-full">
      <thead>
        <tr>
          <th class="h-8" />
        </tr>
      </thead>
      <tbody class="text-center">
        {#each marketsList as market, i}
          <tr>
            <td>{bytesToString(market.symbolQuote) || 'SOL'}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </Panel>
</div>
