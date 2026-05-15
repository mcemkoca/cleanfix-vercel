const fs = require('fs');
const path = require('path');

const files = [
  'customer-portal.html',
  'company-staff.html',
  'company-bookings.html',
  'company-equipment.html',
  'company-services.html',
  'company-stock.html',
  'company-sectors.html',
  'company-tools.html'
];

const baseDir = '/root/.openclaw/workspace/cleanfix-vercel';

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Check if this file still has the OLD format: "key": { "tr": "...", "en": "...", "nl": "..." }
  const oldFormatMatch = html.match(/const\s+i18n\s*=\s*\{[\s\S]*?\n\s*\}\s*;?/);
  if (!oldFormatMatch) {
    console.log(`SKIP: ${file} — no i18n object found`);
    return;
  }

  const i18nBlock = oldFormatMatch[0];
  
  // Check if it's already in the new format
  if (i18nBlock.includes('tr:') && !i18nBlock.match(/"\w+":\s*\{\s*"tr"/)) {
    console.log(`OK: ${file} — already in new format`);
    return;
  }

  // Check if it's the old format
  if (!i18nBlock.match(/"\w+":\s*\{\s*"tr"/)) {
    console.log(`SKIP: ${file} — format not recognized`);
    return;
  }

  console.log(`CONVERT: ${file} — converting from old format`);

  // Extract all key-translation entries from the old format
  // Pattern: "key": { "tr": "...", "en": "...", "nl": "..." }
  const entries = [];
  
  // Use a regex to find each key block
  const keyBlockRegex = /"([^"]+)":\s*\{\s*"tr"\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)\s*,\s*"en"\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)\s*,\s*"nl"\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)\s*\}/g;
  
  let m;
  while ((m = keyBlockRegex.exec(i18nBlock)) !== null) {
    const key = m[1];
    const tr = JSON.parse(m[2]);
    const en = JSON.parse(m[3]);
    const nl = JSON.parse(m[4]);
    entries.push({ key, tr, en, nl });
  }

  if (entries.length === 0) {
    console.log(`  ERROR: No entries extracted from ${file}`);
    return;
  }

  console.log(`  Extracted ${entries.length} keys`);

  // Build new i18n object in the correct format
  let newI18n = 'const i18n = {\n';
  newI18n += '  tr: {\n';
  entries.forEach(e => {
    newI18n += `    ${e.key}: ${JSON.stringify(e.tr)},\n`;
  });
  newI18n += '  },\n';
  newI18n += '  en: {\n';
  entries.forEach(e => {
    newI18n += `    ${e.key}: ${JSON.stringify(e.en)},\n`;
  });
  newI18n += '  },\n';
  newI18n += '  nl: {\n';
  entries.forEach(e => {
    newI18n += `    ${e.key}: ${JSON.stringify(e.nl)},\n`;
  });
  newI18n += '  }\n';
  newI18n += '};';

  // Replace old i18n block with new one
  html = html.replace(i18nBlock, newI18n);

  // Also need to update the switchLang function to work with the new format
  // Find the old switchLang and replace it
  const oldSwitchLangMatch = html.match(/function\s+switchLang\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}(?=\s*function|\s*const|\s*let|\s*document|\s*<\/script>|$)/);
  if (oldSwitchLangMatch) {
    const newSwitchLang = `function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('cleanfix_lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('.lang-switcher button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const t = i18n[lang] && i18n[lang][key];
    if (!t) return;
    const attr = el.dataset.i18nAttr;
    if (attr) {
      el.setAttribute(attr, t);
    } else if (el.tagName === 'TITLE') {
      el.textContent = t;
    } else if (el.tagName === 'A' || el.tagName === 'BUTTON') {
      if (el.children.length === 0) {
        el.textContent = t;
      } else {
        const textNodes = Array.from(el.childNodes).filter(n => n.nodeType === 3);
        if (textNodes.length > 0) textNodes[0].textContent = t;
      }
    } else {
      if (t.includes('<')) {
        el.innerHTML = t;
      } else {
        el.textContent = t;
      }
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (i18n[lang] && i18n[lang][key]) el.placeholder = i18n[lang][key];
  });

  const featuredCard = document.querySelector('.pricing-card.featured, .plan-card.featured');
  if (featuredCard) {
    featuredCard.dataset.popular = lang === 'tr' ? 'En Popüler' : lang === 'en' ? 'Most Popular' : 'Meest Populair';
  }
}`;

    html = html.replace(oldSwitchLangMatch[0], newSwitchLang);
  }

  // Clean up any old init code that might conflict
  // Remove old DOMContentLoaded blocks that call applyTranslations or similar
  html = html.replace(/document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{\s*applyTranslations\(\);[\s\S]*?\}\s*\);/g, '');

  // Ensure we have a proper init call
  if (!html.includes('switchLang(currentLang)')) {
    const lastScript = html.lastIndexOf('</script>');
    if (lastScript > 0) {
      html = html.slice(0, lastScript) + '\n/* Init */\nswitchLang(currentLang);\n' + html.slice(lastScript);
    }
  }

  fs.writeFileSync(filePath, html);
  console.log(`  DONE: ${file}`);
});

console.log('Conversion complete!');
