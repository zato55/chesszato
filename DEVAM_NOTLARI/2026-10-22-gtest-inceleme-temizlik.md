# 2026-10-22 — GTEST inceleme, analiz özeti düzeltmesi ve temizlik

- **Proje:** `zato55/chesszato`
- **Çalışma dalı:** `main`
- **Geri dönüş yedeği:** `yedek-2026-10-22-gtest-temizlik-oncesi`
- **Test sayfası:** https://zato55.github.io/chesszato/gtest/
- **Ana sayfa:** https://zato55.github.io/chesszato/

## Amaç
Kullanıcının isteğiyle önce ana `index.html` dosyası GTEST `index.html` ile birebir eşitlendi. Ardından GTEST kodunda statik incelemede güvenle düzeltilebilen analiz özeti ve temizlik konuları ele alındı.

## Yapılan değişiklikler
- `index.html`: `gtest/index.html` içeriği birebir kopyalandı. En son doğrulamada iki dosyanın blob SHA değeri aynı: `2db5044c59d4878570dd80dab881eb34d162c5a8`.
- `gtest/index.html`: CSS ve JS önbellek etiketleri `20261022-gtest-cleanup-v1` olarak güncellendi; ardından ana `index.html` tekrar GTEST ile birebir eşitlendi.
- `gtest/app.js`: Maç özeti sınıflandırmasında “kaçan kazanç” koşulu, normal hamle kategorilerinden önce kontrol ediliyor. Böylece aynı hamlenin hem “kaçan kazanç” hem de hata/blunder sayaçlarında çift sayılması önleniyor.
- `gtest/app.js`: Açılış adı çevirisinde `Classical Variation`, genel `Classical` kuralından önceye alındı. Tekrarlanan `Dutch` ve `Classical` çeviri kuralları kaldırıldı.
- `gtest/style.css`: Kısa ekranlar için tanımlanmış, daha sonra tüm mobil ekranlarda uygulanan `116px` kuralıyla geçersiz kalan `104px` alt boşluk kuralı kaldırıldı. `!important` sayısı 305'ten 304'e indi; kalan kuralların büyük kısmı responsive/Tailwind geçersiz kılmaları olduğundan topluca silinmedi.

## Doğrulama
- GitHub dosyaları değişikliklerden sonra yeniden okundu.
- Ana `index.html` ve `gtest/index.html` içerikleri birebir eşit; blob SHA değerleri aynı.
- GTEST JS içindeki yinelenen `Dutch` kuralı bir adede indirildi; `Classical Variation` ve genel `Classical` kuralları doğru sırada.
- CSS'teki geçersiz kalan `104px` alt boşluk kuralı artık yok.
- **Tarayıcı/telefon testi ve JavaScript çalışma zamanı testi yapılmadı.** Bu nedenle değişiklikler statik kod kontrolüyle doğrulandı; gerçek oyun akışları GTEST sayfasında test edilmeli.

## Önemli kapsam notu
Yalnızca ana `index.html` GTEST ile eşitlendi. Ana `app.js` ve `style.css` dosyaları GTEST değişiklikleriyle eşitlenmedi; GTEST'te yapılan kod düzeltmeleri henüz ana oyun dosyalarına aktarılmadı.

## İlgili commitler
- Ana index'i GTEST ile ilk eşitleme: https://github.com/zato55/chesszato/commit/7536f7910650e9e54367898eb17b920e9d619d72
- Analiz kategorileri ve açılış çevirisi: https://github.com/zato55/chesszato/commit/47e6cad196baf034cbfd4d2df673eefbdf1ad70d
- CSS'teki geçersiz alt boşluk kuralı: https://github.com/zato55/chesszato/commit/1a9cf7738bb9a9490801f89d1a93214ed3b673a6
- GTEST önbellek sürümü: https://github.com/zato55/chesszato/commit/b49a8c0b71214d7c93f60f2b6c1185a437c5aee3
- Ana index'i güncel GTEST index'iyle yeniden eşitleme: https://github.com/zato55/chesszato/commit/1090dd02cb933d83c7a06cdcbba59a53976ac94f

## Sonraki adım
1. Telefonda GTEST'i yenileyip maç özeti kategorilerini, açılış adlarını, normal oyun/analiz yerleşimini ve ses ayarını test et.
2. Sorun çıkarsa önce ilgili küçük düzeltmeyi GTEST'te yap.
3. CSS temizliğini yalnızca gerçek kullanım analizi ve ekran testleriyle güvenle kaldırılabilen kurallarla sürdür.
4. GTEST testleri onaylanmadan `gtest/app.js` veya `gtest/style.css` dosyalarını ana dosyalara aktarma.


## Ek kontrol — açılış çevirisi
- Son statik incelemede genel `Variation` çevirisinin `Classical Variation` kuralından önce çalıştığı görüldü. Kural sırası GTEST `app.js` içinde düzeltildi; özel varyant adı artık genel kurala takılmadan çevriliyor.
- Yedek dal: `yedek-2026-10-22-gtest-kapsamli-inceleme-oncesi`.
- Bu kontrol statiktir; tarayıcıda gerçek oyun akışı testi henüz yapılmadı.

## Statik kontrol sonuçları
- `gtest/index.html` ve ana `index.html` SHA değerleri aynı; içerikler birebir eşit.
- HTML içinde yinelenen `id` ve `app.js` içinde yinelenen fonksiyon tanımı bulunmadı.
- CSS açılan/kapanan blok sayısı eşit (179/179).
- `Classical Variation` çeviri kuralı artık genel `Variation` kuralından önce; örnek çıktı `Klasik Varyant`.
- Bu kontroller statiktir. Tarayıcı otomasyonu, telefon testi ve Stockfish ile gerçek oyun senaryoları henüz çalıştırılmadı.

## Ek analiz kontrolü — varyant hamle işaretleri
- Analiz varyantında yeni oynanan hamleler, ana oyundaki aynı indeksin eski kalite sembolünü yanlışlıkla devralabiliyordu. `gtest/app.js` koşulu daraltıldı: kalite sembolleri yalnızca değerlendirilmiş ana hat hamlelerinde gösteriliyor; yeni varyant hamleleri değerlendirilmeden yanlış etiket almıyor.
