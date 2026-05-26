# CleanFix Güvenlik Kontrolü #2 Raporu
**Tarih:** 2026-05-26 08:00 (Asia/Shanghai)  
**Kapsam:** API endpoint güvenliği, action fonksiyonları yetki kontrolü, CSRF/XSS riskleri, input validasyonu  
**Hedef:** /root/.openclaw/workspace/cleanfix-vercel/

---

## 1. API ENDPOINT GÜVENLİĞİ

### 🔴 KRİTİK BULGU: Gerçek API Endpoint'i Yok
CleanFix şu anda **tamamen client-side statik bir uygulama**. Gerçek bir backend API sunucusu bulunmamaktadır.

| Kontrol | Durum |
|---------|-------|
| REST API endpoint'leri | ❌ Yok |
| GraphQL endpoint | ❌ Yok |
| WebSocket bağlantıları | ❌ Yok |
| Server-side route handlers | ❌ Yok |
| Authentication API | ❌ Yok |
| Authorization middleware | ❌ Yok |

### Mevcut "API" Benzeri Yapılar
```javascript
// js/app.js — OfflineFetch wrapper (kullanılmıyor)
const OfflineFetch = {
  async get(url, cacheKey, ttlMinutes = 30) {
    if (navigator.onLine) {
      try {
        const res = await fetch(url);  // ⚠️ Hiçbir yerde aktif kullanılmıyor
        ...
      }
    }
  }
}
```
- `OfflineFetch.get()` tanımlı ama **hiçbir sayfada aktif olarak çağrılmıyor**
- `DataCache` sadece `localStorage`'a yazıyor — sunucuya veri gitmiyor
- Tüm CRUD operasyonları tarayıcı belleğinde (in-memory `demoData`) ve DOM'da yapılıyor

### Güvenlik Etkisi
- ✅ **Avantaj:** SQL injection, API key leak, server-side RCE gibi backend riskleri yok
- 🔴 **Dezavantaj:** Üretimde backend entegre edildiğinde TÜM bu riskler anında aktif hale gelir
- ⚠️ **Planlama notu:** Backend entegrasyonu yapılacağında API güvenliği sıfırdan kurulmalı

---

## 2. ACTION FONKSİYONLARI YETKİ KONTROLÜ

### 🔴 KRİTİK: Action Fonksiyonlarında Yetki Kontrolü YOK

Tüm CRUD action'ları (ekleme, düzenleme, silme) **herhangi bir rol kontrolü olmadan** çalıştırılabilir.

#### Örnek: company-customers.html
```javascript
function saveEdit() {
  if(editId) {
    // ❌ Rol kontrolü yok — herhangi bir giriş yapmış kullanıcı çalıştırabilir
    const row=document.querySelector(`tr[data-id="${editId}"]`);
    const firstName=document.getElementById('editFirstName').value;
    ...
    row.cells[0].innerHTML=`<div...>${firstName} ${lastName}</div>`;  // XSS riski de var
    showToast(t('toast.customer_updated'));
  }
}

function confirmDelete() {
  if(deleteId) {
    // ❌ Rol kontrolü yok — "Viewer" rolü bile silebilir
    const row=document.querySelector(`tr[data-id="${deleteId}"]`);
    if(row) row.remove();
    showToast(t('toast.customer_deleted'));
  }
}

function addCustomer() {
  // ❌ Rol kontrolü yok
  const firstName=document.getElementById('addFirstName').value;
  ...
}
```

#### Etkilenen Sayfalar ve Action'lar
| Sayfa | Action Fonksiyonları | Yetki Kontrolü |
|-------|---------------------|----------------|
| company-customers.html | `saveEdit()`, `confirmDelete()`, `addCustomer()` | ❌ Yok |
| company-bookings.html | `saveEdit()`, `deleteBooking()`, `addBooking()` | ❌ Yok |
| company-quotes.html | `saveQuote()`, `deleteQuote()`, `addQuoteLineItem()` | ❌ Yok |
| company-staff.html | `saveStaffEdit()`, `deleteStaff()`, `addStaff()` | ❌ Yok |
| company-stock.html | `saveStockEdit()`, `deleteProduct()`, `addProduct()` | ❌ Yok |
| company-services.html | `saveServiceEdit()`, `deleteService()`, `addService()` | ❌ Yok |
| company-equipment.html | `saveEdit()`, `confirmDelete()`, `addEquipment()` | ❌ Yok |
| company-maintenance.html | `saveEdit()`, `confirmDelete()`, `addMaintenance()` | ❌ Yok |
| company-sectors.html | `saveSector()`, `deleteSector()`, `addSector()` | ❌ Yok |
| company-tools.html | `saveToolEdit()`, `deleteTool()`, `addTool()` | ❌ Yok |
| company-invoices.html | `saveInvoice()`, `deleteInvoice()`, `addInvoice()` | ❌ Yok |
| company-expenses.html | `saveExpense()`, `deleteExpense()`, `addExpense()` | ❌ Yok |
| company-quality.html | `saveCheck()`, `deleteCheck()`, `addCheck()` | ❌ Yok |
| company-reviews.html | `confirmDelete()`, `addReview()` | ❌ Yok |
| company-calendar.html | `addEvent()`, `deleteEvent()` | ❌ Yok |
| employee-dashboard.html | `submitIssue()`, `submitLeave()` | ❌ Yok |
| employee.html | `submitLeave()` | ❌ Yok |

#### Dashboard Hızlı İşlemler Butonları
```html
<!-- dashboard.html satır 778 -->
<button class="quick-btn" onclick="window.location.href='company-customers.html'">
  <div class="quick-btn-icon">🏢</div>
  <span>Firma Ekle</span>
</button>
```
- Kod olarak mevcut, onclick handler'lar tanımlı
- 4. buton ("Duyuru Gönder") sadece `showToast()` çağırıyor, gerçek modal açmıyor
- Butonların tıklanabilirlik sorunu muhtemelen CSS z-index veya DOM sıralaması kaynaklı

### Rol Tanımları vs. Gerçek Kontrol
```javascript
// js/auth.js — Rol listesi
// admin, company, employee, manager, accountant, viewer
```
| Rol | Tanımı | Gerçek Kısıtlama |
|-----|--------|-----------------|
| `admin` | Tam erişim | Sadece sayfa yönlendirmesi |
| `company` | Firma sahibi | Sadece sayfa yönlendirmesi |
| `employee` | Personel | Sadece sayfa yönlendirmesi |
| `manager` | Yönetici | ❌ Ayrıcalık yok |
| `accountant` | Muhasebe | ❌ Ayrıcalık yok |
| `viewer` | Sadece görüntüleme | ❌ Silme/düzenleme yapabilir |

**Sonuç:** Rol sistemi sadece giriş sonrası hangi sayfaya yönlendireceğini belirler. Sayfa içindeki action'ları kısıtlamaz.

---

## 3. CSRF / XSS RİSKLERİ

### 3.1 CSRF Koruması: 🔴 TAMAMEN EKSİK

| CSRF Önlemi | Durum |
|-------------|-------|
| CSRF token'ları (form hidden field) | ❌ Yok |
| SameSite cookie attribute | ❌ Cookie kullanılmıyor |
| Origin/Referer header kontrolü | ❌ Backend yok |
| Double-submit cookie pattern | ❌ Yok |
| Custom request header'ları | ❌ Yok |

**Açıklama:** CSRF koruması olmaması şu an için düşük risk çünkü backend yok. Ancak backend eklendiğinde kullanıcı oturumu çalınabilir ve saldırgan kullanıcının adına işlem yapabilir.

### 3.2 XSS (Cross-Site Scripting) Riskleri: 🔴 YÜKSEK

#### A. innerHTML Kullanımı — Doğrudan Enjeksiyon Riski

| Dosya | Satır | Kod | Risk Seviyesi |
|-------|-------|-----|---------------|
| company-customers.html | ~957 | `row.cells[0].innerHTML=\`<div...>${firstName} ${lastName}</div>\`` | 🔴 Yüksek — Kullanıcı adı XSS payload içerebilir |
| company-customers.html | ~975 | `tr.innerHTML=\`<td>...${firstName} ${lastName}...${email}</td>\`` | 🔴 Yüksek — Yeni müşteri ekleme formu |
| company-bookings.html | ~833 | `td6.innerHTML='<button onclick="openEditModal('+newId+')"'` | 🔴 Yüksek — Tablo hücresi |
| company-quotes.html | ~937 | `actions.innerHTML='<button onclick="toggleExpand('+id+')"'` | 🔴 Yüksek — Teklif action butonları |
| company-staff.html | ~861 | `td6.innerHTML='...onclick="openEditModal('+newId+')"'` | 🔴 Yüksek — Personel action butonları |
| company-tools.html | ~1475 | `itemsContainer.innerHTML = data.items.map(...)` | 🔴 Yüksek — Araç kutusu içeriği |
| company-tools.html | ~1534 | `chemBody.innerHTML = data.body` | 🔴 Yüksek — Kimyasal içerik |
| company-sectors.html | ~1400 | `tr.innerHTML=\`<td>${sector.name}</td>...\`` | 🔴 Yüksek — Sektör listesi |
| company-sectors.html | ~1487 | `statusRow.innerHTML = '<span style="background:' + color + '">'` | 🟡 Orta — CSS injection |
| js/toast.js | ~121 | `toast.innerHTML = \`...\`` | 🟡 Orta — Toast mesajı kullanıcı girdisiyse |
| i18n-full.js | Çoklu | `el.innerHTML = t` (HTML içeriyorsa) | 🟡 Orta — Çeviri metinleri |

#### B. Event Handler Injection (`onclick` ile dinamik değerler)

```javascript
// company-quotes.html
// Kullanıcı kontrolündeki `newId` değişkeni doğrudan onclick'e enjekte ediliyor
td6.innerHTML='<button onclick="openEditModal('+newId+')"></button>'

// Eğer newId manipüle edilebilirse:
// newId = '1);alert(document.cookie);//'
// Sonuç: onclick="openEditModal(1);alert(document.cookie);//)"
```

#### C. URL Parameter Reflected XSS Potansiyeli

```javascript
// login.html
const urlParams = new URLSearchParams(window.location.search);
const redirectParam = urlParams.get('redirect');
// redirectParam doğrudan ekrana yazılmıyor ama location.href'de kullanılıyor
// ?error=unauthorized  — error parametresi ekrana yansıtılıyorsa XSS riski var
```

#### D. innerHTML Kullanımı Olmayan Güvenli Alanlar
```javascript
// ✅ textContent kullanımı (XSS'e karşı güvenli)
row.cells[3].textContent = phone;  // company-customers.html
row.cells[5].textContent = demoData[editId].jobs.length;

// ✅ DOMPurify veya benzeri sanitizasyon kütüphanesi
// ❌ Yok — eklenmeli
```

### 3.3 Clickjacking Riski

| Önlem | Durum |
|-------|-------|
| `X-Frame-Options` header | ❌ Yok (static site, server config gerekir) |
| CSP `frame-ancestors` | ❌ Yok |
| `Content-Security-Policy` mevcut | ✅ Var ama `frame-ancestors` eksik |

---

## 4. INPUT VALIDASYONU

### 4.1 Mevcut Validasyonlar (validation.js)

```javascript
// js/validation.js
validateEmail(email)    // Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
validatePhone(phone)    // En az 7 rakam
validateRequired(fields) // Boş alan kontrolü
validateDateRange(start, end) // Tarih karşılaştırması
```

| Validasyon Türü | Uygulama | Yeterlilik |
|-----------------|----------|------------|
| Email format | Regex | 🟡 Temel — TLD kontrolü yok |
| Telefon | 7+ rakam | 🟡 Çok gevşek — format kontrolü yok |
| Zorunlu alanlar | `required` attribute + JS | ✅ Çalışıyor |
| Tarih aralığı | Date karşılaştırması | ✅ Çalışıyor |
| Şifre güçlülüğü | Min 6 karakter | 🔴 Çok zayıf |

### 4.2 Eksik Validasyonlar

| Input Türü | Eksik Kontrol | Risk |
|------------|--------------|------|
| HTML/JavaScript enjeksiyonu | ❌ Yok | 🔴 XSS |
| SQL injection | ❌ Yok | 🔴 Backend eklendiğinde kritik |
| Uzunluk limitleri (max length) | ❌ Çoğu alanda yok | 🟡 DoS / veri bütünlüğü |
| Özel karakter filtresi | ❌ Yok | 🟡 XSS / injection |
| Sayısal aralık kontrolü | ❌ Parça parça | 🟡 Negatif fiyat, vb. |
| File upload validasyonu | ❌ Upload yok | N/A |

### 4.3 Sayfa Bazlı Validasyon Derinliği

| Sayfa | Form Validasyonu | HTML Sanitizasyonu | Çıktı Encoding |
|-------|-----------------|-------------------|--------------|
| login.html | ✅ Email + min 6 şifre | ❌ Yok | ✅ textContent (kısmen) |
| company-customers.html add/edit | ✅ Zorunlu alanlar | ❌ Yok | ❌ innerHTML |
| company-bookings.html add/edit | ✅ Zorunlu alanlar | ❌ Yok | ❌ innerHTML (kısmen) |
| company-quotes.html | 🟡 Mininal | ❌ Yok | ❌ innerHTML |
| company-staff.html | ✅ Zorunlu alanlar | ❌ Yok | ❌ innerHTML |
| company-stock.html | ✅ Zorunlu alanlar | ❌ Yok | ❌ innerHTML |
| employee-dashboard.html | 🟡 Minimal | ❌ Yok | ❌ innerHTML |

### 4.4 Şifre Politikası

```javascript
// login.html
if (!password || password.length < 6) { ... }
```
- ❌ Min 6 karakter — çok zayıf
- ❌ Büyük/küçük harf zorunluluğu yok
- ❌ Rakam zorunluluğu yok
- ❌ Özel karakter zorunluluğu yok
- ❌ Şifre göster/gizle toggle var mı kontrol edilmedi

---

## 5. ÖZET & ÖNERİLEN EYLEM PLANI

### 🔴 KRİTİK (Hemen Düzeltilmeli)

1. **innerHTML → textContent/DOMPurify geçişi**
   - Tüm `innerHTML` kullanımları `textContent`'e çevrilmeli
   - HTML formatlama şart olan yerlerde DOMPurify ile sanitizasyon yapılmalı
   - Event handler injection'ları (`onclick` içinde dinamik değer) kaldırılmalı

2. **Action fonksiyonlarına yetki kontrolü ekleme**
   - Her save/delete/edit/add fonksiyonunun başına rol kontrolü:
   ```javascript
   function saveEdit() {
     const user = AUTH.getUser();
     if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
       showToast('Yetkisiz işlem', 'error');
       return;
     }
     ...
   }
   ```

3. **Form input'larına maxlength ve pattern attribute'ları**
   - `<input maxlength="100" pattern="[A-Za-z0-9 ]+">`
   - Sayısal alanlara min/max değerler

### 🟡 ORTA (Planlanmalı)

4. **CSRF token sistemi** — Backend entegrasyonu ile birlikte:
   - Her form'a `<input type="hidden" name="csrf_token">`
   - SameSite=Strict cookie attribute

5. **Şifre politikası güçlendirme**
   - Min 8 karakter, en az 1 büyük harf, 1 küçük harf, 1 rakam, 1 özel karakter

6. **CSP `frame-ancestors` direktifi**
   - `frame-ancestors 'none';` veya `'self'`

7. **`base-uri 'self'` ve `form-action 'self'` CSP direktifleri**

### 🟢 DÜŞÜK (İyileştirme)

8. **Input validasyon kütüphanesi genişletme**
   - URL validasyonu
   - IBAN/BTW (Belçika vergi numarası) validasyonu
   - Para birimi format validasyonu

9. **Audit logging** (client-side geçici)
   - Başarısız giriş denemeleri
   - Yetkisiz işlem denemeleri
   - localStorage manipülasyonu tespiti

10. **eval() / document.write() taraması**
    - ✅ `eval()` kullanımı bulunmadı
    - ✅ `document.write()` kullanımı bulunmadı
    - ✅ `Function()` constructor kullanımı bulunmadı

---

## 6. GELECEK BACKEND ENTEGRASYONU İÇİN GÜVENLİK CHECKLIST

Backend eklendiğinde aşağıdaki kontroller **zorunlu** olmalı:

- [ ] Server-side JWT + HttpOnly cookie authentication
- [ ] Tüm API endpoint'leri için authentication middleware
- [ ] Tüm API endpoint'leri için authorization middleware (rol bazlı)
- [ ] CSRF token koruması
- [ ] Rate limiting (login, API çağrıları)
- [ ] Input sanitizasyonu (XSS önlemi)
- [ ] SQL/NoSQL injection koruması (parameterized queries)
- [ ] CORS policy (sadece trusted origin'ler)
- [ ] API request logging & monitoring
- [ ] Error handling (stack trace leak önlemi)

---

**Raporlayan:** Aslan (Güvenlik Kontrol Botu)  
**Önceki Rapor:** security-audit-2026-05-26.md (Auth, CSP, Rol Kontrolleri)  
**Sonraki Adım:** Kritik innerHTML XSS risklerinin düzeltilmesi + action fonksiyonlarına yetki kontrolü eklenmesi
