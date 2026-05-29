// CleanFix App Core

// ===== XSS Protection (global) =====
window.escapeHtml = window.escapeHtml || function(str) {
  if (typeof str !== 'string') str = String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Theme Manager
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('cf-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    return saved;
  },
  toggle() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('cf-theme', next);
    return next;
  }
};

// Toast Manager
const ToastManager = {
  container: null,
  ensureContainer() {
    if (!this.container || !this.container.parentNode) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      this.container.style.cssText = 'position:fixed;top:80px;right:24px;z-index:2000;display:flex;flex-direction:column;gap:12px;pointer-events:none;max-width:360px;';
      document.body.appendChild(this.container);
    }
  },
  show(msg, type = 'success', duration = 4000) {
    this.ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = 'pointer-events:all;background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-lg);padding:12px 16px;display:flex;align-items:center;gap:10px;box-shadow:var(--shadow-lg);animation:slideIn 0.3s ease;min-width:260px;max-width:320px;';
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const colors = { success: 'var(--success-500)', error: 'var(--error-500)', warning: 'var(--warning-500)', info: 'var(--info-500)' };
    toast.innerHTML = `<span style="flex-shrink:0;width:20px;height:20px;border-radius:50%;background:${colors[type]};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">${icons[type]}</span><span style="font-size:var(--text-sm);font-weight:500;">${msg}</span>`;
    toast.addEventListener('click', () => toast.remove());
    this.container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(20px)'; setTimeout(() => toast.remove(), 300); }, duration);
    return toast;
  }
};

// Modal Manager
const ModalManager = {
  open(id) {
    const modal = document.getElementById(id);
    if (modal) { 
      modal.style.display = 'flex';
      modal.classList.add('active'); 
      document.body.style.overflow = 'hidden'; 
    }
  },
  close(id) {
    const modal = document.getElementById(id);
    if (modal) { 
      modal.style.display = '';
      modal.classList.remove('active'); 
      document.body.style.overflow = ''; 
    }
  }
};

// Global aliases (used by inline HTML handlers)
window.openModal = function(id) { ModalManager.open(id); };
window.closeModal = function(id) { ModalManager.close(id); };

// Only register showToast if toast.js hasn't loaded yet
// toast.js is the canonical toast system; this prevents conflicts
if (typeof window.showToast !== 'function') {
  window.showToast = ToastManager.show.bind(ToastManager);
}

// DataCache — offline-aware localStorage table caching
const DataCache = {
  get(key) {
    if (window.CFCache) return window.CFCache.get(key);
    try {
      const raw = localStorage.getItem('cf_cache_' + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.expires && Date.now() > parsed.expires) {
        localStorage.removeItem('cf_cache_' + key);
        return null;
      }
      return parsed.data;
    } catch { return null; }
  },
  set(key, data, ttlMinutes = 60) {
    try {
      localStorage.setItem('cf_cache_' + key, JSON.stringify({ data, expires: Date.now() + ttlMinutes * 60000 }));
    } catch { /* quota exceeded */ }
  },
  clear(key) {
    localStorage.removeItem('cf_cache_' + key);
  }
};

// i18n helper
window.t = window.t || function(key, fallback) {
  const currentLang = localStorage.getItem('cf_lang') || 'tr';
  const translations = window.__cf_translations || {};
  const dict = translations[currentLang] || translations['tr'] || {};
  return dict[key] || fallback || key;
};

// Error boundary
window.addEventListener('error', function(e) {
  if (window.__cf_errors) window.__cf_errors.push({ msg: e.message, file: e.filename, line: e.lineno });
  else console.error('CF Error:', e.message, 'at', e.filename + ':' + e.lineno);
});

// IntersectionObserver reveal helper
window.initReveal = function initReveal(selector = '.reveal') {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll(selector).forEach(el => obs.observe(el));
};

// Print helper
window.printSection = function printSection(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  const w = window.open('', '_blank');
  w.document.write('<html><head><title>Print</title><link rel="stylesheet" href="css/main.css"><link rel="stylesheet" href="css/components.css"></head><body>' + el.outerHTML + '</body></html>');
  w.document.close();
  setTimeout(() => { w.print(); w.close(); }, 500);
};
