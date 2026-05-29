# CleanFix Güvenlik Kontrolü #2 — 2026-05-29 08:00 CST
## Kapsam: API Endpoint Güvenliği, Action Yetki Kontrolü, CSRF/XSS, Input Validasyonu

---

## 🔴 KRİTİK (3 adet)

### 1. CRUD Action Fonksiyonlarında Yetki Kontrolü YOK
**Risk:** Yüksek | **Sayfalar:** Tüm company-*.html

Sayfa yüklendiğinde `checkAuth(['admin','company'])` çalışıyor, ancak **sayfa yüklendikten sonraki CRUD action'ların kendileri içinde yetki kontrolü yok.** Kullanıcı sayfadayken `localStorage`'daki `role` değerini `'employee'` yaparsa, halen "Kaydet", "Sil", "Ekle" butonları çalışmaya devam eder.

**Etkilenen action'lar:**
- `saveEdit()`, `addBooking()` — company-bookings.html
- `saveEdit()`, `addCustomer()` — company-customers.html
- `saveEquip()` — company-equipment.html
- `saveEdit()`, `addInvoice()` — company-invoices.html
- `saveNewTask()` — company-maintenance.html
- `saveQuote()`, `addModalLineItem()` — company-quotes.html
- `addSector()`, `deleteSectorCard()` — company-sectors.html
- `saveAssign()`, `saveEdit()`, `addService()` — company-services.html
- `saveEdit()`, `addStaff()` — company-staff.html

**Çözüm:**
Her action fonksiyonunun başına `AUTH.checkAuth()` veya `AUTH.getUser()?.role` kontrolü eklenmeli:
```js
function saveEdit() {
  const user = AUTH.getUser();
  if (!user || !['admin','company'].includes(user.role)) {
    showToast('Yetkisiz işlem', 'error');
    return;
  }
  // ... devam
}
```

---

### 2. Subresource Integrity (SRI) Eksik — CDN Kütüphaneleri
**Risk:** Orta-Yüksek

12+ sayfada Chart.js, jsPDF, XLSX, AutoTable kütüphaneleri CDN üzerinden yükleniyor. `<script>` tag'lerinde `integrity="..." crossorigin="anonymous"` SRI attribute'ları yok. CDN hesabı ele geçirilirse veya MITM saldırısı olursa, kötü amaçlı JS çalıştırılabilir.

**Etkilenen dosyalar:**
- dashboard.html — chart.js@4.4.1
- company-bookings.html, company-customers.html, company-equipment.html, company-maintenance.html, company-quotes.html, company-sectors.html, company-services.html, company-staff.html, company-stock.html, company-tools.html — jspdf + autotable + xlsx

**Çözüm:**
SRI hash'leri eklenmeli:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
  integrity="sha384-..."
  crossorigin="anonymous"></script>
```

---

### 3. Inline onclick Handler'lar Yetki Kontrolü Yapmıyor
**Risk:** Orta

Tüm sayfalarda `<button onclick="openEditModal(id)">`, `<button onclick="deleteSectorCard(id)">` gibi inline handler'lar var. Bu fonksiyonlar çağrılmadan önce rol kontrolü yapılmıyor. XSS vektörü ile (örn. reflected XSS) `onclick` attribute enjekte edilebilir veya DOM'da mevcut butonlar tetiklenebilir.

**Örnek (company-bookings.html:832):**
```js
td6.innerHTML='<div class="actions"><button class="action-btn edit" onclick="openEditModal('+newId+')" ...>';
```
`newId` değişkeni doğrudan string birleştirmede — integer olsa bile DOM XSS riski taşır.

**Çözüm:**
- Inline `onclick` yerine `addEventListener` kullanımına geçiş
- Action fonksiyonlarında yetki kontrolü (bkz. #1)
- `escapeHtml` tüm dinamik içeriklere uygulanmalı

---

## 🟡 ORTA (4 adet)

### 4. Input Validasyonu — DRY İhlali + Eksik Kullanım
**Risk:** Orta

`js/validation.js` merkezi bir validasyon kütüphanesi içeriyor (`attachFormValidation`, `validateEmail`, `validatePhone`, `validateRequired`), ancak:

- **Hiçbir sayfada `attachFormValidation()` çağrılmıyor.**
- Her sayfada aynı `validateEmail` ve `validatePhone` fonksiyonları **tekrar tanımlanmış** (inline `<script>` içinde).
- `validateRequired` hiç kullanılmıyor.
- Date range validasyonu yok.
- Fiyat/number alanlarında negatif değer veya tip kontrolü yok.

**Tekrarlanan tanımlar:**
- company-bookings.html satır 1052-1053
- company-customers.html satır 1065-1066
- company-equipment.html satır 826-827
- company-maintenance.html satır 2100-2101
- company-quotes.html satır 2375-2376

**Çözüm:**
- Tüm sayfalarda inline validasyon fonksiyonlarını kaldır
- `js/validation.js` sayfalara eklenmeli (`<script src="js/validation.js"></script>`)
- Form'lara `attachFormValidation('#formId')` çağrısı eklenmeli
- Number input'ları için `min="0" step="0.01"` attribute'ları zorunlu

---

### 5. CSRF Koruması YOK
**Risk:** Orta (API olmadığı için sınırlı)

Projede gerçek bir backend API olmadığı için klasik CSRF vektörü sınırlı. Ancak:
- GitHub Pages statik hosting'de form submit olmaz
- localStorage write işlemleri (veri ekleme/silme/güncelleme) herhangi bir origin'den çalışan JS tarafından yapılabilir (XSS varsa)
- iframe clickjacking korunması yok (`X-Frame-Options` veya CSP `frame-ancestors` meta tag'de yok)

**Çözüm:**
- CSP meta tag'a `frame-ancestors 'self';` eklenmeli
- Backend eklendiğinde CSRF token mekanizması kurulmalı
- SameSite cookie politikası planlanmalı

---

### 6. `escapeHtml` Tutarsızlığı — toast.js vs validation.js
**Risk:** Orta

- `js/toast.js` içindeki `escapeHtml` IIFE içinde kalıyor, `window.escapeHtml` olarak export edilmiyor.
- `js/validation.js` içindeki `escapeHtml` `window.escapeHtml = ...` olarak export ediliyor.
- `js/app.js` içindeki `window.escapeHtml` global olarak tanımlı.

Ancak `app.js` her sayfada yüklenmiyor (bazı sayfalarda sadece auth.js + toast.js var). Eğer `app.js` yüklenmediyse ve `validation.js` de yüklenmediyse, `escapeHtml` undefined kalabilir.

**Etkilenen durum:**
- dashboard.html → auth.js + toast.js + app.js ✅ (app.js yükleniyor)
- Ancak future proofing için toast.js içindeki escapeHtml window'a export edilmeli

**Çözüm:**
- `js/toast.js` içinde: `window.escapeHtml = escapeHtml;`
- Tüm sayfalarda `js/validation.js` yüklenmesini zorunlu kıl

---

### 7. company-quotes.html — `addModalLineItem` innerHTML XSS
**Risk:** Orta

```js
div.innerHTML='<input type="text" ... required><input type="number" ... required onchange="calcModalTotal()">...';
```

Bu innerHTML sabit string içeriyor (XSS riski düşük), ancak `calcModalTotal()` fonksiyonu çağrıldığında form verileri doğrudan DOM'a yazılıyor. Eğer kullanıcı input'a `<script>` enjekte ederse, innerHTML ile render edilen sayfada çalışabilir.

**Çözüm:**
- `innerHTML` yerine `createElement` + `textContent` kullanımı
- Veya `escapeHtml` tüm kullanıcı girdilerine uygulanmalı

---

## ✅ GÜÇLÜ YÖNLER (3 adet)

1. **Sayfa Seviyesi Yetki Kontrolü:** 30+ sayfada `checkAuth()` aktif, roller doğru ayrılmış (`admin`, `company`, `employee`, `customer`).
2. **Token Doğrulama:** `auth.js` içinde `isValid()` token format, expiry ve demo_ prefix kontrolü yapıyor.
3. **CSP Header'ları:** Tüm sayfalarda CSP meta tag mevcut, inline script/style kısıtlaması (gevşek ama mevcut).

---

## 📋 EYLEM PLANI — Kontrol #2

### Hemen (Bugün)
- [ ] CRUD action fonksiyonlarına (`saveEdit`, `add*`, `delete*`) yetki kontrolü ekle — `AUTH.getUser()?.role` kontrolü
- [ ] `js/toast.js` içindeki `escapeHtml` fonksiyonunu `window.escapeHtml = escapeHtml` olarak export et
- [ ] CDN script tag'lerine SRI `integrity` attribute'ları ekle
- [ ] CSP meta tag'a `frame-ancestors 'self';` ekle

### Kısa Vade (Bu Hafta)
- [ ] Tüm sayfalardaki inline `validateEmail`/`validatePhone` tanımlarını kaldır, `js/validation.js` kullan
- [ ] Tüm formlara `attachFormValidation()` çağrısı ekle
- [ ] Inline `onclick` handler'larını `addEventListener`'a dönüştür (XSS yüzeyini azaltır)
- [ ] `innerHTML` kullanımında `escapeHtml` zorunlu kıl

### Orta Vade
- [ ] Backend API layer + server-side JWT + HttpOnly cookie (önceki raporlardan devam)
- [ ] CSRF token mekanizması
- [ ] Rate limiting planı

---

*Kontrol #2 tamamlandı. Sonraki kontrol: 2026-05-30 08:00*
*Önceki kontrol: security-audit-2026-05-29.md (Kontrol #1)*
