# Güvenlik Kontrolü #2 Raporu — CleanFix SaaS
**Tarih:** 2026-05-30 08:00 (Asia/Shanghai)  
**Kapsam:** 36 HTML, 3 CSS, 6 JS modülü, ~36.243 satır  
**Analizci:** Aslan (OpenClaw)

---

## 1. CRITICAL — Client-Side Auth Bypass

### Bulgu
`AUTH.requireRoleForAction()` fonksiyonu `localStorage`'daki `kobipro_user` JSON objesine bakıyor. Yetkilendirme tamamen client-side.

```javascript
// js/auth.js
function requireRoleForAction(roles, action) {
  const user = getCurrentUser(); // localStorage'dan okuyor
  if (!user || !roles.includes(user.role)) { ... }
}
```

### Risk
`localStorage.setItem('kobipro_user', JSON.stringify({ role: 'admin', name: 'Hacker' }))` ile herhangi bir kullanıcı `admin`/`company` yetkisi kazanabilir. Tüm CRUD işlemleri (müşteri, rezervasyon, personel, fatura) bypass edilebilir.

### Çözüm
- **Server-side JWT** doğrulaması zorunlu. Her action request'i `Authorization: Bearer <token>` header ile server'a gitmeli.
- Token **HttpOnly cookie** olarak saklanmalı (`localStorage` yerine).
- Role bilgisi **server'dan** gelmeli, client-side localStorage'dan okunmamalı.

---

## 2. HIGH — XSS (Cross-Site Scripting) Riskleri

### 2A. company-customers.html — `openCustomerDetail()`
Müşteri detay panelinde `innerHTML` ile doğrudan interpolasyon:
```javascript
body.innerHTML = `
  <div class="info-value">${d.email}</div>
  <div class="info-value">${d.phone}</div>
  <div class="info-value">${d.address}</div>
  <div class="info-value">${d.notes}</div>
`;
```
`d.email`, `d.phone`, `d.notes` **escapeHtml ile korunmuyor**. Eğer demoData içindeki veya API'den gelen veri `<script>` içeriyorsa, XSS tetiklenir.

### 2B. company-customers.html — `saveEdit()` / `addCustomer()`
`saveEdit` içinde `escapeHtml(firstName)` kullanılmış ama `company` alanı bazı yerlerde `escapeHtml` ile korunmuyor:
```javascript
row.cells[1].innerHTML = company ? `<div style="font-weight:600;">${escapeHtml(company)}</div>` : '—';
```
Bu satır escapeHtml kullanıyor, ancak `row.cells[3].textContent = phone` güvenli. Genel olarak `innerHTML` kullanımı minimumda tutulmuş ama yine de riskli.

### 2C. company-bookings.html — `addBooking()`
```javascript
td6.innerHTML = '<div class="actions"><button onclick="openEditModal('+newId+')" ...';
```
`newId` sayısal olduğundan doğrudan XSS riski düşük, ancak `renderCards()` içinde `card.innerHTML` ile template literal kullanımı var. `customer`, `service` gibi veriler `textContent` ile dolduruluyor (güvenli).

### Çözüm
- Tüm `innerHTML` interpolasyonları `escapeHtml` ile korunmalı.
- Mümkünse `innerHTML` yerine `textContent` + `createElement` kullanımı tercih edilmeli.
- `openCustomerDetail()` içinde tüm interpolasyon değerleri `escapeHtml()` ile sarmalanmalı.

---

## 3. MEDIUM — CSP (Content Security Policy) Zayıflıkları

### Bulgu
`employee.html` CSP meta tag:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; ...">
```

- `script-src 'unsafe-inline'` → Inline script'ler çalışıyor. XSS payload inline `<script>` olarak çalışabilir.
- `style-src 'unsafe-inline'` → Inline style'lar çalışıyor. CSS injection riski.

### Çözüm
- `nonce` bazlı CSP'ye geçiş. Her istekte sunucu tarafından rastgele nonce üretilmeli.
- Inline script'ler `<script nonce="...">` olarak işaretlenmeli.
- `unsafe-inline` kaldırılmalı.

---

## 4. MEDIUM — CSRF (Cross-Site Request Forgery) Koruması Yok

### Bulgu
Proje şu an statik/demo olduğundan server-side POST/PUT/DELETE endpoint'leri yok. Ancak production geçişinde:
- Her mutasyon isteği (POST/PUT/DELETE/PATCH) için **CSRF token** zorunlu.
- Token `SameSite=Strict` cookie + hidden form field olarak çift katmanlı olmalı.

### Çözüm
- API endpoint'lerinde `X-CSRF-Token` header validasyonu.
- `SameSite=Strict` attribute tüm auth cookie'lerine.

---

## 5. LOW — Hardcoded Demo Verileri

### Bulgu
`employee.html` içinde bazı demo verileri sabit:
- `Ahmet Kaya` — profil adı sabit.
- `Rue de la Loi 42, 1040 Brüksel` — adres sabit.
- `Personel ID: CF-2023-0142` — ID sabit.

### Pozitif
PII hassas veriler (IBAN, maaş, telefon, e-posta) API placeholder olarak ayarlanmış:
```html
<div>[IBAN — API'den çekilir]</div>
<div>[TEL — API]</div>
<div>[E-POSTA — API]</div>
```
Bu iyi bir pratik. Ancak production geçişinde bu placeholder'lar gerçek API endpoint'lerine bağlanmalı.

### Çözüm
- Production'da tüm demo verileri kaldır, API'den dinamik çek.
- Adres, personel ID gibi verileri de API'den getir.

---

## 6. LOW — Input Validasyonu Client-Side Only

### Bulgu
Tüm form validasyonu JavaScript ile client-side yapılıyor. Server-side validation olmadığı için bypass edilebilir.

### Pozitif
- Email regex validasyonu var: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Telefon min 7 hane kontrolü var.
- Password min 6 karakter kontrolü var.

### Çözüm
- Production API layer'ında server-side validation zorunlu.
- Zod/Joi schema validation backend'e eklenmeli.

---

## 7. POSITIVE — Açık Yönlendirme (Open Redirect) Engellemesi

`login.html` içinde `redirect` query parametresi whitelist ile kontrol ediliyor:
```javascript
const ALLOWED_REDIRECTS = {
  'buildpro': 'https://mcemkoca.github.io/buildpro-vercel/dashboard.html',
  'barberpro': 'https://mcemkoca.github.io/barberpro-vercel/dashboard.html'
};
if (redirectParam && ALLOWED_REDIRECTS[redirectParam]) { ... }
```
✅ Bu iyi bir güvenlik pratiği. Open redirect vulnerability engellenmiş.

---

## 8. Özet — Risk Matrisi

| Kategori | Risk | Durum | Dosya |
|----------|------|-------|-------|
| Client-side auth bypass | **CRITICAL** | 🔴 | `js/auth.js` |
| XSS (innerHTML interpolasyon) | **HIGH** | 🔴 | `company-customers.html`, `company-bookings.html` |
| CSP zayıflık | **MEDIUM** | 🟡 | `employee.html` (meta tag) |
| CSRF koruması yok | **MEDIUM** | 🟡 | Tüm API endpoint'ler (gelecek) |
| Hardcoded demo veri | **LOW** | 🟡 | `employee.html` |
| Client-only validation | **LOW** | 🟡 | Tüm form'lar |
| Open redirect fix | **POSITIVE** | ✅ | `login.html` |
| Email/phone validation | **POSITIVE** | ✅ | Tüm sayfalar |

---

## 9. Önerilen Öncelikli Fix'ler

1. **Server-side JWT + HttpOnly cookie** — Auth bypass'i tamamen çözer.
2. **Tüm `innerHTML` interpolasyonları `escapeHtml()` ile sarmala** — XSS'i minimize eder.
3. **Nonce bazlı CSP** — `unsafe-inline` kaldır.
4. **CSRF token + SameSite=Strict** — Production API geçişinde.
5. **Demo verileri API'ye bağla** — PII temizliği tamamlanır.

---
*Rapor: /root/.openclaw/workspace/cleanfix-vercel/security-report-2026-05-30.md*
