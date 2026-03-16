/* ========================================
   Парк Сказка — Catalog Renderer
   Загружает разделы и птиц, строит аккордеон
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

  function fetchJSON(url) {
    var cached = sessionStorage.getItem('park_' + url);
    if (cached) {
      return Promise.resolve(JSON.parse(cached));
    }
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      try { sessionStorage.setItem('park_' + url, JSON.stringify(data)); } catch (e) { /* ignore */ }
      return data;
    });
  }

  // Group birds by section_id
  function groupBirds(birds, sections) {
    var map = {};
    sections.forEach(function (s) { map[s.id] = []; });
    birds.forEach(function (b) {
      if (map[b.section_id]) {
        map[b.section_id].push(b);
      }
    });
    return map;
  }

  // Chevron SVG
  var CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  // Arrow SVG
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';

  function renderBirdItem(bird) {
    var subtitle = bird.name_latin || '';
    var emoji = bird.emoji || '🐦';
    if (bird.is_bird === false) emoji = '🦇';

    return '<a href="bird.html?id=' + esc(bird.id) + '" class="bird-list-item">' +
      '<span class="bird-emoji">' + esc(emoji) + '</span>' +
      '<div class="bird-info">' +
        '<div class="bird-title">' + esc(bird.name_ru) + '</div>' +
        (subtitle ? '<div class="bird-subtitle">' + esc(subtitle) + '</div>' : '') +
      '</div>' +
      '<span class="bird-arrow">' + ARROW + '</span>' +
    '</a>';
  }

  function render(sections, birds) {
    var grouped = groupBirds(birds, sections);

    var html = '';

    sections.forEach(function (section) {
      var sectionBirds = grouped[section.id];
      if (!sectionBirds || sectionBirds.length === 0) return;

      var isSingle = sectionBirds.length === 1;

      html += '<div class="catalog-section' + (isSingle ? ' direct-link open' : '') + '">';

      // Section header
      html += '<button class="section-toggle" data-section="' + esc(section.id) + '">';
      html += '<span class="toggle-icon">' + CHEVRON + '</span>';
      html += '<span>' + esc(section.name) + '</span>';
      if (!isSingle) {
        html += '<span class="section-count">' + sectionBirds.length + '</span>';
      }
      html += '</button>';

      // Bird list
      html += '<div class="bird-list">';
      sectionBirds.forEach(function (bird) {
        html += renderBirdItem(bird);
      });
      html += '</div>';

      html += '</div>';
    });

    CONTENT_EL.innerHTML = html;

    // Accordion toggle
    CONTENT_EL.addEventListener('click', function (e) {
      var btn = e.target.closest('.section-toggle');
      if (!btn) return;
      var section = btn.closest('.catalog-section');
      if (section.classList.contains('direct-link')) return;
      section.classList.toggle('open');
    });
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
