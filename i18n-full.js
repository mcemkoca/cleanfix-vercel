const fs = require('fs');
const path = require('path');

const files = [
  'dashboard.html',
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

// Load translation dictionary
const dictPath = path.join(baseDir, 'i18n-dict.json');
const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

function translate(trText) {
  const exact = dict[trText];
  if (exact) return exact;
  // Try lowercase
  for (const [key, val] of Object.entries(dict)) {
    if (key.toLowerCase() === trText.toLowerCase()) return val;
  }
  return null;
}

// Parse HTML and extract text nodes with their parent tag info
function extractTextNodes(html) {
  const results = [];
  let inTag = false;
  let inScript = false;
  let inStyle = false;
  let buffer = '';
  let tagStack = [];
  let pos = 0;
  
  while (pos < html.length) {
    const ch = html[pos];
    
    if (ch === '<') {
      // Check if we have text buffer to save
      if (buffer.trim().length > 0 && !inScript && !inStyle) {
        const parentTag = tagStack.length > 0 ? tagStack[tagStack.length - 1] : null;
        if (parentTag && !['script','style','title','meta','link','head'].includes(parentTag.name)) {
          results.push({
            text: buffer.trim(),
            parent: parentTag.name,
            start: pos - buffer.length,
            end: pos
          });
        }
      }
      buffer = '';
      
      // Parse tag
      let tagEnd = html.indexOf('>', pos);
      if (tagEnd === -1) tagEnd = html.length;
      const tagContent = html.substring(pos + 1, tagEnd);
      const isClosing = tagContent.startsWith('/');
      const isSelfClosing = tagContent.endsWith('/') || 
        ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'].some(t => 
          tagContent.toLowerCase().startsWith(t + ' ') || tagContent.toLowerCase() === t
        );
      
      const tagNameMatch = tagContent.match(/^\/?([a-zA-Z][a-zA-Z0-9]*)/);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      
      if (isClosing) {
        tagStack.pop();
      } else if (!isSelfClosing && tagName) {
        tagStack.push({ name: tagName, start: pos });
      }
      
      if (tagName === 'script') inScript = !isClosing;
      if (tagName === 'style') inStyle = !isClosing;
      
      pos = tagEnd + 1;
      continue;
    }
    
    buffer += ch;
    pos++;
  }
  
  return results;
}

// Process a single file
function processFile(file) {
  const filepath = path.join(baseDir, file);
  if (!fs.existsSync(filepath)) {
    console.log('SKIP (not found): ' + file);
    return;
  }
  
  let html = fs.readFileSync(filepath, 'utf8');
  const origSize = html.length;
  
  // Step 1: Remove old empty i18n script (the one from v2)
  // Find and remove the old i18n script block that has only ph_ keys
  const oldScriptPattern = /<script>\s*\/\*\s*=+\s*i18n[\s\S]*?<\/script>\s*(?=<\/body>|<\/html>)/i;
  html = html.replace(oldScriptPattern, '');
  
  // Step 2: Remove lang switcher from sidebar if it's there
  // The v2 script may have placed it incorrectly
  const sidebarLangSwitcher = /<div class="lang-switcher">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/nav>|<\/nav>)/i;
  if (sidebarLangSwitcher.test(html)) {
    // Check if it's inside sidebar-nav
    const sidebarNavMatch = html.match(/<nav class="sidebar-nav">[\s\S]*?<\/nav>/i);
    if (sidebarNavMatch && sidebarNavMatch[0].includes('lang-switcher')) {
      // Remove it from sidebar nav
      const navContent = sidebarNavMatch[0];
      const cleanedNav = navContent.replace(/<div class="lang-switcher">[\s\S]*?<\/div>\s*/, '');
      html = html.replace(navContent, cleanedNav);
    }
  }
  
  // Step 3: Add lang switcher to header if not already there
  if (!html.includes('class="header-right"') || 
      (html.includes('class="header-right"') && !html.match(/class="header-right"[^>]*>[\s\S]*?lang-switcher/))) {
    // Find header-right or create it
    const headerMatch = html.match(/<header class="header">([\s\S]*?)<\/header>/i);
    if (headerMatch) {
      const headerContent = headerMatch[1];
      const headerRightMatch = headerContent.match(/<div class="header-right">([\s\S]*?)<\/div>/i);
      if (headerRightMatch) {
        // Add lang switcher inside header-right
        const newHeaderRight = headerRightMatch[0].replace(
          /<\/div>\s*$/,
          '  <div class="lang-switcher">\n    <button data-lang="tr" class="active" onclick="switchLang(\'tr\')">TR</button>\n    <button data-lang="en" onclick="switchLang(\'en\')">EN</button>\n    <button data-lang="nl" onclick="switchLang(\'nl\')">NL</button>\n  </div>\n</div>'
        );
        html = html.replace(headerRightMatch[0], newHeaderRight);
      } else {
        // Add header-right with lang switcher before </header>
        const langSwitcherHtml = '<div class="header-right">\n  <div class="lang-switcher">\n    <button data-lang="tr" class="active" onclick="switchLang(\'tr\')">TR</button>\n    <button data-lang="en" onclick="switchLang(\'en\')">EN</button>\n    <button data-lang="nl" onclick="switchLang(\'nl\')">NL</button>\n  </div>\n</div>';
        html = html.replace(/<\/header>/i, langSwitcherHtml + '\n</header>');
      }
    }
  }
  
  // Step 4: Ensure lang switcher CSS is present
  const langSwitcherCss = `
.lang-switcher {
  display:flex; align-items:center; gap:4px;
  background:var(--bg-card); border:1px solid var(--border-color);
  border-radius:var(--radius-md); padding:3px; margin-left:12px;
}
.lang-switcher button {
  background:transparent; border:none; color:var(--text-muted);
  font-size:11px; font-weight:600; cursor:pointer;
  padding:4px 8px; border-radius:4px; transition:all 0.2s;
  text-transform:uppercase; font-family:inherit;
}
.lang-switcher button:hover { color:var(--text-primary); }
.lang-switcher button.active { background:var(--teal-500); color:white; }
`;
  if (!html.includes('.lang-switcher')) {
    if (html.includes('</style>')) {
      html = html.replace(/<\/style>/, langSwitcherCss + '\n</style>');
    } else if (html.includes('</head>')) {
      html = html.replace(/<\/head>/, '<style>' + langSwitcherCss + '</style>\n</head>');
    }
  }
  
  // Step 5: Extract text nodes and add data-i18n attributes
  const textNodes = extractTextNodes(html);
  const i18nObj = { tr: {}, en: {}, nl: {} };
  let keyIdx = 0;
  
  // Process from end to start to avoid position shifts
  const sortedNodes = [...textNodes].sort((a, b) => b.start - a.start);
  
  for (const node of sortedNodes) {
    const text = node.text;
    
    // Skip non-translatable text
    if (text.length < 2) continue;
    if (/^\d+$/.test(text)) continue;
    if (/^\d+[\.,]?\d*$/.test(text)) continue; // numbers
    if (/^€?[\d\.,]+$/.test(text)) continue; // prices
    if (/^\+?\d[\d\s]+$/.test(text)) continue; // phone numbers
    if (text.includes('@') && text.includes('.')) continue; // emails
    if (text.includes('<') || text.includes('>')) continue; // HTML
    if (text.startsWith('<!--')) continue; // comments
    if (['CF', 'JP', 'LW', 'PD', 'SJ', 'MD', 'EP'].includes(text)) continue; // initials
    if (/^\d+\s+(Mayıs|Nisan|Mart|Ocak|Şubat|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+\d{4}$/.test(text)) continue; // dates
    
    const key = 'k' + keyIdx++;
    i18nObj.tr[key] = text;
    
    const t = translate(text);
    if (t) {
      i18nObj.en[key] = t.en;
      i18nObj.nl[key] = t.nl;
    } else {
      i18nObj.en[key] = text;
      i18nObj.nl[key] = text;
    }
    
    // Find the opening tag before this text
    const beforeText = html.substring(0, node.start);
    const afterText = html.substring(node.end);
    
    // Find last <...> before this text
    const lastTagEnd = beforeText.lastIndexOf('>');
    if (lastTagEnd === -1) continue;
    
    const lastTagStart = beforeText.lastIndexOf('<', lastTagEnd);
    if (lastTagStart === -1) continue;
    
    const tagContent = beforeText.substring(lastTagStart + 1, lastTagEnd);
    
    // Skip if already has data-i18n
    if (tagContent.includes('data-i18n')) continue;
    
    // Skip script/style content
    if (tagContent.startsWith('/') || tagContent.startsWith('!')) continue;
    
    // Add data-i18n to the tag
    const newTagContent = tagContent + ' data-i18n="' + key + '"';
    html = beforeText.substring(0, lastTagStart) + '<' + newTagContent + '>' + afterText;
  }
  
  // Step 6: Add data-i18n-placeholder to inputs
  let phIdx = 0;
  const phKeys = {};
  html = html.replace(/placeholder="([^"]{2,60})"/g, (match, text) => {
    if (/^\d+$/.test(text)) return match;
    const key = 'ph_' + phIdx++;
    phKeys[key] = text;
    // Remove old data-i18n-placeholder if exists
    const before = html.substring(0, html.indexOf(match));
    const tagStart = before.lastIndexOf('<');
    const tagContent = before.substring(tagStart);
    if (tagContent.includes('data-i18n-placeholder')) {
      // Already has it, skip
      return match;
    }
    return match + ' data-i18n-placeholder="' + key + '"';
  });
  
  // Add placeholder translations
  for (const [key, text] of Object.entries(phKeys)) {
    i18nObj.tr[key] = text;
    const t = translate(text);
    if (t) {
      i18nObj.en[key] = t.en;
      i18nObj.nl[key] = t.nl;
    } else {
      i18nObj.en[key] = text;
      i18nObj.nl[key] = text;
    }
  }
  
  // Step 7: Add i18n script before </body>
  const switchLangFunction = `
let currentLang = localStorage.getItem('cleanfix_lang') || 'tr';
function switchLang(lang) {
  currentLang = lang;
  localStorage.setItem('cleanfix_lang', lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-switcher button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const t = i18n[lang][key];
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
    if (i18n[lang][key]) el.placeholder = i18n[lang][key];
  });
  const featuredCard = document.querySelector('.pricing-card.featured');
  if (featuredCard) {
    featuredCard.dataset.popular = lang === 'tr' ? 'En Popüler' : lang === 'en' ? 'Most Popular' : 'Meest Populair';
  }
}
`;

  const i18nScript = `
<script>
/* ============================
   i18n - 3 Language Support
   TR | EN | NL
   ============================ */
const i18n = ${JSON.stringify(i18nObj, null, 2)};
${switchLangFunction}
/* Init */
switchLang(currentLang);
</script>`;

  // Remove any existing i18n script first
  html = html.replace(/<script>\s*\/\*\s*=+\s*i18n[\s\S]*?<\/script>\s*/gi, '');
  
  if (html.includes('</body>')) {
    html = html.replace(/<\/body>/, i18nScript + '\n</body>');
  } else if (html.includes('</html>')) {
    html = html.replace(/<\/html>/, i18nScript + '\n</html>');
  }
  
  fs.writeFileSync(filepath, html, 'utf8');
  const newSize = html.length;
  console.log(file + ': ' + origSize + ' -> ' + newSize + ' bytes (' + keyIdx + ' text keys, ' + Object.keys(phKeys).length + ' placeholder keys)');
}

// Main
for (const file of files) {
  try {
    processFile(file);
  } catch (err) {
    console.error('ERROR processing ' + file + ': ' + err.message);
  }
}

console.log('\nDone! All files processed with full i18n support.');
