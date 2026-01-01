/**
 * Aspect configuration for astrological charts
 */

export const ASPECT_TYPES = {
  conjunction: {
    name: 'Kavuşum',
    angle: 0,
    orb: 8,
    symbol: '☌',
    color: '#FFD700'
  },
  opposition: {
    name: 'Karşıt',
    angle: 180,
    orb: 8,
    symbol: '☍',
    color: '#3B82F6'
  },
  trine: {
    name: 'Üçgen',
    angle: 120,
    orb: 8,
    symbol: '△',
    color: '#22C55E'
  },
  square: {
    name: 'Kare',
    angle: 90,
    orb: 7,
    symbol: '□',
    color: '#EF4444'
  },
  sextile: {
    name: 'Altmışlık',
    angle: 60,
    orb: 6,
    symbol: '⚹',
    color: '#38BDF8'
  },
  quincunx: {
    name: 'Yüzellilik',
    angle: 150,
    orb: 3,
    symbol: '⚻',
    color: '#A855F7'
  }
};

// Legacy color mapping for compatibility
export const ASPECT_COLORS = {
  conjunction: '#FFD700',
  opposition: '#3B82F6',
  trine: '#22C55E',
  square: '#EF4444',
  sextile: '#38BDF8',
  quincunx: '#A855F7'
};

/**
 * Check if two planets form an aspect
 * @param {number} long1 - Longitude of first planet
 * @param {number} long2 - Longitude of second planet
 * @returns {Object|null} Aspect info or null if no aspect
 */
export function findAspect(long1, long2) {
  let diff = Math.abs(long1 - long2);
  if (diff > 180) diff = 360 - diff;
  
  for (const [type, config] of Object.entries(ASPECT_TYPES)) {
    const exactness = 1 - Math.abs(diff - config.angle) / config.orb;
    if (exactness > 0) {
      return {
        type,
        ...config,
        exactDiff: diff,
        exactness
      };
    }
  }
  return null;
}
