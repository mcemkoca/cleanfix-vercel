// CleanFix Form Validation Library
// Usage: include <script src="js/validation.js"></script> then use the functions below

(function() {
  'use strict';

  // ===== Core Validators =====

  window.validateEmail = function validateEmail(email) {
    if (typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  };

  window.validatePhone = function validatePhone(phone) {
    if (typeof phone !== 'string') return false;
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7;
  };

  window.validateRequired = function validateRequired(fields) {
    if (!fields || !fields.length) return { valid: true, empty: [] };
    const empty = [];
    for (let i = 0; i < fields.length; i++) {
      const el = fields[i];
      if (!el) continue;
      const val = (el.value || '').trim();
      if (!val) empty.push(el);
    }
    return { valid: empty.length === 0, empty: empty };
  };

  window.validateDateRange = function validateDateRange(start, end) {
    const s = start instanceof Date ? start : new Date(start);
    const e = end instanceof Date ? end : new Date(end);
    return !isNaN(s.getTime()) && !isNaN(e.getTime()) && s <= e;
  };

  // ===== Field-Level Feedback =====

  window.showFieldError = function showFieldError(inputElement, message) {
    if (!inputElement) return;
    clearFieldError(inputElement);
    inputElement.style.borderColor = 'var(--error-500, #ef4444)';
    inputElement.classList.add('cf-field-error');
    const msg = document.createElement('small');
    msg.className = 'cf-field-error-msg';
    msg.textContent = message;
    msg.style.cssText = 'color:var(--error-500, #ef4444);font-size:12px;display:block;margin-top:4px;';
    if (inputElement.parentNode) {
      inputElement.parentNode.insertBefore(msg, inputElement.nextSibling);
    }
  };

  window.clearFieldError = function clearFieldError(inputElement) {
    if (!inputElement) return;
    inputElement.style.borderColor = '';
    inputElement.classList.remove('cf-field-error');
    const parent = inputElement.parentNode;
    if (!parent) return;
    const msgs = parent.querySelectorAll('.cf-field-error-msg');
    for (let i = 0; i < msgs.length; i++) msgs[i].remove();
  };

  window.clearAllFieldErrors = function clearAllFieldErrors(formOrContainer) {
    if (!formOrContainer) return;
    const inputs = formOrContainer.querySelectorAll ? formOrContainer.querySelectorAll('input, select, textarea') : [];
    for (let i = 0; i < inputs.length; i++) clearFieldError(inputs[i]);
  };

  // ===== Form Auto-Validation Helper =====
  // Attach to any form to get inline validation on submit

  window.attachFormValidation = function attachFormValidation(formSelector) {
    const form = typeof formSelector === 'string' ? document.querySelector(formSelector) : formSelector;
    if (!form) return;
    form.addEventListener('submit', function(e) {
      clearAllFieldErrors(form);
      let ok = true;
      const inputs = form.querySelectorAll('input, select, textarea');
      for (let i = 0; i < inputs.length; i++) {
        const inp = inputs[i];
        if (inp.type === 'hidden' || inp.disabled || inp.readOnly) continue;
        const val = (inp.value || '').trim();
        const isRequired = inp.required || inp.classList.contains('required');

        if (isRequired && !val) {
          ok = false;
          showFieldError(inp, 'Bu alan zorunlu / This field is required / Dit veld is verplicht');
        }
        if (inp.type === 'email' && val && !validateEmail(val)) {
          ok = false;
          showFieldError(inp, 'Geçerli e-posta giriniz / Valid email required / Geldig e-mailadres vereist');
        }
        const isPhone = inp.dataset.type === 'phone' ||
                        (inp.name || '').includes('phone') ||
                        (inp.id || '').includes('phone') ||
                        (inp.placeholder || '').toLowerCase().includes('telefon') ||
                        (inp.placeholder || '').toLowerCase().includes('phone');
        if (isPhone && val && !validatePhone(val)) {
          ok = false;
          showFieldError(inp, 'Telefon en az 7 hane olmalı / Phone min 7 digits / Telefoon min 7 cijfers');
        }
      }
      if (!ok) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof showToast === 'function') {
          showToast('Lütfen hatalı alanları düzeltin / Please fix errors / Corrigeer de fouten', 'error');
        }
        return false;
      }
    });
  };
})();
