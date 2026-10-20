# Devam Notları

Bu klasör, yeni sohbetlerde projeye hızlı ve doğru şekilde devam edebilmek için kalıcı çalışma kayıtlarıdır.

## Ne zaman not eklenir?
Yalnızca sürüm güncellemesi niteliğindeki veya proje akışını önemli ölçüde etkileyen işler için yeni bir not oluştur:
- Önemli hata düzeltmeleri ve doğrulanan sonuçları
- Kullanıcı tarafından kabul edilmiş özellik veya davranış değişiklikleri
- Sürüm / mimari / dosya akışı değişiklikleri
- Önemli test sonuçları, bilinen sorunlar ve sıradaki adım

Ufak yazım düzeltmeleri, küçük görsel ayarlar ve tek başına önem taşımayan küçük değişiklikler için ayrı not açma. Birkaç küçük değişiklik birlikte anlamlı bir kilometre taşı oluşturursa tek notta topla.

## Dosya adı
`YYYY-MM-DD-kisa-konu.md`

## Her notta bulunacak bilgiler
1. **Proje ve dal:** Hangi repo, dal ve ilgili sayfa.
2. **Amaç / belirti:** Neden çalışıldı.
3. **Yapılan değişiklik:** Etkilenen dosyalar ve önemli davranış.
4. **Doğrulama:** Gerçekten kontrol edilen testler ve sonuçları; test edilmemiş şeyleri açıkça belirt.
5. **GitHub:** İlgili commit bağlantıları / SHA'ları.
6. **Mevcut durum:** Kullanıcı onayı, bilinen sorunlar ve geri alınması gereken noktalar.
7. **Sonraki adım:** Sohbet yeniden başladığında yapılacak ilk somut iş.

## Yeni sohbet kuralı
Kullanıcı “DEVAM_NOTLARI klasörünü oku” veya benzeri dediğinde önce bu klasördeki kayıtları GitHub'dan oku. En yeni nottan mevcut durumu çıkar; tahminde bulunma ve eski notların daha yeni kayıtlarla geçersiz kılınmış olabileceğini kontrol et.

Her önemli değişiklik ve doğrulama tamamlandığında, kullanıcı ayrıca hatırlatmadan uygun bir not ekle. GitHub'a yazılan notların sonucunu doğrulamadan tamamlandı deme. Kod değişiklikleri için geçerli izin ve güvenlik sınırlarına aynen uy; not tutma izni deploy, canlı veritabanı işlemi veya ilgisiz değişiklikler için izin sayılmaz.
