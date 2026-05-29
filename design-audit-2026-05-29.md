# CleanFix Tasarım Kontrol Raporu — 29 Mayıs 2026

## 📊 Özet

| Metrik | Değer |
|--------|-------|
| Toplam HTML Sayfa | 43 |
| CSS Dosyası | 3 (main.css, components.css, dashboard.css) |
| **Inline Hardcoded Color** | **215+** |
| **Inline Hardcoded Background** | **461+** |
| Dark Mode Attribute | ✅ Tüm sayfalarda |
| Responsive Breakpoint | ✅ 4 adet (480/768/1024/1280) |

---

## 🔴 KRİTİK — Inline Hardcoded Stiller (Dark Mode Riski)

**Durum:** CSS değişken tabanlı tasarım sistemi kurulmuş ancak inline `style="color:#..."` ve `style="background:..."` kullanımları dark mode tutarlılığını bozuyor.

| Sayfa | Inline Color | Inline Background | Risk Seviyesi |
|-------|-------------|-------------------|---------------|
| **dashboard.html** | 17 | **136** | 🔴 KRİTİK |
| **company-sectors.html** | **65** | 36 | 🔴 KRİTİK |
| **employee.html** | 40 | 24 | 🔴 KRİTİK |
| **company-staff.html** | ? | 50 | 🟠 YÜKSEK |
| **index.html** | ? | 33 | 🟠 YÜKSEK |
| **company-customers.html** | 7 | 30 | 🟠 YÜKSEK |
| **company-tools.html** | 14 | 17 | 🟡 ORTA |
| **company-quotes.html** | 14 | ? | 🟡 ORTA |
| **employee-tasks.html** | ? | 22 | 🟡 ORTA |
| **company-equipment.html** | 10 | 9 | 🟢 DÜŞÜK |

### Örnek Sorunlu Kod
```html
<!-- company-sectors.html:629 -->
<div class="stat-value-v2" id="statPlan" style="color:#8b5cf6;">4</div>

<!-- dashboard.html içinde 136 adet inline background -->
```

---

## 🟡 UYARI — CSS Dosya Kullanım Tutarsızlığı

### Sayfalar Dashboard CSS'sini Kullanmıyor
Bazı sayfalar (services.html, products.html vb.) `dashboard.css` yerine kendi inline `<style>` bloklarında sidebar/header stillerini tekrar tanımlıyor. Bu:
- **Kod tekrarı** yaratıyor
- **Bakım zorluğu** — bir yerde değişiklik tüm sayfalara yansımıyor
- **Tutarsız davranış** — aynı sidebar farklı sayfalarda farklı görünebilir

### Örnek: services.html
```html
<style>
.sidebar { width:280px; background:var(--bg-card); ... }  /* Tekrar tanım */
.sidebar-logo .logo-icon { ... color: white; }            /* Hardcoded white */
</style>
```

---

## ✅ OLUMLU BULGULAR

### 1. Renk Sistemi — Mükemmel Temel
`main.css` içinde kapsamlı CSS değişken sistemi:
- **Primary**: Teal (#0f766e → #14b8a6)
- **Accent**: Amber (#f59e0b)
- **Neutral**: Slate tam skalası
- **Semantic**: success/warning/error/info
- **Dark mode override**: `[data-theme="dark"]` ile tam karşılık

### 2. Dark Mode Desteği
- ✅ Tüm 43 sayfada `<html data-theme="dark">`
- ✅ `prefers-color-scheme: dark` system fallback
- ✅ `[data-theme="dark"]` selektörleri components.css'te mevcut
- ✅ Scrollbar, selection, backdrop-filter dark uyumlu

### 3. Responsive Grid Sistemi
| Breakpoint | Davranış |
|------------|----------|
| 1280px | 5-col → 4-col, widget-grid-4 → 3-col |
| 1024px | Sidebar off-canvas, grid 4/3 → 2-col |
| 768px | Tüm grid → 1-col, sayfa padding küçülür |
| 480px | Butonlar gizlenir, card padding küçülür |

### 4. Spacing Sistemi
- ✅ `--space-1` den `--space-16` ya kadar sistematik
- ✅ Utility class'lar: `.p-4`, `.mb-6`, `.gap-3` vb.
- ✅ Tutarlı padding/margin kullanımı

### 5. Tipografi
- ✅ Inter font family — tüm sayfalarda tutarlı
- ✅ Font weight skalası: 300-800
- ✅ `clamp()` ile fluid heading ölçeği

### 6. Component Birlikteliği
- ✅ Button varyantları: primary, secondary, ghost, amber, danger
- ✅ Card varyantları: default, elevated, glass, hover
- ✅ Form elementleri: input, select, textarea tutarlı stil
- ✅ Badge, tag, toast, modal, dropdown — hepsi components.css'te

### 7. Animasyon
- ✅ `prefers-reduced-motion` desteği
- ✅ Keyframe'ler merkezi (main.css)
- ✅ Transition süreleri/easing değişkenleriyle tutarlı

---

## 📋 Öncelikli Düzeltme Listesi

### Acil (Bu hafta)
1. **dashboard.html** — 136 inline background'ı CSS class'larına dönüştür
2. **company-sectors.html** — 65 inline color'ı statü göstergeleri için class sistemine taşı
3. **employee.html** — 40 inline color düzeltmesi

### Kısa vadeli (Önümüzdeki sprint)
4. `services.html`, `products.html` vb. sayfaların inline CSS'lerini `dashboard.css` kullanımına geçir
5. Tüm inline `style="color:#[hex]"` kullanımlarını `.text-{color}` utility class'larına dönüştür
6. Tüm inline `style="background:#[hex]"` kullanımlarını `.bg-{color}` utility class'larına dönüştür

### Orta vadeli
7. Eksik dark mode override'ları ekle (notifications-item.unread gibi bazı edge case'ler)
8. Print style'ların tüm sayfalarda tutarlılığını doğrula

---

## 🎯 Sonuç

**Tasarım sistemi temeli sağlam.** Renk paleti, tipografi, spacing ve responsive grid iyi kurulmuş. Ancak **inline hardcoded stiller** dark mode tutarlılığını ve bakım kolaylığını ciddi şekilde tehdit ediyor. `dashboard.html`, `company-sectors.html` ve `employee.html` acil müdahale gerektiriyor.

**Genel Not:** 8/10 — İyi temel, ama inline style temizliği şart.
