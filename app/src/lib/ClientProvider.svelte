<script lang="ts">
  import { workSpace } from '@svelte-on-solana/wallet-adapter-anchor';
  import { walletStore } from '@svelte-on-solana/wallet-adapter-core';
  import {
    tidesClient as tidesClientStore,
    timestreamClient as timestreamClientStore,
  } from '$utils/clients';
  import { TidesClient } from '$src/TidesClient';
  import { TimestreamQueryClient } from '@aws-sdk/client-timestream-query';

  function defineClients(workSpaceArg) {
    const client = new TidesClient(workSpaceArg.provider);
    tidesClientStore.set(client);

    // permissions on these credentials are just read-only timestream
    const credentials = {
      accessKeyId: 'xxx',
      secretAccessKey: 'xxx',
    };
    const timestreamClient = new TimestreamQueryClient({
      region: 'us-east-1',
      credentials: credentials,
      apiVersion: 'latest',
    });
    timestreamClientStore.set(timestreamClient);
  }

  $: $walletStore &&
    $walletStore.publicKey &&
    $walletStore.connected &&
    defineClients($workSpace);
</script>

<slot />
