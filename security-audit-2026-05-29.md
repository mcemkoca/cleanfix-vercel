# CleanFix Güvenlik Kontrol Raporu — 2026-05-29 07:00 CST

## 📊 Özet
| Kategori | Durum |
|---|---|
| Auth Sistemi | ⚠️ Demo mod — client-side only (bilinen sınırlama) |
| Rol Kontrolleri | ✅ 30+ sayfada aktif, public sayfalar hariç tutulmuş |
| CSP Header'ları | ✅ Tüm HTML sayfalarda mevcut |
| XSS Riski | 🟡 innerHTML kullanımı yüksek, escapeHtml tutarsız |
| Token Güvenliği | ✅ crypto.getRandomValues, demo_ token reddi |
| Veri Şifreleme | ❌ Yok (client-side localStorage) |
| Açık Yönlendirme | ✅ Whitelist koruması mevcut |
| Hızlı İşlemler | ⚠️ Modal CSS yapısal konumlandırma sorunu |

---

## 🔴 KRİTİK (2 adet)

### 1. Client-Side Auth Bypass — localStorage Manipülasyonu
**Risk:** Yüksek | **CVSS:** ~6.5

`localStorage` içindeki `kobipro_user` JSON verisi doğrudan editlenebilir. Kullanıcı `role` alanını `'admin'` yaparak tüm admin paneline erişebilir.

**Kanıt:**
```js
// js/auth.js:44
const raw = localStorage.getItem(this.USER_KEY);
return raw ? JSON.parse(raw) : null;
// Rol doğrulaması sadece JSON parse sonrası string kontrolü — imzasız, şifresiz
```

**Etki:** Herhangi bir kullanıcı `employee` rolünden `admin` veya `company` rolüne yükselebilir. Tüm CRUD işlemleri, fatura, personel, stok verilerine erişim sağlanabilir.

**Çözüm:**
- Server-side JWT + HttpOnly cookie geçişi (planlanıyor, henüz uygulanmadı)
- Token imzalama (HMAC/RS256) ile rol bilgisi sunucudan gelmeli
- localStorage'da role saklanmamalı

### 2. escapeHtml Tanımsızlık Riski — XSS Yolu
**Risk:** Orta | **CVSS:** ~5.3

`js/toast.js` içinde `escapeHtml` tanımlı ancak IIFE içinde kalıyor, `window` objesine export edilmiyor. `js/validation.js` ise `window.escapeHtml = ...` şeklinde export ediyor.

Bazı sayfalar (örneğin dashboard.html) sadece `toast.js` yüklüyor, `validation.js` yüklümüyor. Eğer dashboard.html'de escapeHtml kullanılsa, `ReferenceError` verecektir. Şu an dashboard.html escapeHtml kullanmıyor, ancak gelecekteki düzenlemelerde unutulabilir.

**Etkilenen dosyalar:**
- `dashboard.html` — sadece `toast.js` (escapeHtml IIFE içinde, window'da yok)
- `company-bookings.html` — hem `toast.js` hem `validation.js` ✅
- `company-sectors.html` — hem `toast.js` hem `validation.js` ✅

**Çözüm:**
- `js/toast.js` içindeki `escapeHtml` fonksiyonunu `window.escapeHtml` olarak export et
- Veya tüm sayfalarda `validation.js` yüklenmesini zorunlu kıl

---

## 🟡 ORTA (3 adet)

### 3. innerHTML Kullanımı Yüksek — XSS Yüzeyi
**Risk:** Orta

Tüm projede `innerHTML` ~200+ kullanım var. Bazı yerlerde `escapeHtml` kullanılıyor, bazı yerlerde kullanılmıyor.

**Yüksek riskli örnekler:**
```js
// company-quotes.html:936
actions.innerHTML='<button class="action-btn" onclick="toggleExpand('+id+')"...';
// id doğrudan string interpolation içinde — XSS mümkün

// company-bookings.html:832
// td6.innerHTML — actions butonları inline onclick ile
```

**Çözüm:**
- `innerHTML` yerine `textContent` veya `createElement` kullanımına geçiş
- Tüm dinamik içeriklerde `escapeHtml` zorunlu kılınmalı
- Content Security Policy `'unsafe-inline'` script-src kısıtlanmalı (nonce/hash geçişi)

### 4. CSP 'unsafe-inline' Gereksinimi
**Risk:** Düşük-Orta

CSP header'ları mevcut ancak `script-src 'self' 'unsafe-inline'` ve `style-src 'self' 'unsafe-inline'` kullanılıyor. Bu, inline XSS payload'larının çalışmasına olanak tanır.

**Çözüm:**
- Inline script'ler external JS dosyalarına taşınmalı
- Inline style'lar CSS class'larına dönüştürülmeli
- CSP nonce/hash geçişi planlanmalı

### 5. Demo Mod — Herhangi Bir Şifre ile Giriş
**Risk:** Düşük-Orta (demo uygulama için kabul edilebilir)

`login.html` içinde form submit herhangi bir email/şifre kombinasyonunu kabul ediyor. 1.5 saniyelik yapay gecikme sonrası `AUTH.setSession(currentRole, 'Jan Wouters', 'jan@cleanfix.be')` çağrılıyor.

Bu, demo/statik bir uygulama için bilinen bir davranış, ancak production'a geçişte mutlaka server-side authentication ile değiştirilmeli.

---

## ✅ GÜÇLÜ YÖNLER (4 adet)

1. **Token Üretimi:** `crypto.getRandomValues` kullanılıyor, `Math.random` değil
2. **Demo Token Reddi:** `demo_` prefix ile başlayan eski token'lar otomatik logout ediliyor
3. **Rol Kontrolleri:** 30+ sayfada `checkAuth()` aktif, public sayfalar (index, login, pricing) hariç tutulmuş
4. **Açık Yönlendirme Koruması:** `redirect` parametresi için whitelist kontrolü mevcut:
```js
const ALLOWED_REDIRECTS = {
  'buildpro': 'https://mcemkoca.github.io/buildpro-vercel/dashboard.html',
  'barberpro': 'https://mcemkoca.github.io/barberpro-vercel/dashboard.html'
};
```
5. **CSP Header'ları:** Tüm 43+ HTML sayfada CSP meta tag mevcut

---

## ⚠️ YAPISAL SORUN: Dashboard Hızlı İşlemler + Modal CSS

`dashboard.html` içinde modal CSS `<style>` tag'inin konumu sorunlu. Kullanıcı raporuna göre "modal CSS bilgisi sayfanın en üstünde çıkıyor" — bu muhtemelen `<style>` tag'inin `<head>` içinde yerleşimi veya kapanmama sorunundan kaynaklanıyor.

**Gözlemlenen:**
- Modal CSS ~satır 351'de `<style>` bloğu içinde
- `openModal('addCompanyModal')` ve `openModal('announceModal')` çağrıları var
- Modal HTML yapıları ~satır 2534+ aralığında

**Tahmini neden:** Stil tanımlaması sayfa akışının dışında kalıyor veya tarayıcı tarafından text node olarak render ediliyor olabilir. CSS sınıf isimleri (`modal-overlay`, `modal`) çakışma riski taşıyor.

**Çözüm:**
- Modal CSS'i `css/components.css` veya `css/dashboard.css` içine taşı
- Inline `<style>` bloğunu kaldır
- Tüm modal overlay'lerin `display:none` başlangıç değerini ve `.active` class toggle'ını kontrol et

---

## 📋 EYLEM PLANI

### Hemen (Bu Hafta)
- [ ] `js/toast.js` içindeki `escapeHtml` fonksiyonunu `window.escapeHtml = escapeHtml` olarak export et
- [ ] Dashboard modal CSS'ini external CSS'e taşı, inline `<style>` bloğunu temizle
- [ ] `company-quotes.html` içindeki `actions.innerHTML` kullanımını `createElement` ile değiştir

### Kısa Vade (2-4 Hafta)
- [ ] Server-side JWT + HttpOnly cookie auth geçişi planını başlat
- [ ] Tüm `innerHTML` kullanımlarını tarayıp `escapeHtml` veya `createElement` ile güvenli hale getir
- [ ] CSP `'unsafe-inline'` kaldırma planı — inline script/style'leri external dosyalara taşı

### Orta Vade (1-3 Ay)
- [ ] Backend API layer ekle (Node.js/Go/Python)
- [ ] Rol tabanlı yetkilendirme sunucu tarafında yap
- [ ] localStorage'dan auth verisi tamamen kaldır

---

*Rapor oluşturuldu: 2026-05-29 07:00 CST*
*Sonraki kontrol: 2026-05-30 07:00*
