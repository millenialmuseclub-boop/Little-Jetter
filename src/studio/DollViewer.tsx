import type { CSSProperties } from 'react';
import { useTravel } from './TravelContext';
import type { Category, WardrobeItem } from './types';

const layerOrder: Record<Category, number> = { bottom: 30, top: 40, shoes: 50, outerwear: 60, accessory: 70 };

function WearableShapes({ item }: { item: WardrobeItem }) {
  const c = item.color;
  if (item.category === 'bottom') return <g><path d="M154 332 L246 332 L258 468 L213 468 L200 365 L187 468 L142 468 Z" fill={c} stroke="#173a47" strokeWidth="4"/><path d="M154 343h92" stroke="#fff" strokeOpacity=".45" strokeWidth="5"/></g>;
  if (item.category === 'top') return <g><path d="M147 225 Q200 205 253 225 L274 315 Q245 337 200 337 Q155 337 126 315 Z" fill={c} stroke="#173a47" strokeWidth="4"/><path d="M147 233 L112 275 L137 293 L163 254M253 233l35 42-25 18-26-39" fill={c} stroke="#173a47" strokeWidth="4"/>{item.id.includes('stripe') && [252,272,292,312].map((y)=><path key={y} d={`M137 ${y} Q200 ${y+13} 263 ${y}`} stroke="#fff8e8" strokeWidth="10"/> )}</g>;
  if (item.category === 'outerwear') return <g><path d="M137 220 Q200 197 263 220 L286 362 L240 377 L225 260 L217 365 L183 365 L175 260 L160 377 L114 362 Z" fill={c} fillOpacity=".93" stroke="#173a47" strokeWidth="5"/><path d="M200 216v150" stroke="#fff8e8" strokeWidth="5"/><circle cx="200" cy="275" r="5" fill="#173a47"/><circle cx="200" cy="310" r="5" fill="#173a47"/></g>;
  if (item.category === 'shoes') return <g><path d="M137 463h58v42q-49 18-76-2zM205 463h58l18 40q-28 20-76 2z" fill={c} stroke="#173a47" strokeWidth="5"/><path d="M139 480h49M212 480h49" stroke="#fff" strokeWidth="5"/></g>;
  return item.id.includes('glasses') ? <g fill="none" stroke={c} strokeWidth="8"><circle cx="178" cy="154" r="22"/><circle cx="222" cy="154" r="22"/><path d="M200 154h1"/></g> : item.id.includes('bag') ? <g><path d="M255 292l42 15-13 92-58-15z" fill={c} stroke="#173a47" strokeWidth="5"/><path d="M238 294q13-50 45 3" fill="none" stroke="#173a47" strokeWidth="6"/></g> : <g><path d="M151 109q49-47 98 0l8 43H143z" fill={c} stroke="#173a47" strokeWidth="5"/><path d="M145 145q69-18 121 8" fill="none" stroke="#173a47" strokeWidth="9"/></g>;
}

export function DollViewer({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  const { equippedOutfit, wardrobeItems } = useTravel();
  const equipped = Object.values(equippedOutfit).map((id) => wardrobeItems.find((item) => item.id === id)).filter(Boolean) as WardrobeItem[];
  return <div className={`studio-doll ${compact ? 'is-compact' : ''} ${className}`} aria-label="Your dressed Little Jetter">
    <svg viewBox="0 0 400 600" role="img" aria-label={`Doll wearing ${equipped.map((item) => item.name).join(', ')}`}>
      <g style={{ zIndex: 10 } as CSSProperties}><ellipse cx="200" cy="565" rx="90" ry="18" fill="#173a47" opacity=".14"/><path d="M162 210q38-22 76 0l25 139-22 126h-82l-22-126z" fill="#bd7656" stroke="#173a47" strokeWidth="5"/><circle cx="200" cy="145" r="62" fill="#bd7656" stroke="#173a47" strokeWidth="5"/><path d="M168 152q12 8 24 0M208 152q12 8 24 0" stroke="#173a47" strokeWidth="5" strokeLinecap="round"/><path d="M184 178q16 13 32 0" fill="none" stroke="#9b4d46" strokeWidth="4" strokeLinecap="round"/></g>
      <g style={{ zIndex: 20 } as CSSProperties}><path d="M139 147q-5-81 61-81 68 0 62 84-17-47-62-47-43 0-61 44z" fill="#3d2924" stroke="#173a47" strokeWidth="5"/><circle cx="145" cy="109" r="23" fill="#3d2924"/><circle cx="255" cy="109" r="23" fill="#3d2924"/></g>
      {equipped.sort((a,b)=>a.layerIndex-b.layerIndex).map((item) => <g key={item.id} data-layer={item.category} style={{ zIndex: layerOrder[item.category] } as CSSProperties}><WearableShapes item={item}/></g>)}
    </svg>
  </div>;
}

export function ItemThumbnail({ item }: { item: WardrobeItem }) {
  return <svg className="studio-item-thumb" viewBox="0 0 400 600" aria-hidden="true"><WearableShapes item={item}/></svg>;
}
