# GTEST canlı oyunda geri alma düğmesinin başlangıç durumu

- Tarih: 2026-10-21
- Proje: `zato55/chesszato`
- Dal: `main`
- Test sayfası: https://zato55.github.io/chesszato/gtest/
- Ana sayfa: https://zato55.github.io/chesszato/
- Durum: Kod GitHub'dan geri okunarak doğrulandı; telefon testi bekleniyor.

## Belirti
Canlı oyun daha başlamamışken mobil hızlı kontrollerdeki geri alma düğmesi (`quickUndoBtn`) ve masaüstü/yan paneldeki geri alma düğmesi (`undoBtn`) etkin görünüyordu.

## Değişiklik
Yalnızca GTEST dosyaları değiştirildi:
- `gtest/app.js`: `updateUndoButtons()` eklendi. Gerçek hamle geçmişi boşsa iki geri alma düğmesi de disabled yapılır ve görsel olarak pasif gösterilir. Analiz modunda veya oyun bitmiş ve inceleme modunda değilken de geri alma etkinleştirilmez. Durum, tahta her çizildiğinde güncellenir.
- `gtest/index.html`: yeni JavaScript kodunun telefonda yüklenmesi için önbellek etiketi `app.js?v=20261021-undo-disabled-v1` olarak değiştirildi.
- Ana sayfanın dosyaları değiştirilmedi.

## Commitler ve doğrulama
- `gtest/app.js`: https://github.com/zato55/chesszato/commit/e3df273b4fe55c481892a3cea7d5702ca54d34f2
- `gtest/index.html`: https://github.com/zato55/chesszato/commit/1cf2ab88207c6364a1a5eae5d053baec11c6cccb
- Her iki dosya da GitHub `main` üzerinden tekrar çekildi; düğme durumu fonksiyonu ve yeni önbellek etiketi doğrulandı.
- Tarayıcı/telefon üzerinde davranış henüz kullanıcı tarafından test edilmedi; düzeldiği varsayılmamalı.

## Sonraki adım
GTEST'i telefonda açıp yeni oyun başında geri alma düğmesinin pasif olduğunu kontrol et. Bir hamle oynadıktan sonra geri alma düğmesinin beklenen zamanda etkinleştiğini de dene. Sorun varsa önce GTEST kodunu incele; ana sayfaya kullanıcı açıkça istemeden aktarma.
