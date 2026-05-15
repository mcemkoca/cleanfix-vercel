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

// Translation dictionary
const dict = {
  'Kaydet':{en:'Save',nl:'Opslaan'},'İptal':{en:'Cancel',nl:'Annuleren'},'Ekle':{en:'Add',nl:'Toevoegen'},
  'Düzenle':{en:'Edit',nl:'Bewerken'},'Sil':{en:'Delete',nl:'Verwijderen'},'Ara':{en:'Search',nl:'Zoeken'},
  'Filtrele':{en:'Filter',nl:'Filteren'},'Sıfırla':{en:'Reset',nl:'Resetten'},'Uygula':{en:'Apply',nl:'Toepassen'},
  'Kapat':{en:'Close',nl:'Sluiten'},'Onayla':{en:'Confirm',nl:'Bevestigen'},'Vazgeç':{en:'Abort',nl:'Afbreken'},
  'Geri':{en:'Back',nl:'Terug'},'İleri':{en:'Next',nl:'Volgende'},'Yeni':{en:'New',nl:'Nieuw'},
  'Oluştur':{en:'Create',nl:'Aanmaken'},'Güncelle':{en:'Update',nl:'Bijwerken'},'Yükle':{en:'Upload',nl:'Uploaden'},
  'İndir':{en:'Download',nl:'Downloaden'},'Yazdır':{en:'Print',nl:'Afdrukken'},'Gönder':{en:'Send',nl:'Versturen'},
  'Kopyala':{en:'Copy',nl:'Kopiëren'},'Yenile':{en:'Refresh',nl:'Vernieuwen'},'Dışa Aktar':{en:'Export',nl:'Exporteren'},
  'İçe Aktar':{en:'Import',nl:'Importeren'},'Seç':{en:'Select',nl:'Selecteren'},'Tümünü Seç':{en:'Select All',nl:'Alles Selecteren'},
  'Temizle':{en:'Clear',nl:'Wissen'},'Detaylar':{en:'Details',nl:'Details'},'Görüntüle':{en:'View',nl:'Bekijken'},
  'İşlemler':{en:'Actions',nl:'Acties'},'Durum':{en:'Status',nl:'Status'},'Tarih':{en:'Date',nl:'Datum'},
  'Saat':{en:'Time',nl:'Tijd'},'Tarihçe':{en:'History',nl:'Geschiedenis'},'Notlar':{en:'Notes',nl:'Notities'},
  'Açıklama':{en:'Description',nl:'Beschrijving'},'Adet':{en:'Quantity',nl:'Aantal'},'Fiyat':{en:'Price',nl:'Prijs'},
  'Tutar':{en:'Amount',nl:'Bedrag'},'Toplam':{en:'Total',nl:'Totaal'},'KDV':{en:'VAT',nl:'BTW'},
  'İskonto':{en:'Discount',nl:'Korting'},'Para Birimi':{en:'Currency',nl:'Valuta'},'Ödeme':{en:'Payment',nl:'Betaling'},
  'Ödenen':{en:'Paid',nl:'Betaald'},'Kalan':{en:'Remaining',nl:'Resterend'},'Geçmiş':{en:'Past',nl:'Verleden'},
  'Bugün':{en:'Today',nl:'Vandaag'},'Yarın':{en:'Tomorrow',nl:'Morgen'},'Bu Hafta':{en:'This Week',nl:'Deze Week'},
  'Bu Ay':{en:'This Month',nl:'Deze Maand'},'Bu Yıl':{en:'This Year',nl:'Dit Jaar'},
  'Son 7 Gün':{en:'Last 7 Days',nl:'Laatste 7 Dagen'},'Son 30 Gün':{en:'Last 30 Days',nl:'Laatste 30 Dagen'},
  'Başlangıç':{en:'Start',nl:'Start'},'Bitiş':{en:'End',nl:'Einde'},'Sırala':{en:'Sort',nl:'Sorteren'},
  'Artan':{en:'Ascending',nl:'Oplopend'},'Azalan':{en:'Descending',nl:'Aflopend'},'Sayfa':{en:'Page',nl:'Pagina'},
  'Sayfa başına':{en:'Per page',nl:'Per pagina'},'Gösteriliyor':{en:'Showing',nl:'Toont'},'kayıt':{en:'records',nl:'records'},
  'sonuç':{en:'results',nl:'resultaten'},'Bulunan':{en:'Found',nl:'Gevonden'},
  'Hiç kayıt bulunamadı':{en:'No records found',nl:'Geen records gevonden'},'Veri yok':{en:'No data',nl:'Geen gegevens'},
  'Yükleniyor...':{en:'Loading...',nl:'Laden...'},'Başarılı':{en:'Success',nl:'Succes'},'Hata':{en:'Error',nl:'Fout'},
  'Uyarı':{en:'Warning',nl:'Waarschuwing'},'Bilgi':{en:'Info',nl:'Info'},'Onay':{en:'Confirm',nl:'Bevestiging'},
  'Emin misiniz?':{en:'Are you sure?',nl:'Weet u het zeker?'},
  'Bu işlem geri alınamaz':{en:'This action cannot be undone',nl:'Deze actie kan niet ongedaan worden gemaakt'},
  'Silme işlemini onaylayın':{en:'Confirm deletion',nl:'Bevestig verwijdering'},'Evet, sil':{en:'Yes, delete',nl:'Ja, verwijderen'},
  'Hayır, vazgeç':{en:'No, cancel',nl:'Nee, annuleren'},
  'Değişiklikler kaydedilsin mi?':{en:'Save changes?',nl:'Wijzigingen opslaan?'},
  'Henüz kaydedilmemiş değişiklikler var':{en:'There are unsaved changes',nl:'Er zijn niet-opgeslagen wijzigingen'},
  'Lütfen tüm zorunlu alanları doldurun':{en:'Please fill in all required fields',nl:'Vul alle verplichte velden in'},
  'Geçersiz e-posta adresi':{en:'Invalid email address',nl:'Ongeldig e-mailadres'},
  'Şifre en az 6 karakter olmalı':{en:'Password must be at least 6 characters',nl:'Wachtwoord moet minimaal 6 tekens bevatten'},
  'Telefon numarası geçersiz':{en:'Invalid phone number',nl:'Ongeldig telefoonnummer'},
  'Geçersiz değer':{en:'Invalid value',nl:'Ongeldige waarde'},'Zorunlu alan':{en:'Required field',nl:'Verplicht veld'},
  'Min':{en:'Min',nl:'Min'},'Max':{en:'Max',nl:'Max'},'Karakter limiti':{en:'Character limit',nl:'Tekenlimiet'},
  'Dosya çok büyük':{en:'File too large',nl:'Bestand te groot'},
  'Geçersiz dosya formatı':{en:'Invalid file format',nl:'Ongeldig bestandsformaat'},
  'Maksimum dosya boyutu':{en:'Maximum file size',nl:'Maximale bestandsgrootte'},
  'İzin verilen formatlar':{en:'Allowed formats',nl:'Toegestane formaten'},
  'Dashboard':{en:'Dashboard',nl:'Dashboard'},'Ana Sayfa':{en:'Home',nl:'Home'},'Geri Dön':{en:'Go Back',nl:'Ga Terug'},
  'Çıkış Yap':{en:'Logout',nl:'Uitloggen'},'Profil':{en:'Profile',nl:'Profiel'},'Ayarlar':{en:'Settings',nl:'Instellingen'},
  'Bildirimler':{en:'Notifications',nl:'Meldingen'},'Mesajlar':{en:'Messages',nl:'Berichten'},'Yardım':{en:'Help',nl:'Help'},
  'Destek':{en:'Support',nl:'Ondersteuning'},'Belgeler':{en:'Documents',nl:'Documenten'},'Raporlar':{en:'Reports',nl:'Rapporten'},
  'Müşteri':{en:'Customer',nl:'Klant'},'Müşteriler':{en:'Customers',nl:'Klanten'},'Firma':{en:'Company',nl:'Bedrijf'},
  'Firmalar':{en:'Companies',nl:'Bedrijven'},'Personel':{en:'Staff',nl:'Personeel'},'Çalışan':{en:'Employee',nl:'Werknemer'},
  'Çalışanlar':{en:'Employees',nl:'Werknemers'},'Kullanıcı':{en:'User',nl:'Gebruiker'},'Kullanıcılar':{en:'Users',nl:'Gebruikers'},
  'Hizmet':{en:'Service',nl:'Dienst'},'Hizmetler':{en:'Services',nl:'Diensten'},'Ürün':{en:'Product',nl:'Product'},
  'Ürünler':{en:'Products',nl:'Producten'},'Stok':{en:'Stock',nl:'Voorraad'},'Envanter':{en:'Inventory',nl:'Inventaris'},
  'Ekipman':{en:'Equipment',nl:'Apparatuur'},'Ekipmanlar':{en:'Equipment',nl:'Apparatuur'},'Araç':{en:'Vehicle',nl:'Voertuig'},
  'Araçlar':{en:'Vehicles',nl:'Voertuigen'},'Randevu':{en:'Appointment',nl:'Afspraak'},'Randevular':{en:'Appointments',nl:'Afspraken'},
  'Rezervasyon':{en:'Reservation',nl:'Reservering'},'Fatura':{en:'Invoice',nl:'Factuur'},'Faturalar':{en:'Invoices',nl:'Facturen'},
  'Teklif':{en:'Quote',nl:'Offerte'},'Teklifler':{en:'Quotes',nl:'Offertes'},'Sipariş':{en:'Order',nl:'Bestelling'},
  'Siparişler':{en:'Orders',nl:'Bestellingen'},'Proje':{en:'Project',nl:'Project'},'Projeler':{en:'Projects',nl:'Projecten'},
  'Görev':{en:'Task',nl:'Taak'},'Görevler':{en:'Tasks',nl:'Taken'},'Bakım':{en:'Maintenance',nl:'Onderhoud'},
  'Bakımlar':{en:'Maintenances',nl:'Onderhoudsbeurten'},'Arıza':{en:'Fault',nl:'Storing'},'Arızalar':{en:'Faults',nl:'Storingen'},
  'Talep':{en:'Request',nl:'Verzoek'},'Talepler':{en:'Requests',nl:'Verzoeken'},'Ticket':{en:'Ticket',nl:'Ticket'},
  'Ticketler':{en:'Tickets',nl:'Tickets'},'Sektör':{en:'Sector',nl:'Sector'},'Sektörler':{en:'Sectors',nl:'Sectoren'},
  'Kategori':{en:'Category',nl:'Categorie'},'Kategoriler':{en:'Categories',nl:'Categorieën'},'Etiket':{en:'Tag',nl:'Label'},
  'Etiketler':{en:'Tags',nl:'Labels'},'Birim':{en:'Unit',nl:'Eenheid'},'Birimler':{en:'Units',nl:'Eenheden'},
  'Lokasyon':{en:'Location',nl:'Locatie'},'Lokasyonlar':{en:'Locations',nl:'Locaties'},'Adres':{en:'Address',nl:'Adres'},
  'Adresler':{en:'Addresses',nl:'Adressen'},'Telefon':{en:'Phone',nl:'Telefoon'},'E-posta':{en:'Email',nl:'E-mail'},
  'İsim':{en:'Name',nl:'Naam'},'Soyisim':{en:'Surname',nl:'Achternaam'},'Tam İsim':{en:'Full Name',nl:'Volledige Naam'},
  'Ünvan':{en:'Title',nl:'Titel'},'Pozisyon':{en:'Position',nl:'Positie'},'Departman':{en:'Department',nl:'Afdeling'},
  'Rol':{en:'Role',nl:'Rol'},'Yetki':{en:'Permission',nl:'Toestemming'},'Yetkiler':{en:'Permissions',nl:'Toestemmingen'},
  'Aktif':{en:'Active',nl:'Actief'},'Pasif':{en:'Inactive',nl:'Inactief'},'Beklemede':{en:'Pending',nl:'In Afwachting'},
  'Onaylandı':{en:'Approved',nl:'Goedgekeurd'},'Reddedildi':{en:'Rejected',nl:'Afgewezen'},'Tamamlandı':{en:'Completed',nl:'Voltooid'},
  'İptal Edildi':{en:'Cancelled',nl:'Geannuleerd'},'Devam Ediyor':{en:'In Progress',nl:'In Uitvoering'},
  'Planlandı':{en:'Planned',nl:'Gepland'},'Gecikti':{en:'Delayed',nl:'Vertraagd'},'Acil':{en:'Urgent',nl:'Urgent'},
  'Yüksek':{en:'High',nl:'Hoog'},'Orta':{en:'Medium',nl:'Gemiddeld'},'Düşük':{en:'Low',nl:'Laag'},'Normal':{en:'Normal',nl:'Normaal'},
  'Öncelik':{en:'Priority',nl:'Prioriteit'},'Önem':{en:'Importance',nl:'Belang'},'Puan':{en:'Score',nl:'Score'},
  'Değerlendirme':{en:'Rating',nl:'Beoordeling'},'Yorum':{en:'Comment',nl:'Opmerking'},'Yorumlar':{en:'Comments',nl:'Opmerkingen'},
  'İnceleme':{en:'Review',nl:'Recensie'},'İncelemeler':{en:'Reviews',nl:'Recensies'},
  'Değerlendirmeler':{en:'Reviews',nl:'Beoordelingen'},'Geri Bildirim':{en:'Feedback',nl:'Feedback'},
  'Anket':{en:'Survey',nl:'Enquête'},'Oylama':{en:'Poll',nl:'Peiling'},'Ortalama':{en:'Average',nl:'Gemiddelde'},
  'Genel Puan':{en:'Overall Score',nl:'Algemene Score'},'Yıldız':{en:'Star',nl:'Ster'},'Yıldızlar':{en:'Stars',nl:'Sterren'},
  '5 Yıldız':{en:'5 Stars',nl:'5 Sterren'},'1-5 arası':{en:'1 to 5',nl:'1 tot 5'},'Metrik':{en:'Metric',nl:'Metriek'},
  'Metrikler':{en:'Metrics',nl:'Metrieken'},'Gösterge':{en:'Indicator',nl:'Indicator'},'Göstergeler':{en:'Indicators',nl:'Indicatoren'},
  'Performans':{en:'Performance',nl:'Prestatie'},'Verimlilik':{en:'Efficiency',nl:'Efficiëntie'},'Kalite':{en:'Quality',nl:'Kwaliteit'},
  'Kalite Kontrol':{en:'Quality Control',nl:'Kwaliteitscontrole'},'Kontrol':{en:'Control',nl:'Controle'},
  'Denetim':{en:'Audit',nl:'Audit'},'Denetimler':{en:'Audits',nl:'Audits'},'Rapor':{en:'Report',nl:'Rapport'},
  'Raporlar':{en:'Reports',nl:'Rapporten'},'Günlük Rapor':{en:'Daily Report',nl:'Dagelijks Rapport'},
  'Haftalık Rapor':{en:'Weekly Report',nl:'Wekelijks Rapport'},'Aylık Rapor':{en:'Monthly Report',nl:'Maandelijks Rapport'},
  'Yıllık Rapor':{en:'Annual Report',nl:'Jaarlijks Rapport'},'Özet':{en:'Summary',nl:'Samenvatting'},
  'Genel Bakış':{en:'Overview',nl:'Overzicht'},'İstatistik':{en:'Statistic',nl:'Statistiek'},
  'İstatistikler':{en:'Statistics',nl:'Statistieken'},'Grafik':{en:'Chart',nl:'Grafiek'},'Grafikler':{en:'Charts',nl:'Grafieken'},
  'Tablo':{en:'Table',nl:'Tabel'},'Tablolar':{en:'Tables',nl:'Tabellen'},'Liste':{en:'List',nl:'Lijst'},
  'Listeler':{en:'Lists',nl:'Lijsten'},'Kart':{en:'Card',nl:'Kaart'},'Kartlar':{en:'Cards',nl:'Kaarten'},
  'Kolon':{en:'Column',nl:'Kolom'},'Kolonlar':{en:'Columns',nl:'Kolommen'},'Satır':{en:'Row',nl:'Rij'},
  'Satırlar':{en:'Rows',nl:'Rijen'},'Hücre':{en:'Cell',nl:'Cel'},'Sütun':{en:'Column',nl:'Kolom'},
  'Sütunlar':{en:'Columns',nl:'Kolommen'},'Hoş Geldiniz':{en:'Welcome',nl:'Welkom'},'Günaydın':{en:'Good Morning',nl:'Goedemorgen'},
  'İyi Günler':{en:'Good Afternoon',nl:'Goedemiddag'},'İyi Akşamlar':{en:'Good Evening',nl:'Goedenavond'},
  'Son aktiviteler':{en:'Recent activities',nl:'Recente activiteiten'},'Hızlı erişim':{en:'Quick access',nl:'Snelle toegang'},
  'Kısayollar':{en:'Shortcuts',nl:'Snelkoppelingen'},'Analiz':{en:'Analytics',nl:'Analyse'},'Gelir':{en:'Revenue',nl:'Omzet'},
  'Gider':{en:'Expense',nl:'Uitgave'},'Giderler':{en:'Expenses',nl:'Uitgaven'},'Kar':{en:'Profit',nl:'Winst'},
  'Zarar':{en:'Loss',nl:'Verlies'},'Net Kar':{en:'Net Profit',nl:'Nettowinst'},'Ciroyu Artır':{en:'Increase Revenue',nl:'Omzet Vergroten'},
  'Maliyet Düşür':{en:'Reduce Costs',nl:'Kosten Verminderen'},'Verimlilik Artır':{en:'Increase Efficiency',nl:'Efficiëntie Vergroten'},
  'Müşteri Memnuniyeti':{en:'Customer Satisfaction',nl:'Klanttevredenheid'},'Memnuniyet':{en:'Satisfaction',nl:'Tevredenheid'},
  'Sadakat':{en:'Loyalty',nl:'Loyaliteit'},'Sadakat Puanı':{en:'Loyalty Score',nl:'Loyaliteitsscore'},
  'Kazan':{en:'Earn',nl:'Verdienen'},'Kullan':{en:'Use',nl:'Gebruiken'},'Bakiye':{en:'Balance',nl:'Saldo'},
  'Puan Bakiyesi':{en:'Point Balance',nl:'Puntensaldo'},'Geçmiş Bakiye':{en:'Past Balance',nl:'Verleden Saldo'},
  'Müşteri Portalı':{en:'Customer Portal',nl:'Klantenportal'},'Portal':{en:'Portal',nl:'Portal'},
  'Hesabım':{en:'My Account',nl:'Mijn Account'},'Siparişlerim':{en:'My Orders',nl:'Mijn Bestellingen'},
  'Faturalarım':{en:'My Invoices',nl:'Mijn Facturen'},'Randevularım':{en:'My Appointments',nl:'Mijn Afspraken'},
  'Profilim':{en:'My Profile',nl:'Mijn Profiel'},'Ayarlarım':{en:'My Settings',nl:'Mijn Instellingen'},
  'Bildirimlerim':{en:'My Notifications',nl:'Mijn Meldingen'},'Mesajlarım':{en:'My Messages',nl:'Mijn Berichten'},
  'Taleplerim':{en:'My Requests',nl:'Mijn Verzoeken'},'Yorumlarım':{en:'My Reviews',nl:'Mijn Recensies'},
  'Puanlarım':{en:'My Scores',nl:'Mijn Scores'},'CleanFix':{en:'CleanFix',nl:'CleanFix'},'CleanFix BV':{en:'CleanFix BV',nl:'CleanFix BV'},
  'Deuterium12{MCK}':{en:'Deuterium12{MCK}',nl:'Deuterium12{MCK}'},'Vercel Edge':{en:'Vercel Edge',nl:'Vercel Edge'},
  'API':{en:'API',nl:'API'},'URL':{en:'URL',nl:'URL'},'ID':{en:'ID',nl:'ID'},'Kodu':{en:'Code',nl:'Code'},
  'No':{en:'No.',nl:'Nr.'},'Ref':{en:'Ref',nl:'Ref'},'SKU':{en:'SKU',nl:'SKU'},'Barkod':{en:'Barcode',nl:'Barcode'},
  'Seri No':{en:'Serial No',nl:'Serienummer'},'Model':{en:'Model',nl:'Model'},'Marka':{en:'Brand',nl:'Merk'},
  'Üretici':{en:'Manufacturer',nl:'Fabrikant'},'Tedarikçi':{en:'Supplier',nl:'Leverancier'},
  'Tedarikçiler':{en:'Suppliers',nl:'Leveranciers'},'Distribütör':{en:'Distributor',nl:'Distributeur'},
  'Satıcı':{en:'Seller',nl:'Verkoper'},'Alıcı':{en:'Buyer',nl:'Koper'},
  'Müşteri Temsilcisi':{en:'Account Manager',nl:'Accountmanager'},'Sorumlu':{en:'Responsible',nl:'Verantwoordelijke'},
  'Atanan':{en:'Assigned',nl:'Toegewezen'},'Oluşturan':{en:'Created By',nl:'Aangemaakt Door'},
  'Oluşturma Tarihi':{en:'Created Date',nl:'Aanmaakdatum'},'Güncelleyen':{en:'Updated By',nl:'Bijgewerkt Door'},
  'Güncelleme Tarihi':{en:'Updated Date',nl:'Bijwerkdatum'},'Son Güncelleme':{en:'Last Updated',nl:'Laatst Bijgewerkt'},
  'Bitiş Tarihi':{en:'End Date',nl:'Einddatum'},'Başlangıç Tarihi':{en:'Start Date',nl:'Startdatum'},
  'Teslim Tarihi':{en:'Delivery Date',nl:'Leverdatum'},'Son Teslim':{en:'Deadline',nl:'Deadline'},
  'Teklif Tarihi':{en:'Quote Date',nl:'Offertedatum'},'Geçerlilik Tarihi':{en:'Valid Until',nl:'Geldig Tot'},
  'Fatura Tarihi':{en:'Invoice Date',nl:'Factuurdatum'},'Ödeme Tarihi':{en:'Payment Date',nl:'Betalingsdatum'},
  'Son Ödeme':{en:'Due Date',nl:'Vervaldatum'},'Vade':{en:'Term',nl:'Termijn'},'Gecikme':{en:'Delay',nl:'Vertraging'},
  'Gecikme Cezası':{en:'Late Fee',nl:'Achterstallige Boete'},'Faiz':{en:'Interest',nl:'Rente'},
  'Peşin':{en:'Cash',nl:'Contant'},'Taksit':{en:'Installment',nl:'Termijn'},'Kredi Kartı':{en:'Credit Card',nl:'Creditcard'},
  'Banka Havalesi':{en:'Bank Transfer',nl:'Bankoverschrijving'},'Nakit':{en:'Cash',nl:'Contant'},
  'Çek':{en:'Check',nl:'Cheque'},'Senet':{en:'Promissory Note',nl:'Wisselbrief'},
  'Ödeme Yöntemi':{en:'Payment Method',nl:'Betaalmethode'},'Ödeme Durumu':{en:'Payment Status',nl:'Betalingsstatus'},
  'Ödenmedi':{en:'Unpaid',nl:'Onbetaald'},'Kısmen Ödendi':{en:'Partially Paid',nl:'Gedeeltelijk Betaald'},
  'İade':{en:'Refund',nl:'Terugbetaling'},'İade Edildi':{en:'Refunded',nl:'Terugbetaald'},
  'Talep Edildi':{en:'Requested',nl:'Aangevraagd'},'İşleniyor':{en:'Processing',nl:'Verwerken'},
  'Hazırlanıyor':{en:'Preparing',nl:'Voorbereiden'},'Kargoya Verildi':{en:'Shipped',nl:'Verzonden'},
  'Teslim Edildi':{en:'Delivered',nl:'Geleverd'},'İptal':{en:'Cancelled',nl:'Geannuleerd'},
  'Geri Alındı':{en:'Returned',nl:'Geretourneerd'},'Değiştirildi':{en:'Exchanged',nl:'Geruild'},
  'Onarıldı':{en:'Repaired',nl:'Gerepareerd'},'Yenilendi':{en:'Renewed',nl:'Vernieuwd'},
  'Kapatıldı':{en:'Closed',nl:'Gesloten'},'Açık':{en:'Open',nl:'Open'},'Kapalı':{en:'Closed',nl:'Gesloten'},
  'Yeni Ticket':{en:'New Ticket',nl:'Nieuw Ticket'},'Ticket Aç':{en:'Open Ticket',nl:'Ticket Openen'},
  'Ticket Kapat':{en:'Close Ticket',nl:'Ticket Sluiten'},'Ticket Yeniden Aç':{en:'Reopen Ticket',nl:'Ticket Heropenen'},
  'Öncelik Belirle':{en:'Set Priority',nl:'Prioriteit Instellen'},'Atama Yap':{en:'Assign',nl:'Toewijzen'},
  'Atamayı Kaldır':{en:'Unassign',nl:'Toewijzing Opheffen'},'Yönlendir':{en:'Redirect',nl:'Doorverwijzen'},
  'Kategori Değiştir':{en:'Change Category',nl:'Categorie Wijzigen'},'Durum Değiştir':{en:'Change Status',nl:'Status Wijzigen'},
  'Etiket Ekle':{en:'Add Tag',nl:'Label Toevoegen'},'Etiket Kaldır':{en:'Remove Tag',nl:'Label Verwijderen'},
  'Dosya Ekle':{en:'Attach File',nl:'Bestand Bijvoegen'},'Dosyalar':{en:'Files',nl:'Bestanden'},
  'Ekler':{en:'Attachments',nl:'Bijlagen'},'Not Ekle':{en:'Add Note',nl:'Notitie Toevoegen'},
  'Yanıtla':{en:'Reply',nl:'Beantwoorden'},'Yanıt Yaz':{en:'Write Reply',nl:'Antwoord Schrijven'},
  'İlet':{en:'Forward',nl:'Doorsturen'},'Yapıştır':{en:'Paste',nl:'Plakken'},'Kes':{en:'Cut',nl:'Knippen'},
  'Tümünü Kopyala':{en:'Copy All',nl:'Alles Kopiëren'},'PDF İndir':{en:'Download PDF',nl:'PDF Downloaden'},
  'Excel İndir':{en:'Download Excel',nl:'Excel Downloaden'},'CSV İndir':{en:'Download CSV',nl:'CSV Downloaden'},
  'E-posta Gönder':{en:'Send Email',nl:'E-mail Versturen'},'SMS Gönder':{en:'Send SMS',nl:'SMS Versturen'},
  'WhatsApp Gönder':{en:'Send WhatsApp',nl:'WhatsApp Versturen'},
  'Bildirim Gönder':{en:'Send Notification',nl:'Melding Versturen'},'Hatırlatıcı Ekle':{en:'Add Reminder',nl:'Herinnering Toevoegen'},
  'Takvime Ekle':{en:'Add to Calendar',nl:'Toevoegen aan Agenda'},'Takvim':{en:'Calendar',nl:'Agenda'},
  'Ajanda':{en:'Schedule',nl:'Planning'},'Planla':{en:'Schedule',nl:'Plannen'},'Planlama':{en:'Planning',nl:'Planning'},
  'Vardiya':{en:'Shift',nl:'Dienst'},'Vardiyalar':{en:'Shifts',nl:'Diensten'},'Mesai':{en:'Overtime',nl:'Overwerk'},
  'İzin':{en:'Leave',nl:'Verlof'},'İzinler':{en:'Leaves',nl:'Verlof'},'Mazeret':{en:'Excuse',nl:'Excuses'},
  'Raporlu':{en:'On Report',nl:'Op Rapport'},'Hastalık':{en:'Sickness',nl:'Ziekte'},
  'Yıllık İzin':{en:'Annual Leave',nl:'Jaarlijks Verlof'},'Ücretsiz İzin':{en:'Unpaid Leave',nl:'Onbetaald Verlof'},
  'Doğum İzni':{en:'Maternity Leave',nl:'Zwangerschapsverlof'},'Babalık İzni':{en:'Paternity Leave',nl:'Vaderschapsverlof'},
  'Eğitim İzni':{en:'Study Leave',nl:'Studieverlof'},'Gün':{en:'Day',nl:'Dag'},'Hafta':{en:'Week',nl:'Week'},
  'Ay':{en:'Month',nl:'Maand'},'Yıl':{en:'Year',nl:'Jaar'},'Çeyrek':{en:'Quarter',nl:'Kwartaal'},
  'Dönem':{en:'Period',nl:'Periode'},'Sezon':{en:'Season',nl:'Seizoen'},'Dakika':{en:'Minute',nl:'Minuut'},
  'Saniye':{en:'Second',nl:'Seconde'},'Salise':{en:'Millisecond',nl:'Milliseconde'},'Şimdi':{en:'Now',nl:'Nu'},
  'Hemen':{en:'Immediately',nl:'Onmiddellijk'},'Erken':{en:'Early',nl:'Vroeg'},'Geç':{en:'Late',nl:'Laat'},
  'Zamanında':{en:'On Time',nl:'Op Tijd'},'Zamanı Geldi':{en:'Due',nl:'Vervallen'},'Zamanı Geçti':{en:'Overdue',nl:'Achterstallig'},
  'Yaklaşıyor':{en:'Upcoming',nl:'Aankomend'},'Yakında':{en:'Soon',nl:'Binnenkort'},'Daha sonra':{en:'Later',nl:'Later'},
  'Geçmişte':{en:'In the past',nl:'In het verleden'},'Gelecekte':{en:'In the future',nl:'In de toekomst'},
  'Her zaman':{en:'Always',nl:'Altijd'},'Asla':{en:'Never',nl:'Nooit'},'Bazen':{en:'Sometimes',nl:'Soms'},
  'Sık sık':{en:'Often',nl:'Vaak'},'Nadiren':{en:'Rarely',nl:'Zelden'},'Tekrar':{en:'Repeat',nl:'Herhalen'},
  'Tekrarla':{en:'Repeat',nl:'Herhalen'},'Tekrarlayan':{en:'Recurring',nl:'Terugkerend'},'Günlük':{en:'Daily',nl:'Dagelijks'},
  'Haftalık':{en:'Weekly',nl:'Wekelijks'},'Aylık':{en:'Monthly',nl:'Maandelijks'},'Yıllık':{en:'Yearly',nl:'Jaarlijks'},
  'Her gün':{en:'Every day',nl:'Elke dag'},'Her hafta':{en:'Every week',nl:'Elke week'},'Her ay':{en:'Every month',nl:'Elke maand'},
  'Her yıl':{en:'Every year',nl:'Elk jaar'},'Pazartesi':{en:'Monday',nl:'Maandag'},'Salı':{en:'Tuesday',nl:'Dinsdag'},
  'Çarşamba':{en:'Wednesday',nl:'Woensdag'},'Perşembe':{en:'Thursday',nl:'Donderdag'},'Cuma':{en:'Friday',nl:'Vrijdag'},
  'Cumartesi':{en:'Saturday',nl:'Zaterdag'},'Pazar':{en:'Sunday',nl:'Zondag'},'Ocak':{en:'January',nl:'Januari'},
  'Şubat':{en:'February',nl:'Februari'},'Mart':{en:'March',nl:'Maart'},'Nisan':{en:'April',nl:'April'},
  'Mayıs':{en:'May',nl:'Mei'},'Haziran':{en:'June',nl:'Juni'},'Temmuz':{en:'July',nl:'Juli'},
  'Ağustos':{en:'August',nl:'Augustus'},'Eylül':{en:'September',nl:'September'},'Ekim':{en:'October',nl:'Oktober'},
  'Kasım':{en:'November',nl:'November'},'Aralık':{en:'December',nl:'December'},'Ad':{en:'Name',nl:'Naam'},
  'Soyad':{en:'Surname',nl:'Achternaam'},'Telefon Numarası':{en:'Phone Number',nl:'Telefoonnummer'},
  'E-posta Adresi':{en:'Email Address',nl:'E-mailadres'},'Adres Satırı 1':{en:'Address Line 1',nl:'Adresregel 1'},
  'Adres Satırı 2':{en:'Address Line 2',nl:'Adresregel 2'},'Şehir':{en:'City',nl:'Stad'},'İlçe':{en:'District',nl:'District'},
  'Posta Kodu':{en:'Postal Code',nl:'Postcode'},'Ülke':{en:'Country',nl:'Land'},'Bölge':{en:'Region',nl:'Regio'},
  'Şube':{en:'Branch',nl:'Vestiging'},'Şubeler':{en:'Branches',nl:'Vestigingen'},'Web Sitesi':{en:'Website',nl:'Website'},
  'Vergi Numarası':{en:'Tax Number',nl:'BTW-nummer'},'Vergi Dairesi':{en:'Tax Office',nl:'Belastingkantoor'},
  'Ticaret Sicil No':{en:'Trade Registry No',nl:'Handelsregister Nr.'},'Mersis No':{en:'Mersis No',nl:'Mersis Nr.'},
  'IBAN':{en:'IBAN',nl:'IBAN'},'Banka':{en:'Bank',nl:'Bank'},'Hesap Sahibi':{en:'Account Holder',nl:'Rekeninghouder'},
  'Fatura Adresi':{en:'Billing Address',nl:'Factuuradres'},'Teslimat Adresi':{en:'Delivery Address',nl:'Leveradres'},
  'Fatura Tipi':{en:'Invoice Type',nl:'Factuurtype'},'Bireysel':{en:'Individual',nl:'Individueel'},
  'Kurumsal':{en:'Corporate',nl:'Zakelijk'},'Şahıs Şirketi':{en:'Sole Proprietorship',nl:'Eenmanszaak'},
  'Limited Şirket':{en:'Limited Company',nl:'BVBA'},'Anonim Şirket':{en:'Joint Stock Company',nl:'NV'},
  'Kooperatif':{en:'Cooperative',nl:'Coöperatie'},'Dernek':{en:'Association',nl:'Vereniging'},
  'Vakıf':{en:'Foundation',nl:'Stichting'},'Kamu':{en:'Public',nl:'Publiek'},'Özel':{en:'Private',nl:'Privé'},
  'Diğer':{en:'Other',nl:'Overig'},'Hepsi':{en:'All',nl:'Alles'},'Herhangi Biri':{en:'Any',nl:'Elke'},
  'Hiçbiri':{en:'None',nl:'Geen'},'Bir veya Daha Fazla':{en:'One or More',nl:'Eén of Meer'},
  'Tam Eşleşme':{en:'Exact Match',nl:'Exacte Overeenkomst'},'Kısmi Eşleşme':{en:'Partial Match',nl:'Gedeeltelijke Overeenkomst'},
  'Benzer':{en:'Similar',nl:'Vergelijkbaar'},'Eşleşme Skoru':{en:'Match Score',nl:'Overeenkomstscore'},
  'Arama Geçmişi':{en:'Search History',nl:'Zoekgeschiedenis'},'Son Aramalar':{en:'Recent Searches',nl:'Recente Zoekopdrachten'},
  'Favoriler':{en:'Favorites',nl:'Favorieten'},'Sık Kullanılanlar':{en:'Frequently Used',nl:'Vaak Gebruikt'},
  'Sabitle':{en:'Pin',nl:'Vastpinnen'},'Sabitlemeyi Kaldır':{en:'Unpin',nl:'Losmaken'},'Sürükle':{en:'Drag',nl:'Slepen'},
  'Bırak':{en:'Drop',nl:'Loslaten'},'Sürükle Bırak':{en:'Drag and Drop',nl:'Slepen en Loslaten'},
  'Yukarı Taşı':{en:'Move Up',nl:'Omhoog Verplaatsen'},'Aşağı Taşı':{en:'Move Down',nl:'Omlaag Verplaatsen'},
  'Genişlet':{en:'Expand',nl:'Uitvouwen'},'Daralt':{en:'Collapse',nl:'Invouwen'},'Gizle':{en:'Hide',nl:'Verbergen'},
  'Göster':{en:'Show',nl:'Weergeven'},'Tam Ekran':{en:'Full Screen',nl:'Volledig Scherm'},
  'Pencere Modu':{en:'Window Mode',nl:'Venstermodus'},'Yeni Sekme':{en:'New Tab',nl:'Nieuw Tabblad'},
  'Yeni Pencere':{en:'New Window',nl:'Nieuw Venster'},'Paylaş':{en:'Share',nl:'Delen'},
  'Bağlantı Kopyala':{en:'Copy Link',nl:'Link Kopiëren'},'Bağlantı':{en:'Link',nl:'Link'},
  'Kısa Bağlantı':{en:'Short Link',nl:'Korte Link'},'QR Kod':{en:'QR Code',nl:'QR-code'},
  'Oluşturuldu':{en:'Created',nl:'Aangemaakt'},'Güncellendi':{en:'Updated',nl:'Bijgewerkt'},'Silindi':{en:'Deleted',nl:'Verwijderd'},
  'Kurtarıldı':{en:'Restored',nl:'Hersteld'},'Arşivlendi':{en:'Archived',nl:'Gearchiveerd'},'Arşivden Çıkar':{en:'Unarchive',nl:'De-archiveren'},
  'Taslak':{en:'Draft',nl:'Concept'},'Taslaklar':{en:'Drafts',nl:'Concepten'},'Yayınla':{en:'Publish',nl:'Publiceren'},
  'Yayınlandı':{en:'Published',nl:'Gepubliceerd'},'Taslak Olarak Kaydet':{en:'Save as Draft',nl:'Opslaan als Concept'},
  'Önizleme':{en:'Preview',nl:'Voorbeeld'},'Önizlemeyi Kapat':{en:'Close Preview',nl:'Voorbeeld Sluiten'},
  'Yazdırma Önizlemesi':{en:'Print Preview',nl:'Afdrukvoorbeeld'},'Şablon':{en:'Template',nl:'Sjabloon'},
  'Şablonlar':{en:'Templates',nl:'Sjablonen'},'Yeni Şablon':{en:'New Template',nl:'Nieuw Sjabloon'},
  'Şablonu Kaydet':{en:'Save Template',nl:'Sjabloon Opslaan'},'Şablonu Uygula':{en:'Apply Template',nl:'Sjabloon Toepassen'},
  'Varsayılan':{en:'Default',nl:'Standaard'},'Varsayılan Ayarlar':{en:'Default Settings',nl:'Standaardinstellingen'},
  'Fabrika Ayarları':{en:'Factory Settings',nl:'Fabrieksinstellingen'},'Ayarları Sıfırla':{en:'Reset Settings',nl:'Instellingen Resetten'},
  'Ayarları Kaydet':{en:'Save Settings',nl:'Instellingen Opslaan'},'Ayarları Geri Yükle':{en:'Restore Settings',nl:'Instellingen Herstellen'},
  'Yedekle':{en:'Backup',nl:'Back-up'},'Yedekleme':{en:'Backup',nl:'Back-up'},'Geri Yükle':{en:'Restore',nl:'Herstellen'},
  'Otomatik Yedekleme':{en:'Auto Backup',nl:'Automatische Back-up'},'Manuel Yedekleme':{en:'Manual Backup',nl:'Handmatige Back-up'},
  'Günlük Yedekleme':{en:'Daily Backup',nl:'Dagelijkse Back-up'},'Haftalık Yedekleme':{en:'Weekly Backup',nl:'Wekelijkse Back-up'},
  'Aylık Yedekleme':{en:'Monthly Backup',nl:'Maandelijkse Back-up'},'Yedekleme Alındı':{en:'Backup Created',nl:'Back-up Gemaakt'},
  'Geri Yüklendi':{en:'Restored',nl:'Hersteld'},'Senkronize Et':{en:'Sync',nl:'Synchroniseren'},
  'Senkronize Edildi':{en:'Synced',nl:'Gesynchroniseerd'},'Senkronizasyon':{en:'Synchronization',nl:'Synchronisatie'},
  'Çevrimdışı':{en:'Offline',nl:'Offline'},'Çevrimiçi':{en:'Online',nl:'Online'},'Bağlantı Yok':{en:'No Connection',nl:'Geen Verbinding'},
  'Yeniden Bağlan':{en:'Reconnect',nl:'Opnieuw Verbinden'},'Bağlanıyor...':{en:'Connecting...',nl:'Verbinden...'},
  'Bağlandı':{en:'Connected',nl:'Verbonden'},'Bağlantı Kesildi':{en:'Disconnected',nl:'Verbinding Verbroken'},
  'Tekrar Dene':{en:'Retry',nl:'Opnieuw Proberen'},'Tekrar Başlat':{en:'Restart',nl:'Herstarten'},
  'Yeniden Başlat':{en:'Restart',nl:'Opnieuw Starten'},'Kapat ve Yeniden Aç':{en:'Close and Reopen',nl:'Sluiten en Heropenen'},
  'Oturum Aç':{en:'Sign In',nl:'Inloggen'},'Oturum Kapat':{en:'Sign Out',nl:'Uitloggen'},
  'Oturum Süresi Doldu':{en:'Session Expired',nl:'Sessie Verlopen'},'Oturumunuz sona erdi':{en:'Your session has expired',nl:'Uw sessie is verlopen'},
  'Tekrar giriş yapın':{en:'Please sign in again',nl:'Log opnieuw in'},'Şifremi Unuttum':{en:'Forgot Password',nl:'Wachtwoord Vergeten'},
  'Şifre Sıfırla':{en:'Reset Password',nl:'Wachtwoord Resetten'},'Yeni Şifre':{en:'New Password',nl:'Nieuw Wachtwoord'},
  'Şifre Tekrar':{en:'Confirm Password',nl:'Wachtwoord Bevestigen'},
  'Şifreler uyuşmuyor':{en:'Passwords do not match',nl:'Wachtwoorden komen niet overeen'},
  'Güvenli Çıkış':{en:'Secure Exit',nl:'Veilig Afsluiten'},'Hesabımı Sil':{en:'Delete My Account',nl:'Mijn Account Verwijderen'},
  'Hesap Silme':{en:'Account Deletion',nl:'Accountverwijdering'},'Hesabı Devre Dışı Bırak':{en:'Disable Account',nl:'Account Uitschakelen'},
  'Hesabı Etkinleştir':{en:'Enable Account',nl:'Account Inschakelen'},'Hesap Askıya Alındı':{en:'Account Suspended',nl:'Account Opgeschort'},
  'Hesap Onaylandı':{en:'Account Verified',nl:'Account Geverifieerd'},'Hesap Doğrulama':{en:'Account Verification',nl:'Accountverificatie'},
  'E-posta Doğrulama':{en:'Email Verification',nl:'E-mailverificatie'},'Telefon Doğrulama':{en:'Phone Verification',nl:'Telefoonverificatie'},
  'Kimlik Doğrulama':{en:'Authentication',nl:'Authenticatie'},'İki Faktörlü Doğrulama':{en:'Two-Factor Authentication',nl:'Tweefactorauthenticatie'},
  '2FA':{en:'2FA',nl:'2FA'},'Doğrulama Kodu':{en:'Verification Code',nl:'Verificatiecode'},
  'Kodu Gönder':{en:'Send Code',nl:'Code Versturen'},'Kodu Doğrula':{en:'Verify Code',nl:'Code Verifiëren'},
  'Kodu Yeniden Gönder':{en:'Resend Code',nl:'Code Opnieuw Versturen'},'Sonraki Adım':{en:'Next Step',nl:'Volgende Stap'},
  'Önceki Adım':{en:'Previous Step',nl:'Vorige Stap'},'Son':{en:'Last',nl:'Laatste'},'İlk':{en:'First',nl:'Eerste'},
  'Önceki':{en:'Previous',nl:'Vorige'},'Sonraki':{en:'Next',nl:'Volgende'},'Adım':{en:'Step',nl:'Stap'},
  'Adımlar':{en:'Steps',nl:'Stappen'},'Aşama':{en:'Phase',nl:'Fase'},'Aşamalar':{en:'Phases',nl:'Fasen'},
  'Evresi':{en:'Stage',nl:'Stadium'},'Seviye':{en:'Level',nl:'Niveau'},'Seviyeler':{en:'Levels',nl:'Niveaus'},
  'Aktivite':{en:'Activity',nl:'Activiteit'},'Aktiviteler':{en:'Activities',nl:'Activiteiten'},'Olay':{en:'Event',nl:'Gebeurtenis'},
  'Olaylar':{en:'Events',nl:'Gebeurtenissen'},'Kayıt':{en:'Log',nl:'Log'},'Kayıtlar':{en:'Logs',nl:'Logs'},
  'Sistem Kayıtları':{en:'System Logs',nl:'Systeemlogs'},'Hata Kayıtları':{en:'Error Logs',nl:'Foutlogs'},
  'Erişim Kayıtları':{en:'Access Logs',nl:'Toegangslogs'},'Değişiklik Kayıtları':{en:'Change Logs',nl:'Wijzigingslogs'},
  'Güvenlik Kayıtları':{en:'Security Logs',nl:'Beveiligingslogs'},'Denetim Kayıtları':{en:'Audit Logs',nl:'Auditlogs'},
  'Oturum Kayıtları':{en:'Session Logs',nl:'Sessielogs'},'IP Adresi':{en:'IP Address',nl:'IP-adres'},
  'Cihaz':{en:'Device',nl:'Apparaat'},'Cihazlar':{en:'Devices',nl:'Apparaten'},'Tarayıcı':{en:'Browser',nl:'Browser'},
  'İşletim Sistemi':{en:'Operating System',nl:'Besturingssysteem'},'Konum':{en:'Location',nl:'Locatie'},
  'Son Giriş':{en:'Last Login',nl:'Laatste Login'},'Son Aktivite':{en:'Last Activity',nl:'Laatste Activiteit'},
  'Aktif Oturumlar':{en:'Active Sessions',nl:'Actieve Sessies'},'Oturumu Sonlandır':{en:'Terminate Session',nl:'Sessie Beëindigen'},
  'Tüm Oturumları Sonlandır':{en:'Terminate All Sessions',nl:'Alle Sessies Beëindigen'},
  'Şifre Değiştir':{en:'Change Password',nl:'Wachtwoord Wijzigen'},'E-posta Değiştir':{en:'Change Email',nl:'E-mail Wijzigen'},
  'Telefon Değiştir':{en:'Change Phone',nl:'Telefoon Wijzigen'},'Adres Değiştir':{en:'Change Address',nl:'Adres Wijzigen'},
  'Profil Resmi':{en:'Profile Picture',nl:'Profielfoto'},'Resim Yükle':{en:'Upload Image',nl:'Afbeelding Uploaden'},
  'Resim Kaldır':{en:'Remove Image',nl:'Afbeelding Verwijderen'},'Kırp':{en:'Crop',nl:'Bijsnijden'},
  'Döndür':{en:'Rotate',nl:'Draaien'},'Yakınlaştır':{en:'Zoom In',nl:'Inzoomen'},'Uzaklaştır':{en:'Zoom Out',nl:'Uitzoomen'},
  'Varsayılan Resim':{en:'Default Image',nl:'Standaardafbeelding'},'Avatar':{en:'Avatar',nl:'Avatar'},
  'İnitial':{en:'Initial',nl:'Initiaal'},'Renk':{en:'Color',nl:'Kleur'},'Renkler':{en:'Colors',nl:'Kleuren'},
  'Tema':{en:'Theme',nl:'Thema'},'Temalar':{en:'Themes',nl:"Thema's"},'Koyu Tema':{en:'Dark Theme',nl:'Donker Thema'},
  'Açık Tema':{en:'Light Theme',nl:'Licht Thema'},'Otomatik Tema':{en:'Auto Theme',nl:'Automatisch Thema'},
  'Sistem Teması':{en:'System Theme',nl:'Systeemthema'},'Yazı Tipi':{en:'Font',nl:'Lettertype'},
  'Yazı Tipleri':{en:'Fonts',nl:'Lettertypen'},'Boyut':{en:'Size',nl:'Grootte'},'Küçük':{en:'Small',nl:'Klein'},
  'Orta':{en:'Medium',nl:'Gemiddeld'},'Büyük':{en:'Large',nl:'Groot'},'Çok Büyük':{en:'Extra Large',nl:'Extra Groot'},
  'Genişlik':{en:'Width',nl:'Breedte'},'Yükseklik':{en:'Height',nl:'Hoogte'},'Derinlik':{en:'Depth',nl:'Diepte'},
  'Ağırlık':{en:'Weight',nl:'Gewicht'},'Hacim':{en:'Volume',nl:'Volume'},'Alan':{en:'Area',nl:'Oppervlakte'},
  'Uzunluk':{en:'Length',nl:'Lengte'},'Çap':{en:'Diameter',nl:'Diameter'},'Yarıçap':{en:'Radius',nl:'Straal'},
  'Çevre':{en:'Perimeter',nl:'Omtrek'},'Yüzey':{en:'Surface',nl:'Oppervlak'},'Yoğunluk':{en:'Density',nl:'Dichtheid'},
  'Kütle':{en:'Mass',nl:'Massa'},'Sıcaklık':{en:'Temperature',nl:'Temperatuur'},'Basınç':{en:'Pressure',nl:'Druk'},
  'Nem':{en:'Humidity',nl:'Vochtigheid'},'Hız':{en:'Speed',nl:'Snelheid'},'Hızlı':{en:'Fast',nl:'Snel'},
  'Yavaş':{en:'Slow',nl:'Traag'},'Güç':{en:'Power',nl:'Vermogen'},'Enerji':{en:'Energy',nl:'Energie'},
  'Akım':{en:'Current',nl:'Stroom'},'Voltaj':{en:'Voltage',nl:'Voltage'},'Direnç':{en:'Resistance',nl:'Weerstand'},
  'Kapasite':{en:'Capacity',nl:'Capaciteit'},'Kapasiteler':{en:'Capacities',nl:'Capaciteiten'},'Verim':{en:'Efficiency',nl:'Rendement'},
  'Tüketim':{en:'Consumption',nl:'Verbruik'},'Üretim':{en:'Production',nl:'Productie'},
  'Stok Miktarı':{en:'Stock Quantity',nl:'Voorraadhoeveelheid'},'Minimum Stok':{en:'Minimum Stock',nl:'Minimumvoorraad'},
  'Maksimum Stok':{en:'Maximum Stock',nl:'Maximumvoorraad'},'Kritik Stok':{en:'Critical Stock',nl:'Kritieke Voorraad'},
  'Stok Uyarısı':{en:'Stock Alert',nl:'Voorraadwaarschuwing'},'Stok Girişi':{en:'Stock Entry',nl:'Voorraadinvoer'},
  'Stok Çıkışı':{en:'Stock Exit',nl:'Voorraaduitvoer'},'Stok Sayımı':{en:'Stock Count',nl:'Voorraadtelling'},
  'Stok Farkı':{en:'Stock Difference',nl:'Voorraadverschil'},'Stok Değeri':{en:'Stock Value',nl:'Voorraadwaarde'},
  'Stok Hareketleri':{en:'Stock Movements',nl:'Voorraadbewegingen'},'Giriş':{en:'Entry',nl:'Invoer'},
  'Çıkış':{en:'Exit',nl:'Uitvoer'},'Transfer':{en:'Transfer',nl:'Overdracht'},'Transfer Et':{en:'Transfer',nl:'Overdragen'},
  'Devir':{en:'Handover',nl:'Overdracht'},'Sayım':{en:'Count',nl:'Telling'},'Say':{en:'Count',nl:'Tellen'},
  'Karşılaştır':{en:'Compare',nl:'Vergelijken'},'Fark':{en:'Difference',nl:'Verschil'},
  'Farklar':{en:'Differences',nl:'Verschillen'},'Eşleşme':{en:'Match',nl:'Overeenkomst'},
  'Eşleşmeler':{en:'Matches',nl:'Overeenkomsten'},'Eşleşmeyen':{en:'Unmatched',nl:'Niet-overeenkomend'},
  'Eşleştir':{en:'Match',nl:'Overeenkomen'},'Eşleştirme':{en:'Matching',nl:'Overeenkomst'},
  'Eşleştirmeyi Kaldır':{en:'Unmatch',nl:'Overeenkomst Opheffen'},'Teklif No':{en:'Quote No',nl:'Offertenummer'},
  'Teklif Tarihi':{en:'Quote Date',nl:'Offertedatum'},'Teklif Durumu':{en:'Quote Status',nl:'Offertestatus'},
  'Teklif Tutarı':{en:'Quote Amount',nl:'Offertebedrag'},'Teklif Geçerlilik':{en:'Quote Validity',nl:'Offertegeldigheid'},
  'Teklif Notları':{en:'Quote Notes',nl:'Offertenotities'},'Teklif Oluştur':{en:'Create Quote',nl:'Offerte Aanmaken'},
  'Teklif Düzenle':{en:'Edit Quote',nl:'Offerte Bewerken'},'Teklif Sil':{en:'Delete Quote',nl:'Offerte Verwijderen'},
  'Teklif Onayla':{en:'Approve Quote',nl:'Offerte Goedkeuren'},'Teklif Reddet':{en:'Reject Quote',nl:'Offerte Afwijzen'},
  'Teklif Gönder':{en:'Send Quote',nl:'Offerte Versturen'},'Teklif PDF':{en:'Quote PDF',nl:'Offerte PDF'},
  'Teklif Kopyala':{en:'Copy Quote',nl:'Offerte Kopiëren'},'Teklif Yenile':{en:'Renew Quote',nl:'Offerte Vernieuwen'},
  'Yeni Teklif':{en:'New Quote',nl:'Nieuwe Offerte'},'Tekliflerim':{en:'My Quotes',nl:'Mijn Offertes'},
  'Teklif Detayı':{en:'Quote Detail',nl:'Offertedetail'},'Teklif Kalemleri':{en:'Quote Items',nl:'Offerteregels'},
  'Teklif Özeti':{en:'Quote Summary',nl:'Offertesamenvatting'},'Teklif Onayı':{en:'Quote Approval',nl:'Offertegoedkeuring'},
  'Teklif Onay Bekliyor':{en:'Quote Pending Approval',nl:'Offerte in Afwachting van Goedkeuring'},
  'Teklif Onaylandı':{en:'Quote Approved',nl:'Offerte Goedgekeurd'},'Teklif Reddedildi':{en:'Quote Rejected',nl:'Offerte Afgewezen'},
  'Teklif Süresi Doldu':{en:'Quote Expired',nl:'Offerte Verlopen'},'Teklif İptal Edildi':{en:'Quote Cancelled',nl:'Offerte Geannuleerd'},
  'Bakım Planı':{en:'Maintenance Plan',nl:'Onderhoudsplan'},'Bakım Programı':{en:'Maintenance Schedule',nl:'Onderhoudsprogramma'},
  'Bakım Kaydı':{en:'Maintenance Record',nl:'Onderhoudsrecord'},'Bakım Geçmişi':{en:'Maintenance History',nl:'Onderhoudsgeschiedenis'},
  'Bakım Sözleşmesi':{en:'Maintenance Contract',nl:'Onderhoudscontract'},'Bakım Anlaşması':{en:'Maintenance Agreement',nl:'Onderhoudsovereenkomst'},
  'Bakım Talimatı':{en:'Maintenance Instruction',nl:'Onderhoudsinstructie'},'Bakım Listesi':{en:'Maintenance List',nl:'Onderhoudslijst'},
  'Bakım Kontrol':{en:'Maintenance Check',nl:'Onderhoudscontrole'},'Bakım Raporu':{en:'Maintenance Report',nl:'Onderhoudsrapport'},
  'Periyodik Bakım':{en:'Periodic Maintenance',nl:'Periodiek Onderhoud'},'Acil Bakım':{en:'Emergency Maintenance',nl:'Spoedonderhoud'},
  'Önleyici Bakım':{en:'Preventive Maintenance',nl:'Preventief Onderhoud'},'Düzeltici Bakım':{en:'Corrective Maintenance',nl:'Correctief Onderhoud'},
  'Bakım Yap':{en:'Perform Maintenance',nl:'Onderhoud Uitvoeren'},'Bakım Tamamlandı':{en:'Maintenance Completed',nl:'Onderhoud Voltooid'},
  'Bakım Ertelendi':{en:'Maintenance Postponed',nl:'Onderhoud Uitgesteld'},'Bakım Ataması':{en:'Maintenance Assignment',nl:'Onderhoudstoewijzing'},
  'Bakım Maliyeti':{en:'Maintenance Cost',nl:'Onderhoudskosten'},'Bakım Süresi':{en:'Maintenance Duration',nl:'Onderhoudsduur'},
  'Bakım Sıklığı':{en:'Maintenance Frequency',nl:'Onderhoudsfrequentie'},'Bakım Periyodu':{en:'Maintenance Period',nl:'Onderhoudsperiode'},
  'Son Bakım':{en:'Last Maintenance',nl:'Laatste Onderhoud'},'Sonraki Bakım':{en:'Next Maintenance',nl:'Volgende Onderhoud'},
  'Bakım Hatırlatıcı':{en:'Maintenance Reminder',nl:'Onderhoudsherinnering'},'Personel Listesi':{en:'Staff List',nl:'Personeelslijst'},
  'Personel Ekle':{en:'Add Staff',nl:'Personeel Toevoegen'},'Personel Düzenle':{en:'Edit Staff',nl:'Personeel Bewerken'},
  'Personel Sil':{en:'Delete Staff',nl:'Personeel Verwijderen'},'Personel Detayı':{en:'Staff Detail',nl:'Personeelsdetail'},
  'Personel Profili':{en:'Staff Profile',nl:'Personeelsprofiel'},'Personel Kartı':{en:'Staff Card',nl:'Personeelskaart'},
  'Personel Yönetimi':{en:'Staff Management',nl:'Personeelsbeheer'},'Personel Sayısı':{en:'Staff Count',nl:'Personeelsaantal'},
  'Aktif Personel':{en:'Active Staff',nl:'Actief Personeel'},'Pasif Personel':{en:'Inactive Staff',nl:'Inactief Personeel'},
  'Yeni Personel':{en:'New Staff',nl:'Nieuw Personeel'},'Ekip':{en:'Team',nl:'Team'},'Ekipler':{en:'Teams',nl:'Teams'},
  'Ekip Lideri':{en:'Team Leader',nl:'Teamleider'},'Yönetici':{en:'Manager',nl:'Manager'},'Yöneticiler':{en:'Managers',nl:'Managers'},
  'Süpervizör':{en:'Supervisor',nl:'Supervisor'},'Operatör':{en:'Operator',nl:'Operator'},'Teknisyen':{en:'Technician',nl:'Technicus'},
  'Uzman':{en:'Specialist',nl:'Specialist'},'Stajyer':{en:'Intern',nl:'Stagiair'},'Yarı Zamanlı':{en:'Part-time',nl:'Deeltijd'},
  'Tam Zamanlı':{en:'Full-time',nl:'Voltijd'},'Sözleşmeli':{en:'Contractual',nl:'Contractueel'},'Daimi':{en:'Permanent',nl:'Vast'},
  'Geçici':{en:'Temporary',nl:'Tijdelijk'},'Dış Kaynak':{en:'Outsourced',nl:'Uitbesteed'},'Freelance':{en:'Freelance',nl:'Freelance'},
  'Maaş':{en:'Salary',nl:'Salaris'},'Saatlik Ücret':{en:'Hourly Rate',nl:'Uurtarief'},'Günlük Ücret':{en:'Daily Rate',nl:'Dagtarief'},
  'Yevmiye':{en:'Per Diem',nl:'Dagvergoeding'},'Prim':{en:'Bonus',nl:'Bonus'},'Komisyon':{en:'Commission',nl:'Commissie'},
  'İkramiye':{en:'Reward',nl:'Beloning'},'Tazminat':{en:'Compensation',nl:'Vergoeding'},'Sigorta':{en:'Insurance',nl:'Verzekering'},
  'Sağlık Sigortası':{en:'Health Insurance',nl:'Zorgverzekering'},'Emeklilik':{en:'Pension',nl:'Pensioen'},
  'Emekli':{en:'Retired',nl:'Gepensioneerd'},'İşe Başlama':{en:'Start Date',nl:'Startdatum'},
  'İşten Ayrılma':{en:'End Date',nl:'Einddatum'},'İşten Çıkarma':{en:'Termination',nl:'Ontslag'},
  'İstifa':{en:'Resignation',nl:'Ontslagname'},'Zimmet':{en:'Assignment',nl:'Toewijzing'},
  'Zimmetler':{en:'Assignments',nl:'Toewijzingen'},'Zimmet Ekle':{en:'Add Assignment',nl:'Toewijzing Toevoegen'},
  'Zimmet Sil':{en:'Remove Assignment',nl:'Toewijzing Verwijderen'},'Zimmet Listesi':{en:'Assignment List',nl:'Toewijzingslijst'},
  'Rezervasyonlar':{en:'Reservations',nl:'Reserveringen'},'Rezervasyon Yap':{en:'Make Reservation',nl:'Reservering Maken'},
  'Rezervasyon İptal':{en:'Cancel Reservation',nl:'Reservering Annuleren'},'Rezervasyon Onayla':{en:'Confirm Reservation',nl:'Reservering Bevestigen'},
  'Rezervasyon Durumu':{en:'Reservation Status',nl:'Reserveringsstatus'},'Rezervasyon Tarihi':{en:'Reservation Date',nl:'Reserveringsdatum'},
  'Rezervasyon Saati':{en:'Reservation Time',nl:'Reserveringstijd'},'Rezervasyon Notu':{en:'Reservation Note',nl:'Reserveringsnotitie'},
  'Rezervasyon Detayı':{en:'Reservation Detail',nl:'Reserveringsdetail'},'Rezervasyon Listesi':{en:'Reservation List',nl:'Reserveringslijst'},
  'Yeni Rezervasyon':{en:'New Reservation',nl:'Nieuwe Reservering'},'Müsaitlik':{en:'Availability',nl:'Beschikbaarheid'},
  'Müsait Zamanlar':{en:'Available Times',nl:'Beschikbare Tijden'},'Dolu Zamanlar':{en:'Busy Times',nl:'Bezette Tijden'},
  'Zaman Aralığı':{en:'Time Slot',nl:'Tijdslot'},'Zaman Aralıkları':{en:'Time Slots',nl:'Tijdslots'},
  'Başlangıç Saati':{en:'Start Time',nl:'Starttijd'},'Bitiş Saati':{en:'End Time',nl:'Eindtijd'},
  'Süre':{en:'Duration',nl:'Duur'},'Toplam Süre':{en:'Total Duration',nl:'Totale Duur'},
  'Kalan Süre':{en:'Remaining Time',nl:'Resterende Tijd'},'Geçen Süre':{en:'Elapsed Time',nl:'Verstreken Tijd'},
  'Tahmini Süre':{en:'Estimated Duration',nl:'Geschatte Duur'},'Gerçek Süre':{en:'Actual Duration',nl:'Werkelijke Duur'},
  'Randevu Al':{en:'Book Appointment',nl:'Afspraak Maken'},'Randevu İptal':{en:'Cancel Appointment',nl:'Afspraak Annuleren'},
  'Randevu Değiştir':{en:'Reschedule',nl:'Herschema'},'Randevu Ertele':{en:'Postpone',nl:'Uitstellen'},
  'Randevu Onayla':{en:'Confirm Appointment',nl:'Afspraak Bevestigen'},'Randevu Hatırlatıcı':{en:'Appointment Reminder',nl:'Afspraakherinnering'},
  'Randevu Detayı':{en:'Appointment Detail',nl:'Afspraakdetail'},'Randevu Geçmişi':{en:'Appointment History',nl:'Afspraakgeschiedenis'},
  'Randevu İstatistikleri':{en:'Appointment Statistics',nl:'Afspraakstatistieken'},'Randevu Yönetimi':{en:'Appointment Management',nl:'Afspraakbeheer'},
  'Ekipman Listesi':{en:'Equipment List',nl:'Apparatuurlijst'},'Ekipman Ekle':{en:'Add Equipment',nl:'Apparatuur Toevoegen'},
  'Ekipman Düzenle':{en:'Edit Equipment',nl:'Apparatuur Bewerken'},'Ekipman Sil':{en:'Delete Equipment',nl:'Apparatuur Verwijderen'},
  'Ekipman Detayı':{en:'Equipment Detail',nl:'Apparatuurdetail'},'Ekipman Kartı':{en:'Equipment Card',nl:'Apparatuurkaart'},
  'Ekipman Yönetimi':{en:'Equipment Management',nl:'Apparatuurbeheer'},'Yeni Ekipman':{en:'New Equipment',nl:'Nieuwe Apparatuur'},
  'Ekipman Türü':{en:'Equipment Type',nl:'Apparatuurtype'},'Ekipman Kategorisi':{en:'Equipment Category',nl:'Apparatuurcategorie'},
  'Ekipman Durumu':{en:'Equipment Status',nl:'Apparatuurstatus'},'Ekipman Lokasyonu':{en:'Equipment Location',nl:'Apparatuurlocatie'},
  'Ekipman Sorumlusu':{en:'Equipment Manager',nl:'Apparatuurverantwoordelijke'},'Ekipman Alım Tarihi':{en:'Purchase Date',nl:'Aankoopdatum'},
  'Ekipman Garanti':{en:'Warranty',nl:'Garantie'},'Garanti Başlangıç':{en:'Warranty Start',nl:'Garantiestart'},
  'Garanti Bitiş':{en:'Warranty End',nl:'Garantie-einde'},'Garanti Süresi':{en:'Warranty Period',nl:'Garantieperiode'},
  'Garanti Kapsamı':{en:'Warranty Coverage',nl:'Garantiedekking'},'Garanti Dışı':{en:'Out of Warranty',nl:'Buiten Garantie'},
  'Garanti Devam Ediyor':{en:'Under Warranty',nl:'Onder Garantie'},'Garanti Talebi':{en:'Warranty Claim',nl:'Garantieclaim'},
  'Garanti Servisi':{en:'Warranty Service',nl:'Garantieservice'},'Seri Numarası':{en:'Serial Number',nl:'Serienummer'},
  'Model Numarası':{en:'Model Number',nl:'Modelnummer'},'Parti Numarası':{en:'Part Number',nl:'Partnummer'},
  'Lot Numarası':{en:'Lot Number',nl:'Lotnummer'},'Üretim Tarihi':{en:'Manufacturing Date',nl:'Productiedatum'},
  'Son Kullanma':{en:'Expiration Date',nl:'Vervaldatum'},'Ömrü':{en:'Lifespan',nl:'Levensduur'},
  'Kalan Ömür':{en:'Remaining Life',nl:'Resterende Levensduur'},'Değer':{en:'Value',nl:'Waarde'},
  'Bakiye Değeri':{en:'Book Value',nl:'Boekwaarde'},'Yeniden Değerleme':{en:'Revaluation',nl:'Herwaardering'},
  'Amortisman':{en:'Depreciation',nl:'Afschrijving'},'Yıpranma':{en:'Wear',nl:'Slijtage'},
  'Yıpranma Payı':{en:'Wear Rate',nl:'Slijtagepercentage'},'Kullanım Saati':{en:'Usage Hours',nl:'Gebruiksuren'},
  'Çalışma Saati':{en:'Operating Hours',nl:'Bedrijfsuren'},'Bakım Saati':{en:'Maintenance Hours',nl:'Onderhoudsuren'},
  'Durma Saati':{en:'Downtime Hours',nl:'Stilstanduren'},'Verimlilik Oranı':{en:'Efficiency Rate',nl:'Efficiëntiepercentage'},
  'Kullanılabilirlik':{en:'Availability',nl:'Beschikbaarheid'},'Kullanılabilirlik Oranı':{en:'Availability Rate',nl:'Beschikbaarheidspercentage'},
  'MTBF':{en:'MTBF',nl:'MTBF'},'MTTR':{en:'MTTR',nl:'MTTR'},'OEE':{en:'OEE',nl:'OEE'},
  'Kalite Oranı':{en:'Quality Rate',nl:'Kwaliteitspercentage'},'Performans Oranı':{en:'Performance Rate',nl:'Prestatiepercentage'},
  'Kalite Kontrol Listesi':{en:'Quality Checklist',nl:'Kwaliteitschecklist'},'Kontrol Listesi':{en:'Checklist',nl:'Checklist'},
  'Kontrol Maddesi':{en:'Check Item',nl:'Controlepunt'},'Kontrol Sonucu':{en:'Check Result',nl:'ControleResultaat'},
  'Kontrol Tarihi':{en:'Check Date',nl:'Controledatum'},'Kontrol Eden':{en:'Checked By',nl:'Gecontroleerd Door'},
  'Onaylayan':{en:'Approved By',nl:'Goedgekeurd Door'},'Müşteri Listesi':{en:'Customer List',nl:'Klantenlijst'},
  'Müşteri Ekle':{en:'Add Customer',nl:'Klant Toevoegen'},'Müşteri Düzenle':{en:'Edit Customer',nl:'Klant Bewerken'},
  'Müşteri Sil':{en:'Delete Customer',nl:'Klant Verwijderen'},'Müşteri Detayı':{en:'Customer Detail',nl:'Klantdetail'},
  'Müşteri Profili':{en:'Customer Profile',nl:'Klantprofiel'},'Müşteri Kartı':{en:'Customer Card',nl:'Klantkaart'},
  'Müşteri Yönetimi':{en:'Customer Management',nl:'Klantenbeheer'},'Yeni Müşteri':{en:'New Customer',nl:'Nieuwe Klant'},
  'Müşteri Türü':{en:'Customer Type',nl:'Klanttype'},'Müşteri Kategorisi':{en:'Customer Category',nl:'Klantcategorie'},
  'Müşteri Grubu':{en:'Customer Group',nl:'Klantengroep'},'Müşteri Segmenti':{en:'Customer Segment',nl:'Klantsegment'},
  'Müşteri Durumu':{en:'Customer Status',nl:'Klantstatus'},'Müşteri Kaynak':{en:'Customer Source',nl:'Klantbron'},
  'Müşteri Temsilcisi':{en:'Customer Representative',nl:'Klantvertegenwoordiger'},'Müşteri Notları':{en:'Customer Notes',nl:'Klantnotities'},
  'Müşteri Etiketleri':{en:'Customer Tags',nl:'Klantlabels'},'Müşteri Geçmişi':{en:'Customer History',nl:'Klantgeschiedenis'},
  'Müşteri İstatistikleri':{en:'Customer Statistics',nl:'Klantstatistieken'},'Müşteri Analizi':{en:'Customer Analysis',nl:'Klantanalyse'},
  'Müşteri Şikayeti':{en:'Customer Complaint',nl:'Klantklacht'},'Müşteri Talebi':{en:'Customer Request',nl:'Klantverzoek'},
  'Müşteri Geri Bildirimi':{en:'Customer Feedback',nl:'Klantfeedback'},'Müşteri Yorumu':{en:'Customer Review',nl:'Klantrecensie'},
  'Müşteri Puanı':{en:'Customer Score',nl:'Klantscore'},'Müşteri Sıralaması':{en:'Customer Ranking',nl:'Klantenranking'},
  'VIP Müşteri':{en:'VIP Customer',nl:'VIP-klant'},'Kurumsal Müşteri':{en:'Corporate Customer',nl:'Zakelijke Klant'},
  'Bireysel Müşteri':{en:'Individual Customer',nl:'Particuliere Klant'},'Potansiyel Müşteri':{en:'Prospect',nl:'Potentiële Klant'},
  'Sadık Müşteri':{en:'Loyal Customer',nl:'Loyale Klant'},'Kayıp Müşteri':{en:'Lost Customer',nl:'Verloren Klant'},
  'Aktif Müşteri':{en:'Active Customer',nl:'Actieve Klant'},'Pasif Müşteri':{en:'Inactive Customer',nl:'Inactieve Klant'},
  'Engelli Müşteri':{en:'Blocked Customer',nl:'Geblokkeerde Klant'},'Kara Liste':{en:'Blacklist',nl:'Zwarte Lijst'},
  'Beyaz Liste':{en:'Whitelist',nl:'Witte Lijst'},'Hizmet Listesi':{en:'Service List',nl:'Dienstenlijst'},
  'Hizmet Ekle':{en:'Add Service',nl:'Dienst Toevoegen'},'Hizmet Düzenle':{en:'Edit Service',nl:'Dienst Bewerken'},
  'Hizmet Sil':{en:'Delete Service',nl:'Dienst Verwijderen'},'Hizmet Detayı':{en:'Service Detail',nl:'Dienstdetail'},
  'Hizmet Kartı':{en:'Service Card',nl:'Dienstkaart'},'Hizmet Yönetimi':{en:'Service Management',nl:'Dienstenbeheer'},
  'Yeni Hizmet':{en:'New Service',nl:'Nieuwe Dienst'},'Hizmet Türü':{en:'Service Type',nl:'Diensttype'},
  'Hizmet Kategorisi':{en:'Service Category',nl:'Dienstcategorie'},'Hizmet Grubu':{en:'Service Group',nl:'Dienstengroep'},
  'Hizmet Paketi':{en:'Service Package',nl:'Dienstpakket'},'Hizmet Paketleri':{en:'Service Packages',nl:'Dienstpakketten'},
  'Hizmet Fiyatı':{en:'Service Price',nl:'Dienstprijs'},'Hizmet Süresi':{en:'Service Duration',nl:'Dienstduur'},
  'Hizmet Açıklaması':{en:'Service Description',nl:'Dienstbeschrijving'},'Hizmet Notları':{en:'Service Notes',nl:'Dienstnotities'},
  'Hizmet Durumu':{en:'Service Status',nl:'Dienststatus'},'Hizmet Etiketleri':{en:'Service Tags',nl:'Dienstlabels'},
  'Hizmet İstatistikleri':{en:'Service Statistics',nl:'Dienststatistieken'},'Popüler Hizmet':{en:'Popular Service',nl:'Populaire Dienst'},
  'Öne Çıkan Hizmet':{en:'Featured Service',nl:'Uitgelichte Dienst'},'Yeni Hizmetler':{en:'New Services',nl:'Nieuwe Diensten'},
  'Trend Hizmet':{en:'Trending Service',nl:'Trending Dienst'},'İndirimli Hizmet':{en:'Discounted Service',nl:'Gekortte Dienst'},
  'Kampanyalı Hizmet':{en:'Promotional Service',nl:'Promotionele Dienst'},'Ücretsiz Hizmet':{en:'Free Service',nl:'Gratis Dienst'},
  'Ek Hizmet':{en:'Additional Service',nl:'Additionele Dienst'},'Temel Hizmet':{en:'Basic Service',nl:'Basisdienst'},
  'Standart Hizmet':{en:'Standard Service',nl:'Standaarddienst'},'Premium Hizmet':{en:'Premium Service',nl:'Premiumdienst'},
  'Deluxe Hizmet':{en:'Deluxe Service',nl:'Deluxe Dienst'},'Özel Hizmet':{en:'Custom Service',nl:'Aangepaste Dienst'},
  'Hizmet Seç':{en:'Select Service',nl:'Dienst Selecteren'},'Hizmet Ekle/Çıkar':{en:'Add/Remove Service',nl:'Dienst Toevoegen/Verwijderen'},
  'Hizmet Miktarı':{en:'Service Quantity',nl:'Diensthoeveelheid'},'Hizmet Toplamı':{en:'Service Total',nl:'Diensttotaal'},
  'Stok Listesi':{en:'Stock List',nl:'Voorraadlijst'},'Stok Ekle':{en:'Add Stock',nl:'Voorraad Toevoegen'},
  'Stok Düzenle':{en:'Edit Stock',nl:'Voorraad Bewerken'},'Stok Sil':{en:'Delete Stock',nl:'Voorraad Verwijderen'},
  'Stok Detayı':{en:'Stock Detail',nl:'Voorraaddetail'},'Stok Kartı':{en:'Stock Card',nl:'Voorraadkaart'},
  'Stok Yönetimi':{en:'Stock Management',nl:'Voorraadbeheer'},'Yeni Stok':{en:'New Stock',nl:'Nieuwe Voorraad'},
  'Stok Türü':{en:'Stock Type',nl:'Voorraadtype'},'Stok Kategorisi':{en:'Stock Category',nl:'Voorraadcategorie'},
  'Stok Grubu':{en:'Stock Group',nl:'Voorraadgroep'},'Stok Lokasyonu':{en:'Stock Location',nl:'Voorraadlocatie'},
  'Stok Miktarı':{en:'Stock Quantity',nl:'Voorraadhoeveelheid'},'Stok Birimi':{en:'Stock Unit',nl:'Voorraadeenheid'},
  'Stok Fiyatı':{en:'Stock Price',nl:'Voorraadprijs'},'Stok Maliyeti':{en:'Stock Cost',nl:'Voorraadkosten'},
  'Stok Değeri':{en:'Stock Value',nl:'Voorraadwaarde'},'Stok Hareketi':{en:'Stock Movement',nl:'Voorraadbeweging'},
  'Stok Girişi':{en:'Stock Entry',nl:'Voorraadinvoer'},'Stok Çıkışı':{en:'Stock Exit',nl:'Voorraaduitvoer'},
  'Stok Transferi':{en:'Stock Transfer',nl:'Voorraadoverdracht'},'Stok Sayımı':{en:'Stock Count',nl:'Voorraadtelling'},
  'Stok Raporu':{en:'Stock Report',nl:'Voorraadrapport'},'Stok Uyarısı':{en:'Stock Alert',nl:'Voorraadwaarschuwing'},
  'Stok Kritik':{en:'Stock Critical',nl:'Voorraad Kritiek'},'Stok Tükeniyor':{en:'Stock Running Low',nl:'Voorraad Op'},
  'Stok Bitti':{en:'Stock Out',nl:'Voorraad Opgebruikt'},'Stok Fazlası':{en:'Excess Stock',nl:'Overtollige Voorraad'},
  'Stok Yetersiz':{en:'Insufficient Stock',nl:'Onvoldoende Voorraad'},'Stok Yeterli':{en:'Sufficient Stock',nl:'Voldoende Voorraad'},
  'Stok Güncel':{en:'Stock Current',nl:'Voorraad Actueel'},'Stok Eski':{en:'Stock Old',nl:'Voorraad Oud'},
  'Son Kullanma Tarihi':{en:'Expiry Date',nl:'Vervaldatum'},'Son Kullanma Yaklaşıyor':{en:'Expiry Approaching',nl:'Vervaldatum Nadert'},
  'Son Kullanma Geçti':{en:'Expired',nl:'Verlopen'},'Parti Takibi':{en:'Lot Tracking',nl:'Lottracking'},
  'Seri Takibi':{en:'Serial Tracking',nl:'Seriële Tracking'},'Barkodlu Takip':{en:'Barcode Tracking',nl:'Barcodetracking'},
  'RFID Takibi':{en:'RFID Tracking',nl:'RFID-tracking'},'QR Takibi':{en:'QR Tracking',nl:'QR-tracking'},
  'Sektör Listesi':{en:'Sector List',nl:'Sectorlijst'},'Sektör Ekle':{en:'Add Sector',nl:'Sector Toevoegen'},
  'Sektör Düzenle':{en:'Edit Sector',nl:'Sector Bewerken'},'Sektör Sil':{en:'Delete Sector',nl:'Sector Verwijderen'},
  'Sektör Detayı':{en:'Sector Detail',nl:'Sectordetail'},'Sektör Yönetimi':{en:'Sector Management',nl:'Sectorbeheer'},
  'Yeni Sektör':{en:'New Sector',nl:'Nieuwe Sector'},'Sektör Adı':{en:'Sector Name',nl:'Sectornaam'},
  'Sektör Kodu':{en:'Sector Code',nl:'Sectorcode'},'Sektör Açıklaması':{en:'Sector Description',nl:'Sectorbeschrijving'},
  'Sektör Durumu':{en:'Sector Status',nl:'Sectorstatus'},'Sektör Sıralaması':{en:'Sector Order',nl:'Sectortoewijzing'},
  'Alt Sektör':{en:'Sub-sector',nl:'Subsector'},'Alt Sektörler':{en:'Sub-sectors',nl:'Subsectoren'},
  'Ana Sektör':{en:'Main Sector',nl:'Hoofdsector'},'Ana Sektörler':{en:'Main Sectors',nl:'Hoofdsectoren'},
  'Sektör Hiyerarşisi':{en:'Sector Hierarchy',nl:'Sectorhiërarchie'},'Sektör İstatistikleri':{en:'Sector Statistics',nl:'Sectorstatistieken'},
  'Sektör Raporu':{en:'Sector Report',nl:'Sectorrapport'},'Sektör Performansı':{en:'Sector Performance',nl:'Sectorprestatie'},
  'Sektör Karlılığı':{en:'Sector Profitability',nl:'Sectorrentabiliteit'},'Sektör Büyümesi':{en:'Sector Growth',nl:'Sectorgroei'},
  'Sektör Payı':{en:'Sector Share',nl:'Sectoraandeel'},'Sektör Trendi':{en:'Sector Trend',nl:'Sectortrend'},
  'Sektör Lideri':{en:'Sector Leader',nl:'Sectorleider'},'Sektörler Arası':{en:'Cross-sector',nl:'Sectoroverschrijdend'},
  'Çok Sektörlü':{en:'Multi-sector',nl:'Multi-sector'},'Sektörel Analiz':{en:'Sectoral Analysis',nl:'Sectorale Analyse'},
  'Sektörel Rapor':{en:'Sectoral Report',nl:'Sectoraal Rapport'},'Sektörel Karşılaştırma':{en:'Sectoral Comparison',nl:'Sectorale Vergelijking'},
  'Sektör Aktifleştir':{en:'Activate Sector',nl:'Sector Activeren'},'Sektör Pasifleştir':{en:'Deactivate Sector',nl:'Sector Deactiveren'},
  'Sektör Eşleştir':{en:'Match Sector',nl:'Sector Koppelen'},'Sektör Tanımla':{en:'Define Sector',nl:'Sector Definiëren'},
  'Sektör Ataması':{en:'Sector Assignment',nl:'Sectortoewijzing'},'Araç Listesi':{en:'Tool List',nl:'Gereedschaplijst'},
  'Araç Ekle':{en:'Add Tool',nl:'Gereedschap Toevoegen'},'Araç Düzenle':{en:'Edit Tool',nl:'Gereedschap Bewerken'},
  'Araç Sil':{en:'Delete Tool',nl:'Gereedschap Verwijderen'},'Araç Detayı':{en:'Tool Detail',nl:'Gereedschapdetail'},
  'Araç Yönetimi':{en:'Tool Management',nl:'Gereedschapbeheer'},'Yeni Araç':{en:'New Tool',nl:'Nieuw Gereedschap'},
  'Araç Adı':{en:'Tool Name',nl:'Gereedschapnaam'},'Araç Kodu':{en:'Tool Code',nl:'Gereedschapcode'},
  'Araç Türü':{en:'Tool Type',nl:'Gereedschaptype'},'Araç Kategorisi':{en:'Tool Category',nl:'Gereedschapcategorie'},
  'Araç Durumu':{en:'Tool Status',nl:'Gereedschapstatus'},'Araç Lokasyonu':{en:'Tool Location',nl:'Gereedschaplocatie'},
  'Araç Sorumlusu':{en:'Tool Manager',nl:'Gereedschapverantwoordelijke'},'Araç Miktarı':{en:'Tool Quantity',nl:'Gereedschaphoeveelheid'},
  'Araç Birimi':{en:'Tool Unit',nl:'Gereedschapeenheid'},'Araç Fiyatı':{en:'Tool Price',nl:'Gereedschapprijs'},
  'Araç Maliyeti':{en:'Tool Cost',nl:'Gereedschapkosten'},'Araç Alım Tarihi':{en:'Purchase Date',nl:'Aankoopdatum'},
  'Araç Garanti':{en:'Tool Warranty',nl:'Gereedschapgarantie'},'Araç Bakımı':{en:'Tool Maintenance',nl:'Gereedschaponderhoud'},
  'Araç Kontrolü':{en:'Tool Check',nl:'Gereedschapcontrole'},'Araç Kalibrasyonu':{en:'Tool Calibration',nl:'Gereedschapkalibratie'},
  'Araç Ölçümü':{en:'Tool Measurement',nl:'Gereedschapmeting'},'Araç Testi':{en:'Tool Test',nl:'Gereedschaptest'},
  'Araç Onayı':{en:'Tool Approval',nl:'Gereedschapgoedkeuring'},'Araç Sertifikası':{en:'Tool Certificate',nl:'Gereedschapcertificaat'},
  'Araç Ruhsatı':{en:'Tool License',nl:'Gereedschaplicentie'},'Araç Yeterliliği':{en:'Tool Competency',nl:'Gereedschapbekwaamheid'},
  'Araç Kullanımı':{en:'Tool Usage',nl:'Gereedschapgebruik'},'Araç Kullanım Kılavuzu':{en:'Tool Manual',nl:'Gereedschaphandleiding'},
  'Araç Talimatı':{en:'Tool Instruction',nl:'Gereedschapinstructie'},'Araç Güvenliği':{en:'Tool Safety',nl:'Gereedschapveiligheid'},
  'Araç Risk Analizi':{en:'Tool Risk Analysis',nl:'Gereedschaprisicoanalyse'},'Araç Kontrol Listesi':{en:'Tool Checklist',nl:'Gereedschapchecklist'},
  'Araç Envanteri':{en:'Tool Inventory',nl:'Gereedschapinventaris'},'Araç Rezervasyonu':{en:'Tool Reservation',nl:'Gereedschapreservering'},
  'Araç Kiralama':{en:'Tool Rental',nl:'Gereedschapverhuur'},'Araç İadesi':{en:'Tool Return',nl:'Gereedschapretour'},
  'Araç Değişimi':{en:'Tool Exchange',nl:'Gereedschapruil'},'Araç Onarımı':{en:'Tool Repair',nl:'Gereedschapreparatie'},
  'Araç Modernizasyonu':{en:'Tool Modernization',nl:'Gereedschapmodernisering'},'Araç Yenileme':{en:'Tool Renewal',nl:'Gereedschapvernieuwing'},
  'Araç Alımı':{en:'Tool Purchase',nl:'Gereedschapaankoop'},'Araç Satımı':{en:'Tool Sale',nl:'Gereedschapverkoop'},
  'Araç Tedariği':{en:'Tool Procurement',nl:'Gereedschapinkoop'},'Araç İmhası':{en:'Tool Disposal',nl:'Gereedschapafvoer'},
  'Araç Hurda':{en:'Tool Scrap',nl:'Gereedschapschroot'},'KPI':{en:'KPI',nl:'KPI'},'KPIler':{en:"KPI's",nl:"KPI's"},
  'Canlı Veri':{en:'Live Data',nl:'Live Gegevens'},'Gerçek Zamanlı':{en:'Real-time',nl:'Real-time'},'Anlık':{en:'Instant',nl:'Direct'},
  'Güncel':{en:'Current',nl:'Actueel'},'Yakın Zamanda':{en:'Recently',nl:'Recent'},'Bugünkü':{en:"Today's",nl:'Vandaag'},
  'Dünkü':{en:"Yesterday's",nl:'Gisteren'},'Bu Haftaki':{en:"This Week's",nl:'Deze Week'},'Bu Aylık':{en:"This Month's",nl:'Deze Maand'},
  'Bu Yıllık':{en:"This Year's",nl:'Dit Jaar'},'Karşılaştırma':{en:'Comparison',nl:'Vergelijking'},'Trend':{en:'Trend',nl:'Trend'},
  'Tahmin':{en:'Forecast',nl:'Voorspelling'},'Hedef':{en:'Target',nl:'Doel'},'Hedefler':{en:'Targets',nl:'Doelen'},
  'Bütçe':{en:'Budget',nl:'Budget'},'Bütçeleme':{en:'Budgeting',nl:'Budgettering'},'Bütçe Aşımı':{en:'Budget Overrun',nl:'Budgetoverschrijding'},
  'Bütçe Takibi':{en:'Budget Tracking',nl:'Budgettracking'},'Maliyet Analizi':{en:'Cost Analysis',nl:'Kostenanalyse'},
  'Gelir Analizi':{en:'Revenue Analysis',nl:'Omzetanalyse'},'Kar Analizi':{en:'Profit Analysis',nl:'Winstanalyse'},
  'Zarar Analizi':{en:'Loss Analysis',nl:'Verliesanalyse'},'Fiyat Analizi':{en:'Price Analysis',nl:'Prijsanalyse'},
  'Satış Analizi':{en:'Sales Analysis',nl:'Verkoopanalyse'},'Pazar Analizi':{en:'Market Analysis',nl:'Marktanalyse'},
  'Rakip Analizi':{en:'Competitor Analysis',nl:'Concurrentieanalyse'},'SWOT Analizi':{en:'SWOT Analysis',nl:'SWOT-analyse'},
  'PEST Analizi':{en:'PEST Analysis',nl:'PEST-analyse'},'Porter Analizi':{en:'Porter Analysis',nl:'Porter-analyse'},
  'Balanced Scorecard':{en:'Balanced Scorecard',nl:'Balanced Scorecard'},'Aylık Gelir':{en:'Monthly Revenue',nl:'Maandelijkse Omzet'},
  'Haftalık Gelir':{en:'Weekly Revenue',nl:'Wekelijkse Omzet'},'Günlük Gelir':{en:'Daily Revenue',nl:'Dagelijkse Omzet'},
  'Yıllık Gelir':{en:'Annual Revenue',nl:'Jaarlijkse Omzet'},'Toplam Gelir':{en:'Total Revenue',nl:'Totale Omzet'},
  'Net Gelir':{en:'Net Revenue',nl:'Netto-omzet'},'Brüt Gelir':{en:'Gross Revenue',nl:'Bruto-omzet'},
  'Aylık Gider':{en:'Monthly Expense',nl:'Maandelijkse Uitgave'},'Haftalık Gider':{en:'Weekly Expense',nl:'Wekelijkse Uitgave'},
  'Günlük Gider':{en:'Daily Expense',nl:'Dagelijkse Uitgave'},'Yıllık Gider':{en:'Annual Expense',nl:'Jaarlijkse Uitgave'},
  'Toplam Gider':{en:'Total Expense',nl:'Totale Uitgave'},'Net Gider':{en:'Net Expense',nl:'Netto-uitgave'},
  'Brüt Gider':{en:'Gross Expense',nl:'Bruto-uitgave'},'Aylık Kar':{en:'Monthly Profit',nl:'Maandelijkse Winst'},
  'Haftalık Kar':{en:'Weekly Profit',nl:'Wekelijkse Winst'},'Günlük Kar':{en:'Daily Profit',nl:'Dagelijkse Winst'},
  'Yıllık Kar':{en:'Annual Profit',nl:'Jaarlijkse Winst'},'Toplam Kar':{en:'Total Profit',nl:'Totale Winst'},
  'Net Kar':{en:'Net Profit',nl:'Nettowinst'},'Brüt Kar':{en:'Gross Profit',nl:'Brutowinst'},
  'Kar Marjı':{en:'Profit Margin',nl:'Winstmarge'},'Kar Oranı':{en:'Profit Rate',nl:'Winstpercentage'},
  'Yüzde':{en:'Percent',nl:'Percentage'},'Yüzde Değişim':{en:'Percent Change',nl:'Percentageverandering'},
  'Artış':{en:'Increase',nl:'Stijging'},'Azalış':{en:'Decrease',nl:'Daling'},'Değişim':{en:'Change',nl:'Verandering'},
  'Oran':{en:'Ratio',nl:'Verhouding'},'Katsayı':{en:'Coefficient',nl:'Coëfficiënt'},'Endeks':{en:'Index',nl:'Index'},
  'Skor':{en:'Score',nl:'Score'},'Sıralama':{en:'Ranking',nl:'Ranking'},'Liderlik Tablosu':{en:'Leaderboard',nl:'Leaderboard'},
  'En İyi':{en:'Best',nl:'Beste'},'En Kötü':{en:'Worst',nl:'Slechtste'},'En Çok':{en:'Most',nl:'Meest'},
  'En Az':{en:'Least',nl:'Minst'},'Medyan':{en:'Median',nl:'Mediaan'},'Mod':{en:'Mode',nl:'Modus'},
  'Standart Sapma':{en:'Standard Deviation',nl:'Standaarddeviatie'},'Varyans':{en:'Variance',nl:'Variantie'},
  'Korelasyon':{en:'Correlation',nl:'Correlatie'},'Regresyon':{en:'Regression',nl:'Regressie'},
  'Tahmin':{en:'Prediction',nl:'Voorspelling'},'Tahmini':{en:'Estimated',nl:'Geschat'},'Gerçekleşen':{en:'Actual',nl:'Werkelijk'},
  'Beklenen':{en:'Expected',nl:'Verwacht'},'Planlanan':{en:'Planned',nl:'Gepland'},
  'Planlanan vs Gerçekleşen':{en:'Planned vs Actual',nl:'Gepland vs Werkelijk'},'Bütçe vs Gerçek':{en:'Budget vs Actual',nl:'Budget vs Werkelijk'},
  'Hedef vs Gerçek':{en:'Target vs Actual',nl:'Doel vs Werkelijk'},'Yönetim Paneli':{en:'Admin Panel',nl:'Beheerpaneel'},
  'Yönetim':{en:'Management',nl:'Beheer'},'Kontrol Paneli':{en:'Control Panel',nl:'Controlepaneel'},
  'İşlem Paneli':{en:'Action Panel',nl:'Actiepaneel'},'Filtre Paneli':{en:'Filter Panel',nl:'Filterpaneel'},
  'Arama Paneli':{en:'Search Panel',nl:'Zoekpaneel'},'Detay Paneli':{en:'Detail Panel',nl:'Detailpaneel'},
  'Özet Paneli':{en:'Summary Panel',nl:'Samenvattingspaneel'},'Grafik Paneli':{en:'Chart Panel',nl:'Grafiekpaneel'},
  'Tablo Paneli':{en:'Table Panel',nl:'Tabelpaneel'},'Liste Paneli':{en:'List Panel',nl:'Lijstpaneel'},
  'Kart Paneli':{en:'Card Panel',nl:'Kaartpaneel'},'Form Paneli':{en:'Form Panel',nl:'Formulierpaneel'},
  'Modal':{en:'Modal',nl:'Modal'},'Popup':{en:'Popup',nl:'Popup'},'Dialog':{en:'Dialog',nl:'Dialoog'},
  'Pencere':{en:'Window',nl:'Venster'},'Sekme':{en:'Tab',nl:'Tabblad'},'Sekmeler':{en:'Tabs',nl:'Tabbladen'},
  'Menü':{en:'Menu',nl:'Menu'}
};

// Generic placeholder translations for unknown Turkish text
function translateGeneric(trText) {
  // Try exact match first
  if (dict[trText]) {
    return dict[trText];
  }
  // Try case-insensitive
  const lower = trText.toLowerCase();
  for (const [key, val] of Object.entries(dict)) {
    if (key.toLowerCase() === lower) return val;
  }
  return null;
}

// Build i18n object from extracted text
function buildI18n(extractedTexts) {
  const tr = {}, en = {}, nl = {};
  let idx = 0;
  for (const text of extractedTexts) {
    const key = 'k' + idx++;
    tr[key] = text;
    const t = translateGeneric(text);
    if (t) {
      en[key] = t.en;
      nl[key] = t.nl;
    } else {
      // For unknown text, use Turkish as fallback (user can refine later)
      en[key] = text;
      nl[key] = text;
    }
  }
  return { tr, en, nl };
}

// Extract visible text nodes from HTML (simplified)
function extractTexts(html) {
  const texts = new Set();
  // Match text between tags that is not just whitespace
  const textRegex = />\s*([^<]{2,50})\s*</g;
  let m;
  while ((m = textRegex.exec(html)) !== null) {
    const text = m[1].trim();
    // Skip if looks like code, numbers only, or already has data-i18n
    if (/^[\d\s\W]+$/.test(text)) continue;
    if (text.startsWith('<!--')) continue;
    if (text.includes('data-i18n')) continue;
    if (text.length < 2) continue;
    // Skip common non-translatable patterns
    if (/^(\d+|\d+\.\d+|\d+%|\$[\d\.]+|€[\d\.]+|[\d\.]+\s*(px|em|rem|%|vh|vw|pt|cm|mm|in|kg|g|mg|l|ml|m|km|cm|mm|ft|in|yd|mi|gal|qt|pt|cup|tbsp|tsp|oz|lb|st|dr|gr|ct|mmHg|atm|bar|Pa|kPa|MPa|GPa|J|kJ|MJ|cal|kcal|Wh|kWh|MWh|eV|erg|hp|W|kW|MW|GW|TW|V|mV|kV|MV|A|mA|kA|Ω|mΩ|kΩ|MΩ|F|mF|μF|nF|pF|H|mH|μH|nH|pH|Wb|Tm|lm|lx|Bq|Ci|Gy|Sv|kat|mol|mM|μM|nM|pM|fM|aM|zM|yM|daM|hM|kM|MM|GM|TM|PM|EM|ZM|YM|m|km|dm|cm|mm|μm|nm|pm|fm|am|zm|ym|dam|hm|Mm|Gm|Tm|Pm|Em|Zm|Ym|m²|km²|dm²|cm²|mm²|μm²|nm²|ha|a|m³|km³|dm³|cm³|mm³|μm³|nm³|l|dl|cl|ml|hL|daL|kL|ML|GL|TL|PL|EL|ZL|YL|m/s|km/h|mph|kn|m/s²|N|kN|MN|GN|TN|PN|EN|ZN|YN|mN|μN|nN|pN|fN|aN|zN|yN|J|kJ|MJ|GJ|TJ|PJ|EJ|ZJ|YJ|mJ|μJ|nJ|pJ|fJ|aJ|zJ|yJ|W|kW|MW|GW|TW|PW|EW|ZW|YW|mW|μW|nW|pW|fW|aW|zW|yW|Pa|kPa|MPa|GPa|TPa|PPa|EPa|ZPa|YPa|mPa|μPa|nPa|pPa|fPa|aPa|zPa|yPa|Hz|kHz|MHz|GHz|THz|PHz|EHz|ZHz|YHz|mHz|μHz|nHz|pHz|fHz|aHz|zHz|yHz|°C|°F|K|°R|°De|°N|°Ré|°Rø|°W|°H|°L|°M|°P|°S|°T|°V|°Z|°A|°B|°D|°E|°G|°I|°J|°O|°Q|°U|°X|°Y|°a|°b|°c|°d|°e|°f|°g|°h|°i|°j|°k|°l|°m|°n|°o|°p|°q|°r|°s|°t|°u|°v|°w|°x|°y|°z))$/.test(text)) continue;
    texts.add(text);
  }
  return Array.from(texts);
}

const switchLangScript = `
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

const langSwitcherHtml = `
  <div class="lang-switcher">
    <button data-lang="tr" class="active" onclick="switchLang('tr')">TR</button>
    <button data-lang="en" onclick="switchLang('en')">EN</button>
    <button data-lang="nl" onclick="switchLang('nl')">NL</button>
  </div>
`;

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

for (const file of files) {
  const filepath = path.join(baseDir, file);
  if (!fs.existsSync(filepath)) {
    console.log('SKIP (not found): ' + file);
    continue;
  }
  
  let html = fs.readFileSync(filepath, 'utf8');
  
  // 1. Add lang-switcher CSS to <style> or create inline style block
  if (!html.includes('.lang-switcher')) {
    // Try to add before </style> in first <style> block, or before </head>
    if (html.includes('</style>')) {
      html = html.replace('</style>', langSwitcherCss + '\n</style>');
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', '<style>' + langSwitcherCss + '</style>\n</head>');
    }
  }
  
  // 2. Add lang-switcher HTML in navbar/header area
  if (!html.includes('class="lang-switcher"')) {
    // Look for common navbar patterns and insert before closing div
    // Pattern 1: nav with right-aligned items
    const navPattern = /(<nav[^>]*>[\s\S]*?)(<\/nav>)/i;
    const headerPattern = /(<header[^>]*>[\s\S]*?)(<\/header>)/i;
    const divNavPattern = /(<div[^>]*style="[^"]*display:flex[^"]*"[^>]*>[\s\S]*?)(<\/div>\s*(?:<\/nav>|<\/header>))/i;
    
    if (navPattern.test(html)) {
      html = html.replace(navPattern, (match, p1, p2) => {
        // Insert lang switcher before the last closing tag inside nav
        if (p1.includes('</div>')) {
          return p1.replace(/(<\/div>)(\s*<\/nav>)/i, langSwitcherHtml + '$1$2');
        }
        return p1 + langSwitcherHtml + p2;
      });
    } else if (headerPattern.test(html)) {
      html = html.replace(headerPattern, (match, p1, p2) => {
        return p1 + langSwitcherHtml + p2;
      });
    }
  }
  
  // 3. Extract texts and build i18n
  const extracted = extractTexts(html);
  const i18nObj = buildI18n(extracted);
  
  // 4. Add data-i18n attributes to text elements
  let keyIdx = 0;
  // Replace text content with data-i18n attributes for non-script/style content
  // This is a simplified approach - we process text between > and < 
  html = html.replace(/>([^<]{2,100})</g, (match, text) => {
    const trimmed = text.trim();
    if (!trimmed || /^[\d\s\W]+$/.test(trimmed)) return match;
    if (trimmed.startsWith('<!--')) return match;
    if (trimmed.includes('data-i18n')) return match;
    if (trimmed.length < 2) return match;
    
    const key = 'k' + keyIdx++;
    // Only add if the text exists in our extracted list
    if (extracted.includes(trimmed)) {
      // Try to add data-i18n to the opening tag
      // This is tricky - we need to modify the preceding tag
      return match; // Skip for now, we'll do a second pass
    }
    return match;
  });
  
  // Second pass: add data-i18n to elements that contain known text
  let keyIdx2 = 0;
  for (const text of extracted) {
    const key = 'k' + keyIdx2++;
    // Create regex to find elements containing this exact text
    const escText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(<(?!script|style|title|meta|link)[a-zA-Z][^>]*?)>(\\s*${escText}\\s*)<`, 'g');
    html = html.replace(regex, `$1 data-i18n="${key}">$2<`);
  }
  
  // 5. Add data-i18n-placeholder to inputs with placeholders
  const placeholderRegex = /placeholder="([^"]{2,50})"/g;
  let phMatch;
  let phIdx = 0;
  while ((phMatch = placeholderRegex.exec(html)) !== null) {
    const phText = phMatch[1];
    if (!/^[\d\s\W]+$/.test(phText) && phText.length >= 2) {
      const key = 'ph' + phIdx++;
      i18nObj.tr[key] = phText;
      const t = translateGeneric(phText);
      if (t) {
        i18nObj.en[key] = t.en;
        i18nObj.nl[key] = t.nl;
      } else {
        i18nObj.en[key] = phText;
        i18nObj.nl[key] = phText;
      }
      // Replace this specific placeholder
      html = html.replace(`placeholder="${phText}"`, `placeholder="${phText}" data-i18n-placeholder="${key}"`);
    }
  }
  
  // 6. Add meta tag translations
  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description"([^>]*)>/i, `<meta name="description" data-i18n-attr="content" data-i18n="meta_desc"$1>`);
    i18nObj.tr.meta_desc = 'CleanFix — İşletme yönetim platformu';
    i18nObj.en.meta_desc = 'CleanFix — Business management platform';
    i18nObj.nl.meta_desc = 'CleanFix — Bedrijfsbeheerplatform';
  }
  
  // 7. Add title translation
  if (html.includes('<title>')) {
    html = html.replace(/<title>([^<]*)<\/title>/i, '<title data-i18n="page_title">$1</title>');
    const titleMatch = html.match(/<title data-i18n="page_title">([^<]*)<\/title>/i);
    if (titleMatch) {
      i18nObj.tr.page_title = titleMatch[1];
      const t = translateGeneric(titleMatch[1]);
      if (t) {
        i18nObj.en.page_title = t.en;
        i18nObj.nl.page_title = t.nl;
      } else {
        i18nObj.en.page_title = titleMatch[1];
        i18nObj.nl.page_title = titleMatch[1];
      }
    }
  }
  
  // 8. Inject i18n script before </body>
  const i18nScript = `
<script>
/* ============================
   i18n — 3 Language Support
   TR | EN | NL
   ============================ */
const i18n = ${JSON.stringify(i18nObj, null, 2)};
${switchLangScript}
/* Init */
switchLang(currentLang);
</script>`;
  
  if (html.includes('</body>')) {
    html = html.replace('</body>', i18nScript + '\n</body>');
  } else if (html.includes('</html>')) {
    html = html.replace('</html>', i18nScript + '\n</html>');
  }
  
  fs.writeFileSync(filepath, html, 'utf8');
  const stats = fs.statSync(filepath);
  console.log('DONE: ' + file + ' (' + stats.size + ' bytes, ' + Object.keys(i18nObj.tr).length + ' keys)');
}

console.log('\\nAll files processed!');
