/* ========================================
   Парк Сказка — Catalog Renderer
   Загружает разделы и строит сетку разделов
   ======================================== */

(function () {
  'use strict';

  var CONTENT_EL = document.getElementById('catalog-content');

  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // Cache version — bump when data changes to invalidate old cache
  var CACHE_VER = 'v2';

  function fetchJSON(url) {
    var key = 'park_' + CACHE_VER + '_' + url;
    var cached = sessionStorage.getItem(key);
    if (cached) {
      return Promise.resolve(JSON.parse(cached));
    }
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      try { sessionStorage.setItem(key, JSON.stringify(data)); } catch (e) { /* ignore */ }
      return data;
    });
  }

  // Count birds per section
  function countBirdsPerSection(birds) {
    var counts = {};
    birds.forEach(function (b) {
      counts[b.section_id] = (counts[b.section_id] || 0) + 1;
    });
    return counts;
  }

  // Russian pluralization for "обитатель"
  function pluralize(n) {
    if (n % 10 === 1 && n % 100 !== 11) return 'обитатель';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'обитателя';
    return 'обитателей';
  }

  // Arrow SVG
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  function render(sections, birds) {
    var birdCounts = countBirdsPerSection(birds);
    var html = '';

    sections.forEach(function (section) {
      var count = birdCounts[section.id] || 0;

      html += '<a href="section.html?id=' + esc(section.id) + '" class="section-card-link">';
      html += '<div class="section-card-item">';
      html += '<div class="section-card-info">';
      html += '<div class="section-card-name">' + esc(section.name) + '</div>';
      html += '<div class="section-card-count">' + count + ' ' + pluralize(count) + '</div>';
      html += '</div>';
      html += '<span class="section-card-arrow">' + ARROW + '</span>';
      html += '</div>';
      html += '</a>';
    });

    CONTENT_EL.innerHTML = html;
  }

  function init() {
    Promise.all([
      fetchJSON('data/sections.json'),
      fetchJSON('data/birds.json')
    ]).then(function (results) {
      var sectionsData = results[0];
      var birdsData = results[1];
      render(sectionsData.sections, birdsData.birds);
    }).catch(function (err) {
      console.error('Failed to load catalog data:', err);
      CONTENT_EL.innerHTML =
        '<div class="error-state" style="padding: 40px 20px;">' +
          '<div class="error-emoji">😕</div>' +
          '<h2>Ошибка загрузки</h2>' +
          '<p>Не удалось загрузить данные. Попробуйте обновить страницу.</p>' +
        '</div>';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
