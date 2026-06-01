# CleanFix Güvenlik Kontrolü #2 — 2026-06-01 08:00
Kapsam: API endpoint güvenliği, action fonksiyonları yetki kontrolü, CSRF/XSS riskleri, input validasyonu

## 🔴 KRİTİK (Acil Eylem Gerekli)

### K1. Backend API Yok — Tüm Auth & Data Client-Side
CleanFix tamamen statik HTML/CSS/alahya. Gerçek bir backend/API endpoint’i bulunmuyor. Tüm oturum yönetimi (token, rol, kullanıcı verisi) `localStorage` üzerinden client-side yapılıyor. Satılabilir ürün kalitesi hedefleniyorsa bu temel bir güvenlik eksikliğidir.
- `kobipro_auth_token` → localStorage
- `kobipro_user` (role, name, email) → localStorage, kolayca editlenebilir JSON
- Sonuç: Herhangi bir kullanıcı DevTools → Application → localStorage’dan `role: "admin"` yazarak yetki atlayabilir.

### K2. 17 Company Sayfasında Sayfa-Giriş Auth Guard Yok
`audit-structural.md` (2026-05-18) tarihinde raporlanan bu sorun hâlâ açık. `company-*.html` dosyalarının hiçbirinde `<head>` içinde otomatik auth redirect yok. Dogrudan URL ile erişilebilirler.
- Etkilenen: `company-bookings.html`, `company-customers.html`, `company-stock.html`, `company-services.html`, `company-invoices.html`, `company-maintenance.html`, `company-equipment.html`, `company-quotes.html`, `company-sectors.html`, `company-staff.html`, `company-tools.html`, `company-quality.html`, `company-reviews.html`, `company-expenses.html`, `company-calendar.html`, `company-analytics.html`, `company-profile.html`
- Çözüm: Tüm bu sayfalara `<script> if (!AUTH.isValid()) location.replace('login.html'); </script>` eklenmeli.

### K3. Client-Side Role Manipulation
`AUTH.requireRoleForAction()` ve `AUTH.checkAuth()` localStorage’daki `kobipro_user.role` değerini okuyor. `crud_guard.py` bu fonksiyonları CRUD action’lara inject etmiş (10 dosyada) ancak bu korumalar yine de client-side. Kullanıcı `localStorage`’ı düzenleyerek atlatılabilir.
- Etkilenen CRUD action’ları: `saveEdit`, `addBooking`, `addCustomer`, `saveEquip`, `addInvoice`, `saveNewTask`, `saveQuote`, `addSector`, `addService`, `addStaff`, `addProduct`
- `company-calendar.html`’de `addEvent` action’ında `requireRoleForAction` var ama string olarak `'addEvent'` gönderilmiş, rol array yerine tek string — bu çalışıyor mu kontrol edilmeli (`AUTH.requireRoleForAction` array bekliyor).

### K4. XSS — innerHTML Kullanımı + Zayıf CSP
- CSP var ama `script-src 'self' 'unsafe-inline'` ve `style-src 'self' 'unsafe-inline'` içeriyor. Inline `onclick=...` handler’lar ve inline `<script>` blokları engellenmiyor.
- `company-bookings.html` (satır ~836): `card.innerHTML = \`...\`` — escapeHtml kullanılmamış, doğrudan string interpolasyonu.
- `company-calendar.html` (satır ~280): `col.innerHTML = \`...\`` — escapeHtml yok.
- `company-analytics.html` (satır ~281): `div.innerHTML = \`...\`` — escapeHtml yok.
- `company-customers.html`, `company-invoices.html`, `company-stock.html` escapeHtml kullanıyor ancak `escapeHtml` tanımı `js/toast.js` veya `js/validation.js`’de var; bu dosyalar sayfa altında yüklendiği için, erken çalışan script’lerde undefined hatası riski var.
- Login.html i18n switcher: `t.includes('<') ? el.innerHTML = t : el.textContent = t` — bu kontrol yetersiz (`<img src=x onerror=...>` atlatır).

## 🟡 UYARI

### U1. Form Validasyonu Sadece JavaScript
- Login form `novalidate` attribute taşıyor. Tüm modal formlarda HTML5 `required`, `type="email"`, `pattern`, `minlength` eksik.
- `validateEmail` ve `validatePhone` fonksiyonları yalnızca login.html ve global validator’da var. Diğer sayfalarda modal formların submit handler’ları bu kontrolleri yapmayabilir.
- Sonuç: JS devre dışı bırakıldığında veya manipüle edildiğinde form kısıtlamaları aşılabilir (yine de backend olmadığı için veri sadece local’a gider).

### U2. CRUD Guard Eksik Sayfalar
`crud_guard.py` 10 dosyada guard uygulamış. Eksik kalanlar:
- `company-quality.html`
- `company-reviews.html`
- `company-tools.html`
- `company-expenses.html`
- `company-calendar.html` (addEvent guard var ama argüman hatası şüphesi)
- `company-profile.html`

### U3. `demo_` Token Redundant Check
`AUTH.isValid()` `demo_` prefix’li token’ları reddedip logout yapıyor. Ancak `AUTH.setSession()` yeni token üretiyor (`cf_` prefix’li). Demo token’ların üretim ortamında kullanılma riski düşük ama kodda kalmış.

## 🟢 OLUMLU

### G1. Open Redirect Koruması
`login.html` redirect parametresi için `ALLOWED_REDIRECTS` whitelist kullanılıyor:
- `buildpro` → `https://mcemkoca.github.io/buildpro-vercel/dashboard.html`
- `barberpro` → `https://mcemkoca.github.io/barberpro-vercel/dashboard.html`
- Bilinmeyen redirect parametreleri ignore ediliyor. İyi uygulama.

### G2. Employee.html PII Temizliği
Bordro/maaş verileri artık API placeholder’ları (`[BRÜT MAAŞ — API]`) ile değiştirilmiş. Hardcoded IBAN veya maaş verisi kalmamış görünüyor. "DEMO VERİSİ" banner aktif.

### G3. CSP Header Mevcut
Tüm sayfalarda `<meta http-equiv="Content-Security-Policy">` var. `frame-ancestors 'self'` clickjacking’e karşı kısmi koruma sağlıyor. `connect-src 'self'` harici fetch’leri kısıtlıyor.

## 📋 ÖNERİLEN EYLEM PLANI

### Hemen (P0)
1. Tüm `company-*.html` sayfalarına `<head>` içinde auth guard ekle:
   ```html
   <script src="js/auth.js"></script>
   <script>if(!AUTH||!AUTH.isValid())location.replace('login.html');</script>
   ```
2. XSS riskini azalt: `innerHTML` kullanan yerleri `textContent` veya `escapeHtml` ile sar. Özellikle `company-bookings.html`, `company-calendar.html`, `company-analytics.html`.
3. Login.html i18n switcher’ındaki `innerHTML` fallback’i kaldır; her zaman `textContent` kullan.

### Kısa Vade (P1)
4. `crud_guard.py` kapsamını tüm company sayfalarına genişlet.
5. Modal formlara HTML5 validasyon attribute’ları ekle: `required`, `type="email"`, `minlength="7"`, `pattern`.
6. `escapeHtml` tanımını `js/auth.js`’in üstüne al veya tüm sayfalarda `js/app.js` ilk script olarak yükle.

### Orta Vade (P2)
7. **Server-side JWT + HttpOnly cookie geçişi** planlanıyordu (geçmiş raporlarda). Bu en kritik adım. Vercel deploy’u için bir backend (Vercel Serverless/Edge Functions veya ayrı bir API) entegre edilmeli.
8. `unsafe-inline` CSP direktifini kaldırmak için tüm inline `onclick` handler’ları event listener’a çevir.

## KONTROL #1 vs #2 KARŞILAŞTIRMA
- PII temizliği (employee bordro) ✅ Çözüldü
- CRUD action yetki kontrolü 🟡 Kısmen çözüldü (10/17 dosya)
- Sayfa-giriş auth guard 🔴 Hâlâ açık (0/17 dosya)
- XSS/innerHTML 🔴 Hâlâ açık
- CSP `unsafe-inline` 🔴 Hâlâ açık
- Backend/API güvenliği 🔴 Henüz başlanmadı

Sonraki Kontrol (#3): CSP `unsafe-inline` kaldırma + inline event handler refactor + HTML5 form validasyonu.
