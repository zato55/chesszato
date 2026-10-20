# Analiz okları: aynı konumda tutarlılık denemesi

- Tarih: 2026-10-21
- Proje: `zato55/chesszato`
- Dal: `main`
- Test sayfası: https://zato55.github.io/chesszato/gtest/
- Ana sayfa: https://zato55.github.io/chesszato/
- Durum: Kod GitHub'dan geri okunarak doğrulandı; telefonda kullanıcı testi bekleniyor.

## Belirti
Analiz tahtasında aynı konuma geri-ileri gidildiğinde en iyi hamle oku bazen farklı hamlelere geçiyor. Önceki değişiklik, arama sonucu başka FEN konumuna aitse oku çizmemeyi sağlıyordu; ancak aynı FEN için tekrar analizlerde farklı hamleler görülmeye devam etti.

## Bu değişiklik
Yalnızca `gtest/app.js` değiştirildi:
- Her yeni analiz aramasından önce `ucinewgame` gönderilerek önceki arama durumu/arama belleği temizleniyor.
- Analiz arama derinliği 8'den 12'ye çıkarıldı.
- Üç analiz başlatma yolunda da aynı ayar uygulandı.
- Ana `app.js`, `index.html` ve `style.css` değiştirilmedi.

## İlgili commitler
- FEN uyuşmazlığında eski oku engelleyen önceki değişiklik: https://github.com/zato55/chesszato/commit/9a24751e1e69496a82abf561c7f8f1e0ead1301b
- Bu deneme: https://github.com/zato55/chesszato/commit/3a0d35942846509afcb912fc6100d7ba07073d60
- Güncel `gtest/app.js` blob SHA: `bbf2e4c267b03c189a5d4736831d77467fa62491`

## Doğrulama ve sonraki adım
- Güncel dosya GitHub `main` üzerinden yeniden çekildi; üç `go depth 12` ve üç arama başlangıcında `ucinewgame` doğrulandı.
- Telefon testi henüz yapılmadı; değişikliğin sorunu çözdüğü varsayılmamalı.
- Testte aynı konuma birkaç kez geri-ileri giderek okun tutarlılığını ve analiz hızını kontrol et.
- Hâlâ değişiyorsa farklılıkların eşit/çok yakın değerlendirmeli alternatif hamleler olup olmadığını ve Stockfish'in arama çıktısını ayrıca incele.
- Kullanıcı onayı olmadan bu değişikliği ana sayfa dosyalarına aktarma.
