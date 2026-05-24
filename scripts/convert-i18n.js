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

// New switchLang function to inject (index.html style)
const newSwitchLang = `let currentLang = localStorage.getItem('cleanfix_lang') || 'tr';

function switchLang(lang) {
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

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Step 1: Find and extract the existing i18n object
  const i18nMatch = html.match(/const\s+i18n\s*=\s*\{[\s\S]*?\};/);
  if (!i18nMatch) {
    console.log(`SKIP: No i18n found in ${file}`);
    return;
  }

  const oldI18nBlock = i18nMatch[0];
  
  // Step 2: Parse the old format and convert to new format
  // Old: const i18n = { key: { tr: "...", en: "...", nl: "..." }, ... };
  // We need to eval it safely or parse it with a regex approach
  
  // Extract all key: { tr: "...", en: "...", nl: "..." } entries
  const entries = [];
  const entryRegex = /(\w+)\s*:\s*\{\s*tr\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)(?:\s*,\s*en\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`))?(?:\s*,\s*nl\s*:\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`))?\s*\}/g;
  
  let m;
  while ((m = entryRegex.exec(oldI18nBlock)) !== null) {
    const key = m[1];
    const tr = m[2] ? eval(m[2]) : '';
    const en = m[3] ? eval(m[3]) : tr;
    const nl = m[4] ? eval(m[4]) : tr;
    entries.push({ key, tr, en, nl });
  }

  if (entries.length === 0) {
    console.log(`SKIP: Could not parse i18n entries in ${file}`);
    return;
  }

  // Build new i18n object
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

  // Step 3: Replace old i18n block with new one
  html = html.replace(oldI18nBlock, newI18n);

  // Step 4: Replace the old switchLang/t/applyTranslations functions
  // Find the pattern from "let currentLang" to the end of the script or applyTranslations
  const oldFuncPattern = /let\s+currentLang\s*=.*?function\s+t\s*\(key\).*?function\s+applyTranslations\s*\(\).*?\}\s*\}\s*\);?/s;
  const oldFuncMatch = html.match(oldFuncPattern);
  
  if (oldFuncMatch) {
    // Keep the DOMContentLoaded init if present, but replace the functions
    let initBlock = '';
    const initMatch = html.match(/document\.addEventListener\('DOMContentLoaded'.*?\}\s*\);/s);
    if (initMatch) {
      initBlock = initMatch[0];
      html = html.replace(initMatch[0], '');
    }
    
    html = html.replace(oldFuncMatch[0], newSwitchLang);
    
    // Add init call at the end if not present
    if (!html.includes('switchLang(currentLang)')) {
      // Find the last </script> before </body> or end
      const lastScript = html.lastIndexOf('</script>');
      if (lastScript > 0) {
        html = html.slice(0, lastScript) + '\n/* Init */\nswitchLang(currentLang);\n' + html.slice(lastScript);
      }
    }
  }

  // Step 5: Add data-i18n-attr="content" to meta description if present and missing
  html = html.replace(/<meta name="description" content="[^"]*"(?!.*data-i18n-attr)/, (match) => {
    return match.replace('>', ' data-i18n="meta_desc" data-i18n-attr="content">');
  });

  // Step 6: Ensure lang switcher buttons have onclick="switchLang(...)"
  html = html.replace(/<button data-lang="tr"[^>]*>(?!.*switchLang)/g, '<button data-lang="tr" onclick="switchLang(\'tr\')"');
  html = html.replace(/<button data-lang="en"[^>]*>(?!.*switchLang)/g, '<button data-lang="en" onclick="switchLang(\'en\')"');
  html = html.replace(/<button data-lang="nl"[^>]*>(?!.*switchLang)/g, '<button data-lang="nl" onclick="switchLang(\'nl\')"');

  fs.writeFileSync(filePath, html);
  console.log(`DONE: ${file} — ${entries.length} keys converted`);
});

console.log('All files processed!');
