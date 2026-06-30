/* ============================================================================
   Shared CRM lead data + email-activity rules.
   Single source of truth, loaded by BOTH the leads page and the dashboard via
   <script src="../shared/leads-comms.js"></script> so their numbers always agree.
   Plain classic script — attaches everything to window.CCLeads.
   ============================================================================ */
(function (global) {
  // Canonical lead seed — moved verbatim out of coreconnect_leads_v83.html.
  const LEADS = [
  {no:1,active:true,status:'Active',name:'Ac Thakur',email:'acthakur@yahoo.com',phone:'(215) 915-0731',source:'Cars',stock:'063018',vehicle:'2010 Bentley Contin.',lastAttempt:'May 17, Sun 8:19 PM',hrs:'2:01',assign:'DP',calls:'0/0',sms:'3/3',ac:'#534AB7'},
  {no:2,active:true,status:'Active',name:'Kristina Stuf…',email:'',phone:'(970) 275-9251',source:'Cars',stock:'012093',vehicle:'2018 Subaru Legacy',lastAttempt:'May 17, Sun 7:06 PM',hrs:'3:14',assign:'DP',calls:'0/0',sms:'1/2',ac:'#0F6E56'},
  {no:3,active:true,status:'Active',name:'Taylor Dang',email:'taydang00@gmail.com',phone:'(703) 868-1333',source:'Cars',stock:'017115',vehicle:'2008 Lexus SC 430',lastAttempt:'May 17, Sun 7:06 PM',hrs:'3:14',assign:'DP',calls:'0/0',sms:'1/2',ac:'#993C1D'},
  {no:4,active:true,status:'BDC - Show',name:'Gage Quarles',email:'gquarles03@gmail.com',phone:'(346) 284-2557',source:'Capital One',stock:'339888',vehicle:'2017 Ford Mustang',lastAttempt:'May 17, Sun 9:22 PM',hrs:'1:58',assign:'DP',calls:'0/0',sms:'2/3',ac:'#185FA5'},
  {no:5,active:true,status:'BDC - No Show',name:'Jason Stark',email:'jcstark1987@gmail.com',phone:'(281) 635-3495',source:'Cars',stock:'473432_1',vehicle:'2018 Hyundai Elan…',lastAttempt:'May 17, Sun 8:18 PM',hrs:'2:02',assign:'DP',calls:'0/0',sms:'1/3',ac:'#3B6D11'},
  {no:6,active:true,status:'Active',name:'Christian Webster',email:'orion87_05@yahoo.com',phone:'(832) 401-7615',source:'Capital One',stock:'388911',vehicle:'2024 Nissan Sentra',lastAttempt:'May 17, Sun 7:06 PM',hrs:'3:14',assign:'DP',calls:'0/0',sms:'2/2',ac:'#72243E'},
  {no:7,active:true,status:'Active',name:'Saurabh Singh',email:'socials.velocity@gmail.com',phone:'(884) 034-8783',source:'Web',stock:'',vehicle:'—',lastAttempt:'May 17, Sun 7:03 PM',hrs:'3:17',assign:null,calls:'0/0',sms:'0/0',ac:'#854F0B'},
  {no:8,active:true,status:'Follow Up',name:'Name Unknown',email:'',phone:'(346) 853-0758',source:'Loan App',stock:'269033',vehicle:'2021 Chevrolet Tahoe',lastAttempt:'May 15, Fri 5:16 PM',hrs:'53:03',assign:'JD',calls:'1/1',sms:'1/2',ac:'#444441'},
  {no:9,active:true,status:'BDC - Follow Up',name:'Jasbir Chandok',email:'jassichandok36@gmail.com',phone:'(346) 324-7346',source:'CarGurus',stock:'238944',vehicle:'2018 Hyundai Elantra',lastAttempt:'May 15, Fri 12:00 PM',hrs:'58:20',assign:'DP',calls:'0/0',sms:'8/5',ac:'#533AB7'},
  {no:10,active:false,status:'Follow Up',name:'Maria Trapp',email:'mtrapp@ehra.team',phone:'',source:'CarGurus',stock:'067051',vehicle:'2022 Toyota Camry',lastAttempt:'May 16, Sat 4:48 PM',hrs:'29:31',assign:null,calls:'0/0',sms:'0/0',ac:'#993C56'},
  {no:11,active:true,status:'Deposit',name:'Derek Huff',email:'dhuff@gmail.com',phone:'(713) 555-0192',source:'Cars',stock:'112233',vehicle:'2019 Honda Accord',lastAttempt:'May 17, Sun 6:00 PM',hrs:'4:10',assign:'DP',calls:'1/2',sms:'2/4',ac:'#185FA5'},
  {no:12,active:true,status:'BDC - Reschedule',name:'Priya Mehta',email:'priya.m@outlook.com',phone:'(832) 555-0143',source:'CarGurus',stock:'445566',vehicle:'2021 Tesla Model 3',lastAttempt:'May 17, Sun 5:30 PM',hrs:'4:40',assign:'JD',calls:'0/1',sms:'1/1',ac:'#0F6E56'},
  {no:13,active:false,status:'Dead',name:'Carlos Rivera',email:'',phone:'(281) 555-0167',source:'Web',stock:'778899',vehicle:'2020 Chevy Malibu',lastAttempt:'May 16, Sat 3:00 PM',hrs:'31:10',assign:null,calls:'0/0',sms:'0/1',ac:'#993C1D'},
  {no:14,active:true,status:'BDC - Appt Set',name:'Sandra Lee',email:'sandra.lee@yahoo.com',phone:'(346) 555-0188',source:'Capital One',stock:'334455',vehicle:'2022 Ford Explorer',lastAttempt:'May 17, Sun 4:15 PM',hrs:'5:55',assign:'DP',calls:'0/0',sms:'3/3',ac:'#72243E'},
  {no:15,active:true,status:'Active',name:'James Okoye',email:'james.o@gmail.com',phone:'(713) 555-0211',source:'Loan App',stock:'',vehicle:'—',lastAttempt:'May 17, Sun 9:45 PM',hrs:'0:25',assign:null,calls:'0/0',sms:'0/0',ac:'#854F0B'},
  {no:16,active:true,status:'Sold',name:'Mei Huang',email:'mei.h@hotmail.com',phone:'(832) 555-0255',source:'Cars',stock:'556677',vehicle:'2023 Toyota RAV4',lastAttempt:'May 17, Sun 8:00 PM',hrs:'2:10',assign:'DP',calls:'1/1',sms:'2/2',ac:'#3B6D11'},
  {no:17,active:true,status:'Follow Up',name:'Luis Garza',email:'lgarza@gmail.com',phone:'(281) 555-0299',source:'CarGurus',stock:'667788',vehicle:'2018 Dodge Charger',lastAttempt:'May 16, Sat 1:00 PM',hrs:'33:10',assign:'JD',calls:'2/3',sms:'1/2',ac:'#534AB7'},
  {no:18,active:false,status:'Follow Up',name:'Tina Brooks',email:'tbrooks@live.com',phone:'',source:'Web',stock:'889900',vehicle:'2017 Kia Optima',lastAttempt:'May 15, Fri 11:00 AM',hrs:'59:10',assign:null,calls:'0/0',sms:'0/0',ac:'#444441'},
  {no:19,active:true,status:'Active',name:'Omar Shaikh',email:'omar.shaikh@gmail.com',phone:'(713) 555-0322',source:'Cars',stock:'990011',vehicle:'2020 BMW 3 Series',lastAttempt:'May 17, Sun 7:45 PM',hrs:'2:25',assign:'DP',calls:'0/0',sms:'1/3',ac:'#185FA5'},
  {no:20,active:true,status:'Active',name:'Rachel Kim',email:'rkim@outlook.com',phone:'(346) 555-0344',source:'Capital One',stock:'',vehicle:'—',lastAttempt:'May 17, Sun 10:00 PM',hrs:'0:10',assign:null,calls:'0/0',sms:'0/0',ac:'#993C56'},
  {no:21,active:true,status:'BDC - Show',name:'Daniel Park',email:'dpark@gmail.com',phone:'(415) 555-0401',source:'Cars',stock:'101122',vehicle:'2019 Honda Civic',lastAttempt:'May 17, Sun 6:30 PM',hrs:'5:40',assign:'MR',calls:'1/1',sms:'2/2',ac:'#4f7cff'},
  {no:22,active:true,status:'Active',name:'Sophia Reyes',email:'sreyes@yahoo.com',phone:'(213) 555-0412',source:'CarGurus',stock:'212233',vehicle:'2021 Mazda CX-5',lastAttempt:'May 17, Sun 5:00 PM',hrs:'7:10',assign:'TK',calls:'0/0',sms:'1/2',ac:'#22c88a'},
  {no:23,active:true,status:'Follow Up',name:'Ethan Wright',email:'ewright@hotmail.com',phone:'(512) 555-0423',source:'Loan App',stock:'323344',vehicle:'2018 Ford F-150',lastAttempt:'May 16, Sat 9:00 PM',hrs:'25:10',assign:'SL',calls:'2/2',sms:'1/3',ac:'#f5a623'},
  {no:24,active:true,status:'BDC - Appt Set',name:'Isabella Costa',email:'icosta@gmail.com',phone:'(305) 555-0434',source:'Capital One',stock:'434455',vehicle:'2022 Hyundai Tucson',lastAttempt:'May 17, Sun 12:00 PM',hrs:'10:10',assign:'AB',calls:'1/2',sms:'3/3',ac:'#a78bfa'},
  {no:25,active:true,status:'Active',name:'Noah Bennett',email:'nbennett@outlook.com',phone:'(720) 555-0445',source:'Cars',stock:'545566',vehicle:'2020 Subaru Outback',lastAttempt:'May 17, Sun 8:00 AM',hrs:'14:10',assign:'NC',calls:'0/0',sms:'1/2',ac:'#e85555'},
  {no:26,active:false,status:'Dead',name:'Mia Foster',email:'',phone:'(617) 555-0456',source:'Web',stock:'656677',vehicle:'2016 Toyota Corolla',lastAttempt:'May 14, Thu 3:00 PM',hrs:'76:10',assign:null,calls:'0/0',sms:'0/1',ac:'#0F6E56'},
  {no:27,active:true,status:'BDC - No Show',name:'Liam Becker',email:'lbecker@gmail.com',phone:'(303) 555-0467',source:'CarGurus',stock:'767788',vehicle:'2019 Jeep Wrangler',lastAttempt:'May 16, Sat 6:00 PM',hrs:'28:10',assign:'RG',calls:'1/0',sms:'2/2',ac:'#534AB7'},
  {no:28,active:true,status:'Active',name:'Ava Sullivan',email:'asullivan@yahoo.com',phone:'(602) 555-0478',source:'Cars',stock:'878899',vehicle:'2023 Kia Sportage',lastAttempt:'May 17, Sun 3:00 PM',hrs:'9:10',assign:'EW',calls:'0/0',sms:'2/2',ac:'#185FA5'},
  {no:29,active:true,status:'Sold',name:'Mason Reid',email:'mreid@gmail.com',phone:'(310) 555-0489',source:'Loan App',stock:'989900',vehicle:'2022 Nissan Altima',lastAttempt:'May 15, Fri 4:00 PM',hrs:'54:10',assign:'LP',calls:'3/3',sms:'4/4',ac:'#993C1D'},
  {no:30,active:true,status:'Deposit',name:'Charlotte Hale',email:'chale@outlook.com',phone:'(206) 555-0501',source:'CarGurus',stock:'109911',vehicle:'2021 Audi Q5',lastAttempt:'May 16, Sat 2:00 PM',hrs:'32:10',assign:'OH',calls:'2/2',sms:'3/4',ac:'#3B6D11'},
  {no:31,active:true,status:'BDC - Reschedule',name:'Logan Wells',email:'lwells@gmail.com',phone:'(415) 555-0512',source:'Web',stock:'',vehicle:'—',lastAttempt:'May 17, Sun 11:00 AM',hrs:'11:10',assign:'MK',calls:'0/1',sms:'1/2',ac:'#72243E'},
  {no:32,active:true,status:'Follow Up',name:'Amelia Brooks',email:'abrooks@yahoo.com',phone:'(404) 555-0523',source:'Cars',stock:'121122',vehicle:'2019 Volkswagen Jetta',lastAttempt:'May 15, Fri 10:00 AM',hrs:'60:10',assign:'PN',calls:'1/1',sms:'2/3',ac:'#854F0B'},
  {no:33,active:false,status:'Dead',name:'Henry Cole',email:'hcole@hotmail.com',phone:'(214) 555-0534',source:'Capital One',stock:'232233',vehicle:'2017 Chrysler 300',lastAttempt:'May 13, Wed 9:00 AM',hrs:'106:10',assign:null,calls:'0/0',sms:'0/0',ac:'#444441'},
  {no:34,active:true,status:'BDC - Follow Up',name:'Evelyn Tan',email:'etan@gmail.com',phone:'(415) 555-0545',source:'CarGurus',stock:'343344',vehicle:'2020 Lexus RX',lastAttempt:'May 16, Sat 8:00 PM',hrs:'26:10',assign:'CT',calls:'2/2',sms:'3/3',ac:'#4f7cff'},
  {no:35,active:true,status:'Active',name:'Jack Morrison',email:'jmorrison@outlook.com',phone:'(312) 555-0556',source:'Cars',stock:'454455',vehicle:'2022 Ford Bronco',lastAttempt:'May 17, Sun 1:00 PM',hrs:'9:10',assign:'DV',calls:'0/0',sms:'1/2',ac:'#22c88a'},
  {no:36,active:true,status:'Follow Up',name:'Harper Reeves',email:'',phone:'(786) 555-0567',source:'Loan App',stock:'565566',vehicle:'2018 Cadillac XT5',lastAttempt:'May 15, Fri 2:00 PM',hrs:'56:10',assign:'FA',calls:'1/2',sms:'0/0',ac:'#f5a623'},
  {no:37,active:true,status:'BDC - Appt Set',name:'Owen Pierce',email:'opierce@yahoo.com',phone:'(503) 555-0578',source:'Web',stock:'676677',vehicle:'2021 Chevrolet Equinox',lastAttempt:'May 17, Sun 4:00 PM',hrs:'6:10',assign:'GS',calls:'0/1',sms:'2/3',ac:'#a78bfa'},
  {no:38,active:true,status:'Active',name:'Lily Chen',email:'lchen@gmail.com',phone:'(415) 555-0589',source:'Cars',stock:'787788',vehicle:'2023 Tesla Model Y',lastAttempt:'May 17, Sun 9:00 AM',hrs:'13:10',assign:'HM',calls:'1/1',sms:'3/3',ac:'#e85555'},
  {no:39,active:true,status:'Sold',name:'Wyatt Lane',email:'wlane@hotmail.com',phone:'(720) 555-0590',source:'Capital One',stock:'898899',vehicle:'2022 GMC Acadia',lastAttempt:'May 14, Thu 11:00 AM',hrs:'80:10',assign:'DP',calls:'3/3',sms:'4/4',ac:'#0F6E56'},
  {no:40,active:false,status:'Follow Up',name:'Zoe Vargas',email:'zvargas@gmail.com',phone:'',source:'CarGurus',stock:'',vehicle:'—',lastAttempt:'May 14, Thu 5:00 PM',hrs:'74:10',assign:null,calls:'0/0',sms:'0/0',ac:'#534AB7'},
  {no:41,active:true,status:'BDC - Show',name:'Caleb Knox',email:'cknox@outlook.com',phone:'(602) 555-0612',source:'Cars',stock:'010122',vehicle:'2020 Mercedes C-Class',lastAttempt:'May 17, Sun 7:00 PM',hrs:'3:10',assign:'JD',calls:'1/1',sms:'2/2',ac:'#185FA5'},
  {no:42,active:true,status:'Active',name:'Grace Donovan',email:'gdonovan@yahoo.com',phone:'(305) 555-0623',source:'Web',stock:'121233',vehicle:'2019 Buick Enclave',lastAttempt:'May 17, Sun 2:00 PM',hrs:'8:10',assign:'MR',calls:'0/0',sms:'1/3',ac:'#993C1D'},
  {no:43,active:true,status:'BDC - No Show',name:'Ryan Tate',email:'rtate@gmail.com',phone:'(404) 555-0634',source:'Loan App',stock:'232344',vehicle:'2021 RAM 1500',lastAttempt:'May 16, Sat 4:00 PM',hrs:'30:10',assign:'TK',calls:'2/0',sms:'1/2',ac:'#3B6D11'},
  {no:44,active:true,status:'Follow Up',name:'Eleanor Page',email:'epage@hotmail.com',phone:'(312) 555-0645',source:'Cars',stock:'343455',vehicle:'2018 Acura MDX',lastAttempt:'May 16, Sat 10:00 AM',hrs:'36:10',assign:'SL',calls:'1/1',sms:'2/3',ac:'#72243E'},
  {no:45,active:true,status:'Active',name:'Sebastian Hart',email:'shart@gmail.com',phone:'(415) 555-0656',source:'CarGurus',stock:'454566',vehicle:'2022 Toyota 4Runner',lastAttempt:'May 17, Sun 6:00 PM',hrs:'4:10',assign:'AB',calls:'0/0',sms:'2/2',ac:'#854F0B'},
  {no:46,active:false,status:'Dead',name:'Penelope Yu',email:'pyu@outlook.com',phone:'(206) 555-0667',source:'Web',stock:'565677',vehicle:'2015 Mitsubishi Outlander',lastAttempt:'May 12, Tue 3:00 PM',hrs:'124:10',assign:null,calls:'0/0',sms:'0/1',ac:'#444441'},
  {no:47,active:true,status:'BDC - Reschedule',name:'Eli Sanders',email:'esanders@yahoo.com',phone:'(720) 555-0678',source:'Capital One',stock:'676788',vehicle:'2020 Volvo XC60',lastAttempt:'May 17, Sun 10:00 AM',hrs:'12:10',assign:'NC',calls:'0/1',sms:'1/2',ac:'#4f7cff'},
  {no:48,active:true,status:'Active',name:'Aurora Klein',email:'aklein@gmail.com',phone:'(602) 555-0689',source:'Cars',stock:'787899',vehicle:'2023 Honda Pilot',lastAttempt:'May 17, Sun 11:30 AM',hrs:'10:40',assign:'RG',calls:'0/0',sms:'1/2',ac:'#22c88a'},
  {no:49,active:true,status:'Deposit',name:'Theo Mendoza',email:'tmendoza@hotmail.com',phone:'(213) 555-0690',source:'Loan App',stock:'898900',vehicle:'2021 Lincoln Navigator',lastAttempt:'May 15, Fri 6:00 PM',hrs:'52:10',assign:'EW',calls:'2/2',sms:'3/4',ac:'#f5a623'},
  {no:50,active:true,status:'BDC - Follow Up',name:'Naomi Frost',email:'nfrost@gmail.com',phone:'(503) 555-0701',source:'CarGurus',stock:'909011',vehicle:'2019 Mazda 6',lastAttempt:'May 16, Sat 12:00 PM',hrs:'34:10',assign:'LP',calls:'1/1',sms:'2/3',ac:'#a78bfa'},
  {no:51,active:true,status:'Active',name:'Hudson Pratt',email:'',phone:'(786) 555-0712',source:'Cars',stock:'',vehicle:'—',lastAttempt:'May 17, Sun 9:30 PM',hrs:'0:40',assign:null,calls:'0/0',sms:'0/0',ac:'#e85555'},
  {no:52,active:true,status:'Sold',name:'Violet Park',email:'vpark@outlook.com',phone:'(312) 555-0723',source:'Web',stock:'020122',vehicle:'2022 Hyundai Palisade',lastAttempt:'May 14, Thu 9:00 AM',hrs:'82:10',assign:'OH',calls:'3/3',sms:'5/5',ac:'#0F6E56'},
  {no:53,active:false,status:'Follow Up',name:'Asher Bowen',email:'abowen@yahoo.com',phone:'',source:'Capital One',stock:'131233',vehicle:'2017 BMW X3',lastAttempt:'May 13, Wed 4:00 PM',hrs:'99:10',assign:null,calls:'0/0',sms:'0/0',ac:'#534AB7'},
  {no:54,active:true,status:'BDC - Show',name:'Hazel Ortiz',email:'hortiz@gmail.com',phone:'(415) 555-0745',source:'CarGurus',stock:'242344',vehicle:'2020 Genesis G70',lastAttempt:'May 17, Sun 5:30 PM',hrs:'6:40',assign:'MK',calls:'1/2',sms:'2/3',ac:'#185FA5'},
  {no:55,active:true,status:'Active',name:'Levi Quinn',email:'lquinn@hotmail.com',phone:'(720) 555-0756',source:'Cars',stock:'353455',vehicle:'2023 Ford Explorer',lastAttempt:'May 17, Sun 8:30 AM',hrs:'13:40',assign:'PN',calls:'0/0',sms:'1/2',ac:'#993C1D'},
  {no:56,active:true,status:'BDC - Appt Set',name:'Stella Reyes',email:'sreyes2@gmail.com',phone:'(213) 555-0767',source:'Loan App',stock:'464566',vehicle:'2021 Cadillac Escalade',lastAttempt:'May 16, Sat 5:00 PM',hrs:'29:10',assign:'CT',calls:'1/1',sms:'3/3',ac:'#3B6D11'},
  ];

  // Mirrors the leads-page Email column: a contacted lead WITH an email address carries the
  // seed email thread = 1 outbound + 1 inbound. Keep these two in step with sampleMessages.email
  // in the leads page if that seed thread ever changes.
  const EMAIL_SEED_OUT = 1, EMAIL_SEED_IN = 1;

  function isEngaged(l){ return (l.calls !== '0/0') || (l.sms !== '0/0'); }

  function emailCountsForLead(l){
    if (!l || !l.email || !isEngaged(l)) return { out: 0, in: 0 };
    return { out: EMAIL_SEED_OUT, in: EMAIL_SEED_IN };
  }

  // ── Period / time-window plumbing ─────────────────────────────────────────
  // Single anchor for the CRM-leads timeline (matches the leads page seed). Both pages window
  // leads by createdAt against this. createdOffsets are hours-back-from-NOW per lead index.
  const NOW = new Date(2026, 4, 23, 19, 0, 0);
  const createdOffsets = [
    3,6,14,30,52,80,110,150,200,260,
    340,430,520,610,720,840,960,1080,1180,1300,
    // 21-40: spread across past 60 days
    8,12,22,40,68,95,130,180,240,320,
    410,500,580,680,800,920,1020,1140,1240,1380,
    // 41-56: older bucket + variety
    18,36,60,90,145,210,290,380,470,560,
    660,780,890,1050,1220,1450
  ];
  function leadHoursBack(i){ return createdOffsets[i] != null ? createdOffsets[i] : (3 + i * 60); }
  // Mirrors the leads-page period filter thresholds (Today <24h, week <168h, month <720h/30d).
  function leadInPeriod(i, period){
    if (period === 'all' || period == null) return true;
    const H = period === 'today' ? 24 : period === 'week' ? 168 : 720;
    return leadHoursBack(i) < H;
  }

  // Period-aware email totals: sum email counts over the leads in scope for the period.
  // Called with no arg (or 'all') it behaves as before → 42/42.
  function emailTotals(period){
    let out = 0, inb = 0;
    LEADS.forEach((l, i) => {
      if (!leadInPeriod(i, period)) return;
      const c = emailCountsForLead(l); out += c.out; inb += c.in;
    });
    return { outbound: out, inbound: inb };
  }

  // Per-lead SMS counts, parsed from the lead's "out/in" sms field (e.g. "8/5").
  function smsCountsForLead(l){
    if (!l || !l.sms) return { out: 0, in: 0 };
    const parts = String(l.sms).split('/');
    return { out: parseInt(parts[0], 10) || 0, in: parseInt(parts[1], 10) || 0 };
  }

  // Period-aware SMS message totals: sum of sent/received SMS over the leads in scope for the period.
  // (A message total — can exceed the lead count, since a lead may have many SMS.)
  function smsTotals(period){
    let out = 0, inb = 0;
    LEADS.forEach((l, i) => {
      if (!leadInPeriod(i, period)) return;
      const c = smsCountsForLead(l); out += c.out; inb += c.in;
    });
    return { outbound: out, inbound: inb };
  }

  // Per-lead call breakdown, derived from the "out/in" calls field so the five types stay consistent:
  //   inbound = missed + answered,  outbound = returned.
  // (missed/answered split uses the dashboard's seed ratio ~37% missed of inbound.)
  function callCountsForLead(l){
    const p = String((l && l.calls) || '0/0').split('/');
    const out = parseInt(p[0], 10) || 0, inb = parseInt(p[1], 10) || 0;
    const missed = Math.round(inb * 0.37);
    return { out: out, in: inb, missed: missed, answered: inb - missed, returned: out };
  }

  // Period-aware call totals: sum each breakdown over the leads in scope for the period.
  function callTotals(period){
    let out = 0, inb = 0, missed = 0, answered = 0, returned = 0;
    LEADS.forEach((l, i) => {
      if (!leadInPeriod(i, period)) return;
      const c = callCountsForLead(l);
      out += c.out; inb += c.in; missed += c.missed; answered += c.answered; returned += c.returned;
    });
    return { outbound: out, inbound: inb, missed: missed, answered: answered, returned: returned };
  }

  // Remembered period, shared across pages via localStorage. Guarded because file:// origins
  // can throw on localStorage access — in that case we silently fall back to the default.
  function getPeriod(){ try { return localStorage.getItem('cc_period') || 'today'; } catch(e){ return 'today'; } }
  function setPeriod(p){ try { localStorage.setItem('cc_period', p); } catch(e){} }

  // ── Shared "activities" store ─────────────────────────────────────────────
  // User-created appointments / reminders / tasks. Written by the CRM contact
  // panel, read by the Appointments calendar. localStorage-backed (same guarded
  // approach as getPeriod) so the two standalone pages share one source of truth.
  // Activity shape:
  //   { id, type:'appointment'|'reminder'|'task', leadNo:Number, title:String,
  //     date:'YYYY-M-D' (1-based month, UNPADDED), time:'H:MM' ('' = all-day), notes:String }
  const ACT_KEY = 'cc_activities';
  function getActivities(){ try { return JSON.parse(localStorage.getItem(ACT_KEY) || '[]'); } catch(e){ return []; } }
  function addActivity(a){
    try {
      const list = getActivities();
      a.id = a.id || ('act_' + Date.now() + '_' + Math.floor(Math.random() * 1e4));
      list.push(a);
      localStorage.setItem(ACT_KEY, JSON.stringify(list));
    } catch(e){}
    return a;
  }
  function removeActivity(id){
    try { localStorage.setItem(ACT_KEY, JSON.stringify(getActivities().filter(function(a){ return a.id !== id; }))); } catch(e){}
  }
  function updateActivity(id, patch){
    try { localStorage.setItem(ACT_KEY, JSON.stringify(getActivities().map(function(a){ return a.id === id ? Object.assign({}, a, patch) : a; }))); } catch(e){}
  }

  // ── Canonical team roster ─────────────────────────────────────────────────
  // One list shared by the CRM (lead assignment + create-activity modals) and the
  // Appointments page (edit-modal team-member picker). {key,name,role,color}.
  const TEAM = [
    {key:'DP', name:'David Park',       role:'Sales Manager', dept:'Sales',   color:'#4f7cff'},
    {key:'JD', name:'James Donovan',    role:'Sales Rep',     dept:'Sales',   color:'#22c88a'},
    {key:'MR', name:'Maria Rodriguez',  role:'Sales Rep',     dept:'Sales',   color:'#f5a623'},
    {key:'TK', name:'Tom Keller',       role:'BDC Agent',     dept:'BDC',     color:'#a78bfa'},
    {key:'SL', name:'Sarah Lambert',    role:'Sales Rep',     dept:'Sales',   color:'#e85555'},
    {key:'AB', name:'Andre Brooks',     role:'BDC Agent',     dept:'BDC',     color:'#0F6E56'},
    {key:'NC', name:'Nina Castro',      role:'Sales Manager', dept:'Finance', color:'#534AB7'},
    {key:'RG', name:'Raj Gupta',        role:'Sales Rep',     dept:'Sales',   color:'#185FA5'},
    {key:'EW', name:'Emma Walsh',       role:'BDC Agent',     dept:'BDC',     color:'#993C1D'},
    {key:'LP', name:'Liam Patterson',   role:'Sales Rep',     dept:'Finance', color:'#3B6D11'},
    {key:'OH', name:'Olivia Hayes',     role:'Sales Rep',     dept:'Finance', color:'#72243E'},
    {key:'MK', name:'Marcus King',      role:'BDC Agent',     dept:'BDC',     color:'#854F0B'},
    {key:'PN', name:'Priya Nair',       role:'Sales Manager', dept:'Service', color:'#4f7cff'},
    {key:'CT', name:'Chris Tanaka',     role:'Sales Rep',     dept:'Sales',   color:'#22c88a'},
    {key:'DV', name:'Diana Vega',       role:'Sales Rep',     dept:'Service', color:'#f5a623'},
    {key:'FA', name:'Felix Anderson',   role:'BDC Agent',     dept:'BDC',     color:'#a78bfa'},
    {key:'GS', name:'Grace Sullivan',   role:'Sales Rep',     dept:'Sales',   color:'#e85555'},
    {key:'HM', name:'Henry Morales',    role:'BDC Agent',     dept:'BDC',     color:'#0F6E56'},
  ];

  // Persist + enrich the roster so it's the live source for Assign, the appointment team-picker,
  // and the Users settings page. Stored under cc_team; persisted copy (if any) loads over defaults.
  const TEAM_KEY = 'cc_team';
  const TEAM_PALETTE = ['#4f7cff','#22c88a','#f5a623','#e85555','#a78bfa','#2dd4bf','#ec4899','#0ea5e9','#f97316','#534AB7','#185FA5','#72243E'];
  (function loadTeam(){
    try {
      var saved = JSON.parse(localStorage.getItem(TEAM_KEY) || 'null');
      if(saved && saved.length){ TEAM.length = 0; saved.forEach(function(m){ TEAM.push(m); }); }
    } catch(e){}
  })();
  TEAM.forEach(function(u,i){
    u.phone  = u.phone  || '(555) ' + (100 + i*10) + '-' + (2000 + i);
    u.email  = u.email  || (u.name.toLowerCase().replace(/[^a-z]+/g,'.').replace(/^\.+|\.+$/g,'') + '@coreconnect.io');
    u.status = u.status || 'Active';
    u.dept   = u.dept   || ({'Sales Manager':'Sales','Sales Rep':'Sales','BDC Agent':'BDC'}[u.role] || 'Sales');
  });
  function saveTeam(){ try { localStorage.setItem(TEAM_KEY, JSON.stringify(TEAM)); } catch(e){} }
  function _teamKeyFor(name){
    var p = String(name||'').trim().split(/\s+/);
    var base = (((p[0]||'')[0]||'') + ((p[1]||p[0]||'')[0]||'') || 'U').toUpperCase();
    var key = base, n = 1;
    while(TEAM.some(function(u){ return u.key === key; })){ key = base + (++n); }
    return key;
  }
  function addTeamMember(m){
    m = m || {};
    if(!m.key)   m.key = _teamKeyFor(m.name);
    if(!m.color) m.color = TEAM_PALETTE[TEAM.length % TEAM_PALETTE.length];
    if(!m.status) m.status = 'Active';
    if(!m.createdAt) m.createdAt = Date.now();   // stamp so UIs can show newest-first
    TEAM.push(m); saveTeam(); return m;
  }
  function updateTeamMember(key, patch){
    var u = TEAM.find(function(x){ return x.key === key; });
    if(u){ Object.assign(u, patch); saveTeam(); }
    return u;
  }
  function removeTeamMember(key){
    var i = TEAM.findIndex(function(x){ return x.key === key; });
    if(i >= 0){ TEAM.splice(i, 1); saveTeam(); }
  }

  // ── Reviews seed (synced to LEADS) ────────────────────────────────────────
  // Deterministic per-lead generator → stable ~454 reviews across reloads.
  // Cached in localStorage['cc_reviews'] keyed by REVIEW_SEED_KEY.
  var REVIEW_SEED_KEY = 'v3';
  var REVIEW_CACHE_KEY = 'cc_reviews';
  var REVIEW_SOURCES = [
    {key:'google',      weight:80}, {key:'dealerrater', weight:7},
    {key:'cars',        weight:7},  {key:'cargurus',    weight:5},
    {key:'facebook',    weight:1}
  ];
  var REVIEW_BIZ = [
    'USA Direct Auto','USA Direct Auto - Downtown','USA Direct Auto - South',
    'USA Direct Auto - Westside','USA Direct Auto - Express'
  ];
  var REVIEW_TEXTS = [
    'The sales lady Keisy was very professional. My experience there was excellent and I look forward to returning if I see anything new that interests me online',
    'Smooth process from start to finish. The team really takes the time to understand what you need.',
    'Great experience! The staff was knowledgeable and patient with all my questions about financing.',
    'I had a wonderful experience purchasing my vehicle. The whole team was friendly and very helpful.',
    'Quick response to my inquiry. They had the car ready when I arrived for my appointment.',
    'Honestly the best dealership experience I have had in years. Highly recommend.',
    'Service was good but the wait was a bit long. Overall happy with the vehicle.',
    'Friendly staff and a great selection of vehicles. Will definitely come back.',
    'Decent experience, though the paperwork process took longer than expected.',
    'Not the best experience. Felt rushed during the test drive and pricing was unclear.',
    'Loved working with the team here — straightforward and no pressure.',
    'They went above and beyond to make sure I drove off happy. Five stars.',
    'Easy financing options and the team explained everything clearly.',
    'Communication could be better but the car itself is fantastic.',
    'Amazing service from the moment I walked in. The whole team treated me like family.'
  ];
  var REVIEW_ATTRS = [
    'Staff - People','Staff Behavior - Professionalism','Purchase Experience - Sales Staff',
    'Vehicle - Quality','Service - Speed','Pricing - Fair','Facility - Cleanliness',
    'Financing - Options','Communication - Responsive'
  ];
  var REVIEW_MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function _revMulberry32(seed){
    var s = seed >>> 0;
    return function(){
      s = (s + 0x6D2B79F5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function _revPickWeighted(rnd, items){
    var total = 0; items.forEach(function(it){ total += it.weight; });
    var r = rnd() * total, acc = 0;
    for(var i=0;i<items.length;i++){ acc += items[i].weight; if(r < acc) return items[i].key; }
    return items[items.length-1].key;
  }
  function _revPickRating(rnd){
    var r = rnd();
    if(r < 0.78) return 5;
    if(r < 0.93) return 4;
    if(r < 0.98) return 3;
    if(r < 0.99) return 2;
    return 1;
  }
  function _revPickStatus(rnd, rating){
    // 83% responded / 17% unresponded (negatives lean unresponded)
    var threshold = (rating <= 2) ? 0.45 : 0.83;
    return rnd() < threshold ? 'responded' : 'unresponded';
  }
  function _revFormatDate(ts){
    var d = new Date(ts);
    return REVIEW_MONTH_NAMES[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
  }
  function _revBuildSeed(){
    // Spread reviews across 18 months ending now.
    var nowMs = NOW;
    var windowMs = 18 * 30 * 24 * 60 * 60 * 1000;
    var startMs = nowMs - windowMs;
    var reviews = [];
    var id = 1;
    var TARGET = 454;
    var avgPer = Math.max(1, Math.round(TARGET / LEADS.length));
    var minPer = Math.max(1, avgPer - 2);
    var spread = 6; // [min .. min+spread-1]
    LEADS.forEach(function(lead){
      var rnd = _revMulberry32(lead.no * 9973 + 17);
      var count = minPer + Math.floor(rnd() * spread);
      for(var i=0;i<count;i++){
        var rating = _revPickRating(rnd);
        var source = _revPickWeighted(rnd, REVIEW_SOURCES);
        var biz = REVIEW_BIZ[Math.floor(rnd() * REVIEW_BIZ.length)];
        var text = REVIEW_TEXTS[Math.floor(rnd() * REVIEW_TEXTS.length)];
        var nAttr = 2 + Math.floor(rnd() * 2); // 2..3
        var attrPool = REVIEW_ATTRS.slice();
        var attributions = [];
        for(var a=0; a<nAttr && attrPool.length; a++){
          var idx = Math.floor(rnd() * attrPool.length);
          attributions.push(attrPool.splice(idx, 1)[0]);
        }
        var ts = Math.floor(startMs + rnd() * windowMs);
        var status = 'Published';
        var responseState = _revPickStatus(rnd, rating);
        var responses = (responseState === 'responded')
          ? [{ text:'Thank you for the kind words!', ts: ts + 24*60*60*1000, author:'Team', source:'user' }]
          : [];
        reviews.push({
          id: 'rv_' + (id++),
          leadNo: lead.no,
          source: source,
          biz: biz,
          rating: rating,
          text: text,
          attributions: attributions,
          date: _revFormatDate(ts),
          ts: ts,
          status: status,
          responses: responses
        });
      }
    });
    reviews.sort(function(a,b){ return b.ts - a.ts; });
    // Pin to exactly 454 for stable headline. Slice if over.
    if(reviews.length > TARGET) reviews = reviews.slice(0, TARGET);
    return reviews;
  }
  function _revLoadCached(){
    try{
      var raw = localStorage.getItem(REVIEW_CACHE_KEY);
      if(!raw) return null;
      var obj = JSON.parse(raw);
      if(!obj || obj.key !== REVIEW_SEED_KEY || !Array.isArray(obj.list)) return null;
      return obj.list;
    }catch(e){ return null; }
  }
  function _revPersist(list){
    try{ localStorage.setItem(REVIEW_CACHE_KEY, JSON.stringify({key:REVIEW_SEED_KEY, list:list})); }catch(e){}
  }
  var REVIEWS = _revLoadCached();
  if(!REVIEWS){ REVIEWS = _revBuildSeed(); _revPersist(REVIEWS); }

  function reviewsByLead(leadNo){
    return REVIEWS.filter(function(r){ return r.leadNo === leadNo; });
  }
  var _revStatsCache = null;
  function reviewStats(){
    if(_revStatsCache) return _revStatsCache;
    var s = {
      total: REVIEWS.length, avg: 0, responded:0, unresponded:0,
      notRespondable:0, pendingApproval:0,
      bySource:{google:0, facebook:0, cars:0, cargurus:0, dealerrater:0, carfax:0},
      sentiment:{pos:0, neu:0, neg:0},
      trendByYear:{}
    };
    var ratingSum = 0;
    REVIEWS.forEach(function(r){
      ratingSum += r.rating;
      var hasResp = (r.responses && r.responses.length > 0);
      if(hasResp) s.responded++;
      else if(r.status === 'Not Respondable') s.notRespondable++;
      else if(r.status === 'Pending Approval') s.pendingApproval++;
      else s.unresponded++;
      if(s.bySource[r.source] !== undefined) s.bySource[r.source]++;
      var bucket = (r.rating >= 4) ? 'pos' : (r.rating === 3 ? 'neu' : 'neg');
      s.sentiment[bucket]++;
      var year = String(new Date(r.ts).getFullYear());
      var t = s.trendByYear[year] || (s.trendByYear[year] = {pos:0, neu:0, neg:0, ratingSum:0, n:0});
      t[bucket]++; t.ratingSum += r.rating; t.n++;
    });
    s.avg = s.total ? Math.round((ratingSum / s.total) * 10) / 10 : 0;
    Object.keys(s.trendByYear).forEach(function(y){
      var t = s.trendByYear[y];
      t.avg = t.n ? Math.round((t.ratingSum / t.n) * 10) / 10 : 0;
    });
    _revStatsCache = s;
    return s;
  }

  global.CCLeads = {
    LEADS, emailCountsForLead, emailTotals, EMAIL_SEED_OUT, EMAIL_SEED_IN,
    smsCountsForLead, smsTotals,
    callCountsForLead, callTotals,
    NOW, createdOffsets, leadHoursBack, leadInPeriod, getPeriod, setPeriod,
    getActivities, addActivity, removeActivity, updateActivity,
    TEAM, saveTeam, addTeamMember, updateTeamMember, removeTeamMember,
    REVIEWS, reviewsByLead, reviewStats, reviewSeedKey: REVIEW_SEED_KEY,
    clearReviewStatsCache: function(){ _revStatsCache = null; }
  };

  // Dynamic logo text: "CoreConnect" on main app, "Reputation" on Reputation pages.
  function _syncLogoText(){
    try{
      var inRep = location.pathname.indexOf('/reputation/') >= 0;
      document.querySelectorAll('.logo-text').forEach(function(el){
        el.textContent = inRep ? 'Reputation' : 'CoreConnect';
      });
    }catch(e){}
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', _syncLogoText);
  } else {
    _syncLogoText();
  }
})(window);
