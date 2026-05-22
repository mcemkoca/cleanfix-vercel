// CleanFix Unified Toast System
// Usage: showToast(message, type='info', duration=4000)
// Types: 'success' | 'error' | 'warning' | 'info'

(function() {
  'use strict';

  let toastContainer = null;
  let toastIdCounter = 0;
  const activeToasts = new Map();

  function ensureContainer() {
    if (toastContainer && toastContainer.parentNode) return;
    toastContainer = document.createElement('div');
    toastContainer.id = 'cf-toast-container';
    toastContainer.style.cssText = [
      'position:fixed',
      'top:24px',
      'right:24px',
      'z-index:9999',
      'display:flex',
      'flex-direction:column',
      'gap:8px',
      'pointer-events:none',
      'max-width:360px'
    ].join(';');
    document.body.appendChild(toastContainer);
  }

  function injectStyles() {
    if (document.getElementById('cf-toast-styles')) return;
    const style = document.createElement('style');
    style.id = 'cf-toast-styles';
    style.textContent = `
      @keyframes cfToastIn { from { transform:translateX(120%); opacity:0; } to { transform:translateX(0); opacity:1; } }
      @keyframes cfToastOut { from { transform:translateX(0); opacity:1; } to { transform:translateX(120%); opacity:0; } }
      @keyframes cfToastProgress { from { width:100%; } to { width:0%; } }
      .cf-toast {
        pointer-events:all;
        background:var(--bg-card, #1e293b);
        border:1px solid var(--border-color, #334155);
        border-radius:12px;
        padding:14px 18px;
        display:flex;
        align-items:flex-start;
        gap:12px;
        box-shadow:0 10px 40px rgba(0,0,0,0.3);
        animation:cfToastIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards;
        position:relative;
        overflow:hidden;
        min-width:260px;
        max-width:320px;
        cursor:pointer;
        transition:transform 0.2s ease, opacity 0.2s ease;
      }
      .cf-toast:hover { transform:translateY(-2px); }
      .cf-toast.removing { animation:cfToastOut 0.3s ease-in forwards; }
      .cf-toast-icon {
        flex-shrink:0;
        width:22px;
        height:22px;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:12px;
        font-weight:700;
        color:white;
        margin-top:1px;
      }
      .cf-toast-body { flex:1; min-width:0; }
      .cf-toast-title { font-weight:600; font-size:13px; line-height:1.3; }
      .cf-toast-msg { font-size:13px; color:var(--text-muted, #94a3b8); margin-top:2px; line-height:1.4; }
      .cf-toast-close {
        flex-shrink:0;
        color:var(--text-muted, #94a3b8);
        cursor:pointer;
        font-size:14px;
        line-height:1;
        padding:2px;
        border-radius:4px;
        transition:color 0.15s, background 0.15s;
      }
      .cf-toast-close:hover { color:var(--text-primary, #f1f5f9); background:rgba(255,255,255,0.06); }
      .cf-toast-progress {
        position:absolute;
        bottom:0;
        left:0;
        height:2px;
        animation:cfToastProgress linear forwards;
      }
      .cf-toast-progress.success { background:var(--success-500, #10b981); }
      .cf-toast-progress.error { background:var(--error-500, #ef4444); }
      .cf-toast-progress.warning { background:var(--warning-500, #f59e0b); }
      .cf-toast-progress.info { background:var(--info-500, #3b82f6); }
    `;
    document.head.appendChild(style);
  }

  const config = {
    success: { color: 'var(--success-500, #10b981)', icon: '✓', title: 'Başarılı' },
    error:   { color: 'var(--error-500, #ef4444)',   icon: '✕', title: 'Hata' },
    warning: { color: 'var(--warning-500, #f59e0b)', icon: '!', title: 'Uyarı' },
    info:    { color: 'var(--info-500, #3b82f6)',    icon: 'ℹ', title: 'Bilgi' }
  };

  window.showToast = function showToast(message, type, duration) {
    if (typeof message !== 'string') message = String(message);
    type = (type || 'info').toLowerCase();
    duration = parseInt(duration, 10) || 4000;

    const cfg = config[type] || config.info;
    injectStyles();
    ensureContainer();

    const id = ++toastIdCounter;
    const toast = document.createElement('div');
    toast.className = 'cf-toast';
    toast.dataset.toastId = id;

    toast.innerHTML = `
      <span class="cf-toast-icon" style="background:${cfg.color};">${cfg.icon}</span>
      <div class="cf-toast-body">
        <div class="cf-toast-title" style="color:${cfg.color};">${cfg.title}</div>
        <div class="cf-toast-msg">${escapeHtml(message)}</div>
      </div>
      <span class="cf-toast-close" title="Kapat">✕</span>
      <div class="cf-toast-progress ${type}" style="animation-duration:${duration}ms;"></div>
    `;

    // click to dismiss
    toast.addEventListener('click', function(e) {
      if (e.target.closest('.cf-toast-close')) {
        e.stopPropagation();
      }
      dismissToast(id);
    });

    toastContainer.appendChild(toast);
    activeToasts.set(id, toast);

    // auto dismiss
    const timer = setTimeout(() => dismissToast(id), duration);
    activeToasts.set(id + '_timer', timer);

    return id;
  };

  window.dismissToast = function dismissToast(id) {
    const toast = activeToasts.get(id);
    if (!toast) return;
    const timer = activeToasts.get(id + '_timer');
    if (timer) clearTimeout(timer);
    activeToasts.delete(id);
    activeToasts.delete(id + '_timer');
    toast.classList.add('removing');
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
  };

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
})();
