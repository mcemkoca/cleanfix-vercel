# CleanFix Güvenlik Denetim Raporu — Tur #3
**Tarih:** 2026-05-20 09:00 CST (Shanghai)  
**Denetim kapsamı:** cleanfix-vercel (HTML demo) + kobipro-v2 (Next.js scaffold)  
**Denetçi:** Aslan (güvenlik kontrol cron)

---

## 1. ÖZET

| Öğe | Durum | Risk |
|---|---|---|
| Auth mekanizması | **YALNIZCA CLIENT-SIDE** — sunucu doğrulaması yok | 🔴 KRİTİK |
| Portal izolasyonu | **YOK** — customer/employee/admin aynı origin, farklı localStorage key'leri ama bypass edilebilir | 🔴 KRİTİK |
| Hardcoded credentials | **MEVCUT** — admin123, password123 input value olarak preset | 🔴 KRİTİK |
| XSS zafiyeti | **MEVCUT** — `innerHTML` ile kullanıcı input'u doğrudan DOM'a atılıyor | 🟠 YÜKSEK |
| Cookie güvenliği | **N/A** — Hiç cookie kullanılmıyor, tüm state localStorage'da | 🟡 N/A |
| CSP / HTTPS | **YOK** — Content-Security-Policy header/meta yok | 🟠 YÜKSEK |
| Veri sızıntısı | **DEMO VERİ** — tüm içerik HTML'de hardcoded (expected for demo) | 🟡 BİLİNEN |
| Kobipro-v2 yapısı | **ERKEN AŞAMA** — sadece Turbo monorepo scaffold, auth henüz yok | 🟢 GELİŞİM AŞAMASI |

---

## 2. KRİTİK BULGULAR (P1)

### 2.1 Hardcoded Demo Credentials
**Dosyalar:** `login.html`, `customer-portal.html`

```html
<!-- login.html -->
<input ... value="admin@cleanfix.com" autocomplete="username">
<input type="password" ... value="admin123" autocomplete="current-password">

<!-- customer-portal.html -->
<input type="email" id="loginEmail" value="jan.peeters@kantoor.be">
<input type="password" id="loginPass" value="password123">
```

Tüm roller (admin, company, employee) aynı şifre kullanıyor: `admin123`
Demo hint sayfada plaintext olarak görüntüleniyor.

**Etki:** Üretim ortamına deploy edildiğinde, browser DevTools ile credentials direkt okunabilir. Autocomplete browser password manager'a kaydedilebilir.

### 2.2 Client-Side Only Authentication
**Dosyalar:** Tüm `company-*.html`, `dashboard.html`, `employee.html`, `customer-portal.html`

```javascript
// login.html — token oluşturma (sunucu yok)
localStorage.setItem('kobipro_auth_token', 'demo_' + Date.now());
localStorage.setItem('kobipro_user', JSON.stringify({name:'Jan Wouters', email:'jan@cleanfix.be', role:'admin'}));

// company-*.html — doğrulama (sadece varlık kontrolü)
const token = localStorage.getItem('kobipro_auth_token');
if (!token && !window.location.pathname.includes('login.html')) {
  window.location.href = 'login.html';
}
```

**Etki:** 
- Token manipülasyonu ile herhangi bir role erişilebilir.
- `role:'admin'` JSON değeri localStorage'dan değiştirilebilir.
- Brute-force koruması yok.
- Session expiry yok.

### 2.3 Portal Izolasyonu — YOK
**Mevcut durum:**
| Portal | Auth Key | Korumasız durum |
|---|---|---|
| Admin/Dashboard | `kobipro_auth_token` | Token varsa tüm company sayfaları açık |
| Company Paneli | `kobipro_auth_token` | Aynı token |
| Employee Paneli | `kobipro_auth_token` (aynı) | Aynı token |
| Customer Portal | `cf_portal_user` | Sadece email `@` kontrolü, sonra portal açık |

**Etki:**
- Müşteri (customer) → Çalışan (employee) geçişi için sadece `localStorage.setItem('kobipro_auth_token', 'demo_' + Date.now())` yazmak yeterli.
- Customer portal'dan `cf_portal_user` silip `kobipro_auth_token` yazarak admin/dashboard'a geçilebilir.
- Herhangi bir role-based access control (RBAC) yok.

---

## 3. YÜKSEK RİSK BULGULARI (P2)

### 3.1 XSS — DOM Injection via innerHTML
**Dosyalar:** `customer-portal.html`, `company-bookings.html`, `company-staff.html`, `company-quotes.html`, `company-sectors.html`

```javascript
// customer-portal.html — submitTicket()
const sub = document.getElementById('tSubject').value;  // USER INPUT
row.innerHTML = '<td><strong>#' + id + '</strong></td><td>' + sub + '</td>...';
// sub değeri escaping yapılmadan innerHTML'e atılıyor
```

**Etki:** `<img src=x onerror=alert(document.cookie)>` payload'ı ticket subject alanına yazılabilir. (Cookie olmadığı için farklı exploit — localStorage exfiltration, keylogger, vb.)

### 3.2 CSP (Content-Security-Policy) Yok
`<meta http-equiv="Content-Security-Policy">` tag'i yok. Inline script'ler, eval (build tools), external CDN'ler (Google Fonts) kısıtlamasız.

### 3.3 HTTPS Enforcement Yok
HSTS header veya meta tag yok. HTTP üzerinden çalıştırılabilir.

---

## 4. ORTA RİSK BULGULARI (P3)

### 4.1 Open Redirect Potansiyeli
```javascript
// login.html
const redirectParam = urlParams.get('redirect');
if(redirectParam === 'buildpro') redirectTarget = 'https://mcemkoca.github.io/buildpro-vercel/dashboard.html';
if(redirectParam === 'barberpro') redirectTarget = 'https://mcemkoca.github.io/barberpro-vercel/dashboard.html';
```

Whitelist kontrollü ama parametre adı genel (`redirect`). Gelecekte genişletilebilir.

### 4.2 Rate Limiting Yok
Login denemeleri sınırsız. Brute-force koruması yok.

---

## 5. COOKIE GÜVENLİĞİ ANALİZİ

**Durum:** Tüm authentication state `localStorage`'da tutuluyor. Hiç cookie kullanılmıyor.

| Özellik | Durum | Not |
|---|---|---|
| HttpOnly | N/A | Cookie yok |
| Secure | N/A | Cookie yok |
| SameSite | N/A | Cookie yok |
| localStorage token | ❌ Güvensiz | XSS ile çalınabilir, JS erişimi var |

**Öneri:** Gerçek auth implementasyonunda `httpOnly`, `Secure`, `SameSite=Strict` cookie'ler kullanılmalı. localStorage token'lar XSS'a karşı savunmasızdır.

---

## 6. KOBIPRO-V2 DURUMU

| Öğe | Durum |
|---|---|
| Yapı | Turbo monorepo (apps/cleanfix + packages/db,ui,shared) |
| Auth | Henüz implemente edilmemiş |
| DB | Prisma + PostgreSQL adapter yapılandırılmış |
| Veri | Boş scaffold, production verisi yok |
| Risk | DÜŞÜK — henüz deploy edilebilir değil |

**Not:** kobipro-v2 gerçek auth, RBAC, server-side validation ile inşa edilmeli. cleanfix-vercel'deki güvenlik açıkları v2'de tekrarlanmamalı.

---

## 7. ÖNERİLEN DÜZELTMELER (Öncelik sırasına göre)

### P1 — KRİTİK (Hemen yapılmalı)
1. **Tüm hardcoded credentials kaldırılması** — input `value` attribute'ları boş bırakılmalı, demo hint kaldırılmalı
2. **Gerçek backend auth implementasyonu** — JWT + HttpOnly cookie + server-side session validation
3. **RBAC sistemi** — her rol için ayrı endpoint'ler, server-side role verification

### P2 — YÜKSEK (Bu sprint içinde)
4. **innerHTML → textContent/escapeHtml dönüşümü** — tüm CRUD tablolarında kullanıcı input'u escaping yapılmalı
5. **CSP header ekleme** — `script-src 'self'`, `style-src 'self' 'unsafe-inline'`
6. **HTTPS redirect + HSTS**

### P3 — ORTA (Sonraki sprint)
7. **Rate limiting** — login endpoint'inde 5 deneme / 15 dakika
8. **CSRF token'ları**

---

## 8. SONUÇ

Cleanfix-vercel **demo/frontend-prototype** olarak değerlendirilmeli. Mevcut yapı üretim ortamında kullanılamaz. Üç temel güvenlik eksikliği var:

1. **Auth yok** — localStorage token'ı = gerçek auth değil
2. **Izolasyon yok** — customer/employee/admin arasında teknik bariyer yok
3. **XSS açık** — kullanıcı input'u doğrudan DOM'a enjekte ediliyor

kobipro-v2 bu eksiklikleri giderecek şekilde backend-öncelikli, server-side validation'lı bir yapı ile devam etmeli.

---
**Rapor tamamlandı.** Güvenlik kontrolü #3 son turu bitti.
