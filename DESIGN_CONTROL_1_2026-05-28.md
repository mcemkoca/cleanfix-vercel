# CleanFix Tasarım Kontrolü #1 — Responsive, Renk, Spacing, Dark Tema, Component Birlikteliği
**Tarih:** 2026-05-28 10:30 CST
**Proje:** /root/.openclaw/workspace/cleanfix-vercel/
**Toplam Sayfa:** 36 HTML dosya
**CSS Kaynakları:** main.css, components.css, dashboard.css (+ inline)
**Önceki Kontrol:** 2026-05-26 (48 saat önce)

---

## 📊 GENEL DURUM ÖZETİ

| Kategori | Skor | Trend |
|----------|------|-------|
| Responsive | 8.5/10 | → Stabil |
| Renk Tutarlılığı | 9/10 | → Stabil |
| Spacing/Padding | 8.5/10 | → Stabil |
| Dark Tema | 8/10 | → Stabil |
| Component Birlikteliği | 7/10 | ↓ Düşüş |

---

## 1. RESPONSIVE TEST (Mobile / Tablet / Desktop)

### ✅ Tamamlanmış / Tutarlı
| Öğe | Durum | Not |
|-----|-------|-----|
| `viewport` meta tag | ✅ 36/36 | Her sayfada mevcut |
| Breakpoint sistemi | ✅ | 1280px / 1024px / 768px / 480px — main.css + dashboard.css + inline |
| Grid adaptasyonu | ✅ | `.grid-cols-5→4→3→2→1` kademeli düşüş |
| Sidebar mobile | ✅ | `translateX(-100%)` + overlay pattern |
| Table scroll | ✅ | `.table-wrap { overflow-x:auto }` + `min-width:600px` mobile |
| Hero responsive | ✅ | `clamp(2.5rem,5vw,4rem)` fluid tipografi |
| Print styles | ✅ | components.css satır 571–599, kapsamlı `display:none` |

### ⚠️ Açık Sorunlar
| # | Sorun | Etki | Öneri |
|---|-------|------|-------|
| 1 | **index.html inline CSS ~270 satır** — media query'ler, keyframes, override'lar `<style>` içinde | Bakım zorluğu | Landing-specific animasyonlar dışında `css/landing.css` partial'ına taşı |
| 2 | **Bazı mobile override'lar `!important` kullanıyor** | Specificity savaşları | Daha spesifik selektörler kullan, `!important` kaldır |
| 3 | **Landing page `.features-grid` sabit 3 sütun** | 1024–1280px arası sıkışma | `repeat(auto-fit, minmax(320px, 1fr))` |
| 4 | **Dashboard sidebar genişliği tutarsız** — dashboard.css 280px, dashboard.html 260px | Görsel uyumsuzluk | Tek `--sidebar-width` değişkenine standardize et |
| 5 | **YENİ: Son güncellenen sayfalarda (company-*.html) tablo genişlikleri sabit `min-width:800px`** | Mobile'da yatay scroll | `min-width` değerini breakpoint'e bağla: `@media (max-width:768px) { min-width: 600px }` |

---

## 2. RENK TUTARLIBLIĞI

### ✅ Tamamlanmış / Tutarlı
| Öğe | Durum | Not |
|-----|-------|-----|
| CSS variable mimarisi | ✅ | Tek merkezi: `main.css` `:root` |
| Primary/Accent/Neutral scale | ✅ | Tam scale'ler mevcut |
| Dark theme override | ✅ | `[data-theme="dark"]` tüm alias'ları tanımlı |
| `prefers-color-scheme` | ✅ | `@media (prefers-color-scheme: dark)` fallback mevcut |
| Hardcoded renk | ✅ Neredeyse yok | Sadece print CSS'te makul kullanım |

### ⚠️ Açık Sorunlar
| # | Sorun | Konum | Etki |
|---|-------|-------|------|
| 1 | **dashboard.html inline override** — `:root, [data-theme="dark"] { --glass-bg: rgba(15,23,42,0.60) }` | `<style>` başlangıcı | Light tema'da dashboard sayfalarında glass değeri hâlâ koyu kalabilir |
| 2 | **Kontrast sorunları devam ediyor** — `btn-primary` (#fff on #14b8a6 → ~2.9:1), `btn-amber` (#fff on #f59e0b → ~2.5:1) | components.css | WCAG AA geçmiyor |
| 3 | **YENİ: company-sectors.html ve diğer yeni sayfalarda `--border-color` yerine hardcoded `rgba(148,163,184,0.08)` kullanımı** | Çoklu yer | Tema değişiminde tutarsız border görünümü |

---

## 3. SPACING / PADDING CHECK

### ✅ Tamamlanmış / Tutarlı
| Öğe | Değer | Kullanım |
|-----|-------|----------|
| Space scale | 0.25rem → 4rem | Tutarlı aralık |
| Utility classes | `.p-1`, `.px-2`, `.gap-3`, `.mb-6` | ✅ Tutarlı |
| Card padding desktop | `var(--space-6)` (24px) | ✅ |
| Card padding mobile | `var(--space-4)` (16px) | ✅ |
| Modal padding | `var(--space-5)` header, `var(--space-6)` body | ✅ |

### ⚠️ Açık Sorunlar
| # | Sorun | Konum | Etki |
|---|-------|-------|------|
| 1 | **YENİ: company-*.html sayfalarında `.page-header` padding tutarsız** — bazıları `padding: var(--space-4) var(--space-6)`, bazıları `padding: 16px 24px` (hardcoded) | company-stock, company-tools, company-services | Tutarsız görünüm sayfa geçişlerinde |
| 2 | **YENİ: company-sectors.html'de `.sector-card` margin-bottom hardcoded `20px`** | Inline CSS | `--space-5` (1.25rem = 20px) kullanılabilirdi ama variable sistemi bypass edilmiş |
| 3 | **Table cell padding tutarsız** — `components.css`'te `var(--space-3)`, ama bazı sayfalarda `12px 16px` hardcoded | company-*.html tabloları | Mobil görünümde sıkışma |

---

## 4. DARK TEMA KONTROLÜ

### ✅ Tamamlanmış / Tutarlı
| Öğe | Durum | Not |
|-----|-------|-----|
| `[data-theme="dark"]` tanımı | ✅ | main.css'te tam set |
| Tüm sayfalarda `data-theme="dark"` | ✅ 36/36 | `<html>` tag'inde mevcut |
| `prefers-color-scheme` fallback | ✅ | `@media` query ile |
| Glass morphism dark değerleri | ✅ | `rgba(17,24,39,0.6)` vs `rgba(255,255,255,0.6)` |
| Button hover dark | ✅ | `[data-theme="dark"] .btn-secondary:hover { border-color:var(--slate-600) }` |

### ⚠️ Açık Sorunlar
| # | Sorun | Konum | Etki |
|---|-------|-------|------|
| 1 | **Light tema toggle mekanizması eksik** — tüm sayfalar hardcoded `data-theme="dark"` | 36/36 sayfa | Kullanıcı aydınlık tema seçemez |
| 2 | **YENİ: company-sectors.html'de modal backdrop `rgba(0,0,0,0.6)` sabit** — `--overlay-bg` variable'ı tanımlı ama kullanılmamış | Modal CSS | Tema değişiminde modal overlay tutarsız |

---

## 5. COMPONENT BİRLİKTELİĞİ

### ✅ Tutarlı Olanlar
| Component | Kullanım | Durum |
|-----------|----------|-------|
| `.btn` (primary/secondary/ghost) | 36 sayfa | ✅ Tutarlı |
| `.card` + hover efektleri | 36 sayfa | ✅ Tutarlı |
| `.table` + `.table-wrap` | Dashboard + Company sayfaları | ✅ Tutarlı |
| `.modal-overlay` + `.modal` | Çoklu sayfa | ⚠️ **Kısmen tutarlı** |
| `.badge` + status renkleri | Dashboard + Company sayfaları | ✅ Tutarlı |
| `.toast` bildirim sistemi | Tüm sayfalar (toast.js) | ✅ Tutarlı |
| `.sidebar` + `.sidebar-nav` | Dashboard + Employee + Company | ⚠️ **Kısmen tutarlı** |

### 🔴 Kritik Sorunlar

#### 5.1 DASHBOARD MODAL CSS — HÂLÂ AÇIK 🔴
- **Sorun:** `dashboard.html`'de **iki ayrı `<style>` bloğu** var (satır 35 ve 343)
- **Modal CSS** `.modal-overlay`, `.modal`, `.modal-header` vb. **ikinci `<style>` bloğunda** (satır 351–379)
- **Risk:** İkinci style bloğu `<head>` dışına taşabilir, browser text olarak render edebilir
- **Düzeltme:** İki `<style>` bloğunu tek `<style>` içinde birleştir, `<head>` içinde tut

#### 5.2 HIZLI İŞLEMLER BUTONLARI — DUPLICATE MAPPING ⚠️
- 4 buton var ama sadece 2 farklı modal'a gidiyor:
  - "Firma Ekle" ve "Plan Oluştur" → aynı `addCompanyModal`
  - "Sektör Ekle" ve "Duyuru Gönder" → aynı `announceModal`
- **Düzeltme:** Her buton kendi modal'ına gitmeli veya buton sayısı 2'ye düşürülmeli

#### 5.3 YENİ SAYFALARDA COMPONENT DRIFT 🟡
- `company-*.html` sayfalarında yeni component'ler tanımlanmış (`.sector-card`, `.firm-row`, `.service-tier`) ama bunlar `components.css`'e eklenmemiş
- Sonuç: Aynı görünümü elde etmek için her sayfa kendi inline CSS'ini taşıyor
- **Öneri:** Yeni component'leri `components.css`'e taşı, inline tanımları kaldır

#### 5.4 MODAL FONKSİYON TUTARSIZLIĞI 🟡
- `dashboard.html`: `openModal(id)` / `closeModal(id)` — global fonksiyonlar ✅
- `company-sectors.html`: `closeModal(this.id)` yerine `closeModal('addSectorModal')` — bazı yerlerde `this.id` kullanımı, bazı yerlerde string — tutarsız
- **Risk:** `this.id` kullanımı event delegation'da yanlış ID'ye işaret edebilir

---

## 6. YENİ / GÜNCELLENEN SAYFA DURUMU

| Sayfa | Son Güncelleme | Boyut | Not |
|-------|---------------|-------|-----|
| company-services.html | 2026-05-28 03:47 | 142 KB | En yeni, modal yapısı düzgün |
| company-stock.html | 2026-05-28 03:46 | 128 KB | Spacing tutarsızlıkları var |
| company-invoices.html | 2026-05-28 03:45 | 36 KB | Daha kompakt, tutarlı |
| company-customers.html | 2026-05-28 03:44 | 117 KB | Tablo genişlik sabit 800px |
| company-sectors.html | 2026-05-28 03:42 | 145 KB | Önceki edit hatası giderilmiş görünüyor |
| employee.html | 2026-05-28 03:27 | 114 KB | Hâlâ client-side demo verisi |
| login.html | 2026-05-28 03:25 | 32 KB | Güvenlik fix'leri uygulanmış |
| index.html | 2026-05-28 03:25 | 90 KB | Landing stabil |

---

## 7. ÖNERİLEN DÜZELTMELER (Öncelik Sırasına Göre)

### 🔴 Yüksek Öncelik
1. **dashboard.html: İki `<style>` bloğunu birleştir** — Modal CSS `<head>` içinde tek blokta konsolide edilmeli
2. **Hızlı İşlemler butonlarını düzelt** — 4 buton → 4 farklı modal, veya 2 buton + doğru mapping
3. **Light tema toggle ekle** — `data-theme="dark"` hardcoded yerine JS toggle + localStorage

### 🟡 Orta Öncelik
4. **Yeni component'leri `components.css`'e taşı** — `.sector-card`, `.firm-row`, `.service-tier`
5. **company-*.html spacing standardizasyonu** — `.page-header` padding ve table cell padding'leri variable'lara bağla
6. **Sidebar genişliği tek değişkende topla** — `--sidebar-width: 280px` root değişkeni tanımla

### 🟢 Düşük Öncelik
7. **Kontrast oranlarını artır** — `btn-primary` ve `btn-amber` metin rengini `#0f172a` (koyu) yap veya arka planı koyulaştır
8. **Landing page grid'i fluid yap** — `repeat(auto-fit, minmax(320px, 1fr))`
9. **company-*.html tablo `min-width` breakpoint'e bağla** — Mobile'da 600px, desktop'ta 800px

---

## 8. ÖNCEKİ KONTROLLE KARŞILAŞTIRMA

| Sorun | 2026-05-26 | 2026-05-28 | Durum |
|-------|-----------|-----------|-------|
| Dashboard modal CSS (iki `<style>`) | ⚠️ Açık | 🔴 **Hâlâ açık** | **Düzeltilmedi** |
| Hızlı İşlemler duplicate | ⚠️ Açık | ⚠️ **Hâlâ açık** | Düzeltilmedi |
| CSP eksik sayfalar | ✅ Düzeltildi | ✅ Tamam | Korunuyor |
| Responsive breakpoint'ler | ✅ Tamam | ✅ Tamam | Korunuyor |
| Renk variable sistemi | ✅ Tamam | ✅ Tamam | Korunuyor |
| Yeni sayfa spacing drift | — | 🟡 **Yeni** | Yeni sayfalardan kaynaklanıyor |
| Component drift (company-*.html) | — | 🟡 **Yeni** | Yeni sayfalardan kaynaklanıyor |

---

*Rapor: CleanFix Tasarım Kontrolü #1 — 2026-05-28 10:30 CST*
*Sonraki kontrol önerisi: 48 saat sonra (2026-05-30 10:30)*
