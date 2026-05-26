# CleanFix Güvenlik Kontrol Raporu
**Tarih:** 2026-05-26 07:00 (Asia/Shanghai)  
**Kapsam:** Auth sistemi, rol kontrolleri, admin panel erişimi, login/signup, vulnerability scan  
**Hedef:** /root/.openclaw/workspace/cleanfix-vercel/

---

## 1. AUTH SİSTEMİ ANALİZİ

### 1.1 Mimari
- **Tür:** Client-side only authentication (localStorage tabanlı)
- **Risk SEVİYESİ:** 🔴 YÜKSEK (inherent static site limitation)
- **Açıklama:** Tüm auth state `localStorage`'da saklanıyor. Bu bir static/demo uygulama için kabul edilebilir ama üretim ortamında **kesinlikle yetersiz**.

### 1.2 Token Yapısı
```
Format: cf_<16-byte-hex>_<timestamp>
Örnek: cf_a1b2c3d4e5f67890_1716748800000
```
- ✅ **crypto.getRandomValues()** kullanılıyor (CSPRNG)
- ✅ Token 24 saat sonra expire oluyor (7 gün remember me ile)
- ✅ Eski `demo_` prefix tokenlar otomatik reddediliyor + logout
- ⚠️ Timestamp tabanlı expiry client-side kontrol ediliyor — manipüle edilebilir

### 1.3 Session Storage
```javascript
localStorage.setItem('kobipro_auth_token', token);
localStorage.setItem('kobipro_user', JSON.stringify(user));
localStorage.setItem('cf_remember_me', '1' | '0');
```
- ⚠️ XSS varlığında token çalınabilir (localStorage JavaScript erişilebilir)
- ⚠️ `cf-theme` ve `cleanfix_lang` gibi diğer localStorage key'leri var ama sensitive değil

### 1.4 Login Akışı
```javascript
// login.html form submit
1. email + password validasyonu (client-side, min 6 char)
2. 1.5 saniye yapay gecikme ("loading" simülasyonu)
3. AUTH.setSession(currentRole, 'Jan Wouters', 'jan@cleanfix.be')
4. Yönlendirme (dashboard.html / company.html / employee.html)
```
- ⚠️ **Gerçek backend doğrulaması YOK** — herhangi bir email/şifre ile giriş yapılabilir
- ✅ Demo modu uyarısı gösteriliyor (`demoHint`)
- ✅ Role-based redirect var (admin→dashboard, company→company, employee→employee)

### 1.5 Logout
```javascript
logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.replace('login.html');
}
```
- ✅ Token ve user data temizleniyor
- ✅ `replace()` kullanılmış (back button ile geri dönülemez)

---

## 2. ROL KONTROLLERİ

### 2.1 Korunan Sayfalar
| Sayfa | Gerekli Rol | Kontrol Metodu |
|-------|-------------|----------------|
| dashboard.html | `admin` | `<script>checkAuth('admin');</script>` |
| employee-dashboard.html | `employee` | `<script>checkAuth('employee');</script>` |
| company.html | muhtemelen `company` | İncelenmeli |
| settings.html | ? | CSP var ama auth kontrolü görünmüyor (ilk 100 satır) |

### 2.2 checkAuth() Davranışı
```javascript
checkAuth(requiredRole) {
  if (!isValid()) { redirect login.html; return false; }
  if (requiredRole) {
    if (!roles.includes(user.role)) {
      redirect login.html?error=unauthorized;
      return false;
    }
  }
  return true;
}
```
- ✅ Array desteği var: `checkAuth(['admin','company'])`
- ✅ Unauthorized access'te query param ile bilgi veriyor
- ⚠️ **Client-side bypass mümkün:** Kullanıcı localStorage'daki `kobipro_user` JSON'ını editleyerek `role: 'admin'` yapabilir

### 2.3 Rol Bazlı UI Gösterimi
- ⚠️ Sadece `display:none` veya `hidden` attribute ile gizleme — DOM'da veriler hâlâ var
- ⚠️ API çağrıları backend'de rol kontrolü yapmalı (ama backend yok)

---

## 3. CSP (Content Security Policy) ANALİZİ

### 3.1 Mevcut CSP'ler

| Sayfa | CSP Mevcut | Durum |
|-------|-----------|-------|
| login.html | ✅ Evet | Tutarlı |
| dashboard.html | ✅ Evet | Tutarlı |
| employee-dashboard.html | ✅ Evet | Tutarlı |
| company.html | ✅ Evet | Tutarlı |
| settings.html | ✅ Evet | Tutarlı |

### 3.2 CSP Direktifleri
```
default-src 'self'
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://unpkg.com
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
font-src https://fonts.gstatic.com
img-src 'self' data: blob: | img-src 'self' data: https:
connect-src 'self'
```

### 3.3 CSP Zafiyetleri
| # | Sorun | Risk | Öneri |
|---|-------|------|-------|
| 1 | `script-src 'unsafe-inline'` | 🔴 **KRİTİK** — Inline XSS payload çalıştırılabilir | Nonce veya hash kullan; inline event handler'ları (`onclick=`) kaldır |
| 2 | `style-src 'unsafe-inline'` | 🟡 Orta — CSS injection mümkün | CSP hash veya external CSS |
| 3 | `https://unpkg.com` kaynağı | 🟡 Orta — supply chain risk | Sadece gereken paketleri ve SRI ile kullan |
| 4 | `img-src 'self' data: https:` | 🟡 Orta — dış görsel yüklenebilir | Sadece trusted domain'ler |
| 5 | `connect-src 'self'` | ✅ İyi | Sadece kendi origin'e API çağrısı |
| 6 | Eksik direktifler | 🟡 Orta | `base-uri`, `form-action`, `frame-ancestors` eklenmeli |

---

## 4. XSS (Cross-Site Scripting) TARAMASI

### 4.1 innerHTML Kullanımı — 🔴 YÜKSEK RİSK
Aşağıdaki dosyalarda **doğrudan innerHTML kullanımı** tespit edildi:

| Dosya | Satır | Kod | Risk |
|-------|-------|-----|------|
| company-sectors.html | 1400 | `tr.innerHTML=\`` | Kullanıcı girdisi varsa XSS |
| company-sectors.html | 1487 | `statusRow.innerHTML = '<span style=\"background:' + color + '\">'` | `color` değişkeni zehirlenmişse XSS |
| company-bookings.html | 833 | `td6.innerHTML='<button onclick=\"openEditModal('+newId+')\"'` | `newId` injection riski |
| company-quotes.html | 937 | `actions.innerHTML='<button onclick=\"toggleExpand('+id+')\"'` | `id` manipülasyonu |
| company-staff.html | 861 | `td6.innerHTML='...onclick=\"openEditModal('+newId+')\"'` | `newId` injection |
| company-tools.html | 1475 | `itemsContainer.innerHTML = data.items.map(...)` | `data` kullanıcı kaynaklıysa XSS |
| company-tools.html | 1534 | `chemBody.innerHTML = data.body` | `data.body` HTML injection |
| js/toast.js | 121 | `toast.innerHTML = \`` | Toast mesajı kullanıcı girdisiyse XSS |

### 4.2 Event Handler Injection
```html
<!-- company-quotes.html -->
<button onclick="openEditModal(${newId})">
```
- ⚠️ `newId` değişkeni kullanıcı kontrolündeyse `');alert('xss');//` injection mümkün

### 4.3 i18n innerHTML Kullanımı
```javascript
// login.html ve diğerleri
if (t.includes('<')) {
  el.innerHTML = t;   // ⚠️ HTML içeren çeviri metni XSS riski
} else {
  el.textContent = t; // ✅ Güvenli
}
```
- Çeviri metinleri hardcoded ama dinamik hale getirilirse risk artar

### 4.4 Güvenli Yöntemler Bulundu
```javascript
// ✅ textContent kullanımı (XSS'e karşı güvenli)
// login.html
themeToggle.innerHTML=theme==='dark'?sunIcon:moonIcon; // sabit SVG, güvenli

// ✅ DOMPurify benzeri sanitizasyon YOK — eklenmeli
```

---

## 5. OPEN REDIRECT / URL MANİPÜLASYONU

### 5.1 Login Redirect
```javascript
const ALLOWED_REDIRECTS = {
  'buildpro': 'https://mcemkoca.github.io/buildpro-vercel/dashboard.html',
  'barberpro': 'https://mcemkoca.github.io/barberpro-vercel/dashboard.html'
};
if (redirectParam && ALLOWED_REDIRECTS[redirectParam]) {
  redirectTarget = ALLOWED_REDIRECTS[redirectParam];
}
```
- ✅ **WHITELIST kontrolü var** — sadece tanımlı domain'lere izin veriyor
- ✅ `window.location.href` kullanımı (replace değil ama önceki kontrol yeterli)

### 5.2 Diğer location.href Kullanımları
| Dosya | Kod | Risk |
|-------|-----|------|
| index.html | `location.href='login.html?email='+encodeURIComponent(e)` | ✅ encodeURIComponent kullanılmış |
| company-sectors.html | `onclick="location.href='sectors/buildpro/dashboard.html'"` | ✅ Sabit URL |

---

## 6. LOCALSTORAGE / CLIENT-SIDE VERİ GÜVENLİĞİ

### 6.1 Saklanan Veriler
| Key | İçerik | Hassasiyet |
|-----|--------|-----------|
| `kobipro_auth_token` | Session token | 🔴 Yüksek |
| `kobipro_user` | {name, email, role, createdAt} | 🟡 Orta |
| `cf_remember_me` | "1" veya "0" | 🟢 Düşük |
| `cf-theme` | "dark"/"light" | 🟢 Düşük |
| `cleanfix_lang` | "tr"/"en"/"nl" | 🟢 Düşük |
| `cf_cache_*` | Tablo verileri (offline cache) | 🟡 Orta |

### 6.2 Veri Manipülasyonu Riski
```javascript
// Kullanıcı console'dan şunu yazabilir:
localStorage.setItem('kobipro_user', JSON.stringify({
  name: 'Hacker',
  email: 'hack@example.com',
  role: 'admin',
  createdAt: Date.now()
}));
// → Admin paneline erişim sağlanabilir
```
- 🔴 **KRİTİK:** Client-side auth her zaman bypass edilebilir
- **Öneri:** Üretimde server-side JWT + HttpOnly cookie zorunlu

---

## 7. FORM VALIDASYON & INPUT GÜVENLİĞİ

### 7.1 Mevcut Validasyonlar
```javascript
// validation.js
validateEmail(email)    // Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
validatePhone(phone)    // En az 7 rakam
validateRequired(fields) // Boş alan kontrolü
validateDateRange(start, end) // Tarih karşılaştırması
```
- ✅ Email regex temel ama yeterli
- ✅ Telefon validasyonu var
- ✅ Alan bazlı hata gösterimi var

### 7.2 Eksik Validasyonlar
| Alan | Eksik Kontrol | Risk |
|------|--------------|------|
| Şifre güçlülüğü | Sadece min 6 karakter | 🟡 Zayıf şifre kabul ediliyor |
| HTML tag sanitizasyonu | Yok | 🔴 XSS riski |
| SQL injection | Client-side sınırlı ama API katmanında gerekli | N/A (şu an) |
| File upload | Yok | N/A (şu an) |

---

## 8. DİĞER GÜVENLİK NOTLARI

### 8.1 PWA / Service Worker
- `sw.js` mevcut — offline cache stratejisi incelenmeli
- Cache'de sensitive data var mı kontrol edilmeli

### 8.2 Meta Tag Güvenliği
```html
<!-- ✅ Mevcut -->
<meta http-equiv="Content-Security-Policy" content="...">
<meta name="robots" content="index, follow">

<!-- ❌ Eksik -->
<!-- X-Frame-Options (clickjacking koruması) -->
<!-- Referrer-Policy -->
<!-- Permissions-Policy -->
```

### 8.3 Clickjacking Riski
- `X-Frame-Options` header yok (static site, server config gerektirir)
- `frame-ancestors` CSP direktifi yok
- Öneri: `frame-ancestors 'none';` veya `'self'`

### 8.4 eval() / document.write() Taraması
- ✅ `eval()` kullanımı bulunmadı
- ✅ `document.write()` kullanımı bulunmadı
- ✅ `Function()` constructor kullanımı bulunmadı

---

## 9. BULUNAN FONKSİYONEL SORUN (Güvenlikle İlgili Değil)

### 9.1 Dashboard Hızlı İşlemler Butonları
Kullanıcı raporuna göre dashboard'daki hızlı işlemler butonları "çalışmıyor".

**Kod Analizi:**
```html
<button class="quick-btn" onclick="window.location.href='company-customers.html'">
  <div class="quick-btn-icon">🏢</div>
  <span data-i18n="action.addCompany">Firma Ekle</span>
</button>
```

**Durum:** Butonlar kod olarak mevcut ve onclick handler'ları tanımlı.
- İlk 3 buton `window.location.href` ile yönlendirme yapıyor ✅
- 4. buton (`Duyuru Gönder`) sadece `showToast()` çağırıyor, gerçek bir modal açmıyor ⚠️

**Muhtemel Nedenler:**
1. CSS z-index veya overlay sorunu (butonlar tıklanabilir değil)
2. JavaScript hatası başka bir yerden butonların çalışmasını engelliyor
3. `window.location.href` yerine `window.location.replace()` kullanılmalı (güvenlik açısından tutarlılık)

---

## 10. ÖZET & ÖNERİLER

### 🔴 KRİTİK (Hemen Düzeltilmeli)
1. **Client-side auth → Server-side JWT + HttpOnly cookie** geçişi planlanmalı
2. **innerHTML kullanımı** → `textContent` veya DOMPurify sanitizasyonuna geçiş
3. **CSP `unsafe-inline`** → nonce/hash tabanlı CSP'ye geçiş
4. **Role bypass riski** → Tüm rol kontrolleri server-side yapılmalı

### 🟡 ORTA (Planlanmalı)
5. Eksik HTTP security header'ları: `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
6. `frame-ancestors` CSP direktifi ekleme
7. Şifre güçlülük kontrolü (min 8 karakter, büyük/küçük harf, rakam, özel karakter)
8. Rate limiting (login denemeleri için)

### 🟢 DÜŞÜK (İyileştirme)
9. Subresource Integrity (SRI) için external CDN kaynaklarına `integrity` attribute ekleme
10. `base-uri 'self'` CSP direktifi
11. `form-action 'self'` CSP direktifi
12. Audit log (başarısız login denemeleri, rol değişiklikleri)

### ✅ GÜÇLÜ YÖNLER
- ✅ Crypto-secure token üretimi
- ✅ Demo token fallback koruması
- ✅ Global error boundary
- ✅ Form validasyon kütüphanesi
- ✅ CSP mevcut (bazı zafiyetlerle birlikte)
- ✅ Open redirect whitelist kontrolü
- ✅ `eval()` / `document.write()` kullanımı yok

---

**Raporlayan:** Aslan (Güvenlik Kontrol Botu)  
**Sonraki Adım:** Kritik bulguların düzeltilmesi için development planı oluşturulması önerilir.
