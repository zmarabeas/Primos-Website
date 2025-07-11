import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { goto } from '$app/navigation';

// Mock SvelteKit stores and navigation
import { browser } from '$app/environment';

// Mock menu loader and utilities
import { MenuLoader } from '../src/lib/utils/menu-loader.ts';
import { PricingCalculator } from '../src/lib/utils/pricing.ts';
import { OrderBuilder } from '../src/lib/utils/order-builder.ts';

describe('Integration Tests', () => {
  let menuLoader;
  
  beforeAll(async () => {
    menuLoader = new MenuLoader();
    await menuLoader.loadMenuData();
  });

  describe('Menu Loading and Display Integration', () => {
    test('should load and display complete menu data', async () => {
      const menuData = await menuLoader.getMenuData();
      
      expect(menuData).toBeDefined();
      expect(Array.isArray(menuData.categories)).toBe(true);
      expect(menuData.categories.length).toBeGreaterThan(0);
      
      // Verify each category has items
      menuData.categories.forEach(category => {
        expect(category.items).toBeDefined();
        expect(Array.isArray(category.items)).toBe(true);
        
        if (category.items.length > 0) {
          category.items.forEach(item => {
            expect(item.id).toBeDefined();
            expect(item.name).toBeDefined();
            expect(item.category).toBe(category.id);
            expect(typeof item.available).toBe('boolean');
          });
        }
      });
    });

    test('should filter menu items correctly across categories', async () => {
      const menuData = await menuLoader.getMenuData();
      
      // Test filtering by search term
      const pizzaItems = menuLoader.filterItems(menuData.categories, 'pizza');
      expect(pizzaItems.length).toBeGreaterThan(0);
      
      pizzaItems.forEach(item => {
        const matchesSearch = item.name.toLowerCase().includes('pizza') ||
                            item.description?.toLowerCase().includes('pizza') ||
                            item.category === 'pizza';
        expect(matchesSearch).toBe(true);
      });
    });

    test('should load restaurant info correctly', async () => {
      const restaurantInfo = await menuLoader.getRestaurantInfo();
      
      expect(restaurantInfo).toBeDefined();
      expect(restaurantInfo.name).toBeDefined();
      expect(restaurantInfo.phone).toBeDefined();
      expect(restaurantInfo.address).toBeDefined();
      expect(restaurantInfo.hours).toBeDefined();
      expect(typeof restaurantInfo.hours).toBe('object');
    });
  });

  describe('Pricing Integration Tests', () => {
    test('should calculate prices correctly across all menu items', async () => {
      const menuData = await menuLoader.getMenuData();
      
      for (const category of menuData.categories) {
        for (const item of category.items) {
          if (!item.available) continue;

          // Test base pricing
          if (item.basePrice) {
            const calculation = PricingCalculator.calculateItemPrice(item, null, [], 1);
            expect(calculation.basePrice).toBe(item.basePrice);
            expect(calculation.total).toBeGreaterThan(0);
          }

          // Test size-based pricing
          if (item.sizes && item.sizes.length > 0) {
            for (const size of item.sizes) {
              const calculation = PricingCalculator.calculateItemPrice(item, size.size, [], 1);
              expect(calculation.basePrice).toBe(size.price);
              expect(calculation.total).toBeGreaterThan(0);
            }
          }

          // Test quantity pricing
          const calculation = PricingCalculator.calculateItemPrice(item, null, [], 3);
          expect(calculation.total).toBeGreaterThan(0);
        }
      }
    });

    test('should handle pizza toppings pricing correctly', async () => {
      const menuData = await menuLoader.getMenuData();
      const pizzaCategory = menuData.categories.find(cat => cat.id === 'pizza');
      
      if (pizzaCategory) {
        const pizzaWithToppings = pizzaCategory.items.find(item => 
          item.toppings && item.toppings.extraItems
        );
        
        if (pizzaWithToppings) {
          const toppings = ['pepperoni', 'mushrooms', 'sausage'];
          const calculation = PricingCalculator.calculateItemPrice(
            pizzaWithToppings, 
            'medium', 
            toppings, 
            1
          );
          
          expect(calculation.toppingsPrice).toBeGreaterThan(0);
          expect(calculation.subtotal).toBeGreaterThan(calculation.basePrice);
        }
      }
    });

    test('should calculate delivery fees correctly', () => {
      // Test free delivery threshold
      const highOrderTotal = 30.00;
      expect(PricingCalculator.calculateDeliveryFee(highOrderTotal)).toBe(0);
      
      // Test base delivery fee
      const lowOrderTotal = 15.00;
      const baseFee = PricingCalculator.calculateDeliveryFee(lowOrderTotal);
      expect(baseFee).toBeGreaterThan(0);
      expect(baseFee).toBeLessThanOrEqual(8.00); // Max fee cap
      
      // Test distance-based fees
      const distanceFee = PricingCalculator.calculateDeliveryFee(lowOrderTotal, 8);
      expect(distanceFee).toBeGreaterThanOrEqual(baseFee);
    });
  });

  describe('Order Building Integration', () => {
    test('should build valid orders for different item types', async () => {
      const menuData = await menuLoader.getMenuData();
      const orderBuilder = new OrderBuilder();
      
      // Test pizza order
      const pizzaCategory = menuData.categories.find(cat => cat.id === 'pizza');
      if (pizzaCategory && pizzaCategory.items.length > 0) {
        const pizza = pizzaCategory.items[0];
        const order = orderBuilder
          .setItem(pizza)
          .setSize('large')
          .setToppings(['pepperoni', 'mushrooms'])
          .setQuantity(2)
          .build();
        
        expect(order).toBeDefined();
        expect(order.menuItem).toBe(pizza);
        expect(order.selectedSize).toBe('large');
        expect(order.selectedToppings).toEqual(['pepperoni', 'mushrooms']);
        expect(order.quantity).toBe(2);
        expect(order.totalPrice).toBeGreaterThan(0);
      }
      
      // Test appetizer order
      const appetizerCategory = menuData.categories.find(cat => cat.id === 'appetizers');
      if (appetizerCategory && appetizerCategory.items.length > 0) {
        const appetizer = appetizerCategory.items[0];
        const order = orderBuilder
          .setItem(appetizer)
          .setQuantity(1)
          .build();
        
        expect(order).toBeDefined();
        expect(order.menuItem).toBe(appetizer);
        expect(order.quantity).toBe(1);
        expect(order.totalPrice).toBeGreaterThan(0);
      }
    });

    test('should handle special customizations correctly', async () => {
      const menuData = await menuLoader.getMenuData();
      const orderBuilder = new OrderBuilder();
      
      // Test chicken order with piece selection
      const chickenCategory = menuData.categories.find(cat => cat.id === 'chicken');
      if (chickenCategory && chickenCategory.items.length > 0) {
        const chicken = chickenCategory.items[0];
        const order = orderBuilder
          .setItem(chicken)
          .setPieceSelection({ 'breast': 2, 'thigh': 1, 'wing': 2 })
          .setOrderType('dinner')
          .setSides(['coleslaw', 'fries'])
          .build();
        
        expect(order).toBeDefined();
        expect(order.selectedPieces).toBeDefined();
        expect(order.orderType).toBe('dinner');
        expect(order.selectedSides).toEqual(['coleslaw', 'fries']);
      }
    });
  });

  describe('Data Consistency Integration', () => {
    test('should maintain consistency between menu categories and items', async () => {
      const menuData = await menuLoader.getMenuData();
      const allItems = [];
      
      menuData.categories.forEach(category => {
        category.items.forEach(item => {
          // Verify item category matches parent category
          expect(item.category).toBe(category.id);
          
          // Collect all items for uniqueness test
          allItems.push(item.id);
        });
      });
      
      // Verify item IDs are unique across all categories
      const uniqueIds = new Set(allItems);
      expect(uniqueIds.size).toBe(allItems.length);
    });

    test('should validate toppings and sauces are available for relevant items', async () => {
      const menuData = await menuLoader.getMenuData();
      const availableToppings = menuData.toppings?.filter(t => t.available) || [];
      const availableSauces = menuData.sauces?.filter(s => s.available) || [];
      
      // Check pizza items can use available toppings
      const pizzaCategory = menuData.categories.find(cat => cat.id === 'pizza');
      if (pizzaCategory) {
        pizzaCategory.items.forEach(item => {
          if (item.toppings) {
            // Verify topping prices are defined for all sizes
            if (item.sizes) {
              item.sizes.forEach(size => {
                const toppingPrice = item.toppings.extraItems?.find(
                  extra => extra.size === size.size
                );
                if (item.toppings.extraItems && item.toppings.extraItems.length > 0) {
                  expect(toppingPrice).toBeDefined();
                }
              });
            }
          }
        });
      }
    });
  });

  describe('Performance Integration', () => {
    test('should load menu data within acceptable time limits', async () => {
      const startTime = performance.now();
      const menuData = await menuLoader.getMenuData();
      const endTime = performance.now();
      
      const loadTime = endTime - startTime;
      
      expect(menuData).toBeDefined();
      expect(loadTime).toBeLessThan(1000); // Should load in under 1 second
    });

    test('should handle large cart calculations efficiently', async () => {
      const menuData = await menuLoader.getMenuData();
      const allItems = [];
      
      // Collect available items
      menuData.categories.forEach(category => {
        category.items.forEach(item => {
          if (item.available) {
            allItems.push(item);
          }
        });
      });
      
      // Create a large cart
      const cartItems = allItems.slice(0, 20).map(item => ({
        menuItem: item,
        quantity: Math.floor(Math.random() * 3) + 1,
        totalPrice: item.basePrice || 10.00
      }));
      
      const startTime = performance.now();
      const cartTotal = PricingCalculator.calculateCartTotal(cartItems);
      const endTime = performance.now();
      
      const calculationTime = endTime - startTime;
      
      expect(cartTotal).toBeDefined();
      expect(cartTotal.total).toBeGreaterThan(0);
      expect(calculationTime).toBeLessThan(100); // Should calculate in under 100ms
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle missing menu data gracefully', async () => {
      // Test with empty/invalid menu data
      const menuLoader = new MenuLoader();
      
      // Mock invalid data
      const originalData = menuLoader.menuData;
      menuLoader.menuData = null;
      
      expect(() => menuLoader.getMenuData()).not.toThrow();
      
      // Restore original data
      menuLoader.menuData = originalData;
    });

    test('should handle invalid pricing calculations gracefully', () => {
      const invalidItem = {
        id: 'invalid',
        name: 'Invalid Item',
        category: 'test',
        available: true
        // Missing pricing information
      };
      
      expect(() => 
        PricingCalculator.calculateItemPrice(invalidItem, null, [], 1)
      ).not.toThrow();
    });

    test('should handle malformed order building gracefully', () => {
      const orderBuilder = new OrderBuilder();
      
      // Test building order without required fields
      expect(() => orderBuilder.build()).not.toThrow();
    });
  });

  describe('Cross-Browser Compatibility', () => {
    test('should work with different localStorage implementations', () => {
      // Mock different localStorage scenarios
      const originalLocalStorage = global.localStorage;
      
      // Test with no localStorage
      delete global.localStorage;
      expect(() => new MenuLoader()).not.toThrow();
      
      // Test with limited localStorage
      global.localStorage = {
        getItem: () => null,
        setItem: () => { throw new Error('Storage full'); },
        removeItem: () => {},
        clear: () => {}
      };
      expect(() => new MenuLoader()).not.toThrow();
      
      // Restore original localStorage
      global.localStorage = originalLocalStorage;
    });

    test('should handle different Date implementations', () => {
      const originalDate = global.Date;
      
      // Mock different date scenarios
      global.Date = class extends Date {
        constructor(...args) {
          super(...args);
          // Simulate timezone differences
          this.getTimezoneOffset = () => -300; // EST
        }
      };
      
      const timeEstimate = PricingCalculator.estimatePreparationTime([], 'pickup');
      expect(timeEstimate).toBeGreaterThan(0);
      
      // Restore original Date
      global.Date = originalDate;
    });
  });
});