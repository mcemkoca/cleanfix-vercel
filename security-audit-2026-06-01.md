============================================================
CleanFix Güvenlik Denetimi Raporu — Kontrol #1
Tarih: 2026-06-01 07:00 CST (Asia/Shanghai)
Denetim Tipi: Auth, Rol Kontrolü, Admin Panel, Login/Signup, Vulnerability Scan
Kapsam: /root/.openclaw/workspace/cleanfix-vercel/ (35+ HTML, 3+ JS, CSS)
============================================================

[KRİTİK SEVİYE]

1. CLIENT-SIDE AUTH BYPASS — AÇIK (RISK: YÜKSEK)
   - auth.js tamamen client-side localStorage tabanlı.
   - Token (kobipro_auth_token) ve user objesi (kobipro_user) localStorage'da saklanıyor.
   - Bir attacker, localStorage'daki kobipro_user JSON'ını düzenleyerek role manipulation yapabilir.
   - Örnek: role: "employee" yerine "admin" yazıldığında checkAuth('admin') geçilir.
   - Token formatı: cf_ + 16 byte hex + _ + timestamp — tahmin edilebilir ama sıfırlanabilir.
   - Önceki kontrolde not edilmişti; hâlâ açık, server-side çözüm uygulanmamış.

2. CSP 'UNSAFE-INLINE' — AÇIK (RISK: YÜKSEK)
   - Tüm sayfalarda (login.html, dashboard.html, employee.html, company.html, vb.):
     script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com
   - 'unsafe-inline' CSP'nin XSS korumasını büyük ölçüde geçersiz kılar.
   - Aynı şekilde style-src 'unsafe-inline' var — style injection riski.
   - Inline onclick handler'lar çok sayıda (onclick="AUTH.logout()", onclick="openModal(...)").
   - Önceki kontrolde not edilmişti; hâlâ açık.

3. SERVER-SIDE JWT + HTTPONLY COOKIE — YAPILMAMADI (RISK: KRİTİK)
   - auth.js'de yorum: "This is a DEMO/STATIC app. For production, use server-side JWT + HttpOnly cookies."
   - Uygulama hâlâ tamamen client-side; production geçişi bekliyor.
   - Bu, XSS, token theft, ve role manipulation'a karşı tam açık.
   - Önceki kontrolde planlanmıştı; henüz uygulanmamış.

[YÜKSEK SEVİYE]

4. AUTH.JS YÜKLEME YERİ — RİSKLİ (YÜKSEK)
   - company-sectors.html: auth.js line 446'da yükleniyor (dosyanın ortası).
   - company-tools.html: auth.js line 275'de yükleniyor (dosyanın ortası).
   - Bu sayfaların üst kısmı (head, sidebar, header) auth kontrolü olmadan render edilebiliyor.
   - Eğer sayfada gerçek sensitive data olsaydı, bu bilgi leak riski taşırdı.
   - Diğer company sayfaları (company.html, company-bookings.html, company-customers.html, company-services.html, company-stock.html) auth.js'yi <body> başında düzgün yükleniyor.

5. REQUIRE_ROLE_FOR_ACTION — KULLANILMIYOR (YÜKSEK)
   - auth.js'de requireRoleForAction(required, action) fonksiyonu tanımlı.
   - Ama inline HTML handler'larında (onclick, onsubmit) veya app.js'te çağrılmıyor.
   - Admin-only action'lar (örn. kullanıcı silme, abonelik düzenleme) sadece UI'da gizli.
   - DOM manipülasyonu ile bu action'lar çağrılabilir (örn. hidden elementi göster, form submit et).

6. INLINE AUTH BYPASS — DASHBOARD.HTML (ORTA)
   - dashboard.html'de auth.js'den ÖNCE çalışan ikinci bir auth check:
       var token = localStorage.getItem('kobipro_auth_token');
       if(!token && !isLoginPage){ window.location.href = 'login.html'; }
   - Bu check sadece token var mı diye bakıyor, role kontrolü YOK.
   - Ama hemen ardından checkAuth('admin') çağrılıyor, bu role kontrolü yapıyor.
   - Bu ikinci check redundant ve bypass'a açık (token key'i herhangi bir değerle doldurulabilir).

[ORTA SEVİYE]

7. PII DEMO DATA — KISMI TEMİZLİK (ORTA)
   - employee.html'de:
     - [BRÜT MAAŞ — API], [IBAN — API], [ADRES — API], [TEL — API] placeholder'ları var.
     - "DEMO VERİSİ — Gerçek kişisel veri içermez" banner'ı gösteriliyor.
   - Ancak yapısal olarak PII alanları (maaş, IBAN, adres, telefon) HTML'de tanımlı.
   - Production'da bu alanlar API'den gelecek ama şu an statik yapıda leakage riski var.
   - Önceki kontrolde not edilmişti; kısmi temizlik yapılmış ama yapısal sorun devam ediyor.

8. OPEN REDIRECT POTANSİYELİ (DÜŞÜK-ORTA)
   - login.html'de ALLOWED_REDIRECTS whitelist var (sadece buildpro/barberpro domain'leri).
   - Ama window.location.href kullanılıyor (replace yerine) — browser history'de login credentials kalıyor.
   - redirect URL decode edilmiyor; URL-encoded payload bypass denenebilir.

9. FORM VALIDATION — SADECE CLIENT-SIDE (ORTA)
   - Login formu email regex (RFC 5322) ve password min-length (8) kontrolü yapıyor.
   - Ama server-side validation yok (static app olduğu için).
   - Brute force koruması yok (rate limiting, CAPTCHA, account lockout).
   - Demo modda herhangi email/şifre ile giriş yapılabiliyor.

10. SERVICE WORKER CACHE — SENSITIVE PAGES (DÜŞÜK)
    - sw.js 35+ sayfayı cache'liyor (dashboard, company, employee, vb.).
    - Cache-first stratejisi kullanılıyor.
    - Logout sonrası cache'de kalabilir; sensitive sayfalar offline erişime açık.
    - Cache name: cleanfix-v2.3 — versiyon artırıldığında eski cache temizlenmeli.

[DÜŞÜK SEVİYE]

11. SIDEBAR NAV HASH ANCHOR — ÇÖZÜLDÜ (DÜŞÜK)
    - Önceki kontrolde "sidebar nav linkleri hash anchor (dead-end)" not edilmişti.
    - dashboard.html'de showSection(hash) fonksiyonu çalışıyor; hashchange event dinleniyor.
    - company.html ve alt sayfalarında sidebar linkleri .html dosyalarına düzgün gidiyor.
    - Sorun çözülmüş.

12. THEME/LOCALSTORAGE POLLUTION (DÜŞÜK)
    - cf-theme, cf_lang, cf_cache_* key'leri localStorage'da saklanıyor.
    - Bu key'ler XSS durumunda exfiltration için kullanılabilir.

13. MISSING CSRF PROTECTION (DÜŞÜK)
    - Static app olduğu için form POST yok.
    - Ama production geçişinde CSRF token'ı eklenmeli.

14. MISSING SECURE/HTTPONLY FLAGS (DÜŞÜK)
    - localStorage kullanıldığı için cookie flag'leri uygulanamaz.
    - Server-side geçişte HttpOnly + Secure + SameSite=Strict zorunlu.

============================================================
ÖZET / ÖNCEKİ KONTROL DOĞRULAMASI
============================================================

| Önceki Güvenlik Başlığı        | Durum      | Notlar                                         |
|--------------------------------|------------|------------------------------------------------|
| Client-side auth bypass        | AÇIK       | localStorage role manipulation hâlâ mümkün      |
| CSP eksiklikleri               | AÇIK       | 'unsafe-inline' hâlâ tüm sayfalarda             |
| Server-side JWT + HttpOnly     | BEKLEMEDE  | auth.js notu var, uygulanmamış                  |
| Employee.html PII temizliği    | KISMİ      | Placeholder eklendi, yapısal alanlar hâlâ var   |
| Sidebar nav hash anchor sorunu | ÇÖZÜLDÜ    | showSection() fonksiyonu çalışıyor              |

============================================================
ÖNERİLEN AKSİYONLAR (ÖNCELİK SIRASI)
============================================================

1. [KRİTİK] Server-side JWT + HttpOnly cookie geçişi başlat.
   - Node.js/Express veya Next.js API route'ları ile auth backend kur.
   - /login, /logout, /refresh endpoint'leri.
   - Token'ı localStorage'dan çıkar, HttpOnly cookie'ye taşı.

2. [KRİTİK] CSP 'unsafe-inline' kaldır.
   - Inline script'leri external .js dosyalarına taşı.
   - Inline onclick handler'ları event listener'lara dönüştür.
   - nonce veya hash-based CSP kullan.

3. [YÜKSEK] Role-based action kontrolü uygula.
   - requireRoleForAction fonksiyonunu tüm admin action'larında çağır.
   - Server-side endpoint'lerde role kontrolü zorunlu kıl.

4. [YÜKSEK] auth.js yükleme yerini düzelt.
   - company-sectors.html ve company-tools.html'de auth.js'yi <body> başına taşı.

5. [ORTA] Employee PII alanlarını API-only yap.
   - Maaş, IBAN, adres, telefon alanlarını server-side render et.
   - Demo data yerine gerçek API entegrasyonu.

6. [ORTA] Brute force koruması ekle.
   - Rate limiting, CAPTCHA, account lockout.

7. [DÜŞÜK] SW cache stratejisini gözden geçir.
   - Auth gerektiren sayfaları cache'den çıkar veya Network-first yap.
   - Cache temizliği logout'ta yap.

============================================================
Rapor Sonu.
============================================================
