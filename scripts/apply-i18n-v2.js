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

const langSwitcherHtml = `
  <div class="lang-switcher">
    <button data-lang="tr" class="active" onclick="switchLang('tr')">TR</button>
    <button data-lang="en" onclick="switchLang('en')">EN</button>
    <button data-lang="nl" onclick="switchLang('nl')">NL</button>
  </div>
`;

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
    featuredCard.dataset.popular = lang === 'tr' ? 'En Populer' : lang === 'en' ? 'Most Popular' : 'Meest Populair';
  }
}
`;

function addLangSwitcher(html) {
  // Add CSS
  if (!html.includes('.lang-switcher')) {
    if (html.includes('</style>')) {
      html = html.replace(/<\/style>/, langSwitcherCss + '\n</style>');
    } else if (html.includes('</head>')) {
      html = html.replace(/<\/head>/, '<style>' + langSwitcherCss + '</style>\n</head>');
    }
  }
  // Add HTML in nav or header
  if (!html.includes('class="lang-switcher"')) {
    // Try to find nav/header and append
    const navMatch = html.match(/<nav[^>]*>.*?<\/nav>/is);
    if (navMatch) {
      const nav = navMatch[0];
      // Find last </div> before </nav> and insert before it
      const lastDiv = nav.lastIndexOf('</div>');
      if (lastDiv > -1) {
        const before = nav.substring(0, lastDiv);
        const after = nav.substring(lastDiv);
        const newNav = before + langSwitcherHtml + '\n' + after;
        html = html.replace(nav, newNav);
      } else {
        html = html.replace(nav, nav.replace(/<\/nav>/, langSwitcherHtml + '\n</nav>'));
      }
    } else {
      const headerMatch = html.match(/<header[^>]*>.*?<\/header>/is);
      if (headerMatch) {
        const header = headerMatch[0];
        html = html.replace(header, header.replace(/<\/header>/, langSwitcherHtml + '\n</header>'));
      }
    }
  }
  return html;
}

function addI18nScript(html, i18nObj) {
  const script = `
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

  if (html.includes('</body>')) {
    html = html.replace(/<\/body>/, script + '\n</body>');
  } else if (html.includes('</html>')) {
    html = html.replace(/<\/html>/, script + '\n</html>');
  }
  return html;
}

for (const file of files) {
  const filepath = path.join(baseDir, file);
  if (!fs.existsSync(filepath)) {
    console.log('SKIP (not found): ' + file);
    continue;
  }

  let html = fs.readFileSync(filepath, 'utf8');
  const originalSize = html.length;

  // Step 1: Add lang switcher CSS and HTML
  html = addLangSwitcher(html);

  // Step 2: Add placeholder translations for inputs
  let phIdx = 0;
  const i18nPlaceholders = {};
  html = html.replace(/placeholder="([^"]{2,50})"/g, (match, text) => {
    if (/^\d+$/.test(text) || text.length < 2) return match;
    const key = 'ph_' + phIdx++;
    i18nPlaceholders[key] = { tr: text, en: text, nl: text };
    return match + ' data-i18n-placeholder="' + key + '"';
  });

  // Step 3: Add i18n script
  const i18nObj = { tr: {}, en: {}, nl: {} };
  // Add placeholders
  for (const [key, val] of Object.entries(i18nPlaceholders)) {
    i18nObj.tr[key] = val.tr;
    i18nObj.en[key] = val.en;
    i18nObj.nl[key] = val.nl;
  }

  html = addI18nScript(html, i18nObj);

  fs.writeFileSync(filepath, html, 'utf8');
  const newSize = html.length;
  console.log(file + ': ' + originalSize + ' -> ' + newSize + ' bytes');
}

console.log('\nDone! Language switchers and i18n framework added to all files.');
