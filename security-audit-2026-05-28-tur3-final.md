CleanFix Güvenlik Kontrol Raporu — Tur #3 (28 Mayıs 2026, 09:00 CST)
====================================================================

Kontrol Kapsamı: Müşteri portal / Çalışan portal izolasyonu, veri sızıntısı, cookie güvenliği, son rapor
Taranan Dosyalar: 35 HTML, 6 JS, 2 CSS | 20 MB

════════════════════════════════════════════════════════════════════
1. PORTAL İZOLASYONU — Durum: ⚠️ YAPI VAR, GÜVENLİK YETERSİZ
════════════════════════════════════════════════════════════════════

Portal Ayrımı:
┌─────────────────────────┬────────────────────────────────────┐
│ Portal                  │ checkAuth() çağrısı                │
├─────────────────────────┼────────────────────────────────────┤
│ Müşteri (customer)      │ checkAuth('customer')              │
│ Çalışan (employee)      │ checkAuth('employee')              │
│ Yönetici (admin)        │ checkAuth('admin')                 │
│ Firma (company)         │ checkAuth(['admin','company'])     │
└─────────────────────────┴────────────────────────────────────┘

• Toplam 35/35 HTML dosyada checkAuth() çağrısı mevcut ✅
• customer-portal.html: checkAuth('customer') — sadece müşteri erişimi ✅
• employee-dashboard.html: checkAuth('employee') — sadece çalışan erişimi ✅
• employee.html: checkAuth('employee') ✅
• employee-tasks.html: checkAuth('employee') ✅
• dashboard.html: checkAuth('admin') ✅
• Tüm company-*.html: checkAuth(['admin','company']) ✅

KRİTİK SORUN:
• Tüm kontrol client-side localStorage üzerinden.
• Bypass trivial: browser console'dan
  localStorage.setItem('kobipro_user', JSON.stringify({role:'admin'}))
  yazarak herhangi bir role geçiş yapılabilir.
• Customer portal'daki kullanıcı employee-dashboard.html'e erişemez
  (role kontrolü var), ama localStorage'ı değiştirerek atlatır.

Sonuç: Portal ayrımı yapısal olarak var ama teknik olarak güvenli değil.
       Production'da server-side JWT + HttpOnly cookie şart.

════════════════════════════════════════════════════════════════════
2. VERİ SIZINTISI / PII KONTROLÜ — Durum: 🔴 AKTİF RISK
════════════════════════════════════════════════════════════════════

A. customer-portal.html:
   • Jan Peeters profili (fictional) — e-posta, randevu, fatura verisi
   • Fatura detayları: #F-2026-1020, €149, ödeme durumu
   • Hizmet geçmişi: çalışan isimleri, adresler, ücretler
   • Bu veriler demo/fictional olmasına rağmen production'da
     gerçek müşteri verisi olursa leak riski yüksek

B. employee.html:
   • Bordro verileri hâlâ client-side HTML içinde:
     - "€1.643,95 maaş yatırıldı" bildirimi
     - "Performans primi: €200" duyurusu
     - Temel maaş, net ödeme, brüt toplam, vergi, sigorta değerleri
   • IBAN alanları placeholder'a dönüştürülmüş ✅ (önceki tur)
   • "DEMO DATA WARNING" notu eklenmiş ✅ (önceki tur)
   • Ancak maaş/bordro verisi hâlâ sayfada

C. company-customers.html:
   • Müşteri telefon, adres, gelir verisi tablolarda
   • Gerçek veri değil ama production'da API'den gelecek

D. XSS Riski (innerHTML kullanımı):
   • js/app.js:49 — toast.innerHTML (mesaj içerikli)
   • js/toast.js:121 — toast.innerHTML
   • js/pwa.js:177, 207 — banner.innerHTML
   • js/export.js:169-187 — buton innerHTML'leri
   • Toplam 28 innerHTML kullanımı JS dosyalarında
   • Kullanıcı girdisi doğrudan HTML'e yazılıyor
   • Çözüm: textContent veya DOMPurify

E. localStorage Veri Saklama:
   • kobipro_auth_token — client-side, XSS ile çalınabilir
   • kobipro_user — role bilgisi, editlenebilir
   • cf_remember_me — session tercihi
   • cf_cache_* — offline cache verisi
   • Hiçbiri HttpOnly cookie'de değil — XSS saldırısında leak olur

════════════════════════════════════════════════════════════════════
3. COOKIE GÜVENLİĞİ — Durum: 🔴 HİÇ COOKIE KULLANILMIYOR
════════════════════════════════════════════════════════════════════

Durum: Uygulama tamamen localStorage-based. Cookie kullanımı yok.

Eksik Güvenlik Başlıkları:
┌─────────────────────────┬────────────────────────────────────┐
│ Başlık                  │ Durum                              │
├─────────────────────────┼────────────────────────────────────┤
│ X-Frame-Options         │ 🔴 Yok (Clickjacking riski)        │
│ X-Content-Type-Options  │ 🔴 Yok (MIME sniffing riski)       │
│ Referrer-Policy         │ 🔴 Yok                             │
│ Permissions-Policy      │ 🔴 Yok                             │
│ Strict-Transport-Security│ 🔴 Yok (HSTS)                     │
│ Set-Cookie (HttpOnly)   │ 🔴 Yok — cookie yok                │
│ Set-Cookie (Secure)     │ 🔴 Yok — cookie yok                │
│ Set-Cookie (SameSite)   │ 🔴 Yok — cookie yok                │
│ Rate-Limit headers      │ 🔴 Yok                             │
│ _headers dosyası         │ 🟡 Var ama boş / eksik             │
└─────────────────────────┴────────────────────────────────────┘

_localStorage_ tabanlı auth sisteminin riskleri:
1. XSS saldırısında token çalınır (HttpOnly cookie olsa çalınmazdı)
2. JavaScript ile token değiştirilebilir (role escalation)
3. Subdomain XSS'te token leak olur (SameSite cookie olsa korunurdu)
4. Browser extension'lar token'a erişebilir

════════════════════════════════════════════════════════════════════
4. ÖNCEKİ TURLARDAN DEĞİŞİM
════════════════════════════════════════════════════════════════════

✅ DÜZELTİLDİ (Tur 1-2):
• CSP eksik 4 sayfa → 35/35 tamamlandı
• 9 sayfada rol kontrolü eksik → checkAuth eklendi
• Employee IBAN → placeholder'a dönüştürüldü

❌ DEĞİŞMEDİ (Tur 1-3):
• Client-side auth bypass — hâlâ trivial
• innerHTML XSS riski — hâlâ 28 kullanım
• Cookie güvenliği — hâlâ hiç cookie yok
• Security headers — hâlâ eksik
• Employee bordro verisi — hâlâ client-side
• Rate limiting — hâlâ yok

════════════════════════════════════════════════════════════════════
5. GENEL PUANLAMA (Tur #3)
════════════════════════════════════════════════════════════════════

Alan                        | Puan | Durum
----------------------------|------|------------------------------
Portal İzolasyonu (yapı)    | 8/10 | ✅ 35/35 sayfada checkAuth
Portal İzolasyonu (güvenlik)| 2/10 | 🔴 Client-side bypass trivial
Veri Sızıntısı (PII)        | 4/10 | ⚠️ Demo veri ama production risk
XSS Koruması                | 3/10 | 🔴 28 innerHTML kullanımı
Cookie Güvenliği            | 0/10 | 🔴 Hiç cookie yok
Security Headers            | 2/10 | 🔴 Çoğu eksik
Session Güvenliği           | 3/10 | 🔴 localStorage, no HttpOnly
Rate Limiting               | 0/10 | 🔴 Yok
GENEL                       | 3.0/10| 🔴 Demo için kabul, üretim için YETERSİZ

════════════════════════════════════════════════════════════════════
6. ÖNERİLEN AKSİYONLAR (Öncelik Sırası)
════════════════════════════════════════════════════════════════════

🔴 ACİL — Üretim öncesi mutlaka:
1. Server-side JWT + HttpOnly cookie geçişi
   - localStorage'dan tamamen çık
   - Token HttpOnly, Secure, SameSite=Strict cookie'de
   - /api/login endpoint'i JWT üretip cookie set etsin

2. innerHTML → textContent dönüşümü
   - Kullanıcı girdisi alan tüm innerHTML'leri temizle
   - DOMPurify entegrasyonu (üretim için)

3. Security headers ekle (_headers dosyasını doldur):
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: geolocation=(), microphone=(), camera=()
   Strict-Transport-Security: max-age=31536000; includeSubDomains

🟡 KISA VADE:
4. Rate limiting — login endpoint'ine brute force koruması
5. CSRF token'ları — form'lara eklenmesi
6. API tabanlı veri erişimi — bordro, maaş, IBAN API'den gelmeli
7. Nonce-based CSP'ye geçiş — 'unsafe-inline' kaldırılmalı

🟢 ORTA VADE:
8. MFA (Multi-Factor Authentication) — admin hesapları için
9. Session invalidation — logout tüm cihazlardan
10. Audit logging — giriş/çıkış/rol değişimi kayıtları

════════════════════════════════════════════════════════════════════
7. SONUÇ
════════════════════════════════════════════════════════════════════

CleanFix şu an bir DEMO/STATİK uygulama olarak client-side auth
ile çalışıyor. Portal izolasyonu yapısal olarak var (35 sayfada
checkAuth) ama güvenli değil — localStorage değişimi ile trivial
bypass edilebilir.

Veri sızıntısı açısından demo veriler kullanılıyor ama production
da geçişte gerçek müşteri/çalışan verisi API'den geleceği için
bu risk otomatik olarak azalacak. Ancak innerHTML kullanımı
nedeniyle XSS riski production'da da aktif kalacak.

Cookie güvenliği tamamen yok. Bu, uygulamanın en kritik
eksikliği. Server-side JWT + HttpOnly cookie geçişi üretim
öncesi BLOCKING aksiyondur.

Sonraki kontrol: 2026-05-29 09:00
Raporlayan: Aslan (Güvenlik Kontrol Cron #3)
