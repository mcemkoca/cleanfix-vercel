const fs = require('fs');
const path = require('path');

const files = [
  'customer-portal.html',
  'company-services.html',
  'company-stock.html',
  'company-sectors.html',
  'company-tools.html'
];

const baseDir = '/root/.openclaw/workspace/cleanfix-vercel';

console.log('=== Checking converted files ===\n');

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  const html = fs.readFileSync(filePath, 'utf8');
  
  console.log(`=== ${file} ===`);
  
  // Check i18n format
  const i18nMatch = html.match(/const\s+i18n\s*=\s*\{[\s\S]*?\n\s*\}\s*;/g);
  if (i18nMatch) {
    console.log(`  i18n objects: ${i18nMatch.length}`);
    i18nMatch.forEach((block, i) => {
      const hasTrBlock = block.includes('tr:');
      const hasEnBlock = block.includes('en:');
      const hasNlBlock = block.includes('nl:');
      const hasOldFormat = block.match(/"\w+":\s*\{\s*"tr"/);
      console.log(`    Block ${i+1}: tr=${hasTrBlock}, en=${hasEnBlock}, nl=${hasNlBlock}, old=${!!hasOldFormat}`);
    });
  }
  
  // Check switchLang
  const hasSwitchLang = html.includes('function switchLang');
  const hasLocalStorage = html.includes("localStorage.setItem('cleanfix_lang'");
  const hasLangUpdate = html.includes('document.documentElement.lang');
  console.log(`  switchLang: ${hasSwitchLang}, localStorage: ${hasLocalStorage}, langUpdate: ${hasLangUpdate}`);
  
  // Check data-i18n counts
  const i18nCount = (html.match(/data-i18n=/g) || []).length;
  const placeholderCount = (html.match(/data-i18n-placeholder=/g) || []).length;
  console.log(`  data-i18n: ${i18nCount}, placeholders: ${placeholderCount}`);
  
  console.log('');
});
