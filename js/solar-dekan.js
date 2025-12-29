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
      startText: firstDecan.startText || '',
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
        startText: decan.startText || '',
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
      
      // Gezegeni TAR\u0130HE G\u00d6RE do\u011fru dekana yerle\u015ftir
      // daysFromSR'ye g\u00f6re hangi dekana d\u00fc\u015ft\u00fc\u011f\u00fcn\u00fc bul
      let cumulativeDays = 0;
      let targetDecan = null;
      
      for (const decan of result) {
        const decanEndDay = cumulativeDays + decan.spanDays;
        if (daysFromSR >= cumulativeDays && daysFromSR < decanEndDay) {
          targetDecan = decan;
          break;
        }
        cumulativeDays = decanEndDay;
      }
      
      // E\u011fer bulunamad\u0131ysa (y\u0131l\u0131n sonuna yak\u0131n), son dekana ekle
      if (!targetDecan && result.length > 0) {
        targetDecan = result[result.length - 1];
      }
      
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
    
    // Gezegenleri tarihe göre sırala (her dekan için)
    result.forEach(d => {
      if (d.planets && d.planets.length > 1) {
        d.planets.sort((a, b) => a.daysFromSR - b.daysFromSR);
      }
    });
    
    return result;
  },
  /**
   * Render Solar Dekan sonuçları - Dekan Hesaplama Tarzı
   * Ev başlıkları altında 3'er dekan gösterir
   */
  render: function(data, container, srChart) {
    if (!data || !container) return;
    
    container.innerHTML = '';
    
    // Açı hesaplama fonksiyonu
    const ASPECT_DEFS = {
      conjunction: { angle: 0, orb: 8, symbol: '☌', name: 'Kavuşum', color: '#EF4444' },
      sextile: { angle: 60, orb: 6, symbol: '⚹', name: '60\'lık', color: '#38BDF8' },
      square: { angle: 90, orb: 7, symbol: '□', name: 'Kare', color: '#EF4444' },
      trine: { angle: 120, orb: 8, symbol: '△', name: 'Üçgen', color: '#22C55E' },
      opposition: { angle: 180, orb: 8, symbol: '☍', name: 'Karşıt', color: '#3B82F6' }
    };
    
    // Tüm gezegen pozisyonlarını topla (açı hesabı için)
    const allPlanetPositions = {};
    data.forEach(d => {
      if (d.planets) {
        d.planets.forEach(p => {
          allPlanetPositions[p.key] = {
            ...p,
            longitude: p.signIdx * 30 + p.deg + p.min / 60
          };
        });
      }
    });
    
    // Bir gezegen için açıları hesapla
    const getAspectsFor = (planetKey) => {
      const p1 = allPlanetPositions[planetKey];
      if (!p1) return [];
      
      const aspects = [];
      Object.entries(allPlanetPositions).forEach(([key2, p2]) => {
        if (key2 === planetKey) return;
        
        let diff = Math.abs(p1.longitude - p2.longitude);
        if (diff > 180) diff = 360 - diff;
        
        for (const [aspectKey, aspect] of Object.entries(ASPECT_DEFS)) {
          const distance = Math.abs(diff - aspect.angle);
          if (distance <= aspect.orb) {
            aspects.push({
              planet: key2,
              planetName: p2.name,
              planetSym: p2.sym,
              type: aspectKey,
              symbol: aspect.symbol,
              name: aspect.name,
              color: aspect.color,
              orb: distance.toFixed(1)
            });
            break;
          }
        }
      });
      return aspects;
    };
    
    // Başlık
    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom:16px;padding:14px 18px;background:linear-gradient(135deg,rgba(110,231,255,.12),rgba(139,92,246,.08));border-radius:12px;border-left:4px solid var(--accent)';
    header.innerHTML = `
      <div style="font-weight:700;font-size:16px;color:var(--accent)">🗓️ Solar Dekan Takvimi</div>
      <div style="font-size:12px;color:var(--muted);margin-top:6px">Yükselenden başlayarak evler ve dekanlar, tarihler ve gezegenler</div>
    `;
    container.appendChild(header);
    
    // Evlere göre dekanları grupla
    const houseGroups = {};
    data.forEach(d => {
      const houseNum = d.houseNum;
      if (!houseGroups[houseNum]) {
        houseGroups[houseNum] = {
          houseNum: houseNum,
          houseSign: d.houseSign,
          decans: []
        };
      }
      houseGroups[houseNum].decans.push(d);
    });
    
    // Her ev için (1'den 12'ye sırayla)
    for (let houseNum = 1; houseNum <= 12; houseNum++) {
      const houseData = houseGroups[houseNum];
      if (!houseData || houseData.decans.length === 0) continue;
      
      // Dekanları 1, 2, 3 sırasına göre sırala (ev içinde doğru sıralama)
      houseData.decans.sort((a, b) => a.decanNum - b.decanNum);
      
      const houseDiv = document.createElement('div');
      houseDiv.className = 'house';
      houseDiv.style.cssText = 'margin-bottom:14px';

      // Evin Tarih Aralığı ve Süresi Hesaplama
      const firstDecan = houseData.decans[0];
      const lastDecan = houseData.decans[houseData.decans.length - 1];
      
      // Bitiş tarihini hesaplamak için son dekanın gününü ekleyelim
      const endJD = lastDecan.startJD + (lastDecan.spanDays * (365.25/360) * lastDecan.spanDeg); // Yaklaşık
      // Daha basit: Son dekanın spanDays'ini ekleyelim
      // Aslında görsel olarak "Başlangıç Tarihi" yeterli olabilir ama "Ne zaman bitiyor" da istenmiş.
      // Basitçe: İlk dekan tarihi - Son dekanın bitişi (bir sonraki evin başlangıcı)
      // Şimdilik sadece Başlangıç Tarihi ve Toplam Gün yazalım.
      const totalDays = houseData.decans.reduce((sum, d) => sum + d.spanDays, 0);
      
      // Ev başlığı
      houseDiv.innerHTML = `
        <div class="title" style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:linear-gradient(135deg,rgba(245,158,11,.15),rgba(110,231,255,.05));border-radius:12px;margin-bottom:8px;border:1px solid rgba(245,158,11,.2);flex-wrap:wrap">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--accent-3);color:#0a1628;width:32px;height:32px;border-radius:8px;font-weight:800;font-size:18px;line-height:1">
              ${houseNum}
            </div>
            <div style="font-size:16px;font-weight:700;color:var(--text-main)">Ev</div>
            <div style="font-size:16px;color:var(--muted)">•</div>
            <div style="font-size:16px;font-weight:600;color:var(--accent-3)">
              ${this.SIGN_SYM[houseData.houseSign]} ${houseData.houseSign}
            </div>
          </div>
          <div style="margin-left:auto;display:flex;align-items:center;gap:8px;font-size:13px;background:rgba(0,0,0,0.2);padding:4px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.1)">
             <span style="color:var(--text-main);font-weight:600">📅 ${firstDecan.startDateStr}</span>
             <span style="color:var(--muted)">•</span>
             <span style="color:var(--accent-2)">~${Math.round(totalDays)} gün</span>
          </div>
        </div>
      `;
      
      const list = document.createElement('div');
      list.className = 'list';
      
      // Element renkleri (AstroHarmony Harita Renkleri ile Uyumlu)
      // Fire: #EF4444 (239,68,68)
      // Earth: #22C55E (34,197,94)
      // Air: #06B6D4 (6,182,212) - Cyan/Turkuaz
      // Water: #3B82F6 (59,130,246) - Blue
      
      const EL_BG = {
        fire: 'rgba(239,68,68,0.12)',
        earth: 'rgba(34,197,94,0.12)',
        air: 'rgba(6,182,212,0.12)',
        water: 'rgba(59,130,246,0.12)'
      };
      const EL_BORDER = {
        fire: 'rgba(239,68,68,0.3)',
        earth: 'rgba(34,197,94,0.3)',
        air: 'rgba(6,182,212,0.3)',
        water: 'rgba(59,130,246,0.3)'
      };

      // Bu evin 3 dekanı
      houseData.decans.forEach(d => {
        const elemClass = this.ELEMENT_MAP[d.decanSign] || 'fire';
        const startDegInfo = d.startText || '';
        
        const decanRow = document.createElement('div');
        // Kompakt stil
        decanRow.className = `solar-decan-item el-${elemClass}`;
        decanRow.style.cssText = `
            background: ${EL_BG[elemClass]};
            border: 1px solid ${EL_BORDER[elemClass]};
            border-radius: 8px;
            padding: 8px 12px;
            margin-bottom: 6px;
        `;
        
        // Format: 
        // 1. dekan • 2° 13' ♑ Oğlak → ♉ Boğa (♀ Venüs)
        // 5 Ocak 2021 (Hemen altında)
        decanRow.innerHTML = `
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:13px;line-height:1.4;margin-bottom:2px">
             <span style="font-weight:700;color:var(--accent-3)">${d.decanNum}. dekan</span>
             <span style="color:var(--muted)">•</span>
             <span style="font-family:'JetBrains Mono';opacity:0.9">${startDegInfo}</span>
             <span style="color:var(--text-muted)">${this.SIGN_SYM[d.houseSign]} ${d.houseSign}</span>
             <span style="color:var(--muted)">→</span>
             <span style="font-weight:600;color:var(--text-main)">${this.SIGN_SYM[d.decanSign]} ${d.decanSign}</span>
             <span style="font-size:12px;opacity:0.7;margin-left:2px">(${this.RULER_SYM[d.ruler] || ''} ${d.ruler})</span>
          </div>
          <div style="font-size:12px;font-weight:600;color:var(--accent);margin-top:2px;margin-left:2px">
             📅 ${d.startDateStr} <span style="font-weight:400;opacity:0.6;margin-left:4px">(~${d.spanDays} gün)</span>
          </div>
        `;
        list.appendChild(decanRow);
        
        // Bu dekandaki gezegenler
        if (d.planets && d.planets.length > 0) {
          d.planets.forEach(p => {
            const pCard = document.createElement('div');
            pCard.className = 'kv planet';
            pCard.style.cssText = 'margin-left:16px;padding:6px 10px;background:rgba(0,0,0,0.2);border-left:2px solid var(--accent-3);margin-bottom:2px;cursor:pointer;font-size:13px;border-radius:0 6px 6px 0';
            
            // Açıları hesapla
            const aspects = getAspectsFor(p.key);
            const hasAspects = aspects.length > 0;
            
            // Tarih bilgisi ve açı badge
            const dateInfo = p.dateStr ? `<span style="color:var(--accent);font-weight:600;margin-left:auto">→ ${p.dateStr}</span>` : '';
            const aspectBadge = hasAspects ? `<span class="aspect-toggle" style="color:var(--accent-2);font-size:11px;margin-left:6px;cursor:pointer"> ▼ ${aspects.length} açı</span>` : '';
            
            pCard.innerHTML = `
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span style="font-weight:700">${p.sym} ${p.name}</span>
                <span style="color:var(--muted)">•</span>
                <span>${this.SIGN_SYM[p.sign]}</span>
                <span style="font-family:monospace;font-size:12px">${p.deg}°${String(p.min).padStart(2,'0')}'</span>
                ${aspectBadge}
                ${dateInfo}
              </div>
            `;
            
            list.appendChild(pCard);
            
            // Açılar container
            if (hasAspects) {
              const aspectsContainer = document.createElement('div');
              aspectsContainer.className = 'planet-aspects';
              aspectsContainer.style.cssText = 'display:none;margin-left:30px;padding:4px 0;border-left:1px solid rgba(139,92,246,0.3);margin-bottom:6px';
              
              aspects.forEach(asp => {
                const aspEl = document.createElement('div');
                aspEl.style.cssText = 'padding:4px 10px;font-size:12px;background:rgba(139,92,246,0.05);margin:2px 0;border-radius:4px';
                aspEl.innerHTML = `<span style="color:${asp.color};font-weight:bold">${asp.symbol}</span> ${asp.name} <span style="color:var(--muted)">${asp.planetSym} ${asp.planetName}</span> <span style="font-size:10px;opacity:0.7">(${asp.orb}°)</span>`;
                aspectsContainer.appendChild(aspEl);
              });
              
              list.appendChild(aspectsContainer);
              
              // Toggle event
              pCard.addEventListener('click', () => {
                const toggle = pCard.querySelector('.aspect-toggle');
                const isOpen = aspectsContainer.style.display !== 'none';
                aspectsContainer.style.display = isOpen ? 'none' : 'block';
                if (toggle) toggle.innerHTML = ` ${isOpen ? '▼' : '▲'} ${aspects.length} açı`;
              });
            }
          });
        }
      });
      
      houseDiv.appendChild(list);
      container.appendChild(houseDiv);
    }
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SolarDekan;
}
