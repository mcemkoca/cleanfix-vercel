# CleanFix Güvenlik Kontrolü #3 — Son Tur Raporu
**Tarih:** 2026-05-27 09:00 CST  
**Kapsam:** Customer portal izolasyonu, Employee portal izolasyonu, Data leak kontrolü, Cookie/güvenlik başlıkları, Cross-portal erişim  
**Toplam Sayfa:** 36 HTML dosyası + 8 JS modülü

---

## 1. Portal İzolasyonu — ROL TABANLI ERİŞİM KONTROLÜ

### ✅ Doğru Şekilde Korumalı Sayfalar (Rol Zorunlu + Çalışıyor)

| Sayfa | Gerekli Rol | Kontrol Mekanizması | Durum |
|---|---|---|---|
| dashboard.html | admin | `checkAuth('admin')` | ✅ Çalışıyor |
| customer-portal.html | customer | `checkAuth('customer')` | ✅ Çalışıyor |
| employee-dashboard.html | employee | `checkAuth('employee')` | ✅ Çalışıyor |
| employee.html | employee | `checkAuth('employee')` (2x) | ✅ Çalışıyor |
| employee-tasks.html | employee | `checkAuth('employee')` | ✅ Çalışıyor |
| company*.html (18 sayfa) | admin / company | `checkAuth(['admin','company'])` | ✅ Çalışıyor |

### ⚠️ KRİTİK: Rol Kontrolü EKSİK Sayfalar (Sadece Giriş Kontrolü)

Aşağıdaki sayfalar sadece `checkAuth()` ile giriş yapmış olma durumunu kontrol ediyor, **rol kontrolü yapmıyor**:

- `bookings.html`
- `customers.html`
- `invoices.html`
- `products.html`
- `reports.html`
- `services.html`
- `settings.html`
- `staff.html`
- `support.html`

**Risk:** Bir `customer` giriş yaptıktan sonra URL'yi değiştirip `staff.html`'e gidebilir. Aynı şekilde `employee` de `bookings.html`'e erişebilir. Bu sayfaların arayüzünü görmek yetkisiz kullanıcıya iş akışı hakkında bilgi sızdırır.

### 🔴 KRİTİK: Client-Side Rol Kontrolü — Bypass Edilebilir

`auth.js`'teki tüm rol kontrolü **client-side localStorage** üzerinden:

```javascript
checkAuth(requiredRole) {
  const user = this.getUser(); // localStorage'dan okuyor
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (!user || !roles.includes(user.role)) {
    window.location.replace('login.html?error=unauthorized');
    return false;
  }
}
```

**Bypass yöntemi (Browser Console):**
```javascript
localStorage.setItem('kobipro_user', JSON.stringify({role:'admin', name:'Hacker'}));
// Artık admin paneline erişim sağlanabilir
```

**Sonuç:** Rol kontrolü var ama client-side olduğu için güvenli değil. Üretimde server-side JWT + session olmalı.

---

## 2. Cross-Portal Veri Erişimi — DATA LEAK ANALİZİ

### 🔴 KRİTİK: Aynı Origin'de Tüm Veriler Erişilebilir

CleanFix tüm portal'ları aynı origin'de (`mcemkoca.github.io/cleanfix-vercel/`) host ediyor. Bu demek oluyor ki:

| Durum | Risk |
|---|---|
| Customer giriş yapmış | `employee.html` kaynağını tarayıcı "View Source" ile okuyabilir → Maaş, IBAN, adres görebilir |
| Employee giriş yapmış | `company-customers.html` kaynağını okuyabilir → Müşteri telefon, adres, gelir görebilir |
| Herhangi bir kullanıcı | `login.html`'den sonra tüm `.html` dosyalarına HTTP GET yapabilir |

### 🔴 KRİTİK: Employee Portal'da Sabit Kodlanmış Hassas Veriler

`employee.html` dosyasında **doğrudan HTML içine gömülü** gerçekçi demo veriler:

| Veri Türü | Değer | Satır |
|---|---|---|
| **IBAN** | BE68 1234 5678 9012 | 975, 1190 |
| **Temel Maaş** | €2.450,00 | 958 |
| **Net Ödeme** | €1.707,68 | 966 |
| **Brüt Toplam** | €2.799,50 | 962 |
| **Gelir Vergisi** | €587,90 | 963 |
| **Sosyal Sigorta** | €363,94 | 964 |
| **Emeklilik Kesintisi** | €139,98 | 965 |
| **Fazla Mesai** | €94,50 (6.5h × €14.5) | 959 |
| **Performans Primi** | €180,00 | 960 |
| **Ulaşım Ödeneği** | €75,00 | 961 |
| **E-posta** | ahmet.kaya@cleanfix.be | 1178 |
| **Telefon** | +32 470 98 76 54 | 1182 |
| **Adres** | Avenue Louise 142, 1050 Brüksel | 1185 |
| **Bordro Geçmişi** | Son 6 ay (Aralık 2025 - Mayıs 2026) | 988-993 |

**Risk:** Bu veriler tarayıcı "View Source" ile herkese açık. Giriş yapmadan bile erişilebilir (sayfa kaynağı indirilebilir). Üretimde bu veriler API'den, yetki filtreli gelmeli.

### 🟡 ORTA: Customer Portal'da Sabit Kodlanmış Müşteri Verisi

`customer-portal.html`'de Jan Peeters profili:
- E-posta: jan.peeters@kantoor.be
- Telefon: +32 470 12 34 56
- Adres: Avenue de la Toison d'Or 72, 1050 Bruxelles

`company-customers.html`'de:
- Müşteri e-posta: sarah.j@gmail.com
- Adres: Avenue Louise 88, 1050 Bruxelles
- Gelir verisi: €623 toplam, €89 ortalama iş

### 🟢 İyi: localStorage'da Cross-Portal Veri Paylaşımı Yok

Her portal kendi veri setini ayrı localStorage key'leri ile kullanmıyor (veri zaten HTML içinde sabit kodlanmış). Ancak `kobipro_auth_token` ve `kobipro_user` tüm portal'lar tarafından paylaşılıyor — bu bir session yönetimi zafiyeti.

---

## 3. Oturum / Cookie Güvenliği

### 🔴 KRİTİK: localStorage Kullanımı (Cookie Değil)

Auth modülü `localStorage`'da saklıyor:
- `kobipro_auth_token` — token
- `kobipro_user` — kullanıcı nesnesi (rol, isim, e-posta)
- `cf_remember_me` — beni hatırla ayarı

**Sorunlar:**
- `localStorage` JavaScript ile okunabilir — XSS varsa token çalınır
- `HttpOnly` mümkün değil (cookie değil)
- `Secure` flag yok (localStorage otomatik http/https ayırmaz)
- `SameSite` koruma yok
- **Token `cf_` prefixli — demo_token'lar temizleniyor (iyi)**

### ✅ İyileştirmeler (v2 Auth)

- Eski `demo_` prefixli token'lar `isValid()` içinde reddediliyor ve otomatik logout yapılıyor
- Token `window.crypto.getRandomValues` ile 16 byte üretiliyor
- Zaman aşımı: 24 saat (default), 7 gün (remember me)
- `window.location.replace('login.html')` ile geri butonu koruması

### ⚠️ Eksik: Session Invalidate Mekanizması

- Logout dışında session invalidate yok
- Concurrent session kontrolü yok
- Şifre değişikliği sonrası tüm session'ları invalidate etme yok

---

## 4. CSP (Content Security Policy) Durumu

### ✅ Tüm 36 HTML Dosyası CSP'li

Her sayfada CSP meta tag'i mevcut:
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com https://unpkg.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self';
```

### ⚠️ Zayıflıklar

| Direktif | Sorun |
|---|---|
| `script-src 'unsafe-inline'` | Inline script'lere izin veriyor — XSS payload çalışır |
| `img-src https:` | Tüm HTTPS görsellerine izin — açık fakat kabul edilebilir |
| `cdn.jsdelivr.net`, `unpkg.com` | Dış CDN'lere güven — CDN ele geçirilirse risk |

**Öneri:** `'unsafe-inline'` kaldırılamaz çünkü mevcut mimari inline script kullanıyor. Üretimde hash-based veya nonce-based CSP'ye geçilmeli.

---

## 5. XSS / Injection Riskleri

### 🔴 YÜKSEK: innerHTML Kullanımı (XSS Potansiyeli)

| Dosya | Kullanım | Risk |
|---|---|---|
| `company-sectors.html` | `card.innerHTML = \`...${name}...\`` | Kullanıcı girdisi doğrudan HTML |
| `company-bookings.html` | `td6.innerHTML='<button...onclick="openEditModal('+newId+')"...'` | ID sanitization yok |
| `company-invoices.html` | `tr.innerHTML=\`<td>${no}</td>...\`` | Değişkenler doğrudan HTML |
| `js/toast.js` | `toast.innerHTML = \`...${message}...\`` | Toast mesajları innerHTML |
| `index.html` | `el.innerHTML = t` | i18n çevirileri innerHTML |
| `customer-portal.html` | `td1.innerHTML='<strong>#'+id+'</strong>'` | Ticket ID innerHTML |

**Sonuç:** innerHTML kullanımı yaygın. Üretimde `textContent` veya `DOMPurify` kullanılmalı.

---

## 6. Diğer Güvenlik Bulguları

| # | Bulgu | Önem | Açıklama |
|---|---|---|---|
| 1 | Şifre doğrulama client-side | Düşük | `login.html`'de sadece `length<6` — gerçek doğrulama sunucuda olmalı |
| 2 | `autocomplete="current-password"` | ✅ İyi | Password input'ta autocomplete var |
| 3 | `meta charset="UTF-8"` | ✅ İyi | Tüm sayfalarda var |
| 4 | OG/Twitter meta verileri | Nötr | `mcemkoca.github.io` URL'si açığa çıkıyor |
| 5 | GitHub repo URL'si | Nötr | Canonical URL'ler GitHub Pages'e işaret ediyor |
| 6 | Clickjacking potansiyeli | Orta | `X-Frame-Options` header'ı yok (GitHub Pages) |
| 7 | Rate limiting yok | Yüksek | Brute force / login denemeleri sınırlanmamış |

---

## 7. Özet Puanlama

| Alan | Durum | Puan |
|---|---|---|
| Portal İzolasyonu (Temel Roller) | ✅ checkAuth çalışıyor | 7/10 |
| Portal İzolasyonu (Client-Side Bypass) | 🔴 Manipüle edilebilir | 3/10 |
| Portal İzolasyonu (Eksik Roller) | ⚠️ 9 sayfa rol kontrolü yok | 5/10 |
| Cross-Portal Data Leak | 🔴 Tüm HTML kaynağı açık | 2/10 |
| Employee Hassas Veri (PII) | 🔴 IBAN, maaş sabit kodlanmış | 2/10 |
| Oturum/Cookie Güvenliği | 🔴 localStorage, no HttpOnly | 3/10 |
| CSP Kapsamı | ✅ 36/36 sayfa | 9/10 |
| CSP Sertliği | ⚠️ unsafe-inline var | 5/10 |
| XSS Koruması | 🔴 innerHTML yaygın | 3/10 |
| **GENEL** | | **4.3/10** |

---

## 8. Üretime Geçiş Öncesi Kritik Gereksinimler

### 🔴 BLOCKER (Olmazsa Olmaz)

1. **Server-side JWT + HttpOnly cookie** — `localStorage` tabanlı auth tamamen kaldırılmalı
2. **API tabanlı veri erişimi** — Tüm veri client-side static yerine API'den gelmeli
3. **Server-side yetki kontrolü** — Her API endpoint'te rol doğrulaması şart
4. **Hassas verilerin API'den gelmesi** — IBAN, maaş, bordro sadece yetkili kullanıcıya API'den dönmeli

### 🟡 HIGH (Planlanmalı)

5. **Rol kontrolü eksik sayfalar** — bookings, customers, invoices, products, reports, services, settings, staff, support
6. **Input validation library** — Regex, length, type checking
7. **DOMPurify entegrasyonu** — Tüm innerHTML kullanımları kaldırılmalı
8. **X-Frame-Options: DENY** — Clickjacking koruması
9. **Rate limiting** — Login denemeleri sınırlanmalı
10. **HTTPS zorunlu** — Tüm cookie'ler `Secure` flag ile

### 🟢 MEDIUM (İzlenmeli)

11. **Demo verilerdeki PII'lar** — Tamamen fictional veya API'den gelmeli
12. **Session TTL** — Daha kısa (1-2 saat) + sliding refresh
13. **Concurrent session limit** — Aynı anda 1-2 session

---

## 9. Önceki Kontrollerden Değişen Durum

| Kontrol | Tarih | Bulgu | Durum |
|---|---|---|---|
| Tur #5 | 2026-05-24 | CSP eksik 4 sayfa | ✅ Düzeltildi — 36/36 sayfa CSP'li |
| Tur #5 | 2026-05-24 | Server-side JWT planı | ⏳ Hala beklemede — yapısal değişiklik |
| Tur #2 | 2026-05-27 | innerHTML XSS riskleri | ❌ Değişmedi — hala yaygın |
| Tur #2 | 2026-05-27 | Action fonksiyonları yetki kontrolü | ❌ Değişmedi — client-side kaldı |
| Tur #3 | 2026-05-26 | Rol kontrolü eksik 9 sayfa | ❌ Değişmedi — hala eksik |
| Tur #3 | 2026-05-26 | Employee.html PII verileri | ❌ Değişmedi — hala sabit kodlanmış |

---

*Rapor: Güvenlik Kontrolü #3 — Son Tur (Final)*  
*CleanFix Demo / Vercel Deploy*  
*Statik HTML demo uygulama — üretim ortamı değerlendirmesi değildir*  
**Genel Puan: 4.3/10** — Üretime geçiş için 4 blocker çözülmeli

---

## Ek: Kullanıcı Şikayeti (Yapısal Hata)

**Modal CSS bilgisi sayfanın en üstünde çıkıyor**
- `dashboard.html` ve `company-sectors.html`'de modal CSS stilleri sayfa içeriğinin en üstünde render ediliyor
- Hızlı işlemler butonları çalışmıyor
- Bu bir güvenlik sorunu değil, UI/UX yapısal hatası
- Önceki turlarda tespit edilmiş, çözüm bekliyor

---

*Rapor hazırlayan: Aslan (Güvenlik Kontrol Cron)*  
*Sonraki önerilen kontrol: Üretime geçiş öncesi son audit*
