/* eslint-env vitest, jsdom */
// @ts-nocheck
import { render } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Menu from '../Menu.svelte';

describe('Menu Component', () => {

  it('renders six menu images on small screens', async () => {
    // Simulate mobile viewport
    window.innerWidth = 375;
    const { getAllByRole } = render(Menu);
    // Trigger resize event for reactive statement
    window.dispatchEvent(new Event('resize'));
    const images = getAllByRole('img');
    expect(images).toHaveLength(6);
  });

  it('renders three rows on desktop screens', async () => {
    window.innerWidth = 1200;
    const { container } = render(Menu);
    window.dispatchEvent(new Event('resize'));
    const rows = container.querySelectorAll('.row-container');
    expect(rows.length).toBe(3);
  });
});