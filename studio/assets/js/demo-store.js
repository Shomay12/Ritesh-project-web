/*
  Demo data store
  ---------------
  Used only while Supabase keys are empty in config.js. Keeps sample content
  in localStorage so both the public website and the studio dashboard can be
  tried end to end before any backend exists. Clear it from the studio
  Settings page, or with localStorage.removeItem('studio_demo_v1').
*/
(function () {
  var KEY = 'studio_demo_v1';

  function unsplash(id, w, h) {
    return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&crop=faces,entropy&q=80&w=' + w + '&h=' + h;
  }

  function isoDay(offset) {
    var d = new Date();
    d.setDate(d.getDate() + offset);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function isoTime(offsetHours) {
    return new Date(Date.now() + offsetHours * 3600 * 1000).toISOString();
  }

  // [unsplash id, category, title, location, year, orientation, featured]
  var WORK = [
    ['1519741497674-611481863552', 'Weddings', 'The walk back from the mandap', 'Udaipur', 2025, 'l', true],
    ['1494790108377-be9c29b29330', 'Portraits', 'Naina, late afternoon', 'Bandra, Mumbai', 2025, 'p', true],
    ['1511285560929-80b456fea0bc', 'Weddings', 'Ten quiet minutes', 'Alibaug', 2024, 'p', true],
    ['1529626455594-4ff0802cfb7e', 'Editorial', 'Summer lookbook', 'Jaipur', 2024, 'p', false],
    ['1470071459604-3b5ec3a7fe05', 'Places', 'Fog over the ghats', 'Malshej', 2023, 'l', true],
    ['1465495976277-4387d4b0b4c6', 'Weddings', 'Holding on', 'Goa', 2025, 'l', false],
    ['1507003211169-0a1dd7228f2d', 'Portraits', 'Dev, for his first record', 'Pune', 2024, 'p', false],
    ['1515886657613-9f3515b0c78f', 'Editorial', 'Linen, for a Kochi label', 'Fort Kochi', 2025, 'p', true],
    ['1522673607200-164d1b6ce486', 'Weddings', 'After the speeches', 'Lonavala', 2024, 'l', false],
    ['1534528741775-53994a69daeb', 'Portraits', 'Studio, north light', 'Mumbai', 2023, 'p', false],
    ['1501785888041-af3ef285b470', 'Places', 'Pangong, before sunrise', 'Ladakh', 2023, 'l', false],
    ['1583939003579-730e3918a45a', 'Weddings', 'Getting ready', 'Jodhpur', 2025, 'p', false],
    ['1509631179647-0177331693ae', 'Editorial', 'Monsoon issue', 'Mumbai', 2024, 'p', false],
    ['1506794778202-cad84cf45f1d', 'Portraits', 'Arjun', 'Colaba, Mumbai', 2025, 'p', false],
    ['1469371670807-013ccf25f16a', 'Weddings', 'Last dance', 'Udaipur', 2024, 'l', false],
    ['1517841905240-472988babdf9', 'Portraits', 'Tara, between takes', 'Mumbai', 2024, 'p', false],
    ['1441974231531-c6227db76b6e', 'Places', 'Light through the teak', 'Wayanad', 2022, 'l', false],
    ['1537633552985-df8429e8048b', 'Weddings', 'Confetti, finally', 'Goa', 2023, 'p', false],
    ['1469334031218-e382a71b716b', 'Editorial', 'Resort campaign', 'Gokarna', 2025, 'l', false],
    ['1524504388940-b1c1722653e1', 'Portraits', 'Meher', 'Delhi', 2023, 'p', false]
  ];

  var GALLERY_IDS = [
    '1519741497674-611481863552', '1511285560929-80b456fea0bc', '1465495976277-4387d4b0b4c6',
    '1522673607200-164d1b6ce486', '1583939003579-730e3918a45a', '1469371670807-013ccf25f16a',
    '1537633552985-df8429e8048b', '1606800052052-a08af7148866', '1520854221256-17451cc331bf',
    '1494790108377-be9c29b29330', '1517841905240-472988babdf9', '1534528741775-53994a69daeb'
  ];

  function seed() {
    var portfolio = WORK.map(function (w, i) {
      var land = w[5] === 'l';
      var W = land ? 1800 : 1200, H = land ? 1200 : 1500;
      return {
        id: 'p' + (i + 1),
        created_at: isoTime(-24 * (60 - i)),
        title: w[2], category: w[1], location: w[3], year: w[4], description: '',
        image_path: unsplash(w[0], W, H),
        thumb_path: unsplash(w[0], Math.round(W / 2), Math.round(H / 2)),
        width: W, height: H, sort_order: i, featured: w[6], published: true
      };
    });

    var galleryId = 'g1';
    var photos = GALLERY_IDS.map(function (id, i) {
      var land = i % 3 === 0;
      var W = land ? 1800 : 1200, H = land ? 1200 : 1500;
      return {
        id: 'ph' + (i + 1), created_at: isoTime(-30), gallery_id: galleryId,
        filename: 'RK_' + String(2140 + i * 7).padStart(4, '0') + '.jpg',
        original_path: unsplash(id, W * 2, H * 2),
        preview_path: unsplash(id, W, H),
        thumb_path: unsplash(id, Math.round(W / 2.5), Math.round(H / 2.5)),
        width: W * 2, height: H * 2, size_bytes: 6200000 + i * 91000, sort_order: i
      };
    });

    return {
      portfolio_items: portfolio,
      bookings: [
        { id: 'b1', reference: 'AR-7KQ2', created_at: isoTime(-5), name: 'Priya Natarajan', email: 'priya.n@example.com', phone: '+91 98450 22113',
          session_type: 'Wedding', package: 'Full day', event_date: isoDay(64), event_time: 'Morning to late evening', location: 'Taj Lake Palace, Udaipur',
          guest_count: 220, budget: '3 to 4.5 lakh', referral: 'A friend', message: 'Two-day wedding, haldi on the first day. We would love someone who stays out of the way during the pheras but is there for everything.',
          status: 'new', deposit_paid: false, quoted_amount: null, internal_notes: null, confirmed_at: null, reminder_sent_at: null, followup_sent_at: null },
        { id: 'b2', reference: 'AR-3MD8', created_at: isoTime(-60), name: 'Karan Mehta', email: 'karan.mehta@example.com', phone: '+91 99300 87412',
          session_type: 'Portrait session', package: 'Two hours', event_date: isoDay(3), event_time: '4:30 pm', location: 'Carter Road, Bandra',
          guest_count: null, budget: 'Under 50,000', referral: 'Instagram', message: 'Portraits for my parents\u2019 35th anniversary.',
          status: 'confirmed', deposit_paid: true, quoted_amount: 24000, internal_notes: 'Bring the 85mm. Parents prefer not to be posed too much.', confirmed_at: isoTime(-50), reminder_sent_at: null, followup_sent_at: null },
        { id: 'b3', reference: 'AR-9TX4', created_at: isoTime(-90), name: 'Sana Qureshi', email: 'sana.q@example.com', phone: '+91 97690 11208',
          session_type: 'Wedding', package: 'Two days', event_date: isoDay(21), event_time: 'Both days', location: 'Brunton Boatyard, Fort Kochi',
          guest_count: 160, budget: '4.5 lakh and above', referral: 'Google', message: 'Nikah and reception.',
          status: 'confirmed', deposit_paid: true, quoted_amount: 410000, internal_notes: 'Second shooter: Rohan.', confirmed_at: isoTime(-80), reminder_sent_at: null, followup_sent_at: null },
        { id: 'b4', reference: 'AR-2HB6', created_at: isoTime(-400), name: 'Riya Desai', email: 'client@example.com', phone: '+91 98201 55634',
          session_type: 'Wedding', package: 'Full day', event_date: isoDay(-34), event_time: '', location: 'Udaipur',
          guest_count: 180, budget: '3 to 4.5 lakh', referral: 'A friend', message: '',
          status: 'completed', deposit_paid: true, quoted_amount: 320000, internal_notes: 'Album: 40 spreads, lay-flat.', confirmed_at: isoTime(-390), reminder_sent_at: isoTime(-34 * 24 - 72), followup_sent_at: null },
        { id: 'b5', reference: 'AR-5WN1', created_at: isoTime(-30), name: 'Neha Kulkarni', email: 'neha.k@example.com', phone: '',
          session_type: 'Editorial / commercial', package: '', event_date: isoDay(40), event_time: '', location: 'Studio, Mumbai',
          guest_count: null, budget: 'Let\u2019s discuss', referral: 'Saw your work in a magazine', message: 'Product and model shoot for a handloom saree label, around 25 looks.',
          status: 'new', deposit_paid: false, quoted_amount: null, internal_notes: null, confirmed_at: null, reminder_sent_at: null, followup_sent_at: null }
      ],
      messages: [
        { id: 'm1', created_at: isoTime(-3), name: 'Ananya Iyer', email: 'ananya.iyer@example.com', subject: 'Album reprint', message: 'Hi Ritesh, my parents would like a smaller copy of our album. Is that possible, and roughly what would it cost?', is_read: false },
        { id: 'm2', created_at: isoTime(-28), name: 'Vikram Shah', email: 'vikram@example.com', subject: 'Licensing one image', message: 'We would like to license the Ladakh frame for a hotel lobby print. Who should I speak to?', is_read: true }
      ],
      galleries: [
        { id: galleryId, created_at: isoTime(-30), title: 'Riya & Kunal', client_name: 'Riya Desai', client_email: 'client@example.com',
          event_date: isoDay(-34), booking_id: 'b4', cover_photo_id: 'ph1',
          note: 'Riya and Kunal, here is the full set from Udaipur. Mark the ones you love and I will use those to start the album. Take your time.',
          status: 'published', allow_download: true, expires_at: isoTime(24 * 60), published_at: isoTime(-29), notified_at: isoTime(-29), expiry_notice_sent_at: null }
      ],
      gallery_photos: photos,
      favorites: [
        { id: 'f1', created_at: isoTime(-20), gallery_id: galleryId, photo_id: 'ph2', client_email: 'client@example.com' },
        { id: 'f2', created_at: isoTime(-20), gallery_id: galleryId, photo_id: 'ph6', client_email: 'client@example.com' }
      ],
      downloads: [
        { id: 'd1', created_at: isoTime(-26), gallery_id: galleryId, photo_id: null, client_email: 'client@example.com', kind: 'zip' },
        { id: 'd2', created_at: isoTime(-4), gallery_id: galleryId, photo_id: 'ph2', client_email: 'client@example.com', kind: 'single' }
      ],
      availability_blocks: [
        { id: 'a1', day: isoDay(9), note: 'Travel', created_at: isoTime(-10) },
        { id: 'a2', day: isoDay(10), note: 'Travel', created_at: isoTime(-10) },
        { id: 'a3', day: isoDay(33), note: 'Family wedding', created_at: isoTime(-10) }
      ]
    };
  }

  var cache = null;

  function load() {
    if (cache) return cache;
    try { cache = JSON.parse(localStorage.getItem(KEY)); } catch (e) { cache = null; }
    if (!cache || !cache.portfolio_items) { cache = seed(); save(); }
    return cache;
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(cache)); }
    catch (e) { console.warn('Demo storage is full. Older demo uploads may not persist.', e); }
  }

  window.DemoStore = {
    all: function (table) { return load()[table] || []; },
    insert: function (table, row) {
      var db = load();
      row = Object.assign({ id: 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), created_at: new Date().toISOString() }, row);
      (db[table] = db[table] || []).push(row);
      save();
      return row;
    },
    update: function (table, id, patch) {
      var rows = load()[table] || [];
      var row = rows.find(function (r) { return r.id === id; });
      if (row) Object.assign(row, patch);
      save();
      return row;
    },
    remove: function (table, predicate) {
      var db = load();
      db[table] = (db[table] || []).filter(function (r) { return !predicate(r); });
      save();
    },
    reset: function () { localStorage.removeItem(KEY); cache = null; load(); }
  };
})();

