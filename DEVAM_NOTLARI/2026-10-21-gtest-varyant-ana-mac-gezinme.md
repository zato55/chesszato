# GTEST analizinde varyant ve ana maç arasında gezinme

- Tarih: 2026-10-21
- Proje: `zato55/chesszato`
- Dal: `main`
- Test sayfası: https://zato55.github.io/chesszato/gtest/
- Ana sayfa: https://zato55.github.io/chesszato/
- Durum: Kullanıcı telefonda test etti ve varyant içi gezinme ile eski maçın ana devamına bağlanma davranışlarının düzeldiğini doğruladı.

## İstenen davranış
Eski bir maç analizde açıldığında kullanıcı bir konumdan varyant oynayabilir. Varyanttan geri gelirken:
- Varyantın içinde kalıp ileri basarsa varyantın devamını görmeli.
- Varyantın başladığı kapı konumuna kadar geri döner ve oradan ileri basarsa eski maçın ana devamı gösterilmeli.

Örnek: Eski maçın 5 hamlesi var; 3. hamleden sonra oynanan varyant 4, 5, 6, 7 ile devam ediyor. Varyantın 7. hamlesinden 3. hamle konumuna dönüp ileri basınca eski maçın 4. ve 5. hamleleri gösterilmeli. 4. hamle konumuna kadar geri dönüp ileri basınca ise varyantın 5, 6, 7 hamleleri devam etmeli.

## Yapılan değişiklik
Yalnızca GTEST dosyaları değiştirildi:
- `gtest/app.js`: Ana devam yoluna geçiş koşulu hem ileri gezinme düğmesinde hem klavyedeki sağ okta güncellendi. Varyant başlangıç konumunun ilk konum (`analysisIdx = -1`) olması durumunda da ana devam yoluna geçiş mümkün.
- `gtest/index.html`: Telefon/tarayıcı önbelleğinin yeni JavaScript dosyasını yüklemesi için `app.js` sürüm etiketi `20261021-analysis-nav-v5` yapıldı.
- Ana `app.js`, ana `index.html` ve `style.css` değiştirilmedi.

## Commitler
- `gtest/app.js`: https://github.com/zato55/chesszato/commit/747d44eb2b42065a4f0825f7f37af0ebc2ae95f2
- `gtest/index.html`: https://github.com/zato55/chesszato/commit/a4a3d46d7f711df8692778d715beb580e3ac2d9e

## Doğrulama
- Dosyalar GitHub `main` dalından tekrar çekilerek değişiklikler kaynak kodda doğrulandı.
- Kullanıcı, varyant içinde gezinme ve eski oynanmış maçın ana devamına bağlanma davranışlarının düzeldiğini bildirdi.
- Bu doğrulama GTEST içindir; ana sayfaya aktarım yapılmadı.

## Sonraki adım
- Bu davranışa dokunmadan GTEST'teki diğer işi kullanıcının isteğine göre sürdür.
- Ana sayfaya aktarım ancak kullanıcı açıkça istediğinde yapılmalı.
- İleride gezinme kodu değiştirilirse hem fare/düğme hem klavye sağ oku ve varyant başlangıç konumu (`analysisIdx = -1`) senaryosu yeniden kontrol edilmeli.
