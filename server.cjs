#!/usr/bin/env node
/**
 * Simple local server for Astroharmony
 * Required for WASM modules to work (file:// protocol doesn't support WASM)
 */

// Load environment variables
require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;
// ... (MIME_TYPES definition unchanged)

// ... inside the request handler ...

        // --- GÜVENLİK AYARI ---
        // API Anahtarı .env dosyasından çekiliyor.
        // GitHub'a yüklenince bu anahtar kod içinde görünmeyecek.
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
           throw new Error("GEMINI_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.");
        }
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // ============== API ENDPOINT: /api/analyze ==============
  if (req.url === '/api/analyze' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { chartData, analysisType } = JSON.parse(body);
        
        // --- GÜVENLİK AYARI ---
        // API Anahtarı .env dosyasından çekiliyor.
        // GitHub'a yüklenince bu anahtar kod içinde görünmeyecek.
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
           throw new Error("GEMINI_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.");
        }

         // Sistem Promptu (Astroloji Ekolü) - server.cjs içinde tekrar tanımlıyoruz
        const systemPrompt = `Sen profesyonel bir astrologsun. Özel bir ekol kullanıyorsun.
        KURALLAR:
        1. Yorumların kesin, net ve tespit edici olmalı. "Olabilir", "sanırım" gibi muğlak ifadeler kullanma.
        2. Burç yorumu değil, HARİTA ANALİZİ yap. Ezbere burç özellikleri sayma.
        3. DEKANLAR çok önemli. Bir gezegenin hangi dekanda olduğu, o gezegenin enerjisinin nasıl çalışacağını belirler. Yorumlarında buna değin.
        4. 7'LER KURALI (Yaş Döngüsü) çok kritik. Kişinin şu anki yaşındaki döngüsüne ve yöneticisine özel vurgu yap.
        5. Üslubun bilge, yol gösterici ama gerçekçi olsun.
        6. Cevabı Markdown formatında ver (Başlıklar, kalın yazılar, listeler kullan).
        
        HEDEF KİTLE: Bu kişi astrolojiye ilgi duyuyor ama terimlere boğulmak istemiyor. Net sonuçlar duymak istiyor.`;

        let userQuestion = "";
        switch (analysisType) {
          case 'career': userQuestion = "Kariyer, iş hayatı ve finansal potansiyel..."; break;
          case 'love': userQuestion = "Aşk, ilişkiler ve evlilik potansiyeli..."; break;
          case 'seven': userQuestion = "SADECE 7'ler KURALINA ve YAŞ DÖNGÜSÜNE odaklan..."; break;
          default: userQuestion = "Bu haritayı genel hatlarıyla analiz et..."; break;
        }
        
        const finalPrompt = `${systemPrompt}\n\n${chartData}\n\nSORU: ${userQuestion}`;
        
        // Fetch (Node 18+ ile built-in)
        // Model adı güncellendi: gemini-flash-latest (Çalışan model budur)
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] })
        });
        
        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Analiz yapılamadı.";
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ text }));

      } catch (e) {
        console.error("API Error", e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // ============== STATIC FILE SERVER ==============
  // Parse URL to remove query parameters (e.g. ?v=123) which cause file lookup failures
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;
  
  let filePath = path.join(ROOT, pathname === '/' ? 'astroharmony.html' : pathname);
  
  // Security
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Try looking for index.html if directory
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});


server.listen(PORT, () => {
  console.log(`\n🌟 Astroharmony Server Running!`);
  console.log(`\n   Open in browser: http://localhost:${PORT}`);
  console.log(`\n   Press Ctrl+C to stop\n`);
});
