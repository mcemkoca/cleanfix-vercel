// CleanFix App Core
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
    const colors = { success: 'var(--success-500)', error: 'var(--error-500)', warning: 'var(--warning-500)', info: 'var(--info-500)' };
    const icons = { success: '✓', error: '✕', warning: '!', info: 'ℹ' };
    const titles = { success: 'Başarılı', error: 'Hata', warning: 'Uyarı', info: 'Bilgi' };
    const toast = document.createElement('div');
    toast.style.cssText = `pointer-events:all;background:var(--bg-card);border:1px solid ${colors[type]};border-radius:12px;padding:14px 18px;display:flex;align-items:flex-start;gap:12px;box-shadow:var(--shadow-lg);animation:toastIn 0.3s ease-out;position:relative;overflow:hidden;`;
    toast.innerHTML = `
      <span style="flex-shrink:0;margin-top:2px;width:20px;height:20px;border-radius:50%;background:${colors[type]};color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;">${icons[type]}</span>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:var(--text-sm);">${titles[type]}</div>
        <div style="font-size:var(--text-sm);color:var(--text-muted);margin-top:2px;">${msg}</div>
      </div>
      <span style="flex-shrink:0;color:var(--text-muted);cursor:pointer;font-size:14px;" onclick="this.parentElement.remove()">✕</span>
      <div style="position:absolute;bottom:0;left:0;height:2px;background:${colors[type]};animation:progressBar ${duration}ms linear forwards;width:100%;"></div>
    `;
    this.container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'toastOut 0.3s ease-in forwards'; setTimeout(() => toast.remove(), 300); }, duration);
  }
};

// Demo Data
const DemoData = {
  company: { name: 'CleanFix Demo BV', city: 'Brüksel', sector: 'Auto Detailing', staff: 8, dailyBookings: 25, monthlyRevenue: 12500 },
  customers: [
    { id: 1, name: 'Jan Wouters', email: 'jan@email.be', phone: '+32 470 12 34 56', plate: '1-AAA-001', city: 'Brüksel', visits: 12, spent: 1240 },
    { id: 2, name: 'Marie Dubois', email: 'marie@email.be', phone: '+32 471 23 45 67', plate: '1-BBB-002', city: 'Anvers', visits: 8, spent: 890 },
    { id: 3, name: 'Piet Vermeulen', email: 'piet@email.be', phone: '+32 472 34 56 78', plate: '1-CCC-003', city: 'Gent', visits: 15, spent: 2100 },
    { id: 4, name: 'Luc Laurent', email: 'luc@email.be', phone: '+32 473 45 67 89', plate: '1-DDD-004', city: 'Brüksel', visits: 5, spent: 650 },
    { id: 5, name: 'Sophie Dewitt', email: 'sophie@email.be', phone: '+32 474 56 78 90', plate: '1-EEE-005', city: 'Leuven', visits: 3, spent: 340 },
    { id: 6, name: 'Anna Peeters', email: 'anna@email.be', phone: '+32 475 67 89 01', plate: '1-FFF-006', city: 'Brüksel', visits: 9, spent: 1120 },
    { id: 7, name: 'Thomas Janssens', email: 'thomas@email.be', phone: '+32 476 78 90 12', plate: '1-GGG-007', city: 'Anvers', visits: 7, spent: 780 },
    { id: 8, name: 'Emma Maes', email: 'emma@email.be', phone: '+32 477 89 01 23', plate: '1-HHH-008', city: 'Gent', visits: 4, spent: 520 },
    { id: 9, name: 'Lars Declercq', email: 'lars@email.be', phone: '+32 478 90 12 34', plate: '1-III-009', city: 'Brüksel', visits: 11, spent: 1560 },
    { id: 10, name: 'Clara Smets', email: 'clara@email.be', phone: '+32 479 01 23 45', plate: '1-JJJ-010', city: 'Leuven', visits: 6, spent: 920 }
  ],
  services: [
    { id: 1, name: 'Premium Yıkama', price: 45, duration: 45, category: 'Yıkama', revenue: 3240 },
    { id: 2, name: 'Seramik Kaplama', price: 250, duration: 240, category: 'Koruma', revenue: 2800 },
    { id: 3, name: 'İç Temizlik', price: 85, duration: 90, category: 'Temizlik', revenue: 2400 },
    { id: 4, name: 'Cilalama', price: 120, duration: 120, category: 'Bakım', revenue: 1950 },
    { id: 5, name: 'Motor Temizlik', price: 65, duration: 60, category: 'Temizlik', revenue: 1200 },
    { id: 6, name: 'Far Parlatma', price: 35, duration: 30, category: 'Bakım', revenue: 980 },
    { id: 7, name: 'Koltuk Yıkama', price: 55, duration: 45, category: 'Temizlik', revenue: 880 },
    { id: 8, name: 'Deri Bakım', price: 95, duration: 75, category: 'Bakım', revenue: 760 },
    { id: 9, name: 'Boya Koruma', price: 180, duration: 180, category: 'Koruma', revenue: 720 },
    { id: 10, name: 'Cam Filmi', price: 150, duration: 120, category: 'Koruma', revenue: 600 },
    { id: 11, name: 'Jant Temizlik', price: 40, duration: 30, category: 'Yıkama', revenue: 560 },
    { id: 12, name: 'Detaylı Paket', price: 299, duration: 300, category: 'Paket', revenue: 1495 }
  ],
  bookings: [
    { id: 1, customer: 'Jan Wouters', service: 'Premium Yıkama', date: '12 May', time: '09:00', staff: 'Lisa M.', status: 'Tamamlandı', amount: 45 },
    { id: 2, customer: 'Marie Dubois', service: 'İç Temizlik', date: '12 May', time: '10:30', staff: 'Piet V.', status: 'Devam Ediyor', amount: 85 },
    { id: 3, customer: 'Luc Vermeulen', service: 'Seramik Kaplama', date: '11 May', time: '14:00', staff: 'Jan W.', status: 'Tamamlandı', amount: 250 },
    { id: 4, customer: 'Sophie Dewitt', service: 'Cilalama', date: '11 May', time: '11:00', staff: 'Anna P.', status: 'Tamamlandı', amount: 120 },
    { id: 5, customer: 'Thomas Janssens', service: 'Motor Temizlik', date: '10 May', time: '15:30', staff: 'Piet V.', status: 'Tamamlandı', amount: 65 },
    { id: 6, customer: 'Emma Maes', service: 'Premium Yıkama', date: '10 May', time: '13:00', staff: 'Lisa M.', status: 'İptal', amount: 45 },
    { id: 7, customer: 'Lars Declercq', service: 'Far Parlatma', date: '10 May', time: '16:00', staff: 'Jan W.', status: 'Tamamlandı', amount: 35 },
    { id: 8, customer: 'Clara Smets', service: 'Detaylı Paket', date: '09 May', time: '09:30', staff: 'Anna P.', status: 'Tamamlandı', amount: 299 },
    { id: 9, customer: 'Anna Peeters', service: 'Deri Bakım', date: '09 May', time: '11:00', staff: 'Lisa M.', status: 'Tamamlandı', amount: 95 },
    { id: 10, customer: 'Piet Vermeulen', service: 'Boya Koruma', date: '08 May', time: '10:00', staff: 'Jan W.', status: 'Tamamlandı', amount: 180 }
  ],
  staff: [
    { id: 1, name: 'Jan Wouters', role: 'Admin', email: 'admin@cleanfix.com', active: true },
    { id: 2, name: 'Lisa Manager', role: 'Manager', email: 'manager@cleanfix.com', active: true },
    { id: 3, name: 'Piet Vermeulen', role: 'Personel', email: 'staff1@cleanfix.com', active: true },
    { id: 4, name: 'Anna Peeters', role: 'Personel', email: 'staff2@cleanfix.com', active: true },
    { id: 5, name: 'Thomas Janssens', role: 'Personel', email: 'staff3@cleanfix.com', active: false },
    { id: 6, name: 'Emma Maes', role: 'Personel', email: 'staff4@cleanfix.com', active: true },
    { id: 7, name: 'Marie Dubois', role: 'Muhasebe', email: 'accountant@cleanfix.com', active: true },
    { id: 8, name: 'Luc Laurent', role: 'Görüntüleyici', email: 'viewer@cleanfix.com', active: true }
  ],
  invoices: [
    { id: 'INV-2024-089', customer: 'Jan Wouters', date: '12 May', due: '26 May', status: 'Ödendi', total: 45 },
    { id: 'INV-2024-088', customer: 'Luc Vermeulen', date: '11 May', due: '25 May', status: 'Ödendi', total: 250 },
    { id: 'INV-2024-087', customer: 'Sophie Dewitt', date: '11 May', due: '25 May', status: 'Bekliyor', total: 120 },
    { id: 'INV-2024-086', customer: 'Clara Smets', date: '09 May', due: '23 May', status: 'Ödendi', total: 299 },
    { id: 'INV-2024-085', customer: 'Piet Vermeulen', date: '08 May', due: '22 May', status: 'Ödendi', total: 180 },
    { id: 'INV-2024-084', customer: 'Lars Declercq', date: '07 May', due: '21 May', status: 'Gecikti', total: 85 },
    { id: 'INV-2024-083', customer: 'Anna Peeters', date: '06 May', due: '20 May', status: 'Ödendi', total: 150 },
    { id: 'INV-2024-082', customer: 'Thomas Janssens', date: '05 May', due: '19 May', status: 'Bekliyor', total: 65 }
  ],
  products: [
    { id: 1, name: 'Nano Wax', sku: 'NW-001', category: 'Wax', stock: 3, minStock: 5, price: 24.99 },
    { id: 2, name: 'Mikrofiber Bez Seti', sku: 'MB-002', category: 'Aksesuar', stock: 47, minStock: 10, price: 12.50 },
    { id: 3, name: 'Seramik Kaplama Kit', sku: 'SK-003', category: 'Kaplama', stock: 12, minStock: 3, price: 89.00 },
    { id: 4, name: 'İç Temizlik Köpüğü', sku: 'IT-004', category: 'Temizlik', stock: 23, minStock: 8, price: 18.90 },
    { id: 5, name: 'Lastik Parlatıcı', sku: 'LP-005', category: 'Bakım', stock: 31, minStock: 10, price: 14.99 },
    { id: 6, name: 'Cam Temizleyici', sku: 'CT-006', category: 'Temizlik', stock: 19, minStock: 10, price: 9.90 },
    { id: 7, name: 'Deri Koruyucu', sku: 'DK-007', category: 'Bakım', stock: 15, minStock: 5, price: 29.50 },
    { id: 8, name: 'Motor Yıkama Solvent', sku: 'MY-008', category: 'Temizlik', stock: 8, minStock: 5, price: 22.00 },
    { id: 9, name: 'Cila Pasta', sku: 'CP-009', category: 'Bakım', stock: 20, minStock: 8, price: 34.90 },
    { id: 10, name: 'Jant Temizleyici', sku: 'JT-010', category: 'Temizlik', stock: 14, minStock: 6, price: 16.50 }
  ],
  tickets: [
    { id: 'TK-042', subject: 'Fatura adresi güncelleme', status: 'Çözüldü', priority: 'Düşük', assigned: 'Marie D.', created: '2 saat önce' },
    { id: 'TK-041', subject: 'Randevu sisteminde saat hatası', status: 'Açık', priority: 'Yüksek', assigned: 'Jan W.', created: '5 saat önce' },
    { id: 'TK-040', subject: 'Yeni personel ekleyemiyorum', status: 'Devam Ediyor', priority: 'Orta', assigned: 'Lisa M.', created: '1 gün önce' },
    { id: 'TK-039', subject: 'Stok bildirimi çalışmıyor', status: 'Çözüldü', priority: 'Orta', assigned: 'Jan W.', created: '2 gün önce' },
    { id: 'TK-038', subject: 'API dokümantasyonu talebi', status: 'Beklemede', priority: 'Düşük', assigned: 'Piet V.', created: '3 gün önce' }
  ],
  notifications: [
    { type: 'info', title: 'Yeni randevu', message: 'Luc Vermeulen yarın 14:00', time: '5 dk önce', icon: '📅' },
    { type: 'success', title: 'Ödeme alındı', message: 'Fatura #INV-2024-089 ödendi', time: '32 dk önce', icon: '💶' },
    { type: 'warning', title: 'Stok alarmı', message: 'Nano Wax 3 adet kaldı', time: '1 saat önce', icon: '⚠️' },
    { type: 'info', title: 'Ticket çözüldü', message: '#TK-042 çözüldü — Jan W.', time: '2 saat önce', icon: '✓' },
    { type: 'info', title: 'Yeni müşteri', message: 'Sophie Laurent kaydoldu', time: '3 saat önce', icon: '👤' }
  ]
};

// Utilities
const Utils = {
  formatCurrency(amount, currency = '€') { return currency + amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  formatDate(date) { return new Date(date).toLocaleDateString('tr-TR'); },
  generateId(prefix = 'ID') { return prefix + '-' + Math.random().toString(36).substr(2, 6).toUpperCase(); },
  debounce(fn, ms) { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); }; },
  throttle(fn, ms) { let last = 0; return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } }; }
};

// Animated Counters
function animateCounters() {
  document.querySelectorAll('.stat-value[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString('tr-TR') + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// Modal Manager
const ModalManager = {
  open(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
  },
  close(id) {
    const modal = document.getElementById(id);
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
  }
};

window.showToast = ToastManager.show.bind(ToastManager);

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
    if (window.CFCache) { window.CFCache.set(key, data, ttlMinutes); return; }
    try {
      const payload = { data, expires: ttlMinutes ? Date.now() + ttlMinutes * 60000 : null };
      localStorage.setItem('cf_cache_' + key, JSON.stringify(payload));
    } catch (e) { console.warn('[DataCache] quota exceeded:', e); }
  },
  clear() {
    if (window.CFCache) { window.CFCache.clear(); return; }
    Object.keys(localStorage).forEach(k => { if (k.startsWith('cf_cache_')) localStorage.removeItem(k); });
  },
  getTableData(tableName) { return this.get('table_' + tableName); },
  setTableData(tableName, rows, ttl = 30) { this.set('table_' + tableName, rows, ttl); },
  isOffline() { return !navigator.onLine; }
};

// Offline-aware fetch helper
const OfflineFetch = {
  async get(url, cacheKey, ttlMinutes = 30) {
    if (navigator.onLine) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json().catch(() => res.text());
          DataCache.set(cacheKey, data, ttlMinutes);
          return { data, fromCache: false };
        }
      } catch (e) { console.warn('[OfflineFetch] network error:', e); }
    }
    const cached = DataCache.get(cacheKey);
    if (cached !== null) return { data: cached, fromCache: true };
    return { data: null, fromCache: false, error: 'offline_no_data' };
  }
};

// Export globals
window.DataCache = DataCache;
window.OfflineFetch = OfflineFetch;
window.CFCache = window.CFCache || DataCache;

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
});
