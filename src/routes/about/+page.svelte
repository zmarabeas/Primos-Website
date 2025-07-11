<script lang="ts">
  import { onMount } from 'svelte';
  import { menuData, initializeMenuData } from '$lib/stores/menu-store.svelte.js';
  import OpenClosedStatus from '$lib/components/ui/OpenClosedStatus.svelte';

  onMount(async () => {
    try {
      await initializeMenuData();
    } catch (error) {
      console.error('Failed to initialize menu data:', error);
    }
  });
</script>

<svelte:head>
  <title>About Us - Primo's Pizza</title>
  <meta name="description" content="Learn about Primo's Pizza - a family-owned restaurant serving Livonia since 1985 with authentic Italian-American cuisine and time-honored recipes." />
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <!-- Header -->
  <header class="text-center mb-12">
    <h1 class="text-4xl font-bold text-white mb-4">About Primo's Pizza</h1>
    <div class="text-primos-gold-500 mb-4">
      <p class="text-xl">Family-owned since 1985</p>
      <p class="text-lg">Serving Livonia with authentic Italian-American cuisine</p>
    </div>
    
    {#if menuData()?.restaurant}
      <div class="flex justify-center">
        <OpenClosedStatus 
          restaurantInfo={menuData().restaurant} 
          size="medium" 
          showMessage={true} 
        />
      </div>
    {/if}
  </header>

  <!-- Main Content -->
  <div class="grid md:grid-cols-2 gap-8 mb-12">
    <!-- Our Story -->
    <div class="bg-[#F4F2EB] border border-gray-300 relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none"></div>
      <div class="relative z-10 p-6">
        <h2 class="text-2xl font-bold text-primos-blue-900 mb-4">Our Story</h2>
        <div class="text-gray-700 space-y-4">
          <p>
            Primo's Pizza has been a cornerstone of the Livonia community since 1985. What started as a dream 
            to bring authentic Italian-American cuisine to our neighborhood has grown into a beloved local institution.
          </p>
          <p>
            Our family-owned and operated restaurant has been serving generations of customers with the same 
            commitment to quality and tradition that we started with nearly four decades ago.
          </p>
          <p>
            Every pizza is hand-tossed, every recipe is time-honored, and every meal is prepared with the care 
            and attention that only comes from a family business that truly cares about its community.
          </p>
        </div>
      </div>
    </div>

    <!-- Our Commitment -->
    <div class="bg-[#F4F2EB] border border-gray-300 relative overflow-hidden">
      <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none"></div>
      <div class="relative z-10 p-6">
        <h2 class="text-2xl font-bold text-primos-blue-900 mb-4">Our Commitment</h2>
        <div class="text-gray-700 space-y-4">
          <p>
            We believe in using only the freshest ingredients, from our hand-rolled dough made daily to our 
            locally-sourced vegetables and premium meats.
          </p>
          <p>
            Our broasted chicken is prepared using a special pressure-frying technique that locks in flavor 
            and creates that perfect crispy exterior our customers love.
          </p>
          <p>
            Whether you're dining in with family or picking up for a quick meal, we're committed to providing 
            the same exceptional quality and service that has made us Livonia's favorite pizza destination.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Specialties -->
  <div class="bg-[#F4F2EB] border border-gray-300 relative overflow-hidden mb-12">
    <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none"></div>
    <div class="relative z-10 p-6">
      <h2 class="text-2xl font-bold text-primos-blue-900 mb-6 text-center">What We're Famous For</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="text-center">
          <div class="text-4xl mb-2">🍕</div>
          <h3 class="font-bold text-primos-blue-900 mb-2">Hand-Tossed Pizza</h3>
          <p class="text-sm text-gray-700">Made fresh daily with our signature sauce and premium toppings</p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-2">🍗</div>
          <h3 class="font-bold text-primos-blue-900 mb-2">Broasted Chicken</h3>
          <p class="text-sm text-gray-700">Pressure-fried to perfection with our special seasoning blend</p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-2">🍖</div>
          <h3 class="font-bold text-primos-blue-900 mb-2">BBQ Ribs</h3>
          <p class="text-sm text-gray-700">Slow-cooked and basted in our signature BBQ sauce</p>
        </div>
        <div class="text-center">
          <div class="text-4xl mb-2">🥪</div>
          <h3 class="font-bold text-primos-blue-900 mb-2">Fresh Submarines</h3>
          <p class="text-sm text-gray-700">Made-to-order subs with the freshest ingredients</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Values -->
  <div class="grid md:grid-cols-3 gap-6 mb-12">
    <div class="text-center">
      <div class="w-16 h-16 bg-primos-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">👨‍👩‍👧‍👦</span>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Family-Owned</h3>
      <p class="text-primos-gold-500">Three generations of family recipes and traditions</p>
    </div>
    <div class="text-center">
      <div class="w-16 h-16 bg-primos-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">🏘️</span>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Community Focused</h3>
      <p class="text-primos-gold-500">Proud to serve and support our Livonia neighbors</p>
    </div>
    <div class="text-center">
      <div class="w-16 h-16 bg-primos-gold-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <span class="text-2xl">⭐</span>
      </div>
      <h3 class="text-xl font-bold text-white mb-2">Quality First</h3>
      <p class="text-primos-gold-500">Fresh ingredients and time-honored cooking methods</p>
    </div>
  </div>

  <!-- Call to Action -->
  <div class="text-center bg-primos-gold-500 text-primos-blue-900 p-8 rounded-lg">
    <h2 class="text-2xl font-bold mb-4">Experience the Primo's Difference</h2>
    <p class="text-lg mb-6">Visit us today and taste why we've been Livonia's favorite for nearly 40 years!</p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a href="/menu" class="bg-primos-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primos-blue-700 transition-colors">
        View Our Menu
      </a>
      <a href="/hours" class="bg-white text-primos-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
        Hours & Location
      </a>
    </div>
  </div>
</div>