/* =====================================================================
   Creative Interactions — Aditi Rane Photography
   Analog film aesthetics, Web Audio shutter, RAW vs Graded comparison,
   Darkroom mode toggle, Film Stock emulation (Portra / Tri-X / Fuji),
   and Interactive Lens Focal Length Simulator.
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
     1b. Traditional Wedding Ambient Background Music
     Plays "Maangal Traditional Wedding Songs" in loop at ~35% volume.
     ------------------------------------------------------------------- */
  var ambienceAudio = null;
  var ambienceEnabled = false;
  var ambienceTargetVolume = 0.35; // 35% volume (within 30-40% range)
  var ambienceFadeInterval = null;

  function resolveMusicPath() {
    var isClientSubdir = window.location.pathname.indexOf('/client/') !== -1;
    var base = isClientSubdir ? '../' : '';
    return base + 'assets/audio/wedding-ambience.mp3';
  }

  function initAmbienceAudio() {
    if (ambienceAudio) return;
    try {
      ambienceAudio = new Audio();
      ambienceAudio.src = resolveMusicPath();
      ambienceAudio.loop = true;
      ambienceAudio.volume = 0;
      ambienceAudio.preload = 'metadata';

      // Fallback path in case assets/audio isn't resolved in local file browsing
      ambienceAudio.addEventListener('error', function () {
        var isClientSubdir = window.location.pathname.indexOf('/client/') !== -1;
        var fallbackPath = (isClientSubdir ? '../../' : '../') + 'music/Maangal%20%E0%A4%AE%E0%A4%BE%E0%A4%81%E0%A4%97%E0%A4%B2%20Traditional%20Wedding%20Songs%20Pandavaas.mp3';
        if (ambienceAudio && ambienceAudio.src && ambienceAudio.src.indexOf('wedding-ambience.mp3') !== -1) {
          ambienceAudio.src = fallbackPath;
          if (ambienceEnabled) {
            ambienceAudio.play().catch(function () {});
          }
        }
      });
    } catch (e) {
      console.warn('Ambience audio initialization error:', e);
    }
  }

  function fadeAudio(targetVol, durationMs, onDone) {
    if (!ambienceAudio) return;
    if (ambienceFadeInterval) clearInterval(ambienceFadeInterval);
    var steps = 20;
    var stepTime = durationMs / steps;
    var startVol = ambienceAudio.volume;
    var delta = targetVol - startVol;
    var count = 0;

    ambienceFadeInterval = setInterval(function () {
      count++;
      var current = startVol + delta * (count / steps);
      ambienceAudio.volume = Math.max(0, Math.min(1, current));
      if (count >= steps) {
        clearInterval(ambienceFadeInterval);
        ambienceFadeInterval = null;
        ambienceAudio.volume = targetVol;
        if (typeof onDone === 'function') onDone();
      }
    }, stepTime);
  }

  function startAmbienceMusic() {
    initAmbienceAudio();
    if (!ambienceAudio) return;
    ambienceAudio.loop = true;
    var promise = ambienceAudio.play();
    if (promise !== undefined) {
      promise.then(function () {
        fadeAudio(ambienceTargetVolume, 1000);
      }).catch(function (err) {
        // Autoplay policy: play on next user gesture
        function onGesture() {
          if (ambienceEnabled && ambienceAudio) {
            ambienceAudio.play().then(function () {
              fadeAudio(ambienceTargetVolume, 1000);
            }).catch(function () {});
          }
          document.removeEventListener('click', onGesture);
          document.removeEventListener('keydown', onGesture);
        }
        document.addEventListener('click', onGesture);
        document.addEventListener('keydown', onGesture);
      });
    }
  }

  function stopAmbienceMusic() {
    if (!ambienceAudio) return;
    fadeAudio(0, 500, function () {
      ambienceAudio.pause();
    });
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
    var btns = document.querySelectorAll('#ambienceToggleBtn, #mobileAmbienceBtn');
    if (!btns.length) return;

    var saved = localStorage.getItem('studio_ambience_music');
    if (saved === 'on') {
      ambienceEnabled = true;
      updateAmbienceButtons(true);
      function autoStartOnGesture() {
        if (ambienceEnabled) startAmbienceMusic();
        document.removeEventListener('click', autoStartOnGesture);
      }
      document.addEventListener('click', autoStartOnGesture);
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        ambienceEnabled = !ambienceEnabled;
        if (ambienceEnabled) {
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
    });
  }

  /* -------------------------------------------------------------------
     2. Darkroom Amber Mode (Daylight Linen vs Red Lamp Darkroom)
     ------------------------------------------------------------------- */
  function initDarkroomToggle() {
    var toggleBtn = document.getElementById('darkroomToggleBtn');
    if (!toggleBtn) return;

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
      btn.addEventListener('click', function () {
        var stock = btn.getAttribute('data-stock');
        applyStock(stock);
        localStorage.setItem('studio_film_stock', stock);
      });
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
      btn.addEventListener('click', function () {
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
      });
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

    slider.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stopDrag);

    slider.addEventListener('touchstart', startDrag, { passive: true });
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
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var rotateX = ((y - centerY) / centerY) * -6.5;
        var rotateY = ((x - centerX) / centerX) * 6.5;

        card.style.transform = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) scale3d(1.018, 1.018, 1.018)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
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

    strip.addEventListener('mousedown', function (e) {
      isDown = true;
      strip.classList.add('is-dragging');
      startX = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
    });

    strip.addEventListener('mouseleave', function () {
      isDown = false;
      strip.classList.remove('is-dragging');
    });

    strip.addEventListener('mouseup', function () {
      isDown = false;
      strip.classList.remove('is-dragging');
    });

    strip.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      var x = e.pageX - strip.offsetLeft;
      var walk = (x - startX) * 1.8;
      strip.scrollLeft = scrollLeft - walk;
    });
  }

  /* -------------------------------------------------------------------
     8. Studio Clock & Location Coordinates
     ------------------------------------------------------------------- */
  function initStudioClock() {
    var clockEl = document.getElementById('liveStudioClock');
    if (!clockEl) return;

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
    setInterval(update, 1000);
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

    switcher.addEventListener('click', function (e) {
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
    });

    var saved = localStorage.getItem('studio_work_view_mode');
    if (saved) {
      var targetBtn = switcher.querySelector('button[data-view="' + saved + '"]');
      if (targetBtn) targetBtn.click();
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

    lbStage.addEventListener('click', function (e) {
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
    });

    function updateLoupe(e) {
      if (!isZoomed) return;
      var rect = lbStage.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      lbImg.style.transformOrigin = x + '% ' + y + '%';
      lbImg.style.transform = 'scale(2.2)';
    }

    lbStage.addEventListener('mousemove', function (e) {
      if (isZoomed) updateLoupe(e);
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isZoomed) {
        isZoomed = false;
        lbStage.classList.remove('is-zoomed');
        lbImg.style.transform = '';
      }
    });
  }

  /* -------------------------------------------------------------------
     DOM Ready Boot
     ------------------------------------------------------------------- */
  function init() {
    initStudioClock();
    initSoundToggle();
    initAmbienceToggle();
    initDarkroomToggle();
    initFilmStockSelector();
    initLensSimulator();
    initGradingSlider();
    init3DTilt();
    initFilmStrip();
    initCurtainReveals();
    initWorkViewSwitcher();
    initLightboxLoupe();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
