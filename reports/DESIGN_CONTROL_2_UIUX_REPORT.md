# CleanFix Tasarım Kontrolü #2 — UI/UX Akış & Tutarlılık Raporu
**Tarih:** 2026-05-23 11:00 CST (03:00 UTC)  
**Kapsam:** login → dashboard → company-* → customer-portal akışı, form validasyon, loading state, empty state, toast bildirimleri

---

## 1. UI/UX Akış Testi (login → dashboard → sayfalar)

| Adım | Durum | Not |
|------|-------|-----|
| Login form görseli | ✅ | Koyu tema, gradient buton, hata anında kırmızı border + shake animasyonu |
| Auth yönlendirme | ✅ | Başarılı giriş → `dashboard.html`; customer → `customer-portal.html` (inline auth) |
| Sidebar navigasyon | ✅ | Tüm company sayfalarında aynı sidebar yapısı, aktif sayfa `.active` ile highlight |
| Dashboard → alt sayfalar | ✅ | `company-quotes.html`, `company-maintenance.html` vb. linkler çalışıyor |
| Responsive geçiş | ✅ | 768px/480px breakpoint'ler tüm sayfalarda tutarlı; hamburger menü, grid collapse |

**🟡 Uyarı:** `company-maintenance.html` lang-switcher'de aktif dil class'ı (`active`) yok. Hangi dilin seçili olduğu görsel olarak belli değil.

---

## 2. Form Validasyon Görseli

| Sayfa | Validasyon Yöntemi | Durum |
|-------|-------------------|-------|
| `login.html` | `validation.js` → kırmızı border + metin + shake | ✅ |
| `dashboard.html` | Modal formlarda `validation.js` | ✅ |
| `company-quotes.html` | Inline + `validation.js` | ✅ |
| `customer-portal.html` | Inline JS (`submitTicket`), sadece toast | 🟡 |
| `company-maintenance.html` | Inline JS (`saveNewTask`), sadece toast | 🟡 |

**🟡 Bulgu:** `customer-portal.html` ve `company-maintenance.html` `validation.js`'i import etmemiş. Hata anında sadece toast gösteriyor, input border'ı kırmızı olmuyor. Kullanıcı hangi alanı doldurması gerektiğini görsel olarak göremeyebilir.

---

## 3. Loading State Tutarlılığı

| Sayfa | Loading State | Durum |
|-------|--------------|-------|
| `login.html` | Buton spinner + "Giriş Yapılıyor..." metni | ✅ |
| `dashboard.html` | `.btn:disabled` kullanımı var | ✅ |
| `company-quotes.html` | Toast ile geri bildirim, buton loading yok | 🟡 |
| `customer-portal.html` | Toast ile geri bildirim, buton loading yok | 🟡 |
| `company-maintenance.html` | Toast ile geri bildirim, buton loading yok | 🟡 |

**🟡 Bulgu:** Login dışındaki sayfalarda buton loading state'i yok. Kullanıcı "Kaydet"e bastığında buton disabled + spinner görmemeli mi? Şu an hemen toast çıkıyor ama buton aktif kalıyor — çift tıklama riski.

**🔴 Bulgu:** `components.css`'te `.skeleton` loading sistemi tanımlı (shimmer animasyonu) ama **hiçbir sayfada kullanılmıyor**. Tablo yüklenirken veya veri çekilirken skeleton placeholder gösterilmiyor.

---

## 4. Empty State Check

| Sayfa | Empty State HTML'i | JS Toggle | Durum |
|-------|-------------------|-----------|-------|
| `customer-portal.html` (Tickets) | ✅ `empty-state-row` | ❌ `display:none` sabit | 🟡 |
| `customer-portal.html` (Invoices) | ✅ `empty-state-row` | ❌ `display:none` sabit | 🟡 |
| `company-maintenance.html` (Recurring) | ✅ `empty-state-row` | ❌ `display:none` sabit | 🟡 |
| `components.css` | ✅ `.empty-state` tanımlı | — | ✅ |

**🟡 Bulgu:** Empty state HTML'i her sayfada mevcut ama `display:none` ile gizli. Filtreleme sonucu boş kalınca veya son kayıt silinince bu satır JS ile `display:table-row` yapılmıyor. Kullanıcı boş tablo görüyor — "Henüz kayıt yok" mesajı görünmüyor.

**Örnek fix:** `filterKanban()` ve `submitTicket()` fonksiyonlarına boş state toggle'ı eklenmeli.

---

## 5. Toast Bildirimleri

| Özellik | `js/toast.js` (shared) | Inline toast'lar | Durum |
|---------|----------------------|------------------|-------|
| `login.html` | ✅ `showToast()` çağrısı | — | ✅ |
| `dashboard.html` | ✅ | — | ✅ |
| `company-quotes.html` | ✅ | — | ✅ |
| `customer-portal.html` | ❌ | 🟡 Inline `<div class="toast" id="toast">` | 🔴 |
| `company-maintenance.html` | ❌ | 🟡 Inline `<div class="toast" id="toast">` | 🔴 |

**🔴 Bulgu:** `customer-portal.html` ve `company-maintenance.html` `js/toast.js`'i import etmemiş. Bunun yerine sayfa içinde basit inline toast div'i var. Bu toast:
- Sağ üst köşede değil (`.toast-container` yok)
- Progress bar yok
- Tip bazlı renk yok (success/error/warning border'ı)
- Stack (üst üste) çalışmıyor
- Auto-dismiss muhtemelen çalışmıyor

**Örnek fix:** Her iki sayfaya `<script src="js/toast.js"></script>` eklenmeli, inline toast div'i kaldırılmalı.

---

## 6. Ek Çatlaklıklar (Minor)

| # | Bulgu | Önem | Lokasyon |
|---|-------|------|----------|
| 1 | `data-i18n-placeholder` duplicate attribute | 🟡 HTML validasyon hatası | `customer-portal.html` login input'ları |
| 2 | `lang-switcher` aktif class yok | 🟡 Hangi dil seçili belli değil | `company-maintenance.html` |
| 3 | `toggle-switch` onclick yerine CSS toggle | 🟡 JS event listener var ama class toggle yapıyor | `company-maintenance.html` yinelenen görev |
| 4 | SLA timer statik metin ("2g 14s") | 🟡 `updateSLA()` fonksiyonu var ama ilk render'da statik | `company-maintenance.html` kanban kartları |
| 5 | Kanban kart priority class'ı Türkçe karakter normalize | 🟡 `toLowerCase().replace('ı','i')...` yapıyor — çalışıyor ama hack | `company-maintenance.html` |

---

## 7. Özet & Önerilen Sıralama

| Öncelik | Sorun | Etki | Fix Tahmini |
|---------|-------|------|-------------|
| **P1** | `customer-portal` ve `company-maintenance` toast sistemi inline | Kullanıcı bildirimleri tutarsız, üst üste binmiyor | 2 dosyaya `<script src="js/toast.js">` ekle |
| **P1** | `customer-portal` ve `company-maintenance` validasyon.js eksik | Form hatalarında kullanıcı hangi alanı düzeltmeli bilmiyor | 2 dosyaya `<script src="js/validation.js">` + input'lara `onblur` handler |
| **P2** | Empty state'ler `display:none` sabit | Boş tablo görünümünde "Henüz kayıt yok" mesajı çıkmıyor | Her tabloya JS toggle fonksiyonu ekle |
| **P2** | Loading state login dışı yok | Buton çift tıklama, kullanıcı feedback eksikliği | Kaydet butonlarına `disabled + spinner` pattern'i uygula |
| **P2** | Skeleton loading tanımlı ama kullanılmıyor | İlk yüklemede boş/blink hissi | Tablo render öncesi skeleton row'ları göster |
| **P3** | `data-i18n-placeholder` duplicate | HTML validasyon uyarısı | Duplicate attribute'ları temizle |
| **P3** | Lang switcher aktif class eksikliği | Dil seçimi görsel feedback eksik | `switchLang()` fonksiyonuna active class toggle ekle |

---

**Sonuç:** Akış temel olarak çalışıyor, navigasyon tutarlı, responsive iyi. Ancak **toast ve validasyon sistemleri `customer-portal` ve `company-maintenance` sayfalarında shared kütüphanelere bağlanmamış** — bu iki sayfa "yalnız başına" çalışıyor. Empty state'ler de JS tarafında aktif edilmeyi bekliyor.
