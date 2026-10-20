# 2026-10-21 — Gtest analiz derinliğini 6 ile eşitleme

- Repo: `zato55/chesszato`
- Dal: `main`
- Test sayfası: https://zato55.github.io/chesszato/gtest/
- Kapsam: Yalnızca `gtest/app.js`
- Amaç: Özet analizinin Stockfish derinliği 6 iken analiz tahtasının derinlik 12 kullanmasının sonuç farklılığına etkisini sınamak.
- Değişiklik: Analiz tahtasındaki üç `go depth 12` komutu `go depth 6` olarak değiştirildi. Özet tarafındaki mevcut derinlik 6 olarak bırakıldı. Önbellek, motor ve diğer davranışlar değiştirilmedi.
- Commit: `edf3c9e41d4fbfe3fe7fc7015c1a6a15ea2156d6`
- Doğrulama: GitHub'dan dosya yeniden okundu; analiz tarafında 0 adet `go depth 12`, toplam 4 adet `go depth 6` bulundu.
- Durum: Kod değişikliği yayımlandı; telefonda test sonucu bekleniyor.
- Sonraki adım: Aynı konumda özetin değerlendirmesi ile analiz okunu karşılaştır. Bu değişiklik derinlik farkını ortadan kaldırır, ancak tek başına aynı en iyi hamlenin kesinlikle bulunacağını garanti etmez.
