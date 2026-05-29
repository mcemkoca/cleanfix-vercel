# CleanFix Güvenlik Kontrolü #2 — 28 Mayıs 2026, 08:00 CST

## Özet

**Proje:** CleanFix SaaS (112 HTML, 22 CSS, 22 JS dosya | ~20 MB)  
**Kapsam:** API endpoint güvenliği, action fonksiyonları yetki kontrolü, CSRF/XSS riskleri, input validasyonu  
**Risk Seviyesi:** 🟡 ORTA (client-side uygulama için beklenen riskler, birkaç iyileştirilebilir nokta)

---

## 1. API Endpoint Güvenliği

### Bulgu: Gerçek API Yok (Beklenen Davranış)
CleanFix şu an tamamen **statik client-side** bir demo uygulaması. Hiçbir form `action` attribute'u ile gerçek bir endpoint'e veri göndermiyor. Tüm CRUD işlemler `localStorage` üzerinde simüle ediliyor.

**Analiz:**
- `company-bookings.html`, `company-customers.html`, `company-quotes.html` — formların hiçbirinde `<form action="...">` yok
- Tüm submit handler'lar `event.preventDefault()` ile intercept ediliyor
- Veri `localStorage`'a yazılıp okunuyor

**Risk:** ⚪ DÜŞÜK (Backend API olmadığı için API saldırı vektörü yok)

**Öneri:** Production'a geçişte:
1. Tüm formlar server-side API endpoint'lerine yönlendirilecek
2. HTTPS zorunlu olacak
3. Rate limiting uygulanacak
4. API key / JWT token header'da taşınacak

---

## 2. Action Fonksiyonları Yetki Kontrolü

### Bulgu #1: Auth Kontrol Kapsamı — TAMAM ✅
Tüm korumalı sayfalarda `checkAuth()` çağrısı mevcut:

| Rol | Sayfalar | checkAuth() |
|-----|----------|-------------|
| admin | dashboard.html, customers.html, bookings.html | ✅ checkAuth('admin') |
| admin+company | company*.html (19 sayfa) | ✅ checkAuth(['admin','company']) |
| employee | employee.html, employee-dashboard.html, employee-tasks.html | ✅ checkAuth('employee') |
| customer | customer-portal.html | ✅ checkAuth('customer') |

### Bulgu #2: Deferred Auth Pattern — DÜŞÜK RİSK 🟢
`employee.html` ve `employee-tasks.html` deferred auth loading kullanıyor:
```js
if (typeof AUTH !== 'undefined') { AUTH.checkAuth('employee'); }
else { /* dinamik script yükle */ }
```
**Risk:** Sayfa body birkaç milisaniye görünebilir (FOUC + yetkisiz içerik sızdırma).  
**Öneri:** `<body>`'ye `style="display:none;"` koyup auth success sonrası `display:block` yapın.

### Bulgu #3: Auth Bypass Hâlâ Mümkün — ORTA RİSK 🟡
```js
// Browser console'da çalıştırılabilir:
localStorage.setItem('kobipro_user', JSON.stringify({name:'Hacker',email:'x@x.com',role:'admin'}));
localStorage.setItem('kobipro_auth_token', 'cf_0000000000000000_' + Date.now());
```
Bu, Tur #1'de tespit edilen bypass hâlâ geçerli. Client-side localStorage tabanlı auth bunu engelleyemez.

**Çözüm:** Server-side JWT + HttpOnly cookie geçişi (zaten roadmap'te)

---

## 3. CSRF / XSS Riskleri

### Bulgu #1: CSP Tüm Sayfalarda Aktif — İYİ ✅
```
meta http-equiv="Content-Security-Policy" content="default-src 'self'; ..."
```
Tüm 112 HTML dosya CSP header içeriyor. `script-src 'self' 'unsafe-inline'` var ama bu inline script zorunluluğundan.

### Bulgu #2: XSS via innerHTML — ÇOK SAYIDA 🟡
Tüm projede **~150+** `innerHTML` kullanımı var. Bazıları **escapeHtml()** ile korunmuş, bazıları değil.

**Güvenli kullanım örneği:**
```js
// company-customers.html — escapeHtml kullanılmış ✅
row.cells[0].innerHTML = `<div>${escapeHtml(firstName)} ${escapeHtml(lastName)}</div>`;
```

**Güvensiz kullanım örneği:**
```js
// company-quotes.html — escapeHtml YOK ❌
function approveQuote(id) {
  actions.innerHTML = '<button onclick="toggleExpand('+id+')">...';
}
```

**Riskli innerHTML lokasyonları:**
| Dosya | Satır | Risk |
|-------|-------|------|
| company-bookings.html:832 | td6.innerHTML = '...openEditModal('+newId+')...' | XSS (newId manipülasyonu) |
| company-quotes.html:942 | div.innerHTML = '<input...>' | DOM injection |
| company-reviews.html:641 | replyBox.innerHTML = '<strong>...' | XSS (text parametresi escape edilmiş ✅) |
| company-calendar.html:312 | col.innerHTML = `${dayName}...` | Düşük risk (statik data) |

**Eksik escapeHtml kullanan dosyalar:**
- `company-bookings.html` (8 lokasyon)
- `company-calendar.html` (6 lokasyon) 
- `company-quotes.html` (3 lokasyon)
- `company-invoices.html` (2 lokasyon)
- `company-analytics.html` (1 lokasyon)

### Bulgu #3: Open Redirect Koruması — İYİ ✅
`login.html`'de redirect parametresi **whitelist** ile kontrol ediliyor:
```js
const ALLOWED_REDIRECTS = {
  'buildpro': 'https://mcemkoca.github.io/buildpro-vercel/dashboard.html',
  'barberpro': 'https://mcemkoca.github.io/barberpro-vercel/dashboard.html'
};
```
Bu, `login.html?redirect=https://evil.com` saldırısını engelliyor.

### Bulgu #4: URL Hash Manipülasyonu — DÜŞÜK RİSK 🟢
`dashboard.html:2528` — `location.hash` doğrudan section ID olarak kullanılıyor:
```js
showSection(location.hash);
```
Bu XSS riski taşımıyor (hash DOM ID olarak kullanılıyor, innerHTML'a gitmiyor).

---

## 4. Input Validasyonu

### Bulgu #1: validation.js Modülü — İYİ ✅
`js/validation.js` kapsamlı bir validasyon kütüphanesi sunuyor:
- `validateEmail()` — regex kontrolü
- `validatePhone()` — en az 7 hane
- `validateRequired()` — zorunlu alan kontrolü
- `validateDateRange()` — tarih mantığı kontrolü
- `escapeHtml()` — string sanitizasyonu

### Bulgu #2: Form Auto-Validation — İYİ ✅
`attachFormValidation()` fonksiyonu otomatik inline validasyon sağlıyor:
- `required` attribute'lu alanları kontrol ediyor
- Email tipini validasyon yapıyor
- Telefon numarası minimum uzunluğu kontrol ediyor
- Hata mesajları çok dilli (TR/EN/NL)

### Bulgu #3: Number Input Validasyonu — EKSİK 🟡
```js
// company-quotes.html — fiyat alanı
<input type="number" value="0" step="0.01">
```
`parseFloat()` kullanılıyor ama NaN kontrolü eksik bazı yerlerde.

### Bulgu #4: HTML Injection via Textarea 🟡
Müşteri notları, açıklama alanları gibi metin alanlarında HTML tag enjeksiyonu riski var. `escapeHtml()` bu alanlara yazarken uygulanmalı.

---

## Güvenlik Önerileri (Öncelik Sırası)

### 🔴 KRİTİK (Tur #3'te yapılacak)
1. **Server-side auth geçişi** — Client-side localStorage auth'u kaldır
2. **HttpOnly cookie + server JWT** implementasyonu planla

### 🟡 ORTA (Bu hafta)
3. **Tüm innerHTML kullanımlarını audit et** — `escapeHtml()` ile sar
   - `company-bookings.html:832`
   - `company-quotes.html:936-937`
   - `company-calendar.html` tüm innerHTML lokasyonları
4. **employee.html deferred auth** — Body `display:none` ile FOUC engelle

### 🟢 DÜŞÜK (Sprint içinde)
5. **Content-Security-Policy** `'unsafe-inline'` kaldır (hash/nonce ile değiştir)
6. **Subresource Integrity (SRI)** — CDN script'lerine `integrity` attribute ekle
7. **X-Content-Type-Options: nosniff** header ekle (Vercel config)
8. **X-Frame-Options: DENY** header ekle (clickjacking önlemi)

---

## Sonuç

CleanFix'in güvenlik durumu **client-side statik bir demo** için kabul edilebilir seviyede. CSP var, auth kontrolleri var, redirect whitelist var. Ancak:

- **innerHTML kullanımı çok fazla** ve tutarsız escapeHtml uygulaması var
- **Client-side auth bypass** edilebilir (bilinen sınırlama)
- **CSRF koruması yok** (backend olmadığı için beklenen)

Server-side geçiş yapıldığında tüm bu riskler otomatik olarak düşecek.

**Sonraki Adım:** Tur #3'te server-side auth mimarisi planlaması.

---
*Rapor: security-check-2026-05-28-tur2.md*
