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


## 2026-10-25
- [GTEST hızlı eşleşme arama ve VS ekranı](2026-10-25-gtest-hizli-eslesme-arama-vs-ekrani.md) — arama/VS UI demo akışı; gerçek çoklu ziyaretçi eşleştirmesi ve sunucu kilidi daha sonra.


## 2026-10-29
- [MTEST ana sayfa ve oyun ekranı ayrımı](../mtest/NOTLAR.md) — ilk ayrı ekran katmanı uygulandı; mobil gerçek testler bekliyor.


## 2026-10-29
- [MTEST ana sayfa görsel sadeleştirme planı](../mtest/NOTLAR.md) — tamamlanana kadar takip edilecek sıralı plan; ilk görsel düzenleme yapıldı, telefon testi bekleniyor.

 
## 2026-10-29
- MTEST ana sayfa “Oyuna Başla” artık bağımsız dört seçenekli kartı açıyor; ayrıntı ve telefon test listesi: mtest/NOTLAR.md.


## 2026-10-29 — MTEST oyun seçimi kartı
- Ana sayfadaki “Oyuna Başla” artık dört seçenekli bağımsız kart açıyor: Hızlı Eşleşme, Bilgisayara Karşı, Arkadaşınla Oyna, Serbest Tahta. Telefon testi ve ayrıntılar `mtest/NOTLAR.md` içinde.


## 2026-10-29 — Canlı usta sözleri okunabilirlik düzeltmesi

- MTEST söz kartındaki silik metin için yalnızca CSS kontrastı/mobil okunabilirliği iyileştirildi.
- Güvenlik yedeği: `yedek-mtest-usta-sozleri-kontrast-oncesi-2026-10-29`.
- CSS cache etiketi yenilendi; söz döndürme JavaScript'i değiştirilmedi.
- Telefon testi kullanıcı onayı bekliyor.


## 2026-10-29 — MTEST hareketli satranç tahtası arka planı

- Özlü söz kartının altına, siyah zemine karışan kırmızı ışıklı perspektifli tahta animasyonu eklendi.
- Güvenlik yedeği: `yedek-mtest-hareketli-tahta-oncesi-2026-10-29`.
- Teknik ayrıntılar ve telefon test durumu `mtest/NOTLAR.md` içinde.


## 2026-10-29 — MTEST satranç atmosferi görseli ikinci düzenleme

- İlk mobil görünüm geri bildirimine göre CSS kareleri yerine ayrı `mtest/chess-atmosphere.svg` arka plan varlığı kullanıldı; detaylar `mtest/NOTLAR.md` içinde. Telefon testi bekleniyor.


## 2026-10-29 — Serbest Tahta taş paleti görünümü

- Taş seçme butonları Unicode karakterler yerine tahtada kullanılan aynı Neo taş görsellerini kullanıyor; seçili taş kırmızı vurguyla belirginleştirildi.
- Yedek: `yedek-serbest-tahta-2026-10-29`. Telefon testi `mtest/NOTLAR.md` üzerinden takip edilecek.


## 2026-10-29 — Serbest Tahta hamle kaydı

- Serbest Tahta'da oynanan hamleler artık numaralı Beyaz/Siyah sütunlarıyla gösteriliyor; son hamle vurgulanıyor. Ayrıntılar `mtest/NOTLAR.md` içinde.
- Yedek: `yedek-serbest-tahta-hamle-kaydi-oncesi-2026-10-29`. Telefon testi bekleniyor.


## 2026-10-29 — Serbest Tahta hamle şeridi

- Hamle geçmişi artık tahtanın hemen altında yatay kaydırılabilir şerit şeklinde; son hamle kırmızı vurgulu. Detaylar `mtest/NOTLAR.md` içinde.
- Yedek: `yedek-serbest-tahta-hamle-seridi-oncesi-2026-10-29`. Telefon testi bekleniyor.


## 2026-10-30 — MTEST ana sayfa buton sırası

- “Oyuna Başla” butonu, “Diğer Seçenekler” kartlarının altına taşındı. Tıklama davranışı değişmedi; ayrıntılar `mtest/NOTLAR.md` içinde.
- Yedek: `yedek-mtest-oyuna-basla-sira-degisikligi-oncesi-2026-10-30`. Telefon testi bekleniyor.


## 2026-10-30 — MTEST büyük usta sözleri kartı

- Canlı usta sözleri kartı “Diğer Seçenekler” bölümünün üzerine taşındı ve özellikle mobilde daha geniş/okunaklı yapıldı. Dönen sözlerin işleyişi korunmuştur; ayrıntılar `mtest/NOTLAR.md` içinde.
- Yedek: `yedek-mtest-usta-sozleri-kart-duzeni-oncesi-2026-10-30`. Telefon testi bekleniyor.


## 2026-10-30 — MTEST “Stratejini Göster” kartı

- Hero alanı canlı usta sözleri kartıyla aynı koyu geçişli, kırmızı çerçeveli ve yumuşak ışıklı görsel stile uyarlandı; şah figürü ve metin korundu.
- Yedek: `yedek-mtest-stratejini-goster-karti-oncesi-2026-10-30`. Ayrıntılar `mtest/NOTLAR.md` içinde; telefon testi bekleniyor.


## 2026-10-30 — MTEST ana sayfa dış çerçeve ışığı

- Ana sayfanın dış kenarları boyunca dolaşan ince kırmızı/beyaz ışık eklendi; yalnızca ana sayfa görünümünü etkiler.
- Yedek: `yedek-mtest-ana-sayfa-cevre-isigi-oncesi-2026-10-30`. Ayrıntılar `mtest/NOTLAR.md` içinde; telefon testi bekleniyor.


## 2026-10-30 — MTEST kenar ışığı düzeltmesi

- Ana sayfa çerçevesi sabit; kırmızı-beyaz parlak ışık şeridi çerçeve kenarı boyunca ilerliyor. Önceki tüm-öğe dönüş animasyonu kaldırıldı.
- Yedek: `yedek-mtest-kenar-isigi-duzeltme-oncesi-2026-10-30`. Telefon testi bekleniyor.


## 2026-10-30 — MTEST kenar ışığı eflatun

- Ana sayfa çevresinde dolaşan sabit çerçeve hattındaki ışık eflatun/lavanta tonlarına alındı; animasyon ve mobil yerleşim korundu.
- Yedek: `yedek-mtest-eflatun-kenar-isigi-oncesi-2026-10-30`. Telefon testi bekleniyor.


## 2026-10-30 — MTEST savaşan satranç figürleri

- Ana sayfanın alt görseli, çapraz kılıçlarla karşılaşan iki zırhlı satranç figürünün yer aldığı özgün vektör sanatla değiştirildi.
- Görsel alanı kenar çerçevesine kadar boşluksuz genişleyecek şekilde ayarlandı. Yedek: `yedek-mtest-savasan-satranc-figurlu-alt-gorsel-oncesi-2026-10-30`.
- Teknik ayrıntı ve telefon testi durumu `mtest/NOTLAR.md` içinde.


## 2026-10-30 — MTEST kenar ışığı su mavisi

- Ana sayfa çevresindeki hareketli ışık eflatundan su mavisi/camgöbeği tonlarına alındı; animasyon ve yerleşim korundu.
- Yedek: `yedek-mtest-su-mavisi-kenar-isigi-oncesi-2026-10-30`. Ayrıntı `mtest/NOTLAR.md` içinde.
