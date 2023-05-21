<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { Panel, TxButton } from '$lib';
  import { CreateUserButton } from '$lib';
  import { setCvPositions, cvPositions } from '$src/stores/positions';
  import { tidesClient } from '$utils/clients';
  import { userExists } from '$src/stores/user';
  import { markets } from '$src/stores/markets';
  import { getNetValueReadable } from '$src/utils/positions';
  import { fundingData } from '$src/stores/funding';
  import { bytesToString } from '$src/utils/misc';
  import type { CollateralVaultPosition, Market } from '$src/types';
  import type { PublicKey } from '@solana/web3.js';

  onMount(async () => {
    await setCvPositions(
      $tidesClient.program,
      $tidesClient.provider.wallet.publicKey,
    );
  });

  let updateTriggerCounter = 1;
  $: updateTrigger = updateTriggerCounter;

  $: marketsArray = $markets && ($markets.markets as Market[]);

  async function closeCvPosition(
    cvPosition: CollateralVaultPosition,
    cvPositionAddr: PublicKey,
  ): Promise<string> {
    return $tidesClient.collateralVaultPositionClose(cvPositionAddr);
  }

  type PositionRow = {
    cvPositionData: CollateralVaultPosition;
    cvPositionAddr: PublicKey;
    market: string;
    optionType: string;
    deposit: number;
    tradDiff: number;
    fees: number;
    net: number;
    roi: number;
  };

  $: positionRows =
    marketsArray &&
    $fundingData &&
    $cvPositions &&
    updateTrigger &&
    $cvPositions.map(positionObj => {
      const position = positionObj[0];

      return {
        cvPositionData: positionObj[0],
        cvPositionAddr: positionObj[1],
        market: bytesToString(marketsArray[position.marketIndex].symbolQuote),
        optionType: Object.keys(position.side)[0],
        deposit:
          position.depositAmount /
          10 ** marketsArray[position.marketIndex].collateralDecimals,
        tradeDiff: 0,
        fees: 0,
        net: 0,
        roi: 0,
      };
    });

  const interval = setInterval(async () => {
    await setCvPositions(
      $tidesClient.program,
      $tidesClient.provider.wallet.publicKey,
    );

    updateTriggerCounter += 1;
  }, 30 * 1000);

  onDestroy(() => clearInterval(interval));
</script>

<Panel class="flex flex-col h-full">
  <div class="text-center">Positions</div>

  {#if !$userExists}
    <div class="flex flex-col grow place-content-center place-items-center">
      <CreateUserButton />
    </div>
  {:else}
    <div class="overflow-x-auto">
      <table class="table table-compact w-full">
        <thead>
          <tr>
            <th>Market</th>
            <th>Type</th>
            <th>Deposit ($)</th>
            <th>Trading Difference ($)</th>
            <th>Fees Earned ($)</th>
            <th>Net Value ($)</th>
            <th>ROI</th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {#if $cvPositions && marketsArray && positionRows}
            {#key $fundingData}
              {#key $cvPositions}
                {#each positionRows as pRow}
                  <tr>
                    <td>{pRow.market}</td>
                    <td class="capitalize">{pRow.optionType}</td>
                    <th>{pRow.deposit.toFixed(2)}</th>
                    <td>{pRow.tradeDiff.toFixed(2)}</td>
                    <td>{pRow.fees.toFixed(2)}</td>
                    <td>{pRow.net.toFixed(2)}</td>
                    <td>{pRow.roi.toFixed(2)}</td>
                    <td class="px-2">
                      <TxButton
                        klass="h-auto btn btn-xs btn-secondary"
                        rpcCall={async () =>
                          closeCvPosition(
                            pRow.cvPositionData,
                            pRow.cvPositionAddr,
                          )}
                      >
                        Close
                      </TxButton>
                    </td>
                  </tr>
                {/each}
              {/key}
            {/key}
          {/if}
        </tbody>
      </table>
    </div>
  {/if}
</Panel>
