/**
 * Aspect calculation module
 * Calculates planetary aspects and their properties
 */

import { ASPECT_TYPES, ASPECT_COLORS } from '../data/aspects.js';
import { PLANET_LIST, PLANET_NAMES, PLANET_SYMBOLS } from '../data/planets.js';

/**
 * Calculate aspects between all planets
 * @param {Object} planetLongs - Object with planet keys and their longitudes
 * @returns {Array} Array of aspect objects
 */
export function calculateAspects(planetLongs) {
  const aspects = [];
  const planetKeys = Object.keys(planetLongs);
  
  for (let i = 0; i < planetKeys.length; i++) {
    for (let j = i + 1; j < planetKeys.length; j++) {
      const p1 = planetKeys[i];
      const p2 = planetKeys[j];
      const long1 = planetLongs[p1];
      const long2 = planetLongs[p2];
      
      // Calculate angular difference (0-180)
      let diff = Math.abs(long1 - long2);
      if (diff > 180) diff = 360 - diff;
      
      // Check each aspect type
      for (const [type, config] of Object.entries(ASPECT_TYPES)) {
        const orb = Math.abs(diff - config.angle);
        if (orb <= config.orb) {
          const exactness = 1 - (orb / config.orb); // 1 = exact, 0 = at orb limit
          
          aspects.push({
            type,
            planet1: p1,
            planet2: p2,
            aspect: config.name,
            symbol: config.symbol,
            angle: config.angle,
            orb: orb.toFixed(1),
            color: config.color,
            exact: orb < 1,
            exactness
          });
          break; // Only one aspect per planet pair
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Calculate aspects specifically for chart drawing
 * Returns aspect objects with position info for SVG rendering
 * @param {Object} planets - Planet data from chart
 * @returns {Array}
 */
export function calculateChartAspects(planets) {
  const longitudes = {};
  
  PLANET_LIST.forEach(key => {
    if (planets[key]) {
      const p = planets[key];
      longitudes[key] = p.longitude || (p.signIdx * 30 + p.deg + p.min / 60);
    }
  });
  
  return calculateAspects(longitudes);
}

/**
 * Filter aspects by type
 * @param {Array} aspects
 * @param {Object} filters - {conjunction: true, opposition: true, etc.}
 * @returns {Array}
 */
export function filterAspects(aspects, filters) {
  return aspects.filter(a => filters[a.type] !== false);
}

/**
 * Get aspect summary for display
 * @param {Array} aspects
 * @returns {Object} Counts by type
 */
export function getAspectSummary(aspects) {
  const summary = {};
  
  for (const [type] of Object.entries(ASPECT_TYPES)) {
    summary[type] = aspects.filter(a => a.type === type).length;
  }
  
  return summary;
}

export { ASPECT_TYPES, ASPECT_COLORS };
