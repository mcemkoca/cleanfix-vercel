CleanFix / KobiPro — Tasarım Kontrol #2 Raporu
UI/UX Akış Testi | Form Validasyon | Loading State | Empty State | Toast Bildirimleri
Tarih: 2026-05-21 11:00 CST
Kapsam: 30+ HTML sayfa, 17 company sayfa, login, dashboard, landing

═══════════════════════════════════════════════════════════════════
1. UI/UX AKIŞ TESTİ — Login → Dashboard → Sayfalar
═══════════════════════════════════════════════════════════════════

✅ GİRİŞ AKIŞI (Login Flow)
  • 3 role tab (Admin / Firma / Çalışan) — aktif geçiş çalışıyor
  • Demo credential'lar role göre otomatik dolduruluyor
  • Form submit: 1.5 saniye simülasyon loading (btnLoader görseli var)
  • Başarılı giriş toast'u + localStorage token yazımı
  • Yönlendirme: admin→dashboard.html | company→company.html | employee→employee.html
  • ?redirect= parametresi destekli (buildpro/barberpro cross-link)

⚠️ AKTARMA SORUNLARI
  • Dashboard.html sidebar genişliği 260px (diğer company sayfalarda 280px)
  • Bu fark desktop'ta görsel tutarsızlık yaratıyor
  • Dashboard'dan company sayfalara geçişte sidebar genişliği "atlama" yapıyor

✅ AUTH KORUMA
  • TÜM 17 company sayfasında checkAuth() var (inline IIFE)
  • Token yoksa login.html?redirect=... yönlendirmesi aktif
  • Logout: localStorage temizleme + login.html yönlendirmesi

✅ NAVİGASYON TUTARLILIĞI
  • Tüm company sayfalarında sidebar nav yapısı tutarlı
  • active class sayfaya göre güncelleniyor
  • Sektör dropdown 8 platformu listeliyor
  • Mobil hamburger menü çalışıyor (CSS transform)

═══════════════════════════════════════════════════════════════════
2. FORM VALIDASYON GÖRSELİ
═══════════════════════════════════════════════════════════════════

✅ LOGIN FORMU
  • has-error class'ı: emailGroup / passwordGroup üzerinde çalışıyor
  • input event'leriyle error state otomatik temizleniyor
  • Password minimum 6 karakter kontrolü var
  • Toast ile hata mesajı (3 dilli placeholder)

❌ COMPANY SAYFA FORMLARI (Kritik Eksiklik)
  • addModal / editModal formlarında has-error class kullanımı YOK
  • Hata durumunda sadece input.style.borderColor = 'var(--error-500)' (geçici 2 sn)
  • Bu tutarsız — login'de has-error var, diğerlerinde border flash
  • ARIA error mesajları yok (aria-invalid, aria-describedby)
  • HTML5 required attribute var ama custom validation görsel zayıf

✅ VALIDASYON MANTIĞI
  • Email regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ — tüm sayfalarda tutarlı
  • Telefon: 7 hane minimum — tüm sayfalarda tutarlı
  • Zorunlu alan kontrolü: customer||date||time||service||staff — tam

⚠️ KONTRAST SORUNU (Design Control #3'den devam)
  • Beyaz metin on Teal butonlar: ~2.9:1 (WCAG AA 4.5:1 altında)
  • Placeholder metin: ~2.6:1 (zor okunuyor)
  • Muted metin: ~3.8:1 (sınırda)

═══════════════════════════════════════════════════════════════════
3. LOADING STATE TUTARLILIĞI
═══════════════════════════════════════════════════════════════════

❌❌❌ KRİTİK EKSİKLİK — Loading state neredeyse hiç yok

| Konum | Durum | Not |
|-------|-------|-----|
| login.html submit | ✅ Var | btnLoader + btnText toggle + disabled |
| dashboard.html | ❌ Yok | Sayfa yüklenirken skeleton/spinner yok |
| company-bookings add/edit | ❌ Yok | Form submit anında loading yok |
| company-customers add/edit | ❌ Yok | Form submit anında loading yok |
| company-quotes add/edit | ❌ Yok | Form submit anında loading yok |
| company-maintenance | ❌ Yok | Panel açılış/kapanışta loading yok |
| Tüm tablo sayfaları | ❌ Yok | Filtreleme sırasında loading yok |
| Tüm sayfalar | ❌ Yok | İlk yüklemede skeleton screen yok |

CSS'TE TANIMLI AMA KULLANILMIYOR
  • .skeleton, .skeleton-text, .skeleton-circle, .skeleton-card
  • shimmer animation tanımlı
  • Ama HIÇBIR HTML sayfasında bu class'lar kullanılmıyor

ÖNERİLEN EKLEME NOKTALARI
  1. Form submit button'larına: spinner + disabled state
  2. Tablo filtreleme sırasına: tbody üzerine opacity:0.5 + spinner overlay
  3. Sayfa ilk yüklenişine: skeleton screen (3-5 kart yer tutucu)
  4. Modal açılışlarına: içerik lazy-load varsa spinner

═══════════════════════════════════════════════════════════════════
4. EMPTY STATE CHECK
═══════════════════════════════════════════════════════════════════

❌❌❌ KRİTİK EKSİKLİK — Empty state kullanımı YOK

CSS Tanımlı
  • .empty-state, .empty-state-icon, .empty-state-title, .empty-state-desc, .empty-state-action
  • Hepsi components.css'te var, güzel tasarlanmış

Ama Kullanılmıyor
  • company-bookings.html: Tablo her zaman 25 satır demo data ile dolu
  • company-customers.html: Tablo her zaman demo data ile dolu
  • company-stock.html: Tablo her zaman demo data ile dolu
  • company-staff.html: Tablo her zaman demo data ile dolu
  • Tüm diğer sayfalar aynı şekilde

GERÇEKÇİLİK SORUNU
  • Kullanıcı ilk kez giriş yaptığında 25 randevu, 15 müşteri, 20 stok kalemi görmesi
    mantıksız — bu bir SaaS ürünü değil, demo verisi bombardımanı hissi yaratıyor
  • "Boş state yok, placeholder yok, 'No data' mesajı yok" kuralı 
    YANLIŞ anlaşılmış — gerçekçi içerik DEMOK veriyle doldurmak değil,
    gerçek kullanım akışını simüle etmek

ÖNERİLEN BOŞ STATE SENARYOLARI
  1. Yeni kullanıcı ilk giriş: "Henüz randevu yok — İlk randevu oluştur" CTA
  2. Filtre sonucu boş: "Arama kriterlerine uygun sonuç bulunamadı"
  3. Tablo tamamen boş: İllüstrasyon + açıklama + ekle butonu
  4. 404.html zaten güzel boş state örneği (kopyalanabilir)

═══════════════════════════════════════════════════════════════════
5. TOAST BİLDİRİMLERİ — TUTARSIZLIK ANALİZİ
═══════════════════════════════════════════════════════════════════

❌❌❌ KRİTİK — 3 FARKLI TOAST IMPLEMENTASYONU

Tip A: Dinamik Toast Container (En İyi)
─────────────────────────────────────────
  function showToast(msg, type='success', dur=3000) {
    let c = document.querySelector('.toast-container');
    if (!c) { c = document.createElement('div'); c.className = 'toast-container'; document.body.appendChild(c); }
    let t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, dur);
  }

  Kullanan sayfalar:
  ✅ company-analytics, company-bookings, company-calendar,
    company-expenses, company-invoices, company-profile,
    company-quality, company-reviews, company-sectors,
    company-services, company-staff, company-stock

Tip B: Sabit DOM Element (#toast)
──────────────────────────────────
  function showToast(msg) {
    const tEl = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    tEl.classList.add('show');
    setTimeout(() => tEl.classList.remove('show'), 3000);
  }

  Kullanan sayfalar:
  ❌ company-customers, company-equipment, company-maintenance, company-quotes

  Sorun: type parametresi yok (success/error/info ayrımı yapılamıyor)
  Sorun: Aynı anda 2 toast oluşturulamaz (tek element üzerinde çalışıyor)
  Sorun: duration parametresi yok

Tip C: Farklı Signature (company-tools)
────────────────────────────────────────
  function showToast(msg, type) { ... }
  Kullanım: showToast('mesaj', 'success') — ama tip kontrolü zayıf

Ek Sorunlar:
  • Aynı sayfada 2 farklı showToast fonksiyonu var (örn: company-bookings, company-customers)
    — birisi inline, diğeri IIFE wrapper'ın içinde. İkincisi ilki override ediyor
  • Toast mesajları i18n'e bağlı ama fallback string'ler 3 dil bir arada:
    "Geçerli e-posta giriniz / Valid email required / Geldig e-mailadres vereist"
  • Toast container CSS'leri her sayfada inline tekrarlanıyor (~15 satır CSS * 30 sayfa)

═══════════════════════════════════════════════════════════════════
6. GENEL PUANLAMA
═══════════════════════════════════════════════════════════════════

| Kategori | Puan | Durum |
|----------|------|-------|
| Login→Dashboard Akışı | 8/10 | İyi, sidebar genişliği tutarsız |
| Auth Koruma | 9/10 | Tüm sayfalarda var |
| Form Validasyon | 5/10 | Login iyi, diğerleri zayıf |
| Loading State | 2/10 | Sadece login'de var |
| Empty State | 1/10 | CSS'te var ama kullanılmıyor |
| Toast Tutarlılığı | 3/10 | 3 farklı implementasyon |
| Kontrast / Görsel | 5/10 | WCAG hataları devam ediyor |
| Mobil Responsive | 7/10 | Hamburger + table scroll var |
| **Toplam** | **40/90** | **%44 — Geliştirilmesi Gerekli** |

═══════════════════════════════════════════════════════════════════
7. ÖNERİLEN EYLEM PLANI (Öncelik Sırası)
═══════════════════════════════════════════════════════════════════

🔴 Kritik (Bu Hafta)
────────────────────
1. Tüm sayfalarda showToast'u Tip A'ya standardize et (dinamik container)
   → 4 sayfa (customers, equipment, maintenance, quotes) Tip B'den dönüştürülecek
   → company-tools Tip C'den dönüştürülecek

2. Tüm form submit button'larına loading state ekle
   → btnText / btnLoader pattern (login.html'den kopyala)
   → submitBtn.disabled = true
   → 15+ modal form'a uygula

3. Empty state kullanımını başlat
   → En az 5 ana sayfaya (bookings, customers, stock, staff, invoices)
   → Filtre sonucu boş senaryosunu ekle

🟡 Önemli (Gelecek Sprint)
──────────────────────────
4. Form validasyon görselini standardize et
   → has-error class'ını tüm formlara yay
   → error message element'ini her form grubuna ekle
   → borderColor flash yerine kalıcı error state

5. Sidebar genişliğini standardize et
   → Dashboard 260px → 280px yap (diğerleriyle eşitle)
   → Veya tüm sayfalarda CSS değişkeni ile tek noktadan yönet

6. Skeleton screen ekle
   → dashboard.html ilk yükleme için
   → Tablo sayfaları filtreleme sırasında

🟢 İyileştirme
──────────────
7. Toast CSS'lerini components.css'e taşı (inline tekrarı kaldır)
8. Demo data miktarını azalt / boş state gösterimini test et
9. Kontrast hatalarını düzelt (Design Control #3 raporuna bak)
10. ARIA attribute'ları ekle (aria-invalid, aria-describedby, role)

═══════════════════════════════════════════════════════════════════
Raporu Hazırlayan: Aslan / CleanFix Tasarım Kontrol #2
═══════════════════════════════════════════════════════════════════