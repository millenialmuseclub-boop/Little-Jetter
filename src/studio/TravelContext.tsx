import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import destinationsData from '../data/destinations.json';
import wardrobeData from '../data/wardrobeItems.json';
import type { Category, Destination, Outfit, StudioRoute, WardrobeItem } from './types';

const destinations = destinationsData as Destination[];
const wardrobeItems = wardrobeData as WardrobeItem[];
const categories: Category[] = ['top', 'bottom', 'outerwear', 'shoes', 'accessory'];
const defaultOutfit = Object.fromEntries(categories.map((category) => [category, wardrobeItems.find((item) => item.category === category)?.id ?? ''])) as Outfit;
const STORAGE_KEY = 'little-jetter-studio-v1';

interface SavedTravelState { selectedDestinationId: string; equippedOutfit: Outfit; collectedStickers: Record<string,string[]>; passportStamps: string[] }
interface TravelContextValue extends SavedTravelState {
  destinations: Destination[]; wardrobeItems: WardrobeItem[]; destination: Destination; route: StudioRoute;
  setDestination(id: string): void; equip(category: Category, id: string): void; collect(stickerId: string): void;
  stampDestination(): void; navigate(route: StudioRoute): void; surprise(): void;
}
const TravelContext = createContext<TravelContextValue | null>(null);

function loadState(): SavedTravelState {
  try { return { selectedDestinationId: 'tokyo', equippedOutfit: defaultOutfit, collectedStickers: {}, passportStamps: [], ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }; }
  catch { return { selectedDestinationId: 'tokyo', equippedOutfit: defaultOutfit, collectedStickers: {}, passportStamps: [] }; }
}
function routeFromPath(): StudioRoute {
  const part = location.pathname.split('/').filter(Boolean).at(-1);
  return part === 'explore' || part === 'journal' || part === 'shop' ? part : 'style';
}

export function TravelProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedTravelState>(loadState);
  const [route, setRoute] = useState<StudioRoute>(routeFromPath);
  const destination = destinations.find((item) => item.id === saved.selectedDestinationId) ?? destinations[0];
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)), [saved]);
  useEffect(() => { const onPop = () => setRoute(routeFromPath()); addEventListener('popstate', onPop); return () => removeEventListener('popstate', onPop); }, []);
  const navigate = (next: StudioRoute) => { history.pushState({}, '', `/${next}`); setRoute(next); scrollTo({ top: 0, behavior: 'smooth' }); };
  const setDestination = (id: string) => setSaved((current) => ({ ...current, selectedDestinationId: id }));
  const equip = (category: Category, id: string) => setSaved((current) => ({ ...current, equippedOutfit: { ...current.equippedOutfit, [category]: id } }));
  const collect = (stickerId: string) => setSaved((current) => { const currentIds = current.collectedStickers[destination.id] ?? []; return currentIds.includes(stickerId) ? current : { ...current, collectedStickers: { ...current.collectedStickers, [destination.id]: [...currentIds, stickerId] } }; });
  const stampDestination = () => setSaved((current) => current.passportStamps.includes(destination.id) ? current : { ...current, passportStamps: [...current.passportStamps, destination.id] });
  const surprise = () => setSaved((current) => ({ ...current, equippedOutfit: Object.fromEntries(categories.map((category) => { const choices = wardrobeItems.filter((item) => item.category === category && (item.destinationTags.includes('all') || item.destinationTags.includes(destination.id)) && (item.weatherTag === 'any' || item.weatherTag === destination.weather)); return [category, choices[Math.floor(Math.random() * choices.length)]?.id ?? current.equippedOutfit[category]]; })) as Outfit }));
  const value = useMemo(() => ({ ...saved, destinations, wardrobeItems, destination, route, setDestination, equip, collect, stampDestination, navigate, surprise }), [saved, destination, route]);
  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}
export function useTravel() { const value = useContext(TravelContext); if (!value) throw new Error('useTravel must be used inside TravelProvider'); return value; }
