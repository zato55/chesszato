# Analiz oklarında aynı konum için hamle önbelleği

- Tarih: 2026-10-21
- Proje: `zato55/chesszato`
- Dal: `main`
- Test sayfası: https://zato55.github.io/chesszato/gtest/
- Ana sayfa: https://zato55.github.io/chesszato/
- Durum: Kod GitHub'dan geri okunarak doğrulandı; kullanıcı testi bekleniyor.

## Belirti ve önceki denemeler
Kullanıcı aynı konumda geri-ileri yaptığında yeşil en iyi hamle okunun değişmeye devam ettiğini bildirdi. Önceki iki koruma/ayar denemesi sorunu çözmedi:
- FEN uyuşmazlığı varsa eski analiz sonucunu reddetme.
- Analiz başında `ucinewgame` gönderme ve arama derinliğini 12'ye çıkarma.

## Bu değişiklik
Yalnızca `gtest/app.js` değiştirildi:
- `analysisBestMoveByFen` isimli oturum içi önbellek eklendi.
- Bir FEN için ilk geçerli en iyi hamle alındığında saklanıyor.
- Aynı FEN'e yeniden dönüldüğünde saklanan hamle oku gösteriliyor; sonraki motor yanıtları o konumun okunu farklılaştırmıyor.
- Yeni oyun sıfırlanırken önbellek temizleniyor.
- Ana `app.js`, `index.html` ve `style.css` değiştirilmedi.

## Commit ve doğrulama
- Commit: https://github.com/zato55/chesszato/commit/aa623a47b00d753c882f63bb6030aa45bdce8983
- Güncel `gtest/app.js` blob SHA: `2d56788a8a9096542845382f1fae4776855e3720`
- Güncel dosya GitHub `main` üzerinden yeniden çekildi; önbellek oluşturma, tekrar kullanma ve yeni oyunda temizleme kodları doğrulandı.
- Telefonda test henüz yapılmadı; çözümün işe yaradığı varsayılmamalı.

## Sonraki adım
Test sayfasında aynı konuma geri-ileri birkaç kez yap. Ok sabit kalırsa kullanıcıdan teyit al. Değişiklik ana siteye kullanıcı açıkça istemeden aktarılmayacak. Aynı konumdaki ilk seçilen hamlenin doğruluğu/derinliği ayrı bir konu; bu değişiklik yalnızca tekrar ziyaretlerde okun tutarlılığını hedefliyor.
