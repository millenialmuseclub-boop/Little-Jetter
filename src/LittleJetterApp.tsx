import { useEffect, useMemo, useRef, useState } from 'react';
import './little-jetter.css';
import { realProductCatalog, type ProductCategory } from './catalog';
import dressUpCatalog from './data/dressUpCatalog.json';
import { destinationAssetUrls } from './data/garmentManifest';

type Destination = {
  id: string;
  region: string;
  city: string;
  country: string;
  area: string;
  areaType: 'State' | 'Province' | 'Prefecture' | 'Country' | 'County' | 'Region';
  note: string;
  weather: string;
  prompt: string;
  color: string;
  icon: string;
  adventure: string;
  exploreIcon: string;
  notices: Array<{ icon: string; label: string }>;
  needsLayer: boolean;
  sandalsFriendly: boolean;
  passportPhrase: string;
};

const destinations: Destination[] = [
  { id: 'tokyo', region: 'Asia', city: 'Tokyo', country: 'Japan', area: 'Tokyo Metropolis', areaType: 'Prefecture', note: 'Neon streets & tiny treasures', weather: 'Cool + bright', prompt: 'A light jacket belongs in this adventure.', color: '#e85849', icon: '☂', adventure: 'You’re exploring a lantern street, visiting a tiny toy shop, and stopping for a special snack. It may turn cool later.', exploreIcon: '🏮', notices: [{icon:'🍡',label:'A perfect row of snacks'},{icon:'🚆',label:'A train arriving on time'},{icon:'🏮',label:'A lantern glowing'},{icon:'🪀',label:'A tiny toy in a window'}], needsLayer: true, sandalsFriendly: false, passportPhrase: 'Curious city explorer' },
  { id: 'honolulu', region: 'North America', city: 'Honolulu', country: 'United States', area: 'Hawaiʻi', areaType: 'State', note: 'Warm waves & island mornings', weather: 'Sunny + breezy', prompt: 'A sun hat will be your best travel buddy.', color: '#2e8b88', icon: '☼', adventure: 'You’re greeting the ocean, looking for colorful fish, and sharing a shady picnic beneath the palms.', exploreIcon: '🌊', notices: [{icon:'🌺',label:'A flower tucked behind an ear'},{icon:'🐠',label:'A bright fish in clear water'},{icon:'🌴',label:'Palm leaves moving in the breeze'},{icon:'🍧',label:'A mountain of shave ice'}], needsLayer: false, sandalsFriendly: true, passportPhrase: 'Sunshine-ready island guest' },
  { id: 'london', region: 'Europe', city: 'London', country: 'United Kingdom', area: 'England', areaType: 'Country', note: 'Rainy lanes & grand museums', weather: 'Cloudy + drizzly', prompt: 'Bring shoes that are happy in puddles.', color: '#52769b', icon: '☁', adventure: 'You’re riding upstairs on a red bus, exploring a grand museum, and counting puddles on a garden walk.', exploreIcon: '🌧️', notices: [{icon:'🚌',label:'The view from a double-decker'},{icon:'🦖',label:'A giant museum dinosaur'},{icon:'🍂',label:'Leaves shining after rain'},{icon:'🍵',label:'A warm cup at tea time'}], needsLayer: true, sandalsFriendly: false, passportPhrase: 'Brilliant rainy-day wanderer' },
  { id: 'cartagena', region: 'South America', city: 'Cartagena', country: 'Colombia', area: 'Bolívar', areaType: 'Province', note: 'Colorful walls & sea air', weather: 'Hot + sunny', prompt: 'Choose something cool and easy to move in.', color: '#e07b55', icon: '✺', adventure: 'You’re following bright balconies through the old city, hearing music in a plaza, and catching the sea breeze.', exploreIcon: '🌈', notices: [{icon:'🌺',label:'Flowers tumbling from a balcony'},{icon:'🪇',label:'A tiny door knocker'},{icon:'🪇',label:'A rhythm drifting across a plaza'},{icon:'🥥',label:'A cool coconut treat'}], needsLayer: false, sandalsFriendly: true, passportPhrase: 'Color-spotting coastal explorer' },
  { id: 'paris', region: 'Europe', city: 'Paris', country: 'France', area: 'Île-de-France', areaType: 'Region', note: 'Garden walks & bakery windows', weather: 'Mild + changeable', prompt: 'A layer you can carry is a clever choice.', color: '#8d6d8f', icon: '✦', adventure: 'You’re sailing a tiny boat in a garden fountain, sketching a beautiful doorway, and choosing a bakery treat.', exploreIcon: '🎨', notices: [{icon:'⛲',label:'A toy boat crossing a fountain'},{icon:'🥐',label:'A warm pastry in a window'},{icon:'🚪',label:'A doorway with golden details'},{icon:'🎨',label:'An artist mixing a new color'}], needsLayer: true, sandalsFriendly: false, passportPhrase: 'Garden-strolling art detective' },
  { id: 'nairobi', region: 'Africa', city: 'Nairobi', country: 'Kenya', area: 'Nairobi County', areaType: 'County', note: 'Big skies & wild discoveries', weather: 'Warm days + cool evenings', prompt: 'Pack for sunshine and a cooler sunset.', color: '#b97935', icon: '◌', adventure: 'You’re watching the city wake up, visiting a wildlife center, and saving a cozy layer for sunset.', exploreIcon: '🦒', notices: [{icon:'🦒',label:'A giraffe reaching for a leaf'},{icon:'🌿',label:'A new shape in an acacia tree'},{icon:'🧺',label:'A beautiful woven pattern'},{icon:'🌇',label:'The sky changing at sunset'}], needsLayer: true, sandalsFriendly: false, passportPhrase: 'Big-sky wildlife observer' },
  { id: 'mexico-city', region: 'North America', city: 'Mexico City', country: 'Mexico', area: 'Mexico City', areaType: 'State', note: 'Big parks & brilliant color', weather: 'Mild days + cool evenings', prompt: 'Comfortable shoes and a light layer make a clever team.', color: '#c64f5c', icon: '❋', adventure: 'You’re exploring a leafy park, spotting colorful market treasures, and saving room for a sweet treat.', exploreIcon: '🌮', notices: [{icon:'🛶',label:'A bright boat gliding by'},{icon:'🌳',label:'A giant tree in the park'},{icon:'🎨',label:'A wall bursting with color'},{icon:'🍫',label:'A special chocolate treat'}], needsLayer: true, sandalsFriendly: false, passportPhrase: 'Color-loving city adventurer' },
  { id: 'rome', region: 'Europe', city: 'Rome', country: 'Italy', area: 'Lazio', areaType: 'Region', note: 'Fountains & ancient surprises', weather: 'Sunny + warm', prompt: 'Choose easy walking shoes for stone streets.', color: '#ad6946', icon: '◍', adventure: 'You’re finding animal shapes in old fountains, counting columns, and sharing a scoop of gelato.', exploreIcon: '🏛️', notices: [{icon:'⛲',label:'A coin sparkling in a fountain'},{icon:'🏛️',label:'A row of giant columns'},{icon:'🛵',label:'A tiny scooter passing by'},{icon:'🍨',label:'A colorful gelato flavor'}], needsLayer: false, sandalsFriendly: true, passportPhrase: 'Fountain-finding history scout' },
  { id: 'sydney', region: 'Oceania', city: 'Sydney', country: 'Australia', area: 'New South Wales', areaType: 'State', note: 'Harbor sails & sunny paths', weather: 'Breezy + bright', prompt: 'Bring sun protection and something for the breeze.', color: '#2585a1', icon: '≈', adventure: 'You’re following the harbor path, watching ferries cross the water, and looking for a perfect picnic spot.', exploreIcon: '⛵', notices: [{icon:'⛵',label:'A white sail on blue water'},{icon:'🦜',label:'A noisy rainbow bird'},{icon:'🌉',label:'A giant harbor bridge'},{icon:'🥪',label:'A picnic with a view'}], needsLayer: true, sandalsFriendly: true, passportPhrase: 'Breezy harbor pathfinder' },
  { id: 'san-jose', region: 'North America', city: 'San José', country: 'Costa Rica', area: 'San José', areaType: 'Province', note: 'Green hills & nature clues', weather: 'Warm + rain possible', prompt: 'A light rain layer belongs in your day bag.', color: '#4d8c61', icon: '☘', adventure: 'You’re listening for tropical birds, discovering garden colors, and getting ready for a quick warm shower.', exploreIcon: '🦥', notices: [{icon:'🦥',label:'A sleepy sloth overhead'},{icon:'🌺',label:'A flower as bright as paint'},{icon:'☔',label:'Raindrops tapping leaves'},{icon:'🍍',label:'Fresh fruit at the market'}], needsLayer: true, sandalsFriendly: true, passportPhrase: 'Rain-ready nature detective' },
  { id: 'new-york', region: 'North America', city: 'New York City', country: 'United States', area: 'New York', areaType: 'State', note: 'Skyline views & neighborhood energy', weather: 'Bright + changeable', prompt: 'Comfortable shoes belong in every city plan.', color: '#d65b48', icon: '◫', adventure: 'You’re crossing a giant park, spotting yellow taxis, and looking up at a sparkling skyline.', exploreIcon: '▤', notices: [{icon:'',label:'A yellow taxi turning the corner'},{icon:'',label:'A tiny garden between tall buildings'},{icon:'',label:'A musician in the park'},{icon:'',label:'A bridge stretching across the water'}], needsLayer: true, sandalsFriendly: false, passportPhrase: 'Big-city block explorer' },
  { id: 'barcelona', region: 'Europe', city: 'Barcelona', country: 'Spain', area: 'Catalonia', areaType: 'Region', note: 'Mosaic colors & seaside streets', weather: 'Sunny + breezy', prompt: 'Choose color, walking shoes, and a light layer.', color: '#d99132', icon: '◇', adventure: 'You’re hunting for mosaic creatures, walking beneath twisty trees, and ending the day near the sea.', exploreIcon: '◇', notices: [{icon:'',label:'A wall made from tiny colorful tiles'},{icon:'',label:'A balcony shaped like a wave'},{icon:'',label:'A shady plaza fountain'},{icon:'',label:'A sail beyond the city street'}], needsLayer: true, sandalsFriendly: true, passportPhrase: 'Mosaic-pattern detective' },
  { id: 'cape-town', region: 'Africa', city: 'Cape Town', country: 'South Africa', area: 'Western Cape', areaType: 'Province', note: 'Mountain trails & ocean air', weather: 'Sunny + windy', prompt: 'Bring a layer that can handle a sea breeze.', color: '#3a8278', icon: '△', adventure: 'You’re watching clouds roll over the mountain, meeting tiny beach birds, and following the harbor path.', exploreIcon: '△', notices: [{icon:'',label:'A cloud spilling over the mountain'},{icon:'',label:'A bright house on a colorful street'},{icon:'',label:'A penguin waddling near the sand'},{icon:'',label:'A fishing boat returning to harbor'}], needsLayer: true, sandalsFriendly: false, passportPhrase: 'Mountain-and-ocean scout' },
  { id: 'vancouver', region: 'North America', city: 'Vancouver', country: 'Canada', area: 'British Columbia', areaType: 'Province', note: 'Forest paths & harbor views', weather: 'Cool + misty', prompt: 'A rain layer and sturdy shoes make a clever pair.', color: '#477b70', icon: '♢', adventure: 'You’re rolling beside the seawall, listening for birds in the forest, and watching seaplanes land.', exploreIcon: '♢', notices: [{icon:'',label:'A seaplane touching the water'},{icon:'',label:'A giant cedar tree'},{icon:'',label:'A bicycle bell on the seawall'},{icon:'',label:'A mountain hiding in mist'}], needsLayer: true, sandalsFriendly: false, passportPhrase: 'Misty-forest pathfinder' },
  { id: 'seoul', region: 'Asia', city: 'Seoul', country: 'South Korea', area: 'Seoul Special City', areaType: 'State', note: 'Palace colors & lively streets', weather: 'Crisp + clear', prompt: 'A comfortable layer is perfect for a long discovery day.', color: '#8c6292', icon: '□', adventure: 'You’re finding painted palace details, exploring a playful design shop, and watching the city glow after sunset.', exploreIcon: '□', notices: [{icon:'',label:'A painted pattern beneath a palace roof'},{icon:'',label:'A tiny charm on a backpack'},{icon:'',label:'A quiet garden gate'},{icon:'',label:'City lights reflected in the river'}], needsLayer: true, sandalsFriendly: false, passportPhrase: 'Palace-pattern explorer' },
];

// Destinations with a real painterly doll-stage backdrop (public/little-jetter/<id>-doll-backdrop.png),
// same treatment as tokyo — everything else falls back to the generic CSS scene.
const DESTINATIONS_WITH_BACKDROP = new Set([
  'tokyo', 'seoul', 'honolulu', 'new-york', 'mexico-city', 'san-jose', 'vancouver', 'barcelona',
  'paris', 'nairobi', 'london', 'cartagena', 'rome', 'cape-town', 'sydney',
]);

const regions = ['All regions', ...Array.from(new Set(destinations.map((item) => item.region)))];
const destinationTypes: Record<string, string> = {
  tokyo: 'Big city', honolulu: 'Beach + island', london: 'Historic city', cartagena: 'Coastal city', paris: 'Art + city', nairobi: 'City + wildlife',
  'mexico-city': 'Big city', rome: 'History + city', sydney: 'Harbor + beach', 'san-jose': 'City + nature',
  'new-york': 'Big city', barcelona: 'Art + coast', 'cape-town': 'Mountain + coast', vancouver: 'City + nature', seoul: 'History + city',
};
const allDestinationTypes = ['All types', ...Array.from(new Set(Object.values(destinationTypes)))];
const adventureTemperatures: Record<string, string> = { tokyo: '55°F', honolulu: '79°F', london: '52°F', cartagena: '84°F', paris: '59°F', nairobi: '72°F', 'mexico-city': '66°F', rome: '73°F', sydney: '70°F', 'san-jose': '75°F', 'new-york': '61°F', barcelona: '71°F', 'cape-town': '65°F', vancouver: '54°F', seoul: '57°F' };

const STORAGE_KEY = 'little-jetter-first-trip';
const PASSPORT_KEY = 'little-jetter-passport-stamps';

type CatalogVariant = { id: string; swatch: string; imageUrl: string };
type CatalogItem = { id: string; name: string; description: string; imageUrl: string; slot: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory' | 'buddy'; tags: string[]; variants?: CatalogVariant[] };
type CatalogDestination = { tops: CatalogItem[]; bottoms: CatalogItem[]; layers: CatalogItem[]; shoes: CatalogItem[]; accessories: CatalogItem[]; buddies: CatalogItem[] };
type DressUpCatalog = { schemaVersion: number; template: { id: string; width: number; height: number; anchors: Record<string, number> }; destinations: Record<string, Partial<CatalogDestination>> & { all: CatalogDestination } };
const catalog = dressUpCatalog as unknown as DressUpCatalog;
const wardrobe = catalog.destinations.all;

type PickGroup = keyof CatalogDestination;
type Picks = Record<PickGroup, string>;
type ClothingGroup = Exclude<PickGroup, 'buddies'>;
type GarmentColors = Record<string, string>;
type GarmentScales = Record<string, number>;
const MIN_GARMENT_SCALE = 0.6;
const MAX_GARMENT_SCALE = 1.6;
function clampGarmentScale(value: number) {
  return Math.min(MAX_GARMENT_SCALE, Math.max(MIN_GARMENT_SCALE, value));
}
type Character = { style: string; skin: string; hair: string; hairStyle: string; eyes: string };
type SavedLook = { id: string; name: string; picks: Picks; character: Character; colors: GarmentColors; scales?: GarmentScales; offsets?: Record<string, { x: number; y: number }> };

const CLOSET_GROUPS: ClothingGroup[] = ['bottoms', 'tops', 'layers', 'shoes', 'accessories'];
const CATEGORY_BUTTON: Record<ClothingGroup, { icon: string; label: string; spot: string }> = {
  tops: { icon: '👕', label: 'Main piece', spot: 'spot-tops' },
  bottoms: { icon: '👖', label: 'Bottom', spot: 'spot-bottoms' },
  layers: { icon: '🧥', label: 'Layer', spot: 'spot-layers' },
  shoes: { icon: '👟', label: 'Shoes', spot: 'spot-shoes' },
  accessories: { icon: '🎒', label: 'Accessory', spot: 'spot-accessories' },
};
type AvatarFeature = 'hairStyle';
const AVATAR_BUTTON: Record<AvatarFeature, { icon: string; label: string }> = {
  hairStyle: { icon: '🙂', label: 'Head' },
};
const LAYERS = { base: 0, hairBack: 10, shoes: 20, bottom: 25, top: 30, dress: 35, outerwear: 50, hairFront: 60, accessory: 70, hat: 80 } as const;
const PRODUCT_CATEGORY_ICON: Record<ProductCategory, string> = {
  top: '👕', bottom: '👖', dress: '👗', outerwear: '🧥', shoe: '👟',
  accessory: '🎒', luggage: '🧳', toy: '🧸', book: '📘', swim: '🩱',
};
// Gives every product-card tile a colorful backdrop keyed by category, so a
// real product photo reads just as "dressed up" as the fallback-icon cards
// (which already sat on a warm gradient) instead of a plain white square.
const PRODUCT_CATEGORY_BG: Record<ProductCategory, string> = {
  top: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#ffe3ea 100%)',
  bottom: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#e3edff 100%)',
  dress: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#ffe0f6 100%)',
  outerwear: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#fff0d6 100%)',
  shoe: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#ffe6d2 100%)',
  accessory: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#e3f7f0 100%)',
  luggage: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#f4e6ff 100%)',
  toy: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#fff3d8 100%)',
  book: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#e0f0ff 100%)',
  swim: 'radial-gradient(circle at 50% 40%,#fff 0 26%,#d9f5f5 100%)',
};

const gameSheets: Record<PickGroup, string> = {
  tops: '/little-jetter/game-tops.png', bottoms: '/little-jetter/game-bottoms.png', layers: '/little-jetter/game-layers.png',
  shoes: '/little-jetter/game-shoes.png', accessories: '/little-jetter/game-accessories.png', buddies: '/little-jetter/game-buddies.png',
};

function gameItemStyle(group: PickGroup, id: string): React.CSSProperties {
  const index = wardrobe[group].findIndex((item) => item.id === id);
  const spriteIndex = Math.max(index, 0) % 3;
  const variantFilter = index === 3 ? 'hue-rotate(65deg) saturate(1.25)' : index === 4 ? 'hue-rotate(155deg) saturate(1.15)' : undefined;
  return { backgroundImage: `url(${gameSheets[group]})`, backgroundPosition: `${spriteIndex * 50}% center`, filter: variantFilter };
}

const characterOptions = {
  style: [{ id: 'girl', label: 'Girl' }, { id: 'boy', label: 'Boy' }],
  hairStyle: [{ id: 'curls', label: 'Wavy' }, { id: 'bob', label: 'Bob' }, { id: 'short', label: 'Short' }, { id: 'coils', label: 'Coils' }, { id: 'bun-blonde-bow', label: 'Bun & Bow' }, { id: 'cap-brown', label: 'Cap' }, { id: 'bandana-bun', label: 'Bandana Bun' }, { id: 'messy-bun', label: 'Messy Bun' }, { id: 'wavy-daisy-auburn', label: 'Daisy Wavy' }, { id: 'pigtail-buns', label: 'Pigtail Buns' }, { id: 'bob-bangs', label: 'Bob & Bangs' }, { id: 'braids-dark', label: 'Braids' }, { id: 'wavy-clip', label: 'Wavy Clip' }, { id: 'blonde-wavy-daisy', label: 'Blonde Wavy' }, { id: 'curly-fro', label: 'Curly Fro' }, { id: 'pigtails-bows', label: 'Pigtails' }, { id: 'curly-topknot', label: 'Curly Topknot' }, { id: 'braids-auburn', label: 'Auburn Braids' }, { id: 'bucket-hat-pink', label: 'Bucket Hat' }, { id: 'wavy-long-dark', label: 'Long Wavy' }, { id: 'bob-blonde-clip', label: 'Blonde Bob' }, { id: 'headband-curly', label: 'Headband Curls' }, { id: 'bow-curly', label: 'Curly & Bow' }, { id: 'bun-auburn', label: 'Auburn Bun' }, { id: 'curly-fro-boy', label: 'Curly Fro' }, { id: 'curly-bow', label: 'Curly & Bow' }, { id: 'wavy-blonde-boy', label: 'Wavy Blonde' }, { id: 'long-straight-dark', label: 'Long Straight' }, { id: 'wavy-brown-boy', label: 'Wavy Brown' }, { id: 'cap-green-boy', label: 'Green Cap' }, { id: 'wavy-blonde-boy2', label: 'Wavy Blonde' }, { id: 'cap-tan-boy', label: 'Tan Cap' }, { id: 'short-dark-boy', label: 'Short & Dark' }, { id: 'curly-auburn-boy', label: 'Curly Auburn' },],
  skin: [{ id: 'porcelain', color: '#f4c9a8' }, { id: 'peach', color: '#dea47f' }, { id: 'golden', color: '#bd7656' }, { id: 'caramel', color: '#9a5f43' }, { id: 'brown', color: '#70432f' }, { id: 'deep', color: '#4b2c24' }],
  hair: [
    { id: 'platinum-blonde', label: 'Platinum Blonde', color: '#ebe1d2' },
    { id: 'light-blonde', label: 'Light Blonde', color: '#e1c48c' },
    { id: 'honey-blonde', label: 'Honey Blonde', color: '#c99b5a' },
    { id: 'strawberry-blonde', label: 'Strawberry Blonde', color: '#d6966e' },
    { id: 'red', label: 'Red', color: '#b44637' },
    { id: 'auburn', label: 'Auburn', color: '#7a3a27' },
    { id: 'light-brown', label: 'Light Brown', color: '#966846' },
    { id: 'brown', label: 'Medium Brown', color: '#573629' },
    { id: 'dark-brown', label: 'Dark Brown', color: '#4a3022' },
    { id: 'black', label: 'Black', color: '#23201e' },
    { id: 'warm-black', label: 'Warm Black', color: '#281e1c' },
    { id: 'chocolate', label: 'Chocolate', color: '#5c3a26' },
    { id: 'caramel', label: 'Caramel', color: '#9c683a' },
    { id: 'ash-brown', label: 'Ash Brown', color: '#786455' },
    { id: 'gray', label: 'Gray', color: '#969491' },
    { id: 'blue', label: 'Blue', color: '#397e9c' },
    { id: 'pink', label: 'Pink', color: '#db6e96' },
    { id: 'purple', label: 'Purple', color: '#784696' },
  ],
  eyes: [
    { id: 'brown', label: 'Brown', color: '#5a3827' },
    { id: 'light-brown', label: 'Light Brown', color: '#966e3c' },
    { id: 'hazel', label: 'Hazel', color: '#8d7440' },
    { id: 'green', label: 'Green', color: '#4e8060' },
    { id: 'blue', label: 'Blue', color: '#4887aa' },
    { id: 'light-blue', label: 'Light Blue', color: '#8cbedc' },
    { id: 'gray', label: 'Gray', color: '#718088' },
    { id: 'amber', label: 'Amber', color: '#b47828' },
  ],
};

function catalogItemFor(destinationId: string, group: PickGroup, itemId: string) {
  const destinationItem = catalog.destinations[destinationId]?.[group]?.find((item) => item.id === itemId);
  return destinationItem ?? wardrobe[group].find((item) => item.id === itemId);
}

function catalogImageFor(item: CatalogItem | undefined, selectedSwatch?: string) {
  if (!item) return '';
  return item.variants?.find((variant) => variant.swatch.toLowerCase() === selectedSwatch?.toLowerCase())?.imageUrl ?? item.imageUrl;
}

function ClassicDoll({ picks, character, garmentColors, onlyLayer, previewViewBox = '0 0 600 900', hiddenLayers = [] }: { picks: Picks; character: Character; garmentColors: GarmentColors; onlyLayer?: 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory'; previewViewBox?: string; hiddenLayers?: string[] }) {
  const skin = characterOptions.skin.find((option) => option.id === character.skin)?.color ?? '#bd7656';
  const hair = characterOptions.hair.find((option) => option.id === character.hair)?.color ?? '#573629';
  const eyes = characterOptions.eyes.find((option) => option.id === character.eyes)?.color ?? '#5a3827';
  const topColors: Record<string,string> = { stripe:'#ee6757', sweater:'#a386ce', dress:'#35a5a0', 'sunset-tee':'#ef944b', 'adventure-shirt':'#4c8ca5' };
  const bottomColors: Record<string,string> = { 'travel-jeans':'#47739b', 'coral-skirt':'#e96f78', 'adventure-shorts':'#62a886', 'wide-leg-pants':'#876da0', 'play-skirt':'#e8aa31' };
  const layerColors: Record<string,string> = { rain:'#f1bd42', denim:'#5585a6', cardigan:'#df8e76', windbreaker:'#39a29a' };
  const shoeColors: Record<string,string> = { sneakers:'#db4f43', boots:'#e8aa31', sandals:'#3d9b91', 'high-tops':'#8765ba', 'trail-shoes':'#55745c' };
  const top = garmentColors[picks.tops] ?? topColors[picks.tops] ?? '#ee6757'; const bottom = garmentColors[picks.bottoms] ?? bottomColors[picks.bottoms] ?? '#47739b'; const layer = picks.layers === 'none' ? undefined : garmentColors[picks.layers] ?? layerColors[picks.layers]; const shoes = garmentColors[picks.shoes] ?? shoeColors[picks.shoes] ?? '#db4f43';
  const isSkirt = picks.bottoms === 'coral-skirt' || picks.bottoms === 'play-skirt';
  const isShorts = picks.bottoms === 'adventure-shorts';
  const isDress = picks.tops === 'dress';
  const isSweater = picks.tops === 'sweater' || picks.tops === 'adventure-shirt';
  const hairStyle = character.hairStyle ?? 'curls';
  return <svg className={`little-aligned-doll ${onlyLayer ? 'little-garment-canvas' : ''}`} viewBox={previewViewBox} style={{ '--top-fill': top, '--bottom-fill': bottom, '--layer-fill': layer ?? 'transparent', '--shoe-fill': shoes } as React.CSSProperties} data-master-canvas="600x900" data-hidden-layers={hiddenLayers.join(' ')} data-only-layer={onlyLayer} data-layer-map={JSON.stringify(LAYERS)} role="img" aria-label={onlyLayer ? `${onlyLayer} garment preview` : `Doll in a base outfit wearing ${wardrobe.tops.find(item=>item.id===picks.tops)?.name}, ${wardrobe.bottoms.find(item=>item.id===picks.bottoms)?.name}, and ${wardrobe.shoes.find(item=>item.id===picks.shoes)?.name}`}>
    <defs><radialGradient id="skinGlow" cx="34%" cy="20%" r="82%"><stop stopColor="#fff" stopOpacity=".48"/><stop offset=".42" stopColor={skin}/><stop offset=".82" stopColor={skin}/><stop offset="1" stopColor="#70432f" stopOpacity=".3"/></radialGradient><linearGradient id="skinBody" x1=".18" y1="0" x2=".82" y2="1"><stop stopColor="#fff" stopOpacity=".3"/><stop offset=".3" stopColor={skin}/><stop offset="1" stopColor="#70432f" stopOpacity=".23"/></linearGradient><linearGradient id="underTop" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fffdf6"/><stop offset=".55" stopColor="#fff3d8"/><stop offset="1" stopColor="#dfc397"/></linearGradient><linearGradient id="underBottom" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8eabc2"/><stop offset=".55" stopColor="#607f9d"/><stop offset="1" stopColor="#405f7c"/></linearGradient><linearGradient id="hairShade" x1=".2" y1="0" x2=".8" y2="1"><stop stopColor="#fff" stopOpacity=".24"/><stop offset=".28" stopColor={hair}/><stop offset="1" stopColor="#211a19" stopOpacity=".46"/></linearGradient><linearGradient id="topShade" x1=".15" y1="0" x2=".85" y2="1"><stop stopColor="#fff" stopOpacity=".4"/><stop offset=".45" stopColor={top}/><stop offset="1" stopColor="#173a47" stopOpacity=".2"/></linearGradient><linearGradient id="bottomShade" x1=".1" y1="0" x2=".9" y2="1"><stop stopColor="#fff" stopOpacity=".26"/><stop offset=".42" stopColor={bottom}/><stop offset="1" stopColor="#173a47" stopOpacity=".25"/></linearGradient><linearGradient id="layerShade" x1=".1" y1="0" x2=".9" y2="1"><stop stopColor="#fff" stopOpacity=".4"/><stop offset=".48" stopColor={layer}/><stop offset="1" stopColor="#173a47" stopOpacity=".22"/></linearGradient><linearGradient id="shoeShade" x1=".15" y1="0" x2=".85" y2="1"><stop stopColor="#fff" stopOpacity=".3"/><stop offset=".44" stopColor={shoes}/><stop offset="1" stopColor="#173a47" stopOpacity=".28"/></linearGradient><filter id="softShadow"><feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#173a47" floodOpacity=".18"/></filter><filter id="neckBlend" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2"/></filter></defs>
    <g transform="scale(1.5)"><ellipse cx="200" cy="520" rx="82" ry="13" fill="#173a47" opacity=".16" filter="url(#softShadow)"/>
    <g data-layer="base"><path d="M172 226q-17 34-20 74q-2 30 6 55" fill="none" stroke={skin} strokeWidth="22" strokeLinecap="round"/><path d="M228 226q17 34 20 74q2 30-6 55" fill="none" stroke={skin} strokeWidth="22" strokeLinecap="round"/><path d="M174 329l-15 145-8 31q-4 17 12 22 16 4 23-14l14-54 14 54q7 18 23 14 16-5 12-22l-8-31-15-145z" fill="url(#skinBody)"/><path d="M184 194h32l6 32h-44z" fill="url(#skinBody)"/><ellipse cx="200" cy="196" rx="19" ry="7" fill="#70432f" opacity=".14" filter="url(#neckBlend)"/><ellipse cx="200" cy="223" rx="27" ry="9" fill="#70432f" opacity=".22" filter="url(#neckBlend)"/></g>
    <g data-layer="face" transform="translate(200,194) scale(.78) translate(-200,-194)"><ellipse cx="143" cy="151" rx="12" ry="18" fill="url(#skinBody)"/><ellipse cx="257" cy="151" rx="12" ry="18" fill="url(#skinBody)"/><circle cx="200" cy="145" r="63" fill="url(#skinGlow)"/><ellipse cx="182" cy="155" rx="12" ry="14" fill="#fffaf4"/><ellipse cx="218" cy="155" rx="12" ry="14" fill="#fffaf4"/><circle cx="182" cy="157" r="7" fill={eyes}/><circle cx="218" cy="157" r="7" fill={eyes}/><circle cx="179" cy="153" r="2.7" fill="white"/><circle cx="215" cy="153" r="2.7" fill="white"/><path d="M169 136q13-8 25 0m12 0q12-8 25 0" fill="none" stroke={hair} strokeOpacity=".7" strokeWidth="4" strokeLinecap="round"/><path d="M201 157q-5 11 1 15" fill="none" stroke="#8d5847" strokeOpacity=".45" strokeWidth="2.5" strokeLinecap="round"/><path d="M184 181q16 15 32 0" fill="#c85f61" fillOpacity=".16" stroke="#9b4d46" strokeWidth="3.2" strokeLinecap="round"/><ellipse cx="163" cy="174" rx="12" ry="7" fill="#ef8f80" opacity=".26"/><ellipse cx="237" cy="174" rx="12" ry="7" fill="#ef8f80" opacity=".26"/>{character.style === 'girl' && <><path d="M169 150l-5-3m68 3 5-3" stroke={hair} strokeWidth="2.5" strokeLinecap="round"/><circle cx="171" cy="173" r="1.5" fill="#9b5b4b" opacity=".5"/><circle cx="176" cy="176" r="1.4" fill="#9b5b4b" opacity=".45"/><circle cx="229" cy="173" r="1.5" fill="#9b5b4b" opacity=".5"/><circle cx="224" cy="176" r="1.4" fill="#9b5b4b" opacity=".45"/></>}</g>
    <g key={`${hairStyle}-${character.hair}`} data-layer="hair" data-hair-style={hairStyle} transform="translate(200,194) scale(.78) translate(-200,-194)">
      <ellipse cx="200" cy="106" rx="59" ry="40" fill={hair}/>
      {hairStyle === 'short' && <><path d="M143 145q2-71 57-71 58 0 57 73-18-38-57-38-38 0-57 36z" fill={hair} stroke="#173a47" strokeWidth="5"/><path d="M153 111q47-34 94 5" fill="none" stroke="white" strokeOpacity=".13" strokeWidth="7" strokeLinecap="round"/></>}
      {hairStyle === 'bob' && <><path d="M137 150q-3-84 63-84 67 0 64 84l-9 63-30-13 7-74q-32-29-64 0l7 74-30 13z" fill={hair} stroke="#173a47" strokeWidth="5"/><path d="M158 105q42-29 83 4" fill="none" stroke="white" strokeOpacity=".14" strokeWidth="7" strokeLinecap="round"/></>}
      {hairStyle === 'coils' && <><path d="M148 147q-1-68 52-68 53 0 52 68-17-39-52-39-36 0-52 39z" fill={hair} stroke="#173a47" strokeWidth="5"/>{[[139,104,27],[261,104,27],[153,82,22],[247,82,22],[177,72,21],[223,72,21]].map(([cx,cy,r])=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={hair} stroke="#173a47" strokeWidth="3"/>)}<path d="M171 91q29-19 58 0" fill="none" stroke="white" strokeOpacity=".13" strokeWidth="6" strokeLinecap="round"/></>}
      {hairStyle === 'curls' && <><path d="M139 147q-5-81 61-81 68 0 62 84-17-47-62-47-43 0-61 44z" fill={hair} stroke="#173a47" strokeWidth="5"/>{[146,164,182,218,236,254].map((x,index)=><circle key={x} cx={x} cy={index%2?95:110} r="14" fill={hair} stroke="#173a47" strokeWidth="3"/>)}<path d="M156 116q44-39 88 0" fill="none" stroke="white" strokeOpacity=".13" strokeWidth="7" strokeLinecap="round"/></>}
    </g>
    <g data-layer="base-outfit"><path d="M172 213q28-14 56 0l9 116q-37 14-74 0z" fill="url(#underTop)" filter="url(#neckBlend)"/><path d="M154 320h92l5 83-43 5-8-49-8 49-43-5z" fill="url(#underBottom)"/><path d="M183 217q17 14 34 0" fill="none" stroke="#e7cda4" strokeOpacity=".8" strokeWidth="4"/><path d="M162 316q38 12 76 0" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="4"/><circle cx="200" cy="286" r="6" fill="#e85849"/></g>
    <g key={picks.shoes} data-layer="shoes" filter="url(#softShadow)"><ellipse cx="160" cy="509" rx="45" ry="9" fill="#173a47" opacity=".18"/><ellipse cx="240" cy="509" rx="45" ry="9" fill="#173a47" opacity=".18"/><path d={picks.shoes==='boots'?'M136 440q29 7 58 0l1 65q-42 18-76-2zm70 0q29 7 58 0l17 63q-34 20-76 2z':'M139 461q27 8 55 0l1 42q-43 20-76-1zm67 0q27 8 55 0l20 41q-33 21-76 1z'} fill="url(#shoeShade)" stroke="#173a47" strokeWidth="5"/><path d="M139 484q24 7 48 0m26 0q24 7 48 0" stroke="white" strokeWidth="5"/>{(picks.shoes==='sneakers'||picks.shoes==='high-tops')&&<><path d="M151 466l25 28m-9-30 19 22m63-20-25 28m9-30-19 22" stroke="white" strokeWidth="4"/></>}</g>
    <g key={picks.bottoms} data-layer="bottom" filter="url(#softShadow)">{isSkirt?<><path d="M155 319q45 10 90 0l23 130q-68 29-136 0z" fill={bottom} stroke="#173a47" strokeWidth="4"/><path d="M158 330q42 9 84 0" fill="none" stroke="white" strokeOpacity=".38" strokeWidth="6"/><path d="M177 343l-16 91m62-91 16 91" stroke="white" strokeOpacity=".2" strokeWidth="4"/></>:<><path d={isShorts?'M153 319q47 10 94 0l7 80q-22 9-45 3l-9-43-9 43q-23 6-45-3z':'M155 319q45 10 90 0l10 149q-22 8-43 0l-12-108-12 108q-21 8-43 0z'} fill="url(#bottomShade)" stroke="#173a47" strokeWidth="4"/><path d="M159 331q41 9 82 0" fill="none" stroke="white" strokeOpacity=".38" strokeWidth="6"/>{picks.bottoms==='travel-jeans'&&<><path d="M166 350q8 58 2 101m66-101q-8 58-2 101" stroke="#d9eef5" strokeOpacity=".42" strokeWidth="3" strokeDasharray="5 5"/><path d="M200 329v34" stroke="#173a47" strokeWidth="3"/><path d="M176 337q8 14 19 9m29-9q-8 14-19 9" fill="none" stroke="#d9eef5" strokeOpacity=".38" strokeWidth="3"/></>}</>}</g>
    <g key={picks.tops} data-layer="top" filter="url(#softShadow)"><path d={isDress?'M149 225q22-17 43-13l8 17 8-17q21-4 43 13l13 88 34 104q-98 42-196 0l34-104z':'M150 225q22-17 42-13l8 17 8-17q20-4 42 13l18 88q-68 34-136 0z'} fill="url(#topShade)" stroke="#173a47" strokeWidth="4"/><path d={isSweater?'M151 231q-17 16-45 53l25 24 34-48m84-29q17 16 45 53l-25 24-34-48':'M151 233q-15 13-37 40l24 20 27-39m84-21q15 13 37 40l-24 20-27-39'} fill={top} stroke="#173a47" strokeWidth="4"/><path d="M183 217q17 19 34 0" fill="none" stroke="#fff8e8" strokeOpacity=".9" strokeWidth="5"/><path d="M144 311q56 17 112 0" fill="none" stroke="#173a47" strokeOpacity=".2" strokeWidth="3"/>{picks.tops==='stripe'&&[251,274,297].map(y=><path key={y} d={`M139 ${y}q61 14 122 0`} stroke="#fff8e8" strokeWidth="10"/>)}{picks.tops==='adventure-shirt'&&<><path d="M178 219l22 25 22-25" fill="#fff8e8" stroke="#173a47" strokeWidth="3"/><rect x="217" y="264" width="27" height="24" rx="3" fill="#fff8e8" stroke="#173a47" strokeWidth="3"/><path d="M200 244v68" stroke="#fff8e8" strokeOpacity=".65" strokeWidth="3"/></>}{picks.tops==='sweater'&&<><path d="M169 244q31 27 62 0M165 278q35 25 70 0" fill="none" stroke="white" strokeOpacity=".25" strokeWidth="5"/><path d="M137 298l2 14m122-14-2 14" stroke="#fff" strokeOpacity=".45" strokeWidth="5"/></>}</g>
    {layer&&<g key={picks.layers} data-layer="outerwear" filter="url(#softShadow)"><path d="M139 222q23-14 51-14l-12 52-12 110-52-8 10-82z" fill="url(#layerShade)" stroke="#173a47" strokeWidth="5"/><path d="M261 222q-23-14-51-14l12 52 12 110 52-8-10-82z" fill="url(#layerShade)" stroke="#173a47" strokeWidth="5"/><path d="M190 208l10 38 10-38 20 31-10 25-20-18-20 18-10-25z" fill="#fff8e8" fillOpacity=".94" stroke="#173a47" strokeWidth="4"/><path d="M142 327q16 6 32 0m52 0q16 6 32 0" stroke="#fff8e8" strokeOpacity=".76" strokeWidth="5"/><path d="M162 224q-9 68-7 129m83-129q9 68 7 129" fill="none" stroke="white" strokeOpacity=".28" strokeWidth="4"/><circle cx="181" cy="277" r="5" fill="#173a47"/><circle cx="219" cy="277" r="5" fill="#173a47"/></g>}
    <g key={picks.accessories} data-layer="accessory" filter="url(#softShadow)">{picks.accessories==='sun-glasses'?<g transform="translate(200,194) scale(.78) translate(-200,-194)"><circle cx="178" cy="155" r="22" fill="#90d1dc" fillOpacity=".45" stroke="#173a47" strokeWidth="7"/><circle cx="222" cy="155" r="22" fill="#90d1dc" fillOpacity=".45" stroke="#173a47" strokeWidth="7"/><path d="M200 155h1" stroke="#173a47" strokeWidth="7"/></g>:picks.accessories==='crossbody'||picks.accessories==='mini-camera'?<><path d="M255 292l42 15-13 92-58-15z" fill={picks.accessories==='mini-camera'?'#345c68':'#9b6448'} stroke="#173a47" strokeWidth="5"/><path d="M238 294q13-50 45 3" fill="none" stroke="#173a47" strokeWidth="6"/><circle cx="263" cy="343" r="17" fill="#bfe3e6" stroke="#173a47" strokeWidth="5"/></>:<g transform="translate(200,194) scale(.78) translate(-200,-194)"><path d={picks.accessories==='bucket-hat'?'M142 122q58-55 116 0l-9 31h-98z':'M151 109q49-47 98 0l8 43H143z'} fill={picks.accessories==='bucket-hat'?'#39a29a':'#e67b43'} stroke="#173a47" strokeWidth="5"/><path d="M140 145q69-18 126 8" fill="none" stroke="#173a47" strokeWidth="9"/><circle cx="180" cy="111" r="9" fill="#f1bd42"/></g>}</g></g>
  </svg>;
}

// Painterly head/face+hair overlays, generated to match the Tokyo clothing art's
// style but containing no destination-specific motifs — so they're used as the
// shared avatar art for every destination, not just Tokyo.
// [hairStyle][skin][hairColor] -> asset url. Every (hairStyle, skin) pair now
// has a locally-recolored bake for every hair-color option (scripts/recolor-
// hair-color.mjs), not just the hand-generated golden skin, so the
// hair-color picker actually changes the doll for every skin tone.
const PAINTERLY_HEAD_ASSETS: Record<string, Record<string, Record<string, string>>> = {
  curls: {
    porcelain: {
      brown: '/little-jetter/catalog/tokyo/head/curls-porcelain.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/curls-porcelain-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/curls-porcelain-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/curls-porcelain-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/curls-porcelain-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/curls-porcelain-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/curls-porcelain-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/curls-porcelain-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/curls-porcelain-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/curls-porcelain-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/curls-porcelain-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/curls-porcelain-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/curls-porcelain-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/curls-porcelain-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/curls-porcelain-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/curls-porcelain-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/curls-porcelain-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/curls-porcelain-purple.png',
    },
    peach: {
      brown: '/little-jetter/catalog/tokyo/head/curls-peach.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/curls-peach-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/curls-peach-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/curls-peach-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/curls-peach-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/curls-peach-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/curls-peach-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/curls-peach-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/curls-peach-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/curls-peach-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/curls-peach-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/curls-peach-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/curls-peach-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/curls-peach-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/curls-peach-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/curls-peach-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/curls-peach-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/curls-peach-purple.png',
    },
    golden: {
      brown: '/little-jetter/catalog/tokyo/head/curls-golden.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/curls-golden-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/curls-golden-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/curls-golden-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/curls-golden-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/curls-golden-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/curls-golden-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/curls-golden-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/curls-golden-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/curls-golden-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/curls-golden-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/curls-golden-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/curls-golden-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/curls-golden-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/curls-golden-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/curls-golden-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/curls-golden-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/curls-golden-purple.png',
    },
    caramel: {
      brown: '/little-jetter/catalog/tokyo/head/curls-caramel.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/curls-caramel-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/curls-caramel-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/curls-caramel-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/curls-caramel-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/curls-caramel-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/curls-caramel-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/curls-caramel-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/curls-caramel-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/curls-caramel-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/curls-caramel-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/curls-caramel-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/curls-caramel-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/curls-caramel-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/curls-caramel-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/curls-caramel-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/curls-caramel-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/curls-caramel-purple.png',
    },
    brown: {
      brown: '/little-jetter/catalog/tokyo/head/curls-brown.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/curls-brown-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/curls-brown-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/curls-brown-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/curls-brown-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/curls-brown-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/curls-brown-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/curls-brown-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/curls-brown-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/curls-brown-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/curls-brown-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/curls-brown-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/curls-brown-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/curls-brown-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/curls-brown-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/curls-brown-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/curls-brown-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/curls-brown-purple.png',
    },
    deep: {
      brown: '/little-jetter/catalog/tokyo/head/curls-deep.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/curls-deep-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/curls-deep-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/curls-deep-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/curls-deep-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/curls-deep-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/curls-deep-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/curls-deep-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/curls-deep-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/curls-deep-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/curls-deep-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/curls-deep-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/curls-deep-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/curls-deep-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/curls-deep-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/curls-deep-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/curls-deep-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/curls-deep-purple.png',
    },
  },
  short: {
    porcelain: {
      brown: '/little-jetter/catalog/tokyo/head/short-porcelain.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/short-porcelain-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/short-porcelain-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/short-porcelain-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/short-porcelain-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/short-porcelain-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/short-porcelain-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/short-porcelain-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/short-porcelain-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/short-porcelain-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/short-porcelain-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/short-porcelain-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/short-porcelain-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/short-porcelain-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/short-porcelain-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/short-porcelain-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/short-porcelain-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/short-porcelain-purple.png',
    },
    peach: {
      brown: '/little-jetter/catalog/tokyo/head/short-peach.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/short-peach-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/short-peach-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/short-peach-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/short-peach-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/short-peach-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/short-peach-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/short-peach-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/short-peach-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/short-peach-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/short-peach-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/short-peach-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/short-peach-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/short-peach-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/short-peach-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/short-peach-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/short-peach-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/short-peach-purple.png',
    },
    golden: {
      brown: '/little-jetter/catalog/tokyo/head/short-golden.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/short-golden-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/short-golden-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/short-golden-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/short-golden-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/short-golden-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/short-golden-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/short-golden-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/short-golden-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/short-golden-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/short-golden-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/short-golden-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/short-golden-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/short-golden-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/short-golden-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/short-golden-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/short-golden-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/short-golden-purple.png',
    },
    caramel: {
      brown: '/little-jetter/catalog/tokyo/head/short-caramel.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/short-caramel-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/short-caramel-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/short-caramel-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/short-caramel-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/short-caramel-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/short-caramel-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/short-caramel-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/short-caramel-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/short-caramel-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/short-caramel-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/short-caramel-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/short-caramel-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/short-caramel-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/short-caramel-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/short-caramel-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/short-caramel-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/short-caramel-purple.png',
    },
    brown: {
      brown: '/little-jetter/catalog/tokyo/head/short-brown.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/short-brown-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/short-brown-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/short-brown-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/short-brown-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/short-brown-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/short-brown-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/short-brown-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/short-brown-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/short-brown-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/short-brown-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/short-brown-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/short-brown-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/short-brown-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/short-brown-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/short-brown-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/short-brown-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/short-brown-purple.png',
    },
    deep: {
      brown: '/little-jetter/catalog/tokyo/head/short-deep.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/short-deep-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/short-deep-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/short-deep-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/short-deep-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/short-deep-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/short-deep-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/short-deep-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/short-deep-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/short-deep-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/short-deep-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/short-deep-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/short-deep-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/short-deep-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/short-deep-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/short-deep-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/short-deep-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/short-deep-purple.png',
    },
  },
  bob: {
    porcelain: {
      brown: '/little-jetter/catalog/tokyo/head/bob-porcelain.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/bob-porcelain-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/bob-porcelain-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/bob-porcelain-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/bob-porcelain-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/bob-porcelain-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/bob-porcelain-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/bob-porcelain-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/bob-porcelain-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/bob-porcelain-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/bob-porcelain-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/bob-porcelain-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/bob-porcelain-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/bob-porcelain-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/bob-porcelain-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/bob-porcelain-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/bob-porcelain-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/bob-porcelain-purple.png',
    },
    peach: {
      brown: '/little-jetter/catalog/tokyo/head/bob-peach.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/bob-peach-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/bob-peach-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/bob-peach-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/bob-peach-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/bob-peach-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/bob-peach-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/bob-peach-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/bob-peach-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/bob-peach-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/bob-peach-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/bob-peach-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/bob-peach-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/bob-peach-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/bob-peach-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/bob-peach-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/bob-peach-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/bob-peach-purple.png',
    },
    golden: {
      brown: '/little-jetter/catalog/tokyo/head/bob-golden.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/bob-golden-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/bob-golden-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/bob-golden-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/bob-golden-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/bob-golden-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/bob-golden-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/bob-golden-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/bob-golden-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/bob-golden-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/bob-golden-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/bob-golden-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/bob-golden-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/bob-golden-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/bob-golden-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/bob-golden-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/bob-golden-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/bob-golden-purple.png',
    },
    caramel: {
      brown: '/little-jetter/catalog/tokyo/head/bob-caramel.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/bob-caramel-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/bob-caramel-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/bob-caramel-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/bob-caramel-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/bob-caramel-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/bob-caramel-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/bob-caramel-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/bob-caramel-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/bob-caramel-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/bob-caramel-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/bob-caramel-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/bob-caramel-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/bob-caramel-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/bob-caramel-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/bob-caramel-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/bob-caramel-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/bob-caramel-purple.png',
    },
    brown: {
      brown: '/little-jetter/catalog/tokyo/head/bob-brown.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/bob-brown-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/bob-brown-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/bob-brown-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/bob-brown-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/bob-brown-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/bob-brown-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/bob-brown-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/bob-brown-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/bob-brown-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/bob-brown-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/bob-brown-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/bob-brown-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/bob-brown-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/bob-brown-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/bob-brown-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/bob-brown-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/bob-brown-purple.png',
    },
    deep: {
      brown: '/little-jetter/catalog/tokyo/head/bob-deep.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/bob-deep-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/bob-deep-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/bob-deep-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/bob-deep-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/bob-deep-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/bob-deep-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/bob-deep-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/bob-deep-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/bob-deep-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/bob-deep-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/bob-deep-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/bob-deep-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/bob-deep-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/bob-deep-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/bob-deep-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/bob-deep-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/bob-deep-purple.png',
    },
  },
  coils: {
    porcelain: {
      brown: '/little-jetter/catalog/tokyo/head/coils-porcelain.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/coils-porcelain-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/coils-porcelain-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/coils-porcelain-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/coils-porcelain-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/coils-porcelain-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/coils-porcelain-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/coils-porcelain-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/coils-porcelain-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/coils-porcelain-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/coils-porcelain-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/coils-porcelain-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/coils-porcelain-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/coils-porcelain-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/coils-porcelain-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/coils-porcelain-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/coils-porcelain-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/coils-porcelain-purple.png',
    },
    peach: {
      brown: '/little-jetter/catalog/tokyo/head/coils-peach.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/coils-peach-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/coils-peach-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/coils-peach-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/coils-peach-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/coils-peach-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/coils-peach-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/coils-peach-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/coils-peach-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/coils-peach-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/coils-peach-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/coils-peach-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/coils-peach-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/coils-peach-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/coils-peach-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/coils-peach-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/coils-peach-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/coils-peach-purple.png',
    },
    golden: {
      brown: '/little-jetter/catalog/tokyo/head/coils-golden.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/coils-golden-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/coils-golden-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/coils-golden-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/coils-golden-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/coils-golden-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/coils-golden-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/coils-golden-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/coils-golden-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/coils-golden-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/coils-golden-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/coils-golden-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/coils-golden-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/coils-golden-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/coils-golden-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/coils-golden-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/coils-golden-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/coils-golden-purple.png',
    },
    caramel: {
      brown: '/little-jetter/catalog/tokyo/head/coils-caramel.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/coils-caramel-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/coils-caramel-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/coils-caramel-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/coils-caramel-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/coils-caramel-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/coils-caramel-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/coils-caramel-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/coils-caramel-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/coils-caramel-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/coils-caramel-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/coils-caramel-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/coils-caramel-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/coils-caramel-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/coils-caramel-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/coils-caramel-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/coils-caramel-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/coils-caramel-purple.png',
    },
    brown: {
      brown: '/little-jetter/catalog/tokyo/head/coils-brown.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/coils-brown-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/coils-brown-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/coils-brown-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/coils-brown-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/coils-brown-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/coils-brown-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/coils-brown-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/coils-brown-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/coils-brown-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/coils-brown-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/coils-brown-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/coils-brown-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/coils-brown-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/coils-brown-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/coils-brown-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/coils-brown-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/coils-brown-purple.png',
    },
    deep: {
      brown: '/little-jetter/catalog/tokyo/head/coils-deep.png',
      "platinum-blonde": '/little-jetter/catalog/tokyo/head/coils-deep-platinum-blonde.png',
      "light-blonde": '/little-jetter/catalog/tokyo/head/coils-deep-light-blonde.png',
      "honey-blonde": '/little-jetter/catalog/tokyo/head/coils-deep-honey-blonde.png',
      "strawberry-blonde": '/little-jetter/catalog/tokyo/head/coils-deep-strawberry-blonde.png',
      "red": '/little-jetter/catalog/tokyo/head/coils-deep-red.png',
      "auburn": '/little-jetter/catalog/tokyo/head/coils-deep-auburn.png',
      "light-brown": '/little-jetter/catalog/tokyo/head/coils-deep-light-brown.png',
      "dark-brown": '/little-jetter/catalog/tokyo/head/coils-deep-dark-brown.png',
      "black": '/little-jetter/catalog/tokyo/head/coils-deep-black.png',
      "warm-black": '/little-jetter/catalog/tokyo/head/coils-deep-warm-black.png',
      "chocolate": '/little-jetter/catalog/tokyo/head/coils-deep-chocolate.png',
      "caramel": '/little-jetter/catalog/tokyo/head/coils-deep-caramel.png',
      "ash-brown": '/little-jetter/catalog/tokyo/head/coils-deep-ash-brown.png',
      "gray": '/little-jetter/catalog/tokyo/head/coils-deep-gray.png',
      "blue": '/little-jetter/catalog/tokyo/head/coils-deep-blue.png',
      "pink": '/little-jetter/catalog/tokyo/head/coils-deep-pink.png',
      "purple": '/little-jetter/catalog/tokyo/head/coils-deep-purple.png',
    },
  },
  'bun-blonde-bow': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-bun-blonde-bow.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-bun-blonde-bow.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-bun-blonde-bow.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-bun-blonde-bow.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-bun-blonde-bow.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-bun-blonde-bow.png' },
  },
  'cap-brown': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-cap-brown.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-cap-brown.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-cap-brown.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-cap-brown.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-cap-brown.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-cap-brown.png' },
  },
  'bandana-bun': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-bandana-bun.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-bandana-bun.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-bandana-bun.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-bandana-bun.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-bandana-bun.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-bandana-bun.png' },
  },
  'messy-bun': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-messy-bun.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-messy-bun.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-messy-bun.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-messy-bun.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-messy-bun.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-messy-bun.png' },
  },
  'wavy-daisy-auburn': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-daisy-auburn.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-daisy-auburn.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-daisy-auburn.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-daisy-auburn.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-daisy-auburn.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-daisy-auburn.png' },
  },
  'pigtail-buns': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-pigtail-buns.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-pigtail-buns.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-pigtail-buns.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-pigtail-buns.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-pigtail-buns.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-pigtail-buns.png' },
  },
  'bob-bangs': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-bob-bangs.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-bob-bangs.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-bob-bangs.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-bob-bangs.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-bob-bangs.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-bob-bangs.png' },
  },
  'braids-dark': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-braids-dark.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-braids-dark.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-braids-dark.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-braids-dark.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-braids-dark.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-braids-dark.png' },
  },
  'wavy-clip': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-clip.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-clip.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-clip.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-clip.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-clip.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-clip.png' },
  },
  'blonde-wavy-daisy': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-blonde-wavy-daisy.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-blonde-wavy-daisy.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-blonde-wavy-daisy.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-blonde-wavy-daisy.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-blonde-wavy-daisy.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-blonde-wavy-daisy.png' },
  },
  'curly-fro': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro.png' },
  },
  'pigtails-bows': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-pigtails-bows.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-pigtails-bows.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-pigtails-bows.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-pigtails-bows.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-pigtails-bows.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-pigtails-bows.png' },
  },
  'curly-topknot': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-curly-topknot.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-curly-topknot.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-curly-topknot.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-curly-topknot.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-curly-topknot.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-curly-topknot.png' },
  },
  'braids-auburn': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-braids-auburn.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-braids-auburn.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-braids-auburn.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-braids-auburn.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-braids-auburn.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-braids-auburn.png' },
  },
  'bucket-hat-pink': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-bucket-hat-pink.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-bucket-hat-pink.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-bucket-hat-pink.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-bucket-hat-pink.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-bucket-hat-pink.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-bucket-hat-pink.png' },
  },
  'wavy-long-dark': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-long-dark.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-long-dark.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-long-dark.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-long-dark.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-long-dark.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-long-dark.png' },
  },
  'bob-blonde-clip': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-bob-blonde-clip.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-bob-blonde-clip.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-bob-blonde-clip.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-bob-blonde-clip.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-bob-blonde-clip.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-bob-blonde-clip.png' },
  },
  'headband-curly': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-headband-curly.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-headband-curly.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-headband-curly.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-headband-curly.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-headband-curly.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-headband-curly.png' },
  },
  'bow-curly': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-bow-curly.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-bow-curly.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-bow-curly.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-bow-curly.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-bow-curly.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-bow-curly.png' },
  },
  'bun-auburn': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-bun-auburn.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-bun-auburn.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-bun-auburn.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-bun-auburn.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-bun-auburn.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-bun-auburn.png' },
  },
  'curly-fro-boy': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro-boy.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro-boy.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro-boy.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro-boy.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro-boy.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-curly-fro-boy.png' },
  },
  'curly-bow': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-curly-bow.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-curly-bow.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-curly-bow.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-curly-bow.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-curly-bow.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-curly-bow.png' },
  },
  'wavy-blonde-boy': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy.png' },
  },
  'long-straight-dark': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-long-straight-dark.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-long-straight-dark.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-long-straight-dark.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-long-straight-dark.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-long-straight-dark.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-long-straight-dark.png' },
  },
  'wavy-brown-boy': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-brown-boy.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-brown-boy.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-brown-boy.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-brown-boy.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-brown-boy.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-brown-boy.png' },
  },
  'cap-green-boy': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-cap-green-boy.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-cap-green-boy.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-cap-green-boy.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-cap-green-boy.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-cap-green-boy.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-cap-green-boy.png' },
  },
  'wavy-blonde-boy2': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy2.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy2.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy2.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy2.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy2.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-wavy-blonde-boy2.png' },
  },
  'cap-tan-boy': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-cap-tan-boy.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-cap-tan-boy.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-cap-tan-boy.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-cap-tan-boy.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-cap-tan-boy.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-cap-tan-boy.png' },
  },
  'short-dark-boy': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-short-dark-boy.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-short-dark-boy.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-short-dark-boy.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-short-dark-boy.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-short-dark-boy.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-short-dark-boy.png' },
  },
  'curly-auburn-boy': {
    porcelain: { brown: '/little-jetter/catalog/tokyo/head/style-curly-auburn-boy.png' },
    peach: { brown: '/little-jetter/catalog/tokyo/head/style-curly-auburn-boy.png' },
    golden: { brown: '/little-jetter/catalog/tokyo/head/style-curly-auburn-boy.png' },
    caramel: { brown: '/little-jetter/catalog/tokyo/head/style-curly-auburn-boy.png' },
    brown: { brown: '/little-jetter/catalog/tokyo/head/style-curly-auburn-boy.png' },
    deep: { brown: '/little-jetter/catalog/tokyo/head/style-curly-auburn-boy.png' },
  },
};

// Face-center point (in the shared 600x900 head-canvas pixel space) per
// hairstyle, used only to crop the "choose your head" gallery thumbnails —
// hair silhouettes differ enough in height between styles (short spikes
// higher, coils/curls form a wider halo) that a single crop window would
// clip eyes off some styles and show mostly hair on others.
const HEAD_THUMB_FOCUS: Record<string, { x: number; y: number }> = {
  curls: { x: 300, y: 252 },
  bob: { x: 300, y: 259 },
  short: { x: 300, y: 218 },
  coils: { x: 300, y: 233 },
  'bun-blonde-bow': { x: 300, y: 192 },
  'cap-brown': { x: 300, y: 198 },
  'bandana-bun': { x: 300, y: 239 },
  'messy-bun': { x: 300, y: 186 },
  'wavy-daisy-auburn': { x: 300, y: 223 },
  'pigtail-buns': { x: 300, y: 224 },
  'bob-bangs': { x: 300, y: 222 },
  'braids-dark': { x: 300, y: 181 },
  'wavy-clip': { x: 300, y: 224 },
  'blonde-wavy-daisy': { x: 300, y: 227 },
  'curly-fro': { x: 300, y: 233 },
  'pigtails-bows': { x: 300, y: 242 },
  'curly-topknot': { x: 300, y: 203 },
  'braids-auburn': { x: 300, y: 230 },
  'bucket-hat-pink': { x: 300, y: 217 },
  'wavy-long-dark': { x: 300, y: 215 },
  'bob-blonde-clip': { x: 300, y: 231 },
  'headband-curly': { x: 300, y: 235 },
  'bow-curly': { x: 300, y: 242 },
  'bun-auburn': { x: 300, y: 204 },
  'curly-fro-boy': { x: 300, y: 215 },
  'curly-bow': { x: 300, y: 234 },
  'wavy-blonde-boy': { x: 300, y: 212 },
  'long-straight-dark': { x: 300, y: 225 },
  'wavy-brown-boy': { x: 300, y: 228 },
  'cap-green-boy': { x: 300, y: 222 },
  'wavy-blonde-boy2': { x: 300, y: 223 },
  'cap-tan-boy': { x: 300, y: 219 },
  'short-dark-boy': { x: 300, y: 227 },
  'curly-auburn-boy': { x: 300, y: 231 },
};
const HEAD_THUMB_ZOOM = 0.42;

function painterlyHeadUrl(character: Character): string | undefined {
  const bySkin = PAINTERLY_HEAD_ASSETS[character.hairStyle ?? 'curls']?.[character.skin];
  if (!bySkin) return undefined;
  return bySkin[character.hair] ?? bySkin.brown;
}

// Eye color is applied as a live CSS tint (see the iris-tint layer in
// CatalogDoll) instead of a baked-in image per hair color — a full
// hairstyle x skin x hairColor x eyeColor image cross-product would run
// into the thousands of files and blew past Vercel's per-day upload-count
// limit the one time it was tried, and it only ever covered the default
// hair color anyway (eye color silently did nothing for any other hair
// pick). One small iris-shaped mask per hairstyle (scripts/generate-iris-
// masks.mjs) works for every skin/hairColor combination instead.
function irisMaskUrl(hairStyle: string | undefined): string {
  return `/little-jetter/catalog/tokyo/head/${hairStyle ?? 'curls'}-iris-mask.png`;
}

// Painterly bare-limbs body base (arms/torso/legs), one per skin tone, replacing
// the flat SVG "base" layer. Same anchor system (shoulderY/groundY/centerX) as
// every other illustrated layer, so it lines up with existing clothing/shoes.
const PAINTERLY_BODY_ASSETS: Record<string, string> = {
  porcelain: '/little-jetter/catalog/tokyo/body/porcelain.png',
  peach: '/little-jetter/catalog/tokyo/body/peach.png',
  golden: '/little-jetter/catalog/tokyo/body/golden.png',
  caramel: '/little-jetter/catalog/tokyo/body/caramel.png',
  brown: '/little-jetter/catalog/tokyo/body/brown.png',
  deep: '/little-jetter/catalog/tokyo/body/deep.png',
};

const LAYER_BASE_Z: Record<string, number> = { shoes: 2, bottom: 3, top: 4, outerwear: 5, face: 6, accessory: 7 };

function CatalogDoll({ destinationId, picks, character, garmentColors, garmentScale = {}, garmentOffset = {}, garmentZBoost = {}, activeItemId }: { destinationId: string; picks: Picks; character: Character; garmentColors: GarmentColors; garmentScale?: GarmentScales; garmentOffset?: Record<string, { x: number; y: number }>; garmentZBoost?: Record<string, number>; activeItemId?: string | null }) {
  const topItem = catalogItemFor(destinationId, 'tops', picks.tops);
  const coversBottom = topItem?.tags.includes('covers-bottom') ?? false;
  const layerItem = catalogItemFor(destinationId, 'layers', picks.layers);
  // A worn jacket/coat already covers the whole torso in the art, so the
  // main piece underneath would only ever peek out at the collar — hide it
  // entirely rather than leave a sliver of mismatched fabric showing.
  const layerCoversTop = Boolean(catalogImageFor(layerItem, layerItem ? garmentColors[layerItem.id] : undefined));
  const illustrated = CLOSET_GROUPS
    .filter((group) => !(coversBottom && group === 'bottoms'))
    .filter((group) => !(layerCoversTop && group === 'tops'))
    .map((group) => ({ group, item: catalogItemFor(destinationId, group, picks[group]) }))
    .filter(({ item }) => Boolean(catalogImageFor(item, item ? garmentColors[item.id] : undefined)));
  const headUrl = painterlyHeadUrl(character);
  const bodyUrl = PAINTERLY_BODY_ASSETS[character.skin];
  const SLOT_BY_GROUP: Record<ClothingGroup, string> = { tops: 'top', bottoms: 'bottom', layers: 'outerwear', shoes: 'shoes', accessories: 'accessory' };
  const noneSlots = CLOSET_GROUPS.filter((group) => picks[group] === 'none').map((group) => SLOT_BY_GROUP[group]);
  const hiddenLayers: string[] = (illustrated.map(({ item }) => item?.slot ?? '') as string[])
    .concat(headUrl ? ['face', 'hair'] : [])
    .concat(bodyUrl ? ['base'] : [])
    .concat(coversBottom ? ['bottom'] : [])
    .concat(layerCoversTop ? ['top'] : [])
    .concat(noneSlots);
  return <div className="little-catalog-doll" data-template={catalog.template.id}>
    <ClassicDoll picks={picks} character={character} garmentColors={garmentColors} hiddenLayers={hiddenLayers} />
    {bodyUrl && <img className="little-illustrated-layer layer-body" src={bodyUrl} alt="" aria-hidden="true" key={`body-${character.skin}`} />}
    {headUrl && <img className="little-illustrated-layer layer-face" src={headUrl} alt="" aria-hidden="true" key={`head-${character.hairStyle}-${character.skin}-${character.hair}`} />}
    {headUrl && character.eyes !== 'brown' && (
      <div
        className="little-illustrated-layer layer-iris-tint"
        style={{
          WebkitMaskImage: `url(${irisMaskUrl(character.hairStyle)})`,
          maskImage: `url(${irisMaskUrl(character.hairStyle)})`,
          backgroundColor: characterOptions.eyes.find((option) => option.id === character.eyes)?.color,
        }}
        aria-hidden="true"
        key={`iris-${character.hairStyle}-${character.eyes}`}
      />
    )}
    {illustrated.map(({ group, item }) => {
      if (!item) return null;
      const offset = garmentOffset[item.id];
      const zBoost = garmentZBoost[item.id];
      const style: React.CSSProperties = {};
      if (garmentScale[item.id]) (style as Record<string, unknown>)['--resize-scale'] = garmentScale[item.id];
      if (offset) { (style as Record<string, unknown>)['--resize-x'] = `${offset.x}px`; (style as Record<string, unknown>)['--resize-y'] = `${offset.y}px`; }
      if (zBoost) style.zIndex = (LAYER_BASE_Z[item.slot] ?? 1) + zBoost;
      return (
        <img
          className={`little-illustrated-layer layer-${item.slot}${item.id === 'blue-backpack' && layerCoversTop ? ' is-floor-backpack' : ''}${item.id === activeItemId ? ' is-selected-for-resize' : ''}`}
          data-item-id={item.id}
          data-group={group}
          src={catalogImageFor(item, garmentColors[item.id])}
          alt=""
          aria-hidden="true"
          style={Object.keys(style).length ? style : undefined}
          key={`${group}-${item.id}-${garmentColors[item.id] ?? 'default'}`}
        />
      );
    })}
  </div>;
}

function GarmentPreview({ destinationId, group, itemId, picks, character, garmentColors }: { destinationId: string; group: ClothingGroup; itemId: string; picks: Picks; character: Character; garmentColors: GarmentColors }) {
  const layerByGroup: Record<ClothingGroup, 'top' | 'bottom' | 'outerwear' | 'shoes' | 'accessory'> = { tops: 'top', bottoms: 'bottom', layers: 'outerwear', shoes: 'shoes', accessories: 'accessory' };
  const viewBoxes: Record<ClothingGroup, string> = { tops: '120 285 360 260', bottoms: '150 455 300 285', layers: '105 280 390 310', shoes: '135 650 330 150', accessories: itemId === 'crossbody' || itemId === 'mini-camera' ? '300 390 190 270' : itemId === 'sun-glasses' ? '220 180 160 130' : '175 85 250 210' };
  const item = catalogItemFor(destinationId, group, itemId);
  const imageUrl = catalogImageFor(item, item ? garmentColors[item.id] : undefined);
  const isHeadwear = group === 'accessories' && itemId !== 'crossbody' && itemId !== 'mini-camera' && itemId !== 'sun-glasses';
  if (itemId === 'none') {
    return <span className="little-game-item little-garment-preview preview-none" aria-hidden="true"><svg className="little-none-glyph" viewBox="0 0 48 48" fill="none"><path d="M24 8v8" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><circle cx="24" cy="6" r="2.5" fill="currentColor"/><path d="M24 16 6 28h36z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/></svg></span>;
  }
  return <span className={`little-game-item little-garment-preview preview-${group}${isHeadwear ? ' preview-headwear' : ''}`} aria-hidden="true">{imageUrl ? <img className="little-catalog-preview" src={imageUrl} alt="" /> : <ClassicDoll picks={{ ...picks, [group]: itemId }} character={character} garmentColors={garmentColors} onlyLayer={layerByGroup[group]} previewViewBox={viewBoxes[group]} />}</span>;
}

export function LittleJetterApp() {
  const [currentStep, setCurrentStep] = useState<'destination' | 'style' | 'explore' | 'shop'>('destination');
  const [selectedId, setSelectedId] = useState('tokyo');
  const [regionFilter, setRegionFilter] = useState('All regions');
  const [destinationTypeFilter, setDestinationTypeFilter] = useState('All types');
  const [started, setStarted] = useState(false);
  const [gameStep, setGameStep] = useState(1);
  const [picks, setPicks] = useState<Picks>({ tops: 'stripe', bottoms: 'travel-jeans', layers: 'none', shoes: 'sneakers', accessories: 'crossbody', buddies: 'bunny' });
  const [garmentColors, setGarmentColors] = useState<GarmentColors>({});
  const [garmentScale, setGarmentScale] = useState<GarmentScales>({});
  const [garmentOffset, setGarmentOffset] = useState<Record<string, { x: number; y: number }>>({});
  const [garmentZBoost, setGarmentZBoost] = useState<Record<string, number>>({});
  const [resizeTarget, setResizeTarget] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ClothingGroup | null>(null);
  const pinchStartRef = useRef<{ distance: number; scale: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; offset: { x: number; y: number }; moved: boolean } | null>(null);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [passportStamps, setPassportStamps] = useState<string[]>([]);
  const [transitioning, setTransitioning] = useState(false);
  const [travelConfirmation, setTravelConfirmation] = useState('');
  const [dropActive, setDropActive] = useState(false);
  const [character, setCharacter] = useState<Character>({ style: 'girl', skin: 'golden', hair: 'brown', hairStyle: 'curls', eyes: 'brown' });
  const [packed, setPacked] = useState<string[]>([]);
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [openDrawer, setOpenDrawer] = useState('clothing');
  const [parentGateOpen, setParentGateOpen] = useState(false);
  const [parentAnswer, setParentAnswer] = useState('');
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [showMoreChoices, setShowMoreChoices] = useState(false);
  const [celebration, setCelebration] = useState(0);
  const [travelMode, setTravelMode] = useState(true);
  const [foundNotices, setFoundNotices] = useState<string[]>([]);
  const [journalChoice, setJournalChoice] = useState('');
  const [openClosetDrawer, setOpenClosetDrawer] = useState<string>('tops');
  const [activeCategorySheet, setActiveCategorySheet] = useState<ClothingGroup | null>(null);
  const [styleFilter, setStyleFilter] = useState<'dress' | 'pajama' | 'swim' | 'hat' | null>(null);
  const [activeAvatarSheet, setActiveAvatarSheet] = useState<AvatarFeature | null>(null);
  const selected = useMemo(() => destinations.find((item) => item.id === selectedId) ?? destinations[0], [selectedId]);
  const visibleDestinations = destinations.filter((item) => (regionFilter === 'All regions' || item.region === regionFilter) && (destinationTypeFilter === 'All types' || destinationTypes[item.id] === destinationTypeFilter));
  const availableWardrobe = (group: Exclude<PickGroup, 'buddies'>) => wardrobe[group]
    .filter((item) => item.tags.includes('destination:all') || item.tags.includes(`destination:${selected.id}`))
    .filter((item) => {
      if (group === 'tops') {
        if (styleFilter === 'dress' || styleFilter === 'pajama' || styleFilter === 'swim') return item.tags.includes(`style:${styleFilter}`);
        return !item.tags.includes('style:dress') && !item.tags.includes('style:pajama') && !item.tags.includes('style:swim');
      }
      if (group === 'accessories') return styleFilter === 'hat' ? item.tags.includes('style:hat') : !item.tags.includes('style:hat');
      return true;
    })
    .map((item) => catalogItemFor(selected.id, group, item.id) ?? item);

  useEffect(() => {
    document.title = 'Little Jetter · The trip starts before you leave';
    document.documentElement.style.colorScheme = 'light';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && destinations.some((item) => item.id === saved)) {
      setSelectedId(saved);
      setStarted(true);
    }
    setSavedProducts(JSON.parse(window.localStorage.getItem('little-jetter-saved-picks') ?? '[]'));
    setSavedLooks(JSON.parse(window.localStorage.getItem('little-jetter-saved-looks') ?? '[]'));
    setPassportStamps(JSON.parse(window.localStorage.getItem(PASSPORT_KEY) ?? '[]'));
    return () => { document.documentElement.style.colorScheme = ''; };
  }, []);


  function beginTrip() {
    window.localStorage.setItem(STORAGE_KEY, selected.id);
    setStarted(true);
    showStep('style');
    triggerCelebration([25, 40, 25]);
    window.setTimeout(() => document.getElementById('adventure-studio')?.scrollIntoView({ behavior: 'smooth' }), 30);
  }

  function showStep(step: 'destination' | 'style' | 'explore' | 'shop') {
    if (step === currentStep || transitioning) return;
    setTransitioning(true);
    if (step !== 'destination') setStarted(true);
    playHaptic(12);
    window.setTimeout(() => {
      setCurrentStep(step);
      if (step === 'style') setGameStep(1);
      if (step === 'explore') setGameStep(2);
      setTransitioning(false);
      window.setTimeout(() => document.querySelector(`[data-app-view="${step}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
    }, 220);
  }

  useEffect(() => {
    destinationAssetUrls(selected.id).forEach((url) => { const image = new Image(); image.src = url; });
  }, [selected.id]);

  function selectDestination(destination: Destination) {
    setSelectedId(destination.id);
    setPicks((current) => ({ ...current, tops: 'stripe', bottoms: 'travel-jeans', layers: destination.needsLayer ? 'denim' : 'none', shoes: destination.sandalsFriendly ? 'sandals' : 'sneakers', accessories: 'travel-cap' }));
    setStarted(false);
    setGameStep(1);
    setPacked([]);
    setFoundNotices([]);
    setJournalChoice('');
    triggerCelebration([25, 35, 25]);
  }

  function toggleNotice(label: string) {
    if (foundNotices.includes(label)) return;
    setFoundNotices((current) => [...current, label]);
    showTravelConfirmation(`Discovery stamped: ${label}`);
    triggerCelebration(14);
  }

  function showTravelConfirmation(message: string) {
    setTravelConfirmation(message);
    window.setTimeout(() => setTravelConfirmation(''), 1800);
  }

  function stampPassport() {
    setPassportStamps((current) => {
      const next = current.includes(selected.id) ? current : [...current, selected.id];
      window.localStorage.setItem(PASSPORT_KEY, JSON.stringify(next));
      return next;
    });
    setGameStep(5);
    showTravelConfirmation(`${selected.city} added to your passport`);
    triggerCelebration([35,30,35,30,80]);
  }

  function choose(group: PickGroup, id: string) {
    setPicks((current) => ({ ...current, [group]: id }));
    setResizeTarget(id !== 'none' ? id : null);
    setSelectedGroup(id !== 'none' && group !== 'buddies' ? (group as ClothingGroup) : null);
    triggerCelebration(18);
  }

  function pinchDistance(touches: React.TouchList) {
    const [a, b] = [touches[0], touches[1]];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  // One finger drags the just-equipped piece into place; two fingers pinch
  // it bigger/smaller. Both act on `resizeTarget` (whatever was equipped
  // most recently) so a child can fine-tune fit and placement themselves,
  // no separate UI needed.
  // Alpha-aware hit test: samples the actual pixel under the tap on each
  // rendered garment layer (topmost z-index first) so tapping the doll
  // selects whichever piece is visually there, not just whatever has the
  // biggest invisible bounding box.
  function sampleAlphaAtPoint(img: HTMLImageElement, clientX: number, clientY: number) {
    if (!img.complete || !img.naturalWidth) return 0;
    const rect = img.getBoundingClientRect();
    const boxRatio = rect.width / rect.height;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let width: number, height: number, left: number, top: number;
    if (imgRatio > boxRatio) { width = rect.width; height = rect.width / imgRatio; left = rect.left; top = rect.top + (rect.height - height) / 2; }
    else { height = rect.height; width = rect.height * imgRatio; top = rect.top; left = rect.left + (rect.width - width) / 2; }
    if (clientX < left || clientX > left + width || clientY < top || clientY > top + height) return 0;
    const px = Math.floor(((clientX - left) / width) * img.naturalWidth);
    const py = Math.floor(((clientY - top) / height) * img.naturalHeight);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 255;
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(px, py, 1, 1).data[3];
    } catch { return 255; }
  }

  function hitTestDoll(container: HTMLDivElement, clientX: number, clientY: number) {
    const layers = Array.from(container.querySelectorAll<HTMLImageElement>('img.little-illustrated-layer[data-item-id]'));
    layers.sort((a, b) => (parseFloat(getComputedStyle(b).zIndex) || 0) - (parseFloat(getComputedStyle(a).zIndex) || 0));
    for (const img of layers) {
      if (sampleAlphaAtPoint(img, clientX, clientY) > 20) return { id: img.dataset.itemId!, group: img.dataset.group as ClothingGroup };
    }
    return null;
  }

  function selectFromTap(container: HTMLDivElement, clientX: number, clientY: number) {
    const hit = hitTestDoll(container, clientX, clientY);
    setResizeTarget(hit?.id ?? null);
    setSelectedGroup(hit?.group ?? null);
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length === 2 && resizeTarget) {
      pinchStartRef.current = { distance: pinchDistance(event.touches), scale: garmentScale[resizeTarget] ?? 1 };
      dragStartRef.current = null;
    } else if (event.touches.length === 1) {
      dragStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY, offset: resizeTarget ? garmentOffset[resizeTarget] ?? { x: 0, y: 0 } : { x: 0, y: 0 }, moved: false };
      pinchStartRef.current = null;
    }
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length === 2 && pinchStartRef.current && resizeTarget) {
      if (event.cancelable) event.preventDefault();
      const { distance: startDistance, scale: startScale } = pinchStartRef.current;
      const nextScale = clampGarmentScale(startScale * (pinchDistance(event.touches) / startDistance));
      setGarmentScale((current) => ({ ...current, [resizeTarget]: nextScale }));
    } else if (event.touches.length === 1 && dragStartRef.current) {
      const { x: startX, y: startY, offset } = dragStartRef.current;
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;
      if (Math.hypot(dx, dy) > 5) dragStartRef.current.moved = true;
      if (resizeTarget && dragStartRef.current.moved) {
        if (event.cancelable) event.preventDefault();
        setGarmentOffset((current) => ({ ...current, [resizeTarget]: { x: offset.x + dx, y: offset.y + dy } }));
      }
    }
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    const wasTap = dragStartRef.current && !dragStartRef.current.moved;
    pinchStartRef.current = null;
    dragStartRef.current = null;
    if (wasTap && event.changedTouches.length === 1) {
      selectFromTap(event.currentTarget, event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }
  }

  function handleDollClick(event: React.MouseEvent<HTMLDivElement>) {
    if (dragStartRef.current?.moved) return;
    selectFromTap(event.currentTarget, event.clientX, event.clientY);
  }

  function handleMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    dragStartRef.current = { x: event.clientX, y: event.clientY, offset: resizeTarget ? garmentOffset[resizeTarget] ?? { x: 0, y: 0 } : { x: 0, y: 0 }, moved: false };
  }

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!dragStartRef.current) return;
    const { x: startX, y: startY, offset } = dragStartRef.current;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    if (Math.hypot(dx, dy) > 5) dragStartRef.current.moved = true;
    if (resizeTarget && dragStartRef.current.moved) {
      setGarmentOffset((current) => ({ ...current, [resizeTarget]: { x: offset.x + dx, y: offset.y + dy } }));
    }
  }

  function handleMouseUp() {
    // handleDollClick (fires after mouseup) reads dragStartRef.current.moved,
    // so clear it a tick later rather than immediately.
    requestAnimationFrame(() => { dragStartRef.current = null; });
  }

  function handleWheelResize(event: React.WheelEvent<HTMLDivElement>) {
    if (!resizeTarget) return;
    if (event.cancelable) event.preventDefault();
    const delta = event.deltaY < 0 ? 0.05 : -0.05;
    setGarmentScale((current) => ({ ...current, [resizeTarget]: clampGarmentScale((current[resizeTarget] ?? 1) + delta) }));
  }

  function deleteSelectedItem() {
    if (!selectedGroup) return;
    setPicks((current) => ({ ...current, [selectedGroup]: 'none' }));
    setResizeTarget(null);
    setSelectedGroup(null);
    playHaptic(12);
  }

  function bumpLayer(delta: number) {
    if (!resizeTarget) return;
    setGarmentZBoost((current) => ({ ...current, [resizeTarget]: Math.max(-3, Math.min(3, (current[resizeTarget] ?? 0) + delta)) }));
    playHaptic(8);
  }

  function recolor(group: ClothingGroup, color: string) {
    const activeItemId = picks[group];
    setGarmentColors((current) => ({ ...current, [activeItemId]: color }));
    triggerCelebration(10);
  }

  function clearLook() {
    setPicks((current) => ({ ...current, tops: 'stripe', bottoms: 'travel-jeans', layers: 'none', shoes: 'sneakers', accessories: 'crossbody' }));
    setGarmentColors({});
    setGarmentScale({});
    setGarmentOffset({});
    setGarmentZBoost({});
    setResizeTarget(null);
    setSelectedGroup(null);
    setOpenClosetDrawer('tops');
    triggerCelebration(12);
  }

  function saveLook() {
    const look: SavedLook = { id: `${Date.now()}`, name: `${selected.city} look ${savedLooks.length + 1}`, picks: { ...picks }, character: { ...character }, colors: { ...garmentColors }, scales: { ...garmentScale }, offsets: { ...garmentOffset } };
    setSavedLooks((current) => { const next = [look, ...current].slice(0, 6); window.localStorage.setItem('little-jetter-saved-looks', JSON.stringify(next)); return next; });
    showTravelConfirmation(`${look.name} stamped and saved`);
    triggerCelebration([20, 30, 45]);
  }

  function restoreLook(look: SavedLook) {
    setPicks(look.picks); setCharacter({ ...look.character, hairStyle: look.character.hairStyle ?? 'curls' }); setGarmentColors(look.colors); setGarmentScale(look.scales ?? {}); setGarmentOffset(look.offsets ?? {}); setResizeTarget(null); setSelectedGroup(null); triggerCelebration([18, 25, 18]);
  }

  // Scrolls the doll into view before opening a picker sheet — the sheet
  // only covers the bottom of the screen, so if the doll is already
  // scrolled up above the fold when a kid taps a category, this is what
  // keeps it visible while they choose instead of leaving it off-screen.
  function openAvatarSheet(feature: AvatarFeature) {
    document.getElementById('little-doll-stage-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveAvatarSheet(feature);
  }
  function openCategorySheet(group: ClothingGroup, filter: 'dress' | 'pajama' | 'swim' | 'hat' | null = null) {
    document.getElementById('little-doll-stage-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveCategorySheet(group);
    setStyleFilter(filter);
  }

  function dropOnDoll(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault(); setDropActive(false);
    const [group, id] = event.dataTransfer.getData('text/little-jetter-item').split(':');
    if (CLOSET_GROUPS.includes(group as ClothingGroup) && wardrobe[group as ClothingGroup].some((item) => item.id === id)) choose(group as ClothingGroup, id);
  }

  function togglePacked(id: string) {
    setPacked((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    playHaptic(16);
  }

  function toggleSavedProduct(id: string) {
    setSavedProducts((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      window.localStorage.setItem('little-jetter-saved-picks', JSON.stringify(next));
      return next;
    });
    triggerCelebration([15, 25, 15]);
  }

  function playHaptic(pattern: number | number[]) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  function triggerCelebration(pattern: number | number[] = [20, 35, 20]) {
    playHaptic(pattern);
    setCelebration((value) => value + 1);
  }

  function surpriseMe() {
    const random = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
    setPicks((current) => ({ ...current, tops: random(availableWardrobe('tops')).id, bottoms: random(availableWardrobe('bottoms')).id, layers: random(availableWardrobe('layers')).id, shoes: random(availableWardrobe('shoes')).id, accessories: random(availableWardrobe('accessories')).id }));
    triggerCelebration([30, 40, 30, 40, 60]);
  }

  const chosen = (group: PickGroup) => {
    const item = catalogItemFor(selected.id, group, picks[group]) ?? wardrobe[group][0];
    return { ...item, note: item.description };
  };
  const colorVariants = (group: ClothingGroup) => catalogItemFor(selected.id, group, picks[group])?.variants ?? [];
  const readyToStamp = packed.length >= 4;
  const ltkCollectionUrl = import.meta.env.VITE_LTK_COLLECTION_URL as string | undefined;
  const matchedRealLook = realProductCatalog.filter((product) => [picks.tops, picks.layers, picks.shoes].includes(product.playItemId));
  const realLook = (matchedRealLook.length ? matchedRealLook : realProductCatalog.filter((product) => product.imageUrl)).slice(0, 6);
  // "Rate my look" — scored mainly on the outer-layer/shoe choice against
  // the destination's weather, since that's the pick most likely to leave a
  // kid cold, sweaty, or otherwise uncomfortable if it's skipped or wrong.
  const outfitFeedback = !selected.sandalsFriendly && picks.shoes === 'sandals'
    ? { mood: 'brrr', stars: 2, title: 'Brrr—tiny toes alert!', message: `${selected.city} feels ${selected.weather.toLowerCase()}. Try sneakers or puddle boots for this adventure.` }
    : selected.needsLayer && picks.layers === 'none'
      ? { mood: 'brrr', stars: 2, title: 'A breeze is coming!', message: `${selected.city} feels ${selected.weather.toLowerCase()}. Add a jacket you can carry.` }
      : selected.sandalsFriendly && picks.shoes === 'boots'
        ? { mood: 'warm', stars: 3, title: 'Those boots may feel warm!', message: `${selected.city} feels ${selected.weather.toLowerCase()}. Sandals or sneakers could be comfier.` }
        : { mood: 'ready', stars: 5, title: `✦ ${selected.city} Ready!`, message: `${selected.needsLayer ? 'Perfect layer' : 'Perfect gear'} for ${adventureTemperatures[selected.id]} adventure walks. ${chosen('shoes').name} and ${chosen('layers').name.toLowerCase()} make a clever team.` };
  const shopDrawers = [
    { id: 'top', number: '01', name: 'Tops & shirts', note: 'Tees, blouses and everyday layers' },
    { id: 'bottom', number: '02', name: 'Pants & skirts', note: 'Jeans, shorts and skirts for every day' },
    { id: 'dress', number: '03', name: 'Dresses', note: 'One-piece favorites' },
    { id: 'outerwear', number: '04', name: 'Jackets & hoodies', note: 'Warm layers for cooler days' },
    { id: 'shoe', number: '05', name: 'Exploring shoes', note: 'Pairs made for busy travel days' },
    { id: 'accessory', number: '06', name: 'Little essentials', note: 'Bags, hats and getting-ready helpers' },
    { id: 'luggage', number: '07', name: 'Bags & little suitcases', note: 'Everything gets its own place' },
    { id: 'toy', number: '08', name: 'Toys for the trip', note: 'Small companions and quiet play' },
    { id: 'book', number: '09', name: 'Books', note: 'Stories and guides for the journey' },
    { id: 'swim', number: '10', name: 'Swimwear', note: 'Ready for the water' },
  ];

  return (
    <div className={`little-jetter-shell ${travelMode ? 'is-travel-mode' : ''}`}>
      {transitioning && <div className="little-travel-transition" role="status" aria-live="polite"><div className="little-compass" aria-hidden="true"><span>N</span><span>E</span><span>S</span><span>W</span><i>➤</i><strong>Explore!</strong></div><p>Stamping your boarding pass…</p></div>}
      {travelConfirmation && <div className="little-travel-confirmation" role="status"><span aria-hidden="true">LJ</span><strong>{travelConfirmation}</strong></div>}
      <div className="little-confetti" key={celebration} aria-hidden="true">{celebration > 0 && Array.from({length:18},(_,index) => <i key={index} style={{'--i':index} as React.CSSProperties}>✦</i>)}</div>
      <a className="little-skip" href="#little-main">Skip to the adventure</a>
      <header className="little-header">
        <a className="little-wordmark" href="/" aria-label="Little Jetter home">
          <span className="little-star" aria-hidden="true">✦</span>
          <span>Little Jetter</span>
        </a>
        <div className="little-passport-pill" aria-label="Passport progress">
          <span aria-hidden="true">◎</span> My passport <strong>{passportStamps.length}/{destinations.length}</strong>
        </div>
        <button type="button" className="little-travel-toggle" aria-pressed={travelMode} onClick={() => { setTravelMode((value) => !value); triggerCelebration([25,35,25]); }}><span aria-hidden="true">🧭</span>{travelMode ? 'Travel mode on' : 'Start travel mode'}</button>
      </header>

      <main id="little-main">
        <section className="little-hero" aria-labelledby="little-title">
          <img src="/little-jetter/travel-desk.png" alt="An open suitcase with a hat, raincoat, striped shirt, red sneakers, camera, map, and illustrated travel stamps." />
          <div className="little-hero-copy">
            <p className="little-kicker">A new adventure is waiting</p>
            <h1 id="little-title">Where are you<br /><em>jetting off to?</em></h1>
            <p>Pick a place. We’ll discover it, choose what to wear, and pack everything you need.</p>
          </div>
          <nav className="little-route" aria-label="Adventure views">
            {(['destination', 'style', 'explore', 'shop'] as const).map((step, index) => (
              <button type="button" aria-current={currentStep === step ? 'step' : undefined} className={currentStep === step ? 'is-current' : ''} onClick={() => showStep(step)} key={step}>
                <span>{index + 1}</span>{step}
              </button>
            ))}
          </nav>
          {travelMode && <div className="little-travel-sky" aria-hidden="true"><span className="little-flying-plane">✈</span><span className="little-moving-train">🚆</span><span className="little-cloud cloud-one">☁</span><span className="little-cloud cloud-two">☁</span></div>}
        </section>

        {travelMode && <section className="little-travel-console" aria-label="Travel mode">
          <div className="little-compass"><span>N</span><span>E</span><span>S</span><span>W</span><i>➤</i><strong>Explore!</strong></div>
          <div className="little-departure-board"><p className="little-kicker">Now boarding</p><h2>{selected.city} adventure</h2><div><span>✈ Fly</span><span>🚆 Ride</span><span>🧭 Explore</span></div><small>{destinationTypes[selected.id]} · {selected.region} · {selected.country}</small></div>
          <nav className="little-route-adventure" aria-label="Choose an adventure view">{(['destination','style','explore','shop'] as const).map((step,index)=><button type="button" aria-current={currentStep===step?'step':undefined} className={currentStep===step?'is-current':''} onClick={()=>showStep(step)} key={step}><span>0{index+1}</span><strong>{step}</strong></button>)}</nav>
        </section>}

        <section className="little-chooser little-tab-view" data-app-view="destination" hidden={currentStep !== 'destination'} aria-labelledby="choose-title">
          <div className="little-section-heading">
            <div><p className="little-kicker">First stop</p><h2 id="choose-title">Choose your destination</h2></div>
            <p>{destinations.length} places. A new way to get ready for each one.</p>
          </div>

          <div className="little-geography" aria-label="Browse destinations by geography">
            <div className="little-type-filter" aria-label="Choose a destination type">
              <div className="little-ticker-label"><small>Departure board</small><strong>Destination type</strong></div>
              <div className="little-ticker-track">{allDestinationTypes.map((type, index) => <button type="button" className={destinationTypeFilter === type ? 'is-active' : ''} aria-pressed={destinationTypeFilter === type} onClick={() => setDestinationTypeFilter(type)} key={type}><span>{String(index).padStart(2, '0')}</span>{type}</button>)}</div>
            </div>
            <div className="little-region-filter" aria-label="Choose a region">
              {regions.map((region) => <button type="button" className={regionFilter === region ? 'is-active' : ''} aria-pressed={regionFilter === region} onClick={() => setRegionFilter(region)} key={region}>{region}</button>)}
            </div>
            <div className="little-place-path" aria-label={`${selected.city} location hierarchy`}>
              <div><small>Destination type</small><strong>{destinationTypes[selected.id]}</strong></div><span aria-hidden="true">→</span>
              <div><small>Region</small><strong>{selected.region}</strong></div><span aria-hidden="true">→</span>
              <div><small>Country</small><strong>{selected.country}</strong></div><span aria-hidden="true">→</span>
              <div><small>{selected.areaType}</small><strong>{selected.area}</strong></div><span aria-hidden="true">→</span>
              <div><small>City</small><strong>{selected.city}</strong></div>
            </div>
          </div>

          <div className="little-destination-library">
            {regions.slice(1).filter((region) => visibleDestinations.some((item) => item.region === region)).map((region, regionIndex) => {
              const regionPlaces = visibleDestinations.filter((item) => item.region === region);
              const countries = Array.from(new Set(regionPlaces.map((item) => item.country)));
              return <details className="little-region-drawer" open={selected.region === region} key={region}>
                <summary><span>{String(regionIndex + 1).padStart(2,'0')}</span><strong>{region}</strong><small>{regionPlaces.length} destinations</small><b>Open / close</b></summary>
                <div>{countries.map((country, countryIndex) => <details className="little-country-drawer" open={selected.country === country} key={country}>
                  <summary><span>{String(countryIndex + 1).padStart(2,'0')}</span><strong>{country}</strong><small>{regionPlaces.filter((item) => item.country === country).length} cities</small></summary>
                  <div className="little-country-cities">{regionPlaces.filter((item) => item.country === country).map((destination) => {
                    const isSelected = destination.id === selected.id; const index = destinations.findIndex((item) => item.id === destination.id);
                    return <button type="button" className={`little-destination ${isSelected ? 'is-selected' : ''}`} style={{ '--stamp-color': destination.color } as React.CSSProperties} aria-pressed={isSelected} onClick={() => selectDestination(destination)} key={destination.id}>
                      <span className="little-destination-number">{String(index + 1).padStart(3, '0')}</span>{DESTINATIONS_WITH_BACKDROP.has(destination.id) ? <span className="little-destination-icon little-destination-photo" aria-hidden="true"><img src={`/little-jetter/${destination.id}-doll-backdrop.png`} alt="" /></span> : <span className="little-destination-icon little-destination-art" aria-hidden="true" />}<span className="little-destination-city">{destination.city}</span><span className="little-destination-country">{destination.area}</span><span className="little-destination-note">{destinationTypes[destination.id]} · {destination.note}</span><span className="little-stamp-edge" aria-hidden="true" />
                    </button>})}</div>
                </details>)}</div>
              </details>;
            })}
          </div>

          <aside className="little-trip-card" style={{ '--trip-color': selected.color } as React.CSSProperties} aria-live="polite">
            <div className="little-trip-seal" aria-hidden="true"><span className="little-seal-art" />{selected.city}</div>
            <div className="little-trip-copy">
              <p className="little-kicker">Your next adventure</p>
              <h3>{selected.city} is calling</h3>
              <div className="little-weather"><span className="little-weather-mark" aria-hidden="true" /><div><small>What it feels like</small><strong>{selected.weather}</strong></div></div>
              <p>{selected.prompt}</p>
            </div>
            <button type="button" className="little-begin" onClick={beginTrip}>
              {started ? `Continue ${selected.city} trip` : `Let’s go to ${selected.city}`}
              <span aria-hidden="true">→</span>
            </button>
          </aside>
          {started && <p className="little-saved-note" role="status">✓ Your {selected.city} adventure is saved on this device. Next up: explore the destination.</p>}
        </section>

        <section className="little-shop little-tab-view" data-app-view="shop" hidden={currentStep !== 'shop'} aria-labelledby="shop-title">
          <div className="little-shop-heading">
            <div><p className="little-kicker">Real picks, just for looking</p><h2 id="shop-title">The Jetter Shop</h2></div>
            <p>Window-shop the travel pieces saved in our LTK closet. Kids can heart favorites—prices, carts, and checkout stay out of the game.</p>
          </div>
          <div className="little-shop-toolbar">
            <p>Open one drawer at a time. Close it when you’re finished.</p>
            <span>{savedProducts.length} saved for a grown-up</span><button type="button" className="little-more-choices" onClick={() => { setShowMoreChoices(true); triggerCelebration(); }}>More choices</button>
          </div>
          <div className="little-drawer-cabinet">
            {shopDrawers.map((drawer) => {
              const products = realProductCatalog.filter((item) => item.category === drawer.id);
              const isOpen = openDrawer === drawer.id;
              return <section className={`little-shop-drawer ${isOpen ? 'is-open' : ''}`} key={drawer.id}>
                <button type="button" aria-expanded={isOpen} aria-controls={`drawer-${drawer.id}`} onClick={() => setOpenDrawer(isOpen ? '' : drawer.id)}>
                  <span className="little-drawer-number">{drawer.number}</span><span><strong>{drawer.name}</strong><small>{drawer.note} · {products.length} picks</small></span><b>{isOpen ? 'Close −' : 'Open +'}</b>
                </button>
                {isOpen && <div id={`drawer-${drawer.id}`} className="little-product-grid">
                  {products.length ? products.map((product) => <article key={product.id} style={{ background: PRODUCT_CATEGORY_BG[product.category] }}>
                    <div>{product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" /> : <i className="little-product-fallback" aria-hidden="true">{PRODUCT_CATEGORY_ICON[product.category]}</i>}<span>LTK pick</span></div>
                    <small>{product.brand}</small><h3>{product.name}</h3>
                    <button type="button" aria-pressed={savedProducts.includes(product.id)} onClick={() => toggleSavedProduct(product.id)}>{savedProducts.includes(product.id) ? 'Saved' : 'Save this pick'}</button>
                  </article>) : <p className="little-empty-drawer">New finds will land here soon.</p>}
                </div>}
              </section>;
            })}
          </div>
          <aside className="little-adult-handoff">
            <div><p className="little-kicker">Grown-up handoff</p><h3>{savedProducts.length ? `${savedProducts.length} picks are waiting` : 'Heart a few favorites together'}</h3><p>Parents can review the saved look and continue to verified retailer sites. Little Jetter never shows prices or checkout controls to kids.</p></div>
            <button type="button" className="little-parent-button" onClick={() => setParentGateOpen(true)}>Parent review <span>→</span></button>
          </aside>
        </section>

        {parentGateOpen && <div className="little-parent-modal" role="dialog" aria-modal="true" aria-labelledby="parent-title">
          <div>
            <button type="button" className="little-modal-close" aria-label="Close grown-up review" onClick={() => setParentGateOpen(false)}>×</button>
            <p className="little-kicker">Grown-ups only</p><h2 id="parent-title">Review the saved real-life look</h2>
            {!parentUnlocked ? <><p>Please answer this quick check before leaving Little Jetter: what is 7 + 5?</p><form onSubmit={(event) => { event.preventDefault(); if (parentAnswer.trim() === '12') setParentUnlocked(true); }}><label htmlFor="parent-check">Answer</label><input id="parent-check" inputMode="numeric" value={parentAnswer} onChange={(event) => setParentAnswer(event.target.value)} /><button type="submit">Continue</button></form></> : <><p>{savedProducts.length} saved picks are ready for you to review. Product pages open only for a grown-up.</p>{ltkCollectionUrl ? <a href={ltkCollectionUrl} target="_blank" rel="noreferrer sponsored">View the saved look ↗</a> : <p className="little-link-needed">The real-product preview is ready. Verified retailer links will appear here as each drawer is connected.</p>}</>}
          </div>
        </div>}

        {activeAvatarSheet && (() => {
          const feature = activeAvatarSheet;
          return <div className="little-category-backdrop" role="dialog" aria-modal="true" aria-labelledby="avatar-sheet-title" onClick={() => setActiveAvatarSheet(null)}>
            <div className="little-category-sheet" onClick={(event) => event.stopPropagation()}>
              <div className="little-category-sheet-handle" aria-hidden="true" />
              <div className="little-category-sheet-head"><strong id="avatar-sheet-title">{AVATAR_BUTTON[feature].icon} {AVATAR_BUTTON[feature].label}</strong><button type="button" className="little-modal-close" aria-label="Close picker" onClick={() => setActiveAvatarSheet(null)}>×</button></div>
              {feature === 'hairStyle' && (() => {
                const thumbStyleFor = (styleId: string) => {
                  const focus = HEAD_THUMB_FOCUS[styleId] ?? { x: 300, y: 220 };
                  return {
                    width: 600 * HEAD_THUMB_ZOOM,
                    height: 900 * HEAD_THUMB_ZOOM,
                    transform: `translate(${26 - focus.x * HEAD_THUMB_ZOOM}px, ${26 - focus.y * HEAD_THUMB_ZOOM}px)`,
                  };
                };
                const classicStyles = characterOptions.hairStyle.filter((styleOption) => {
                  const urls = new Set(characterOptions.skin.map((s) => PAINTERLY_HEAD_ASSETS[styleOption.id]?.[s.id]?.brown).filter(Boolean));
                  return urls.size > 1;
                });
                const moreStyles = characterOptions.hairStyle.filter((s) => !classicStyles.includes(s));
                const boyStyleIds = new Set(['curly-fro-boy', 'wavy-blonde-boy', 'wavy-brown-boy', 'cap-green-boy', 'wavy-blonde-boy2', 'cap-tan-boy', 'short-dark-boy', 'curly-auburn-boy']);
                const girlMoreStyles = moreStyles.filter((s) => !boyStyleIds.has(s.id));
                const boyMoreStyles = moreStyles.filter((s) => boyStyleIds.has(s.id));
                const renderMoreGroup = (label: string, styles: typeof moreStyles) => styles.length > 0 && <div className="little-head-gallery-group" key={label}>
                  <small>{label}</small>
                  <div className="little-character-options little-hairstyle-options little-hairstyle-options-compact">
                    {styles.map((styleOption) => {
                      const headUrl = PAINTERLY_HEAD_ASSETS[styleOption.id]?.golden?.brown;
                      if (!headUrl) return null;
                      const isChosen = character.hairStyle === styleOption.id;
                      return <button type="button" aria-pressed={isChosen} onClick={() => { setCharacter((current) => ({ ...current, hairStyle: styleOption.id })); triggerCelebration(12); }} key={styleOption.id}>
                        <span className="little-head-thumb"><img src={headUrl} alt="" aria-hidden="true" style={thumbStyleFor(styleOption.id)} /></span>
                        <strong>{styleOption.label}</strong>
                      </button>;
                    })}
                  </div>
                </div>;
                return <div className="little-head-gallery">
                  {classicStyles.map((styleOption) => <div className="little-head-gallery-group" key={styleOption.id}>
                    <small>{styleOption.label}</small>
                    <div className="little-character-options little-hairstyle-options">
                      {characterOptions.skin.map((skinOption) => {
                        const headUrl = PAINTERLY_HEAD_ASSETS[styleOption.id]?.[skinOption.id]?.brown;
                        if (!headUrl) return null;
                        const isChosen = character.hairStyle === styleOption.id && character.skin === skinOption.id;
                        return <button type="button" aria-pressed={isChosen} onClick={() => { setCharacter((current) => ({ ...current, hairStyle: styleOption.id, skin: skinOption.id })); triggerCelebration(12); }} key={skinOption.id}>
                          <span className="little-head-thumb"><img src={headUrl} alt="" aria-hidden="true" style={thumbStyleFor(styleOption.id)} /></span>
                          <strong>{skinOption.id}</strong>
                        </button>;
                      })}
                    </div>
                  </div>)}
                  {renderMoreGroup('More Looks · Girls', girlMoreStyles)}
                  {renderMoreGroup('More Looks · Boys', boyMoreStyles)}
                </div>;
              })()}
            </div>
          </div>;
        })()}

        {activeCategorySheet && (() => {
          const group = activeCategorySheet;
          const variants = colorVariants(group);
          const sheetTitle = styleFilter === 'dress' ? '👗 Dress' : styleFilter === 'pajama' ? '🌙 Pajamas' : styleFilter === 'swim' ? '🩱 Swim' : styleFilter === 'hat' ? '🧢 Hat' : `${CATEGORY_BUTTON[group].icon} ${CATEGORY_BUTTON[group].label}`;
          return <div className="little-category-backdrop" role="dialog" aria-modal="true" aria-labelledby="category-sheet-title" onClick={() => { setActiveCategorySheet(null); setStyleFilter(null); }}>
            <div className="little-category-sheet" onClick={(event) => event.stopPropagation()}>
              <div className="little-category-sheet-handle" aria-hidden="true" />
              <div className="little-category-sheet-head"><strong id="category-sheet-title">{sheetTitle}</strong><button type="button" className="little-modal-close" aria-label="Close picker" onClick={() => { setActiveCategorySheet(null); setStyleFilter(null); }}>×</button></div>
              <div className="little-item-row">
                {availableWardrobe(group).map((item) => <button type="button" className={item.tags.includes('illustrated') ? 'is-illustrated' : 'is-sketch'} aria-pressed={picks[group] === item.id} onClick={() => choose(group, item.id)} key={item.id}><GarmentPreview destinationId={selected.id} group={group} itemId={item.id} picks={picks} character={character} garmentColors={garmentColors} />{!item.tags.includes('illustrated') && <em className="little-sketch-badge">Sketch</em>}<strong>{item.name}</strong><small>{item.description}</small></button>)}
              </div>
              {variants.length > 1 && <div className="little-color-swatches" data-color-slot={group} aria-label={`Colors for ${chosen(group).name}`}><small>Try another color</small>{variants.map((variant) => <button type="button" aria-label={`Use ${variant.id} for ${chosen(group).name}`} aria-pressed={(garmentColors[picks[group]] ?? variants[0].swatch) === variant.swatch} style={{ '--swatch': variant.swatch } as React.CSSProperties} onClick={() => recolor(group, variant.swatch)} key={variant.id} />)}</div>}
            </div>
          </div>;
        })()}

        {showMoreChoices && <div className="little-choice-modal" role="dialog" aria-modal="true" aria-labelledby="choice-title">
          <div><button type="button" className="little-modal-close" aria-label="Close more choices" onClick={() => setShowMoreChoices(false)}>×</button><p className="little-kicker">The parent closet · {realProductCatalog.length} finds</p><h2 id="choice-title">Real pieces for later</h2><p>A grown-up can save products inspired by the child’s finished game look.</p><div className="little-popup-products">{realProductCatalog.map((product,index) => <button type="button" style={{'--delay':`${Math.min(index * 45, 540)}ms`} as React.CSSProperties} aria-pressed={savedProducts.includes(product.id)} onClick={() => toggleSavedProduct(product.id)} key={product.id}><span className="little-popup-thumb" style={{ background: PRODUCT_CATEGORY_BG[product.category] }}>{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <i className="little-product-fallback" aria-hidden="true">{PRODUCT_CATEGORY_ICON[product.category]}</i>}</span><span><small>{product.brand}</small><strong>{product.name}</strong></span><b>{savedProducts.includes(product.id) ? 'Saved' : 'Save'}</b></button>)}</div><button type="button" className="little-done-choosing" onClick={() => setShowMoreChoices(false)}>Done choosing</button></div>
        </div>}

        {started && (
          <section id="adventure-studio" className="little-studio little-tab-view" data-app-view={currentStep} hidden={currentStep === 'destination' || currentStep === 'shop'} aria-labelledby="studio-title">
            <div className="little-studio-heading">
              <div>
                <p className="little-kicker">Today in {selected.city}</p>
                <h2 id="studio-title">Dress for the adventure</h2>
                <p>{selected.adventure}</p>
              </div>
              <div className="little-day-card"><span className="little-day-art" aria-hidden="true" /><small>Adventure forecast</small><strong>{selected.weather}</strong></div>
            </div>

            {gameStep === 2 && (
              <div className="little-explore-panel little-game-panel">
                <div className="little-section-art little-explore-art" aria-hidden="true"><img src="/little-jetter/explore-postcard.png" alt="" /><span>My travel journal · {selected.city}</span></div>
                <div className="little-journal-progress"><div><small>Journal mission</small><strong>{foundNotices.length}/4 discoveries collected</strong></div><span><i style={{ width: `${foundNotices.length * 25}%` }} /></span></div>
                <details className="little-task-drawer" open><summary><span>01</span><strong>Today’s journal page</strong><b>Open / close</b></summary><div className="little-postcard little-journal-page" style={{ backgroundColor: selected.color }}><span className="little-postcard-mark" aria-hidden="true" /><small>{destinationTypes[selected.id]} · {selected.country}</small><strong>Dear travel journal...</strong><p>{selected.adventure}</p><em>{selected.passportPhrase}</em></div></details>
                <details className="little-task-drawer" open><summary><span>02</span><strong>Tap what you discover</strong><b>Open / close</b></summary><div className="little-find-game">
                  <div className="little-find-scene"><img src="/little-jetter/explore-postcard.png" alt={`Find four hidden discoveries in the ${selected.city} travel illustration.`} />{selected.notices.map((item, index) => <button type="button" className={`little-hotspot hotspot-${index + 1} ${foundNotices.includes(item.label) ? 'is-found' : ''}`} aria-label={`Find ${item.label}`} aria-pressed={foundNotices.includes(item.label)} onClick={() => toggleNotice(item.label)} key={item.label}><span>{foundNotices.includes(item.label) ? '✓' : '?'}</span></button>)}</div>
                  <div className="little-notice-grid">{selected.notices.map((item, index) => <div className={foundNotices.includes(item.label) ? 'is-found' : ''} key={item.label}><span className={`little-notice-art notice-${index + 1}`} aria-hidden="true" /><b>{foundNotices.includes(item.label) ? 'Found' : `Clue ${index + 1}`}</b>{item.label}</div>)}</div>
                </div></details>
                <details className="little-task-drawer" open><summary><span>03</span><strong>Finish the memory</strong><b>Open / close</b></summary><div className="little-journal-prompts"><p>The best part of this adventure would be...</p>{['Something I spotted', 'Something I tasted', 'Something I learned', 'Someone I met'].map((choice) => <button type="button" aria-pressed={journalChoice === choice} onClick={() => { setJournalChoice(choice); triggerCelebration(18); }} key={choice}>{choice}</button>)}{journalChoice && <strong>Saved to your {selected.city} journal.</strong>}</div></details>
                <details className="little-task-drawer"><summary><span>04</span><strong>Real-life look for a parent</strong><b>Open / close</b></summary><div className="little-buddy-grid little-real-buddies">{realLook.map((product) => <button type="button" aria-pressed={savedProducts.includes(product.id)} onClick={() => toggleSavedProduct(product.id)} key={product.id}><img src={product.imageUrl} alt="" /><strong>{product.name}</strong><small>{savedProducts.includes(product.id) ? 'Saved for a parent' : `Inspired by ${chosen('tops').name}`}</small></button>)}</div></details>
                <button type="button" className="little-next" onClick={() => showStep('shop')}>Visit the Jetter Shop <span>→</span></button>
              </div>
            )}

            {gameStep === 1 && (
              <div className="little-dress-layout little-game-panel">
                <aside className="little-look-preview">
                  <div className="little-closet-heading"><strong>Make your Little Jetter.</strong></div>
                  <div className="little-doll-rail-wrap" id="little-doll-stage-anchor">
                    <div className={`little-avatar little-doll-stage character-${character.style} ${dropActive ? 'is-drop-active' : ''}`} onDragEnter={() => setDropActive(true)} onDragLeave={() => setDropActive(false)} onDragOver={(event) => event.preventDefault()} onDrop={dropOnDoll} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onClick={handleDollClick} onWheel={handleWheelResize} style={{ '--eye-color': characterOptions.eyes.find((option) => option.id === character.eyes)?.color, '--hair-color': characterOptions.hair.find((option) => option.id === character.hair)?.color } as React.CSSProperties} aria-label={`Outfit: ${chosen('tops').name}, ${chosen('bottoms').name}, ${chosen('layers').name}, ${chosen('shoes').name}, and ${chosen('accessories').name}. Tap a piece to move, resize, or delete it.`}>
                      <div className={`little-doll-destination scene-${selected.id}`} style={{ '--scene-color': selected.color } as React.CSSProperties} aria-hidden="true">{DESTINATIONS_WITH_BACKDROP.has(selected.id) && <img src={`/little-jetter/${selected.id}-doll-backdrop.png`} alt="" />}<i /><b /></div>
                      <CatalogDoll key={`${character.hairStyle}-${picks.tops}-${picks.bottoms}-${picks.layers}-${picks.shoes}-${picks.accessories}-${JSON.stringify(garmentColors)}`} destinationId={selected.id} picks={picks} character={character} garmentColors={garmentColors} garmentScale={garmentScale} garmentOffset={garmentOffset} garmentZBoost={garmentZBoost} activeItemId={resizeTarget} />
                      <div className="little-dress-sparkles" key={`sparkles-${celebration}`} aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} style={{ '--spark': index } as React.CSSProperties}>✦</i>)}</div>
                      {dropActive && <div className="little-drop-message">Drop to dress</div>}
                      {resizeTarget && selectedGroup && (
                        <div className="little-item-toolbar" onClick={(event) => event.stopPropagation()}>
                          <button type="button" aria-label="Send this layer backward, behind other clothes" onClick={() => bumpLayer(-1)}><span aria-hidden="true">⬇</span><small>Layer</small></button>
                          <button type="button" aria-label="Bring this layer forward, in front of other clothes" onClick={() => bumpLayer(1)}><span aria-hidden="true">⬆</span><small>Layer</small></button>
                          <button type="button" className="is-delete" aria-label="Remove this item" onClick={deleteSelectedItem}><span aria-hidden="true">🗑</span><small>Remove</small></button>
                        </div>
                      )}
                    </div>
                    <div className="little-side-rail">
                      <div className="little-category-rail little-avatar-rail" aria-label="Avatar features">
                        {(['hairStyle'] as AvatarFeature[]).map((feature) => <button type="button" className={`little-category-rail-btn ${activeAvatarSheet === feature ? 'is-active' : ''}`} aria-pressed={activeAvatarSheet === feature} onClick={() => openAvatarSheet(feature)} key={feature}><span aria-hidden="true">{AVATAR_BUTTON[feature].icon}</span><small>{AVATAR_BUTTON[feature].label}</small></button>)}
                      </div>
                      <div className="little-rail-divider" aria-hidden="true" />
                      <div className="little-category-rail" aria-label="Clothing categories">
                        {CLOSET_GROUPS.map((group) => <button type="button" className={`little-category-rail-btn ${activeCategorySheet === group && !styleFilter ? 'is-active' : ''}`} aria-pressed={activeCategorySheet === group && !styleFilter} onClick={() => openCategorySheet(group)} key={group}><span aria-hidden="true">{CATEGORY_BUTTON[group].icon}</span><small>{CATEGORY_BUTTON[group].label}</small></button>)}
                        <button type="button" className={`little-category-rail-btn ${styleFilter === 'dress' ? 'is-active' : ''}`} aria-pressed={styleFilter === 'dress'} onClick={() => openCategorySheet('tops', 'dress')}><span aria-hidden="true">👗</span><small>Dress</small></button>
                        <button type="button" className={`little-category-rail-btn ${styleFilter === 'pajama' ? 'is-active' : ''}`} aria-pressed={styleFilter === 'pajama'} onClick={() => openCategorySheet('tops', 'pajama')}><span aria-hidden="true">🌙</span><small>Pajamas</small></button>
                        <button type="button" className={`little-category-rail-btn ${styleFilter === 'swim' ? 'is-active' : ''}`} aria-pressed={styleFilter === 'swim'} onClick={() => openCategorySheet('tops', 'swim')}><span aria-hidden="true">🩱</span><small>Swim</small></button>
                        <button type="button" className={`little-category-rail-btn ${styleFilter === 'hat' ? 'is-active' : ''}`} aria-pressed={styleFilter === 'hat'} onClick={() => openCategorySheet('accessories', 'hat')}><span aria-hidden="true">🧢</span><small>Hat</small></button>
                      </div>
                    </div>
                  </div>
                  <h3>{selected.city} explorer</h3>
                  <div key={`${picks.layers}-${picks.shoes}`} className={`little-outfit-reaction is-${outfitFeedback.mood}`} role="status"><span aria-hidden="true" /><div><div className="little-rate-look"><strong>Rate my look</strong><span className="little-star-rating" aria-label={`${outfitFeedback.stars} out of 5 stars`}>{'★'.repeat(outfitFeedback.stars)}{'☆'.repeat(5 - outfitFeedback.stars)}</span></div><strong className="little-rate-title">{outfitFeedback.title}</strong><p>{outfitFeedback.message}</p></div></div>
                </aside>
                <div className="little-closet">
                  <div className="little-surprise-bar"><div><small>My paper-doll closet</small><strong>Tap a piece to dress your doll.</strong></div><div className="little-look-actions"><button type="button" onClick={surpriseMe}>Surprise me</button><button type="button" onClick={clearLook}>Clear look</button><button type="button" onClick={saveLook}>Save my look</button></div></div>
                  <details className="little-task-drawer little-my-looks"><summary><strong>My saved looks</strong><b>Open</b></summary><div>{savedLooks.length ? savedLooks.map((look) => <button type="button" onClick={() => restoreLook(look)} key={look.id}><strong>{look.name}</strong><small>Tap to wear again</small></button>) : <p>Save a look and it will wait here on this device.</p>}</div></details>
                  <details className="little-task-drawer" open={openClosetDrawer === 'parent'} onToggle={(event) => { if (event.currentTarget.open) setOpenClosetDrawer('parent'); }}><summary><strong>Parent product matches</strong><b>{openClosetDrawer === 'parent' ? 'Close' : 'Open'}</b></summary><div className="little-real-look">
                    <div><small>Your Little Jetter picks</small><strong>Real pieces inspired by this look</strong></div>
                    <div>{realLook.length ? realLook.map((product) => { const inspiredItem = (Object.keys(wardrobe) as PickGroup[]).flatMap((group) => wardrobe[group]).find((item) => item.id === product.playItemId); return <button type="button" key={product.id} aria-pressed={savedProducts.includes(product.id)} onClick={() => toggleSavedProduct(product.id)}><img src={product.imageUrl} alt="" /><span><small>{inspiredItem ? `Inspired by ${inspiredItem.name}` : 'Inspired by this look'}</small>{product.name}</span><b>{savedProducts.includes(product.id) ? 'Saved' : 'Save'}</b></button>; }) : <p>Choose another piece to discover a real-life match.</p>}</div>
                    <small>Kids save the look. A parent decides whether to shop it.</small>
                  </div></details>
                  <button type="button" className="little-next" onClick={() => showStep('explore')}>Explore my travel journal <span>→</span></button>
                </div>
              </div>
            )}

            {gameStep === 3 && (
              <div className="little-buddy-panel little-game-panel">
                <div className="little-section-art little-buddy-art" aria-hidden="true"><img src="/little-jetter/packing-buddies.png" alt="" /><span>Pick a tiny copilot</span></div>
                <div><p className="little-kicker">Toys can travel too</p><h3>Who gets the window seat?</h3><p>Pick one small buddy to bring along. A good traveler makes room for what matters.</p></div>
                <details className="little-task-drawer" open><summary><span>01</span><strong>Choose a travel buddy</strong><b>Open / close</b></summary><div className="little-buddy-grid">{wardrobe.buddies.map((item) => <button type="button" aria-pressed={picks.buddies === item.id} onClick={() => choose('buddies', item.id)} key={item.id}><span className="little-game-item" style={gameItemStyle('buddies', item.id)} aria-hidden="true" /><strong>{item.name}</strong><small>{item.description}</small></button>)}</div></details>
                <details className="little-task-drawer"><summary><span>02</span><strong>Parent toy preview</strong><b>Open / close</b></summary><div className="little-buddy-grid little-real-buddies">{realProductCatalog.filter((product) => product.category === 'toy').map((product) => <button type="button" aria-pressed={savedProducts.includes(product.id)} onClick={() => toggleSavedProduct(product.id)} key={product.id}><span className="little-buddy-thumb" style={{ background: PRODUCT_CATEGORY_BG[product.category] }}>{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <i className="little-product-fallback" aria-hidden="true">{PRODUCT_CATEGORY_ICON[product.category]}</i>}</span><strong>{product.name}</strong><small>{savedProducts.includes(product.id) ? 'Saved for a parent' : 'Save this real pick'}</small></button>)}</div></details>
                <button type="button" className="little-next" onClick={() => setGameStep(4)}>Pack my suitcase <span>→</span></button>
              </div>
            )}

            {gameStep === 4 && (
              <div className="little-pack-layout little-game-panel">
                <div className="little-section-art little-pack-art" aria-hidden="true"><img src="/little-jetter/packing-buddies.png" alt="" /><span>Ready, set, pack!</span></div>
                <details className="little-task-drawer" open><summary><span>01</span><strong>Your suitcase</strong><b>Open / close</b></summary><div className="little-suitcase"><p>Packed <strong>{packed.length}/6</strong></p><div>{packed.map((id) => { const group = (Object.keys(wardrobe) as PickGroup[]).find((key) => wardrobe[key].some((entry) => entry.id === id)); const item = group ? wardrobe[group].find((entry) => entry.id === id) : undefined; return item && group ? <span className="little-packed-art" style={gameItemStyle(group, item.id)} key={id} title={item.name} /> : <span className="little-packed-essential" key={id}>{id === 'book' ? 'BOOK' : 'KIT'}</span>; })}</div><small>{packed.length < 4 ? 'Choose at least four things for the adventure.' : 'Everything fits. Nicely packed!'}</small></div></details>
                <details className="little-task-drawer" open><summary><span>02</span><strong>Pack each piece</strong><b>Open / close</b></summary><div className="little-pack-list">
                  {([chosen('tops'), chosen('bottoms'), chosen('layers'), chosen('shoes'), chosen('accessories'), chosen('buddies'), { id:'toothbrush',icon:'',name:'Travel kit',note:'A getting-ready essential' }, { id:'book',icon:'',name:'Travel book',note:'For quiet moments' }] as Array<{id:string;name:string;note:string}>).map((item) => { const group = (Object.keys(wardrobe) as PickGroup[]).find((key) => wardrobe[key].some((entry) => entry.id === item.id)); return <button type="button" aria-pressed={packed.includes(item.id)} onClick={() => togglePacked(item.id)} key={item.id}><span className={group ? 'little-pack-art' : 'little-pack-essential'} style={group ? gameItemStyle(group, item.id) : undefined}>{group ? '' : item.id === 'book' ? 'BOOK' : 'KIT'}</span><div><strong>{item.name}</strong><small>{item.note}</small></div><b>{packed.includes(item.id) ? 'Packed' : 'Add'}</b></button>; })}
                  <button type="button" className="little-next" disabled={!readyToStamp} onClick={stampPassport}>Stamp my passport <span>→</span></button>
                </div></details>
              </div>
            )}

            {gameStep === 5 && (
              <div className="little-finish little-game-panel">
                <div className="little-section-art little-stamp-art" aria-hidden="true"><img src="/little-jetter/passport-library.png" alt="" /><span>Passport complete</span></div>
                <div className="little-earned-stamp"><span className="little-stamp-art-mark" aria-hidden="true" /><strong>{selected.city}</strong><small>{selected.passportPhrase}</small></div>
                <div><p className="little-kicker">Adventure ready</p><h3>You did it your way.</h3><p>You explored the plan, made a look, chose {chosen('buddies').name}, and packed what you need.</p><button type="button" className="little-grownup" onClick={() => setParentGateOpen(true)}>Grown-ups: review this real-life look <span>→</span></button><small className="little-commerce-note">Real product shopping uses LTK and opens only after the grown-up step.</small></div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="little-footer">
        <span>Made for curious travelers, ages 6–11.</span>
        <span>No account. No ads. Just adventure.</span>
      </footer>
    </div>
  );
}
