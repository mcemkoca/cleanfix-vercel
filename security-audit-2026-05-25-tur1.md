# CleanFix Güvenlik Kontrol Raporu — Tur #1 — 25 Mayıs 2026, 07:00 CST

## Özet

| Metrik | Değer |
|--------|-------|
| Toplam HTML sayfa | ~45 |
| Auth korumalı (checkAuth çağrısı olan) | 20 |
| Auth korumasız korunması gereken sayfa | **9** |
| Kritik bulgu | 4 |
| Orta bulgu | 3 |
| Düşük bulgu | 2 |
| **Genel Durum** | **Kritik açıklar mevcut — acil müdahale gerekiyor** |

---

## Bulgular

### [KRİTİK] 9 Adet Admin/Firma Panel Sayfası Auth Korumasız

**Etki:** Yetkisiz kullanıcılar doğrudan URL ile admin paneli ve hassas verilere erişebilir. Session/login gereksiz.

**Etkilenen dosyalar:**
- `settings.html` — Sistem ayarları sayfası, tamamen açık
- `customers.html` — Müşteri verileri, tamamen açık
- `staff.html` — Personel verileri, tamamen açık
- `bookings.html` — Rezervasyon verileri, tamamen açık
- `invoices.html` — Fatura verileri, tamamen açık
- `reports.html` — Raporlar, tamamen açık
- `services.html` — Hizmet yönetimi, tamamen açık
- `products.html` — Ürün yönetimi, tamamen açık
- `support.html` — Destek paneli, tamamen açık

**Not:** Bu sayfalar sidebar + dashboard layout kullanıyor (admin panel sayfaları) ancak hiçbirinde `auth.js` yüklenmiyor veya `checkAuth()` çağrılmıyor. Doğrudan tarayıcıda açılabilir.

**Çözüm:** Her dosyanın `<body>` hemen altına şunu ekleyin:
```html
<script src="js/auth.js"></script>
<script>checkAuth(['admin','company']);</script>
```

---

### [KRİTİK] Login Sayfasında Demo Credentials Doğrudan Görünür

**Etki:** `admin@cleanfix.com` / `admin123` kombinasyonu sayfa kaynağında plaintext olarak mevcut. Sadece GitHub Pages/localhost'ta gösterilsin demekle sınırlı kalmıyor — source kod herkese açık.

**Konum:** `login.html` — demo-hint bloğu
```html
<code>admin@cleanfix.com</code> <span>/</span> <code>admin123</code>
```

**Çözüm:** Demo credentials'ı production build'den tamamen çıkarın. Geliştirme ortamında bile `.env` veya build-time inject kullanın.

---

### [KRİTİK] innerHTML ile XSS Riski (i18n Dinamik Çeviriler)

**Etki:** `login.html` ve diğer sayfalarda `i18n` çevirileri `innerHTML` ile yazılıyor. Eğer çeviri verisi bir gün API'den gelirse veya kullanıcı tarafından manipüle edilebilirse XSS açığı oluşur.

**Konum:** `login.html` içinde:
```javascript
if (t.includes('<')) {
    el.innerHTML = t;
} else {
    el.textContent = t;
}
```

`includes('<')` kontrolü amatör düzeyde — `<img src=x onerror=alert(1)>` gibi payload'lar geçer.

**Çözüm:** Tüm `innerHTML` kullanımlarını `textContent` ile değiştirin. HTML içeren çeviriler için DOM sanitization (DOMPurify) kullanın.

---

### [KRİTİK] Client-Side Auth — Token localStorage'da, Server Validation Yok

**Etki:** `auth.js` tamamen client-side çalışıyor. Token `localStorage`'da saklanıyor. Herhangi bir kullanıcı browser devtools ile `kobipro_auth_token` key'ini manipüle ederek admin yetkisi kazanabilir.

**Konum:** `js/auth.js`
```javascript
localStorage.setItem(this.TOKEN_KEY, token);
localStorage.setItem(this.USER_KEY, JSON.stringify(user));
```

**Çözüm:** Production'da JWT + HttpOnly cookie + server-side validation zorunlu. Mevcut client-side auth sadece demo/static app için.

---

### [ORTA] CSP 'unsafe-inline' Kullanımı

**Etki:** Tüm sayfalarda `script-src 'unsafe-inline'` ve `style-src 'unsafe-inline'` mevcut. Bu, CSP'nin XSS korumasını büyük ölçüde zayıflatıyor.

**Konum:** Tüm HTML dosyalarda `<meta http-equiv="Content-Security-Policy">`

**Çözüm:** Inline script/style'ları harici dosyalara taşıyın veya nonce/hash kullanın.

---

### [ORTA] Session Timeout Çok Uzun

**Etki:** `SESSION_TTL_MS = 24 saat`. "Remember me" ile `7 gün`. NIST önerisi: idle timeout 15-30 dakika, absolute timeout 8-12 saat.

**Konum:** `js/auth.js`
```javascript
SESSION_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours
REMEMBER_TTL_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
```

**Çözüm:** Idle timeout 30 dakika, absolute timeout 8 saat olarak güncellenmeli.

---

### [ORTA] Token Formatı Yeterince Güçlü Değil

**Etki:** Token 16 byte random + timestamp. 32 hex char. Brute-force için teorik risk düşük ama format tahmin edilebilir (`cf_` + hex + `_` + timestamp).

**Konum:** `js/auth.js`
```javascript
generateSecureToken() {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    const hex = Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    return 'cf_' + hex + '_' + Date.now();
}
```

**Çözüm:** 32 byte (256-bit) kullanın. Formatı gizli tutun (örn: Base64URL).

---

### [DÜŞÜK] Form Validation Client-Side Only

**Etki:** Login form validation tamamen client-side. Server-side validation yok. (Bu zaten static/demo app beklentisi.)

**Çözüm:** Backend entegrasyonunda server-side validation zorunlu.

---

### [DÜŞÜK] Open Redirect Whitelist Sınırlı

**Etki:** `login.html`'de redirect parametresi kontrol ediliyor ama whitelist sadece 2 harici URL içeriyor. Yeni subdomain eklenirse whitelist güncellenmeli.

**Konum:** `login.html`
```javascript
const ALLOWED_REDIRECTS = {
    'buildpro': 'https://mcemkoca.github.io/buildpro-vercel/dashboard.html',
    'barberpro': 'https://mcemkoca.github.io/barberpro-vercel/dashboard.html'
};
```

---

## Test Sonuçları

### Auth Sistemi
- ✅ Auth modülü (`js/auth.js`) mevcut ve çalışıyor
- ✅ Token generation `crypto.getRandomValues` kullanıyor
- ✅ Token expiry kontrolü var
- ✅ Demo token rejection var (`demo_` prefix reddediliyor)
- ❌ **Client-side only — server validation yok**
- ❌ **localStorage kullanımı — XSS saldırısında token çalınabilir**

### Rol Kontrolleri
- ✅ `dashboard.html` → `checkAuth('admin')` — sadece admin
- ✅ `company.html` → `checkAuth(['admin','company'])` — admin veya company
- ✅ `employee.html` → `checkAuth('employee')` — sadece employee
- ✅ `customer-portal.html` → `checkAuth('customer')` — sadece customer
- ✅ `employee-dashboard.html` → `checkAuth('employee')` — sadece employee
- ❌ **settings.html, customers.html, staff.html, bookings.html, invoices.html, reports.html, services.html, products.html, support.html — auth yok**

### Login/Signup
- ✅ Form validation var (email format, password min 6 char)
- ✅ Loading state var
- ✅ Role selector var (admin/company/employee)
- ✅ Remember me toggle var
- ✅ Password show/hide toggle var
- ❌ **Demo credentials hardcoded (`admin123`)**
- ❌ **No rate limiting / brute-force protection**
- ❌ **No CAPTCHA / bot protection**

---

## Öneriler (Öncelik Sırasına Göre)

1. **[ACİL]** Aşağıdaki 9 sayfaya auth.js + checkAuth ekleyin:
   settings.html, customers.html, staff.html, bookings.html, invoices.html, reports.html, services.html, products.html, support.html

2. **[ACİL]** Demo credentials'ı (`admin123`) production'dan kaldırın

3. **[ACİL]** innerHTML kullanımını textContent ile değiştirin veya DOMPurify kullanın

4. **[Yüksek]** Client-side auth yerine server-side JWT + HttpOnly cookie geçin

5. **[Yüksek]** Session timeout'ları kısaltın (idle 30dk, absolute 8saat)

6. **[Orta]** CSP'den 'unsafe-inline' kaldırın

7. **[Orta]** Rate limiting / brute-force protection ekleyin

8. **[Düşük]** Token formatını güçlendirin (32 byte + Base64URL)

---

## Ek Notlar

- Bu rapor static/demo uygulama için hazırlandı. Production'a geçişte auth sisteminin tamamen yeniden yazılması tavsiye edilir.
- `company-*.html` alt sayfaların tümünde (`company-analytics.html`, `company-bookings.html`, vb.) auth kontrolü mevcut — bu iyi.
- `404.html` ve landing page (`index.html`, `pricing.html`) auth gerektirmemeli — doğru.

---
*Rapor hazırlayan: CleanFix Güvenlik Taraması Sub-agent*
*Tarih: 25 Mayıs 2026, 07:00 CST*
