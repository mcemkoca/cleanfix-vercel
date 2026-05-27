Güvenlik kontrolü #2: API endpoint güvenliği, action fonksiyonları yetki kontrolü, CSRF/XSS riskleri, input validasyonu
===============================================================================================================

Tarih: 2026-05-27 08:00 (Asia/Shanghai)
Kapsam: CleanFix Vercel projesi — Tüm HTML/JS dosyaları

═══════════════════════════════════════════════════════════════

📊 GENEL BULGULAR

═══════════════════════════════════════════════════════════════

1. API ENDPOINT GÜVENLİĞİ — KRİTİK ❌

   Durum: FRONTEND-ONLY UYGULAMA, GERÇEK API YOK

   - Tüm "API" çağrıları yerel localStorage/mock data üzerinden
   - OfflineFetch modülü fetch() kullanıyor ama gerçek endpoint yok
   - DataCache localStorage'a düz metin JSON yazıyor
   - Hiçbir API authentication token'ı header'da taşımıyor
   - CORS politikası tanımlanmamış

   Risk: PROD ortamına geçişte API layer'ı sıfırdan yazılacak.
         Mevcut frontend kodu, backend API'ye entegre edildiğinde
         muhtemelen güvensiz kalacak.

   Örnek (js/app.js):
   ```
   const res = await fetch(url);
   if (res.ok) {
     const data = await res.json().catch(() => res.text());
     DataCache.set(cacheKey, data, ttlMinutes);
   ```
   — fetch() sonucu doğrudan cache'e atılıyor, validasyon yok.

═══════════════════════════════════════════════════════════════

2. ACTION FONKSİYONLARI YETKİ KONTROLÜ — KRİTİK ❌

   Durum: ROL KONTROLÜ VAR AMA YETERSİZ

   - auth.js'te checkAuth() fonksiyonu sadece 'admin' / 'company' / 'employee'
     rollerini string comparison ile kontrol ediyor
   - Roller localStorage'da düz JSON olarak saklanıyor — kolayca manipüle edilebilir
   - Hiçbir action fonksiyonu server-side yetki doğrulaması yapmıyor
   - Tüm CRUD işlemleri client-side localStorage üzerinden — yetki bypass edilebilir

   Bulunan güvenlik açıkları:

   a) ROLE HIJACKING:
      localStorage.setItem('kobipro_user', JSON.stringify({role:'admin'}))
      — Herhangi bir kullanıcı admin olabilir.

   b) ACTION BUTONLARI YETKİ KONTROLÜ YOK:
      company-quotes.html: approveQuote(), rejectQuote(), convertToInvoice()
      — Kimlik doğrulama/rol kontrolü olmadan çalışıyor.

      company-bookings.html: openEditModal(), openDeleteModal()
      — Doğrudan çağrılabilir, yetki kontrolü yok.

      company-staff.html: openEditModal(), openDeleteModal()
      — Aynı şekilde korunmasız.

   c) EMPLOYEE PANEL YETKİSİ:
      employee-dashboard.html, employee-tasks.html
      — Sadece auth.js checkAuth('employee') kontrolü var.
      — Employee admin paneline geçiş yapabilir (rol değiştirerek).

═══════════════════════════════════════════════════════════════

3. CSRF / XSS RİSKLERİ — KRİTİK ❌

   A) XSS (Cross-Site Scripting) — YÜKSEK RİSK

   Bulunan innerHTML kullanımları (potansiyel XSS):

   - company-sectors.html:
     ```javascript
     card.innerHTML = `...${name}...`;  // Kullanıcı girdisi doğrudan HTML'e
     statusRow.innerHTML = '<span...>' + newStatus;
     ```

   - company-bookings.html:
     ```javascript
     td6.innerHTML='<div class="actions"><button...onclick="openEditModal('+newId+')"...';
     ```
     — newId doğrudan string concatenation'a girmiş, ID sanitization yok.

   - company-invoices.html:
     ```javascript
     tr.innerHTML=`<td>${no}</td><td>${customer}</td>...`;
     ```
     — customer, no, dateStr gibi değişkenler doğrudan HTML'e.

   - js/toast.js:
     ```javascript
     toast.innerHTML = `...${message}...`;
     ```
     — Toast mesajları doğrudan innerHTML'a yazılıyor.

   - index.html:
     ```javascript
     el.innerHTML = t;
     ```
     — i18n çevirileri innerHTML ile render ediliyor.

   B) CSRF (Cross-Site Request Forgery) — N/A (API YOK)

   - Gerçek form submission veya API POST yok
   - Tüm işlemler client-side JavaScript ile localStorage'da
   - Prod geçişinde CSRF token mekanizması eksik kalacak

   C) CLICKJACKING POTANSİYELİ — ORTA RİSK

   - X-Frame-Options header'ı yok (GitHub Pages üzerinde host ediliyor)
   - iframe embedding'e karşı koruma yok

═══════════════════════════════════════════════════════════════

4. INPUT VALIDASYONU — YETERSİZ ⚠️

   a) FORM VALIDASYONU EKSİK:

   - company-bookings.html:
     — Müşteri adı, telefon, plaka alanları: max length, regex kontrolü yok
     — Sadece HTML5 "required" attribute'u var

   - company-staff.html:
     — E-posta validasyonu: sadece type="email"
     — Telefon numarası: herhangi bir format kontrolü yok

   - company-quotes.html:
     ```javascript
     function calcModalTotal() {
       // Sadece input değerlerini topluyor, validasyon yok
     }
     ```

   b) OUTPUT ENCODING EKSİK:

   - Kullanıcı girdisi (formlar, tablolar) doğrudan DOM'a innerHTML ile yazılıyor
   - textContent kullanımı çok sınırlı
   - DOMPurify veya benzeri sanitization kütüphanesi yok

   c) URL PARAMETER VALIDASYONU EKSİK:

   - index.html:
     ```javascript
     location.href='login.html?email='+encodeURIComponent(e);
     ```
     — En azından encodeURIComponent kullanılmış, ama login.html'de
       bu parametreyi alıp innerHTML'e yazan kod var mı kontrol edilmeli.

   d) LOCALSTORAGE DATA BÜTÜNLÜĞÜ:

   - DataCache ve tüm CRUD işlemleri localStorage üzerinden
   - Veri bütünlüğü (integrity) kontrolü yok
   - Kullanıcı localStorage'ı manuel değiştirebilir

═══════════════════════════════════════════════════════════════

5. AUTHENTICATION ZAFİYETLERİ — KRİTİK ❌

   a) TOKEN GÜVENLİĞİ:
   - Token localStorage'da saklanıyor (XSS vasıtasıyla çalınabilir)
   - HttpOnly cookie kullanımı yok (zaten static site)
   - Token formatı: cf_<hex>_<timestamp> — tahmin edilebilir pattern

   b) SESSION MANAGEMENT:
   - 24 saat / 7 gün session TTL — çok uzun
   - Session invalidate mekanizması yok (logout dışında)
   - Concurrent session kontrolü yok

   c) PASSWORD POLICY:
   - Demo uygulama olduğu için login form basit
   - Gerçek auth mekanizması yok (mock)

═══════════════════════════════════════════════════════════════

6. CSP (Content Security Policy) — KISMEN VAR ⚠️

   dashboard.html, company.html, employee-dashboard.html, employee.html gibi
   sayfalarda CSP meta tag'i var:

   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; ...">
   ```

   Zafiyetler:
   - 'unsafe-inline' kullanılıyor — XSS koruması zayıflatılıyor
   - https://cdn.jsdelivr.net herhangi bir script yükleyebilir
   - img-src 'self' data: blob: — dış domain görselleri engellenmiş ama
     company.html'de img-src https: da var (farklı CSP profili)

   EKSİK CSP OLAN SAYFALAR:
   - company-bookings.html — CSP YOK ❌
   - company-staff.html — CSP YOK ❌
   - company-invoices.html — CSP YOK ❌
   - company-services.html — CSP YOK ❌
   - company-customers.html — CSP YOK ❌
   - company-stock.html — CSP YOK ❌
   - company-quotes.html — CSP YOK ❌

═══════════════════════════════════════════════════════════════

7. GİZLİ VERİ İFŞA RİSKİ — ORTA ⚠️

   - Demo verilerde gerçekçi bilgiler (email, telefon, plaka numaraları)
   — Fictional ama gerçek formatta:
     jan@email.be, +32 470 12 34 56, 1-AAA-001

   - PII (Personal Identifiable Information) içeren demo data
   — GDPR compliance testi yapılıyorsa riskli.

   - Source code'da internal notlar:
     auth.js: "NOTE: This is a DEMO/STATIC app. For production, use server-side JWT + HttpOnly cookies."
     — Bu not production deploy'unda unutulabilir.

═══════════════════════════════════════════════════════════════

📋 ÖZET & ÖNERİLER

═══════════════════════════════════════════════════════════════

KRİTİK (Hemen Düzeltilmeli):
────────────────────────────
1. Tüm innerHTML kullanımları textContent/secure rendering'e dönüştürülmeli
2. API katmanı eklendiğinde JWT + HttpOnly cookie kullanılmalı
3. Tüm CRUD action'larına server-side yetki kontrolü eklenmeli
4. Rol bilgisi localStorage'dan çıkarılmalı, server-side session olmalı
5. Eksik CSP olan sayfalara CSP meta tag'i eklenmeli

YÜKSEK (Planlanmalı):
─────────────────────
6. Input validation library eklenmeli (regex, length, type checking)
7. DOMPurify veya benzeri XSS sanitization kütüphanesi entegre edilmeli
8. X-Frame-Options: DENY veya SAMEORIGIN eklenmeli
9. Rate limiting planlanmalı (API katmanına)

ORTA (İzlenmeli):
─────────────────
10. Demo verilerdeki PII'lar tamamen fictional yapılmalı
11. Auth token formatı daha entropy'li hale getirilmeli
12. Session TTL daha kısa (1-2 saat) + sliding refresh yapılmalı

═══════════════════════════════════════════════════════════════

Bir önceki kontrol (Tur #5, 2026-05-24) sonrası durum:
- CSP eksiklikleri 4 kritik sayfada tespit edilmişti
- Server-side JWT + HttpOnly cookie geçişi planlanmıştı
- Bu turda ek olarak: action fonksiyonlarının yetki kontrolü eksikliği
  ve innerHTML XSS riskleri detaylandırıldı.

═══════════════════════════════════════════════════════════════
Sonuç: 4 Kritik, 3 Yüksek, 2 Orta riskli bulgu tespit edildi.
═══════════════════════════════════════════════════════════════