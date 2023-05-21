<script lang="ts">
  import { Panel, TxButton } from '$lib';
  import type { Market } from '$src/types';
  import { bytesToString } from '$src/utils/misc';
  import { tidesClient } from '$src/utils/clients';

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
            <td>{bytesToString(market.symbolQuote)}</td>
            <td>
              <TxButton
                klass="h-auto btn btn-xs {market.marketPaused
                  ? 'btn-success'
                  : 'btn-warning'}"
                rpcCall={market.marketPaused
                  ? async () => $tidesClient.marketResume(market.index)
                  : async () => $tidesClient.marketPause(market.index)}
              >
                {market.marketPaused ? 'Resume' : 'Pause'}
              </TxButton>
            </td>
            <td>
              <TxButton
                klass="h-auto btn btn-xs btn-accent"
                rpcCall={async () => $tidesClient.marketClose(market.index)}
                disabled={!market.marketPaused}
              >
                Destroy
              </TxButton>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </Panel>
</div>
