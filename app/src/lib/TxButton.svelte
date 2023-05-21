<script lang="ts">
  import { Network, network } from '$src/stores/network';
  import { addToast } from '$src/stores/toasts';

  export let klass;
  export let preRpcCall = async () => {
    return '';
  };
  export let rpcCall = async () => {
    return '';
  };
  export let successCallback = async () => {
    return '';
  };
  export let errorCallback = async () => {
    return '';
  };
  export let disabled = false;
  export let successMessage = '';
  export let errorMessage = '';

  let tx_sig;
  let loading = false;

  const networkSuffix = $network === Network.Devnet ? '?cluster=devnet' : '';

  async function submit() {
    loading = true;

    try {
      await preRpcCall();
      tx_sig = await rpcCall();

      addToast({
        message: successMessage,
        txLink: tx_sig
          ? 'https://explorer.solana.com/tx/' + tx_sig + networkSuffix
          : '',
        type: 'success',
      });

      await successCallback();
    } catch (e) {
      addToast({
        message: errorMessage,
        txLink: tx_sig
          ? 'https://explorer.solana.com/tx/' + tx_sig + networkSuffix
          : '',
        error: e,
        type: 'error',
      });

      console.log(e);
      console.log(e.logs);
      console.log(JSON.stringify(e));
      await errorCallback();
    }
    if (tx_sig) {
      console.log('https://explorer.solana.com/tx/' + tx_sig + networkSuffix);
    }
    loading = false;
  }
</script>

<button class={klass} on:click={submit} class:loading {disabled}>
  <slot />
</button>
