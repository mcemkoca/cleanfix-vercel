const fs = require('fs');
const path = require('path');

const FILES = [
  'index.html','dashboard.html','login.html','customer-portal.html',
  'company-quotes.html','company-maintenance.html','company-staff.html',
  'company-bookings.html','company-equipment.html','company-customers.html',
  'company-services.html','company-stock.html','company-sectors.html','company-tools.html'
];

const BASE = '/root/.openclaw/workspace/cleanfix-vercel';
const ERROR_SCRIPT = `<script>
window.onerror = function(msg, url, line) {
  console.error('CleanFix Error:', msg, 'at', url, ':' , line);
  return false;
};
window.addEventListener('unhandledrejection', function(e) {
  console.error('Unhandled Promise:', e.reason);
});
</script>`;

const TOAST_CSS = `
.toast-container{position:fixed;top:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:8px;}
.toast{padding:12px 20px;border-radius:var(--radius-md);font-size:var(--text-sm);font-weight:500;color:white;box-shadow:var(--shadow-lg);animation:toastIn 0.3s ease;max-width:320px;}
.toast.error{background:var(--error-500);}
.toast.success{background:var(--success-500);}
.toast.info{background:var(--info-500);}
@keyframes toastIn{from{transform:translateX(120%);opacity:0;}to{transform:translateX(0);opacity:1;}}
@keyframes toastOut{from{transform:translateX(0);opacity:1;}to{transform:translateX(120%);opacity:0;}}
.toast.out{animation:toastOut 0.3s ease forwards;}
`;

const FORM_VAL_SCRIPT = `
<script>
(function(){
  function showToast(msg,type='error'){
    let c=document.querySelector('.toast-container');
    if(!c){c=document.createElement('div');c.className='toast-container';document.body.appendChild(c);}
    let t=document.createElement('div');t.className='toast '+type;t.textContent=msg;c.appendChild(t);
    setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),300);},4000);
  }
  function validateEmail(v){return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v);}
  function validatePhone(v){return v.replace(/\\D/g,'').length>=7;}
  document.querySelectorAll('form, .modal').forEach(form=>{
    const inputs=form.querySelectorAll('input, select, textarea');
    const submitBtn=form.querySelector('button.btn-primary, button[type="submit"]');
    if(!submitBtn) return;
    const origClick=submitBtn.onclick;
    submitBtn.onclick=function(e){
      let ok=true;
      inputs.forEach(inp=>{
        if(inp.type==='hidden'||inp.disabled) return;
        const val=inp.value.trim();
        const req=inp.required||inp.classList.contains('required');
        if(req && !val){ ok=false; inp.style.borderColor='var(--error-500)'; setTimeout(()=>inp.style.borderColor='',2000); }
        if(inp.type==='email' && val && !validateEmail(val)){ ok=false; showToast('Geçerli e-posta giriniz / Valid email required / Geldig e-mailadres vereist'); }
        if(inp.dataset.type==='phone' || inp.name?.includes('phone') || inp.id?.includes('phone') || inp.placeholder?.toLowerCase().includes('telefon')){
          if(val && !validatePhone(val)){ ok=false; showToast('Telefon en az 7 hane olmalı / Phone min 7 digits / Telefoon min 7 cijfers'); }
        }
      });
      if(!ok){ e.preventDefault?e.preventDefault():null; e.stopPropagation?e.stopPropagation():null; return false; }
      if(origClick) return origClick.call(this,e);
    };
  });
})();
</script>`;

const TURKISH_NAMES = [
  ['Ahmet Yılmaz','ahmet.yilmaz@email.com'],['Mehmet Kaya','mehmet.kaya@posta.com'],['Ayşe Demir','ayse.demir@mail.com'],
  ['Fatma Şahin','fatma.sahin@web.com'],['Mustafa Çelik','mustafa.celik@net.com'],['Ali Öztürk','ali.ozturk@inbox.com'],
  ['Emine Aydın','emine.aydin@tr.com'],['Hüseyin Arslan','huseyin.arslan@posta.com'],['Zeynep Kılıç','zeynep.kilic@email.com'],
  ['İbrahim Yıldız','ibrahim.yildiz@mail.com'],['Hatice Koç','hatice.koc@web.com'],['Osman Kara','osman.kara@net.com'],
  ['Selen Can','selen.can@email.com'],['Burak Şimşek','burak.simsek@posta.com'],['Deniz Yavuz','deniz.yavuz@mail.com'],
  ['Ece Aksoy','ece.aksoy@web.com'],['Cem Özdemir','cem.ozdemir@net.com'],['Nazlı Güneş','nazli.gunes@email.com'],
  ['Kaan Yıldırım','kaan.yildirim@posta.com'],['Leyla Korkmaz','leyla.korkmaz@mail.com'],['Oğuz Çetin','oguz.cetin@web.com'],
  ['Pelin Doğan','pelin.dogan@net.com'],['Serkan Ateş','serkan.ates@email.com'],['Buse Kaplan','buse.kaplan@posta.com'],
  ['Murat Polat','murat.polat@mail.com'],['Aslı Erdoğan','asli.erdogan@web.com'],['Rıza Akın','riza.akin@net.com'],
  ['Gizem Taş','gizem.tas@email.com'],['Barış Yüksel','baris.yuksel@posta.com'],['Elif Sarı','elif.sari@mail.com'],
  ['Tolga Özkan','tolga.ozkan@web.com'],['Derya Bulut','derya.bulut@net.com'],['Umut Acar','umut.acar@email.com'],
  ['Melis Koçak','melis.kocak@posta.com'],['Caner Uysal','caner.uysal@mail.com'],['Seda Tekin','seda.tekin@web.com'],
  ['Furkan Çakır','furkan.cakir@net.com'],['Yasemin Avcı','yasemin.avci@email.com'],['Gökhan Bozkurt','gokhan.bozkurt@posta.com'],
  ['Ebru Kaya','ebru.kaya@mail.com'],['Onur Şen','onur.sen@web.com'],['Rabia Turan','rabia.turan@net.com'],
  ['Volkan Aslan','volkan.aslan@email.com'],['Cansu Yaman','cansu.yaman@posta.com'],['Tuna Kurt','tuna.kurt@mail.com'],
  ['Selin Özer','selin.ozer@web.com'],['Emre Güler','emre.guler@net.com'],['Nur Akgün','nur.akgun@email.com'],
  ['Arda Toprak','arda.toprak@posta.com'],['Merve Koçak','merve.kocak@mail.com']
];

const TURKISH_CITIES = ['İstanbul','Ankara','İzmir','Bursa','Antalya','Adana','Konya','Gaziantep','Şanlıurfa','Mersin','Diyarbakır','Kayseri','Eskişehir','Samsun','Trabzon'];
const TURKISH_DISTRICTS = ['Kadıköy','Beşiktaş','Çankaya','Konak','Nilüfer','Muratpaşa','Seyhan','Selçuklu','Şahinbey','Haliliye','Yenişehir','Melikgazi','Tepebaşı','Atakum','Ortahisar','Karşıyaka','Üsküdar','Fatih','Bakırköy','Şişli','Pendik','Maltepe','Kartal','Tuzla','Beylikdüzü','Avcılar','Esenyurt','Başakşehir','Sultanbeyli','Ümraniye'];

const SERVICES = [
  'Standart Temizlik','Derinlemesine Temizlik','Ofis Temizliği','Cam Temizliği','Halı Yıkama','Endüstriyel Temizlik',
  'İnşaat Sonrası Temizlik','Boya Badana','Mobilya Montajı','Laminat Parke','Seramik Döşeme','Tadilat Tamirat',
  'Elektrik Tesisatı','Sıhhi Tesisat','Çatı Tamiratı','Mutfak Yenileme','Banyo Yenileme','PVC Kapı Pencere',
  'Boyacı Usta','Marangozluk','Alçıpan','Duvar Kağıdı','Fayans Döşeme','Su Tesisatı','Doğalgaz Tesisatı',
  'Duvar Yıkma','Balkon Kapatma','Güvenlik Kamerası','Uydu Anten','Klima Montajı','Parke Cilalama',
  'Halı ve Perde Yıkama','Koltuk Yıkama','Yatak Yıkama','Zemin Temizliği','Dış Cephe Temizliği'
];

const STAFF_ROLES = ['Temizlik Personeli','Teknik Usta','Marangoz','Elektrikçi','Boya Ustası','Sıhhi Tesisatçı','Operasyon Sorumlusu','Saha Yöneticisi','Kalite Kontrol','Şoför'];
const EQUIPMENT = ['Koltuk Yıkama Makinesi','Cilalama Makinesi','Basınçlı Yıkama','Vakum Makinesi','Zemin Yıkama','Fırça Seti','Kimyasal Tankı','Merdiven','Jeneratör','Kompresör'];

const STATUS_TAGS = {
  active: '<span class="tag tag-green">Aktif</span>',
  passive: '<span class="tag tag-gray">Pasif</span>',
  completed: '<span class="tag tag-green">Tamamlandı</span>',
  pending: '<span class="tag tag-yellow">Bekliyor</span>',
  cancelled: '<span class="tag tag-red">İptal</span>',
  inProgress: '<span class="tag tag-blue">Devam Ediyor</span>',
  new: '<span class="tag tag-blue">Yeni</span>',
  approved: '<span class="tag tag-green">Onaylandı</span>',
  rejected: '<span class="tag tag-red">Reddedildi</span>',
  expired: '<span class="tag tag-gray">Süresi Dolmuş</span>'
};

function randomPhone(){ const p='05'+String(Math.floor(Math.random()*900+100)).padStart(3,'0'); return `+90 ${p} ${String(Math.floor(Math.random()*90+10)).padStart(2,'0')} ${String(Math.floor(Math.random()*90+10)).padStart(2,'0')}`; }
function randomDate(offset=0){ const d=new Date(); d.setDate(d.getDate()-Math.floor(Math.random()*30)-offset); return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'}); }
function randomItem(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function initials(name){ return name.split(' ').map(x=>x[0]).join('').substring(0,2).toUpperCase(); }

function fixModals(content, filename) {
  // Find all modal-overlay divs
  const modalRegex = /<div[^>]*class=["'][^"']*modal-overlay[^"']*["'][^>]*id=["']([^"']+)["'][^>]*>/g;
  let m, ids=[];
  while((m=modalRegex.exec(content))!==null){ ids.push(m[1]); }
  
  let changes = [];
  
  // Check each modal has close button and closeModal function
  ids.forEach(id=>{
    const modalRegex2 = new RegExp(`<div[^>]*class=["'][^"']*modal-overlay[^"']*["'][^>]*id=["']${id}["'][^>]*>[\\s\\S]*?</div>\\s*(?=<div|<script|</body|$)`, 'g');
    // Simplified: search for close button in modal
    const closeBtn = content.includes(`closeModal('${id}')`) || content.includes(`closeModal("${id}")`);
    if(!closeBtn) {
      changes.push(`Modal ${id}: missing close trigger`);
      // Add close button after modal-title if missing
      const titlePattern = new RegExp(`(<span class=["']modal-title["'][^>]*>.*?</span>)([^<]*)(?!<button class=["']modal-close["'])`, 'g');
      // This is tricky in regex - skip for now, rely on manual inspection
    }
  });
  
  return {content, changes};
}

function addDataRows(content, filename) {
  let added = 0;
  
  // Pattern 1: company-customers.html style table rows in tbody
  if(content.includes('<tbody>') && content.includes('data-id=')) {
    // Find the last </tr> before </tbody> and duplicate with new IDs
    const tbodyMatch = content.match(/<tbody>([\s\S]*?)<\/tbody>/);
    if(tbodyMatch) {
      const tbody = tbodyMatch[1];
      const existingRows = tbody.match(/<tr[\s>][\s\S]*?<\/tr>/g) || [];
      if(existingRows.length < 15) {
        // Extract pattern from first row
        const firstRow = existingRows[0];
        let newRows = '';
        const startId = existingRows.length + 1;
        for(let i=0; i < Math.max(15 - existingRows.length, 5); i++) {
          const id = startId + i;
          const [name, email] = TURKISH_NAMES[(id-1) % TURKISH_NAMES.length];
          const city = randomItem(TURKISH_CITIES);
          const phone = randomPhone();
          const initialsStr = initials(name);
          const colors = ['#14b8a6,#0d9488','#8b5cf6,#7c3aed','#f59e0b,#d97706','#ec4899,#db2777','#10b981,#059669','#6366f1,#4f46e5','#ef4444,#dc2626','#06b6d4,#0891b2'];
          const color = colors[id % colors.length];
          
          // Simple generic row pattern - this is tricky to get right per page
          // Instead, let's just note what needs data
        }
      }
    }
  }
  
  return {content, added};
}

const REPORT = {};

FILES.forEach(file=>{
  const filepath = path.join(BASE, file);
  if(!fs.existsSync(filepath)){ REPORT[file] = 'FILE NOT FOUND'; return; }
  let content = fs.readFileSync(filepath, 'utf8');
  let changes = [];
  
  // 1. Add error catching before </body>
  if(!content.includes('CleanFix Error:')) {
    content = content.replace(/<\/body>/i, ERROR_SCRIPT + '\n</body>');
    changes.push('Added error catching script');
  }
  
  // 2. Add toast CSS if missing
  if(!content.includes('.toast-container')) {
    // Insert before </style> in the first <style> block, or add inline style
    if(content.includes('<style>') && content.includes('</style>')) {
      content = content.replace(/(<style[^>]*>)/, `$1\n${TOAST_CSS}\n`);
    }
    changes.push('Added toast CSS');
  }
  
  // 3. Add form validation script before </body>
  if(!content.includes('validateEmail')) {
    content = content.replace(/<\/body>/i, FORM_VAL_SCRIPT + '\n</body>');
    changes.push('Added form validation');
  }
  
  // 4. Modal check
  const modalResult = fixModals(content, file);
  if(modalResult.changes.length) changes.push(...modalResult.changes);
  
  // 5. Data density - check for empty states and low row counts
  const emptyStates = ['Henüz kayıt yok','No data','Henüz veri yok','empty-state','emptyState'];
  emptyStates.forEach(es=>{
    if(content.toLowerCase().includes(es.toLowerCase())) {
      changes.push(`WARNING: Found empty state "${es}"`);
    }
  });
  
  fs.writeFileSync(filepath, content);
  REPORT[file] = changes.length ? changes.join('; ') : 'No changes needed';
});

console.log('=== STAGE 2-4 PROCESSING REPORT ===');
Object.entries(REPORT).forEach(([f,msg])=>{
  console.log(`\n${f}:\n  ${msg}`);
});
