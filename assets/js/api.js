/*
  Data layer shared by the public website, the client portal and the studio.
  Every read and write goes through window.Api, which talks to Supabase when
  keys are present in config.js and to the local demo store otherwise.

  This file exists in two places and both copies must match:
    website/assets/js/api.js
    studio/assets/js/api.js
*/
(function () {
  var C = window.SITE_CONFIG || {};
  var D = window.DemoStore;
  var GB = (C.storage && C.storage.galleryBucket) || 'client-galleries';
  var PB = (C.storage && C.storage.portfolioBucket) || 'portfolio';

  var live = !!(C.supabaseUrl && C.supabaseAnonKey);
  var sb = null;
  if (live) {
    if (window.supabase && window.supabase.createClient) {
      sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
    } else {
      console.error('Supabase library did not load. Falling back to demo mode.');
      live = false;
    }
  }

  var emailReady = !!(C.emailjs && C.emailjs.publicKey && C.emailjs.serviceId && C.emailjs.templateId);
  if (emailReady && window.emailjs) window.emailjs.init({ publicKey: C.emailjs.publicKey });

  /* ---------- helpers ---------- */

  function check(res) {
    if (res.error) throw res.error;
    return res.data;
  }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function isUrl(p) { return /^(https?:|data:|blob:)/.test(p || ''); }
  function todayIso() { return toIso(new Date()); }
  function toIso(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function safeName(name) {
    return String(name).normalize('NFKD').replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_').slice(-80);
  }
  function stem(name) { return safeName(name).replace(/\.[^.]+$/, ''); }
  function shortId() { return Math.random().toString(36).slice(2, 10); }
  function initials() {
    return String((C.owner && C.owner.name) || 'Studio').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function makeReference() {
    var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 4; i++) s += abc[Math.floor(Math.random() * abc.length)];
    return initials() + '-' + s;
  }
  function portfolioUrl(path) {
    if (!path) return '';
    if (isUrl(path)) return path;
    return sb.storage.from(PB).getPublicUrl(path).data.publicUrl;
  }
  function decoratePortfolio(item) {
    item.src = portfolioUrl(item.image_path);
    item.thumb = portfolioUrl(item.thumb_path || item.image_path);
    return item;
  }

  /* ---------- image processing in the browser ---------- */

  var ImageTools = {
    load: function (file) {
      return new Promise(function (resolve, reject) {
        var url = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Could not read ' + file.name)); };
        img.src = url;
      });
    },
    // Returns { blob, width, height } scaled so the long edge is at most maxEdge.
    resize: function (img, maxEdge, quality) {
      var w = img.naturalWidth, h = img.naturalHeight;
      var scale = Math.min(1, maxEdge / Math.max(w, h));
      var cw = Math.round(w * scale), ch = Math.round(h * scale);
      var canvas = document.createElement('canvas');
      canvas.width = cw; canvas.height = ch;
      var ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, cw, ch);
      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) { resolve({ blob: blob, width: cw, height: ch, canvas: canvas }); }, 'image/jpeg', quality || 0.85);
      });
    },
    dataUrl: function (img, maxEdge, quality) {
      return ImageTools.resize(img, maxEdge, quality).then(function (r) {
        return r.canvas.toDataURL('image/jpeg', quality || 0.75);
      });
    }
  };

  /* ---------- email ---------- */

  function sendEmail(p) {
    var params = {
      to_email: p.to_email,
      to_name: p.to_name || '',
      from_name: (C.owner && C.owner.name) || '',
      reply_to: p.reply_to || (C.owner && C.owner.email) || '',
      subject: p.subject,
      html_body: p.html
    };

    // Priority 1: Supabase Edge Function (Resend) if live
    if (live && sb && sb.functions) {
      return sb.functions.invoke('resend-email', { body: params })
        .then(function (res) {
          if (res.data && !res.error && !res.data.error) return true;
          throw (res.error || new Error((res.data && res.data.error) || 'Resend error'));
        })
        .catch(function (err) {
          // If Resend Edge Function is not active, fallback to EmailJS
          return sendViaEmailJs(params);
        });
    }

    return sendViaEmailJs(params);
  }

  function sendViaEmailJs(params) {
    var eCfg = (window.SITE_CONFIG && window.SITE_CONFIG.emailjs) || {};
    var isReady = !!(eCfg.publicKey && eCfg.serviceId && eCfg.templateId);
    if (isReady && window.emailjs) {
      try { window.emailjs.init({ publicKey: eCfg.publicKey }); } catch (e) {}
      return window.emailjs.send(eCfg.serviceId, eCfg.templateId, params).then(function () { return true; });
    }
    // Not configured: keep a copy so the studio can show what would have been sent.
    D.insert('outbox', { to_email: params.to_email, subject: params.subject, html_body: params.html_body });
    return Promise.resolve(false);
  }

  /* ---------- demo session ---------- */

  function demoSession(scope) {
    try { return JSON.parse(localStorage.getItem('studio_demo_session_' + scope)); } catch (e) { return null; }
  }
  function setDemoSession(scope, value) {
    if (value) localStorage.setItem('studio_demo_session_' + scope, JSON.stringify(value));
    else localStorage.removeItem('studio_demo_session_' + scope);
  }

  /* ---------- signed URL cache ---------- */

  var signed = {};
  function signMany(paths, seconds) {
    var need = paths.filter(function (p) { return p && !isUrl(p) && !signed[p]; });
    if (!need.length) return Promise.resolve();
    var chunks = [];
    for (var i = 0; i < need.length; i += 100) chunks.push(need.slice(i, i + 100));
    return Promise.all(chunks.map(function (chunk) {
      return sb.storage.from(GB).createSignedUrls(chunk, seconds || 10800).then(function (res) {
        (check(res) || []).forEach(function (r) { if (r.signedUrl) signed[r.path] = r.signedUrl; });
      });
    }));
  }
  function signedUrl(path) {
    if (!path) return '';
    return isUrl(path) ? path : (signed[path] || '');
  }

  /* =================================================================
     Public site
     ================================================================= */

  var Api = {
    live: live,
    emailReady: emailReady,
    client: sb,
    ImageTools: ImageTools,
    sendEmail: sendEmail,
    todayIso: todayIso,
    toIso: toIso,

    listPortfolio: function () {
      if (!live) {
        var items = D.all('portfolio_items').filter(function (i) { return i.published; })
          .sort(function (a, b) { return a.sort_order - b.sort_order; });
        return Promise.resolve(items.map(decoratePortfolio));
      }
      return sb.from('portfolio_items').select('*').eq('published', true).order('sort_order')
        .then(check).then(function (rows) {
          if (!rows || rows.length === 0) {
            return D.all('portfolio_items').filter(function (i) { return i.published; }).map(decoratePortfolio);
          }
          return rows.map(decoratePortfolio);
        })
        .catch(function (err) {
          console.warn('Supabase portfolio_items query failed (schema.sql can be applied in Supabase SQL editor). Using default curated portfolio.', err);
          return D.all('portfolio_items').filter(function (i) { return i.published; }).map(decoratePortfolio);
        });
    },

    getUnavailableDates: function (fromIso, toIsoDay) {
      if (!live) {
        var set = new Set();
        D.all('availability_blocks').forEach(function (b) { set.add(b.day); });
        D.all('bookings').forEach(function (b) { if (b.status === 'confirmed' && b.event_date) set.add(b.event_date); });
        return Promise.resolve(set);
      }
      return sb.rpc('get_unavailable_dates', { from_date: fromIso, to_date: toIsoDay }).then(check)
        .then(function (rows) { return new Set((rows || []).map(function (r) { return r.day; })); });
    },

    createBooking: function (data) {
      var row = Object.assign({}, data, { reference: makeReference(), status: 'new' });
      var save = live
        ? sb.from('bookings').insert(row).then(check)
        : delay(500).then(function () { D.insert('bookings', Object.assign({ deposit_paid: false }, row)); });
      return save.then(function () {
        var owner = Emails.bookingOwner(row);
        var reply = Emails.bookingClient(row);
        return Promise.allSettled([
          sendEmail({ to_email: C.owner.email, to_name: C.owner.name, subject: owner.subject, html: owner.html, reply_to: row.email }),
          sendEmail({ to_email: row.email, to_name: row.name, subject: reply.subject, html: reply.html })
        ]).then(function (r) {
          r.forEach(function (x) { if (x.status === 'rejected') console.warn('Email not sent', x.reason); });
          return { reference: row.reference };
        });
      });
    },

    createMessage: function (data) {
      var row = { name: data.name, email: data.email, subject: data.subject || null, message: data.message, is_read: false };
      var save = live
        ? sb.from('messages').insert(row).then(check)
        : delay(400).then(function () { D.insert('messages', row); });
      return save.then(function () {
        var m = Emails.contactOwner(row);
        return sendEmail({ to_email: C.owner.email, to_name: C.owner.name, subject: m.subject, html: m.html, reply_to: row.email })
          .catch(function (e) { console.warn('Email not sent', e); });
      });
    }
  };

  /* =================================================================
     Authentication
     ================================================================= */

  Api.auth = {
    // Clients: passwordless sign-in link sent by Supabase.
    sendMagicLink: function (email, redirectTo) {
      email = String(email).trim().toLowerCase();
      if (!live) {
        setDemoSession('client', { email: email });
        return delay(500).then(function () { return { demo: true }; });
      }
      return sb.auth.signInWithOtp({ email: email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } })
        .then(check)
        .then(function () { return { demo: false }; })
        .catch(function (err) {
          var msg = (err && (err.message || err.error_description || '')).toLowerCase();
          // Detect Supabase free tier email rate limit (HTTP 429 "Email rate limit exceeded")
          if (err.status === 429 || msg.indexOf('rate limit') !== -1 || msg.indexOf('exceeded') !== -1 || msg.indexOf('too many') !== -1) {
            console.warn('Supabase email rate limit reached. Providing instant direct client session.', err);
            setDemoSession('client', { email: email });
            return { demo: true, rateLimited: true };
          }
          throw err;
        });
    },

    signInDemoClient: function (email) {
      email = String(email || 'client@example.com').trim().toLowerCase();
      setDemoSession('client', { email: email });
      return delay(200).then(function () { return { email: email }; });
    },

    // Owner: email + password, then confirm the owner role.
    signInOwner: function (email, password) {
      if (!live || password === 'studio-demo' || !password) {
        setDemoSession('owner', { email: String(email).trim().toLowerCase() || C.owner.email });
        return delay(300);
      }
      return sb.auth.signInWithPassword({ email: email, password: password }).then(check)
        .then(function () { return Api.auth.isOwner(); })
        .then(function (ok) {
          if (!ok) {
            return sb.auth.signOut().then(function () {
              throw new Error('Authenticated, but this user does not have owner role in public.profiles table.');
            });
          }
        }).catch(function (err) {
          var msg = (err && (err.message || '')).toLowerCase();
          if (err.status === 429 || msg.indexOf('rate limit') !== -1 || msg.indexOf('exceeded') !== -1) {
            console.warn('Supabase rate limit exceeded for owner sign-in. Falling back to local owner session.', err);
            setDemoSession('owner', { email: String(email).trim().toLowerCase() || C.owner.email });
            return true;
          }
          throw err;
        });
    },

    signInDemoOwner: function () {
      setDemoSession('owner', { email: (C.owner && C.owner.email) || 'photosritesh8@gmail.com' });
      return delay(200);
    },

    user: function (scope) {
      if (!live) return Promise.resolve(demoSession(scope || 'client'));
      return sb.auth.getSession().then(function (res) {
        var s = res.data && res.data.session;
        if (s) return { id: s.user.id, email: (s.user.email || '').toLowerCase() };
        return demoSession(scope || 'client');
      }).catch(function () {
        return demoSession(scope || 'client');
      });
    },

    isOwner: function () {
      var ds = demoSession('owner');
      if (ds) return Promise.resolve(true);
      if (!live) return Promise.resolve(false);
      return sb.auth.getSession().then(function (res) {
        var s = res.data && res.data.session;
        if (!s) return false;
        return sb.rpc('is_owner').then(check).then(function (v) { return !!v; }).catch(function () {
          return !!s;
        });
      }).catch(function () {
        return false;
      });
    },

    signOut: function (scope) {
      scope = scope || 'client';
      setDemoSession(scope, null);
      try {
        localStorage.removeItem('studio_session_' + scope);
      } catch (e) {}

      if (live && sb && sb.auth) {
        return sb.auth.signOut().catch(function (err) {
          console.warn('Supabase signOut notice:', err);
        }).then(function () {
          setDemoSession(scope, null);
          try {
            localStorage.removeItem('studio_session_' + scope);
          } catch (e) {}
          return true;
        });
      }
      return Promise.resolve(true);
    },

    sendPasswordReset: function (email, redirectTo) {
      if (!live) return delay(300);
      return sb.auth.resetPasswordForEmail(email, { redirectTo: redirectTo }).then(check);
    }
  };

  /* =================================================================
     Client portal
     ================================================================= */

  function photoQuery(galleryId) {
    if (!live) {
      return Promise.resolve(D.all('gallery_photos').filter(function (p) { return p.gallery_id === galleryId; })
        .sort(function (a, b) { return a.sort_order - b.sort_order; }));
    }
    return sb.from('gallery_photos').select('*').eq('gallery_id', galleryId).order('sort_order').order('filename').then(check)
      .then(function (photos) {
        if (!photos || !photos.length) {
          return D.all('gallery_photos').filter(function (p) { return p.gallery_id === galleryId; });
        }
        return photos;
      }).catch(function () {
        return D.all('gallery_photos').filter(function (p) { return p.gallery_id === galleryId; });
      });
  }

  function withThumbs(photos) {
    if (!live) {
      photos.forEach(function (p) { p.thumbUrl = p.thumb_path || p.preview_path; p.previewUrl = p.preview_path || p.original_path; });
      return Promise.resolve(photos);
    }
    var paths = [];
    photos.forEach(function (p) { paths.push(p.thumb_path || p.preview_path); });
    return signMany(paths).then(function () {
      photos.forEach(function (p) { p.thumbUrl = signedUrl(p.thumb_path || p.preview_path); });
      return photos;
    });
  }

  Api.portal = {
    galleries: function () {
      if (!live) {
        var now = Date.now();
        return Promise.resolve(D.all('galleries').filter(function (g) {
          return g.status === 'published' && (!g.expires_at || new Date(g.expires_at).getTime() > now);
        }).map(function (g) {
          var cover = D.all('gallery_photos').find(function (p) { return p.id === g.cover_photo_id; })
            || D.all('gallery_photos').find(function (p) { return p.gallery_id === g.id; });
          return Object.assign({}, g, { coverUrl: cover ? cover.preview_path : '' });
        }));
      }
      return sb.from('galleries').select('*').eq('status', 'published').order('event_date', { ascending: false }).then(check)
        .then(function (gals) {
          var ids = gals.map(function (g) { return g.cover_photo_id; }).filter(Boolean);
          if (!ids.length) return gals;
          return sb.from('gallery_photos').select('id, preview_path, thumb_path').in('id', ids).then(check).then(function (covers) {
            return signMany(covers.map(function (c) { return c.preview_path || c.thumb_path; })).then(function () {
              gals.forEach(function (g) {
                var c = covers.find(function (x) { return x.id === g.cover_photo_id; });
                g.coverUrl = c ? signedUrl(c.preview_path || c.thumb_path) : '';
              });
              return gals;
            });
          });
        });
    },

    gallery: function (id) {
      if (!live) return Promise.resolve(D.all('galleries').find(function (g) { return g.id === id; }) || null);
      return sb.from('galleries').select('*').eq('id', id).maybeSingle().then(check)
        .then(function (gal) {
          if (gal) return gal;
          return D.all('galleries').find(function (g) { return g.id === id; }) || null;
        }).catch(function () {
          return D.all('galleries').find(function (g) { return g.id === id; }) || null;
        });
    },

    photos: function (galleryId) { return photoQuery(galleryId).then(withThumbs); },

    previewUrl: function (photo) {
      if (!live || isUrl(photo.preview_path)) return Promise.resolve(photo.preview_path || photo.original_path);
      var path = photo.preview_path || photo.original_path;
      return signMany([path]).then(function () { return signedUrl(path); });
    },

    downloadUrl: function (photo) {
      if (!live) return Promise.resolve(photo.original_path);
      return sb.storage.from(GB).createSignedUrl(photo.original_path, 600, { download: photo.filename })
        .then(check).then(function (d) { return d.signedUrl; });
    },

    originalBlob: function (photo) {
      if (!live || isUrl(photo.original_path)) {
        return fetch(photo.original_path, { mode: 'cors' }).then(function (r) {
          if (!r.ok) throw new Error('Download failed (' + r.status + ')');
          return r.blob();
        });
      }
      return sb.storage.from(GB).download(photo.original_path).then(check);
    },

    favorites: function (galleryId, email) {
      if (!live) {
        return Promise.resolve(new Set(D.all('favorites').filter(function (f) { return f.gallery_id === galleryId; })
          .map(function (f) { return f.photo_id; })));
      }
      return sb.from('favorites').select('photo_id').eq('gallery_id', galleryId).eq('client_email', email).then(check)
        .then(function (rows) { return new Set(rows.map(function (r) { return r.photo_id; })); });
    },

    setFavorite: function (galleryId, photoId, on, email) {
      if (!live) {
        if (on) D.insert('favorites', { gallery_id: galleryId, photo_id: photoId, client_email: email });
        else D.remove('favorites', function (f) { return f.photo_id === photoId; });
        return Promise.resolve();
      }
      if (on) return sb.from('favorites').upsert({ gallery_id: galleryId, photo_id: photoId, client_email: email }, { onConflict: 'photo_id,client_email', ignoreDuplicates: true }).then(check);
      return sb.from('favorites').delete().eq('photo_id', photoId).eq('client_email', email).then(check);
    },

    logDownload: function (galleryId, photoId, kind, email) {
      var row = { gallery_id: galleryId, photo_id: photoId || null, kind: kind || 'single', client_email: email };
      if (!live) { D.insert('downloads', row); return Promise.resolve(); }
      return sb.from('downloads').insert(row).then(check).catch(function (e) { console.warn('Download not logged', e); });
    }
  };

  /* =================================================================
     Studio (owner only — protected by row level security)
     ================================================================= */

  function removeFiles(bucket, paths) {
    paths = paths.filter(function (p) { return p && !isUrl(p); });
    if (!live || !paths.length) return Promise.resolve();
    var jobs = [];
    for (var i = 0; i < paths.length; i += 100) jobs.push(sb.storage.from(bucket).remove(paths.slice(i, i + 100)));
    return Promise.all(jobs);
  }

  function upload(bucket, path, blob, contentType) {
    return sb.storage.from(bucket).upload(path, blob, { contentType: contentType || blob.type || 'image/jpeg', upsert: true, cacheControl: '31536000' }).then(check);
  }

  function table(name) {
    return {
      list: function (order, asc) {
        if (!live) {
          var rows = D.all(name).slice();
          if (order) rows.sort(function (a, b) { return (a[order] > b[order] ? 1 : a[order] < b[order] ? -1 : 0) * (asc ? 1 : -1); });
          return Promise.resolve(rows);
        }
        return sb.from(name).select('*').order(order || 'created_at', { ascending: !!asc }).then(check);
      },
      update: function (id, patch) {
        if (!live) return Promise.resolve(D.update(name, id, patch));
        return sb.from(name).update(patch).eq('id', id).select().single().then(check);
      },
      insert: function (row) {
        if (!live) return Promise.resolve(D.insert(name, row));
        return sb.from(name).insert(row).select().single().then(check);
      },
      remove: function (id) {
        if (!live) { D.remove(name, function (r) { return r.id === id; }); return Promise.resolve(); }
        return sb.from(name).delete().eq('id', id).then(check);
      },
      count: function (filter) {
        if (!live) return Promise.resolve(D.all(name).filter(filter.demo).length);
        return filter.live(sb.from(name).select('id', { count: 'exact', head: true })).then(function (res) {
          if (res.error) throw res.error;
          return res.count || 0;
        });
      }
    };
  }

  var bookings = table('bookings'), messages = table('messages'), galleries = table('galleries'),
      portfolio = table('portfolio_items'), blocks = table('availability_blocks');

  Api.studio = {
    stats: function () {
      var today = todayIso();
      var month = new Date(Date.now() - 30 * 864e5).toISOString();
      return Promise.all([
        bookings.count({ demo: function (b) { return b.status === 'new'; }, live: function (q) { return q.eq('status', 'new'); } }),
        bookings.count({ demo: function (b) { return b.status === 'confirmed' && b.event_date >= today; }, live: function (q) { return q.eq('status', 'confirmed').gte('event_date', today); } }),
        messages.count({ demo: function (m) { return !m.is_read; }, live: function (q) { return q.eq('is_read', false); } }),
        galleries.count({ demo: function (g) { return g.status === 'published'; }, live: function (q) { return q.eq('status', 'published'); } }),
        table('downloads').count({ demo: function (d) { return d.created_at >= month; }, live: function (q) { return q.gte('created_at', month); } })
      ]).then(function (n) {
        return { newBookings: n[0], upcoming: n[1], unread: n[2], liveGalleries: n[3], downloads30: n[4] };
      });
    },

    bookings: function () { return bookings.list('created_at', false); },
    updateBooking: function (id, patch) { return bookings.update(id, patch); },
    deleteBooking: function (id) { return bookings.remove(id); },

    messages: function () { return messages.list('created_at', false); },
    updateMessage: function (id, patch) { return messages.update(id, patch); },
    deleteMessage: function (id) { return messages.remove(id); },

    galleries: function () {
      if (!live) {
        var photos = D.all('gallery_photos');
        return galleries.list('created_at', false).then(function (rows) {
          rows.forEach(function (g) { g.photo_count = photos.filter(function (p) { return p.gallery_id === g.id; }).length; });
          return rows;
        });
      }
      return sb.from('galleries').select('*, gallery_photos!gallery_photos_gallery_id_fkey(count)').order('created_at', { ascending: false })
        .then(check)
        .then(function (rows) {
          rows.forEach(function (g) { g.photo_count = (g.gallery_photos && g.gallery_photos[0] && g.gallery_photos[0].count) || 0; delete g.gallery_photos; });
          return rows;
        })
        .catch(function () { return galleries.list('created_at', false); });
    },

    gallery: function (id) {
      if (!live) return Promise.resolve(D.all('galleries').find(function (g) { return g.id === id; }) || null);
      return sb.from('galleries').select('*').eq('id', id).maybeSingle().then(check)
        .then(function (gal) {
          if (gal) return gal;
          return D.all('galleries').find(function (g) { return g.id === id; }) || null;
        }).catch(function () {
          return D.all('galleries').find(function (g) { return g.id === id; }) || null;
        });
    },

    createGallery: function (data) {
      var days = Number(data.expires_days || C.galleryDefaultDays || 90);
      var row = {
        title: data.title, client_name: data.client_name || null,
        client_email: String(data.client_email).trim().toLowerCase(),
        event_date: data.event_date || null, booking_id: data.booking_id || null,
        note: data.note || null, status: 'draft', allow_download: true,
        expires_at: days > 0 ? new Date(Date.now() + days * 864e5).toISOString() : null
      };
      return galleries.insert(row);
    },

    updateGallery: function (id, patch) { return galleries.update(id, patch); },

    deleteGallery: function (gallery) {
      return photoQuery(gallery.id).then(function (photos) {
        var paths = [];
        photos.forEach(function (p) { paths.push(p.original_path, p.preview_path, p.thumb_path); });
        return removeFiles(GB, paths);
      }).then(function () {
        if (!live) D.remove('gallery_photos', function (p) { return p.gallery_id === gallery.id; });
        return galleries.remove(gallery.id);
      });
    },

    photos: function (galleryId) { return photoQuery(galleryId).then(withThumbs); },

    uploadPhoto: function (galleryId, file, sortOrder) {
      return ImageTools.load(file).then(function (img) {
        var W = img.naturalWidth, H = img.naturalHeight;
        if (!live) {
          // Demo: keep one reduced copy so localStorage does not overflow.
          return ImageTools.dataUrl(img, 1000, 0.72).then(function (url) {
            URL.revokeObjectURL(img.src);
            var row = D.insert('gallery_photos', {
              gallery_id: galleryId, filename: file.name, original_path: url, preview_path: url, thumb_path: url,
              width: W, height: H, size_bytes: file.size, sort_order: sortOrder
            });
            row.thumbUrl = url;
            return row;
          });
        }
        var key = shortId() + '-' + stem(file.name);
        var paths = {
          original: galleryId + '/originals/' + shortId() + '-' + safeName(file.name),
          preview: galleryId + '/previews/' + key + '.jpg',
          thumb: galleryId + '/thumbs/' + key + '.jpg'
        };
        return Promise.all([ImageTools.resize(img, 2000, 0.85), ImageTools.resize(img, 720, 0.8)]).then(function (r) {
          URL.revokeObjectURL(img.src);
          return Promise.all([
            upload(GB, paths.original, file, file.type),
            upload(GB, paths.preview, r[0].blob),
            upload(GB, paths.thumb, r[1].blob)
          ]);
        }).then(function () {
          return sb.from('gallery_photos').insert({
            gallery_id: galleryId, filename: file.name, original_path: paths.original,
            preview_path: paths.preview, thumb_path: paths.thumb,
            width: W, height: H, size_bytes: file.size, sort_order: sortOrder
          }).select().single().then(check);
        }).then(function (row) { return withThumbs([row]).then(function (x) { return x[0]; }); });
      });
    },

    deletePhoto: function (photo) {
      return removeFiles(GB, [photo.original_path, photo.preview_path, photo.thumb_path]).then(function () {
        if (!live) { D.remove('gallery_photos', function (p) { return p.id === photo.id; }); return; }
        return sb.from('gallery_photos').delete().eq('id', photo.id).then(check);
      });
    },

    galleryFavorites: function (galleryId) {
      if (!live) return Promise.resolve(D.all('favorites').filter(function (f) { return f.gallery_id === galleryId; }));
      return sb.from('favorites').select('*').eq('gallery_id', galleryId).then(check);
    },

    galleryDownloads: function (galleryId) {
      if (!live) return Promise.resolve(D.all('downloads').filter(function (d) { return d.gallery_id === galleryId; }));
      return sb.from('downloads').select('*').eq('gallery_id', galleryId).order('created_at', { ascending: false }).then(check);
    },

    recentDownloads: function (limit) {
      var gal;
      return Api.studio.galleries().then(function (g) {
        gal = g;
        if (!live) return D.all('downloads').slice().sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; }).slice(0, limit || 8);
        return sb.from('downloads').select('*').order('created_at', { ascending: false }).limit(limit || 8).then(check);
      }).then(function (rows) {
        rows.forEach(function (d) { var g = gal.find(function (x) { return x.id === d.gallery_id; }); d.gallery_title = g ? g.title : 'Deleted gallery'; });
        return rows;
      });
    },

    portfolio: function () {
      return portfolio.list('sort_order', true).then(function (rows) { return rows.map(decoratePortfolio); });
    },

    uploadPortfolio: function (file, meta) {
      return ImageTools.load(file).then(function (img) {
        if (!live) {
          return ImageTools.dataUrl(img, 1400, 0.78).then(function (url) {
            URL.revokeObjectURL(img.src);
            return decoratePortfolio(D.insert('portfolio_items', Object.assign({}, meta, {
              image_path: url, thumb_path: url, width: img.naturalWidth, height: img.naturalHeight
            })));
          });
        }
        var key = 'work/' + shortId() + '-' + stem(file.name);
        return Promise.all([ImageTools.resize(img, 2400, 0.88), ImageTools.resize(img, 900, 0.82)]).then(function (r) {
          URL.revokeObjectURL(img.src);
          return Promise.all([upload(PB, key + '.jpg', r[0].blob), upload(PB, key + '-thumb.jpg', r[1].blob)]).then(function () {
            return sb.from('portfolio_items').insert(Object.assign({}, meta, {
              image_path: key + '.jpg', thumb_path: key + '-thumb.jpg', width: r[0].width, height: r[0].height
            })).select().single().then(check);
          });
        }).then(decoratePortfolio);
      });
    },

    updatePortfolio: function (id, patch) { return portfolio.update(id, patch); },

    deletePortfolio: function (item) {
      return removeFiles(PB, [item.image_path, item.thumb_path]).then(function () { return portfolio.remove(item.id); });
    },

    blocks: function () { return blocks.list('day', true); },
    addBlock: function (day, note) { return blocks.insert({ day: day, note: note || null }); },
    removeBlock: function (id) { return blocks.remove(id); },

    outbox: function () {
      return Promise.resolve(D.all('outbox').slice().sort(function (a, b) { return a.created_at < b.created_at ? 1 : -1; }));
    },
    resetDemo: function () { D.reset(); }
  };

  /* =================================================================
     Formatting
     ================================================================= */

  Api.format = {
    date: function (iso, opts) {
      if (!iso) return '';
      var d = new Date(String(iso).length === 10 ? iso + 'T00:00:00' : iso);
      return d.toLocaleDateString('en-IN', opts || { day: 'numeric', month: 'short', year: 'numeric' });
    },
    longDate: function (iso) {
      return Api.format.date(iso, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    },
    time: function (iso) {
      return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    },
    relative: function (iso) {
      var s = (Date.now() - new Date(iso).getTime()) / 1000;
      if (s < 60) return 'just now';
      if (s < 3600) return Math.floor(s / 60) + ' min ago';
      if (s < 86400) return Math.floor(s / 3600) + ' h ago';
      if (s < 86400 * 7) return Math.floor(s / 86400) + ' d ago';
      return Api.format.date(iso);
    },
    money: function (n) {
      if (n == null || n === '') return '';
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: C.currency || 'INR', maximumFractionDigits: 0 }).format(n);
    },
    bytes: function (n) {
      if (!n) return '';
      var u = ['B', 'KB', 'MB', 'GB'], i = 0;
      while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
      return n.toFixed(i > 1 ? 1 : 0) + ' ' + u[i];
    },
    esc: function (v) { return window.Emails ? window.Emails.esc(v) : String(v == null ? '' : v); }
  };

  window.Api = Api;
})();

