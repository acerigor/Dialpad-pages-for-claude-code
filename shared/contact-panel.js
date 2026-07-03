/* ============================================================================
   Shared Contact Panel — visual clone of the leads-page contact-panel.
   Injects a panel with id="contact-panel-shared" (renamed from "contact-panel"
   so it doesn't collide with the leads-page's own inline panel).
   Provides openContactPanel(no,tab) + closeContactPanel() globals, plus stubs
   for every cp-* handler the markup references.
   Skipped on the leads page (which already defines #contact-panel).
   ============================================================================ */
(function(){
  if(document.getElementById('contact-panel')) return;          // leads page
  if(document.getElementById('contact-panel-shared')) return;   // already injected

  var STATE = { leadNo:null, lead:null, tab:'all', summaryOpen:true };

  /* ── Markup ──────────────────────────────────────────────────────────────
     Copied verbatim from coreconnect_leads_v83.html (lines 4259–4440), with
     id="contact-panel" → id="contact-panel-shared" so CSS selectors targeting
     the renamed id (in shared/contact-panel.css) apply. Inner ids stay the
     same — they're scoped within the panel and won't collide on non-leads
     pages (we skip injection on leads). */
  var PANEL_HTML = ''
  + '<div class="contact-panel" id="contact-panel-shared">'
  + '  <div class="cp-topbar">'
  + '    <button class="cp-mobile-back" onclick="closeContactPanel()" aria-label="Back"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg></button>'
  + '    <div class="cp-topbar-left"><span class="cp-topbar-title" id="cp-topbar-title">Send SMS</span></div>'
  + '    <div class="cp-lead-online"><div class="cp-online-dot"></div><span class="cp-lead-fullname" id="cp-name">—</span></div>'
  + '    <div class="cp-topbar-btns">'
  + '      <button class="cp-top-btn" onclick="cpStub(\'Media\')" title="Media"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg></button>'
  + '      <button class="cp-top-btn call-btn" onclick="cpCallLead()" title="Call"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></button>'
  + '      <div class="cp-kebab-wrap" id="cp-kebab-wrap">'
  + '        <button class="cp-top-btn" id="cp-kebab-btn" onclick="toggleCPKebab(event)" title="More"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>'
  + '        <div class="cp-kebab-menu" id="cp-kebab-menu">'
  + '          <div class="cp-kebab-item" onclick="cpOpenInCRM(\'Add Reminder\')"><i class="ti ti-bell" aria-hidden="true"></i> Add Reminder</div>'
  + '          <div class="cp-kebab-item" onclick="cpOpenInCRM(\'Add Appointment\')"><i class="ti ti-calendar-plus" aria-hidden="true"></i> Add Appointment</div>'
  + '          <div class="cp-kebab-item" onclick="cpOpenInCRM(\'Business Card\')"><i class="ti ti-id" aria-hidden="true"></i> Business Card</div>'
  + '          <div class="cp-kebab-item" onclick="cpOpenInCRM(\'Task\')"><i class="ti ti-checkbox" aria-hidden="true"></i> Task</div>'
  + '          <div class="cp-kebab-item" onclick="cpOpenInCRM(\'Send Review Link\')"><i class="ti ti-star" aria-hidden="true"></i> Send Review Link</div>'
  + '          <div class="cp-kebab-item" onclick="cpOpenInCRM(\'Add New Deal\')"><i class="ti ti-briefcase" aria-hidden="true"></i> Add New Deal</div>'
  + '          <div class="cp-kebab-item" onclick="cpOpenInCRM(\'Edit CRM Lead\')"><i class="ti ti-pencil" aria-hidden="true"></i> Edit CRM Lead</div>'
  + '        </div>'
  + '      </div>'
  + '      <button class="cp-top-btn" onclick="closeContactPanel()" title="Close" style="color:#e85555;border-color:rgba(232,85,85,.3);">&#x2715;</button>'
  + '    </div>'
  + '  </div>'
  + '  <div class="cp-body">'
  + '    <div class="cp-sidebar" id="cp-sidebar">'
  + '      <button class="cp-sidebar-close" onclick="toggleCPSidebar()" aria-label="Close info"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>'
  + '      <div class="cp-sidebar-field"><div class="cp-sidebar-label">Stock</div><div class="cp-sidebar-value" id="cp-stock">—</div></div>'
  + '      <div class="cp-sidebar-field"><div class="cp-sidebar-label">Vehicle</div><div class="cp-sidebar-value" id="cp-vehicle" style="font-family:var(--font);font-size:12px;">—</div></div>'
  + '      <div class="cp-sidebar-field"><div class="cp-sidebar-label">Status</div><div class="cp-label-select" id="cp-status-cell" onclick="openSharedStatusPopup(event)"></div></div>'
  + '      <div class="cp-sidebar-field"><div class="cp-sidebar-label">Label</div><div class="cp-label-select" id="cp-label-cell" onclick="openSharedLabelPopup(event)">—</div></div>'
  + '      <div class="cp-sidebar-field"><div class="cp-sidebar-label">Lead Assigned to</div><div class="cp-assign-row"><div class="cp-assign-av" id="cp-assign-av" style="background:#4f7cff;">DP</div><div class="cp-assign-name" id="cp-assign-name">David P.</div></div></div>'
  + '      <div class="cp-sidebar-field"><div class="cp-sidebar-label">Phone</div><div class="cp-sidebar-value" id="cp-phone" style="font-size:11.5px;">—</div></div>'
  + '      <div class="cp-sidebar-field"><div class="cp-sidebar-label">Email</div><div class="cp-sidebar-value" id="cp-email-tag" style="font-size:11px;color:#6e9dff;font-family:var(--font);">—</div></div>'
  + '    </div>'
  + '    <div class="cp-sidebar-collapse" onclick="toggleCPSidebar()" id="cp-collapse-btn" title="Toggle sidebar"><svg width="8" height="12" viewBox="0 0 8 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 1L2 6l3 5"/></svg></div>'
  + '    <div class="cp-convo">'
  + '      <div class="cp-tabs" id="cp-tabs">'
  + '        <div class="cp-tab active" data-tab="all" onclick="setCPTab(this,\'all\')">All</div>'
  + '        <div class="cp-tab" data-tab="sms" onclick="setCPTab(this,\'sms\')">SMS</div>'
  + '        <div class="cp-tab" data-tab="email" onclick="setCPTab(this,\'email\')">Email</div>'
  + '        <div class="cp-tab" data-tab="files" onclick="setCPTab(this,\'files\')">Files</div>'
  + '        <div class="cp-tab" data-tab="notes" onclick="setCPTab(this,\'notes\')">Notes</div>'
  + '        <div class="cp-tab" data-tab="calls" onclick="setCPTab(this,\'calls\')">Call Logs</div>'
  + '        <div class="cp-tab" data-tab="activity" onclick="setCPTab(this,\'activity\')">Activity</div>'
  + '      </div>'
  + '      <div class="cp-messages" id="cp-messages"></div>'
  + '      <div class="cp-summary" id="cp-summary">'
  + '        <div class="cp-summary-head" onclick="toggleCPSummary()"><span class="cp-summary-title"><span class="cp-summary-spark">✦</span>Conversation Summary</span><div class="cp-summary-acts"><button class="cp-summary-refresh" onclick="event.stopPropagation();" title="Regenerate"><span class="cp-refresh-ic">⟳</span></button><span class="cp-summary-chev">▾</span></div></div>'
  + '        <div class="cp-summary-body"><p class="cp-summary-text" id="cp-summary-text"></p><div class="cp-summary-stats" id="cp-summary-stats"></div><div class="cp-help"><button class="cp-help-btn" onclick="cpSharedHelpMe()"><span class="cp-help-ic">✦</span>Suggested Next Actions</button></div><div class="cp-suggestions" id="cp-suggestions" style="display:none;"></div></div>'
  + '      </div>'
  + '      <div class="cp-compose">'
  + '        <div class="cp-compose-row1">'
  + '          <select class="cp-type-sel" id="cp-type-select" onchange="onCPTypeChange(this.value)"><option>SMS</option><option>Email</option><option>Notes</option></select>'
  + '          <div class="cp-from-row" id="cp-from-row" onclick="toggleCPFromPopup(event)">Sent From: <span id="cp-from-agent">Angel Garcia</span> ▾</div>'
  + '        </div>'
  + '        <div class="cp-input-row" id="cp-sms-row">'
  + '          <textarea class="cp-textarea" id="cp-textarea" placeholder="Enter message here" rows="1" oninput="autoResizeTA(this)" onkeydown="handleCPEnter(event)"></textarea>'
  + '          <button class="cp-send-btn" onclick="sendCPMessage()" title="Send"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>'
  + '        </div>'
  + '        <div class="cp-tools-row">'
  + '          <button class="cp-ai-btn" onclick="cpStub(\'AI Compose\')" title="AI Compose"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/></svg><span class="cp-ai-btn-label">AI Compose</span></button>'
  + '          <button class="cp-tool" onclick="cpStub(\'Emoji\')" title="Emoji"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9.2" x2="9.01" y2="9.2"/><line x1="15" y1="9.2" x2="15.01" y2="9.2"/></svg></button>'
  + '          <button class="cp-tool" onclick="cpStub(\'Attach\')" title="Attach"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg></button>'
  + '          <button class="cp-tool" onclick="cpStub(\'Voice\')" title="Voice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M5 10v1a7 7 0 0 0 14 0v-1"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg></button>'
  + '          <span class="cp-tools-hint">Enter to send</span>'
  + '        </div>'
  + '      </div>'
  + '    </div>'
  + '  </div>'
  + '</div>'
  + '<div class="assign-popup status-popup" id="cp-shared-status-popup" style="display:none;"><div class="assign-popup-title">Status</div><div class="lblp-list" id="cp-shared-status-list"></div></div>'
  + '<div class="cp-from-popup" id="cp-from-popup">'
  +   '<div class="cp-from-tabs">'
  +     '<div class="cp-from-tab active" onclick="setCPFromTab(this,\'users\')">Users</div>'
  +     '<div class="cp-from-tab" onclick="setCPFromTab(this,\'depts\')">Department</div>'
  +   '</div>'
  +   '<div class="cp-from-search"><input type="text" id="cp-from-search-input" placeholder="Search…" oninput="renderCPFromList(this.value)"></div>'
  +   '<div class="cp-from-list" id="cp-from-list"></div>'
  + '</div>'
  + '<div class="assign-popup label-popup" id="cp-shared-label-popup" style="display:none;">'
  +   '<div class="assign-popup-title">Label</div>'
  +   '<div class="lblp-sort"><span class="lblp-sort-lbl">Sort by</span><div class="lblp-sort-seg">'
  +     '<button class="lblp-sort-btn" data-sort="name" onclick="setSharedLabelSort(\'name\')">Name</button>'
  +     '<button class="lblp-sort-btn" data-sort="color" onclick="setSharedLabelSort(\'color\')">Color</button>'
  +   '</div></div>'
  +   '<div class="lblp-list" id="cp-shared-label-list"></div>'
  +   '<div class="lblp-create">'
  +     '<input type="text" id="cp-shared-new-name" placeholder="New label name" maxlength="24" onkeydown="if(event.key===\'Enter\'){event.preventDefault();addNewSharedLabel();}">'
  +     '<div class="lblp-swatches" id="cp-shared-swatches"></div>'
  +     '<button class="lblp-add-btn" onclick="addNewSharedLabel()">Create label</button>'
  +   '</div>'
  + '</div>';

  /* ── helpers ──────────────────────────────────────────────────────────── */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function initialsOf(n){ var p=String(n||'').trim().split(/\s+/); return (((p[0]||'')[0]||'')+((p.length>1&&p[p.length-1][0])||'')).toUpperCase(); }
  function srand(seed){ var s=seed|0; return function(){ s=(s*1664525+1013904223)>>>0; return (s&0xfffffff)/0xfffffff; }; }
  function fmtTime(d){ return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) + ' · ' + d.toLocaleDateString('en-US',{month:'short',day:'numeric'}); }

  function buildPanel(){
    if(document.getElementById('contact-panel-shared')) return;
    var div = document.createElement('div'); div.innerHTML = PANEL_HTML;
    while(div.firstChild) document.body.appendChild(div.firstChild);
    // Backdrop for mobile
    var bd = document.createElement('div'); bd.id='cp-shared-backdrop';
    bd.style.cssText='position:fixed;inset:64px 0 0 0;background:rgba(0,0,0,.5);opacity:0;visibility:hidden;transition:opacity .2s,visibility .2s;z-index:1485;';
    bd.addEventListener('click', window.closeContactPanel);
    document.body.appendChild(bd);
  }

  /* ── Mock content generators (deterministic per lead.no) ───────────────── */
  function smsThread(lead){
    var rnd = srand((lead.no||0)*7919);
    var inLines = ['Thanks, will check in tonight.','Can we move it to 3pm?','Got the docs, thank you!','Is the vehicle still available?','Sounds good — see you then.'];
    var outLines = ['Just wanted to check in — let me know if you have questions.','Following up on the test drive.','Sent you the pricing breakdown.','Quick reminder about your appointment tomorrow.','Got a new arrival you might like.'];
    var n = 5 + Math.floor(rnd()*4), out=[];
    for(var i=0;i<n;i++){
      var dir = (i % 2 === 0) ? 'out' : 'in';
      var arr = dir==='out' ? outLines : inLines;
      out.push({ kind:'sms', dir:dir, text: arr[Math.floor(rnd()*arr.length)], time: new Date(Date.now() - (n-i)*2*3600*1000), sender: dir==='out'?'David P.':lead.name });
    }
    return out;
  }
  function emailThread(lead){
    var rnd = srand((lead.no||0)*1303);
    var subj = ['Re: Financing options','Your test drive — next steps','Re: Trade-in appraisal','Loan paperwork attached'];
    var bodies = ['Thanks for your time today.','Looking forward to your reply when you have a moment.','Let me know if you have any questions.','Following up on the items we discussed.'];
    var n = 2 + Math.floor(rnd()*3), out=[];
    for(var i=0;i<n;i++){
      var dir = (i % 2 === 0) ? 'out' : 'in';
      out.push({ kind:'email', dir:dir, subject: subj[Math.floor(rnd()*subj.length)], body: bodies[Math.floor(rnd()*bodies.length)], time: new Date(Date.now() - (n-i)*8*3600*1000), sender: dir==='out'?'David P.':lead.name });
    }
    return out;
  }
  function callThread(lead){
    var counts = (window.CCLeads && CCLeads.callCountsForLead) ? CCLeads.callCountsForLead(lead) : {in:2,out:1,missed:1,answered:1,returned:1};
    var rnd = srand((lead.no||0)*409);
    var out=[];
    for(var m=0;m<counts.missed;m++) out.push({kind:'call',outcome:'missed',dir:'in',time:new Date(Date.now()-(m+1)*4*3600*1000),dur:0});
    for(var a=0;a<counts.answered;a++) out.push({kind:'call',outcome:'answered',dir:'in',time:new Date(Date.now()-(a+counts.missed+1)*5*3600*1000),dur:120+Math.floor(rnd()*200)});
    for(var r=0;r<counts.returned;r++) out.push({kind:'call',outcome:'answered',dir:'out',time:new Date(Date.now()-(r+counts.missed+counts.answered+1)*6*3600*1000),dur:90+Math.floor(rnd()*180)});
    return out;
  }
  function filesList(lead){
    var rnd=srand((lead.no||0)*811);
    var names=['Test_drive_agreement.pdf','Credit_application.pdf','Trade_in_photos.zip','License_scan.jpg','Insurance_card.jpg'];
    var n=2+Math.floor(rnd()*3);
    return names.slice(0,n).map(function(nm,i){ return { name:nm, size:Math.floor(40+rnd()*400)+'KB', when:fmtTime(new Date(Date.now()-(i+1)*86400*1000)) }; });
  }
  function notesList(lead){
    var rnd=srand((lead.no||0)*709);
    var notes=['Customer prefers SUVs in dark colors.','Looking to trade in a 2018 sedan.','Needs financing under 7% APR.','Wants to bring spouse on next visit.'];
    var n=1+Math.floor(rnd()*3);
    return notes.slice(0,n).map(function(t,i){ return { author:'David P.', text:t, time:fmtTime(new Date(Date.now()-(i+1)*7200*1000)) }; });
  }
  function activityList(lead){
    var rnd=srand((lead.no||0)*317);
    var items=['Lead created from Cars.com','Status changed to Active','Assigned to David P.','First SMS sent','Test drive scheduled','Notes updated'];
    var n=3+Math.floor(rnd()*3);
    return items.slice(0,n).map(function(t,i){ return { text:t, time:fmtTime(new Date(Date.now()-(i+1)*4*3600*1000)) }; });
  }

  /* ── Render functions (canonical CRM markup) ─────────────────────────── */
  var SMS_ICON = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4.99554 13.1945C6.25588 13.9239 7.73847 14.1701 9.16691 13.8871C10.5953 13.6042 11.8721 12.8114 12.7592 11.6566C13.6463 10.5017 14.0831 9.06374 13.9883 7.61063C13.8934 6.15753 13.2734 4.78852 12.2437 3.75883C11.214 2.72915 9.84497 2.10907 8.39187 2.01422C6.93876 1.91936 5.50076 2.3562 4.34595 3.24328C3.19114 4.13037 2.39835 5.40715 2.11539 6.83559C1.83243 8.26403 2.07862 9.74662 2.80804 11.007L2.02617 13.3413C1.99679 13.4294 1.99253 13.524 2.01386 13.6144C2.03519 13.7047 2.08127 13.7874 2.14694 13.8531C2.2126 13.9187 2.29526 13.9648 2.38565 13.9861C2.47603 14.0075 2.57057 14.0032 2.65867 13.9738L4.99554 13.1945Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var MAIL_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
  var TICK = '<span class="cp-tick"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>';

  function fmtClock(d){ return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}); }

  function renderSMSItem(m){
    var L = STATE.lead;
    var out = m.dir === 'out';
    var avBg = out ? '#4f7cff' : (L && L.ac || '#534AB7');
    var avTxt = out ? 'DP' : initialsOf(L && L.name || '??');
    var senderName = out ? 'David P.' : (L && L.name || '');
    var headerHtml = out
      ? '<div class="cp-email-head out"><span class="cp-email-icon">'+SMS_ICON+'</span><span class="cp-email-label">SMS</span></div>'
      : '<div class="cp-email-head in"><span class="cp-email-label">SMS</span><span class="cp-email-icon">'+SMS_ICON+'</span></div>';
    return '<div class="cp-msg '+(out?'out':'in')+'">'
      + '<div class="cp-bav" style="background:'+esc(avBg)+';">'+esc(avTxt)+'</div>'
      + '<div class="cp-bubble-col">'
      +   '<div class="cp-bubble cp-email-bubble '+(out?'out':'in')+'">'
      +     headerHtml
      +     '<div class="cp-email-content"><div class="cp-email-body-text">'+esc(m.text)+'</div></div>'
      +   '</div>'
      +   '<div class="cp-meta">'
      +     '<span class="cp-meta-name">'+esc(senderName)+'</span>'
      +     '<span>'+esc(fmtClock(m.time))+'</span>'
      +     (out ? TICK : '')
      +   '</div>'
      + '</div>'
    + '</div>';
  }
  function renderEmailItem(m){
    var L = STATE.lead;
    var out = m.dir === 'out';
    var avBg = out ? '#4f7cff' : (L && L.ac || '#534AB7');
    var avTxt = out ? 'DP' : initialsOf(L && L.name || '??');
    var senderName = out ? 'David P.' : (L && L.name || '');
    var headerHtml = out
      ? '<div class="cp-email-head out"><span class="cp-email-icon">'+MAIL_ICON+'</span><span class="cp-email-label">EMAIL</span></div>'
      : '<div class="cp-email-head in"><span class="cp-email-label">EMAIL</span><span class="cp-email-icon">'+MAIL_ICON+'</span></div>';
    return '<div class="cp-msg '+(out?'out':'in')+'">'
      + '<div class="cp-bav" style="background:'+esc(avBg)+';">'+esc(avTxt)+'</div>'
      + '<div class="cp-bubble-col">'
      +   '<div class="cp-bubble cp-email-bubble '+(out?'out':'in')+'">'
      +     headerHtml
      +     '<div class="cp-email-content">'
      +       (m.subject ? '<div class="cp-email-subj">'+esc(m.subject)+'</div>' : '')
      +       '<div class="cp-email-body-text">'+esc(m.body)+'</div>'
      +     '</div>'
      +   '</div>'
      +   '<div class="cp-meta">'
      +     '<span class="cp-meta-name">'+esc(senderName)+'</span>'
      +     '<span>'+esc(fmtClock(m.time))+'</span>'
      +     (out ? TICK : '')
      +   '</div>'
      + '</div>'
    + '</div>';
  }
  function renderCallItem(c){
    var out = c.dir === 'out';
    var arrow = out
      ? '<path d="M7 17L17 7M17 7H8M17 7V16"/>'
      : '<path d="M17 7L7 17M7 17H16M7 17V8"/>';
    var outcomeMap = { missed:['missed','Missed'], answered:['answered','Answered'], returned:['outgoing','Returned'] };
    var oc = outcomeMap[c.outcome] || outcomeMap.answered;
    var outcomeBadge = '<span class="dr-outcome '+oc[0]+'" style="font-size:10.5px;font-weight:600;margin-left:6px;">'+oc[1]+'</span>';
    var pad = function(n){ return String(n).padStart(2,'0'); };
    var mins = Math.floor((c.dur||0)/60), secs = (c.dur||0)%60;
    return '<div class="cp-call '+(out?'out':'in')+'">'
      + '<div class="cp-call-icon"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">'+arrow+'</svg></div>'
      + '<div class="cp-call-body">'
      +   '<div class="cp-call-top"><span class="cp-call-dir">'+(out?'Outbound':'Inbound')+outcomeBadge+'</span><span class="cp-call-time">'+esc(fmtClock(c.time))+'</span></div>'
      +   '<div class="cp-call-sub">'
      +     '<span class="cp-call-num">'+(out?'(469) 555-0118':((STATE.lead && STATE.lead.phone)||'—'))+' &ndash; '+(out?((STATE.lead && STATE.lead.phone)||'—'):'(469) 555-0118')+'</span>'
      +     '<span class="cp-call-dur"><span class="cp-dur-num">'+pad(mins)+'</span> <span class="cp-dur-unit">Min</span> <span class="cp-dur-num">'+pad(secs)+'</span> <span class="cp-dur-unit">Sec</span></span>'
      +   '</div>'
      + '</div>'
      + '<button class="cp-call-play" title="Play"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button>'
    + '</div>';
  }
  function renderFileItem(f){
    return '<div class="cp-msg in" style="margin:6px 0;"><div class="cp-bav" style="background:#1e2333;color:#6e9dff;">📄</div><div class="cp-bubble-col"><div class="cp-bubble in" style="padding:10px 12px;"><div style="font-size:12.5px;font-weight:600;color:var(--tx);">'+esc(f.name)+'</div><div style="font-size:11px;color:var(--mu);margin-top:3px;">'+esc(f.size)+'</div></div><div class="cp-meta"><span>'+esc(f.when)+'</span></div></div></div>';
  }
  function renderNoteItem(n){
    return '<div class="cp-note-wrap">'
      + '<div class="cp-note-card">'
      +   '<div class="cp-note-head"><span class="cp-note-title">Notes</span></div>'
      +   '<div class="cp-note-divider"></div>'
      +   '<svg class="cp-note-q cp-note-q-open" width="28" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z"/></svg>'
      +   '<div class="cp-note-text">'+esc(n.text)+'</div>'
      +   '<svg class="cp-note-q cp-note-q-close" width="28" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.748-9.571 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z"/></svg>'
      + '</div>'
      + '<div class="cp-note-meta"><span class="cp-note-time">'+esc(n.time)+'</span><span class="cp-note-author">'+esc(n.author)+'</span></div>'
    + '</div>';
  }
  function renderActivityItem(a){
    return '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;">'
      + '<div style="height:0.5px;flex:1;background:var(--brd);"></div>'
      + '<span style="font-size:11px;color:var(--mu);white-space:nowrap;">'+esc(a.text)+' · '+esc(a.time)+'</span>'
      + '<div style="height:0.5px;flex:1;background:var(--brd);"></div>'
    + '</div>';
  }

  /* Status options mirroring CRM's STATUS_LIST */
  var SHARED_STATUS_LIST = ['Dead','Active','Follow Up','Sold','Deposit','BDC - Show','BDC - No Show','BDC - Reschedule','BDC - Follow Up','BDC - Appt Set'];
  function statusColorOf(s){
    if(s==='Active') return '#22c88a';
    if(s==='Follow Up') return '#f5a623';
    if(s==='Dead') return '#e85555';
    if(s==='Sold') return '#2dd4bf';
    if(s==='Deposit') return '#6e9dff';
    if(typeof s === 'string' && s.indexOf('BDC') === 0) return '#c4b5fd';
    return '#22c88a';
  }

  /* Read the lead's label from CRM-shared localStorage (cc_lead_labels + cc_lead_label_map) */
  function getLeadLabel(no){
    try{
      var labels = JSON.parse(localStorage.getItem('cc_lead_labels')||'null');
      var map    = JSON.parse(localStorage.getItem('cc_lead_label_map')||'null');
      if(!labels || !map) return null;
      var ids = map[no] || []; if(!ids.length) return null;
      return labels.find(function(x){ return x.id === ids[0]; }) || null;
    }catch(e){ return null; }
  }

  /* Status → color mapping (matches CRM status pill colors) */
  var STATUS_COLORS = {
    'Active':'#22c88a', 'BDC - Show':'#22c88a', 'Follow Up':'#f5a623', 'BDC - Follow Up':'#f5a623',
    'Hot':'#e85555', 'BDC - No Show':'#e85555', 'BDC - Reschedule':'#6e9dff', 'Appt Set':'#6e9dff',
    'BDC - Appt Set':'#6e9dff', 'Deposit':'#22c88a', 'Sold':'#22c88a', 'Dead':'#7a7f94',
    'New':'#6e9dff', 'Demo':'#f5a623'
  };

  function renderTab(){
    var box = document.getElementById('cp-messages'); if(!box) return;
    var L = STATE.lead; if(!L){ box.innerHTML = ''; return; }
    var html = '';
    if(STATE.tab === 'all'){
      var items = [].concat(
        smsThread(L).map(function(x){x.t='sms';return x;}),
        emailThread(L).map(function(x){x.t='email';return x;}),
        callThread(L).map(function(x){x.t='call';return x;})
      ).sort(function(a,b){ return b.time - a.time; });
      html = items.map(function(x){ return x.t==='sms'?renderSMSItem(x):x.t==='email'?renderEmailItem(x):renderCallItem(x); }).join('');
    } else if(STATE.tab === 'sms'){
      html = smsThread(L).map(renderSMSItem).join('');
    } else if(STATE.tab === 'email'){
      html = emailThread(L).map(renderEmailItem).join('');
    } else if(STATE.tab === 'calls'){
      html = callThread(L).map(renderCallItem).join('');
    } else if(STATE.tab === 'files'){
      var f = filesList(L);
      html = '<div style="display:flex;flex-direction:column;gap:8px;">'+(f.length?f.map(renderFileItem).join(''):'<div style="text-align:center;color:var(--mu);padding:30px;">No files yet.</div>')+'</div>';
    } else if(STATE.tab === 'notes'){
      var nl = notesList(L);
      html = '<div style="display:flex;flex-direction:column;gap:8px;">'+(nl.length?nl.map(renderNoteItem).join(''):'<div style="text-align:center;color:var(--mu);padding:30px;">No notes yet.</div>')+'</div>';
    } else if(STATE.tab === 'activity'){
      html = '<div>'+activityList(L).map(renderActivityItem).join('')+'</div>';
    }
    box.innerHTML = html || '<div style="text-align:center;color:var(--mu);padding:40px;">Nothing to show.</div>';
    box.scrollTop = box.scrollHeight;
  }

  function renderSummary(){
    var L = STATE.lead; if(!L) return;
    var counts = (window.CCLeads && CCLeads.callCountsForLead) ? CCLeads.callCountsForLead(L) : {in:0,out:0,missed:0,answered:0,returned:0};
    var sms = smsThread(L);
    var em = emailThread(L);
    var smsTotal = sms.length, emailTotal = em.length, callTotal = (counts.in||0)+(counts.out||0);
    var vm = Math.min(counts.missed || 0, 3);
    var touches = smsTotal + emailTotal + callTotal;
    var first = (L.name||'').trim().split(/\s+/)[0] || 'This lead';
    var level = touches >= 8 ? 'highly engaged' : (touches >= 3 ? 'actively engaged' : 'lightly engaged');
    // Build the breakdown line ("X SMS, Y emails and Z calls"), matching CRM
    var parts = [];
    if(smsTotal) parts.push(smsTotal + ' SMS');
    if(emailTotal) parts.push(emailTotal + ' email' + (emailTotal===1?'':'s'));
    if(callTotal) parts.push(callTotal + ' call' + (callTotal===1?'':'s') + (vm ? ' ('+vm+' voicemail'+(vm===1?'':'s')+')' : ''));
    var breakdown = parts.length ? parts.join(', ').replace(/,([^,]*)$/, ' and$1') : 'no logged activity yet';
    // Mock intents/tone — fixed pair to match CRM look without a real corpus
    var intents = ['financing options', 'scheduling a test drive'];
    var tone = 'positive';
    // Last reply quote from the inbound side of the SMS or email thread
    function lastIn(arr){ for(var i=arr.length-1;i>=0;i--){ if(arr[i].dir==='in') return arr[i].text || arr[i].body || ''; } return ''; }
    var quote = lastIn(sms) || lastIn(em);
    if(quote && quote.length > 90) quote = quote.slice(0,87).trim() + '…';

    var s1 = '<span class="cp-sum-em">'+esc(first)+'</span> is '+level+' — '+esc(breakdown)+'.';
    var s2 = intents.length ? (' Conversation centers on '+esc(intents.slice(0,2).join(' and '))+'; overall tone is '+tone+'.') : (' Overall tone is '+tone+'.');
    var s3 = quote ? (' Last reply: “'+esc(quote)+'”.') : '';

    var t = document.getElementById('cp-summary-text');
    if(t){ t.className = 'cp-summary-text'; t.innerHTML = s1 + s2 + s3; }

    var statsEl = document.getElementById('cp-summary-stats');
    if(statsEl){
      var stats = [{ic:'💬',label:'SMS',ct:smsTotal},{ic:'✉️',label:'Email',ct:emailTotal},{ic:'📞',label:'Calls',ct:callTotal},{ic:'🎙️',label:'VM',ct:vm}];
      var chips = stats.map(function(s){
        return '<span class="cp-sum-chip"><span class="cp-sum-ic">'+s.ic+'</span>'+s.label+' <span class="cp-sum-ct">'+s.ct+'</span></span>';
      }).join('');
      if(L.lastAttempt) chips += '<span class="cp-sum-last">· Last: '+esc(L.lastAttempt)+'</span>';
      statsEl.innerHTML = chips;
    }
  }

  /* ── Public API ────────────────────────────────────────────────────────── */
  window.openContactPanel = function(leadNo, tab){
    buildPanel();
    var lead = (window.CCLeads && CCLeads.LEADS) ? CCLeads.LEADS.find(function(l){ return l.no === leadNo; }) : null;
    if(!lead) lead = { no:leadNo, name:'Lead #'+leadNo };
    STATE.leadNo = leadNo; STATE.lead = lead;
    // Populate top bar + sidebar
    var av = lead.ac || '#4f7cff';
    document.getElementById('cp-name').textContent = lead.name || ('Lead #'+leadNo);
    document.getElementById('cp-stock').textContent = lead.stock || '—';
    document.getElementById('cp-vehicle').textContent = lead.vehicle || '—';
    var statusVal = lead.status || 'Active';
    var statusCell = document.getElementById('cp-status-cell');
    var sc = STATUS_COLORS[statusVal] || '#22c88a';
    statusCell.textContent = statusVal;
    statusCell.style.backgroundColor = sc + '1f';
    statusCell.style.color = sc;
    var labelCell = document.getElementById('cp-label-cell');
    var lb = getLeadLabel(leadNo);
    if(lb){
      labelCell.className = 'cp-label-select';
      labelCell.style.backgroundColor = lb.color + '1f';
      labelCell.style.color = lb.color;
      labelCell.textContent = lb.name;
    } else {
      labelCell.className = 'cp-label-select is-empty';
      labelCell.style.backgroundColor = '';
      labelCell.style.color = '';
      labelCell.textContent = 'Add label';
    }
    document.getElementById('cp-phone').textContent = lead.phone || '—';
    document.getElementById('cp-email-tag').textContent = lead.email || '—';
    // Active tab
    var tabEl = document.querySelector('#contact-panel-shared .cp-tab[data-tab="'+(tab||'all')+'"]') || document.querySelector('#contact-panel-shared .cp-tab[data-tab="all"]');
    window.setCPTab(tabEl, tab || 'all');
    renderSummary();
    // Show
    document.getElementById('contact-panel-shared').classList.add('open');
    var bd=document.getElementById('cp-shared-backdrop'); if(bd){ bd.style.opacity='1'; bd.style.visibility='visible'; }
    // Mobile: start with sidebar collapsed (messages-first, matches CRM)
    var _cpBody = document.querySelector('#contact-panel-shared .cp-body');
    if(_cpBody){
      if(window.innerWidth <= 640) _cpBody.classList.add('sb-collapsed');
      else _cpBody.classList.remove('sb-collapsed');
    }
  };
  window.closeContactPanel = function(){
    var p = document.getElementById('contact-panel-shared'); if(p) p.classList.remove('open');
    var bd=document.getElementById('cp-shared-backdrop'); if(bd){ bd.style.opacity='0'; bd.style.visibility='hidden'; }
    if(window._cpFromBell){
      window._cpFromBell = false;
      if(typeof window.openNotifications === 'function') setTimeout(function(){ window.openNotifications(); }, 260);
    }
  };
  window.setCPTab = function(el, tab){
    STATE.tab = tab;
    document.querySelectorAll('#contact-panel-shared .cp-tab').forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-tab') === tab); });
    var title = document.getElementById('cp-topbar-title');
    if(title) title.textContent = ({sms:'Send SMS', email:'Send Email', files:'Files', notes:'Notes', calls:'Call Logs', activity:'Activity', all:'All Conversations'})[tab] || 'Conversation';
    var sel = document.getElementById('cp-type-select');
    if(sel){
      if(tab === 'email') sel.value = 'Email';
      else if(tab === 'notes') sel.value = 'Notes';
      else sel.value = 'SMS';
    }
    renderTab();
  };

  /* ── Suggested Next Actions (port of cpHelpMe + buildActionableSuggestions) */
  var _sharedSugCache = [];
  var _sharedHelpTimer = null;
  function buildSharedSuggestions(lead){
    if(!lead) return [];
    var sms = smsThread(lead), em = emailThread(lead);
    var corpus = sms.concat(em).map(function(m){ return (m.subject?m.subject+' ':'')+(m.text||m.body||''); }).join(' ').toLowerCase();
    var counts = (window.CCLeads && CCLeads.callCountsForLead) ? CCLeads.callCountsForLead(lead) : {in:0,out:0,missed:0};
    var lastSms = sms[sms.length-1];
    var awaiting = lastSms && lastSms.dir === 'in';
    var first = (lead.name||'').trim().split(/\s+/)[0] || 'the lead';
    var sug = [];
    if(awaiting){
      sug.push({ic:'↩️', text: first+' is awaiting a reply — respond now to keep the conversation moving.', action:'draft', draft:'Hi '+first+', following up on your message — how can I help?'});
    }
    if(/financ|\bapr\b|\brate\b|credit|loan|down payment/.test(corpus)){
      if(lead.email){
        sug.push({ic:'✉️', text:'Financing came up — email the rate breakdown and a pre-qualification link.', action:'email', subject:'Your financing options & pre-qualification', draft:'Hi '+first+',\n\nThanks for your interest! Here are our current financing rates along with a quick pre-qualification link.\n\n— David'});
      } else {
        sug.push({ic:'💳', text:'Financing came up — send current rates and a pre-qualification link.', action:'draft', draft:'Here are our current financing rates, plus a quick pre-qualification link.'});
      }
    }
    if(/test drive|test-drive|saturday|come in|appointment|schedule|visit/.test(corpus)){
      sug.push({ic:'📅', text:"A test drive was mentioned — book it on the calendar so it doesn't slip.", action:'appointment'});
    }
    if(/trade-?in/.test(corpus)){
      sug.push({ic:'🚗', text:'They have a trade-in — ask for year, make, model and mileage to prep a quote.', action:'draft', draft:'Happy to value your trade-in! Could you share the year, make, model, and approximate mileage?'});
    }
    if((counts.out + counts.in) < 2){
      sug.push({ic:'📞', text:'Call activity is low — a quick call often converts faster than text.', action:'call'});
    }
    if(!sug.length){
      sug.push({ic:'✍️', text:'Send a friendly follow-up to re-engage and surface the next step.', action:'draft', draft:'Hi '+first+', just checking in — anything I can help with on your vehicle search?'});
    }
    return sug.slice(0,4);
  }
  window.cpSharedHelpMe = function(){
    var wrap = document.getElementById('cp-suggestions'); if(!wrap || !STATE.lead) return;
    wrap.style.display = 'block';
    wrap.innerHTML = '<div class="cp-sug-loading"><span class="cp-help-ic">✦</span>Analyzing conversation…</div>';
    clearTimeout(_sharedHelpTimer);
    _sharedHelpTimer = setTimeout(function(){
      var sug = buildSharedSuggestions(STATE.lead);
      _sharedSugCache = sug;
      var labels = { draft:'Draft reply', email:'Draft email', appointment:'Book', call:'Call' };
      var rows = sug.map(function(s, i){
        var lbl = labels[s.action] || '';
        var act = lbl ? '<button class="cp-sug-act" onclick="cpSharedSugAction('+i+')">'+lbl+'</button>' : '';
        return '<div class="cp-sug-item"><span class="cp-sug-ic">'+s.ic+'</span><span class="cp-sug-text">'+esc(s.text)+'</span>'+act+'</div>';
      }).join('');
      wrap.innerHTML = '<div class="cp-sug-head">Suggested next steps</div>' + rows;
    }, 650);
  };
  window.cpSharedSugAction = function(i){
    var s = _sharedSugCache[i]; if(!s) return;
    if(s.action === 'call'){ window.cpCallLead(); return; }
    if(s.action === 'appointment'){ window.cpOpenInCRM('Add Appointment'); return; }
    if(s.action === 'email'){
      window.setCPTab(null, 'email');
      var sel = document.getElementById('cp-type-select'); if(sel) sel.value = 'Email';
      var ta = document.getElementById('cp-textarea'); if(ta && s.draft){ ta.value = s.draft; window.autoResizeTA(ta); ta.focus(); }
      return;
    }
    window.setCPTab(null, 'sms');
    var ta2 = document.getElementById('cp-textarea'); if(ta2 && s.draft){ ta2.value = s.draft; window.autoResizeTA(ta2); ta2.focus(); }
  };

  /* ── Stub handlers (so onclick attrs don't throw) ──────────────────────── */
  window.cpStub = function(label){ if(typeof window.showNavToast==='function') showNavToast(label, 'This action lives on the CRM page.'); };
  window.cpOpenInCRM = function(label){
    window.closeCPKebab && window.closeCPKebab();
    var no = STATE.leadNo;
    if(typeof window.showNavToast==='function') showNavToast(label, 'Opening on the CRM page…');
    setTimeout(function(){
      var path = location.pathname.replace(/\\/g,'/');
      var depth = (path.indexOf('/Settings/')>=0 || path.indexOf('/reputation/')>=0) ? '../../' : '../';
      window.location.href = depth + 'coreconnect_leads_v83/coreconnect_leads_v83.html?openLead=' + encodeURIComponent(no||'');
    }, 600);
  };
  window.cpCallLead = function(){
    var L = STATE.lead;
    if(L && L.phone && typeof window.callDialerContact === 'function'){
      window.callDialerContact(L.phone, L.name, initialsOf(L.name||'??'), L.ac||'#4f7cff');
    } else { window.cpStub('Call'); }
  };
  window.toggleCPKebab = function(e){
    if(e) e.stopPropagation();
    var m = document.getElementById('cp-kebab-menu'); if(!m) return;
    var open = m.classList.toggle('open');
    if(open){
      var b = document.getElementById('cp-kebab-btn').getBoundingClientRect();
      m.style.top = (b.bottom + 4) + 'px'; m.style.left = Math.max(8, b.right - 184) + 'px';
    }
  };
  window.closeCPKebab = function(){ var m=document.getElementById('cp-kebab-menu'); if(m) m.classList.remove('open'); };
  window.toggleCPSidebar = function(){ var b=document.querySelector('#contact-panel-shared .cp-body'); if(b) b.classList.toggle('sb-collapsed'); };
  window.toggleCPSummary = function(){ var s=document.getElementById('cp-summary'); if(s) s.classList.toggle('collapsed'); };
  window.onCPTypeChange = function(v){
    if(v === 'Email') window.setCPTab(null, 'email');
    else if(v === 'Notes') window.setCPTab(null, 'notes');
    else window.setCPTab(null, 'sms');
  };
  window.autoResizeTA = function(t){ t.style.height='auto'; t.style.height = Math.min(120, t.scrollHeight) + 'px'; };
  window.handleCPEnter = function(e){ if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); window.sendCPMessage(); } };
  window.sendCPMessage = function(){
    var ta = document.getElementById('cp-textarea'); var v = (ta.value||'').trim(); if(!v) return;
    var box = document.getElementById('cp-messages');
    box.insertAdjacentHTML('beforeend', renderSMSItem({ dir:'out', text:v, time:new Date() }));
    ta.value=''; ta.style.height='auto'; box.scrollTop = box.scrollHeight;
  };

  /* Sent From picker (Users / Department) */
  var CP_FROM_DEPTS = [
    {key:'SA', name:'Sales',     color:'#4f7cff'},
    {key:'BD', name:'BDC',       color:'#22c88a'},
    {key:'SV', name:'Service',   color:'#f5a623'},
    {key:'MK', name:'Marketing', color:'#a78bfa'},
    {key:'FI', name:'Finance',   color:'#e85555'}
  ];
  var _cpFromTab = 'users';
  window.toggleCPFromPopup = function(ev){
    if(ev) ev.stopPropagation();
    var popup = document.getElementById('cp-from-popup'); if(!popup) return;
    if(popup.classList.contains('open')){ popup.classList.remove('open'); return; }
    _cpFromTab = 'users';
    document.querySelectorAll('.cp-from-tab').forEach(function(t){ t.classList.remove('active'); });
    document.querySelectorAll('.cp-from-tab')[0].classList.add('active');
    var inp = document.getElementById('cp-from-search-input'); if(inp) inp.value = '';
    window.renderCPFromList('');
    popup.classList.add('open');
    var anchor = document.getElementById('cp-from-row');
    var r = anchor.getBoundingClientRect();
    var ph = popup.offsetHeight, pw = popup.offsetWidth;
    var top = r.top - ph - 6; if(top < 8) top = r.bottom + 6;
    var left = r.right - pw; if(left < 8) left = 8;
    if(left + pw > window.innerWidth - 8) left = window.innerWidth - 8 - pw;
    popup.style.top = top + 'px';
    popup.style.left = left + 'px';
  };
  window.setCPFromTab = function(el, tab){
    document.querySelectorAll('.cp-from-tab').forEach(function(t){ t.classList.remove('active'); });
    el.classList.add('active');
    _cpFromTab = tab;
    var inp = document.getElementById('cp-from-search-input'); if(inp) inp.value = '';
    window.renderCPFromList('');
  };
  window.renderCPFromList = function(filter){
    var q = String(filter||'').trim().toLowerCase();
    var list = document.getElementById('cp-from-list'); if(!list) return;
    var cur = (document.getElementById('cp-from-agent').textContent||'').trim();
    if(_cpFromTab === 'users'){
      var users = (window.CCLeads && CCLeads.TEAM) ? CCLeads.TEAM : [];
      var matches = users.filter(function(u){ return u.name.toLowerCase().includes(q) || (u.role||'').toLowerCase().includes(q); });
      if(!matches.length){ list.innerHTML = '<div class="cp-from-empty">No users found</div>'; return; }
      list.innerHTML = matches.map(function(u){
        var nameE = u.name.replace(/'/g,"\\'");
        return '<div class="cp-from-item'+(cur===u.name?' selected':'')+'" onclick="pickCPFrom(\'user\',\''+nameE+'\',\''+u.color+'\',\''+u.key+'\')">'
          + '<div class="cp-from-item-av" style="background:'+u.color+';">'+u.key+'</div>'
          + '<div><div class="cp-from-item-name">'+esc(u.name)+'</div><div class="cp-from-item-role">'+esc(u.role||'')+'</div></div>'
        + '</div>';
      }).join('');
    } else {
      var depts = CP_FROM_DEPTS.filter(function(d){ return d.name.toLowerCase().includes(q); });
      if(!depts.length){ list.innerHTML = '<div class="cp-from-empty">No departments found</div>'; return; }
      list.innerHTML = depts.map(function(d){
        var disp = d.name + ' (Dept)';
        var nameE = d.name.replace(/'/g,"\\'");
        return '<div class="cp-from-item'+(cur===disp?' selected':'')+'" onclick="pickCPFrom(\'dept\',\''+nameE+'\',\''+d.color+'\',\''+d.key+'\')">'
          + '<div class="cp-from-item-av cp-from-item-dept-av" style="background:'+d.color+';">'+d.key+'</div>'
          + '<div><div class="cp-from-item-name">'+esc(d.name)+'</div><div class="cp-from-item-role">Department</div></div>'
        + '</div>';
      }).join('');
    }
  };
  window.pickCPFrom = function(kind, name){
    document.getElementById('cp-from-agent').textContent = (kind === 'dept') ? (name + ' (Dept)') : name;
    document.getElementById('cp-from-popup').classList.remove('open');
  };

  /* Status & Label popups */
  function positionPopup(pop, e){
    var rect = e.currentTarget.getBoundingClientRect();
    var pw = pop.offsetWidth || 230, ph = pop.offsetHeight || 320;
    var left = rect.left, top = rect.bottom + 4;
    if(left + pw > window.innerWidth) left = window.innerWidth - pw - 8;
    if(left < 8) left = 8;
    if(top + ph > window.innerHeight) top = Math.max(8, rect.top - ph - 4);
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
  }
  window.openSharedStatusPopup = function(e){
    if(!STATE.lead) return; e.stopPropagation();
    var pop = document.getElementById('cp-shared-status-popup'); if(!pop) return;
    var list = document.getElementById('cp-shared-status-list');
    var cur = STATE.lead.status || 'Active';
    list.innerHTML = SHARED_STATUS_LIST.map(function(s){
      var on = (s === cur);
      return '<div class="lblp-item'+(on?' on':'')+'" onclick="pickSharedStatus(\''+s.replace(/\'/g,"\\'")+'\')"><span class="lblp-dot" style="background:'+statusColorOf(s)+';"></span><span class="lblp-name">'+esc(s)+'</span><span class="lblp-check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span></div>';
    }).join('');
    pop.style.display = 'block';
    positionPopup(pop, e);
  };
  function closeSharedStatusPopup(){ var p=document.getElementById('cp-shared-status-popup'); if(p) p.style.display='none'; }
  window.pickSharedStatus = function(newStatus){
    closeSharedStatusPopup();
    if(!STATE.lead) return;
    STATE.lead.status = newStatus;
    // Persist back if leads-comms exposes a setter; otherwise the mutation lives on the in-memory LEADS object
    var cell = document.getElementById('cp-status-cell');
    if(cell){
      var c = statusColorOf(newStatus);
      cell.textContent = newStatus;
      cell.style.backgroundColor = c + '1f';
      cell.style.color = c;
    }
  };

  var SHARED_LABEL_PALETTE = ['#4f7cff','#22c88a','#f5a623','#e85555','#a78bfa','#2dd4bf','#ec4899','#0ea5e9','#f97316','#64748b'];
  var _sharedLblSort = 'name';
  var _sharedLblNewColor = SHARED_LABEL_PALETTE[0];

  function _sortedSharedLabels(labels){
    var arr = labels.slice();
    if(_sharedLblSort === 'color'){
      arr.sort(function(a,b){
        var ia = SHARED_LABEL_PALETTE.indexOf(a.color), ib = SHARED_LABEL_PALETTE.indexOf(b.color);
        if(ia < 0) ia = 999; if(ib < 0) ib = 999;
        if(ia !== ib) return ia - ib;
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    } else {
      arr.sort(function(a,b){ return a.name.toLowerCase().localeCompare(b.name.toLowerCase()); });
    }
    return arr;
  }

  function renderSharedLabelPopup(){
    var labels = JSON.parse(localStorage.getItem('cc_lead_labels')||'[]');
    var map = JSON.parse(localStorage.getItem('cc_lead_label_map')||'{}');
    var assigned = map[STATE.leadNo] || [];
    var list = document.getElementById('cp-shared-label-list');
    list.innerHTML = labels.length ? _sortedSharedLabels(labels).map(function(lb){
      var on = assigned.indexOf(lb.id) >= 0;
      return '<div class="lblp-item'+(on?' on':'')+'" onclick="toggleSharedLeadLabel(\''+lb.id+'\')"><span class="lblp-dot" style="background:'+lb.color+';"></span><span class="lblp-name">'+esc(lb.name)+'</span><span class="lblp-check"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span></div>';
    }).join('') : '<div class="lblp-empty">No labels yet — create one below.</div>';
    document.querySelectorAll('#cp-shared-label-popup .lblp-sort-btn').forEach(function(b){
      b.classList.toggle('on', b.getAttribute('data-sort') === _sharedLblSort);
    });
    renderSharedLabelSwatches();
  }

  function renderSharedLabelSwatches(){
    var box = document.getElementById('cp-shared-swatches'); if(!box) return;
    box.innerHTML = SHARED_LABEL_PALETTE.map(function(c){
      return '<span class="lblp-sw'+(c === _sharedLblNewColor ? ' on' : '')+'" style="background:'+c+';" onclick="selectSharedLabelColor(\''+c+'\')"></span>';
    }).join('');
  }
  window.selectSharedLabelColor = function(c){ _sharedLblNewColor = c; renderSharedLabelSwatches(); };
  window.setSharedLabelSort = function(mode){ _sharedLblSort = mode; renderSharedLabelPopup(); };

  function createSharedLabel(name, color){
    var labels = JSON.parse(localStorage.getItem('cc_lead_labels')||'[]');
    var id = 'lbl_' + Date.now() + '_' + Math.floor(Math.random() * 1e4);
    labels.push({ id:id, name:name, color:color });
    try{ localStorage.setItem('cc_lead_labels', JSON.stringify(labels)); }catch(e){}
    return id;
  }
  window.addNewSharedLabel = function(){
    var inp = document.getElementById('cp-shared-new-name'); if(!inp) return;
    var name = inp.value.trim(); if(!name){ inp.focus(); return; }
    var id = createSharedLabel(name, _sharedLblNewColor);
    inp.value = '';
    window.toggleSharedLeadLabel(id);
  };

  window.openSharedLabelPopup = function(e){
    if(!STATE.lead) return; e.stopPropagation();
    var pop = document.getElementById('cp-shared-label-popup'); if(!pop) return;
    var inp = document.getElementById('cp-shared-new-name'); if(inp) inp.value = '';
    renderSharedLabelPopup();
    pop.style.display = 'block';
    positionPopup(pop, e);
  };
  function closeSharedLabelPopup(){ var p=document.getElementById('cp-shared-label-popup'); if(p) p.style.display='none'; }

  /* CRM-style one-label-per-lead: picking replaces, tapping the active one clears */
  window.toggleSharedLeadLabel = function(labelId){
    if(STATE.leadNo == null) return;
    try{
      var map = JSON.parse(localStorage.getItem('cc_lead_label_map')||'{}');
      var cur = (map[STATE.leadNo] || [])[0];
      if(cur === labelId) delete map[STATE.leadNo];
      else map[STATE.leadNo] = [labelId];
      localStorage.setItem('cc_lead_label_map', JSON.stringify(map));
    }catch(e){}
    // Re-render label cell
    var labelCell = document.getElementById('cp-label-cell');
    var lb = getLeadLabel(STATE.leadNo);
    if(lb){
      labelCell.className = 'cp-label-select';
      labelCell.style.backgroundColor = lb.color + '1f';
      labelCell.style.color = lb.color;
      labelCell.textContent = lb.name;
    } else {
      labelCell.className = 'cp-label-select is-empty';
      labelCell.style.backgroundColor = '';
      labelCell.style.color = '';
      labelCell.textContent = 'Add label';
    }
    // Re-render popup list (toggle check immediately)
    var pop = document.getElementById('cp-shared-label-popup');
    if(pop && pop.style.display === 'block') renderSharedLabelPopup();
  };

  /* Outside-click closers */
  document.addEventListener('click', function(e){
    var m = document.getElementById('cp-kebab-menu');
    if(m && m.classList.contains('open')){
      var b = document.getElementById('cp-kebab-btn');
      if(!m.contains(e.target) && !(b && b.contains(e.target))) m.classList.remove('open');
    }
    var sp = document.getElementById('cp-shared-status-popup');
    if(sp && sp.style.display === 'block' && !sp.contains(e.target) && e.target.id !== 'cp-status-cell') closeSharedStatusPopup();
    var lp = document.getElementById('cp-shared-label-popup');
    if(lp && lp.style.display === 'block' && !lp.contains(e.target) && e.target.id !== 'cp-label-cell') closeSharedLabelPopup();
    var fp = document.getElementById('cp-from-popup');
    if(fp && fp.classList.contains('open') && !fp.contains(e.target) && !e.target.closest('#cp-from-row')) fp.classList.remove('open');
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      var p = document.getElementById('contact-panel-shared');
      if(p && p.classList.contains('open')) window.closeContactPanel();
    }
  });
})();
