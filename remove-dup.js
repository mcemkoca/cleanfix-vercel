const fs = require('fs');
const path = require('path');

const files = [
  'dashboard.html',
  'company-quotes.html',
  'company-maintenance.html'
];

const baseDir = '/root/.openclaw/workspace/cleanfix-vercel';

files.forEach(file => {
  const filePath = path.join(baseDir, file);
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Find the pattern: </script>\n<script>\nconst i18n = { ... };
  // This is the second i18n block that starts after the first script closes
  const secondBlockPattern = /<\/script>\s*<script>\s*const i18n = \{[\s\S]*?\n\};\s*<\/script>/;
  
  const match = html.match(secondBlockPattern);
  if (match) {
    console.log(`Found second i18n block in ${file} at position ${match.index}, length ${match[0].length}`);
    // Remove the second block entirely
    html = html.replace(match[0], '</script>');
    fs.writeFileSync(filePath, html);
    console.log(`Removed second i18n block from ${file}`);
  } else {
    console.log(`No second i18n block found in ${file}`);
  }
});

console.log('Done!');
