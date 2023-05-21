<script lang="ts">
  import { Panel } from '$lib';
  import { Network, network } from '$src/stores/network';

  function toggleNetwork() {
    network.set($network === Network.Devnet ? Network.Mainnet : Network.Devnet);
  }
</script>

<Panel>
  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text mr-3">Network</span>
      <input type="checkbox" class="toggle" on:click={toggleNetwork} />
      <span class="label-text ml-3 w-14">{$network}</span>
    </label>
  </div>
</Panel>
