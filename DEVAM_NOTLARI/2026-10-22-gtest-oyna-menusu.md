# 2026-10-22 — GTEST mobil Oyna menüsü

- **Proje:** `zato55/chesszato`
- **Dal:** `main`
- **Kapsam:** Yalnızca `gtest/index.html`, `gtest/app.js`, `gtest/style.css`
- **Geri dönüş yedeği:** `yedek-2026-10-22-gtest-mobil-menu-oncesi`
- **Test adresi:** https://zato55.github.io/chesszato/gtest/
- **Önceki mobil menü notu:** `DEVAM_NOTLARI/2026-10-22-gtest-mobil-menu-duzenlemesi.md`

## İstenen davranış
Mobil alt menüde Oyna'ya dokununca doğrudan oyuna dönmek yerine genişletilebilir Oyna menüsü açılır. Normal oyun dosyalarına dokunulmayacak; kullanıcı onayı olmadan değişiklik aktarılmayacak.

## Menü seçenekleri
- **Yeni oyun:** Mevcut oyun modunu koruyarak oyunu sıfırlar ve yeni oyunu başlatır.
- **Hızlı eşleştirme:** Menüde görünür; eşleştirme altyapısı henüz olmadığı için açıkça henüz kullanıma açık olmadığı bildirilir.
- **Bota karşı oyna:** Stockfish modunu seçer ve yeni oyunu başlatır.
- **Turnuvalar:** Menüde görünür; turnuva altyapısı henüz olmadığı için açıkça henüz kullanıma açık olmadığı bildirilir.
- **Yerel oyun:** Aynı cihazda iki kişilik modu seçer ve yeni oyunu başlatır.

## Uygulama
- Menü modalı `gtest/index.html` içine eklendi.
- Dokunma alanları, mobil alt boşluk, odak görünümü ve açılış animasyonu `gtest/style.css` içine eklendi.
- Oyna düğmesi ve seçeneklerin davranışları `gtest/app.js` içine eklendi.
- CSS/JS cache-busting etiketi `20261022-gtest-play-menu-v1` olarak güncellendi.
- **Normal oyun dosyaları değiştirilmedi.**

## Doğrulama
- JavaScript sözdizimi kontrolü geçti.
- Menü kimlikleri benzersiz; beş seçeneğin de olay işleyicisi var.
- CSS süslü parantez dengesi geçti.
- Telefon üzerinde görsel ve dokunmatik test henüz yapılmadı.

## Sonraki adım
Telefonda GTEST sayfasını açıp Oyna menüsünü, beş seçeneği ve mevcut oyunun yalnızca ilgili oyun türü seçildiğinde sıfırlandığını kontrol et. Hızlı eşleştirme ve turnuva altyapısı sonraki ayrı işlerdir. Normal oyun dosyalarına ancak kullanıcı açıkça onay verirse aktar.


## Son düzeltme — yalnızca açık menü aktif görünür
- Kullanıcı geri bildirimi: oyun ekranındayken Oyna sekmesi sürekli aktif görünüyordu.
- Alt menüde başlangıçtaki aktif sınıf ve `aria-current` kaldırıldı.
- Oyna yalnızca Oyna menüsü açıldığında aktif olur; menü kapatıldığında aktiflik temizlenir.
- Stockfish, Tempo ve Ayarlar da yalnızca kendi menüleri açıkken aktif görünür; kapatılınca hiçbir alt menü öğesi aktif kalmaz.
- `app.js` ve HTML cache-busting etiketi `20261022-gtest-play-menu-v2` olarak güncellendi.
- JavaScript sözdizimi ve durum geçişleri statik olarak kontrol edildi; telefon üzerinde tekrar görsel test bekleniyor.
- Düzeltme commitleri: `49a881ee12fea263edcf4c5c916ccac428c9e606` (JS), `a6a3b97812ec6613345e9b89474cac0c17c369a1` (HTML).


## Son düzenleme — diğer mobil menüler Oyna tasarımına yaklaştırıldı (2026-10-22)
- Yedek dalı: `yedek-2026-10-22-gtest-menu-tasarim-oncesi`.
- Yalnızca `gtest/index.html` ve `gtest/style.css` değiştirildi; normal oyun dosyalarına dokunulmadı.
- Tempo, Stockfish ve Ayarlar panellerine ortak `mobile-menu-sheet` sınıfı eklendi.
- Telefonda üç menü de Oyna menüsü gibi alttan açılan, koyu kart, yuvarlatılmış köşe, kenarlık, gölge ve kısa açılış animasyonu kullanıyor.
- Tempo seçenekleri ve bot seviyesi düğmelerinin dokunma alanları büyütüldü; ayarlar paneli mobilde alttan açılıyor ve uzun içerik gerektiğinde kendi içinde kayıyor.
- Cache etiketi `20261022-gtest-menu-style-v3` yapıldı.
- Statik kontroller: üç panel sınıfı bulundu, CSS parantez dengesi geçti, `app.js` sözdizimi geçti. Telefon üzerinde görsel/dokunmatik test henüz yapılmadı.
- Commitler: HTML `b6b4e10820fa1ae397ba179a7cc67d3555e1c893`; CSS `3f5fc2ea5a8a79898cc9e366815cb0233a5f11fe`.


## Son düzenleme — bota karşı oyunda önce ayarlar (2026-10-22)
- Yedek dalı: `yedek-2026-10-22-gtest-bot-ayarlari-oncesi`.
- GTEST'te Oyna > Bota karşı oyna seçilince Oyna menüsü kapanır, Stockfish ayar paneli açılır; oyun hemen sıfırlanıp başlatılmaz.
- Kullanıcı tarafını (Beyaz/Rastgele/Siyah) ve bot seviyesini seçebilir. Bu seçimler paneli kapatıp oyunu başlatmaz.
- Yeni `Oyuna Başla` düğmesi paneli kapatır ve seçilen ayarlarla oyunu başlatır.
- Yalnızca `gtest/index.html` ve `gtest/app.js` değişti; cache etiketi `20261022-gtest-bot-setup-v4`.
- Statik kontroller: JavaScript sözdizimi geçti; buton/handler, geciktirilmiş reset ve cache etiketi kontrolleri geçti. Telefon üzerinde test bekliyor.
- Commitler: HTML `643ae968328ec0c2a8c2af84a066620ce5926ca4`; JS `6179b166c31abe4795394b9a24567def7201ce73`.


## Son düzenleme — isteğe bağlı hamle onayı (2026-10-22)
- Yedek dalı: `yedek-2026-10-22-gtest-hamle-onayi-oncesi`.
- Ayarlara `Hamle Onayı İste` seçeneği eklendi; varsayılan kapalı, böylece mevcut oynama davranışı korunuyor.
- Açıkken yasal hedef kare seçildikten sonra hamle uygulanmadan `Onayla / Vazgeç` paneli gösteriliyor.
- Piyon terfisinde de terfi taşı seçildikten sonra onay isteniyor.
- Tercih `localStorage` ile `zato_move_confirmation` anahtarında saklanıyor.
- Yalnızca `gtest/index.html` ve `gtest/app.js` değiştirildi; cache etiketi `20261022-gtest-move-confirm-v5`.
- Statik doğrulama geçti: JavaScript sözdizimi, ayar anahtarı ve kalıcılığı, onay/vazgeç olayları, terfi hamlesinin onay akışına bağlanması, reset temizliği ve HTML kimliklerinin tekilliği kontrol edildi.
- Telefon üzerinde normal hamle, vazgeçme, onaylama ve piyon terfisi senaryoları henüz kullanıcı tarafından test edilmeli.


## Son düzenleme — hamle onayında tahta önizlemesi (2026-10-24)
- Yedek dalı: `yedek-2026-10-24-gtest-hamle-onayi-gorsel-duzenleme-oncesi`.
- Hamle Onayı açıkken yasal hamle, asıl oyun durumuna işlenmeden ayrı bir geçici `Chess` konumunda önizleniyor; taş hedef karesinde görünür.
- Tahta karartan tam ekran modal kaldırıldı. Ekranın altında küçük, yarı saydam `Bu konum uygun mu?` alanı ve `Vazgeç / Onayla` düğmeleri gösteriliyor.
- Onaylama asıl hamleyi uygular; vazgeçme önizlemeyi siler ve taşın ilk karesine döndürür. Beklerken tahta tıklamaları engellenir; asıl oyun sırası/hamle durumu onaylanana kadar değişmez.
- Piyon terfisi seçildikten sonra da seçilen terfi taşı tahtada önizlenir.
- Yalnızca `gtest/app.js` ve `gtest/index.html` değiştirildi; normal oyun dosyalarına dokunulmadı.
- JS sözdizimi kontrolü geçti; gerçek telefon/tıklama senaryoları henüz kullanıcı tarafından doğrulanmalı.
- Güncel JS önbellek etiketi: `20261024-gtest-move-preview-v8`.
- JS commit: `1f5bfbc7bc9f6e237b669d830c7af622dbdec425`; HTML commit: `bc6be53dd771467bfaf0c7e2a071535c574cd99e`.


## Son düzenleme — hamle onayı paneli yukarı alındı (2026-10-24)
- Yedek dalı: `yedek-2026-10-24-gtest-hamle-onayi-panel-konumu-oncesi`.
- GTEST mobilinde hamle onayı paneli `bottom-20` yerine `bottom-36` konumuna alındı; böylece alt oyuncu kartının üstüne yaklaşır. Masaüstü konumu değişmedi.
- Yalnızca `gtest/index.html` ve bu devam notu güncellendi; normal oyun dosyalarına dokunulmadı.
- Telefon üzerinde görsel kontrol kullanıcı tarafından yapılmalı.
- HTML commit: `b1cd387c062692cb2b6a901f2cd32693a0570f92`.


## Son düzenleme — rastgele botlarla hızlı eşleştirme (2026-10-24)
- Yedek dalı: `yedek-2026-10-24-gtest-hizli-eslesme-botlari-oncesi` (main başlangıç SHA: `5f60a157305216fb7dd2e70d72c4f1539bd78649`).
- Yeni `gtest/bots.js` dosyası eklendi: kurgusal insan isimli 30 bot profili ve profil aralığına göre rastgele seçilen Elo seviyesi.
- GTEST Hızlı Eşleştirme seçeneği artık “yakında” bildirimi yerine rastgele bot ve zorluk seçiyor; oyuncu rengi rastgele belirleniyor ve mevcut Stockfish motoru rakip olarak kullanılıyor.
- Oyuncu kartında botun adı ve Elo'su görünür; isim yanında “Bot” ibaresi bulunur. Bu profiller gerçek kullanıcı hesapları değildir.
- Hızlı eşleştirme için `bots.js`, ardından `app.js` yükleniyor. Normal oyun dosyalarına dokunulmadı.
- İlk sürümde bot veritabanı profil adı ve zorluk aralığını yönetir; özel açılış repertuvarı/oyun tarzlarının hamlelere gerçek etkisi sonraki aşamadır.
- Değişiklikler: `gtest/bots.js` commit `70db18df3003cfe1f506f964e5fec3d6f5279426`; `gtest/app.js` commits `6fe8d4c07bcdceacc93448356cad565bc6e18928`, `9d53ec0d13597154479881b0c07022c8747957f2`; `gtest/index.html` commit `c950c1d53e0a91193c296f1531eb5c5ef90b1db7`.
- Henüz telefon üzerinde gerçek oyun testi yapılmadı; bot seçimi, rastgele taraf, ilk hamlede motorun başlaması ve maç sırasında isim/Elo gösterimi test edilmeli.


## Son düzeltme — varyant hamlesinde eski en iyi hamle okunu temizle (2026-10-25)
- Yedek dalı: `yedek-2026-10-25-gtest-varyant-ok-duzeltme-oncesi` (düzeltme öncesi main SHA: `d268ed7f8d8aa7a3de4d245e774c41c8fe5f1119`).
- `gtest/app.js` içinde analiz varyantına yeni hamle eklendiğinde `currentBestMove` sıfırlanıp eski ok temizleniyor.
- Ardından mevcut `requestEngineAnalysis()` akışı yeni konumun FEN'i için analizi başlatıyor; aynı FEN önbellekteyse kayıtlı ok tekrar çiziliyor. FEN önbelleğinin sabit tutma davranışı korunuyor.
- Dosyanın JavaScript sözdizimi kontrolü geçti. Telefon üzerinde varyantlı oyun testi henüz yapılmadı.
- Commit: `e85eb82994f5ffe0c0ae434468781d6559e07b1d`.


## Son düzenleme — hızlı eşleşme botlarına farklı oyun karakterleri (2026-10-25)
- Yedek dalı: `yedek-2026-10-25-gtest-bot-kisilikleri-oncesi`.
- Yalnızca GTEST dosyaları değiştirildi; normal oyun dosyalarına dokunulmadı.
- `gtest/bots.js`: 30 botun her birine kişilik profili eklendi. Profiller temkinli, taktikçi, konumsal, saldırgan, savunmacı, sürprizci ve benzeri farklı tercihler içeriyor; risk toleransı ve aday hamle ağırlıkları bot başına değişiyor.
- `gtest/app.js`: Hızlı eşleşmede Stockfish'ten üç aday hamle isteniyor. Kişilik profili, değerlendirmesi en iyi hamleye yakın adaylar arasından seçim yapmayı etkiliyor. Elo seviyesine göre mevcut Skill Level ve arama derinliği korunuyor. Normal Stockfish modu tek aday hamle kullanıyor; analiz sırasında MultiPV yeniden 1'e ayarlanıyor.
- `gtest/index.html`: yeni JS sürümü için önbellek etiketi `20261025-bot-personalities-v2` yapıldı.
- Bu, gerçek hamle seçiminde kişilik farklılığı için ilk sürümdür; her botun bütünüyle ayrı açılış repertuvarı veya derin bir stratejik modeli olduğu anlamına gelmez. Çoklu aday desteği/performans ve gerçek oyun davranışı telefonda test edilmelidir.
- Commitler: `gtest/bots.js` `5859a1103ef99416f567e3d8c0da49ec07caf950`; `gtest/app.js` `922fc622824b37fd5e8f313a2798a5057807ce6d` ve sağlamlaştırma `3f5fdc06faca37d295db28c7b168fcaf31d6074b` ve analizde MultiPV sıfırlama düzeltmesi `5c37cdee70b26ec3914296868ccc7cb74042557c`; `gtest/index.html` `f1476b7e438e35d8f5f925f632d53045b267890f`.


## Son düzenleme — hızlı eşleşme sanal rakiplerinin kullanıcı adları ve düşünme süresi (2026-10-25)
- Yedek dalı: `yedek-2026-10-25-gtest-insansi-rakip-duzenleme-oncesi`.
- Yalnızca GTEST dosyaları değiştirildi; normal oyun dosyalarına dokunulmadı.
- `gtest/bots.js`: 30 profilin görünen adları uluslararası/çevrimiçi satranç kullanıcı adı tarzında takma adlarla değiştirildi; profil kimlikleri ve Elo aralıkları korundu.
- `gtest/app.js`: hızlı eşleşme oyuncu kartlarında adın yanındaki “· Bot” kaldırıldı. Hızlı eşleşme modu “Sanal Rakip” olarak açıkça adlandırılıyor; sanal rakip etiketi menüde de bulunuyor. Hızlı eşleşme hamlelerine konuma bağlı rastgele düşünme gecikmesi eklendi (yaklaşık 1,1–3,7 sn; şah tehdidi/taş alma olasılığı bulunan pozisyonlarda yaklaşık 2,2–6 sn). Normal Stockfish modu bu gecikmeden etkilenmiyor.
- `gtest/index.html`: hızlı eşleşme açıklaması/etiketi ve JS önbellek sürümü güncellendi.
- Bu gecikme daha doğal bir tempo hissi verir; gerçek insan davranışını garanti etmez. Telefon üzerinde gerçek oyun testi henüz yapılmadı.
- Commitler: `gtest/bots.js` `8fcb84aa6d5573b74a82885293e0d375f8532c46`; `gtest/app.js` `fff9e5868f905d103520a4f79eba7a047c8c41e2`; `gtest/index.html` `3d832517600aac29c558c5d46bfb447401bea506`.


## Son düzenleme — hızlı eşleşmede hamle geri alma kapatıldı (2026-10-25)
- Yedek dalı: `yedek-2026-10-25-gtest-hizli-eslesme-geri-al-oncesi`.
- Yalnızca `gtest/app.js` değiştirildi; normal oyun dosyalarına dokunulmadı.
- Hızlı eşleşme modunda mobil `quickUndoBtn` ve masaüstü `undoBtn` gizleniyor; geri alma olay işleyicisi de bu modda hamleyi geri almıyor.
- Mobil hızlı kontrol satırı 6 sütundan 5 sütuna, masaüstü eylem düğmeleri 2 sütundan 3 sütuna geçiyor; kalan düğmeler eşit genişlikte yerleşiyor. Diğer oyun modlarında eski düğme sayısı ve sütun düzeni korunuyor.
- `gtest/app.js` JavaScript sözdizimi ve kontrol mantığı doğrulanacak; telefon testi henüz yapılmadı.
- Commit: `4d2b0da885f93d993215b0d646ed9daeffe2f3c3`.


## Son düzenleme — Oyna menüsü sadeleştirildi (2026-10-25)
- Yedek dalı: `yedek-2026-10-25-gtest-oyna-menu-yeni-oyun-kaldirma-oncesi`.
- GTEST Oyna menüsünden `Yeni oyun` seçeneği kaldırıldı; bu düğmeye özel, artık kullanılmayan tıklama işleyicisi de `gtest/app.js` içinden temizlendi.
- `Hızlı eşleştirme` seçeneğinin sağındaki `Sanal rakip` etiketi kaldırıldı. Açıklama metni `Rastgele sanal rakiple oyna` olarak korundu.
- Yalnızca `gtest/index.html`, `gtest/app.js` ve bu devam notu güncellendi. Normal oyun dosyalarına dokunulmadı.
- JS önbellek etiketi `20261025-play-menu-cleanup-v1` olarak güncellendi.
- Statik kontrol ve telefon üzerinde görsel test sonucu bu notun sonraki güncellemesinde kaydedilecek.


## Son düzenleme — GTEST güncellemeleri normal oyuna aktarıldı (2026-10-25)
- Önceki durum için yedek dalı oluşturuldu: `yedek-2026-10-25-gtest-normal-oyuna-aktarim-oncesi`.
- Kullanıcının isteğiyle GTEST'in güncel ana dosyaları normal oyuna kopyalandı: `gtest/index.html` → `index.html`, `gtest/app.js` → `app.js`, `gtest/style.css` → `style.css`.
- Hızlı eşleşme profillerini çalıştırmak için `gtest/bots.js` içeriği yeni kök `bots.js` dosyası olarak eklendi. `openings.js` iki yerde aynı olduğundan değiştirilmedi.
- Normal oyunun HTML'sinde CSS, bot ve uygulama JS önbellek sürümleri `20261025-normal-sync-v1` olarak yenilendi.
- Böylece Oyna menüsü sadeleştirmesi, hızlı eşleşme/sanal rakipler, rakip düşünme gecikmesi, hızlı eşleşmede geri almanın kapatılması ve diğer GTEST arayüz/analiz güncellemeleri normal oyuna da taşındı.
- Normal oyun dosyaları aktarım öncesi yedek dalında korunuyor. GitHub değişiklikleri `main` dalına yazıldı; dağıtım/deploy için ayrıca işlem yapılmadı.
- Sonraki adım: kök normal oyun sayfasında mobil Oyna menüsü, normal Stockfish oyunu, hızlı eşleşme, geri alma düğmesi, analiz gezinmesi ve ayarlar test edilmeli.


## Son düzenleme — hızlı eşleşme havuzu 1.000 sanal rakibe çıkarıldı (2026-10-25)
- Önceki main durumu için yedek dalı: `yedek-2026-10-25-bot-1000-profil-oncesi`.
- Hem kök `bots.js` hem de `gtest/bots.js` aynı mantıkla güncellendi.
- Var olan 30 profil korundu; toplamı 1.000'e tamamlamak için 970 benzersiz kullanıcı adı/kimlik profili çalışma anında üretilecek şekilde eklendi. Böylece 1.000 profilin tamamını elle dosyaya yazmak gerekmiyor.
- Yeni profiller Elo aralığı ve kişilik parametreleri (oyun tarzı, risk, tolerans ve aday hamle ağırlıkları) alıyor; ayrı Stockfish motoru açılmıyor.
- Normal ve GTEST HTML dosyalarında bot dosyası önbellek etiketi `20261025-bot-1000-v1` olarak güncellendi.
- Bu profiller sanal rakiptir, gerçek kullanıcı hesabı değildir. Gerçek telefon testi henüz yapılmadı.
- Bot dosyaları commitleri: kök `bots.js` `e0a8645dcacd1e7ab896f164742ac89691b8511e`; `gtest/bots.js` `ff16eba91c10fc020f225c5c8df1163471cb830e`.


## Son düzenleme — 1.000 sanal rakibe kalıcı avatarlar (2026-10-25)
- Yedek dalı: `yedek-2026-10-25-avatar-oncesi`.
- Kök `app.js` ve `gtest/app.js` içinde, hızlı eşleşmede sanal rakibin kimliğinden deterministik SVG avatar üretiliyor. Renk ve desen profil kimliğine göre belirleniyor; aynı bot her maçta aynı avatarı gösteriyor.
- Avatarlar harici resim dosyası veya ağ isteği kullanmıyor. Oyuncu kartı boyutu ve taş rengine bağlı mevcut sınıflar korunuyor; kullanıcı ve yerel iki oyunculu modda eski ♙/♟ simgeleri gösteriliyor.
- Kök ve GTEST HTML dosyalarında JS cache etiketi `20261025-bot-avatars-v1` olarak yenilendi.
- Statik doğrulama ve telefon üzerinde görsel test yapılmalı.

## Son düzenleme — saat yanındaki oyun işlemleri ve hızlı eşleşme koruması (2026-10-25)
- Yedek dalı: `yedek-2026-10-25-oyun-saatleri-hizli-eslesme-oncesi`.
- Yalnızca GTEST güncellendi; normal kök dosyalarına aktarılmadı.
- Her iki oyuncu kartındaki saatlerin soluna beraberlik (`🤝`) ve pes etme (`🏳️`) simgeleri eklendi. Üst/alt oyuncu konumuna göre mevcut `offerDraw` ve `surrenderGame` işlevlerini çağırıyor.
- Hızlı eşleşme açıkken oyun bitmeden hızlı eşleşme menü öğesine tekrar basılırsa yeni bot seçilmiyor ve oyun sıfırlanmıyor; kullanıcıya mevcut maçın bitmesini isteyen uyarı gösteriliyor.
- GTEST CSS/JS önbellek etiketleri `20261025-clock-actions-v1` olarak yenilendi.
- Telefon testi gerekli: simgelerin iki oyuncu kartında görünmesi, beraberlik/terk işlevleri, aktif hızlı eşleşmede rakibin değişmemesi ve oyun bittikten sonra yeni rakip seçilebilmesi.

## Saat yanındaki işlemlerin taraf düzeltmesi (2026-10-25)
- Yalnızca GTEST güncellendi.
- Beraberlik/pes etme kontrolleri oyuncunun kendi kartından rakibin kartına taşındı; düğmeler karşı oyuncu konumunu temsil eden işlemi çağırıyor.
- Bot maçında yalnızca kullanıcının kontrolleri gösteriliyor; kullanıcının kendi kartındaki kontroller gizli.
- GTEST JS/HTML cache etiketi `20261025-clock-actions-v2` olarak yenilendi.


## Hızlı maç sırasında diğer maç başlatma yolları kilitlendi (2026-10-25)
- Yalnızca GTEST güncellendi; normal oyun dosyalarına dokunulmadı.
- Aktif hızlı maç sürerken Stockfish/yerel oyun moduna geçiş, hızlı eşleştirme tekrarı, bot başlatma, tempo açılır menüsü ve hızlı tempo seçenekleri, renk seçimi, yeni oyun düğmeleri engellendi.
- İlgili arayüz düğmeleri kilit durumunda devre dışı ve görsel olarak pasif gösteriliyor; JavaScript tıklama korumaları da eklendi.
- Maç bittiğinde kilit kalkıyor ve yeni maç başlatılabiliyor.
- GTEST uygulama JS önbellek etiketi `20261025-quickmatch-lock-v2` olarak yenilendi.
- Statik kontrol yapıldı; telefon üzerinde uçtan uca test henüz yapılmadı.
