/**
 * 7'ler Ev Dekanı Hesaplama Sistemi
 * 
 * Bu sistem, her yaş aralığının Dekan Hesaplama'daki hangi ev dekanına
 * denk geldiğini hesaplar.
 * 
 * Mantık:
 * - Ev genişliği 3'e bölünür → her parça bir dekan
 * - Ev genişliği 7'ye bölünür → her parça bir yaş
 * - Her yaş için, o yaşın başlangıç pozisyonunun hangi dekana düştüğü bulunur
 */

const SevenDekan = {
  /**
   * 7'ler için ev dekanı hesapla
   * @param {Array} sevenResults - computeSeven sonuçları
   * @param {Array} decanResults - computeDecan sonuçları
   * @returns {Array} Her yaş için ev dekanı bilgisi
   */
  /**
   * 7'ler için asli dekan hesapla
   * Asli Dekan Sistemi: 0-10° = 1.dekan, 10-20° = 2.dekan, 20-30° = 3.dekan
   * @param {Array} sevenResults - computeSeven sonuçları
   * @param {Array} decanResults - computeDecan sonuçları
   * @returns {Array} Her yaş için asli dekan bilgisi
   */
  calculate: function(sevenResults, decanResults) {
    if (!sevenResults || !decanResults) return null;
    
    const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
    const RULERS = ['Mars','Venüs','Merkür','Ay','Güneş','Merkür','Venüs','Plüton','Jüpiter','Satürn','Uranüs','Neptün'];
    const ELEMENT_CYCLE = {
      fire: [0, 4, 8],   // Koç, Aslan, Yay
      earth: [1, 5, 9],  // Boğa, Başak, Oğlak
      air: [2, 6, 10],   // İkizler, Terazi, Kova
      water: [3, 7, 11]  // Yengeç, Akrep, Balık
    };
    
    // Asli dekan hesaplama fonksiyonu
    function getAsliDekan(signIdx, degInSign) {
      const dekanBand = degInSign < 10 ? 0 : degInSign < 20 ? 1 : 2;
      const elem = [0,4,8].includes(signIdx) ? 'fire' : 
                   [1,5,9].includes(signIdx) ? 'earth' : 
                   [2,6,10].includes(signIdx) ? 'air' : 'water';
      const cycle = ELEMENT_CYCLE[elem];
      const startPos = cycle.indexOf(signIdx);
      const dekanSignIdx = cycle[(startPos + dekanBand) % 3];
      return {
        band: dekanBand + 1,
        signIdx: dekanSignIdx,
        sign: SIGNS[dekanSignIdx],
        ruler: RULERS[dekanSignIdx]
      };
    }
    
    const result = [];
    
    sevenResults.forEach((house, houseIdx) => {
      const decanHouse = decanResults[houseIdx];
      if (!decanHouse) return;
      
      const houseData = {
        house: house.house,
        houseSign: house.houseSign,
        birthYear: house.birthYear,
        spanMin: house.spanMin,
        spanText: house.spanText,
        segments: []
      };
      
      house.segments.forEach((seg, segIdx) => {
        // Pozisyonun burç indexini ve derece değerini al
        const signIdx = SIGNS.indexOf(seg.signStart);
        const startDeg = parseInt(seg.startText.split('°')[0]) || 0;
        
        // Asli dekan hesapla
        const asliDekan = getAsliDekan(signIdx, startDeg);
        
        houseData.segments.push({
          startAge: seg.startAge,
          endAge: seg.endAge,
          startText: seg.startText,
          signStart: seg.signStart,
          signIdx: signIdx,
          absStartMin: seg.absStartMin,
          absEndMin: seg.absEndMin,
          // Asli dekan bilgisi
          asliDekan: {
            number: asliDekan.band,
            sign: asliDekan.sign,
            signIdx: asliDekan.signIdx,
            ruler: asliDekan.ruler
          }
        });
      });
      
      result.push(houseData);
    });
    
    return result;
  },
  
  /**
   * Ev dekanı sonuçlarını render et
   * @param {Array} data - calculate sonucu
   * @param {Array} planets - Gezegen verileri
   * @param {Object} aspects - Açı verileri
   * @param {HTMLElement} container - Hedef container
   * @param {Array} cusps - Ev cusp'ları (delta hesaplamak için)
   */
  render: function(data, planets, aspects, container, cusps) {
    if (!data || !container) return;
    
    const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
    const SIGN_SYM = {Koç:'♈',Boğa:'♉',İkizler:'♊',Yengeç:'♋',Aslan:'♌',Başak:'♍',Terazi:'♎',Akrep:'♏',Yay:'♐',Oğlak:'♑',Kova:'♒',Balık:'♓'};
    const RULER_SYM = {Mars:'♂',Venüs:'♀',Merkür:'☿',Ay:'☽',Güneş:'☉',Jüpiter:'♃',Satürn:'♄',Uranüs:'♅',Neptün:'♆',Plüton:'♇'};
    const ELEMENT_MAP = {Koç:'fire',Aslan:'fire',Yay:'fire',Boğa:'earth',Başak:'earth',Oğlak:'earth',İkizler:'air',Terazi:'air',Kova:'air',Yengeç:'water',Akrep:'water',Balık:'water'};
    const PLANET_SYMS = {sun:'☉',moon:'☽',mercury:'☿',venus:'♀',mars:'♂',jupiter:'♃',saturn:'♄',uranus:'♅',neptune:'♆',pluto:'♇',chiron:'⚷',north:'☊',south:'☋',fortune:'⊕',mc:'MC',asc:'ASC'};
    const PLANET_NAMES = {sun:'Güneş',moon:'Ay',mercury:'Merkür',venus:'Venüs',mars:'Mars',jupiter:'Jüpiter',saturn:'Satürn',uranus:'Uranüs',neptune:'Neptün',pluto:'Plüton',chiron:'Chiron',north:'KAD',south:'GAD',fortune:'Şans',mc:'MC',asc:'ASC'};
    
    function elementOf(sign) { return ELEMENT_MAP[sign] || 'fire'; }
    function toMin(d,m) { return d*60+(m||0); }
    
    // Ev cusp'larını dakikaya çevir
    const cuspMinutes = cusps ? cusps.map(c => toMin(c.deg, c.min)) : [];
    
    // Gezegenlerin ev içindeki pozisyonunu (delta) hesapla
    // delta = gezegen pozisyonu - ev başlangıcı (dakika cinsinden, ev içindeki pozisyon)
    const planetsWithDelta = (planets || []).map(pl => {
      if (!cusps || pl.house < 1 || pl.house > 12) return {...pl, delta: 0};
      
      const houseIdx = pl.house - 1;
      const cuspStart = cuspMinutes[houseIdx];
      const cuspEnd = cuspMinutes[(houseIdx + 1) % 12];
      
      // Gezegen pozisyonu burç-derece-dakika olarak (posMin zaten burç içindeki pozisyon)
      // Ama bize ev içindeki pozisyon lazım
      // Gezegen toplam pozisyonu: signIdx * 30 * 60 + deg * 60 + min
      const planetPosTotal = pl.signIdx * 30 * 60 + pl.deg * 60 + pl.min;
      
      // Ev başlangıcı burç-derece-dakika olarak (cusp sadece deg, min veriyor, burç yok)
      // Cusp değerleri 0-359 derece arası olmalı, dakikaya çevirilmiş
      // Ama mevcut yapıda cusp sadece {deg, min} içeriyor (burç içindeki pozisyon)
      // Bu durumda delta hesaplaması data'daki spanMin kullanmalı
      
      // Daha basit yaklaşım: data[houseIdx].spanMin toplam ev genişliğini verir
      // Gezegen pozisyonunu orantısal olarak hesaplayabiliriz
      // Ama bu tam doğru değil çünkü gezegen pozisyonu burç bazlı
      
      // En doğru yaklaşım: planets objesinden totalDegrees alıp, 
      // bunu ev cusp'ının toplam derece değeriyle karşılaştırmak
      // Ama cusp'ın burç bilgisi yok...
      
      // GEÇİCİ ÇÖZÜM: Gezegen posMin değerini (burc içindeki dakika) 
      // ve ev genişliğini kullanarak orantısal hesapla
      const houseData = data[houseIdx];
      if (!houseData) return {...pl, delta: 0};
      
      const houseSpan = houseData.spanMin;
      // Gezegen ev'in kaçıncı 7'sinde?
      // Her 7 için span = houseSpan / 7
      // Gezegen'in hangi segment'te olduğunu segment.absStartMin/absEndMin ile karşılaştır
      
      // Gezegen başlangıç pozisyonunu hesapla (ev içindeki dakika)
      // Bu karmaşık olduğundan, geçici olarak posMin kullan
      // posMin zaten burç içindeki dakika (0-1799 arası)
      
      // Ev başlangıcı da aynı şekilde dakika (cuspStart)
      // Delta = posMin - cuspStart (ama burçları dikkate almalı)
      
      // Daha doğru: totalDegrees kullan
      const planetTotalMin = pl.totalDegrees ? pl.totalDegrees * 60 : (pl.signIdx * 30 * 60 + pl.deg * 60 + pl.min);
      
      // Ev başlangıcı toplam dakika (cuspStart zaten burç içindeki pozisyon)
      // Cusp'ın hangi burçta olduğu data'dan alınabilir
      const houseSign = houseData.houseSign;
      const houseSignIdx = SIGNS.indexOf(houseSign);
      const houseTotalMin = houseSignIdx * 30 * 60 + cuspStart;
      
      // Delta hesapla (gezegen - ev başlangıcı)
      let delta = planetTotalMin - houseTotalMin;
      if (delta < 0) delta += 360 * 60; // Wrap around
      if (delta >= houseSpan) delta = delta % houseSpan; // Ev sınırları içinde kal
      
      return {...pl, delta: delta};
    });
    
    // Gezegenleri evlere yerleştir (delta hesaplanmış olanlar)
    const byHouse = Array.from({length: 12}, () => []);
    planetsWithDelta.forEach(pl => {
      const hi = pl.house - 1;
      if (hi < 0 || hi > 11) return;
      const house = data[hi];
      if (!house) return;
      byHouse[hi].push({...pl});
    });
    
    // Açıları hazırla
    const planetAspects = {};
    if (aspects && aspects.length > 0) {
      aspects.forEach(asp => {
        if (!planetAspects[asp.planet1]) planetAspects[asp.planet1] = [];
        if (!planetAspects[asp.planet2]) planetAspects[asp.planet2] = [];
        planetAspects[asp.planet1].push({ ...asp, otherPlanet: asp.planet2 });
        planetAspects[asp.planet2].push({ ...asp, otherPlanet: asp.planet1 });
      });
    }
    
    container.innerHTML = '';
    
    // Asli dekan hesaplama fonksiyonu (gezegenlerin kendi dekanları için)
    const ELEMENT_CYCLE = {
      fire: [0, 4, 8],
      earth: [1, 5, 9],
      air: [2, 6, 10],
      water: [3, 7, 11]
    };
    const RULERS = ['Mars','Venüs','Merkür','Ay','Güneş','Merkür','Venüs','Plüton','Jüpiter','Satürn','Uranüs','Neptün'];
    
    function getAsliDekan(signIdx, degInSign) {
      const deg = typeof degInSign === 'number' ? degInSign : 0;
      const dekanBand = deg < 10 ? 0 : deg < 20 ? 1 : 2;
      const elem = [0,4,8].includes(signIdx) ? 'fire' : 
                   [1,5,9].includes(signIdx) ? 'earth' : 
                   [2,6,10].includes(signIdx) ? 'air' : 'water';
      const cycle = ELEMENT_CYCLE[elem];
      const startPos = cycle.indexOf(signIdx);
      const dekanSignIdx = cycle[(startPos + dekanBand) % 3];
      return {
        band: dekanBand + 1,
        signIdx: dekanSignIdx,
        sign: SIGNS[dekanSignIdx],
        ruler: RULERS[dekanSignIdx]
      };
    }
    
    data.forEach((h, hi) => {
      const houseDiv = document.createElement('div');
      houseDiv.className = 'house';
      houseDiv.innerHTML = `
        <div class="title" style="display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(135deg,rgba(245,158,11,.1),rgba(139,92,246,.05));border-radius:10px;margin-bottom:8px">
          <span class="badge" style="font-size:16px;font-weight:800;background:rgba(245,158,11,.15);border-color:rgba(245,158,11,.4)">${h.house}</span>
          <span style="font-weight:700;font-size:16px">Ev</span>
          <span style="color:var(--muted);font-size:14px">•</span>
          <span style="font-size:15px;color:var(--accent-3)">${SIGN_SYM[h.houseSign]} ${h.houseSign}</span>
        </div>
      `;
      
      const list = document.createElement('div');
      list.className = 'list';
      
      // Her yaş segmenti
      h.segments.forEach((seg, segIdx) => {
        const asliDekan = seg.asliDekan;
        const kv = document.createElement('div');
        kv.className = `kv el-${elementOf(asliDekan.sign)}`;
        kv.style.cssText = 'padding:12px 14px';
        
        const ageStr = `${seg.startAge}–${seg.endAge} yaş`;
        const yearStr = h.birthYear ? `${h.birthYear + seg.startAge}–${h.birthYear + seg.endAge}` : '';
        
        // Format: 0–1 yaş • 1999–2000 • 27° 03' ♒ Kova → ♎ Terazi (♀ Venüs)
        kv.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;line-height:1.6">
            <span style="font-weight:700">${ageStr}</span>
            ${yearStr ? `<span style="color:var(--muted)">•</span> <span class="year-range" style="color:var(--muted)">${yearStr}</span>` : ''}
            <span style="color:var(--muted)">•</span>
            <span style="font-family:monospace">${seg.startText}</span>
            <span style="color:var(--muted)">${SIGN_SYM[seg.signStart] || ''} ${seg.signStart}</span>
            <span style="color:var(--muted)">→</span>
            <span style="color:var(--accent)">${SIGN_SYM[asliDekan.sign]} ${asliDekan.sign}</span>
            <span style="color:var(--muted);font-size:12px">(${RULER_SYM[asliDekan.ruler] || ''} ${asliDekan.ruler})</span>
          </div>
        `;
        list.appendChild(kv);
        
        // Bu yaş aralığındaki gezegenler - YAŞ ARALIĞINA GÖRE YERLEŞTİR
        const houseSpan = h.spanMin;
        const stepSize = houseSpan / 7; // Her yaş için dakika
        const decanSize = houseSpan / 3; // Her dekan için dakika
        const segStartDelta = segIdx * stepSize;
        const segEndDelta = (segIdx + 1) * stepSize;
        
        byHouse[hi].forEach(p => {
          // Gezegenin ev içindeki delta pozisyonu
          const pDelta = p.delta !== undefined ? p.delta : 0;
          
          // Gezegen bu yaş aralığında mı?
          if (pDelta >= segStartDelta && pDelta < segEndDelta) {
            const pAspects = planetAspects[p.key];
            const hasAspects = pAspects && pAspects.length > 0;
            
            // Gezegenin asli dekanını hesapla (natal haritadaki pozisyonuna göre)
            const planetAsliDekan = getAsliDekan(p.signIdx, p.deg);
            
            const signName = SIGNS[p.signIdx];
            const degStr = `${Math.floor(p.posMin/60)}°${String(p.posMin%60).padStart(2,'0')}'`;
            const aspectBadge = hasAspects ? `<span class="aspect-toggle" style="color:var(--accent);font-size:12px;cursor:pointer;margin-left:auto"> ▼ ${pAspects.length} açı</span>` : '';
            
            const pk = document.createElement('div');
            pk.className = 'kv planet';
            pk.style.cssText = 'margin-left:16px;padding:10px 14px;background:rgba(245,158,11,.08);border-left:3px solid var(--accent-3);cursor:' + (hasAspects ? 'pointer' : 'default');
            pk.innerHTML = `
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px">
                <span style="font-weight:700">${p.sym} ${p.name}</span>
                <span style="color:var(--muted)">•</span>
                <span>${signName} ${SIGN_SYM[signName]}</span>
                <span style="color:var(--muted)">•</span>
                <span style="font-family:monospace">${degStr}</span>
                ${aspectBadge}
              </div>
            `;
            list.appendChild(pk);
            
            // Açılar
            if (hasAspects) {
              const aspectsContainer = document.createElement('div');
              aspectsContainer.className = 'planet-aspects';
              aspectsContainer.style.cssText = 'display:none;margin-left:32px;padding:6px 0;border-left:2px solid rgba(139,92,246,0.3);margin-bottom:8px';
              
              const aspectOrder = { 0: 0, 60: 1, 90: 2, 120: 3, 180: 4 };
              const sortedAspects = [...pAspects].sort((a, b) => (aspectOrder[a.angle] || 99) - (aspectOrder[b.angle] || 99));
              
              sortedAspects.forEach(asp => {
                const aspEl = document.createElement('div');
                aspEl.style.cssText = 'padding:6px 14px;font-size:13px;background:rgba(139,92,246,0.05);margin:3px 0;border-radius:6px';
                const otherSym = PLANET_SYMS[asp.otherPlanet] || '?';
                const otherName = PLANET_NAMES[asp.otherPlanet] || asp.otherPlanet;
                aspEl.innerHTML = `<span style="color:${asp.color};font-weight:bold">${asp.symbol}</span> ${asp.aspect} <span style="color:var(--muted)">${otherSym} ${otherName}</span> <span style="font-size:11px;opacity:0.7">(${asp.orb}°)</span>`;
                aspectsContainer.appendChild(aspEl);
              });
              list.appendChild(aspectsContainer);
              
              pk.addEventListener('click', () => {
                const toggle = pk.querySelector('.aspect-toggle');
                const isOpen = aspectsContainer.style.display !== 'none';
                aspectsContainer.style.display = isOpen ? 'none' : 'block';
                if (toggle) toggle.innerHTML = ` ${isOpen ? '▼' : '▲'} ${pAspects.length} açı`;
              });
            }
          }
        });
      });
      
      houseDiv.appendChild(list);
      
      const meta = document.createElement('div');
      meta.className = 'meta';
      meta.innerHTML = `Ev: ${h.spanText} — Dekan: ${(h.spanMin / 3 / 60).toFixed(1)}°`;
      houseDiv.appendChild(meta);
      container.appendChild(houseDiv);
    });
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SevenDekan;
}
