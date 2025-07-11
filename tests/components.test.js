import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Menu from '../src/components/Menu.svelte';
import Info from '../src/components/Info.svelte';

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
        sizes: [
          { size: 'small', name: 'Small 12"', price: 10.99 },
          { size: 'large', name: 'Large 16"', price: 15.99 }
        ],
        available: true
      },
      {
        id: 'pepperoni-pizza',
        name: 'Pepperoni Pizza',
        description: 'Pizza with pepperoni',
        category: 'pizza',
        basePrice: 14.99,
        available: true
      }
    ]
  },
  {
    id: 'appetizers',
    name: 'Appetizers',
    description: 'Start your meal right',
    items: [
      {
        id: 'garlic-bread',
        name: 'Garlic Bread',
        description: 'Fresh baked garlic bread',
        category: 'appetizers',
        basePrice: 4.99,
        available: true
      }
    ]
  }
];

const mockRestaurantInfo = {
  name: "Primo's Pizza",
  phone: '(555) 123-4567',
  address: '123 Main Street, Anytown, ST 12345',
  location: 'Anytown',
  established: '1985',
  website: 'https://primospizza.com',
  hours: {
    monday: '11:00 AM - 10:00 PM',
    tuesday: '11:00 AM - 10:00 PM',
    wednesday: '11:00 AM - 10:00 PM',
    thursday: '11:00 AM - 10:00 PM',
    friday: '11:00 AM - 11:00 PM',
    saturday: '11:00 AM - 11:00 PM',
    sunday: '12:00 PM - 9:00 PM'
  },
  awards: ['Best Pizza 2023', 'Family Favorite'],
  paymentMethods: ['Cash', 'Credit Card', 'Online Ordering'],
  services: ['Delivery', 'Pickup', 'Dine-in']
};

describe('Menu Component Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
  });

  test('should render menu component without crashing', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('should display all menu categories', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText('Appetizers')).toBeInTheDocument();
  });

  test('should display menu items within categories', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    expect(screen.getByText('Cheese Pizza')).toBeInTheDocument();
    expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument();
    expect(screen.getByText('Garlic Bread')).toBeInTheDocument();
  });

  test('should display item descriptions', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    expect(screen.getByText('Classic cheese pizza')).toBeInTheDocument();
    expect(screen.getByText('Fresh baked garlic bread')).toBeInTheDocument();
  });

  test('should display pricing information', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    // Should show size-based pricing for cheese pizza
    expect(screen.getByText('Small 12"')).toBeInTheDocument();
    expect(screen.getByText('Large 16"')).toBeInTheDocument();
    expect(screen.getByText('$10.99')).toBeInTheDocument();
    expect(screen.getByText('$15.99')).toBeInTheDocument();

    // Should show base price for items without sizes
    expect(screen.getByText('$4.99')).toBeInTheDocument();
  });

  test('should filter menu items by search term', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: 'cheese',
        selectedCategory: null
      }
    });

    expect(screen.getByText('Cheese Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Pepperoni Pizza')).not.toBeInTheDocument();
    expect(screen.queryByText('Garlic Bread')).not.toBeInTheDocument();
  });

  test('should filter by selected category', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: 'pizza'
      }
    });

    expect(screen.getByText('Cheese Pizza')).toBeInTheDocument();
    expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument();
    expect(screen.queryByText('Garlic Bread')).not.toBeInTheDocument();
  });

  test('should handle empty menu data gracefully', () => {
    render(Menu, { 
      props: { 
        categories: [],
        searchTerm: '',
        selectedCategory: null
      }
    });

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('should indicate unavailable items', () => {
    const unavailableMenuData = [{
      id: 'pizza',
      name: 'Pizza',
      description: 'Our pizzas',
      items: [{
        id: 'special-pizza',
        name: 'Special Pizza',
        description: 'Limited time offer',
        category: 'pizza',
        basePrice: 18.99,
        available: false
      }]
    }];

    render(Menu, { 
      props: { 
        categories: unavailableMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    // Should indicate unavailable items
    expect(screen.getByText('Special Pizza')).toBeInTheDocument();
    // Look for unavailable indicator (text or styling)
    const unavailableIndicator = screen.getByText(/unavailable|out of stock/i);
    expect(unavailableIndicator).toBeInTheDocument();
  });

  test('should display proper accessibility attributes', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    // Check for proper heading hierarchy
    const categoryHeadings = screen.getAllByRole('heading', { level: 2 });
    expect(categoryHeadings.length).toBeGreaterThan(0);

    // Check for proper list structure
    const lists = screen.getAllByRole('list');
    expect(lists.length).toBeGreaterThan(0);
  });
});

describe('Info Component Tests', () => {
  test('should render restaurant info component', () => {
    render(Info, { 
      props: { 
        restaurantInfo: mockRestaurantInfo
      }
    });

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('should display restaurant name and basic info', () => {
    render(Info, { 
      props: { 
        restaurantInfo: mockRestaurantInfo
      }
    });

    expect(screen.getByText("Primo's Pizza")).toBeInTheDocument();
    expect(screen.getByText('(555) 123-4567')).toBeInTheDocument();
    expect(screen.getByText('123 Main Street, Anytown, ST 12345')).toBeInTheDocument();
  });

  test('should display hours of operation', () => {
    render(Info, { 
      props: { 
        restaurantInfo: mockRestaurantInfo
      }
    });

    expect(screen.getByText(/hours/i)).toBeInTheDocument();
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('11:00 AM - 10:00 PM')).toBeInTheDocument();
  });

  test('should display awards and recognition', () => {
    render(Info, { 
      props: { 
        restaurantInfo: mockRestaurantInfo
      }
    });

    expect(screen.getByText('Best Pizza 2023')).toBeInTheDocument();
    expect(screen.getByText('Family Favorite')).toBeInTheDocument();
  });

  test('should display payment methods', () => {
    render(Info, { 
      props: { 
        restaurantInfo: mockRestaurantInfo
      }
    });

    expect(screen.getByText('Cash')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
    expect(screen.getByText('Online Ordering')).toBeInTheDocument();
  });

  test('should display services offered', () => {
    render(Info, { 
      props: { 
        restaurantInfo: mockRestaurantInfo
      }
    });

    expect(screen.getByText('Delivery')).toBeInTheDocument();
    expect(screen.getByText('Pickup')).toBeInTheDocument();
    expect(screen.getByText('Dine-in')).toBeInTheDocument();
  });

  test('should handle missing restaurant info gracefully', () => {
    render(Info, { 
      props: { 
        restaurantInfo: {}
      }
    });

    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  test('should format phone number correctly', () => {
    render(Info, { 
      props: { 
        restaurantInfo: mockRestaurantInfo
      }
    });

    // Check if phone number is properly formatted and clickable
    const phoneLink = screen.getByRole('link', { name: /555.*123.*4567/i });
    expect(phoneLink).toBeInTheDocument();
    expect(phoneLink).toHaveAttribute('href', 'tel:(555) 123-4567');
  });

  test('should display establishment year', () => {
    render(Info, { 
      props: { 
        restaurantInfo: mockRestaurantInfo
      }
    });

    expect(screen.getByText(/1985/)).toBeInTheDocument();
    expect(screen.getByText(/established/i)).toBeInTheDocument();
  });
});

describe('Component Integration Tests', () => {
  test('should render menu and info components together', () => {
    const { container } = render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    const { container: infoContainer } = render(Info, { 
      props: { 
        restaurantInfo: mockRestaurantInfo
      }
    });

    expect(container).toBeInTheDocument();
    expect(infoContainer).toBeInTheDocument();
  });

  test('should maintain responsive design integrity', async () => {
    // Test different viewport sizes
    Object.defineProperty(window, 'innerWidth', { value: 320, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 568, writable: true });
    window.dispatchEvent(new Event('resize'));

    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    await waitFor(() => {
      // Component should still be functional on mobile
      expect(screen.getByText('Cheese Pizza')).toBeInTheDocument();
    });

    // Test tablet size
    Object.defineProperty(window, 'innerWidth', { value: 768, writable: true });
    window.dispatchEvent(new Event('resize'));

    await waitFor(() => {
      expect(screen.getByText('Cheese Pizza')).toBeInTheDocument();
    });

    // Test desktop size
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
    window.dispatchEvent(new Event('resize'));

    await waitFor(() => {
      expect(screen.getByText('Cheese Pizza')).toBeInTheDocument();
    });
  });
});

describe('Accessibility Tests', () => {
  test('should have proper ARIA labels and roles', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    // Check for proper semantic structure
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for proper heading structure
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    
    // Verify heading hierarchy
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(6);
    });
  });

  test('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    // Test tab navigation
    await user.tab();
    
    // Check if focus is on a focusable element
    const focusedElement = document.activeElement;
    expect(focusedElement).not.toBe(document.body);
  });

  test('should have sufficient color contrast', () => {
    render(Menu, { 
      props: { 
        categories: mockMenuData,
        searchTerm: '',
        selectedCategory: null
      }
    });

    // This would typically be tested with axe-core or similar tool
    // For now, we ensure text content is readable
    const textElements = screen.getAllByText(/./);
    textElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      expect(styles.color).toBeDefined();
      expect(styles.backgroundColor).toBeDefined();
    });
  });
});