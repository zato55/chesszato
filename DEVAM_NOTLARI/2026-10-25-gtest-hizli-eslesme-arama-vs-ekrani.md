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
