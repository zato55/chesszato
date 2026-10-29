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
