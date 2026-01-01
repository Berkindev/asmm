/**
 * AstroHarmony - Main Application Entry Point
 * Modular architecture v2.0
 */

// CSS
import './css/styles.css';

// Data modules
import { 
  SIGNS, 
  SIGN_SYM,
  EL_COLORS,
  getElement
} from './data/zodiac.js';

import {
  COUNTRIES, 
  TZ_DATA,
  PRESETS,
  MONTHS,
  RULERS
} from './data/countries.js';

import {
  PLANET_LIST,
  PLANET_SYMBOLS,
  PLANET_NAMES,
  PLANET_COLORS
} from './data/planets.js';

// Calculation modules
import { calculateChart, isSwissEphReady } from './modules/chart-calculator.js';
import { calculateAspects, calculateChartAspects } from './modules/aspect-calculator.js';
import { computeDecan, computeSeven, getElement as getElementFromSign, fmt, fmtAbsMin } from './modules/decan-calculator.js';

// Utility functions
import { 
  dateToJD, 
  jdToDateTime, 
  getTimezoneOffset,
  degToSignDegMin,
  hexToRgb 
} from './utils/date-utils.js';

// UI components
import { drawWheelChart, getLastChartData } from './ui/wheel-chart.js';

// ========== GLOBAL STATE ==========
let globalNatalData = null;
let globalChartData = null;
let globalDecanResults = null;

// ========== DOM HELPERS ==========
const $ = id => document.getElementById(id);

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌙 AstroHarmony v2.0 - Modular Architecture');
  
  // Wait for Swiss Ephemeris if needed
  waitForSwissEph().then(() => {
    init();
  });
});

async function waitForSwissEph() {
  // Give SE time to load
  return new Promise(resolve => {
    let attempts = 0;
    const check = () => {
      if (isSwissEphReady() || attempts > 20) {
        if (isSwissEphReady()) {
          console.log('✅ Swiss Ephemeris ready');
        } else {
          console.log('⚠️ Swiss Ephemeris not available, using fallback');
        }
        resolve();
      } else {
        attempts++;
        setTimeout(check, 100);
      }
    };
    check();
  });
}

function init() {
  // Initialize country selects
  initCountrySelects();
  
  // Initialize tabs
  initTabs();
  
  // Initialize form handlers
  initFormHandlers();
  
  // Initialize calculate button
  initCalculateButton();
  
  console.log('✅ All modules initialized');
}

/**
 * Initialize country dropdown selects
 */
function initCountrySelects() {
  document.querySelectorAll('.country-select').forEach(sel => {
    sel.innerHTML = '<option value="">Ülke seç</option>';
    Object.entries(COUNTRIES).forEach(([code, data]) => {
      sel.innerHTML += `<option value="${code}">${data.name}</option>`;
    });
    
    // Add change handler
    sel.addEventListener('change', (e) => {
      const countryCode = e.target.value;
      const citySelect = sel.closest('.grid')?.querySelector('.city-select') || 
                         document.querySelector('.city-select');
      
      if (citySelect && countryCode && COUNTRIES[countryCode]) {
        const cities = COUNTRIES[countryCode].cities;
        citySelect.innerHTML = '<option value="">Şehir seç</option>';
        Object.keys(cities).sort().forEach(city => {
          citySelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
      }
    });
  });
  
  // City select change handler
  document.querySelectorAll('.city-select').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const cityName = e.target.value;
      const countrySelect = document.querySelector('.country-select');
      const countryCode = countrySelect?.value;
      
      if (cityName && countryCode && COUNTRIES[countryCode]?.cities[cityName]) {
        const city = COUNTRIES[countryCode].cities[cityName];
        const latInput = $('autoDecanLat');
        const lngInput = $('autoDecanLng');
        
        if (latInput) latInput.value = city.lat;
        if (lngInput) lngInput.value = city.lng;
      }
    });
  });
}

/**
 * Initialize tab navigation
 */
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.main-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;
      
      // Update active states
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      tab.classList.add('active');
      const targetPanel = $(`panel-${targetId}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/**
 * Initialize form handlers
 */
function initFormHandlers() {
  // Quick location buttons
  document.querySelectorAll('.quick-loc').forEach(btn => {
    btn.addEventListener('click', () => {
      const city = btn.dataset.city;
      const lat = parseFloat(btn.dataset.lat);
      const lng = parseFloat(btn.dataset.lng);
      
      const latInput = $('autoDecanLat');
      const lngInput = $('autoDecanLng');
      
      if (latInput) latInput.value = lat;
      if (lngInput) lngInput.value = lng;
      
      // Visual feedback
      document.querySelectorAll('.quick-loc').forEach(b => b.classList.remove('ring-2', 'ring-cyan-400'));
      btn.classList.add('ring-2', 'ring-cyan-400');
    });
  });
}

/**
 * Initialize calculate button
 */
function initCalculateButton() {
  const btn = $('btnCalculate');
  if (btn) {
    btn.addEventListener('click', handleCalculate);
  }
}

/**
 * Handle chart calculation
 */
async function handleCalculate() {
  const btn = $('btnCalculate');
  const resultsDiv = $('decanResults');
  
  try {
    // Show loading state
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Hesaplanıyor...';
    }
    
    // Get form values
    const day = parseInt($('autoDecanDay')?.value) || 1;
    const month = parseInt($('autoDecanMonth')?.value) || 1;
    const year = parseInt($('autoDecanYear')?.value) || 1990;
    const hour = parseInt($('autoDecanHour')?.value) || 12;
    const minute = parseInt($('autoDecanMinute')?.value) || 0;
    const lat = parseFloat($('autoDecanLat')?.value) || 41.0082;
    const lng = parseFloat($('autoDecanLng')?.value) || 28.9784;
    const countryCode = $('autoDecanCountry')?.value;
    
    // Get timezone
    let tz = 'Europe/Istanbul';
    if (countryCode && COUNTRIES[countryCode]) {
      tz = COUNTRIES[countryCode].tz;
    }
    
    console.log(`📊 Calculating: ${day}/${month}/${year} ${hour}:${String(minute).padStart(2,'0')} @ ${lat}, ${lng}`);
    
    // Calculate chart
    const chart = await calculateChart(year, month, day, hour, minute, lat, lng, tz);
    
    if (chart) {
      globalChartData = chart;
      globalNatalData = { day, month, year, hour, minute, lat, lng, tz, chart };
      
      console.log('✅ Chart calculated:', chart);
      
      // Calculate decans
      if (chart.houses) {
        const sameFlags = Array(12).fill(false);
        const add30Flags = Array(12).fill(false);
        const ascIdx = chart.asc.signIdx;
        
        globalDecanResults = computeDecan(chart.houses, sameFlags, add30Flags, ascIdx);
        
        // Render results
        renderDecanResults(globalDecanResults, chart);
        
        // Draw wheel chart
        drawWheelChart(chart, globalDecanResults);
      }
    }
  } catch (error) {
    console.error('❌ Calculation error:', error);
    if (resultsDiv) {
      resultsDiv.innerHTML = `<div class="text-red-400">Hata: ${error.message}</div>`;
    }
  } finally {
    // Reset button
    if (btn) {
      btn.disabled = false;
      btn.textContent = '✨ Hesapla';
    }
  }
}

/**
 * Render decan calculation results
 */
function renderDecanResults(results, chart) {
  const container = $('decanResults');
  if (!container) return;
  
  let html = '';
  
  // Chart summary
  html += `<div class="mb-6 p-4 bg-dark-lighter rounded-lg border border-gray-700">`;
  html += `<h3 class="font-bold text-cyan-400 mb-2">🌟 Harita Özeti</h3>`;
  html += `<div class="grid grid-cols-2 gap-2 text-sm">`;
  html += `<div><span class="text-gray-400">ASC:</span> <span class="font-semibold">${SIGNS[chart.asc.signIdx]} ${chart.asc.deg}°${String(chart.asc.min).padStart(2,'0')}'</span></div>`;
  
  if (chart.planets?.sun) {
    const sun = chart.planets.sun;
    html += `<div><span class="text-gray-400">☉ Güneş:</span> <span class="font-semibold">${SIGNS[sun.signIdx]} ${sun.deg}°</span></div>`;
  }
  if (chart.planets?.moon) {
    const moon = chart.planets.moon;
    html += `<div><span class="text-gray-400">☽ Ay:</span> <span class="font-semibold">${SIGNS[moon.signIdx]} ${moon.deg}°</span></div>`;
  }
  html += `</div></div>`;
  
  // Decan results for first 6 houses
  html += `<div class="space-y-3">`;
  results.slice(0, 6).forEach(house => {
    const element = getElementFromSign(house.houseSignIdx);
    const bgClass = `element-${element}`;
    
    html += `<div class="p-3 rounded-lg border ${bgClass}">`;
    html += `<div class="flex items-center gap-2 mb-2">`;
    html += `<span class="w-8 h-8 rounded-full bg-dark flex items-center justify-center font-bold">${house.house}</span>`;
    html += `<span class="font-semibold">${house.houseSign}</span>`;
    html += `<span class="text-sm text-gray-400">${house.meta.spanText}</span>`;
    html += `</div>`;
    
    // Decans
    html += `<div class="grid grid-cols-3 gap-2 text-sm">`;
    house.decans.forEach(decan => {
      html += `<div class="bg-dark/50 rounded p-2 text-center">`;
      html += `<div class="font-semibold">${decan.index}. Dekan</div>`;
      html += `<div class="text-xs text-gray-400">${decan.decanSign}</div>`;
      html += `<div class="text-xs">${decan.ruler}</div>`;
      html += `</div>`;
    });
    html += `</div>`;
    html += `</div>`;
  });
  html += `</div>`;
  
  container.innerHTML = html;
}

// ========== GLOBAL EXPORTS ==========
window.AstroHarmony = {
  // State
  getNatalData: () => globalNatalData,
  getChartData: () => globalChartData,
  getDecanResults: () => globalDecanResults,
  
  // Functions
  calculateChart,
  drawWheelChart,
  computeDecan,
  computeSeven,
  
  // Data
  SIGNS,
  SIGN_SYM,
  COUNTRIES,
  PLANET_SYMBOLS,
  PLANET_COLORS
};

console.log('📦 AstroHarmony modules loaded');
