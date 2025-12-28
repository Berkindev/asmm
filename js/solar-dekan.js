/**
 * AstroHarmony - Solar Dekan Sistemi
 * 
 * Solar Return haritasında dekan dekan ilerleyen tarih sistemi.
 * Doğum gününden başlayarak her dekanın hangi tarihlere karşılık geldiğini hesaplar.
 * 
 * Mantık:
 * - 360° = 1 yıl (365.25 gün ortalama)
 * - Her ev ~30° (değişken)
 * - Her dekan = ev genişliği / 3
 * - Dekanları sırayla dolaşarak tarihleri belirle
 */

const SolarDekan = {
  SIGNS: ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'],
  SIGN_SYM: {Koç:'♈',Boğa:'♉',İkizler:'♊',Yengeç:'♋',Aslan:'♌',Başak:'♍',Terazi:'♎',Akrep:'♏',Yay:'♐',Oğlak:'♑',Kova:'♒',Balık:'♓'},
  RULER_SYM: {Mars:'♂',Venüs:'♀',Merkür:'☿',Ay:'☽',Güneş:'☉',Jüpiter:'♃',Satürn:'♄',Uranüs:'♅',Neptün:'♆',Plüton:'♇'},
  MONTHS: ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'],
  PLANET_INFO: {
    sun: {name:'Güneş', sym:'☉'},
    moon: {name:'Ay', sym:'☽'},
    mercury: {name:'Merkür', sym:'☿'},
    venus: {name:'Venüs', sym:'♀'},
    mars: {name:'Mars', sym:'♂'},
    jupiter: {name:'Jüpiter', sym:'♃'},
    saturn: {name:'Satürn', sym:'♄'},
    uranus: {name:'Uranüs', sym:'♅'},
    neptune: {name:'Neptün', sym:'♆'},
    pluto: {name:'Plüton', sym:'♇'},
    chiron: {name:'Chiron', sym:'⚷'},
    north: {name:'KAD', sym:'☊'},
    south: {name:'GAD', sym:'☋'},
    fortune: {name:'Şans', sym:'⊕'}
  },
  ELEMENT_MAP: {Koç:'fire',Aslan:'fire',Yay:'fire',Boğa:'earth',Başak:'earth',Oğlak:'earth',İkizler:'air',Terazi:'air',Kova:'air',Yengeç:'water',Akrep:'water',Balık:'water'},
  
  /**
   * JD'den tarihe dönüştür
   */
  jdToDate: function(jd) {
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
    
    const totalHours = F * 24;
    const hour = Math.floor(totalHours);
    const minute = Math.round((totalHours - hour) * 60);
    
    return { day, month, year, hour, minute };
  },
  
  /**
   * Solar Dekan sistemini hesapla
   * @param {Object} solarData - computeSolarReturn sonucu
   * @returns {Array} Dekan listesi (tarih, ev, dekan numarası, burç, yönetici)
   */
  calculate: function(solarData) {
    if (!solarData || !solarData.srDekan || !solarData.solarReturnDate) {
      return null;
    }
    
    const srDate = solarData.solarReturnDate;
    const srJD = srDate.jd;
    const srDekan = solarData.srDekan;
    const srChart = solarData.srChart;
    
    // Yıl uzunluğu (gün)
    const solarYearDays = 365.25;
    
    // SR Güneşin ev ve dekan pozisyonunu bul
    const sunHouse = srChart.planets.sun.house;
    
    // Tüm dekanları sırayla listele (1. ev 1. dekandan başla)
    const allDecans = [];
    let cumulativeDegrees = 0;
    
    // Her ev için
    for (let houseIdx = 0; houseIdx < 12; houseIdx++) {
      const house = srDekan[houseIdx];
      const houseSpanDeg = house.meta.spanMin / 60; // Ev genişliği derece olarak
      const decanSpanDeg = houseSpanDeg / 3; // Her dekan genişliği
      
      // Her dekan için
      for (let decanIdx = 0; decanIdx < 3; decanIdx++) {
        const decan = house.decans[decanIdx];
        
        allDecans.push({
          houseNum: house.house,
          houseSign: house.houseSign,
          decanNum: decanIdx + 1,
          decanSign: decan.decanSign,
          ruler: decan.ruler,
          startDegInHouse: decanIdx * decanSpanDeg,
          endDegInHouse: (decanIdx + 1) * decanSpanDeg,
          spanDeg: decanSpanDeg,
          startDegAbsolute: cumulativeDegrees,
          endDegAbsolute: cumulativeDegrees + decanSpanDeg,
          startText: decan.startText
        });
        
        cumulativeDegrees += decanSpanDeg;
      }
    }
    
    // Güneşin haritadaki pozisyonunu bul
    const sunSignLong = srChart.planets.sun.signIdx * 30 + srChart.planets.sun.deg + srChart.planets.sun.min / 60;
    
    // Güneşin hangi dekanda olduğunu bul
    let sunDecanIdx = -1;
    let sunOffsetInDecan = 0;
    
    for (let i = 0; i < allDecans.length; i++) {
      const d = allDecans[i];
      if (d.houseNum === sunHouse) {
        // Bu evdeki pozisyonu hesapla
        const houseStartLong = srChart.houses[sunHouse - 1].signIdx * 30 + srChart.houses[sunHouse - 1].deg + srChart.houses[sunHouse - 1].min / 60;
        let sunPosInHouse = sunSignLong - houseStartLong;
        if (sunPosInHouse < 0) sunPosInHouse += 360;
        
        if (sunPosInHouse >= d.startDegInHouse && sunPosInHouse < d.endDegInHouse) {
          sunDecanIdx = i;
          sunOffsetInDecan = sunPosInHouse - d.startDegInHouse;
          break;
        }
      }
    }
    
    if (sunDecanIdx === -1) {
      // Fallback: İlk dekandan başla
      sunDecanIdx = 0;
      sunOffsetInDecan = 0;
    }
    
    // Sonuç listesi
    const result = [];
    
    // Toplam 360° = solarYearDays gün
    const daysPerDegree = solarYearDays / 360;
    
    // Güneş pozisyonundan başlayarak tüm yılı dolaş
    let currentJD = srJD;
    let totalDegrees = 0;
    
    // İlk dekanın tamamlanmamış kısmını hesapla
    const firstDecan = allDecans[sunDecanIdx];
    const remainingInFirstDecan = firstDecan.spanDeg - sunOffsetInDecan;
    const firstDecanDays = remainingInFirstDecan * daysPerDegree;
    
    // İlk dekan (doğum günü)
    const startDate = this.jdToDate(currentJD);
    result.push({
      order: 1,
      houseNum: firstDecan.houseNum,
      houseSign: firstDecan.houseSign,
      decanNum: firstDecan.decanNum,
      decanSign: firstDecan.decanSign,
      ruler: firstDecan.ruler,
      startJD: currentJD,
      startDate: startDate,
      startDateStr: `${startDate.day} ${this.MONTHS[startDate.month - 1]} ${startDate.year}`,
      spanDays: Math.round(firstDecanDays),
      isFirst: true,
      planets: []
    });
    
    currentJD += firstDecanDays;
    totalDegrees += remainingInFirstDecan;
    
    // Kalan dekanları ekle
    let order = 2;
    let decanIdx = (sunDecanIdx + 1) % 36;
    
    while (totalDegrees < 360) {
      const decan = allDecans[decanIdx];
      const decanDays = decan.spanDeg * daysPerDegree;
      
      const decanStartDate = this.jdToDate(currentJD);
      
      result.push({
        order: order,
        houseNum: decan.houseNum,
        houseSign: decan.houseSign,
        decanNum: decan.decanNum,
        decanSign: decan.decanSign,
        ruler: decan.ruler,
        startJD: currentJD,
        startDate: decanStartDate,
        startDateStr: `${decanStartDate.day} ${this.MONTHS[decanStartDate.month - 1]} ${decanStartDate.year}`,
        spanDays: Math.round(decanDays),
        isFirst: false,
        planets: []
      });
      
      currentJD += decanDays;
      totalDegrees += decan.spanDeg;
      order++;
      decanIdx = (decanIdx + 1) % 36;
      
      if (order > 36) break; // Güvenlik
    }
    
    // Gezegenleri dekanlara yerleştir - TARİH HESAPLAYARAK
    Object.entries(srChart.planets).forEach(([key, planet]) => {
      if (!planet) return;
      
      const planetHouse = planet.house;
      const planetSignLong = planet.signIdx * 30 + planet.deg + planet.min / 60;
      
      // Gezegenin ev içindeki pozisyonunu hesapla
      const houseStartLong = srChart.houses[planetHouse - 1].signIdx * 30 + 
                             srChart.houses[planetHouse - 1].deg + 
                             srChart.houses[planetHouse - 1].min / 60;
      let planetPosInHouse = planetSignLong - houseStartLong;
      if (planetPosInHouse < 0) planetPosInHouse += 360;
      if (planetPosInHouse >= 360) planetPosInHouse -= 360;
      
      // Gezegenin hangi dekanda olduğunu bul
      const houseData = srDekan[planetHouse - 1];
      const decanSpan = houseData.meta.spanMin / 60 / 3;
      let planetDecanNum;
      if (planetPosInHouse < decanSpan) {
        planetDecanNum = 1;
      } else if (planetPosInHouse < decanSpan * 2) {
        planetDecanNum = 2;
      } else {
        planetDecanNum = 3;
      }
      
      // Gezegen tarihini hesapla
      // Güneş pozisyonundan gezegenin ev-dekan pozisyonuna kadar kaç derece?
      // Her ev'in başından itibaren hesapla
      let planetDegOffset = 0;
      for (let hi = 0; hi < planetHouse - 1; hi++) {
        planetDegOffset += srDekan[hi].meta.spanMin / 60;
      }
      planetDegOffset += planetPosInHouse;
      
      // Güneş'in kendi pozisyonundan başlayarak kaç derece ileri?
      const sunHouseIdx = srChart.planets.sun.house - 1;
      let sunDegOffset = 0;
      for (let hi = 0; hi < sunHouseIdx; hi++) {
        sunDegOffset += srDekan[hi].meta.spanMin / 60;
      }
      const sunHouseStart = srChart.houses[sunHouseIdx].signIdx * 30 + 
                            srChart.houses[sunHouseIdx].deg + 
                            srChart.houses[sunHouseIdx].min / 60;
      const sunSignLong = srChart.planets.sun.signIdx * 30 + 
                          srChart.planets.sun.deg + 
                          srChart.planets.sun.min / 60;
      let sunPosInHouse = sunSignLong - sunHouseStart;
      if (sunPosInHouse < 0) sunPosInHouse += 360;
      sunDegOffset += sunPosInHouse;
      
      // Güneş'ten gezegene kaç derece?
      let degFromSun = planetDegOffset - sunDegOffset;
      if (degFromSun < 0) degFromSun += 360;
      
      // Bu dereceyi güne çevir
      const daysFromSR = degFromSun * daysPerDegree;
      const planetJD = srJD + daysFromSR;
      const planetDate = this.jdToDate(planetJD);
      const planetDateStr = `${planetDate.day} ${this.MONTHS[planetDate.month - 1]}`;
      
      // Sonuçlarda bu dekana ekle
      const targetDecan = result.find(d => d.houseNum === planetHouse && d.decanNum === planetDecanNum);
      if (targetDecan) {
        const pInfo = this.PLANET_INFO[key];
        targetDecan.planets.push({
          key: key,
          name: pInfo?.name || key,
          sym: pInfo?.sym || '?',
          signIdx: planet.signIdx,
          deg: planet.deg,
          min: planet.min,
          sign: this.SIGNS[planet.signIdx],
          dateStr: planetDateStr,
          fullDateStr: `${planetDate.day} ${this.MONTHS[planetDate.month - 1]} ${planetDate.year}`,
          daysFromSR: Math.round(daysFromSR)
        });
      }
    });
    
    return result;
  },
  
  /**
   * Render Solar Dekan sonuçları
   */
  render: function(data, container) {
    if (!data || !container) return;
    
    container.innerHTML = '';
    
    // Başlık
    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom:16px;padding:14px 18px;background:linear-gradient(135deg,rgba(110,231,255,.12),rgba(139,92,246,.08));border-radius:12px;border-left:4px solid var(--accent)';
    header.innerHTML = `
      <div style="font-weight:700;font-size:16px;color:var(--accent)">🗓️ Solar Dekan Takvimi</div>
      <div style="font-size:12px;color:var(--muted);margin-top:6px">Dekan dekan tarihler ve gezegenler</div>
    `;
    container.appendChild(header);
    
    // Her dekan için kart
    data.forEach(d => {
      const card = document.createElement('div');
      card.className = `house`;
      card.style.cssText = 'margin-bottom:10px';
      
      const elemClass = this.ELEMENT_MAP[d.decanSign] || 'fire';
      
      card.innerHTML = `
        <div class="kv el-${elemClass}" style="padding:12px 16px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;font-size:14px;line-height:1.6">
            <span style="font-weight:800;color:var(--accent);min-width:32px">${d.order}.</span>
            <span style="font-weight:700">${d.startDateStr}</span>
            <span style="color:var(--muted)">•</span>
            <span style="font-weight:600">${d.houseNum}. Ev</span>
            <span style="color:var(--muted)">•</span>
            <span style="color:var(--accent-3);font-weight:600">${d.decanNum}. dekan</span>
            <span style="color:var(--muted)">•</span>
            <span style="color:var(--accent)">${this.SIGN_SYM[d.decanSign]} ${d.decanSign}</span>
            <span style="color:var(--muted);font-size:12px">(${this.RULER_SYM[d.ruler] || ''} ${d.ruler})</span>
            <span style="color:var(--muted);font-size:11px;margin-left:auto">~${d.spanDays} gün</span>
          </div>
        </div>
      `;
      
      container.appendChild(card);
      
      // Gezegenler
      if (d.planets && d.planets.length > 0) {
        d.planets.forEach(p => {
          const pCard = document.createElement('div');
          pCard.className = 'kv planet';
          pCard.style.cssText = 'margin-left:20px;padding:10px 14px;background:rgba(245,158,11,.08);border-left:3px solid var(--accent-3);margin-bottom:4px';
          
          // Tarih bilgisi varsa göster
          const dateInfo = p.dateStr ? `<span style="color:var(--accent);font-weight:600;margin-left:auto">→ ${p.dateStr}</span>` : '';
          const daysInfo = p.daysFromSR !== undefined ? `<span style="color:var(--muted);font-size:11px">(+${p.daysFromSR} gün)</span>` : '';
          
          pCard.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px">
              <span style="font-weight:700">${p.sym} ${p.name}</span>
              <span style="color:var(--muted)">•</span>
              <span>${p.sign} ${this.SIGN_SYM[p.sign]}</span>
              <span style="color:var(--muted)">•</span>
              <span style="font-family:monospace">${p.deg}°${String(p.min).padStart(2,'0')}'</span>
              ${daysInfo}
              ${dateInfo}
            </div>
          `;
          
          container.appendChild(pCard);
        });
      }
    });
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SolarDekan;
}
