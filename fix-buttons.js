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

  // Fix malformed buttons: onclick="switchLang('x')"TR</button> -> onclick="switchLang('x')">TR</button>
  html = html.replace(/onclick="switchLang\('(tr|en|nl)'\)"(TR|EN|NL)<\/button>/g, "onclick=\"switchLang('$1')\">$2</button>");
  
  // Also fix if there's no space before onclick
  html = html.replace(/<button data-lang="(tr|en|nl)"onclick="switchLang\('(tr|en|nl)'\)">/g, '<button data-lang="$1" onclick="switchLang(\'$2\')">');

  fs.writeFileSync(filePath, html);
});

console.log('Fixed malformed lang buttons!');
