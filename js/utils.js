/**
 * AstroHarmony - Utility Functions
 * Helper functions used across the application
 */

import { SIGNS, ELEMENT_CYCLE } from './data.js';

// ========== DOM HELPERS ==========
export const $ = id => document.getElementById(id);

// ========== DEGREE/MINUTE CONVERSIONS ==========
export const toMin = (d, m) => (Number(d) || 0) * 60 + (Number(m) || 0);

export const fmt = ({deg, min}) => `${deg}° ${String(min).padStart(2, '0')}'`;

export const fmtAbsMin = m => `${Math.floor(Math.round(m) / 60)}° ${String(Math.round(m) % 60).padStart(2, '0')}'`;

// ========== ELEMENT DETECTION ==========
export const elementOf = s => {
  if (["Koç", "Aslan", "Yay"].includes(s)) return 'fire';
  if (["İkizler", "Terazi", "Kova"].includes(s)) return 'air';
  if (["Yengeç", "Akrep", "Balık"].includes(s)) return 'water';
  return 'earth';
};

// ========== ELEMENT CLASS BY SIGN INDEX ==========
export function getElementClass(signIdx) {
  if (ELEMENT_CYCLE.fire.includes(signIdx)) return 'el-fire';
  if (ELEMENT_CYCLE.air.includes(signIdx)) return 'el-air';
  if (ELEMENT_CYCLE.water.includes(signIdx)) return 'el-water';
  return 'el-earth';
}

// ========== FORMATTING HELPERS ==========
export function formatDegree(deg, min) {
  return `${deg}°${String(min).padStart(2, '0')}'`;
}

export function formatSign(signIdx) {
  return SIGNS[signIdx] || '';
}

// ========== DATE HELPERS ==========
export function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(year, month) {
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) return 29;
  return days[month - 1];
}

// ========== VALIDATION ==========
export function isValidDate(day, month, year) {
  if (!day || !month || !year) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > getDaysInMonth(year, month)) return false;
  return true;
}

export function isValidTime(hour, minute) {
  if (hour < 0 || hour > 23) return false;
  if (minute < 0 || minute > 59) return false;
  return true;
}

export function isValidCoordinates(lat, lng) {
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}
