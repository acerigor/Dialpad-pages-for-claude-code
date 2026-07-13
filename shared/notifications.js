/* ============================================================================
   CoreConnect — shared notifications system
   ----------------------------------------------------------------------------
   Data: localStorage['cc_notifications'] = array of
     { id, type, leadNo, leadName, leadAv, leadColor, title, body, ts, read }
     type ∈ 'sms' | 'email' | 'call' | 'appt'
   API on window: ccNotifAll/ByType/Unread/Get/Add/MarkRead/MarkAllRead/Render/SyncBellDot/Seed.
   Hooks into the existing per-page #notif-panel scaffold (tabs, body, bell dot).
   ============================================================================ */
(function(){
  var KEY = 'cc_notifications';
  var TYPES = ['sms','email','call','appt'];
  var TAB_LABELS = { all:'All', unread:'Unread', sms:'SMS', email:'Emails', call:'Calls', appt:'Appointments' };
  var _list = null;
  var _currentTab = 'all';

  /* ── persistence ─────────────────────────────────────────────────────── */
  function load(){
    if(_list) return _list;
    try{ var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if(Array.isArray(s)) _list = s; }catch(e){}
    if(!_list) _list = [];
    return _list;
  }
  function save(){ try{ localStorage.setItem(KEY, JSON.stringify(_list||[])); }catch(e){} }

  /* ── helpers ─────────────────────────────────────────────────────────── */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function initialsOf(name){ var p = String(name||'').trim().split(/\s+/); return (((p[0]||'')[0]||'')+((p.length>1&&p[p.length-1][0])||'')).toUpperCase(); }
  function colorFor(name){
    var palette = ['#534AB7','#0F6E56','#B73D5B','#3D81B7','#B77B3D','#22c88a','#e85555','#f5a623','#6e9dff','#2dd4bf'];
    var h=0, n=String(name||''); for(var i=0;i<n.length;i++) h=(h*31+n.charCodeAt(i))>>>0;
    return palette[h % palette.length];
  }
  function relTime(ts){
    var d = (Date.now() - ts) / 1000;
    if(d < 45) return 'Just now';
    if(d < 3600) return Math.round(d/60) + 'm ago';
    if(d < 86400) return Math.round(d/3600) + 'h ago';
    if(d < 172800) return 'Yesterday';
    var dt = new Date(ts), MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return MO[dt.getMonth()] + ' ' + dt.getDate();
  }
  function depthPrefix(){
    var p = (window.location && location.pathname || '').replace(/\\/g,'/');
    return (p.indexOf('/Settings/')>=0 || p.indexOf('/reputation/')>=0) ? '../../' : '../';
  }

  /* ── API ─────────────────────────────────────────────────────────────── */
  function all(){ return load().slice().sort(function(a,b){ return b.ts - a.ts; }); }
  function byType(t){ return all().filter(function(n){ return n.type===t; }); }
  function unread(){ return all().filter(function(n){ return !n.read; }); }
  function get(id){ return load().find(function(n){ return n.id===id; }); }
  function add(n){
    load();
    var rec = Object.assign({ id:'ntf'+Date.now()+'_'+Math.floor(Math.random()*1000), ts: n.ts || Date.now(), read:false }, n);
    _list.unshift(rec);
    save();
    render(_currentTab); syncBellDot();
    return rec;
  }
  function markRead(id){ var n=get(id); if(n && !n.read){ n.read=true; save(); render(_currentTab); syncBellDot(); } }
  function markAllRead(){ load().forEach(function(n){ n.read=true; }); save(); render(_currentTab); syncBellDot(); }

  /* ── seed (idempotent) ───────────────────────────────────────────────── */
  function seed(){
    load();
    if(_list.length > 0) return;
    var leads = (window.CCLeads && window.CCLeads.LEADS) ? window.CCLeads.LEADS : null;
    var pool = [];
    if(leads){
      pool = leads.slice(0,20).map(function(l){ return { no:l.no, name:l.name||'Unknown', av:initialsOf(l.name||'??'), color:l.ac||colorFor(l.name) }; });
    } else {
      pool = [
        {no:1,name:'Sarah Kim',av:'SK',color:'#534AB7'},{no:2,name:'James Donovan',av:'JD',color:'#22c88a'},
        {no:3,name:'Maria Lopez',av:'ML',color:'#B73D5B'},{no:4,name:'Andre Coleman',av:'AC',color:'#0F6E56'},
        {no:5,name:'Priya Shah',av:'PS',color:'#3D81B7'},{no:6,name:'Kevin Ng',av:'KN',color:'#B77B3D'}
      ];
    }
    var smsLines = ['Thanks, will check in tonight.','Can we move it to 3pm?','Got the docs, thank you!','Is the vehicle still available?','Sounds good — see you then.'];
    var emailSubj = ['Re: Financing options','Following up on your visit','Loan paperwork attached','Re: Trade-in appraisal','Question about my appointment'];
    var apptTypes = ['Test drive','Delivery','Trade-in appraisal','Walk-around','Financing discussion'];
    function pick(arr,i){ return arr[i % arr.length]; }
    var now = Date.now(), HOUR = 3600*1000, MIN = 60*1000;
    var seeds = [
      { type:'sms',   p: pool[0], title:'New SMS', body: pick(smsLines,0), ts: now - 4*MIN,   read:false },
      { type:'appt',  p: pool[1], title:'Appointment created', body: pick(apptTypes,1)+' — Today 3:30 PM', ts: now - 18*MIN, read:false },
      { type:'email', p: pool[2], title:'New email', body: pick(emailSubj,2), ts: now - 42*MIN, read:false },
      { type:'sms',   p: pool[4], title:'New SMS', body: pick(smsLines,3), ts: now - 2*HOUR, read:false },
      { type:'appt',  p: pool[5], title:'Appointment created', body: pick(apptTypes,4)+' — Tomorrow 10:00 AM', ts: now - 3*HOUR, read:false },
      { type:'email', p: pool[0], title:'New email', body: pick(emailSubj,1), ts: now - 5*HOUR, read:true },
      { type:'sms',   p: pool[2], title:'New SMS', body: pick(smsLines,4), ts: now - 11*HOUR, read:true },
      { type:'appt',  p: pool[3], title:'Appointment created', body: pick(apptTypes,0)+' — Fri 2:00 PM', ts: now - 16*HOUR, read:true },
      { type:'email', p: pool[4], title:'New email', body: pick(emailSubj,3), ts: now - 22*HOUR, read:true }
    ];
    /* Call seeds: derive from REAL missed-call data via CCLeads.callCountsForLead.
       Fallback to hardcoded mocks only when leads/API aren't available. */
    if(leads && window.CCLeads && typeof CCLeads.callCountsForLead === 'function'){
      var missedLeads = leads.filter(function(l){ return (CCLeads.callCountsForLead(l).missed||0) > 0; }).slice(0, 6);
      var callOffsets = [80*MIN, 7*HOUR, 26*HOUR, 4*HOUR, 13*HOUR, 30*HOUR]; // stagger across last 30h
      missedLeads.forEach(function(L, i){
        seeds.push({
          type:'call',
          p: { no:L.no, name:L.name||'Unknown', av:initialsOf(L.name||'??'), color:L.ac||colorFor(L.name) },
          title:'Missed call', body:'Inbound, not answered',
          ts: now - (callOffsets[i] || ((i+1)*4*HOUR)),
          read: i >= 2  // first 2 unread, rest read
        });
      });
    } else {
      // Fallback for pages without CCLeads loaded
      seeds.push({ type:'call', p: pool[3], title:'Missed call', body:'Inbound, not answered', ts: now - 80*MIN, read:false });
      seeds.push({ type:'call', p: pool[1], title:'Missed call', body:'Inbound, not answered', ts: now - 7*HOUR, read:true });
      seeds.push({ type:'call', p: pool[5], title:'Missed call', body:'Inbound, not answered', ts: now - 26*HOUR, read:true });
    }
    _list = seeds.map(function(s){
      return { id:'ntf_seed_'+Math.floor(Math.random()*1e9), type:s.type, leadNo:s.p.no, leadName:s.p.name, leadAv:s.p.av, leadColor:s.p.color, title:s.title, body:s.body, ts:s.ts, read:s.read };
    });
    save();
  }

  /* ── render ──────────────────────────────────────────────────────────── */
  var ICONS = {
    sms:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',
    call:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    appt:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
  };
  var TYPE_COLOR = { sms:'#2dd4bf', email:'#6e9dff', call:'#e85555', appt:'#f5a623' };
  var TYPE_BGTINT = { sms:'rgba(45,212,191,.14)', email:'rgba(110,157,255,.14)', call:'rgba(232,85,85,.14)', appt:'rgba(245,166,35,.14)' };

  function rowHtml(n){
    var typeBg = TYPE_BGTINT[n.type]||'rgba(255,255,255,.06)', typeFg = TYPE_COLOR[n.type]||'#6e9dff';
    return '<button class="cc-ntf-row'+(n.read?'':' is-unread')+'" data-id="'+esc(n.id)+'" onclick="ccNotifClickRow(\''+esc(n.id)+'\')">'
      + '<span class="cc-ntf-ic" style="background:'+typeBg+';color:'+typeFg+'">'+ICONS[n.type]+'</span>'
      + '<span class="cc-ntf-av" style="background:'+esc(n.leadColor||'#4f7cff')+'">'+esc(n.leadAv||'??')+'</span>'
      + '<span class="cc-ntf-txt">'
        + '<span class="cc-ntf-line"><strong>'+esc(n.title)+'</strong> &middot; '+esc(n.leadName||'')+'</span>'
        + '<span class="cc-ntf-body">'+esc(n.body)+'</span>'
        + '<span class="cc-ntf-time">'+esc(relTime(n.ts))+'</span>'
      + '</span>'
      + '<span class="cc-ntf-dot" aria-hidden="true"></span>'
    + '</button>';
  }
  function listFor(tab){
    if(tab==='all') return all();
    if(tab==='unread') return unread();
    return byType(tab);
  }
  function render(tab){
    if(tab) _currentTab = tab;
    var body = document.getElementById('notif-body'); if(!body) return;
    var list = listFor(_currentTab);
    if(!list.length){
      body.innerHTML = '<div class="notif-empty"><div class="notif-empty-icon">🔔</div>You\'re all caught up</div>';
    } else {
      body.innerHTML = list.map(rowHtml).join('');
    }
    // tab counts
    var counts = { all: all().length, unread: unread().length, sms: byType('sms').length, email: byType('email').length, call: byType('call').length, appt: byType('appt').length };
    Object.keys(counts).forEach(function(k){
      var el = document.getElementById('notif-count-'+k);
      if(el) el.textContent = counts[k];
    });
    // markall button enabled state
    var ma = document.getElementById('notif-markall'); if(ma) ma.disabled = counts.unread === 0;
  }
  function syncBellDot(){
    var dot = document.getElementById('header-bell-dot');
    if(!dot) return;
    if(unread().length > 0) dot.classList.add('show'); else dot.classList.remove('show');
  }

  /* ── click → navigate + mark read ────────────────────────────────────── */
  function clickRow(id){
    var n = get(id); if(!n) return;
    markRead(id);
    var depth = depthPrefix();
    var url;
    // SMS / Email: open the inline contact panel on the CURRENT page if available;
    // fall back to navigating to the leads page if no inline panel is loaded.
    if(n.type==='sms' || n.type==='email'){
      if(typeof window.openContactPanel === 'function'){
        try{ if(typeof window.closeNotifications === 'function') window.closeNotifications(); }catch(e){}
        window._cpFromBell = true;
        window.openContactPanel(n.leadNo, n.type === 'sms' ? 'sms' : 'email');
        return;
      }
      var tab = (n.type==='sms') ? 'sms' : 'email';
      url = depth + 'coreconnect_leads_v83/coreconnect_leads_v83.html?openLead=' + encodeURIComponent(n.leadNo||'') + '&tab=' + tab;
    } else if(n.type==='appt'){
      url = depth + 'coreconnect_appointments/coreconnect_appointments.html';
    } else if(n.type==='call'){
      url = depth + 'call_history/coreconnect_call_history_v31.html?focus=' + encodeURIComponent(n.leadNo||'');
    }
    window.location.href = url;
  }

  /* ── inject row CSS (one-time, in <head>) ────────────────────────────── */
  function injectCss(){
    if(document.getElementById('cc-ntf-style')) return;
    var css = ''
      + '.cc-ntf-row{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;width:100%;background:transparent;border:none;border-bottom:0.5px solid var(--brd);cursor:pointer;text-align:left;font-family:var(--font);transition:background .12s;position:relative;}'
      + '.cc-ntf-row:hover{background:rgba(255,255,255,.04);}'
      + '.cc-ntf-row:last-child{border-bottom:none;}'
      + '.cc-ntf-ic{width:30px;height:30px;border-radius:8px;flex:none;display:flex;align-items:center;justify-content:center;}'
      + '.cc-ntf-ic svg{width:15px;height:15px;}'
      + '.cc-ntf-av{width:26px;height:26px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;color:#fff;letter-spacing:.3px;margin-top:2px;}'
      + '.cc-ntf-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}'
      + '.cc-ntf-line{font-size:12.5px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.cc-ntf-line strong{font-weight:600;}'
      + '.cc-ntf-body{font-size:12px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.cc-ntf-time{font-size:11px;color:var(--mu);margin-top:1px;}'
      + '.cc-ntf-dot{width:8px;height:8px;border-radius:50%;background:var(--ac);flex:none;margin-top:6px;opacity:0;}'
      + '.cc-ntf-row.is-unread .cc-ntf-dot{opacity:1;}'
      + '.cc-ntf-row.is-unread{background:rgba(79,124,255,.04);}'
      + '.notif-tab.icon-tab{padding:10px 10px;gap:5px;}'
      + '.notif-tab .nt-ic{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;}'
      + '.notif-tab .nt-ic svg{width:16px;height:16px;display:block;}';
    var st = document.createElement('style'); st.id='cc-ntf-style'; st.textContent = css; document.head.appendChild(st);
  }

  /* ── extend tabs with per-type tabs (idempotent) ─────────────────────── */
  var TAB_ICONS = {
    unread: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><circle cx="18" cy="6" r="3" fill="currentColor" stroke="none"/></svg>',
    sms: ICONS.sms, email: ICONS.email, call: ICONS.call, appt: ICONS.appt
  };
  function iconTabInner(key){
    return '<span class="nt-ic">'+TAB_ICONS[key]+'</span><span class="notif-tab-count" id="notif-count-'+key+'">0</span>';
  }
  function extendTabs(){
    var tabs = document.querySelector('.notif-tabs'); if(!tabs) return;
    if(tabs.querySelector('.notif-tab[data-tab="sms"]')) return; // already extended
    // Convert existing Unread tab to icon
    var unreadBtn = tabs.querySelector('.notif-tab[data-tab="unread"]');
    if(unreadBtn){
      unreadBtn.classList.add('icon-tab');
      unreadBtn.setAttribute('title','Unread');
      unreadBtn.setAttribute('aria-label','Unread');
      unreadBtn.innerHTML = iconTabInner('unread');
    }
    // Append the 4 type tabs as icon tabs
    function mkIconTab(key){
      var b = document.createElement('button');
      b.className='notif-tab icon-tab';
      b.setAttribute('data-tab', key);
      b.setAttribute('onclick', "setNotifTab('"+key+"')");
      b.setAttribute('title', TAB_LABELS[key]);
      b.setAttribute('aria-label', TAB_LABELS[key]);
      b.innerHTML = iconTabInner(key);
      return b;
    }
    ['sms','email','call','appt'].forEach(function(k){ tabs.appendChild(mkIconTab(k)); });
  }

  /* ── override per-page placeholder functions ─────────────────────────── */
  function installOverrides(){
    var prevOpen = window.openNotifications;
    window.openNotifications = function(){
      if(typeof prevOpen === 'function') prevOpen();
      else {
        var p = document.getElementById('notif-panel'), b = document.getElementById('header-bell');
        if(p && b){ if(p.parentElement!==document.body) document.body.appendChild(p); p.classList.add('open'); b.classList.add('active'); }
      }
      render(_currentTab);
    };
    window.setNotifTab = function(tab){
      _currentTab = tab;
      document.querySelectorAll('.notif-tab').forEach(function(t){ t.classList.toggle('active', t.getAttribute('data-tab')===tab); });
      render(tab);
    };
    window.markAllNotificationsRead = function(){ markAllRead(); };
    window.ccNotifClickRow = clickRow;
  }

  /* ── public API ──────────────────────────────────────────────────────── */
  window.ccNotifAll = all;
  window.ccNotifByType = byType;
  window.ccNotifUnread = unread;
  window.ccNotifGet = get;
  window.ccNotifAdd = add;
  window.ccNotifMarkRead = markRead;
  window.ccNotifMarkAllRead = markAllRead;
  window.ccNotifSeed = seed;
  window.ccNotifRender = render;
  window.ccNotifSyncBellDot = syncBellDot;
  window.ccNotifClickRow = clickRow;

  function init(){
    injectCss();
    seed();
    extendTabs();
    installOverrides();
    render(_currentTab);
    syncBellDot();

    // Leads page deep-link handler: ?openLead=N&tab=X
    try{
      var m = location.href.match(/[?&]openLead=([^&]+)(?:&tab=([^&]+))?/);
      if(m && typeof window.openContactPanel === 'function'){
        var leadNo = parseInt(decodeURIComponent(m[1]), 10);
        var tab = m[2] ? decodeURIComponent(m[2]) : 'all';
        setTimeout(function(){ try{ window.openContactPanel(leadNo, tab); }catch(e){} }, 50);
      }
    }catch(e){}
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* Loan-app quick-link icon in the top header + leads panel (auto-injected) */
(function(){
  function laEsc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function laLeads(){
    if(!window.CCLeads || !Array.isArray(CCLeads.LEADS)) return [];
    return CCLeads.LEADS.filter(function(l){ return (l && l.source || '').toLowerCase() === 'loan app'; });
  }
  /* Ensure CCLeads (from shared/leads-comms.js) is loaded — some pages (Settings, Reputation)
     ship the bell/notifications.js but not leads-comms.js, so the panel would be empty. */
  var _laLeadsLoading = false;
  function laEnsureLeadsData(cb){
    if(window.CCLeads && Array.isArray(window.CCLeads.LEADS)){ cb(); return; }
    if(_laLeadsLoading){ return; }
    // Derive the leads-comms.js URL from the notifications.js <script> tag (same shared/ folder).
    var here = null, scripts = document.getElementsByTagName('script');
    for(var i = 0; i < scripts.length; i++){ if(/shared\/notifications\.js(\?|$)/.test(scripts[i].src || '')){ here = scripts[i].src; break; } }
    if(!here){ cb(); return; }   // can't resolve — render empty state
    _laLeadsLoading = true;
    var s = document.createElement('script');
    s.src = here.replace(/notifications\.js(\?.*)?$/, 'leads-comms.js');
    s.onload = function(){ _laLeadsLoading = false; cb(); };
    s.onerror = function(){ _laLeadsLoading = false; cb(); };
    document.head.appendChild(s);
  }
  function laBuildPanel(){
    if(document.getElementById('loanapp-panel')) return;
    var p = document.createElement('div');
    p.id = 'loanapp-panel';
    p.className = 'notif-panel';
    p.innerHTML =
        '<div class="notif-header">'
      +   '<span class="notif-title">Loan App leads</span>'
      +   '<div class="notif-header-actions">'
      +     '<button class="notif-close" onclick="window.closeLoanAppPanel && window.closeLoanAppPanel()" aria-label="Close">'
      +       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      +     '</button>'
      +   '</div>'
      + '</div>'
      + '<div class="notif-body" id="loanapp-body"></div>'
      + '<div class="notif-footer">'
      +   '<button class="notif-seeall" onclick="window.location.href=\'/coreconnect_leads_v83/coreconnect_leads_v83.html?source=Loan+App\'">See all in CRM</button>'
      + '</div>';
    document.body.appendChild(p);
  }
  var LA_CAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';
  function laInitials(name){
    var s = String(name || '').trim();
    if(!s || /unknown/i.test(s)){ return s ? s.charAt(0).toUpperCase() : '?'; }
    var parts = s.split(/\s+/);
    return (parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : '')).toUpperCase();
  }
  /* Ensure the shared .cc-ntf-* row styles exist (bell injects them too; idempotent by id) */
  function laEnsureCss(){
    if(document.getElementById('cc-ntf-style')) return;
    var css = ''
      + '.cc-ntf-row{display:flex;align-items:flex-start;gap:10px;padding:11px 14px;width:100%;background:transparent;border:none;border-bottom:0.5px solid var(--brd);cursor:pointer;text-align:left;font-family:var(--font);transition:background .12s;position:relative;}'
      + '.cc-ntf-row:hover{background:rgba(255,255,255,.04);}'
      + '.cc-ntf-row:last-child{border-bottom:none;}'
      + '.cc-ntf-ic{width:30px;height:30px;border-radius:8px;flex:none;display:flex;align-items:center;justify-content:center;}'
      + '.cc-ntf-ic svg{width:15px;height:15px;}'
      + '.cc-ntf-av{width:26px;height:26px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;color:#fff;letter-spacing:.3px;margin-top:2px;}'
      + '.cc-ntf-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}'
      + '.cc-ntf-line{font-size:12.5px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.cc-ntf-line strong{font-weight:600;}'
      + '.cc-ntf-body{font-size:12px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.cc-ntf-time{font-size:11px;color:var(--mu);margin-top:1px;}';
    var st = document.createElement('style'); st.id = 'cc-ntf-style'; st.textContent = css; document.head.appendChild(st);
  }
  function laRender(){
    laBuildPanel();
    laEnsureCss();
    var body = document.getElementById('loanapp-body'); if(!body) return;
    var list = laLeads();
    if(!list.length){
      body.innerHTML = '<div class="notif-empty">No new loan-app leads.</div>';
      return;
    }
    body.innerHTML = list.map(function(l){
      var vehicle = l.vehicle && l.vehicle !== '—' ? l.vehicle : 'No vehicle';
      var meta = [vehicle, l.status].filter(Boolean).map(laEsc).join(' · ');
      return '<button class="cc-ntf-row" onclick="window.closeLoanAppPanel && window.closeLoanAppPanel(); if(window.openContactPanel){ window.openContactPanel(' + Number(l.no) + ', \'all\'); }">'
        + '<span class="cc-ntf-ic" style="background:rgba(79,124,255,.14);color:var(--ac2)">' + LA_CAR + '</span>'
        + '<span class="cc-ntf-av" style="background:' + laEsc(l.ac || '#4f7cff') + '">' + laEsc(laInitials(l.name)) + '</span>'
        + '<span class="cc-ntf-txt">'
        +   '<span class="cc-ntf-line"><strong>New application</strong> · ' + laEsc(l.name || 'Unknown') + '</span>'
        +   '<span class="cc-ntf-body">' + meta + '</span>'
        +   '<span class="cc-ntf-time">' + laEsc(l.lastAttempt || '') + '</span>'
        + '</span>'
      + '</button>';
    }).join('');
  }
  function laPosition(){
    var p = document.getElementById('loanapp-panel'), btn = document.getElementById('header-loanapp');
    if(!p || !btn) return;
    var r = btn.getBoundingClientRect(); var w = p.offsetWidth || 380;
    p.style.top = (r.bottom + 8) + 'px';
    p.style.left = Math.max(8, r.right - w) + 'px';
  }
  function laOpen(){
    laBuildPanel();
    laEnsureCss();
    // Close bell panel if it's open — only one dropdown visible at a time
    if(typeof window.closeNotifications === 'function'){ try{ window.closeNotifications(); }catch(e){} }
    var p = document.getElementById('loanapp-panel'); if(!p) return;
    var btn = document.getElementById('header-loanapp'); if(btn) btn.classList.add('active');
    // Show immediately (with a loading state if lead data isn't ready yet), then render once data is available.
    var bodyEl = document.getElementById('loanapp-body');
    if(bodyEl && !(window.CCLeads && window.CCLeads.LEADS)){ bodyEl.innerHTML = '<div class="notif-empty">Loading…</div>'; }
    else { laRender(); }
    p.classList.add('open');
    laPosition();
    laEnsureLeadsData(function(){ if(p.classList.contains('open')){ laRender(); laPosition(); } });
  }
  function laClose(){
    var p = document.getElementById('loanapp-panel'); if(p) p.classList.remove('open');
    var btn = document.getElementById('header-loanapp'); if(btn) btn.classList.remove('active');
  }
  function laToggle(){
    var p = document.getElementById('loanapp-panel');
    if(p && p.classList.contains('open')) laClose(); else laOpen();
  }
  window.toggleLoanAppPanel = laToggle;
  window.closeLoanAppPanel = laClose;
  window.openLoanAppPanel = laOpen;

  function injectLoanAppIcon(){
    var bell = document.getElementById('header-bell'); if(!bell) return;
    if(document.getElementById('header-loanapp')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'header-bell';
    btn.id = 'header-loanapp';
    btn.setAttribute('data-label','Loan app');
    btn.setAttribute('aria-label','Loan app');
    btn.onclick = function(e){ if(e) e.stopPropagation(); laToggle(); };
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>'
      + '<circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>'
      + '</svg>';
    bell.parentNode.insertBefore(btn, bell);
  }
  document.addEventListener('mousedown', function(e){
    var p = document.getElementById('loanapp-panel'); if(!p || !p.classList.contains('open')) return;
    if(e.target.closest && (e.target.closest('#loanapp-panel') || e.target.closest('#header-loanapp'))) return;
    laClose();
  });
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') laClose(); });
  window.addEventListener('resize', function(){ var p = document.getElementById('loanapp-panel'); if(p && p.classList.contains('open')) laPosition(); });

  /* ---- Attention card: floating corner card (no backdrop) announcing the most recent loan application ---- */
  function laCardCss(){
    if(document.getElementById('loanapp-card-style')) return;
    var css = ''
      + '#loanapp-card{position:fixed;top:76px;right:20px;z-index:58;width:340px;max-width:calc(100vw - 32px);'
      +   'background:var(--sur);border:0.5px solid var(--brd2);border-radius:12px;'
      +   'box-shadow:0 16px 44px rgba(0,0,0,.5);font-family:var(--font);overflow:hidden;'
      +   'transform:translateX(calc(100% + 28px));opacity:0;transition:transform .32s cubic-bezier(.22,1,.36,1),opacity .28s;}'
      + '#loanapp-card.show{transform:translateX(0);opacity:1;}'
      + '.lac-head{display:flex;align-items:center;gap:10px;padding:13px 12px 10px 14px;}'
      + '.lac-ic{width:34px;height:34px;border-radius:9px;flex:none;display:flex;align-items:center;justify-content:center;background:rgba(79,124,255,.18);color:var(--ac2);}'
      + '.lac-ic svg{width:18px;height:18px;}'
      + '.lac-head-title{flex:1;min-width:0;font-size:13px;font-weight:700;color:var(--tx);}'
      + '.lac-x{width:30px;height:30px;border:none;background:transparent;color:var(--mu);border-radius:8px;cursor:pointer;flex:none;display:flex;align-items:center;justify-content:center;}'
      + '.lac-x:hover{background:rgba(255,255,255,.06);color:var(--tx);}'
      + '.lac-body{display:flex;align-items:flex-start;gap:10px;padding:2px 14px 12px;}'
      + '.lac-av{width:34px;height:34px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;letter-spacing:.3px;}'
      + '.lac-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}'
      + '.lac-name{font-size:13.5px;font-weight:600;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.lac-meta{font-size:12px;color:var(--mu);line-height:1.4;}'
      + '.lac-foot{padding:0 14px 14px;}'
      + '.lac-view{width:100%;background:var(--ac);color:#fff;border:none;border-radius:8px;padding:10px 14px;font-size:12.5px;font-weight:600;cursor:pointer;font-family:var(--font);}'
      + '.lac-view:hover{background:var(--ac2);}'
      + '@media (max-width:640px){#loanapp-card{top:72px;right:12px;left:12px;width:auto;max-width:none;}.lac-x{width:44px;height:44px;}}';
    var st = document.createElement('style'); st.id = 'loanapp-card-style'; st.textContent = css; document.head.appendChild(st);
  }
  function laNewestLoanLead(){
    var list = laLeads(); if(!list.length) return null;
    return list.slice().sort(function(a, b){ return (b.no || 0) - (a.no || 0); })[0];
  }
  function laHideCard(){
    var c = document.getElementById('loanapp-card'); if(c) c.classList.remove('show');
  }
  window.dismissLoanAppBanner = laHideCard;
  window.dismissLoanAppCard = laHideCard;
  function laShowCard(lead){
    if(!lead) return;
    laCardCss();
    var c = document.getElementById('loanapp-card');
    if(!c){ c = document.createElement('div'); c.id = 'loanapp-card'; document.body.appendChild(c); }
    var vehicle = lead.vehicle && lead.vehicle !== '—' ? lead.vehicle : 'No vehicle';
    var meta = [vehicle, lead.status].filter(Boolean).map(laEsc).join(' · ');
    c.innerHTML =
        '<div class="lac-head">'
      +   '<span class="lac-ic">' + LA_CAR + '</span>'
      +   '<span class="lac-head-title">New loan application</span>'
      +   '<button class="lac-x" type="button" aria-label="Dismiss">'
      +     '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      +   '</button>'
      + '</div>'
      + '<div class="lac-body">'
      +   '<span class="lac-av" style="background:' + laEsc(lead.ac || '#4f7cff') + '">' + laEsc(laInitials(lead.name)) + '</span>'
      +   '<span class="lac-txt">'
      +     '<span class="lac-name">' + laEsc(lead.name || 'Unknown') + '</span>'
      +     '<span class="lac-meta">' + meta + '</span>'
      +   '</span>'
      + '</div>'
      + '<div class="lac-foot">'
      +   '<button class="lac-view" type="button">View application</button>'
      + '</div>';
    c.querySelector('.lac-view').onclick = function(){
      laHideCard();
      if(window.openContactPanel){ try{ window.openContactPanel(Number(lead.no), 'loanapp'); return; }catch(e){} }
      laOpen();
    };
    c.querySelector('.lac-x').onclick = laHideCard;
    // Slide in on the next frame so the transition runs.
    var show = function(){ c.classList.add('show'); };
    if(window.requestAnimationFrame) requestAnimationFrame(function(){ requestAnimationFrame(show); });
    else setTimeout(show, 20);
  }
  function laBannerInit(){
    laEnsureLeadsData(function(){
      var lead = laNewestLoanLead(); if(!lead) return;
      setTimeout(function(){ laShowCard(lead); }, 700);
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectLoanAppIcon);
  else injectLoanAppIcon();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', laBannerInit);
  else laBannerInit();
})();
