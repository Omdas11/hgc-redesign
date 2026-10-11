/* Shared behaviour for the HGC redesign demo. */
(function () {
  'use strict';

  // Mobile nav
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () { nav.classList.toggle('open'); });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') nav.classList.remove('open');
    });
  }

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Supabase client (loaded via CDN before this script)
  var sb = null;
  if (window.supabase && window.HGC_CONFIG) {
    sb = window.supabase.createClient(
      window.HGC_CONFIG.SUPABASE_URL,
      window.HGC_CONFIG.SUPABASE_ANON_KEY
    );
  }
  window.HGC = { supabase: sb };

  function fmtDate(iso) {
    try {
      var d = new Date(iso + 'T00:00:00');
      return {
        day: String(d.getDate()).padStart(2, '0'),
        mon: d.toLocaleString('en', { month: 'short' }),
        full: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      };
    } catch (e) { return { day: '--', mon: '', full: iso }; }
  }

  function noticeCard(n) {
    var d = fmtDate(n.published_date);
    var badge = n.is_new ? '<span class="badge-new">NEW</span>' : '';
    var file = n.file_url
      ? '<a href="' + n.file_url + '" target="_blank" rel="noopener" style="font-size:13px;font-weight:700;color:var(--gold-600)">View file &rarr;</a>'
      : '';
    return '<a class="notice" href="notices">' +
      '<div class="notice-date"><b>' + d.day + '</b><span>' + d.mon + '</span></div>' +
      '<div class="notice-body"><h4>' + escapeHtml(n.title) + '</h4>' +
      '<div class="meta"><span>' + escapeHtml(n.category || 'General') + '</span><span>&middot;</span><span>' + d.full + '</span>' + badge + '</div>' +
      (file ? '<div style="margin-top:6px">' + file + '</div>' : '') +
      '</div></a>';
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  window.HGC.escapeHtml = escapeHtml;

  // Notice ticker (homepage marquee)
  var tickerTrack = document.getElementById('ticker-track');
  if (tickerTrack && sb) {
    sb.from('hgc_notices').select('title').order('published_date', { ascending: false }).limit(8)
      .then(function (res) {
        var items = (res.data && res.data.length)
          ? res.data.map(function (n) { return n.title; })
          : ['Admissions open for the new academic session', 'Visit the Notices page for announcements'];
        var html = items.map(function (t) { return '<span>' + escapeHtml(t) + '</span>'; }).join('<span style="color:var(--gold-500)">&diams;</span>');
        tickerTrack.innerHTML = html + '<span style="color:var(--gold-500)">&diams;</span>' + html + '<span style="color:var(--gold-500)">&diams;</span>';
      });
  }

  // Homepage: latest notices
  var homeNotices = document.getElementById('home-notices');
  if (homeNotices && sb) {
    sb.from('hgc_notices').select('*').order('published_date', { ascending: false }).limit(5)
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) {
          homeNotices.innerHTML = '<div class="empty-state">Notices will appear here once published.</div>';
          return;
        }
        homeNotices.innerHTML = res.data.map(noticeCard).join('');
      });
  }

  // Notices page: filterable list
  var allNotices = document.getElementById('all-notices');
  var chipRow = document.getElementById('notice-filters');
  if (allNotices && sb) {
    var cache = [];
    function render(list) {
      allNotices.innerHTML = list.length
        ? list.map(noticeCard).join('')
        : '<div class="empty-state">No notices in this category yet.</div>';
    }
    sb.from('hgc_notices').select('*').order('published_date', { ascending: false })
      .then(function (res) {
        if (res.error || !res.data) { render([]); return; }
        cache = res.data;
        var cats = ['All'].concat(Array.from(new Set(cache.map(function (n) { return n.category || 'General'; }))));
        chipRow.innerHTML = cats.map(function (c, i) {
          return '<button class="chip' + (i === 0 ? ' active' : '') + '" data-cat="' + escapeHtml(c) + '">' + escapeHtml(c) + '</button>';
        }).join('');
        chipRow.addEventListener('click', function (e) {
          var btn = e.target.closest('.chip'); if (!btn) return;
          chipRow.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('active'); });
          btn.classList.add('active');
          var cat = btn.dataset.cat;
          render(cat === 'All' ? cache : cache.filter(function (n) { return (n.category || 'General') === cat; }));
        });
        render(cache);
      });
  }

  // Departments page: grid from Supabase
  var deptGrid = document.getElementById('dept-grid');
  var deptFilters = document.getElementById('dept-filters');
  if (deptGrid && sb) {
    var depts = [];
    function deptCard(d) {
      return '<div class="card dept-card"><span class="stream-tag">' + escapeHtml(d.stream) + '</span>' +
        '<h3>' + escapeHtml(d.name) + '</h3>' +
        '<p>' + escapeHtml(d.about || '') + '</p>' +
        '<p style="margin-top:10px;font-size:13px;color:var(--gold-600);font-weight:600">' + escapeHtml(d.programs || '') + '</p></div>';
    }
    function renderDepts(list) {
      deptGrid.innerHTML = list.length ? list.map(deptCard).join('')
        : '<div class="empty-state">No departments found.</div>';
    }
    sb.from('hgc_departments').select('*').order('name')
      .then(function (res) {
        if (res.error || !res.data) { renderDepts([]); return; }
        depts = res.data;
        var streams = ['All'].concat(Array.from(new Set(depts.map(function (d) { return d.stream; }))));
        deptFilters.innerHTML = streams.map(function (s, i) {
          return '<button class="chip' + (i === 0 ? ' active' : '') + '" data-stream="' + escapeHtml(s) + '">' + escapeHtml(s) + '</button>';
        }).join('');
        deptFilters.addEventListener('click', function (e) {
          var btn = e.target.closest('.chip'); if (!btn) return;
          deptFilters.querySelectorAll('.chip').forEach(function (x) { x.classList.remove('active'); });
          btn.classList.add('active');
          var s = btn.dataset.stream;
          renderDepts(s === 'All' ? depts : depts.filter(function (d) { return d.stream === s; }));
        });
        renderDepts(depts);
      });
  }

  // Contact form -> hgc_messages
  var cform = document.getElementById('contact-form');
  if (cform && sb) {
    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = cform.querySelector('button[type=submit]');
      btn.disabled = true; btn.textContent = 'Sending…';
      var payload = {
        name: document.getElementById('cf-name').value.trim(),
        email: document.getElementById('cf-email').value.trim(),
        phone: document.getElementById('cf-phone').value.trim() || null,
        subject: document.getElementById('cf-subject').value,
        message: document.getElementById('cf-message').value.trim()
      };
      sb.from('hgc_messages').insert(payload).then(function (res) {
        if (res.error) {
          btn.disabled = false; btn.textContent = 'Send message';
          alert('Could not send right now. Please try again later.');
          return;
        }
        cform.outerHTML = '<div class="form-ok"><b>Message received.</b> Thank you for writing to us — the college office will get back to you on your email.</div>';
      });
    });
  }
})();
