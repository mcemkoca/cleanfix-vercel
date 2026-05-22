# CleanFix Güvenlik Kontrolü Raporu — 22 Mayıs 2026, 07:00 CST

**Proje:** cleanfix-vercel (Vercel Static Deployment)
**Kapsam:** Auth sistemi, rol kontrolleri, admin panel erişimi, login/signup test, vulnerability scan
**Toplam dosya:** 120+ HTML, 5 JS modül

---

## 🚨 KRİTİK (P0) — Derhal Düzeltilmeli

### 1. Sektör Sayfaları (sectors/*) — Tamamen Açık, Kimlik Doğrulama Yok
- **40+ sektör sayfasında** (barberpro, buildpro, cleaning, construction, elektropro, marketpro, restopro, woodpro) **ne CSP ne de auth kontrolü** bulunuyor.
- Sonuç: Herhangi biri doğrudan URL ile `sectors/barberpro/dashboard.html` veya `sectors/buildpro/buildpro-projects.html` açabilir — giriş gerektirmeden.
- **Etki:** Tüm firma verileri, randevular, müşteri listeleri, stok bilgileri herkese açık.
- **Düzeltme:** Her sektör HTML dosyasına `<script src="../../js/auth.js"></script>` + `<script>checkAuth(['company','admin']);</script>` eklenmeli.

### 2. Tüm company-*.html Sayfalarında Rol Kontrolü Eksik
- `company-bookings.html`, `company-customers.html`, `company-staff.html`, vb. dosyalarda `checkAuth()` çağrılıyor ama **herhangi bir rol parametresi verilmiyor**.
- `checkAuth()` default olarak sadece token varlığını kontrol ediyor; `employee` rolündeki bir kullanıcı da admin sayfalarına erişebilir.
- **Etki:** Alt seviye çalışanlar admin/firma yetkilerine sahip sayfalara girebilir.
- **Düzeltme:** Her sayfa `checkAuth('company')` veya `checkAuth(['company','admin'])` olarak çağrılmalı.

### 3. Token localStorage'da Saklanıyor — XSS Riski
- `kobipro_auth_token` ve `kobipro_user` **localStorage**'da tutuluyor.
- Herhangi bir XSS payload `localStorage.getItem('kobipro_auth_token')` ile token'ı çalabilir.
- **Not:** Bu bir static HTML demo uygulaması; production'da HttpOnly cookie kullanılması şart.

---

## ⚠️ YÜKSEK (P1)

### 4. CSP 'unsafe-inline' — Çok Gevşek
- Tüm sayfalarda `script-src 'self' 'unsafe-inline'` mevcut.
- Bu, CSP'nin XSS'e karşı koruma etkinliğini büyük ölçüde azaltıyor.
- `style-src 'self' 'unsafe-inline'` da mevcut.
- **Düzeltme:** Production'da nonce veya hash tabanlı CSP'ye geçilmeli.

### 5. X-Frame-Options / Clickjacking Korunması Yok
- **Hiçbir sayfada** `X-Frame-Options: DENY` veya `X-Frame-Options: SAMEORIGIN` bulunmuyor.
- Clickjacking saldırısı potansiyel olarak uygulanabilir.
- **Düzeltme:** Vercel `vercel.json` headers konfigürasyonuna eklenmeli.

### 6. innerHTML Kullanımı — ~200+ Yer
- Tüm HTML dosyalarda toplam **~203 adet** `innerHTML` kullanımı tespit edildi.
- Bazı yerlerde kullanıcı girdisi doğrudan innerHTML'e enjekte ediliyor (örn. arama sonuçları, tablo hücreleri, modal içerikleri).
- **Risk:** Kullanıcı adı, şirket adı, e-posta gibi alanlarda `<script>` enjeksiyonu mümkün (CSP 'unsafe-inline' ile birleşince etkili).
- **Düzeltme:** `textContent` veya `innerText` kullanılmalı; template literal içindeki değişkenler DOMPurify ile sanitize edilmeli.

---

## ⚡ ORTA (P2)

### 7. Şifre Doğrulama Sadece Client-Side
- Login formunda `password.length < 6` kontrolü var ama gerçek bir backend doğrulaması yok.
- Demo amaçlı hardcoded `admin@cleanfix.com / admin123` bilgisi sayfada görünür durumda.
- **Etki:** Üretim ortamına taşındığında bu tamamen güvensiz olur.

### 8. Strict-Transport-Security (HSTS) Yok
- `Strict-Transport-Security` header'ı hiçbir sayfada yok.
- Vercel'de HTTPS zorunlu olsa da, ekstra koruma sağlamaz.

### 9. Referrer-Policy Eksik
- `Referrer-Policy` meta tag veya header yok.
- Harici linklere tıklandığında tam URL referrer olarak gönderilebilir.

### 10. Open Redirect — Kısmen Korunmuş Ama Sınırlı
- Login sonrası redirect whitelist mevcut (`ALLOWED_REDIRECTS`) ama sadece 2 harici domain listeleniyor.
- Genel `window.location.href = redirectTarget` kullanımı potansiyel open redirect riski taşıyor.
- **Düzeltme:** Tüm redirect parametreleri strict path validation'dan geçirilmeli.

---

## ✅ GÜVENLİ BULGULAR (Pozitif)

### A. Token Format Doğrulanıyor
- `auth.js` içinde token `cf_` prefix'i ve timestamp kontrolü yapılıyor.
- Eski `demo_` token'ları otomatik reddedilip logout yapılıyor.
- 24 saatlik TTL (time-to-live) kontrolü mevcut.

### B. Whitelist Redirect
- `ALLOWED_REDIRECTS` objesi ile sadece tanımlı modüllere yönlendirme yapılıyor.
- Rastgele URL'lere redirect engellenmiş.

### C. Form Validation Temel Seviyede
- E-posta regex validasyonu mevcut.
- Telefon numarası minimum 7 hane kontrolü var.
- Boş alan kontrolü var.

### D. CSP En Azından Var
- Tüm ana sayfalarda CSP meta tag mevcut (sektör sayfaları hariç).
- `connect-src 'self'` ile harici API çağrıları sınırlandırılmış.

---

## 📊 Özet Tablo

| Kontrol | Durum | Önem |
|---------|-------|------|
| Auth sistemi var | ✅ Var | — |
| Token üretimi (crypto) | ✅ Güvenli | — |
| Session TTL (24h) | ✅ Var | — |
| Role kontrolü (company-*.html) | ❌ Yok | P0 |
| Role kontrolü (sectors/*) | ❌ Yok | P0 |
| CSP var | ✅ Var | — |
| CSP 'unsafe-inline' | ⚠️ Gevşek | P1 |
| X-Frame-Options | ❌ Yok | P1 |
| HSTS | ❌ Yok | P2 |
| Referrer-Policy | ❌ Yok | P2 |
| innerHTML kullanımı | ⚠️ ~203 adet | P1 |
| Token localStorage | ⚠️ XSS riski | P0 (prod) |
| Backend doğrulama | ❌ Yok | P2 |
| Clickjacking koruma | ❌ Yok | P1 |
| Form validation | ✅ Temel | — |

---

## 🔧 Önerilen Öncelikli Eylemler

1. **Hemen:** Sektör dosyalarına auth.js + checkAuth() ekleyin (40+ dosya)
2. **Hemen:** company-*.html'de `checkAuth()` → `checkAuth('company')` yapın
3. **Bugün:** Vercel `vercel.json` headers konfigürasyonu:
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "X-Content-Type-Options", "value": "nosniff" },
           { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
           { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" }
         ]
       }
     ]
   }
   ```
4. **Bu hafta:** innerHTML kullanımlarını `textContent`/`createElement` ile değiştirin
5. **Planlı:** Backend auth (JWT + HttpOnly cookie) geçiş planı oluşturun

---

*Rapor otomatik güvenlik taraması ile üretilmiştir.*
*cleanfix-vercel static HTML demo uygulaması — production geçişinde tüm P0/P1 maddeleri çözülmeli.*
