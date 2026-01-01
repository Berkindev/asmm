/**
 * Zodiac sign data: symbols, names, elements, and rulers
 */

export const SIGNS = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];

export const SIGN_SYM = {
  'Koç': '♈', 'Boğa': '♉', 'İkizler': '♊', 'Yengeç': '♋',
  'Aslan': '♌', 'Başak': '♍', 'Terazi': '♎', 'Akrep': '♏',
  'Yay': '♐', 'Oğlak': '♑', 'Kova': '♒', 'Balık': '♓'
};

export const SIGN_EL = ['fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water'];

export const SIGN_SVG_FILES = {
  'Koç': 'aries', 'Boğa': 'taurus', 'İkizler': 'gemini', 'Yengeç': 'cancer',
  'Aslan': 'leo', 'Başak': 'virgo', 'Terazi': 'libra', 'Akrep': 'scorpio',
  'Yay': 'sagittarius', 'Oğlak': 'capricorn', 'Kova': 'aquarius', 'Balık': 'pisces'
};

// Element colors - distinct and visible on dark theme
export const EL_COLORS = {
  fire: '#E53935',   // Red
  earth: '#43A047',  // Green
  air: '#FFB300',    // Gold/Yellow
  water: '#5C6BC0'   // Indigo
};

export const EL_COLORS_LIGHT = {
  fire: 'rgba(229, 57, 53, 0.50)',
  earth: 'rgba(67, 160, 71, 0.50)',
  air: 'rgba(255, 179, 0, 0.45)',
  water: 'rgba(92, 107, 192, 0.50)'
};

// Sign-to-index lookup
export const signToIdx = Object.fromEntries(SIGNS.map((s, i) => [s, i]));

/**
 * Get element color for a sign
 */
export function getElementColor(sign) {
  const idx = typeof sign === 'number' ? sign : signToIdx[sign];
  return EL_COLORS[SIGN_EL[idx]] || EL_COLORS.fire;
}

/**
 * Get element name for a sign index
 */
export function getElement(signIdx) {
  return SIGN_EL[signIdx];
}
