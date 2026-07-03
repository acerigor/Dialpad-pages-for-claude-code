/* Shared AM/PM time picker — window.CCTimePicker
 *
 * Usage:
 *   CCTimePicker.open({
 *     anchor:  HTMLElement,                    // pill/button to position under
 *     value:   {h:1-12, m:0-59, ap:'AM'|'PM'}, // seed values (defaults to 12:00 AM)
 *     onChange:function(v){ ... },             // fires on every column step
 *     disabled:function(){ return bool; }      // optional gate — return true to no-op
 *   });
 *   CCTimePicker.close();
 *   CCTimePicker.isOpen();  // boolean
 *
 * Depends on:
 *   - shared/contact-panel.css   (for .assign-popup chrome)
 *   - shared/time-picker.css     (for .cc-tp-* layout)
 *   - design tokens from shared/app.css
 *
 * One shared popup is injected into <body> on first use. Only one picker is
 * open at a time app-wide.
 */
(function(w){
  var POP_ID = 'cc-time-pop';
  var UP_SVG   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"/></svg>';
  var DOWN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

  var state = {
    value: { h:12, m:0, ap:'AM' },
    onChange: null,
    anchor: null,
    open: false
  };

  function ensure(){
    var pop = document.getElementById(POP_ID);
    if(pop) return pop;
    pop = document.createElement('div');
    pop.id = POP_ID;
    pop.className = 'assign-popup cc-time-pop';
    pop.style.display = 'none';
    pop.innerHTML = ''
      + '<div class="cc-tp-head">'
      +   '<span class="cc-tp-col-lbl">Hr</span>'
      +   '<span class="cc-tp-col-lbl">Min</span>'
      +   '<span class="cc-tp-col-lbl">PM/AM</span>'
      + '</div>'
      + '<div class="cc-tp-body">'
      +   ['hh','mm','ap'].map(function(f, i){
            var upLbl   = (f==='ap') ? 'Toggle AM/PM' : (f==='hh' ? 'Increase hour' : 'Increase minute');
            var downLbl = (f==='ap') ? 'Toggle AM/PM' : (f==='hh' ? 'Decrease hour' : 'Decrease minute');
            return '<div class="cc-tp-col" data-field="'+f+'">'
              +   '<button class="cc-tp-btn" data-dir="1"  aria-label="'+upLbl+'">'+UP_SVG+'</button>'
              +   '<div class="cc-tp-val" data-field="'+f+'"></div>'
              +   '<button class="cc-tp-btn" data-dir="-1" aria-label="'+downLbl+'">'+DOWN_SVG+'</button>'
              + '</div>';
          }).join('')
      + '</div>';
    document.body.appendChild(pop);

    pop.querySelectorAll('.cc-tp-col').forEach(function(col){
      var field = col.getAttribute('data-field');
      col.addEventListener('wheel', function(e){
        e.preventDefault();
        step(field, e.deltaY < 0 ? 1 : -1);
      }, { passive: false });
      col.querySelectorAll('.cc-tp-btn').forEach(function(btn){
        btn.addEventListener('click', function(){
          step(field, parseInt(btn.getAttribute('data-dir'), 10));
        });
      });
    });
    return pop;
  }

  function render(){
    var pop = ensure();
    pop.querySelector('.cc-tp-val[data-field="hh"]').textContent = String(state.value.h);
    pop.querySelector('.cc-tp-val[data-field="mm"]').textContent = (state.value.m < 10 ? '0' : '') + state.value.m;
    pop.querySelector('.cc-tp-val[data-field="ap"]').textContent = state.value.ap;
  }

  function step(field, dir){
    if(field === 'hh'){
      var h = state.value.h + dir;
      if(h > 12) h = 1; else if(h < 1) h = 12;
      state.value.h = h;
    } else if(field === 'mm'){
      var m = state.value.m + dir;
      if(m > 59) m = 0; else if(m < 0) m = 59;
      state.value.m = m;
    } else if(field === 'ap'){
      state.value.ap = (state.value.ap === 'AM') ? 'PM' : 'AM';
    }
    render();
    if(typeof state.onChange === 'function'){
      state.onChange({ h: state.value.h, m: state.value.m, ap: state.value.ap });
    }
  }

  function positionUnder(anchor){
    var pop = ensure();
    var r = anchor.getBoundingClientRect();
    var popW = 280;
    var left = Math.max(8, Math.min(r.left, window.innerWidth - popW - 8));
    pop.style.left = left + 'px';
    pop.style.top  = (r.bottom + 6) + 'px';
  }

  w.CCTimePicker = {
    open: function(o){
      o = o || {};
      if(typeof o.disabled === 'function' && o.disabled()) return;
      if(!o.anchor) return;
      var pop = ensure();
      if(state.open && state.anchor === o.anchor){ this.close(); return; }
      state.value    = Object.assign({ h:12, m:0, ap:'AM' }, o.value || {});
      state.onChange = o.onChange || null;
      state.anchor   = o.anchor;
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
    w.CCTimePicker.close();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && state.open) w.CCTimePicker.close();
  });
  window.addEventListener('resize', function(){
    if(state.open && state.anchor) positionUnder(state.anchor);
  });
})(window);
