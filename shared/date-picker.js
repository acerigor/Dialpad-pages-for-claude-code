/* Shared calendar date picker — window.CCDatePicker
 *
 * Usage:
 *   CCDatePicker.open({
 *     anchor:   HTMLElement,
 *     value:    'MM/DD/YYYY',       // seed date, defaults to today
 *     onChange: function(v){ ... }, // fires when a day is picked ('MM/DD/YYYY')
 *   });
 *   CCDatePicker.close();
 *   CCDatePicker.isOpen();
 *
 * Depends on:
 *   - shared/contact-panel.css   (.assign-popup chrome)
 *   - shared/date-picker.css     (.cc-dp-* layout)
 */
(function(w){
  var POP_ID = 'cc-date-pop';
  var PREV_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 6 9 12 15 18"/></svg>';
  var NEXT_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>';
  var WDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  var state = {
    anchor: null, onChange: null,
    selected: null,        // Date | null
    viewYear: 0, viewMonth: 0, // month currently displayed
    open: false
  };

  function pad2(n){ return (n<10?'0':'')+n; }
  function fmtDate(d){ return pad2(d.getMonth()+1)+'/'+pad2(d.getDate())+'/'+d.getFullYear(); }
  function parseDate(s){
    if(!s) return null;
    var m = String(s).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(!m) return null;
    var d = new Date(parseInt(m[3],10), parseInt(m[1],10)-1, parseInt(m[2],10));
    return isNaN(d.getTime()) ? null : d;
  }
  function sameDay(a,b){ return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

  function ensure(){
    var pop = document.getElementById(POP_ID);
    if(pop) return pop;
    pop = document.createElement('div');
    pop.id = POP_ID;
    pop.className = 'assign-popup cc-date-pop';
    pop.style.display = 'none';
    pop.innerHTML = ''
      + '<div class="cc-dp-head">'
      +   '<button class="cc-dp-nav" data-nav="prev" aria-label="Previous month">'+PREV_SVG+'</button>'
      +   '<div class="cc-dp-title" id="cc-dp-title"></div>'
      +   '<button class="cc-dp-nav" data-nav="next" aria-label="Next month">'+NEXT_SVG+'</button>'
      + '</div>'
      + '<div class="cc-dp-wdays">' + WDAYS.map(function(d){ return '<span class="cc-dp-wday">'+d+'</span>'; }).join('') + '</div>'
      + '<div class="cc-dp-grid" id="cc-dp-grid"></div>';
    document.body.appendChild(pop);

    pop.querySelectorAll('.cc-dp-nav').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var dir = btn.getAttribute('data-nav') === 'next' ? 1 : -1;
        state.viewMonth += dir;
        if(state.viewMonth < 0){ state.viewMonth = 11; state.viewYear--; }
        else if(state.viewMonth > 11){ state.viewMonth = 0; state.viewYear++; }
        render();
      });
    });
    return pop;
  }

  function render(){
    var pop = ensure();
    var title = pop.querySelector('#cc-dp-title');
    title.textContent = MONTHS[state.viewMonth] + ' ' + state.viewYear;

    var grid = pop.querySelector('#cc-dp-grid');
    var first = new Date(state.viewYear, state.viewMonth, 1);
    var startDow = first.getDay();                    // 0 = Sun
    var daysInMonth = new Date(state.viewYear, state.viewMonth+1, 0).getDate();
    var daysInPrev  = new Date(state.viewYear, state.viewMonth, 0).getDate();
    var today = new Date();
    var cells = [];
    // Prev month tail
    for(var i=startDow-1; i>=0; i--){
      cells.push({ y:(state.viewMonth===0?state.viewYear-1:state.viewYear), m:(state.viewMonth===0?11:state.viewMonth-1), d:daysInPrev - i, other:true });
    }
    // Current month
    for(var d=1; d<=daysInMonth; d++){
      cells.push({ y:state.viewYear, m:state.viewMonth, d:d, other:false });
    }
    // Next month head — pad to 42 (6 rows × 7 cols)
    var nextD = 1;
    while(cells.length < 42){
      cells.push({ y:(state.viewMonth===11?state.viewYear+1:state.viewYear), m:(state.viewMonth===11?0:state.viewMonth+1), d:nextD++, other:true });
    }

    grid.innerHTML = cells.map(function(c){
      var dt = new Date(c.y, c.m, c.d);
      var cls = 'cc-dp-cell';
      if(c.other) cls += ' other-month';
      if(sameDay(dt, today)) cls += ' today';
      if(sameDay(dt, state.selected)) cls += ' selected';
      return '<button class="'+cls+'" data-y="'+c.y+'" data-m="'+c.m+'" data-d="'+c.d+'">'+c.d+'</button>';
    }).join('');

    grid.querySelectorAll('.cc-dp-cell').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.stopPropagation();
        var y = parseInt(btn.getAttribute('data-y'),10);
        var m = parseInt(btn.getAttribute('data-m'),10);
        var d = parseInt(btn.getAttribute('data-d'),10);
        var picked = new Date(y, m, d);
        state.selected = picked;
        var val = fmtDate(picked);
        if(typeof state.onChange === 'function') state.onChange(val);
        w.CCDatePicker.close();
      });
    });
  }

  function positionUnder(anchor){
    var pop = ensure();
    var r = anchor.getBoundingClientRect();
    var popW = 280;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - popW - 8));
    pop.style.left = left + 'px';
    pop.style.top  = (r.bottom + 6) + 'px';
  }

  w.CCDatePicker = {
    open: function(o){
      o = o || {};
      if(typeof o.disabled === 'function' && o.disabled()) return;
      if(!o.anchor) return;
      var pop = ensure();
      if(state.open && state.anchor === o.anchor){ this.close(); return; }
      var seed = parseDate(o.value) || new Date();
      state.selected = parseDate(o.value);
      state.viewYear = seed.getFullYear();
      state.viewMonth = seed.getMonth();
      state.onChange = o.onChange || null;
      state.anchor = o.anchor;
      positionUnder(o.anchor);
      render();
      pop.style.display = 'block';
      state.open = true;
    },
    close: function(){
      var pop = document.getElementById(POP_ID);
      if(pop) pop.style.display = 'none';
      state.open = false;
      state.anchor = null;
      state.onChange = null;
    },
    isOpen: function(){ return state.open; }
  };

  document.addEventListener('mousedown', function(e){
    if(!state.open) return;
    if(e.target.closest && e.target.closest('#'+POP_ID)) return;
    if(state.anchor && state.anchor.contains && state.anchor.contains(e.target)) return;
    w.CCDatePicker.close();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && state.open) w.CCDatePicker.close();
  });
  window.addEventListener('resize', function(){
    if(state.open && state.anchor) positionUnder(state.anchor);
  });
})(window);
