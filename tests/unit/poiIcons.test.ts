import { describe, expect, it } from 'vitest';
import { iconNameFor } from '../../src/map/poiIcons';
import { FALLBACK_ICON, POI_CATEGORIES, POI_ICON_MAP } from '../../src/config';
import type { Poi, PoiCategory } from '../../src/types';

function poi(categories: PoiCategory[]): Poi {
  return { placeId: 'p', title: 'Somewhere', position: [0, 0], categories };
}

describe('iconNameFor', () => {
  it('prefers the primary category over a non-primary one', () => {
    const p = poi([
      { id: 'coffee_shop', name: 'Coffee', primary: false },
      { id: 'restaurant', name: 'Restaurant', primary: true },
    ]);
    expect(iconNameFor(p, POI_ICON_MAP, FALLBACK_ICON)).toBe('restaurant');
  });

  it('falls back to another mapped category when the primary is unmapped', () => {
    const p = poi([
      { id: 'totally_unknown', name: 'Unknown', primary: true },
      { id: 'hotel', name: 'Hotel', primary: false },
    ]);
    expect(iconNameFor(p, POI_ICON_MAP, FALLBACK_ICON)).toBe('lodging');
  });

  it('returns the fallback when no category is mapped', () => {
    const p = poi([{ id: 'nope', name: 'Nope', primary: true }]);
    expect(iconNameFor(p, POI_ICON_MAP, FALLBACK_ICON)).toBe(FALLBACK_ICON);
  });

  it('returns the fallback when the POI has no categories', () => {
    expect(iconNameFor(poi([]), POI_ICON_MAP, FALLBACK_ICON)).toBe(FALLBACK_ICON);
  });

  it('gives every filterable category a distinct, non-fallback icon (FR-011 / SC-003)', () => {
    const icons = POI_CATEGORIES.map((c) =>
      iconNameFor(poi([{ id: c.id, name: c.label, primary: true }]), POI_ICON_MAP, FALLBACK_ICON),
    );
    for (const icon of icons) expect(icon).not.toBe(FALLBACK_ICON);
    expect(new Set(icons).size).toBe(POI_CATEGORIES.length);
  });
});
