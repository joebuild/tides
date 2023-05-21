<script lang="ts">
  import { fade } from 'svelte/transition';
  import twitter from '$icons/twitter.svg?src';
  import docs from '$icons/docs.svg?src';
  import gitlab from '$icons/gitlab.svg?src';
  import discord from '$icons/discord.svg?src';

  const links = [
    // {
    //   icon: gitlab,
    //   href: 'https://gitlab.com/joebuild',
    //   label: 'Gitlab',
    // },
    {
      icon: twitter,
      href: 'https://twitter.com/tides_finance',
      label: 'Twitter',
    },
    {
      icon: discord,
      href: 'https://discord.gg/sRAgEgKSu8',
      label: 'Discord',
    },
    {
      icon: docs,
      href: 'https://docs.tides.finance/',
      label: 'Docs',
    },
  ];
</script>

<footer
  class="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4"
  in:fade={{ duration: 300 }}
>
  {#each links as { icon, href, label }}
    <a {href} target="_blank" rel="noreferrer" aria-label={label}>
      <span class="icons">
        {@html icon}
      </span>
    </a>
  {/each}
  <span />
</footer>

<style lang="postcss">
  :global(.icons svg) {
    @apply fill-primary;
  }

  :global(.icons svg:hover) {
    @apply fill-white;
  }
</style>
