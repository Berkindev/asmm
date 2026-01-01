/**
 * AstroHarmony - NewMap Module
 * Solar Fire tarzı profesyonel astroloji haritası
 * 
 * Özellikler:
 * - Emoji burç sembolleri (element renklerinde)
 * - Doğru ev sıralaması (saat yönünün tersine 1-12)
 * - Net dekan arkaplanları (element rengine göre)
 * - Haritaya değen açı çizgileri
 * - Her açı türü için farklı renkler
 * - Gezegenler orta bölgede (burç halkası ile iç çember arası)
 */

const newmapModule = (() => {
  // Constants
  const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
  const SIGN_SYM = {Koç:'♈',Boğa:'♉',İkizler:'♊',Yengeç:'♋',Aslan:'♌',Başak:'♍',Terazi:'♎',Akrep:'♏',Yay:'♐',Oğlak:'♑',Kova:'♒',Balık:'♓'};
  
  // Element colors - TAM OPAK
  const EL_COLORS = {
    fire: '#ff0000',   // Ateş - Kırmızı
    earth: '#00ff00',  // Toprak - Yeşil
    air: '#01ccc8',    // Hava - Turkuaz
    water: '#1b00ff'   // Su - Mavi
  };
  
  const SIGN_ELEMENTS = ['fire','earth','air','water','fire','earth','air','water','fire','earth','air','water'];
  
  // Planet definitions
  const PLANETS = {
    sun: { name: 'Güneş', sym: '☉', color: '#F59E0B' },
    moon: { name: 'Ay', sym: '☽', color: '#94A3B8' },
    mercury: { name: 'Merkür', sym: '☿', color: '#A78BFA' },
    venus: { name: 'Venüs', sym: '♀', color: '#EC4899' },
    mars: { name: 'Mars', sym: '♂', color: '#EF4444' },
    jupiter: { name: 'Jüpiter', sym: '♃', color: '#3B82F6' },
    saturn: { name: 'Satürn', sym: '♄', color: '#6B7280' },
    uranus: { name: 'Uranüs', sym: '♅', color: '#06B6D4' },
    neptune: { name: 'Neptün', sym: '♆', color: '#8B5CF6' },
    pluto: { name: 'Plüton', sym: '♇', color: '#78716C' },
    chiron: { name: 'Chiron', sym: '⚷', color: '#10B981' },
    north: { name: 'KAD', sym: '☊', color: '#6EE7FF' },
    south: { name: 'GAD', sym: '☋', color: '#FF6EE7' },
    fortune: { name: 'Şans', sym: '⊕', color: '#22C55E' }
  };
  
  // Aspect definitions with distinct colors
  const ASPECTS = {
    conjunction: { angle: 0, orb: 8, sym: '☌', name: 'Kavuşum', color: '#F59E0B', dash: '' },
    opposition: { angle: 180, orb: 8, sym: '☍', name: 'Karşıt', color: '#3B82F6', dash: '8,4' },
    trine: { angle: 120, orb: 8, sym: '△', name: 'Üçgen', color: '#22C55E', dash: '' },
    square: { angle: 90, orb: 7, sym: '□', name: 'Kare', color: '#EF4444', dash: '5,3' },
    sextile: { angle: 60, orb: 6, sym: '⚹', name: '60lık', color: '#06B6D4', dash: '3,3' }
  };
  
  // State
  let chartData = null;
  let decanData = null;
  let showAspects = true;
  
  /**
   * Initialize the module with chart data
   */
  function init(chart, decans) {
    chartData = chart;
    decanData = decans;
    updateStatus('Veri yüklendi');
  }
  
  /**
   * Update status text
   */
  function updateStatus(text) {
    const el = document.getElementById('newmapStatus');
    if (el) el.textContent = text;
  }
  
  /**
   * Toggle aspects visibility and redraw
   */
  function toggleAspects() {
    showAspects = !showAspects;
    drawChart();
  }
  
  /**
   * Calculate aspects between planets
   */
  function calculateAspects(planets) {
    const aspects = [];
    const planetKeys = Object.keys(planets).filter(k => planets[k] && planets[k].signIdx !== undefined);
    
    for (let i = 0; i < planetKeys.length; i++) {
      for (let j = i + 1; j < planetKeys.length; j++) {
        const p1 = planets[planetKeys[i]];
        const p2 = planets[planetKeys[j]];
        
        const lon1 = p1.signIdx * 30 + p1.deg + p1.min / 60;
        const lon2 = p2.signIdx * 30 + p2.deg + p2.min / 60;
        
        let diff = Math.abs(lon1 - lon2);
        if (diff > 180) diff = 360 - diff;
        
        for (const [type, aspect] of Object.entries(ASPECTS)) {
          const distance = Math.abs(diff - aspect.angle);
          if (distance <= aspect.orb) {
            aspects.push({
              planet1: planetKeys[i],
              planet2: planetKeys[j],
              lon1, lon2,
              type,
              exactness: 1 - (distance / aspect.orb),
              ...aspect
            });
            break;
          }
        }
      }
    }
    return aspects;
  }
  
  /**
   * Draw the chart
   */
  function drawChart() {
    // Get global chart data if not set
    if (!chartData && window.lastChartData) {
      chartData = window.lastChartData.chartData;
      decanData = window.lastChartData.decanResults;
    }
    
    if (!chartData) {
      updateStatus('Harita verisi bulunamadı. Önce Dekan sekmesinden hesaplama yapın.');
      return;
    }
    
    const container = document.getElementById('newmapPaper');
    if (!container) return;
    
    updateStatus('Harita çiziliyor...');
    
    // Chart dimensions - Daha küçük viewBox, ekrana sığsın
    const size = 800;
    const cx = size / 2;
    const cy = size / 2;
    
    // Radii - Daha kompakt
    const rOuter = 350;        // Dış çember
    const rZodiac = 310;       // Burç halkası iç
    const rHouse = 280;        // Ev halkası dış
    const rInner = 180;        // İç çember (açılar için)
    
    // Gezegen yarıçapları - ORTA BÖLGEDE
    const rPlanetMiddle1 = 245;  // Orta bölge - birinci sıra
    const rPlanetMiddle2 = 205;  // Orta bölge - ikinci sıra (yakın gezegenler için)
    
    // ASC longitude for rotation
    const ascLong = chartData.asc.longitude || 
                    (chartData.asc.signIdx * 30 + chartData.asc.deg + chartData.asc.min / 60);
    
    // Angle conversion (ASC at 9 o'clock = 180°)
    const toAngle = (eclipticDeg) => {
      const relDeg = eclipticDeg - ascLong;
      const chartDeg = 180 + relDeg;
      return chartDeg * Math.PI / 180;
    };
    
    const polarX = (r, deg) => cx + r * Math.cos(toAngle(deg));
    const polarY = (r, deg) => cy - r * Math.sin(toAngle(deg));
    
    // Start building SVG
    let svg = `<svg viewBox="0 0 ${size} ${size}" style="width:100%;height:auto;max-height:80vh;background:#FFFFFF;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1)">`;
    
    // Background circles
    svg += `<circle cx="${cx}" cy="${cy}" r="${rOuter}" fill="#FAFAFA" stroke="#333" stroke-width="2"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${rZodiac}" fill="none" stroke="#555" stroke-width="1"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${rHouse}" fill="none" stroke="#BBB" stroke-width="1"/>`;
    
    // Zodiac segments - TAM OPAK renkler, EMOJI semboller
    for (let i = 0; i < 12; i++) {
      const startDeg = i * 30;
      const endDeg = (i + 1) * 30;
      const midDeg = startDeg + 15;
      const color = EL_COLORS[SIGN_ELEMENTS[i]];
      
      const a1 = toAngle(startDeg);
      const a2 = toAngle(endDeg);
      
      const x1o = cx + rOuter * Math.cos(a1);
      const y1o = cy - rOuter * Math.sin(a1);
      const x2o = cx + rOuter * Math.cos(a2);
      const y2o = cy - rOuter * Math.sin(a2);
      const x1z = cx + rZodiac * Math.cos(a1);
      const y1z = cy - rZodiac * Math.sin(a1);
      const x2z = cx + rZodiac * Math.cos(a2);
      const y2z = cy - rZodiac * Math.sin(a2);
      
      // Burç segmenti - TAM OPAK arka plan
      svg += `<path d="M ${x1z} ${y1z} L ${x1o} ${y1o} A ${rOuter} ${rOuter} 0 0 0 ${x2o} ${y2o} L ${x2z} ${y2z} A ${rZodiac} ${rZodiac} 0 0 1 ${x1z} ${y1z}" fill="${color}" stroke="#333" stroke-width="1"/>`;
      
      // Burç sembolü - EMOJI ile
      const symX = polarX((rOuter + rZodiac) / 2, midDeg);
      const symY = polarY((rOuter + rZodiac) / 2, midDeg);
      svg += `<text x="${symX}" y="${symY}" text-anchor="middle" dominant-baseline="central" fill="#FFFFFF" font-size="24" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.5)">${SIGN_SYM[SIGNS[i]]}</text>`;
      
      // Derece işaretleri
      for (let d = 0; d < 30; d++) {
        const tickDeg = startDeg + d;
        const tickA = toAngle(tickDeg);
        const x1 = cx + rOuter * Math.cos(tickA);
        const y1 = cy - rOuter * Math.sin(tickA);
        
        let tickLen = 3;
        let tickWidth = 0.5;
        if (d % 10 === 0) { tickLen = 10; tickWidth = 1.5; }
        else if (d % 5 === 0) { tickLen = 6; tickWidth = 1; }
        
        const x2 = cx + (rOuter - tickLen) * Math.cos(tickA);
        const y2 = cy - (rOuter - tickLen) * Math.sin(tickA);
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFF" stroke-width="${tickWidth}"/>`;
      }
    }
    
    // Dekan backgrounds (if available)
    if (decanData && decanData.length > 0 && chartData.houses) {
      decanData.forEach(house => {
        if (!house.decans || !house.meta || !chartData.houses[house.house - 1]) return;
        
        const houseCusp = chartData.houses[house.house - 1];
        const cuspDeg = houseCusp.signIdx * 30 + houseCusp.deg + houseCusp.min / 60;
        
        house.decans.forEach((decan, di) => {
          const decanStart = cuspDeg + di * (house.meta.decanSizeMin / 60);
          const decanEnd = cuspDeg + (di + 1) * (house.meta.decanSizeMin / 60);
          
          const decanSignIdx = SIGNS.indexOf(decan.decanSign);
          const decanColor = EL_COLORS[SIGN_ELEMENTS[decanSignIdx]] || '#999';
          
          const a1 = toAngle(decanStart);
          const a2 = toAngle(decanEnd);
          
          const x1h = cx + rHouse * Math.cos(a1);
          const y1h = cy - rHouse * Math.sin(a1);
          const x2h = cx + rHouse * Math.cos(a2);
          const y2h = cy - rHouse * Math.sin(a2);
          const x1i = cx + rInner * Math.cos(a1);
          const y1i = cy - rInner * Math.sin(a1);
          const x2i = cx + rInner * Math.cos(a2);
          const y2i = cy - rInner * Math.sin(a2);
          
          const span = Math.abs(decanEnd - decanStart);
          const largeArc = span > 180 ? 1 : 0;
          
          // Dekan background - TAM OPAK değil ama çok koyu
          svg += `<path d="M ${x1i} ${y1i} L ${x1h} ${y1h} A ${rHouse} ${rHouse} 0 ${largeArc} 0 ${x2h} ${y2h} L ${x2i} ${y2i} A ${rInner} ${rInner} 0 ${largeArc} 1 ${x1i} ${y1i}" fill="${decanColor}" fill-opacity="0.6" stroke="${decanColor}" stroke-width="0.5"/>`;
          
          // Dekan symbol
          const midDecanDeg = (decanStart + decanEnd) / 2;
          const symX = polarX((rHouse + rPlanetMiddle1) / 2 - 5, midDecanDeg);
          const symY = polarY((rHouse + rPlanetMiddle1) / 2 - 5, midDecanDeg);
          svg += `<text x="${symX}" y="${symY}" text-anchor="middle" dominant-baseline="central" fill="${decanColor}" font-size="12" font-weight="700" style="text-shadow: 0 0 3px #FFF">${SIGN_SYM[decan.decanSign]}</text>`;
          
          // Dekan boundary line (not for first)
          if (di > 0) {
            const tx1 = polarX(rHouse, decanStart);
            const ty1 = polarY(rHouse, decanStart);
            const tx2 = polarX(rInner, decanStart);
            const ty2 = polarY(rInner, decanStart);
            svg += `<line x1="${tx1}" y1="${ty1}" x2="${tx2}" y2="${ty2}" stroke="${decanColor}" stroke-width="1" stroke-dasharray="4,3"/>`;
          }
        });
      });
    }
    
    // House lines
    if (chartData.houses) {
      chartData.houses.forEach((h, i) => {
        const deg = h.signIdx * 30 + h.deg + h.min / 60;
        const x1 = polarX(rInner, deg);
        const y1 = polarY(rInner, deg);
        const x2 = polarX(rZodiac, deg);
        const y2 = polarY(rZodiac, deg);
        
        // Cardinal houses (1, 4, 7, 10) in red
        const isCardinal = (i === 0 || i === 3 || i === 6 || i === 9);
        const lineColor = isCardinal ? '#CC0000' : '#666';
        const lineWidth = isCardinal ? 2 : 1;
        
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${lineColor}" stroke-width="${lineWidth}"/>`;
        
        // House number
        const nextH = chartData.houses[(i + 1) % 12];
        let nextDeg = nextH.signIdx * 30 + nextH.deg + nextH.min / 60;
        let span = nextDeg - deg;
        if (span < 0) span += 360;
        const midDeg = deg + span / 2;
        
        const numX = polarX(rHouse - 25, midDeg);
        const numY = polarY(rHouse - 25, midDeg);
        svg += `<text x="${numX}" y="${numY}" text-anchor="middle" dominant-baseline="central" fill="#555" font-size="12" font-weight="bold">${i + 1}</text>`;
        
        // Cusp degree
        const degText = `${h.deg}°${String(h.min).padStart(2, '0')}'`;
        const degX = polarX(rZodiac + 12, deg);
        const degY = polarY(rZodiac + 12, deg);
        svg += `<text x="${degX}" y="${degY}" text-anchor="middle" dominant-baseline="central" fill="${isCardinal ? '#CC0000' : '#777'}" font-size="8" font-weight="600">${degText}</text>`;
        
        // ASC/IC/DESC/MC labels
        if (isCardinal) {
          const labels = { 0: 'ASC', 3: 'IC', 6: 'DESC', 9: 'MC' };
          const labelX = polarX(rOuter + 20, deg);
          const labelY = polarY(rOuter + 20, deg);
          svg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="central" fill="#CC0000" font-size="11" font-weight="bold">${labels[i]}</text>`;
        }
      });
    }
    
    // Inner circle
    svg += `<circle cx="${cx}" cy="${cy}" r="${rInner}" fill="#FEFEFE" stroke="#AAA" stroke-width="1"/>`;
    
    // Planet positions for aspects
    const planetPositions = {};
    
    // Planets - ORTA BÖLGEDE
    if (chartData.planets) {
      const planetKeys = Object.keys(PLANETS).filter(k => chartData.planets[k]);
      
      // Sort by longitude for spacing
      const sortedPlanets = planetKeys.map(key => {
        const p = chartData.planets[key];
        return {
          key,
          ...p,
          longitude: p.longitude || (p.signIdx * 30 + p.deg + p.min / 60)
        };
      }).sort((a, b) => a.longitude - b.longitude);
      
      // Yakın gezegenleri ayır
      let lastDeg = -999;
      let useMiddle2 = false;
      
      sortedPlanets.forEach(p => {
        if (p.longitude - lastDeg < 15) {
          useMiddle2 = !useMiddle2;
        } else {
          useMiddle2 = false;
        }
        p.displayRadius = useMiddle2 ? rPlanetMiddle2 : rPlanetMiddle1;
        lastDeg = p.longitude;
      });
      
      sortedPlanets.forEach(p => {
        const info = PLANETS[p.key];
        const color = info.color;
        
        // Gezegen orta bölgede
        const midX = polarX(p.displayRadius, p.longitude);
        const midY = polarY(p.displayRadius, p.longitude);
        // İç marker iç çember kenarında
        const innerX = polarX(rInner, p.longitude);
        const innerY = polarY(rInner, p.longitude);
        // Burç halkası kenarında ok işareti
        const edgeX = polarX(rZodiac, p.longitude);
        const edgeY = polarY(rZodiac, p.longitude);
        
        // Store for aspects
        planetPositions[p.key] = { x: innerX, y: innerY, color };
        
        // Ortadan içe bağlantı çizgisi
        svg += `<line x1="${midX}" y1="${midY}" x2="${innerX}" y2="${innerY}" stroke="${color}" stroke-width="1" stroke-opacity="0.6"/>`;
        
        // Ok ucu - burç halkasının iç kenarında
        const angle = toAngle(p.longitude);
        const arrowSize = 5;
        const ax1 = edgeX + arrowSize * Math.cos(angle + Math.PI - 0.4);
        const ay1 = edgeY - arrowSize * Math.sin(angle + Math.PI - 0.4);
        const ax2 = edgeX + arrowSize * Math.cos(angle + Math.PI + 0.4);
        const ay2 = edgeY - arrowSize * Math.sin(angle + Math.PI + 0.4);
        svg += `<polygon points="${edgeX},${edgeY} ${ax1},${ay1} ${ax2},${ay2}" fill="${color}"/>`;
        
        // Gezegen bilgisi ORTA BÖLGEDE
        svg += `<text x="${midX}" y="${midY - 10}" text-anchor="middle" dominant-baseline="central" fill="${color}" font-size="20" font-weight="bold">${info.sym}</text>`;
        svg += `<text x="${midX}" y="${midY + 8}" text-anchor="middle" dominant-baseline="central" fill="${color}" font-size="9" font-weight="600">${p.deg}°${String(p.min).padStart(2,'0')}'${SIGN_SYM[SIGNS[p.signIdx]]}</text>`;
        
        // İç çember üzerinde küçük marker
        svg += `<circle cx="${innerX}" cy="${innerY}" r="8" fill="${color}" stroke="#FFF" stroke-width="1.5"/>`;
        svg += `<text x="${innerX}" y="${innerY}" text-anchor="middle" dominant-baseline="central" fill="#FFF" font-size="10" font-weight="bold">${info.sym}</text>`;
      });
    }
    
    // Aspects (connecting to inner circle edge)
    if (showAspects && chartData.planets) {
      const aspects = calculateAspects(chartData.planets);
      
      aspects.forEach(aspect => {
        const pos1 = planetPositions[aspect.planet1];
        const pos2 = planetPositions[aspect.planet2];
        if (!pos1 || !pos2) return;
        
        const strokeWidth = 1 + aspect.exactness * 1.5;
        const opacity = 0.5 + aspect.exactness * 0.4;
        const dashArray = aspect.dash || 'none';
        
        // Aspect line from planet to planet on inner circle edge
        svg += `<line x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${pos2.y}" stroke="${aspect.color}" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" stroke-dasharray="${dashArray}"/>`;
        
        // Aspect symbol in center of line (for strong aspects)
        if (aspect.exactness > 0.65) {
          const midX = (pos1.x + pos2.x) / 2;
          const midY = (pos1.y + pos2.y) / 2;
          svg += `<circle cx="${midX}" cy="${midY}" r="9" fill="#FFF" stroke="${aspect.color}" stroke-width="1.5"/>`;
          svg += `<text x="${midX}" y="${midY}" text-anchor="middle" dominant-baseline="central" fill="${aspect.color}" font-size="10" font-weight="bold">${aspect.sym}</text>`;
        }
      });
    }
    
    svg += '</svg>';
    
    container.innerHTML = svg;
    updateStatus('Harita hazır ✓');
    
    // Show info panel
    const infoPanel = document.getElementById('newmapInfo');
    if (infoPanel) {
      infoPanel.style.display = 'block';
      renderInfo();
    }
  }
  
  /**
   * Render info panel content
   */
  function renderInfo() {
    const content = document.getElementById('newmapInfoContent');
    if (!content || !chartData) return;
    
    let html = '';
    
    // ASC/MC info
    if (chartData.asc) {
      const ascSign = SIGNS[chartData.asc.signIdx];
      html += `<div style="padding:8px;background:rgba(110,231,255,0.1);border-radius:6px;border-left:3px solid ${EL_COLORS[SIGN_ELEMENTS[chartData.asc.signIdx]]}">
        <strong>Yükselen:</strong> ${SIGN_SYM[ascSign]} ${ascSign} ${chartData.asc.deg}°${String(chartData.asc.min).padStart(2,'0')}'
      </div>`;
    }
    
    if (chartData.mc) {
      const mcSign = SIGNS[chartData.mc.signIdx];
      html += `<div style="padding:8px;background:rgba(139,92,246,0.1);border-radius:6px;border-left:3px solid ${EL_COLORS[SIGN_ELEMENTS[chartData.mc.signIdx]]}">
        <strong>MC:</strong> ${SIGN_SYM[mcSign]} ${mcSign} ${chartData.mc.deg}°${String(chartData.mc.min).padStart(2,'0')}'
      </div>`;
    }
    
    // Sun & Moon
    if (chartData.planets?.sun) {
      const sunSign = SIGNS[chartData.planets.sun.signIdx];
      html += `<div style="padding:8px;background:rgba(245,158,11,0.1);border-radius:6px;border-left:3px solid #F59E0B">
        <strong>☉ Güneş:</strong> ${SIGN_SYM[sunSign]} ${sunSign} ${chartData.planets.sun.deg}°${String(chartData.planets.sun.min).padStart(2,'0')}'
      </div>`;
    }
    
    if (chartData.planets?.moon) {
      const moonSign = SIGNS[chartData.planets.moon.signIdx];
      html += `<div style="padding:8px;background:rgba(148,163,184,0.1);border-radius:6px;border-left:3px solid #94A3B8">
        <strong>☽ Ay:</strong> ${SIGN_SYM[moonSign]} ${moonSign} ${chartData.planets.moon.deg}°${String(chartData.planets.moon.min).padStart(2,'0')}'
      </div>`;
    }
    
    content.innerHTML = html;
  }
  
  // Public API
  return {
    init,
    drawChart,
    toggleAspects
  };
})();

// Make globally available
window.newmapModule = newmapModule;
