<script lang="ts">
  import { onMount } from 'svelte';
  import { menuData, initializeMenuData } from '$lib/stores/menu-store.svelte.js';
  import OpenClosedStatus from '$lib/components/ui/OpenClosedStatus.svelte';
  import { getFormattedHours } from '$lib/utils/restaurant-hours.js';

  let formattedHours: Record<string, string> = {};

  onMount(async () => {
    try {
      await initializeMenuData();
      if (menuData()?.restaurant) {
        formattedHours = getFormattedHours(menuData().restaurant);
      }
    } catch (error) {
      console.error('Failed to initialize menu data:', error);
    }
  });

  const dayNames = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };
</script>

<svelte:head>
  <title>Hours & Location - Primo's Pizza</title>
  <meta name="description" content="Find Primo's Pizza hours, location, and contact information. Visit us at 7 Mile & Farmington in Livonia, Michigan." />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- Header -->
  <header class="text-center mb-12">
    <h1 class="text-4xl font-bold text-white mb-4">Hours & Location</h1>
    <p class="text-primos-gold-500 text-lg mb-6">Visit us for fresh pizza and authentic Italian-American cuisine</p>
    
    {#if menuData()?.restaurant}
      <div class="flex justify-center mb-6">
        <OpenClosedStatus 
          restaurantInfo={menuData().restaurant} 
          size="large" 
          showMessage={true} 
        />
      </div>
    {/if}
  </header>

  <div class="grid lg:grid-cols-2 gap-8">
    <!-- Hours -->
    <div class="bg-[#F4F2EB] border border-gray-300 relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none"></div>
      <div class="relative z-10 p-6">
        <h2 class="text-2xl font-bold text-primos-blue-900 mb-6 text-center">Business Hours</h2>
        <div class="space-y-3">
          {#each Object.entries(dayNames) as [key, dayName]}
            <div class="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
              <span class="font-semibold text-gray-800">{dayName}</span>
              <span class="text-gray-700 font-medium">
                {formattedHours[key] || 'Loading...'}
              </span>
            </div>
          {/each}
        </div>
        <div class="mt-6 p-4 bg-primos-blue-100 rounded-lg border border-primos-blue-200">
          <p class="text-sm text-primos-blue-800 text-center">
            <strong>📞 Call ahead for large orders!</strong><br>
            Hours may vary on holidays
          </p>
        </div>
      </div>
    </div>

    <!-- Contact & Location -->
    <div class="bg-[#F4F2EB] border border-gray-300 relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none"></div>
      <div class="relative z-10 p-6">
        <h2 class="text-2xl font-bold text-primos-blue-900 mb-6 text-center">Contact & Location</h2>
        
        <!-- Phone -->
        <div class="mb-6 text-center">
          <div class="text-3xl mb-2">📞</div>
          <h3 class="text-xl font-bold text-primos-blue-900 mb-1">Phone</h3>
          <a href="tel:248-476-4260" class="text-2xl font-bold text-primos-gold-600 hover:text-primos-gold-700 transition-colors">
            (248) 476-4260
          </a>
          <p class="text-sm text-gray-600 mt-1">Call for takeout orders</p>
        </div>

        <!-- Address -->
        <div class="mb-6 text-center">
          <div class="text-3xl mb-2">📍</div>
          <h3 class="text-xl font-bold text-primos-blue-900 mb-2">Address</h3>
          <div class="text-gray-700 leading-relaxed">
            <p class="font-semibold">7 Mile & Farmington</p>
            <p>Livonia, MI 48152</p>
          </div>
        </div>

        <!-- Services -->
        <div class="mb-6 text-center">
          <div class="text-3xl mb-2">🚗</div>
          <h3 class="text-xl font-bold text-primos-blue-900 mb-2">Services</h3>
          <div class="flex flex-wrap justify-center gap-2">
            <span class="bg-primos-blue-100 text-primos-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Dine-In
            </span>
            <span class="bg-primos-blue-100 text-primos-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Takeout
            </span>
            <span class="bg-primos-blue-100 text-primos-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              U-Bake Pizza
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Payment Methods -->
  <div class="mt-8 bg-[#F4F2EB] border border-gray-300 relative overflow-hidden">
    <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none"></div>
    <div class="relative z-10 p-6 text-center">
      <h2 class="text-xl font-bold text-primos-blue-900 mb-4">We Accept</h2>
      <div class="flex justify-center items-center gap-6 flex-wrap">
        <div class="flex items-center gap-2">
          <span class="text-2xl">💳</span>
          <span class="text-gray-700 font-medium">Visa</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl">💳</span>
          <span class="text-gray-700 font-medium">MasterCard</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl">💳</span>
          <span class="text-gray-700 font-medium">American Express</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl">💳</span>
          <span class="text-gray-700 font-medium">Discover</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-2xl">💵</span>
          <span class="text-gray-700 font-medium">Cash</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Directions -->
  <div class="mt-8 bg-primos-gold-500 text-primos-blue-900 p-6 rounded-lg text-center">
    <h2 class="text-2xl font-bold mb-4">Find Us Easily</h2>
    <p class="text-lg mb-4">
      Located at the corner of 7 Mile Road and Farmington Road in Livonia
    </p>
    <div class="space-y-2 mb-6">
      <p><strong>From I-275:</strong> Exit at 7 Mile Road, head east about 1 mile</p>
      <p><strong>From I-96:</strong> Exit at Farmington Road, head north to 7 Mile Road</p>
    </div>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a 
        href="https://maps.google.com/?q=7+Mile+Farmington+Livonia+MI" 
        target="_blank" 
        rel="noopener noreferrer"
        class="bg-primos-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primos-blue-700 transition-colors inline-flex items-center justify-center gap-2"
      >
        <span>🗺️</span>
        Get Directions
      </a>
      <a href="/menu" class="bg-white text-primos-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
        View Menu
      </a>
    </div>
  </div>

  <!-- Additional Info -->
  <div class="mt-8 text-center">
    <div class="grid sm:grid-cols-2 gap-6">
      <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
        <h3 class="text-lg font-bold text-white mb-2">🎉 Special Orders</h3>
        <p class="text-primos-gold-500 text-sm">
          Call ahead for large orders, party trays, and catering. We're happy to accommodate special requests!
        </p>
      </div>
      <div class="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4">
        <h3 class="text-lg font-bold text-white mb-2">🏆 Local Favorite</h3>
        <p class="text-primos-gold-500 text-sm">
          Serving the Livonia community since 1985. Family-owned and operated with recipes passed down through generations.
        </p>
      </div>
    </div>
  </div>
</div>