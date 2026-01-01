/**
 * Planet data: symbols, names, colors, and display properties
 */

export const PLANET_LIST = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 
  'jupiter', 'saturn', 'uranus', 'neptune', 'pluto',
  'chiron', 'north', 'south', 'fortune'
];

export const PLANET_SYMBOLS = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
  chiron: '⚷',
  north: '☊',
  south: '☋',
  fortune: '⊕'
};

export const PLANET_NAMES = {
  sun: 'Güneş',
  moon: 'Ay',
  mercury: 'Merkür',
  venus: 'Venüs',
  mars: 'Mars',
  jupiter: 'Jüpiter',
  saturn: 'Satürn',
  uranus: 'Uranüs',
  neptune: 'Neptün',
  pluto: 'Plüton',
  chiron: 'Chiron',
  north: 'KAD',
  south: 'GAD',
  fortune: 'Şans'
};

export const PLANET_COLORS = {
  sun: '#F59E0B',
  moon: '#E2E8F0',
  mercury: '#A78BFA',
  venus: '#EC4899',
  mars: '#EF4444',
  jupiter: '#3B82F6',
  saturn: '#6B7280',
  uranus: '#06B6D4',
  neptune: '#8B5CF6',
  pluto: '#78716C',
  chiron: '#10B981',
  north: '#6EE7FF',
  south: '#FF6EE7',
  fortune: '#22C55E'
};

// Swiss Ephemeris planet IDs
export const SE_PLANETS = {
  sun: 0,
  moon: 1,
  mercury: 2,
  venus: 3,
  mars: 4,
  jupiter: 5,
  saturn: 6,
  uranus: 7,
  neptune: 8,
  pluto: 9
};

/**
 * Get planet info by key
 */
export function getPlanetInfo(key) {
  return {
    key,
    symbol: PLANET_SYMBOLS[key] || '?',
    name: PLANET_NAMES[key] || key,
    color: PLANET_COLORS[key] || '#888'
  };
}
