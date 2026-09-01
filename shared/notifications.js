/* ============================================================================
   CoreConnect — theme toggle (light / dark)
   Applies the saved theme immediately, and injects a one-click toggle button
   into the top-header, left of the loan-app button. Storage: cc_theme.
   ========================================================================== */
(function(){
  var KEY = 'cc_theme';
  function get(){ try{ return localStorage.getItem(KEY) === 'light' ? 'light' : 'dark'; }catch(e){ return 'dark'; } }
  function apply(t){ document.documentElement.setAttribute('data-theme', t); }
  apply(get());  // run ASAP to minimise flash

  var SUN = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8l1.8-1.8M18 6l1.8-1.8"/></svg>';
  var MOON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8z"/></svg>';
  function paint(btn, t){
    btn.innerHTML = t === 'light' ? SUN : MOON;                 // show current mode
    var next = t === 'light' ? 'Dark mode' : 'Light mode';       // label = the action
    btn.setAttribute('data-label', next);
    btn.setAttribute('aria-label', next);
  }
  function inject(){
    var bell = document.getElementById('header-bell'); if(!bell) return;
    if(document.getElementById('header-theme')) return;
    var anchor = document.getElementById('header-loanapp') || bell;  // sit left of the loan-app button
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'header-bell';
    btn.id = 'header-theme';
    paint(btn, get());
    btn.onclick = function(e){
      if(e) e.stopPropagation();
      var t = get() === 'light' ? 'dark' : 'light';
      try{ localStorage.setItem(KEY, t); }catch(err){}
      apply(t); paint(btn, t);
    };
    anchor.parentNode.insertBefore(btn, anchor);
  }
  function boot(){ inject(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.injectThemeToggle = inject;
})();

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
  var _searchQuery = '';
  var _readFilter = 'all';

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
    var list;
    if(tab==='all') list = all();
    else if(tab==='unread') list = unread();
    else list = byType(tab);
    if(_searchQuery){
      var q = _searchQuery.toLowerCase();
      list = list.filter(function(n){
        return (n.leadName && n.leadName.toLowerCase().indexOf(q)>=0)
            || (n.title && n.title.toLowerCase().indexOf(q)>=0)
            || (n.body && n.body.toLowerCase().indexOf(q)>=0);
      });
    }
    if(_readFilter === 'unread') list = list.filter(function(n){ return !n.read; });
    else if(_readFilter === 'read') list = list.filter(function(n){ return n.read; });
    return list;
  }
  function render(tab){
    if(tab) _currentTab = tab;
    var body = document.getElementById('notif-body'); if(!body) return;
    var list = listFor(_currentTab);
    if(!list.length){
      var emptyMsg, emptyIcon;
      if(_searchQuery){ emptyMsg = 'No matching notifications'; emptyIcon = '🔍'; }
      else if(_readFilter === 'unread'){ emptyMsg = 'No unread notifications'; emptyIcon = '✓'; }
      else if(_readFilter === 'read'){ emptyMsg = 'No read notifications'; emptyIcon = '📭'; }
      else { emptyMsg = 'You\'re all caught up'; emptyIcon = '🔔'; }
      body.innerHTML = '<div class="notif-empty"><div class="notif-empty-icon">'+emptyIcon+'</div>'+emptyMsg+'</div>';
    } else {
      body.innerHTML = list.map(rowHtml).join('');
    }
    // update filter button + dropdown state
    var filterBtn = document.getElementById('notif-filter-btn');
    if(filterBtn){
      filterBtn.classList.toggle('active', _readFilter !== 'all');
      var lbl = filterBtn.querySelector('.notif-filter-label');
      if(lbl) lbl.textContent = _readFilter === 'all' ? '' : (_readFilter === 'unread' ? 'Unread' : 'Read');
    }
    var filterDd = document.getElementById('notif-filter-dd');
    if(filterDd){
      filterDd.querySelectorAll('.notif-filter-opt').forEach(function(o){
        o.classList.toggle('selected', o.getAttribute('data-filter') === _readFilter);
      });
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
      + '.notif-tab .nt-ic svg{width:16px;height:16px;display:block;}'
      + '.notif-search{display:flex;align-items:center;gap:8px;padding:8px 14px;border-bottom:0.5px solid var(--brd);flex-shrink:0;}'
      + '.notif-search-icon{width:16px;height:16px;color:var(--mu);flex:none;}'
      + '.notif-search-input{flex:1;background:var(--sur2);border:0.5px solid var(--brd2);border-radius:8px;padding:7px 10px;color:var(--tx);font-family:var(--font);font-size:12.5px;outline:none;min-width:0;}'
      + '.notif-search-input::placeholder{color:var(--mu);}'
      + '.notif-search-input:focus{border-color:var(--ac);background:var(--sur);}'
      + '.notif-filter-wrap{position:relative;flex:none;}'
      + '.notif-filter-btn{display:flex;align-items:center;justify-content:center;gap:4px;background:transparent;border:0.5px solid var(--brd2);border-radius:8px;width:32px;height:32px;padding:0;cursor:pointer;color:var(--mu);flex:none;transition:all .12s;font-family:var(--font);font-size:11px;}'
      + '.notif-filter-btn:hover{background:rgba(255,255,255,.06);color:var(--tx);}'
      + '.notif-filter-btn.active{background:rgba(79,124,255,.12);border-color:var(--ac);color:var(--ac2);}'
      + '.notif-filter-btn svg{width:14px;height:14px;flex:none;display:block;margin:auto;}'
      + '.notif-filter-label{display:none;font-weight:500;white-space:nowrap;}'
      + '.notif-filter-dd{display:none;position:absolute;top:calc(100% + 4px);right:0;background:var(--sur);border:0.5px solid var(--brd2);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.45);min-width:140px;z-index:10;overflow:hidden;padding:4px;}'
      + '.notif-filter-dd.open{display:block;}'
      + '.notif-filter-opt{display:flex;align-items:center;gap:8px;width:100%;background:transparent;border:none;padding:8px 12px;color:var(--tx);font-family:var(--font);font-size:12.5px;cursor:pointer;border-radius:6px;text-align:left;}'
      + '.notif-filter-opt:hover{background:rgba(255,255,255,.06);}'
      + '.notif-filter-opt.selected{color:var(--ac2);font-weight:600;}'
      + '.notif-filter-opt .nf-check{width:14px;height:14px;flex:none;opacity:0;}'
      + '.notif-filter-opt.selected .nf-check{opacity:1;}'
      + '.notif-filter-opt .nf-label{flex:1;}'
      + '.notif-filter-opt .nf-hint{font-size:11px;color:var(--mu);flex:none;}';
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
    // Inject search bar after tabs
    var panel = tabs.parentElement;
    var body = document.getElementById('notif-body');
    if(panel && body && !panel.querySelector('.notif-search')){
      var searchWrap = document.createElement('div');
      searchWrap.className = 'notif-search';
      var CHECK_SVG = '<svg class="nf-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
      searchWrap.innerHTML = '<svg class="notif-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
        + '<input type="text" class="notif-search-input" id="notif-search-input" placeholder="Search notifications…" autocomplete="off" />'
        + '<div class="notif-filter-wrap" id="notif-filter-wrap">'
        +   '<button type="button" class="notif-filter-btn" id="notif-filter-btn" title="Filter by read status">'
        +     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>'
        +     '<span class="notif-filter-label"></span>'
        +   '</button>'
        +   '<div class="notif-filter-dd" id="notif-filter-dd">'
        +     '<button class="notif-filter-opt selected" data-filter="all"><span class="nf-label">All</span>'+CHECK_SVG+'</button>'
        +     '<button class="notif-filter-opt" data-filter="unread"><span class="nf-label">Unread</span>'+CHECK_SVG+'</button>'
        +     '<button class="notif-filter-opt" data-filter="read"><span class="nf-label">Read</span>'+CHECK_SVG+'</button>'
        +   '</div>'
        + '</div>';
      panel.insertBefore(searchWrap, body);
      var input = searchWrap.querySelector('input');
      input.addEventListener('input', function(){ _searchQuery = this.value.trim(); render(_currentTab); });
      var filterBtn = document.getElementById('notif-filter-btn');
      var filterDd = document.getElementById('notif-filter-dd');
      filterBtn.addEventListener('click', function(e){
        e.stopPropagation();
        filterDd.classList.toggle('open');
      });
      filterDd.addEventListener('click', function(e){
        var opt = e.target.closest('.notif-filter-opt'); if(!opt) return;
        e.stopPropagation();
        _readFilter = opt.getAttribute('data-filter') || 'all';
        filterDd.classList.remove('open');
        render(_currentTab);
      });
      document.addEventListener('mousedown', function(e){
        if(filterDd.classList.contains('open') && !e.target.closest('#notif-filter-wrap')){
          filterDd.classList.remove('open');
        }
      });
    }
  }

  /* ── override per-page placeholder functions ─────────────────────────── */
  function installOverrides(){
    var prevOpen = window.openNotifications;
    var prevClose = window.closeNotifications;
    window.closeNotifications = function(){
      _searchQuery = '';
      _readFilter = 'all';
      var si = document.getElementById('notif-search-input'); if(si) si.value = '';
      var fd = document.getElementById('notif-filter-dd'); if(fd) fd.classList.remove('open');
      if(typeof prevClose === 'function') prevClose();
      else {
        var p = document.getElementById('notif-panel'); if(p) p.classList.remove('open');
        var b = document.getElementById('header-bell'); if(b) b.classList.remove('active');
      }
    };
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
      +     '<button class="notif-markall" id="loanapp-markall" onclick="window.laMarkAllLoanApp && window.laMarkAllLoanApp()">Mark all as read</button>'
      +     '<button class="notif-close" onclick="window.closeLoanAppPanel && window.closeLoanAppPanel()" aria-label="Close">'
      +       '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      +     '</button>'
      +   '</div>'
      + '</div>'
      + '<div class="notif-tabs" id="loanapp-tabs">'
      +   '<button class="notif-tab" data-tab="all" onclick="window.laSetLoanAppTab && window.laSetLoanAppTab(\'all\')">All <span class="notif-tab-count" id="loanapp-count-all">0</span></button>'
      +   '<button class="notif-tab" data-tab="unread" onclick="window.laSetLoanAppTab && window.laSetLoanAppTab(\'unread\')">Unread <span class="notif-tab-count" id="loanapp-count-unread">0</span></button>'
      + '</div>'
      + '<div class="notif-body" id="loanapp-body"></div>'
      + '<div class="notif-footer">'
      +   '<button class="notif-seeall" onclick="window.location.href=\'/coreconnect_leads_v83/coreconnect_leads_v83.html?source=Loan+App\'">See all in CRM</button>'
      + '</div>';
    document.body.appendChild(p);
  }
  var LA_CAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M14.5 13.5c0-.83-.67-1.5-1.5-1.5h-2c-.83 0-1.5.67-1.5 1.5S10.17 15 11 15h2c.83 0 1.5.67 1.5 1.5S13.83 18 13 18h-2c-.83 0-1.5-.67-1.5-1.5"/></svg>';
  /* Notification-type registry — each entry: {titlePrefix, icon (SVG), iconBg, iconFg, tab}.
     Later phases extend this. */
  var LA_TYPES = {
    new_app: {
      titlePrefix: 'New application',
      icon: LA_CAR,
      iconBg: 'rgba(79,124,255,.14)',
      iconFg: 'var(--ac2)',
      tab: 'all'
    },
    lender_approved: {
      titlePrefix: 'Lender approved',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="8 12 11 15 16 9"/></svg>',
      iconBg: 'rgba(34,200,138,.14)',
      iconFg: 'var(--gr)',
      tab: 'loanapp'
    },
    lender_declined: {
      titlePrefix: 'Lender declined',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      iconBg: 'rgba(232,85,85,.16)',
      iconFg: 'var(--rd)',
      tab: 'loanapp'
    },
    doc_requested: {
      titlePrefix: 'Document Upload',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="18"/><line x1="9" y1="15" x2="15" y2="15"/></svg>',
      iconBg: 'rgba(245,166,35,.15)',
      iconFg: 'var(--am)',
      tab: 'loanapp'
    },
    doc_received: {
      titlePrefix: 'Document received',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 14 11 16 15 12"/></svg>',
      iconBg: 'rgba(34,200,138,.14)',
      iconFg: 'var(--gr)',
      tab: 'loanapp'
    },
    customer_replied: {
      titlePrefix: 'Customer replied',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
      iconBg: 'rgba(79,124,255,.14)',
      iconFg: 'var(--ac2)',
      tab: 'sms'
    },
    assignment_change: {
      titlePrefix: 'Assigned to you',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      iconBg: 'rgba(79,124,255,.14)',
      iconFg: 'var(--ac2)',
      tab: 'all'
    },
    app_aging: {
      titlePrefix: 'Application aging',
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 15 15"/></svg>',
      iconBg: 'rgba(245,166,35,.15)',
      iconFg: 'var(--am)',
      tab: 'loanapp'
    }
  };
  /* Stored notifications (localStorage) — Phase 1: read state is deferred to Phase 3.
     Shape: [{id, type, leadName, title?, body, ts, read?}]. `title` optional (falls back
     to LA_TYPES[type].titlePrefix). `leadName` resolves against CCLeads.LEADS at render. */
  var LA_STORE_KEY = 'cc_loanapp_notifications';
  var LA_STORE_VER_KEY = 'cc_loanapp_notifications_ver';
  var LA_STORE_VER = 4;   // bump when adding/removing seed rows
  function laDefaultSeed(){
    var now = Date.now();
    return [
      { id:'la_seed_lapproved_mason',  type:'lender_approved', leadName:'Mason Reid',
        body:'Capital One · 6.9% APR · 72 mo',                 ts: now - 1000*60*90 },
      { id:'la_seed_ldeclined_james',  type:'lender_declined', leadName:'James Okoye',
        body:'Ally · DTI exceeds guideline',                   ts: now - 1000*60*60*3 },
      { id:'la_seed_docreq_harper',    type:'doc_requested',   leadName:'Harper Reeves',
        body:'Paystub · 2 most recent',                        ts: now - 1000*60*60*5 },
      { id:'la_seed_docrec_ryan',      type:'doc_received',    leadName:'Ryan Tate',
        body:"Driver's license uploaded",                      ts: now - 1000*60*60*8 },
      { id:'la_seed_lapproved_theo',   type:'lender_approved', leadName:'Theo Mendoza',
        body:'Exeter · 8.4% APR · 60 mo',                      ts: now - 1000*60*60*11 },
      { id:'la_seed_docreq_ethan',     type:'doc_requested',   leadName:'Ethan Wright',
        body:'Proof of residence',                             ts: now - 1000*60*60*20 },
      { id:'la_seed_ldeclined_harper', type:'lender_declined', leadName:'Harper Reeves',
        body:'Consumer Portfolio · Insufficient tenure',       ts: now - 1000*60*60*30 },
      { id:'la_seed_reply_mason',      type:'customer_replied', leadName:'Mason Reid',
        body:'"Yes, that rate works — let me review the terms."', ts: now - 1000*60*25 },
      { id:'la_seed_reply_harper',     type:'customer_replied', leadName:'Harper Reeves',
        body:'"Uploading the paystubs now."',                  ts: now - 1000*60*60*4 },
      { id:'la_seed_assign_ethan',     type:'assignment_change', leadName:'Ethan Wright',
        body:'Reassigned from Sophia Ramos',                   ts: now - 1000*60*60*2 },
      { id:'la_seed_assign_ryan',      type:'assignment_change', leadName:'Ryan Tate',
        body:'New application routed to your queue',           ts: now - 1000*60*60*7 },
      { id:'la_seed_aging_james',      type:'app_aging',       leadName:'James Okoye',
        body:'3 days without action',                          ts: now - 1000*60*60*24 },
      { id:'la_seed_aging_theo',       type:'app_aging',       leadName:'Theo Mendoza',
        body:'5 days without action',                          ts: now - 1000*60*60*36 }
    ];
  }
  function laStoreLoad(){
    var storedVer = null;
    try{ storedVer = parseInt(localStorage.getItem(LA_STORE_VER_KEY), 10) || null; }catch(e){}
    if(storedVer === LA_STORE_VER){
      try{ var raw = localStorage.getItem(LA_STORE_KEY); if(raw){ var p = JSON.parse(raw); if(Array.isArray(p)) return p; } }catch(e){}
    }
    var seed = laDefaultSeed();
    try{
      localStorage.setItem(LA_STORE_KEY, JSON.stringify(seed));
      localStorage.setItem(LA_STORE_VER_KEY, String(LA_STORE_VER));
      // Fresh seed = fresh unread state; clear any prior read map.
      localStorage.removeItem(LA_READ_KEY);
    }catch(e){}
    return seed;
  }
  /* Read-state map: {rowId: true} for rows the user has seen. Row ids are stable per
     row: `stored:<id>` for stored notifications, `lead:<no>` for leads-derived rows. */
  var LA_READ_KEY = 'cc_loanapp_read';
  function laReadLoad(){
    try{ var raw = localStorage.getItem(LA_READ_KEY); if(raw){ var p = JSON.parse(raw); if(p && typeof p === 'object') return p; } }catch(e){}
    return {};
  }
  function laReadPersist(map){ try{ localStorage.setItem(LA_READ_KEY, JSON.stringify(map||{})); }catch(e){} }
  function laRowIdFor(kind, key){ return kind + ':' + key; }
  function laHasUnread(){
    var list = laUnified();
    for(var i = 0; i < list.length; i++){ if(!list[i].read) return true; }
    return false;
  }
  function laMarkRead(rowId){
    if(!rowId) return;
    var map = laReadLoad();
    if(map[rowId]) return;
    map[rowId] = true;
    laReadPersist(map);
    laUpdateDot();
    laUpdateMarkAllState();
    // Re-render if panel is open so the row's unread styling clears.
    var p = document.getElementById('loanapp-panel');
    if(p && p.classList.contains('open')) laRender();
  }
  function laMarkAllRead(){
    var list = laUnified();
    if(!list.length) return;
    var map = laReadLoad();
    list.forEach(function(n){ if(n.rowId) map[n.rowId] = true; });
    laReadPersist(map);
    laUpdateDot();
    laUpdateMarkAllState();
    var p = document.getElementById('loanapp-panel');
    if(p && p.classList.contains('open')) laRender();
  }
  function laUpdateDot(){
    var btn = document.getElementById('header-loanapp'); if(!btn) return;
    btn.classList.toggle('has-unread', laHasUnread());
  }
  function laUpdateMarkAllState(){
    var b = document.getElementById('loanapp-markall'); if(!b) return;
    b.disabled = !laHasUnread();
  }
  window.laMarkRead = laMarkRead;
  window.laMarkAllLoanApp = laMarkAllRead;
  /* Filter tab — 'all' | 'unread'. Session-only (not persisted). */
  var _laTab = 'all';
  function laSetTab(tab){
    tab = (tab === 'unread') ? 'unread' : 'all';
    if(tab === _laTab) return;
    _laTab = tab;
    var p = document.getElementById('loanapp-panel');
    if(p && p.classList.contains('open')) laRender();
  }
  window.laSetLoanAppTab = laSetTab;
  function laLeadByName(name){
    if(!name || !window.CCLeads || !Array.isArray(CCLeads.LEADS)) return null;
    var key = String(name).toLowerCase().trim();
    for(var i = 0; i < CCLeads.LEADS.length; i++){
      var l = CCLeads.LEADS[i];
      if(l && String(l.name || '').toLowerCase().trim() === key) return l;
    }
    return null;
  }
  function laRelTime(ts){
    if(!ts) return '';
    var d = Date.now() - ts, m = Math.floor(d/60000);
    if(m < 1) return 'just now';
    if(m < 60) return m + 'm ago';
    var h = Math.floor(m/60); if(h < 24) return h + 'h ago';
    var days = Math.floor(h/24); if(days < 7) return days + 'd ago';
    try{ return new Date(ts).toLocaleDateString(undefined, {month:'short', day:'numeric'}); }catch(e){ return ''; }
  }
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
      + '.cc-ntf-time{font-size:11px;color:var(--mu);margin-top:1px;}'
      + '.cc-ntf-dot{position:absolute;top:14px;right:14px;width:7px;height:7px;border-radius:50%;background:var(--ac);opacity:0;}'
      + '.cc-ntf-row.is-unread .cc-ntf-dot{opacity:1;}'
      + '.cc-ntf-row.is-unread{background:rgba(79,124,255,.04);}'
      + '.cc-ntf-row.is-unread .cc-ntf-line strong{font-weight:700;}';
    var st = document.createElement('style'); st.id = 'cc-ntf-style'; st.textContent = css; document.head.appendChild(st);
    // Loan-app-specific header additions (markall button + header-dot). Injected separately
    // so a page that only ships the bell doesn't get these unused rules.
    if(!document.getElementById('loanapp-hdr-style')){
      var laCss = ''
        + '#loanapp-markall{background:transparent;border:none;color:var(--ac2);font-family:var(--font);font-size:12px;padding:6px 10px;border-radius:6px;cursor:pointer;}'
        + '#loanapp-markall:hover{background:rgba(79,124,255,.10);}'
        + '#loanapp-markall[disabled]{opacity:.4;cursor:not-allowed;}'
        + '#loanapp-markall[disabled]:hover{background:transparent;}'
        + '#header-loanapp{position:relative;}'
        + '#header-loanapp-dot{position:absolute;top:10px;right:10px;width:8px;height:8px;border-radius:50%;background:var(--rd);border:1.5px solid var(--bg);display:none;pointer-events:none;}'
        + '#header-loanapp.has-unread #header-loanapp-dot{display:block;}'
        + '#loanapp-tabs{display:flex;gap:4px;padding:8px 14px 0;border-bottom:0.5px solid var(--brd);flex-shrink:0;}'
        + '#loanapp-tabs .notif-tab{background:transparent;border:none;color:var(--mu);font-family:var(--font);font-size:12.5px;padding:8px 10px;border-bottom:2px solid transparent;cursor:pointer;display:inline-flex;align-items:center;gap:6px;}'
        + '#loanapp-tabs .notif-tab:hover{color:var(--tx);}'
        + '#loanapp-tabs .notif-tab.active{color:var(--ac2);border-bottom-color:var(--ac);}'
        + '#loanapp-tabs .notif-tab-count{font-family:var(--mono);font-size:10.5px;color:var(--mu);background:var(--sur2);padding:2px 6px;border-radius:8px;}'
        + '#loanapp-tabs .notif-tab.active .notif-tab-count{color:var(--ac2);background:rgba(79,124,255,.16);}';
      var lst = document.createElement('style'); lst.id = 'loanapp-hdr-style'; lst.textContent = laCss; document.head.appendChild(lst);
    }
  }
  /* Build a unified list of {type, leadNo, leadName, leadColor, title, body, time, ts, tab}
     from (a) live Loan-App leads → 'new_app' rows and (b) stored notifications resolved
     against the roster. Sorted newest-first when both carry timestamps. */
  function laUnified(){
    var out = [];
    var readMap = laReadLoad();
    laLeads().forEach(function(l){
      var vehicle = l.vehicle && l.vehicle !== '—' ? l.vehicle : 'No vehicle';
      var rowId = laRowIdFor('lead', l.no);
      out.push({
        type:'new_app',
        rowId: rowId,
        read: !!readMap[rowId],
        leadNo: l.no,
        leadName: l.name || 'Unknown',
        leadColor: l.ac || '#4f7cff',
        body: [vehicle, l.status].filter(Boolean).join(' · '),
        time: l.lastAttempt || '',
        ts: 0
      });
    });
    laStoreLoad().forEach(function(n){
      var t = LA_TYPES[n.type] || LA_TYPES.new_app;
      var l = laLeadByName(n.leadName);
      var rowId = laRowIdFor('stored', n.id);
      out.push({
        type: n.type,
        rowId: rowId,
        read: !!readMap[rowId],
        leadNo: l ? l.no : null,
        leadName: n.leadName || (l && l.name) || 'Unknown',
        leadColor: (l && l.ac) || '#4f7cff',
        title: n.title || t.titlePrefix,
        body: n.body || '',
        time: laRelTime(n.ts),
        ts: n.ts || 0
      });
    });
    // Newest first: stored rows carry ts; leads have ts=0 and fall to the end.
    out.sort(function(a, b){ return (b.ts || 0) - (a.ts || 0); });
    return out;
  }
  function laRender(){
    laBuildPanel();
    laEnsureCss();
    var body = document.getElementById('loanapp-body'); if(!body) return;
    var all = laUnified();
    var unread = all.filter(function(n){ return !n.read; });
    // Tab counts + active state
    var elAll = document.getElementById('loanapp-count-all'); if(elAll) elAll.textContent = all.length;
    var elUn  = document.getElementById('loanapp-count-unread'); if(elUn) elUn.textContent = unread.length;
    var tabs = document.querySelectorAll('#loanapp-tabs .notif-tab');
    for(var i = 0; i < tabs.length; i++){ tabs[i].classList.toggle('active', tabs[i].getAttribute('data-tab') === _laTab); }
    var list = (_laTab === 'unread') ? unread : all;
    if(!list.length){
      var msg = (_laTab === 'unread') ? "You're all caught up." : 'No loan-app notifications.';
      body.innerHTML = '<div class="notif-empty">' + msg + '</div>';
      laUpdateMarkAllState();
      return;
    }
    body.innerHTML = list.map(function(n){
      var t = LA_TYPES[n.type] || LA_TYPES.new_app;
      var title = n.title || t.titlePrefix;
      var tab = t.tab || 'all';
      var rowId = laEsc(n.rowId);
      var markCall = 'window.laMarkRead && window.laMarkRead(\'' + rowId + '\');';
      var click = n.leadNo != null
        ? markCall + ' window.closeLoanAppPanel && window.closeLoanAppPanel(); if(window.openContactPanel){ window.openContactPanel(' + Number(n.leadNo) + ', \'' + laEsc(tab) + '\'); }'
        : markCall + ' window.closeLoanAppPanel && window.closeLoanAppPanel();';
      var cls = 'cc-ntf-row' + (n.read ? '' : ' is-unread');
      return '<button class="' + cls + '" data-row-id="' + rowId + '" onclick="' + click + '">'
        + '<span class="cc-ntf-ic" style="background:' + t.iconBg + ';color:' + t.iconFg + '">' + t.icon + '</span>'
        + '<span class="cc-ntf-av" style="background:' + laEsc(n.leadColor) + '">' + laEsc(laInitials(n.leadName)) + '</span>'
        + '<span class="cc-ntf-txt">'
        +   '<span class="cc-ntf-line"><strong>' + laEsc(title) + '</strong> · ' + laEsc(n.leadName) + '</span>'
        +   '<span class="cc-ntf-body">' + laEsc(n.body) + '</span>'
        +   '<span class="cc-ntf-time">' + laEsc(n.time) + '</span>'
        + '</span>'
        + '<span class="cc-ntf-dot" aria-hidden="true"></span>'
      + '</button>';
    }).join('');
    laUpdateMarkAllState();
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
      + '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>'
      + '<polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/>'
      + '<path d="M14.5 13.5c0-.83-.67-1.5-1.5-1.5h-2c-.83 0-1.5.67-1.5 1.5S10.17 15 11 15h2c.83 0 1.5.67 1.5 1.5S13.83 18 13 18h-2c-.83 0-1.5-.67-1.5-1.5"/>'
      + '</svg>'
      + '<span id="header-loanapp-dot" aria-hidden="true"></span>';
    bell.parentNode.insertBefore(btn, bell);
    laEnsureCss();  // ensures #header-loanapp-dot styles are present even before the panel first opens
    laEnsureLeadsData(function(){ laUpdateDot(); });
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
    /* Transient "New loan application" card disabled for now. Re-enable by uncommenting below. */
    return;
    // laEnsureLeadsData(function(){
    //   var lead = laNewestLoanLead(); if(!lead) return;
    //   setTimeout(function(){ laShowCard(lead); }, 700);
    // });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectLoanAppIcon);
  else injectLoanAppIcon();
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', laBannerInit);
  else laBannerInit();
})();

/* ============================================================================
   CoreConnect — Global search palette (command-palette style)
   ----------------------------------------------------------------------------
   Adds a search magnifier button to the top-header (before the theme toggle).
   Click → dark full-viewport overlay with input + filtered results list of
   app pages + Settings hub cards. Arrow keys navigate, Enter goes.
   Idempotent — checks for #header-search before injecting.
   ============================================================================ */
(function(){
  var GS_MAX = 20;
  // Absolute paths from site root so results resolve from any folder depth.
  var GS_INDEX = [
    // Main app pages
    { title:'Dashboard',                              sub:'Home view — activity, KPIs, widgets',                  href:'/coreconnect_dashboard_v41/coreconnect_dashboard_v41.html',                       type:'Page' },
    { title:'CRM · Leads',                            sub:'All leads — kanban and table views',                    href:'/coreconnect_leads_v83/coreconnect_leads_v83.html',                                type:'Page' },
    { title:'Call History',                           sub:'Inbound, outbound, missed calls',                       href:'/call_history/coreconnect_call_history_v31.html',                                  type:'Page' },
    { title:'Messages',                               sub:'SMS conversations',                                     href:'/coreconnect_message_history_v41/coreconnect_message_history_v41.html',            type:'Page' },
    { title:'Voicemail',                              sub:'Voicemail inbox and playback',                          href:'/coreconnect_voicemail_history_v9/coreconnect_voicemail_history_v9.html',          type:'Page' },
    { title:'Appointments',                           sub:'Calendar — day, week, month',                           href:'/coreconnect_appointments/coreconnect_appointments.html',                          type:'Page' },
    { title:'Contacts',                               sub:'Full contact directory',                                href:'/Settings/contacts/coreconnect_contact.html',                                      type:'Page' },
    { title:'Reports',                                sub:'Reporting & analytics',                                 href:'/Settings/reports/coreconnect_report.html',                                        type:'Page' },
    { title:'Deal Desk',                              sub:'Deal desking workspace',                                href:'/Settings/desking_module/desking_module.html',                                     type:'Page' },
    { title:'Notifications inbox',                    sub:'All notifications',                                     href:'/notification/notification.html',                                                  type:'Page' },

    // Reputation module
    { title:'Reputation · Dashboard',                 sub:'Reviews overview and scores',                           href:'/reputation/reputation_dashboard/Dashboard.html',                                  type:'Reputation' },
    { title:'Reputation · Reviews',                   sub:'All customer reviews',                                  href:'/reputation/reviews/reviews.html',                                                 type:'Reputation' },
    { title:'Reputation · Requests',                  sub:'Review request campaigns',                              href:'/reputation/requests/review_request/review_request.html',                          type:'Reputation' },
    { title:'Reputation · Leaderboard',               sub:'Team review-request leaderboard',                       href:'/reputation/requests/leaderboard/leaderboard.html',                                type:'Reputation' },
    { title:'Reputation · Request Templates',         sub:'Email + SMS request templates',                         href:'/reputation/requests/template/template.html',                                      type:'Reputation' },
    { title:'Reputation · Review Templates',          sub:'Review-response templates',                             href:'/reputation/settings/reviews/template/template.html',                              type:'Reputation' },
    { title:'Reputation · Rate rules',                sub:'Route reviews by rating',                               href:'/reputation/settings/requests/ratesettings.html',                                  type:'Reputation' },
    { title:'Reputation · Source',                    sub:'Review platforms and integrations',                     href:'/reputation/source/source.html',                                                   type:'Reputation' },
    { title:'Reputation · Settings',                  sub:'Reputation module settings hub',                        href:'/reputation/settings/settings.html',                                               type:'Reputation' },
    { title:'Reputation · Listing performance',       sub:'Listing performance metrics',                           href:'/reputation/listing/performance/performance.html',                                 type:'Reputation' },

    // Settings hub
    { title:'Settings',                               sub:'Settings hub — all cards',                              href:'/Settings/Settings_main_page/coreconnect_settings.html',                           type:'Settings' },
    { title:'User Management',                        sub:'Manage all users',                                      href:'/Settings/Users/coreconnect_user.html',                                            type:'Settings' },
    { title:'Role Management',                        sub:'Roles and their permissions',                           href:'/Settings/User_roles/coreconnect_user_roles.html',                                 type:'Settings' },
    { title:'Contact Management',                     sub:'All customer contacts',                                 href:'/Settings/contacts/coreconnect_contact.html',                                      type:'Settings' },
    { title:'Reporting & Analytics',                  sub:'Report builders and schedules',                         href:'/Settings/reports/coreconnect_report.html',                                        type:'Settings' },
    { title:'CRM Alerts & Automation',                sub:'CRM alert rules',                                       href:'/Settings/crm_alert_management/crm_alert_management.html',                          type:'Settings' },
    { title:'Notification Settings',                  sub:'Notification management',                               href:'/Settings/notification_management/notification_management.html',                    type:'Settings' },
    { title:'Location Management',                    sub:'Store locations',                                       href:'/Settings/locations/locations.html',                                               type:'Settings' },
    { title:'Lead Status Reasons',                    sub:'Inactive reason list',                                  href:'/Settings/inactive_reason/inactive_reason.html',                                   type:'Settings' },
    { title:'Inventory Integration',                  sub:'Sold inventory feed',                                   href:'/Settings/sold_inventory/sold_inventory.html',                                     type:'Settings' },
    { title:'Lead Source Cost Management',            sub:'Vendor cost tracking',                                  href:'/Settings/crm_vendors_cost/crm_vendors_cost.html',                                 type:'Settings' },
    { title:'Google Sheets Integration',              sub:'Sheet feeds and column mapping',                        href:'/Settings/crm_google_sheet/crm_google_sheet.html',                                 type:'Settings' },
    { title:'Lead Status Management',                 sub:'CRM statuses',                                          href:'/Settings/crm_status/crm_status.html',                                             type:'Settings' },
    { title:'Lead Rule Status',                       sub:'Auto-status rules',                                     href:'/Settings/lead_rule_status/lead_rule_status.html',                                 type:'Settings' },
    { title:'Disable Rules',                          sub:'Auto-disable rules',                                    href:'/Settings/disable_rule/disable_rule.html',                                         type:'Settings' },
    { title:'Initial Greeting Message',               sub:'Voicemail-drop greetings',                              href:'/Settings/greeting_message/greeting_message.html',                                 type:'Settings' },
    { title:'Personal SMS Templates',                 sub:'Your SMS templates',                                    href:'/Settings/user_sms_template/user_sms_template.html',                               type:'Settings' },
    { title:'Department Message Templates',           sub:'Shared department SMS templates',                       href:'/Settings/department_sms_template/department_sms_template.html',                   type:'Settings' },
    { title:'Email Templates',                        sub:'Email template library',                                href:'/Settings/email_template/email_template.html',                                     type:'Settings' },
    { title:'Email Marketing Campaigns',              sub:'Broadcast campaigns',                                   href:'/Settings/email_campaign/email_campaign.html',                                     type:'Settings' },
    { title:'Workflow Automation',                    sub:'Automated tasks',                                       href:'/Settings/automated_task/autotask.html',                                           type:'Settings' },
    { title:'Department Access Control',              sub:'Per-department permissions',                            href:'/Settings/departmentpermissions/departmentpermissions.html',                       type:'Settings' },
    { title:'Department Lead Access Rules',           sub:'Which leads a department can see',                      href:'/Settings/dep_lead/dep_lead.html',                                                 type:'Settings' },
    { title:'Lead Tags & Labels',                     sub:'Label palette and rules',                               href:'/Settings/labelflag/labelflag.html',                                               type:'Settings' },
    { title:'AI Configuration',                       sub:'AI-rule builder',                                       href:'/Settings/aisettings/aisettings.html',                                             type:'Settings' },
    { title:'AI Q&A & Store Description',             sub:'AI knowledge base',                                     href:'/Settings/qastore/qastore.html',                                                   type:'Settings' },
    { title:'Application Settings',                   sub:'Loan-app recipients',                                   href:'/Settings/loan_app/application_settings.html',                                     type:'Settings' },
    { title:'Notification Format',                    sub:'Notification message templates',                        href:'/Settings/notififormat/notififormat.html',                                         type:'Settings' },
    { title:'Tagged Message Format',                  sub:'Tag-message templates',                                 href:'/Settings/tagsmsformat/tagmessage.html',                                           type:'Settings' },
    { title:'Loan Application Notifications',         sub:'Loan-app notification templates',                       href:'/Settings/loanappnotifi/loanappnotifi.html',                                       type:'Settings' },
    { title:'Personal Voicemail Settings',            sub:'Your voicemail files',                                  href:'/Settings/personalvoice/personalvoice.html',                                       type:'Settings' },
    { title:'Department Voicemail Settings',          sub:'Shared department voicemail files',                     href:'/Settings/depvoicemail/depvoicemail.html',                                         type:'Settings' },
    { title:'Video Library',                          sub:'Uploaded videos',                                       href:'/Settings/videofiles/vidlib.html',                                                 type:'Settings' },
    { title:'Conversation Keyword Alerts',            sub:'Alert on chat keywords',                                href:'/Settings/converketword/converketword.html',                                       type:'Settings' }
  ];

  function gsEsc(s){ return String(s||'').replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  var _gsSel = 0, _gsHits = [], _gsBuilt = false, _gsPage = null;

  function ensureGsCss(){
    if(document.getElementById('gs-style')) return;
    var css = '.gs-backdrop{position:fixed;inset:0;background:var(--overlay,rgba(0,0,0,.6));z-index:10000;display:none;align-items:flex-start;justify-content:center;padding:80px 20px 20px;}'
      + '.gs-backdrop.open{display:flex;}'
      + '.gs-panel{width:100%;max-width:640px;max-height:calc(100vh - 100px);background:var(--sur);border:0.5px solid var(--brd2);border-radius:12px;box-shadow:0 24px 60px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;}'
      + '.gs-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:0.5px solid var(--brd);flex-shrink:0;}'
      + '.gs-mag{width:18px;height:18px;color:var(--mu);flex:none;}'
      + '.gs-head input{flex:1;background:none;border:none;outline:none;color:var(--tx);font-family:var(--font);font-size:16px;padding:0;min-width:0;}'
      + '.gs-head input::placeholder{color:var(--mu);}'
      + '.gs-esc{background:var(--sur2);border:0.5px solid var(--brd2);color:var(--mu);font-family:var(--font);font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer;flex:none;font-weight:500;}'
      + '.gs-esc:hover{color:var(--tx);}'
      + '.gs-section-label{display:flex;align-items:center;justify-content:space-between;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--mu);padding:12px 16px 4px;}'
      + '.gs-clear-filter{display:none;font-size:10px;font-weight:500;text-transform:none;letter-spacing:0;color:var(--ac);cursor:pointer;background:none;border:none;padding:0;font-family:var(--font);}'
      + '.gs-clear-filter:hover{text-decoration:underline;}'
      + '.gs-clear-filter.show{display:block;}'
      + '.gs-pages{display:flex;flex-direction:column;gap:2px;padding:4px 16px 8px;border-bottom:0.5px solid var(--brd);flex-shrink:0;}'
      + '.gs-page-link{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;color:var(--tx);cursor:pointer;transition:all .12s;font-family:var(--font);text-decoration:none;background:transparent;border:none;text-align:left;width:100%;}'
      + '.gs-page-link:hover{background:var(--sur2);}'
      + '.gs-page-link.on{background:var(--ac);border-color:var(--ac);}'
      + '.gs-page-link.on .gs-page-link-title{color:#fff;}'
      + '.gs-page-link.on .gs-page-link-sub{color:rgba(255,255,255,.7);}'
      + '.gs-page-link.on svg{color:#fff;}'
      + '.gs-page-link svg{width:16px;height:16px;flex:none;color:var(--mu);align-self:center;}'
      + '.gs-page-link-text{display:flex;flex-direction:column;gap:1px;}'
      + '.gs-page-link-title{font-size:12.5px;font-weight:500;}'
      + '.gs-page-link-sub{font-size:10.5px;font-weight:400;color:var(--mu);}'
      + '.gs-active-filter{display:none;align-items:center;gap:6px;padding:6px 16px;flex-shrink:0;}'
      + '.gs-active-filter.show{display:flex;}'
      + '.gs-active-filter-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;background:var(--ac);color:#fff;font-size:11px;font-weight:500;font-family:var(--font);}'
      + '.gs-active-filter-x{cursor:pointer;opacity:.7;font-size:13px;line-height:1;}'
      + '.gs-active-filter-x:hover{opacity:1;}'
      + '.gs-section-divider{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--mu);padding:12px 12px 4px;margin-top:4px;border-top:0.5px solid var(--brd);}'
      + '.gs-body{overflow-y:auto;flex:1;padding:6px 4px 8px;}'
      + '.gs-empty{padding:32px 20px;text-align:center;color:var(--mu);font-size:13px;}'
      + '.gs-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;border-left:2px solid transparent;background:transparent;border-top:none;border-right:none;border-bottom:none;width:calc(100% - 8px);margin:0 4px;text-align:left;font-family:var(--font);}'
      + '.gs-row:hover,.gs-row.on{background:var(--sur2);}'
      + '.gs-row.on{border-left-color:var(--ac);}'
      + '.gs-row-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;}'
      + '.gs-row-title{font-size:13.5px;font-weight:600;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.gs-row-sub{font-size:12.5px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
      + '.gs-row-type{font-size:10.5px;color:var(--mu);text-transform:uppercase;letter-spacing:.5px;background:var(--sur);padding:3px 8px;border-radius:999px;border:0.5px solid var(--brd2);flex:none;}'
      + '.gs-row-av{width:28px;height:28px;border-radius:50%;flex:none;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:600;letter-spacing:.3px;}'
      + '@media (max-width:640px){.gs-backdrop{padding:0;align-items:stretch;justify-content:stretch;}.gs-panel{max-width:none;max-height:none;height:100vh;border-radius:0;border:none;}.gs-esc{min-height:32px;}.gs-head input{font-size:16px;}}';
    var st = document.createElement('style'); st.id = 'gs-style'; st.textContent = css; document.head.appendChild(st);
  }

  function ensureGsBuilt(){
    if(_gsBuilt) return;
    ensureGsCss();
    var bd = document.createElement('div');
    bd.className = 'gs-backdrop';
    bd.id = 'gs-backdrop';
    bd.innerHTML = '<div class="gs-panel" role="dialog" aria-modal="true" aria-label="Global search">'
      + '<div class="gs-head">'
        + '<svg class="gs-mag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
        + '<input type="text" id="gs-input" placeholder="Search leads…" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"/>'
        + '<button type="button" class="gs-esc" onclick="closeGlobalSearch()">Esc</button>'
      + '</div>'
      + '<div class="gs-section-label"><span>Pages</span><button type="button" class="gs-clear-filter" id="gs-clear-filter">Clear filter</button></div>'
      + '<div class="gs-pages">'
        + '<button type="button" class="gs-page-link" data-gs-page="crm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><span class="gs-page-link-text"><span class="gs-page-link-title">CRM</span><span class="gs-page-link-sub">Manage leads and contacts</span></span></button>'
        + '<button type="button" class="gs-page-link" data-gs-page="calls"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg><span class="gs-page-link-text"><span class="gs-page-link-title">Call History</span><span class="gs-page-link-sub">View past calls</span></span></button>'
        + '<button type="button" class="gs-page-link" data-gs-page="sms"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span class="gs-page-link-text"><span class="gs-page-link-title">Message History</span><span class="gs-page-link-sub">Browse SMS conversations</span></span></button>'
        + '<button type="button" class="gs-page-link" data-gs-page="voicemail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="11.5" r="4.5"/><circle cx="18.5" cy="11.5" r="4.5"/><line x1="5.5" y1="16" x2="18.5" y2="16"/></svg><span class="gs-page-link-text"><span class="gs-page-link-title">Voicemail</span><span class="gs-page-link-sub">Listen to voice messages</span></span></button>'
        + '<button type="button" class="gs-page-link" data-gs-page="appointments"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg><span class="gs-page-link-text"><span class="gs-page-link-title">Appointments</span><span class="gs-page-link-sub">Schedule and manage bookings</span></span></button>'
        + '<button type="button" class="gs-page-link" data-gs-page="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg><span class="gs-page-link-text"><span class="gs-page-link-title">Settings</span><span class="gs-page-link-sub">Configure preferences</span></span></button>'
      + '</div>'
      + '<div class="gs-active-filter" id="gs-active-filter"></div>'
      + '<div class="gs-body" id="gs-body"></div>'
      + '<div class="gs-empty" id="gs-empty" hidden>No matches. Try another word.</div>'
    + '</div>';
    bd.addEventListener('click', function(e){ if(e.target === bd) closeGlobalSearch(); });
    document.body.appendChild(bd);
    var inp = document.getElementById('gs-input');
    inp.addEventListener('input', function(){ gsFilter(this.value); });
    inp.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown'){ e.preventDefault(); _gsSel = Math.min(_gsSel + 1, _gsHits.length - 1); gsRender(); gsScrollSel(); }
      else if(e.key === 'ArrowUp'){ e.preventDefault(); _gsSel = Math.max(_gsSel - 1, 0); gsRender(); gsScrollSel(); }
      else if(e.key === 'Enter'){ e.preventDefault(); gsGo(_gsSel); }
      else if(e.key === 'Escape'){ closeGlobalSearch(); }
    });
    var body = document.getElementById('gs-body');
    if(body){
      body.addEventListener('click', gsBodyClick);
      body.addEventListener('mouseover', gsBodyMouseOver);
    }
    var pages = bd.querySelector('.gs-pages');
    if(pages){
      pages.addEventListener('click', function(e){
        var btn = e.target.closest('.gs-page-link');
        if(!btn) return;
        var page = btn.getAttribute('data-gs-page');
        _gsPage = (_gsPage === page) ? null : page;
        gsUpdatePages();
        var inp = document.getElementById('gs-input');
        gsFilter(inp ? inp.value : '');
      });
    }
    var clearBtn = document.getElementById('gs-clear-filter');
    if(clearBtn){
      clearBtn.addEventListener('click', function(){
        _gsPage = null;
        gsUpdatePages();
        var inp = document.getElementById('gs-input');
        gsFilter(inp ? inp.value : '');
      });
    }
    _gsBuilt = true;
  }

  function gsUpdatePages(){
    var pages = document.querySelectorAll('.gs-page-link');
    for(var k = 0; k < pages.length; k++){
      var p = pages[k].getAttribute('data-gs-page');
      pages[k].classList.toggle('on', _gsPage === p);
    }
    var clr = document.getElementById('gs-clear-filter');
    if(clr) clr.classList.toggle('show', !!_gsPage);
  }

  function gsLeadHits(q){
    var arr = (window.CCLeads && Array.isArray(CCLeads.LEADS)) ? CCLeads.LEADS : [];
    if(!q) return [];
    return arr.filter(function(l){
      return String(l.name||'').toLowerCase().indexOf(q)>=0
          ||String(l.phone||'').toLowerCase().indexOf(q)>=0
          ||String(l.email||'').toLowerCase().indexOf(q)>=0
          ||String(l.vehicle||'').toLowerCase().indexOf(q)>=0
          ||String(l.stock||'').toLowerCase().indexOf(q)>=0;
    }).map(function(l){
      var subParts = [];
      if(l.vehicle) subParts.push(l.vehicle);
      if(l.phone)   subParts.push(l.phone);
      return { title: l.name || ('Lead #' + l.no), sub: subParts.join(' · '), type: 'Lead', lead: l };
    });
  }

  /* ── Interaction search — matches lead history (calls, SMS, voicemail) ─────── */
  // Sample pools mirror the seed used by the history pages so search hits align with
  // what a user actually sees in a lead's contact panel.
  var GS_SMS_IN  = ['Hi, is this still available?','Can we schedule a test drive?',"What's the best price you can do?",'Saturday morning works for me.','Do you have it in another color?',"Thanks, I'll think it over.",'Can you send the financing options?','Still considering — will get back to you.'];
  var GS_SMS_OUT = ['Yes it is! Want to come in this week?','Absolutely — when works for you?','I can do a great deal this weekend.','Just sent the details to your email.','Following up — any questions?','Your appointment is confirmed.','Happy to help — call me anytime.','Checking now, back to you shortly.'];
  // Voicemail: each entry is a full transcript conversation (short) — matched on any line.
  var GS_VM_SAMPLES = [
    'Hi, this is a follow-up on the test drive we scheduled. Please call me back at your earliest convenience.',
    'Just wanted to check in about the financing paperwork — pre-approval is still open through Friday.',
    'Left you a voicemail about the trade-in value we discussed. I have the numbers if you want to talk.',
    'Following up on the appointment for Saturday morning — send me a text to confirm.',
    'Quick question about the vehicle inspection — everything checked out clean except a minor cosmetic item.',
    'Hey, wanted to let you know the color you asked about just came in on the lot.',
    'Sorry I missed you — trying to reach out about the offer we discussed last week.',
    'This is about the loan application. We need one more document to move forward.'
  ];
  // Call outcomes we announce as a title prefix.
  var GS_CALL_OUTCOME_LABEL = { in:'Inbound call', out:'Outbound call', missed:'Missed call' };

  function gsInteractionHits(q){
    if(!q || !window.CCLeads || !Array.isArray(CCLeads.LEADS)) return [];
    var leads = CCLeads.LEADS;
    var hits = [];
    for(var i = 0; i < leads.length; i++){
      var L = leads[i];
      // ── SMS thread for this lead ──
      if(typeof CCLeads.smsCountsForLead === 'function'){
        var sc = CCLeads.smsCountsForLead(L);
        if(sc && (sc.in + sc.out) > 0){
          var oi = 0, ii = 0, dirs = [];
          for(var k = 0; k < sc.in + sc.out; k++){
            var wantIn = (k % 2 === 0);
            if((wantIn && ii < sc.in) || oi >= sc.out){ dirs.push('in'); ii++; } else { dirs.push('out'); oi++; }
          }
          for(var m = 0; m < dirs.length; m++){
            var text = (dirs[m] === 'in' ? GS_SMS_IN : GS_SMS_OUT)[(i + m) % 8];
            if(text.toLowerCase().indexOf(q) >= 0){
              hits.push({
                title: (dirs[m] === 'in' ? '↙ ' : '↗ ') + text,
                sub: L.name + ' · SMS',
                type: 'SMS',
                lead: L,
                tab: 'sms'
              });
            }
          }
        }
      }
      // ── Voicemails from missed inbound calls ──
      if(typeof CCLeads.callCountsForLead === 'function'){
        var cc = CCLeads.callCountsForLead(L);
        if(cc && cc.missed > 0){
          for(var v = 0; v < cc.missed; v++){
            var vt = GS_VM_SAMPLES[(i + v) % GS_VM_SAMPLES.length];
            if(vt.toLowerCase().indexOf(q) >= 0){
              hits.push({
                title: vt,
                sub: L.name + ' · Voicemail',
                type: 'Voicemail',
                lead: L,
                tab: 'calls'
              });
            }
          }
        }
        // ── Call rows (matches on outcome + lead name + direction, not transcript) ──
        if(cc){
          var outcomes = [];
          for(var mk = 0; mk < cc.missed; mk++) outcomes.push('missed');
          for(var ak = 0; ak < (cc.in - cc.missed); ak++) outcomes.push('in');
          for(var ok = 0; ok < cc.out; ok++) outcomes.push('out');
          for(var c = 0; c < outcomes.length; c++){
            var label = GS_CALL_OUTCOME_LABEL[outcomes[c]] || 'Call';
            var callText = label + ' — ' + (L.name || 'Lead');
            if(callText.toLowerCase().indexOf(q) >= 0){
              hits.push({
                title: callText,
                sub: (L.phone || '') + ' · Call',
                type: 'Call',
                lead: L,
                tab: 'calls'
              });
            }
          }
        }
      }
      if(hits.length >= 40) break; // cap the scan for perf
    }
    return hits;
  }

  function gsFilter(v){
    var q = String(v || '').toLowerCase().trim();
    if(!q){ _gsHits = []; }
    else if(_gsPage){
      var allHits = gsLeadHits(q).concat(gsInteractionHits(q));
      var pageTypeMap = {crm:'Lead',calls:'Call',sms:'SMS',voicemail:'Voicemail',appointments:'Appointment',settings:'Setting'};
      var filterType = pageTypeMap[_gsPage];
      if(_gsPage === 'crm'){
        _gsHits = allHits.filter(function(h){ return h.type === 'Lead'; }).slice(0, GS_MAX);
      } else if(_gsPage === 'calls'){
        _gsHits = allHits.filter(function(h){ return h.type === 'Call'; }).slice(0, GS_MAX);
      } else if(_gsPage === 'sms'){
        _gsHits = allHits.filter(function(h){ return h.type === 'SMS'; }).slice(0, GS_MAX);
      } else if(_gsPage === 'voicemail'){
        _gsHits = allHits.filter(function(h){ return h.type === 'Voicemail'; }).slice(0, GS_MAX);
      } else if(_gsPage === 'appointments' || _gsPage === 'settings'){
        var navHits = GS_INDEX.filter(function(e){
          return (String(e.title||'').toLowerCase().indexOf(q) >= 0
              || String(e.sub||'').toLowerCase().indexOf(q) >= 0)
              && String(e.type||'').toLowerCase().indexOf(_gsPage === 'settings' ? 'setting' : 'appointment') >= 0;
        });
        _gsHits = navHits.slice(0, GS_MAX);
      } else {
        _gsHits = [];
      }
    }
    else {
      var navHits = GS_INDEX.filter(function(e){
        return String(e.title||'').toLowerCase().indexOf(q) >= 0
            || String(e.sub||'').toLowerCase().indexOf(q) >= 0
            || String(e.type||'').toLowerCase().indexOf(q) >= 0;
      });
      var leadHits = gsLeadHits(q);
      var interactionHits = gsInteractionHits(q);
      _gsHits = leadHits.concat(interactionHits).concat(navHits).slice(0, GS_MAX);
    }
    _gsSel = 0;
    gsRender();
  }

  function gsRender(){
    var body = document.getElementById('gs-body');
    var empty = document.getElementById('gs-empty');
    if(!body || !empty) return;
    var inp = document.getElementById('gs-input');
    var hasQuery = inp && inp.value.trim().length > 0;
    var sectionLabel = document.querySelector('.gs-section-label');
    var pagesEl = document.querySelector('.gs-pages');
    var activeFilter = document.getElementById('gs-active-filter');
    if(sectionLabel) sectionLabel.style.display = hasQuery ? 'none' : '';
    if(pagesEl) pagesEl.style.display = hasQuery ? 'none' : '';
    if(activeFilter){
      var filterName = '';
      if(_gsPage){
        var pageNames = {crm:'CRM',calls:'Call History',sms:'Message History',voicemail:'Voicemail',appointments:'Appointments',settings:'Settings'};
        filterName = pageNames[_gsPage] || _gsPage;
      }
      if(hasQuery && filterName){
        activeFilter.innerHTML = '<span class="gs-active-filter-chip">' + filterName + '<span class="gs-active-filter-x" id="gs-filter-x">×</span></span>';
        activeFilter.classList.add('show');
        var xBtn = document.getElementById('gs-filter-x');
        if(xBtn) xBtn.onclick = function(){
          _gsPage = null;
          gsUpdatePages();
          gsFilter(inp ? inp.value : '');
        };
      } else {
        activeFilter.classList.remove('show');
        activeFilter.innerHTML = '';
      }
    }
    if(!_gsHits.length){ body.innerHTML = ''; body.style.display = 'none'; empty.hidden = !hasQuery; return; }
    empty.hidden = true;
    body.style.display = '';
    var sectionMap = {'Lead':'CRM','Call':'Call History','SMS':'Message History','Voicemail':'Voicemail','Page':'Pages','Reputation':'Pages','Settings':'Settings'};
    var lastSection = '';
    var showSections = !_gsPage;
    body.innerHTML = _gsHits.map(function(e, i){
      var on = (i === _gsSel) ? ' on' : '';
      var avatar = '';
      if(e.lead){
        var color = e.lead.ac || 'var(--ac)';
        var initials = String(e.lead.name || '').trim().split(/\s+/).slice(0,2).map(function(p){return (p[0]||'').toUpperCase();}).join('');
        avatar = '<span class="gs-row-av" style="background:' + gsEsc(color) + ';">' + gsEsc(initials) + '</span>';
      }
      var divider = '';
      if(showSections){
        var sec = sectionMap[e.type] || '';
        if(sec && sec !== lastSection){ divider = '<div class="gs-section-divider">' + gsEsc(sec) + '</div>'; lastSection = sec; }
      }
      return divider + '<button type="button" class="gs-row' + on + '" data-i="' + i + '">'
        + avatar
        + '<span class="gs-row-txt">'
          + '<span class="gs-row-title">' + gsEsc(e.title) + '</span>'
          + (e.sub ? '<span class="gs-row-sub">' + gsEsc(e.sub) + '</span>' : '')
        + '</span>'
        + (e.type ? '<span class="gs-row-type">' + gsEsc(e.type) + '</span>' : '')
      + '</button>';
    }).join('');
  }
  // Delegate row events to #gs-body so listeners survive re-renders.
  function gsBodyClick(e){
    var row = e.target && e.target.closest ? e.target.closest('.gs-row') : null;
    if(!row) return;
    gsGo(+row.getAttribute('data-i'));
  }
  function gsBodyMouseOver(e){
    var row = e.target && e.target.closest ? e.target.closest('.gs-row') : null;
    if(!row) return;
    var i = +row.getAttribute('data-i');
    if(i === _gsSel) return;
    _gsSel = i;
    // In-place class toggle — do NOT re-render (that would kill the row mid-click).
    var body = document.getElementById('gs-body'); if(!body) return;
    var all = body.querySelectorAll('.gs-row');
    for(var k = 0; k < all.length; k++) all[k].classList.toggle('on', k === i);
  }

  function gsScrollSel(){
    var body = document.getElementById('gs-body'); if(!body) return;
    var row = body.querySelector('.gs-row.on'); if(!row) return;
    var rr = row.getBoundingClientRect(), br = body.getBoundingClientRect();
    if(rr.top < br.top) row.scrollIntoView({block:'nearest'});
    else if(rr.bottom > br.bottom) row.scrollIntoView({block:'nearest'});
  }

  function gsGo(i){
    var e = _gsHits[i]; if(!e) return;
    closeGlobalSearch();
    if(e.lead){
      var tab = e.tab || 'all';
      if(typeof window.openContactPanel === 'function'){ window.openContactPanel(e.lead.no, tab); return; }
      window.location.href = '/coreconnect_leads_v83/coreconnect_leads_v83.html?lead=' + e.lead.no;
      return;
    }
    window.location.href = e.href;
  }

  function openGlobalSearch(){
    ensureGsBuilt();
    document.getElementById('gs-backdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
    var inp = document.getElementById('gs-input'); if(inp){ inp.value = ''; setTimeout(function(){ inp.focus(); }, 30); }
    _gsSel = 0; _gsHits = []; _gsPage = null;
    gsUpdatePages();
    gsRender();
  }
  function closeGlobalSearch(){
    var bd = document.getElementById('gs-backdrop'); if(bd) bd.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.openGlobalSearch = openGlobalSearch;
  window.closeGlobalSearch = closeGlobalSearch;

  function injectGlobalSearchIcon(){
    var bell = document.getElementById('header-bell'); if(!bell) return;
    if(document.getElementById('header-search')) return;
    var anchor = document.getElementById('header-theme') || document.getElementById('header-loanapp') || bell;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'header-bell';
    btn.id = 'header-search';
    btn.setAttribute('data-label', 'Search');
    btn.setAttribute('aria-label', 'Search');
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
    btn.onclick = function(e){ if(e) e.stopPropagation(); openGlobalSearch(); };
    anchor.parentNode.insertBefore(btn, anchor);
  }

  // Ctrl/Cmd+K global shortcut + Esc closer
  document.addEventListener('keydown', function(e){
    if((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)){
      e.preventDefault();
      openGlobalSearch();
      return;
    }
    if(e.key === 'Escape'){
      var bd = document.getElementById('gs-backdrop');
      if(bd && bd.classList.contains('open')) closeGlobalSearch();
    }
  });

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectGlobalSearchIcon);
  else injectGlobalSearchIcon();
})();
