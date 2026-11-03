/* =====================================================================
   Creative Interactions — Ritesh Farswan Photography
   Analog film aesthetics, Web Audio shutter, RAW vs Graded comparison,
   Darkroom mode toggle, Film Stock emulation (Portra / Tri-X / Fuji),
   Interactive Lens Focal Length Simulator, Uninterrupted Background Music,
   and Zero-Refresh SPA Navigation across all desktop and mobile views.
   Strictly NO custom laggy cursor. Standard natural browser pointers only.
   ===================================================================== */

(function () {
  'use strict';

  /* -------------------------------------------------------------------
     1. Web Audio Procedural Mechanical Shutter Sound
     ------------------------------------------------------------------- */
  var audioCtx = null;
  var soundEnabled = false;

  function initAudio() {
    try {
      var AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    } catch (e) {
      audioCtx = null;
    }
  }

  function playShutterClick() {
    if (!soundEnabled) return;
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    var t = audioCtx.currentTime;

    // Shutter curtain strike (low mechanical thud)
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.045);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.05);

    // Leaf shutter metallic snap
    var noiseBufferSize = audioCtx.sampleRate * 0.025;
    var noiseBuffer = audioCtx.createBuffer(1, noiseBufferSize, audioCtx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < noiseBufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    var whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    var filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, t);
    filter.Q.setValueAtTime(3.0, t);
    var noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);
    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    whiteNoise.start(t);
  }

  function initSoundToggle() {
    var toggleBtn = document.getElementById('soundToggleBtn');
    if (!toggleBtn) return;
    if (window._soundToggleBound) return;
    window._soundToggleBound = true;

    var saved = localStorage.getItem('studio_sound_mode');
    if (saved === 'on') {
      soundEnabled = true;
      toggleBtn.textContent = 'Shutter Sound: ON';
      toggleBtn.setAttribute('aria-pressed', 'true');
    }

    toggleBtn.addEventListener('click', function () {
      soundEnabled = !soundEnabled;
      if (soundEnabled) {
        initAudio();
        playShutterClick();
        toggleBtn.textContent = 'Shutter Sound: ON';
        toggleBtn.setAttribute('aria-pressed', 'true');
        localStorage.setItem('studio_sound_mode', 'on');
      } else {
        toggleBtn.textContent = 'Shutter Sound: OFF';
        toggleBtn.setAttribute('aria-pressed', 'false');
        localStorage.setItem('studio_sound_mode', 'off');
      }
    });

    document.addEventListener('click', function (e) {
      if (e.target.closest('.frame, .proof, .filter-btn, .hero-controls button, .lb-prev, .lb-next, .stock-btn, .lens-btn')) {
        playShutterClick();
      }
    });
  }

  /* -------------------------------------------------------------------
     1b. Traditional Wedding Ambient Background Music Suite
     Auto-plays in continuous loop at 35% volume (30-40%).
     Uninterrupted and continuous across all desktop and mobile navigation.
     Preserves exact playback second across reloads and page transitions.
     ------------------------------------------------------------------- */
  var ambienceAudio = null;
  var ambienceEnabled = true;
  var ambienceTargetVolume = 0.35; // 35% volume (within 30-40% range)
  var initialSeekCompleted = false;
  var targetSeekTime = 0;

  function resolveMusicPath() {
    var isClientSubdir = window.location.pathname.indexOf('/client/') !== -1;
    var base = isClientSubdir ? '../' : '';
    return base + 'assets/audio/wedding-ambience.mp3';
  }

  function readSavedTimestamp() {
    try {
      var saved = sessionStorage.getItem('studio_ambience_time') || localStorage.getItem('studio_ambience_time');
      var val = parseFloat(saved || '0');
      return (val > 0.5 && isFinite(val)) ? val : 0;
    } catch (e) {
      return 0;
    }
  }

  targetSeekTime = readSavedTimestamp();
  if (targetSeekTime <= 0.5) {
    initialSeekCompleted = true;
  }

  function applySavedTimestamp() {
    if (!ambienceAudio) return;
    if (initialSeekCompleted) return;
    try {
      if (targetSeekTime > 0.5 && isFinite(targetSeekTime)) {
        if (ambienceAudio.readyState >= 1) { // HAVE_METADATA or higher
          if (!ambienceAudio.duration || targetSeekTime < ambienceAudio.duration) {
            ambienceAudio.currentTime = targetSeekTime;
          }
          initialSeekCompleted = true;
        }
      } else {
        initialSeekCompleted = true;
      }
    } catch (e) {
      console.warn('Seek error:', e);
    }
  }

  function saveCurrentTimestamp() {
    if (!ambienceAudio) return;
    // CRITICAL: Prevent early timeupdate events from wiping saved timestamp
    if (!initialSeekCompleted && targetSeekTime > 0.5) return;
    try {
      var cur = ambienceAudio.currentTime;
      if (cur > 0.5 && isFinite(cur)) {
        sessionStorage.setItem('studio_ambience_time', cur.toFixed(2));
        localStorage.setItem('studio_ambience_time', cur.toFixed(2));
      }
    } catch (e) {}
  }

  function initAmbienceAudio() {
    if (ambienceAudio) return ambienceAudio;
    var existing = document.getElementById('studioAmbientAudio');
    if (existing) {
      ambienceAudio = existing;
    } else {
      try {
        ambienceAudio = new Audio();
        ambienceAudio.id = 'studioAmbientAudio';
        ambienceAudio.src = resolveMusicPath();
        document.body.appendChild(ambienceAudio);
      } catch (e) {
        console.warn('Ambience audio initialization error:', e);
      }
    }
    if (ambienceAudio) {
      ambienceAudio.loop = true;
      ambienceAudio.volume = ambienceTargetVolume;
      ambienceAudio.preload = 'auto';

      ambienceAudio.addEventListener('timeupdate', function () {
        saveCurrentTimestamp();
      });

      ['loadedmetadata', 'canplay', 'canplaythrough', 'playing', 'seeked'].forEach(function (evt) {
        ambienceAudio.addEventListener(evt, function () {
          applySavedTimestamp();
        });
      });

      window.addEventListener('beforeunload', saveCurrentTimestamp);
      window.addEventListener('pagehide', saveCurrentTimestamp);

      ambienceAudio.addEventListener('error', function () {
        var isClientSubdir = window.location.pathname.indexOf('/client/') !== -1;
        var fallbackPath = (isClientSubdir ? '../../' : '../') + 'music/Maangal%20%E0%A4%AE%E0%A4%BE%E0%A4%81%E0%A4%97%E0%A4%B2%20Traditional%20Wedding%20Songs%20Pandavaas.mp3';
        if (ambienceAudio && ambienceAudio.src && ambienceAudio.src.indexOf('wedding-ambience.mp3') !== -1) {
          ambienceAudio.src = fallbackPath;
          if (ambienceEnabled) {
            ambienceAudio.volume = ambienceTargetVolume;
            applySavedTimestamp();
            ambienceAudio.play().catch(function () {});
          }
        }
      });
    }
    return ambienceAudio;
  }

  function startAmbienceMusic() {
    initAmbienceAudio();
    if (!ambienceAudio) return;
    ambienceAudio.loop = true;
    ambienceAudio.volume = ambienceTargetVolume;
    applySavedTimestamp();

    var promise = ambienceAudio.play();
    if (promise !== undefined) {
      promise.then(function () {
        applySavedTimestamp();
        updateAmbienceButtons(true);
      }).catch(function () {
        // Browser autoplay policy requires user gesture; start on first interaction with webpage
        var unlockEvents = ['click', 'pointerdown', 'touchstart', 'scroll', 'keydown'];
        function unlockOnInteraction() {
          if (ambienceEnabled && ambienceAudio && ambienceAudio.paused) {
            ambienceAudio.volume = ambienceTargetVolume;
            applySavedTimestamp();
            ambienceAudio.play().then(function () {
              applySavedTimestamp();
              updateAmbienceButtons(true);
            }).catch(function () {});
          }
          unlockEvents.forEach(function (evt) {
            window.removeEventListener(evt, unlockOnInteraction, true);
            document.removeEventListener(evt, unlockOnInteraction, true);
          });
        }
        unlockEvents.forEach(function (evt) {
          window.addEventListener(evt, unlockOnInteraction, { capture: true, once: true });
          document.addEventListener(evt, unlockOnInteraction, { capture: true, once: true });
        });
      });
    }
  }

  function stopAmbienceMusic() {
    if (!ambienceAudio) return;
    ambienceAudio.pause();
  }

  function updateAmbienceButtons(state) {
    var btns = document.querySelectorAll('#ambienceToggleBtn, #mobileAmbienceBtn');
    btns.forEach(function (btn) {
      if (state) {
        btn.textContent = 'Ambience: ON (35%)';
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', 'Background traditional wedding ambience active (35% volume). Click to pause.');
      } else {
        btn.textContent = 'Ambience: OFF';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', 'Play traditional wedding ambient background music (35% volume in loop)');
      }
    });
  }

  function initAmbienceToggle() {
    initAmbienceAudio();

    var saved = localStorage.getItem('studio_ambience_music');
    // Auto-play by default on the webpage unless the user explicitly turned it off
    if (saved !== 'off') {
      ambienceEnabled = true;
      updateAmbienceButtons(true);
      startAmbienceMusic();
    } else {
      ambienceEnabled = false;
      updateAmbienceButtons(false);
    }

    if (window._ambienceToggleBound) return;
    window._ambienceToggleBound = true;

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#ambienceToggleBtn, #mobileAmbienceBtn');
      if (!btn) return;
      e.stopPropagation();
      ambienceEnabled = !ambienceEnabled;
      if (ambienceEnabled) {
        initAmbienceAudio();
        startAmbienceMusic();
        updateAmbienceButtons(true);
        localStorage.setItem('studio_ambience_music', 'on');
      } else {
        stopAmbienceMusic();
        updateAmbienceButtons(false);
        localStorage.setItem('studio_ambience_music', 'off');
      }
      playShutterClick();
    });
  }

  /* -------------------------------------------------------------------
     2. Darkroom Amber Mode (Daylight Linen vs Red Lamp Darkroom)
     ------------------------------------------------------------------- */
  function initDarkroomToggle() {
    var toggleBtn = document.getElementById('darkroomToggleBtn');
    if (!toggleBtn) return;
    if (window._darkroomToggleBound) return;
    window._darkroomToggleBound = true;

    var saved = localStorage.getItem('studio_darkroom_mode');
    if (saved === 'darkroom') {
      document.documentElement.classList.add('theme--darkroom');
      toggleBtn.textContent = 'Mode: Darkroom';
      toggleBtn.setAttribute('aria-pressed', 'true');
    }

    toggleBtn.addEventListener('click', function () {
      var isDark = document.documentElement.classList.toggle('theme--darkroom');
      if (isDark) {
        toggleBtn.textContent = 'Mode: Darkroom';
        toggleBtn.setAttribute('aria-pressed', 'true');
        localStorage.setItem('studio_darkroom_mode', 'darkroom');
      } else {
        toggleBtn.textContent = 'Mode: Daylight';
        toggleBtn.setAttribute('aria-pressed', 'false');
        localStorage.setItem('studio_darkroom_mode', 'daylight');
      }
      playShutterClick();
    });
  }

  /* -------------------------------------------------------------------
     3. Film Emulsion Stock Profiles (Portra 400 / Tri-X 400 / Fuji Pro)
     ------------------------------------------------------------------- */
  function initFilmStockSelector() {
    var stockButtons = document.querySelectorAll('.stock-btn');
    if (!stockButtons.length) return;

    function applyStock(stock) {
      document.documentElement.classList.remove('emulsion--portra', 'emulsion--trix', 'emulsion--fuji');
      document.documentElement.classList.add('emulsion--' + stock);

      stockButtons.forEach(function (btn) {
        var isMatch = btn.getAttribute('data-stock') === stock;
        btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      var label = document.getElementById('activeStockDisplay');
      if (label) {
        var names = {
          portra: 'Kodak Portra 400 (Warm Skin / Gold Shadows)',
          trix: 'Kodak Tri-X 400 (Silver Halide / High Acutance)',
          fuji: 'Fujifilm Pro 400H (Cool Emerald / Soft Highlights)'
        };
        label.textContent = names[stock] || stock;
      }
    }

    stockButtons.forEach(function (btn) {
      btn.onclick = function () {
        var stock = btn.getAttribute('data-stock');
        applyStock(stock);
        localStorage.setItem('studio_film_stock', stock);
      };
    });

    var saved = localStorage.getItem('studio_film_stock') || 'portra';
    applyStock(saved);
  }

  /* -------------------------------------------------------------------
     4. Interactive Lens Focal Length & Field-of-View Simulator
     ------------------------------------------------------------------- */
  function initLensSimulator() {
    var lensSim = document.getElementById('lensSimulator');
    if (!lensSim) return;

    var lensImg = lensSim.querySelector('.lens-target-img');
    var lensLabel = document.getElementById('simLensName');
    var lensFov = document.getElementById('simLensFov');
    var lensDesc = document.getElementById('simLensDesc');
    var buttons = lensSim.querySelectorAll('.lens-btn');

    var lensProfiles = {
      '28mm': {
        scale: 1.0,
        fov: '75.4° Angle of View',
        title: '28mm f/2.8 Elmarit (Documentary Environmental)',
        desc: 'Wide context; captures the full room architecture, surrounding family, and atmospheric spatial depth.'
      },
      '50mm': {
        scale: 1.48,
        fov: '46.8° Angle of View',
        title: '50mm f/1.4 Summilux (Human Eye Perspective)',
        desc: 'Zero optical distortion; matches human binocular perspective for honest, unexaggerated photojournalism.'
      },
      '85mm': {
        scale: 2.15,
        fov: '28.6° Angle of View',
        title: '85mm f/1.4 Planar (Intimate Portrait Compression)',
        desc: 'Subject isolation with gentle background compression; renders soft painterly falloff on natural skin tones.'
      }
    };

    buttons.forEach(function (btn) {
      btn.onclick = function () {
        var fl = btn.getAttribute('data-lens');
        var profile = lensProfiles[fl];
        if (!profile) return;

        buttons.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
        btn.setAttribute('aria-pressed', 'true');

        if (lensImg) {
          lensImg.style.transform = 'scale(' + profile.scale + ')';
        }
        if (lensLabel) lensLabel.textContent = profile.title;
        if (lensFov) lensFov.textContent = profile.fov;
        if (lensDesc) lensDesc.textContent = profile.desc;

        playShutterClick();
      };
    });
  }

  /* -------------------------------------------------------------------
     5. Interactive RAW vs Color-Graded Split Comparison Slider
     ------------------------------------------------------------------- */
  function initGradingSlider() {
    var slider = document.getElementById('gradingSlider');
    if (!slider) return;

    var handle = slider.querySelector('.slider-handle');
    var rawLayer = slider.querySelector('.slider-raw');
    if (!handle || !rawLayer) return;
    var isDragging = false;

    function setPosition(xPercent) {
      xPercent = Math.max(0, Math.min(100, xPercent));
      rawLayer.style.width = xPercent + '%';
      handle.style.left = xPercent + '%';
    }

    function onMove(e) {
      if (!isDragging) return;
      var rect = slider.getBoundingClientRect();
      var clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      var x = clientX - rect.left;
      var pct = (x / rect.width) * 100;
      setPosition(pct);
    }

    function startDrag(e) {
      isDragging = true;
      onMove(e);
      slider.classList.add('is-dragging');
    }

    function stopDrag() {
      if (isDragging) {
        isDragging = false;
        slider.classList.remove('is-dragging');
      }
    }

    slider.onmousedown = startDrag;
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stopDrag);

    slider.ontouchstart = startDrag;
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', stopDrag);

    setPosition(50);
  }

  /* -------------------------------------------------------------------
     6. 3D Tilt Perspective on Selected Photograph Frames
     ------------------------------------------------------------------- */
  function init3DTilt() {
    if (window.matchMedia('(hover: none)').matches) return;

    var tiltCards = document.querySelectorAll('.tilt-frame');
    tiltCards.forEach(function (card) {
      card.onmousemove = function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var rotateX = ((y - centerY) / centerY) * -6.5;
        var rotateY = ((x - centerX) / centerX) * 6.5;

        card.style.transform = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) scale3d(1.018, 1.018, 1.018)';
      };

      card.onmouseleave = function () {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      };
    });
  }

  /* -------------------------------------------------------------------
     7. Horizontal Film Strip Drag-to-Scroll
     ------------------------------------------------------------------- */
  function initFilmStrip() {
    var strip = document.getElementById('filmStripTrack');
    if (!strip) return;

    var isDown = false;
    var startX, scrollLeft;

    strip.onmousedown = function (e) {
      isDown = true;
      strip.classList.add('is-dragging');
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    };

    strip.onmouseleave = function () {
      isDown = false;
      strip.classList.remove('is-dragging');
    };

    strip.onmouseup = function () {
      isDown = false;
      strip.classList.remove('is-dragging');
    };

    strip.onmousemove = function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - strip.offsetLeft;
      var walk = (x - startX) * 1.8;
      strip.scrollLeft = scrollLeft - walk;
    };
  }

  /* -------------------------------------------------------------------
     8. Studio Clock & Location Coordinates
     ------------------------------------------------------------------- */
  function initStudioClock() {
    var clockEl = document.getElementById('liveStudioClock');
    if (!clockEl) return;
    if (window._studioClockInterval) return;

    function update() {
      try {
        var now = new Date();
        var options = {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        };
        clockEl.textContent = new Intl.DateTimeFormat('en-GB', options).format(now) + ' IST';
      } catch (e) {
        var d = new Date();
        clockEl.textContent = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ' IST';
      }
    }
    update();
    window._studioClockInterval = setInterval(update, 1000);
  }

  /* -------------------------------------------------------------------
     9. Curtain Reveal Observer
     ------------------------------------------------------------------- */
  function initCurtainReveals() {
    var revealItems = document.querySelectorAll('.curtain, .reveal');
    if (!revealItems.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* -------------------------------------------------------------------
     10. Work View Switcher (Masonry, Contact Sheet 35mm, Editorial)
     ------------------------------------------------------------------- */
  function initWorkViewSwitcher() {
    var switcher = document.getElementById('viewModeSwitcher');
    var grid = document.getElementById('workGrid');
    if (!switcher || !grid) return;

    switcher.onclick = function (e) {
      var btn = e.target.closest('button[data-view]');
      if (!btn) return;

      switcher.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', 'false');
      });
      btn.setAttribute('aria-pressed', 'true');

      var mode = btn.getAttribute('data-view');
      grid.classList.remove('view--masonry', 'view--contact-sheet', 'view--editorial');
      grid.classList.add('view--' + mode);

      playShutterClick();
      localStorage.setItem('studio_work_view_mode', mode);
    };

    var saved = localStorage.getItem('studio_work_view_mode') || 'masonry';
    var targetBtn = switcher.querySelector('button[data-view="' + saved + '"]');
    if (targetBtn) {
      switcher.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      targetBtn.setAttribute('aria-pressed', 'true');
      grid.classList.remove('view--masonry', 'view--contact-sheet', 'view--editorial');
      grid.classList.add('view--' + saved);
    }
  }

  /* -------------------------------------------------------------------
     11. Lightbox Loupe / Precision Detail Inspection
     ------------------------------------------------------------------- */
  function initLightboxLoupe() {
    var lbStage = document.querySelector('.lb-stage');
    var lbImg = document.getElementById('lbImg');
    if (!lbStage || !lbImg) return;

    var isZoomed = false;

    lbStage.onclick = function (e) {
      if (e.target.closest('.lb-prev, .lb-next')) return;
      isZoomed = !isZoomed;
      if (isZoomed) {
        lbStage.classList.add('is-zoomed');
        updateLoupe(e);
        playShutterClick();
      } else {
        lbStage.classList.remove('is-zoomed');
        lbImg.style.transform = '';
      }
    };

    function updateLoupe(e) {
      if (!isZoomed) return;
      var rect = lbStage.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      lbImg.style.transformOrigin = x + '% ' + y + '%';
      lbImg.style.transform = 'scale(2.2)';
    }

    lbStage.onmousemove = function (e) {
      if (isZoomed) updateLoupe(e);
    };

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isZoomed) {
        isZoomed = false;
        lbStage.classList.remove('is-zoomed');
        lbImg.style.transform = '';
      }
    });
  }

  /* -------------------------------------------------------------------
     12. Dynamic Studio Admin Link Resolution
     ------------------------------------------------------------------- */
  function initStudioLinks() {
    var adminLinks = document.querySelectorAll('a.studio-admin-link');
    if (!adminLinks.length) return;
    if (window.location.protocol === 'file:' && window.location.pathname.indexOf('/website/') !== -1) {
      adminLinks.forEach(function (a) {
        a.setAttribute('href', '../studio/index.html');
      });
    }
  }

  /* -------------------------------------------------------------------
     13. Global Layout (Header Scroll & Mobile Menu Drawer)
     ------------------------------------------------------------------- */
  function initGlobalLayout() {
    if (window._globalLayoutInitialized) return;
    window._globalLayoutInitialized = true;

    var header = document.getElementById('siteHeader');
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      if (!header) return;
      var currentY = window.scrollY;
      if (currentY > 40) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
      if (currentY > lastY && currentY > 180) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
      lastY = currentY;
    }, { passive: true });

    document.addEventListener('click', function (e) {
      var toggleBtn = e.target.closest('#menuToggle');
      var closeBtn = e.target.closest('#menuClose');
      var mobileMenu = document.getElementById('mobileMenu');
      if (toggleBtn && mobileMenu) {
        mobileMenu.classList.add('is-open');
        toggleBtn.setAttribute('aria-expanded', 'true');
        document.body.classList.add('no-scroll');
      } else if (closeBtn && mobileMenu) {
        mobileMenu.classList.remove('is-open');
        var toggle = document.getElementById('menuToggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      }
    });
  }

  /* -------------------------------------------------------------------
     14. Seamless Zero-Refresh SPA Navigation Engine
     Provides instant, zero-refresh transitions across all pages on desktop
     and mobile (http, https, and file protocols), keeping ambient music
     playing 100% uninterrupted.
     ------------------------------------------------------------------- */
  function getPageKey(urlOrHref) {
    if (!urlOrHref) return 'index.html';
    var clean = urlOrHref.split('#')[0].split('?')[0];
    var name = clean.split('/').pop() || 'index.html';
    if (!name || name === '') name = 'index.html';
    return name;
  }

  function updateNavActiveLinks(pageKey) {
    var navLinks = document.querySelectorAll('.nav a, .mobile-menu nav a');
    navLinks.forEach(function (a) {
      var aHref = getPageKey(a.getAttribute('href') || '');
      if (aHref === pageKey || (pageKey === 'index.html' && (aHref === '' || aHref === 'index.html'))) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function closeMobileMenu() {
    var mobileMenu = document.getElementById('mobileMenu');
    var menuToggle = document.getElementById('menuToggle');
    if (mobileMenu && mobileMenu.classList.contains('is-open')) {
      mobileMenu.classList.remove('is-open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('no-scroll');
    }
  }

  function renderView(key, url, push) {
    var mainEl = document.getElementById('main');
    if (!mainEl) {
      window.location.href = url;
      return;
    }

    var page = (window.STUDIO_PAGES && window.STUDIO_PAGES[key]) || null;
    if (page) {
      saveCurrentTimestamp();
      mainEl.style.opacity = '0.35';
      mainEl.style.transition = 'opacity 0.12s ease';

      setTimeout(function () {
        mainEl.innerHTML = page.html;
        if (page.title) {
          document.title = page.title;
        }

        if (push) {
          try {
            window.history.pushState({ pageKey: key, url: url }, page.title || '', url);
          } catch (e) {
            // Safe fallback if history.pushState is restricted on file: protocol
          }
        }

        updateNavActiveLinks(key);
        closeMobileMenu();
        window.scrollTo(0, 0);

        // Re-initialize interactive modules
        initModules();
        if (typeof page.init === 'function') {
          page.init(url);
        }

        mainEl.style.opacity = '1';
      }, 120);
      return;
    }

    // Dynamic HTTP fetch fallback if page is not bundled in STUDIO_PAGES
    if (window.location.protocol !== 'file:') {
      saveCurrentTimestamp();
      mainEl.style.opacity = '0.35';
      mainEl.style.transition = 'opacity 0.12s ease';

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error('Status ' + res.status);
          return res.text();
        })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, 'text/html');
          var newMain = doc.getElementById('main');
          if (!newMain) {
            window.location.href = url;
            return;
          }

          if (doc.title) {
            document.title = doc.title;
          }

          mainEl.innerHTML = newMain.innerHTML;
          mainEl.style.opacity = '1';

          if (push) {
            try {
              window.history.pushState({ pageKey: key, url: url }, doc.title || '', url);
            } catch (e) {}
          }

          updateNavActiveLinks(key);
          closeMobileMenu();
          window.scrollTo(0, 0);

          initModules();

          var scripts = doc.querySelectorAll('body script:not([src])');
          scripts.forEach(function (s) {
            var code = s.textContent.trim();
            if (code) {
              try {
                var runScript = new Function(code);
                runScript();
              } catch (err) {
                console.warn('Script execution notice:', err);
              }
            }
          });
        })
        .catch(function () {
          window.location.href = url;
        });
    } else {
      window.location.href = url;
    }
  }

  function initSeamlessNavigation() {
    if (window._seamlessNavInitialized) return;
    window._seamlessNavInitialized = true;

    function isEligible(anchor) {
      if (!anchor || anchor.tagName !== 'A') return false;
      var href = anchor.getAttribute('href');
      if (!href) return false;
      if (anchor.target && anchor.target !== '_self') return false;
      if (anchor.hasAttribute('download')) return false;
      if (href.indexOf(':') !== -1 && href.indexOf('http') !== 0) return false; // mailto, tel, etc.
      if (href.charAt(0) === '#') return false;

      // Exclude sub-applications (client portal and studio backend)
      var isClientSubdir = window.location.pathname.indexOf('/client/') !== -1;
      if (isClientSubdir) return false;
      if (href.indexOf('client/') !== -1 || href.indexOf('/client/') !== -1 || href.indexOf('studio/') !== -1 || href.indexOf('/studio/') !== -1) return false;

      var currentKey = getPageKey(window.location.href);
      var key = getPageKey(href);
      if (currentKey === key && href.indexOf('?') === -1) {
        return false; // Already on current page
      }

      if (window.STUDIO_PAGES && window.STUDIO_PAGES[key]) {
        return true;
      }

      try {
        var target = new URL(href, window.location.href);
        if (target.origin !== window.location.origin) return false;
        var path = target.pathname;
        if (path.indexOf('/studio/') !== -1 || path.indexOf('/client/') !== -1) return false;
        if (path.endsWith('.zip') || path.endsWith('.mp3') || path.endsWith('.pdf')) return false;
        return true;
      } catch (e) {
        return false;
      }
    }

    document.addEventListener('click', function (e) {
      var anchor = e.target.closest('a');
      if (anchor && isEligible(anchor)) {
        e.preventDefault();
        var href = anchor.getAttribute('href');
        var key = getPageKey(href);
        renderView(key, href, true);
      }
    });

    window.addEventListener('popstate', function (e) {
      var key = (e.state && e.state.pageKey) || getPageKey(window.location.href);
      renderView(key, window.location.href, false);
    });
  }

  /* -------------------------------------------------------------------
     DOM Ready Boot
     ------------------------------------------------------------------- */
  function initModules() {
    initGlobalLayout();
    initStudioClock();
    initSoundToggle();
    initDarkroomToggle();
    initFilmStockSelector();
    initLensSimulator();
    initGradingSlider();
    init3DTilt();
    initFilmStrip();
    initCurtainReveals();
    initWorkViewSwitcher();
    initLightboxLoupe();
    initStudioLinks();
  }

  function init() {
    initModules();
    initAmbienceToggle();
    initSeamlessNavigation();

    // Run current page lifecycle controller on initial entry
    var currentKey = getPageKey(window.location.href);
    if (window.STUDIO_PAGES && window.STUDIO_PAGES[currentKey] && typeof window.STUDIO_PAGES[currentKey].init === 'function') {
      window.STUDIO_PAGES[currentKey].init(window.location.href);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
