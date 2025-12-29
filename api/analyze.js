
export default async function handler(request, response) {
  // CORS başlıkları (Gerekirse)
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS metoduna cevap ver (CORS preflight)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Sadece POST kabul et
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Sadece POST isteği kabul edilir' });
  }

  const { chartData, analysisType } = request.body;

  if (!chartData) {
    return response.status(400).json({ error: 'Harita verisi eksik' });
  }

  // API Key Kontrolü (Sunucu tarafında env'den okunur)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'Sunucu hatası: API anahtarı yapılandırılmamış' });
  }

  // Sistem Promptu (Astroloji Ekolü)
  const systemPrompt = `Sen profesyonel bir astrologsun. Özel bir ekol kullanıyorsun.
KURALLAR:
1. Yorumların kesin, net ve tespit edici olmalı. "Olabilir", "sanırım" gibi muğlak ifadeler kullanma.
2. Burç yorumu değil, HARİTA ANALİZİ yap. Ezbere burç özellikleri sayma.
3. DEKANLAR çok önemli. Bir gezegenin hangi dekanda olduğu, o gezegenin enerjisinin nasıl çalışacağını belirler. Yorumlarında buna değin.
4. 7'LER KURALI (Yaş Döngüsü) çok kritik. Kişinin şu anki yaşındaki döngüsüne ve yöneticisine özel vurgu yap.
5. Üslubun bilge, yol gösterici ama gerçekçi olsun.
6. Cevabı Markdown formatında ver (Başlıklar, kalın yazılar, listeler kullan).

HEDEF KİTLE: Bu kişi astrolojiye ilgi duyuyor ama terimlere boğulmak istemiyor. Net sonuçlar duymak istiyor.`;

  // Analiz Türüne Göre Kullanıcı Sorusu
  let userQuestion = "";
  switch (analysisType) {
    case 'career':
      userQuestion = "Kariyer, iş hayatı ve finansal potansiyel üzerine odaklan. 2., 6. ve 10. evleri, buradaki gezegenleri ve dekan yöneticilerini incele. Hangi meslekler uygun? Para kazanma potansiyeli nedir?";
      break;
    case 'love':
      userQuestion = "Aşk, ilişkiler ve evlilik potansiyeli üzerine odaklan. 5. ve 7. evleri, Venüs ve Mars konumlarını analiz et. Partner profili nasıl? İlişkilerde yaşadığı temel sorunlar veya şanslar neler?";
      break;
    case 'seven':
      userQuestion = "SADECE 7'ler KURALINA ve YAŞ DÖNGÜSÜNE odaklan. Kişinin şu anki yaşına göre hangi ev döngüsünde olduğunu, bu evin konularını ve yıl yöneticisi gezegenin etkilerini detaylıca anlat. Gelecek 2-3 yıl için öngörülerde bulun.";
      break;
    case 'general':
    default:
      userQuestion = "Bu haritayı genel hatlarıyla analiz et. Kişinin temel karakteri, yaşam amacı (KAD/GAD aksı), güçlü ve zayıf yönlerini, ve özellikle şu an içinde bulunduğu 7'ler döngüsünün ona getirdiği temayı anlat.";
      break;
  }

  const finalPrompt = `${systemPrompt}\n\n${chartData}\n\nSORU: ${userQuestion}`;

  try {
    // Google Gemini API İsteği
    // Model güncellendi: gemini-flash-latest
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    const apiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      })
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API Hatası: ${apiRes.statusText}`);
    }

    const data = await apiRes.json();
    
    // Cevabı çıkar
    let resultText = "Analiz oluşturulamadı.";
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts) {
      resultText = data.candidates[0].content.parts[0].text;
    }

    return response.status(200).json({ text: resultText });

  } catch (error) {
    console.error("Analysis Error:", error);
    return response.status(500).json({ error: 'Analiz sırasında bir hata oluştu.' });
  }
}
