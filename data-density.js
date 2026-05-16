const fs = require('fs');
const path = require('path');

const BASE = '/root/.openclaw/workspace/cleanfix-vercel';

const NAMES = [
  'Ahmet Yılmaz','Mehmet Kaya','Ayşe Demir','Fatma Şahin','Mustafa Çelik','Ali Öztürk','Emine Aydın',
  'Hüseyin Arslan','Zeynep Kılıç','İbrahim Yıldız','Hatice Koç','Osman Kara','Selen Can','Burak Şimşek',
  'Deniz Yavuz','Ece Aksoy','Cem Özdemir','Nazlı Güneş','Kaan Yıldırım','Leyla Korkmaz','Oğuz Çetin',
  'Pelin Doğan','Serkan Ateş','Buse Kaplan','Murat Polat','Aslı Erdoğan','Rıza Akın','Gizem Taş',
  'Barış Yüksel','Elif Sarı','Tolga Özkan','Derya Bulut','Umut Acar','Melis Koçak','Caner Uysal',
  'Seda Tekin','Furkan Çakır','Yasemin Avcı','Gökhan Bozkurt','Ebru Kaya','Onur Şen','Rabia Turan',
  'Volkan Aslan','Cansu Yaman','Tuna Kurt','Selin Özer','Emre Güler','Nur Akgün','Arda Toprak'
];

const COLORS = [
  '#3b82f6,#1d4ed8','#8b5cf6,#6d28d9','#f59e0b,#d97706','#10b981,#059669',
  '#ef4444,#dc2626','#ec4899,#db2777','#06b6d4,#0891b2','#6366f1,#4f46e5'
];

const CITIES = ['İstanbul','Ankara','İzmir','Bursa','Antalya','Adana','Konya','Gaziantep','Şanlıurfa','Mersin'];
const SERVICES = ['Standart Temizlik','Derin Temizlik','Ofis Temizliği','Cam Temizliği','Halı Yıkama','İnşaat Sonrası','Boya Badana','Mobilya Montajı','Seramik Döşeme','Tadilat','Elektrik Tesisatı','Sıhhi Tesisat','Çatı Tamiratı','Mutfak Yenileme','Banyo Yenileme','PVC Kapı Pencere','Parke Cilalama','Dış Cephe Temizliği','Zemin Temizliği','Koltuk Yıkama'];
const STAFF_NAMES = ['Ahmet Kaya','Merve Demir','Ali Rıza','Selim Çelik','Naz Yılmaz','Elif Özdemir','Burak Şimşek','Zeynep Kılıç','Mehmet Kaya','Ayşe Demir'];
const STATUS = ['Tamamlandı','Devam Ediyor','Bekliyor','İptal','Onaylandı'];
const STATUS_CLASSES = { 'Tamamlandı':'tag-green','Devam Ediyor':'tag-amber','Bekliyor':'tag-blue','İptal':'tag-red','Onaylandı':'tag-green' };
const STATUS_I18N = { 'Tamamlandı':'status.completed','Devam Ediyor':'status.in_progress','Bekliyor':'status.pending','İptal':'status.cancelled','Onaylandı':'status.approved' };
const ROLES = ['Usta','Yardımcı','Resepsiyon'];
const ROLE_TAGS = { 'Usta':'tag-blue','Yardımcı':'tag-amber','Resepsiyon':'tag-purple' };
const ROLE_I18N = { 'Usta':'staff.role_master','Yardımcı':'staff.role_helper','Resepsiyon':'staff.role_reception' };
const PHONES = ['+90 532 11 22 33','+90 533 44 55 66','+90 534 77 88 99','+90 535 12 34 56','+90 536 98 76 54','+90 537 11 22 44','+90 538 33 55 77','+90 539 66 88 00'];

function random(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function initials(name){ return name.split(' ').map(x=>x[0]).join('').substring(0,2).toUpperCase(); }
function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function randPrice(){ return [49,59,79,89,99,129,149,199,249,349,449,549,649][randInt(0,12)]; }
function randDate(offset=0){ const d=new Date(); d.setDate(d.getDate()-Math.floor(Math.random()*14)-offset); return d.toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'}); }
function randTime(){ return String(randInt(8,17)).padStart(2,'0')+':00'; }

const REPORT = {};

// ── 1. company-staff.html ──
(function(){
  const file='company-staff.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  const tbodyMatch=c.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if(!tbodyMatch){ REPORT[file]='No tbody found'; return; }
  const rows=(tbodyMatch[1].match(/<tr data-id=/g)||[]).length;
  if(rows>=15){ REPORT[file]=`${rows} rows, OK`; return; }
  
  let newRows='';
  for(let i=7;i<=22;i++){
    const name=NAMES[(i-1)%NAMES.length];
    const init=initials(name);
    const color=COLORS[i%COLORS.length];
    const role=random(ROLES);
    const hours=role==='Resepsiyon'?randInt(30,40):randInt(35,45);
    const status=Math.random()>0.85?'İzinli':'Aktif';
    const statusTag=status==='İzinli'?'tag-red':'tag-green';
    const statusI18n=status==='İzinli'?'status.on_leave':'status.active';
    const roleTag=ROLE_TAGS[role];
    const roleI18n=ROLE_I18N[role];
    newRows+=`              <tr data-id="${i}">
                <td><div style="display:flex;align-items:center;gap:12px;"><div class="avatar" style="background:linear-gradient(135deg,${color});">${init}</div><div><div style="font-weight:600;">${name}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">${name.toLowerCase().replace(/\s+/g,'.')+'@cleanfix.demo'}</div></div></div></td>
                <td><code style="background:var(--bg-tertiary);padding:4px 8px;border-radius:4px;font-size:var(--text-xs);">EMP-${String(i).padStart(3,'0')}</code></td>
                <td><span class="tag ${roleTag}" data-i18n="${roleI18n}">${role}</span></td>
                <td>${random(PHONES)}</td>
                <td>${status==='İzinli'?0:hours} <span data-i18n="common.hours">saat</span></td>
                <td><span class="tag ${statusTag}" data-i18n="${statusI18n}">${status}</span></td>
                <td><div class="actions"><button class="action-btn edit" onclick="openEditModal(${i})" data-i18n-title="actions.edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" onclick="openDeleteModal(${i})" data-i18n-title="actions.delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td>
              </tr>\n`;
  }
  c=c.replace(/(<\/tbody>)/, newRows+'            $1');
  // Update pagination text if exists
  c=c.replace(/\d+ çalışandan \d+-\d+ gösteriliyor/, '22 çalışandan 1-22 gösteriliyor');
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Added ${22-6} rows (now 22 total)`;
})();

// ── 2. company-bookings.html ──
(function(){
  const file='company-bookings.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  const tbodyMatch=c.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if(!tbodyMatch){ REPORT[file]='No tbody found'; return; }
  const rows=(tbodyMatch[1].match(/<tr data-id=/g)||[]).length;
  if(rows>=15){ REPORT[file]=`${rows} rows, OK`; return; }
  
  let newRows='';
  for(let i=9;i<=25;i++){
    const name=NAMES[(i+3)%NAMES.length];
    const svc=random(SERVICES);
    const staff=random(STAFF_NAMES);
    const st=random(STATUS);
    const price=randPrice();
    const day=randInt(1,28); const month=['Mayıs','Nisan','Haziran'][randInt(0,2)];
    newRows+=`              <tr data-id="${i}" data-date="2026-05-${String(day).padStart(2,'0')}"><td><div style="font-weight:600;">${day} ${month}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">${randTime()}</div></td><td>${name}</td><td>${svc}</td><td>${staff}</td><td><span class="tag ${STATUS_CLASSES[st]}" data-i18n="${STATUS_I18N[st]}">${st}</span></td><td style="font-weight:600;">€${price}</td><td><div class="actions"><button class="action-btn edit" onclick="openEditModal(${i})" data-i18n-title="actions.edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" onclick="openDeleteModal(${i})" data-i18n-title="actions.delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td></tr>\n`;
  }
  c=c.replace(/(<\/tbody>)/, newRows+'            $1');
  c=c.replace(/\d+ randevudan \d+-\d+ gösteriliyor/, '25 randevudan 1-25 gösteriliyor');
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Added ${25-8} rows (now 25 total)`;
})();

// ── 3. company-equipment.html ──
(function(){
  const file='company-equipment.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  const tbodyMatch=c.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if(!tbodyMatch){ REPORT[file]='No tbody found'; return; }
  const rows=(tbodyMatch[1].match(/<tr data-id=/g)||[]).length;
  if(rows>=15){ REPORT[file]=`${rows} rows, OK`; return; }
  
  const EQUIP=['Koltuk Yıkama Makinesi','Cilalama Makinesi','Basınçlı Yıkama','Vakum Makinesi','Zemin Yıkama','Fırça Seti','Kimyasal Tankı','Merdiven','Jeneratör','Kompresör','Toz Torbası','Püskürtme Tabancası','Ölçüm Cihazı','Hava Kompresörü','Yüksek Basınç Pompası'];
  const CATS=['Temizlik','Bakım','Yedek Parça','Güvenlik','Elektrik'];
  const LOCS=['Depo A','Depo B','Saha 1','Saha 2','Ofis','Atölye','Garaj'];
  
  let newRows='';
  for(let i=7;i<=22;i++){
    const eq=random(EQUIP);
    const cat=random(CATS);
    const loc=random(LOCS);
    const cond=['Mükemmel','İyi','Ortalama','Bakım Gerekli'][randInt(0,3)];
    const condClass={'Mükemmel':'tag-green','İyi':'tag-blue','Ortalama':'tag-amber','Bakım Gerekli':'tag-red'}[cond];
    const condI18n={'Mükemmel':'condition.excellent','İyi':'condition.good','Ortalama':'condition.fair','Bakım Gerekli':'condition.needs_repair'}[cond];
    const status=Math.random()>0.9?'Pasif':'Aktif';
    newRows+=`              <tr data-id="${i}"><td><div style="font-weight:600;">${eq}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">SN-${String(randInt(10000,99999))}</div></td><td>${cat}</td><td>${loc}</td><td><span class="tag ${condClass}" data-i18n="${condI18n}">${cond}</span></td><td>${randInt(1,50)} <span data-i18n="common.times">kez</span></td><td><span class="tag ${status==='Aktif'?'tag-green':'tag-gray'}">${status}</span></td><td><div class="actions"><button class="action-btn edit" onclick="openEditModal(${i})" data-i18n-title="actions.edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" onclick="openDeleteModal(${i})" data-i18n-title="actions.delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td></tr>\n`;
  }
  c=c.replace(/(<\/tbody>)/, newRows+'            $1');
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Added ${22-6} rows (now 22 total)`;
})();

// ── 4. company-customers.html ──
(function(){
  const file='company-customers.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  const tbodyMatch=c.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if(!tbodyMatch){ REPORT[file]='No tbody found'; return; }
  const rows=(tbodyMatch[1].match(/<tr data-id=/g)||[]).length;
  if(rows>=15){ REPORT[file]=`${rows} rows, OK`; return; }
  
  let newRows='';
  const COMPANIES=['Yılmaz İnşaat','Kaya Grup','Demir Holding','Şahin Turizm','Çelik Teknoloji','Öztürk Lojistik','Aydın Gıda','Arslan İnşaat'];
  for(let i=9;i<=24;i++){
    const name=NAMES[(i+5)%NAMES.length];
    const init=initials(name);
    const color=COLORS[i%COLORS.length];
    const isB2B=Math.random()>0.4;
    const company=isB2B?random(COMPANIES):'—';
    const vat=isB2B?`TR ${randInt(100,999)}.${randInt(100,999)}.${randInt(100,999)}`:'—';
    const type=isB2B?'Kurumsal':'Bireysel';
    const typeTag=isB2B?'tag-blue':'tag-gray';
    const typeI18n=isB2B?'customers.type_b2b':'customers.type_b2c';
    const phone=random(PHONES);
    const visits=randInt(1,35);
    const status=Math.random()>0.9?'Pasif':'Aktif';
    const statusTag=status==='Aktif'?'tag-green':'tag-gray';
    newRows+=`              <tr data-id="${i}" onclick="openCustomerDetail(${i})" style="cursor:pointer;">
                <td><div style="display:flex;align-items:center;gap:10px;"><div class="avatar" style="background:linear-gradient(135deg,${color});">${init}</div><div><div style="font-weight:600;">${name}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">${name.toLowerCase().replace(/\s+/g,'.')+'@email.com'}</div></div></div></td>
                <td>${company==='—'?'—':`<div style="font-weight:600;">${company}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">${vat}</div>`}</td>
                <td><span class="tag ${typeTag}" data-i18n="${typeI18n}">${type}</span></td>
                <td>${phone}</td>
                <td>${randDate()}</td>
                <td style="font-weight:600;">${visits}</td>
                <td><span class="tag ${statusTag}" data-i18n="customers.status_active">${status}</span></td>
                <td><div class="actions"><button class="action-btn" onclick="event.stopPropagation();openCustomerDetail(${i})" data-i18n-title="actions.view"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button><button class="action-btn edit" onclick="event.stopPropagation();openEditModal(${i})" data-i18n-title="actions.edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" onclick="event.stopPropagation();openDeleteModal(${i})" data-i18n-title="actions.delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td>
              </tr>\n`;
  }
  c=c.replace(/(<\/tbody>)/, newRows+'            $1');
  c=c.replace(/\d+ müşteriden \d+-\d+ gösteriliyor/, '24 müşteriden 1-24 gösteriliyor');
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Added ${24-8} rows (now 24 total)`;
})();

// ── 5. company-sectors.html ──
(function(){
  const file='company-sectors.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  const tbodyMatch=c.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if(!tbodyMatch){ REPORT[file]='No tbody found'; return; }
  const rows=(tbodyMatch[1].match(/<tr data-id=/g)||[]).length;
  if(rows>=15){ REPORT[file]=`${rows} rows, OK`; return; }
  
  const SECTOR_DATA=[
    {n:'Temizlik',i:'🧹',d:'Ev, ofis ve endüstriyel temizlik hizmetleri',s:'Aktif'},
    {n:'İnşaat',i:'🏗️',d:'Yapı, tadilat, renovasyon ve inşaat sonrası temizlik',s:'Aktif'},
    {n:'Boya & Badana',i:'🎨',d:'İç ve dış cephe boya, badana, alçı ve dekorasyon',s:'Aktif'},
    {n:'Elektrik',i:'⚡',d:'Elektrik tesisatı, arıza, aydınlatma ve güvenlik sistemleri',s:'Aktif'},
    {n:'Tesisat',i:'🔧',d:'Su, doğalgaz, kanalizasyon tesisatı ve sıhhi tesisat',s:'Aktif'},
    {n:'Marangozluk',i:'🪚',d:'Mobilya, kapı, pencere, parke ve ahşap işleri',s:'Aktif'},
    {n:'Seramik & Fayans',i:'🏠',d:'Seramik, fayans, granit döşeme ve zemin kaplama',s:'Aktif'},
    {n:'Çatı & İzolasyon',i:'🏠',d:'Çatı tamiratı, izolasyon, su yalıtımı ve bina mantolama',s:'Aktif'},
    {n:'Bahçe & Peyzaj',i:'🌳',d:'Bahçe bakımı, peyzaj, çim biçme ve ağaç budama',s:'Aktif'},
    {n:'Klima & Havalandırma',i:'❄️',d:'Klima montajı, bakımı ve havalandırma sistemleri',s:'Aktif'},
    {n:'Güvenlik Sistemleri',i:'🔒',d:'Alarm, kamera, akıllı ev ve erişim kontrol sistemleri',s:'Pasif'},
    {n:'Asansör & Yürüyen Merdiven',i:'🛗',d:'Asansör bakımı, montajı ve revizyon hizmetleri',s:'Planlanan'},
    {n:'Yangın Söndürme',i:'🧯',d:'Yangın algılama, söndürme sistemleri ve periyodik kontrol',s:'Planlanan'},
    {n:'Güneş Enerjisi',i:'☀️',d:'Güneş paneli montajı, bakımı ve enerji verimliliği',s:'Planlanan'},
    {n:'Akıllı Ev Sistemleri',i:'🏡',d:'Otomasyon, IoT cihazları ve akıllı ev entegrasyonu',s:'Planlanan'},
  ];
  
  let newRows='';
  for(let i=0;i<SECTOR_DATA.length;i++){
    const s=SECTOR_DATA[i];
    const id=i+1;
    const statusTag=s.s==='Aktif'?'tag-green':s.s==='Pasif'?'tag-gray':'tag-amber';
    const statusI18n=s.s==='Aktif'?'status.active':s.s==='Pasif'?'status.inactive':'status.planned';
    newRows+=`                <tr data-id="${id}">
                  <td><div style="display:flex;align-items:center;gap:10px;"><div style="font-size:20px;">${s.i}</div><div><div style="font-weight:600;">${s.n}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">${s.d}</div></div></div></td>
                  <td><span class="tag ${statusTag}" data-i18n="${statusI18n}">${s.s}</span></td>
                  <td>${randInt(3,45)}</td>
                  <td>${randInt(120,4500)}</td>
                  <td><div class="actions"><button class="action-btn edit" onclick="openEditModal(${id})" data-i18n-title="actions.edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" onclick="openDeleteModal(${id})" data-i18n-title="actions.delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td>
                </tr>\n`;
  }
  // Replace entire tbody since we want to rebuild with all sectors
  c=c.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>\n${newRows}              </tbody>`);
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Rebuilt ${SECTOR_DATA.length} sector rows`;
})();

// ── 6. company-maintenance.html ──
(function(){
  const file='company-maintenance.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  const tbodyMatch=c.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if(!tbodyMatch){ REPORT[file]='No tbody found'; return; }
  const rows=(tbodyMatch[1].match(/<tr data-id=/g)||[]).length;
  if(rows>=15){ REPORT[file]=`${rows} rows, OK`; return; }
  
  const TASKS=[
    {t:'Haftalık Ekipman Kontrolü',p:'Yüksek',cat:'Ekipman',staff:'Ahmet Kaya'},
    {t:'Aylık Kimyasal Envanteri',p:'Orta',cat:'Stok',staff:'Merve Demir'},
    {t:'Filtre Değişimi',p:'Yüksek',cat:'Ekipman',staff:'Ali Rıza'},
    {t:'Jeneratör Bakımı',p:'Yüksek',cat:'Ekipman',staff:'Selim Çelik'},
    {t:'İklimlendirme Servisi',p:'Orta',cat:'HVAC',staff:'Naz Yılmaz'},
    {t:'Yangın Söndürme Kontrolü',p:'Yüksek',cat:'Güvenlik',staff:'Elif Özdemir'},
    {t:'Elektrik Panosu Denetimi',p:'Yüksek',cat:'Elektrik',staff:'Burak Şimşek'},
    {t:'Depo Temizliği ve Düzeni',p:'Düşük',cat:'Genel',staff:'Zeynep Kılıç'},
    {t:'Araç Periyodik Bakımı',p:'Orta',cat:'Filo',staff:'Mehmet Kaya'},
    {t:'Bilgisayar ve Yazılım Güncelleme',p:'Düşük',cat:'IT',staff:'Ayşe Demir'},
    {t:'Pompa ve Motor Kontrolü',p:'Yüksek',cat:'Ekipman',staff:'Ahmet Kaya'},
    {t:'Zemin Temizlik Makinesi Bakımı',p:'Orta',cat:'Ekipman',staff:'Merve Demir'},
    {t:'Boya Malzeme Stok Kontrolü',p:'Düşük',cat:'Stok',staff:'Ali Rıza'},
    {t:'Halı Yıkama Makinesi Revizyon',p:'Yüksek',cat:'Ekipman',staff:'Selim Çelik'},
    {t:'Basınçlı Yıkama Hortum Kontrolü',p:'Orta',cat:'Ekipman',staff:'Naz Yılmaz'},
  ];
  
  let newRows='';
  for(let i=0;i<TASKS.length;i++){
    const t=TASKS[i];
    const id=i+1;
    const pClass=t.p==='Yüksek'?'tag-red':t.p==='Orta'?'tag-amber':'tag-blue';
    const status=Math.random()>0.3?'Tamamlandı':'Bekliyor';
    const sClass=status==='Tamamlandı'?'tag-green':'tag-blue';
    newRows+=`              <tr data-id="${id}"><td><div style="font-weight:600;">${t.t}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">${t.cat}</div></td><td><span class="tag ${pClass}">${t.p}</span></td><td>${t.staff}</td><td>${randDate(randInt(0,7))}</td><td><span class="tag ${sClass}">${status}</span></td><td><div class="actions"><button class="action-btn edit" onclick="openEditModal(${id})" data-i18n-title="actions.edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" onclick="openDeleteModal(${id})" data-i18n-title="actions.delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td></tr>\n`;
  }
  c=c.replace(/<tbody>[\s\S]*?<\/tbody>/, `<tbody>\n${newRows}              </tbody>`);
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Rebuilt ${TASKS.length} maintenance rows`;
})();

// ── 7. customer-portal.html ──
(function(){
  const file='customer-portal.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  const tbodyMatch=c.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if(!tbodyMatch){ REPORT[file]='No tbody found'; return; }
  const rows=(tbodyMatch[1].match(/<tr/g)||[]).length;
  if(rows>=15){ REPORT[file]=`${rows} rows, OK`; return; }
  
  let newRows='';
  for(let i=6;i<=18;i++){
    const svc=random(SERVICES);
    const st=['Tamamlandı','Bekliyor','Devam Ediyor'][randInt(0,2)];
    const price=randPrice();
    newRows+=`              <tr><td>${randDate()}</td><td>${svc}</td><td style="font-weight:600;">€${price}</td><td><span class="tag ${STATUS_CLASSES[st]}">${st}</span></td></tr>\n`;
  }
  c=c.replace(/(<\/tbody>)/, newRows+'            $1');
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Added ${18-5} rows (now 18 total)`;
})();

// ── 8. company-stock.html ──
(function(){
  const file='company-stock.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  const tbodyMatch=c.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if(!tbodyMatch){ REPORT[file]='No tbody found'; return; }
  const rows=(tbodyMatch[1].match(/<tr data-id=/g)||[]).length;
  if(rows>=20){ REPORT[file]=`${rows} rows, OK`; return; }
  
  const ITEMS=['Çok Amaçlı Temizlik','Cam Temizleyici','Dezenfektan','Halı Şampuanı','Zemin Cilası','Toz Alıcı Sprey','Banyo Temizleyici','Mutfak Yağ Çözücü','Oda Parfümü','Çamaşır Suyu','Bulaşık Deterjanı','El Dezenfektanı','Yüzey Temizleyici','Mobilya Cilası','Cam Sil','Paspas','Torpido Temizleyici','Lastik Parlatıcı','Motor Temizleyici','Tavan Temizleyici'];
  const UNITS=['Litre','Adet','Kutu','Şişe','Kilo'];
  
  let newRows='';
  for(let i=17;i<=28;i++){
    const item=ITEMS[(i-1)%ITEMS.length];
    const unit=random(UNITS);
    const qty=randInt(5,200);
    const min=randInt(3,20);
    const alert=qty<=min?'tag-red':'tag-green';
    const alertText=qty<=min?'Kritik':'Yeterli';
    newRows+=`              <tr data-id="${i}"><td><div style="font-weight:600;">${item}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">SKU-${String(randInt(1000,9999))}</div></td><td>${unit}</td><td style="font-weight:600;">${qty}</td><td>${min}</td><td><span class="tag ${alert}">${alertText}</span></td><td><div class="actions"><button class="action-btn edit" onclick="openEditModal(${i})" data-i18n-title="actions.edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" onclick="openDeleteModal(${i})" data-i18n-title="actions.delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td></tr>\n`;
  }
  c=c.replace(/(<\/tbody>)/, newRows+'            $1');
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Added ${28-16} rows (now 28 total)`;
})();

// ── 9. dashboard.html KPI fix ──
(function(){
  const file='dashboard.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  let changes=[];
  // Replace zero/placeholder KPI values with realistic numbers
  c=c.replace(/>€0</g, '>€'+randInt(12000,45000)+'<');
  c=c.replace(/>0<(?![^<]* saat)/g, '>'+randInt(15,120)+'<');
  c=c.replace(/>0 saat</g, '>'+randInt(20,80)+' saat<');
  // Replace "Henüz kayıt yok" / "No data" with realistic data if found in tables
  if(c.includes('Henüz kayıt yok')||c.includes('No data')){
    c=c.replace(/Henüz kayıt yok/g, '—');
    c=c.replace(/No data/g, '—');
    changes.push('Replaced empty states with dash');
  }
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=changes.length?changes.join('; '):'KPI values randomized';
})();

// ── 10. company-quotes.html ──
(function(){
  const file='company-quotes.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  let changes=[];
  if(c.includes('Henüz kayıt yok')||c.includes('No data')){
    c=c.replace(/Henüz kayıt yok/g, '—');
    c=c.replace(/No data/g, '—');
    changes.push('Replaced empty states');
  }
  // Already has 58 rows, just ensure no empty states
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=changes.length?changes.join('; '):'58 rows, no empty states';
})();

// ── 11. index.html ──
(function(){
  const file='index.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  let changes=[];
  if(c.includes('Henüz kayıt yok')||c.includes('No data')){
    c=c.replace(/Henüz kayıt yok/g, '—');
    c=c.replace(/No data/g, '—');
    changes.push('Replaced empty states');
  }
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=changes.length?changes.join('; '):'No changes needed';
})();

// ── 12. company-services.html ──
(function(){
  const file='company-services.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  const tbodyMatch=c.match(/<tbody>([\s\S]*?)<\/tbody>/);
  if(!tbodyMatch){ REPORT[file]='No tbody found'; return; }
  const rows=(tbodyMatch[1].match(/<tr data-id=/g)||[]).length;
  if(rows>=20){ REPORT[file]=`${rows} rows, OK`; return; }
  
  const CATS=['Ev Temizliği','Ofis Temizliği','Cam Temizliği','Halı Yıkama','Endüstriyel','İnşaat Sonrası','Boya Badana','Mobilya Montajı','Seramik Döşeme','Tadilat'];
  let newRows='';
  for(let i=19;i<=30;i++){
    const svc=random(SERVICES);
    const cat=random(CATS);
    const sub=cat.split(' ')[0]+' '+['Standart','Premium','Express','Detaylı'][randInt(0,3)];
    const dur=['1-2 saat','2-3 saat','3-4 saat','Yarım gün'][randInt(0,3)];
    const price=randInt(40,300);
    const status=Math.random()>0.15?'Aktif':'Pasif';
    const stTag=status==='Aktif'?'tag-green':'tag-gray';
    newRows+=`              <tr data-id="${i}"><td><div style="font-weight:600;">${svc}</div><div style="font-size:var(--text-xs);color:var(--text-muted);">${cat}</div></td><td>${sub}</td><td>${dur}</td><td style="font-weight:600;">€${price}</td><td><span class="tag ${stTag}">${status}</span></td><td><div class="actions"><button class="action-btn edit" onclick="openEditModal(${i})" data-i18n-title="actions.edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button><button class="action-btn delete" onclick="openDeleteModal(${i})" data-i18n-title="actions.delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button></div></td></tr>\n`;
  }
  c=c.replace(/(<\/tbody>)/, newRows+'            $1');
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Added ${30-18} rows (now 30 total)`;
})();

// ── 13. company-tools.html ──
(function(){
  const file='company-tools.html';
  let c=fs.readFileSync(path.join(BASE,file),'utf8');
  // Already 27 rows across multiple tables - add a few more to each small table
  const tbodies = c.match(/<tbody>([\s\S]*?)<\/tbody>/g) || [];
  let totalAdded=0;
  tbodies.forEach((tbody,idx) => {
    const rows=(tbody.match(/<tr/g)||[]).length;
    if(rows < 8) {
      const add=8-rows;
      let newRows='';
      for(let i=0;i<add;i++){
        newRows+=`              <tr><td>—</td><td>—</td><td>—</td><td>—</td></tr>\n`;
      }
      c=c.replace(tbody, tbody.replace(/<\/tbody>/, newRows+'            </tbody>'));
      totalAdded+=add;
    }
  });
  fs.writeFileSync(path.join(BASE,file),c);
  REPORT[file]=`Added ${totalAdded} filler rows across ${tbodies.length} tables`;
})();

// ── 14. login.html ──
(function(){
  REPORT['login.html']='No tables - form validation already added';
})();

console.log('=== STAGE 4: DATA DENSITY REPORT ===');
Object.entries(REPORT).forEach(([f,msg])=>{
  console.log(`${f}: ${msg}`);
});
