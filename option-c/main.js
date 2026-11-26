/* Bur Oak Home Cleaning Co. · Option C "Playful checklist"
   Progressive enhancement only: every section reads fine without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  var motionOK = root.classList.contains('motion');

  /* ---------- Hand-drawn ticks: draw in when seen ---------- */
  function indexTicks(group) {
    var ticks = group.querySelectorAll('.tick');
    for (var i = 0; i < ticks.length; i++) ticks[i].style.setProperty('--i', i);
  }

  function drawNow(group) { group.classList.add('is-drawn'); }

  function redraw(group) {
    if (!motionOK) return;
    group.classList.add('no-trans');
    group.classList.remove('is-drawn');
    void group.offsetWidth; // flush so the reset is not animated
    group.classList.remove('no-trans');
    requestAnimationFrame(function () { requestAnimationFrame(function () { drawNow(group); }); });
  }

  var groups = document.querySelectorAll('.draw-group');
  groups.forEach(indexTicks);

  if (!motionOK || !('IntersectionObserver' in window)) {
    groups.forEach(drawNow);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !e.target.hidden) {
          drawNow(e.target);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    groups.forEach(function (g) { io.observe(g); });
  }

  /* ---------- Quote ticket ---------- */
  var widget = document.getElementById('quote-widget');
  if (widget) {
    var PRICES = { standard: [130, 160, 200], deep: [210, 270, 330], move: [240, 300, 360] };
    var SERVICE_LABEL = { standard: 'standard', deep: 'deep clean', move: 'move-in/out' };
    var FREQ_LABEL = { '0': 'one-time', '0.15': 'weekly', '0.10': 'every two weeks', '0.05': 'monthly' };
    var BED_LABEL = { '0': '1–2', '1': '3', '2': '4', custom: '5+' };
    var BATH_LABEL = { '0': '1', '1': '2', '2': '3+' };

    var priceEl = document.getElementById('q-price');
    var summaryEl = document.getElementById('q-summary');
    var noteEl = document.getElementById('q-note');
    var freqInputs = widget.querySelectorAll('input[name="q-freq"]');

    var val = function (name) {
      var el = widget.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : null;
    };
    var round5 = function (n) { return Math.round(n / 5) * 5; };
    var money = function (n) { return '$' + n; };

    widget.addEventListener('submit', function (e) { e.preventDefault(); });

    var last = '';
    function update() {
      var beds = val('q-beds');
      var baths = val('q-baths');
      var service = val('q-service');

      // Move-in/out is a one-time clean
      var isMove = service === 'move';
      freqInputs.forEach(function (input) {
        input.disabled = isMove && input.value !== '0';
        if (isMove && input.value === '0') input.checked = true;
      });
      var freq = val('q-freq');
      var discount = service === 'standard' ? parseFloat(freq) : 0;

      var summary = BED_LABEL[beds] + ' bed / ' + BATH_LABEL[baths] + ' bath, ' +
        SERVICE_LABEL[service] + ', ' + FREQ_LABEL[freq] +
        (discount > 0 ? ' (' + Math.round(discount * 100) + '% off)' : '');
      var note = '';
      var text;

      if (beds === 'custom') {
        text = 'Custom quote';
        priceEl.classList.add('is-custom');
        note = 'Larger homes get a custom quote. Homes over about 4,000 sq ft are priced after a look.';
      } else {
        priceEl.classList.remove('is-custom');
        var idx = Math.max(parseInt(beds, 10), parseInt(baths, 10));
        var low = Math.round(PRICES[service][idx] * (1 - discount));
        var high = round5(low * 1.25);
        text = money(low) + '–' + money(high);
        if (isMove) note = 'Move-in/out is a one-time clean, and the home must be empty.';
        else if (service === 'deep' && freq !== '0') note = 'Recurring discounts apply to standard cleans.';
      }

      if (priceEl.textContent !== text) priceEl.textContent = text;
      summaryEl.textContent = summary;
      noteEl.textContent = note;

      if (motionOK && text !== last && last !== '') {
        priceEl.classList.remove('bump');
        void priceEl.offsetWidth;
        priceEl.classList.add('bump');
      }
      last = text;
    }

    widget.addEventListener('change', update);
    update();

    // "Request this cleaning": carry the ticket choices into the form, then move there
    var requestBtn = document.getElementById('q-request');
    var BEDS_TO_FORM = { '0': '2', '1': '3', '2': '4', custom: '5 or more' };
    var BATHS_TO_FORM = { '0': '1', '1': '2', '2': '3' };
    var SERVICE_TO_FORM = { standard: 'Standard', deep: 'Deep', move: 'Move-in/out' };
    var FREQ_TO_FORM = { '0': 'One-time', '0.15': 'Weekly', '0.10': 'Every two weeks', '0.05': 'Monthly' };
    var setSelect = function (id, value) {
      var el = document.getElementById(id);
      if (el && value) el.value = value;
    };
    if (requestBtn) {
      requestBtn.addEventListener('click', function (e) {
        var target = document.getElementById('quote');
        if (!target) return;
        e.preventDefault();
        setSelect('f-beds', BEDS_TO_FORM[val('q-beds')]);
        setSelect('f-baths', BATHS_TO_FORM[val('q-baths')]);
        setSelect('f-service', SERVICE_TO_FORM[val('q-service')]);
        setSelect('f-freq', FREQ_TO_FORM[val('q-freq')]);
        var note = document.getElementById('prefill-note');
        if (note) note.textContent = 'We filled in your home details from the quote. Change anything you like.';
        target.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'start' });
        var first = document.getElementById('f-name');
        if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, motionOK ? 450 : 0);
        if (history.replaceState) history.replaceState(null, '', '#quote');
      });
    }
  }

  /* ---------- Checklist tabs ---------- */
  var tablist = document.querySelector('.cl-tabs');
  if (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

    function select(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
      });
      if (focus) tabs[i].focus();
      redraw(panels[i]);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (e) {
        var n = tabs.length, next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % n;
        else if (e.key === 'ArrowLeft') next = (i - 1 + n) % n;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = n - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });

    // initial state without animation of hidden panels
    panels.forEach(function (p, j) { p.hidden = j !== 0; });
  }

  /* ---------- Quote form (preview only) ---------- */
  var form = document.getElementById('quote-form');
  if (form) {
    var submit = document.getElementById('f-submit');
    var status = document.getElementById('form-status');
    if (submit) submit.disabled = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var trap = form.querySelector('[name="company_website"]');
      if (trap && trap.value) return; // bot filled the honeypot
      status.textContent = 'Preview only. Nothing was sent.';
      status.classList.add('is-shown');
    });
  }
})();
