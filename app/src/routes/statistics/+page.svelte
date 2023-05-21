<script lang="ts">
  import { Title } from '$lib';
  import { StatisticsPanelLayout } from '$lib/blocks/statistics';
</script>

<Title page="statistics" />

<div
  class="flex flex-col w-full grow-1 p-2 gap-2 h-full max-h-screen overflow-y-scroll"
>
  <StatisticsPanelLayout />
</div>
