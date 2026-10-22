# 2026-10-22 — GTEST giriş ve üyelik sayfaları

- **Proje:** `zato55/chesszato`
- **Dal:** `main`
- **Kapsam:** Yalnızca `gtest/`; normal oyun dosyalarına dokunulmadı.
- **Geri dönüş yedeği:** `yedek-2026-10-22-gtest-giris-uyelik-oncesi`
- **GTEST:** https://zato55.github.io/chesszato/gtest/

## Amaç
GTEST içindeki mevcut oyun ekranında bulunan Giriş Yap ve Kayıt Ol düğmelerinin ayrı sayfalara gitmesi istendi.

## Yapılan değişiklikler
- `gtest/giris.html`: Koyu-altın Chesszato temalı, mobil uyumlu giriş formu. Kullanıcı adı/e-posta, şifre, beni hatırla ve şifremi unuttum alanları mevcut.
- `gtest/uye-ol.html`: Aynı temada, mobil uyumlu kayıt formu. Kullanıcı adı, e-posta, şifre, şifre tekrarı ve koşul onayı alanları mevcut.
- `gtest/index.html`: Hem mobil üst bardaki hem masaüstü menüdeki Giriş Yap/Kayıt Ol kontrolleri yeni sayfalara bağlandı.
- Giriş ve üyelik sayfaları birbirine ve mevcut GTEST oyun ekranına geri bağlantı içeriyor.
- Formlar şu an gerçek hesap oluşturmaz veya giriş yapmaz. Form gönderiminde bu durum açıkça belirtilir; üyelik sistemi ayrıca kurulacak.

## Doğrulama
- GitHub'dan güncel üç dosya tekrar okundu.
- Mobil giriş/kayıt bağlantıları, masaüstü menü bağlantıları, sayfalar arası bağlantılar ve oyuna dönüş bağlantıları doğrulandı.
- Kayıt formundaki şifre eşleşmesi kontrolü doğrulandı.
- 11 statik kontrolün tamamı geçti.
- Telefon tarayıcısında görsel/etkileşim testi henüz yapılmadı.

## İlgili commitler
- Giriş sayfası: `6af606953d5e1fff8c2948ef13fa2074e93421de`
- Üyelik sayfası: `82cf2967dda7a016d4a365dfddfbb492d54c333e`
- GTEST düğme bağlantıları: `553702bea30dab524488a342a2d571be6f33eab4`

## Sonraki adım
Telefonda GTEST ekranını açıp Giriş Yap ve Kayıt Ol düğmelerini; iki formun görünümünü, karşılıklı geçişini ve oyuna dönüş bağlantılarını test et. Gerçek kimlik doğrulama bu işin kapsamına dahil değildir.
