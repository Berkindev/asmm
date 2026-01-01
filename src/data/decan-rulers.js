/**
 * Decan ruler data - maps degree ranges to ruling planets
 * Each sign (30°) is divided into 3 decans of 10° each
 */

import { SIGNS } from './zodiac.js';

// Decan rulers by sign (Chaldean order)
export const DECAN_RULERS = {
  'Koç': ['Mars', 'Güneş', 'Venüs'],
  'Boğa': ['Merkür', 'Ay', 'Satürn'],
  'İkizler': ['Jüpiter', 'Mars', 'Güneş'],
  'Yengeç': ['Venüs', 'Merkür', 'Ay'],
  'Aslan': ['Satürn', 'Jüpiter', 'Mars'],
  'Başak': ['Güneş', 'Venüs', 'Merkür'],
  'Terazi': ['Ay', 'Satürn', 'Jüpiter'],
  'Akrep': ['Mars', 'Güneş', 'Venüs'],
  'Yay': ['Merkür', 'Ay', 'Satürn'],
  'Oğlak': ['Jüpiter', 'Mars', 'Güneş'],
  'Kova': ['Venüs', 'Merkür', 'Ay'],
  'Balık': ['Satürn', 'Jüpiter', 'Mars']
};

// Decan signs (which sign rules each decan)
export const DECAN_SIGNS = {
  'Koç': ['Koç', 'Aslan', 'Yay'],
  'Boğa': ['Boğa', 'Başak', 'Oğlak'],
  'İkizler': ['İkizler', 'Terazi', 'Kova'],
  'Yengeç': ['Yengeç', 'Akrep', 'Balık'],
  'Aslan': ['Aslan', 'Yay', 'Koç'],
  'Başak': ['Başak', 'Oğlak', 'Boğa'],
  'Terazi': ['Terazi', 'Kova', 'İkizler'],
  'Akrep': ['Akrep', 'Balık', 'Yengeç'],
  'Yay': ['Yay', 'Koç', 'Aslan'],
  'Oğlak': ['Oğlak', 'Boğa', 'Başak'],
  'Kova': ['Kova', 'İkizler', 'Terazi'],
  'Balık': ['Balık', 'Yengeç', 'Akrep']
};

/**
 * Get decan info for a position
 * @param {number} signIdx - Sign index (0-11)
 * @param {number} degree - Degree within sign (0-29)
 * @returns {Object} Decan info {number, sign, ruler}
 */
export function getDecanInfo(signIdx, degree) {
  const sign = SIGNS[signIdx];
  const decanNum = Math.floor(degree / 10); // 0, 1, or 2
  
  return {
    number: decanNum + 1,
    sign: DECAN_SIGNS[sign]?.[decanNum] || sign,
    ruler: DECAN_RULERS[sign]?.[decanNum] || 'Mars'
  };
}

/**
 * Calculate which decan a position falls into and get full info
 */
export function calculateDecan(longitude) {
  const signIdx = Math.floor(longitude / 30) % 12;
  const degInSign = longitude % 30;
  const decanNum = Math.floor(degInSign / 10);
  const sign = SIGNS[signIdx];
  
  return {
    signIdx,
    sign,
    degree: degInSign,
    decanNumber: decanNum + 1,
    decanSign: DECAN_SIGNS[sign]?.[decanNum] || sign,
    decanRuler: DECAN_RULERS[sign]?.[decanNum] || 'Mars'
  };
}
