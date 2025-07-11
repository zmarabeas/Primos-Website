import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';

// Import order flow utilities
import { OrderBuilder } from '../src/lib/utils/order-builder.ts';
import { PricingCalculator } from '../src/lib/utils/pricing.ts';
import menuData from '../menu_categories_complete.json';

describe('Order Flow Tests', () => {
  let user;
  let orderBuilder;

  beforeEach(() => {
    user = userEvent.setup();
    orderBuilder = new OrderBuilder();
  });

  describe('Pizza Ordering Flow', () => {
    test('should create a complete pizza order with toppings', () => {
      const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
      const cheesePizza = pizzaCategory.items.find(item => item.id === 'cheese-pizza-round');
      
      const order = orderBuilder
        .setItem(cheesePizza)
        .setSize('large')
        .setToppings(['pepperoni', 'mushrooms', 'green-pepper'])
        .setQuantity(2)
        .setSpecialInstructions('Extra crispy crust')
        .build();

      expect(order).toBeDefined();
      expect(order.menuItem.id).toBe('cheese-pizza-round');
      expect(order.selectedSize).toBe('large');
      expect(order.selectedToppings).toContain('pepperoni');
      expect(order.selectedToppings).toContain('mushrooms');
      expect(order.selectedToppings).toContain('green-pepper');
      expect(order.quantity).toBe(2);
      expect(order.specialInstructions).toBe('Extra crispy crust');
      expect(order.totalPrice).toBeGreaterThan(0);
    });

    test('should calculate pizza pricing with toppings correctly', () => {
      const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
      const cheesePizza = pizzaCategory.items.find(item => item.id === 'cheese-pizza-round');
      
      if (cheesePizza && cheesePizza.sizes) {
        const largeSize = cheesePizza.sizes.find(size => size.size === 'large');
        const toppings = ['pepperoni', 'sausage'];
        
        const calculation = PricingCalculator.calculateItemPrice(
          cheesePizza,
          'large',
          toppings,
          1
        );

        expect(calculation.basePrice).toBe(largeSize.price);
        expect(calculation.toppingsPrice).toBeGreaterThan(0);
        expect(calculation.subtotal).toBe(calculation.basePrice + calculation.toppingsPrice);
        expect(calculation.total).toBeGreaterThan(calculation.subtotal); // Includes tax
      }
    });

    test('should handle specialty pizza orders', () => {
      const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
      const primosSpecial = pizzaCategory.items.find(item => item.id === 'primos-special-pizza');
      
      if (primosSpecial) {
        const order = orderBuilder
          .setItem(primosSpecial)
          .setSize('medium')
          .setQuantity(1)
          .build();

        expect(order).toBeDefined();
        expect(order.menuItem.id).toBe('primos-special-pizza');
        expect(order.selectedSize).toBe('medium');
        expect(order.totalPrice).toBeGreaterThan(0);
      }
    });

    test('should handle tray pizza orders', () => {
      const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
      const trayPizza = pizzaCategory.items.find(item => item.id === 'tray-pizza');
      
      if (trayPizza && trayPizza.options) {
        const cheeseOption = trayPizza.options.find(opt => opt.name === 'Cheese');
        
        const order = orderBuilder
          .setItem(trayPizza)
          .setSelectedOption('Cheese')
          .setQuantity(1)
          .build();

        expect(order).toBeDefined();
        expect(order.menuItem.id).toBe('tray-pizza');
        expect(order.selectedOptions).toContain('Cheese');
      }
    });
  });

  describe('Appetizer Ordering Flow', () => {
    test('should create appetizer orders', () => {
      const appetizerCategory = menuData.find(cat => cat.id === 'appetizers');
      const garlicSticks = appetizerCategory.items.find(item => item.id === 'garlic-sticks-dozen');
      
      const order = orderBuilder
        .setItem(garlicSticks)
        .setQuantity(2)
        .build();

      expect(order).toBeDefined();
      expect(order.menuItem.id).toBe('garlic-sticks-dozen');
      expect(order.quantity).toBe(2);
      expect(order.totalPrice).toBe(garlicSticks.basePrice * 2 * 1.06); // Including 6% tax
    });

    test('should handle deep fried appetizers with cooking preferences', () => {
      const appetizerCategory = menuData.find(cat => cat.id === 'appetizers');
      const mushrooms = appetizerCategory.items.find(item => item.id === 'deep-fried-mushrooms');
      
      if (mushrooms) {
        const order = orderBuilder
          .setItem(mushrooms)
          .setQuantity(1)
          .setCustomization({ cookingPreference: 'extra-crispy' })
          .build();

        expect(order).toBeDefined();
        expect(order.menuItem.id).toBe('deep-fried-mushrooms');
        expect(order.customizations?.cookingPreference).toBe('extra-crispy');
      }
    });
  });

  describe('Chicken Ordering Flow', () => {
    test('should create chicken piece selection orders', () => {
      const chickenCategory = menuData.find(cat => cat.id === 'chicken');
      
      if (chickenCategory && chickenCategory.items.length > 0) {
        const chickenItem = chickenCategory.items[0];
        
        const order = orderBuilder
          .setItem(chickenItem)
          .setPieceSelection({
            'breast': 2,
            'thigh': 1,
            'wing': 2,
            'leg': 1
          })
          .setOrderType('dinner')
          .setSides(['coleslaw', 'french-fries'])
          .setQuantity(1)
          .build();

        expect(order).toBeDefined();
        expect(order.selectedPieces).toBeDefined();
        expect(order.selectedPieces['breast']).toBe(2);
        expect(order.orderType).toBe('dinner');
        expect(order.selectedSides).toContain('coleslaw');
        expect(order.selectedSides).toContain('french-fries');
      }
    });

    test('should calculate piece-based pricing correctly', () => {
      const mockChickenItem = {
        id: 'test-chicken',
        name: 'Test Chicken',
        category: 'chicken',
        available: true,
        pieceOptions: [
          { id: 'breast', name: 'Breast', price: 3.50 },
          { id: 'thigh', name: 'Thigh', price: 2.75 },
          { id: 'wing', name: 'Wing', price: 2.25 }
        ]
      };

      const pieceSelection = { 'breast': 2, 'thigh': 1, 'wing': 2 };
      
      // Calculate expected price
      const expectedPrice = (3.50 * 2) + (2.75 * 1) + (2.25 * 2);
      
      const order = orderBuilder
        .setItem(mockChickenItem)
        .setPieceSelection(pieceSelection)
        .setOrderType('only')
        .build();

      expect(order.totalPrice).toBeCloseTo(expectedPrice * 1.06); // Including tax
    });
  });

  describe('Salad Ordering Flow', () => {
    test('should create salad orders with dressing', () => {
      const saladCategory = menuData.find(cat => cat.id === 'salads');
      
      if (saladCategory && saladCategory.items.length > 0) {
        const tossedSalad = saladCategory.items.find(item => item.id === 'tossed-salad');
        
        if (tossedSalad) {
          const order = orderBuilder
            .setItem(tossedSalad)
            .setSize('large')
            .setCustomization({ 
              selectedDressing: 'Ranch',
              addOns: ['Extra Cheese']
            })
            .setQuantity(1)
            .build();

          expect(order).toBeDefined();
          expect(order.menuItem.id).toBe('tossed-salad');
          expect(order.selectedSize).toBe('large');
          expect(order.customizations.selectedDressing).toBe('Ranch');
        }
      }
    });
  });

  describe('Sandwich Ordering Flow', () => {
    test('should create submarine sandwich orders', () => {
      const subCategory = menuData.find(cat => cat.id === 'submarines');
      
      if (subCategory && subCategory.items.length > 0) {
        const sub = subCategory.items[0];
        
        const order = orderBuilder
          .setItem(sub)
          .setCustomization({
            breadType: 'whole-wheat',
            addOns: ['Extra Cheese', 'Extra Meat'],
            removedIngredients: ['Onions']
          })
          .setQuantity(1)
          .build();

        expect(order).toBeDefined();
        expect(order.customizations.breadType).toBe('whole-wheat');
        expect(order.customizations.addOns).toContain('Extra Cheese');
        expect(order.customizations.removedIngredients).toContain('Onions');
      }
    });
  });

  describe('Cart Management Flow', () => {
    test('should add multiple items to cart and calculate total', () => {
      const cart = [];
      
      // Add pizza
      const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
      const pizza = pizzaCategory.items.find(item => item.id === 'cheese-pizza-round');
      
      if (pizza) {
        const pizzaOrder = orderBuilder
          .setItem(pizza)
          .setSize('medium')
          .setToppings(['pepperoni'])
          .setQuantity(1)
          .build();
        cart.push(pizzaOrder);
      }
      
      // Add appetizer
      const appetizerCategory = menuData.find(cat => cat.id === 'appetizers');
      const appetizer = appetizerCategory.items.find(item => item.id === 'garlic-sticks-dozen');
      
      if (appetizer) {
        const appetizerOrder = orderBuilder
          .setItem(appetizer)
          .setQuantity(1)
          .build();
        cart.push(appetizerOrder);
      }

      const cartTotal = PricingCalculator.calculateCartTotal(cart);
      
      expect(cart.length).toBe(2);
      expect(cartTotal.subtotal).toBeGreaterThan(0);
      expect(cartTotal.tax).toBeGreaterThan(0);
      expect(cartTotal.total).toBe(cartTotal.subtotal + cartTotal.tax);
      expect(cartTotal.itemCount).toBe(2);
    });

    test('should handle cart with quantity modifications', () => {
      const appetizerCategory = menuData.find(cat => cat.id === 'appetizers');
      const item = appetizerCategory.items.find(item => item.basePrice);
      
      if (item) {
        const order1 = orderBuilder
          .setItem(item)
          .setQuantity(2)
          .build();
          
        const order2 = orderBuilder
          .setItem(item)
          .setQuantity(3)
          .build();

        const cart = [order1, order2];
        const cartTotal = PricingCalculator.calculateCartTotal(cart);
        
        expect(cartTotal.itemCount).toBe(5); // 2 + 3
        expect(cartTotal.subtotal).toBeCloseTo(item.basePrice * 5);
      }
    });
  });

  describe('Order Validation Flow', () => {
    test('should validate required fields for complete orders', () => {
      const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
      const pizza = pizzaCategory.items[0];
      
      // Test incomplete order
      const incompleteOrder = orderBuilder
        .setItem(pizza)
        // Missing size for pizza
        .setQuantity(1)
        .build();

      // Should still create order but mark as incomplete
      expect(incompleteOrder).toBeDefined();
      expect(incompleteOrder.menuItem).toBe(pizza);
      
      // Test complete order
      const completeOrder = orderBuilder
        .setItem(pizza)
        .setSize('medium')
        .setQuantity(1)
        .build();

      expect(completeOrder).toBeDefined();
      expect(completeOrder.selectedSize).toBe('medium');
    });

    test('should validate item availability', () => {
      const unavailableItem = {
        id: 'unavailable-test',
        name: 'Unavailable Item',
        category: 'test',
        basePrice: 10.00,
        available: false
      };

      const order = orderBuilder
        .setItem(unavailableItem)
        .setQuantity(1)
        .build();

      // Should create order but flag availability issue
      expect(order).toBeDefined();
      expect(order.menuItem.available).toBe(false);
    });
  });

  describe('Pricing Edge Cases Flow', () => {
    test('should handle zero quantity orders', () => {
      const appetizerCategory = menuData.find(cat => cat.id === 'appetizers');
      const item = appetizerCategory.items[0];
      
      const order = orderBuilder
        .setItem(item)
        .setQuantity(0)
        .build();

      expect(order.quantity).toBe(0);
      expect(order.totalPrice).toBe(0);
    });

    test('should handle large quantity orders', () => {
      const appetizerCategory = menuData.find(cat => cat.id === 'appetizers');
      const item = appetizerCategory.items.find(item => item.basePrice);
      
      if (item) {
        const order = orderBuilder
          .setItem(item)
          .setQuantity(100)
          .build();

        expect(order.quantity).toBe(100);
        expect(order.totalPrice).toBeCloseTo(item.basePrice * 100 * 1.06);
      }
    });

    test('should handle delivery fee calculations in order flow', () => {
      const cart = [];
      
      // Create a small order (under delivery threshold)
      const appetizerCategory = menuData.find(cat => cat.id === 'appetizers');
      const smallItem = appetizerCategory.items.find(item => item.basePrice && item.basePrice < 10);
      
      if (smallItem) {
        const order = orderBuilder
          .setItem(smallItem)
          .setQuantity(1)
          .build();
        cart.push(order);
        
        const cartTotal = PricingCalculator.calculateCartTotal(cart);
        const deliveryFee = PricingCalculator.calculateDeliveryFee(cartTotal.subtotal);
        
        expect(deliveryFee).toBeGreaterThan(0);
        
        const totalWithDelivery = cartTotal.total + deliveryFee;
        expect(totalWithDelivery).toBeGreaterThan(cartTotal.total);
      }
    });
  });

  describe('Special Instructions and Customizations Flow', () => {
    test('should preserve special instructions throughout order flow', () => {
      const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
      const pizza = pizzaCategory.items[0];
      
      const specialInstructions = 'Well done, cut into squares, extra sauce on side';
      
      const order = orderBuilder
        .setItem(pizza)
        .setSize('large')
        .setSpecialInstructions(specialInstructions)
        .setQuantity(1)
        .build();

      expect(order.specialInstructions).toBe(specialInstructions);
    });

    test('should handle complex customizations', () => {
      const complexCustomization = {
        cookingPreference: 'well-done',
        dippingSauces: ['ranch', 'bbq'],
        specialInstructions: 'Please make extra crispy',
        allergenNotes: 'No nuts'
      };

      const appetizerCategory = menuData.find(cat => cat.id === 'appetizers');
      const item = appetizerCategory.items[0];
      
      const order = orderBuilder
        .setItem(item)
        .setCustomization(complexCustomization)
        .setQuantity(1)
        .build();

      expect(order.customizations).toEqual(complexCustomization);
    });
  });

  describe('Order Timing and Preparation Flow', () => {
    test('should estimate preparation time for different order types', () => {
      const cart = [];
      
      // Add pizza (longer prep time)
      const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
      if (pizzaCategory.items.length > 0) {
        const pizzaOrder = orderBuilder
          .setItem(pizzaCategory.items[0])
          .setSize('large')
          .setQuantity(1)
          .build();
        cart.push(pizzaOrder);
      }
      
      // Add appetizer (shorter prep time)
      const appetizerCategory = menuData.find(cat => cat.id === 'appetizers');
      if (appetizerCategory.items.length > 0) {
        const appetizerOrder = orderBuilder
          .setItem(appetizerCategory.items[0])
          .setQuantity(1)
          .build();
        cart.push(appetizerOrder);
      }

      const pickupTime = PricingCalculator.estimatePreparationTime(cart, 'pickup');
      const deliveryTime = PricingCalculator.estimatePreparationTime(cart, 'delivery');
      
      expect(pickupTime).toBeGreaterThan(0);
      expect(deliveryTime).toBeGreaterThan(pickupTime); // Delivery takes longer
    });
  });
});