<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getRestaurantStatus } from '$lib/utils/restaurant-hours.js';
  interface Props {
    restaurantInfo: any;
    size?: 'small' | 'medium' | 'large';
    showMessage?: boolean;
  }

  let { restaurantInfo, size = 'medium', showMessage = true }: Props = $props();

  let status = $state(getRestaurantStatus(restaurantInfo));
  let updateInterval: number;

  // Update status every minute
  onMount(() => {
    updateStatus();
    updateInterval = setInterval(updateStatus, 60000); // Update every minute
  });

  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
  });

  function updateStatus() {
    status = getRestaurantStatus(restaurantInfo);
  }

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2'
  };

  const statusClasses = {
    open: 'bg-green-600 text-white',
    'closing-soon': 'bg-yellow-600 text-white',
    'opening-soon': 'bg-blue-600 text-white',
    closed: 'bg-red-600 text-white'
  };
</script>

<div class="flex items-center gap-2">
  <div class="flex items-center gap-2 rounded-full font-medium {sizeClasses[size]} {statusClasses[status.status]}">
    <div class="w-2 h-2 rounded-full bg-current animate-pulse"></div>
    <span class="capitalize font-semibold">
      {status.isOpen ? 'Open' : 'Closed'}
    </span>
  </div>
  
  {#if showMessage && status.message}
    <span class="text-sm text-gray-600 font-medium">
      {status.message}
    </span>
  {/if}
</div>