# CleanFix Güvenlik Kontrolü #2 — 2026-05-31 08:00 CST
## API Endpoint Güvenliği, Action Fonksiyonları Yetki Kontrolü, CSRF/XSS Riskleri, Input Validasyonu

---

## 📊 GENEL DURUM ÖZETİ

| Kategori | Durum | Not |
|---|---|---|
| **API Endpoint'leri (Gerçek)** | ✅ Yok | Tamamen statik/demo uygulama — fetch/XMLHttpRequest/axios kullanımı yok |
| **Action Yetki Kontrolü (requireRoleForAction)** | ✅ 22/23 fonksiyon | 1 fonksiyonda duplicate → guard bypass |
| **eval() / new Function()** | ✅ Yok | Kullanım yok |
| **setTimeout string** | ✅ Yok | Kullanım yok |
| **Input Validasyonu (login)** | ✅ Email + şifre min 6 | Aktif |
| **Input Validasyonu (formlar)** | ✅ Zorunlu alan + email + telefon | validation.js ile |
| **Open Redirect Engellemesi** | ✅ Aktif | Whitelist korunuyor |
| **CSRF Koruması** | ❌ Yok | Statik uygulama — üretimde eklenmeli |
| **XSS — innerHTML escape coverage** | ⚠️ Kısmi | 5+ dosyada escape edilmemiş kullanıcı girdisi innerHTML'ye yazılıyor |
| **XSS — company-customers detail panel** | 🔴 Kritik | `body.innerHTML` kullanıcı girdisi escape edilmemiş |
| **XSS — company-sectors card render** | 🔴 Kritik | `card.innerHTML` data objesi escape edilmemiş |
| **Auth Bypass (deleteSectorCard)** | 🔴 Kritik | Duplicate fonksiyon tanımı → guard devre dışı |
| **Inline onclick handler'lar** | 🟡 Çok fazla | company-sectors.html: 170+ adet |
| **document.write (printSection)** | 🟡 Var | `el.outerHTML` kullanıcı girdisi içeriyorsa XSS riski |
| **Client-Side Auth Bypass** | ⚠️ Bilinen | localStorage editlenebilir — demo limitasyonu |

**Genel Güvenlik Skoru: 5.8/10** (↓ Kontrol #1: 6.5/10 — yeni XSS ve auth bypass bulguları)

---

## 🔴 KRİTİK — Yeni Bulgular

### 1. deleteSectorCard — Duplicate Fonksiyon Tanımı → Auth Bypass
**Risk:** Kritik | **CVSS:** ~6.5 | **Dosya:** `company-sectors.html`
**Yeni bulgu.**

`deleteSectorCard(id)` fonksiyonu dosyada **iki kez** tanımlanmış:

- **Satır 1460:** `function deleteSectorCard(id) {if (!AUTH.requireRoleForAction(['admin','company'], 'deleteSectorCard')) return; ...}` ✅ Guard'lı
- **Satır 2631:** `function deleteSectorCard(id) { const card = document.querySelector(...); card.remove(); ...}` ❌ Guard **YOK**

JavaScript'te son tanım geçerli olduğundan, **satır 2631'deki guard'sız versiyon çalışır.** `requireRoleForAction` kontrolü hiçbir zaman devreye girmez. `employee` rolündeki bir kullanıcı sektör silebilir.

**Çözüm:** Satır 2631'deki `deleteSectorCard` tanımını sil. Satır 1460'daki guard'lı versiyon tek tanım kalmalı.

---

### 2. company-customers.html — XSS via Detail Panel (body.innerHTML)
**Risk:** Kritik | **CVSS:** ~6.1 | **Dosya:** `company-customers.html` ~satır 980
**Yeni bulgu.**

`openCustomerDetail(id)` fonksiyonunda `body.innerHTML` ile dinamik içerik oluşturuluyor. Kullanıcı girdisi olan alanlar **escape edilmemiş**:

```js
body.innerHTML=`
  <div>${d.firstName} ${d.lastName}</div>     <!-- XSS payload mümkün -->
  <div>${d.email}</div>                        <!-- XSS payload mümkün -->
  <div>${d.phone}</div>                        <!-- XSS payload mümkün -->
  <div>${d.address}</div>                      <!-- XSS payload mümkün -->
  <div>${d.notes}</div>                        <!-- XSS payload mümkün -->
  <div>${d.company}</div>                      <!-- XSS payload mümkün -->
  <div>${jobsHtml}</div>                       <!-- j.service, j.staff, j.cost escape edilmemiş -->
`;
```

Müşteri adı alanına `<img src=x onerror=alert(1)>` yazıldığında, detay paneli açıldığında payload çalışır.

**Çözüm:** Tüm `d.*` değişkenlerini `escapeHtml()` ile wrap'la:
```js
<div>${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)}</div>
```

---

### 3. company-customers.html — XSS via addCustomer (tr.innerHTML)
**Risk:** Kritik | **CVSS:** ~6.1 | **Dosya:** `company-customers.html` ~satır 950
**Yeni bulgu.**

`addCustomer()` fonksiyonunda `tr.innerHTML` oluşturulurken bazı alanlar escape edilmemiş:

```js
tr.innerHTML=`<td>${escapeHtml(firstName)} ...</td>
  <td>${phone}</td>                              <!-- escape edilmemiş -->
  <td><span class="tag">${typeLabel}</span></td> <!-- escape edilmemiş (typeLabel i18n ama güvenli) -->
  ...`;
```

`phone` alanı kullanıcı girdisinden geliyor ve escape edilmemiş.

**Çözüm:** `escapeHtml(phone)` ekle.

---

### 4. company-sectors.html — XSS via addNewSectorCard (card.innerHTML)
**Risk:** Kritik | **CVSS:** ~6.1 | **Dosya:** `company-sectors.html` ~satır 2676
**Yeni bulgu.**

`addNewSectorCard(data)` fonksiyonunda `card.innerHTML` kullanılıyor. `data` objesinin tüm alanları escape edilmemiş:

```js
card.innerHTML = `
  <div class="card-title">${data.name || 'Yeni Sektör'}</div>    <!-- XSS -->
  <div class="card-subtitle">${data.subtitle || ''}</div>         <!-- XSS -->
  <div>${data.icon || '&#128230;'}</div>                          <!-- XSS -->
  <div>${data.status}</div>                                       <!-- XSS -->
  <div>${data.firms}</div>                                        <!-- XSS -->
  <div>${data.revenue}</div>                                      <!-- XSS -->
`;
```

Sektör adı alanına `<script>alert(1)</script>` yazıldığında payload çalışır.

**Çözüm:** Tüm `data.*` değişkenlerini `escapeHtml()` ile wrap'la.

---

## 🟡 ORTA — Yeni Bulgular

### 5. document.write XSS Riski (printSection)
**Risk:** Orta | **Dosya:** `js/app.js` ~satır 115
**Yeni bulgu.**

```js
window.printSection = function printSection(selector) {
  const el = document.querySelector(selector);
  w.document.write('<html>...<body>' + el.outerHTML + '</body></html>');
};
```

`el.outerHTML` escape edilmemiş içerik içeriyorsa (kullanıcı girdisi), `document.write` üzerinden XSS mümkün. `printSection` sadece admin/company dashboard'larında çağrılıyor, risk düşük ama var.

**Çözüm:** `document.write` yerine `createElement` + `textContent` kullan. Veya `el.outerHTML`'i `escapeHtml`'den geçir.

---

### 6. Inline onclick Handler Yoğunluğu
**Risk:** Orta-Düşük | **Yeni bulgu.**

| Sayfa | onclick Sayısı | Not |
|---|---|---|
| company-sectors.html | 170+ | En yüksek — kademeli `addEventListener` dönüşümlü |
| company-quotes.html | 62 | Orta |
| company-customers.html | 76 | Orta |
| company-services.html | 68 | Orta |
| company-staff.html | 51 | Orta |
| company-bookings.html | 58 | Orta |

Inline onclick handler'lar CSP `unsafe-inline` gerektirir ve XSS surface alanını genişletir. Ayrıca `event.stopPropagation()` gibi pattern'lerle iç içe çağrılar karmaşık hale gelir.

**Çözüm:** Kademeli olarak `addEventListener` + data-attribute pattern'ine geçiş. Öncelik: company-sectors.html (170 adet).

---

## 🟢 DÜŞÜK / Bilinen

### 7. CSRF Koruması Yok
**Risk:** Düşük-Orta | **Değişim:** Yok (Mimari)

Statik/demo uygulama. Üretimde:
- `SameSite=Strict` cookie
- `X-CSRF-Token` header validasyonu

### 8. Client-Side Auth Bypass
**Risk:** Düşük-Orta | **Değişim:** Yok (Mimari limitasyon)

`localStorage`'daki `kobipro_user` JSON'ı editlenebilir. Üretimde server-side JWT + HttpOnly cookie zorunlu.

### 9. CSP `unsafe-inline`
**Risk:** Orta | **Değişim:** Yok (Demo mimarisi gereği)

170+ inline onclick + inline style kullanımı var. Üretimde nonce bazlı CSP'ye geçiş gerekli.

---

## ✅ GÜÇLÜ YÖNLER (Korunuyor)

1. **Token Üretimi:** `crypto.getRandomValues` — kriptografik olarak güvenli
2. **Demo Token Reddi:** `demo_` prefix'li token'lar otomatik logout
3. **Rol Kontrolleri:** Sayfa yüklenme kontrolleri 30+ sayfada aktif
4. **CRUD Guard'ları:** 22/23 fonksiyonda `requireRoleForAction` mevcut (1 duplicate hariç)
5. **CSP frame-ancestors:** 37/37 sayfa — clickjacking koruması
6. **SRI Hash'leri:** Tüm CDN kütüphanelerinde integrity attribute
7. **Open Redirect Engellemesi:** Login redirect whitelist ile korunuyor
8. **Input Validasyonu:** Email regex, telefon min 7 hane, şifre min 6 karakter
9. **eval() / new Function() / setTimeout-string:** Yok

---

## 📋 EYLEM PLANI

### Hemen (Bugün)
- [ ] **company-sectors.html satır 2631** → `deleteSectorCard` duplicate tanımı sil. Guard'lı versiyon (satır 1460) tek kalmalı.
- [ ] **company-customers.html** → `openCustomerDetail` içindeki `body.innerHTML` tüm değişkenleri `escapeHtml()` ile wrap'la.
- [ ] **company-customers.html** → `addCustomer` içinde `phone` değişkenini `escapeHtml(phone)` yap.
- [ ] **company-sectors.html** → `addNewSectorCard` içindeki `card.innerHTML` tüm `data.*` alanlarını `escapeHtml()` ile wrap'la.

### Kısa Vade (Bu Hafta)
- [ ] `document.write` kullanımını `createElement` + `textContent`'e dönüştür (app.js printSection)
- [ ] company-sectors.html'de 170+ inline onclick'ı kademeli olarak `addEventListener`'a dönüştür (en yüksek öncelik)
- [ ] Diğer company sayfalarında innerHTML kullanımını taramaya devam et, escape coverage'ı tamamla

### Orta Vade (1-3 Ay — Üretim Yol Haritası)
- [ ] **Server-side JWT + HttpOnly cookie auth geçişi**
- [ ] **Backend API layer** ekle — Tüm veri server'dan gelsin
- [ ] **Rate limiting** planı
- [ ] **CSRF token** mekanizması
- [ ] **Nonce bazlı CSP** — `unsafe-inline` kaldır
- [ ] **DOMPurify entegrasyonu** — Tüm dynamic content için

---

## 🏁 KONTROL #2 SONUÇ ÖZETİ

Bu kontrolde **4 yeni kritik bulgu** tespit edildi:

1. **Auth bypass** — `deleteSectorCard` duplicate fonksiyonu guard'ı bypass ediyor.
2. **XSS** — `company-customers.html` detail paneli kullanıcı girdisini escape etmiyor.
3. **XSS** — `company-customers.html` addCustomer `phone` escape etmiyor.
4. **XSS** — `company-sectors.html` card render kullanıcı girdisini escape etmiyor.

Tüm kritik bulgular **client-side** ve **hızlıca fix edilebilir** (`escapeHtml` wrapper + duplicate fonksiyon silme). Üretim yol haritasındaki server-side geçiş tek kalıcı çözüm.

**Not:** Bu uygulama tamamen statik — gerçek API endpoint'i yok. "API endpoint güvenliği" kontrolü sonucu: API endpoint bulunamadı. Tüm veri client-side localStorage/memory'de.

---

*Rapor: SECURITY_CONTROL_2_2026-05-31.md*  
*Önceki: SECURITY_CONTROL_1_2026-05-31.md*
