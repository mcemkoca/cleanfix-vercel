const fs = require('fs');
const path = require('path');
const BASE = '/root/.openclaw/workspace/cleanfix-vercel';
const FILES = [
  'index.html','dashboard.html','login.html','customer-portal.html',
  'company-quotes.html','company-maintenance.html','company-staff.html',
  'company-bookings.html','company-equipment.html','company-customers.html',
  'company-services.html','company-stock.html','company-sectors.html','company-tools.html'
];

const EMPTY_STATES = ['Henüz kayıt yok', 'No data', 'Henüz veri yok', 'empty-state', 'emptyState', 'Henüz kayıt bulunmuyor'];

console.log('=== FINAL AUDIT REPORT ===\n');

FILES.forEach(file => {
  const filepath = path.join(BASE, file);
  if (!fs.existsSync(filepath)) { console.log(`❌ ${file}: FILE NOT FOUND`); return; }
  const c = fs.readFileSync(filepath, 'utf8');
  
  // 1. Error catching
  const hasError = c.includes('CleanFix Error:');
  
  // 2. Empty states
  const empties = EMPTY_STATES.filter(es => c.toLowerCase().includes(es.toLowerCase()));
  
  // 3. Modal audit
  const modalOverlays = c.match(/<div[^>]*class=["'][^"']*modal-overlay[^"']*["'][^>]*id=["']([^"']+)["'][^>]*>/g) || [];
  const modalIds = modalOverlays.map(m => {
    const id = m.match(/id=["']([^"']+)["']/);
    return id ? id[1] : null;
  }).filter(Boolean);
  
  let brokenModals = [];
  modalIds.forEach(id => {
    const modalRegex = new RegExp(`<div[^>]*class=["'][^"']*modal-overlay[^"']*["'][^>]*id=["']${id}["'][^>]*>[\\s\\S]*?</div>\\s*(?=<div|<script|</body|$)`, 'g');
    // Check for close button inside this modal
    const modalSection = c.substring(c.indexOf(`id="${id}"`), c.indexOf(`id="${id}"`) + 2000);
    const hasClose = modalSection.includes('modal-close') || modalSection.includes('closeModal') || modalSection.includes('close') && modalSection.includes('✕');
    if (!hasClose) brokenModals.push(id);
  });
  
  // 4. Data rows
  const trCount = (c.match(/<tr[\s>]/g) || []).length;
  
  // 5. Form validation
  const hasValidation = c.includes('validateEmail');
  
  // 6. Toast CSS
  const hasToast = c.includes('.toast-container');
  
  const issues = [];
  if (!hasError) issues.push('Missing error catching');
  if (empties.length) issues.push(`Empty states: ${empties.join(', ')}`);
  if (brokenModals.length) issues.push(`Broken modals: ${brokenModals.join(', ')}`);
  if (trCount < 5 && !file.includes('login')) issues.push(`Low data: ${trCount} rows`);
  if (!hasValidation) issues.push('Missing form validation');
  if (!hasToast) issues.push('Missing toast CSS');
  
  if (issues.length) {
    console.log(`⚠️  ${file}: ${issues.join(' | ')}`);
  } else {
    console.log(`✅ ${file}: OK (${trCount} rows, ${modalIds.length} modals)`);
  }
});

console.log('\n=== 404.html ===');
const f404 = path.join(BASE, '404.html');
if (fs.existsSync(f404)) {
  const c = fs.readFileSync(f404, 'utf8');
  console.log(c.includes('CleanFix Error:') ? '✅ 404.html: OK' : '⚠️  404.html: Missing error catching');
} else {
  console.log('❌ 404.html: NOT FOUND');
}
