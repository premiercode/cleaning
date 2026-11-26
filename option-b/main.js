/* Bur Oak Home Cleaning Co. | Option B
   Estimate card (Sample prices), form preview handling, slow scroll fades. */
(function () {
  'use strict';

  /* ---------- Sample price table (approved-facts.md, section 2) ---------- */
  // Rows: 2 bed / 1 bath, 3 bed / 2 bath, 4 bed / 3 bath
  var PRICES = {
    standard: [130, 160, 200],
    deep: [210, 270, 330],
    move: [240, 300, 360]
  };
  // Recurring discount off the standard price only
  var DISCOUNT = { once: 0, weekly: 0.15, biweekly: 0.10, monthly: 0.05 };
  var FREQ_LABEL = { once: 'One-time visit', weekly: 'Per visit, weekly', biweekly: 'Per visit, every two weeks', monthly: 'Per visit, monthly' };
  var BED_ROW = { '2': 0, '3': 1, '4': 2 };
  var BATH_ROW = { '1': 0, '2': 1, '3': 2 };

  var form = document.getElementById('estimate-form');
  var rangeEl = document.getElementById('est-range');
  var detailEl = document.getElementById('est-detail');

  function checked(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function money(n) { return '$' + Math.round(n); }

  function estimate() {
    var beds = checked('est-beds');
    var baths = checked('est-baths');
    var type = checked('est-type');
    var freq = form.querySelector('#est-freq').value;

    // Larger than the Sample table: custom quote, no price shown
    if (beds === '5' || baths === '4') {
      return { text: 'Custom quote', detail: 'Homes larger than 4 bedrooms and 3 bathrooms are quoted individually and confirmed before the first visit.' };
    }

    // The larger of the two picks the closest row in the Sample table
    var row = Math.max(BED_ROW[beds], BATH_ROW[baths]);
    var base = PRICES[type][row];
    var discount = type === 'standard' ? DISCOUNT[freq] : 0;
    var low = Math.round(base * (1 - discount));
    var high = Math.round(low * 1.25);

    var detail;
    if (type === 'move') {
      detail = 'One-time move-in or move-out clean. The home must be empty.';
    } else if (type === 'deep') {
      detail = (freq === 'once' ? 'One-time deep clean.' : FREQ_LABEL[freq] + '.') + ' Recurring discounts apply to standard cleans.';
    } else if (discount > 0) {
      detail = FREQ_LABEL[freq] + '. Includes the ' + Math.round(discount * 100) + '% recurring discount.';
    } else {
      detail = 'One-time standard clean.';
    }

    return { text: money(low) + ' to ' + money(high), detail: detail };
  }

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pending;

  function render() {
    var r = estimate();
    if (r.text === rangeEl.textContent && r.detail === detailEl.textContent) return;
    if (reduceMotion) {
      rangeEl.textContent = r.text;
      detailEl.textContent = r.detail;
      return;
    }
    // A quick, quiet crossfade; the number is still updated within a few frames
    clearTimeout(pending);
    rangeEl.classList.add('is-updating');
    pending = setTimeout(function () {
      rangeEl.textContent = r.text;
      detailEl.textContent = r.detail;
      rangeEl.classList.remove('is-updating');
    }, 120);
  }

  if (form) {
    form.addEventListener('change', render);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    var r0 = estimate();
    rangeEl.textContent = r0.text;
    detailEl.textContent = r0.detail;

    // Carry the estimate choices into the booking form
    var cta = document.getElementById('est-cta');
    if (cta) {
      cta.addEventListener('click', function () {
        var set = function (id, val) { var el = document.getElementById(id); if (el && val) el.value = val; };
        set('f-beds', checked('est-beds'));
        set('f-baths', checked('est-baths'));
        set('f-type', checked('est-type'));
        set('f-freq', form.querySelector('#est-freq').value);
        // Move focus to the first field after the jump
        setTimeout(function () {
          var first = document.getElementById('f-name');
          if (first) first.focus({ preventScroll: true });
        }, reduceMotion ? 0 : 500);
      });
    }
  }

  /* ---------- Booking form: preview only ---------- */
  var book = document.getElementById('book-form');
  var submit = document.getElementById('book-submit');
  var status = document.getElementById('book-status');
  if (book && submit) {
    submit.disabled = false;
    var dateInput = document.getElementById('f-date');
    if (dateInput) {
      var d = new Date();
      dateInput.min = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
    book.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      // Re-set the text so screen readers announce it every time
      setTimeout(function () { status.textContent = 'Preview only. Nothing was sent.'; }, 50);
    });
  }

  /* ---------- Slow fades on scroll (skipped under reduced motion) ---------- */
  var items = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();
