/**
 * Swiss Ephemeris WASM wrapper for Astroharmony
 * Provides accurate planetary calculations using the Swiss Ephemeris
 */

// Planet IDs from Swiss Ephemeris
const PLANETS = {
  SUN: 0,
  MOON: 1,
  MERCURY: 2,
  VENUS: 3,
  MARS: 4,
  JUPITER: 5,
  SATURN: 6,
  URANUS: 7,
  NEPTUNE: 8,
  PLUTO: 9,
  MEAN_NODE: 10,
  TRUE_NODE: 11,
  CHIRON: 15
};

// Zodiac signs
const SIGNS = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];

// Ephemeris instance
let swe = null;
let isInitialized = false;
let initPromise = null;

/**
 * Initialize the Swiss Ephemeris
 * @returns {Promise<boolean>} True if initialization succeeded
 */
async function initEphemeris() {
  if (isInitialized) return true;
  if (initPromise) return initPromise;
  
  initPromise = (async () => {
    try {
      // Dynamic import of the sweph-wasm module
      const SwissEPH = (await import('./lib/index.js')).default;
      swe = await SwissEPH.init();
      
      // Set ephemeris path - downloads from CDN
      await swe.swe_set_ephe_path();
      
      isInitialized = true;
      console.log('✅ Swiss Ephemeris initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Swiss Ephemeris:', error);
      isInitialized = false;
      return false;
    }
  })();
  
  return initPromise;
}

/**
 * Convert degrees to sign, degree, minute format
 * @param {number} deg Total degrees (0-360)
 * @returns {{signIdx: number, deg: number, min: number}}
 */
function degToSignDegMin(deg) {
  deg = ((deg % 360) + 360) % 360;
  const signIdx = Math.floor(deg / 30);
  const signDeg = deg % 30;
  const d = Math.floor(signDeg);
  let m = Math.round((signDeg - d) * 60);
  if (m === 60) {
    return { signIdx, deg: d + 1, min: 0 };
  }
  return { signIdx, deg: d, min: m };
}

/**
 * Calculate Julian Day from date/time
 * @param {number} year Year
 * @param {number} month Month (1-12)
 * @param {number} day Day
 * @param {number} hour Hour (0-23)
 * @param {number} minute Minute (0-59)
 * @param {number} tzOffset Timezone offset in hours
 * @returns {number} Julian Day
 */
function getJulianDay(year, month, day, hour, minute, tzOffset = 0) {
  // Convert to UTC
  const utcHour = hour - tzOffset + minute / 60;
  return swe.swe_julday(year, month, day, utcHour, 1); // 1 = Gregorian calendar
}

/**
 * Get Turkey timezone offset considering historical DST rules
 * Turkey used DST until September 2016 when they switched to permanent UTC+3
 * IMPORTANT: Turkey's DST transition dates changed over the years:
 * - 1983-1995: DST ended last Sunday of SEPTEMBER
 * - 1996-2006: DST ended last Sunday of OCTOBER  
 * - 2007-2010: EU rules (last Sunday of October)
 * - 2011-2016: Last Sunday of October
 * @param {number} year Year
 * @param {number} month Month (1-12)
 * @param {number} day Day
 * @returns {number} Timezone offset in hours (2 or 3)
 */
function getTurkeyOffset(year, month, day) {
  // After September 2016, Turkey is permanently UTC+3
  if (year > 2016 || (year === 2016 && month >= 9)) {
    return 3;
  }
  
  // Find last Sunday of a month
  const lastSundayOfMonth = (y, m) => {
    const lastDay = new Date(y, m, 0).getDate(); // Last day of month
    const d = new Date(y, m - 1, lastDay);
    const dayOfWeek = d.getDay(); // 0 = Sunday
    return lastDay - dayOfWeek;
  };
  
  // DST start: Last Sunday of March (consistent)
  const dstStartDay = lastSundayOfMonth(year, 3);
  
  // DST end: Depends on the year
  // Before 1996: Last Sunday of September
  // 1996 and after: Last Sunday of October
  let dstEndMonth, dstEndDay;
  if (year < 1996) {
    dstEndMonth = 9; // September
    dstEndDay = lastSundayOfMonth(year, 9);
  } else {
    dstEndMonth = 10; // October
    dstEndDay = lastSundayOfMonth(year, 10);
  }
  
  // Check if we're in DST period
  if (month > 3 && month < dstEndMonth) {
    // Between April and (September-1 or October-1): definitely DST (UTC+3)
    return 3;
  } else if (month < 3 || month > dstEndMonth) {
    // January, February, or after DST end month: winter time (UTC+2)
    return 2;
  } else if (month === 3) {
    // March: depends on the day
    return day >= dstStartDay ? 3 : 2;
  } else if (month === dstEndMonth) {
    // DST end month (September or October): depends on the day
    return day < dstEndDay ? 3 : 2;
  }
  
  return 2; // Default to winter time (UTC+2)
}

/**
 * Calculate a complete birth chart
 * @param {object} params Birth data
 * @param {number} params.year Birth year
 * @param {number} params.month Birth month (1-12)
 * @param {number} params.day Birth day
 * @param {number} params.hour Birth hour (0-23)
 * @param {number} params.minute Birth minute (0-59)
 * @param {number} params.lat Geographic latitude
 * @param {number} params.lng Geographic longitude
 * @param {number} params.tzOffset Timezone offset in hours
 * @param {string} params.houseSystem House system ('P' = Placidus, 'K' = Koch, etc.)
 * @returns {Promise<object>} Chart data
 */
async function calculateChart(params) {
  const { year, month, day, hour, minute, lat, lng, tzOffset = 3, houseSystem = 'P' } = params;
  
  if (!isInitialized) {
    const success = await initEphemeris();
    if (!success) {
      throw new Error('Swiss Ephemeris not initialized');
    }
  }
  
  const jd = getJulianDay(year, month, day, hour, minute, tzOffset);
  
  // Calculate houses (Placidus by default)
  const houses = swe.swe_houses(jd, lat, lng, houseSystem);
  
  // Swiss Ephemeris returns cusps array where index 1-12 are the houses
  // cusps[0] is empty/unused, cusps[1] = 1st house, cusps[2] = 2nd house, etc.
  const ascendant = houses.ascmc[0]; // ASC
  const mc = houses.ascmc[1]; // MC
  
  // Extract house cusps properly (indices 1-12)
  const houseCusps = [];
  for (let i = 1; i <= 12; i++) {
    houseCusps.push(houses.cusps[i]);
  }
  
  // Calculate planets
  const planets = {};
  const planetList = [
    { key: 'sun', id: PLANETS.SUN },
    { key: 'moon', id: PLANETS.MOON },
    { key: 'mercury', id: PLANETS.MERCURY },
    { key: 'venus', id: PLANETS.VENUS },
    { key: 'mars', id: PLANETS.MARS },
    { key: 'jupiter', id: PLANETS.JUPITER },
    { key: 'saturn', id: PLANETS.SATURN },
    { key: 'uranus', id: PLANETS.URANUS },
    { key: 'neptune', id: PLANETS.NEPTUNE },
    { key: 'pluto', id: PLANETS.PLUTO },
    { key: 'north', id: PLANETS.TRUE_NODE },
    { key: 'chiron', id: PLANETS.CHIRON }
  ];
  
  const rawLongitudes = {};
  
  for (const { key, id } of planetList) {
    try {
      const pos = swe.swe_calc_ut(jd, id, 0);
      const longitude = pos[0]; // Ecliptic longitude
      rawLongitudes[key] = longitude;
      
      const signData = degToSignDegMin(longitude);
      const house = findHouse(longitude, houseCusps);
      
      planets[key] = {
        ...signData,
        house,
        longitude
      };
    } catch (e) {
      console.warn(`Failed to calculate ${key}:`, e);
      planets[key] = { signIdx: 0, deg: 0, min: 0, house: 1, longitude: 0 };
    }
  }
  
  // South Node = North Node + 180
  if (planets.north) {
    const southLong = (planets.north.longitude + 180) % 360;
    rawLongitudes.south = southLong;
    planets.south = {
      ...degToSignDegMin(southLong),
      house: findHouse(southLong, houseCusps),
      longitude: southLong
    };
  }
  
  // Calculate Part of Fortune (Şans Noktası)
  // Day formula (Sun above horizon): ASC + Moon - Sun
  // Night formula (Sun below horizon): ASC + Sun - Moon
  // Sun is above horizon when it's between ASC and DESC (houses 7-12 and 1)
  if (rawLongitudes.sun !== undefined && rawLongitudes.moon !== undefined) {
    // Check if it's a day or night birth
    // Day = Sun is in houses 7-12 (above horizon)
    // Night = Sun is in houses 1-6 (below horizon)
    const sunHouse = planets.sun?.house || 1;
    const isNightBirth = sunHouse >= 1 && sunHouse <= 6;
    
    let fortuneLong;
    if (isNightBirth) {
      // Night formula: ASC + Sun - Moon
      fortuneLong = ascendant + rawLongitudes.sun - rawLongitudes.moon;
    } else {
      // Day formula: ASC + Moon - Sun
      fortuneLong = ascendant + rawLongitudes.moon - rawLongitudes.sun;
    }
    fortuneLong = ((fortuneLong % 360) + 360) % 360;
    rawLongitudes.fortune = fortuneLong;
    planets.fortune = {
      ...degToSignDegMin(fortuneLong),
      house: findHouse(fortuneLong, houseCusps),
      longitude: fortuneLong,
      isNightBirth: isNightBirth
    };
  }
  
  // Convert house cusps to sign/degree/minute
  // houseCusps is now 0-indexed (0 = 1st house, 11 = 12th house)
  const houseData = houseCusps.map((cusp, i) => ({
    house: i + 1,
    ...degToSignDegMin(cusp)
  }));
  
  // Detect intercepted signs and same-sign houses
  const interceptedAxes = [];
  const sameSignHouses = [];
  
  for (let i = 0; i < 12; i++) {
    const currentSign = houseData[i].signIdx;
    const nextSign = houseData[(i + 1) % 12].signIdx;
    
    // Same sign check
    if (currentSign === nextSign && i < 6) {
      sameSignHouses.push(i + 1);
    }
    
    // Intercepted sign check
    const signDiff = ((nextSign - currentSign) % 12 + 12) % 12;
    if (signDiff > 1 && i < 6) {
      interceptedAxes.push(i + 1);
    }
  }
  
  // Calculate aspects
  const aspects = calculateAspects(rawLongitudes);
  
  return {
    planets,
    houses: houseData,
    asc: degToSignDegMin(ascendant),
    mc: degToSignDegMin(mc),
    interceptedAxes,
    sameSignHouses,
    aspects,
    rawData: {
      jd,
      ascendant,
      mc,
      houseCusps,
      planetLongitudes: rawLongitudes
    }
  };
}

/**
 * Find which house a planet is in
 * @param {number} longitude Planet longitude (0-360)
 * @param {number[]} cusps Array of 12 house cusp longitudes
 * @returns {number} House number (1-12)
 */
function findHouse(longitude, cusps) {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    
    if (start <= end) {
      if (longitude >= start && longitude < end) {
        return i + 1;
      }
    } else {
      // Wraps around 0 degrees
      if (longitude >= start || longitude < end) {
        return i + 1;
      }
    }
  }
  return 1;
}

/**
 * Calculate aspects between planets
 * @param {object} longitudes Object with planet keys and longitude values
 * @returns {Array} Array of aspect objects
 */
function calculateAspects(longitudes) {
  const ASPECT_TYPES = [
    { name: 'Kavuşum', symbol: '☌', angle: 0, orb: 8, color: '#f59e0b' },
    { name: 'Karşıt', symbol: '☍', angle: 180, orb: 8, color: '#ef4444' },
    { name: 'Üçgen', symbol: '△', angle: 120, orb: 8, color: '#22c55e' },
    { name: 'Kare', symbol: '□', angle: 90, orb: 7, color: '#ef4444' },
    { name: 'Altmışlık', symbol: '⚹', angle: 60, orb: 6, color: '#22c55e' },
    { name: 'Yüzelllik', symbol: '⚻', angle: 150, orb: 3, color: '#a855f7' }
  ];
  
  const planetKeys = Object.keys(longitudes);
  const aspects = [];
  
  for (let i = 0; i < planetKeys.length; i++) {
    for (let j = i + 1; j < planetKeys.length; j++) {
      const p1 = planetKeys[i];
      const p2 = planetKeys[j];
      const long1 = longitudes[p1];
      const long2 = longitudes[p2];
      
      let diff = Math.abs(long1 - long2);
      if (diff > 180) diff = 360 - diff;
      
      for (const aspectType of ASPECT_TYPES) {
        const orb = Math.abs(diff - aspectType.angle);
        if (orb <= aspectType.orb) {
          aspects.push({
            planet1: p1,
            planet2: p2,
            aspect: aspectType.name,
            symbol: aspectType.symbol,
            angle: aspectType.angle,
            orb: orb.toFixed(2),
            exact: orb < 1,
            color: aspectType.color
          });
          break;
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Find the exact moment when the Sun crosses a specific longitude
 * Uses Swiss Ephemeris swe_solcross_ut for precise calculation
 * @param {number} targetLongitude Target Sun longitude (0-360)
 * @param {number} startJD Julian Date to start searching from
 * @param {number} flags Ephemeris flags (0 for default Swiss Ephemeris)
 * @returns {Promise<number|null>} Julian Date when Sun crosses the target longitude
 */
async function findSolarCross(targetLongitude, startJD, flags = 0) {
  if (!isInitialized) {
    const success = await initEphemeris();
    if (!success) {
      console.error('Swiss Ephemeris not initialized');
      return null;
    }
  }
  
  try {
    // swe_solcross_ut returns the Julian Date when Sun crosses the given longitude
    // This is the EXACT astronomical moment - no approximation needed
    const resultJD = swe.swe_solcross_ut(targetLongitude, startJD, flags);
    console.log(`🌞 Swiss Ephemeris solcross: Sun reaches ${targetLongitude.toFixed(4)}° at JD ${resultJD.toFixed(6)}`);
    return resultJD;
  } catch (error) {
    console.error('Error in findSolarCross:', error);
    return null;
  }
}

/**
 * Get the Swiss Ephemeris instance (for advanced calculations)
 * @returns {object|null} Swiss Ephemeris instance
 */
function getSweInstance() {
  return swe;
}

/**
 * Check if ephemeris is ready
 * @returns {boolean}
 */
function isEphemerisReady() {
  return isInitialized;
}

// Export functions
export {
  initEphemeris,
  calculateChart,
  isEphemerisReady,
  degToSignDegMin,
  getTurkeyOffset,
  findSolarCross,
  getSweInstance,
  getJulianDay,
  PLANETS,
  SIGNS
};
