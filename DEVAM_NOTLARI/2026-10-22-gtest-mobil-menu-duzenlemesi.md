# 2026-10-22 — GTEST mobil menü düzenlemesi

- **Proje:** `zato55/chesszato`
- **Çalışma dalı:** `main`
- **Kapsam:** Yalnızca `gtest/index.html`, `gtest/app.js`, `gtest/style.css`
- **Geri dönüş yedeği:** `yedek-2026-10-22-gtest-mobil-menu-oncesi`
- **GTEST sayfası:** https://zato55.github.io/chesszato/gtest/

## Amaç
Mobil üst bar ve alt menüyü daha okunaklı, dokunması kolay ve tutarlı yapmak. Kullanıcı, normal oyun dosyalarına onay almadan değişiklik yapılmamasını açıkça istedi.

## Yapılan değişiklikler
- Mobil üst bar 40 px civarındaki eski düzenden 48 px yüksekliğe taşındı; logo ve Giriş Yap/Kayıt Ol dokunma alanları büyütüldü.
- Alt menü dört eşit alana yerleştirildi: Oyna, Stockfish, Tempo, Ayarlar.
- Seçili menü öğesine mavi zemin/kenarlık ve küçük kırmızı gösterge eklendi. Marka renkleri siyah, beyaz, kırmızı ve maviyle sınırlandı.
- Alt menüye güvenli alan boşluğu, hafif gölge ve odak görünümü eklendi; küçük ekranlar için ayrı sıkıştırma kuralları tanımlandı.
- **Oyna** alt menü düğmesi artık `resetGame()` çağırmıyor; açık ayar pencerelerini kapatıp oyun ekranına döner. Yeni oyun başlatma düğmelerinin davranışı değiştirilmedi.
- CSS ve JS önbellek sürüm parametreleri yenilendi.
- Analiz alt menüsü ve normal oyun dosyaları değiştirilmedi.

## Doğrulama
- `app.js` JavaScript sözdizimi kontrolü geçti.
- Dört menü kimliğinin tekil olduğu, CSS sınıflarının, önbellek sürümlerinin ve güvenli alan kurallarının bulunduğu doğrulandı.
- Oyna düğmesinin kendi tıklama işleyicisinde `resetGame()` çağrısı olmadığı doğrulandı.
- Stockfish, Tempo, Ayarlar açma işleyicilerinin ve analiz alt menüsü kimliklerinin korunduğu doğrulandı.
- CSS açma/kapatma süslü parantez sayıları eşleşiyor.
- **Telefon üzerinde görsel ve gerçek dokunma testi henüz yapılmadı.** Bu nedenle tasarımın son kullanıcı görünümü henüz onaylanmış sayılmaz.

## İlgili commitler
- Menü HTML: `1a752c9ba35e0c1e6fff5cfe1d19c5fd86d13af0`
- Oyna davranışı ve seçili durum: `fa0c3f0efdf78b5c26c85c7e87b3d267066f80d4`
- Menü CSS: `3074f39adcea219886bfee20f9a6c1ace16363df`
- Önbellek parametreleri: `58a303f3230e5e92778ad16645255681ce55ac60`

## Mevcut durum ve sonraki adım
Bu değişiklik yalnızca GTEST içindir ve kullanıcının görsel/işlevsel onayını bekler. Telefonda GTEST açılarak Oyna, Stockfish, Tempo ve Ayarlar düğmeleri ile Giriş Yap/Kayıt Ol bağlantıları test edilmeli. Kullanıcı açıkça onaylamadan bu düzenleme normal oyun dosyalarına aktarılmamalıdır.
