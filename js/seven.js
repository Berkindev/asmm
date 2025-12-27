/**
 * AstroHarmony - Seven (7'ler Kanunu) Module
 * 7-year cycle calculation and rendering
 */

import { SIGNS, RULERS, ELEMENT_CYCLE, DEG_IN_MIN, SIGN_IN_MIN, PLANETS } from './data.js';
import { toMin, fmt, fmtAbsMin, elementOf } from './utils.js';
import { computeBaseSigns, computeSpan } from './decan.js';

// ========== SEVEN COMPUTATION ==========
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
      const startElem = [0, 4, 8].includes(startSignIdx) ? 'fire' : [1, 5, 9].includes(startSignIdx) ? 'earth' : [2, 6, 10].includes(startSignIdx) ? 'air' : 'water';
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

// ========== SEVEN RENDERING ==========
export function renderSeven(houses, planets, cusps, sameFlags, add30Flags, asc, container, aspects) {
  const SIGN_SYM = {"Koç":"♈","Boğa":"♉","İkizler":"♊","Yengeç":"♋","Aslan":"♌","Başak":"♍","Terazi":"♎","Akrep":"♏","Yay":"♐","Oğlak":"♑","Kova":"♒","Balık":"♓"};
  const RULER_SYM = {"Chiron":"⚷","Merkür":"☿️","Venüs":"♀️","Mars":"♂️","Jüpiter":"♃","Satürn":"♄","Uranüs":"♅","Neptün":"♆","Plüton":"♇","Ay":"☽","Güneş":"☉"};
  
  container.innerHTML = houses.map(h => {
    const birthYear = h.birthYear || new Date().getFullYear() - 30; // fallback
    
    let html = `<div class="house">
      <div class="title el-${elementOf(h.houseSign)}">
        <span class="pill" style="border-color:rgba(255,255,255,.25)">
          <span>${h.house}</span>
          <span style="opacity:.6">Ev</span>
          <span style="margin-left:4px">- ${SIGN_SYM[h.houseSign]} ${h.houseSign}</span>
        </span>
      </div>`;
    
    // Segments (7-year periods)
    h.segments.forEach(seg => {
      const startYear = birthYear + seg.startAge;
      const endYear = birthYear + seg.endAge;
      const decanClass = elementOf(seg.decanSign);
      
      html += `
        <div class="kv el-${decanClass}">
          <span class="label" style="min-width:90px">${seg.startAge}-${seg.endAge} yaş</span>
          <span class="years" style="color:var(--muted);font-size:11px">(${startYear}-${endYear})</span>
          <span class="degval">${seg.startText} → ${seg.endText}</span>
          <span class="info">${SIGN_SYM[seg.signStart]} ${seg.signStart}</span>
          <span class="dekan" style="margin-left:auto">Dekan: ${SIGN_SYM[seg.decanSign]} ${seg.decanSign} (${RULER_SYM[seg.decanRuler] || ''} ${seg.decanRuler})</span>
        </div>`;
    });
    
    html += `<div class="meta">Ev span: ${h.spanText} — Yıllık adım: ${h.stepText}</div>`;
    html += '</div>';
    return html;
  }).join('');
}
