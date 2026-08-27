/* CoreConnect — shared auth helper */
(function(){
  var TOKEN_KEY = 'cc_token';
  var USER_KEY  = 'cc_user';

  function getToken(){ return localStorage.getItem(TOKEN_KEY) || ''; }
  function setToken(t){ localStorage.setItem(TOKEN_KEY, t); }
  function clearToken(){ localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }

  function getUser(){
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch(e){ return null; }
  }
  function setUser(u){ localStorage.setItem(USER_KEY, JSON.stringify(u)); }

  function authHeaders(){
    var t = getToken();
    return t ? { 'Authorization': 'Bearer ' + t } : {};
  }

  function requireAuth(){
    if(!getToken()){
      window.location.href = '/login/login.html';
      return false;
    }
    return true;
  }

  function logout(){
    clearToken();
    localStorage.removeItem('cc_team');
    window.location.href = '/login/login.html';
  }

  /* ── Account popup ── */
  var _popupEl = null;

  function _injectPopupCSS(){
    if(document.getElementById('cc-auth-popup-css')) return;
    var s = document.createElement('style');
    s.id = 'cc-auth-popup-css';
    s.textContent =
      '.cc-acct-popup{position:fixed;bottom:60px;left:56px;min-width:200px;'+
      'background:var(--sur2);border:1px solid var(--brd2);border-radius:12px;'+
      'box-shadow:var(--shadow);z-index:9999;padding:6px 0;opacity:0;transform:translateY(8px);'+
      'pointer-events:none;transition:opacity .15s,transform .15s;}'+
      '.cc-acct-popup.open{opacity:1;transform:translateY(0);pointer-events:auto;}'+
      '.cc-acct-popup-header{padding:12px 16px;border-bottom:1px solid var(--brd);display:flex;align-items:center;gap:10px;}'+
      '.cc-acct-popup-avatar{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;'+
      'justify-content:center;font-size:12px;font-weight:600;color:#fff;background:var(--gr);flex-shrink:0;}'+
      '.cc-acct-popup-info{overflow:hidden;}'+
      '.cc-acct-popup-name{font-size:13px;font-weight:600;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'+
      '.cc-acct-popup-role{font-size:11px;color:var(--mu);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'+
      '.cc-acct-popup-item{display:flex;align-items:center;gap:10px;padding:9px 16px;cursor:pointer;'+
      'font-size:13px;color:var(--tx);transition:background .1s;font-family:var(--font);}'+
      '.cc-acct-popup-item:hover{background:var(--hover);}'+
      '.cc-acct-popup-item svg{width:16px;height:16px;stroke:currentColor;fill:none;stroke-width:1.8;flex-shrink:0;}'+
      '.cc-acct-popup-divider{height:1px;background:var(--brd);margin:4px 0;}'+
      '.cc-acct-popup-item.logout{color:var(--rd);}'+
      '.cc-acct-popup-item.logout:hover{background:rgba(232,85,85,.08);}';
    document.head.appendChild(s);
  }

  function _createPopup(){
    if(_popupEl) return _popupEl;
    _injectPopupCSS();
    var u = getUser() || {};
    var div = document.createElement('div');
    div.className = 'cc-acct-popup';
    div.innerHTML =
      '<div class="cc-acct-popup-header">'+
        '<div class="cc-acct-popup-avatar">'+(u.initials||'?')+'</div>'+
        '<div class="cc-acct-popup-info">'+
          '<div class="cc-acct-popup-name">'+(u.name||'User')+'</div>'+
          '<div class="cc-acct-popup-role">'+(u.role||'agent')+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="cc-acct-popup-item" data-action="profile">'+
        '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'+
        'My Profile'+
      '</div>'+
      '<div class="cc-acct-popup-divider"></div>'+
      '<div class="cc-acct-popup-item logout" data-action="logout">'+
        '<svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'+
        'Log out'+
      '</div>';
    div.addEventListener('click', function(e){
      var item = e.target.closest('[data-action]');
      if(!item) return;
      var action = item.getAttribute('data-action');
      if(action === 'profile'){
        var key = u.initials || '';
        window.location.href = '/Settings/User_profile/User_profile.html?key=' + encodeURIComponent(key);
      } else if(action === 'logout'){
        logout();
      }
      _hidePopup();
    });
    document.body.appendChild(div);
    _popupEl = div;
    return div;
  }

  function _showPopup(){
    var p = _createPopup();
    p.classList.add('open');
  }

  function _hidePopup(){
    if(_popupEl) _popupEl.classList.remove('open');
  }

  function _togglePopup(e){
    e.stopPropagation();
    var p = _createPopup();
    if(p.classList.contains('open')) _hidePopup();
    else _showPopup();
  }

  function syncAccountBadge(){
    var u = getUser();
    if(!u) return;
    var el = document.querySelector('.sb-account');
    if(!el) return;
    el.textContent = u.initials || '';
    el.removeAttribute('onclick');
    el.addEventListener('click', _togglePopup);
  }

  document.addEventListener('click', function(e){
    if(_popupEl && !_popupEl.contains(e.target) && !e.target.closest('.sb-account')){
      _hidePopup();
    }
  });

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', syncAccountBadge);
  } else {
    syncAccountBadge();
  }

  window.CCAuth = {
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    getUser: getUser,
    setUser: setUser,
    authHeaders: authHeaders,
    requireAuth: requireAuth,
    logout: logout,
    syncAccountBadge: syncAccountBadge
  };
})();
