const fs = require('fs');
const path = require('path');

const files = [
  'dashboard.html',
  'login.html', 
  'customer-portal.html',
  'company-quotes.html',
  'company-maintenance.html',
  'company-staff.html',
  'company-bookings.html',
  'company-equipment.html',
  'company-customers.html',
  'company-services.html',
  'company-stock.html',
  'company-sectors.html',
  'company-tools.html'
];

const baseDir = '/root/.openclaw/workspace/cleanfix-vercel';

console.log('=== Final Validation Report ===\n');

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  
  // Check 1: i18n object exists
  const hasI18n = html.includes('const i18n = {') || html.includes('const i18n={');
  
  // Check 2: Correct format (tr: { ... }, en: { ... }, nl: { ... })
  const hasTr = html.includes('tr:') || html.includes('"tr":');
  const hasEn = html.includes('en:') || html.includes('"en":');
  const hasNl = html.includes('nl:') || html.includes('"nl":');
  
  // Check 3: lang-switcher exists
  const hasLangSwitcher = html.includes('lang-switcher');
  
  // Check 4: switchLang function exists
  const hasSwitchLang = html.includes('function switchLang');
  
  // Check 5: localStorage persistence
  const hasLocalStorage = html.includes("localStorage.setItem('cleanfix_lang'");
  
  // Check 6: document.documentElement.lang update
  const hasLangUpdate = html.includes('document.documentElement.lang') || html.includes('document.documentElement.lang=');
  
  // Check 7: data-i18n attributes count
  const i18nCount = (html.match(/data-i18n=/g) || []).length;
  
  // Check 8: data-i18n-placeholder count
  const placeholderCount = (html.match(/data-i18n-placeholder=/g) || []).length;
  
  // Check 9: data-i18n-attr count
  const attrCount = (html.match(/data-i18n-attr=/g) || []).length;
  
  // Check 10: onclick on lang buttons
  const hasOnclick = html.includes("onclick=\"switchLang('tr')\"") || html.includes("onclick=\"switchLang('en')\"") || html.includes("onclick=\"switchLang('nl')\"");
  
  // File size
  const stats = fs.statSync(filePath);
  
  const ok = hasI18n && hasTr && hasEn && hasNl && hasLangSwitcher && hasSwitchLang && hasLocalStorage && hasLangUpdate && i18nCount > 20;
  
  console.log(`${ok ? '✅' : '❌'} ${file}`);
  console.log(`   Size: ${stats.size.toLocaleString()} bytes`);
  console.log(`   i18n keys: ${i18nCount}, placeholders: ${placeholderCount}, attrs: ${attrCount}`);
  if (!hasI18n) console.log(`   ⚠️ Missing i18n object`);
  if (!hasTr || !hasEn || !hasNl) console.log(`   ⚠️ Missing language section: tr=${hasTr}, en=${hasEn}, nl=${hasNl}`);
  if (!hasLangSwitcher) console.log(`   ⚠️ Missing lang-switcher`);
  if (!hasSwitchLang) console.log(`   ⚠️ Missing switchLang function`);
  if (!hasLocalStorage) console.log(`   ⚠️ Missing localStorage persistence`);
  if (!hasLangUpdate) console.log(`   ⚠️ Missing document.documentElement.lang update`);
  if (!hasOnclick) console.log(`   ⚠️ Missing onclick on lang buttons`);
  if (i18nCount < 20) console.log(`   ⚠️ Only ${i18nCount} data-i18n attributes`);
  console.log('');
});

console.log('=== Validation Complete ===');
