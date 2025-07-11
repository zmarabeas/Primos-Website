import { describe, test, expect, beforeAll } from 'vitest';
import { validateMenuData, validateMenuItem, validateMenuCategory, MenuValidationError } from '../src/lib/utils/menu-validation.ts';
import menuData from '../menu_categories_complete.json';
import restaurantInfo from '../src/lib/data/restaurant-info.json';
import toppings from '../src/lib/data/toppings.json';
import sauces from '../src/lib/data/sauces.json';
import coupons from '../src/lib/data/coupons.json';

describe('Menu Data Validation', () => {
  let completeMenuData;

  beforeAll(() => {
    // Construct complete menu data structure
    completeMenuData = {
      restaurant: restaurantInfo,
      categories: menuData,
      toppings: toppings,
      sauces: sauces,
      coupons: coupons
    };
  });

  test('should validate complete menu data structure', () => {
    expect(() => validateMenuData(completeMenuData)).not.toThrow();
  });

  test('should validate all menu categories exist and are properly structured', () => {
    expect(Array.isArray(menuData)).toBe(true);
    expect(menuData.length).toBeGreaterThan(0);

    const requiredCategories = [
      'appetizers',
      'pizza', 
      'salads',
      'pasta',
      'bbq-ribs',
      'chicken',
      'chicken-tenderloins',
      'wing-dings',
      'seafood',
      'hand-battered-shrimp',
      'submarines',
      'sandwiches',
      'combination-plates',
      'desserts'
    ];

    const categoryIds = menuData.map(cat => cat.id);
    
    requiredCategories.forEach(categoryId => {
      expect(categoryIds).toContain(categoryId);
    });
  });

  test('should validate all menu items have required fields', () => {
    menuData.forEach((category, categoryIndex) => {
      expect(() => validateMenuCategory(category)).not.toThrow();
      
      category.items.forEach((item, itemIndex) => {
        expect(item.id, `Item ${itemIndex} in category ${category.id} missing ID`).toBeDefined();
        expect(item.name, `Item ${itemIndex} in category ${category.id} missing name`).toBeDefined();
        expect(item.category, `Item ${itemIndex} in category ${category.id} missing category`).toBeDefined();
        expect(typeof item.available, `Item ${itemIndex} in category ${category.id} missing availability`).toBe('boolean');
        
        // Validate item with validation function
        expect(() => validateMenuItem(item)).not.toThrow();
      });
    });
  });

  test('should validate pricing data integrity', () => {
    menuData.forEach(category => {
      category.items.forEach(item => {
        // Items should have either basePrice or sizes with prices
        const hasBasePrice = typeof item.basePrice === 'number';
        const hasSizePricing = item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0;
        const hasOptions = item.options && Array.isArray(item.options) && item.options.length > 0;

        expect(
          hasBasePrice || hasSizePricing || hasOptions,
          `Item ${item.id} in ${category.id} has no pricing information`
        ).toBe(true);

        // Validate size pricing structure
        if (item.sizes) {
          item.sizes.forEach(size => {
            expect(size.size, `Size missing 'size' field for item ${item.id}`).toBeDefined();
            expect(size.name, `Size missing 'name' field for item ${item.id}`).toBeDefined();
            expect(typeof size.price, `Size missing valid 'price' for item ${item.id}`).toBe('number');
            expect(size.price, `Negative price for size ${size.size} in item ${item.id}`).toBeGreaterThanOrEqual(0);
          });
        }

        // Validate options pricing
        if (item.options) {
          item.options.forEach(option => {
            expect(option.name, `Option missing 'name' field for item ${item.id}`).toBeDefined();
            expect(typeof option.price, `Option missing valid 'price' for item ${item.id}`).toBe('number');
            expect(option.price, `Negative price for option ${option.name} in item ${item.id}`).toBeGreaterThanOrEqual(0);
          });
        }

        // Validate base price
        if (hasBasePrice) {
          expect(item.basePrice, `Negative base price for item ${item.id}`).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  test('should validate menu item IDs are unique within categories', () => {
    menuData.forEach(category => {
      const itemIds = category.items.map(item => item.id);
      const uniqueIds = new Set(itemIds);
      
      expect(
        uniqueIds.size,
        `Duplicate item IDs found in category ${category.id}`
      ).toBe(itemIds.length);
    });
  });

  test('should validate category IDs are unique', () => {
    const categoryIds = menuData.map(cat => cat.id);
    const uniqueIds = new Set(categoryIds);
    
    expect(
      uniqueIds.size,
      'Duplicate category IDs found'
    ).toBe(categoryIds.length);
  });

  test('should validate pizza items have proper size progression', () => {
    const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
    expect(pizzaCategory, 'Pizza category not found').toBeDefined();

    const expectedSizes = ['small', 'medium', 'large', 'xlarge'];
    
    pizzaCategory.items.forEach(item => {
      if (item.sizes && item.sizes.length > 1) {
        // Prices should generally increase with size
        for (let i = 1; i < item.sizes.length; i++) {
          const currentSize = item.sizes[i];
          const previousSize = item.sizes[i - 1];
          
          expect(
            currentSize.price,
            `Price regression in ${item.id}: ${currentSize.size} (${currentSize.price}) should cost more than ${previousSize.size} (${previousSize.price})`
          ).toBeGreaterThanOrEqual(previousSize.price);
        }
      }
    });
  });

  test('should validate toppings data structure', () => {
    expect(Array.isArray(toppings), 'Toppings should be an array').toBe(true);
    
    const validCategories = ['meat', 'vegetable', 'cheese', 'fruit', 'seafood'];
    
    toppings.forEach(topping => {
      expect(topping.id, 'Topping missing ID').toBeDefined();
      expect(topping.name, 'Topping missing name').toBeDefined();
      expect(validCategories, `Invalid topping category: ${topping.category}`).toContain(topping.category);
      expect(typeof topping.available, 'Topping availability should be boolean').toBe('boolean');
    });
  });

  test('should validate sauces data structure', () => {
    expect(Array.isArray(sauces), 'Sauces should be an array').toBe(true);
    
    sauces.forEach(sauce => {
      expect(sauce.id, 'Sauce missing ID').toBeDefined();
      expect(sauce.name, 'Sauce missing name').toBeDefined();
      expect(typeof sauce.available, 'Sauce availability should be boolean').toBe('boolean');
      
      if (sauce.spiceLevel !== undefined) {
        expect(sauce.spiceLevel, 'Spice level should be number').toBeTypeOf('number');
        expect(sauce.spiceLevel, 'Spice level should be 0-5').toBeGreaterThanOrEqual(0);
        expect(sauce.spiceLevel, 'Spice level should be 0-5').toBeLessThanOrEqual(5);
      }
    });
  });

  test('should validate restaurant info completeness', () => {
    expect(restaurantInfo.name, 'Restaurant name required').toBeDefined();
    expect(restaurantInfo.phone, 'Restaurant phone required').toBeDefined();
    expect(restaurantInfo.address, 'Restaurant address required').toBeDefined();
    expect(restaurantInfo.location, 'Restaurant location required').toBeDefined();
    expect(restaurantInfo.hours, 'Restaurant hours required').toBeDefined();
    expect(typeof restaurantInfo.hours, 'Hours should be object').toBe('object');
    
    // Validate hours structure
    const expectedDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    expectedDays.forEach(day => {
      expect(restaurantInfo.hours[day], `Missing hours for ${day}`).toBeDefined();
    });
  });

  test('should validate coupons data structure', () => {
    expect(Array.isArray(coupons), 'Coupons should be an array').toBe(true);
    
    coupons.forEach(coupon => {
      expect(coupon.id, 'Coupon missing ID').toBeDefined();
      expect(coupon.deal, 'Coupon missing deal description').toBeDefined();
      expect(coupon.restrictions, 'Coupon missing restrictions').toBeDefined();
      expect(coupon.expires, 'Coupon missing expiration date').toBeDefined();
      expect(coupon.location, 'Coupon missing location').toBeDefined();
      expect(coupon.phone, 'Coupon missing phone').toBeDefined();
    });
  });

  test('should validate menu data consistency between files', () => {
    // Check if all categories in menu_categories_complete.json are also referenced in other data files
    const categoryIds = menuData.map(cat => cat.id);
    
    // Verify all items have correct category references
    menuData.forEach(category => {
      category.items.forEach(item => {
        expect(
          item.category,
          `Item ${item.id} has category ${item.category} but is in category ${category.id}`
        ).toBe(category.id);
      });
    });
  });

  test('should detect and fail on malformed menu data', () => {
    // Test with invalid data structures
    expect(() => validateMenuData(null)).toThrow(MenuValidationError);
    expect(() => validateMenuData({})).toThrow(MenuValidationError);
    expect(() => validateMenuData({ categories: 'not-an-array' })).toThrow(MenuValidationError);
    
    // Test invalid menu item
    expect(() => validateMenuItem({})).toThrow(MenuValidationError);
    expect(() => validateMenuItem({ id: 'test' })).toThrow(MenuValidationError);
    expect(() => validateMenuItem({ id: 'test', name: 'Test' })).toThrow(MenuValidationError);
  });

  test('should validate special pizza configurations', () => {
    const pizzaCategory = menuData.find(cat => cat.id === 'pizza');
    
    // Test specific pizza items for correct configuration
    const trayPizza = pizzaCategory.items.find(item => item.id === 'tray-pizza');
    if (trayPizza) {
      expect(trayPizza.options, 'Tray pizza should have options').toBeDefined();
      expect(Array.isArray(trayPizza.options), 'Tray pizza options should be array').toBe(true);
    }

    const uBakePizza = pizzaCategory.items.find(item => item.id === 'u-bake-pizza');
    if (uBakePizza) {
      expect(uBakePizza.sizes, 'U-Bake pizza should have sizes').toBeDefined();
      expect(Array.isArray(uBakePizza.sizes), 'U-Bake pizza sizes should be array').toBe(true);
    }
  });

  test('should validate appetizer portion consistency', () => {
    const appetizersCategory = menuData.find(cat => cat.id === 'appetizers');
    expect(appetizersCategory, 'Appetizers category not found').toBeDefined();

    // Check garlic sticks have consistent pricing between half dozen and dozen
    const garlicHalf = appetizersCategory.items.find(item => item.id === 'garlic-sticks-half-dozen');
    const garlicDozen = appetizersCategory.items.find(item => item.id === 'garlic-sticks-dozen');
    
    if (garlicHalf && garlicDozen) {
      expect(
        garlicDozen.basePrice,
        'Dozen garlic sticks should cost more than 1.5x half dozen'
      ).toBeGreaterThan(garlicHalf.basePrice * 1.5);
    }
  });
});