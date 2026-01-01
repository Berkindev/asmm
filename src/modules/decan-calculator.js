/**
 * Decan Calculator Module
 * Calculates house decans and 7-year periods (Firdaria style)
 */

import { SIGNS, SIGN_EL } from '../data/zodiac.js';
import { ELEMENT_CYCLE, DEG_IN_MIN, SIGN_IN_MIN, RULERS } from '../data/countries.js';

// Helper functions
const toMin = (d, m) => (Number(d) || 0) * 60 + (Number(m) || 0);
const fmt = ({ deg, min }) => `${deg}° ${String(min).padStart(2, '0')}'`;
const fmtAbsMin = m => `${Math.floor(Math.round(m) / 60)}° ${String(Math.round(m) % 60).padStart(2, '0')}'`;

/**
 * Compute base signs for houses based on ASC and flags
 */
export function computeBaseSigns(asc, sameFlags, add30Flags) {
  const bs = [((asc % 12) + 12) % 12];
  for (let i = 1; i < 12; i++) {
    bs[i] = sameFlags[i - 1] ? bs[i - 1] : (bs[i - 1] + 1 + (add30Flags[i - 1] ? 1 : 0)) % 12;
  }
  return bs;
}

/**
 * Compute span between house cusps
 */
export function computeSpan(cur, next, same, add30) {
  return same 
    ? (next >= cur ? next - cur : SIGN_IN_MIN - cur + next) 
    : (SIGN_IN_MIN - cur) + next + (add30 ? SIGN_IN_MIN : 0);
}

/**
 * Calculate decans for all 12 houses
 * @param {Array} cusps - House cusp degrees/minutes
 * @param {Array} sameFlags - Same sign flags for each house
 * @param {Array} add30Flags - +30° flags for each house
 * @param {number} asc - ASC sign index
 * @returns {Array} Decan results for each house
 */
export function computeDecan(cusps, sameFlags, add30Flags, asc) {
  const cm = cusps.map(c => toMin(c.deg, c.min));
  const bs = computeBaseSigns(asc, sameFlags, add30Flags);
  const results = [];
  
  for (let i = 0; i < 12; i++) {
    const cur = cm[i];
    const next = cm[(i + 1) % 12];
    const span = computeSpan(cur, next, sameFlags[i], add30Flags[i]);
    const decSize = span / 3;
    
    const ev = {
      house: i + 1,
      houseSignIdx: bs[i],
      houseSign: SIGNS[bs[i]],
      meta: {
        spanMin: span,
        decanSizeMin: decSize,
        spanText: fmtAbsMin(span),
        decanSizeText: fmtAbsMin(decSize)
      }
    };
    
    ev.decans = [0, decSize, decSize * 2].map((off, idx) => {
      const a = cur + off;
      const signAdv = Math.floor(a / SIGN_IN_MIN);
      const within = a - signAdv * SIGN_IN_MIN;
      let deg = Math.floor(within / DEG_IN_MIN);
      let min = Math.round(within % DEG_IN_MIN);
      if (min === 60) { deg++; min = 0; }
      
      const runIdx = (bs[i] + signAdv) % 12;
      const band = within < 10 * DEG_IN_MIN ? 0 : within < 20 * DEG_IN_MIN ? 1 : 2;
      const elem = [0, 4, 8].includes(runIdx) ? 'fire' : 
                   [1, 5, 9].includes(runIdx) ? 'earth' : 
                   [2, 6, 10].includes(runIdx) ? 'air' : 'water';
      
      const cyc = ELEMENT_CYCLE[elem];
      const pos = cyc.indexOf(runIdx);
      const decSignIdx = cyc[(pos + band) % 3];
      
      return {
        index: idx + 1,
        start: { deg, min },
        startText: fmt({ deg, min }),
        absStartMin: off,
        positionSign: SIGNS[runIdx],
        positionSignIdx: runIdx,
        decanSign: SIGNS[decSignIdx],
        ruler: RULERS[decSignIdx]
      };
    });
    
    results.push(ev);
  }
  
  return results;
}

/**
 * Calculate 7-year life periods for each house
 * @param {Array} cusps - House cusp degrees/minutes
 * @param {Array} sameFlags - Same sign flags
 * @param {Array} add30Flags - +30° flags
 * @param {number} asc - ASC sign index
 * @param {number} birthYear - Birth year
 * @returns {Array} 7-year period results for each house
 */
export function computeSeven(cusps, sameFlags, add30Flags, asc, birthYear) {
  const cm = cusps.map(c => toMin(c.deg, c.min));
  const bs = computeBaseSigns(asc, sameFlags, add30Flags);
  const houses = [];
  
  for (let i = 0; i < 12; i++) {
    const cur = cm[i];
    const next = cm[(i + 1) % 12];
    const span = computeSpan(cur, next, sameFlags[i], add30Flags[i]);
    const step = span / 7;
    const segs = [];
    
    for (let y = 1; y <= 7; y++) {
      const startAge = i * 7 + (y - 1);
      const endAge = startAge + 1;
      const off0 = step * (y - 1);
      const off1 = step * y;
      
      const a0 = cur + off0;
      const a1 = cur + off1;
      const sAdv0 = Math.floor(a0 / SIGN_IN_MIN);
      const sAdv1 = Math.floor(a1 / SIGN_IN_MIN);
      const w0 = a0 - sAdv0 * SIGN_IN_MIN;
      const w1 = a1 - sAdv1 * SIGN_IN_MIN;
      
      const s0 = { deg: Math.floor(w0 / DEG_IN_MIN), min: Math.round(w0 % DEG_IN_MIN) };
      const s1 = { deg: Math.floor(w1 / DEG_IN_MIN), min: Math.round(w1 % DEG_IN_MIN) };
      if (s0.min === 60) { s0.deg++; s0.min = 0; }
      if (s1.min === 60) { s1.deg++; s1.min = 0; }
      
      // Calculate decan for start position
      const startSignIdx = (bs[i] + sAdv0) % 12;
      const startBand = w0 < 10 * DEG_IN_MIN ? 0 : w0 < 20 * DEG_IN_MIN ? 1 : 2;
      const startElem = [0, 4, 8].includes(startSignIdx) ? 'fire' : 
                        [1, 5, 9].includes(startSignIdx) ? 'earth' : 
                        [2, 6, 10].includes(startSignIdx) ? 'air' : 'water';
      const startCyc = ELEMENT_CYCLE[startElem];
      const startPos = startCyc.indexOf(startSignIdx);
      const startDecanIdx = startCyc[(startPos + startBand) % 3];
      
      segs.push({
        startAge,
        endAge,
        absStartMin: off0,
        absEndMin: off1,
        startText: fmt(s0),
        endText: fmt(s1),
        signStart: SIGNS[startSignIdx],
        signEnd: SIGNS[(bs[i] + sAdv1) % 12],
        decanSign: SIGNS[startDecanIdx],
        decanRuler: RULERS[startDecanIdx]
      });
    }
    
    houses.push({
      house: i + 1,
      houseSign: SIGNS[bs[i]],
      spanMin: span,
      stepMin: step,
      spanText: fmtAbsMin(span),
      stepText: fmtAbsMin(step),
      birthYear,
      segments: segs
    });
  }
  
  return houses;
}

/**
 * Get element for a sign index
 */
export function getElement(signIdx) {
  return [0, 4, 8].includes(signIdx) ? 'fire' : 
         [1, 5, 9].includes(signIdx) ? 'earth' : 
         [2, 6, 10].includes(signIdx) ? 'air' : 'water';
}

export { fmt, fmtAbsMin, toMin };
