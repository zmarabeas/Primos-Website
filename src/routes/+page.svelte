<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from '$app/navigation';
  import OpenClosedStatus from '$lib/components/ui/OpenClosedStatus.svelte';
  import { menuData, initializeMenuData } from '$lib/stores/menu-store.svelte.js';

  onMount(async () => {
    // Initialize menu data to get restaurant info for hours
    try {
      await initializeMenuData();
    } catch (error) {
      console.error('Failed to initialize menu data:', error);
    }
  });

  function goToMenu() {
    goto('/menu');
  }

  function goToAbout() {
    goto('/about');
  }

  function goToHours() {
    goto('/hours');
  }
</script>

<svelte:head>
  <title>Primo's Pizza - Livonia's Favorite Pizza Since 1985</title>
  <meta name="description" content="Primo's Pizza - Serving authentic hand-tossed pizzas, broasted chicken, and comfort food in Livonia, Michigan since 1985. Family-owned and operated." />
</svelte:head>

<div class="main">
  <div class="title-div">
    <div class="header-content">
      <h1 class="main-title">Primo's Pizza</h1>
      <span class="location-label">7 Mile & Farmington - Livonia</span>
      <span class="tagline"><i>official website</i></span>
      
      <!-- Open/Closed Status -->
      {#if menuData()?.restaurant}
        <div class="status-container">
          <OpenClosedStatus 
            restaurantInfo={menuData().restaurant} 
            size="medium" 
            showMessage={true} 
          />
        </div>
      {/if}
      
      <div class="contact-info">
        <span class="call-label">Call to Order!</span>
        <h2 class="phone-number">(248) 476-4260</h2>
      </div>
    </div>
    
    <div class="navigation-container">
      <button class="nav-btn primary" onclick={goToMenu}>
        <span>View Menu</span>
      </button>
      <button class="nav-btn" onclick={goToAbout}>
        <span>About Us</span>
      </button>
      <button class="nav-btn" onclick={goToHours}>
        <span>Hours & Location</span>
      </button>
    </div>
  </div>
  
  <div class="hero-section">
    <div class="hero-content">
      <h2 class="hero-title">Authentic Italian-American Cuisine</h2>
      <p class="hero-description">
        Family-owned and operated since 1985, serving the Livonia community with 
        hand-tossed pizzas, broasted chicken, BBQ ribs, and classic comfort food.
      </p>
      <div class="hero-features">
        <div class="feature">
          <span class="feature-icon">🍕</span>
          <span>Hand-Tossed Pizza</span>
        </div>
        <div class="feature">
          <span class="feature-icon">🍗</span>
          <span>Broasted Chicken</span>
        </div>
        <div class="feature">
          <span class="feature-icon">🍖</span>
          <span>BBQ Ribs</span>
        </div>
        <div class="feature">
          <span class="feature-icon">🥪</span>
          <span>Fresh Subs</span>
        </div>
      </div>
      <button class="cta-button" onclick={goToMenu}>
        Browse Our Full Menu
      </button>
    </div>
  </div>
</div>

<style>
  .main {
    background-color: #253a80;
    min-height: 100vh;
    width: 100vw;
    display: flex;
    margin-left: -8px;
    margin-top: -8px;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    overflow-y: auto;
    position: relative;
  }

  .title-div {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    background-color: #253a80;
    padding: 2rem 1rem;
    text-align: center;
    border-bottom: 3px solid #e3b212;
  }

  .header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 2rem;
  }

  .main-title {
    color: #e3b212;
    font-size: 3rem;
    margin: 0;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }

  .location-label {
    color: #e3b212;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .tagline {
    color: #e3b212;
    font-size: 0.9rem;
    opacity: 0.8;
    font-style: italic;
  }

  .status-container {
    margin: 1rem 0;
    padding: 0.5rem;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    backdrop-filter: blur(5px);
  }

  .contact-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .call-label {
    color: #e3b212;
    font-size: 1rem;
    font-weight: 500;
  }

  .phone-number {
    color: #e3b212;
    font-size: 2.5rem;
    margin: 0;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    letter-spacing: 2px;
  }

  .navigation-container {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 600px;
    flex-wrap: wrap;
  }

  .nav-btn {
    background-color: #e3b212;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    color: #253a80;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .nav-btn.primary {
    background-color: #e3b212;
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(227, 178, 18, 0.4);
  }

  .nav-btn:hover {
    box-shadow: 0 4px 20px rgba(227, 178, 18, 0.6);
    transform: translateY(-2px);
  }

  .nav-btn.primary:hover {
    transform: scale(1.05) translateY(-2px);
  }

  .hero-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    width: 100%;
    max-width: 800px;
  }

  .hero-content {
    text-align: center;
    color: white;
    max-width: 600px;
  }

  .hero-title {
    font-size: 2.5rem;
    color: #e3b212;
    margin: 0 0 1rem 0;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }

  .hero-description {
    font-size: 1.2rem;
    line-height: 1.6;
    margin: 0 0 2rem 0;
    opacity: 0.9;
  }

  .hero-features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(227, 178, 18, 0.3);
  }

  .feature-icon {
    font-size: 2rem;
  }

  .feature span:last-child {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .cta-button {
    background: linear-gradient(45deg, #e3b212, #f5c842);
    border: none;
    border-radius: 10px;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    color: #253a80;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 2rem;
    box-shadow: 0 4px 15px rgba(227, 178, 18, 0.3);
  }

  .cta-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(227, 178, 18, 0.5);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .main-title {
      font-size: 2.5rem;
    }
    
    .phone-number {
      font-size: 2rem;
    }
    
    .hero-title {
      font-size: 2rem;
    }
    
    .hero-description {
      font-size: 1.1rem;
    }
    
    .navigation-container {
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .nav-btn {
      width: 100%;
      max-width: 300px;
    }
  }
</style>
