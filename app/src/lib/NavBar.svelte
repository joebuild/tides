<script lang="ts">
  import { page } from '$app/stores';
  import { navigation } from '$utils/navigation';
  import { dev } from '$app/environment';
  console.log('dev: ', dev);

  function external(ref: string) {
    if (ref.includes('docs')) {
      return '_blank';
    } else {
      return '';
    }
  }
</script>

<div>
  <ul class="menu horizontal w-full">
    {#each navigation as { href }}
      {#if !(!dev && href === '/admin')}
        <li class="mx-1">
          <a
            {href}
            class="capitalize rounded-btn active:bg-secondary"
            class:active={$page.url.pathname === href}
            target={external(href)}
          >
            {#if href.includes('docs')}
              docs ⇗
            {:else}
              {href.replace('/', '').replace('-', '\u00a0')}
            {/if}
          </a>
        </li>
      {/if}
    {/each}
  </ul>
</div>
