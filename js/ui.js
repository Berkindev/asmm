/**
 * AstroHarmony - UI Builders Module
 * Form builders, grid builders, and UI helper functions
 */

import { SIGNS, SIGN_SYM, COUNTRIES, MONTHS } from './data.js';
import { $ } from './utils.js';

// ========== ASC GRID BUILDER ==========
export function buildAscGrid(container) {
  container.innerHTML = '';
  
  let html = '<div style="display:grid;grid-template-columns:repeat(12,1fr);gap:4px;margin-bottom:8px">';
  SIGNS.forEach((sign, i) => {
    html += `<button type="button" class="chip" data-val="${i}" style="padding:6px;font-size:11px;border-radius:6px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);cursor:pointer">${SIGN_SYM[sign]}</button>`;
  });
  html += '</div>';
  container.innerHTML = html;
  
  // Event listeners
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });
}

// ========== MONTH SELECT BUILDER ==========
export function buildMonthSelect(sel) {
  sel.innerHTML = '<option value="">Ay</option>';
  MONTHS.forEach((m, i) => {
    sel.innerHTML += `<option value="${i + 1}">${m}</option>`;
  });
}

// ========== COUNTRY SELECT BUILDER ==========
export function buildCountrySelect(sel) {
  sel.innerHTML = '<option value="">Ülke seç</option>';
  Object.entries(COUNTRIES).forEach(([code, data]) => {
    sel.innerHTML += `<option value="${code}">${data.name}</option>`;
  });
}

// ========== CITY SELECT UPDATER ==========
export function updateCitySelect(countrySel, citySel, latInput, lngInput) {
  const countryCode = countrySel.value;
  citySel.innerHTML = '<option value="">Şehir seç</option>';
  
  if (!countryCode || !COUNTRIES[countryCode]) return;
  
  const cities = COUNTRIES[countryCode].cities;
  Object.keys(cities).sort().forEach(city => {
    citySel.innerHTML += `<option value="${city}">${city}</option>`;
  });
  
  // City change listener
  citySel.onchange = () => {
    const city = citySel.value;
    if (city && cities[city]) {
      latInput.value = cities[city].lat;
      lngInput.value = cities[city].lng;
    }
  };
}

// ========== AXIS GRID BUILDER ==========
export function buildAxisGrid(container) {
  container.innerHTML = '';
  
  const axes = [
    {label: 'Aynı Burç (Cusp)', flags: 'same'},
    {label: '+30° Geçti', flags: 'add30'}
  ];
  
  let html = '<div style="display:grid;gap:8px">';
  
  axes.forEach(axis => {
    html += `<div style="display:flex;align-items:center;gap:8px">
      <span style="min-width:120px;font-size:12px">${axis.label}:</span>
      <div class="chip-grid" style="display:flex;gap:4px">`;
    
    for (let i = 1; i <= 12; i++) {
      html += `<button type="button" class="chip ${axis.flags}-${i}" data-house="${i}" data-flag="${axis.flags}" style="padding:4px 8px;font-size:11px;border-radius:4px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.03);cursor:pointer">${i}</button>`;
    }
    
    html += '</div></div>';
  });
  
  html += '</div>';
  container.innerHTML = html;
  
  // Toggle event listeners
  container.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('selected');
    });
  });
}

// ========== CUSP GRID BUILDER ==========
export function buildCuspGrid(container, prefix) {
  container.innerHTML = '';
  
  let html = '<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px">';
  
  for (let i = 1; i <= 6; i++) {
    html += `
      <div style="background:rgba(255,255,255,.02);border-radius:8px;padding:8px">
        <div style="font-weight:700;margin-bottom:4px">${i}. Ev</div>
        <div style="display:flex;gap:4px">
          <input type="number" id="${prefix}Cusp${i}Deg" placeholder="°" min="0" max="29" style="width:40px">
          <input type="number" id="${prefix}Cusp${i}Min" placeholder="'" min="0" max="59" style="width:40px">
        </div>
      </div>`;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

// ========== PLANET GRID BUILDER ==========
export function buildPlanetGrid(container, prefix, includeHouse = true) {
  container.innerHTML = '';
  
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'north'];
  const names = {'sun': 'Güneş', 'moon': 'Ay', 'mercury': 'Merkür', 'venus': 'Venüs', 'mars': 'Mars', 'jupiter': 'Jüpiter', 'saturn': 'Satürn', 'uranus': 'Uranüs', 'neptune': 'Neptün', 'pluto': 'Plüton', 'chiron': 'Chiron', 'north': 'KAD'};
  
  let html = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">';
  
  planets.forEach(p => {
    html += `
      <div style="background:rgba(255,255,255,.02);border-radius:8px;padding:8px">
        <div style="font-weight:700;margin-bottom:4px">${names[p]}</div>
        <div style="display:flex;gap:4px">
          <select id="${prefix}${p}Sign" style="width:60px">
            <option value="">Burç</option>
            ${SIGNS.map((s, i) => `<option value="${i}">${SIGN_SYM[s]}</option>`).join('')}
          </select>
          <input type="number" id="${prefix}${p}Deg" placeholder="°" min="0" max="29" style="width:40px">
          <input type="number" id="${prefix}${p}Min" placeholder="'" min="0" max="59" style="width:40px">
          ${includeHouse ? `<input type="number" id="${prefix}${p}House" placeholder="Ev" min="1" max="12" style="width:40px">` : ''}
        </div>
      </div>`;
  });
  
  html += '</div>';
  container.innerHTML = html;
}

// ========== READ ASC ==========
export function readAsc(gridId) {
  const container = $(gridId);
  const selected = container?.querySelector('.chip.selected');
  return selected ? parseInt(selected.dataset.val) : 0;
}

// ========== READ CUSPS ==========
export function readCusps(prefix, axisGridId) {
  const cusps = [];
  const axisContainer = $(axisGridId);
  const sameFlags = [];
  const add30Flags = [];
  
  for (let i = 1; i <= 12; i++) {
    if (i <= 6) {
      const degInput = $(`${prefix}Cusp${i}Deg`);
      const minInput = $(`${prefix}Cusp${i}Min`);
      cusps.push({
        deg: parseInt(degInput?.value) || 0,
        min: parseInt(minInput?.value) || 0
      });
    } else {
      // Houses 7-12 mirror houses 1-6
      cusps.push({
        deg: (cusps[i - 7].deg + 0) % 30,
        min: cusps[i - 7].min
      });
    }
    
    // Read flags
    const sameChip = axisContainer?.querySelector(`.chip.same-${i}.selected`);
    const add30Chip = axisContainer?.querySelector(`.chip.add30-${i}.selected`);
    sameFlags.push(!!sameChip);
    add30Flags.push(!!add30Chip);
  }
  
  return { cusps, sameFlags, add30Flags };
}

// ========== READ PLANETS ==========
export function readPlanets(prefix, includeHouse = true) {
  const planets = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'north'];
  const result = {};
  
  planets.forEach(p => {
    result[p] = {
      signIdx: parseInt($(`${prefix}${p}Sign`)?.value) || 0,
      deg: parseInt($(`${prefix}${p}Deg`)?.value) || 0,
      min: parseInt($(`${prefix}${p}Min`)?.value) || 0
    };
    if (includeHouse) {
      result[p].house = parseInt($(`${prefix}${p}House`)?.value) || 1;
    }
  });
  
  return result;
}

// ========== FILL FORM FROM CHART ==========
export function fillFormFromChart(chart, prefix) {
  if (!chart) return;
  
  // Fill cusps
  chart.houses.forEach((h, i) => {
    if (i < 6) {
      const degInput = $(`${prefix}Cusp${i + 1}Deg`);
      const minInput = $(`${prefix}Cusp${i + 1}Min`);
      if (degInput) degInput.value = h.deg;
      if (minInput) minInput.value = h.min;
    }
  });
  
  // Fill planets
  Object.entries(chart.planets).forEach(([key, planet]) => {
    const signSel = $(`${prefix}${key}Sign`);
    const degInput = $(`${prefix}${key}Deg`);
    const minInput = $(`${prefix}${key}Min`);
    const houseInput = $(`${prefix}${key}House`);
    
    if (signSel) signSel.value = planet.signIdx;
    if (degInput) degInput.value = planet.deg;
    if (minInput) minInput.value = planet.min;
    if (houseInput && planet.house) houseInput.value = planet.house;
  });
}

// ========== SETUP AUTO CALC ==========
export function setupAutoCalc(prefix) {
  // Setup country/city selects
  const countrySelect = $(`${prefix}Country`);
  const citySelect = $(`${prefix}City`);
  const latInput = $(`${prefix}Lat`);
  const lngInput = $(`${prefix}Lng`);
  
  if (countrySelect) {
    buildCountrySelect(countrySelect);
    countrySelect.addEventListener('change', () => {
      updateCitySelect(countrySelect, citySelect, latInput, lngInput);
    });
  }
  
  // Setup month select
  const monthSelect = $(`${prefix}Month`);
  if (monthSelect) {
    buildMonthSelect(monthSelect);
  }
}
