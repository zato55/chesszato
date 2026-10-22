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
- **Turnuvalar:** Menüde görünür; turnuva altyapısı henüz olmadığı için açıkça henüz kullanıma açık olmadığı bildirilir.
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


## Son düzeltme — yalnızca açık menü aktif görünür
- Kullanıcı geri bildirimi: oyun ekranındayken Oyna sekmesi sürekli aktif görünüyordu.
- Alt menüde başlangıçtaki aktif sınıf ve `aria-current` kaldırıldı.
- Oyna yalnızca Oyna menüsü açıldığında aktif olur; menü kapatıldığında aktiflik temizlenir.
- Stockfish, Tempo ve Ayarlar da yalnızca kendi menüleri açıkken aktif görünür; kapatılınca hiçbir alt menü öğesi aktif kalmaz.
- `app.js` ve HTML cache-busting etiketi `20261022-gtest-play-menu-v2` olarak güncellendi.
- JavaScript sözdizimi ve durum geçişleri statik olarak kontrol edildi; telefon üzerinde tekrar görsel test bekleniyor.
- Düzeltme commitleri: `49a881ee12fea263edcf4c5c916ccac428c9e606` (JS), `a6a3b97812ec6613345e9b89474cac0c17c369a1` (HTML).
