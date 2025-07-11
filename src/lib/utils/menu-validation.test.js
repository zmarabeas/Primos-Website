/* eslint-env vitest */
// @ts-nocheck
import { describe, it, expect } from 'vitest';
import { menuLoader } from './menu-loader';

describe('Menu Data Integrity', () => {
  it('loads and validates menu data without throwing', async () => {
    const data = await menuLoader.loadMenuData();
    expect(data).toBeTruthy();
    expect(Array.isArray(data.categories)).toBe(true);
    expect(data.categories.length).toBeGreaterThan(0);
  });

  it('ensures all category IDs are unique and contain items', async () => {
    const data = await menuLoader.loadMenuData();
    const ids = data.categories.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    data.categories.forEach((category) => {
      expect(Array.isArray(category.items)).toBe(true);
      expect(category.items.length).toBeGreaterThan(0);
    });
  });

  it('verifies every menu item has a unique ID and valid fields', async () => {
    const data = await menuLoader.loadMenuData();
    const seenItemIds = new Set();

    data.categories.forEach((category) => {
      category.items.forEach((item) => {
        // Unique IDs across entire menu
        expect(seenItemIds.has(item.id)).toBe(false);
        seenItemIds.add(item.id);

        // Required fields
        expect(item.name).toBeTruthy();
        expect(item.category).toBe(category.id);
        expect(typeof item.available).toBe('boolean');

        // Pricing validation
        if (typeof item.basePrice === 'number') {
          expect(item.basePrice).toBeGreaterThanOrEqual(0);
        }

        if (Array.isArray(item.sizes)) {
          item.sizes.forEach((size) => {
            expect(size.price).toBeGreaterThan(0);
          });
        }
      });
    });
  });

  it('ensures topping, sauce, and coupon data is present and valid', async () => {
    const data = await menuLoader.loadMenuData();

    // Toppings
    expect(Array.isArray(data.toppings)).toBe(true);
    expect(data.toppings.length).toBeGreaterThan(0);
    data.toppings.forEach((topping) => {
      expect(typeof topping.id).toBe('string');
      expect(typeof topping.name).toBe('string');
      expect(typeof topping.available).toBe('boolean');
    });

    // Sauces
    expect(Array.isArray(data.sauces)).toBe(true);
    expect(data.sauces.length).toBeGreaterThan(0);
    data.sauces.forEach((sauce) => {
      expect(typeof sauce.id).toBe('string');
      expect(typeof sauce.name).toBe('string');
      expect(typeof sauce.available).toBe('boolean');
    });

    // Coupons
    expect(Array.isArray(data.coupons)).toBe(true);
    data.coupons.forEach((coupon) => {
      expect(typeof coupon.id).toBe('string');
      expect(typeof coupon.deal).toBe('string');
      expect(typeof coupon.restrictions).toBe('string');
    });
  });
});