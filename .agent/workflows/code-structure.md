---
description: AstroHarmony kod yapısı ve dosya rehberi
---

# AstroHarmony Kod Yapısı

## 📁 Dosya Yapısı

```
/Users/k/Desktop/asmm/
├── astroharmony.html    # Ana uygulama (HTML + CSS + inline JS)
├── ephemeris.js         # Swiss Ephemeris WASM wrapper
├── js/                  # Modüler JS dosyaları (gelecek migrasyon için)
│   ├── data.js          # Sabitler, burçlar, ülkeler, presetler
│   ├── utils.js         # Yardımcı fonksiyonlar
│   ├── calculations.js  # CORE astronomik hesaplamalar
│   ├── decan.js         # Dekan hesaplama ve render
│   ├── seven.js         # 7'ler hesaplama ve render
│   ├── solar.js         # Solar Return hesaplama ve render
│   └── ui.js            # Form ve grid builders
├── lib/                 # Swiss Ephemeris WASM library
└── server.cjs           # Local development server
```

## 🔧 Değişiklik Yaparken Bakılacak Yerler

### Natal Hesaplama Düzeltmeleri
1. **Timezone/DST hatası**: `ephemeris.js` → `getTurkeyOffset` fonksiyonu
2. **Hesaplama mantığı**: `astroharmony.html` → `calcWithSwissEph` ve `calculateChart` fonksiyonları
3. **Gelecekte**: `js/calculations.js`

### Dekan Modülü
1. **Hesaplama**: `astroharmony.html` → `computeDecan` fonksiyonu
2. **Render**: `astroharmony.html` → `renderDecan` fonksiyonu
3. **Gelecekte**: `js/decan.js`

### 7'ler Modülü
1. **Hesaplama**: `astroharmony.html` → `computeSeven` fonksiyonu
2. **Render**: `astroharmony.html` → `renderSeven` fonksiyonu
3. **Gelecekte**: `js/seven.js`

### Solar Return Modülü
1. **Swiss Ephemeris entegrasyonu**: `ephemeris.js` → `findSolarCross` fonksiyonu
2. **Solar Return tarihi**: `astroharmony.html` → `findSolarReturnDate` fonksiyonu
3. **Ana hesaplama**: `astroharmony.html` → `computeSolarReturn` fonksiyonu
4. **Render**: `astroharmony.html` → `renderSolarReturn` fonksiyonu
5. **Gelecekte**: `js/solar.js`

### Harita (Chart) Çizimi
1. `astroharmony.html` → `drawWheelChart` fonksiyonu

### UI/Form İşlemleri
1. `astroharmony.html` → `buildAscGrid`, `buildCuspGrid`, `buildPlanetGrid` fonksiyonları
2. **Gelecekte**: `js/ui.js`

## ⚠️ ÖNEMLİ NOTLAR

1. **CORE hesaplamalara dokunma**: `calculateChart`, `calcWithSwissEph`, `getTurkeyOffset` - bunlar test edilmiş ve çalışıyor
2. **Test verileri**:
   - K preset: 6 Ekim 1994, 05:21, İstanbul → ASC 3° Terazi
   - S preset: 6 Ağustos 1998, 14:37, Antalya
3. **Timezone mantığı**: `tz === 0` ise UT zamanı, timezone çevirisi yapma!

## 🧪 Test Etme

// turbo-all
1. `npm start` ile sunucuyu başlat
2. http://localhost:3000 adresine git
3. K preset'i tıkla ve ASC'nin ~3° Terazi çıktığını doğrula
4. Solar Return için 2020 yılını gir ve hesapla
