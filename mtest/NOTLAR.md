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


## 2026-10-29 — Ana sayfa görsel sadeleştirme planı ve 1. aşama

- Çalışma alanı: mtest, main; gtest ve eski V93 projesi kapsam dışı.
- Güvenlik yedeği: yedek-mtest-ana-sayfa-gorsel-duzenleme-oncesi-2026-10-29 dalı, düzenleme öncesindeki main durumundan oluşturuldu.
- Kullanıcı talebi: aşağıdaki sırayı tüm aşamalar eksiksiz tamamlanana kadar sürdürmek ve her önemli adımda notları güncellemek.
- Tamamlama sırası:
  1. Ana sayfayı sadeleştirmek: yinelenen kısa tanıtım metnini azaltmak ve “Oyuna Başla” eylemini görsel olarak öne çıkarmak.
  2. Kartlar ve butonlarda ortak koyu tema, tutarlı kenarlık/ikon rengi ve yalnızca ana eylemde kırmızı vurgu kullanmak.
  3. Telefon üzerinde görünüm, taşma/kaydırma ve buton akışlarını kullanıcıyla test etmek.
  4. Alt gezinme menüsünü yalnızca çalışan bölümlere göre değerlendirmek; var olmayan sayfaları varmış gibi göstermemek.
  5. Giriş sonrası kullanıcı alanı, profil, ELO ve istatistikleri mevcut gerçek özelliklere göre tasarlamak.
  6. Bulmacalar, çevrim içi oyuncu bilgisi ve son oyunlar için gerçek veri/işlev akışlarını değerlendirmek; hazır olmayanları tamamlanmadan çalışıyor göstermemek.
- Aşama 1-2 için yapılan küçük görsel değişiklik: mtest/style.css içinde hero alt cümlesi gizlendi; Giriş Yap/Kayıt Ol ikincil/çerçeveli stile alındı; oyun modu ve diğer seçenek kartları ortak koyu arka plan ve tutarlı kenarlık/ikon rengine getirildi; “Oyuna Başla” kırmızı ana eylem olarak bırakıldı.
- mtest/index.html içinde yalnızca CSS önbellek etiketi 20261029-home-visual-v1 olarak değiştirildi. JavaScript/oyun akışı değiştirilmedi.
- Doğrulama sınırı: dosya ve sözdizimi kontrolleri yapılacak; gerçek telefon görünümü henüz kullanıcı tarafından yeniden onaylanmadı. Bu aşama telefon testi olumlu dönmeden tamamlanmış sayılmaz.
- Sonraki adım: telefonda ana sayfanın düzenini kontrol etmek; sorun varsa yalnızca bu görsel aşamayı düzeltmek. Onaydan sonra alt gezinme menüsü aşamasına geçmek.

 
## 2026-10-29 — “Oyuna Başla” için bağımsız oyun seçim kartı

- Önceki durumdan güvenlik yedeği: yedek-mtest-oyuna-basla-kart-oncesi-2026-10-29.
- mtest/index.html: ana sayfadaki “Oyuna Başla” artık oyun içindeki “Oyna” menüsünü açmak yerine bağımsız mtestGameChoicesModal kartını açıyor.
- Kartta dört seçenek bulunuyor: Hızlı Eşleşme, Bilgisayara Karşı, Arkadaşınla Oyna, Serbest Tahta.
- Ana sayfadaki ayrı “OYUN MODLARI” kart grubu kaldırıldı; bu dört seçenek artık yalnızca “Oyuna Başla” kartında sunuluyor. Analiz, Turnuvalar, Ayarlar ve Bulmacalar ayrı bölümde kaldı.
- Oyun içindeki mevcut “Oyna” menüsü değiştirilmedi; bu karttan ayrı tutuldu.
- Hızlı Eşleşme ve bot seçenekleri mevcut akışları çağırıyor; yerel oyun mevcut yerel oyun menüsünü çağırıyor; Serbest Tahta freeboard.html sayfasını açıyor.
- Kod kontrolü yapılacak; telefonda gerçek davranış henüz kullanıcı tarafından doğrulanmadı. Bu adım telefon testi olumlu dönene kadar tamamlandı sayılmayacak.
- Test listesi: Oyuna Başla kartı aç/kapat; dört seçeneğin doğru akışa gitmesi; oyun içindeki Oyna menüsünde Ana Sayfa seçeneğinin ve diğer mevcut davranışların değişmeden kalması; ana sayfa/oyun ekranı geçişleri.


## 2026-10-29 — Canlı usta sözleri okunabilirlik düzeltmesi

- Güvenlik yedeği: `yedek-mtest-usta-sozleri-kontrast-oncesi-2026-10-29`.
- Kullanıcının telefon ekranında söz kartındaki metin ve yazar adının çok silik göründüğü gözlendi.
- `mtest/style.css` içinde yalnızca söz kartının kontrastı ve mobil okunabilirliği güçlendirildi: söz beyaz, yazar adı açık pembe, üst etiket daha görünür; kartın minimum yüksekliği ve metin boyutu hafif artırıldı.
- `mtest/index.html` CSS önbellek etiketi yenilendi. Sözlerin dönme mantığına ve oyun akışına dokunulmadı.
- Statik kontroller sonrası telefon testi bekleniyor; gerçek mobil görünüm kullanıcı onayı olmadan tamamlanmış sayılmayacak.


## 2026-10-29 — Ana sayfa altına gömülü hareketli satranç tahtası

- Güvenlik yedeği: `yedek-mtest-hareketli-tahta-oncesi-2026-10-29`.
- Kullanıcı referans görselindeki kırmızı ışıklı, derinlikli satranç tahtası fikri ana sayfanın özlü söz kartının altındaki boş alana uyarlandı.
- `mtest/index.html`: yalnızca dekoratif, erişilebilirlik açısından gizli bir arka plan katmanı eklendi; CSS önbellek etiketi yenilendi.
- `mtest/style.css`: perspektifli kareli tahta, düşük yoğunluklu kırmızı taş silüetleri ve yavaş ışık hareketi eklendi. Hareket azaltma tercihi destekleniyor; katman tıklamaları engellemiyor.
- Oyun mantığı ve `gtest` değiştirilmedi. Statik kontroller yapılacak; mobil görünüm ve performans kullanıcı testini bekliyor.


## 2026-10-29 — Hareketli tahta görseli ikinci düzenleme

- Yedek: `yedek-mtest-hareketli-tahta-oncesi-2026-10-29`.
- İlk mobil testte tahta kareleri fazla keskin, taşlar fazla silik göründü. CSS ile çizilen ilk tahta katmanı yerine ayrı SVG atmosfer görseli eklendi: perspektifli kırmızı-siyah tahta, kırmızı ışık, taş silüetleri ve siyaha yumuşak geçiş.
- `mtest/chess-atmosphere.svg` yeni görsel varlığı; `mtest/style.css` bunu arka plan olarak kullanıyor; `mtest/index.html` cache etiketi yenilendi.
- Statik dosya kontrolleri ve gerçek telefon testi ayrı ayrı doğrulanmalı.


## 2026-10-29 — Serbest Tahta taş seçme paleti

- Yedek: `yedek-serbest-tahta-2026-10-29`.
- Taş seçme paletindeki Unicode semboller kaldırılarak tahtadaki taşlarla aynı Neo taş görselleri kullanıldı. Böylece taş şekilleri site temasına uyuyor ve küçük ekranda daha belirgin görünüyor.
- Seçili taş için kırmızı tonlu arka plan/ışık ve klavye odağı görünümü eklendi. Tahta yerleşimi ve FEN mantığı değiştirilmedi.
- Görseller dış kaynaktan geliyor; ağ bağlantısı yoksa yüklenmeleri etkilenebilir. Telefon testi bekleniyor.


## 2026-10-29 — Serbest Tahta hamle kaydını netleştirme

- Yedek: `yedek-serbest-tahta-hamle-kaydi-oncesi-2026-10-29`.
- `mtest/freeboard-play.html`: tek satır hâlindeki hamle metni, numaralı satırlardan oluşan Beyaz/Siyah sütunlu kayda dönüştürüldü. Son hamle hafif kırmızı vurgulu; siyah hamle henüz gelmediyse boşluk çizgiyle gösteriliyor.
- Hamleler chess.js geçmişinden SAN notasyonuyla okunuyor; hamle oynama/geri alma mantığı değiştirilmedi. Telefon görünümünde liste kaydırılabilir.
- Statik kontroller sonrası telefon testi bekleniyor.


## 2026-10-29 — Serbest Tahta hamle şeridi

- Yedek: `yedek-serbest-tahta-hamle-seridi-oncesi-2026-10-29`.
- Kullanıcı önceki hamle kayıt panelini beğenmedi; hamleler artık tahtanın hemen altında yatay, kaydırılabilir bir şerit olarak gösteriliyor. Her hamle küçük bir etiket, hamle numarası ve SAN notasyonuyla gösteriliyor; son hamle kırmızı vurgulu.
- `mtest/freeboard-play.html` değişti. Yan paneldeki geniş hamle tablosu kaldırıldı; taş/hamle mantığı korunuyor.
- Statik kontroller tamamlandı; telefon testi bekleniyor.


## 2026-10-30 — Ana sayfada Oyuna Başla butonunun sırası

- Yedek: `yedek-mtest-oyuna-basla-sira-degisikligi-oncesi-2026-10-30`.
- Kullanıcı isteğiyle `mtest/index.html` içinde “Oyuna Başla” butonu hero alanının altından alınarak “Diğer Seçenekler” (Analiz, Turnuvalar, Ayarlar, Bulmacalar) bölümünün altına taşındı.
- Butonun mevcut modal açma davranışı ve oyun seçim akışı değiştirilmedi; yalnızca DOM sırası değişti.
- Statik konum/kimlik kontrolleri yapıldı; telefon görünümü kullanıcı testini bekliyor.


## 2026-10-30 — Büyük usta sözleri kartının yeri ve boyutu

- Yedek: `yedek-mtest-usta-sozleri-kart-duzeni-oncesi-2026-10-30`.
- Canlı büyük usta sözleri kartı, ana sayfada “Diğer Seçenekler” bölümünün üstüne taşındı. Kartın yüksekliği, iç boşlukları, söz metni ve yazar adı özellikle mobilde daha okunaklı olacak şekilde büyütüldü.
- “Oyuna Başla” butonu diğer seçeneklerin altında kalmaya devam ediyor. Söz döndürme JavaScript/işleyişine dokunulmadı.
- Statik DOM sırası ve CSS dengesi kontrol edildi; telefon testi bekleniyor.


## 2026-10-30 — “Stratejini Göster” kartının görsel uyumu

- Güvenlik yedeği: `yedek-mtest-stratejini-goster-karti-oncesi-2026-10-30`.
- Ana sayfadaki hero alanı, canlı usta sözleri kartının koyu kırmızı/mavi geçişli zemini, ince kırmızı çerçevesi, yuvarlatılmış köşeleri ve yumuşak ışık efektiyle aynı görsel dile getirildi.
- Başlık, açıklama ve şah figürü korunarak mobil boyutlar ayrıca düzenlendi. Metin ve oyun akışına dokunulmadı.
- CSS önbellek etiketi yenilendi. Statik CSS/DOM kontrolü yapılacak; telefon görünümü kullanıcı testi bekliyor.


## 2026-10-30 — Ana sayfa çevresinde dolaşan ışık

- Güvenlik yedeği: `yedek-mtest-ana-sayfa-cevre-isigi-oncesi-2026-10-30`.
- `mtest/style.css`: ana sayfanın dış kenarında dört kenarı takip eden ince kırmızı/beyaz ışık efekti eklendi. Efekt yalnızca ana sayfa katmanında; kart içeriklerine ve tıklamalara engel olmuyor. Mobil ölçü ve hareket azaltma tercihi destekleniyor.
- `mtest/index.html`: CSS önbellek etiketi yenilendi. Oyun ekranı ve oyun mantığı değiştirilmedi.
- Statik CSS/DOM kontrolü yapılacak; gerçek telefon görünümü kullanıcı testi bekliyor.


## 2026-10-30 — Kenar ışığı düzeltmesi

- Önceki dönen efekt kaldırıldı; çerçeve sabit kalıyor ve parlak kırmızı-beyaz ışık şeridi kenar boyunca ilerliyor.
- Işık dört kenarı ve yuvarlatılmış köşeleri takip eden ince çerçeve hattında tutuldu. Mobil ölçü, tıklama engellememe ve hareket azaltma desteği korundu.
- Yedek: `yedek-mtest-kenar-isigi-duzeltme-oncesi-2026-10-30`. Telefon testi bekleniyor.


## 2026-10-30 — Alt satranç atmosfer görseli yenilendi

- `mtest/chess-atmosphere.svg` daha sanatsal/sinematik bir kompozisyonla yenilendi: altın tonlu şah, perspektif satranç zemini, çevresel taş siluetleri, yumuşak ışık huzmeleri ve bordo-kırmızı atmosfer.
- Görsel SVG olarak kaldı; yeni harici görsel servisi veya bağımlılık eklenmedi. CSS görsel önbellek sürümü yenilendi.
- Yedek: `yedek-mtest-alt-satranç-gorseli-oncesi-2026-10-30`. Telefon görünümü kullanıcı testi bekliyor.


## 2026-10-30 — Alt görselin görünürlük sorunu düzeltildi

- Önceki SVG arka plan olarak uygulanmıştı; eski pseudo-element/ışık katmanları ve arka plan katmanlaması nedeniyle görsel değişikliği yeterince görünür değildi.
- `mtest/index.html` içinde alt görsel doğrudan `img` öğesi olarak yerleştirildi; `mtest/style.css` içinde eski dekor katmanları kapatılıp yeni görselin tam görünmesi sağlandı.
- CSS ve SVG önbellek sürümleri yenilendi. Telefon görünümü kullanıcı testi bekliyor.


## 2026-10-30 — Ana sayfa kenar ışığı eflatun

- Ana sayfanın dış çerçevesi boyunca ilerleyen ışık şeridi kırmızı tonlarından eflatun/mor ve açık lavanta tonlarına geçirildi.
- Animasyon yönü, hızı, sabit çerçeve yapısı ve mobil ölçüler korundu.
- Yedek: `yedek-mtest-eflatun-kenar-isigi-oncesi-2026-10-30`. Telefon testi bekleniyor.


## 2026-10-30 — MTEST alt bölüm: savaşan satranç figürleri

- Güvenlik yedeği: `yedek-mtest-savasan-satranc-figurlu-alt-gorsel-oncesi-2026-10-30`.
- `mtest/chess-atmosphere.svg` özgün vektör kompozisyonuyla yenilendi: zırhlı atlı satranç savaşçısı ve taçlı rakip figür, çapraz kılıçlar, kıvılcım ışığı ve perspektif satranç zemini.
- Alt görsel alanı esneyerek kalan boşluğu dolduracak, sağ/sol kenarlara ve alt kenara kadar uzanacak şekilde ayarlandı; önceki solma maskesi kaldırıldı. Eflatun kenar ışığı korunuyor.
- Yalnızca ana sayfa alt görseli ve yerleşimi etkilendi; oyun mantığına dokunulmadı. Telefon görünümü kullanıcı testi bekliyor.


## 2026-10-30 — MTEST kenar ışığı su mavisi

- Yedek: `yedek-mtest-su-mavisi-kenar-isigi-oncesi-2026-10-30`.
- Ana sayfanın hareketli kenar ışığı eflatundan su mavisine çevrildi: camgöbeği/turkuaz ton, açık buz mavisi parlak vurgu ve uyumlu dış parlama.
- Işığın animasyon hızı, çerçeve geometrisi ve alt görsel yerleşimi değiştirilmedi.
- Telefon görünümü kullanıcı testi bekliyor.
