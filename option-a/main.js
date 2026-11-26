/* Option A: instant quote widget, scroll reveal, preview-only form. No third-party code. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Instant quote (Sample prices from the approved table) ---------- */
  var PRICES = {
    standard: [130, 160, 200],
    deep: [210, 270, 330],
    move: [240, 300, 360]
  };
  var DISCOUNT = { once: 0, weekly: 0.15, biweekly: 0.10, monthly: 0.05 };
  var FREQ_LABEL = { once: 'one-time', weekly: 'weekly', biweekly: 'every two weeks', monthly: 'monthly' };
  var TYPE_LABEL = { standard: 'Standard clean', deep: 'Deep clean', move: 'Move-in/out clean' };
  var BED_LABEL = { '2': '1–2 bed', '3': '3 bed', '4': '4 bed', '5': '5+ bed' };
  var BATH_LABEL = { '1': '1 bath', '2': '2 bath', '3': '3 bath', '4': '4+ bath' };

  var widget = document.getElementById('quote-widget');
  var out = document.getElementById('price-out');
  var detail = document.getElementById('price-detail');
  var panel = out ? out.closest('.price-panel') : null;
  var live = document.getElementById('price-live');
  function announce(t) { if (live) live.textContent = t; }
  var shown = { lo: 130, hi: 165 };
  var raf = 0;

  function val(name) {
    var el = widget.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : '';
  }
  function money(n) { return '$' + Math.round(n); }
  function round5(n) { return Math.round(n / 5) * 5; }

  function compute() {
    var beds = val('w-beds'), baths = val('w-baths'), freq = val('w-freq'), type = val('w-type');
    var custom = beds === '5' || baths === '4';
    var tier = Math.max(Number(beds) - 2, Number(baths) - 1);
    tier = Math.min(Math.max(tier, 0), 2);
    var base = PRICES[type][tier];
    var discount = type === 'standard' ? DISCOUNT[freq] : 0;
    var lo = Math.round(base * (1 - discount));
    var hi = round5(lo * 1.25);
    return { beds: beds, baths: baths, freq: freq, type: type, custom: custom, lo: lo, hi: hi, discount: discount };
  }

  function renderRange(lo, hi) {
    out.innerHTML = money(lo) + '<span class="dash" aria-hidden="true">–</span><span class="visually-hidden"> to </span>' + money(hi);
  }

  function tween(toLo, toHi) {
    cancelAnimationFrame(raf);
    var fromLo = shown.lo, fromHi = shown.hi, t0 = performance.now(), dur = 520;
    function step(now) {
      var p = Math.min((now - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 4);
      renderRange(fromLo + (toLo - fromLo) * e, fromHi + (toHi - fromHi) * e);
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
  }

  function update(animate) {
    var q = compute();
    var size = BED_LABEL[q.beds] + ' / ' + BATH_LABEL[q.baths];

    if (q.custom) {
      cancelAnimationFrame(raf);
      out.innerHTML = '<span class="custom">Custom quote</span>';
      detail.textContent = 'Larger homes get a custom quote, like homes over about 4,000 sq ft. ' + size + '.';
      shown = { lo: 200, hi: 250 };
      if (animate) announce('Custom quote for larger homes. Sample, preview only.');
      return;
    }

    var line = TYPE_LABEL[q.type] + ', ' + size + ', ' + FREQ_LABEL[q.freq] + '.';
    detail.textContent = line;
    if (q.discount > 0) {
      var save = document.createElement('span');
      save.className = 'save';
      save.textContent = Math.round(q.discount * 100) + '% recurring discount';
      detail.appendChild(document.createTextNode(' '));
      detail.appendChild(save);
    } else if (q.type !== 'standard' && q.freq !== 'once') {
      detail.appendChild(document.createTextNode(' Recurring discounts apply to standard cleans.'));
    }

    if (animate && !reduce.matches) {
      tween(q.lo, q.hi);
      out.classList.remove('is-changing');
      panel.classList.remove('is-burst');
      void out.offsetWidth;
      out.classList.add('is-changing');
      panel.classList.add('is-burst');
    } else {
      renderRange(q.lo, q.hi);
    }
    shown = { lo: q.lo, hi: q.hi };
    if (animate) announce('Sample price range ' + money(q.lo) + ' to ' + money(q.hi) + ' per visit. ' + line + ' Preview only.');
  }

  if (widget && out && detail) {
    widget.addEventListener('change', function () { update(true); });
    widget.addEventListener('submit', function (e) { e.preventDefault(); });
    update(false);

    /* Carry widget choices into the booking form */
    var cta = document.getElementById('widget-cta');
    if (cta) {
      cta.addEventListener('click', function () {
        var q = compute();
        var map = { 'f-beds': q.beds, 'f-baths': q.baths, 'f-type': q.type, 'f-freq': q.freq };
        Object.keys(map).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = map[id];
        });
      });
    }
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce.matches) {
    // stagger siblings
    var groups = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      var i = groups.get(parent) || 0;
      el.style.setProperty('--d', (i * 80) + 'ms');
      groups.set(parent, i + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Preview-only form ---------- */
  var form = document.getElementById('lead-form');
  var submit = document.getElementById('lead-submit');
  var status = document.getElementById('form-status');
  if (form && submit && status) {
    submit.disabled = false;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      window.setTimeout(function () { status.textContent = 'Preview only. Nothing was sent.'; }, 50);
    });
  }
})();
