/**
 * Date and time utility functions
 */

import { TZ_DATA } from '../data/countries.js';

/**
 * Convert calendar date to Julian Date
 * @param {number} year
 * @param {number} month (1-12)
 * @param {number} day
 * @param {number} hour (0-23)
 * @param {number} minute (0-59)
 * @returns {number} Julian Date
 */
export function dateToJD(year, month, day, hour = 0, minute = 0) {
  if (month <= 2) { 
    year--; 
    month += 12; 
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  return JD + (hour + minute / 60) / 24;
}

/**
 * Convert Julian Date back to calendar date and time
 * @param {number} jd - Julian Date
 * @returns {Object} {year, month, day, hour, minute}
 */
export function jdToDateTime(jd) {
  const Z = Math.floor(jd + 0.5);
  const F = jd + 0.5 - Z;
  
  let A;
  if (Z < 2299161) {
    A = Z;
  } else {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    A = Z + 1 + alpha - Math.floor(alpha / 4);
  }
  
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);
  
  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;
  
  // Extract time from fractional part
  const totalHours = F * 24;
  const hour = Math.floor(totalHours);
  const minute = Math.round((totalHours - hour) * 60);
  
  return { day, month, year, hour, minute };
}

/**
 * Get timezone offset for a given timezone and date
 * Handles DST automatically
 * @param {string} tz - Timezone identifier (e.g., "Europe/Istanbul")
 * @param {number} year
 * @param {number} month
 * @returns {number} UTC offset in hours
 */
export function getTimezoneOffset(tz, year, month) {
  const data = TZ_DATA[tz] || [0, 0, 0, 0];
  if (data[2] === 0) return data[0]; // No DST
  // Simplified DST check
  if (month > data[2] && month < data[3]) return data[1];
  return data[0];
}

/**
 * Convert total ecliptic degrees to sign, degree, and minute
 * @param {number} totalDeg - Total degrees (0-360)
 * @returns {Object} {signIdx, deg, min}
 */
export function degToSignDegMin(totalDeg) {
  totalDeg = totalDeg % 360;
  if (totalDeg < 0) totalDeg += 360;
  const signIdx = Math.floor(totalDeg / 30);
  const degInSign = totalDeg - signIdx * 30;
  const deg = Math.floor(degInSign);
  const min = Math.round((degInSign - deg) * 60);
  return {
    signIdx, 
    deg, 
    min: min === 60 ? 0 : min, 
    degAdj: min === 60 ? deg + 1 : deg
  };
}

/**
 * Convert hex color to RGB string
 * @param {string} hex - Hex color (e.g., "#FF0000")
 * @returns {string} RGB string (e.g., "255,0,0")
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '128,128,128';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

/**
 * Format degree as string with sign symbol
 * @param {number} signIdx
 * @param {number} deg
 * @param {number} min
 * @returns {string}
 */
export function formatDegree(signIdx, deg, min) {
  return `${deg}°${String(min).padStart(2, '0')}'`;
}

/**
 * Normalize angle to 0-360 range
 * @param {number} angle
 * @returns {number}
 */
export function normalizeAngle(angle) {
  angle = angle % 360;
  return angle < 0 ? angle + 360 : angle;
}
