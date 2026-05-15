const fs = require('fs');
const path = require('path');

const filesToFix = [
  'dashboard.html',
  'company-quotes.html',
  'company-maintenance.html'
];

const baseDir = '/root/.openclaw/workspace/cleanfix-vercel';

filesToFix.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // Remove old leftover code: from "  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {"
  // to "});
});" (the old applyTranslations remnants)
  const oldRemnantPattern = /\n\s*document\.querySelectorAll\('\[data-i18n-placeholder\]'\)\.forEach\(el\s*=>\s*\{\s*const\s+key\s*=\s*el\.dataset\.i18nPlaceholder;\s*const\s+text\s*=\s*t\(key\);\s*if\s*\(text\s*&&\s*text\s*!==\s*key\)\s*el\.placeholder\s*=\s*text;\s*\}\);\s*document\.documentElement\.lang\s*=\s*currentLang\s*===\s*'tr'\s*\?\s*'tr'\s*:\s*currentLang\s*===\s*'nl'\s*\?\s*'nl'\s*:\s*'en';\s*\}\s*document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{\s*applyTranslations\(\);\s*document\.querySelectorAll\('.lang-switcher\s+button'\)\.forEach\(btn\s*=>\s*\{\s*btn\.classList\.toggle\('active',\s*btn\.dataset\.lang\s*===\s*currentLang\);\s*\}\);\s*\}\);/;
  
  if (oldRemnantPattern.test(html)) {
    html = html.replace(oldRemnantPattern, '');
    fs.writeFileSync(filePath, html);
    console.log(`CLEANED: ${file}`);
  } else {
    console.log(`CHECK: ${file} - no old remnants found or pattern didn't match`);
  }
});

console.log('Cleanup done!');
