/**
 * AstroHarmony - Main Application Entry Point
 * 
 * This is the main JavaScript file that initializes the application
 * and wires up all the modules.
 */

// CSS
import './css/styles.css';

// Data modules
import { 
  SIGNS, 
  SIGN_SYM, 
  COUNTRIES, 
  TZ_DATA,
  PRESETS,
  MONTHS 
} from './data/index.js';

// Calculation modules
import { 
  calculateChart, 
  calculateChartAspects,
  computeDecan,
  computeSeven 
} from './modules/index.js';

// Utility functions
import { 
  dateToJD, 
  jdToDateTime, 
  getTimezoneOffset,
  degToSignDegMin,
  hexToRgb 
} from './utils/index.js';

// UI components
import { drawWheelChart, getLastChartData } from './ui/wheel-chart.js';

// ========== GLOBAL STATE ==========
let globalNatalData = null;
let globalChartData = null;

// ========== DOM HELPERS ==========
const $ = id => document.getElementById(id);

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌙 AstroHarmony initialized');
  
  // Initialize country selects
  initCountrySelects();
  
  // Initialize tabs
  initTabs();
  
  // Initialize form handlers
  initFormHandlers();
  
  console.log('✅ All modules loaded');
});

/**
 * Initialize country dropdown selects
 */
function initCountrySelects() {
  const countrySelects = document.querySelectorAll('.country-select');
  countrySelects.forEach(sel => {
    sel.innerHTML = '<option value="">Ülke seç</option>';
    Object.entries(COUNTRIES).forEach(([code, data]) => {
      sel.innerHTML += `<option value="${code}">${data.name}</option>`;
    });
  });
}

/**
 * Initialize tab navigation
 */
function initTabs() {
  const tabs = document.querySelectorAll('.main-tab');
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
      
      // Update form fields
      const latInput = $('autoDecanLat');
      const lngInput = $('autoDecanLng');
      
      if (latInput) latInput.value = lat;
      if (lngInput) lngInput.value = lng;
    });
  });
}

/**
 * Handle chart calculation
 */
async function handleCalculate(prefix = 'autoDecan') {
  try {
    const day = parseInt($(`${prefix}Day`)?.value);
    const month = parseInt($(`${prefix}Month`)?.value);
    const year = parseInt($(`${prefix}Year`)?.value);
    const hour = parseInt($(`${prefix}Hour`)?.value);
    const minute = parseInt($(`${prefix}Minute`)?.value);
    const lat = parseFloat($(`${prefix}Lat`)?.value);
    const lng = parseFloat($(`${prefix}Lng`)?.value);
    const countryCode = $(`${prefix}Country`)?.value;
    
    // Get timezone
    let tz = 'Europe/Istanbul';
    if (countryCode && COUNTRIES[countryCode]) {
      tz = COUNTRIES[countryCode].tz;
    }
    
    console.log(`📊 Calculating chart for ${day}/${month}/${year} ${hour}:${minute}`);
    
    // Calculate chart
    const chart = await calculateChart(year, month, day, hour, minute, lat, lng, tz);
    
    if (chart) {
      globalChartData = chart;
      globalNatalData = {
        day, month, year, hour, minute, lat, lng, tz,
        chart
      };
      
      console.log('✅ Chart calculated successfully');
      
      // Calculate decans if we have cusps
      if (chart.houses) {
        const sameFlags = Array(12).fill(false);
        const add30Flags = Array(12).fill(false);
        const ascIdx = chart.asc.signIdx;
        
        const decanResults = computeDecan(chart.houses, sameFlags, add30Flags, ascIdx);
        
        // Draw chart
        drawWheelChart(chart, decanResults);
      }
    }
  } catch (error) {
    console.error('Chart calculation error:', error);
  }
}

// Export for global access
window.AstroHarmony = {
  calculateChart,
  drawWheelChart,
  getLastChartData,
  globalNatalData: () => globalNatalData,
  globalChartData: () => globalChartData,
  handleCalculate
};
