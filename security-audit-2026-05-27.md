# CleanFix Güvenlik Denetimi Raporu
**Tarih:** 2026-05-27 07:00 (Asia/Shanghai)  
**Denetmen:** Aslan (Cron Job #1)  
**Kapsam:** Auth sistemi, rol kontrolleri, admin panel erişimi, login/signup, vulnerability scan

---

## 📊 Özet

| Kategori | Durum | Risk Seviyesi |
|----------|-------|---------------|
| Auth Sistemi | ⚠️ Zayıf | **KRİTİK** |
| Rol Kontrolleri | ⚠️ Client-side only | **YÜKSEK** |
| CSP (Content Security Policy) | ✅ Tüm sayfalarda mevcut | Düşük |
| XSS Koruması | ⚠️ Zayıf | **YÜKSEK** |
| Session Yönetimi | ⚠️ localStorage tabanlı | **KRİTİK** |
| Şifre Güvenliği | ⚠️ Demo modu | **YÜKSEK** |
| Open Redirect | ✅ Whitelist ile korunuyor | Düşük |
| HTTPS/Security Headers | ⚠️ Eksik header'lar | Orta |

---

## 🔴 KRİTİK Bulgular (1-5)

### K1. Client-Side Auth Bypass (KRİTİK)
**Dosya:** `js/auth.js`

Tüm kimlik doğrulama client-side localStorage üzerinden yapılıyor. Token format kontrolü sadece `cf_` prefix + timestamp:

```javascript
if (!token.startsWith('cf_')) return false;
const parts = token.split('_');
if (parts.length !== 3) return false;
const ts = parseInt(parts[2], 10);
```

**Etki:** Herhangi bir kullanıcı browser console'a girip şu kodu çalıştırarak admin paneline erişebilir:
```javascript
localStorage.setItem('kobipro_auth_token', 'cf_' + Math.random().toString(16).slice(2) + '_' + Date.now());
localStorage.setItem('kobipro_user', JSON.stringify({name: 'Hacker', email: 'x@x.com', role: 'admin'}));
```

**Çözüm:** Server-side JWT + HttpOnly cookie geçişi şart. Bu zaten planlanıyor (memory'den bilinen).

---

### K2. Hardcoded Demo Credentials (KRİTİK)
**Dosya:** `login.html` (satır ~590)

```javascript
AUTH.setSession(currentRole, 'Jan Wouters', 'jan@cleanfix.be');
```

Tüm login'ler aynı kullanıcıya yönlendiriliyor. Şifre kontrolü yok - sadece 6 karakter uzunluk check:
```javascript
if (!password || password.length<6) { ... }
```

**Etki:** Herhangi bir 6 karakter şifre ile giriş yapılabilir. Veritabanı yok, backend yok.

**Çözüm:** Backend API ile şifre hash karşılaştırması (bcrypt/argon2).

---

### K3. innerHTML XSS Vektörleri (YÜKSEK)
**Çoklu dosyalar:** dashboard.html, company-*.html

Kullanıcı girdisi doğrudan innerHTML'e yazılıyor:

```javascript
// company-customers.html ~satır 947
cells[0].innerHTML=`<div>${firstName} ${lastName}</div>`;

// company-bookings.html ~satır 833
td6.innerHTML='<div class="actions">... onclick="openEditModal('+newId+')"...';
```

**Etki:** `firstName` veya `lastName` alanına `<img src=x onerror=alert(1)>` yazılırsa XSS tetiklenir.

**Çözüm:** `textContent` kullan veya DOMPurify ile sanitize et. Dinamik event handler'lar için `addEventListener` kullan.

---

### K4. Missing Security Headers (ORTA)
**Eksik header'lar:**
- `X-Frame-Options` (Clickjacking koruması)
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `Strict-Transport-Security` (HSTS)

**Çözüm:** Vercel `vercel.json` veya `_headers` dosyası ile ekle.

---

### K5. CSP 'unsafe-inline' Kullanımı (ORTA)
**Tüm sayfalarda mevcut:**
```
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net ...
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com ...
```

`unsafe-inline` CSP'nin XSS korumasını büyük ölçüde etkisizleştirir. 500+ inline script/style var.

**Çözüm:** nonce veya hash tabanlı CSP'ye geçiş.

---

## 🟡 Diğer Bulgular

### D1. Token Prefix Collision Risk
`cf_` prefix yaygın olabilir. Daha benzersiz bir prefix önerilir: `kobipro_v2_`

### D2. Service Worker Cache Poisoning
`sw.js` herhangi bir origin'den gelen isteği cache'leyebilir. Scope kontrolü var ama `/cleanfix-vercel/` path'i yeterince kısıtlayıcı değil.

### D3. Subdomain Takeover Risk
GitHub Pages üzerinde `mcemkoca.github.io` - eğer kullanıcı adı değişirse subdomain takeover mümkün.

### D4. Missing Rate Limiting
Brute force koruması yok. Login formuna sınırsız deneme yapılabilir.

### D5. No CSRF Protection
Form'ların hiçbirinde CSRF token yok.

---

## ✅ Olumlu Bulgular

1. **CSP Coverage:** 36/36 HTML dosyasında CSP mevcut
2. **Open Redirect Fix:** Login sonrası redirect whitelist ile korunuyor
3. **Old Token Rejection:** `demo_` prefix'li eski token'lar otomatik siliniyor
4. **Session TTL:** 24 saat (remember me: 7 gün) - zaman aşımı var
5. **Role Check:** `checkAuth('admin')` gibi role enforcement mevcut (ama client-side)
6. **Secure Token Generation:** `crypto.getRandomValues()` kullanılıyor

---

## 🛠️ Önerilen Öncelikli Aksiyonlar

### Hemen (Bu hafta)
1. **Auth bypass'ı geçici engelle:** localStorage'a manuel token injection'u tespit etmek için ek kontrol ekle
2. **innerHTML → textContent:** Müşteri isimleri, booking notları gibi alanlarda XSS riskini azalt
3. **Security headers ekle:** `_headers` dosyası oluştur

### Kısa vade (2-4 hafta)
4. **Server-side JWT + HttpOnly cookie:** Memory'de planlanan geçişi hayata geçir
5. **Password hashing:** Backend API ile bcrypt/argon2
6. **Rate limiting:** Login brute force koruması

### Orta vade (1-3 ay)
7. **Nonce-based CSP:** `unsafe-inline` kaldır
8. **CSRF token'ları:** Form'lara ekle
9. **Security audit:** OWASP ZAP ile otomatik tarama

---

## 📁 Taranan Dosyalar
- `js/auth.js` - Auth modülü
- `login.html` - Login/signup flow
- `dashboard.html` - Admin panel (CSP + auth check)
- `employee*.html` - Employee panel (CSP + auth check)
- `company*.html` - Company sayfaları (CSP)
- `sw.js` - Service Worker
- 36 HTML dosyası toplam

**Sonraki kontrol:** 2026-05-28 07:00 (Günlük cron)
