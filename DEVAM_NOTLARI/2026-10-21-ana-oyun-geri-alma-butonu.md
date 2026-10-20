# Ana oyunda geri alma düğmesinin başlangıç durumu

- Tarih: 2026-10-21
- Proje: `zato55/chesszato`
- Dal: `main`
- Ana sayfa: https://zato55.github.io/chesszato/
- Test referansı: https://zato55.github.io/chesszato/gtest/
- Durum: GTEST davranışı kullanıcı tarafından telefonda doğrulandı; aynı mantık ana sayfaya aktarıldı. Ana sayfa telefon testi bekleniyor.

## Amaç
GTEST'te test edilip kullanıcı tarafından onaylanan geri alma düğmesi davranışını normal oyuna taşımak: oyun başlamadan geri alma düğmeleri pasif olsun, ilk gerçek hamle sonrasında hamle geçmişine göre etkinleşsin.

## Değişiklik
- `app.js`: GTEST'teki `updateUndoButtons()` mantığı eklendi. `quickUndoBtn` ve `undoBtn`, hamle geçmişi boşken; analiz modunda; ayrıca oyun bitmiş ve inceleme modunda değilken devre dışı kalır. Görsel pasiflik ve `aria-disabled` durumu da güncellenir.
- `app.js`: `renderBoard()` sonunda `updateUndoButtons()` çağrılır.
- `index.html`: telefon/tarayıcı eski JS dosyasını önbellekten kullanmasın diye uygulama sürüm etiketi `app.js?v=20261021-undo-disabled-main-v1` olarak güncellendi.
- GTEST dosyaları değiştirilmedi.

## GitHub ve doğrulama
- Ana uygulama değişikliği commit: 0755f4b078baa422cbdfee3c8ad0b517160308e6
- Ana HTML önbellek değişikliği commit: 47835636763ec25401c5794120d1c5711bf51205
- Kodlar GitHub `main` dalına yazıldı. Sonraki adımda dosyalar tekrar çekilip içerik ve sürüm etiketi doğrulanacak.
- Tarayıcı/telefon testi henüz yapılmadı; ana sayfada düzeldiği varsayılmamalı.

## Sonraki adım
Ana sayfayı telefonda yenileyip yeni oyun başlamadan geri alma düğmesinin pasif, ilk hamleden sonra etkin olduğunu doğrula.
