const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, '..', 'photographer-portfolio', 'website');

function extract(filename) {
  const content = fs.readFileSync(path.join(base, filename), 'utf8');
  const titleMatch = content.match(/<title>([\s\S]*?)<\/title>/);
  const mainMatch = content.match(/<main id="main">([\s\S]*?)<\/main>/);
  if (!titleMatch || !mainMatch) {
    throw new Error('Failed to extract from ' + filename);
  }
  return {
    title: titleMatch[1].trim(),
    html: mainMatch[1].trim()
  };
}

const pIndex = extract('index.html');
const pWork = extract('work.html');
const pAbout = extract('about.html');
const pServices = extract('services.html');
const pBooking = extract('booking.html');
const pContact = extract('contact.html');
const pDev = extract('developer.html');

const output = `/* ===================================================================
   Studio Pages Bundle & SPA View Engine
   Pre-rendered page templates & lifecycle hooks for zero-refresh,
   continuous background music navigation across all desktop & mobile views.
   =================================================================== */
(function () {
  'use strict';
  window.STUDIO_PAGES = window.STUDIO_PAGES || {};

  /* -----------------------------------------------------------------
     1. Home (index.html)
     ----------------------------------------------------------------- */
  window.STUDIO_PAGES['index.html'] = {
    title: ${JSON.stringify(pIndex.title)},
    html: ${JSON.stringify(pIndex.html)},
    init: function () {
      if (window._heroSliderInterval) {
        clearInterval(window._heroSliderInterval);
        window._heroSliderInterval = null;
      }
      var slides = document.querySelectorAll('.hero-slide');
      var count = document.getElementById('heroCount');
      var cap = document.getElementById('heroCaption');
      var prev = document.getElementById('heroPrev');
      var next = document.getElementById('heroNext');
      var captions = [
        'Udaipur, Rajasthan &middot; 50mm f/1.8 &middot; 1/500s &middot; ISO 200',
        'Bandra West, Mumbai &middot; 85mm f/1.4 &middot; 1/250s &middot; ISO 400',
        'Malshej Ghat &middot; 35mm f/2.8 &middot; 1/125s &middot; ISO 100'
      ];
      var idx = 0;
      function show(n) {
        if (!slides.length) return;
        slides[idx].classList.remove('is-active');
        idx = (n + slides.length) % slides.length;
        slides[idx].classList.add('is-active');
        if (count) count.textContent = '0' + (idx + 1) + ' / 0' + slides.length;
        if (cap) cap.innerHTML = captions[idx] || '';
      }
      if (prev && next) {
        prev.onclick = function () { show(idx - 1); };
        next.onclick = function () { show(idx + 1); };
      }
      if (slides.length > 1) {
        window._heroSliderInterval = setInterval(function () { show(idx + 1); }, 7500);
      }
    }
  };

  /* -----------------------------------------------------------------
     2. Selected Work (work.html)
     ----------------------------------------------------------------- */
  window.STUDIO_PAGES['work.html'] = {
    title: ${JSON.stringify(pWork.title)},
    html: ${JSON.stringify(pWork.html)},
    init: function () {
      var items = [];
      var activeFilter = 'all';
      var activeIndex = 0;
      var grid = document.getElementById('workGrid');
      var filtersEl = document.getElementById('categoryFilters');

      var lb = document.getElementById('lightbox');
      var lbImg = document.getElementById('lbImg');
      var lbCaption = document.getElementById('lbCaption');
      var lbCount = document.getElementById('lbCount');
      var lbClose = document.getElementById('lbClose');
      var lbPrev = document.getElementById('lbPrev');
      var lbNext = document.getElementById('lbNext');

      function currentFiltered() {
        if (activeFilter === 'all') return items;
        return items.filter(function(item) { return item.category === activeFilter; });
      }

      function renderGrid() {
        if (!grid) return;
        var visible = currentFiltered();
        grid.innerHTML = '';
        if (!visible.length) {
          grid.innerHTML = '<div class="empty-note">No photographs in this category yet.</div>';
          return;
        }

        visible.forEach(function(item, idx) {
          var fig = document.createElement('figure');
          fig.className = 'item curtain is-in tilt-frame';
          var isLand = (item.width || 3) > (item.height || 2);
          var ratioClass = isLand ? 'ratio-32' : 'ratio-45';
          var frameNum = String(idx + 1).padStart(2, '0');

          fig.innerHTML =
            '<div class="frame ' + ratioClass + '">' +
              '<span class="frame-mark mark-tl">+</span>' +
              '<img src="' + (window.Api ? Api.format.esc(item.thumb || item.src) : (item.thumb || item.src)) + '" alt="' + (window.Api ? Api.format.esc(item.title) : item.title) + '" loading="lazy">' +
            '</div>' +
            '<figcaption>' +
              '<span class="t">' + (window.Api ? Api.format.esc(item.title) : item.title) + (item.location ? ' &middot; <em>' + (window.Api ? Api.format.esc(item.location) : item.location) + '</em>' : '') + '</span>' +
              '<span class="exif-tag">&#9650; ' + frameNum + ' &middot; ' + (window.Api ? Api.format.esc(item.category) : item.category) + (item.year ? ', ' + item.year : '') + '</span>' +
            '</figcaption>';

          var img = fig.querySelector('img');
          if (img) {
            img.onload = function() { img.classList.add('is-loaded'); };
            if (img.complete) img.classList.add('is-loaded');
          }

          fig.onclick = function() {
            openLightbox(idx);
          };

          grid.appendChild(fig);
        });
      }

      function updateCounts() {
        if (!filtersEl) return;
        var cats = ['all', 'weddings', 'portraits', 'editorials', 'personal'];
        cats.forEach(function(cat) {
          var count = (cat === 'all') ? items.length : items.filter(function(i) { return i.category === cat; }).length;
          var el = document.getElementById('count-' + cat);
          if (el) el.textContent = '(' + count + ')';
        });
      }

      if (filtersEl) {
        filtersEl.onclick = function(e) {
          var btn = e.target.closest('button[data-filter]');
          if (!btn) return;
          filtersEl.querySelectorAll('button').forEach(function(b) { b.setAttribute('aria-pressed', 'false'); });
          btn.setAttribute('aria-pressed', 'true');
          activeFilter = btn.getAttribute('data-filter');
          renderGrid();
        };
      }

      function openLightbox(idx) {
        var visible = currentFiltered();
        if (!visible[idx] || !lb) return;
        activeIndex = idx;
        var item = visible[activeIndex];
        if (lbImg) {
          lbImg.src = item.src;
          lbImg.alt = item.title;
        }
        if (lbCaption) {
          lbCaption.innerHTML =
            '<strong>' + (window.Api ? Api.format.esc(item.title) : item.title) + '</strong> &middot; ' +
            (item.location ? (window.Api ? Api.format.esc(item.location) : item.location) + ' &middot; ' : '') +
            (window.Api ? Api.format.esc(item.category) : item.category) + (item.year ? ', ' + item.year : '') +
            (item.exif ? '<br><small style="color:#8e877c;">' + (window.Api ? Api.format.esc(item.exif) : item.exif) + '</small>' : '');
        }
        if (lbCount) {
          lbCount.textContent = String(activeIndex + 1).padStart(2, '0') + ' / ' + String(visible.length).padStart(2, '0');
        }
        lb.classList.add('is-open');
        document.body.classList.add('no-scroll');
      }

      function closeLightbox() {
        if (!lb) return;
        lb.classList.remove('is-open');
        document.body.classList.remove('no-scroll');
      }

      function nextPhoto() {
        var visible = currentFiltered();
        if (!visible.length) return;
        activeIndex = (activeIndex + 1) % visible.length;
        openLightbox(activeIndex);
      }

      function prevPhoto() {
        var visible = currentFiltered();
        if (!visible.length) return;
        activeIndex = (activeIndex - 1 + visible.length) % visible.length;
        openLightbox(activeIndex);
      }

      if (lbClose) lbClose.onclick = closeLightbox;
      if (lbPrev) lbPrev.onclick = prevPhoto;
      if (lbNext) lbNext.onclick = nextPhoto;

      window.onkeydown = function(e) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextPhoto();
        if (e.key === 'ArrowLeft') prevPhoto();
      };

      if (window.Api && Api.listPortfolio) {
        Api.listPortfolio().then(function(loaded) {
          items = loaded;
          updateCounts();
          renderGrid();
        }).catch(function(err) {
          console.error('Error loading portfolio:', err);
        });
      }
    }
  };

  /* -----------------------------------------------------------------
     3. About (about.html)
     ----------------------------------------------------------------- */
  window.STUDIO_PAGES['about.html'] = {
    title: ${JSON.stringify(pAbout.title)},
    html: ${JSON.stringify(pAbout.html)},
    init: function () {
      // Film stock and shared modules
    }
  };

  /* -----------------------------------------------------------------
     4. Services & Investment (services.html)
     ----------------------------------------------------------------- */
  window.STUDIO_PAGES['services.html'] = {
    title: ${JSON.stringify(pServices.title)},
    html: ${JSON.stringify(pServices.html)},
    init: function () {
      // Lens simulator and grading slider
    }
  };

  /* -----------------------------------------------------------------
     5. Check Dates & Reserve (booking.html)
     ----------------------------------------------------------------- */
  window.STUDIO_PAGES['booking.html'] = {
    title: ${JSON.stringify(pBooking.title)},
    html: ${JSON.stringify(pBooking.html)},
    init: function (url) {
      var today = new Date();
      var viewYear = today.getFullYear();
      var viewMonth = today.getMonth();
      var selectedDateStr = '';
      var unavailable = new Set();

      var calMonthYear = document.getElementById('calMonthYear');
      var calGrid = document.getElementById('calGrid');
      var calPrev = document.getElementById('calPrev');
      var calNext = document.getElementById('calNext');
      var calSelectedDisplay = document.getElementById('calSelectedDisplay');
      var eventDateInput = document.getElementById('event_date');

      var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var dowNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

      function formatYMD(y, m, d) {
        return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      }

      function loadUnavailableAndRender() {
        var startDay = formatYMD(viewYear, viewMonth, 1);
        var endDay = formatYMD(viewYear, viewMonth + 1, 0);

        if (window.Api && Api.getUnavailableDates) {
          Api.getUnavailableDates(startDay, endDay).then(function(dates) {
            unavailable = dates;
            renderCalendar();
          }).catch(function() {
            renderCalendar();
          });
        } else {
          renderCalendar();
        }
      }

      function renderCalendar() {
        if (!calMonthYear || !calGrid) return;
        calMonthYear.textContent = monthNames[viewMonth] + ' ' + viewYear;
        calGrid.innerHTML = '';

        dowNames.forEach(function(day) {
          var el = document.createElement('div');
          el.className = 'dow';
          el.textContent = day;
          calGrid.appendChild(el);
        });

        var firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
        var offset = (firstDayIndex + 6) % 7;
        for (var i = 0; i < offset; i++) {
          var empty = document.createElement('div');
          calGrid.appendChild(empty);
        }

        var totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
        var todayStr = formatYMD(today.getFullYear(), today.getMonth(), today.getDate());

        for (var d = 1; d <= totalDays; d++) {
          var dateStr = formatYMD(viewYear, viewMonth, d);
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = d;
          btn.dataset.date = dateStr;

          if (dateStr < todayStr) {
            btn.classList.add('is-past');
            btn.disabled = true;
          } else if (unavailable.has(dateStr)) {
            btn.classList.add('is-off');
            btn.disabled = true;
            btn.title = 'Date committed or unavailable';
          } else {
            if (dateStr === todayStr) btn.classList.add('is-today');
            if (dateStr === selectedDateStr) btn.classList.add('is-selected');

            btn.addEventListener('click', function(e) {
              var target = e.currentTarget;
              document.querySelectorAll('#calGrid button.is-selected').forEach(function(b) {
                b.classList.remove('is-selected');
              });
              target.classList.add('is-selected');
              selectedDateStr = target.dataset.date;
              if (eventDateInput) eventDateInput.value = selectedDateStr;
              if (calSelectedDisplay && window.Api) {
                calSelectedDisplay.textContent = Api.format.longDate(selectedDateStr);
              }
              var dateErr = document.getElementById('dateError');
              if (dateErr) dateErr.textContent = '';
            });
          }

          calGrid.appendChild(btn);
        }
      }

      if (calPrev) {
        calPrev.onclick = function() {
          viewMonth--;
          if (viewMonth < 0) { viewMonth = 11; viewYear--; }
          loadUnavailableAndRender();
        };
      }

      if (calNext) {
        calNext.onclick = function() {
          viewMonth++;
          if (viewMonth > 11) { viewMonth = 0; viewYear++; }
          loadUnavailableAndRender();
        };
      }

      loadUnavailableAndRender();

      var search = (url && url.indexOf('?') !== -1) ? url.substring(url.indexOf('?')) : window.location.search;
      var params = new URLSearchParams(search);
      var pkgParam = params.get('pkg');
      var pkgSelect = document.getElementById('package');
      if (pkgParam && pkgSelect) {
        for (var i = 0; i < pkgSelect.options.length; i++) {
          if (pkgSelect.options[i].text.toLowerCase().indexOf(pkgParam.toLowerCase()) !== -1) {
            pkgSelect.selectedIndex = i;
            break;
          }
        }
      }

      var form = document.getElementById('bookingForm');
      var submitBtn = document.getElementById('submitBtn');
      var formStatus = document.getElementById('formStatus');
      var confirmation = document.getElementById('bookingConfirmation');
      var resRef = document.getElementById('resRef');

      if (form) {
        form.onsubmit = function(e) {
          e.preventDefault();
          var company = document.getElementById('company');
          if (company && company.value) return;

          var hasError = false;
          ['name', 'email', 'phone', 'location'].forEach(function(f) {
            var input = document.getElementById(f);
            var err = document.getElementById('err-' + f);
            if (input && (!input.value.trim())) {
              if (err) err.textContent = 'This field is required.';
              hasError = true;
            } else if (err) {
              err.textContent = '';
            }
          });

          if (eventDateInput && !eventDateInput.value) {
            var dateErr = document.getElementById('dateError');
            if (dateErr) dateErr.textContent = 'Please choose a date from the calendar.';
            hasError = true;
          }

          if (hasError) return;

          if (submitBtn) {
            submitBtn.disabled = true;
            var span = submitBtn.querySelector('span');
            if (span) span.textContent = 'Submitting inquiry...';
          }
          if (formStatus) formStatus.textContent = '';

          var sessionTypeEl = document.querySelector('input[name="session_type"]:checked');
          var sessionType = sessionTypeEl ? sessionTypeEl.value : 'Wedding';
          var guestEl = document.getElementById('guest_count');
          var guestVal = guestEl ? guestEl.value : null;

          var data = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            session_type: sessionType,
            package: pkgSelect ? pkgSelect.value : '',
            event_date: eventDateInput.value,
            event_time: document.getElementById('event_time').value.trim(),
            location: document.getElementById('location').value.trim(),
            guest_count: guestVal ? parseInt(guestVal, 10) : null,
            budget: document.getElementById('budget').value,
            message: document.getElementById('message').value.trim(),
            referral: document.getElementById('referral').value.trim()
          };

          if (window.Api && Api.createBooking) {
            Api.createBooking(data).then(function(res) {
              if (resRef) resRef.textContent = res.reference || 'AR-CONFIRMED';
              form.style.display = 'none';
              if (confirmation) {
                confirmation.classList.add('is-shown');
                window.scrollTo({ top: confirmation.offsetTop - 100, behavior: 'smooth' });
              }
            }).catch(function(err) {
              console.error('Booking failed:', err);
              if (submitBtn) {
                submitBtn.disabled = false;
                var span = submitBtn.querySelector('span');
                if (span) span.textContent = 'Submit Commission Inquiry \\u2192';
              }
              if (formStatus) formStatus.textContent = 'Could not submit inquiry. Please email photosritesh8@gmail.com directly.';
            });
          }
        };
      }
    }
  };

  /* -----------------------------------------------------------------
     6. Contact (contact.html)
     ----------------------------------------------------------------- */
  window.STUDIO_PAGES['contact.html'] = {
    title: ${JSON.stringify(pContact.title)},
    html: ${JSON.stringify(pContact.html)},
    init: function () {
      var form = document.getElementById('contactForm');
      var btn = document.getElementById('contactSubmitBtn');
      var status = document.getElementById('contactStatus');
      var success = document.getElementById('contactSuccess');

      if (form) {
        form.onsubmit = function(e) {
          e.preventDefault();
          var company = document.getElementById('company_name');
          if (company && company.value) return;

          var nameEl = document.getElementById('contact_name');
          var emailEl = document.getElementById('contact_email');
          var msgEl = document.getElementById('contact_message');

          var err = false;
          if (!nameEl.value.trim()) { document.getElementById('err-cname').textContent = 'Name is required.'; err = true; }
          else document.getElementById('err-cname').textContent = '';

          if (!emailEl.value.trim()) { document.getElementById('err-cemail').textContent = 'Email is required.'; err = true; }
          else document.getElementById('err-cemail').textContent = '';

          if (!msgEl.value.trim()) { document.getElementById('err-cmessage').textContent = 'Message is required.'; err = true; }
          else document.getElementById('err-cmessage').textContent = '';

          if (err) return;

          btn.disabled = true;
          var span = btn.querySelector('span');
          if (span) span.textContent = 'Sending...';
          status.textContent = '';

          if (window.Api && Api.createMessage) {
            Api.createMessage({
              name: nameEl.value.trim(),
              email: emailEl.value.trim(),
              subject: document.getElementById('contact_subject').value.trim(),
              message: msgEl.value.trim()
            }).then(function() {
              form.style.display = 'none';
              if (success) success.classList.add('is-shown');
            }).catch(function(ex) {
              console.error(ex);
              btn.disabled = false;
              if (span) span.textContent = 'Send Message \\u2192';
              status.textContent = 'Could not send message. Please write directly to photosritesh8@gmail.com.';
            });
          }
        };
      }
    }
  };

  /* -----------------------------------------------------------------
     7. Developer & Systems (developer.html)
     ----------------------------------------------------------------- */
  window.STUDIO_PAGES['developer.html'] = {
    title: ${JSON.stringify(pDev.title)},
    html: ${JSON.stringify(pDev.html)},
    init: function () {
      // Developer cards and layout
    }
  };

  /* Aliases */
  window.STUDIO_PAGES[''] = window.STUDIO_PAGES['index.html'];
  window.STUDIO_PAGES['/'] = window.STUDIO_PAGES['index.html'];
})();
`;

fs.writeFileSync(path.join(base, 'assets', 'js', 'studio-pages.js'), output, 'utf8');
console.log('Successfully generated studio-pages.js! Size:', output.length, 'bytes');
