<script lang="ts">
  import type { TokenInfo } from '@solana/spl-token-registry';

  export let token = {} as TokenInfo;
</script>

{#if token.symbol}
  <img class="w-6" src={token.logoURI} alt="logo" />
{/if}
