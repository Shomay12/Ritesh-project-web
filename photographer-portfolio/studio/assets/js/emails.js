/*
  Email copy used by the websites (booking, contact, gallery delivery).
  Every message goes through one EmailJS template, so the wording lives
  here where it is easy to edit. Scheduled emails (reminders, thank-you
  notes, expiry warnings, the owner digest) live in automation/emails.py.
*/
(function () {
  var C = window.SITE_CONFIG || {};
  var O = C.owner || {};

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function para(text) {
    return '<p style="margin:0 0 16px;font:15px/1.65 Helvetica,Arial,sans-serif;color:#1d1b18;">' + text + '</p>';
  }

  function rows(pairs) {
    var out = pairs.filter(function (p) { return p[1]; }).map(function (p) {
      return '<tr><td style="padding:8px 0;border-top:1px solid #d9d3c9;font:12px/1.4 Helvetica,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#77716a;width:38%;vertical-align:top;">' +
        esc(p[0]) + '</td><td style="padding:8px 0;border-top:1px solid #d9d3c9;font:15px/1.5 Helvetica,Arial,sans-serif;color:#1d1b18;">' +
        esc(p[1]).replace(/\n/g, '<br>') + '</td></tr>';
    }).join('');
    return '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:8px 0 24px;border-bottom:1px solid #d9d3c9;">' + out + '</table>';
  }

  function link(href, label) {
    return '<p style="margin:24px 0;"><a href="' + esc(href) + '" style="display:inline-block;background:#1d1b18;color:#f3efe8;text-decoration:none;padding:13px 22px;font:12px/1 Helvetica,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;">' + esc(label) + '</a></p>';
  }

  function wrap(inner) {
    return '<div style="background:#f3efe8;padding:32px 16px;">' +
      '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;">' +
      '<tr><td style="padding:0 0 28px;font:22px/1 Georgia,\'Times New Roman\',serif;color:#1d1b18;">' + esc(O.name) + '</td></tr>' +
      '<tr><td>' + inner + '</td></tr>' +
      '<tr><td style="padding:28px 0 0;border-top:1px solid #d9d3c9;font:12px/1.6 Helvetica,Arial,sans-serif;color:#77716a;">' +
      esc(O.name) + ' &middot; Photographer, ' + esc(O.city) + '<br>' + esc(O.email) + ' &middot; ' + esc(O.phone) +
      '</td></tr></table></div>';
  }

  function firstName(name) { return String(name || '').trim().split(/\s+/)[0] || 'there'; }

  function niceDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  window.Emails = {
    esc: esc,
    wrap: wrap,

    bookingOwner: function (b) {
      return {
        subject: 'New enquiry: ' + b.session_type + (b.event_date ? ' on ' + niceDate(b.event_date) : '') + ' (' + b.reference + ')',
        html: wrap(
          para('A new enquiry came in through the website.') +
          rows([
            ['Reference', b.reference], ['Name', b.name], ['Email', b.email], ['Phone', b.phone],
            ['Session', b.session_type], ['Package', b.package], ['Date', niceDate(b.event_date)],
            ['Timing', b.event_time], ['Location', b.location], ['Guests', b.guest_count],
            ['Budget', b.budget], ['Found you via', b.referral], ['Message', b.message]
          ]) +
          link(C.studioUrl + 'bookings.html', 'Open in studio')
        )
      };
    },

    bookingClient: function (b) {
      var when = b.event_date ? ' for ' + esc(niceDate(b.event_date)) : '';
      return {
        subject: 'Thank you, ' + firstName(b.name) + ' \u2014 I have your enquiry',
        html: wrap(
          para('Hi ' + esc(firstName(b.name)) + ',') +
          para('Thank you for writing in about your ' + esc(String(b.session_type).toLowerCase()) + when + '. I read every enquiry myself and I will reply within two working days, usually sooner.') +
          para('If the date is still open I will send over availability, what is included, and a few questions so I can understand the day properly. If anything changes in the meantime, just reply to this email.') +
          rows([['Your reference', b.reference], ['Session', b.session_type], ['Date', niceDate(b.event_date)], ['Location', b.location]]) +
          para('Warmly,<br>' + esc(O.name))
        )
      };
    },

    bookingConfirmed: function (b, note) {
      return {
        subject: 'Confirmed: ' + b.session_type + ' on ' + niceDate(b.event_date),
        html: wrap(
          para('Hi ' + esc(firstName(b.name)) + ',') +
          para('This is to confirm that your date is booked and held for you. I\u2019m really looking forward to it.') +
          rows([['Reference', b.reference], ['Session', b.session_type], ['Date', niceDate(b.event_date)], ['Timing', b.event_time], ['Location', b.location]]) +
          (note ? para(esc(note).replace(/\n/g, '<br>')) : '') +
          para('I will be in touch a few days before with a short plan. Call or message me any time before then.') +
          para(esc(O.name) + '<br>' + esc(O.phone))
        )
      };
    },

    contactOwner: function (m) {
      return {
        subject: 'Website message: ' + (m.subject || 'No subject') + ' \u2014 ' + m.name,
        html: wrap(rows([['From', m.name], ['Email', m.email], ['Subject', m.subject], ['Message', m.message]]))
      };
    },

    galleryReady: function (g, link_) {
      var expires = g.expires_at ? niceDate(g.expires_at.slice(0, 10)) : '';
      return {
        subject: 'Your photographs are ready \u2014 ' + g.title,
        html: wrap(
          para('Hi ' + esc(firstName(g.client_name)) + ',') +
          para('Your gallery is finished and online. Use the button below, enter this email address, and I\u2019ll send you a private sign-in link. You can view everything, mark favourites, and download the full-resolution files.') +
          (g.note ? para(esc(g.note).replace(/\n/g, '<br>')) : '') +
          link(link_, 'Open your gallery') +
          (expires ? para('The gallery stays online until ' + esc(expires) + '. Please download a copy before then and keep it somewhere safe.') : '') +
          para('It was a privilege to be there.<br>' + esc(O.name))
        )
      };
    }
  };
})();

