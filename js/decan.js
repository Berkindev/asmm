/**
 * AstroHarmony - Dekan Module
 * Dekan calculation and rendering
 */

import { SIGNS, RULERS, ELEMENT_CYCLE, DEG_IN_MIN, SIGN_IN_MIN, PLANETS } from './data.js';
import { toMin, fmt, fmtAbsMin, elementOf } from './utils.js';

// ========== BASE SIGN COMPUTATION ==========
export function computeBaseSigns(asc, sameFlags, add30Flags) {
  const bs = [((asc % 12) + 12) % 12];
  for (let i = 1; i < 12; i++) {
    bs[i] = sameFlags[i - 1] ? bs[i - 1] : (bs[i - 1] + 1 + (add30Flags[i - 1] ? 1 : 0)) % 12;
  }
  return bs;
}

// ========== SPAN COMPUTATION ==========
export function computeSpan(cur, next, same, add30) {
  return same ? (next >= cur ? next - cur : SIGN_IN_MIN - cur + next) : (SIGN_IN_MIN - cur) + next + (add30 ? SIGN_IN_MIN : 0);
}

// ========== DEKAN COMPUTATION ==========
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
      const elem = [0, 4, 8].includes(runIdx) ? 'fire' : [1, 5, 9].includes(runIdx) ? 'earth' : [2, 6, 10].includes(runIdx) ? 'air' : 'water';
      const cyc = ELEMENT_CYCLE[elem];
      const pos = cyc.indexOf(runIdx);
      const decSignIdx = cyc[(pos + band) % 3];
      
      return {
        index: idx + 1,
        start: { deg, min },
        startText: fmt({ deg, min }),
        absStartMin: off,
        decanSign: SIGNS[decSignIdx],
        ruler: RULERS[decSignIdx]
      };
    });
    
    results.push(ev);
  }
  
  return results;
}

// ========== DEKAN RENDERING ==========
export function renderDecan(results, planets, cusps, sameFlags, add30Flags, asc, container, aspects) {
  const SIGN_SYM = {"Koç":"♈","Boğa":"♉","İkizler":"♊","Yengeç":"♋","Aslan":"♌","Başak":"♍","Terazi":"♎","Akrep":"♏","Yay":"♐","Oğlak":"♑","Kova":"♒","Balık":"♓"};
  const RULER_SYM = {"Chiron":"⚷","Merkür":"☿️","Venüs":"♀️","Mars":"♂️","Jüpiter":"♃","Satürn":"♄","Uranüs":"♅","Neptün":"♆","Plüton":"♇","Ay":"☽","Güneş":"☉"};
  
  container.innerHTML = results.map(h => {
    // Find planets in this house
    const inHouse = PLANETS.filter(p => {
      const pdata = planets[p.key];
      return pdata && pdata.house === h.house;
    });
    
    let html = `<div class="house">
      <div class="title el-${elementOf(h.houseSign)}">
        <span class="pill" style="border-color:rgba(255,255,255,.25)">
          <span>${h.house}</span>
          <span style="opacity:.6">Ev</span>
          <span style="margin-left:4px">- ${SIGN_SYM[h.houseSign]} ${h.houseSign}</span>
        </span>
      </div>`;
    
    // Dekan entries
    h.decans.forEach((d, idx) => {
      const decanClass = elementOf(d.decanSign);
      html += `
        <div class="kv el-${decanClass}">
          <span class="label">${d.index}.dekan</span>
          <span class="degval">${d.startText}</span>
          <span class="info">Ev: ${SIGN_SYM[h.houseSign]} ${h.houseSign}</span>
          <span class="dekan">Dekan: ${SIGN_SYM[d.decanSign]} ${d.decanSign} (${RULER_SYM[d.ruler] || ''} ${d.ruler})</span>
        </div>`;
      
      // Planets in this dekan range
      const nextDecanStart = h.decans[idx + 1]?.absStartMin ?? h.meta.spanMin;
      inHouse.forEach(p => {
        const pd = planets[p.key];
        if (!pd) return;
        const planetMin = toMin(pd.deg, pd.min);
        const houseStartMin = toMin(cusps[h.house - 1].deg, cusps[h.house - 1].min);
        let offsetInHouse = planetMin - houseStartMin;
        if (offsetInHouse < 0) offsetInHouse += SIGN_IN_MIN;
        
        if (offsetInHouse >= d.absStartMin && offsetInHouse < nextDecanStart) {
          const pSignIdx = pd.signIdx;
          const pSign = SIGNS[pSignIdx];
          const pElem = elementOf(pSign);
          html += `
            <div class="planet-in-dekan el-${pElem}" style="margin-left:24px;padding:6px 12px;background:rgba(255,255,255,.03);border-radius:8px;margin-top:4px">
              <span style="font-size:16px">${p.sym}</span>
              <span style="font-weight:700">${p.name}</span>
              <span class="degval" style="color:var(--accent)">${SIGN_SYM[pSign]} ${pd.deg}°${String(pd.min).padStart(2,'0')}'</span>
            </div>`;
        }
      });
    });
    
    html += `<div class="meta">Ev span: ${h.meta.spanText} — Dekan: ${h.meta.decanSizeText}</div>`;
    html += '</div>';
    return html;
  }).join('');
}
