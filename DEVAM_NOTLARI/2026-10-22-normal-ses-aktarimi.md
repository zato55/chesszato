# 2026-10-22 — GTEST ses değişikliklerini ana oyuna aktarma

- **Proje:** `zato55/chesszato`
- **Çalışma dalı:** `main`
- **Geri dönüş yedeği:** `yedek-2026-10-22-normal-ses-degisiklikleri-oncesi`
- **Ana oyun:** https://zato55.github.io/chesszato/
- **GTEST:** https://zato55.github.io/chesszato/gtest/

## Amaç
Kullanıcının isteğiyle GTEST'teki ses seçenekleri ve ses sistemi ana oyuna aktarıldı. Diğer GTEST analiz ve arayüz değişiklikleri bu işe dahil edilmedi.

## Yapılan değişiklikler
- `index.html`: Hamle sesi türü seçimi eklendi: Ahşap, Klasik, Yumuşak, Tok, Doğal taş sesi ve **Gerçek Taş Sesi**. Ses seviyesi aralığı 0–500% yapıldı. JS önbellek anahtarı `20261022-normal-sound-v1` olarak yenilendi.
- `app.js`: `playMoveSound` fonksiyonu GTEST'teki ses uygulamasıyla eşitlendi; doğal taş kaydı, özel ses dosyası, dört sentetik ses profili ve seçimin `localStorage`'a kaydedilip geri yüklenmesi eklendi. Diğer oyun kodları topluca kopyalanmadı.
- `sounds/mesut-move.mp3`: GTEST'teki ses blob'u ana oyunun kök `sounds/` klasörüne aynı SHA ile eklendi.
- `SOUND-CREDITS.md`: Doğal sesin kaynağı/lisansı ve ses dosyalarının kullanım yolları belgelendi.

## Doğrulama
- GitHub'dan güncel ana oyun dosyaları tekrar okundu.
- `app.js` JavaScript sözdizimi kontrolü başarılı.
- `index.html` içinde ses türü seçimi, `Gerçek Taş Sesi`, 500% ses seviyesi ve önbellek anahtarı doğrulandı.
- Özel sesin yükleme yolu ve seçimin kaydedilip geri yüklenmesi doğrulandı.
- Ana dizindeki `sounds/mesut-move.mp3` SHA değeri GTEST dosyasıyla birebir aynı: `ef2a234ba8a1571f092eb18cb4559a0184893dea`.
- **Tarayıcı/telefon üzerinden gerçek hamle sesi testi henüz yapılmadı.** Kod statik olarak kontrol edildi; cihazda seçenekleri deneyerek doğrulamak gerekiyor.

## İlgili commit
- Aktarım: https://github.com/zato55/chesszato/commit/95fa7f03da7763de618c75dc5a38be1680957a8b

## Mevcut durum ve sonraki adım
1. Ana oyunu telefonda yenileyip Ayarlar → Hamle Sesi Türü kısmında seçenekleri dene.
2. Özellikle **Gerçek Taş Sesi** ve ses seviyesi ayarını dene; tarayıcıdan ses gelmediği durumda ağ yüklemesini ayrıca incele.
3. GTEST ve ana oyundaki ses davranışlarını karşılaştır.
4. Bu not, `2026-10-22-gtest-ozel-hamle-sesi.md` kaydından sonra yapılan aktarımı anlatır: o önceki kayıt yazılırken ses değişiklikleri yalnızca GTEST'teydi; bu commit ile ana oyuna da aktarıldı.
