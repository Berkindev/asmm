/**
 * AstroHarmony - Calculations Module
 * Contains all astronomical calculations
 * CORE MODULE - DO NOT MODIFY CALCULATIONS WITHOUT THOROUGH TESTING
 */

import { TZ_DATA } from './data.js';

// ========== JULIAN DATE ==========
export function dateToJD(year, month, day, hour, minute) {
  // Julian Date calculation
  if (month <= 2) { year--; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  return JD + (hour + minute / 60) / 24;
}

// ========== TIMEZONE ==========
export function getTimezoneOffset(tz, year, month) {
  const data = TZ_DATA[tz] || [0, 0, 0, 0];
  if (data[2] === 0) return data[0]; // No DST
  // Simplified DST check (not 100% accurate for edge cases)
  if (month > data[2] && month < data[3]) return data[1];
  return data[0];
}

// ========== SWISS EPHEMERIS WRAPPER ==========
export async function calcWithSwissEph(year, month, day, hour, minute, lat, lng, tz) {
  // Check if Swiss Ephemeris is available
  if (!window.SwissEphemeris || !window.SwissEphemeris.isReady()) {
    return null; // Fallback to basic calculations
  }
  
  try {
    // Determine timezone offset
    let offset;
    
    // CRITICAL: If tz is EXACTLY 0 (not falsy), time is already in UT
    // This is used for Solar Return calculations where Swiss Ephemeris returns UT
    if (tz === 0) {
      offset = 0;
      console.log(`🕐 Using UT (Universal Time) - no timezone conversion`);
    }
    // For Turkey timezone strings OR Turkey coordinates (when tz is not 0)
    // This handles natal calculations for people in Turkey
    else if (tz === 'tr' || tz === 'turkey' || tz === 'istanbul' || 
             (lat > 35 && lat < 43 && lng > 25 && lng < 45)) {
      // Turkey coordinates range - use automatic DST
      offset = window.SwissEphemeris.getTurkeyOffset(year, month, day);
      console.log(`🕐 Turkey DST: ${year}-${month}-${day} → UTC+${offset}`);
    }
    // For numeric tz values, use directly
    else if (typeof tz === 'number') {
      offset = tz;
      console.log(`🕐 Using provided offset: UTC+${offset}`);
    }
    // For other string timezones
    else {
      offset = getTimezoneOffset(tz, year, month);
      console.log(`🕐 Timezone ${tz}: UTC+${offset}`);
    }
    
    const chart = await window.SwissEphemeris.calculateChart({
      year, month, day, hour, minute,
      lat, lng,
      tzOffset: offset,
      houseSystem: 'P' // Placidus
    });
    
    return chart;
  } catch (e) {
    console.warn('Swiss Ephemeris calculation failed:', e);
    return null;
  }
}

// ========== FALLBACK ASTRONOMICAL CALCULATIONS ==========
// These are used when Swiss Ephemeris is not available

export function calcSunPosition(jd) {
  // More accurate solar longitude using VSOP87 simplified
  const T = (jd - 2451545.0) / 36525;
  const T2 = T * T;
  
  // Mean longitude of the Sun
  const L0 = 280.4664567 + 36000.76983 * T + 0.0003032 * T2;
  
  // Mean anomaly of the Sun
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2;
  const Mrad = M * Math.PI / 180;
  
  // Equation of center
  const C = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.00029 * Math.sin(3 * Mrad);
  
  // True longitude
  let sunLong = (L0 + C) % 360;
  if (sunLong < 0) sunLong += 360;
  
  // Apparent longitude (nutation + aberration correction)
  const omega = 125.04 - 1934.136 * T;
  sunLong = sunLong - 0.00569 - 0.00478 * Math.sin(omega * Math.PI / 180);
  
  sunLong = sunLong % 360;
  if (sunLong < 0) sunLong += 360;
  return sunLong;
}

export function calcMoonPosition(jd) {
  // More accurate Moon longitude with major perturbations
  const T = (jd - 2451545.0) / 36525;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  
  // Mean longitude of the Moon
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
  
  // Mean elongation of the Moon
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T2 + T3 / 545868;
  
  // Sun's mean anomaly
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2;
  
  // Moon's mean anomaly
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699;
  
  // Moon's argument of latitude
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T2;
  
  // Convert to radians
  const Drad = D * Math.PI / 180;
  const Mrad = M * Math.PI / 180;
  const Mprad = Mp * Math.PI / 180;
  const Frad = F * Math.PI / 180;
  
  // Longitude terms (most significant)
  let moonLong = Lp
    + 6.288774 * Math.sin(Mprad)
    + 1.274027 * Math.sin(2 * Drad - Mprad)
    + 0.658314 * Math.sin(2 * Drad)
    + 0.213618 * Math.sin(2 * Mprad)
    - 0.185116 * Math.sin(Mrad)
    - 0.114332 * Math.sin(2 * Frad)
    + 0.058793 * Math.sin(2 * Drad - 2 * Mprad)
    + 0.057066 * Math.sin(2 * Drad - Mrad - Mprad)
    + 0.053322 * Math.sin(2 * Drad + Mprad)
    + 0.045758 * Math.sin(2 * Drad - Mrad)
    - 0.040923 * Math.sin(Mrad - Mprad)
    - 0.034720 * Math.sin(Drad)
    - 0.030383 * Math.sin(Mrad + Mprad)
    + 0.015327 * Math.sin(2 * Drad - 2 * Frad)
    - 0.012528 * Math.sin(Mprad + 2 * Frad)
    + 0.010980 * Math.sin(Mprad - 2 * Frad);
  
  moonLong = moonLong % 360;
  if (moonLong < 0) moonLong += 360;
  return moonLong;
}

export function calcPlanetPosition(jd, planet) {
  // More accurate planetary positions using perturbation terms
  const T = (jd - 2451545.0) / 36525;
  const T2 = T * T;
  
  // Orbital elements for planets (J2000.0 + rates)
  const elements = {
    mercury: {
      L: 252.2503235 + 149474.0722491 * T + 0.00030350 * T2,
      a: 0.38709893,
      e: 0.20563069 + 0.00002527 * T,
      i: 7.00498625 - 0.00594749 * T,
      omega: 77.45611904 + 0.15940013 * T,
      node: 48.33089304 - 0.12214182 * T
    },
    venus: {
      L: 181.9798012 + 58519.2130302 * T + 0.00031014 * T2,
      a: 0.72333199,
      e: 0.00677323 - 0.00004938 * T,
      i: 3.39466189 - 0.00078890 * T,
      omega: 131.56370300 + 0.00576464 * T,
      node: 76.67992019 - 0.27769418 * T
    },
    mars: {
      L: 355.4332944 + 19141.6964471 * T + 0.00031052 * T2,
      a: 1.52366231,
      e: 0.09341233 + 0.00011902 * T,
      i: 1.84972648 - 0.00813131 * T,
      omega: 336.06023395 + 0.44441088 * T,
      node: 49.55953891 - 0.29257343 * T
    },
    jupiter: {
      L: 34.3514839 + 3036.3027748 * T + 0.00022330 * T2,
      a: 5.20336301,
      e: 0.04839266 - 0.00012880 * T,
      i: 1.30326698 - 0.00183714 * T,
      omega: 14.33120687 + 0.21252668 * T,
      node: 100.46444064 + 0.13024619 * T
    },
    saturn: {
      L: 50.0774443 + 1223.5110686 * T + 0.00051908 * T2,
      a: 9.53707032,
      e: 0.05415060 - 0.00036762 * T,
      i: 2.48887878 + 0.00193609 * T,
      omega: 93.05678728 + 0.56654502 * T,
      node: 113.66552252 - 0.25015002 * T
    },
    uranus: {
      L: 314.0550112 + 429.8663296 * T - 0.00023436 * T2,
      a: 19.19126393,
      e: 0.04716771 - 0.00019150 * T,
      i: 0.76986139 - 0.00244797 * T,
      omega: 173.00529106 + 0.09266985 * T,
      node: 74.00594744 + 0.04240589 * T
    },
    neptune: {
      L: 304.3486535 + 219.8833092 * T + 0.00030882 * T2,
      a: 30.06896348,
      e: 0.00858587 + 0.00002514 * T,
      i: 1.76917303 - 0.00493280 * T,
      omega: 48.12027554 + 0.03175680 * T,
      node: 131.78405702 - 0.00606302 * T
    },
    pluto: {
      L: 238.9290355 + 146.3642277 * T,
      a: 39.48168677,
      e: 0.24880766,
      i: 17.14175,
      omega: 224.06676,
      node: 110.30394
    }
  };
  
  if (!elements[planet]) return 0;
  const el = elements[planet];
  
  // Mean anomaly
  const M = (el.L - el.omega) % 360;
  const Mrad = M * Math.PI / 180;
  
  // Solve Kepler's equation for eccentric anomaly (Newton-Raphson, 3 iterations)
  let E = M;
  for (let i = 0; i < 3; i++) {
    E = M + (el.e * 180 / Math.PI) * Math.sin(E * Math.PI / 180);
  }
  const Erad = E * Math.PI / 180;
  
  // True anomaly
  const xv = el.a * (Math.cos(Erad) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(Erad);
  const v = Math.atan2(yv, xv) * 180 / Math.PI;
  
  // Heliocentric longitude
  let helioLong = (v + el.omega) % 360;
  if (helioLong < 0) helioLong += 360;
  
  // For outer planets, we need geocentric conversion
  // Get Sun position for geocentric conversion
  const sunLong = calcSunPosition(jd);
  
  // Simplified geocentric conversion
  if (el.a > 1) { // Outer planet
    // Apply parallax correction based on distance and elongation
    const elongation = helioLong - sunLong;
    const parallax = (1 / el.a) * Math.sin(elongation * Math.PI / 180) * (180 / Math.PI);
    helioLong += parallax * 0.5; // Simplified correction
  }
  
  helioLong = helioLong % 360;
  if (helioLong < 0) helioLong += 360;
  return helioLong;
}

export function calcChiron(jd) {
  // Chiron approximate position
  const T = (jd - 2451545.0) / 36525;
  let L = (209.0 + 14.728 * T * 365.25) % 360;
  if (L < 0) L += 360;
  return L;
}

export function calcNodes(jd) {
  // Mean lunar nodes
  const T = (jd - 2451545.0) / 36525;
  let northNode = (125.0445479 - 1934.1362891 * T) % 360;
  if (northNode < 0) northNode += 360;
  return {north: northNode, south: (northNode + 180) % 360};
}

export function calcASC(jd, lat, lng) {
  // Simplified Ascendant calculation
  const T = (jd - 2451545.0) / 36525;
  const GMST = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T) % 360;
  const LST = (GMST + lng) % 360;
  const obliquity = 23.439291 - 0.0130042 * T;
  const oblRad = obliquity * Math.PI / 180;
  const latRad = lat * Math.PI / 180;
  const lstRad = LST * Math.PI / 180;
  
  let asc = Math.atan2(Math.cos(lstRad), -(Math.sin(lstRad) * Math.cos(oblRad) + Math.tan(latRad) * Math.sin(oblRad)));
  asc = asc * 180 / Math.PI;
  if (asc < 0) asc += 360;
  return asc;
}

export function calcHouseCusps(asc, lat) {
  // Simplified Placidus-like equal house system from ASC
  const cusps = [];
  for (let i = 0; i < 12; i++) {
    cusps.push((asc + i * 30) % 360);
  }
  return cusps;
}

// ========== DEGREE CONVERSION ==========
export function degToSignDegMin(totalDeg) {
  totalDeg = totalDeg % 360;
  if (totalDeg < 0) totalDeg += 360;
  const signIdx = Math.floor(totalDeg / 30);
  const degInSign = totalDeg - signIdx * 30;
  const deg = Math.floor(degInSign);
  const min = Math.round((degInSign - deg) * 60);
  return {signIdx, deg, min: min === 60 ? 0 : min, degAdj: min === 60 ? deg + 1 : deg};
}

// ========== ASPECT CALCULATIONS ==========
const ASPECTS = [
  {name: 'Kavuşum', symbol: '☌', angle: 0, orb: 8, color: '#f59e0b'},
  {name: 'Karşıt', symbol: '☍', angle: 180, orb: 8, color: '#ef4444'},
  {name: 'Üçgen', symbol: '△', angle: 120, orb: 8, color: '#22c55e'},
  {name: 'Kare', symbol: '□', angle: 90, orb: 7, color: '#ef4444'},
  {name: 'Altmışlık', symbol: '⚹', angle: 60, orb: 6, color: '#22c55e'}
];

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
      
      // Check each aspect
      for (const aspect of ASPECTS) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          aspects.push({
            planet1: p1,
            planet2: p2,
            aspect: aspect.name,
            symbol: aspect.symbol,
            angle: aspect.angle,
            orb: orb.toFixed(1),
            color: aspect.color,
            exact: orb < 1
          });
          break; // Only one aspect per planet pair
        }
      }
    }
  }
  
  return aspects;
}

// ========== MAIN CHART CALCULATION ==========
export async function calculateChart(year, month, day, hour, minute, lat, lng, tz) {
  // Try Swiss Ephemeris first (Placidus houses, accurate planets)
  const swissResult = await calcWithSwissEph(year, month, day, hour, minute, lat, lng, tz);
  
  if (swissResult) {
    // Swiss Ephemeris returned complete chart with Placidus houses
    console.log('✅ Using Swiss Ephemeris (Placidus)');
    return swissResult;
  }
  
  // Fallback to basic calculations (Equal House)
  console.log('⚠️ Using basic calculations (Equal House) - less accurate');
  
  const offset = getTimezoneOffset(tz, year, month);
  const utcHour = hour - offset;
  const jd = dateToJD(year, month, day, utcHour, minute);

  // Basic planet calculations
  const sunLong = calcSunPosition(jd);
  const moonLong = calcMoonPosition(jd);
  const mercuryLong = calcPlanetPosition(jd, 'mercury');
  const venusLong = calcPlanetPosition(jd, 'venus');
  const marsLong = calcPlanetPosition(jd, 'mars');
  const jupiterLong = calcPlanetPosition(jd, 'jupiter');
  const saturnLong = calcPlanetPosition(jd, 'saturn');
  const uranusLong = calcPlanetPosition(jd, 'uranus');
  const neptuneLong = calcPlanetPosition(jd, 'neptune');
  const plutoLong = calcPlanetPosition(jd, 'pluto');
  const chironLong = calcChiron(jd);
  const nodes = calcNodes(jd);
  const asc = calcASC(jd, lat, lng);
  
  const houseCusps = calcHouseCusps(asc, lat);

  // Convert to sign/degree/minute format
  const planets = {
    sun: degToSignDegMin(sunLong),
    moon: degToSignDegMin(moonLong),
    mercury: degToSignDegMin(mercuryLong),
    venus: degToSignDegMin(venusLong),
    mars: degToSignDegMin(marsLong),
    jupiter: degToSignDegMin(jupiterLong),
    saturn: degToSignDegMin(saturnLong),
    uranus: degToSignDegMin(uranusLong),
    neptune: degToSignDegMin(neptuneLong),
    pluto: degToSignDegMin(plutoLong),
    chiron: degToSignDegMin(chironLong),
    north: degToSignDegMin(nodes.north),
    south: degToSignDegMin(nodes.south)
  };

  // House cusps
  const houses = houseCusps.map((cusp, i) => ({
    house: i + 1,
    ...degToSignDegMin(cusp)
  }));

  // Detect intercepted signs and same-sign house starts
  const interceptedAxes = []; // Which axes (1-6) have intercepted signs
  const sameSignHouses = [];  // Which houses (1-6) have same sign as next house
  
  for (let i = 0; i < 12; i++) {
    const currentSign = houses[i].signIdx;
    const nextSign = houses[(i + 1) % 12].signIdx;
    
    // Check if same sign (consecutive houses start in same zodiac sign)
    if (currentSign === nextSign) {
      // First 6 houses matter for our form
      if (i < 6) {
        sameSignHouses.push(i + 1);
      }
    }
    
    // Check for intercepted sign (sign completely contained within house)
    // This happens when nextSign is more than 1 sign away from currentSign
    const signDiff = ((nextSign - currentSign) % 12 + 12) % 12;
    if (signDiff > 1) {
      // There's at least one intercepted sign between these houses
      // For axes 1-6, check if this axis has interception
      if (i < 6) {
        interceptedAxes.push(i + 1);
      }
    }
  }

  // Calculate aspects (including MC - Tepe Noktası)
  const mcLong = houseCusps[9] ? (houseCusps[9].signIdx * 30 + houseCusps[9].deg + houseCusps[9].min / 60) : 0;
  const ascLong = asc; // ASC longitude
  const planetLongs = {
    sun: sunLong, moon: moonLong, mercury: mercuryLong, venus: venusLong,
    mars: marsLong, jupiter: jupiterLong, saturn: saturnLong, uranus: uranusLong,
    neptune: neptuneLong, pluto: plutoLong, chiron: chironLong, north: nodes.north,
    mc: mcLong, asc: ascLong
  };
  const aspects = calculateAspects(planetLongs);

  return {planets, houses, asc: degToSignDegMin(asc), aspects, interceptedAxes, sameSignHouses};
}
