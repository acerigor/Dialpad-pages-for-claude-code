/* ============================================================================
   Unified Quick-Dial dialer — single source of truth for the dialer panel.
   Include AFTER shared/leads-comms.js and after the page's own inline script,
   near the end of <body>. It overrides the window-level dialer handlers so the
   markup's onclick="toggleDialer()/dialerKey()/initiateCall()/..." all route here.

   Contacts shown = CCLeads.LEADS (Leads) + CCLeads.TEAM (Team) + shared contacts
   from the Contacts page (cc_contacts where shared:true). The dialer panel markup
   is already identical across pages, so no markup changes are required (only a
   couple of onclick aliases handled below: sortDialerContacts/toggleDialerSort).
   ========================================================================== */
(function(){
  'use strict';

  // ── state ──
  var dialerOpen = false;
  var dialerNumber = '';
  var dialerContactName = '';
  var dialerContactAv = '';
  var dialerContactColor = '';
  var isCalling = false;
  var isMuted = false;
  var callTimer = null;
  var callSeconds = 0;
  var dialerSortAsc = true;
  var dialerMatchQuery = { digits: '', text: '' };
  var dialerMatchedEntry = null;

  var CT_PALETTE = ['#4f7cff','#22c88a','#f5a623','#e85555','#a78bfa','#2dd4bf','#ec4899','#0ea5e9'];

  function $(id){ return document.getElementById(id); }
  function ini(name){
    var p = String(name||'').trim().split(/\s+/);
    return ((((p[0]||'')[0])||'') + (((p[1]||'')[0])||'')).toUpperCase() || '?';
  }
  function contactColor(id){
    var n = 0; String(id||'').split('').forEach(function(ch){ n = (n + ch.charCodeAt(0)) % CT_PALETTE.length; });
    return CT_PALETTE[n];
  }
  function esc(s){ return String(s==null?'':s).replace(/'/g, "\\'"); }

  // ── data ──
  function getSharedContacts(){
    try{
      var arr = JSON.parse(localStorage.getItem('cc_contacts')||'[]');
      return Array.isArray(arr) ? arr.filter(function(c){ return c && c.shared && c.phone; }) : [];
    }catch(e){ return []; }
  }
  function getDialerDirectory(){
    var LEADS = (window.CCLeads && window.CCLeads.LEADS) || [];
    var TEAM  = (window.CCLeads && window.CCLeads.TEAM)  || [];
    var leadEntries = LEADS.filter(function(l){ return l.phone; })
      .map(function(l){ return { name: l.name, phone: l.phone, av: ini(l.name), color: l.ac || '#4f7cff', kind: 'lead' }; });
    var userEntries = TEAM.filter(function(u){ return u.phone; })
      .map(function(u){ return { name: u.name, phone: u.phone, av: u.key || ini(u.name), color: u.color || '#4f7cff', kind: 'user' }; });
    var contactEntries = getSharedContacts()
      .map(function(c){ return { name: c.name, phone: c.phone, av: ini(c.name), color: contactColor(c.id), kind: 'contact' }; });
    return { leads: leadEntries, users: userEntries, contacts: contactEntries };
  }
  function getFilteredDialerEntries(){
    var dir = getDialerDirectory();
    var d = dialerMatchQuery.digits;
    var t = (dialerMatchQuery.text || '').toLowerCase().trim();
    if(!d && !t) return dir;
    function match(entry){
      if(d){ return (entry.phone || '').replace(/\D/g,'').startsWith(d); }
      if(t){ return entry.name.toLowerCase().includes(t); }
      return true;
    }
    return { leads: dir.leads.filter(match), users: dir.users.filter(match), contacts: dir.contacts.filter(match) };
  }

  // ── render ──
  function renderDialerContacts(){
    var list = $('dialer-contacts-list');
    if(!list) return;
    var hits = getFilteredDialerEntries();
    var leadHits = hits.leads, userHits = hits.users, contactHits = hits.contacts;
    var sortFn = function(a,b){ return dialerSortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name); };
    leadHits.sort(sortFn); userHits.sort(sortFn); contactHits.sort(sortFn);

    var hasQuery = !!(dialerMatchQuery.digits || dialerMatchQuery.text);
    var totalHits = leadHits.length + userHits.length + contactHits.length;
    if(hasQuery && totalHits === 0){
      list.innerHTML = '<div class="dialer-no-match">No matches</div>';
      updateDialerMatchBar(null);
      return;
    }
    function renderRow(c, isFirstMatch){
      var cls = 'dialer-contact' + (isFirstMatch ? ' dialer-contact-firstmatch' : '');
      return '<div class="'+cls+'" onclick="callDialerContact(\''+esc(c.phone)+'\',\''+esc(c.name)+'\',\''+esc(c.av)+'\',\''+esc(c.color)+'\')">'+
        '<div class="dc-av" style="background:'+c.color+';">'+c.av+'</div>'+
        '<div><div class="dc-name">'+c.name+'</div><div class="dc-num">'+c.phone+'</div></div>'+
      '</div>';
    }
    var highlightFirst = !!dialerMatchQuery.text && !dialerContactName;
    var html = '';
    if(leadHits.length){
      if(userHits.length || hasQuery) html += '<div class="dialer-section-header">Leads</div>';
      html += leadHits.map(function(c,i){ return renderRow(c, highlightFirst && i===0); }).join('');
    }
    if(userHits.length){
      if(leadHits.length || hasQuery) html += '<div class="dialer-section-header">Team</div>';
      html += userHits.map(function(c,i){ return renderRow(c, highlightFirst && leadHits.length===0 && i===0); }).join('');
    }
    if(contactHits.length){
      if(leadHits.length || userHits.length || hasQuery) html += '<div class="dialer-section-header">Contacts</div>';
      html += contactHits.map(function(c,i){ return renderRow(c, highlightFirst && leadHits.length===0 && userHits.length===0 && i===0); }).join('');
    }
    list.innerHTML = html;

    if(hasQuery && totalHits === 1){ updateDialerMatchBar(leadHits[0] || userHits[0] || contactHits[0]); }
    else { updateDialerMatchBar(null); }
  }

  function updateDialerMatchBar(entry){
    var bar = $('dialer-contact-bar');
    if(!bar) return;
    if(!entry){ if(!dialerContactName) bar.style.display = 'none'; return; }
    bar.style.display = 'block';
    if($('dialer-contact-av')){ $('dialer-contact-av').textContent = entry.av; $('dialer-contact-av').style.background = entry.color; }
    if($('dialer-contact-name')) $('dialer-contact-name').textContent = entry.name;
    if($('dialer-contact-num'))  $('dialer-contact-num').textContent  = entry.phone;
    dialerMatchedEntry = entry;
  }

  function updateDialerDisplay(){
    var el = $('dialer-number'); if(!el) return;
    if(dialerNumber){
      var d = dialerNumber.replace(/\D/g,'');
      var fmt = d;
      if(d.length > 6) fmt = '(' + d.slice(0,3) + ') ' + d.slice(3,6) + '-' + d.slice(6,10);
      else if(d.length > 3) fmt = '(' + d.slice(0,3) + ') ' + d.slice(3);
      el.textContent = fmt || dialerNumber;
      el.style.fontSize = dialerNumber.length > 12 ? '18px' : '24px';
    } else {
      el.innerHTML = '<span class="dialer-number-placeholder">Enter number…</span>';
    }
  }
  function formatPhoneDisplay(num){
    var d = String(num||'').replace(/\D/g,'');
    if(d.length === 10) return '(' + d.slice(0,3) + ') ' + d.slice(3,6) + '-' + d.slice(6);
    return num;
  }

  // ── interactions ──
  function toggleDialer(){
    dialerOpen = !dialerOpen;
    var panel = $('dialer-panel'); if(panel) panel.classList.toggle('open', dialerOpen);
    var tab = $('dialer-tab'); if(tab) tab.style.display = dialerOpen ? 'none' : 'flex';
    if(dialerOpen) renderDialerContacts();
  }
  function dialerKey(k){
    if(isCalling) return;
    dialerNumber += k;
    var inp = $('dialer-name-input'); if(inp) inp.value = dialerNumber;
    dialerMatchQuery = { digits: dialerNumber.replace(/\D/g,''), text: '' };
    updateDialerDisplay(); renderDialerContacts();
  }
  function dialerBackspace(){
    if(isCalling) return;
    dialerNumber = dialerNumber.slice(0,-1);
    var inp = $('dialer-name-input'); if(inp) inp.value = dialerNumber;
    dialerMatchQuery = { digits: dialerNumber.replace(/\D/g,''), text: '' };
    updateDialerDisplay(); renderDialerContacts();
  }
  function dialerInputChanged(v){
    v = v || '';
    var digits = v.replace(/\D/g,'');
    var letters = v.replace(/[\d\s\-\(\)\.+]/g,'');
    if(letters.length > 0){ dialerNumber = ''; dialerMatchQuery = { digits:'', text:v }; }
    else { dialerNumber = digits; dialerMatchQuery = { digits:digits, text:'' }; }
    updateDialerDisplay(); renderDialerContacts();
  }
  function clearDialerContact(){
    dialerContactName=''; dialerContactAv=''; dialerContactColor=''; dialerNumber='';
    dialerMatchQuery = { digits:'', text:'' }; dialerMatchedEntry = null;
    if($('dialer-contact-bar')) $('dialer-contact-bar').style.display = 'none';
    var inp = $('dialer-name-input'); if(inp) inp.value = '';
    updateDialerDisplay(); renderDialerContacts();
  }
  function loadRecentCall(num, name, av, color){
    dialerNumber = String(num||'').replace(/\D/g,'');
    dialerContactName = name; dialerContactAv = av; dialerContactColor = color;
    var bar = $('dialer-contact-bar'); if(bar) bar.style.display = 'block';
    if($('dialer-contact-av')){ $('dialer-contact-av').textContent = av; $('dialer-contact-av').style.background = color; }
    if($('dialer-contact-name')) $('dialer-contact-name').textContent = name;
    if($('dialer-contact-num'))  $('dialer-contact-num').textContent  = num;
    var inp = $('dialer-name-input'); if(inp) inp.value = name;
    updateDialerDisplay();
  }
  // Some pages auto-call on row click; keep both behaviours available.
  function callDialerContact(num, name, av, color){ loadRecentCall(num, name, av, color); initiateCall(); }
  function sortDialerContacts(){
    dialerSortAsc = !dialerSortAsc;
    if($('dialer-sort-label')) $('dialer-sort-label').textContent = dialerSortAsc ? 'A–Z' : 'Z–A';
    renderDialerContacts();
  }
  function toggleKeypad(){
    var kp = $('dialer-keypad'); if(!kp) return;
    var collapsed = kp.style.display === 'none';
    kp.style.display = collapsed ? 'grid' : 'none';
    if($('dialer-keypad-toggle-label')) $('dialer-keypad-toggle-label').textContent = collapsed ? 'Hide Keypad' : 'Show Keypad';
    if($('dialer-keypad-chevron')) $('dialer-keypad-chevron').style.transform = collapsed ? 'rotate(0deg)' : 'rotate(180deg)';
  }
  function initiateCall(){
    var num = dialerNumber || '', name = dialerContactName, av = dialerContactAv, color = dialerContactColor;
    if(!num && dialerMatchQuery.text){
      var h = getFilteredDialerEntries();
      var first = h.leads[0] || h.users[0] || h.contacts[0];
      if(first){ num = first.phone.replace(/\D/g,''); name = first.name; av = first.av; color = first.color; }
    }
    if(!num) return;
    isCalling = true; callSeconds = 0;
    var panel = $('dialer-panel'); if(panel) panel.classList.add('in-call');
    var displayName = name || formatPhoneDisplay(num);
    var displayAv = av || num.slice(-2);
    var displayCol = color || 'var(--ac)';
    if($('dialer-main')) $('dialer-main').style.display = 'none';
    if($('dialer-contact-bar')) $('dialer-contact-bar').style.display = 'none';
    var overlay = $('dialer-calling-overlay'); if(overlay) overlay.classList.add('active');
    if($('calling-av')){ $('calling-av').textContent = displayAv; $('calling-av').style.background = displayCol; }
    if($('calling-name')) $('calling-name').textContent = displayName;
    if($('calling-status')) $('calling-status').textContent = 'Calling…';
    if($('calling-timer')) $('calling-timer').style.display = 'none';
    setTimeout(function(){
      if(!isCalling) return;
      if($('calling-status')) $('calling-status').textContent = 'Connected';
      if($('calling-timer')) $('calling-timer').style.display = 'block';
      callTimer = setInterval(function(){
        callSeconds++;
        var m = Math.floor(callSeconds/60), s = callSeconds % 60;
        if($('calling-timer')) $('calling-timer').textContent = m + ':' + String(s).padStart(2,'0');
      }, 1000);
    }, 2500);
  }
  function endCall(){
    isCalling = false;
    if(callTimer){ clearInterval(callTimer); callTimer = null; }
    if($('dialer-panel')) $('dialer-panel').classList.remove('in-call');
    if($('dialer-calling-overlay')) $('dialer-calling-overlay').classList.remove('active');
    if($('dialer-main')) $('dialer-main').style.display = 'flex';
    var cbar = $('dialer-contact-bar'); if(cbar && dialerContactName) cbar.style.display = 'block';
    isMuted = false;
    if($('dialer-mute-btn')) $('dialer-mute-btn').classList.remove('muted');
    if($('calling-mute')) $('calling-mute').classList.remove('muted');
  }
  function toggleMute(){
    isMuted = !isMuted;
    if($('dialer-mute-btn')) $('dialer-mute-btn').classList.toggle('muted', isMuted);
    if($('calling-mute')) $('calling-mute').classList.toggle('muted', isMuted);
  }

  // Back-compat shims so older pages' markup / "call back" hooks keep working:
  function showDialerContactBar(a, b, c, d){
    // Older signature variants: (num,name,av,color) OR a contact object.
    if(a && typeof a === 'object'){ loadRecentCall(a.num||a.phone, a.name, a.av, a.clr||a.ac||a.color); }
    else { loadRecentCall(a, b, c, d); }
  }
  function pickContact(name, num, av, ac){ loadRecentCall(num, name, av, ac); }
  function pickDialerContact(){ /* old index-based picker — superseded by rendered rows */ }
  function toggleDialerSort(){ sortDialerContacts(); }
  function closeDialerPanel(){ if(dialerOpen) toggleDialer(); else { var p=$('dialer-panel'); if(p) p.classList.remove('open'); dialerOpen=false; } }

  // ── expose on window (overrides any page-inline versions of the same names) ──
  var api = {
    toggleDialer: toggleDialer, dialerKey: dialerKey, dialerBackspace: dialerBackspace,
    dialerInputChanged: dialerInputChanged, clearDialerContact: clearDialerContact,
    loadRecentCall: loadRecentCall, callDialerContact: callDialerContact,
    sortDialerContacts: sortDialerContacts, toggleDialerSort: toggleDialerSort,
    toggleKeypad: toggleKeypad, initiateCall: initiateCall, endCall: endCall, toggleMute: toggleMute,
    renderDialerContacts: renderDialerContacts, updateDialerMatchBar: updateDialerMatchBar,
    updateDialerDisplay: updateDialerDisplay, showDialerContactBar: showDialerContactBar,
    pickContact: pickContact, pickDialerContact: pickDialerContact, closeDialerPanel: closeDialerPanel
  };
  Object.keys(api).forEach(function(k){ window[k] = api[k]; });

  // Inject the canonical dialer stylesheet so every page's dialer looks identical
  // (overrides any page-local dialer CSS since it's appended after it).
  (function injectCss(){
    try{
      var me = document.currentScript;
      if(!me){ var ss = document.scripts; for(var i=ss.length-1;i>=0;i--){ if(/dialer\.js/.test(ss[i].src)){ me = ss[i]; break; } } }
      var href = me ? me.src.replace(/dialer\.js(\?.*)?$/, 'dialer.css') : '../shared/dialer.css';
      if(document.querySelector('link[data-cc-dialer-css]')) return;
      var link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = href; link.setAttribute('data-cc-dialer-css','1');
      document.head.appendChild(link);
    }catch(e){}
  })();

  // initial render once the DOM + CCLeads are ready
  function boot(){
    try{
      var sl = $('dialer-sort-label'); if(sl && !dialerMatchedEntry) sl.textContent = dialerSortAsc ? 'Sort' : 'Z–A';
      renderDialerContacts();
    }catch(e){}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
