# 2026-10-22 — GTEST özel hamle sesi seçeneği

- **Proje:** `zato55/chesszato`
- **Çalışma dalı:** `main`
- **Geri dönüş yedeği:** `yedek-2026-10-22-kullanici-sesi-oncesi`
- **Test sayfası:** https://zato55.github.io/chesszato/gtest/
- **Kapsam:** Yalnızca GTEST; ana oyun dosyalarına aktarılmadı.

## Amaç
Hazır hamle sesleri kullanıcıya uygun gelmediği için ayrı bir özel ses seçeneği eklemek ve seçeneğin adını kişisel isim içermeyen bir etikete çevirmek.

## Yapılan değişiklikler
- `gtest/sounds/mesut-move.mp3`: Özel ses seçeneğinin kullandığı ses dosyası eklendi.
- `gtest/app.js`: `custom` ses türü seçildiğinde `sounds/mesut-move.mp3` dosyasını Web Audio API ile yükleyip çalan işleyici eklendi. Var olan ses türleri korundu.
- `gtest/index.html`: Ses listesine `Gerçek Taş Sesi` etiketiyle `custom` seçeneği eklendi. Önceki görünen ad `Mesut’un kaydı — özel ses` kaldırıldı.
- `gtest/index.html`: JS önbellek sürümü `20261022-user-recording-v1` olarak ayarlı.

## Doğrulama
- GitHub'dan güncel `gtest/index.html` tekrar okundu; `<option value="custom">Gerçek Taş Sesi</option>` doğrulandı ve eski etiketin kalmadığı kontrol edildi.
- `gtest/app.js` statik olarak kontrol edildi; özel ses yükleme çağrısı ve `custom` türü işleyicisi mevcut.
- Önceki kontrolde `gtest/app.js` için JavaScript sözdizimi kontrolü başarılıydı.
- **Telefon/tarayıcı üzerinden sesin gerçekten çaldığı henüz test edilmedi.** Sonraki oturumda GTEST'te seçenek seçilerek hamle sesi ve ses seviyesi denenmeli.

## İlgili commitler
- Özel ses dosyası ve JS işleyicisi: https://github.com/zato55/chesszato/commit/823596c4f16bd868922200bd8c169a7f0071f1fb
- HTML'de özel ses seçeneği ve önbellek etiketi: https://github.com/zato55/chesszato/commit/9336b0081ccee404084be1fab53526144e7d4892
- Etiketin `Gerçek Taş Sesi` olarak değiştirilmesi: https://github.com/zato55/chesszato/commit/097a8714fc751abdc353776475ee28ec0265a271

## Mevcut durum ve sonraki adım
1. Telefonda https://zato55.github.io/chesszato/gtest/ adresini yenile.
2. Ayarlar → **Hamle Sesi Türü** → **Gerçek Taş Sesi** seçeneğini seç ve bir hamle yaparak sesi kontrol et.
3. Ses gelmezse önce dosyanın ağdan yüklenmesini ve tarayıcı konsolu/ağ hatalarını incele; henüz test edilmemiş davranışı çalışıyor diye kabul etme.
4. Kullanıcı GTEST'i onaylamadan bu değişiklikleri ana oyun `app.js` veya `index.html` dosyalarına kopyalama.
