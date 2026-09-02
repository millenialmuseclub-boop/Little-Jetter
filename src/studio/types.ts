export type Category = 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory';
export type WeatherTag = 'cool' | 'warm' | 'rainy' | 'any';

export interface Hotspot { id: string; label: string; x: number; y: number }
export interface Destination {
  id: string; city: string; country: string; region: string; weather: Exclude<WeatherTag, 'any'>;
  forecast: string; accent: string; scene: string; summary: string; hotspots: Hotspot[];
}
export interface WardrobeItem {
  id: string; name: string; category: Category; layerIndex: number; svgOverlayUrl: string;
  thumbnailUrl: string; destinationTags: string[]; weatherTag: WeatherTag; color: string; ltkAffiliateId?: string;
}
export type Outfit = Record<Category, string>;
export type StudioRoute = 'style' | 'explore' | 'journal' | 'shop';
