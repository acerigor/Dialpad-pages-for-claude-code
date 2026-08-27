require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

let adapter;
const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

if (dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:')) {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const dbPath = dbUrl.startsWith('file:')
    ? path.resolve(__dirname, '..', dbUrl.slice(5))
    : path.resolve(__dirname, '..', dbUrl.slice(7));
  adapter = new PrismaBetterSqlite3({ url: 'file:' + dbPath });
} else {
  const { PrismaPg } = require('@prisma/adapter-pg');
  adapter = new PrismaPg({ connectionString: dbUrl });
}

const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = 'core123';

const USERS = [
  { initials: 'DP', name: 'David P.', role: 'agent' },
  { initials: 'JD', name: 'John Davis', role: 'agent' },
  { initials: 'MR', name: 'Maria Rodriguez', role: 'agent' },
  { initials: 'TK', name: 'Tyler Kim', role: 'agent' },
  { initials: 'SL', name: 'Sarah Lee', role: 'agent' },
  { initials: 'AB', name: 'Anna Brooks', role: 'agent' },
  { initials: 'NC', name: 'Nathan Carter', role: 'agent' },
  { initials: 'RG', name: 'Ryan Garcia', role: 'agent' },
  { initials: 'EW', name: 'Emily Wang', role: 'agent' },
  { initials: 'LP', name: 'Lisa Patel', role: 'agent' },
  { initials: 'OH', name: 'Oscar Hernandez', role: 'agent' },
  { initials: 'MK', name: 'Mike Keller', role: 'agent' },
  { initials: 'PN', name: 'Paula Nguyen', role: 'agent' },
  { initials: 'CT', name: 'Chris Torres', role: 'agent' },
  { initials: 'DV', name: 'Diana Valdez', role: 'agent' },
  { initials: 'FA', name: 'Frank Adams', role: 'agent' },
  { initials: 'GS', name: 'Grace Santos', role: 'agent' },
  { initials: 'HM', name: 'Helen Martinez', role: 'agent' },
  { initials: 'AG', name: 'Angel Garcia', role: 'manager' },
  { initials: 'AR', name: 'Ace Rigor', role: 'manager' },
];

const LEADS = [
  { active: true, status: 'Active', name: 'Ac Thakur', email: 'acthakur@yahoo.com', phone: '(215) 915-0731', source: 'Cars', stock: '063018', vehicle: '2010 Bentley Contin.', assign: 'DP', accentColor: '#534AB7' },
  { active: true, status: 'Active', name: 'Kristina Stuf…', email: '', phone: '(970) 275-9251', source: 'Cars', stock: '012093', vehicle: '2018 Subaru Legacy', assign: 'DP', accentColor: '#0F6E56' },
  { active: true, status: 'Active', name: 'Taylor Dang', email: 'taydang00@gmail.com', phone: '(703) 868-1333', source: 'Cars', stock: '017115', vehicle: '2008 Lexus SC 430', assign: 'DP', accentColor: '#993C1D' },
  { active: true, status: 'BDC - Show', name: 'Gage Quarles', email: 'gquarles03@gmail.com', phone: '(346) 284-2557', source: 'Capital One', stock: '339888', vehicle: '2017 Ford Mustang', assign: 'DP', accentColor: '#185FA5' },
  { active: true, status: 'BDC - No Show', name: 'Jason Stark', email: 'jcstark1987@gmail.com', phone: '(281) 635-3495', source: 'Cars', stock: '473432_1', vehicle: '2018 Hyundai Elan…', assign: 'DP', accentColor: '#3B6D11' },
  { active: true, status: 'Active', name: 'Christian Webster', email: 'orion87_05@yahoo.com', phone: '(832) 401-7615', source: 'Capital One', stock: '388911', vehicle: '2024 Nissan Sentra', assign: 'DP', accentColor: '#72243E' },
  { active: true, status: 'Active', name: 'Saurabh Singh', email: 'socials.velocity@gmail.com', phone: '(884) 034-8783', source: 'Web', stock: '', vehicle: '—', assign: null, accentColor: '#854F0B' },
  { active: true, status: 'Follow Up', name: 'Name Unknown', email: '', phone: '(346) 853-0758', source: 'Loan App', stock: '269033', vehicle: '2021 Chevrolet Tahoe', assign: 'JD', accentColor: '#444441' },
  { active: true, status: 'BDC - Follow Up', name: 'Jasbir Chandok', email: 'jassichandok36@gmail.com', phone: '(346) 324-7346', source: 'CarGurus', stock: '238944', vehicle: '2018 Hyundai Elantra', assign: 'DP', accentColor: '#533AB7' },
  { active: false, status: 'Follow Up', name: 'Maria Trapp', email: 'mtrapp@ehra.team', phone: '', source: 'CarGurus', stock: '067051', vehicle: '2022 Toyota Camry', assign: null, accentColor: '#993C56' },
  { active: true, status: 'Deposit', name: 'Derek Huff', email: 'dhuff@gmail.com', phone: '(713) 555-0192', source: 'Cars', stock: '112233', vehicle: '2019 Honda Accord', assign: 'DP', accentColor: '#185FA5' },
  { active: true, status: 'BDC - Reschedule', name: 'Priya Mehta', email: 'priya.m@outlook.com', phone: '(832) 555-0143', source: 'CarGurus', stock: '445566', vehicle: '2021 Tesla Model 3', assign: 'JD', accentColor: '#0F6E56' },
  { active: false, status: 'Dead', name: 'Carlos Rivera', email: '', phone: '(281) 555-0167', source: 'Web', stock: '778899', vehicle: '2020 Chevy Malibu', assign: null, accentColor: '#993C1D' },
  { active: true, status: 'BDC - Appt Set', name: 'Sandra Lee', email: 'sandra.lee@yahoo.com', phone: '(346) 555-0188', source: 'Capital One', stock: '334455', vehicle: '2022 Ford Explorer', assign: 'DP', accentColor: '#72243E' },
  { active: true, status: 'Active', name: 'James Okoye', email: 'james.o@gmail.com', phone: '(713) 555-0211', source: 'Loan App', stock: '', vehicle: '—', assign: null, accentColor: '#854F0B' },
  { active: true, status: 'Sold', name: 'Mei Huang', email: 'mei.h@hotmail.com', phone: '(832) 555-0255', source: 'Cars', stock: '556677', vehicle: '2023 Toyota RAV4', assign: 'DP', accentColor: '#3B6D11' },
  { active: true, status: 'Follow Up', name: 'Luis Garza', email: 'lgarza@gmail.com', phone: '(281) 555-0299', source: 'CarGurus', stock: '667788', vehicle: '2018 Dodge Charger', assign: 'JD', accentColor: '#534AB7' },
  { active: false, status: 'Follow Up', name: 'Tina Brooks', email: 'tbrooks@live.com', phone: '', source: 'Web', stock: '889900', vehicle: '2017 Kia Optima', assign: null, accentColor: '#444441' },
  { active: true, status: 'Active', name: 'Omar Shaikh', email: 'omar.shaikh@gmail.com', phone: '(713) 555-0322', source: 'Cars', stock: '990011', vehicle: '2020 BMW 3 Series', assign: 'DP', accentColor: '#185FA5' },
  { active: true, status: 'Active', name: 'Rachel Kim', email: 'rkim@outlook.com', phone: '(346) 555-0344', source: 'Capital One', stock: '', vehicle: '—', assign: null, accentColor: '#993C56' },
  { active: true, status: 'BDC - Show', name: 'Daniel Park', email: 'dpark@gmail.com', phone: '(415) 555-0401', source: 'Cars', stock: '101122', vehicle: '2019 Honda Civic', assign: 'MR', accentColor: '#4f7cff' },
  { active: true, status: 'Active', name: 'Sophia Reyes', email: 'sreyes@yahoo.com', phone: '(213) 555-0412', source: 'CarGurus', stock: '212233', vehicle: '2021 Mazda CX-5', assign: 'TK', accentColor: '#22c88a' },
  { active: true, status: 'Follow Up', name: 'Ethan Wright', email: 'ewright@hotmail.com', phone: '(512) 555-0423', source: 'Loan App', stock: '323344', vehicle: '2018 Ford F-150', assign: 'SL', accentColor: '#f5a623' },
  { active: true, status: 'BDC - Appt Set', name: 'Isabella Costa', email: 'icosta@gmail.com', phone: '(305) 555-0434', source: 'Capital One', stock: '434455', vehicle: '2022 Hyundai Tucson', assign: 'AB', accentColor: '#a78bfa' },
  { active: true, status: 'Active', name: 'Noah Bennett', email: 'nbennett@outlook.com', phone: '(720) 555-0445', source: 'Cars', stock: '545566', vehicle: '2020 Subaru Outback', assign: 'NC', accentColor: '#e85555' },
  { active: false, status: 'Dead', name: 'Mia Foster', email: '', phone: '(617) 555-0456', source: 'Web', stock: '656677', vehicle: '2016 Toyota Corolla', assign: null, accentColor: '#0F6E56' },
  { active: true, status: 'BDC - No Show', name: 'Liam Becker', email: 'lbecker@gmail.com', phone: '(303) 555-0467', source: 'CarGurus', stock: '767788', vehicle: '2019 Jeep Wrangler', assign: 'RG', accentColor: '#534AB7' },
  { active: true, status: 'Active', name: 'Ava Sullivan', email: 'asullivan@yahoo.com', phone: '(602) 555-0478', source: 'Cars', stock: '878899', vehicle: '2023 Kia Sportage', assign: 'EW', accentColor: '#185FA5' },
  { active: true, status: 'Sold', name: 'Mason Reid', email: 'mreid@gmail.com', phone: '(310) 555-0489', source: 'Loan App', stock: '989900', vehicle: '2022 Nissan Altima', assign: 'LP', accentColor: '#993C1D' },
  { active: true, status: 'Deposit', name: 'Charlotte Hale', email: 'chale@outlook.com', phone: '(206) 555-0501', source: 'CarGurus', stock: '109911', vehicle: '2021 Audi Q5', assign: 'OH', accentColor: '#3B6D11' },
  { active: true, status: 'BDC - Reschedule', name: 'Logan Wells', email: 'lwells@gmail.com', phone: '(415) 555-0512', source: 'Web', stock: '', vehicle: '—', assign: 'MK', accentColor: '#72243E' },
  { active: true, status: 'Follow Up', name: 'Amelia Brooks', email: 'abrooks@yahoo.com', phone: '(404) 555-0523', source: 'Cars', stock: '121122', vehicle: '2019 Volkswagen Jetta', assign: 'PN', accentColor: '#854F0B' },
  { active: false, status: 'Dead', name: 'Henry Cole', email: 'hcole@hotmail.com', phone: '(214) 555-0534', source: 'Capital One', stock: '232233', vehicle: '2017 Chrysler 300', assign: null, accentColor: '#444441' },
  { active: true, status: 'BDC - Follow Up', name: 'Evelyn Tan', email: 'etan@gmail.com', phone: '(415) 555-0545', source: 'CarGurus', stock: '343344', vehicle: '2020 Lexus RX', assign: 'CT', accentColor: '#4f7cff' },
  { active: true, status: 'Active', name: 'Jack Morrison', email: 'jmorrison@outlook.com', phone: '(312) 555-0556', source: 'Cars', stock: '454455', vehicle: '2022 Ford Bronco', assign: 'DV', accentColor: '#22c88a' },
  { active: true, status: 'Follow Up', name: 'Harper Reeves', email: '', phone: '(786) 555-0567', source: 'Loan App', stock: '565566', vehicle: '2018 Cadillac XT5', assign: 'FA', accentColor: '#f5a623' },
  { active: true, status: 'BDC - Appt Set', name: 'Owen Pierce', email: 'opierce@yahoo.com', phone: '(503) 555-0578', source: 'Web', stock: '676677', vehicle: '2021 Chevrolet Equinox', assign: 'GS', accentColor: '#a78bfa' },
  { active: true, status: 'Active', name: 'Lily Chen', email: 'lchen@gmail.com', phone: '(415) 555-0589', source: 'Cars', stock: '787788', vehicle: '2023 Tesla Model Y', assign: 'HM', accentColor: '#e85555' },
  { active: true, status: 'Sold', name: 'Wyatt Lane', email: 'wlane@hotmail.com', phone: '(720) 555-0590', source: 'Capital One', stock: '898899', vehicle: '2022 GMC Acadia', assign: 'DP', accentColor: '#0F6E56' },
  { active: false, status: 'Follow Up', name: 'Zoe Vargas', email: 'zvargas@gmail.com', phone: '', source: 'CarGurus', stock: '', vehicle: '—', assign: null, accentColor: '#534AB7' },
  { active: true, status: 'BDC - Show', name: 'Caleb Knox', email: 'cknox@outlook.com', phone: '(602) 555-0612', source: 'Cars', stock: '010122', vehicle: '2020 Mercedes C-Class', assign: 'JD', accentColor: '#185FA5' },
  { active: true, status: 'Active', name: 'Grace Donovan', email: 'gdonovan@yahoo.com', phone: '(305) 555-0623', source: 'Web', stock: '121233', vehicle: '2019 Buick Enclave', assign: 'MR', accentColor: '#993C1D' },
  { active: true, status: 'BDC - No Show', name: 'Ryan Tate', email: 'rtate@gmail.com', phone: '(404) 555-0634', source: 'Loan App', stock: '232344', vehicle: '2021 RAM 1500', assign: 'TK', accentColor: '#3B6D11' },
  { active: true, status: 'Follow Up', name: 'Eleanor Page', email: 'epage@hotmail.com', phone: '(312) 555-0645', source: 'Cars', stock: '343455', vehicle: '2018 Acura MDX', assign: 'SL', accentColor: '#72243E' },
  { active: true, status: 'Active', name: 'Sebastian Hart', email: 'shart@gmail.com', phone: '(415) 555-0656', source: 'CarGurus', stock: '454566', vehicle: '2022 Toyota 4Runner', assign: 'AB', accentColor: '#854F0B' },
  { active: false, status: 'Dead', name: 'Penelope Yu', email: 'pyu@outlook.com', phone: '(206) 555-0667', source: 'Web', stock: '565677', vehicle: '2015 Mitsubishi Outlander', assign: null, accentColor: '#444441' },
  { active: true, status: 'BDC - Reschedule', name: 'Eli Sanders', email: 'esanders@yahoo.com', phone: '(720) 555-0678', source: 'Capital One', stock: '676788', vehicle: '2020 Volvo XC60', assign: 'NC', accentColor: '#4f7cff' },
  { active: true, status: 'Active', name: 'Aurora Klein', email: 'aklein@gmail.com', phone: '(602) 555-0689', source: 'Cars', stock: '787899', vehicle: '2023 Honda Pilot', assign: 'RG', accentColor: '#22c88a' },
  { active: true, status: 'Deposit', name: 'Theo Mendoza', email: 'tmendoza@hotmail.com', phone: '(213) 555-0690', source: 'Loan App', stock: '898900', vehicle: '2021 Lincoln Navigator', assign: 'EW', accentColor: '#f5a623' },
  { active: true, status: 'BDC - Follow Up', name: 'Naomi Frost', email: 'nfrost@gmail.com', phone: '(503) 555-0701', source: 'CarGurus', stock: '909011', vehicle: '2019 Mazda 6', assign: 'LP', accentColor: '#a78bfa' },
  { active: true, status: 'Active', name: 'Hudson Pratt', email: '', phone: '(786) 555-0712', source: 'Cars', stock: '', vehicle: '—', assign: null, accentColor: '#e85555' },
  { active: true, status: 'Sold', name: 'Violet Park', email: 'vpark@outlook.com', phone: '(312) 555-0723', source: 'Web', stock: '020122', vehicle: '2022 Hyundai Palisade', assign: 'OH', accentColor: '#0F6E56' },
  { active: false, status: 'Follow Up', name: 'Asher Bowen', email: 'abowen@yahoo.com', phone: '', source: 'Capital One', stock: '131233', vehicle: '2017 BMW X3', assign: null, accentColor: '#534AB7' },
  { active: true, status: 'BDC - Show', name: 'Hazel Ortiz', email: 'hortiz@gmail.com', phone: '(415) 555-0745', source: 'CarGurus', stock: '242344', vehicle: '2020 Genesis G70', assign: 'MK', accentColor: '#185FA5' },
  { active: true, status: 'Active', name: 'Levi Quinn', email: 'lquinn@hotmail.com', phone: '(720) 555-0756', source: 'Cars', stock: '353455', vehicle: '2023 Ford Explorer', assign: 'PN', accentColor: '#993C1D' },
  { active: true, status: 'Active', name: 'Stella Reyes', email: 'stellar@gmail.com', phone: '(213) 555-0787', source: 'Cars', stock: '575588', vehicle: '2023 Cadillac Escalade', assign: 'CT', accentColor: '#22c88a' },
];

async function main() {
  console.log('Seeding database...');

  await prisma.activity.deleteMany();
  await prisma.smsRecord.deleteMany();
  await prisma.emailRecord.deleteMany();
  await prisma.callRecord.deleteMany();
  await prisma.note.deleteMany();
  await prisma.message.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();

  // Reset autoincrement counters so IDs start at 1
  if (dbUrl.startsWith('file:') || dbUrl.startsWith('sqlite:')) {
    await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence");
  } else {
    const tables = ['User','Lead','Message','Note','CallRecord','Activity','SmsRecord','EmailRecord'];
    for (const t of tables) {
      await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${t}_id_seq" RESTART WITH 1`);
    }
  }


  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  for (const u of USERS) {
    await prisma.user.create({ data: { ...u, passwordHash: hash } });
  }
  console.log(`  Created ${USERS.length} users (password: ${DEFAULT_PASSWORD})`);

  for (const l of LEADS) {
    await prisma.lead.create({ data: l });
  }
  console.log(`  Created ${LEADS.length} leads`);

  // Seed some sample messages for Ac Thakur (lead 1)
  const sampleMessages = [
    { leadId: 1, type: 'sms', direction: 'outbound', body: 'Hi there, this is CoreConnect Auto. We have a missed call from this number. How can we be of assistance?', agent: 'David P.' },
    { leadId: 1, type: 'sms', direction: 'inbound', body: 'Hello Angel' },
    { leadId: 1, type: 'sms', direction: 'inbound', body: 'Ok I will ask for Angel' },
    { leadId: 1, type: 'sms', direction: 'outbound', body: 'Ask for angel wenSeday', agent: 'Angel Garcia' },
    { leadId: 1, type: 'sms', direction: 'outbound', body: 'Hi, following up on your vehicle inquiry. Let us know if you have any questions about the 2010 Bentley Continental.', agent: 'David P.' },
    { leadId: 1, type: 'email', direction: 'inbound', body: 'Re: Following up on your 2010 Bentley Continental\nThanks, I\'m still considering. Will get back to you.', subject: 'Re: Following up on your 2010 Bentley Continental' },
    { leadId: 1, type: 'email', direction: 'outbound', body: 'Hi Ac,\n\nFollowing up on your vehicle inquiry. Let us know if you have any questions about the 2010 Bentley Continental.', subject: 'Following up on your 2010 Bentley Continental', agent: 'David P.' },
  ];
  for (const m of sampleMessages) {
    await prisma.message.create({ data: m });
  }
  console.log(`  Created ${sampleMessages.length} sample messages`);

  // Seed sample notes
  const sampleNotes = [
    { leadId: 1, body: 'Mentioned interest in financing options — send rate sheet next contact.', agent: 'David P.' },
    { leadId: 1, body: 'Test drive scheduled for next Saturday. Confirm Friday morning.', agent: 'Angel Garcia' },
  ];
  for (const n of sampleNotes) {
    await prisma.note.create({ data: n });
  }
  console.log(`  Created ${sampleNotes.length} sample notes`);

  // ── Seed call records (35 days, same algorithm as dashboard) ──
  const LEAD_ROSTER = [
    'Ac Thakur','Kristina Stuf','Taylor Dang','Gage Quarles','Jason Stark',
    'Christian Webster','Saurabh Singh','Jasbir Chandok','Derek Huff','Priya Mehta',
    'Sandra Lee','James Okoye','Mei Huang','Luis Garza','Omar Shaikh',
    'Rachel Kim','Daniel Park','Sofia Reyes','Marcus Chen','Aisha Patel',
    'Nathan Vargas','Olivia Brooks','Ethan Hsu','Maya Singh','Liam OConnor'
  ];
  let cseed = 20260528;
  function crnd(){ cseed = (cseed * 1103515245 + 12345) & 0x7fffffff; return cseed / 0x7fffffff; }
  let cseed2 = 19470115;
  function crnd2(){ cseed2 = (cseed2 * 1103515245 + 12345) & 0x7fffffff; return cseed2 / 0x7fffffff; }
  function pickLead(){ return LEAD_ROSTER[Math.floor(crnd2() * LEAD_ROSTER.length)]; }
  function callDur(connected){
    if(!connected) return 0;
    const r = crnd2();
    if(r < 0.45) return 30 + Math.floor(crnd2() * 90);
    if(r < 0.80) return 120 + Math.floor(crnd2() * 180);
    return 300 + Math.floor(crnd2() * 420);
  }
  const callBatch = [];
  const today = new Date(); today.setHours(0,0,0,0);
  for(let dayOff = 0; dayOff < 35; dayOff++){
    const day = new Date(today); day.setDate(day.getDate() - dayOff);
    const dow = day.getDay();
    const damp = (dow === 0 || dow === 6) ? 0.4 : 1;
    const base = Math.round((6 + crnd() * 12) * damp);
    for(let i = 0; i < base; i++){
      const r = crnd();
      let type, dir, connected;
      if(r < 0.32)      { type = 'missed';   dir = 'in';  connected = false; }
      else if(r < 0.80) { type = 'answered'; dir = 'in';  connected = true;  }
      else              { type = 'returned'; dir = 'out'; connected = true;  }
      const at = new Date(day); at.setHours(8 + Math.floor(crnd() * 11), Math.floor(crnd() * 60), 0, 0);
      callBatch.push({ leadName: pickLead(), type, direction: dir, durationSec: callDur(connected), createdAt: at });
    }
    const extraOut = Math.round((3 + crnd() * 6) * damp);
    for(let i = 0; i < extraOut; i++){
      const at = new Date(day); at.setHours(8 + Math.floor(crnd() * 11), Math.floor(crnd() * 60), 0, 0);
      const connected = crnd2() < 0.75;
      callBatch.push({ leadName: pickLead(), type:'outbound', direction:'out', durationSec: callDur(connected), createdAt: at });
    }
  }
  for (const c of callBatch) {
    await prisma.callRecord.create({ data: c });
  }
  console.log(`  Created ${callBatch.length} call records`);

  // ── Seed SMS records (35 days, same algorithm as dashboard) ──
  let sseed = 19840712;
  function srnd(){ sseed = (sseed * 1103515245 + 12345) & 0x7fffffff; return sseed / 0x7fffffff; }
  const smsBatch = [];
  for(let dayOff = 0; dayOff < 35; dayOff++){
    const day = new Date(today); day.setDate(day.getDate() - dayOff);
    const dow = day.getDay();
    const damp = (dow === 0 || dow === 6) ? 0.5 : 1;
    const base = Math.round((10 + srnd() * 16) * damp);
    for(let i = 0; i < base; i++){
      const dir = srnd() < 0.60 ? 'out' : 'in';
      const at = new Date(day); at.setHours(8 + Math.floor(srnd() * 11), Math.floor(srnd() * 60), 0, 0);
      smsBatch.push({ direction: dir, createdAt: at });
    }
  }
  for (const s of smsBatch) {
    await prisma.smsRecord.create({ data: s });
  }
  console.log(`  Created ${smsBatch.length} SMS records`);

  // ── Seed email records (35 days, same algorithm as dashboard) ──
  let eseed = 20011225;
  function ernd(){ eseed = (eseed * 1103515245 + 12345) & 0x7fffffff; return eseed / 0x7fffffff; }
  const emailBatch = [];
  for(let dayOff = 0; dayOff < 35; dayOff++){
    const day = new Date(today); day.setDate(day.getDate() - dayOff);
    const dow = day.getDay();
    const damp = (dow === 0 || dow === 6) ? 0.35 : 1;
    const base = Math.round((7 + ernd() * 11) * damp);
    for(let i = 0; i < base; i++){
      const dir = ernd() < 0.50 ? 'in' : 'out';
      const at = new Date(day); at.setHours(8 + Math.floor(ernd() * 11), Math.floor(ernd() * 60), 0, 0);
      emailBatch.push({ direction: dir, createdAt: at });
    }
  }
  for (const e of emailBatch) {
    await prisma.emailRecord.create({ data: e });
  }
  console.log(`  Created ${emailBatch.length} email records`);

  // ── Seed sample activities ──
  const sampleActivities = [
    { type:'appointment', title:'Test drive — Ac Thakur', date:'2026-5-24', time:'10:00', notes:'2010 Bentley Continental', agent:'DP', leadId:1 },
    { type:'reminder', title:'Follow up with Jason Stark', date:'2026-5-23', time:'14:00', notes:'BDC - No Show, reschedule', agent:'DP' },
    { type:'task', title:'Send rate sheet to Priya Mehta', date:'2026-5-23', time:'', notes:'Financing options', agent:'JD' },
    { type:'appointment', title:'Delivery — Derek Huff', date:'2026-5-25', time:'11:00', notes:'2019 Honda Accord deposit', agent:'MR' },
    { type:'reminder', title:'Weekly pipeline review', date:'2026-5-26', time:'9:00', notes:'12 active, 4 follow-up', agent:'DP' },
  ];
  for (const a of sampleActivities) {
    await prisma.activity.create({ data: a });
  }
  console.log(`  Created ${sampleActivities.length} sample activities`);

  console.log('Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
