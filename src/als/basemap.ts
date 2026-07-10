// Builds the AWS Location Service Maps v2 style-descriptor URL that MapLibre loads
// as its `style`. This is deliberately raw and readable - seeing the actual URL is
// the whole point (constitution Principle III).
//
//   https://maps.geo.<region>.amazonaws.com/v2/styles/<Style>/descriptor
//     ?key=<API_KEY>
//     &color-scheme=<Light|Dark>
//     [&terrain=Terrain3D]              <- 3D terrain (style-request feature)
//     [&buildings=Buildings3D]          <- 3D buildings (style-request feature)
//     [&contour-density=Low|Medium|High] <- topographic contour lines (style-request
//                                           feature); renders with or without terrain

import { config } from '../config';
import type { ColorScheme, ContourDensity, MapStyleName } from '../types';

export interface BasemapOptions {
  styleName: MapStyleName;
  colorScheme: ColorScheme;
  terrain3d?: boolean;
  buildings3d?: boolean;
  contourDensity?: ContourDensity;
}

export function buildStyleUrl(opts: BasemapOptions): string {
  const params = new URLSearchParams();
  params.set('key', config.apiKey);
  params.set('color-scheme', opts.colorScheme);
  if (opts.terrain3d) params.set('terrain', 'Terrain3D');
  if (opts.buildings3d) params.set('buildings', 'Buildings3D');
  // 'Off' means no contours - omit the param entirely; otherwise send the level.
  if (opts.contourDensity && opts.contourDensity !== 'Off') {
    params.set('contour-density', opts.contourDensity);
  }

  return `${config.mapsHost}/v2/styles/${opts.styleName}/descriptor?${params.toString()}`;
}
