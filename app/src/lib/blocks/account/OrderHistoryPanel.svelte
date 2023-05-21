<script lang="ts">
  import { onMount } from 'svelte';
  import { Panel } from '$lib';
  import { tidesClient } from '$utils/clients';
  import { orderHistory, setOrderHistory } from '$src/stores/orderHistory';

  onMount(async () => {
    await setOrderHistory(
      $tidesClient.program,
      $tidesClient.provider.wallet.publicKey,
    );
  });
</script>

<div class="flex flex-col w-full grow-1">
  <Panel class="h-full overflow-x-auto">
    <table class="table table-compact w-full">
      <thead>
        <tr>
          <th>Market</th>
          <th>Type</th>
          <th>Side</th>
          <th>Position Size (asset)</th>
          <th>Asset Value ($)</th>
          <th>Funding ($)</th>
          <th>Fees ($)</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {#each $orderHistory as record, i}
          <tr>
            <td>SOL</td>
            <td class="capitalize">{Object.keys(record.optionSide)[0]}</td>
            <td class="capitalize"
              >{record.quoteAmount.toNumber() > 0 ? 'Long' : 'Short'}</td
            >
            <td>{(record.quoteAmount.toNumber() / 10 ** 6).toFixed(2)}</td>
            <td>{(record.baseAmount.toNumber() / 10 ** 6).toFixed(2)}</td>
            <td>{(record.cumulativeFunding.toNumber() / 10 ** 6).toFixed(2)}</td
            >
            <td>{(record.fee.toNumber() / 10 ** 6).toFixed(3)}</td>
            <td>{new Date(record.ts.toNumber() * 1000).toLocaleString()}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </Panel>
</div>
