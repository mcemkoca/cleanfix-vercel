# CleanFix Design Control #3 — Final Audit Raporu
**Tarih:** 2026-05-20 11:30 CST
**Kapsam:** SEO Meta Tags, Favicon, Sitemap, 404, Error Boundary, Accessibility (Contrast, ARIA)
**Toplam Sayfa:** 30+ HTML | 6 Sektör Platformu | 1 Ana Landing

---

## 1. SEO Meta Tags

### Landing Page (index.html)
| Öğe | Durum | Not |
|-----|-------|-----|
| `charset` | ✅ | UTF-8 |
| `viewport` | ✅ | width=device-width, initial-scale=1.0 |
| `description` | ✅ | data-i18n ile dinamik |
| `keywords` | ✅ | 15+ KOBİ sektör kelimesi (TR/EN/NL) |
| `author` | ✅ | Deuterium12{MCK} |
| `og:title` | ✅ | Dinamik i18n |
| `og:description` | ✅ | Dinamik i18n |
| `og:url` | ✅ | GitHub Pages URL |
| `og:type` | ✅ | website |
| `og:image` | ⚠️ | Referans var (`assets/og-image.png`) ama dosya **YOK** |
| `twitter:card` | ✅ | summary_large_image |
| `twitter:title` | ✅ | Dinamik |
| `twitter:description` | ✅ | Dinamik |
| `canonical` | ✅ | GitHub Pages |
| `robots` | ❌ | meta robots tag eksik (robots.txt var ama page-level yok) |
| JSON-LD / Structured Data | ❌ | Schema.org markup yok |

### Company/Dashboard Sayfaları
- Meta tag setleri **10 sayfada** tekrarlanıyor, **7 sayfada** eksik/basit.
- Dashboard sayfalarında `noindex` düşünülebilir (arama motorlarında görünmemeli).

### Öneri
1. `og-image.png` oluştur veya mevcut `icon-512.png` referansını kullan.
2. Her dashboard/company sayfasına `<meta name="robots" content="noindex, nofollow">` ekle.
3. Landing page için JSON-LD (Organization + SoftwareApplication schema) ekle.

---

## 2. Favicon & PWA Icons

| Öğe | Durum | Not |
|-----|-------|-----|
| `icon-72..512.png` setleri | ✅ | 8 boyut, maskable desteği var |
| `manifest.json` | ✅ | Tema rengi, kapsam, dil tanımlı |
| `apple-touch-icon` | ✅ | 10 sayfada mevcut |
| **`<link rel="icon">`** | **❌** | **index.html'de standart favicon linki YOK** |
| `theme-color` meta | ❌ | `<meta name="theme-color">` eksik |
| `msapplication-TileColor` | ❌ | IE/Edge tile rengi eksik |

### Öneri
```html
<link rel="icon" type="image/png" sizes="32x32" href="assets/icon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/icon-16.png">
<meta name="theme-color" content="#0d9488">
```
Yeni `icon-32.png` ve `icon-16.png` üret veya mevcut 72px'yi yeniden boyutlandır.

---

## 3. Sitemap & Robots.txt

| Öğe | Durum | Not |
|-----|-------|-----|
| `robots.txt` | ✅ | User-agent: * / Allow: / / Sitemap referansı doğru |
| `sitemap.xml` | ✅ | 50+ URL, tüm sektörler dahil |
| `changefreq` | ✅ | weekly/monthly uygun |
| `priority` | ✅ | Landing 1.0, dashboard 0.9, ayarlar 0.5 |
| gzip | ❌ | Sitemap sıkıştırılmamış |

### Sitemap Kapsamı
- CleanFix ana: 4 URL
- BuildPro: 12 URL
- BarberPro: 10 URL
- MarketPro: 5 URL
- RestoPro: 5 URL
- WoodPro: 5 URL
- ElektroPro: 5 URL
**Toplam: 46 URL**

### Eksik URL'ler
- `404.html` (gerekmez)
- `login.html` (zaten var ama sitemap'te yok — ekle)
- `customer-portal.html` (sitemap'te yok)

---

## 4. 404 Sayfası

| Öğe | Durum | Not |
|-----|-------|-----|
| Dosya varlığı | ✅ | `404.html` mevcut |
| Responsive | ✅ | max-width:480px, padding:0 24px |
| Animasyon | ✅ | orbFloat, cardEnter, floatEmoji |
| Dil desteği | ✅ | TR/EN/NL switcher |
| Tema uyumu | ✅ | Dark mode, glassmorphism |
| Geri dönüş linkleri | ✅ | Dashboard + Ana Sayfa |
| **ARIA / role** | **❌** | Hiç ARIA attribute yok |
| **Status kod metni** | **❌** | "404" sadece görsel, screen reader için `aria-label` yok |

### Öneri
```html
<div class="error-code" role="img" aria-label="404 Hata Kodu">404</div>
<main role="main">...</main>
```

---

## 5. Error Boundary / Hata Yönetimi

| Öğe | Durum | Not |
|-----|-------|-----|
| `window.onerror` | ✅ | 15+ sayfada mevcut |
| `unhandledrejection` | ✅ | Aynı sayfalarda mevcut |
| Toast bildirim | ✅ | `showToast()` ile kullanıcıya bildirim |
| **Konsol dışı loglama** | **❌** | Sentry/LogRocket/benzeri yok |
| **React Error Boundary** | **N/A** | Vanilla HTML/JS projesi |
| `sourcemap` | N/A | Minified JS yok, debug kolay |

### window.onerror Pattern (Örnek)
```js
window.onerror = function(msg, url, line) {
  showToast('Bir hata oluştu: ' + msg, 'error');
  return false;
};
window.addEventListener('unhandledrejection', function(e) {
  showToast('İşlem hatası: ' + e.reason, 'error');
});
```
Bu temel pattern yeterli ama geliştirilebilir.

### Öneri
1. Hata loglarını `localStorage` veya session'a yaz (geçici debugging).
2. Kullanıcıya "Hata raporu gönder" butonu ekle.
3. `console.error` ile stack trace'i koru.

---

## 6. Accessibility (Erişilebilirlik)

### A. Kontrast Oranları (WCAG 2.1 AA — 4.5:1 normal text)

| Renk Kombinasyonu | Oran | Sonuç |
|-------------------|------|-------|
| `#f1f5f9` on `#0b1120` (text-primary) | ~15:1 | ✅ AAA |
| `#94a3b8` on `#0b1120` (text-secondary) | ~7.5:1 | ✅ AA |
| `#64748b` on `#0b1120` (text-muted) | ~3.8:1 | ❌ AA (büyük text OK) |
| `#475569` on `#0b1120` (text-placeholder) | ~2.6:1 | ❌ AA |
| `#14b8a6` on `#0b1120` (teal-500) | ~4.7:1 | ✅ AA |
| `#2dd4bf` on `#0b1120` (teal-400) | ~6.2:1 | ✅ AA |
| `#ffffff` on `#14b8a6` (btn-primary text) | ~2.9:1 | ❌ AA (kritik!) |

### Kritik Kontrast Sorunları
1. **Beyaz metin on Teal butonlar** (~2.9:1) — Primary CTA butonları okunabilirliği düşük.
2. **Placeholder metin** (~2.6:1) — Form input placeholder'ları zor okunuyor.
3. **Muted metin** (~3.8:1) — Kart alt başlıkları, timestamp'ler sınırda.

### Öneri
```css
/* Daha koyu teal veya daha açık buton metni */
.btn-primary { background: #0d9488; color: #ffffff; } /* mevcut */
/* VEYA */
.btn-primary { background: #0f766e; color: #ffffff; } /* ~4.5:1 sağlar */

/* Placeholder açılması */
[data-theme="dark"] ::placeholder { color: #94a3b8; opacity: 0.7; }
```

### B. ARIA Etiketleri

| Öğe | Durum | Sayı |
|-----|-------|------|
| `aria-label` | ❌ | 0 (index.html'de) |
| `aria-hidden` | ❌ | 0 |
| `aria-expanded` | ❌ | 0 |
| `aria-controls` | ❌ | 0 |
| `aria-pressed` | ❌ | 0 (lang butonlarında yok) |
| `role` | ❌ | 0 |
| `alt` (img) | ⚠️ | Çok az (CSS background/SVG ağırlıklı) |

### Öneri (Landing Page)
```html
<nav aria-label="Ana navigasyon">...</nav>
<main id="main-content">...</main>
<button class="lang-btn active-lang" aria-pressed="true" aria-label="Türkçe" ...>TR</button>
<section aria-labelledby="features-heading">...
  <h2 id="features-heading">...</h2>
</section>
<a href="#main-content" class="skip-link">İçeriğe atla</a>
```

### C. Klavye Navigasyonu

| Öğe | Durum |
|-----|-------|
| `:focus` stilleri | ✅ CSS'de tanımlı |
| `tabindex` | ⚠️ Bazı özel kartlarda eksik |
| Escape ile modal kapatma | ⚠️ Yarım (bazı modallar, tümü değil) |
| Skip Link | ❌ Yok |

### D. Form Erişilebilirliği

| Öğe | Durum |
|-----|-------|
| `<label>` + `for` | ⚠️ Bazı formlarda placeholder'a güveniliyor |
| `input[type="email"]` | ✅ |
| `required` attribute | ⚠️ JS validation var, HTML5 az |
| `autocomplete` | ❌ Yok |

---

## 7. PWA & Offline

| Öğe | Durum |
|-----|-------|
| `manifest.json` | ✅ |
| `sw.js` | ✅ Var |
| `pwa.js` | ✅ 31 sayfada yüklü |
| Offline badge | ✅ CleanFix'te var |
| `apple-mobile-web-app-capable` | ❌ Eksik |

---

## Özet Puanlama

| Kategori | Puan | Durum |
|----------|------|-------|
| SEO Meta Tags | 7/10 | İyi, JSON-LD ve og:image eksik |
| Favicon | 5/10 | Standart favicon linki yok |
| Sitemap/Robots | 9/10 | Kapsamlı, birkaç eksik URL |
| 404 Sayfa | 8/10 | Güzel, ARIA yok |
| Error Boundary | 6/10 | Temel, gelişmiş loglama yok |
| Kontrast | 6/10 | 3 kritik kontrast hatası |
| ARIA/Etiketleme | 3/10 | Neredeyse hiç yok |
| Klavye/Form | 5/10 | Yarım |
| **Toplam** | **49/80** | **%61 — Orta-İyi** |

---

## Hızlı Fix Listesi (Öncelik Sırası)

### 🔴 Kritik (Hemen)
1. `og-image.png` oluştur veya `icon-512.png`'yi referans olarak kullan.
2. `<link rel="icon">` ekle (index.html + tüm sayfalar).
3. Beyaz-on-teal buton kontrastını düzelt (`#0f766e` arka plan veya `#0b1120` metin).
4. Placeholder rengini `#94a3b8` yap.

### 🟡 Önemli (Bu hafta)
5. `aria-label`, `role`, `aria-pressed` ekle (nav, butonlar, dil switcher).
6. Skip link ekle (`<a href="#main-content">`).
7. Dashboard/company sayfalarına `noindex` ekle.
8. `theme-color` meta tag ekle.

### 🟢 İyileştirme (Gelecek sprint)
9. JSON-LD structured data ekle.
10. Sitemap'e eksik URL'leri ekle.
11. Formlara `autocomplete`, `<label>`, `required` ekle.
12. Hata loglama altyapısı kur (geçici `localStorage` buffer).

---

*Raporu hazırlayan: Aslan / CleanFix Design Control #3 — Son Tur*
