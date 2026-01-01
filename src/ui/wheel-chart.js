/**
 * Wheel Chart Renderer
 * Draws the main astrological chart wheel using SVG
 */

import { SIGNS, SIGN_SYM, SIGN_EL, EL_COLORS, EL_COLORS_LIGHT } from '../data/zodiac.js';
import { PLANET_LIST, PLANET_SYMBOLS, PLANET_NAMES, PLANET_COLORS } from '../data/planets.js';
import { ASPECT_COLORS } from '../data/aspects.js';
import { calculateChartAspects } from '../modules/aspect-calculator.js';
import { hexToRgb } from '../utils/date-utils.js';

// Chart dimensions
const CHART_CONFIG = {
  cx: 700,
  cy: 700,
  radiusOuter: 580,
  radiusZodiac: 510,
  radiusHouse: 430,
  radiusInner: 320,
  viewBox: '0 0 1400 1400'
};

// State
let lastChartData = null;

/**
 * Get enabled planets from toggle checkboxes
 */
function getEnabledPlanets() {
  const enabled = {};
  PLANET_LIST.forEach(key => {
    const toggle = document.getElementById(`planet_toggle_${key}`);
    enabled[key] = toggle ? toggle.checked : true;
  });
  return enabled;
}

/**
 * Convert ecliptic degrees to chart angle (relative to ASC)
 */
function createAngleConverter(ascLong) {
  const { cx, cy } = CHART_CONFIG;
  
  const toAngle = (eclipticDeg) => {
    const relDeg = eclipticDeg - ascLong;
    const chartDeg = 180 + relDeg;
    return chartDeg * Math.PI / 180;
  };
  
  const polarX = (r, eclipticDeg) => cx + r * Math.cos(toAngle(eclipticDeg));
  const polarY = (r, eclipticDeg) => cy - r * Math.sin(toAngle(eclipticDeg));
  
  return { toAngle, polarX, polarY };
}

/**
 * Draw the zodiac ring segments
 */
function drawZodiacRing(converter) {
  const { cx, cy, radiusOuter, radiusZodiac } = CHART_CONFIG;
  const { toAngle, polarX, polarY } = converter;
  
  let html = '';
  
  for (let i = 0; i < 12; i++) {
    const startDeg = i * 30;
    const endDeg = (i + 1) * 30;
    const midDeg = startDeg + 15;
    const element = SIGN_EL[i];
    const color = EL_COLORS[element];
    
    const a1 = toAngle(startDeg), a2 = toAngle(endDeg);
    const x1o = cx + radiusOuter * Math.cos(a1), y1o = cy - radiusOuter * Math.sin(a1);
    const x2o = cx + radiusOuter * Math.cos(a2), y2o = cy - radiusOuter * Math.sin(a2);
    const x1z = cx + radiusZodiac * Math.cos(a1), y1z = cy - radiusZodiac * Math.sin(a1);
    const x2z = cx + radiusZodiac * Math.cos(a2), y2z = cy - radiusZodiac * Math.sin(a2);
    
    // Segment background
    html += `<path d="M ${x1z} ${y1z} L ${x1o} ${y1o} A ${radiusOuter} ${radiusOuter} 0 0 0 ${x2o} ${y2o} L ${x2z} ${y2z} A ${radiusZodiac} ${radiusZodiac} 0 0 1 ${x1z} ${y1z}" fill="${color}" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"/>`;
    
    // Sign symbol
    const symX = polarX((radiusOuter + radiusZodiac) / 2, midDeg);
    const symY = polarY((radiusOuter + radiusZodiac) / 2, midDeg);
    html += `<text x="${symX}" y="${symY}" text-anchor="middle" dominant-baseline="central" fill="#FFFFFF" font-size="34" font-weight="bold" style="filter: drop-shadow(1px 1px 2px rgba(0,0,0,0.8))">${SIGN_SYM[SIGNS[i]]}</text>`;
    
    // Degree ticks
    for (let d = 0; d < 30; d++) {
      const markerDeg = startDeg + d;
      const markerA = toAngle(markerDeg);
      const x1m = cx + radiusOuter * Math.cos(markerA);
      const y1m = cy - radiusOuter * Math.sin(markerA);
      const tickLen = d % 5 === 0 ? 10 : 5;
      const tickWidth = d % 5 === 0 ? 1.5 : 0.8;
      const x2m = cx + (radiusOuter - tickLen) * Math.cos(markerA);
      const y2m = cy - (radiusOuter - tickLen) * Math.sin(markerA);
      html += `<line x1="${x1m}" y1="${y1m}" x2="${x2m}" y2="${y2m}" stroke="rgba(255,255,255,0.7)" stroke-width="${tickWidth}"/>`;
    }
    
    // Segment divider
    html += `<line x1="${x1z}" y1="${y1z}" x2="${x1o}" y2="${y1o}" stroke="rgba(0,0,0,0.5)" stroke-width="1"/>`;
  }
  
  return html;
}

/**
 * Draw house lines and numbers
 */
function drawHouses(chartData, converter, decanResults) {
  const { cx, cy, radiusZodiac, radiusHouse, radiusInner, radiusOuter } = CHART_CONFIG;
  const { toAngle, polarX, polarY } = converter;
  
  let html = '';
  
  if (!chartData.houses) return html;
  
  // House circle
  html += `<circle cx="${cx}" cy="${cy}" r="${radiusHouse}" fill="none" stroke="rgba(100,100,100,0.5)" stroke-width="1"/>`;
  
  // Decan backgrounds
  if (decanResults && decanResults.length > 0) {
    decanResults.forEach(house => {
      if (!house.decans || !house.meta || !chartData.houses[house.house - 1]) return;
      
      const houseCusp = chartData.houses[house.house - 1];
      const cuspDeg = houseCusp.signIdx * 30 + houseCusp.deg + houseCusp.min / 60;
      
      house.decans.forEach((decan, di) => {
        const decanStart = cuspDeg + di * (house.meta.decanSizeMin / 60);
        const decanEnd = cuspDeg + (di + 1) * (house.meta.decanSizeMin / 60);
        
        const decanSignIdx = SIGNS.indexOf(decan.decanSign);
        const decanElement = SIGN_EL[decanSignIdx] || 'fire';
        const decanBgColor = EL_COLORS_LIGHT[decanElement];
        
        const a1 = toAngle(decanStart), a2 = toAngle(decanEnd);
        const x1h = cx + radiusHouse * Math.cos(a1), y1h = cy - radiusHouse * Math.sin(a1);
        const x2h = cx + radiusHouse * Math.cos(a2), y2h = cy - radiusHouse * Math.sin(a2);
        const x1i = cx + radiusInner * Math.cos(a1), y1i = cy - radiusInner * Math.sin(a1);
        const x2i = cx + radiusInner * Math.cos(a2), y2i = cy - radiusInner * Math.sin(a2);
        
        const spanDeg = Math.abs(decanEnd - decanStart);
        const largeArc = spanDeg > 180 ? 1 : 0;
        
        html += `<path d="M ${x1i} ${y1i} L ${x1h} ${y1h} A ${radiusHouse} ${radiusHouse} 0 ${largeArc} 0 ${x2h} ${y2h} L ${x2i} ${y2i} A ${radiusInner} ${radiusInner} 0 ${largeArc} 1 ${x1i} ${y1i}" fill="${decanBgColor}" stroke="${EL_COLORS[decanElement]}" stroke-width="0.5" stroke-opacity="0.4"/>`;
      });
    });
  }
  
  // House lines
  chartData.houses.forEach((h, i) => {
    const deg = h.signIdx * 30 + h.deg + h.min / 60;
    const x1 = polarX(radiusInner, deg);
    const y1 = polarY(radiusInner, deg);
    const x2 = polarX(radiusZodiac, deg);
    const y2 = polarY(radiusZodiac, deg);
    
    const isCardinal = (i === 0 || i === 3 || i === 6 || i === 9);
    const lineColor = isCardinal ? '#E53935' : 'rgba(150,150,150,0.6)';
    const lineWidth = isCardinal ? 2.5 : 1;
    html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lineColor}" stroke-width="${lineWidth}"/>`;
    
    // House number
    const nextH = chartData.houses[(i + 1) % 12];
    let nextDeg = nextH.signIdx * 30 + nextH.deg + nextH.min / 60;
    let span = nextDeg - deg;
    if (span < 0) span += 360;
    const midDeg = deg + span / 2;
    
    const numRadius = (radiusHouse + radiusInner) / 2 - 25;
    const numX = polarX(numRadius, midDeg);
    const numY = polarY(numRadius, midDeg);
    html += `<circle cx="${numX}" cy="${numY}" r="12" fill="rgba(11, 15, 20, 0.8)" stroke="rgba(150,150,150,0.3)" stroke-width="1"/>`;
    html += `<text x="${numX}" y="${numY + 1}" text-anchor="middle" dominant-baseline="central" fill="rgba(255,255,255,0.8)" font-size="11" font-weight="bold">${i + 1}</text>`;
    
    // Cusp degree
    const degText = `${h.deg}°${String(h.min).padStart(2, '0')}'`;
    const degLabelX = polarX(radiusZodiac - 25, deg + 3);
    const degLabelY = polarY(radiusZodiac - 25, deg + 3);
    const degColor = isCardinal ? '#E53935' : 'rgba(200,200,200,0.7)';
    html += `<text x="${degLabelX}" y="${degLabelY}" text-anchor="middle" dominant-baseline="central" fill="${degColor}" font-size="9" font-weight="600">${degText}</text>`;
    
    // ASC/IC/DES/MC labels
    if (isCardinal) {
      const labels = { 0: 'ASC', 3: 'IC', 6: 'DES', 9: 'MC' };
      const label = labels[i];
      if (label) {
        html += `<text x="${polarX(radiusOuter + 35, deg)}" y="${polarY(radiusOuter + 35, deg)}" text-anchor="middle" dominant-baseline="central" fill="#E53935" font-size="13" font-weight="bold" style="filter: drop-shadow(0 0 3px rgba(229,57,53,0.5))">${label}</text>`;
      }
    }
  });
  
  return html;
}

/**
 * Main draw function
 */
export function drawWheelChart(chartData, decanResults) {
  lastChartData = { chartData, decanResults };
  
  // Make available globally for compatibility
  if (typeof window !== 'undefined') {
    window.lastChartData = lastChartData;
  }
  
  const svg = document.getElementById('wheelChart');
  if (!svg || !chartData) return;
  
  const { cx, cy, radiusOuter, radiusZodiac, radiusHouse, radiusInner } = CHART_CONFIG;
  
  const ascLong = chartData.asc.longitude || (chartData.asc.signIdx * 30 + chartData.asc.deg + chartData.asc.min / 60);
  const converter = createAngleConverter(ascLong);
  const { toAngle, polarX, polarY } = converter;
  
  const enabledPlanets = getEnabledPlanets();
  
  let html = '';
  
  // Background circle
  html += `<circle cx="${cx}" cy="${cy}" r="${radiusInner}" fill="rgba(11, 15, 20, 0.95)"/>`;
  html += `<circle cx="${cx}" cy="${cy}" r="${radiusOuter}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="3"/>`;
  
  // Zodiac ring
  html += drawZodiacRing(converter);
  
  // Zodiac inner edge
  html += `<circle cx="${cx}" cy="${cy}" r="${radiusZodiac}" fill="none" stroke="rgba(100,100,100,0.6)" stroke-width="1"/>`;
  
  // Houses and decans
  html += drawHouses(chartData, converter, decanResults);
  
  // Inner circle
  html += `<circle cx="${cx}" cy="${cy}" r="${radiusInner}" fill="none" stroke="rgba(150,150,150,0.4)" stroke-width="1.5"/>`;
  
  // Planets would be drawn here (large function, keeping in main file for now)
  
  svg.innerHTML = html;
}

/**
 * Get last chart data
 */
export function getLastChartData() {
  return lastChartData;
}

export { CHART_CONFIG };
