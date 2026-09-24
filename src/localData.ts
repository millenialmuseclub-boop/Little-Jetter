/** Storage can be unavailable (private mode, quota, corrupt backups). Play still works. */
export function readLocal<T>(key: string, fallback: T, valid: (value: unknown) => boolean = () => true): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const value: unknown = JSON.parse(raw);
    return valid(value) ? value as T : fallback;
  } catch { return fallback; }
}

export function writeLocal(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export const PLAY_KEY = 'little-jetter-play-v1';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function stringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

export function isSavedLook(value: unknown): boolean {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string'
    && isRecord(value.character) && ['style', 'skin', 'hair', 'eyes'].every(key => typeof (value.character as Record<string, unknown>)[key] === 'string')
    && isRecord(value.picks) && ['tops', 'bottoms', 'layers', 'shoes', 'accessories', 'buddies'].every(key => typeof (value.picks as Record<string, unknown>)[key] === 'string')
    && isRecord(value.colors) && Object.values(value.colors).every(color => typeof color === 'string')
    && (value.scales === undefined || isRecord(value.scales) && Object.values(value.scales).every(n => typeof n === 'number' && Number.isFinite(n) && n >= .6 && n <= 1.6))
    && (value.rotations === undefined || isRecord(value.rotations) && Object.values(value.rotations).every(n => typeof n === 'number' && Number.isFinite(n)))
    && (value.offsets === undefined || isRecord(value.offsets) && Object.values(value.offsets).every(offset => isRecord(offset) && typeof offset.x === 'number' && Number.isFinite(offset.x) && typeof offset.y === 'number' && Number.isFinite(offset.y)));
}
