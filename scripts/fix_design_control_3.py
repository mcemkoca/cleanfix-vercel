#!/usr/bin/env python3
"""
CleanFix Tasarım Kontrol #3 — Toplu SEO + Accessibility + Favicon Düzeltme Scripti
"""
import os
import re
import glob

BASE_DIR = "/root/.openclaw/workspace/cleanfix-vercel"
os.chdir(BASE_DIR)

# Sayfa başlıkları ve meta açıklamaları (Türkçe default, i18n destekli)
PAGE_META = {
    "index.html": {
        "title": "CleanFix — İşletmenizi Yönetmenin En Akıllı Yolu",
        "desc": "CleanFix, KOBİ'ler için çok sektörlü işletme yönetim platformu. Temizlik, inşaat, berber, market, restoran ve daha fazlası için randevu, stok, personel ve müşteri yönetimi.",
        "tr_title": "CleanFix — İşletmenizi Yönetmenin En Akıllı Yolu",
        "en_title": "CleanFix — The Smartest Way to Manage Your Business",
        "nl_title": "CleanFix — De Slimste Manier om Uw Bedrijf te Beheren",
    },
    "dashboard.html": {
        "title": "CleanFix — Admin Dashboard",
        "desc": "CleanFix admin paneli ile firma yönetimini kontrol altına alın. Analizler, randevular, personel ve müşteri yönetimi.",
    },
    "login.html": {
        "title": "CleanFix — Giriş",
        "desc": "CleanFix hesabınıza giriş yapın. KOBİ yönetim platformuna erişim.",
    },
    "404.html": {
        "title": "CleanFix — Sayfa Bulunamadı",
        "desc": "Aradığınız sayfa bulunamadı. CleanFix ana sayfaya dönün.",
    },
    "company.html": {
        "title": "CleanFix — Firma Paneli",
        "desc": "Firma yönetim paneli. Müşteriler, personel, ekipman ve finansal yönetim.",
    },
    "company-quotes.html": {
        "title": "CleanFix — Teklifler",
        "desc": "Müşteri tekliflerini oluşturun, yönetin ve takip edin. Profesyonel teklif yönetimi.",
    },
    "company-maintenance.html": {
        "title": "CleanFix — Bakım Yönetimi",
        "desc": "Bakım planları, periyodik kontroller ve onarım kayıtları yönetimi.",
    },
    "company-bookings.html": {
        "title": "CleanFix — Randevular",
        "desc": "Müşteri randevularını planlayın, takip edin ve yönetin.",
    },
    "company-customers.html": {
        "title": "CleanFix — Müşteriler",
        "desc": "Müşteri veritabanı, iletişim bilgileri ve hizmet geçmişi yönetimi.",
    },
    "company-equipment.html": {
        "title": "CleanFix — Ekipmanlar",
        "desc": "Ekipman envanteri, bakım takibi ve kullanım raporları.",
    },
    "company-staff.html": {
        "title": "CleanFix — Personel",
        "desc": "Personel yönetimi, vardiyalar, izinler ve performans takibi.",
    },
    "company-services.html": {
        "title": "CleanFix — Hizmetler",
        "desc": "Hizmet kataloğu, fiyatlandırma ve paket yönetimi.",
    },
    "company-stock.html": {
        "title": "CleanFix — Stok",
        "desc": "Stok yönetimi, depo takibi ve sipariş otomasyonu.",
    },
    "company-sectors.html": {
        "title": "CleanFix — Sektörler",
        "desc": "Çok sektörlü yönetim: temizlik, inşaat, berber, market, restoran ve daha fazlası.",
    },
    "company-tools.html": {
        "title": "CleanFix — Araçlar",
        "desc": "Araç ve ekipman envanteri, takvimi ve kullanım yönetimi.",
    },
    "company-calendar.html": {
        "title": "CleanFix — Takvim",
        "desc": "Firma takvimi, randevu planlama ve hatırlatıcılar.",
    },
    "company-expenses.html": {
        "title": "CleanFix — Giderler",
        "desc": "Gider takibi, bütçe yönetimi ve finansal raporlar.",
    },
    "company-invoices.html": {
        "title": "CleanFix — Faturalar",
        "desc": "Fatura oluşturma, gönderme ve ödeme takibi.",
    },
    "company-reviews.html": {
        "title": "CleanFix — Değerlendirmeler",
        "desc": "Müşteri değerlendirmeleri ve geri bildirim yönetimi.",
    },
    "company-quality.html": {
        "title": "CleanFix — Kalite Kontrol",
        "desc": "Kalite standartları, denetimler ve sertifika yönetimi.",
    },
    "company-analytics.html": {
        "title": "CleanFix — Analizler",
        "desc": "Firma analizleri, raporlar ve iş zekası dashboard'u.",
    },
    "company-profile.html": {
        "title": "CleanFix — Firma Profili",
        "desc": "Firma bilgileri, iletişim ayarları ve tercihler.",
    },
    "customer-portal.html": {
        "title": "CleanFix — Müşteri Portalı",
        "desc": "Müşteri self-servis portalı. Randevu, teklif ve hizmet geçmişi.",
    },
    "customers.html": {
        "title": "CleanFix — Müşteri Listesi",
        "desc": "Tüm müşterilerinizi tek ekranda görüntüleyin ve yönetin.",
    },
    "bookings.html": {
        "title": "CleanFix — Randevu Listesi",
        "desc": "Randevu takvimi ve liste görünümü.",
    },
    "employee.html": {
        "title": "CleanFix — Personel Detay",
        "desc": "Personel profili, vardiya ve performans detayları.",
    },
    "invoices.html": {
        "title": "CleanFix — Fatura Listesi",
        "desc": "Tüm faturaların listesi ve ödeme durumu.",
    },
    "pricing.html": {
        "title": "CleanFix — Fiyatlandırma",
        "desc": "CleanFix paketleri ve fiyatlandırma planları.",
    },
    "products.html": {
        "title": "CleanFix — Ürünler",
        "desc": "Ürün kataloğu ve envanter yönetimi.",
    },
    "reports.html": {
        "title": "CleanFix — Raporlar",
        "desc": "Detaylı işletme raporları ve analizler.",
    },
    "services.html": {
        "title": "CleanFix — Hizmet Listesi",
        "desc": "Sunulan hizmetler ve detaylı bilgiler.",
    },
    "settings.html": {
        "title": "CleanFix — Ayarlar",
        "desc": "Hesap ayarları, güvenlik ve bildirim tercihleri.",
    },
    "staff.html": {
        "title": "CleanFix — Personel Listesi",
        "desc": "Personel listesi ve temel yönetim.",
    },
    "support.html": {
        "title": "CleanFix — Destek",
        "desc": "CleanFix destek merkezi ve yardım kaynakları.",
    },
}

FAVICON_BLOCK = '''\n<!-- Favicon & PWA Icons -->
<link rel="icon" type="image/png" sizes="72x72" href="assets/icon-72.png">
<link rel="icon" type="image/png" sizes="96x96" href="assets/icon-96.png">
<link rel="icon" type="image/png" sizes="128x128" href="assets/icon-128.png">
<link rel="icon" type="image/png" sizes="192x192" href="assets/icon-192.png">
<link rel="apple-touch-icon" sizes="152x152" href="assets/icon-152.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/icon-192.png">
<link rel="mask-icon" href="assets/icon-192.png" color="#0d9488">
'''

def get_meta_block(page_name, meta):
    title = meta.get("title", "CleanFix")
    desc = meta.get("desc", "CleanFix — Çok sektörlü KOBİ yönetim platformu.")
    # Base URL
    base_url = "https://mcemkoca.github.io/cleanfix-vercel/"
    page_url = base_url + page_name
    
    block = f'''\n<!-- SEO Meta Tags -->
<meta name="description" content="{desc}">
<meta name="keywords" content="KOBİ, SaaS, temizlik yönetimi, inşaat yönetimi, berber programı, market POS, restoran yönetimi, marangoz sipariş, elektrik tesisat, Belçika, MKB, schoonmaak, kapsalon, bouw, winkel, restaurant, horeca">
<meta name="author" content="Deuterium12{{MCK}}">
<meta name="robots" content="index, follow">
<meta name="googlebot" content="index, follow">
<meta name="bingbot" content="index, follow">

<!-- Open Graph / Facebook -->
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{page_url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="CleanFix">
<meta property="og:image" content="{base_url}assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="tr_TR">

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{base_url}assets/og-image.png">
<meta name="twitter:site" content="@cleanfix">
<meta name="twitter:creator" content="@cleanfix">

<!-- Canonical -->
<link rel="canonical" href="{page_url}">
'''
    return block

ERROR_BOUNDARY_SCRIPT = '''\n<!-- Global Error Boundary -->
<script>
(function(){
  window.__cf_errors = [];
  window.addEventListener('error', function(e) {
    window.__cf_errors.push({msg: e.message, file: e.filename, line: e.lineno, col: e.colno, time: new Date().toISOString()});
    console.error('[CleanFix Global Error]', e.message, 'at', e.filename + ':' + e.lineno);
  });
  window.addEventListener('unhandledrejection', function(e) {
    window.__cf_errors.push({msg: String(e.reason), type: 'unhandledrejection', time: new Date().toISOString()});
    console.error('[CleanFix Unhandled Rejection]', e.reason);
  });
  // Error boundary helper for async functions
  window.safeExec = function(fn, ctx) {
    try { return fn.call(ctx); } catch(err) { console.error('[CleanFix SafeExec]', err); return null; }
  };
})();
</script>
'''

# === 1. FAVICON + META TAG EKLE ===
print("=" * 60)
print("ADIM 1: Favicon + SEO Meta Tags Ekleniyor...")
print("=" * 60)

html_files = sorted(glob.glob("*.html"))
modified_count = 0

for filepath in html_files:
    filename = os.path.basename(filepath)
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    original = content
    meta = PAGE_META.get(filename, {"title": "CleanFix", "desc": "CleanFix — Çok sektörlü KOBİ yönetim platformu."})
    
    # Skip if already has comprehensive OG tags (only index.html might)
    if 'property="og:image:width"' in content:
        print(f"  SKIP (zaten tam OG var): {filename}")
        continue
    
    # Insert favicon block after the last <link rel="stylesheet"> or before </head>
    if 'rel="icon"' not in content:
        # Find position: after viewport meta, before </head>
        insert_pos = content.find('</head>')
        if insert_pos != -1:
            content = content[:insert_pos] + FAVICON_BLOCK + get_meta_block(filename, meta) + content[insert_pos:]
            modified_count += 1
            print(f"  OK: {filename}")
        else:
            print(f"  WARN: </head> bulunamadı: {filename}")
    else:
        # Has icon but maybe missing OG — insert meta before </head>
        insert_pos = content.find('</head>')
        if insert_pos != -1 and 'property="og:image:width"' not in content:
            content = content[:insert_pos] + get_meta_block(filename, meta) + content[insert_pos:]
            modified_count += 1
            print(f"  OK (meta eklendi): {filename}")
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print(f"\nToplam düzenlenen dosya: {modified_count}/{len(html_files)}")

# === 2. ERROR BOUNDARY SCRIPT EKLE ===
print("\n" + "=" * 60)
print("ADIM 2: Global Error Boundary Script Ekleniyor...")
print("=" * 60)

added_err = 0
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    if '__cf_errors' in content:
        print(f"  SKIP: {os.path.basename(filepath)}")
        continue
    
    # Insert before closing </head> or after <body>
    pos = content.find('<body')
    if pos == -1:
        pos = content.find('</head>')
    
    if pos != -1:
        content = content[:pos] + ERROR_BOUNDARY_SCRIPT + content[pos:]
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        added_err += 1
        print(f"  OK: {os.path.basename(filepath)}")
    else:
        print(f"  WARN: Ekleme noktası bulunamadı: {os.path.basename(filepath)}")

print(f"\nToplam error boundary eklenen: {added_err}/{len(html_files)}")

# === 3. ARIA LABELS (Basit navigasyon butonları) ===
print("\n" + "=" * 60)
print("ADIM 3: Aria Labels Ekleniyor...")
print("=" * 60)

aria_added = 0
for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    original = content
    count = 0
    
    # More targeted: add role and aria to main structural elements
    if '<nav' in content and 'role="navigation"' not in content:
        content = content.replace('<nav', '<nav role="navigation" aria-label="Main navigation"', 1)
        count += 1
    if '<main' in content and 'role="main"' not in content:
        content = content.replace('<main', '<main role="main"', 1)
        count += 1
    if '<footer' in content and 'role="contentinfo"' not in content:
        content = content.replace('<footer', '<footer role="contentinfo"', 1)
        count += 1
    if '<header' in content and 'role="banner"' not in content:
        content = content.replace('<header', '<header role="banner"', 1)
        count += 1
    
    # Add aria-label to sidebar toggle and common buttons
    content = re.sub(
        r'<button\s+class="sidebar-toggle"',
        lambda m: m.group(0).replace('<button', '<button aria-label="Toggle sidebar"'),
        content
    )
    content = re.sub(
        r'<button\s+class="theme-toggle"',
        lambda m: m.group(0).replace('<button', '<button aria-label="Toggle dark mode"'),
        content
    )
    content = re.sub(
        r'<button\s+class="lang-toggle"',
        lambda m: m.group(0).replace('<button', '<button aria-label="Change language"'),
        content
    )
    content = re.sub(
        r'<button\s+class="notification-toggle"',
        lambda m: m.group(0).replace('<button', '<button aria-label="Notifications"'),
        content
    )
    content = re.sub(
        r'<button\s+class="user-menu-toggle"',
        lambda m: m.group(0).replace('<button', '<button aria-label="User menu"'),
        content
    )
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        aria_added += 1
        print(f"  OK: {os.path.basename(filepath)} (aria eklendi)")
    else:
        print(f"  SKIP: {os.path.basename(filepath)} (zaten var veya yapısal element yok)")

print(f"\nToplam aria düzenlenen dosya: {aria_added}/{len(html_files)}")

# === 4. SITEMAP GÜNCELLEME ===
print("\n" + "=" * 60)
print("ADIM 4: Sitemap.xml Güncelleniyor...")
print("=" * 60)

# Add missing pages to sitemap
missing_pages = [
    "bookings.html", "company-analytics.html", "company-bookings.html",
    "company-calendar.html", "company-customers.html", "company-equipment.html",
    "company-expenses.html", "company-invoices.html", "company-profile.html",
    "company-quality.html", "company-reviews.html", "company-stock.html",
    "company-tools.html", "customer-portal.html", "customers.html",
    "employee.html", "invoices.html", "pricing.html", "products.html",
    "reports.html", "services.html", "settings.html", "staff.html", "support.html"
]

with open("sitemap.xml", 'r', encoding='utf-8') as f:
    sitemap = f.read()

added_sitemap = 0
for page in missing_pages:
    if f"/{page}</loc>" in sitemap or f"/{page}&lt;/loc>" in sitemap:
        continue
    # Insert before closing </urlset>
    entry = f'  <url><loc>https://mcemkoca.github.io/cleanfix-vercel/{page}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n'
    pos = sitemap.rfind('</urlset>')
    if pos != -1:
        sitemap = sitemap[:pos] + entry + sitemap[pos:]
        added_sitemap += 1
        print(f"  EKLENDI: {page}")

if added_sitemap > 0:
    with open("sitemap.xml", 'w', encoding='utf-8') as f:
        f.write(sitemap)

print(f"\nSitemap'e eklenen yeni sayfa: {added_sitemap}")

print("\n" + "=" * 60)
print("TÜM ADIMLAR TAMAMLANDI ✅")
print("=" * 60)
