<script lang="ts">
  import { page } from '$app/stores';
  import OpenClosedStatus from '../ui/OpenClosedStatus.svelte';
  import { menuData } from '$lib/stores/menu-store.svelte.js';

  interface Props {
    currentPage?: string;
  }

  let { currentPage = 'home' }: Props = $props();

  const navigationItems = [
    { href: '/', label: 'Home', id: 'home' },
    { href: '/menu', label: 'Menu', id: 'menu' },
    { href: '/about', label: 'About', id: 'about' },
    { href: '/hours', label: 'Hours & Location', id: 'hours' }
  ];

  $: currentPath = $page.url.pathname;
</script>

<header class="bg-primos-blue-900 border-b-2 border-primos-gold-500 sticky top-0 z-50">
  <div class="container mx-auto px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo / Brand -->
      <div class="flex items-center space-x-4">
        <a href="/" class="flex items-center space-x-2 group">
          <span class="text-2xl font-bold text-primos-gold-500 group-hover:text-primos-gold-400 transition-colors">
            🍕 Primo's Pizza
          </span>
        </a>
        
        <!-- Open/Closed Status - Mobile Hidden -->
        {#if menuData()?.restaurant}
          <div class="hidden md:block">
            <OpenClosedStatus 
              restaurantInfo={menuData().restaurant} 
              size="small" 
              showMessage={false} 
            />
          </div>
        {/if}
      </div>

      <!-- Navigation -->
      <nav class="hidden md:flex items-center space-x-1">
        {#each navigationItems as item}
          <a
            href={item.href}
            class="px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 {
              currentPath === item.href || currentPage === item.id
                ? 'bg-primos-gold-500 text-primos-blue-900'
                : 'text-primos-gold-500 hover:bg-primos-blue-800 hover:text-primos-gold-400'
            }"
          >
            {item.label}
          </a>
        {/each}
      </nav>

      <!-- Mobile Menu Button -->
      <div class="md:hidden">
        <button
          id="mobile-menu-button"
          class="text-primos-gold-500 hover:text-primos-gold-400 focus:outline-none focus:text-primos-gold-400"
          onclick="toggleMobileMenu()"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div id="mobile-menu" class="md:hidden hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 border-t border-primos-gold-500/20">
        {#each navigationItems as item}
          <a
            href={item.href}
            class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 {
              currentPath === item.href || currentPage === item.id
                ? 'bg-primos-gold-500 text-primos-blue-900'
                : 'text-primos-gold-500 hover:bg-primos-blue-800 hover:text-primos-gold-400'
            }"
          >
            {item.label}
          </a>
        {/each}
        
        <!-- Mobile Open/Closed Status -->
        {#if menuData()?.restaurant}
          <div class="px-3 py-2">
            <OpenClosedStatus 
              restaurantInfo={menuData().restaurant} 
              size="small" 
              showMessage={true} 
            />
          </div>
        {/if}
        
        <!-- Contact Info -->
        <div class="px-3 py-2 border-t border-primos-gold-500/20 mt-2">
          <a 
            href="tel:248-476-4260" 
            class="block text-primos-gold-500 hover:text-primos-gold-400 font-medium"
          >
            📞 (248) 476-4260
          </a>
        </div>
      </div>
    </div>
  </div>
</header>

<script>
  function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  }
</script>