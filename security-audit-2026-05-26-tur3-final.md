# CleanFix Güvenlik Kontrolü #3 — Son Rapor
**Tarih:** 2026-05-26 09:00 CST  
**Kapsam:** Customer portal izolasyonu, Employee portal izolasyonu, Data leak kontrolü, Cookie/güvenlik başlıkları  
**Toplam Sayfa:** 36 HTML dosyası

---

## 1. Portal İzolasyonu — ROL TABANLI ERİŞİM KONTROLÜ

### ✅ Doğru Şekilde Korumalı Sayfalar (Rol Zorunlu)

| Sayfa | Gerekli Rol | Durum |
|---|---|---|
| dashboard.html | admin | ✅ checkAuth('admin') |
| customer-portal.html | customer | ✅ checkAuth('customer') |
| employee-dashboard.html | employee | ✅ checkAuth('employee') |
| employee.html | employee | ✅ checkAuth('employee') |
| employee-tasks.html | employee | ✅ checkAuth('employee') |
| company*.html (18 sayfa) | admin / company | ✅ checkAuth(['admin','company']) |

### ⚠️ ROL KONTROLÜ EKSİK SAYFALAR (Sadece Giriş Kontrolü, Rol Kontrolü Yok)

Aşağıdaki sayfalar `checkAuth()` ile sadece giriş yapmış olma durumunu kontrol ediyor, **ancak rol kontrolü yapmıyor**. Yani bir `customer` giriş yaptıktan sonra URL'yi değiştirip `staff.html` veya `invoices.html`'e gidebilir. Aynı şekilde bir `employee` de `bookings.html`'e erişebilir:

- `bookings.html`
- `customers.html`
- `invoices.html`
- `products.html`
- `reports.html`
- `services.html`
- `settings.html`
- `staff.html`
- `support.html`

**Risk:** Düşük-Orta. Demo uygulamada veri sunucudan gelmiyor (tümü client-side static), ancak bu sayfaların arayüzünü görmek bile yetkisiz kullanıcıya iş akışı hakkında bilgi sızdırır.

**Öneri:** Bu sayfalar da `checkAuth(['admin','company'])` veya uygun role array'i ile korunmalı.

### ✅ Açık (Public) Sayfalar — Doğru

| Sayfa | Auth | Durum |
|---|---|---|
| index.html | Yok | ✅ Public landing page |
| login.html | Yok | ✅ Public giriş sayfası |
| pricing.html | Yok | ✅ Public fiyatlandırma |
| 404.html | Yok | ✅ Hata sayfası |

---

## 2. Veri Sızıntısı (Data Leak) Kontrolü

### 🔴 KRİTİK: Employee Portal'da Sabit Kodlanmış Hassas Veri

`employee.html` dosyasında aşağıdaki gerçekçi demo verileri **doğrudan HTML içinde** mevcut. Auth var ama veri client-side — tarayıcı "Görünüm Kaynağı" ile erişilebilir:

- **Maaş bilgisi:** Temel €2.450, Net €1.707,68, Prim €180
- **IBAN:** BE68 1234 5678 9012
- **E-posta:** ahmet.kaya@cleanfix.be
- **Telefon:** +32 470 98 76 54
- **Adres:** Avenue Louise 142, 1050 Brüksel
- **Diğer çalışanların iletişim bilgileri:** +32 470~474 arası 4 numara daha
- **Bordro geçmişi:** Son 6 ayın net/brüt/kesinti detayları

### 🟡 ORTA: Customer Portal / Company Pages'de Müşteri Verisi

`company-customers.html` dosyasında:
- Müşteri e-posta: `sarah.j@gmail.com`
- Müşteri adres: `Avenue Louise 88, 1050 Bruxelles`
- Gelir verisi: `€623` toplam gelir, `€89` ortalama iş
- Ziyaret geçmişi, çalışan eşleştirmeleri, servis detayları

`customer-portal.html`'de Jan Peeters profili sabit kodlanmış (e-posta: jan.peeters@kantoor.be).

### Not
Bu bir **statik demo uygulama**. Tüm veri zaten client-side. Üretimde bu veriler API'den gelmeli ve kullanıcının yetkisi dışındaki veriler hiçbir zaman tarayıcıya inmemeli. Mevcut yapı **"güvenlik duvarı arkasındaki veri"** olarak değerlendirilemez çünkü sunucu tarafı yok.

---

## 3. Cookie / Oturum Güvenliği

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

**Auth.js yorumu:** *"This is a DEMO/STATIC app. For production, use server-side JWT + HttpOnly cookies."* — bu bilinçli bir teknik borç.

### ✅ İyileştirmeler

- Eski `demo_` prefixli token'lar `isValid()` içinde reddediliyor ve otomatik logout yapılıyor
- Token `window.crypto.getRandomValues` ile 16 byte üretiliyor
- Zaman aşımı: 24 saat (default), 7 gün (remember me)
- `window.location.replace('login.html')` ile geri butonu koruması (replace kullanımı iyi)

---

## 4. CSP (Content Security Policy) Durumu

### ✅ Tüm 36 HTML Dosyası CSP'li

Her sayfada aşağıdaki CSP başlığı mevcut:
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
| `script-src 'unsafe-inline'` | Inline script'lere izin veriyor — XSS varsa payload çalışır |
| `img-src https:` | Tüm HTTPS görsellerine izin — açık fakat kabul edilebilir |
| `connect-src 'self'` | Sadece kendi domain — iyi |
| `cdn.jsdelivr.net`, `unpkg.com` | Dış CDN'lere güven — CDN ele geçirilirse risk |

**Öneri:** `'unsafe-inline'` kaldırılamaz çünkü mevcut mimari inline script kullanıyor. Üretimde hash-based veya nonce-based CSP'ye geçilmeli.

---

## 5. Diğer Güvenlik Bulguları

| # | Bulgu | Önem | Açıklama |
|---|---|---|---|
| 1 | Şifre doğrulama client-side | Düşük | `login.html`'de şifre kontrolü sadece `length<6` — gerçek doğrulama sunucuda olmalı |
| 2 | `autocomplete="current-password"` | ✅ İyi | Password input'ta autocomplete var |
| 3 | `meta charset="UTF-8"` | ✅ İyi | Tüm sayfalarda var |
| 4 | `viewport` meta | ✅ İyi | Tüm sayfalarda var |
| 5 | OG/Twitter meta verileri | Nötr | `mcemkoca.github.io` URL'si açığa çıkıyor |
| 6 | GitHub repo URL'si | Nötr | Canonical URL'ler GitHub Pages'e işaret ediyor |
| 7 | `employee.html` 2x auth çağrısı | Nötr | `<script>checkAuth('employee')</script>` ve `s.onload` ile ikinci kontrol — yedekli ama zararsız |

---

## 6. Özet Puanlama

| Alan | Durum | Puan |
|---|---|---|
| Portal İzolasyonu (Temel Roller) | ✅ Korunuyor | 8/10 |
| Portal İzolasyonu (Eksik Roller) | ⚠️ 9 sayfa rol kontrolü yok | 5/10 |
| Veri Sızıntısı | 🔴 Sabit kodlanmış PII | 3/10 |
| Oturum/Cookie Güvenliği | 🔴 localStorage, no HttpOnly | 3/10 |
| CSP Kapsamı | ✅ 36/36 sayfa | 9/10 |
| CSP Sertliği | ⚠️ unsafe-inline var | 5/10 |
| **GENEL** | | **5.5/10** |

---

## 7. Öncelikli Düzeltmeler (Üretime Geçiş Öncesi)

1. **Sunucu tarafı auth** — Server-side JWT + HttpOnly cookie'ye geçiş şart
2. **API tabanlı veri** — Tüm veri client-side static yerine API'den, yetki filtreli gelmeli
3. **Rol kontrolü eksik sayfalar** — bookings, customers, invoices, products, reports, services, settings, staff, support
4. **CSP hardening** — Inline script'ler external `.js` dosyalarına taşınmalı, `'unsafe-inline'` kaldırılmalı
5. **Rate limiting / brute force** — Login denemeleri sınırlanmalı (sunucu tarafı)
6. **HTTPS zorunlu** — Tüm cookie'ler `Secure` flag ile

---

*Rapor: Güvenlik Kontrolü #3 (Son Tur)*  
*CleanFix Demo / Vercel Deploy*  
*Statik HTML demo uygulama — üretim ortamı değerlendirmesi değildir*
