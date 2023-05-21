<script lang="ts">
  import { Panel, TxButton } from '$lib';
  import type { Market, OptionSide } from '$src/types';
  import BN from 'bn.js';
  import { tidesClient } from '$utils/clients';

  export let title = 'title panel',
    marketsList: Market[],
    collateralArray: number[],
    callOrPut: OptionSide,
    amount;

  let klass = '';
  export { klass as class };
</script>

<div class={klass}>
  <p class="text-center py-2">{title}</p>
  <Panel class="overflow-x-auto">
    <table class="table table-compact w-full">
      <thead>
        <tr>
          <th class="text-xs">Collateral</th>
          <th class="text-xs" />
          <th class="text-xs" />
        </tr>
      </thead>
      <tbody>
        {#if marketsList && collateralArray}
          {#each marketsList as market, i}
            <tr>
              <td>
                {(
                  collateralArray[i] /
                  10 ** market?.collateralDecimals
                ).toFixed(2)}
              </td>
              <td>
                <TxButton
                  klass="h-auto btn btn-xs btn-secondary"
                  rpcCall={async () =>
                    $tidesClient.marketSideDeposit(
                      market.index,
                      callOrPut,
                      new BN(amount),
                    )}
                >
                  Deposit
                </TxButton>
              </td>
              <td>
                <TxButton
                  klass="h-auto btn btn-xs btn-secondary"
                  rpcCall={async () =>
                    $tidesClient.marketSideWithdraw(
                      market.index,
                      callOrPut,
                      new BN(amount),
                    )}
                >
                  Withdraw
                </TxButton>
              </td>
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </Panel>
</div>
