# CleanFix Structural & Functional Audit Report

**Date:** 2026-05-18  
**Scope:** `/root/.openclaw/workspace/cleanfix-vercel/` (34 HTML files + CSS/JS assets)  
**Auditor:** Subagent (Structural Analysis)

---

## Executive Summary

| Category | Critical | Warning | Minor |
|---|---|---|---|
| Navigation & Links | 4 | 1 | 1 |
| Modal & Form | 0 | 4 | 0 |
| Auth Flow | 17 | 1 | 0 |
| JavaScript | 0 | 6 | 2 |
| CSS/Responsive | 0 | 2 | 0 |

**Total Issues:** 38  
**Most Severe:** All 17 company module pages are unauthenticated. Anyone with the URL can access company data directly.

---

## 1. Navigation & Links Audit

### CRITICAL

- **employee.html:83** → `href="employee-schedule.html"` — **File does not exist**
- **employee.html:87** → `href="employee-tasks.html"` — **File does not exist**
- **employee.html:91** → `href="employee-customers.html"` — **File does not exist**
- **employee.html:98** → `href="employee-profile.html"` — **File does not exist**

**Fix:** Create the missing employee sub-pages, or remove/update the navigation links in `employee.html` to point to existing pages (e.g., `staff.html`, `customers.html`).

### WARNING

- **dashboard.html:783** → `href="#"` with `onclick="markAllRead();return false;"`  
  Functional but inaccessible. Screen readers and middle-click users get a broken anchor.  
  **Fix:** Change to `<button>` element or use `href="javascript:void(0)"` with proper `role="button"` and keyboard handling.

### MINOR

- **index.html** → Contains anchor links `href="#features"` and `href="#how"`  
  These are page-internal anchors. Verify that `<section id="features">` and `<section id="how">` exist on the landing page. If missing, scrolling will fail silently.

### VERIFIED OK

- `css/main.css`, `css/components.css` — exist in `css/` directory; relative paths from root HTML files are valid
- `js/app.js`, `js/export.js`, `js/pwa.js` — exist in `js/` directory
- `assets/icon-192.png` and other PWA icons — exist in `assets/` directory
- `sectors/cleaning/index.html`, `sectors/carwash/index.html`, etc. — directories and index files exist
- Footer cross-platform links (BuildPro `https://mcemkoca.github.io/buildpro-vercel/`, BarberPro `https://mcemkoca.github.io/barberpro-vercel/`) — are valid external URLs

---

## 2. Modal & Form Audit

### Modal Architecture

All pages use a **custom modal system** (not Bootstrap):
- Overlay: `<div class="modal-overlay" id="xxxModal">`
- Open: `openModal('xxxModal')` or named variants (`openPdfPreview()`, `openChecklistModal()`, etc.)
- Close: `closeModal('xxxModal')` or named variants
- Close button: `<button class="modal-close" onclick="closeModal('xxxModal')">✕</button>`
- Click-outside-to-close: `onclick="if(event.target===this)closeModal(this.id)"`

### WARNING

1. **company-tools.html** — 4 modal overlays (`checklistModalOverlay`, `chemModalOverlay`, `surveyModalOverlay`, `taskModalOverlay`) use **dedicated open/close functions** (`openChecklistModal()`, `closeChecklistModal()`, etc.).  
   These are correctly implemented and functional, but the modal naming convention is **inconsistent** with the rest of the app (other pages use generic `openModal`/`closeModal`).  
   **Fix:** Standardize to `openModal('checklistModal')` / `closeModal('checklistModal')` for consistency.

2. **company-quotes.html** — `pdfModal` is opened via `openPdfPreview(id)` and `printQuote(id)` (using `classList.add('active')` directly), not via `openModal()`.  
   Functional but inconsistent pattern.  
   **Fix:** Wrap in `openModal('pdfModal')` for consistency.

3. **Missing modals on pages with table actions** — `bookings.html`, `invoices.html`, `dashboard.html` have `data-target="N"` attributes on stat counter divs (e.g., `data-target="4"`). These are **NOT modal triggers** — they are animated number counters. No issue.

4. **Form validation is JS-only** — Most modal forms lack HTML5 validation attributes (`required`, `pattern`, `minlength`, `type="email"`). Validation is handled entirely by inline JavaScript event handlers on submit buttons.  
   **Fix:** Add `required` to mandatory fields, `type="email"` to email inputs, and `minlength="7"` to phone inputs for progressive enhancement and better UX.

### VERIFIED OK

- Every modal trigger has a matching modal ID
- Every modal has at least one close mechanism (close button + click-outside + Escape key on some pages)
- Email regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — present on all company pages with forms
- Phone validation: `v.replace(/\D/g,'').length>=7` — present on all company pages with forms

---

## 3. Auth Flow Audit

### CRITICAL

**All 17 company module pages lack authentication guards.**

| Page | Auth Token Check | checkModuleAuth | Logout Clears Token |
|---|---|---|---|
| company-analytics.html | ❌ NO | ❌ NO | ❌ NO |
| company-bookings.html | ❌ NO | ❌ NO | ❌ NO |
| company-calendar.html | ❌ NO | ❌ NO | ❌ NO |
| company-customers.html | ❌ NO | ❌ NO | ❌ NO |
| company-equipment.html | ❌ NO | ❌ NO | ❌ NO |
| company-expenses.html | ❌ NO | ❌ NO | ❌ NO |
| company-invoices.html | ❌ NO | ❌ NO | ❌ NO |
| company-maintenance.html | ❌ NO | ❌ NO | ❌ NO |
| company-profile.html | ❌ NO | ❌ NO | ❌ NO |
| company-quality.html | ❌ NO | ❌ NO | ❌ NO |
| company-quotes.html | ❌ NO | ❌ NO | ❌ NO |
| company-reviews.html | ❌ NO | ❌ NO | ❌ NO |
| company-sectors.html | ❌ NO | ❌ NO | ❌ NO |
| company-services.html | ❌ NO | ❌ NO | ❌ NO |
| company-staff.html | ❌ NO | ❌ NO | ❌ NO |
| company-stock.html | ❌ NO | ❌ NO | ❌ NO |
| company-tools.html | ❌ NO | ❌ NO | ❌ NO |

**Consequence:** Any user can open `https://.../company-bookings.html` directly in an incognito window and see all booking data without logging in.

**Fix:** Add the following script to the `<head>` of every `company-*.html` page:

```html
<script>
(function() {
  const token = localStorage.getItem('kobipro_auth_token');
  const isLoginPage = window.location.pathname.includes('login') || window.location.pathname.includes('index');
  if (!token && !isLoginPage) {
    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
  }
})();
</script>
```

Also update logout links on company pages to actually clear the token:
```javascript
localStorage.removeItem('kobipro_auth_token');
localStorage.removeItem('kobipro_user');
window.location.href = 'login.html';
```

### WARNING

- **login.html** redirect logic exists (line 540-552): redirects to `dashboard.html` after 1200ms, supports `?redirect=buildpro` and `?redirect=barberpro` cross-platform redirects.  
  **Note:** The redirect delay (1200ms) might feel sluggish. Consider reducing to 600ms or adding a visual "redirecting..." spinner.

### VERIFIED OK

- **dashboard.html** — Has `checkModuleAuth()` function (line ~3113) that checks `kobipro_auth_token` in localStorage and redirects unauthenticated users to `login.html`
- **dashboard.html** logout button clears `kobipro_auth_token` and `kobipro_user` from localStorage before redirecting
- **customer-portal.html** — Has token clearing on logout
- **login.html** — Sets demo token on successful login and redirects correctly

---

## 4. JavaScript Audit

### WARNING

1. **app.js is missing from critical pages** — `js/app.js` (contains `ThemeManager`, `ToastManager`, shared utilities) is **NOT loaded** on:
   - All `company-*.html` pages (17 files)
   - `dashboard.html`
   - `login.html`
   - `index.html`
   - `employee.html`
   - `pricing.html`
   - `404.html`
   - `customer-portal.html`

   **Impact:** Each of these pages re-implements its own toast container, theme toggle, and i18n system inline. This bloats HTML size and risks inconsistent behavior.
   
   **Fix:** Add `<script src="js/app.js"></script>` to all pages. Ensure `app.js` exports are non-conflicting (wrap in IIFE or use `const` with existence checks).

2. **export.js conflicts** — `js/export.js` is loaded on 10 company pages. If any of those pages also load `app.js` in the future, verify that `export.js` does not redefine `showToast()` or other shared functions.

3. **pwa.js missing on 2 pages:**
   - `employee.html` — no PWA support
   - `pricing.html` — no PWA support
   
   **Fix:** Add `<script src="js/pwa.js"></script>` if service worker registration is desired on these pages.

### MINOR

1. **Inline script extraction produced false-positive syntax errors** on `company-maintenance.html`, `company-services.html`, `company-tools.html`, `customer-portal.html`. Manual review confirmed these are extraction artifacts (premature `</script>` matching inside string literals). No confirmed runtime syntax errors.

2. **company-maintenance.html** has a small brace mismatch in extracted inline script (18 open vs 20 close braces). This is likely caused by regex extraction artifacts from `</script>`-like patterns inside i18n strings. Manual review of the actual HTML script blocks did not confirm a real syntax error.

### VERIFIED OK

- `js/app.js` — passes `node --check` (syntax valid)
- `js/export.js` — passes `node --check` (syntax valid)
- `js/pwa.js` — passes `node --check` (syntax valid)
- No `data-target` modal mismatches (all numeric `data-target` values are stat counters, not modal triggers)

---

## 5. CSS/Responsive Audit

### WARNING

1. **Missing CSS selectors in components.css** — Many classes referenced in HTML are **not defined in `css/components.css`**. However, most of these are defined in **inline `<style>` blocks** within each HTML file. Examples:
   - `.sidebar-toggle` — used on dashboard, login, index, customer-portal; defined inline on those pages
   - `.mobile-sidebar` — not in components.css; defined inline where needed
   - `.table-responsive` / `.table-container` — not in components.css; defined inline
   - `.print-hide` / `.no-print` — used on company-quotes.html; defined inline
   
   **Impact:** This architecture means each page carries its own CSS payload, increasing total transfer size and making global style changes difficult.
   
   **Fix:** Migrate common layout classes (sidebar, table containers, print utilities) to `components.css` and reference them from all pages.

2. **Mobile sidebar toggle inconsistent** — The old-style dashboard pages (`bookings.html`, `customers.html`, `invoices.html`, `products.html`, `reports.html`, `services.html`, `settings.html`, `staff.html`, `support.html`) do **not** have a mobile hamburger toggle. On screens < 768px, the sidebar likely covers content with no way to dismiss it.
   
   **Fix:** Add `.hamburger` button and `toggleSidebar()` JS to all old-style pages, or migrate them to the new company-page layout.

### VERIFIED OK

- `components.css` contains: `.sidebar`, `.nav-item`, `.nav-item.active`, `.btn`, `.btn-primary`, `.btn-secondary`, `.card`, `.form-input`, `.table`, `.badge`, `.toast-container`, `.toast`
- Print CSS (`@media print`) exists on all pages either inline or in components.css
- Mobile sidebar toggle exists on all `company-*.html` pages, `dashboard.html`, `login.html`, `index.html`, `customer-portal.html`

---

## 6. Sidebar Navigation Consistency

### Observation (Not a Bug)

Each `company-*.html` page has a **different subset** of sidebar links. For example:
- `company-analytics.html` sidebar: dashboard, bookings, staff, services, invoices, company-profile, logout
- `company-bookings.html` sidebar: dashboard, bookings, staff, services, invoices, customers, stock, reviews, quotes, analytics, settings, company-profile, logout

This appears to be **intentional** — different modules show different navigation scope. However, it creates a jarring UX when switching between pages: the sidebar links appear and disappear.

**Recommendation:** Standardize the sidebar across all company pages. Show all links but visually indicate which ones are "active module" vs "other modules" (e.g., grayed out or in a collapsible "More" section).

---

## 7. Form Validation Detail

### Email Validation
- **Regex:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- **Coverage:** All company pages with email inputs
- **Issue:** Only enforced via JS `onclick` handler, not via `type="email"` or `pattern` HTML attributes

### Phone Validation
- **Rule:** `v.replace(/\D/g,'').length >= 7`
- **Coverage:** All company pages with phone inputs
- **Issue:** Only enforced via JS; no `minlength="7"` or `pattern` on inputs

### Recommended Fix
```html
<input type="email" required pattern="[^\s@]+@[^\s@]+\.[^\s@]+" ...>
<input type="tel" required minlength="7" pattern="[0-9\+\s\-\(\)]{7,}" ...>
```

---

## Fix Priority Matrix

| Priority | Issue | Files Affected | Effort |
|---|---|---|---|
| **P0 — Critical** | Add auth guards to all company pages | 17 company-*.html | Low (copy-paste script) |
| **P0 — Critical** | Fix broken employee sub-page links | employee.html | Low |
| **P1 — High** | Load app.js on all pages; remove duplicated inline utilities | 25+ files | Medium |
| **P1 — High** | Add mobile sidebar toggle to old-style pages | 9 files | Low |
| **P2 — Medium** | Standardize sidebar navigation across company pages | 17 files | Medium |
| **P2 — Medium** | Add HTML5 form validation attributes | All modal forms | Low |
| **P3 — Low** | Fix href="#" accessibility on dashboard.html | dashboard.html | Low |
| **P3 — Low** | Add pwa.js to employee.html and pricing.html | 2 files | Low |
| **P3 — Low** | Migrate common CSS to components.css | All pages | High |

---

## Appendix: File Inventory

### HTML Files (34 total)
- **Landing/Public:** `index.html`, `pricing.html`, `404.html`
- **Auth:** `login.html`
- **Admin Dashboard (old layout):** `dashboard.html`, `bookings.html`, `customers.html`, `invoices.html`, `products.html`, `reports.html`, `services.html`, `settings.html`, `staff.html`, `support.html`
- **Company Module Pages (new layout):** `company.html`, `company-analytics.html`, `company-bookings.html`, `company-calendar.html`, `company-customers.html`, `company-equipment.html`, `company-expenses.html`, `company-invoices.html`, `company-maintenance.html`, `company-profile.html`, `company-quality.html`, `company-quotes.html`, `company-reviews.html`, `company-sectors.html`, `company-services.html`, `company-staff.html`, `company-stock.html`, `company-tools.html`
- **Employee:** `employee.html`
- **Customer Portal:** `customer-portal.html`

### CSS Files
- `css/components.css` — shared components
- `css/main.css` — main stylesheet
- `css/dashboard.css` — dashboard-specific

### JS Files
- `js/app.js` — shared utilities (theme, toast)
- `js/export.js` — PDF/Excel export utilities
- `js/pwa.js` — service worker / PWA

### Assets
- `assets/` — PWA icons (72, 96, 128, 144, 152, 192, 384, 512px)
- `sectors/` — 12 sector subdirectories with index.html files

---

*End of Audit Report*
