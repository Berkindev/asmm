/**
 * Solar Return Calculator Module
 * Calculates Solar Return charts for a given year
 */

import { dateToJD, jdToDateTime, degToSignDegMin } from '../utils/date-utils.js';
import { calculateChart, findSolarCross } from './chart-calculator.js';
import { SIGNS } from '../data/zodiac.js';

/**
 * Find the exact date/time when Sun returns to natal position
 * Uses Swiss Ephemeris for precise calculation
 * @param {number} natalSunLong - Natal Sun longitude
 * @param {number} solarYear - Year to calculate Solar Return for
 * @param {number} birthMonth - Birth month
 * @param {number} birthDay - Birth day
 * @returns {Object} Solar return date/time info
 */
export async function findSolarReturnDate(natalSunLong, solarYear, birthMonth, birthDay) {
  // Start search from a few days before expected birthday
  const startJD = dateToJD(solarYear, birthMonth, birthDay, 0, 0) - 5;
  
  try {
    // Try Swiss Ephemeris for exact calculation
    const exactJD = await findSolarCross(natalSunLong, startJD);
    
    if (exactJD) {
      const result = jdToDateTime(exactJD);
      result.jd = exactJD;
      result.approximate = false;
      console.log(`✅ Solar Return: ${result.day}/${result.month}/${result.year} ${result.hour}:${String(result.minute).padStart(2,'0')}`);
      return result;
    }
  } catch (error) {
    console.warn('Swiss Ephemeris findSolarCross failed:', error);
  }
  
  // Fallback to binary search
  console.warn('Using fallback binary search for Solar Return');
  return binarySearchSolarReturn(natalSunLong, startJD, birthDay, birthMonth, solarYear);
}

/**
 * Binary search fallback for Solar Return
 */
function binarySearchSolarReturn(natalSunLong, startJD, birthDay, birthMonth, solarYear) {
  let searchStartJD = startJD;
  let searchEndJD = startJD + 10;
  
  const tolerance = 1 / 60; // 1 arcminute
  let iterations = 0;
  const maxIterations = 50;
  
  while (iterations < maxIterations) {
    const midJD = (searchStartJD + searchEndJD) / 2;
    
    // Simplified sun position calculation
    const T = (midJD - 2451545.0) / 36525;
    let sunLong = 280.4664567 + 360007.6982779 * T;
    sunLong = ((sunLong % 360) + 360) % 360;
    
    let diff = sunLong - natalSunLong;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    if (Math.abs(diff) < tolerance) {
      const result = jdToDateTime(midJD);
      result.jd = midJD;
      result.approximate = true;
      return result;
    }
    
    if (diff < 0) {
      searchStartJD = midJD;
    } else {
      searchEndJD = midJD;
    }
    
    iterations++;
  }
  
  // Last resort fallback
  return {
    day: birthDay,
    month: birthMonth,
    year: solarYear,
    hour: 12,
    minute: 0,
    approximate: true
  };
}

/**
 * Calculate complete Solar Return chart for a year
 * @param {Object} natalData - Natal data containing birth info and chart
 * @param {number} solarYear - Year to calculate solar return
 * @returns {Object} Solar Return data including date and chart
 */
export async function calculateSolarReturn(natalData, solarYear) {
  if (!natalData || !natalData.chart?.planets?.sun) {
    return { error: 'Natal veri bulunamadı.' };
  }
  
  const { day, month, year, lat, lng, tz, chart } = natalData;
  const natalSun = chart.planets.sun;
  const natalSunLong = natalSun.longitude || (natalSun.signIdx * 30 + natalSun.deg + natalSun.min / 60);
  
  // Find exact Solar Return date
  const solarReturnDate = await findSolarReturnDate(natalSunLong, solarYear, month, day);
  
  if (!solarReturnDate) {
    return { error: 'Solar Return tarihi hesaplanamadı.' };
  }
  
  // Calculate chart for Solar Return moment
  const solarChart = await calculateChart(
    solarReturnDate.year,
    solarReturnDate.month,
    solarReturnDate.day,
    solarReturnDate.hour,
    solarReturnDate.minute,
    lat, lng, 0 // Use UT for Solar Return
  );
  
  return {
    natalSun: {
      sign: SIGNS[natalSun.signIdx],
      deg: natalSun.deg,
      min: natalSun.min,
      longitude: natalSunLong
    },
    solarReturnDate,
    solarYear,
    chart: solarChart,
    approximate: solarReturnDate.approximate
  };
}

/**
 * Calculate Solar months (house periods throughout the year)
 * Each month is approximately 30 days
 * @param {Object} solarData - Solar return data
 * @returns {Array} Array of 12 month periods
 */
export function calculateSolarMonths(solarData) {
  if (!solarData?.chart?.houses) return [];
  
  const { solarReturnDate, chart } = solarData;
  const months = [];
  
  for (let i = 0; i < 12; i++) {
    const house = chart.houses[i];
    const startDays = i * 30;
    const endDays = (i + 1) * 30;
    
    // Calculate approximate dates
    const startDate = new Date(solarReturnDate.year, solarReturnDate.month - 1, solarReturnDate.day + startDays);
    const endDate = new Date(solarReturnDate.year, solarReturnDate.month - 1, solarReturnDate.day + endDays - 1);
    
    months.push({
      month: i + 1,
      house: i + 1,
      houseSign: SIGNS[house.signIdx],
      houseDeg: house.deg,
      houseMin: house.min,
      startDate: {
        day: startDate.getDate(),
        month: startDate.getMonth() + 1,
        year: startDate.getFullYear()
      },
      endDate: {
        day: endDate.getDate(),
        month: endDate.getMonth() + 1,
        year: endDate.getFullYear()
      }
    });
  }
  
  return months;
}

export { binarySearchSolarReturn };
