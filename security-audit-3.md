# CleanFix SaaS — Güvenlik Denetimi #3 (Son Tur)

> **Tarih:** 2026-05-31  
> **Denetçi:** Security Subagent  
> **Kapsam:** Customer portal + Employee portal izolasyonu, PII sızıntısı, Cookie güvenliği, Client-side auth bypass, CSP, Genel güvenlik durumu

---

## 📊 Özet Tablo — Sayfa Bazlı Güvenlik Durumu

| Sayfa | Portal | Auth Kontrolü | CSP | PII Leak | Durum |
|-------|--------|---------------|-----|-----------|-------|
| `index.html` | Public | — (public) | ✅ | — | 🟢 |
| `login.html` | Public | — (public) | ✅ | — | 🟢 |
| `dashboard.html` | Admin | `checkAuth(['admin'])` | ✅ | Yok | 🟢 |
| `company.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `company-bookings.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `company-customers.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `company-services.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `company-stock.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `company-sectors.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `company-equipment.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `company-maintenance.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `company-staff.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `company-quotes.html` | Employee | `checkAuth(['admin','company'])` | ✅ | Yok | 🟢 |
| `customer-portal.html` | Customer | `checkAuth(['customer'])` | ✅ | Yok | 🟢 |
| `employee.html` | Employee | `checkAuth(['employee'])` | ✅ | Yok | 🟢 |

**Portal İzolasyonu:** ✅ Tüm sayfalarda doğru `checkAuth()` çağrısı var. Customer portal `['customer']`, Employee portal `['admin','company']` veya `['employee']`, Dashboard `['admin']` olarak ayrılmış.

---

## 🔴 Kritik Sorunlar

### 1. Client-Side Auth Bypass — `localStorage` Manipülasyonu (KRİTİK)

**Durum:** 🔴 **Çözülmedi**

`js/auth.js` modülü tüm auth verisini `localStorage`'da saklıyor:

```javascript
const AUTH = {
  TOKEN_KEY: 'kobipro_auth_token',
  USER_KEY: 'kobipro_user',
  // ...
  setSession(role = 'admin', name = 'Jan Wouters', email = 'jan@cleanfix.be') {
    const token = this.generateSecureToken();
    const user = { name, email, role, createdAt: Date.now() };
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
}
```

**Tehdit:** Kullanıcı tarayıcı DevTools → Application → LocalStorage'dan `kobipro_user` JSON objesini düzenleyerek `role: 'admin'` yapabilir. `checkAuth()` sadece token formatı ve TTL kontrolü yapar, token'ın rolle eşleştiğini doğrulamaz.

**Neden önemli:**
- `checkAuth(['admin'])` çağrıldığında token geçerli mi diye bakar → token `cf_` prefixli ve zaman aşımına uğramamışsa geçerli kabul edilir
- `user.role` localStorage'dan okunur ve manipule edilebilir
- Bu sayede customer → admin, employee → company escalation mümkün

**Düzeltme:**
```javascript
// Server-side JWT + HttpOnly cookie zorunlu
// Veya en azından token'da role claim'i olsun ve token signature'i kontrol edilsin
// (static app olduğu için production backend'e geçiş gerekiyor)
```

---

### 2. Cookie Güvenliği — HttpOnly, Secure, SameSite Yok (KRİTİK)

**Durum:** 🔴 **Çözülmedi**

Proje tamamen `localStorage` tabanlı auth kullanıyor. Cookie hiç kullanılmıyor:

| Attribute | Durum |
|-----------|-------|
| `HttpOnly` | ❌ Yok (cookie kullanılmıyor) |
| `Secure` | ❌ Yok (cookie kullanılmıyor) |
| `SameSite` | ❌ Yok (cookie kullanılmıyor) |

**Tehdit:**
- XSS saldırısı durumunda `localStorage`'a erişim mümkün (cookie'de olsa HttpOnly korur)
- MITM ağında token çalınabilir (Secure flag yok)
- CSRF riski (SameSite yok)

**Düzeltme:**
Production backend'e geçişte:
```http
Set-Cookie: kobipro_session=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/
```

---

## 🟡 Orta Önemli Sorunlar

### 3. Demo Veri içinde Gerçek Formatlı E-Posta / Telefon (YAPISAL)

**Durum:** 🟡 **Bekleniyor**

`company-staff.html`'de client-side demoData objesi var:

```javascript
const demoData = {
  1: { firstName:'Ahmet', lastName:'Kaya', email:'ahmet@cleanfix.demo', phone:'+32 470 10 00 01', ... },
  2: { firstName:'Merve', lastName:'Demir', email:'merve@cleanfix.demo', phone:'+32 470 10 00 02', ... },
  // ...
};
```

**Açıklama:** Bu veri demo/placeholder niteliğinde ama gerçekçi formatlı e-posta ve telefon numaraları içeriyor. Üretim ortamında bu veri API'den çekilmeli. Maaş, IBAN, bordro verisi bulunmuyor — bu iyi.

**Düzeltme:** Üretim geçişinde `demoData` tamamen kaldırılmalı, tüm veri API'den gelmeli.

---

### 4. API Endpoint'lerinde Yetkilendirme Kontrolü (YAPISAL)

**Durum:** 🟡 **Backend'e bağımlı**

Tüm sayfalarda client-side `checkAuth()` var ama bu manipule edilebilir. Gerçek güvenlik backend API endpoint'lerinde olmalı:

| Endpoint Tipi | Gerekli Kontrol |
|---------------|-----------------|
| `/api/employees` | JWT validate + role ∈ {admin, company} |
| `/api/employee/:id/payslip` | JWT validate + employee sadece kendi payslip'ini görebilir |
| `/api/customers` | JWT validate + role ∈ {admin, company} |
| `/api/quotes` | JWT validate + company sadece kendi quotes'unu görebilir |
| `/api/portal/*` | JWT validate + role === 'customer' + customer sadece kendi verisi |

**Düzeltme:** Backend API'lerinde her endpoint'te JWT doğrulama ve role-based access control (RBAC) zorunlu.

---

## 🟢 Çözülen Sorunlar

### ✅ CSP (Content Security Policy) — Tüm Sayfalarda Aktif

**Önceki Durum:** 🟡 Bazı sayfalarda eksik
**Mevcut Durum:** 🟢 **Tamamlandı**

Tüm `.html` dosyalarında `Content-Security-Policy` meta tag'i mevcut:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'; frame-ancestors 'self';">
```

---

### ✅ PII Sızıntısı — Employee.html & Company-staff.html

**Önceki Durum:** 🔴 IBAN, maaş, bordro client-side'daydı
**Mevcut Durum:** 🟢 **Çözüldü**

`employee.html`'de tüm hassas veriler API placeholder formatında:
```html
<div style="font-size:var(--text-xs); color:var(--text-muted)" data-i18n="payslip_payDate">Ödeme Tarihi</div>
<div style="font-weight:600; font-size:var(--text-sm); margin-top:4px">31 Mayıs 2026</div>

<div style="font-size:var(--text-xs); color:var(--text-muted)" data-i18n="payslip_iban">IBAN</div>
<div style="font-weight:600; font-size:var(--text-sm); margin-top:4px">[IBAN — API'den çekilir]</div>

<span data-i18n="payslip_baseSalary">Temel Maaş</span><span>[BRÜT MAAŞ — API]</span>
<span data-i18n="payslip_net">Net Ödeme</span><span>[NET MAAŞ — API]</span>
```

**Not:** `[XX — API]` placeholder'ları üretimde backend'den doldurulacak. Client-side'a sızmamış.

---

### ✅ Token Formatı ve Demo Token Reddetme

**Durum:** 🟢 **Çözüldü**

`auth.js`'de demo token'lar reddediliyor:
```javascript
if (token.startsWith('demo_')) {
  this.logout();
  return false;
}
```

Token formatı `cf_<hex>_<timestamp>` şeklinde cryptographically secure:
```javascript
const arr = new Uint8Array(16);
window.crypto.getRandomValues(arr);
```

---

### ✅ CRUD Aksiyonlarında Rol Kontrolü

**Durum:** 🟢 **Eklendi**

`auth.js`'de `requireRoleForAction()` fonksiyonu her mutasyon fonksiyonunda çağrılıyor:

```javascript
function saveEdit() {
  if (!AUTH.requireRoleForAction(['admin', 'company'], 'saveEdit')) return;
  // ...
}

function addStaff() {
  if (!AUTH.requireRoleForAction(['admin', 'company'], 'addStaff')) return;
  // ...
}
```

**Not:** Bu client-side olduğu için bypass edilebilir ama güvenlik katmanı olarak var.

---

### ✅ Global Error Boundary

**Durum:** 🟢 **Eklendi**

Tüm sayfalarda:
```javascript
(function(){
  window.__cf_errors = [];
  window.addEventListener('error', function(e) {
    window.__cf_errors.push({msg: e.message, file: e.filename, ...});
  });
  window.addEventListener('unhandledrejection', function(e) { ... });
})();
```

---

## 📋 Fix Önerileri — Öncelik Sırasına Göre

### 🔴 P0 — Production Öncesi Zorunlu

1. **Backend Auth Geçişi**
   - Server-side JWT üretimi
   - HttpOnly, Secure, SameSite=Strict cookie kullanımı
   - `/api/login`, `/api/logout`, `/api/refresh` endpoint'leri
   - Her API çağrısında JWT validate + RBAC

2. **Anti-Tampering Token**
   - Token'ın içinde role claim'i olmalı (örn: JWT payload `{role: 'admin', sub: 'user_id'}`)
   - Token signature server-side private key ile imzalanmalı
   - `checkAuth()` token'ı decode edip role'yi doğrulamalı (sunucuya sormadan signature check)

3. **API Endpoint Yetkilendirme**
   - Her `/api/*` endpoint'inde middleware: JWT validate → role check → resource ownership check
   - Employee payslip: sadece kendi `employee_id`'si
   - Customer data: sadece kendi `customer_id`'si
   - Company data: sadece kendi `company_id`'si

### 🟡 P1 — Hardening

4. **localStorage → Cookie Geçişi**
   - Auth token'ı localStorage yerine HttpOnly cookie'de sakla
   - XSS saldırılarında token çalınma riskini azaltır

5. **Rate Limiting**
   - Login endpoint'inde brute-force koruması (5 deneme → 15 dakika lockout)

6. **Input Sanitization**
   - Tüm form input'ları backend'de sanitize edilmeli (XSS, SQL injection koruma)

7. **demoData Kaldırma**
   - Üretim build'inde `demoData` objeleri tamamen kaldırılmalı

### 🟢 P2 — Monitoring

8. **Audit Logging**
   - Hassas aksiyonlar loglanmalı (login, logout, rol değişikliği, payslip erişimi)
   - `window.__cf_errors` backend'e gönderilmeli

9. **Session Invalidation**
   - "Tüm cihazlardan çıkış" özelliği
   - Şifre değişikliğinde tüm session'ları invalidate et

---

## 🏁 Sonuç

| Kategori | Puan | Yorum |
|----------|------|-------|
| Portal İzolasyonu | 🟢 9/10 | Tüm sayfalarda doğru auth kontrolü var |
| PII Koruma | 🟢 8/10 | API placeholder kullanılıyor, demoData'da email/phone var |
| CSP | 🟢 10/10 | Tüm sayfalarda aktif |
| Cookie Güvenliği | 🔴 2/10 | Cookie kullanılmıyor, localStorage riskli |
| Auth Bypass Koruması | 🔴 3/10 | Client-side auth, bypass mümkün |
| Error Handling | 🟢 8/10 | Global boundary + safeExec var |
| Form Validasyonu | 🟢 7/10 | Client-side email/phone validasyonu var |

**Genel Puan:** 🟡 **6.5/10** — CSP ve PII temizliği çözüldü. Client-side auth bypass ve cookie güvenliği production öncesi **zorunlu** düzeltme gerektiriyor.

---

> **Not:** Bu bir statik/demo uygulama. Üretim ortamına geçişte backend auth + HttpOnly cookie geçişi **olmazsa olmaz**.
