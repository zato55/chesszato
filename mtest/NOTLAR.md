# MTEST geliştirme notları

## 2026-10-29 — Ana sayfa ve oyun ekranını ayırma

- Güvenli referans yedeği: `yedek-mtest-ekran-ayirma-oncesi-2026-10-29`.
- `gtest` bu çalışma boyunca değiştirilmemeli; MTEST üzerinde çalışılacak.
- Mevcut yapı incelendi: yeni ana sayfa (`#mtestHomeScreen`), eski oyun arayüzü ve oyun modalları `mtest/index.html` içinde; oyun ve ana sayfa davranışları `mtest/app.js` içinde birlikte yönetiliyor.
- Hedef: ana sayfa ile oyun arayüzünü ayrı ekran katmanlarına almak; oyun motoru, saatler, bot, analiz ve ses mantığını ilk aşamada yeniden yazmamak.
- Güvenli uygulama sırası:
  1. Eski oyun arayüzünü tek bir `#mtestGameScreen` kapsayıcısına almak; modalları ve oyun kontrollerini doğru kapsama dahil etmek.
  2. Tek bir ekran-geçiş yardımcı fonksiyonu oluşturmak; ana sayfadan oyun başlatan tüm yolların bu fonksiyonu kullanmasını sağlamak.
  3. Oyun sonu, iptal, analiz, ayarlar ve ana sayfaya dönüş akışlarını kontrol etmek.
  4. HTML kimliklerinin tekilliğini, JavaScript sözdizimini ve mevcut bağlantıları kontrol etmek.
- Kabul ölçütleri: ana sayfadayken eski tahta/saat görünmemeli ve oyun arka planda ilerlememeli; oyun başlatılınca sadece oyun ekranı görünmeli; ana sayfaya dönüşte zamanlayıcı/bot hareketi kalmamalı; analiz ve oyun sonu düğmeleri çalışmaya devam etmeli.
- Veritabanı, dağıtım, commit/push dışında canlı yayın işlemi yapılmayacak; telefon üzerinde gerçek test yapılmadan mobil davranışın doğrulandığı iddia edilmeyecek.
- Bu not, ekran ayrımı uygulamasının henüz yapılmadığını ve sıradaki adım olduğunu açıkça kaydeder.


## 2026-10-29 — İlk ekran ayrımı uygulandı

- `mtest/index.html`: eski oyun arayüzü ve mobil gezinme çubukları tek bir `#mtestGameScreen` kapsayıcısına alındı. `#mobilePlayMenu` ve oyun/analiz modalları bu kapsayıcının dışında bırakıldı; böylece ana sayfadan açılan menüler gizli oyun katmanının içinde kalmıyor.
- `mtest/style.css`: oyun ekranı için tam ekran katman ve başlangıçta gizleme kuralı eklendi; masaüstünde mevcut yan yana yerleşim korunacak şekilde kapsayıcı yatay, mobilde dikey düzenleniyor.
- `mtest/app.js`: `mtestShowGameScreen()` ve `mtestShowHomeScreen()` yardımcıları eklendi. `resetGame()` oyun ekranını açıyor; oyun sonu ve ana menüye dönüş yolları oyun ekranını gizliyor. Ana sayfadan analiz başlatılırken analiz arayüzü için oyun ekranı açılıyor.
- Ana menüye dönüş sırasında oyun saati, hızlı eşleşmenin ilk hamle sayacı ve bekleyen bot hamlesi temizleniyor; Stockfish'e dur komutu gönderiliyor.
- `mtest/index.html` içindeki JS sorgu etiketi `20261029-screen-separation-v1` olarak güncellendi.
- Statik kontroller: oyun ekranı kimliği bir kez geçiyor; yinelenen HTML `id` yok; HTML etiket yığını dengeli; geçiş yardımcıları tekil; JS parantez/ayraç taraması dengeli. Bunlar tam JavaScript motoru testi değildir.
- Gerçek tarayıcı ve telefon testi henüz yapılmadı. Ana sayfa, Bot ile Oyna başlatma/iptal, Hızlı Eşleşme, Yerel Oyun, analiz ve oyun sonu dönüşü telefonda denenmeli.
- İlgili commitler:
  - HTML kapsayıcı: `7b709abe821b7aaf51c105d8be4d6c8c0e186e2c`
  - CSS katmanı: `279c2389bcfa94d475f0d0b9331e9190a69170dc`
  - JS geçişleri: `ae92089a2d24d39e3d52b30c1fc33bdbf753ef0b`
  - JS önbellek etiketi: `1d97c19209d3b66f81d051103b1be496faa96307`


## 2026-10-29 — Kullanıcı test sonucu

- Kullanıcı, ana sayfa/oyun ekranı ayrımından sonra belirtilen altı telefon testinin tamamının gayet iyi çalıştığını bildirdi.
- Kabul ölçütleri kullanıcı testiyle olumlu görünüyor: ana sayfa, bot başlatma/iptal, hızlı eşleşme, oyun sonu/analiz ve ana sayfaya dönüş akışları çalışıyor.
- Bu turda yeni kod değişikliği yapılmadı. `gtest` değişmeden korundu.
- Sonraki adım: kullanıcı yeni bir geliştirme istediğinde mevcut ekran ayrımını temel al; aynı ayrımı yeniden yapma.
