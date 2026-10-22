# 2026-10-22 — GTEST mobil Oyna menüsü

- **Proje:** `zato55/chesszato`
- **Dal:** `main`
- **Kapsam:** Yalnızca `gtest/index.html`, `gtest/app.js`, `gtest/style.css`
- **Geri dönüş yedeği:** `yedek-2026-10-22-gtest-mobil-menu-oncesi`
- **Test adresi:** https://zato55.github.io/chesszato/gtest/
- **Önceki mobil menü notu:** `DEVAM_NOTLARI/2026-10-22-gtest-mobil-menu-duzenlemesi.md`

## İstenen davranış
Mobil alt menüde Oyna'ya dokununca doğrudan oyuna dönmek yerine genişletilebilir Oyna menüsü açılır. Normal oyun dosyalarına dokunulmayacak; kullanıcı onayı olmadan değişiklik aktarılmayacak.

## Menü seçenekleri
- **Yeni oyun:** Mevcut oyun modunu koruyarak oyunu sıfırlar ve yeni oyunu başlatır.
- **Hızlı eşleştirme:** Menüde görünür; eşleştirme altyapısı henüz olmadığı için açıkça henüz kullanıma açık olmadığı bildirilir.
- **Bota karşı oyna:** Stockfish modunu seçer ve yeni oyunu başlatır.
- **Turnuvalar:** Menüde görünür; turnuva altyapısı henüz olmadığı için açıkça henüz kullanıma açık olduğu bildirilir.
- **Yerel oyun:** Aynı cihazda iki kişilik modu seçer ve yeni oyunu başlatır.

## Uygulama
- Menü modalı `gtest/index.html` içine eklendi.
- Dokunma alanları, mobil alt boşluk, odak görünümü ve açılış animasyonu `gtest/style.css` içine eklendi.
- Oyna düğmesi ve seçeneklerin davranışları `gtest/app.js` içine eklendi.
- CSS/JS cache-busting etiketi `20261022-gtest-play-menu-v1` olarak güncellendi.
- **Normal oyun dosyaları değiştirilmedi.**

## Doğrulama
- JavaScript sözdizimi kontrolü geçti.
- Menü kimlikleri benzersiz; beş seçeneğin de olay işleyicisi var.
- CSS süslü parantez dengesi geçti.
- Telefon üzerinde görsel ve dokunmatik test henüz yapılmadı.

## Sonraki adım
Telefonda GTEST sayfasını açıp Oyna menüsünü, beş seçeneği ve mevcut oyunun yalnızca ilgili oyun türü seçildiğinde sıfırlandığını kontrol et. Hızlı eşleştirme ve turnuva altyapısı sonraki ayrı işlerdir. Normal oyun dosyalarına ancak kullanıcı açıkça onay verirse aktar.
