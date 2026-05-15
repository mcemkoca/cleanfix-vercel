# 🧹 CleanFix — Çok Sektörlü KOBİ Yönetim Platformu

> **Tek platform. Yedi sektör. Sınırsız modül.**

CleanFix, KOBİ şirketlerine sektöre özel, modüler SaaS çözümleri sunan **tek temel platformdur**. Temizlikten inşaata, marketten restorana — her sektör kendi ihtiyaçlarına göre özelleşen modüllerle çalışır.

[![Deploy Status](https://img.shields.io/badge/deploy-GitHub%20Pages-success?logo=github&color=14b8a6)](https://mcemkoca.github.io/cleanfix-vercel/)
[![Sektör Sayısı](https://img.shields.io/badge/sektör-7-blueviolet?color=14b8a6)](https://mcemkoca.github.io/cleanfix-vercel/company-sectors.html)
[![Sayfa Sayısı](https://img.shields.io/badge/sayfa-50%2B-informational?color=14b8a6)]()
[![Theme](https://img.shields.io/badge/theme-Dark%2FLight-1a1a2e?color=14b8a6)]()

---

## 🚀 Canlı Demo

| Sektör | Landing Page | Dashboard |
|--------|:----------:|:---------:|
| **🧹 CleanFix** (Temizlik) | [index.html](https://mcemkoca.github.io/cleanfix-vercel/index.html) | [dashboard.html](https://mcemkoca.github.io/cleanfix-vercel/dashboard.html) |
| **🏗️ BuildPro** (İnşaat & Renovasyon) | [sectors/buildpro/index.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/buildpro/index.html) | [sectors/buildpro/dashboard.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/buildpro/dashboard.html) |
| **💜 BarberPro** (Berber & Kuaför) | [sectors/barberpro/index.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/barberpro/index.html) | [sectors/barberpro/dashboard.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/barberpro/dashboard.html) |
| **🛒 MarketPro** (Market / Bakkal) | [sectors/marketpro/index.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/marketpro/index.html) | [sectors/marketpro/dashboard.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/marketpro/dashboard.html) |
| **🍽️ RestoPro** (Restoran) | [sectors/restopro/index.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/restopro/index.html) | [sectors/restopro/dashboard.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/restopro/dashboard.html) |
| **🪚 WoodPro** (Marangoz & Mobilya) | [sectors/woodpro/index.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/woodpro/index.html) | [sectors/woodpro/dashboard.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/woodpro/dashboard.html) |
| **⚡ ElektroPro** (Elektrik & Sıhhi Tesisat) | [sectors/elektropro/index.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/elektropro/index.html) | [sectors/elektropro/dashboard.html](https://mcemkoca.github.io/cleanfix-vercel/sectors/elektropro/dashboard.html) |

---

## ✨ Özellikler

### Modüler Yapı
- **12 aktif/pasif edilebilir modül**: Personel, e-Fatura, Müşteri Portalı, Gelir-Gider, Analitik, Ajanda, Keşif & Teklif, Ekipman, Garanti Takibi, Stok, Raporlar, Bordro
- Her sektör kendi ihtiyacına göre modülleri açıp kapatabilir

### Her Sektörde
- 📊 **Dashboard** — KPI kartları, Chart.js grafikleri, hızlı işlemler
- 📋 **Operasyonel Sayfalar** — 4-6 detaylı yönetim ekranı
- 🎨 **Tutarlı Tasarım** — Teal `#14b8a6` ana renk, dark/light tema, Inter font
- 📱 **Responsive** — Masaüstü, tablet, mobil uyumlu
- 🔗 **Cross-link** — Tüm sektörler arası geçiş

### Teknik
- ⚡ **Static HTML/CSS/JS** — GitHub Pages uyumlu, backend gerektirmez
- 🌙 **Dark Mode Default** — `localStorage` ile tema hatırlama
- 📈 **Chart.js** — Çubuk, pasta, çizgi grafikleri
- 🔔 **Toast Bildirimleri** — Gerçek zamanlı geri bildirim
- 🗑️ **CRUD Modalları** — Ekle, düzenle, sil, görüntüle (tümü çalışır)
- 🇧🇪 **Belçika Odaklı** — € para birimi, gerçekçi Belçika firma/ürün verisi

---

## 🏗️ Sektör Detayları

| Sektör | Modül | Sayfa | Durum |
|--------|-------|-------|-------|
| **🧹 CleanFix** | 9 Modül | 12 Sayfa | ✅ Aktif |
| **🏗️ BuildPro** | 10 Modül | 12 Sayfa | ✅ Aktif |
| **💜 BarberPro** | 7 Modül | 10 Sayfa | ✅ Aktif |
| **🛒 MarketPro** | 4 Modül | 6 Sayfa | 🚧 Geliştirme |
| **🍽️ RestoPro** | 6 Modül | 6 Sayfa | 🚧 Geliştirme |
| **🪚 WoodPro** | 7 Modül | 6 Sayfa | 🚧 Geliştirme |
| **⚡ ElektroPro** | 6 Modül | 6 Sayfa | 🚧 Geliştirme |

---

## 🛠️ Teknoloji Stack

```
Frontend:    HTML5 + CSS3 (Custom Design System) + Vanilla JS
Charts:      Chart.js 4.4.1
Icons:       SVG inline
Fonts:       Inter (Google Fonts)
Deploy:      GitHub Pages
Theme:       CSS Variables (dark/light)
Responsive:  CSS Grid + Flexbox
```

---

## 📦 Kurulum

```bash
# Repo'yu klonlayın
git clone https://github.com/mcemkoca/cleanfix-vercel.git
cd cleanfix-vercel

# Lokalde çalıştırın (Python ile basit HTTP server)
python3 -m http.server 8000

# Tarayıcıda açın
open http://localhost:8000
```

> Deploy için: GitHub Pages → `main` branch → `/(root)` klasörü.

---

## 🗺️ Proje Yapısı

```
cleanfix-vercel/
├── index.html                          # 🧹 CleanFix Landing
├── dashboard.html                      # CleanFix Dashboard
├── company-sectors.html                # Sektör yönetimi
├── login.html                          # Giriş ekranı
├── css/
│   ├── main.css                        # Temel değişkenler + layout
│   ├── components.css                  # Kartlar, butonlar, formlar
│   └── dashboard.css                   # Sidebar, KPI, tablolar
├── sectors/
│   ├── buildpro/                       # 🏗️ İnşaat (12 sayfa)
│   ├── barberpro/                      # 💜 Berber (10 sayfa)
│   ├── marketpro/                      # 🛒 Market (6 sayfa)
│   ├── restopro/                       # 🍽️ Restoran (6 sayfa)
│   ├── woodpro/                        # 🪚 Marangoz (6 sayfa)
│   └── elektropro/                     # ⚡ Elektrik (6 sayfa)
└── README.md                           # Bu dosya
```

---

## 📋 Yol Haritası (v2.0)

- [ ] **PWA** — Offline-first, Service Worker
- [ ] **e-Fatura** — Peppol (Belçika UBL) entegrasyonu
- [ ] **AI Teklif** — Otomatik malzeme hesaplama + fiyat tahmini
- [ ] **Çoklu Dil** — TR / EN / FR / NL
- [ ] **Mobil App** — React Native / Flutter wrapper
- [ ] **Auth v2** — Gerçek auth (Supabase/Firebase)
- [ ] **API** — REST backend (Node.js + PostgreSQL)

Detaylı roadmap: [`memory/buildpro-roadmap-v2.md`](memory/buildpro-roadmap-v2.md)

---

## 🤝 Cross-Platform

Her platformun footer'ında diğer sektörlerin linkleri bulunur:

```
CleanFix    ←→    BuildPro    ←→    BarberPro
   ↑                ↑               ↑
MarketPro ←→   RestoPro   ←→    WoodPro
   ↑
ElektroPro
```

---

## 📄 Lisans

MIT License — KOBİ'ler için özgür ve açık.

---

## 👤 Geliştirici

**Deuterium12{MCK}** — PQC Araştırmacısı & KOBİ SaaS Geliştiricisi

📧 kamsaman32@gmail.com  
🐦 [mcemkoca](https://github.com/mcemkoca)

---

<div align="center">

**[🚀 Canlı Demoyu İncele](https://mcemkoca.github.io/cleanfix-vercel/)**

</div>
