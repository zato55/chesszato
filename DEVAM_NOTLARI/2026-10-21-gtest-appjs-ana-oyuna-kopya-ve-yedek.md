# 2026-10-21 — GTEST app.js ana oyuna kopyalandı ve yedek alındı

## Proje ve dallar
- Repo: `zato55/chesszato`
- Ana oyun: https://zato55.github.io/chesszato/
- Test alanı: https://zato55.github.io/chesszato/gtest/
- Çalışma dalı: `main`
- Yedek dalı: `yedek-2026-10-21`

## Amaç
GTEST ile normal oyun kodlarının aynı olup olmadığını kontrol etmek ve kullanıcının isteğiyle GTEST `app.js` dosyasını normal oyunun `app.js` dosyasının tamamıyla değiştirmek.

## Yapılanlar
- `gtest/app.js` içeriği olduğu gibi `app.js` üzerine kopyalandı.
- Kaynak dosyanın blob SHA'sı: `9bb5fbe9e878fc4d452d22eb2dc9ec5a48c21441`
- Kopyalama sonrası `app.js` blob SHA'sı aynı çıktı: `9bb5fbe9e878fc4d452d22eb2dc9ec5a48c21441`
- Her iki dosya da 2.213 satır ve 85.812 karakter; içerik birebir eşleşiyor.
- Değişiklik commit'i: https://github.com/zato55/chesszato/commit/6e04650eb0277a93eca5ca1b9f43da1bd3dda7b4
- Bu durumdan yedek dalı oluşturuldu: `yedek-2026-10-21` (başlangıç commit'i `6e04650eb0277a93eca5ca1b9f43da1bd3dda7b4`).

## Doğrulama ve sınırlar
- GitHub'dan kopyalama sonrası dosya yeniden çekilerek kaynakla birebir eşleştiği doğrulandı.
- Tarayıcıda ana oyunun son sürümünün çalışması henüz kullanıcı tarafından doğrulanmadı.
- Bu işlem sırasında başka kod dosyası değiştirilmedi.
- `index.html` içindeki ana oyun app.js cache etiketi henüz GTEST kopyasına göre güncellenmedi; tarayıcı eski dosyayı önbellekten kullanırsa yeni kod görünmeyebilir.

## Mevcut durum
- GTEST `app.js` ile ana `app.js` aynı.
- Geri dönüş için `yedek-2026-10-21` dalı mevcut.
- Canlı davranış testi bekleniyor.

## Sonraki adım
1. Ana `index.html` içindeki `app.js?v=...` etiketini yeni bir tarihle değiştirip önbellek yenilemesini sağla.
2. Ardından ana sitede oyunu yenileyip kullanıcıyla birlikte test et.
3. Başka GTEST/ana dosya farklarına geçmeden önce bu kopyanın temel canlı oyun akışını doğrula.
