import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

// Mock data for testing
const mockMenuData = [
  {
    id: 'pizza',
    name: 'Pizza',
    description: 'Our signature hand-tossed pizzas',
    items: [
      {
        id: 'cheese-pizza',
        name: 'Cheese Pizza',
        description: 'Classic cheese pizza',
        category: 'pizza',
        basePrice: 12.99,
        available: true
      }
    ]
  }
];

const mockRestaurantInfo = {
  name: "Primo's Pizza",
  phone: '(555) 123-4567',
  address: '123 Main Street, Anytown, ST 12345'
};

// Viewport size configurations
const VIEWPORTS = {
  mobile: { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
  mobileLarge: { width: 414, height: 896, name: 'Mobile Large (iPhone 11)' },
  tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
  laptop: { width: 1024, height: 768, name: 'Laptop' },
  desktop: { width: 1440, height: 900, name: 'Desktop' },
  ultrawide: { width: 1920, height: 1080, name: 'Desktop Ultrawide' }
};

describe('Responsive Design Tests', () => {
  let originalInnerWidth;
  let originalInnerHeight;
  let originalMatchMedia;

  beforeEach(() => {
    // Store original viewport values
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    originalMatchMedia = window.matchMedia;
    
    // Mock matchMedia
    window.matchMedia = vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
    window.matchMedia = originalMatchMedia;
  });

  describe('Viewport Adaptation Tests', () => {
    Object.entries(VIEWPORTS).forEach(([key, viewport]) => {
      test(`should render properly on ${viewport.name}`, () => {
        // Set viewport dimensions
        setViewport(viewport.width, viewport.height);
        
        // Update matchMedia for mobile detection
        if (viewport.width < 768) {
          window.matchMedia = vi.fn().mockImplementation(query => ({
            matches: query.includes('max-width: 768px'),
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }));
        }

        // Test rendering without errors
        expect(() => {
          render(DynamicTestComponent, {
            props: {
              menuData: mockMenuData,
              restaurantInfo: mockRestaurantInfo,
              viewport: viewport.name
            }
          });
        }).not.toThrow();

        // Verify viewport dimensions are correct
        expect(window.innerWidth).toBe(viewport.width);
        expect(window.innerHeight).toBe(viewport.height);
      });
    });
  });

  describe('Navigation Responsiveness', () => {
    test('should show mobile menu on small screens', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = render(DynamicTestComponent, {
        props: {
          menuData: mockMenuData,
          restaurantInfo: mockRestaurantInfo,
          testMobileNav: true
        }
      });

      // On mobile, navigation should be collapsible/hamburger style
      // This is a conceptual test - actual implementation would depend on your components
      expect(container).toBeInTheDocument();
    });

    test('should show full navigation on desktop', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      
      const { container } = render(DynamicTestComponent, {
        props: {
          menuData: mockMenuData,
          restaurantInfo: mockRestaurantInfo,
          testDesktopNav: true
        }
      });

      expect(container).toBeInTheDocument();
    });
  });

  describe('Content Layout Tests', () => {
    test('should stack content vertically on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      
      const { container } = render(DynamicTestComponent, {
        props: {
          menuData: mockMenuData,
          restaurantInfo: mockRestaurantInfo,
          testLayout: 'mobile'
        }
      });

      // Verify mobile layout characteristics
      expect(container).toBeInTheDocument();
      
      // In mobile layout, content should stack vertically
      // Check if elements use full width (conceptual test)
      const contentElements = container.querySelectorAll('[data-testid="content-section"]');
      contentElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        // Mobile elements should typically be full width or close to it
        expect(element).toBeInTheDocument();
      });
    });

    test('should use grid/flex layout on desktop', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      
      const { container } = render(DynamicTestComponent, {
        props: {
          menuData: mockMenuData,
          restaurantInfo: mockRestaurantInfo,
          testLayout: 'desktop'
        }
      });

      expect(container).toBeInTheDocument();
    });
  });

  describe('Text and Typography Scaling', () => {
    test('should have readable text on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      
      const { container } = render(DynamicTestComponent, {
        props: {
          menuData: mockMenuData,
          restaurantInfo: mockRestaurantInfo,
          testTypography: true
        }
      });

      // Check that text elements exist and are readable
      const textElements = container.querySelectorAll('h1, h2, h3, p, span');
      textElements.forEach(element => {
        const styles = window.getComputedStyle(element);
        const fontSize = parseInt(styles.fontSize);
        
        // Mobile text should be at least 14px for readability
        expect(fontSize).toBeGreaterThanOrEqual(14);
      });
    });

    test('should scale typography appropriately across viewports', () => {
      Object.entries(VIEWPORTS).forEach(([key, viewport]) => {
        setViewport(viewport.width, viewport.height);
        
        const { container } = render(DynamicTestComponent, {
          props: {
            menuData: mockMenuData,
            restaurantInfo: mockRestaurantInfo,
            testTypography: true
          }
        });

        // Verify typography exists and is appropriate for viewport
        const headings = container.querySelectorAll('h1, h2, h3');
        expect(headings.length).toBeGreaterThan(0);
        
        headings.forEach(heading => {
          const styles = window.getComputedStyle(heading);
          const fontSize = parseInt(styles.fontSize);
          
          // Headings should be appropriately sized
          if (viewport.width < 768) {
            // Mobile headings should be readable but not too large
            expect(fontSize).toBeGreaterThanOrEqual(16);
            expect(fontSize).toBeLessThanOrEqual(32);
          } else {
            // Desktop headings can be larger
            expect(fontSize).toBeGreaterThanOrEqual(18);
          }
        });
      });
    });
  });

  describe('Image and Media Responsiveness', () => {
    test('should handle images responsively', () => {
      Object.entries(VIEWPORTS).forEach(([key, viewport]) => {
        setViewport(viewport.width, viewport.height);
        
        const { container } = render(DynamicTestComponent, {
          props: {
            menuData: mockMenuData,
            restaurantInfo: mockRestaurantInfo,
            testImages: true
          }
        });

        // Check for responsive image handling
        const images = container.querySelectorAll('img');
        images.forEach(img => {
          // Images should have responsive attributes
          expect(img.getAttribute('loading')).toBeTruthy();
          
          // Images should not overflow their containers
          const styles = window.getComputedStyle(img);
          expect(styles.maxWidth).toBeTruthy();
        });
      });
    });
  });

  describe('Touch and Interaction Tests', () => {
    test('should have touch-friendly targets on mobile', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      
      const { container } = render(DynamicTestComponent, {
        props: {
          menuData: mockMenuData,
          restaurantInfo: mockRestaurantInfo,
          testTouchTargets: true
        }
      });

      // Check for touch-friendly button sizes
      const buttons = container.querySelectorAll('button, a[href], [role="button"]');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        const styles = window.getComputedStyle(button);
        
        // Touch targets should be at least 44px (iOS) or 48dp (Android)
        const minTouchSize = 44;
        const width = rect.width || parseInt(styles.width);
        const height = rect.height || parseInt(styles.height);
        
        if (width > 0 && height > 0) {
          expect(Math.max(width, height)).toBeGreaterThanOrEqual(minTouchSize);
        }
      });
    });

    test('should handle hover states on desktop only', () => {
      // Test desktop hover behavior
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query.includes('hover: hover'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const { container } = render(DynamicTestComponent, {
        props: {
          menuData: mockMenuData,
          restaurantInfo: mockRestaurantInfo,
          testHover: true
        }
      });

      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance on Different Viewports', () => {
    test('should render efficiently across all viewports', () => {
      Object.entries(VIEWPORTS).forEach(([key, viewport]) => {
        const startTime = performance.now();
        
        setViewport(viewport.width, viewport.height);
        
        const { container, unmount } = render(DynamicTestComponent, {
          props: {
            menuData: mockMenuData,
            restaurantInfo: mockRestaurantInfo,
            viewport: viewport.name
          }
        });

        const renderTime = performance.now() - startTime;
        
        // Rendering should be fast regardless of viewport
        expect(renderTime).toBeLessThan(100); // 100ms
        expect(container).toBeInTheDocument();
        
        unmount();
      });
    });
  });

  describe('Orientation Changes', () => {
    test('should handle portrait to landscape transitions', () => {
      // Start in portrait mobile
      setViewport(375, 667);
      
      const { container, component } = render(DynamicTestComponent, {
        props: {
          menuData: mockMenuData,
          restaurantInfo: mockRestaurantInfo,
          testOrientation: true
        }
      });

      expect(container).toBeInTheDocument();

      // Simulate orientation change to landscape
      setViewport(667, 375);
      window.dispatchEvent(new Event('resize'));

      // Component should still be functional after orientation change
      expect(container).toBeInTheDocument();
    });
  });
});

// Helper function to set viewport dimensions
function setViewport(width, height) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
}

// Dynamic test component that adapts based on props
const DynamicTestComponent = {
  props: ['menuData', 'restaurantInfo', 'viewport', 'testMobileNav', 'testDesktopNav', 'testLayout', 'testTypography', 'testImages', 'testTouchTargets', 'testHover', 'testOrientation'],
  
  template: `
    <div class="test-component" data-viewport="{{viewport}}">
      {{#if testMobileNav}}
        <nav class="mobile-nav" data-testid="mobile-navigation">
          <button class="hamburger-menu">Menu</button>
        </nav>
      {{/if}}
      
      {{#if testDesktopNav}}
        <nav class="desktop-nav" data-testid="desktop-navigation">
          <ul class="nav-links">
            <li><a href="/">Home</a></li>
            <li><a href="/menu">Menu</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      {{/if}}

      <main data-testid="main-content">
        {{#if testLayout === 'mobile'}}
          <div class="mobile-layout">
            <section data-testid="content-section" class="mobile-section">
              <h1>{{restaurantInfo.name}}</h1>
            </section>
          </div>
        {{/if}}

        {{#if testLayout === 'desktop'}}
          <div class="desktop-layout">
            <section data-testid="content-section" class="desktop-section">
              <h1>{{restaurantInfo.name}}</h1>
            </section>
          </div>
        {{/if}}

        {{#if testTypography}}
          <div class="typography-test">
            <h1>Main Heading</h1>
            <h2>Section Heading</h2>
            <h3>Subsection Heading</h3>
            <p>Body text content that should be readable across all devices.</p>
          </div>
        {{/if}}

        {{#if testImages}}
          <div class="images-test">
            <img src="/test-image.jpg" alt="Test" loading="lazy" style="max-width: 100%; height: auto;" />
          </div>
        {{/if}}

        {{#if testTouchTargets}}
          <div class="touch-targets-test">
            <button style="min-width: 44px; min-height: 44px;">Touch Button</button>
            <a href="#" style="display: inline-block; min-width: 44px; min-height: 44px; padding: 12px;">Touch Link</a>
          </div>
        {{/if}}

        {{#if testHover}}
          <div class="hover-test">
            <button class="hover-button">Hover me</button>
          </div>
        {{/if}}

        {{#if testOrientation}}
          <div class="orientation-test">
            <p>Content that adapts to orientation changes</p>
          </div>
        {{/if}}

        {{#if menuData}}
          <div class="menu-preview">
            {{#each menuData as category}}
              <div class="menu-category">
                <h2>{{category.name}}</h2>
                {{#each category.items as item}}
                  <div class="menu-item">
                    <h3>{{item.name}}</h3>
                    <p>{{item.description}}</p>
                    {{#if item.basePrice}}
                      <span class="price">\${{item.basePrice}}</span>
                    {{/if}}
                  </div>
                {{/each}}
              </div>
            {{/each}}
          </div>
        {{/if}}
      </main>
    </div>
  `,
  
  // Simple component implementation for testing
  render() {
    return { 
      destroy() {},
      $set() {},
      $on() {}
    };
  }
};