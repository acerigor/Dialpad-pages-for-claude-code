/* Loan-App contact-panel features — Credit Report modal + Loan App tab.
   Ported verbatim from coreconnect_leads_v83.html so the SHARED contact panel
   can render them on every page (dashboard, call/message/voicemail history, appointments).
   Reads the global window.cpLead / window.cpTab that shared/contact-panel.js keeps in sync. */
var cpLead = (typeof window!=='undefined' && window.cpLead) ? window.cpLead : null;
var cpTab = (typeof window!=='undefined' && window.cpTab) ? window.cpTab : 'all';

/* --- escaper (from leads page) --- */
function cpEscape(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ============ CREDIT REPORT (leads-page lines 8138-8415) ============ */
function creditReportData(lead){
  var nm = (lead && lead.name && lead.name !== 'Name Unknown') ? lead.name.toUpperCase() : 'JOSEPH C MALONE';
  return {
    date: 'June 20 2026',
    personal: [
      {label:'Name', value: nm},
      {label:'Date of Birth', value:'05/14/1989'},
      {label:'SSN', value:'xxx-xx-1234'},
      {label:'Current Address', value:'1409 LOOP 281 HWY APT 1812, TYLER TX 75703'},
      {label:'Previous Address', value:'305 ELLINGTON DR, TEXARKANA AR 71854'},
      {label:'Previous Address', value:'10619 RILEY ST, HOUSTON TX 77013'},
    ],
    employment: [
      {company:'THE WALMART FAMILY', dateReported:'05/2017', occupation:'(not provided)'},
      {company:'THE DECK AT ATBM AM', dateReported:'08/2017', occupation:'(not provided)'},
    ],
    cbcAuto: [
      {creditor:'TRUIST BANK', orig:'$42,802', term:'84', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'AMERICAN HONDA FINANCE', orig:'$31,790', term:'84', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'JPMCB AUTO', orig:'$49,264', term:'72', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'TRUIST BANK', orig:'$14,842', term:'72', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'TRUIST BANK', orig:'$42,769', term:'72', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'TOYOTA MOTOR CREDIT', orig:'$31,850', term:'75', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'JPMCB AUTO', orig:'$14,385', term:'72', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'TOYOTA MOTOR CREDIT', orig:'$38,770', term:'75', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'TOYOTA MOTOR CREDIT', orig:'$22,806', term:'75', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'TOYOTA MOTOR CREDIT', orig:'$22,787', term:'72', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'WFBNA AUTO', orig:'$36,217', term:'72', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'TOYOTA MOTOR CREDIT', orig:'$28,716', term:'75', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'WFBNA AUTO', orig:'$14,824', term:'72', balance:'$0', payment:'$0', months:'0', status:'C', apr:'N/A', cosigner:'N', late:'0', type:'00'},
      {creditor:'PENTAGON FEDERAL CR UN', orig:'$42,065', term:'84', balance:'$31,235', payment:'$644', months:'55', status:'O', apr:'7.44 %', cosigner:'N', late:'0', type:'00'},
      {creditor:'TOYOTA MOTOR CREDIT', orig:'$17,831', term:'48', balance:'$17,904', payment:'$434', months:'46', status:'O', apr:'7.8 %', cosigner:'N', late:'0', type:'00'},
    ],
    reportSummary: {
      col1: [
        {label:'Total # of Trades', value:'42'},
        {label:'Current Trades', value:'8'},
        {label:'Unrated Trades', value:'0'},
        {label:'Curr Neg Trades', value:'0'},
        {label:'Hist Neg Trades', value:'0'},
        {label:'No. of Accts Paid', value:'34'},
        {label:'Curr Past Due', value:'0'},
        {label:'Amount Past Due', value:'$0'},
      ],
      col2: [
        {label:'30 Days', value:'0'},
        {label:'60 Days', value:'0'},
        {label:'90+ Days', value:'0'},
        {label:'Inquiries', value:'16'},
        {label:'Inq. Last 6 Mnths', value:'15'},
        {label:'Public Records', value:'0'},
        {label:'Collections', value:'0'},
        {label:'Oldest Trade', value:'1/1/2016'},
      ],
      col3: [
        {label:'Accounts Balance', value:'$58,652'},
        {label:'Monthly Payment', value:'$1,173'},
        {label:'Credit Limit', value:'$27,400'},
        {label:'High Credit', value:'$479,971'},
        {label:'Total Real Est. Bal.', value:'$0'},
        {label:'Total Rev. Bal.', value:'$9,513'},
        {label:'Tot. Installment Bal.', value:'$49,139'},
        {label:'Available %', value:'65'},
      ],
    },
    scorecard: {
      name: 'EXP/FAIR ISAAC AUTO V8 SCORE',
      score: '716',
      reasons: [
        '(10) Proportion of balance to high credit on bank revolving or all revolving accounts',
        '(08) Number of recent inquiries',
        '(33) Proportion of current loan balance to original loan amount',
        '(30) Length of time since most recent account established',
      ],
    },
    inquiries: [
      {date:'06/18/26', subscriber:'BK OF AMER', subNo:'2440720', amount:'Unknown amount', mkt:'', submkt:'', kob:'Bank Credit Cards', phone:''},
      {date:'06/18/26', subscriber:'EXETER FINANCE LLC/WCG', subNo:'2898460', amount:'Unknown amount', mkt:'', submkt:'', kob:'Automobile Financing Company', phone:''},
      {date:'06/18/26', subscriber:'WFBNA AUTO', subNo:'2938088', amount:'Unknown amount', mkt:'', submkt:'', kob:'Automobile Financing Company', phone:''},
      {date:'05/09/26', subscriber:'CONSUMER PORTFOLIO SVC', subNo:'1624220', amount:'Unknown amount', mkt:'', submkt:'', kob:'Automobile Financing Company', phone:''},
      {date:'05/09/26', subscriber:'TOYOTA MOTOR CREDIT CO', subNo:'1630640', amount:'Unknown amount', mkt:'', submkt:'', kob:'Automobile Financing Company', phone:''},
      {date:'05/09/26', subscriber:'GLOBAL LENDING SERVICE', subNo:'1966277', amount:'Unknown amount', mkt:'', submkt:'', kob:'Automobile Financing Company', phone:''},
      {date:'05/09/26', subscriber:'WFBNA AUTO', subNo:'2938088', amount:'Unknown amount', mkt:'', submkt:'', kob:'Automobile Financing Company', phone:''},
      {date:'05/08/26', subscriber:'EXETER FINANCE LLC/WCG', subNo:'2898460', amount:'Unknown amount', mkt:'', submkt:'', kob:'Automobile Financing Company', phone:''},
      {date:'05/07/26', subscriber:'700/WISCHNEWSKY CHRYSL', subNo:'1112096', amount:'Unknown amount', mkt:'', submkt:'', kob:'Automobile Dealers, Used', phone:''},
      {date:'05/07/26', subscriber:'WFBNA AUTO', subNo:'2938088', amount:'Unknown amount', mkt:'', submkt:'', kob:'Automobile Financing Company', phone:''},
      {date:'03/17/26', subscriber:'ACHIEVE/CROSS RIVER BA', subNo:'3464310', amount:'Unknown amount', mkt:'', submkt:'', kob:'Personal Loan Companies', phone:''},
      {date:'01/19/26', subscriber:'CAP ONE NA', subNo:'2844550', amount:'Unknown amount', mkt:'', submkt:'', kob:'Bank Credit Cards', phone:''},
      {date:'01/19/26', subscriber:'JPMCB CARD', subNo:'2920598', amount:'Unknown amount', mkt:'', submkt:'', kob:'Bank Credit Cards', phone:''},
      {date:'01/11/26', subscriber:'JPMCB CARD', subNo:'2920598', amount:'Unknown amount', mkt:'', submkt:'', kob:'Bank Credit Cards', phone:''},
      {date:'12/22/25', subscriber:'JPMCB CARD', subNo:'2920598', amount:'Unknown amount', mkt:'', submkt:'', kob:'Bank Credit Cards', phone:''},
      {date:'05/15/25', subscriber:'CAP ONE NA', subNo:'2844550', amount:'Unknown amount', mkt:'', submkt:'', kob:'Bank Credit Cards', phone:''},
    ],
    warnings: [
      '0084 SSN/ITIN MATCHES',
      'Reported via A/R tape',
      'Reported via A/R tape, but different from inquiry',
      'Reported via A/R tape, but different from inquiry',
    ],
  };
}
function creditSection(title, bodyHtml){
  return '<div class="credit-sec"><div class="credit-sec-head" onclick="toggleCreditSec(this)"><span>' + title + '</span><span class="credit-sec-hide">Hide ▲</span></div>'
    + '<div class="credit-sec-body">' + bodyHtml + '</div></div>';
}
function toggleCreditSec(head){
  var sec = head.closest('.credit-sec');
  if(!sec) return;
  var collapsed = sec.classList.toggle('collapsed');
  var lbl = head.querySelector('.credit-sec-hide');
  if(lbl) lbl.textContent = collapsed ? 'Show ▼' : 'Hide ▲';
}
function creditAutoTableHtml(rows){
  var head = '<thead><tr>'
    + '<th>Creditor Name</th>'
    + '<th>Original Amt</th>'
    + '<th>Term</th>'
    + '<th>Balance</th>'
    + '<th>Payment</th>'
    + '<th>Months Remain</th>'
    + '<th>Status</th>'
    + '<th>Est APR</th>'
    + '<th>Co-Signer</th>'
    + '<th>Times Late</th>'
    + '<th>Type</th>'
    + '</tr></thead>';
  var body = rows.map(function(r){
    return '<tr>'
      + '<td>' + cpEscape(r.creditor) + '</td>'
      + '<td>' + cpEscape(r.orig) + '</td>'
      + '<td>' + cpEscape(r.term) + '</td>'
      + '<td>' + cpEscape(r.balance) + '</td>'
      + '<td>' + cpEscape(r.payment) + '</td>'
      + '<td>' + cpEscape(r.months) + '</td>'
      + '<td>' + cpEscape(r.status) + '</td>'
      + '<td>' + cpEscape(r.apr) + '</td>'
      + '<td>' + cpEscape(r.cosigner) + '</td>'
      + '<td>' + cpEscape(r.late) + '</td>'
      + '<td>' + cpEscape(r.type) + '</td>'
    + '</tr>';
  }).join('');
  return '<div class="credit-auto-wrap"><table class="credit-auto-table">' + head + '<tbody>' + body + '</tbody></table></div>';
}
function creditSummaryHtml(rs){
  function col(rows){
    return '<div class="credit-rs-col">' + rows.map(function(r){
      return '<div class="credit-rs-row"><span class="credit-rs-k">' + cpEscape(r.label) + '</span><span class="credit-rs-v">' + cpEscape(r.value) + '</span></div>';
    }).join('') + '</div>';
  }
  return '<div class="credit-rs">' + col(rs.col1) + col(rs.col2) + col(rs.col3) + '</div>';
}
function creditScorecardHtml(sc){
  var reasons = sc.reasons.map(function(r){ return '<div>' + cpEscape(r) + '</div>'; }).join('');
  return '<div class="credit-sc">'
    + '<div class="credit-sc-row"><span class="credit-sc-k">Scorecard:</span><span class="credit-sc-v">' + cpEscape(sc.name) + '</span></div>'
    + '<div class="credit-sc-row"><span class="credit-sc-k">Score:</span><span class="credit-sc-v credit-sc-score">' + cpEscape(sc.score) + '</span></div>'
    + '<div class="credit-sc-row"><span class="credit-sc-k">Reasons:</span><span class="credit-sc-v"><div class="credit-sc-reasons">' + reasons + '</div></span></div>'
  + '</div>';
}
function creditTlDate(n, y){ var m = (n % 12) + 1; return (m < 10 ? '0' + m : m) + '/' + String(y).slice(2); }
// Builds ~40 trade lines: 15 auto installment (from CBC Auto Summary) + 25 revolving/card accounts.
function creditTradeLinesData(d){
  var lines = [];
  d.cbcAuto.forEach(function(r, i){
    var open = (r.status === 'O');
    lines.push({
      firm: r.creditor, account: '****' + (461000 + i * 137),
      type: 'Auto Loan — Installment', status: open ? 'Open' : 'Closed',
      opened: creditTlDate(i, 2018), reported: creditTlDate(i + 3, 2024),
      balance: r.balance, highCredit: r.orig, monthly: r.payment, terms: r.term + ' mo',
      owner: 'Individual', pattern: open ? 'CCCCCCCCCCCC' : 'CCCCC',
      comment: open ? 'This is an account in good standing' : 'Account rated satisfactorily',
    });
  });
  var revolv = [
    {firm:'BANK OF AMERICA', hc:'$251'}, {firm:'CAP1/KOHLS', hc:'$685'}, {firm:'CITICARDS CBNA', hc:'$0'},
    {firm:'AMEX', hc:'$629'}, {firm:'CITICARDS CBNA', hc:'$899'}, {firm:'AMEX', hc:'$0'},
    {firm:'BEST BUY/CBNA', hc:'$144'}, {firm:'SYNCB/PPMC', hc:'$722'}, {firm:'SYNCB/AMAZON', hc:'$0'},
    {firm:'SYNCB/CARE CREDIT', hc:'$0'}, {firm:'COMENITY BANK/PLAYSTN', hc:'$626'}, {firm:'WFBNA CARD', hc:'$1,021'},
    {firm:'CAPITAL ONE', hc:'$278'}, {firm:'CAPITAL ONE', hc:'$169'}, {firm:'CAPITAL ONE', hc:'$0'},
    {firm:'DISCOVER', hc:'$1,221'}, {firm:'COMENITY/VICTORIA', hc:'$430'}, {firm:'SYNCB/LOWES', hc:'$1,402'},
    {firm:'CHASE CARD', hc:'$2,310'}, {firm:'BARCLAYS', hc:'$540'}, {firm:'GS BANK/APPLE CARD', hc:'$612'},
    {firm:'TD BANK USA/TARGET', hc:'$310'}, {firm:'NAVY FCU', hc:'$2,050'}, {firm:'SYNCB/PAYPAL', hc:'$745'},
    {firm:'USAA SAVINGS BANK', hc:'$980'},
  ];
  var limits = ['$500','$700','$3,000','$4,000','$1,500','$500','$650','$1,200','$2,000','$1,800','$750','$1,000','$500','$500','$500','$4,200','$1,250','$3,500','$6,000','$2,200','$2,500','$900','$5,000','$1,600','$3,000'];
  revolv.forEach(function(c, i){
    lines.push({
      firm: c.firm, account: '****' + (1000 + i * 7),
      type: 'Bank Credit Card — Revolving', status: 'Open',
      opened: creditTlDate(i, 2016), reported: creditTlDate(i + 2, 2024),
      balance: '$0', highCredit: c.hc, monthly: '$0', terms: 'Revolving',
      owner: (i % 5 === 0 ? 'Authorized User' : 'Individual'), pattern: 'CCCCCCCCCCCC',
      comment: (i % 7 === 0 ? "Account closed at consumer's request" : 'Account rated satisfactorily'),
      creditLimit: limits[i] || '$0',
    });
  });
  return lines;
}
function creditTradeLinesHtml(lines){
  return '<div class="credit-tl">' + lines.map(function(t){
    var fields = [
      ['Type', t.type], ['Status', t.status], ['Opened', t.opened], ['Reported', t.reported],
      ['Credit Limit', t.creditLimit], ['High Credit', t.highCredit], ['Balance', t.balance],
      ['Monthly Pmt', t.monthly], ['Terms', t.terms], ['Owner', t.owner],
    ];
    var grid = fields.filter(function(f){ return f[1] != null && f[1] !== ''; }).map(function(f){
      return '<div class="credit-tl-f"><span class="credit-tl-k">' + cpEscape(f[0]) + '</span><span class="credit-tl-v">' + cpEscape(String(f[1])) + '</span></div>';
    }).join('');
    return '<div class="credit-tl-card">'
      + '<div class="credit-tl-head"><span class="credit-tl-firm">' + cpEscape(t.firm) + '</span><span class="credit-tl-acct">' + cpEscape(t.account) + '</span></div>'
      + '<div class="credit-tl-grid">' + grid + '</div>'
      + '<div class="credit-tl-pat"><span class="credit-tl-k">Payment Pattern</span><span class="credit-tl-mono">' + cpEscape(t.pattern) + '</span></div>'
      + '<div class="credit-tl-comment">' + cpEscape(t.comment) + '</div>'
    + '</div>';
  }).join('') + '</div>';
}
function creditInquiriesHtml(rows){
  var cols = ['Date', 'Subscriber Name', 'Subscriber #', 'Amount', 'Mkt.', 'SubMkt.', 'KOB', 'Phone #'];
  var head = '<thead><tr>' + cols.map(function(c){ return '<th>' + cpEscape(c) + '</th>'; }).join('') + '</tr></thead>';
  var body = rows.map(function(r){
    return '<tr>'
      + '<td>' + cpEscape(r.date) + '</td>'
      + '<td>' + cpEscape(r.subscriber) + '</td>'
      + '<td>' + cpEscape(r.subNo) + '</td>'
      + '<td>' + cpEscape(r.amount) + '</td>'
      + '<td>' + cpEscape(r.mkt) + '</td>'
      + '<td>' + cpEscape(r.submkt) + '</td>'
      + '<td>' + cpEscape(r.kob) + '</td>'
      + '<td>' + cpEscape(r.phone) + '</td>'
    + '</tr>';
  }).join('');
  return '<div class="credit-inq-wrap"><table class="credit-inq-table">' + head + '<tbody>' + body + '</tbody></table></div>';
}
function creditWarningsHtml(rows){
  return '<div class="credit-warn">' + rows.map(function(r){
    return '<div class="credit-warn-row">' + cpEscape(r) + '</div>';
  }).join('') + '</div>';
}
function creditReportHtml(lead){
  var d = creditReportData(lead);
  var personal = d.personal.map(function(f){
    return '<div class="credit-kv"><span class="credit-k">' + cpEscape(f.label) + '</span><span class="credit-v">' + cpEscape(f.value) + '</span></div>';
  }).join('');
  var employment = d.employment.map(function(e){
    return '<div class="credit-emp">'
      + '<div class="credit-kv"><span class="credit-k">Company Name</span><span class="credit-v">' + cpEscape(e.company) + '</span></div>'
      + '<div class="credit-kv"><span class="credit-k">Date Reported</span><span class="credit-v">' + cpEscape(e.dateReported) + '</span></div>'
      + '<div class="credit-kv"><span class="credit-k">Occupation</span><span class="credit-v">' + cpEscape(e.occupation) + '</span></div>'
    + '</div>';
  }).join('');
  return '<div class="credit-doc">'
    + '<div class="credit-doc-top">'
      + '<button class="credit-print" type="button" onclick="showNavToast(\'Printing…\',\'Preparing the credit report document.\')">Print Online Document</button>'
      + '<div class="credit-title"><div class="credit-date">' + cpEscape(d.date) + '</div><div class="credit-subtitle">Soft Pull</div></div>'
      + '<div class="credit-bureau">Experian Credit Prequal<br>Experian<br>701 Experian Pkwy, P.O. Box 2002<br>Allen, TX 75013<br>1-888-397-3742<br>Date Reported: 06/20/26</div>'
    + '</div>'
    + creditSection('Personal Information', '<div class="credit-kv-grid">' + personal + '</div>')
    + creditSection('Employment Information', '<div class="credit-kv-grid">' + employment + '</div>')
    + creditSection('CBC Auto Summary', creditAutoTableHtml(d.cbcAuto))
    + creditSection('Report Summary', creditSummaryHtml(d.reportSummary))
    + creditSection('Scorecards', creditScorecardHtml(d.scorecard))
    + creditSection('Trade Lines', creditTradeLinesHtml(creditTradeLinesData(d)))
    + creditSection('Inquiries', creditInquiriesHtml(d.inquiries))
    + creditSection('Warning Messages', creditWarningsHtml(d.warnings))
  + '</div>';
}
function openCreditReport(){
  if(!cpLead) return;
  var b = document.getElementById('credit-modal-body');
  if(b) b.innerHTML = creditReportHtml(cpLead);
  var bd = document.getElementById('credit-modal-backdrop');
  if(bd) bd.classList.add('open');
}
function closeCreditReport(){
  var bd = document.getElementById('credit-modal-backdrop');
  if(bd) bd.classList.remove('open');
}

/* ============ LOAN APP TAB (leads-page lines 9047-9384) ============ */
function cpLoanSeed(lead){ return ((lead && lead.no) ? lead.no : 1) * 2654435761 % 2147483647; }
function cpLoanPick(seed, n, arr){ return arr[(seed + n) % arr.length]; }
function cpLoanMoney(v){ return '$' + Math.round(v).toLocaleString('en-US'); }
function cpLoanMoney2(v){ return '$' + (Math.round(v * 100) / 100).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function cpLoanPad3(n){ return String(n).padStart(3, '0'); }
function cpLoanVin(seed){ const c = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'; let v = '', x = seed; for(let i = 0; i < 17; i++){ x = (x * 1103515245 + 12345) & 0x7fffffff; v += c[x % c.length]; } return v; }
var CP_FORM_ICONS = {
  calendar:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  building:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 21V9h3a1 1 0 0 1 1 1v11M8 8h2M8 12h2"/></svg>',
  hash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
  engine:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  gauge:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 14a10 10 0 0 1 20 0"/><line x1="12" y1="14" x2="16" y2="10"/><circle cx="12" cy="14" r="1.5"/></svg>',
  user:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  pin:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  tag:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  book:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  cash:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><line x1="6" y1="12" x2="6.01" y2="12"/><line x1="18" y1="12" x2="18.01" y2="12"/></svg>',
  car:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3v-5l2-5h12l2 5v5h-2"/><path d="M5 12h14"/><circle cx="7.5" cy="17" r="1.5"/><circle cx="16.5" cy="17" r="1.5"/></svg>',
  download:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  edit:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>'
};
function cpFormIcon(name){ return CP_FORM_ICONS[name] || CP_FORM_ICONS.hash; }
function cpLoanPad(n){ return String(n).padStart(2, '0'); }
function cpLoanDur(totalSec){
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  return d + ' day' + (d === 1 ? '' : 's') + ' ' + cpLoanPad(h) + ':' + cpLoanPad(m) + ':' + cpLoanPad(sec);
}
function cpLoanPhone(seed){
  return '832' + String(2000000 + (seed % 7999999)).padStart(7, '0') + '-' + (seed % 200);
}
function cpLoanIp(seed){ return '192.168.0.' + (1 + (seed % 254)); }
// Credit-score band → CSS color class (gauge has Poor / Good / Excellent zones)
function cpLoanBand(score){
  if(typeof score !== 'number' || isNaN(score)) return 'cp-band-none';
  if(score < 580) return 'cp-band-poor';
  if(score < 740) return 'cp-band-good';
  return 'cp-band-exc';
}
// Semicircular Poor/Good/Excellent gauge with a needle pointing at `score` (300–850).
function cpLoanGaugeSvg(score){
  const has = (typeof score === 'number' && !isNaN(score));
  const frac = has ? Math.max(0, Math.min(1, (score - 300) / 550)) : 0.5;
  const rad = (180 * (1 - frac)) * Math.PI / 180;     // 0=right, π=left
  const tx = (52 + 32 * Math.cos(rad)).toFixed(1);
  const ty = (52 - 32 * Math.sin(rad)).toFixed(1);
  const needle = has ? '#e8eaf0' : '#7a7f94';
  return '<svg class="cp-loan-gauge-svg" viewBox="0 0 104 58" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<path d="M10,52 A42,42 0 0 1 31,15.63" stroke="#e85555" stroke-width="8"/>'
    + '<path d="M31,15.63 A42,42 0 0 1 73,15.63" stroke="#f5a623" stroke-width="8"/>'
    + '<path d="M73,15.63 A42,42 0 0 1 94,52" stroke="#22c88a" stroke-width="8"/>'
    + '<line x1="52" y1="52" x2="' + tx + '" y2="' + ty + '" stroke="' + needle + '" stroke-width="2.5" stroke-linecap="round"/>'
    + '<circle cx="52" cy="52" r="3.5" fill="' + needle + '"/>'
    + '</svg>';
}
function cpLoanGaugeHtml(score){
  const cls = cpLoanBand(score);
  const val = (typeof score === 'number' && !isNaN(score)) ? score : '--';
  return '<div class="cp-loan-gauge">' + cpLoanGaugeSvg(score)
    + '<div class="cp-loan-gauge-scale"><span>Poor</span><span>Good</span><span>Excellent</span></div>'
    + '<div class="cp-loan-gauge-val ' + cls + '">' + val + '</div></div>';
}
function cpLoanData(lead){
  const s = cpLoanSeed(lead);
  const terms = [48, 60, 72, 84];
  const monthlyIncome = 4200 + (s % 56) * 100;            // ~$4,200–$9,800
  const vehiclePrice = 18000 + (s % 42) * 1000;           // ~$18k–$60k
  const downPayment = 1500 + (s % 14) * 500;              // ~$1.5k–$8k
  const apr = (5.9 + (s % 80) / 10).toFixed(2);           // 5.90%–13.80%
  const term = cpLoanPick(s, 3, terms);
  const principal = Math.max(0, vehiclePrice - downPayment);
  const r = parseFloat(apr) / 100 / 12;
  const monthly = r > 0 ? principal * r / (1 - Math.pow(1 + r, -term)) : principal / term;
  const financeNames = ['Shaun Leva','Maria Delgado','Kevin Tran','Priya Nair','Andre Boateng','Lena Fischer'];
  const salesNames = ['Jorge Romero','Dana White','Marcus Lee','Sofia Ramos','Tariq Hassan','Beth Carver'];
  const stores = ['USA Direct Auto','CoreConnect Auto Mall','Lone Star Motors','Gulf Coast Autos'];
  const appAgeSec = 2 * 3600 + (s % 5400) + 90;            // ~2h+, application age
  const score2 = 480 + (s % 320);                          // 480–800 (FICO)
  const score1 = (s % 3 === 0) ? null : (500 + ((s * 7) % 300)); // sometimes not pulled yet

  // ----- Application Summary metrics (deterministic mock, no NaN) -----
  const ageY = 22 + (s % 44), ageM = s % 12;
  const jobY = 1 + (s % 18), jobM = (s * 3) % 12;
  const resY = s % 20, resM = (s * 5) % 12;
  const avgMonthly = 120 + (s % 240);
  const totalDebt = 1500 + (s % 240) * 50;
  const acctBalance = 800 + (s % 200) * 40;
  const installBalance = 100 + (s % 60) * 25;
  const totalPastDue = (s % 6 === 0) ? (s % 9) * 100 : 0;
  const pti = (monthly / monthlyIncome * 100).toFixed(1);
  const dti = ((monthly + totalDebt / 36) / monthlyIncome * 100).toFixed(1);

  // ----- Finance Form Information (deterministic mock) -----
  const applicants = ['Jeremiah Ellis Prator','Marcus Bell','Dana Whitfield','Sofia Marin','Andre Coleman','Lena Brooks'];
  const buyerNames = ['Amin Hussain','Carlos Vega','Nina Patel','Derek Cole','Yusuf Khan','Grace Lim'];
  const custName = (lead && lead.name && lead.name !== 'Name Unknown') ? lead.name : cpLoanPick(s, 0, applicants);
  const custEmail = (lead && lead.email) ? lead.email : (custName.toLowerCase().replace(/[^a-z]+/g, '') + (100 + s % 900) + '@gmail.com');
  const phoneDigits = (lead && lead.phone) ? String(lead.phone).replace(/\D/g, '') : String(6000000000 + (s % 3999999999));
  const ssn = cpLoanPad3(s % 1000) + '-' + cpLoanPad3((s * 3) % 1000) + '-' + cpLoanPad3((s * 7) % 1000);
  const veh = (lead && lead.vehicle) ? String(lead.vehicle).trim().split(/\s+/) : [];
  const modelYear = veh[0] || '—';
  const vehCompany = veh[1] || '—';
  const modelNumber = veh.slice(2).join(' ') || '—';
  const mileage = 15000 + (s % 95) * 1000;
  const dol = s % 90;
  return {
    header: {
      financeName: cpLoanPick(s, 0, financeNames),
      financePhone: cpLoanPhone(s),
      financeTimer: cpLoanDur(appAgeSec - 92),
      financeIp: cpLoanIp(s),
      salesName: cpLoanPick(s, 2, salesNames),
      salesPhone: cpLoanPhone(s * 3 + 17),
      salesTimer: cpLoanDur(appAgeSec - 92),
      salesIp: cpLoanIp(s + 1),
      score1: score1,
      score2: score2,
      appAge: cpLoanDur(appAgeSec),
      store: cpLoanPick(s, 1, stores),
    },
    summary: {
      left: [
        {label:'Applicant Age', value: ageY + ' Year ' + ageM + ' Month'},
        {label:'Job Time', value: jobY + ' Year ' + jobM + ' Month'},
        {label:'Residence Time', value: resY + ' Year ' + resM + ' Month'},
        {label:'Monthly Income', value: cpLoanMoney2(monthlyIncome)},
        {label:'Down Payment', value: cpLoanMoney2(downPayment)},
        {label:'Monthly Payment', value: cpLoanMoney2(monthly)},
        {label:'PTI', value: pti + '%'},
        {label:'DTI', value: dti + '%'},
        {label:'Total Auto Inquiries', value: s % 8},
        {label:'Total Auto Inquiries with 6 Month', value: s % 3},
        {label:'Average Monthly Payment', value: cpLoanMoney2(avgMonthly)},
        {label:'OFAC Search', value: 'NO HIT'},
        {label:'Bankruptcies', value: (s % 11 === 0) ? 1 : 0},
      ],
      right: [
        {label:'FICO Score', value: score2},
        {label:'Total Debt', value: cpLoanMoney2(totalDebt)},
        {label:'Account Balance', value: cpLoanMoney2(acctBalance)},
        {label:'Total Auto Loan', value: s % 3},
        {label:'Paid Auto Loan', value: s % 4},
        {label:'Delinquent Auto Loans Last 6 Month', value: 0},
        {label:'Repossessions', value: 0},
        {label:'Repossessions For Last 36 Month', value: 0},
        {label:'Open Auto Account', value: s % 3},
        {label:'Total Past Due', value: cpLoanMoney2(totalPastDue)},
        {label:'Installment Balance', value: cpLoanMoney2(installBalance)},
        {label:'Upward Trajectory', value: (s % 4 === 0) ? 'No' : 'Yes'},
        {label:'Number Of Accounts', value: 2 + (s % 12)},
      ],
      lenders: [
        {name:'CapitalOne', color:'#e85555'},
        {name:'Consumer Portfolio Services', color:'#22c88a'},
        {name:'Exeter Finance', color:'#4f7cff'},
        {name:'Westlake Financial Services', color:'#22c88a'},
        {name:'Lendbuzz Funding LLC', color:'#22c88a'},
        {name:'Ally', color:'#4f7cff'},
      ],
    },
    form: {
      personal: [
        {label:'Customer Name', value: custName},
        {label:'Email Id', value: custEmail},
        {label:'Phone Number', value: phoneDigits, prefix:'+01'},
        {label:'Alternate Phone Number', value:'', prefix:'+01', placeholder:'Alternate Phone Number'},
        {label:'Social Security Number', value: ssn},
      ],
      vehicle: [
        {icon:'calendar', label:'Model Year', value: modelYear},
        {icon:'building', label:'Vehicle Company', value: vehCompany},
        {icon:'hash', label:'Model Number', value: modelNumber},
        {icon:'engine', label:'Engine Number', value: cpLoanVin(s)},
        {icon:'pin', label:'Location', value:''},
        {icon:'gauge', label:'Mileage', value: String(mileage)},
        {icon:'user', label:'Buyer Name', value: cpLoanPick(s, 4, buyerNames)},
        {icon:'calendar', label:'DOL', value: String(dol)},
      ],
      price: [
        {icon:'tag', label:'Sales Price', value: String(vehiclePrice)},
        {icon:'book', label:'Book Value', value:'$'},
        {icon:'cash', label:'Down Payment', value:'$ ' + downPayment},
      ],
    },
    applicant: {
      personal: [
        {label:'Name', value: custName},
        {label:'Address', value: cpLoanPick(s, 0, ['3319 Dartmouth Field Lane','82 Cedar Hollow Rd','1140 Birchwood Ave','705 Magnolia Ct','2210 Prairie View Dr','64 Lakeshore Blvd'])},
        {label:'City', value: cpLoanPick(s, 1, ['Fresno','Houston','Austin','San Antonio','Dallas','El Paso'])},
        {label:'Region Code', value: cpLoanPick(s, 2, ['Texas','California','Arizona','Nevada','Florida','Georgia'])},
        {label:'Zip Code', value: String(70000 + (s % 29999))},
        {label:'Date Of Birth', value: (2026 - ageY) + '-' + cpLoanPad(1 + (s % 12)) + '-' + cpLoanPad(1 + (s % 28))},
        {label:'Age', value: String(ageY)},
        {label:'Residence Type', value: (s % 2 ? 'Renting/Leasing' : 'Own Home')},
        {label:'Residence Year and Month', value: 'YEAR: - ' + resY + '  Month: - ' + resM},
        {label:'Job Title', value: cpLoanPick(s, 3, ['inhome associate','warehouse associate','delivery driver','sales associate','line cook','security officer'])},
        {label:'Job Time', value: String(s % 60)},
        {label:'Income Type', value: (s % 3 === 0 ? '1099' : 'W2')},
        {label:'Income', value: String(monthlyIncome)},
        {label:'Drivers License State', value:''},
        {label:'Drivers License Number', value:''},
        {label:'Secondary Annual Income', value:''},
        {label:'Secondary Annual Income Time', value:''},
        {label:'Secondary Income Source', value:''},
      ],
      employee: [
        {label:'Employer Name', value: cpLoanPick(s, 4, ['Walmart','Amazon','HEB','Target','FedEx','Kroger']), highlight: true},
        {label:'Employer Address', value:''},
        {label:'Employer City', value:''},
        {label:'Employer Zip Code', value:''},
        {label:'Employer State', value:''},
        {label:'Employment Status', value:'Full Time'},
      ],
    },
  };
}
function cpLoanSummaryHtml(sum){
  const DOC = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>';
  const CHK = '<svg class="cp-loan-check" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c88a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  const metric = m => '<div class="cp-loan-metric">' + CHK + '<span class="cp-loan-mlabel">' + cpEscape(m.label) + '</span><span class="cp-loan-mval">' + cpEscape(String(m.value)) + '</span></div>';
  const lenders = sum.lenders.map(l => '<span class="cp-loan-lender" style="background:' + l.color + ';">' + cpEscape(l.name) + '</span>').join('');
  return '<div class="cp-loan-summary">'
    + '<div class="cp-loan-sum-banner">' + DOC + '<span>Application Summary</span></div>'
    + '<div class="cp-loan-sum-body">'
      + '<div class="cp-loan-metrics">'
        + '<div class="cp-loan-mcol">' + sum.left.map(metric).join('') + '</div>'
        + '<div class="cp-loan-mcol">' + sum.right.map(metric).join('') + '</div>'
      + '</div>'
    + '</div>'
    + '<div class="cp-loan-lenders">' + lenders + '</div>'
  + '</div>';
}
function cpLoanFieldHtml(f){
  const empty = !f.value;
  const prefix = f.prefix ? '<span class="cp-loan-fprefix">' + cpEscape(f.prefix) + '</span>' : '';
  const inner = empty
    ? '<span class="cp-loan-fph">' + cpEscape(f.placeholder || f.label) + '</span>'
    : '<span class="cp-loan-fval">' + cpEscape(String(f.value)) + '</span>';
  return '<div class="cp-loan-field"><div class="cp-loan-flabel">' + cpEscape(f.label) + '</div>'
    + '<div class="cp-loan-fbox' + (f.prefix ? ' has-prefix' : '') + (empty ? ' is-empty' : '') + (f.highlight ? ' is-hl' : '') + '">' + prefix + inner + '</div></div>';
}
var CP_DOC_ICON = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>';
function cpLoanFormHtml(form){
  const DOC = CP_DOC_ICON;
  const field = cpLoanFieldHtml;
  const cell = x => {
    const empty = (x.value === '' || x.value == null);
    return '<div class="cp-loan-cell"><div class="cp-loan-cell-head">' + cpFormIcon(x.icon) + '<span>' + cpEscape(x.label) + '</span></div>'
      + '<div class="cp-loan-cell-val' + (empty ? ' is-empty' : '') + '">' + cpEscape(String(x.value || '')) + '</div></div>';
  };
  const subcard = (title, icon, cells) =>
    '<div class="cp-loan-subcard"><div class="cp-loan-subtab">' + cpFormIcon(icon) + '<span>' + title + '</span></div>'
    + '<div class="cp-loan-cells">' + cells.map(cell).join('') + '</div></div>';
  return '<div class="cp-loan-form">'
    + '<div class="cp-loan-form-banner">'
      + '<span class="cp-loan-form-title">' + DOC + '<span>Finance Form Information</span></span>'
      + '<span class="cp-loan-form-btns">'
        + '<button class="cp-loan-fbtn" type="button" onclick="showNavToast(\'Downloading PDF…\',\'The finance form is being prepared.\')">' + CP_FORM_ICONS.download + 'Download</button>'
        + '<button class="cp-loan-fbtn" type="button" onclick="showNavToast(\'Edit form\',\'Editing is not available in this demo.\')">' + CP_FORM_ICONS.edit + 'Edit</button>'
      + '</span>'
    + '</div>'
    + '<div class="cp-loan-form-body">'
      + '<div class="cp-loan-pd-title"><span class="cp-loan-dot"></span>Personal Details</div>'
      + '<div class="cp-loan-fields">' + form.personal.map(field).join('') + '</div>'
      + subcard('Vehicle Details', 'car', form.vehicle)
      + subcard('Price Details', 'cash', form.price)
    + '</div>'
  + '</div>';
}
function cpLoanApplicantHtml(app){
  const section = (title, fields) =>
    '<div class="cp-loan-pd-title"><span class="cp-loan-dot"></span>' + title + '</div>'
    + '<div class="cp-loan-fields">' + fields.map(cpLoanFieldHtml).join('') + '</div>';
  return '<div class="cp-loan-form">'
    + '<div class="cp-loan-form-banner">'
      + '<span class="cp-loan-form-title">' + CP_DOC_ICON + '<span>Applicant</span></span>'
      + '<span class="cp-loan-form-btns">'
        + '<button class="cp-loan-fbtn" type="button" onclick="showNavToast(\'Edit applicant\',\'Editing is not available in this demo.\')">' + CP_FORM_ICONS.edit + 'Edit</button>'
      + '</span>'
    + '</div>'
    + '<div class="cp-loan-form-body">'
      + section('Personal Details', app.personal)
      + section('Employee Details', app.employee)
    + '</div>'
  + '</div>';
}
var CP_LOAN_ICONS = {
  person:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  phone:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  clock:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  pin:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>'
};
function cpLoanPersonHtml(label, name, phone, timer, ip){
  return '<div class="cp-loan-person">'
    + '<div class="cp-loan-person-label">' + label + '</div>'
    + '<div class="cp-loan-person-main"><span class="cp-loan-person-ic">' + CP_LOAN_ICONS.person + '</span><span>' + cpEscape(name) + '</span></div>'
    + '<div class="cp-loan-person-sub">'
      + '<span class="cp-loan-chip">' + CP_LOAN_ICONS.phone + cpEscape(phone) + '</span>'
      + '<span class="cp-loan-chip cp-loan-timer">' + CP_LOAN_ICONS.clock + cpEscape(timer) + '</span>'
      + '<span class="cp-loan-chip">' + CP_LOAN_ICONS.pin + cpEscape(ip) + '</span>'
    + '</div></div>';
}
function cpLoanHeaderHtml(h){
  return '<div class="cp-loan-header">'
    + '<div class="cp-loan-people">'
      + cpLoanPersonHtml('Finance Name:', h.financeName, h.financePhone, h.financeTimer, h.financeIp)
      + cpLoanPersonHtml('Salesman Name:', h.salesName, h.salesPhone, h.salesTimer, h.salesIp)
    + '</div>'
    + '<div class="cp-loan-gauges">' + cpLoanGaugeHtml(h.score1) + cpLoanGaugeHtml(h.score2) + '</div>'
    + '<div class="cp-loan-metacol">'
      + '<div class="cp-loan-meta-item"><div class="cp-loan-meta-label">Application Age:</div><div class="cp-loan-meta-age">' + cpEscape(h.appAge) + '</div></div>'
      + '<div class="cp-loan-meta-item"><div class="cp-loan-meta-label">Store Location:</div><div class="cp-loan-meta-store">' + cpEscape(h.store) + '</div></div>'
    + '</div>'
  + '</div>';
}
function renderCPLoanAppTab(container){
  // renderCPSummary() re-shows the summary card on every render; keep it hidden here.
  const sum = document.getElementById('cp-summary');
  if(sum) sum.style.display = 'none';
  if(!cpLead){
    container.innerHTML = `<div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--mu);font-size:13px;">No application on file</div>`;
    return;
  }
  const data = cpLoanData(cpLead);
  const wrap = document.createElement('div');
  wrap.className = 'cp-loan';
  wrap.innerHTML =
    cpLoanHeaderHtml(data.header) +
    cpLoanSummaryHtml(data.summary) +
    cpLoanFormHtml(data.form) +
    cpLoanApplicantHtml(data.applicant);
  container.appendChild(wrap);
}

// A never-contacted lead (no call/SMS activity) has no demo history —
// its SMS/Email/Notes/Activity threads stay empty until real messages are logged.
