/**
 * Chart Calculator Module
 * Uses Swiss Ephemeris WASM for accurate planetary calculations
 */

import { degToSignDegMin } from '../utils/date-utils.js';
import { SIGNS } from '../data/zodiac.js';

// Swiss Ephemeris state
let swissEph = null;
let isReady = false;

/**
 * Initialize Swiss Ephemeris
 * Must be called once at startup
 */
export async function initSwissEphemeris() {
  if (isReady) return true;
  
  try {
    // Import the ephemeris module
    const ephemeris = await import('/ephemeris.js');
    
    // Initialize
    await ephemeris.initEphemeris();
    swissEph = ephemeris;
    isReady = true;
    
    console.log('✅ Swiss Ephemeris WASM initialized');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Swiss Ephemeris:', error);
    return false;
  }
}

/**
 * Check if Swiss Ephemeris is ready
 */
export function isSwissEphReady() {
  // Check window-based ephemeris (from script tag)
  if (typeof window !== 'undefined' && window.SwissEphemeris && window.SwissEphemeris.isReady?.()) {
    return true;
  }
  // Check module-based ephemeris
  return isReady && swissEph !== null;
}

/**
 * Get Turkey timezone offset with historical DST rules
 */
export function getTurkeyOffset(year, month, day) {
  // Use window.SwissEphemeris if available
  if (typeof window !== 'undefined' && window.SwissEphemeris?.getTurkeyOffset) {
    return window.SwissEphemeris.getTurkeyOffset(year, month, day);
  }
  
  // After September 2016, Turkey is permanently UTC+3
  if (year > 2016 || (year === 2016 && month >= 9)) {
    return 3;
  }
  
  // 1978-1982: No DST, stayed at UTC+3
  if (year >= 1978 && year <= 1982) {
    return 3;
  }
  
  // Before 1970, assume UTC+2
  if (year < 1970) {
    return 2;
  }
  
  // DST logic
  const lastSundayOfMonth = (y, m) => {
    const lastDay = new Date(y, m, 0).getDate();
    const d = new Date(y, m - 1, lastDay);
    return lastDay - d.getDay();
  };
  
  const dstStartDay = lastSundayOfMonth(year, 3);
  let dstEndMonth, dstEndDay;
  
  if (year >= 1970 && year <= 1977) {
    dstEndMonth = 10;
    dstEndDay = lastSundayOfMonth(year, 10);
  } else if (year >= 1983 && year <= 1995) {
    dstEndMonth = 9;
    dstEndDay = lastSundayOfMonth(year, 9);
  } else {
    dstEndMonth = 10;
    dstEndDay = lastSundayOfMonth(year, 10);
  }
  
  if (month > 3 && month < dstEndMonth) {
    return 3;
  } else if (month < 3 || month > dstEndMonth) {
    return 2;
  } else if (month === 3) {
    return day >= dstStartDay ? 3 : 2;
  } else if (month === dstEndMonth) {
    return day < dstEndDay ? 3 : 2;
  }
  
  return 2;
}

/**
 * Main chart calculation function
 * Uses Swiss Ephemeris via window.SwissEphemeris or module import
 */
export async function calculateChart(year, month, day, hour, minute, lat, lng, tz) {
  // Try window.SwissEphemeris first (loaded via script tag)
  if (typeof window !== 'undefined' && window.SwissEphemeris?.calculateChart) {
    try {
      // Determine timezone offset
      let offset;
      
      if (tz === 0) {
        offset = 0;
        console.log(`🕐 Using UT (Universal Time)`);
      } else if (tz === 'tr' || tz === 'turkey' || tz === 'istanbul' || 
                 (lat > 35 && lat < 43 && lng > 25 && lng < 45)) {
        offset = getTurkeyOffset(year, month, day);
        console.log(`🕐 Turkey DST: ${year}-${month}-${day} → UTC+${offset}`);
      } else if (typeof tz === 'number') {
        offset = tz;
        console.log(`🕐 Using provided offset: UTC+${offset}`);
      } else {
        // Get offset from TZ_DATA
        const TZ_DATA = {
          "Europe/Istanbul": [3, 3, 0, 0],
          "Europe/Berlin": [1, 2, 3, 10],
          "Europe/Vienna": [1, 2, 3, 10],
          "Europe/London": [0, 1, 3, 10],
          "Europe/Paris": [1, 2, 3, 10],
          "Europe/Amsterdam": [1, 2, 3, 10],
          "Europe/Zurich": [1, 2, 3, 10],
          "America/New_York": [-5, -4, 3, 11],
          "America/Chicago": [-6, -5, 3, 11],
          "America/Los_Angeles": [-8, -7, 3, 11],
          "Europe/Bucharest": [2, 3, 3, 10],
          "Europe/Moscow": [3, 3, 0, 0]
        };
        const data = TZ_DATA[tz] || [3, 3, 0, 0];
        offset = data[2] === 0 ? data[0] : (month > data[2] && month < data[3] ? data[1] : data[0]);
        console.log(`🕐 Timezone ${tz}: UTC+${offset}`);
      }
      
      const chart = await window.SwissEphemeris.calculateChart({
        year, month, day, hour, minute,
        lat, lng,
        tzOffset: offset,
        houseSystem: 'P' // Placidus
      });
      
      console.log('✅ Chart calculated with Swiss Ephemeris');
      return chart;
    } catch (error) {
      console.error('❌ Swiss Ephemeris error:', error);
    }
  }
  
  // Try module-based ephemeris
  if (swissEph?.calculateChart) {
    try {
      const offset = getTurkeyOffset(year, month, day);
      const chart = await swissEph.calculateChart({
        year, month, day, hour, minute,
        lat, lng,
        tzOffset: offset,
        houseSystem: 'P'
      });
      console.log('✅ Chart calculated with Swiss Ephemeris module');
      return chart;
    } catch (error) {
      console.error('❌ Module ephemeris error:', error);
    }
  }
  
  console.warn('⚠️ Swiss Ephemeris not available, using basic fallback');
  return calculateBasicChart(year, month, day, hour, minute, lat, lng, tz);
}

/**
 * Basic chart calculation fallback (simplified)
 */
function calculateBasicChart(year, month, day, hour, minute, lat, lng, tz) {
  const offset = typeof tz === 'number' ? tz : 3;
  const utcHour = hour - offset;
  
  // Julian Date
  let y = year, m = month;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5 + (utcHour + minute / 60) / 24;
  
  // Simplified Sun position
  const T = (jd - 2451545.0) / 36525;
  let sunLong = 280.4664567 + 360007.6982779 * T;
  sunLong = ((sunLong % 360) + 360) % 360;
  
  // Simplified Moon position
  let moonLong = 218.3164477 + 481267.88123421 * T;
  moonLong = ((moonLong % 360) + 360) % 360;
  
  // Simplified ASC
  let GMST = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + lng;
  GMST = ((GMST % 360) + 360) % 360;
  const obliquity = 23.439291 - 0.0130042 * T;
  const tanASC = -Math.cos(GMST * Math.PI / 180) / 
                  (Math.sin(obliquity * Math.PI / 180) * Math.tan(lat * Math.PI / 180) + 
                   Math.cos(obliquity * Math.PI / 180) * Math.sin(GMST * Math.PI / 180));
  let asc = Math.atan(tanASC) * 180 / Math.PI;
  if (Math.cos(GMST * Math.PI / 180) > 0) asc += 180;
  if (asc < 0) asc += 360;
  
  // Convert to sign/degree/min format
  const toSDM = (deg) => {
    deg = ((deg % 360) + 360) % 360;
    const signIdx = Math.floor(deg / 30);
    const signDeg = deg % 30;
    const d = Math.floor(signDeg);
    let m = Math.round((signDeg - d) * 60);
    if (m === 60) return { signIdx, deg: d + 1, min: 0, longitude: deg };
    return { signIdx, deg: d, min: m, longitude: deg };
  };
  
  // Equal houses
  const houses = [];
  for (let i = 0; i < 12; i++) {
    const cusp = (asc + i * 30) % 360;
    houses.push({ house: i + 1, ...toSDM(cusp) });
  }
  
  return {
    planets: {
      sun: { ...toSDM(sunLong), house: 1 },
      moon: { ...toSDM(moonLong), house: 1 }
    },
    houses,
    asc: { ...toSDM(asc), longitude: asc },
    aspects: [],
    interceptedAxes: [],
    sameSignHouses: []
  };
}

/**
 * Find solar cross (when Sun reaches a specific longitude)
 */
export async function findSolarCross(targetLongitude, startJD) {
  if (typeof window !== 'undefined' && window.SwissEphemeris?.findSolarCross) {
    return window.SwissEphemeris.findSolarCross(targetLongitude, startJD);
  }
  if (swissEph?.findSolarCross) {
    return swissEph.findSolarCross(targetLongitude, startJD);
  }
  return null;
}

export { calculateBasicChart };
