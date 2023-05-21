<script lang="ts">
  import { Title } from '$lib';
</script>

<Title />

<div class="flex flex-col h-96 place-content-center space-y-3">
  <div class="text-center text-4xl">Tides</div>

  <div class="text-center text-xl">Floating Strike Everlasting Options</div>
  <br />
  <div class="text-center text-l">
    A single strike price based on an exponential moving average. No expiries.
  </div>
  <div class="text-center text-l">
    Consolidating the options market into a single instrument using perpetuals
    with zero spread.
  </div>
  <br />
  <div class="text-center text-l z-10">
    Thanks to Paradigm for the
    <a
      href="https://www.paradigm.xyz/static/everlasting_options.pdf"
      class="underline"
      target={'_blank'}
    >
      inspiration
    </a>
  </div>
</div>

<div
  class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
>
  <img class="w-96 opacity-25" src="/images/moon.png" alt="logo" />
</div>
