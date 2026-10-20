# 2026-10-20 — Son 60 saniye saat uyarısı

## Proje ve dal
- Repo: `zato55/chesszato`
- Dal: `main`
- Canlı site: https://zato55.github.io/chesszato/
- Test sayfası: https://zato55.github.io/chesszato/gtest/

## Amaç / belirti
Kullanıcı, saatte kalan süre 1 dakikanın altına indiğinde arka planın kırmızı olmasını istedi. İlk uygulamada saat yalnızca yanıp sönüyor, kırmızı arka plan görünmüyordu; CSS'teki `!important` arka plan kuralları sınıf tabanlı rengi eziyordu.

## Yapılan ve aktarılan değişiklik
- `gtest/app.js` içindeki doğrulanmış `applyTimerStyle` mantığı kök `app.js` dosyasına aktarıldı.
- Kalan süre **60 saniyeden azsa** saat öğelerine `style.setProperty(..., 'important')` ile beyaz yazı, belirgin kırmızı arka plan (`#b91c1c`), kırmızı çerçeve ve parlama uygulanıyor; yanıp sönme sınıfı da korunuyor.
- Süre yeniden 60 saniye veya üstüne çıktığında bu satır içi stiller kaldırılıyor; aktif saatin normal yeşil görünümü geri gelebiliyor.
- Kök `index.html` içindeki script sürüm etiketi `app.js?v=20261020-clock-red-v2` olarak güncellendi; eski önbellekli JavaScript'in kullanılma ihtimali azaltıldı.
- Kök `style.css` değiştirilmedi; karşılaştırmada işlevsel fark bulunmadı.
- `gtest/` dosyaları değiştirilmedi.

## GitHub değişiklikleri
- `app.js`: https://github.com/zato55/chesszato/commit/5e87afbbc86949290c7da48b88c062addf4dc646
  - Beklenen dosya blob SHA: `ac65e334a317de2eadeeb5b127c6b4e6db44b7dc`
- `index.html`: https://github.com/zato55/chesszato/commit/a8091578edc210c8360ccb0a87c6ad2d363529ca
  - Beklenen dosya blob SHA: `780951cf383e4c4b9e90d9fdafb2459c106442eb`

## Doğrulama ve mevcut durum
- Kullanıcı, `gtest` sayfasındaki kırmızı saat görünümünü test etti ve beğendi.
- Değişiklik kök `main` dosyalarına aktarıldı; GitHub üzerinden kök `app.js` ve `index.html` yeniden okunarak beklenen kod ve cache etiketi doğrulandı.
- Kök canlı sayfada aktarım sonrası 59 saniye testi henüz kullanıcı tarafından raporlanmadı. Bu nedenle canlı ana sayfadaki son doğrulama **bekliyor**.

## Sohbet yeniden başladığında ilk adım
Kullanıcıdan kök ana sayfayı telefonda yenileyip kısa süreli bir maçta saat 59 saniyeye indiğinde kırmızı arka planı kontrol etmesini iste. Sonuç gelmeden başka saat stili veya CSS değişikliği yapma. Bir sorun çıkarsa önce gerçek kök dosyaları ve mevcut GitHub içeriğini yeniden incele; `gtest` sürümünü değiştirme.
