import { describe, expect, it } from 'vitest';
import { maskApiKey, poiRequestPreview, styleRequestPreview } from '../../src/als/preview';
import { buildSearchRequest } from '../../src/als/places';
import { DEFAULT_POI_QUERY, DEFAULT_MAP_VIEW } from '../../src/config';

describe('maskApiKey', () => {
  it('replaces the key value and never leaks it', () => {
    const masked = maskApiKey(
      'https://maps.geo.us-east-1.amazonaws.com/v2/styles/Standard/descriptor?key=SUPERSECRET&color-scheme=Light',
    );
    expect(masked).not.toContain('SUPERSECRET');
    expect(masked).toContain('key=***');
    expect(masked).toContain('color-scheme=Light');
  });

  it('masks the key regardless of its position in the query string', () => {
    expect(maskApiKey('https://x/y?a=b&key=ABC123')).toBe('https://x/y?a=b&key=***');
  });
});

describe('poiRequestPreview', () => {
  const center: [number, number] = [-74.006, 40.7128];

  it('matches buildSearchRequest output with the key masked', () => {
    const preview = poiRequestPreview(DEFAULT_POI_QUERY, center);
    const real = buildSearchRequest(DEFAULT_POI_QUERY, center);
    expect(preview.method).toBe('POST');
    expect(preview.url).toBe(maskApiKey(real.url));
    expect(preview.body).toBe(JSON.stringify(real.body, null, 2));
  });

  it('uses search-nearby for nearby mode and search-text for text mode', () => {
    expect(poiRequestPreview({ ...DEFAULT_POI_QUERY, mode: 'nearby' }, center).url).toContain('search-nearby');
    expect(poiRequestPreview({ ...DEFAULT_POI_QUERY, mode: 'text' }, center).url).toContain('search-text');
  });
});

describe('styleRequestPreview', () => {
  it('masks the key and reflects the contour-density parameter', () => {
    const url = styleRequestPreview({ ...DEFAULT_MAP_VIEW, contourDensity: 'Medium' });
    expect(url).toContain('key=***');
    expect(url).toContain('contour-density=Medium');
  });

  it('omits contour-density when contours are off', () => {
    const url = styleRequestPreview({ ...DEFAULT_MAP_VIEW, contourDensity: 'Off' });
    expect(url).not.toContain('contour-density');
  });
});
