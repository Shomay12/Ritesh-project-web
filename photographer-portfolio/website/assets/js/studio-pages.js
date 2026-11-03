/* ===================================================================
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
    title: "Ritesh Farswan &mdash; Documentary &amp; Portrait Photography",
    html: "<!-- Hero Slider with Analog Frame Registration Marks -->\n    <section class=\"hero wrap\" aria-label=\"Selected photographs\">\n      <div class=\"hero-frame\" id=\"heroFrame\">\n        <!-- Technical Crosshairs (+) -->\n        <span class=\"frame-mark mark-tl\">+</span>\n        <span class=\"frame-mark mark-tr\">+</span>\n        <span class=\"frame-mark mark-bl\">+</span>\n        <span class=\"frame-mark mark-br\">+</span>\n\n        <div class=\"hero-slide is-active\">\n          <img src=\"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=2000\"\n            alt=\"Bride and groom walking through stone archway in Udaipur\" width=\"2000\" height=\"1333\">\n        </div>\n        <div class=\"hero-slide\">\n          <img src=\"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=2000\"\n            alt=\"Natural afternoon light portrait in Bandra\" width=\"2000\" height=\"1333\">\n        </div>\n        <div class=\"hero-slide\">\n          <img src=\"https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=2000\"\n            alt=\"Early morning fog over Western Ghats\" width=\"2000\" height=\"1333\">\n        </div>\n      </div>\n      <div class=\"hero-meta\">\n        <div class=\"exif-tag\" id=\"heroCaption\">Udaipur, Rajasthan &middot; 50mm f/1.8 &middot; 1/500s &middot; ISO 200\n        </div>\n        <div class=\"hero-controls\">\n          <button type=\"button\" id=\"heroPrev\">&larr; Previous</button>\n          <span class=\"hero-count\" id=\"heroCount\">01 / 03</span>\n          <button type=\"button\" id=\"heroNext\">Next &rarr;</button>\n        </div>\n      </div>\n    </section>\n\n    <!-- Geographic Marquee Ticker -->\n    <div class=\"marquee-strip\" style=\"margin-top: 48px;\">\n      <div class=\"marquee-track\">\n        <span>Mumbai &middot; 18.9220&deg; N</span>\n        <span>Udaipur &middot; Lake Palace</span>\n        <span>Jaipur &middot; Amer Haveli</span>\n        <span>Fort Kochi &middot; Malabar Coast</span>\n        <span>Goa &middot; South Coast</span>\n        <span>Vogue India Feature</span>\n        <span>Architectural Digest</span>\n        <span>Platform Magazine</span>\n        <span>Mumbai &middot; 18.9220&deg; N</span>\n        <span>Udaipur &middot; Lake Palace</span>\n        <span>Jaipur &middot; Amer Haveli</span>\n        <span>Fort Kochi &middot; Malabar Coast</span>\n        <span>Goa &middot; South Coast</span>\n      </div>\n    </div>\n\n    <!-- Studio Intro -->\n    <section class=\"section\">\n      <div class=\"wrap intro\">\n        <div class=\"intro-side\">\n          <span class=\"label\">The Studio Practice</span>\n          <div class=\"exif-tag\" style=\"margin-top: 14px;\">[120 MEDIUM FORMAT / 35MM PRIMES]</div>\n        </div>\n        <div>\n          <h1 class=\"lede\">\n            I make photographs of marriages, solitary portraits, and places with long memory. The approach is\n            deliberate, unobtrusive, and unhurried.\n          </h1>\n          <div class=\"intro-body\">\n            <div>\n              <p>\n                A wedding is not a production set. My work centers on the quiet gestures between formal events&mdash;the\n                mother holding a pallu, two cousins laughing behind the marquee, the fifteen unscripted minutes after\n                the rituals when the dust settles.\n              </p>\n            </div>\n            <div>\n              <p>\n                Working with available light and medium format digital equipment, I deliver complete documentary records\n                alongside curated albums bound in linen. Based in Mumbai; available wherever your gathering happens.\n              </p>\n              <p style=\"margin-top: 24px;\">\n                <a class=\"link\" href=\"about.html\">Read full studio philosophy &rarr;</a>\n              </p>\n            </div>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- 35mm Film Strip Continuous Reel -->\n    <section class=\"film-strip-wrap\" aria-label=\"35mm film strip contact roll\">\n      <div class=\"film-strip-header\">\n        <div>35mm Film Contact Strip &middot; Kodak Portra 400 &middot; Safety Film</div>\n        <div>Drag to examine frames &rarr;</div>\n      </div>\n      <div class=\"film-strip-track\" id=\"filmStripTrack\">\n        <div class=\"film-frame-cell\">\n          <div class=\"film-sprockets\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n          <div class=\"frame\">\n            <img src=\"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800\"\n              alt=\"Roll frame 21\" loading=\"lazy\">\n          </div>\n          <div class=\"film-rebate-info\">\n            <span>&#9650; 21</span>\n            <span>KODAK 400</span>\n            <span>21A</span>\n          </div>\n          <div class=\"film-sprockets\" style=\"padding-top: 8px;\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n        </div>\n\n        <div class=\"film-frame-cell\">\n          <div class=\"film-sprockets\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n          <div class=\"frame\">\n            <img src=\"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800\"\n              alt=\"Roll frame 22\" loading=\"lazy\">\n          </div>\n          <div class=\"film-rebate-info\">\n            <span>&#9650; 22</span>\n            <span>KODAK 400</span>\n            <span>22A</span>\n          </div>\n          <div class=\"film-sprockets\" style=\"padding-top: 8px;\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n        </div>\n\n        <div class=\"film-frame-cell\">\n          <div class=\"film-sprockets\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n          <div class=\"frame\">\n            <img src=\"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800\"\n              alt=\"Roll frame 23\" loading=\"lazy\">\n          </div>\n          <div class=\"film-rebate-info\">\n            <span>&#9650; 23</span>\n            <span>KODAK 400</span>\n            <span>23A</span>\n          </div>\n          <div class=\"film-sprockets\" style=\"padding-top: 8px;\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n        </div>\n\n        <div class=\"film-frame-cell\">\n          <div class=\"film-sprockets\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n          <div class=\"frame\">\n            <img src=\"https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=800\"\n              alt=\"Roll frame 24\" loading=\"lazy\">\n          </div>\n          <div class=\"film-rebate-info\">\n            <span>&#9650; 24</span>\n            <span>KODAK 400</span>\n            <span>24A</span>\n          </div>\n          <div class=\"film-sprockets\" style=\"padding-top: 8px;\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n        </div>\n\n        <div class=\"film-frame-cell\">\n          <div class=\"film-sprockets\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n          <div class=\"frame\">\n            <img src=\"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800\"\n              alt=\"Roll frame 25\" loading=\"lazy\">\n          </div>\n          <div class=\"film-rebate-info\">\n            <span>&#9650; 25</span>\n            <span>KODAK 400</span>\n            <span>25A</span>\n          </div>\n          <div class=\"film-sprockets\" style=\"padding-top: 8px;\">\n            <span class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span><span\n              class=\"sprocket\"></span><span class=\"sprocket\"></span><span class=\"sprocket\"></span>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Selected Works Grid with 3D Tilt Perspective -->\n    <section class=\"section section--tint\" aria-label=\"Curated works\">\n      <div class=\"wrap\">\n        <div class=\"section-head\">\n          <div>\n            <span class=\"label\">Curated Selection &middot; 2023&ndash;2025</span>\n            <h2>Recent <em>Portfolios</em></h2>\n          </div>\n          <div>\n            <a class=\"link\" href=\"work.html\">View all galleries (20) &rarr;</a>\n          </div>\n        </div>\n\n        <div class=\"selected\">\n          <figure class=\"s1 curtain tilt-frame\">\n            <a class=\"frame ratio-32\" href=\"work.html\">\n              <span class=\"frame-mark mark-tl\">+</span>\n              <span class=\"frame-mark mark-br\">+</span>\n              <img src=\"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1600\"\n                alt=\"Couples portrait along the coastline in Alibaug\" width=\"1600\" height=\"1067\" loading=\"lazy\">\n            </a>\n            <figcaption>\n              <span class=\"t\">Ten quiet minutes &middot; <em>Alibaug</em></span>\n              <span class=\"exif-tag\">Weddings, 2024 &middot; 85mm f/1.4</span>\n            </figcaption>\n          </figure>\n\n          <figure class=\"s2 curtain tilt-frame\">\n            <a class=\"frame ratio-45\" href=\"work.html\">\n              <span class=\"frame-mark mark-tr\">+</span>\n              <span class=\"frame-mark mark-bl\">+</span>\n              <img src=\"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200\"\n                alt=\"Studio north light portrait in Mumbai\" width=\"1200\" height=\"1500\" loading=\"lazy\">\n            </a>\n            <figcaption>\n              <span class=\"t\">Studio, north light &middot; <em>Mumbai</em></span>\n              <span class=\"exif-tag\">Portraits, 2024</span>\n            </figcaption>\n          </figure>\n\n          <figure class=\"s3 curtain tilt-frame\">\n            <a class=\"frame ratio-45\" href=\"work.html\">\n              <span class=\"frame-mark mark-tl\">+</span>\n              <img src=\"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200\"\n                alt=\"Editorial lookbook in Fort Kochi\" width=\"1200\" height=\"1500\" loading=\"lazy\">\n            </a>\n            <figcaption>\n              <span class=\"t\">Linen, for a Kochi label</span>\n              <span class=\"exif-tag\">Editorial, 2025</span>\n            </figcaption>\n          </figure>\n\n          <figure class=\"s4 curtain tilt-frame\">\n            <a class=\"frame ratio-32\" href=\"work.html\">\n              <span class=\"frame-mark mark-tr\">+</span>\n              <img src=\"https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&q=80&w=1600\"\n                alt=\"Ceremony in South Goa\" width=\"1600\" height=\"1067\" loading=\"lazy\">\n            </a>\n            <figcaption>\n              <span class=\"t\">Holding on &middot; <em>Goa</em></span>\n              <span class=\"exif-tag\">Weddings, 2025</span>\n            </figcaption>\n          </figure>\n\n          <figure class=\"s5 curtain tilt-frame\">\n            <a class=\"frame ratio-wide\" href=\"work.html\">\n              <span class=\"frame-mark mark-tl\">+</span>\n              <span class=\"frame-mark mark-tr\">+</span>\n              <span class=\"frame-mark mark-bl\">+</span>\n              <span class=\"frame-mark mark-br\">+</span>\n              <img src=\"https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2200\"\n                alt=\"Cold morning light across Ladakh lake\" width=\"2200\" height=\"942\" loading=\"lazy\">\n            </a>\n            <figcaption>\n              <span class=\"t\">Pangong, before sunrise &middot; <em>Ladakh</em></span>\n              <span class=\"exif-tag\">Places, 2023 &middot; Natural Twilight</span>\n            </figcaption>\n          </figure>\n        </div>\n      </div>\n    </section>\n\n    <!-- Interactive Color Science & Darkroom Curation -->\n    <section class=\"section wrap grading-showcase\">\n      <div class=\"section-head\">\n        <div>\n          <span class=\"label\">Color Science &amp; Darkroom Curation</span>\n          <h2>Raw Sensor vs <em>Archival Grade</em></h2>\n        </div>\n        <div>\n          <span class=\"caption\">Drag the dividing bar to inspect the tonal curve</span>\n        </div>\n      </div>\n\n      <!-- Film Emulsion Stock Emulation Bar -->\n      <div class=\"film-stock-bar\">\n        <div style=\"display: flex; align-items: center; gap: 14px; flex-wrap: wrap;\">\n          <span class=\"label\" style=\"margin: 0;\">Film Emulsion:</span>\n          <div class=\"stock-btn-group\" role=\"group\" aria-label=\"Select photographic emulsion stock\">\n            <button type=\"button\" class=\"stock-btn\" data-stock=\"portra\" aria-pressed=\"true\">Kodak Portra 400</button>\n            <button type=\"button\" class=\"stock-btn\" data-stock=\"trix\" aria-pressed=\"false\">Kodak Tri-X 400\n              (B&amp;W)</button>\n            <button type=\"button\" class=\"stock-btn\" data-stock=\"fuji\" aria-pressed=\"false\">Fujifilm Pro 400H</button>\n          </div>\n        </div>\n        <div class=\"stock-status\">\n          <span>Active:</span>\n          <strong id=\"activeStockDisplay\">Kodak Portra 400 (Warm Skin / Gold Shadows)</strong>\n        </div>\n      </div>\n\n      <div class=\"grading-slider\" id=\"gradingSlider\" role=\"slider\"\n        aria-label=\"Compare RAW sensor capture with color graded final print\">\n        <!-- Graded Master Image (Background) -->\n        <div class=\"slider-graded\">\n          <img src=\"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1800\"\n            alt=\"Finished color graded fine art photograph\">\n        </div>\n        <!-- Raw Sensor Capture (Overlay) -->\n        <div class=\"slider-raw\">\n          <img src=\"https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=85&w=1800\"\n            alt=\"Unprocessed flat digital raw capture\">\n        </div>\n        <!-- Draggable Hairline Handle -->\n        <div class=\"slider-handle\">\n          <div class=\"slider-handle-tag\">&larr; RAW &middot; GRADED &rarr;</div>\n        </div>\n      </div>\n      <div\n        style=\"display: flex; justify-content: space-between; margin-top: 14px; font-size: 12px; color: var(--muted); font-family: var(--mono); flex-wrap: wrap; gap: 8px;\">\n        <span>LEFT: Uncalibrated Sensor Flat Profile</span>\n        <span>RIGHT: Bespoke Fine-Art Palette &middot; Silver Halide Tones</span>\n      </div>\n    </section>\n\n    <!-- Interactive Optical Lens & Perspective Simulator -->\n    <section class=\"section wrap lens-simulator-section\">\n      <div class=\"section-head\">\n        <div>\n          <span class=\"label\">Optics &amp; Perspective Physics</span>\n          <h2>Field of View &amp; <em>Lens Geometry</em></h2>\n        </div>\n        <div>\n          <span class=\"caption\">Toggle focal lengths to simulate optical compression &amp; framing</span>\n        </div>\n      </div>\n\n      <div class=\"lens-simulator\" id=\"lensSimulator\">\n        <div class=\"lens-sim-stage\">\n          <img class=\"lens-target-img\"\n            src=\"https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=85&w=1800\"\n            alt=\"Documentary perspective study\">\n          <div class=\"lens-reticle\"></div>\n          <div class=\"lens-viewfinder-overlay\">\n            <span>[+] CENTER AF &middot; SPOT 1.5%</span>\n            <span>1/500s &middot; ISO 400</span>\n          </div>\n          <div class=\"lens-viewfinder-bottom\">\n            <span>HASSELBLAD 907X</span>\n            <span id=\"simLensFov\">75.4&deg; Angle of View</span>\n          </div>\n        </div>\n\n        <div class=\"lens-sim-info\">\n          <div>\n            <span class=\"label\">Select Focal Length:</span>\n            <div class=\"lens-btn-group\" role=\"group\" aria-label=\"Select focal length\">\n              <button type=\"button\" class=\"lens-btn\" data-lens=\"28mm\" aria-pressed=\"true\">28mm Wide</button>\n              <button type=\"button\" class=\"lens-btn\" data-lens=\"50mm\" aria-pressed=\"false\">50mm Normal</button>\n              <button type=\"button\" class=\"lens-btn\" data-lens=\"85mm\" aria-pressed=\"false\">85mm Tele</button>\n            </div>\n            <h3 id=\"simLensName\">28mm f/2.8 Elmarit (Documentary Environmental)</h3>\n            <p id=\"simLensDesc\" style=\"color: var(--muted); font-size: 15px; line-height: 1.6; margin: 0;\">\n              Wide context; captures the full room architecture, surrounding family, and atmospheric spatial depth.\n            </p>\n          </div>\n\n          <div class=\"lens-metadata-grid\">\n            <div>\n              <span>Optical Glass</span>\n              <strong>German Aspherical Prime</strong>\n            </div>\n            <div>\n              <span>Aperture Setting</span>\n              <strong>f/2.8 Circular Diaphragm</strong>\n            </div>\n            <div>\n              <span>Distortion Profile</span>\n              <strong>&lt; 0.2% Linear Curvature</strong>\n            </div>\n            <div>\n              <span>Focus Distance</span>\n              <strong>1.8m Subject Plane</strong>\n            </div>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Client Quote -->\n    <section class=\"section section--dark\">\n      <div class=\"wrap quote-block\">\n        <div>\n          <span class=\"label\">From a recent client</span>\n          <p style=\"font-size: 14px; margin-top: 14px; color: #8e877c;\">\n            Udaipur, November 2024<br>\n            Commissioned for three days\n          </p>\n        </div>\n        <blockquote>\n          <p>\n            &ldquo;Looking back through our gallery was like reliving the day without anyone posing us. Ritesh caught the\n            things we didn't even notice happening: my father tearing up during the breakfast toast, and the late night\n            dance with our childhood friends when everyone had taken their shoes off.&rdquo;\n          </p>\n          <cite class=\"caption\">\n            <strong>Riya &amp; Kunal Desai</strong> &mdash; Bombay &amp; London\n          </cite>\n        </blockquote>\n      </div>\n    </section>\n\n    <!-- Working Method -->\n    <section class=\"section\">\n      <div class=\"wrap\">\n        <div class=\"section-head\">\n          <div>\n            <span class=\"label\">Ethos &amp; Technique</span>\n            <h2>How I <em>Work</em></h2>\n          </div>\n        </div>\n\n        <div class=\"process\">\n          <div class=\"curtain\">\n            <span class=\"label\">01 / Preparation</span>\n            <h3>Before the day</h3>\n            <p>\n              We speak about the rhythm of the day, family arrangements, and what matters to you. I scout locations\n              beforehand and plan around natural light transitions so nothing feels rushed.\n            </p>\n          </div>\n          <div class=\"curtain\">\n            <span class=\"label\">02 / Observation</span>\n            <h3>On the day</h3>\n            <p>\n              I work with quiet prime lenses and minimal gear. No bulky rigs, no constant directions, and no\n              interrupting conversations. The best photographs happen when people forget the lens exists.\n            </p>\n          </div>\n          <div class=\"curtain\">\n            <span class=\"label\">03 / Archival Delivery</span>\n            <h3>Afterwards</h3>\n            <p>\n              Every frame is individually color graded with an archival palette. You receive an online gallery with\n              direct full-resolution downloads and a private selection tool for print albums.\n            </p>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Direct Booking Callout -->\n    <section class=\"section section--tint\">\n      <div class=\"wrap cta\">\n        <span class=\"label\">Commission Inquiries</span>\n        <h2>Currently reserving dates for <em>2025 &amp; 2026</em>.</h2>\n        <div class=\"cta-row\">\n          <p>\n            I accept a limited number of commissions each season to ensure personal attention and archival care for\n            every gathering. Check real-time studio availability or reserve your date directly.\n          </p>\n          <div>\n            <a class=\"btn btn--solid\" href=\"booking.html\">\n              <span>Check Availability &amp; Book &rarr;</span>\n            </a>\n          </div>\n        </div>\n      </div>\n    </section>",
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
    title: "Selected Work &mdash; Ritesh Farswan Photography",
    html: "<div class=\"wrap page-head\">\n      <div class=\"page-head-row\">\n        <div>\n          <span class=\"label\">Archive &amp; Monograph Projects</span>\n          <h1>Selected <em>Photographs</em></h1>\n        </div>\n        <div>\n          <p class=\"lede\" style=\"margin: 0; font-size: 22px;\">\n            A continuous record of gatherings, private portraits, and landscapes from the Indian subcontinent.\n          </p>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"wrap\">\n      <!-- Work Controls (Category Filters + View Mode Switcher) -->\n      <div class=\"work-controls\">\n        <div class=\"filters\" id=\"categoryFilters\" role=\"tablist\" aria-label=\"Filter work by category\">\n          <button type=\"button\" class=\"filter-btn\" data-category=\"all\" aria-pressed=\"true\">All <sup>20</sup></button>\n          <button type=\"button\" class=\"filter-btn\" data-category=\"Weddings\" aria-pressed=\"false\">Weddings <sup>8</sup></button>\n          <button type=\"button\" class=\"filter-btn\" data-category=\"Portraits\" aria-pressed=\"false\">Portraits <sup>6</sup></button>\n          <button type=\"button\" class=\"filter-btn\" data-category=\"Editorial\" aria-pressed=\"false\">Editorial <sup>3</sup></button>\n          <button type=\"button\" class=\"filter-btn\" data-category=\"Places\" aria-pressed=\"false\">Places <sup>3</sup></button>\n        </div>\n\n        <div class=\"view-switcher\" id=\"viewModeSwitcher\" aria-label=\"Layout view switcher\">\n          <span class=\"label\" style=\"margin-right: 6px;\">View:</span>\n          <button type=\"button\" data-view=\"masonry\" aria-pressed=\"true\">Masonry</button>\n          <button type=\"button\" data-view=\"contact-sheet\" aria-pressed=\"false\">Contact Sheet 35mm</button>\n          <button type=\"button\" data-view=\"editorial\" aria-pressed=\"false\">Editorial Spread</button>\n        </div>\n      </div>\n\n      <!-- Film Emulsion Stock Emulation Bar -->\n      <div class=\"film-stock-bar\" style=\"margin-top: 0; margin-bottom: 36px;\">\n        <div style=\"display: flex; align-items: center; gap: 14px; flex-wrap: wrap;\">\n          <span class=\"label\" style=\"margin: 0;\">Film Emulsion:</span>\n          <div class=\"stock-btn-group\" role=\"group\" aria-label=\"Select photographic emulsion stock\">\n            <button type=\"button\" class=\"stock-btn\" data-stock=\"portra\" aria-pressed=\"true\">Kodak Portra 400</button>\n            <button type=\"button\" class=\"stock-btn\" data-stock=\"trix\" aria-pressed=\"false\">Kodak Tri-X 400 (B&amp;W)</button>\n            <button type=\"button\" class=\"stock-btn\" data-stock=\"fuji\" aria-pressed=\"false\">Fujifilm Pro 400H</button>\n          </div>\n        </div>\n        <div class=\"stock-status\">\n          <span>Active:</span>\n          <strong id=\"activeStockDisplay\">Kodak Portra 400 (Warm Skin / Gold Shadows)</strong>\n        </div>\n      </div>\n\n      <!-- Masonry Grid of images -->\n      <div class=\"masonry view--masonry\" id=\"workGrid\" aria-live=\"polite\">\n        <!-- Rendered via JS -->\n      </div>\n    </div>\n\n    <!-- Lightbox Modal with Loupe Zoom -->\n    <div class=\"lightbox\" id=\"lightbox\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Photograph viewer\">\n      <div class=\"lb-top\">\n        <span class=\"lb-count\" id=\"lbCount\">01 / 20</span>\n        <div style=\"font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: #8e877c;\">\n          Click image to inspect with 2.2&times; loupe zoom\n        </div>\n        <button type=\"button\" id=\"lbClose\">Close [Esc]</button>\n      </div>\n      <div class=\"lb-stage\">\n        <button type=\"button\" class=\"lb-prev\" id=\"lbPrev\" aria-label=\"Previous photograph\">&larr; Previous</button>\n        <img id=\"lbImg\" src=\"\" alt=\"\">\n        <button type=\"button\" class=\"lb-next\" id=\"lbNext\" aria-label=\"Next photograph\">Next &rarr;</button>\n      </div>\n      <div class=\"lb-bottom\">\n        <div class=\"lb-caption\" id=\"lbCaption\">Photograph title</div>\n        <div class=\"lb-actions\">\n          <a class=\"text-link\" id=\"lbInquire\" href=\"booking.html\">Inquire About This Style &rarr;</a>\n        </div>\n      </div>\n    </div>",
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
    title: "About &mdash; Ritesh Farswan Photography",
    html: "<div class=\"wrap page-head\">\n      <span class=\"label\">Biography &amp; Philosophy</span>\n      <h1>Observing, not <em>directing</em>.</h1>\n    </div>\n\n    <section class=\"wrap section--tight\">\n      <div class=\"about-grid\">\n        <div class=\"portrait\">\n          <div class=\"frame ratio-45 curtain tilt-frame\">\n            <span class=\"frame-mark mark-tl\">+</span>\n            <span class=\"frame-mark mark-br\">+</span>\n            <img src=\"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1200\" alt=\"Ritesh Farswan in studio\" width=\"1200\" height=\"1500\">\n          </div>\n          <figcaption style=\"margin-top: 14px;\">\n            <span class=\"exif-tag\">Ritesh Farswan &middot; Studio, Bandra West &middot; Natural North Light</span>\n          </figcaption>\n        </div>\n\n        <div class=\"about-text\">\n          <p>\n            I began photographing fifteen years ago with a mechanical 35mm camera gifted by my grandfather. That grounding taught me to measure every frame before releasing the shutter: waiting for light to fall across a room, noticing how hands rest when people are at ease, and never fabricating an emotion that did not happen on its own.\n          </p>\n          <p>\n            Today my practice is split between documentary commissions of weddings across India, private portrait sessions, and ongoing photographic surveys of architecture and natural geography.\n          </p>\n          <p>\n            In my wedding commissions, I refuse to turn a couple's private celebration into a choreographed film set. I do not bring artificial smoke machines, strobe banks that blind elderly relatives, or clipboards with ninety staged Pinterest poses. My presence is gentle, observant, and quiet. The images that remain thirty years from now are the honest ones: your grandmother whispering into your ear, your uncle laughing with a drink in hand, and the exhaustion and grace of the final hour.\n          </p>\n\n          <h3>Publications &amp; Features</h3>\n          <ul class=\"plain-list\">\n            <li>\n              <span>Architectural Digest India</span>\n              <span>Heritage &amp; Domestic Interiors, 2024</span>\n            </li>\n            <li>\n              <span>Vogue India</span>\n              <span>Weddings of Significance, 2023 &amp; 2024</span>\n            </li>\n            <li>\n              <span>Platform Magazine</span>\n              <span>Visual Arts Portfolio Feature, 2023</span>\n            </li>\n            <li>\n              <span>Harper's Bazaar India</span>\n              <span>Editorial Series &ldquo;Loom &amp; Dust&rdquo;, 2022</span>\n            </li>\n          </ul>\n\n          <h3>Working Standards</h3>\n          <ul class=\"plain-list\">\n            <li>\n              <span>Equipment</span>\n              <span>Medium format digital &amp; dual 35mm primes</span>\n            </li>\n            <li>\n              <span>Backups</span>\n              <span>Dual memory cards on-site + dual off-site cold storage</span>\n            </li>\n            <li>\n              <span>Color Grading</span>\n              <span>Individually tuned natural palette; no automated LUTs</span>\n            </li>\n            <li>\n              <span>Delivery</span>\n              <span>Curated online gallery + high-resolution master archive</span>\n            </li>\n          </ul>\n\n          <div class=\"signature\">Ritesh Farswan</div>\n\n          <div style=\"margin-top: 48px;\">\n            <a class=\"btn btn--solid\" href=\"booking.html\">\n              <span>Check Availability for Your Date &rarr;</span>\n            </a>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Two-photo layout with framing crosshairs -->\n    <section class=\"section section--tint\">\n      <div class=\"wrap\">\n        <div class=\"duo\">\n          <figure class=\"frame ratio-32 curtain tilt-frame\">\n            <span class=\"frame-mark mark-tl\">+</span>\n            <span class=\"frame-mark mark-tr\">+</span>\n            <img src=\"https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1400\" alt=\"Evening celebration at Lonavala\" width=\"1400\" height=\"933\" loading=\"lazy\">\n          </figure>\n          <figure class=\"frame ratio-32 curtain tilt-frame\">\n            <span class=\"frame-mark mark-bl\">+</span>\n            <span class=\"frame-mark mark-br\">+</span>\n            <img src=\"https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=1400\" alt=\"Couple dancing under lanterns\" width=\"1400\" height=\"933\" loading=\"lazy\">\n          </figure>\n        </div>\n      </div>\n    </section>",
    init: function () {
      // Film stock and shared modules
    }
  };

  /* -----------------------------------------------------------------
     4. Services & Investment (services.html)
     ----------------------------------------------------------------- */
  window.STUDIO_PAGES['services.html'] = {
    title: "Services &amp; Investment &mdash; Ritesh Farswan Photography",
    html: "<div class=\"wrap page-head\">\n      <span class=\"label\">Collections &amp; Pricing</span>\n      <h1>Transparent <em>Investment</em></h1>\n      <p class=\"lede\">\n        Straightforward coverage without tiered compromises or hidden licensing fees. All commissions include full personal printing rights and master-resolution files.\n      </p>\n    </div>\n\n    <!-- Collections -->\n    <section class=\"wrap\">\n      <div class=\"offer curtain\">\n        <div>\n          <span class=\"label\">Collection I</span>\n          <h2>The Gathering <em>Single-day celebration</em></h2>\n        </div>\n        <div>\n          <p>\n            Ideal for intimate ceremonies, single-day city weddings, or destination celebrations with a focused schedule.\n          </p>\n          <ul>\n            <li>Up to 10 hours continuous documentary coverage</li>\n            <li>Primary coverage by Ritesh Farswan + second photographer</li>\n            <li>500 to 700 color-graded, high-resolution master files</li>\n            <li>Private online gallery active for 12 months with batch downloads</li>\n            <li>Complimentary 30-page linen proof book</li>\n          </ul>\n        </div>\n        <div>\n          <div class=\"price\">\n            &#8377;2,80,000\n            <small>Taxes included. Travel outside Mumbai billed at cost.</small>\n          </div>\n          <div>\n            <a class=\"btn btn--solid\" href=\"booking.html?pkg=Single+Day+Wedding\">\n              <span>Reserve Date &rarr;</span>\n            </a>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"offer curtain\">\n        <div>\n          <span class=\"label\">Collection II</span>\n          <h2>Two-Day Commission <em>Multi-day celebration</em></h2>\n        </div>\n        <div>\n          <p>\n            Complete coverage of multi-part Indian ceremonies: Mehendi, Sangeet, morning rituals, pheras, and evening reception.\n          </p>\n          <ul>\n            <li>Up to 20 hours of coverage across two consecutive days</li>\n            <li>Ritesh Farswan with two associate documentary photographers</li>\n            <li>800 to 1,200 individually graded master-resolution files</li>\n            <li>Handcrafted 12&times;12 inch lay-flat heirloom leather album (40 spreads)</li>\n            <li>Private client gallery with perpetual download archive</li>\n          </ul>\n        </div>\n        <div>\n          <div class=\"price\">\n            &#8377;4,50,000\n            <small>Includes associate photographers. Flights &amp; lodging billed at actuals.</small>\n          </div>\n          <div>\n            <a class=\"btn btn--solid\" href=\"booking.html?pkg=Two+Day+Wedding\">\n              <span>Reserve Date &rarr;</span>\n            </a>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"offer curtain\">\n        <div>\n          <span class=\"label\">Collection III</span>\n          <h2>Portraits <em>In studio or on location</em></h2>\n        </div>\n        <div>\n          <p>\n            Quiet, unposed sittings for artists, couples, families, or editorial projects. Light, conversation, and patience.\n          </p>\n          <ul>\n            <li>2 to 3 hours sitting at studio or selected outdoor location</li>\n            <li>40 to 60 signature finished photographs</li>\n            <li>Full master-resolution digital download</li>\n            <li>Archival print set on Hahnem&uuml;hle cotton rag paper (five 8&times;10 prints)</li>\n          </ul>\n        </div>\n        <div>\n          <div class=\"price\">\n            &#8377;45,000\n            <small>Studio space in Bandra included.</small>\n          </div>\n          <div>\n            <a class=\"btn btn--solid\" href=\"booking.html?pkg=Portrait+Session\">\n              <span>Book Session &rarr;</span>\n            </a>\n          </div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Four Step Process -->\n    <section class=\"section section--dark\" style=\"margin-top: 80px;\">\n      <div class=\"wrap\">\n        <div class=\"section-head\">\n          <div>\n            <span class=\"label\">From Enquiry to Archive</span>\n            <h2>The <em>Process</em></h2>\n          </div>\n        </div>\n\n        <ol class=\"steps\">\n          <li class=\"curtain\">\n            <h3>Initial Conversation</h3>\n            <p>\n              We speak via phone or coffee to see if our aesthetic and temperament align. I share unedited full-gallery proofs so you can inspect realistic deliverables from start to finish.\n            </p>\n          </li>\n          <li class=\"curtain\">\n            <h3>Date Confirmation</h3>\n            <p>\n              To hold your date exclusively, we execute a simple digital agreement and a 30% retainer. Your date is permanently blocked on my calendar and no other bookings are accepted.\n            </p>\n          </li>\n          <li class=\"curtain\">\n            <h3>The Gathering</h3>\n            <p>\n              Before the day, we review the family schedule and natural lighting times. On the day, I work seamlessly alongside your family without demanding staged re-enactments.\n            </p>\n          </li>\n          <li class=\"curtain\">\n            <h3>Handcrafted Delivery</h3>\n            <p>\n              A sneak preview arrives within 72 hours. Your complete private web gallery goes live in 4 to 6 weeks, ready for high-resolution single or full zip archive download.\n            </p>\n          </li>\n        </ol>\n      </div>\n    </section>\n\n    <!-- FAQ Accordion -->\n    <section class=\"section\">\n      <div class=\"wrap narrow\">\n        <div class=\"section-head\" style=\"margin-bottom: 40px;\">\n          <div>\n            <span class=\"label\">Common Inquiries</span>\n            <h2>Frequently Asked <em>Questions</em></h2>\n          </div>\n        </div>\n\n        <div class=\"faq\">\n          <details>\n            <summary>How many photographs will we receive?</summary>\n            <div>\n              <p>\n                For a typical single-day wedding, you will receive between 500 and 700 finished photographs. For two days, 800 to 1,200. I believe in quality over reckless quantity: every image delivered is culled, individually adjusted for color, contrast, and skin tone, and ready for fine-art printing.\n              </p>\n            </div>\n          </details>\n\n          <details>\n            <summary>Do you travel for destination weddings?</summary>\n            <div>\n              <p>\n                Yes. Roughly half of my commissions are outside Mumbai—frequently in Udaipur, Goa, Jaipur, Kerala, and internationally. Travel and accommodation expenses are billed simply at cost with zero markup.\n              </p>\n            </div>\n          </details>\n\n          <details>\n            <summary>Do you provide RAW files?</summary>\n            <div>\n              <p>\n                I deliver finished master-resolution JPEGs. The editing and tonal curve are half of the artistic voice of the studio. Just as a chef does not serve raw flour and butter, I do not provide raw camera sensor files.\n              </p>\n            </div>\n          </details>\n\n          <details>\n            <summary>How does the client download portal work?</summary>\n            <div>\n              <p>\n                You and your family receive a secure link to your private gallery. You can view all images on desktop or mobile, mark favorites with a heart icon for album design, and download either individual high-res files or the full collection as a ZIP archive directly to your hard drive.\n              </p>\n            </div>\n          </details>\n\n          <details>\n            <summary>What is required to book a date?</summary>\n            <div>\n              <p>\n                A date is confirmed upon signature of our plain-English commission contract and receipt of the 30% retainer. The remaining balance is due two weeks before your first event date.\n              </p>\n            </div>\n          </details>\n        </div>\n\n        <div style=\"margin-top: 64px; text-align: center;\">\n          <a class=\"btn btn--solid\" href=\"booking.html\">\n            <span>Check Availability for Your Dates &rarr;</span>\n          </a>\n        </div>\n      </div>\n    </section>",
    init: function () {
      // Lens simulator and grading slider
    }
  };

  /* -----------------------------------------------------------------
     5. Check Dates & Reserve (booking.html)
     ----------------------------------------------------------------- */
  window.STUDIO_PAGES['booking.html'] = {
    title: "Check Dates &amp; Book &mdash; Ritesh Farswan Photography",
    html: "<div class=\"wrap page-head\">\n      <span class=\"label\">Commissions</span>\n      <h1>Check Dates &amp; <em>Inquire</em></h1>\n      <p class=\"lede\">\n        Select your date below to inspect studio availability. Once submitted, I will review the details and write back within 48 hours.\n      </p>\n    </div>\n\n    <div class=\"wrap\">\n      <div id=\"bookingConfirmation\" class=\"thanks\">\n        <span class=\"label\">Inquiry Received</span>\n        <h2>Thank you. Your inquiry is in hand.</h2>\n        <p class=\"ref\">Booking reference: <strong id=\"resRef\">AR-0000</strong></p>\n        <div style=\"max-width: 580px; margin-top: 24px;\">\n          <p>\n            A copy of this inquiry has been sent to your email address. I read each inquiry personally and will confirm calendar availability, provide a bespoke investment proposal, and suggest a time for a preliminary phone conversation.\n          </p>\n          <p style=\"margin-top: 36px;\">\n            <a class=\"btn btn--solid\" href=\"work.html\">\n              <span>Return to Portfolio &rarr;</span>\n            </a>\n          </p>\n        </div>\n      </div>\n\n      <form id=\"bookingForm\" novalidate>\n        <!-- Honeypot -->\n        <div class=\"hp\">\n          <label for=\"company\">Leave blank</label>\n          <input type=\"text\" id=\"company\" name=\"company\" tabindex=\"-1\" autocomplete=\"off\">\n        </div>\n\n        <!-- Section 1: Date & Availability -->\n        <div class=\"form-section\">\n          <header>\n            <span class=\"label\">Step 01</span>\n            <h2>Select Date</h2>\n            <p>\n              Dates crossed out with a strike-through are already committed or reserved for travel.\n            </p>\n          </header>\n          <div>\n            <div class=\"calendar\" id=\"calendarApp\">\n              <div class=\"cal-head\">\n                <strong id=\"calMonthYear\">November 2026</strong>\n                <div>\n                  <button type=\"button\" id=\"calPrev\">&larr; Prev</button>\n                  <button type=\"button\" id=\"calNext\">Next &rarr;</button>\n                </div>\n              </div>\n              <div class=\"cal-grid\" id=\"calGrid\">\n                <!-- Day cells rendered by JS -->\n              </div>\n              <div class=\"cal-legend\">\n                <span>Selected: <strong id=\"calSelectedDisplay\">None chosen</strong></span>\n                <span style=\"margin-left: 20px;\"><s>28</s> &mdash; Unavailable date</span>\n              </div>\n            </div>\n            <input type=\"hidden\" id=\"event_date\" name=\"event_date\" required>\n            <div id=\"dateError\" class=\"error\" style=\"margin-top: 8px;\"></div>\n          </div>\n        </div>\n\n        <!-- Section 2: Gathering Details -->\n        <div class=\"form-section\">\n          <header>\n            <span class=\"label\">Step 02</span>\n            <h2>Session Details</h2>\n            <p>Tell me about the nature and scale of your gathering.</p>\n          </header>\n          <div class=\"form-grid\">\n            <div class=\"field full\">\n              <label>Commission Type *</label>\n              <div class=\"choice\">\n                <label>\n                  <input type=\"radio\" name=\"session_type\" value=\"Wedding\" checked>\n                  <span>Wedding Commission</span>\n                </label>\n                <label>\n                  <input type=\"radio\" name=\"session_type\" value=\"Portrait session\">\n                  <span>Portrait Sitting</span>\n                </label>\n                <label>\n                  <input type=\"radio\" name=\"session_type\" value=\"Editorial / commercial\">\n                  <span>Editorial / Commercial</span>\n                </label>\n              </div>\n            </div>\n\n            <div class=\"field\">\n              <label for=\"package\">Desired Collection</label>\n              <select id=\"package\" name=\"package\">\n                <option value=\"Single-day wedding (Collection I)\">Single-day wedding (Collection I)</option>\n                <option value=\"Two-day commission (Collection II)\">Two-day commission (Collection II)</option>\n                <option value=\"Portrait sitting (Collection III)\">Portrait sitting (Collection III)</option>\n                <option value=\"Bespoke / Multi-day destination\">Bespoke / Multi-day destination</option>\n              </select>\n            </div>\n\n            <div class=\"field\">\n              <label for=\"location\">Location or Venue *</label>\n              <input type=\"text\" id=\"location\" name=\"location\" placeholder=\"e.g. Taj Lake Palace, Udaipur or Bandra studio\" required>\n              <span class=\"error\" id=\"err-location\"></span>\n            </div>\n\n            <div class=\"field\">\n              <label for=\"event_time\">Approximate Hours / Timing</label>\n              <input type=\"text\" id=\"event_time\" name=\"event_time\" placeholder=\"e.g. 4:00 PM to midnight\">\n            </div>\n\n            <div class=\"field\">\n              <label for=\"guest_count\">Estimated Guest Count</label>\n              <input type=\"number\" id=\"guest_count\" name=\"guest_count\" placeholder=\"e.g. 150\">\n            </div>\n          </div>\n        </div>\n\n        <!-- Section 3: Contact Details -->\n        <div class=\"form-section\">\n          <header>\n            <span class=\"label\">Step 03</span>\n            <h2>Your Contact</h2>\n            <p>Direct contact for proposals and planning notes.</p>\n          </header>\n          <div class=\"form-grid\">\n            <div class=\"field\">\n              <label for=\"name\">Full Name *</label>\n              <input type=\"text\" id=\"name\" name=\"name\" placeholder=\"First and last name\" required>\n              <span class=\"error\" id=\"err-name\"></span>\n            </div>\n\n            <div class=\"field\">\n              <label for=\"email\">Email Address *</label>\n              <input type=\"email\" id=\"email\" name=\"email\" placeholder=\"you@domain.com\" required>\n              <span class=\"error\" id=\"err-email\"></span>\n            </div>\n\n            <div class=\"field\">\n              <label for=\"phone\">Phone / WhatsApp *</label>\n              <input type=\"tel\" id=\"phone\" name=\"phone\" placeholder=\"+91 98000 00000\" required>\n              <span class=\"error\" id=\"err-phone\"></span>\n            </div>\n\n            <div class=\"field\">\n              <label for=\"budget\">Approximate Budget</label>\n              <select id=\"budget\" name=\"budget\">\n                <option value=\"\">Select range</option>\n                <option value=\"Under 1 lakh\">&#8377;45,000 &ndash; &#8377;1,00,000</option>\n                <option value=\"2 to 3.5 lakh\">&#8377;2,00,000 &ndash; &#8377;3,50,000</option>\n                <option value=\"3.5 to 5 lakh\">&#8377;3,50,000 &ndash; &#8377;5,00,000</option>\n                <option value=\"5 lakh and above\">&#8377;5,00,000 and above</option>\n              </select>\n            </div>\n\n            <div class=\"field full\">\n              <label for=\"message\">Notes, Family Details, or Story</label>\n              <textarea id=\"message\" name=\"message\" placeholder=\"Tell me a bit about what you have planned, family dynamics, specific ceremonies, or what brought you to my work.\"></textarea>\n            </div>\n\n            <div class=\"field full\">\n              <label for=\"referral\">How did you hear about the studio?</label>\n              <input type=\"text\" id=\"referral\" name=\"referral\" placeholder=\"e.g. Recommendation from a friend, Vogue, Instagram\">\n            </div>\n          </div>\n        </div>\n\n        <!-- Submission Row -->\n        <div class=\"form-actions\">\n          <button type=\"submit\" class=\"btn btn--solid\" id=\"submitBtn\">\n            <span>Submit Commission Inquiry &rarr;</span>\n          </button>\n          <p>\n            Your inquiry is processed securely. You will receive an instant confirmation receipt and direct email confirmation.\n          </p>\n          <div id=\"formStatus\" class=\"form-status\"></div>\n        </div>\n      </form>\n    </div>",
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
                if (span) span.textContent = 'Submit Commission Inquiry \u2192';
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
    title: "Contact &mdash; Ritesh Farswan Photography",
    html: "<div class=\"wrap page-head\">\n      <span class=\"label\">Inquiries &amp; Studio</span>\n      <h1>Direct <em>Correspondence</em></h1>\n      <p class=\"lede\">\n        For general queries, commercial commissions, print licensing, or press inquiries, write directly below. For wedding bookings, please use the <a class=\"text-link\" href=\"booking.html\">calendar reservation form</a>.\n      </p>\n    </div>\n\n    <div class=\"wrap section--tight\">\n      <div class=\"contact-grid\">\n        <div class=\"contact-details\">\n          <span class=\"label\">Studio Information</span>\n          <dl>\n            <dt class=\"label\">Location</dt>\n            <dd>Bandra West<br>Mumbai, Maharashtra 400050<br><span class=\"caption\">By appointment only &middot; 18.9220&deg; N, 72.8347&deg; E</span></dd>\n\n            <dt class=\"label\">Electronic Mail</dt>\n            <dd><a class=\"text-link\" href=\"mailto:photosritesh8@gmail.com\">photosritesh8@gmail.com</a></dd>\n\n            <dt class=\"label\">Telephone &amp; WhatsApp</dt>\n            <dd><a class=\"text-link\" href=\"tel:+919820041736\">+91 98200 41736</a></dd>\n\n            <dt class=\"label\">Social &amp; Dispatches</dt>\n            <dd><a class=\"text-link\" href=\"https://instagram.com/riteshfarswan.photo\" target=\"_blank\" rel=\"noopener\">@riteshfarswan.photo</a></dd>\n          </dl>\n        </div>\n\n        <div>\n          <form id=\"contactForm\" novalidate>\n            <div class=\"hp\">\n              <label for=\"company_name\">Leave empty</label>\n              <input type=\"text\" id=\"company_name\" name=\"company_name\" tabindex=\"-1\">\n            </div>\n\n            <div class=\"form-grid\">\n              <div class=\"field\">\n                <label for=\"contact_name\">Your Name *</label>\n                <input type=\"text\" id=\"contact_name\" name=\"name\" placeholder=\"Full name\" required>\n                <span class=\"error\" id=\"err-cname\"></span>\n              </div>\n\n              <div class=\"field\">\n                <label for=\"contact_email\">Email Address *</label>\n                <input type=\"email\" id=\"contact_email\" name=\"email\" placeholder=\"you@domain.com\" required>\n                <span class=\"error\" id=\"err-cemail\"></span>\n              </div>\n\n              <div class=\"field full\">\n                <label for=\"contact_subject\">Subject</label>\n                <input type=\"text\" id=\"contact_subject\" name=\"subject\" placeholder=\"e.g. Commercial lookbook inquiry / Print reprint\">\n              </div>\n\n              <div class=\"field full\">\n                <label for=\"contact_message\">Message *</label>\n                <textarea id=\"contact_message\" name=\"message\" placeholder=\"Write your message here...\" required></textarea>\n                <span class=\"error\" id=\"err-cmessage\"></span>\n              </div>\n            </div>\n\n            <div class=\"form-actions\" style=\"margin-top: 36px;\">\n              <button type=\"submit\" class=\"btn btn--solid\" id=\"contactSubmitBtn\">\n                <span>Send Message &rarr;</span>\n              </button>\n              <div id=\"contactStatus\" class=\"form-status\"></div>\n            </div>\n          </form>\n\n          <div id=\"contactSuccess\" class=\"thanks\">\n            <span class=\"label\">Sent</span>\n            <h2>Thank you for your message.</h2>\n            <p>\n              I read every message directly and will respond to your email address shortly.\n            </p>\n          </div>\n        </div>\n      </div>\n    </div>",
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
              if (span) span.textContent = 'Send Message \u2192';
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
    title: "Developer &amp; Systems &mdash; Shomay Singh Parihar",
    html: "<!-- Hero / Page Head -->\n    <div class=\"wrap page-head dev-hero\">\n\n      <h1>Shomay Singh <em>Parihar</em></h1>\n      <p class=\"lede\">\n        &ldquo;Doing what I love. Accidentally taking it way too far.&rdquo;\n      </p>\n      <div style=\"margin-top: 18px;\">\n        <span class=\"exif-tag\">\n          ARCHITECT &amp; DEVELOPER &middot; NOIDA, INDIA &middot; GITHUB.COM/SHOMAY12\n        </span>\n      </div>\n    </div>\n\n    <!-- Section 1: About Myself -->\n    <section class=\"wrap section--tight\">\n      <div class=\"dev-profile-wrap\">\n        <!-- Left: Avatar Frame -->\n        <div class=\"portrait\">\n          <div class=\"dev-avatar-box tilt-frame\">\n            <span class=\"frame-mark mark-tl\">+</span>\n            <span class=\"frame-mark mark-tr\">+</span>\n            <span class=\"frame-mark mark-bl\">+</span>\n            <span class=\"frame-mark mark-br\">+</span>\n            <img class=\"dev-avatar-img\" src=\"https://avatars.githubusercontent.com/u/200135348?v=4\"\n              alt=\"Shomay Singh Parihar &mdash; Developer &amp; Systems Architect\" width=\"600\" height=\"600\">\n          </div>\n          <figcaption style=\"margin-top: 14px;\">\n            <span class=\"exif-tag\">Shomay Singh Parihar &middot; @Shomay12 &middot; Noida, India</span>\n          </figcaption>\n        </div>\n\n        <!-- Right: Biography & Mindset -->\n        <div class=\"about-text\">\n          <span class=\"label\">Section 01</span>\n          <h2 style=\"font-size: clamp(34px, 4vw, 54px); margin: 6px 0 24px;\">About Myself</h2>\n          <p>\n            I am Shomay Singh Parihar, an AI Engineer, Data Scientist, and Systems Developer based in Noida, India. I am\n            driven by first-principles problem solving—breaking complex computational and design challenges down to\n            their fundamental axioms and constructing resilient, elegant solutions from the ground up.\n          </p>\n          <p>\n            My work spans machine learning research, distributed backend architecture, and building refined digital\n            experiences that feel tangible, responsive, and alive. I believe software engineering is at its highest form\n            when it bridges deep technical rigor with human sensibility—creating tools and interfaces that respect\n            craft, nuance, and user focus.\n          </p>\n          <p>\n            Whether architecting machine intelligence or engineering bespoke creative platforms, I pursue continuous\n            mastery: diagnosing failure modes, optimizing for performance, and executing with obsessive care.\n          </p>\n\n          <div class=\"signature\" style=\"margin-top: 36px;\">Shomay Singh Parihar</div>\n        </div>\n      </div>\n    </section>\n\n    <!-- Section 2: About This Project -->\n    <section class=\"section section--tint\">\n      <div class=\"wrap\">\n        <div class=\"section-head\" style=\"margin-bottom: 32px;\">\n          <div>\n            <span class=\"label\">Section 02</span>\n            <h2 style=\"font-size: clamp(34px, 4.5vw, 64px); margin-top: 8px;\">About This <em>Project</em></h2>\n          </div>\n          <span class=\"exif-tag\">Ritesh Farswan Photography &middot; Digital Platform</span>\n        </div>\n\n        <div class=\"about-text\" style=\"max-width: 920px;\">\n          <p>\n            When architecting the digital monograph and studio operating suite for <em>Ritesh Farswan Photography</em>,\n            the objective was uncompromising: reject contemporary AI template uniformity and build an authentic tribute\n            to the tactile heritage of medium format 35mm film photography.\n          </p>\n          <p>\n            Every dimension of this platform was engineered to reflect the precision of an analog darkroom:\n          </p>\n          <ul class=\"plain-list\" style=\"margin: 32px 0;\">\n            <li>\n              <strong>Acoustic Leaf Shutter Feedback</strong>\n              <span>Synthesizing mechanical leaf shutter clicks directly in the browser via the Web Audio API without\n                audio file latency.</span>\n            </li>\n            <li>\n              <strong>Continuous Ambient Acoustic Suite</strong>\n              <span>Traditional wedding background soundscape playing continuously across page transitions with state\n                persistence.</span>\n            </li>\n            <li>\n              <strong>Analog Safelight Darkroom Mode</strong>\n              <span>Instant amber safelight palette transformation with zero reflow, simulating physical darkroom paper\n                development.</span>\n            </li>\n            <li>\n              <strong>Private Client Proofing &amp; Archival</strong>\n              <span>Secured tokenized client portal with favorites marking, feedback notes, and ZIP master deliverable\n                downloads backed by Supabase.</span>\n            </li>\n            <li>\n              <strong>Studio Backoffice Suite</strong>\n              <span>Full administrative control panel for date availability, gallery management, photo upload pipelines,\n                and automated transactional emails.</span>\n            </li>\n          </ul>\n          <p>\n            The result is a unified platform where fine-art documentary photography and high-performance software\n            engineering exist in total harmony.\n          </p>\n        </div>\n      </div>\n    </section>\n\n    <!-- Section 3: Communication -->\n    <section class=\"section wrap\">\n      <div class=\"section-head\" style=\"margin-bottom: 12px;\">\n        <div>\n          <span class=\"label\">Section 03</span>\n          <h2 style=\"font-size: clamp(34px, 4.5vw, 64px); margin-top: 8px;\">Communication</h2>\n        </div>\n        <span class=\"exif-tag\">Connect &middot; Direct Channels</span>\n      </div>\n      <p style=\"max-width: 60ch; font-size: 17px; color: var(--muted); margin-bottom: 28px;\">\n        For direct technical correspondence, engineering inquiries, or to connect across my primary verified channels:\n      </p>\n\n      <div class=\"dev-comm-grid\">\n        <!-- 1. X / Twitter -->\n        <a class=\"dev-comm-card\" href=\"https://x.com/KJshomayyy\" target=\"_blank\" rel=\"noopener\">\n          <div class=\"comm-meta\">\n            <span class=\"comm-label\">X / Twitter</span>\n            <span class=\"comm-value\">@KJshomayyy</span>\n          </div>\n          <span class=\"comm-arrow\">&rarr;</span>\n        </a>\n\n        <!-- 2. Personal Website -->\n        <a class=\"dev-comm-card\" href=\"https://shomaysinghparihar.online\" target=\"_blank\" rel=\"noopener\">\n          <div class=\"comm-meta\">\n            <span class=\"comm-label\">Personal Website</span>\n            <span class=\"comm-value\">shomaysinghparihar.online</span>\n          </div>\n          <span class=\"comm-arrow\">&rarr;</span>\n        </a>\n\n        <!-- 3. GitHub -->\n        <a class=\"dev-comm-card\" href=\"https://github.com/Shomay12\" target=\"_blank\" rel=\"noopener\">\n          <div class=\"comm-meta\">\n            <span class=\"comm-label\">GitHub</span>\n            <span class=\"comm-value\">github.com/Shomay12</span>\n          </div>\n          <span class=\"comm-arrow\">&rarr;</span>\n        </a>\n\n        <!-- 4. Direct Mail -->\n        <a class=\"dev-comm-card\" href=\"mailto:shomaysinghparihar@gmail.com\">\n          <div class=\"comm-meta\">\n            <span class=\"comm-label\">Direct Mail</span>\n            <span class=\"comm-value\">shomaysinghparihar@gmail.com</span>\n          </div>\n          <span class=\"comm-arrow\">&rarr;</span>\n        </a>\n      </div>\n    </section>",
    init: function () {
      // Developer cards and layout
    }
  };

  /* Aliases */
  window.STUDIO_PAGES[''] = window.STUDIO_PAGES['index.html'];
  window.STUDIO_PAGES['/'] = window.STUDIO_PAGES['index.html'];
})();
