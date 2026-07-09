import { describe, expect, it } from 'vitest';
import { buildSearchRequest, toPoi } from '../../src/als/places';
import type { PoiQuery } from '../../src/types';

const base: PoiQuery = {
  mode: 'nearby',
  queryText: '',
  radiusMeters: 1000,
  includeCategories: [],
  maxResults: 20,
};

describe('buildSearchRequest', () => {
  it('builds a nearby request with QueryPosition and QueryRadius', () => {
    const { url, body } = buildSearchRequest(base, [-74, 40]);
    expect(url).toContain('/v2/search-nearby');
    expect(body.QueryPosition).toEqual([-74, 40]);
    expect(body.QueryRadius).toBe(1000);
    expect(body.Filter).toBeUndefined();
  });

  it('adds Filter.IncludeCategories only when categories are selected', () => {
    const { body } = buildSearchRequest({ ...base, includeCategories: ['coffee_shop'] }, [0, 0]);
    expect(body.Filter).toEqual({ IncludeCategories: ['coffee_shop'] });
  });

  it('builds a text request with QueryText and BiasPosition', () => {
    const { url, body } = buildSearchRequest({ ...base, mode: 'text', queryText: 'pizza' }, [1, 2]);
    expect(url).toContain('/v2/search-text');
    expect(body.QueryText).toBe('pizza');
    expect(body.BiasPosition).toEqual([1, 2]);
  });
});

describe('toPoi', () => {
  it('maps a result item, including categories and address', () => {
    const poi = toPoi({
      PlaceId: 'p1',
      Title: 'Cafe',
      Position: [3, 4],
      Categories: [{ Id: 'coffee_shop', Name: 'Coffee Shop', Primary: true }],
      Address: { Label: '1 St' },
    });
    expect(poi).toEqual({
      placeId: 'p1',
      title: 'Cafe',
      position: [3, 4],
      categories: [{ id: 'coffee_shop', name: 'Coffee Shop', primary: true }],
      address: '1 St',
    });
  });

  it('handles a result item with no categories or address', () => {
    const poi = toPoi({ PlaceId: 'p2', Title: 'X', Position: [0, 0] });
    expect(poi.categories).toEqual([]);
    expect(poi.address).toBeUndefined();
  });
});
