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

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Add data-i18n-attr="content" to meta description if missing
  if (html.includes('<meta name="description"') && !html.includes('data-i18n-attr="content"')) {
    html = html.replace(
      /<meta name="description" content="([^"]*)"/, 
      '<meta name="description" data-i18n="meta_desc" data-i18n-attr="content" content="$1"'
    );
    modified = true;
  }

  // 2. Add data-i18n-attr="content" to meta keywords if present and missing (optional)
  // Actually keywords don't need translation usually

  // 3. Add data-i18n-attr="content" to og:title if present and missing
  if (html.includes('<meta property="og:title"') && !html.includes('data-i18n-attr="content"')) {
    html = html.replace(
      /<meta property="og:title" content="([^"]*)"/, 
      '<meta property="og:title" data-i18n="og_title" data-i18n-attr="content" content="$1"'
    );
    modified = true;
  }

  // 4. Add data-i18n-attr="content" to og:description if present and missing  
  if (html.includes('<meta property="og:description"') && !html.includes('og_desc')) {
    html = html.replace(
      /<meta property="og:description" content="([^"]*)"/, 
      '<meta property="og:description" data-i18n="og_desc" data-i18n-attr="content" content="$1"'
    );
    modified = true;
  }

  // 5. Ensure title tag has data-i18n
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  if (titleMatch && !html.includes('data-i18n="page_title"')) {
    html = html.replace(
      /<title>[^<]*<\/title>/,
      '<title data-i18n="page_title">' + titleMatch[1] + '</title>'
    );
    modified = true;
  }

  // 6. Add dataset.popular update to switchLang if missing
  if (!html.includes('dataset.popular') && html.includes('featured')) {
    // Add the featured card update before the closing of switchLang or at the end of it
    const switchLangMatch = html.match(/function switchLang[\s\S]*?\n\s*\}\s*(?=\nfunction|\nconst|\nlet|\n\/\*|\n<\/script>|\n\s*\}\s*\);|$)/);
    if (switchLangMatch) {
      // Check if we can inject inside the function - find the last line before closing brace
      const func = switchLangMatch[0];
      if (!func.includes('dataset.popular')) {
        // Find a good injection point - before the final }
        const lastBrace = func.lastIndexOf('}');
        const inject = `
  const featuredCard = document.querySelector('.pricing-card.featured, .plan-card.featured');
  if (featuredCard) {
    featuredCard.dataset.popular = lang === 'tr' ? 'En Popüler' : lang === 'en' ? 'Most Popular' : 'Meest Populair';
  }`;
        const newFunc = func.slice(0, lastBrace) + inject + '\n' + func.slice(lastBrace);
        html = html.replace(func, newFunc);
        modified = true;
      }
    }
  }

  // 7. Ensure lang-switcher buttons have onclick="switchLang(...)" 
  ['tr', 'en', 'nl'].forEach(lang => {
    const btnRegex = new RegExp(`<button data-lang="${lang}"([^>]*)>`, 'g');
    html = html.replace(btnRegex, (match, attrs) => {
      if (attrs.includes('onclick')) return match;
      return `<button data-lang="${lang}" onclick="switchLang('${lang}')"${attrs}>`;
    });
  });

  if (modified) {
    fs.writeFileSync(filePath, html);
    console.log(`MODIFIED: ${file}`);
  } else {
    console.log(`OK: ${file}`);
  }
});

console.log('Done!');
