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

// The canonical switchLang function from index.html
const canonicalSwitchLang = `let currentLang = localStorage.getItem('cleanfix_lang') || 'tr';

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

const canonicalInit = '\n/* Init */\nswitchLang(currentLang);\n';

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  console.log(`\n=== Processing ${file} ===`);

  // Step 1: Detect format and convert if needed
  // Check if file has the old format: "key": { "tr": "...", "en": "...", "nl": "..." }
  const hasOldFormat = html.match(/"\w+":\s*\{\s*"tr"\s*:/);
  const hasNewFormat = html.match(/tr:\s*\{/);

  if (hasOldFormat && !hasNewFormat) {
    console.log('  Detected OLD format — converting...');

    // Find the i18n block
    const i18nStart = html.indexOf('const i18n = {');
    const i18nEnd = html.indexOf('};', i18nStart) + 2;
    const i18nBlock = html.substring(i18nStart, i18nEnd);

    // Extract entries using a safer approach: find each key block
    const entries = [];
    let pos = 0;
    const keyRegex = /"([^"]+)":\s*\{/g;
    let match;
    const keyPositions = [];
    
    while ((match = keyRegex.exec(i18nBlock)) !== null) {
      keyPositions.push({ key: match[1], start: match.index });
    }
    
    // For each key, find the corresponding tr/en/nl values
    for (let i = 0; i < keyPositions.length; i++) {
      const kp = keyPositions[i];
      const endPos = (i < keyPositions.length - 1) ? keyPositions[i + 1].start : i18nBlock.length;
      const block = i18nBlock.substring(kp.start, endPos);
      
      const trMatch = block.match(/"tr"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      const enMatch = block.match(/"en"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      const nlMatch = block.match(/"nl"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      
      if (trMatch) {
        entries.push({
          key: kp.key,
          tr: trMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
          en: enMatch ? enMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : trMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n'),
          nl: nlMatch ? nlMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n') : trMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
        });
      }
    }

    if (entries.length === 0) {
      console.log('  ERROR: Could not extract any keys!');
      return;
    }

    console.log(`  Extracted ${entries.length} keys`);

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

    html = html.substring(0, i18nStart) + newI18n + html.substring(i18nEnd);
    modified = true;
  } else if (hasNewFormat) {
    console.log('  Already in NEW format — checking switchLang...');
  }

  // Step 2: Standardize switchLang function
  // Find existing switchLang and replace with canonical version
  const switchLangMatch = html.match(/(?:let|var|const)\s+(?:currentLang|_currentLang)\s*=\s*localStorage\.getItem\('cleanfix_lang'\)[\s\S]*?function\s+switchLang\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}(?=\s*function|\s*const|\s*let|\s*document\.addEventListener|\s*\/\*|\s*<\/script>|\s*$)/);
  
  if (switchLangMatch) {
    // Check if it already matches the canonical form
    if (!switchLangMatch[0].includes("i18n[lang] && i18n[lang][key]") || 
        switchLangMatch[0].includes("function applyLang") ||
        switchLangMatch[0].includes("i18n[_currentLang]")) {
      console.log('  Replacing switchLang with canonical version...');
      html = html.replace(switchLangMatch[0], canonicalSwitchLang);
      modified = true;
    } else {
      console.log('  switchLang already canonical.');
    }
  } else {
    console.log('  WARNING: Could not find switchLang function!');
  }

  // Step 3: Add data-i18n-attr to meta description if missing
  if (html.includes('<meta name="description"') && !html.includes('data-i18n="meta_desc"')) {
    html = html.replace(
      /<meta name="description" content="([^"]*)"/, 
      '<meta name="description" data-i18n="meta_desc" data-i18n-attr="content" content="$1"'
    );
    modified = true;
    console.log('  Added data-i18n-attr to meta description.');
  }

  // Step 4: Ensure title has data-i18n
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  if (titleMatch && !html.includes('data-i18n="page_title"') && !html.includes('data-i18n="title_')) {
    // Find a reasonable key based on the file name
    let titleKey = 'page_title';
    if (file.includes('dashboard')) titleKey = 'title_dashboard';
    else if (file.includes('login')) titleKey = 'page_title';
    else if (file.includes('customer')) titleKey = 'title_customers';
    else if (file.includes('services')) titleKey = 'title_services';
    else if (file.includes('stock')) titleKey = 'title_stock';
    else if (file.includes('staff')) titleKey = 'title_staff';
    else if (file.includes('quotes')) titleKey = 'title_quotes';
    else if (file.includes('maintenance')) titleKey = 'title_maintenance';
    else if (file.includes('equipment')) titleKey = 'title_equipment';
    else if (file.includes('bookings')) titleKey = 'title_bookings';
    else if (file.includes('sectors')) titleKey = 'title_sectors';
    else if (file.includes('tools')) titleKey = 'title_tools';
    
    html = html.replace(
      /<title>([^<]*)<\/title>/,
      `<title data-i18n="${titleKey}">$1</title>`
    );
    modified = true;
    console.log(`  Added data-i18n to title (key: ${titleKey}).`);
  }

  // Step 5: Fix lang-switcher buttons - ensure they have onclick
  ['tr', 'en', 'nl'].forEach(lang => {
    // Match button with data-lang but missing onclick
    const btnRegex = new RegExp(`<button data-lang="${lang}"([^>]*)>(?!\\s*onclick)`, 'g');
    html = html.replace(btnRegex, (match, attrs) => {
      if (attrs.includes('onclick')) return match;
      return `<button data-lang="${lang}" onclick="switchLang('${lang}')"${attrs}>`;
    });
  });

  // Step 6: Ensure init call exists
  if (!html.includes('switchLang(currentLang)')) {
    // Find the last </script> before </body>
    const lastScriptIdx = html.lastIndexOf('</script>');
    if (lastScriptIdx > 0) {
      html = html.slice(0, lastScriptIdx) + canonicalInit + html.slice(lastScriptIdx);
      modified = true;
      console.log('  Added init call.');
    }
  }

  // Step 7: Clean up old DOMContentLoaded blocks that might conflict
  const oldInitPattern = /document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{\s*applyTranslations\(\);[\s\S]*?\}\s*\);/g;
  if (oldInitPattern.test(html)) {
    html = html.replace(oldInitPattern, '');
    modified = true;
    console.log('  Removed old applyTranslations init.');
  }

  // Step 8: Remove old t() function if present (from old format)
  const oldTFunction = /function\s+t\s*\(key\)\s*\{[\s\S]*?return\s+key;\s*\}/g;
  if (oldTFunction.test(html)) {
    html = html.replace(oldTFunction, '');
    modified = true;
    console.log('  Removed old t() function.');
  }

  // Step 9: Remove old applyTranslations function if present
  const oldApplyTranslations = /function\s+applyTranslations\s*\(\)\s*\{[\s\S]*?\n\s*\}/g;
  if (oldApplyTranslations.test(html)) {
    html = html.replace(oldApplyTranslations, '');
    modified = true;
    console.log('  Removed old applyTranslations function.');
  }

  if (modified) {
    fs.writeFileSync(filePath, html);
    console.log(`  SAVED.`);
  } else {
    console.log(`  No changes needed.`);
  }
});

console.log('\n=== All files processed ===');
