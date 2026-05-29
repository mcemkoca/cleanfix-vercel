# CleanFix Güvenlik Kontrolü #3 — SON TUR RAPORU
## 2026-05-29 09:00 CST | Kapsam: Portal İzolasyonu, Data Leak, Cookie Güvenliği

---

## 📊 GENEL DURUM ÖZETİ

| Kategori | Durum | Not |
|---|---|---|
| Portal İzolasyonu (Görsel/UI) | ✅ İzole | Her portal kendi veri setini gösteriyor, cross-link yok |
| Portal İzolasyonu (Auth Layer) | ⚠️ Zayıf | Tüm roller aynı localStorage key'lerini paylaşıyor |
| Data Leak Riski | 🟡 Orta | Aynı storage key'leri + localStorage manipülasyonu = cross-role erişim |
| Cookie Güvenliği | ❌ Yok | localStorage tabanlı auth, cookie yok |
| CSP Header'ları | ✅ Mevcut | 43+ sayfada var, customer-portal ve company-customers genişletilmiş CSP |
| Frame Protection | ❌ Yok | `frame-ancestors` CSP direktifi eksik, clickjacking mümkün |

---

## 🔴 KRİTİK — Açık Kalanlar (Önceki Kontrollerden)

### 1. Client-Side Auth Bypass — HALA AKTİF
**Risk:** Yüksek | **CVSS:** ~6.5 | **Değişim:** Yok

`localStorage`'daki `kobipro_user` JSON'ı editlenebilir. `role: 'admin'` yapıldığında tüm admin paneline erişim sağlanabilir. **Bu sorun Kontrol #1'den beri açık.**

```js
// js/auth.js — hala client-side only, imzasız token
const user = { name, email, role, createdAt: Date.now() };
localStorage.setItem(this.USER_KEY, JSON.stringify(user));
```

**Etki:** Admin, company, employee, customer — tüm rollere yükseltme mümkün.

**Çözüm:** Server-side JWT + HttpOnly cookie geçişi zorunlu.

---

### 2. CRUD Action Fonksiyonlarında Yetki Kontrolü — HALA AKTİF
**Risk:** Yüksek | **Değişim:** Yok

Sayfa yüklendiğinde `checkAuth()` çalışıyor, ancak sayfa yüklendikten sonraki action'ların (save, delete, add) kendilerinde yetki kontrolü yok. Kullanıcı sayfa açıkken `localStorage`'daki role değerini değiştirirse action'lar çalışmaya devam eder.

**Etkilenen action'lar (12 sayfa, 20+ fonksiyon):**
- `saveEdit()`, `addBooking()` — company-bookings.html
- `saveEdit()`, `addCustomer()` — company-customers.html
- `saveEquip()` — company-equipment.html
- `saveEdit()`, `addInvoice()` — company-invoices.html
- `saveNewTask()` — company-maintenance.html
- `saveQuote()`, `addModalLineItem()` — company-quotes.html
- `addSector()`, `deleteSectorCard()` — company-sectors.html
- `saveAssign()`, `saveEdit()`, `addService()` — company-services.html
- `saveEdit()`, `addStaff()` — company-staff.html

**Çözüm:** Her action başında `AUTH.getUser()?.role` kontrolü eklenmeli.

---

### 3. SRI (Subresource Integrity) Eksik — HALA AKTİF
**Risk:** Orta-Yüksek | **Değişim:** Yok

CDN'den yüklenen Chart.js, jsPDF, AutoTable, XLSX kütüphanelerinde `integrity` attribute'ları yok. MITM saldırısında kötü amaçlı JS çalıştırılabilir.

---

## 🟡 ORTA — Yeni Bulgular (Bu Kontrol)

### 4. Tüm Portaller Aynı localStorage Key'lerini Paylaşıyor
**Risk:** Orta | **Yeni Bulgu**

Admin, company, employee, customer portalleri hepsi aynı `kobipro_auth_token` ve `kobipro_user` key'lerini kullanıyor. Bu teorik bir "session contamination" riski yaratıyor:

| Portal | Auth Key | Isolation |
|---|---|---|
| dashboard.html (admin) | `kobipro_user` | ❌ Aynı key |
| company-*.html | `kobipro_user` | ❌ Aynı key |
| employee-dashboard.html | `kobipro_user` | ❌ Aynı key |
| customer-portal.html | `kobipro_user` | ❌ Aynı key |

**Senaryo:** Kullanıcı customer olarak giriş yapar. Başka sekmede admin panelini açar — `checkAuth('admin')` role customer olduğu için redirect eder. Ancak localStorage'da role değiştirilirse geçiş mümkün.

**Çözüm:** Her portal/role için farklı storage prefix'i kullanılmalı:
```js
// Öneri: role-prefixed keys
const USER_KEY = `kobipro_user_${role}`; // kobipro_user_admin, kobipro_user_customer
```

---

### 5. Customer Portal ve Employee Portal — auth.js Tutarsız Yükleme
**Risk:** Düşük-Orta

- **customer-portal.html:** `<script src="js/auth.js"></script>` doğrudan yüklü ✅
- **employee-dashboard.html:** `<script src="js/auth.js"></script>` doğrudan yüklü ✅
- **employee.html:** Inline fallback lazy-load — `if (typeof AUTH !== 'undefined') { AUTH.checkAuth('employee'); }` else script injection ⚠️
- **employee-tasks.html:** Aynı fallback mekanizması ⚠️

Tüm sayfalarda tutarlı `<script src="js/auth.js"></script>` + `<script>checkAuth('role');</script>` pattern'ı kullanılmalı.

---

### 6. Frame-Ancestors Eksik — Clickjacking Riski
**Risk:** Orta

CSP meta tag'lerinde `frame-ancestors 'self';` direktifi yok. CleanFix başka bir site tarafından iframe içine alınıp clickjacking saldırısına maruz kalabilir.

**Etkilenen:** Tüm 43+ HTML sayfa.

**Çözüm:**
```html
<meta http-equiv="Content-Security-Policy" content="... ; frame-ancestors 'self';">
```

---

### 7. escapeHtml Export Hala Tutarsız
**Risk:** Orta | **Değişim:** Yok

- `js/toast.js` — `escapeHtml` IIFE içinde, `window`'a export edilmiyor ❌
- `js/validation.js` — `window.escapeHtml = ...` olarak export ediyor ✅
- `js/app.js` — `window.escapeHtml` global tanımlı ✅

Bazı sayfalarda `app.js` veya `validation.js` yüklenmezse `escapeHtml` undefined kalabilir.

---

### 8. Dashboard Modal CSS — Devam Eden Yapısal Sorun
**Risk:** Düşük | **Değişim:** Yok

Dashboard modal CSS hala inline `<style>` bloğunda. Kullanıcı raporuna göre "modal CSS bilgisi sayfanın en üstünde çıkıyor" — bu durum devam ediyor olabilir.

---

## ✅ GÜÇLÜ YÖNLER (Korunuyor)

1. **Token Üretimi:** `crypto.getRandomValues` kullanılıyor
2. **Demo Token Reddi:** `demo_` prefix'li eski token'lar otomatik logout ediliyor
3. **Rol Kontrolleri:** 30+ sayfada `checkAuth()` aktif, roller doğru ayrılmış
4. **Portal Veri İzolasyonu (UI):** Her portal kendi demo veri setini gösteriyor, başka portalın verilerine erişim linki yok
5. **CSP Header'ları:** Tüm sayfalarda mevcut (customer-portal ve company-customers dahil)

---

## 📋 EYLEM PLANI — Son Tur Kapatma

### Hemen (Bugün)
- [ ] **CRITICAL:** Her CRUD action fonksiyonuna `AUTH.getUser()?.role` kontrolü ekle
- [ ] **CRITICAL:** `js/toast.js` içinde `window.escapeHtml = escapeHtml;` export ekle
- [ ] Tüm CSP meta tag'lerine `frame-ancestors 'self';` ekle
- [ ] CDN script'lerine SRI `integrity` hash'leri ekle
- [ ] employee.html ve employee-tasks.html'de auth.js'yi doğrudan `<script src>` ile yükle

### Kısa Vade (Bu Hafta)
- [ ] Her role için farklı localStorage key prefix'i (`kobipro_user_admin`, `kobipro_user_customer` vb.)
- [ ] Dashboard modal CSS'ini `css/components.css` içine taşı
- [ ] Inline `onclick` handler'larını `addEventListener`'a dönüştür
- [ ] `innerHTML` kullanımlarında `escapeHtml` zorunlu kıl

### Orta Vade (1-3 Ay)
- [ ] **Server-side JWT + HttpOnly cookie auth geçişi** — Bu, auth bypass'ı tamamen kapatır
- [ ] Backend API layer ekle
- [ ] Rate limiting planı
- [ ] CSRF token mekanizması

---

## 🏁 SONUÇ

**Son 3 kontrolde (2026-05-29 #1, #2, #3) toplam 15+ güvenlik bulgusu tespit edildi.**

| Öncelik | Sayı | Kapanan | Açık Kalan |
|---|---|---|---|
| 🔴 Kritik | 3 | 0 | 3 |
| 🟡 Orta | 5 | 0 | 5 |
| 🟢 Düşük | 3 | 0 | 1 (modal CSS) |

**Öneri:** Son tur tamamlandı. Artık bulguların kod düzeltmelerine dökülmesi gerekli. Kritik 3 sorun (auth bypass, CRUD yetki kontrolü, SRI) üzerine yoğunlaşılmalı. Server-side JWT geçişi orta vadeli en önemli mimari değişikliktir.

---

*Rapor: security-audit-2026-05-29-tur3-final.md*
*Sonraki önerilen kontrol: Server-side JWT geçişi başladıktan sonra*
*Kontrol serisi: #1 (07:00) → #2 (08:00) → #3 (09:00) — tamamlandı.*
