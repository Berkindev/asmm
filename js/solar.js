/**
 * AstroHarmony - Solar Return Module
 * Solar Return calculations and rendering
 */

import { SIGNS, SIGN_SYM, MONTHS, PLANETS, RULERS, RULER_SYM, ELEMENT_CYCLE } from './data.js';
import { $, toMin, fmt, fmtAbsMin, elementOf } from './utils.js';
import { dateToJD, calcSunPosition, calculateChart, degToSignDegMin } from './calculations.js';
import { computeDecan } from './decan.js';

// ========== GLOBAL NATAL DATA REFERENCE ==========
// This will be set by the main module
let globalNatalData = null;

export function setGlobalNatalData(data) {
  globalNatalData = data;
}

export function getGlobalNatalData() {
  return globalNatalData;
}

// ========== UPDATE SOLAR NATAL INFO ==========
export function updateSolarNatalInfo() {
  const infoDiv = $('solarNatalInfo');
  const summaryDiv = $('solarNatalSummary');
  if (!infoDiv || !summaryDiv) return;
  
  if (!globalNatalData) {
    infoDiv.style.display = 'none';
    return;
  }
  
  const d = globalNatalData;
  const sunSign = SIGNS[d.chart.planets.sun.signIdx];
  const sunDeg = d.chart.planets.sun.deg;
  const sunMin = d.chart.planets.sun.min;
  
  summaryDiv.innerHTML = `
    <div><strong>Doğum:</strong> ${d.birthDay} ${MONTHS[d.birthMonth - 1]} ${d.birthYear}, ${String(d.birthHour).padStart(2,'0')}:${String(d.birthMinute).padStart(2,'0')}</div>
    <div style="margin-top:4px"><strong>Natal Güneş:</strong> ${SIGN_SYM[sunSign]} ${sunSign} ${sunDeg}°${String(sunMin).padStart(2,'0')}' <span style="color:var(--muted)">(${d.sunLongitude.toFixed(2)}°)</span></div>
  `;
  infoDiv.style.display = 'block';
}

// ========== JULIAN DATE TO DATETIME ==========
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
  
  return {
    day: day,
    month: month,
    year: year,
    hour: hour,
    minute: minute,
    approximate: false
  };
}

// ========== FIND SOLAR RETURN DATE ==========
export async function findSolarReturnDate(natalSunLong, solarYear) {
  if (!globalNatalData) return null;
  
  const birthDay = globalNatalData.birthDay;
  const birthMonth = globalNatalData.birthMonth;
  
  // Start search from a few days before expected birthday
  const startJD = dateToJD(solarYear, birthMonth, birthDay, 0, 0) - 5;
  
  try {
    // Use Swiss Ephemeris for EXACT calculation
    const { findSolarCross } = await import('../ephemeris.js');
    const exactJD = await findSolarCross(natalSunLong, startJD, 0);
    
    if (exactJD) {
      const result = jdToDateTime(exactJD);
      result.jd = exactJD;
      result.approximate = false;
      console.log(`✅ Swiss Ephemeris Solar Return: ${result.day}/${result.month}/${result.year} ${result.hour}:${String(result.minute).padStart(2,'0')}`);
      return result;
    }
  } catch (error) {
    console.warn('Swiss Ephemeris findSolarCross failed, using fallback:', error);
  }
  
  // Fallback to binary search if Swiss Ephemeris fails
  console.warn('Using fallback binary search for Solar Return');
  let searchStartJD = startJD;
  let searchEndJD = startJD + 10;
  
  const tolerance = 1 / 60; // 1 arcminute
  let iterations = 0;
  const maxIterations = 50;
  
  while (iterations < maxIterations) {
    const midJD = (searchStartJD + searchEndJD) / 2;
    const sunLong = calcSunPosition(midJD);
    
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

// ========== COMPUTE SOLAR RETURN ==========
export async function computeSolarReturn(solarYear) {
  if (!globalNatalData) {
    return { error: 'Natal veri bulunamadı. Önce Dekan sekmesinde hesaplama yapın.' };
  }
  
  const natal = globalNatalData;
  const natalSunLong = natal.sunLongitude;
  
  // Determine chart location based on user selection
  const useCustomLocation = $('solarLocCustom')?.checked;
  let chartLat = natal.lat;
  let chartLng = natal.lng;
  let chartLocationName = 'Doğum Yeri';
  
  if (useCustomLocation) {
    const customLat = parseFloat($('solarCustomLat')?.value);
    const customLng = parseFloat($('solarCustomLng')?.value);
    const customCity = $('solarCustomCity')?.value || 'Özel Konum';
    
    if (isNaN(customLat) || isNaN(customLng)) {
      return { error: 'Geçerli bir konum seçin veya koordinat girin.' };
    }
    
    chartLat = customLat;
    chartLng = customLng;
    chartLocationName = customCity;
  }
  
  // Find PRECISE solar return moment for this year
  const srDate = await findSolarReturnDate(natalSunLong, solarYear);
  if (!srDate) return { error: 'Solar return tarihi hesaplanamadı.' };
  
  // Find NEXT year's Solar Return for precise year length calculation
  const nextSrDate = await findSolarReturnDate(natalSunLong, solarYear + 1);
  
  // Calculate exact solar year length in days
  const srJD = srDate.jd || dateToJD(srDate.year, srDate.month, srDate.day, srDate.hour || 12, srDate.minute || 0);
  const nextSrJD = nextSrDate.jd || dateToJD(nextSrDate.year, nextSrDate.month, nextSrDate.day, nextSrDate.hour || 12, nextSrDate.minute || 0);
  const solarYearDays = nextSrJD - srJD;
  
  // Precise degree-to-day conversion
  const daysPerDegree = solarYearDays / 360;
  console.log(`📅 Solar Year Length: ${solarYearDays.toFixed(4)} days | Days per degree: ${daysPerDegree.toFixed(6)}`);
  console.log(`📍 Chart Location: ${chartLocationName} (${chartLat.toFixed(4)}, ${chartLng.toFixed(4)})`);
  
  try {
    const srHour = srDate.hour || 12;
    const srMinute = srDate.minute || 0;
    
    // CRITICAL: Swiss Ephemeris returns time in UT
    // tz = 0 because time is already in UT!
    const srChart = await calculateChart(
      srDate.year, srDate.month, srDate.day, 
      srHour, srMinute, 
      chartLat, chartLng, 
      0  // tz = 0 because time is already in UT
    );
    
    // Verify the Solar Sun matches Natal Sun
    const srSunLong = srChart.planets.sun.signIdx * 30 + srChart.planets.sun.deg + srChart.planets.sun.min / 60;
    console.log(`🌞 Solar Return Sun: ${srSunLong.toFixed(4)}° | Natal Sun: ${natalSunLong.toFixed(4)}° | Diff: ${Math.abs(srSunLong - natalSunLong).toFixed(4)}°`);
    
    // Helper: Add days to JD and convert to date
    function addDaysToDate(baseJD, days) {
      return jdToDateTime(baseJD + days);
    }
    
    // Build solar months
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthStartDegOffset = i * 30;
      const monthEndDegOffset = (i + 1) * 30;
      
      const monthStartDays = monthStartDegOffset * daysPerDegree;
      const monthEndDays = monthEndDegOffset * daysPerDegree;
      
      const monthStartDate = addDaysToDate(srJD, monthStartDays);
      const monthEndDate = addDaysToDate(srJD, monthEndDays - 1);
      
      const startStr = `${monthStartDate.day} ${MONTHS[monthStartDate.month - 1]} ${monthStartDate.year}`;
      const endStr = `${monthEndDate.day} ${MONTHS[monthEndDate.month - 1]} ${monthEndDate.year}`;
      const startDeg = (natalSunLong + i * 30) % 360;
      const endDeg = (natalSunLong + (i + 1) * 30) % 360;
      const monthDays = monthEndDays - monthStartDays;
      
      // Find planets in this solar house
      const inMonth = [];
      Object.entries(srChart.planets).forEach(([key, planet]) => {
        const planetLong = planet.signIdx * 30 + planet.deg + planet.min / 60;
        let offset = planetLong - natalSunLong;
        if (offset < 0) offset += 360;
        
        if (offset >= i * 30 && offset < (i + 1) * 30) {
          const planetDays = offset * daysPerDegree;
          const planetDate = addDaysToDate(srJD, planetDays);
          const dayInMonth = Math.round((offset - monthStartDegOffset) * daysPerDegree) + 1;
          
          const planetInfo = PLANETS.find(p => p.key === key);
          inMonth.push({
            key: key,
            name: planetInfo?.name || key,
            sym: planetInfo?.sym || '?',
            signIdx: planet.signIdx,
            deg: planet.deg,
            min: planet.min,
            totalDegrees: planetLong,
            degreeOffset: offset.toFixed(2),
            dayOffset: dayInMonth,
            dateStr: `${planetDate.day} ${MONTHS[planetDate.month - 1]} ${planetDate.year}`,
            fullDateStr: `${planetDate.day} ${MONTHS[planetDate.month - 1]} ${planetDate.year}${planetDate.hour !== undefined ? ` ~${String(planetDate.hour).padStart(2,'0')}:${String(planetDate.minute).padStart(2,'0')}` : ''}`,
            isStart: key === 'sun' && i === 0
          });
        }
      });
      
      inMonth.sort((a, b) => a.dayOffset - b.dayOffset);
      months.push({ 
        solarHouse: i + 1, 
        startDateStr: startStr, 
        endDateStr: endStr, 
        startDeg, 
        endDeg, 
        monthDays: Math.round(monthDays),
        planets: inMonth 
      });
    }
    
    // Calculate Dekan for Solar Return chart
    const srCusps = srChart.houses.map(h => ({ deg: h.deg, min: h.min }));
    const sameFlags = new Array(12).fill(false);
    const add30Flags = new Array(12).fill(false);
    const srDekan = computeDecan(srCusps, sameFlags, add30Flags, srChart.asc.signIdx);
    
    return {
      solarYear: solarYear,
      solarReturnDate: srDate,
      natalSun: {
        signIdx: Math.floor(natalSunLong / 30),
        deg: Math.floor(natalSunLong % 30),
        min: Math.round((natalSunLong % 1) * 60),
        longitude: natalSunLong
      },
      chartLocation: {
        name: chartLocationName,
        lat: chartLat,
        lng: chartLng
      },
      srChart: srChart,
      srDekan: srDekan,
      months: months
    };
  } catch (err) {
    console.error('Solar Return error:', err);
    return { error: 'Solar Return hesaplanamadı: ' + err.message };
  }
}

// ========== LEGACY COMPUTE SOLAR ==========
export function computeSolar(planets, birthDay, birthMonth, solarYear) {
  const sun = planets.find(p => p.key === 'sun');
  if (!sun) return null;
  const sunDeg = sun.totalDegrees, months = [];
  for (let i = 0; i < 12; i++) {
    let mNum = birthMonth + i, yr = solarYear;
    if (mNum > 12) { mNum -= 12; yr++; }
    let nMNum = mNum + 1, nYr = yr;
    if (nMNum > 12) { nMNum -= 12; nYr++; }
    const startStr = `${birthDay} ${MONTHS[mNum - 1]} ${yr}`;
    const endStr = `${birthDay - 1 || 30} ${MONTHS[nMNum - 1]} ${nYr}`;
    const startDeg = (sunDeg + i * 30) % 360, endDeg = (sunDeg + (i + 1) * 30) % 360;
    const inMonth = [];
    planets.forEach(pl => {
      if (pl.key === 'sun' && i === 0) {
        inMonth.push({...pl, dayOffset: 0, dateStr: `${birthDay} ${MONTHS[mNum - 1]} ${yr}`, isStart: true});
        return;
      }
      let off = pl.totalDegrees - sunDeg;
      if (off < 0) off += 360;
      if (off >= i * 30 && off < (i + 1) * 30) {
        const dayOff = off - i * 30, dayNum = Math.round(birthDay + dayOff);
        let pM = mNum, pY = yr, pD = dayNum;
        if (pD > 30) { pD -= 30; pM++; if (pM > 12) { pM -= 12; pY++; } }
        inMonth.push({...pl, dayOffset: Math.round(dayOff), dateStr: `${pD} ${MONTHS[pM - 1]} ${pY}`, isStart: false});
      }
    });
    inMonth.sort((a, b) => a.dayOffset - b.dayOffset);
    months.push({solarHouse: i + 1, startDateStr: startStr, endDateStr: endStr, startDeg, endDeg, planets: inMonth});
  }
  return {sunPosition: sun, months};
}

// ========== RENDER SOLAR ==========
export function renderSolar(data, container) {
  if (!data || !data.months) {
    container.innerHTML = '<p class="hint" style="color:var(--err)">Solar veri bulunamadı.</p>';
    return;
  }
  
  container.innerHTML = data.months.map(m => {
    let html = `<div class="house">
      <div class="title" style="background:rgba(245,158,11,.12)">
        <span class="pill" style="border-color:rgba(245,158,11,.5);color:var(--accent-3)">
          <span>${m.solarHouse}</span>
          <span style="opacity:.6">Solar Ev</span>
        </span>
        <span style="margin-left:12px;color:var(--muted);font-size:13px">${m.startDateStr} → ${m.endDateStr}</span>
      </div>`;
    
    if (m.planets.length) {
      m.planets.forEach(p => {
        const pSign = SIGNS[p.signIdx];
        html += `
          <div class="kv el-${elementOf(pSign)}">
            <span class="label">${p.sym} ${p.name}</span>
            <span class="degval">${SIGN_SYM[pSign]} ${p.deg}°${String(p.min).padStart(2,'0')}'</span>
            <span class="info" style="color:var(--muted)">~${p.dateStr}</span>
            ${p.isStart ? '<span style="color:var(--accent-3)">(Yıl Başı)</span>' : ''}
          </div>`;
      });
    } else {
      html += '<div class="kv"><span style="color:var(--muted)">Bu evde gezegen yok</span></div>';
    }
    
    html += '</div>';
    return html;
  }).join('');
}

// ========== RENDER SOLAR RETURN ==========
export function renderSolarReturn(data, container) {
  if (!data) {
    container.innerHTML = '<p class="hint" style="color:var(--err)">Veri bulunamadı.</p>';
    return;
  }
  
  if (data.error) {
    container.innerHTML = `<p class="hint" style="color:var(--err)">${data.error}</p>`;
    return;
  }
  
  // Main container with two columns
  container.innerHTML = `
    <div class="solar-results-container" style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
      <div class="solar-dekan-col" id="solarDekanResults"></div>
      <div class="solar-month-col" id="solarMonthResults"></div>
    </div>
  `;
  
  const dekanPanel = container.querySelector('#solarDekanResults');
  const monthPanel = container.querySelector('#solarMonthResults');
  
  // Solar Return info header
  const srDate = data.solarReturnDate;
  const natalSun = data.natalSun;
  const srChart = data.srChart;
  
  const natalSunSign = SIGNS[natalSun.signIdx];
  const srSunSign = SIGNS[srChart.planets.sun.signIdx];
  const srAscSign = SIGNS[srChart.asc.signIdx];
  
  const infoHeader = `
    <div style="background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);border-radius:12px;padding:16px;margin-bottom:16px">
      <div style="font-size:18px;font-weight:800;color:var(--accent-3);margin-bottom:12px">
        🌞 Solar Return ${data.solarYear}
      </div>
      <div style="display:grid;gap:8px;font-size:14px">
        <div><strong>📍 Konum:</strong> ${data.chartLocation.name}</div>
        <div><strong>🎂 Natal Güneş:</strong> ${SIGN_SYM[natalSunSign]} ${natalSunSign} ${natalSun.deg}°${String(natalSun.min).padStart(2,'0')}' <span style="color:var(--muted)">(${natalSun.longitude.toFixed(2)}°)</span></div>
        <div><strong>☀️ SR Güneş:</strong> ${SIGN_SYM[srSunSign]} ${srSunSign} ${srChart.planets.sun.deg}°${String(srChart.planets.sun.min).padStart(2,'0')}'</div>
        <div><strong>📅 SR Tarihi:</strong> ${srDate.day} ${MONTHS[srDate.month - 1]} ${srDate.year} ${String(srDate.hour || 0).padStart(2,'0')}:${String(srDate.minute || 0).padStart(2,'0')} UT</div>
        <div><strong>⬆️ SR Yükselen:</strong> ${SIGN_SYM[srAscSign]} ${srAscSign} ${srChart.asc.deg}°${String(srChart.asc.min).padStart(2,'0')}'</div>
      </div>
    </div>
  `;
  
  // Render Dekan results
  dekanPanel.innerHTML = infoHeader + '<h3 style="color:var(--accent);margin-bottom:12px">📊 Solar Return Haritası - Dekanlar</h3>';
  
  // Render each house with its dekans
  const srDekan = data.srDekan;
  srDekan.forEach(h => {
    const houseSign = SIGNS[h.houseSignIdx];
    let houseHtml = `
      <div class="house" style="margin-bottom:12px">
        <div class="title el-${elementOf(houseSign)}">
          <span class="pill" style="border-color:rgba(255,255,255,.25)">
            <span>${h.house}</span>
            <span style="opacity:.6">Ev</span>
            <span style="margin-left:4px">- ${SIGN_SYM[houseSign]} ${houseSign}</span>
          </span>
        </div>`;
    
    h.decans.forEach(d => {
      const decanClass = elementOf(d.decanSign);
      houseHtml += `
        <div class="kv el-${decanClass}">
          <span class="label">${d.index}.dekan</span>
          <span class="degval">${d.startText}</span>
          <span class="info">Ev: ${SIGN_SYM[houseSign]} ${houseSign}</span>
          <span class="dekan">Dekan: ${SIGN_SYM[d.decanSign]} ${d.decanSign} (${RULER_SYM[d.ruler] || ''} ${d.ruler})</span>
        </div>`;
      
      // Show planets in this dekan
      const planetsInDekan = Object.entries(srChart.planets).filter(([key, planet]) => {
        if (!planet) return false;
        const cm = toMin(h.house === 1 ? srChart.houses[0].deg : data.srDekan[h.house - 1].decans[0].start.deg,
                         h.house === 1 ? srChart.houses[0].min : data.srDekan[h.house - 1].decans[0].start.min);
        return planet.house === h.house;
      });
      
      // Simplified planet display for dekans
      Object.entries(srChart.planets).forEach(([key, planet]) => {
        if (!planet || planet.house !== h.house) return;
        const planetInfo = PLANETS.find(p => p.key === key);
        if (!planetInfo) return;
        const pSign = SIGNS[planet.signIdx];
        const pElem = elementOf(pSign);
        houseHtml += `
          <div class="planet-in-dekan el-${pElem}" style="margin-left:24px;padding:6px 12px;background:rgba(255,255,255,.03);border-radius:8px;margin-top:4px">
            <span style="font-size:16px">${planetInfo.sym}</span>
            <span style="font-weight:700">${planetInfo.name}</span>
            <span class="degval" style="color:var(--accent)">${SIGN_SYM[pSign]} ${planet.deg}°${String(planet.min).padStart(2,'0')}'</span>
          </div>`;
      });
    });
    
    houseHtml += `<div class="meta">Ev span: ${h.meta.spanText} — Dekan: ${h.meta.decanSizeText}</div></div>`;
    dekanPanel.innerHTML += houseHtml;
  });
  
  // Render Monthly events
  monthPanel.innerHTML = '<h3 style="color:var(--accent-3);margin-bottom:12px">📅 Aylık Gezegensel Olaylar</h3>';
  
  data.months.forEach(m => {
    const startDegSign = degToSignDegMin(m.startDeg);
    const endDegSign = degToSignDegMin(m.endDeg);
    
    let monthHtml = `
      <div class="house" style="margin-bottom:12px;border-color:rgba(245,158,11,.25)">
        <div class="title" style="background:rgba(245,158,11,.08)">
          <span class="pill" style="border-color:rgba(245,158,11,.4);color:var(--accent-3)">
            <span>${m.solarHouse}</span>
            <span style="opacity:.6">Solar Ay</span>
          </span>
          <span style="margin-left:8px;font-size:12px;color:var(--muted)">${m.monthDays || 30} gün</span>
        </div>
        <div style="padding:8px 12px;font-size:12px;color:var(--muted)">
          ${m.startDateStr} → ${m.endDateStr}
          <span style="margin-left:8px">(${SIGN_SYM[SIGNS[startDegSign.signIdx]]} ${startDegSign.deg}° → ${SIGN_SYM[SIGNS[endDegSign.signIdx]]} ${endDegSign.deg}°)</span>
        </div>`;
    
    if (m.planets.length) {
      m.planets.forEach(p => {
        const pSign = SIGNS[p.signIdx];
        monthHtml += `
          <div class="kv el-${elementOf(pSign)}">
            <span class="label">${p.sym} ${p.name}</span>
            <span class="degval">${SIGN_SYM[pSign]} ${p.deg}°${String(p.min).padStart(2,'0')}'</span>
            <span class="info" style="color:var(--muted)">~${p.fullDateStr || p.dateStr}</span>
            <span style="font-size:11px;color:var(--accent-3)">(+${p.degreeOffset}°)</span>
            ${p.isStart ? '<span style="color:var(--accent-3);font-weight:800">(Yıl Başı)</span>' : ''}
          </div>`;
      });
    } else {
      monthHtml += '<div class="kv"><span style="color:var(--muted)">Bu ayda gezegen yok</span></div>';
    }
    
    monthHtml += '</div>';
    monthPanel.innerHTML += monthHtml;
  });
}
