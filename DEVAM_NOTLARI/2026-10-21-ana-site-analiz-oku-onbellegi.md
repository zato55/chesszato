# 2026-10-21 — Ana siteye analiz oku tutarlılığı aktarımı

- Repo: `zato55/chesszato`
- Dal: `main`
- Ana sayfa: https://zato55.github.io/chesszato/
- GTEST karşılaştırma sayfası: https://zato55.github.io/chesszato/gtest/
- Dosya: yalnızca kök `app.js`
- Amaç: GTEST'te kullanıcı tarafından denenip beğenilen aynı FEN konumunda en iyi hamle okunun sabit kalması düzeltmesini ana sayfaya aktarmak.
- Değişiklikler:
  - `analysisBestMoveByFen` önbelleği eklendi; aynı FEN tekrar ziyaret edildiğinde ilk geçerli en iyi hamle oku korunuyor.
  - Farklı konuma ait gecikmiş motor sonuçları FEN kontrolüyle reddediliyor.
  - Arama puanının işareti, analiz edilen FEN'deki hamle sırasına göre belirleniyor.
  - Analiz aramaları `ucinewgame` ile temizlenip derinlik 6'da çalışıyor; sıraya alınmış analiz aramaları da aynı şekilde başlatılıyor.
  - Yeni oyun başlatılırken önbellek temizleniyor.
- Kod commit'i: https://github.com/zato55/chesszato/commit/ac4a5db21dd96a025f6b14885a285aa29ebc1472
- Doğrulama: GitHub `main` üzerindeki kök `app.js` tekrar okundu. Önbellek, eski FEN sonucu koruması, motor tarafı, derinlik 6 ve yeni oyunda önbellek temizleme doğrulandı. Analiz arama yollarında `go depth 8` kalmadı; üç `go depth 6` gönderimi var.
- Test durumu: GTEST kullanıcı tarafından denenip beğenildi. Ana sayfanın bu yeni aktarımı henüz telefonda test edilmedi; çözümün ana sayfada da doğrulandığı varsayılmamalı.
- Sonraki adım: Ana sayfada aynı konuma geri-ileri giderek okun sabit kaldığını ve analiz değerlendirme çubuğunun tutarlılığını kontrol et. Sorun olursa yalnızca kök `app.js` değişikliğini ele al.
- Sınırlar: GTEST dosyaları ve diğer ana sayfa dosyaları değiştirilmedi.
