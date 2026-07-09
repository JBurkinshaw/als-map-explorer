import { describe, expect, it } from 'vitest';
import { buildStyleUrl } from '../../src/als/basemap';

describe('buildStyleUrl', () => {
  it('builds a Standard/Light descriptor URL with key and color-scheme', () => {
    const url = buildStyleUrl({ styleName: 'Standard', colorScheme: 'Light' });
    expect(url).toContain('/v2/styles/Standard/descriptor');
    expect(url).toContain('color-scheme=Light');
    expect(url).toContain('key=');
  });

  it('adds terrain and buildings params when the 3D features are enabled', () => {
    const url = buildStyleUrl({
      styleName: 'Hybrid',
      colorScheme: 'Dark',
      terrain3d: true,
      buildings3d: true,
    });
    expect(url).toContain('/v2/styles/Hybrid/descriptor');
    expect(url).toContain('terrain=Terrain3D');
    expect(url).toContain('buildings=Buildings3D');
  });

  it('omits the 3D params when the features are disabled', () => {
    const url = buildStyleUrl({ styleName: 'Standard', colorScheme: 'Light' });
    expect(url).not.toContain('terrain=');
    expect(url).not.toContain('buildings=');
  });
});
