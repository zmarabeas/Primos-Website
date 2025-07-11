<script lang="ts">
  import { onMount } from "svelte";
  import MenuItem from "$lib/components/menu/MenuItem.svelte";
  import ListMenuItem from "$lib/components/menu/ListMenuItem.svelte";
  import SearchBar from "$lib/components/ui/SearchBar.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import LoadingSpinner from "$lib/components/ui/LoadingSpinner.svelte";
  import OpenClosedStatus from "$lib/components/ui/OpenClosedStatus.svelte";
  import { GridIcon, ListIcon } from "$lib/components/icons/index.js";
  import {
    menuData,
    loading,
    error,
    searchQuery,
    viewMode,
    filteredMenuItems,
    availableCategories,
    menuStats,
    updateSearchQuery,
    setViewMode,
    initializeMenuData
  } from "$lib/stores/menu-store.svelte.js";
  import {
    addToCart
  } from "$lib/stores/cart-store.svelte.js";
  import { ENABLE_ORDERING } from "$lib/config/features.js";
  import type { MenuItem as MenuItemType } from "$lib/types/menu";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MenuItemWithIgnore: any = MenuItem;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ListMenuItemWithIgnore: any = ListMenuItem;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SearchBarWithIgnore: any = SearchBar;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ButtonWithIgnore: any = Button;

  let isSearching = $state(false);

  onMount(async () => {
    console.log('🚀 Menu page mounted, checking menu data...');
    
    // Initialize menu data if not already loaded
    if (!menuData()) {
      console.log('📝 Menu data not found, initializing...');
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Menu loading timeout - data took too long to load')), 10000);
      });
      
      try {
        await Promise.race([initializeMenuData(), timeoutPromise]);
        console.log('🎉 Menu initialization completed in onMount');
      } catch (err) {
        console.error('💥 Menu initialization failed in onMount:', err);
      }
    } else {
      console.log('✨ Menu data already available');
    }
  });

  function handleAddToCart(item: MenuItemType) {
    // Cart functionality preserved but only functional when ordering enabled
    if (ENABLE_ORDERING) {
      const success = addToCart(item, {
        selectedSize: item.sizes?.[0] || null,
        selectedToppings: [],
        selectedAddOns: [],
        quantity: 1
      });
      
      if (success) {
        console.log(`Added ${item.name} to cart`);
      }
    }
  }

  function handleSearchInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    updateSearchQuery(query);
    isSearching = query.trim().length > 0;
  }

  function handleViewModeToggle() {
    setViewMode(viewMode() === 'grid' ? 'list' : 'grid');
  }

  function handleSearch(query: string) {
    updateSearchQuery(query);
    isSearching = query.trim().length > 0;
  }

  function clearSearch() {
    updateSearchQuery('');
    isSearching = false;
  }

  function scrollToCategory(categoryId: string) {
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }

  function isItemAvailable(item: any) {
    return item.available;
  }

  function getRestaurantName() {
    return (menuData() as any)?.restaurant?.name || 'Primos Pizza';
  }

  // Get categories to display (either filtered for search or all)
  $: categoriesToShow = isSearching 
    ? availableCategories().filter(category => 
        category.items.some(item => 
          isItemAvailable(item) && (
            item.name.toLowerCase().includes(searchQuery().toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery().toLowerCase())
          )
        )
      ).map(category => ({
        ...category,
        items: category.items.filter(item => 
          isItemAvailable(item) && (
            item.name.toLowerCase().includes(searchQuery().toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery().toLowerCase())
          )
        )
      }))
    : availableCategories().map(category => ({
        ...category,
        items: category.items.filter(isItemAvailable)
      }));
</script>

<svelte:head>
  <title>Menu - Primos Pizza</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
  {#if loading()}
    <div class="text-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primos-gold-500 mx-auto"></div>
      <p class="mt-4 text-white">Loading menu...</p>
    </div>
  {:else if error()}
    <div class="text-center py-12">
      <p class="text-red-600 text-lg">Error loading menu: {error()}</p>
      <button 
        class="mt-4 px-4 py-2 bg-primos-gold-500 text-primos-blue-900 rounded-lg hover:bg-primos-gold-600 font-medium"
        onclick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  {:else if menuData()}
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold text-white mb-2">
        {getRestaurantName()}
      </h1>
      <p class="text-primos-gold-500 mb-4">Our signature hand-tossed pizzas and more</p>
      
      <!-- Open/Closed Status -->
      {#if menuData()?.restaurant}
        <div class="flex justify-center mb-6">
          <OpenClosedStatus 
            restaurantInfo={menuData().restaurant} 
            size="medium" 
            showMessage={true} 
          />
        </div>
      {/if}
      
      {#if !ENABLE_ORDERING}
        <div class="mt-4 p-4 bg-[#F4F2EB] border border-gray-300 mx-auto max-w-md relative overflow-hidden">
          <!-- Noise overlay -->
          <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none"></div>
          <div class="relative z-10 text-center">
            <p class="font-medium mb-1 text-gray-900">🍕 Digital Menu</p>
            <p class="text-sm text-gray-700">For ordering, please call: <strong class="text-primos-blue-500">(248) 476-4260</strong></p>
            <p class="text-xs mt-1 text-gray-600">Prices subject to change</p>
          </div>
        </div>
      {/if}
    </header>

    <!-- Search Bar -->
    <div class="mb-6">
      <div class="max-w-2xl mx-auto">
        <SearchBarWithIgnore
          searchQuery={searchQuery()}
          placeholder="Search pizzas, appetizers, desserts..."
          onSearch={handleSearch}
          debounceMs={300}
          autofocus={false}
          showClearButton={true}
        />
        {#if isSearching}
          <div class="text-center mt-2">
            <button 
              class="text-primos-gold-500 hover:text-primos-gold-600 text-sm underline"
              onclick={clearSearch}
            >
              Clear search to browse all categories
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Category Navigation - Only show when not searching -->
    {#if !isSearching}
      <div class="mb-6">
        <div class="bg-[#F4F2EB] border border-gray-300 relative overflow-hidden">
          <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none"></div>
          <div class="relative z-10 p-4">
            <h3 class="text-lg font-bold text-primos-blue-900 mb-3 text-center">Browse Menu Sections</h3>
            <div class="flex flex-wrap justify-center gap-2">
              {#each availableCategories() as category}
                <button
                  class="bg-primos-blue-100 hover:bg-primos-blue-200 text-primos-blue-800 px-4 py-2 rounded-lg font-medium transition-colors"
                  onclick={() => scrollToCategory(category.id)}
                >
                  {category.name}
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- View Controls and Stats -->
    <div class="bg-[#F4F2EB] border border-gray-300 relative overflow-hidden mb-6">
      <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none"></div>
      <div class="relative z-10">
        <div class="flex flex-col sm:flex-row">
          <div class="flex flex-1 border-r border-gray-300 sm:border-r sm:border-b-0 border-b">
            <div class="flex h-full">
              <!-- View Mode Toggle -->
              <div class="flex-shrink-0 border-r border-gray-300 last:border-r-0">
                <button
                  class="w-full h-full px-6 py-2 text-sm font-medium transition-colors duration-200 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
                  onclick={handleViewModeToggle}
                >
                  <div class="flex items-center gap-2">
                    {#if viewMode() === 'grid'}
                      <ListIcon size={18} />
                      <span>List View</span>
                    {:else}
                      <GridIcon size={18} />
                      <span>Grid View</span>
                    {/if}
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Menu Stats -->
          <div class="flex-shrink-0 px-4 py-2 border-t border-gray-300 sm:border-t-0 sm:border-l">
            <div class="text-sm text-gray-700 font-medium">
              {#if isSearching}
                Showing {categoriesToShow.reduce((total, cat) => total + cat.items.length, 0)} search results
              {:else}
                Showing {menuStats().totalItems} items in {categoriesToShow.length} categories
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Display -->
    <div class="min-h-[400px]">
      {#if categoriesToShow.length === 0}
        <!-- Empty State -->
        <div class="text-center py-16">
          <div class="mb-4">
            <span class="text-6xl">🍕</span>
          </div>
          <h3 class="text-xl font-semibold text-white mb-2">
            {#if isSearching}
              No items found for "{searchQuery()}"
            {:else}
              No menu items available
            {/if}
          </h3>
          <p class="text-primos-gold-500 mb-6">
            {#if isSearching}
              Try adjusting your search terms or browse our categories
            {:else}
              Check back later for more delicious options
            {/if}
          </p>
          {#if isSearching}
            <button
              class="bg-primos-gold-500 text-primos-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-primos-gold-600 transition-colors"
              onclick={clearSearch}
            >
              Show All Items
            </button>
          {/if}
        </div>
      {:else}
        <!-- Menu Categories -->
        {#each categoriesToShow as category (category.id)}
          <section id="category-{category.id}" class="mb-12 scroll-mt-24">
            <!-- Category Header -->
            <div class="mb-6">
              <h2 class="text-3xl font-bold text-white mb-2">{category.name}</h2>
              {#if category.description}
                <p class="text-primos-gold-500 text-lg">{category.description}</p>
              {/if}
            </div>

            <!-- Category Items -->
            {#if viewMode() === 'grid'}
              <!-- Grid View -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 border border-gray-300 overflow-hidden bg-[#F4F2EB] mb-8">
                {#each category.items as item (item.id)}
                  <div class="relative border-r border-b border-gray-300 last:border-r-0 last:border-b-0 sm:last:border-r-0 sm:last:border-b-0 lg:last:border-r-0 lg:last:border-b-0 xl:last:border-r-0 xl:last:border-b-0">
                    <MenuItemWithIgnore item={item} onAddToCart={handleAddToCart} />
                  </div>
                {/each}
              </div>
            {:else}
              <!-- List View -->
              <div class="bg-[#F4F2EB] border border-gray-300 overflow-hidden relative mb-8">
                <!-- Noise overlay -->
                <div class="absolute inset-0 bg-[url('/noise.png')] bg-fit bg-repeat opacity-15 mix-blend-multiply pointer-events-none z-0"></div>
                <div class="relative z-10 divide-y divide-gray-300">
                  {#each category.items as item (item.id)}
                    <ListMenuItemWithIgnore item={item} onAddToCart={handleAddToCart} />
                  {/each}
                </div>
              </div>
            {/if}
          </section>
        {/each}
      {/if}
    </div>
  {/if}
</div>


