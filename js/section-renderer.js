/* ========================================
   Парк Сказка — Section Page Renderer
   Загружает раздел и его птиц по URL-параметру ?id=
   ======================================== */

(function () {
  'use strict';

  var PAGE_EL = document.getElementById('section-page');

  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function getSectionId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  function fetchJSON(url) {
    var cached = sessionStorage.getItem('park_' + url);
    if (cached) return Promise.resolve(JSON.parse(cached));
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (data) {
      try { sessionStorage.setItem('park_' + url, JSON.stringify(data)); } catch (e) { /* ignore */ }
      return data;
    });
  }

  function showError(title, message) {
    PAGE_EL.innerHTML =
      '<div class="error-state">' +
        '<div class="error-emoji">🔍</div>' +
        '<h2>' + esc(title) + '</h2>' +
        '<p>' + esc(message) + '</p>' +
        '<a href="index.html">К каталогу</a>' +
      '</div>';
    document.title = title + ' — Парк Сказка';
  }

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

  function render(section, birds) {
    document.title = section.name + ' — Парк Сказка';

    var html = '';

    // Hero
    html += '<div class="section-hero">';
    html += '<div class="deco-circle"></div><div class="deco-circle"></div>';
    html += '<a href="index.html" class="back-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>Назад</a>';
    html += '<h1>' + esc(section.name) + '</h1>';
    if (section.location && section.location !== section.name) {
      html += '<div class="section-location">📍 ' + esc(section.location) + '</div>';
    }
    html += '</div>';

    // Content
    html += '<div class="section-content">';

    if (birds.length === 0) {
      html += '<div class="empty-state">';
      html += '<div class="empty-emoji">🪹</div>';
      html += '<p>Информация о жителях этого раздела скоро появится!</p>';
      html += '</div>';
    } else {
      html += '<div class="bird-list">';
      birds.forEach(function (bird) {
        html += renderBirdItem(bird);
      });
      html += '</div>';
    }

    html += '</div>';

    PAGE_EL.innerHTML = html;
  }

  function init() {
    var sectionId = getSectionId();
    if (!sectionId) {
      showError('Раздел не найден', 'Не указан ID раздела.');
      return;
    }

    Promise.all([
      fetchJSON('data/sections.json'),
      fetchJSON('data/birds.json')
    ]).then(function (results) {
      var sections = results[0].sections;
      var allBirds = results[1].birds;

      var section = null;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].id === sectionId) { section = sections[i]; break; }
      }

      if (!section) {
        showError('Раздел не найден', 'Нет данных для «' + sectionId + '».');
        return;
      }

      var sectionBirds = allBirds.filter(function (b) {
        return b.section_id === sectionId;
      });

      render(section, sectionBirds);
    }).catch(function (err) {
      console.error('Failed to load section data:', err);
      showError('Ошибка загрузки', 'Не удалось загрузить данные. Попробуйте обновить страницу.');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
