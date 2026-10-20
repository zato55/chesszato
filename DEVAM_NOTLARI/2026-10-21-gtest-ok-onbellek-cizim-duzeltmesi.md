# 2026-10-21 — Gtest en iyi hamle oku önbellek düzeltmesi

- Repo: `zato55/chesszato`
- Dal: `main`
- Test sayfası: https://zato55.github.io/chesszato/gtest/
- Dosya: `gtest/app.js`
- Sorun: Aynı FEN için ilk bulunan en iyi hamle `analysisBestMoveByFen` içinde saklanıyordu; fakat `bestmove` geldiğinde ok, önbellekteki `currentBestMove` yerine yeni `moveStr` ile çiziliyordu. Bu, okun anlık bir hamleden diğerine geçmesine yol açabilirdi.
- Düzeltme: Okun başlangıç ve bitiş kareleri artık önbellekten alınan `currentBestMove` üzerinden hesaplanıyor.
- Önceki derinlik düzenlemesi: Analiz tahtası ve özet aramaları derinlik 6 kullanıyor; analiz tarafında `go depth 12` kalmadı.
- Commit: `2585f7bf0f8360113fcc9a0de2e43ed3c5811af2`
- Doğrulama: GitHub dosyası yeniden okundu; çizim kodunun önbellekteki hamleyi kullandığı doğrulandı.
- Durum: Kod düzeltildi; telefonda tekrar test edilmeli. Bu düzeltme aynı oturumda aynı FEN için oku sabitler; sayfa yenilendiğinde önbellek sıfırlandığı için motorun tekrar farklı bir hamle seçmesi hâlâ mümkün.
- Ana site: Değiştirilmedi.
