# 2026-10-25 — GTEST hızlı eşleşme arama ve VS ekranı

## Kapsam
Yalnızca `gtest/` altındaki dosyalar değiştirildi. Normal oyun dosyalarına ve canlı site akışına dokunulmadı.

## Yapılanlar
- `gtest/index.html`: Rakip arama ve VS ekranı için `quickMatchFlowModal` eklendi.
- `gtest/style.css`: Arama animasyonu, yükleme çizgisi, oyuncu kartları ve hareket azaltma tercihi stilleri eklendi.
- `gtest/app.js`: Hızlı eşleşme butonu önce arama ekranını, sonra sanal rakip seçilip VS ekranını, ardından oyunu açacak akışa yönlendirildi.
- Oyun sonu ekranındaki hızlı eşleşme “Yeni Oyun” eylemi aynı akışı yeniden başlatır.
- İptal, arama zamanlayıcısını durdurur ve önceki oyun sonu ekranını geri getirir.
- VS ekranında gösterilen oyuncu tarafı ile gerçek oyunun taraf seçimi eşitlendi.
- GTEST CSS/JS sorgu sürümleri yenilendi: `20261025-matchmaking-ui-v1`.

## Önemli sınır
Bu aşama yalnızca arayüz akışı ve tarayıcı içindeki demo eşleşmesidir. Farklı ziyaretçiler arasında gerçek ortak eşleştirme veya aynı sanal rakibin iki eşzamanlı maça verilmesini engelleyen sunucu kilidi yoktur. Üyelik/Firebase entegrasyonu daha sonra ele alınacak.

## Kontrol
GitHub dosyaları yeniden okunarak modal, stiller, arama başlatıcısı, yeni oyun yönlendirmesi, iptal işleyicisi ve sürüm etiketleri kontrol edildi. Gerçek tarayıcıda görsel/etkileşim testi henüz yapılmadı.

## Devam adımı
GTEST sayfasında mobilde hızlı eşleşme başlat, arama ekranını ve VS ekranını gözle kontrol et; sonra bir maçı bitirip “Yeni Oyun” akışını dene. İptal butonunu hem ilk aramada hem oyun sonundan başlatılan aramada test et. Görsel sorun varsa yalnızca ilgili UI alanını düzelt.


## 2026-10-25 düzeltme — yeni oyunda hamle girişi
- Kullanıcı testi: oyun sonrasında Yeni Oyun ile yeni rakip bulunuyor ancak oyuncu beyazken tahta hamleleri algılamıyordu.
- `gtest/app.js` içindeki tahta tıklama ve hamle işleyicilerinde `isEngineThinking` bayrağı insan hamlelerini de engelliyordu. Eski Stockfish aramasından kalan bayrak yeni maçta insan sırası için kilit oluşturabiliyordu.
- Her iki yerdeki kontrol, yalnızca botun sırasıysa giriş engellenecek şekilde daraltıldı.
- `gtest/index.html` JS cache sürümü `20261025-matchmaking-input-fix-v1` olarak güncellendi.
- Kaynak kontrolü: iki eski `isBotTurn || isEngineThinking` koşulu kalmadı; iki hamle kontrolü yalnızca `isBotTurn` ile yapılıyor. Gerçek tarayıcı doğrulaması kullanıcıdan bekleniyor.


## 2026-10-26 — Hızlı eşleşmede ilk hamle süresi
- Hızlı eşleşme tahtası açıldığında sıradaki tarafın ilk hamlesi için 20 saniyelik ayrı sayaç başlatıldı; normal satranç saatiyle karıştırılmıyor.
- Her iki tarafın da kendi ilk hamlesi için ayrı 20 saniye uygulanır. Bir tarafın ilk hamlesi tamamlanınca sıradaki tarafın ilk hamle sayacı başlar; iki taraf da ilk hamlesini yaptıktan sonra sayaç kalmaz.
- Süre dolarsa oyun kilitlenir ve yalnızca “Başka Rakip Ara” / “Ana Ekran” seçenekli maç iptal modalı gösterilir.
- Hızlı eşleşme akışı yeniden başlatılırken ve oyun sıfırlanırken sayaç temizlenir.
- Yalnızca GTEST dosyaları değiştirildi; normal oyun dosyalarına ve Firebase/üyelik altyapısına dokunulmadı. Tarayıcıda gerçek zamanlama testi henüz yapılmadı.


## 2026-10-26 — İlk hamle sayacı oyuncu kartına taşındı
- Hızlı eşleşmenin 20 saniyelik ilk hamle sayacı, ekranın üstünde ayrı bir bildirim yerine aktif tarafın oyuncu kartındaki saat kutusunda gösterilir.
- Geri sayım sırasında yalnızca o oyuncunun normal saat kutusu geçici olarak geri sayım kutusuyla yer değiştirir; sayaç durunca normal saat yeniden görünür.
- Üst/alt kart seçimi tahtanın yönü ve beyaz/siyah tarafına göre yapılır. Yalnızca GTEST HTML/JS ve devam notu değiştirildi.

## 2026-10-26 — Maç bitişinin kesin kilitlenmesi
- Hızlı eşleşme botunun düşünme sonrası gecikmeli hamle zamanlayıcısı artık saklanıyor; maç biterse, yeni eşleşme başlarsa veya tahta sıfırlanırsa iptal ediliyor.
- Gecikmeli bot hamlesi çalışacağı anda maçın bitmediğini ve tahtanın hâlâ arama başındaki aynı konumda olduğunu yeniden doğruluyor. Böylece iptal modalı açıkken eski maçtan ses/hamle gelmesi engelleniyor.
- 20 saniyelik ilk hamle süresi dolduğunda gecikmeli hamle temizleniyor, Stockfish'e dur komutu gönderiliyor ve motorun maç hamlesi üretmesi devre dışı bırakılıyor.
- Normal maç sonu penceresi açılırken de bekleyen bot zamanlayıcısı ve ilk hamle sayacı temizleniyor; bu ortak yol şah mat, beraberlik, süre ve terk sonuçlarında kullanılıyor.
- GTEST JS önbellek sürümü: `20261026-game-end-lock-v1`.
- Kontrol sınırı: GitHub kaynak kodu üzerinden statik kontrol yapılacak; gerçek cihazda tarayıcı testi ayrıca gerekli.
