import { useEffect, useMemo, useState } from 'react';
import './little-jetter.css';
import { realProductCatalog } from './catalog';

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

const regions = ['All regions', ...Array.from(new Set(destinations.map((item) => item.region)))];
const destinationTypes: Record<string, string> = {
  tokyo: 'Big city', honolulu: 'Beach + island', london: 'Historic city', cartagena: 'Coastal city', paris: 'Art + city', nairobi: 'City + wildlife',
  'mexico-city': 'Big city', rome: 'History + city', sydney: 'Harbor + beach', 'san-jose': 'City + nature',
  'new-york': 'Big city', barcelona: 'Art + coast', 'cape-town': 'Mountain + coast', vancouver: 'City + nature', seoul: 'History + city',
};
const allDestinationTypes = ['All types', ...Array.from(new Set(Object.values(destinationTypes)))];

const STORAGE_KEY = 'little-jetter-first-trip';

const wardrobe = {
  tops: [
    { id: 'stripe', icon: '👕', name: 'Striped tee', note: 'Easy for a busy day' },
    { id: 'sweater', icon: '🧥', name: 'Cloud-soft sweater', note: 'Cozy when it cools down' },
    { id: 'dress', icon: '👗', name: 'Twirl dress', note: 'Ready for something special' },
    { id: 'sunset-tee', icon: '', name: 'Sunset tee', note: 'A bright everyday favorite' },
    { id: 'adventure-shirt', icon: '', name: 'Adventure shirt', note: 'Polished but ready to play' },
  ],
  bottoms: [
    { id: 'travel-jeans', icon: '', name: 'Cuffed travel jeans', note: 'Ready for a full day out' },
    { id: 'coral-skirt', icon: '', name: 'Coral swing skirt', note: 'A colorful city choice' },
    { id: 'adventure-shorts', icon: '', name: 'Adventure shorts', note: 'Pockets for tiny finds' },
    { id: 'wide-leg-pants', icon: '', name: 'Wide-leg pants', note: 'Easy movement for long days' },
    { id: 'play-skirt', icon: '', name: 'Play-all-day skirt', note: 'Colorful and comfortable' },
  ],
  layers: [
    { id: 'rain', icon: '🧥', name: 'Sunny raincoat', note: 'A clever Tokyo layer' },
    { id: 'denim', icon: '🧥', name: 'Denim jacket', note: 'Light and easy to carry' },
    { id: 'none', icon: '✦', name: 'No layer', note: 'Bold choice—check the weather' },
    { id: 'cardigan', icon: '', name: 'Pocket cardigan', note: 'Soft and easy to carry' },
    { id: 'windbreaker', icon: '', name: 'Color-block windbreaker', note: 'Ready for a breezy ride' },
  ],
  shoes: [
    { id: 'sneakers', icon: '👟', name: 'Red sneakers', note: 'Made for exploring' },
    { id: 'boots', icon: '🥾', name: 'Puddle boots', note: 'Ready for a rainy turn' },
    { id: 'sandals', icon: '🩴', name: 'Sunny sandals', note: 'Maybe chilly today' },
    { id: 'high-tops', icon: '', name: 'Colorful high-tops', note: 'Made for city steps' },
    { id: 'trail-shoes', icon: '', name: 'Little trail shoes', note: 'Ready for nature paths' },
  ],
  accessories: [
    { id: 'travel-cap', icon: '', name: 'Explorer cap', note: 'A colorful shade-maker' },
    { id: 'crossbody', icon: '', name: 'Adventure bag', note: 'Carries tiny discoveries' },
    { id: 'sun-glasses', icon: '', name: 'Sunshine glasses', note: 'Made for bright arrivals' },
    { id: 'bucket-hat', icon: '', name: 'Patchwork bucket hat', note: 'A playful travel topper' },
    { id: 'mini-camera', icon: '', name: 'Mini travel camera', note: 'For pretend photo stories' },
  ],
  buddies: [
    { id: 'bunny', icon: '🐰', name: 'Pocket Bunny', note: 'Loves window seats' },
    { id: 'robot', icon: '🤖', name: 'Mini Robot', note: 'Excellent map reader' },
    { id: 'camera', icon: '📷', name: 'Kid camera', note: 'Collects tiny memories' },
  ],
};

type PickGroup = keyof typeof wardrobe;
type Picks = Record<PickGroup, string>;

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

const jetterDolls = [
  { id: 'curls', src: '/little-jetter/dress-up-doll.png' },
  { id: 'coils', src: '/little-jetter/dress-up-doll-deep.png' },
  { id: 'freckles', src: '/little-jetter/dress-up-doll-freckles.png' },
];

const characterOptions = {
  style: [{ id: 'girl', label: 'Girl' }, { id: 'boy', label: 'Boy' }],
  skin: [{ id: 'porcelain', color: '#f4c9a8' }, { id: 'peach', color: '#dea47f' }, { id: 'golden', color: '#bd7656' }, { id: 'caramel', color: '#9a5f43' }, { id: 'brown', color: '#70432f' }, { id: 'deep', color: '#4b2c24' }],
  hair: [{ id: 'black', color: '#211a19' }, { id: 'brown', color: '#573629' }, { id: 'auburn', color: '#8e4933' }, { id: 'blonde', color: '#d6a850' }, { id: 'red', color: '#b64932' }, { id: 'blue', color: '#397e9c' }],
  eyes: [{ id: 'brown', color: '#5a3827' }, { id: 'hazel', color: '#8d7440' }, { id: 'green', color: '#4e8060' }, { id: 'blue', color: '#4887aa' }, { id: 'gray', color: '#718088' }],
};

function ClassicDoll({ picks, character }: { picks: Picks; character: { style: string; skin: string; hair: string; eyes: string } }) {
  const skin = characterOptions.skin.find((option) => option.id === character.skin)?.color ?? '#bd7656';
  const hair = characterOptions.hair.find((option) => option.id === character.hair)?.color ?? '#573629';
  const eyes = characterOptions.eyes.find((option) => option.id === character.eyes)?.color ?? '#5a3827';
  const topColors: Record<string,string> = { stripe:'#ee6757', sweater:'#a386ce', dress:'#35a5a0', 'sunset-tee':'#ef944b', 'adventure-shirt':'#4c8ca5' };
  const bottomColors: Record<string,string> = { 'travel-jeans':'#47739b', 'coral-skirt':'#e96f78', 'adventure-shorts':'#62a886', 'wide-leg-pants':'#876da0', 'play-skirt':'#e8aa31' };
  const layerColors: Record<string,string> = { rain:'#f1bd42', denim:'#5585a6', cardigan:'#df8e76', windbreaker:'#39a29a' };
  const shoeColors: Record<string,string> = { sneakers:'#db4f43', boots:'#e8aa31', sandals:'#3d9b91', 'high-tops':'#8765ba', 'trail-shoes':'#55745c' };
  const top = topColors[picks.tops] ?? '#ee6757'; const bottom = bottomColors[picks.bottoms] ?? '#47739b'; const layer = layerColors[picks.layers]; const shoes = shoeColors[picks.shoes] ?? '#db4f43';
  const isSkirt = picks.bottoms === 'coral-skirt' || picks.bottoms === 'play-skirt';
  const isShorts = picks.bottoms === 'adventure-shorts';
  const isDress = picks.tops === 'dress';
  const isSweater = picks.tops === 'sweater' || picks.tops === 'adventure-shirt';
  return <svg className="little-aligned-doll" viewBox="0 0 400 600" role="img" aria-label={`Doll wearing ${wardrobe.tops.find(item=>item.id===picks.tops)?.name}, ${wardrobe.bottoms.find(item=>item.id===picks.bottoms)?.name}, and ${wardrobe.shoes.find(item=>item.id===picks.shoes)?.name}`}>
    <defs><linearGradient id="skinGlow" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".2"/><stop offset="1" stopColor={skin} stopOpacity=".1"/></linearGradient><linearGradient id="topShade" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".24"/><stop offset=".5" stopColor={top}/><stop offset="1" stopColor="#173a47" stopOpacity=".18"/></linearGradient><linearGradient id="layerShade" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff" stopOpacity=".28"/><stop offset=".48" stopColor={layer}/><stop offset="1" stopColor="#173a47" stopOpacity=".2"/></linearGradient><filter id="softShadow"><feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#173a47" floodOpacity=".2"/></filter></defs>
    <ellipse cx="200" cy="564" rx="88" ry="17" fill="#173a47" opacity=".14"/>
    <g data-layer="base"><path d="M162 210q38-22 76 0l25 139-22 126h-82l-22-126z" fill={skin} stroke="#173a47" strokeWidth="5"/><circle cx="200" cy="145" r="62" fill={skin} stroke="#173a47" strokeWidth="5"/><circle cx="200" cy="145" r="56" fill="url(#skinGlow)"/><path d="M168 146q10-8 20 0M212 146q10-8 20 0" fill="none" stroke="#173a47" strokeWidth="3"/><circle cx="178" cy="155" r="6" fill={eyes}/><circle cx="222" cy="155" r="6" fill={eyes}/><circle cx="176" cy="153" r="2" fill="white"/><circle cx="220" cy="153" r="2" fill="white"/><path d="M184 180q16 13 32 0" fill="none" stroke="#9b4d46" strokeWidth="4" strokeLinecap="round"/><circle cx="163" cy="173" r="8" fill="#ef8f80" opacity=".25"/><circle cx="237" cy="173" r="8" fill="#ef8f80" opacity=".25"/></g>
    <g key={`${character.style}-${character.hair}`} data-layer="hair" filter="url(#softShadow)"><path d={character.style==='boy'?'M143 145q2-71 57-71 58 0 57 73-18-38-57-38-38 0-57 36z':'M139 147q-5-81 61-81 68 0 62 84-17-47-62-47-43 0-61 44z'} fill={hair} stroke="#173a47" strokeWidth="5"/>{character.style!=='boy'&&[146,164,182,218,236,254].map((x,index)=><circle key={x} cx={x} cy={index%2?91:108} r="18" fill={hair} stroke="#173a47" strokeWidth="3"/>)}<path d="M156 116q44-39 88 0" fill="none" stroke="white" strokeOpacity=".13" strokeWidth="7" strokeLinecap="round"/></g>
    <g key={picks.bottoms} data-layer="bottom" filter="url(#softShadow)">{isSkirt?<><path d="M153 326h94l25 126q-72 28-144 0z" fill={bottom} stroke="#173a47" strokeWidth="4"/><path d="M174 340l-17 98m69-98 17 98" stroke="white" strokeOpacity=".2" strokeWidth="5"/></>:<><path d={isShorts?'M151 326h98l5 76-46 5-8-48-8 48-46-5z':'M154 326h92l12 142h-45l-13-108-13 108h-45z'} fill={bottom} stroke="#173a47" strokeWidth="4"/><path d="M157 340h86" stroke="white" strokeOpacity=".3" strokeWidth="5"/>{picks.bottoms==='travel-jeans'&&<><path d="M164 355v88M236 355v88" stroke="#d9eef5" strokeOpacity=".35" strokeWidth="4"/><path d="M200 332v32" stroke="#173a47" strokeWidth="3"/></>}</>}</g>
    <g key={picks.tops} data-layer="top" filter="url(#softShadow)"><path d={isDress?'M146 224q54-22 108 0l12 90 36 103q-102 43-204 0l36-103z':'M147 225q53-20 106 0l21 90q-74 39-148 0z'} fill="url(#topShade)" stroke="#173a47" strokeWidth="4"/><path d={isSweater?'M147 231l-45 54 29 22 36-48m86-28 45 54-29 22-36-48':'M147 233l-35 42 25 18 26-39m90-21 35 42-25 18-26-39'} fill={top} stroke="#173a47" strokeWidth="4"/>{picks.tops==='stripe'&&[253,276,299].map(y=><path key={y} d={`M137 ${y}q63 13 126 0`} stroke="#fff8e8" strokeWidth="10"/>)}{picks.tops==='adventure-shirt'&&<><path d="M178 219l22 25 22-25" fill="#fff8e8" stroke="#173a47" strokeWidth="3"/><rect x="217" y="264" width="27" height="24" rx="3" fill="#fff8e8" stroke="#173a47" strokeWidth="3"/></>}{picks.tops==='sweater'&&<path d="M169 244q31 27 62 0M165 278q35 25 70 0" fill="none" stroke="white" strokeOpacity=".25" strokeWidth="5"/>}</g>
    <g key={picks.shoes} data-layer="shoes" filter="url(#softShadow)"><path d={picks.shoes==='boots'?'M134 442h61v65q-47 16-76-2zm71 0h61l15 63q-30 18-76 2z':'M137 463h58v42q-49 18-76-2zm68 0h58l18 40q-28 20-76 2z'} fill={shoes} stroke="#173a47" strokeWidth="5"/><path d="M139 483h48m26 0h48" stroke="white" strokeWidth="5"/>{(picks.shoes==='sneakers'||picks.shoes==='high-tops')&&<><path d="M151 466l25 28m-9-30 19 22m63-20-25 28m9-30-19 22" stroke="white" strokeWidth="4"/></>}</g>
    {layer&&<g key={picks.layers} data-layer="outerwear" filter="url(#softShadow)"><path d="M137 220q28-13 54-13l-13 51-13 112-51-8z" fill="url(#layerShade)" stroke="#173a47" strokeWidth="5"/><path d="M263 220q-28-13-54-13l13 51 13 112 51-8z" fill="url(#layerShade)" stroke="#173a47" strokeWidth="5"/><path d="M191 207l9 38 9-38" fill="#fff8e8" stroke="#173a47" strokeWidth="4"/><path d="M145 327h29m52 0h29" stroke="#fff8e8" strokeOpacity=".7" strokeWidth="5"/><circle cx="181" cy="277" r="5" fill="#173a47"/><circle cx="219" cy="277" r="5" fill="#173a47"/></g>}
    <g key={picks.accessories} data-layer="accessory" filter="url(#softShadow)">{picks.accessories==='sun-glasses'?<><circle cx="178" cy="155" r="22" fill="#90d1dc" fillOpacity=".45" stroke="#173a47" strokeWidth="7"/><circle cx="222" cy="155" r="22" fill="#90d1dc" fillOpacity=".45" stroke="#173a47" strokeWidth="7"/><path d="M200 155h1" stroke="#173a47" strokeWidth="7"/></>:picks.accessories==='crossbody'||picks.accessories==='mini-camera'?<><path d="M255 292l42 15-13 92-58-15z" fill={picks.accessories==='mini-camera'?'#345c68':'#9b6448'} stroke="#173a47" strokeWidth="5"/><path d="M238 294q13-50 45 3" fill="none" stroke="#173a47" strokeWidth="6"/><circle cx="263" cy="343" r="17" fill="#bfe3e6" stroke="#173a47" strokeWidth="5"/></>:<><path d={picks.accessories==='bucket-hat'?'M142 122q58-55 116 0l-9 31h-98z':'M151 109q49-47 98 0l8 43H143z'} fill={picks.accessories==='bucket-hat'?'#39a29a':'#e67b43'} stroke="#173a47" strokeWidth="5"/><path d="M140 145q69-18 126 8" fill="none" stroke="#173a47" strokeWidth="9"/><circle cx="180" cy="111" r="9" fill="#f1bd42"/></>}</g>
  </svg>;
}

export function LittleJetterApp() {
  const [selectedId, setSelectedId] = useState('tokyo');
  const [regionFilter, setRegionFilter] = useState('All regions');
  const [destinationTypeFilter, setDestinationTypeFilter] = useState('All types');
  const [started, setStarted] = useState(false);
  const [gameStep, setGameStep] = useState(1);
  const [picks, setPicks] = useState<Picks>({ tops: 'stripe', bottoms: 'travel-jeans', layers: 'rain', shoes: 'sneakers', accessories: 'travel-cap', buddies: 'bunny' });
  const [dollId, setDollId] = useState('curls');
  const [character, setCharacter] = useState({ style: 'girl', skin: 'golden', hair: 'brown', eyes: 'brown' });
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
  const selected = useMemo(() => destinations.find((item) => item.id === selectedId) ?? destinations[0], [selectedId]);
  const visibleDestinations = destinations.filter((item) => (regionFilter === 'All regions' || item.region === regionFilter) && (destinationTypeFilter === 'All types' || destinationTypes[item.id] === destinationTypeFilter));

  useEffect(() => {
    document.title = 'Little Jetter · The trip starts before you leave';
    document.documentElement.style.colorScheme = 'light';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && destinations.some((item) => item.id === saved)) {
      setSelectedId(saved);
      setStarted(true);
    }
    setSavedProducts(JSON.parse(window.localStorage.getItem('little-jetter-saved-picks') ?? '[]'));
    return () => { document.documentElement.style.colorScheme = ''; };
  }, []);

  function beginTrip() {
    window.localStorage.setItem(STORAGE_KEY, selected.id);
    setStarted(true);
    triggerCelebration([25, 40, 25]);
    window.setTimeout(() => document.getElementById('adventure-studio')?.scrollIntoView({ behavior: 'smooth' }), 30);
  }

  function selectDestination(destination: Destination) {
    setSelectedId(destination.id);
    setStarted(false);
    setGameStep(1);
    setPacked([]);
    setFoundNotices([]);
    setJournalChoice('');
    triggerCelebration([25, 35, 25]);
  }

  function toggleNotice(label: string) {
    setFoundNotices((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label]);
    triggerCelebration(14);
  }

  function choose(group: PickGroup, id: string) {
    setPicks((current) => ({ ...current, [group]: id }));
    triggerCelebration(18);
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
    setPicks((current) => ({ ...current, tops: random(wardrobe.tops).id, bottoms: random(wardrobe.bottoms).id, layers: random(wardrobe.layers).id, shoes: random(wardrobe.shoes).id, accessories: random(wardrobe.accessories).id }));
    triggerCelebration([30, 40, 30, 40, 60]);
  }

  const chosen = (group: PickGroup) => wardrobe[group].find((item) => item.id === picks[group])!;
  const readyToStamp = packed.length >= 4;
  const ltkCollectionUrl = import.meta.env.VITE_LTK_COLLECTION_URL as string | undefined;
  const matchedRealLook = realProductCatalog.filter((product) => [picks.tops, picks.layers, picks.shoes].includes(product.playItemId));
  const realLook = (matchedRealLook.length ? matchedRealLook : realProductCatalog).slice(0, 6);
  const shopDrawers = [
    { id: 'clothing', number: '01', name: 'Clothes for the journey', note: 'Soft layers and easy travel outfits' },
    { id: 'shoes', number: '02', name: 'Exploring shoes', note: 'Pairs made for busy travel days' },
    { id: 'luggage', number: '03', name: 'Bags & little suitcases', note: 'Everything gets its own place' },
    { id: 'toy', number: '04', name: 'Toys for the trip', note: 'Small companions and quiet play' },
    { id: 'accessory', number: '05', name: 'Little essentials', note: 'Pouches, pillows and getting-ready helpers' },
  ];

  return (
    <div className={`little-jetter-shell ${travelMode ? 'is-travel-mode' : ''}`}>
      <div className="little-confetti" key={celebration} aria-hidden="true">{celebration > 0 && Array.from({length:18},(_,index) => <i key={index} style={{'--i':index} as React.CSSProperties}>✦</i>)}</div>
      <a className="little-skip" href="#little-main">Skip to the adventure</a>
      <header className="little-header">
        <a className="little-wordmark" href="/" aria-label="Little Jetter home">
          <span className="little-star" aria-hidden="true">✦</span>
          <span>Little Jetter</span>
        </a>
        <div className="little-passport-pill" aria-label="Passport progress">
          <span aria-hidden="true">◎</span> My passport <strong>{started ? '1' : '0'}/{destinations.length}</strong>
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
          <div className="little-route" aria-label="Your adventure has three parts">
            {['Destination', 'Style', 'Explore'].map((step, index) => (
              <div className={index === 0 ? 'is-current' : ''} key={step}>
                <span>{index + 1}</span>{step}
              </div>
            ))}
          </div>
          {travelMode && <div className="little-travel-sky" aria-hidden="true"><span className="little-flying-plane">✈</span><span className="little-moving-train">🚆</span><span className="little-cloud cloud-one">☁</span><span className="little-cloud cloud-two">☁</span></div>}
        </section>

        {travelMode && <section className="little-travel-console" aria-label="Travel mode">
          <div className="little-compass"><span>N</span><span>E</span><span>S</span><span>W</span><i>➤</i><strong>Explore!</strong></div>
          <div className="little-departure-board"><p className="little-kicker">Now boarding</p><h2>{selected.city} adventure</h2><div><span>✈ Fly</span><span>🚆 Ride</span><span>🧭 Explore</span></div><small>{destinationTypes[selected.id]} · {selected.region} · {selected.country}</small></div>
          <div className="little-route-adventure"><span>01</span><strong>Destination</strong><i>→</i><span>02</span><strong>Style</strong><i>→</i><span>03</span><strong>Explore</strong></div>
        </section>}

        <section className="little-chooser" aria-labelledby="choose-title">
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
                      <span className="little-destination-number">{String(index + 1).padStart(3, '0')}</span><span className="little-destination-icon little-destination-art" aria-hidden="true" /><span className="little-destination-city">{destination.city}</span><span className="little-destination-country">{destination.area}</span><span className="little-destination-note">{destinationTypes[destination.id]} · {destination.note}</span><span className="little-stamp-edge" aria-hidden="true" />
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

        <section className="little-shop" aria-labelledby="shop-title">
          <div className="little-shop-heading">
            <div><p className="little-kicker">Real picks, just for looking</p><h2 id="shop-title">The Jetter Shop</h2></div>
            <p>Window-shop the travel pieces saved in our LTK closet. Kids can heart favorites—prices, carts, and checkout stay out of the game.</p>
          </div>
          <div className="little-section-art little-shop-art" aria-hidden="true"><img src="/little-jetter/wardrobe-drawers.png" alt="" /><span>Open the wardrobe</span></div>
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
                  {products.length ? products.map((product) => <article key={product.id}>
                    <div><img src={product.imageUrl} alt={product.name} loading="lazy" /><span>LTK pick</span></div>
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

        {showMoreChoices && <div className="little-choice-modal" role="dialog" aria-modal="true" aria-labelledby="choice-title">
          <div><button type="button" className="little-modal-close" aria-label="Close more choices" onClick={() => setShowMoreChoices(false)}>×</button><p className="little-kicker">The parent closet · {realProductCatalog.length} finds</p><h2 id="choice-title">Real pieces for later</h2><p>A grown-up can save products inspired by the child’s finished game look.</p><div className="little-popup-products">{realProductCatalog.map((product,index) => <button type="button" style={{'--delay':`${Math.min(index * 45, 540)}ms`} as React.CSSProperties} aria-pressed={savedProducts.includes(product.id)} onClick={() => toggleSavedProduct(product.id)} key={product.id}><img src={product.imageUrl} alt="" /><span><small>{product.brand}</small><strong>{product.name}</strong></span><b>{savedProducts.includes(product.id) ? 'Saved' : 'Save'}</b></button>)}</div><button type="button" className="little-done-choosing" onClick={() => setShowMoreChoices(false)}>Done choosing</button></div>
        </div>}

        {started && (
          <section id="adventure-studio" className="little-studio" aria-labelledby="studio-title">
            <div className="little-studio-heading">
              <div>
                <p className="little-kicker">Today in {selected.city}</p>
                <h2 id="studio-title">Dress for the adventure</h2>
                <p>{selected.adventure}</p>
              </div>
              <div className="little-day-card"><span className="little-day-art" aria-hidden="true" /><small>Adventure forecast</small><strong>{selected.weather}</strong></div>
            </div>

            <nav className="little-game-steps" aria-label="Adventure progress">
              <button type="button" className="is-done" onClick={() => { document.querySelector('.little-chooser')?.scrollIntoView({ behavior: 'smooth' }); playHaptic(12); }}><span>1</span>Destination</button>
              <button type="button" className={gameStep === 1 ? 'is-active' : 'is-done'} onClick={() => { setGameStep(1); playHaptic(12); }}><span>2</span>Style</button>
              <button type="button" className={gameStep > 1 ? 'is-active' : ''} onClick={() => { setGameStep(2); playHaptic(12); }}><span>3</span>Explore</button>
            </nav>

            {gameStep === 2 && (
              <div className="little-explore-panel little-game-panel">
                <div className="little-section-art little-explore-art" aria-hidden="true"><img src="/little-jetter/explore-postcard.png" alt="" /><span>My travel journal · {selected.city}</span></div>
                <div className="little-journal-progress"><div><small>Journal mission</small><strong>{foundNotices.length}/4 discoveries collected</strong></div><span><i style={{ width: `${foundNotices.length * 25}%` }} /></span></div>
                <details className="little-task-drawer" open><summary><span>01</span><strong>Today’s journal page</strong><b>Open / close</b></summary><div className="little-postcard little-journal-page" style={{ backgroundColor: selected.color }}><span className="little-postcard-mark" aria-hidden="true" /><small>{destinationTypes[selected.id]} · {selected.country}</small><strong>Dear travel journal...</strong><p>{selected.adventure}</p><em>{selected.passportPhrase}</em></div></details>
                <details className="little-task-drawer" open><summary><span>02</span><strong>Tap what you discover</strong><b>Open / close</b></summary><div className="little-notice-grid">
                  {selected.notices.map((item, index) => <button type="button" aria-pressed={foundNotices.includes(item.label)} onClick={() => toggleNotice(item.label)} key={item.label}><span className={`little-notice-art notice-${index + 1}`} aria-hidden="true" /><b>{foundNotices.includes(item.label) ? 'Found' : `Clue ${index + 1}`}</b>{item.label}</button>)}
                </div></details>
                <details className="little-task-drawer" open><summary><span>03</span><strong>Finish the memory</strong><b>Open / close</b></summary><div className="little-journal-prompts"><p>The best part of this adventure would be...</p>{['Something I spotted', 'Something I tasted', 'Something I learned', 'Someone I met'].map((choice) => <button type="button" aria-pressed={journalChoice === choice} onClick={() => { setJournalChoice(choice); triggerCelebration(18); }} key={choice}>{choice}</button>)}{journalChoice && <strong>Saved to your {selected.city} journal.</strong>}</div></details>
                <details className="little-task-drawer"><summary><span>04</span><strong>Real-life look for a parent</strong><b>Open / close</b></summary><div className="little-buddy-grid little-real-buddies">{realLook.map((product) => <button type="button" aria-pressed={savedProducts.includes(product.id)} onClick={() => toggleSavedProduct(product.id)} key={product.id}><img src={product.imageUrl} alt="" /><strong>{product.name}</strong><small>{savedProducts.includes(product.id) ? 'Saved for a parent' : `Inspired by ${chosen('tops').name}`}</small></button>)}</div></details>
                <button type="button" className="little-next" onClick={() => setGameStep(3)}>Choose a travel buddy <span>→</span></button>
              </div>
            )}

            {gameStep === 1 && (
              <div className="little-dress-layout little-game-panel">
                <aside className="little-look-preview">
                  <div className="little-closet-heading"><p className="little-kicker">Virtual closet</p><strong>Tap it. Wear it.</strong></div>
                  <div className="little-character-drawers" aria-label="Build your doll">
                    <details open><summary><span>01</span><strong>Style</strong><b>Open / close</b></summary><div className="little-character-options little-style-options">{characterOptions.style.map((option) => <button type="button" aria-pressed={character.style === option.id} onClick={() => { setCharacter((current) => ({ ...current, style: option.id })); triggerCelebration(12); }} key={option.id}>{option.label}</button>)}</div></details>
                    <details><summary><span>02</span><strong>Skin</strong><b>Open / close</b></summary><div className="little-character-options little-swatch-options">{characterOptions.skin.map((option, index) => <button type="button" aria-label={`${option.id} skin`} aria-pressed={character.skin === option.id} style={{ '--choice-color': option.color } as React.CSSProperties} onClick={() => { setCharacter((current) => ({ ...current, skin: option.id })); setDollId(index < 2 ? 'freckles' : index < 4 ? 'curls' : 'coils'); triggerCelebration(12); }} key={option.id} />)}</div></details>
                    <details><summary><span>03</span><strong>Hair color</strong><b>Open / close</b></summary><div className="little-character-options little-swatch-options">{characterOptions.hair.map((option) => <button type="button" aria-label={`${option.id} hair`} aria-pressed={character.hair === option.id} style={{ '--choice-color': option.color } as React.CSSProperties} onClick={() => { setCharacter((current) => ({ ...current, hair: option.id })); triggerCelebration(12); }} key={option.id} />)}</div></details>
                    <details><summary><span>04</span><strong>Eyes</strong><b>Open / close</b></summary><div className="little-character-options little-swatch-options">{characterOptions.eyes.map((option) => <button type="button" aria-label={`${option.id} eyes`} aria-pressed={character.eyes === option.id} style={{ '--choice-color': option.color } as React.CSSProperties} onClick={() => { setCharacter((current) => ({ ...current, eyes: option.id })); triggerCelebration(12); }} key={option.id} />)}</div></details>
                  </div>
                  <div className={`little-avatar little-doll-stage character-${character.style}`} style={{ '--eye-color': characterOptions.eyes.find((option) => option.id === character.eyes)?.color, '--hair-color': characterOptions.hair.find((option) => option.id === character.hair)?.color } as React.CSSProperties} aria-label={`Outfit: ${chosen('tops').name}, ${chosen('bottoms').name}, ${chosen('layers').name}, ${chosen('shoes').name}, and ${chosen('accessories').name}`}>
                    <ClassicDoll picks={picks} character={character} />
                    <div className="little-dressed-confirmation" aria-live="polite">Now wearing {chosen('tops').name}</div>
                  </div>
                  <h3>{selected.city} explorer</h3>
                  <p>{(selected.needsLayer && picks.layers === 'none') || (!selected.sandalsFriendly && picks.shoes === 'sandals') ? 'That’s a fun look. Check the forecast and consider a comfy backup.' : 'This look makes sense for your adventure—and it still feels like you.'}</p>
                </aside>
                <div className="little-closet">
                  <div className="little-closet-intro"><span>01</span><div><small>Start at the doll</small><strong>Build the look one drawer at a time.</strong></div></div>
                  <div className="little-surprise-bar"><div><small>Need a little magic?</small><strong>Let Little Jetter make a surprise look.</strong></div><button type="button" onClick={surpriseMe}>Surprise me</button></div>
                  {(['tops', 'bottoms', 'layers', 'shoes', 'accessories'] as PickGroup[]).map((group, index) => (
                    <details className="little-task-drawer" open={index === 0} key={group}>
                      <summary><span>{String(index + 1).padStart(2, '0')}</span><strong>{group === 'tops' ? 'Pick the main piece' : group === 'bottoms' ? 'Choose a bottom' : group === 'layers' ? 'Add a layer' : group === 'shoes' ? 'Choose exploring shoes' : 'Finish with an accessory'}</strong><b>Open / close</b></summary>
                      <div className="little-item-row">
                        {wardrobe[group].map((item) => <button type="button" aria-pressed={picks[group] === item.id} onClick={() => choose(group, item.id)} key={item.id}><span className="little-game-item" style={gameItemStyle(group, item.id)} aria-hidden="true" /><strong>{item.name}</strong><small>{item.note}</small></button>)}
                      </div>
                    </details>
                  ))}
                  <details className="little-task-drawer"><summary><span>06</span><strong>Parent product matches</strong><b>Open / close</b></summary><div className="little-real-look">
                    <div><small>Your Little Jetter picks</small><strong>Real pieces inspired by this look</strong></div>
                    <div>{realLook.length ? realLook.map((product) => <button type="button" key={product.id} aria-pressed={savedProducts.includes(product.id)} onClick={() => toggleSavedProduct(product.id)}><img src={product.imageUrl} alt="" /><span>{product.name}</span><b>{savedProducts.includes(product.id) ? 'Saved' : 'Save'}</b></button>) : <p>Choose another piece to discover a real-life match.</p>}</div>
                    <small>Kids save the look. A parent decides whether to shop it.</small>
                  </div></details>
                  <button type="button" className="little-next" onClick={() => setGameStep(2)}>Explore my travel journal <span>→</span></button>
                </div>
              </div>
            )}

            {gameStep === 3 && (
              <div className="little-buddy-panel little-game-panel">
                <div className="little-section-art little-buddy-art" aria-hidden="true"><img src="/little-jetter/packing-buddies.png" alt="" /><span>Pick a tiny copilot</span></div>
                <div><p className="little-kicker">Toys can travel too</p><h3>Who gets the window seat?</h3><p>Pick one small buddy to bring along. A good traveler makes room for what matters.</p></div>
                <details className="little-task-drawer" open><summary><span>01</span><strong>Choose a travel buddy</strong><b>Open / close</b></summary><div className="little-buddy-grid">{wardrobe.buddies.map((item) => <button type="button" aria-pressed={picks.buddies === item.id} onClick={() => choose('buddies', item.id)} key={item.id}><span className="little-game-item" style={gameItemStyle('buddies', item.id)} aria-hidden="true" /><strong>{item.name}</strong><small>{item.note}</small></button>)}</div></details>
                <details className="little-task-drawer"><summary><span>02</span><strong>Parent toy preview</strong><b>Open / close</b></summary><div className="little-buddy-grid little-real-buddies">{realProductCatalog.filter((product) => product.category === 'toy').map((product) => <button type="button" aria-pressed={savedProducts.includes(product.id)} onClick={() => toggleSavedProduct(product.id)} key={product.id}><img src={product.imageUrl} alt="" /><strong>{product.name}</strong><small>{savedProducts.includes(product.id) ? 'Saved for a parent' : 'Save this real pick'}</small></button>)}</div></details>
                <button type="button" className="little-next" onClick={() => setGameStep(4)}>Pack my suitcase <span>→</span></button>
              </div>
            )}

            {gameStep === 4 && (
              <div className="little-pack-layout little-game-panel">
                <div className="little-section-art little-pack-art" aria-hidden="true"><img src="/little-jetter/packing-buddies.png" alt="" /><span>Ready, set, pack!</span></div>
                <details className="little-task-drawer" open><summary><span>01</span><strong>Your suitcase</strong><b>Open / close</b></summary><div className="little-suitcase"><p>Packed <strong>{packed.length}/6</strong></p><div>{packed.map((id) => { const group = (Object.keys(wardrobe) as PickGroup[]).find((key) => wardrobe[key].some((entry) => entry.id === id)); const item = group ? wardrobe[group].find((entry) => entry.id === id) : undefined; return item && group ? <span className="little-packed-art" style={gameItemStyle(group, item.id)} key={id} title={item.name} /> : <span className="little-packed-essential" key={id}>{id === 'book' ? 'BOOK' : 'KIT'}</span>; })}</div><small>{packed.length < 4 ? 'Choose at least four things for the adventure.' : 'Everything fits. Nicely packed!'}</small></div></details>
                <details className="little-task-drawer" open><summary><span>02</span><strong>Pack each piece</strong><b>Open / close</b></summary><div className="little-pack-list">
                  {([chosen('tops'), chosen('bottoms'), chosen('layers'), chosen('shoes'), chosen('accessories'), chosen('buddies'), { id:'toothbrush',icon:'',name:'Travel kit',note:'A getting-ready essential' }, { id:'book',icon:'',name:'Travel book',note:'For quiet moments' }] as Array<{id:string;name:string;note:string}>).map((item) => { const group = (Object.keys(wardrobe) as PickGroup[]).find((key) => wardrobe[key].some((entry) => entry.id === item.id)); return <button type="button" aria-pressed={packed.includes(item.id)} onClick={() => togglePacked(item.id)} key={item.id}><span className={group ? 'little-pack-art' : 'little-pack-essential'} style={group ? gameItemStyle(group, item.id) : undefined}>{group ? '' : item.id === 'book' ? 'BOOK' : 'KIT'}</span><div><strong>{item.name}</strong><small>{item.note}</small></div><b>{packed.includes(item.id) ? 'Packed' : 'Add'}</b></button>; })}
                  <button type="button" className="little-next" disabled={!readyToStamp} onClick={() => { setGameStep(5); triggerCelebration([35,30,35,30,80]); }}>Stamp my passport <span>→</span></button>
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
