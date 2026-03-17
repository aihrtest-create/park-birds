/* ========================================
   Парк Сказка — Bird Page Renderer
   Загружает данные из JSON по URL-параметру ?id=
   ======================================== */

(function () {
  'use strict';

  var PAGE_EL = document.getElementById('bird-page');

  // Emoji icons for quick facts
  var ICONS = {
    ruler:    '📏',
    weight:   '⚖️',
    heart:    '❤️',
    bolt:     '⚡',
    wingspan: '🦅',
    egg:      '🥚',
    tail:     '🪶'
  };

  // Safety rules (same for all birds)
  var SAFETY_RULES = [
    { icon: '🚫', text: 'Не кормите животных' },
    { icon: '🤫', text: 'Не шумите рядом с вольерами' },
    { icon: '🙅', text: 'Не просовывайте руки' },
    { icon: '📸', text: 'Фото без вспышки' }
  ];

  // Escape HTML to prevent XSS
  function esc(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // Get bird ID from URL
  function getBirdId() {
    var params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  // Fetch JSON with sessionStorage cache
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

  // Show loading state
  function showLoading() {
    PAGE_EL.innerHTML = '<div class="loading-spinner"></div>';
  }

  // Show error state
  function showError(title, message) {
    PAGE_EL.innerHTML =
      '<div class="error-state">' +
        '<div class="error-emoji">🔍</div>' +
        '<h2>' + esc(title) + '</h2>' +
        '<p>' + esc(message) + '</p>' +
        '<a href="index.html">К каталогу птиц</a>' +
      '</div>';
    document.title = title + ' — Парк Сказка';
  }

  // Get icon emoji
  function getIcon(key) {
    return ICONS[key] || ICONS.heart;
  }

  // Find section by ID
  function findSection(sections, sectionId) {
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].id === sectionId) return sections[i];
    }
    return null;
  }

  // Render bird page
  function render(bird, section) {
    // Update document title
    document.title = bird.name_ru + ' — Парк Сказка';

    // Update meta theme color
    var metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute('content', '#43A047');

    var sectionName = section ? section.name : '';

    // Build HTML
    var html = '';

    // ---- HERO ----
    html += '<div class="bird-hero">';
    html += '<div class="deco-circle"></div><div class="deco-circle"></div><div class="deco-circle"></div>';

    // Back link — go to section page if available
    var backUrl = section ? 'section.html?id=' + encodeURIComponent(section.id) : 'index.html';
    html += '<a href="' + backUrl + '" class="back-link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>Назад</a>';

    // Photo
    html += '<div class="photo-area">';
    html += '<div class="sparkle"></div><div class="sparkle"></div><div class="sparkle"></div>';
    html += '<div class="photo-frame"><div class="photo-inner">';
    if (bird.photo) {
      html += '<img src="images/' + esc(bird.photo) + '" alt="' + esc(bird.name_ru) + '">';
    } else {
      html += esc(bird.emoji || '🐦');
    }
    html += '</div></div></div>';

    // Not-a-bird badge
    if (bird.is_bird === false) {
      html += '<div class="not-bird-badge">🦇 А я не птица! Я — рукокрылое!</div>';
    }

    // Name
    html += '<h1 class="bird-name">' + esc(bird.name_ru) + '</h1>';
    if (bird.name_alt) {
      html += '<div class="bird-name-alt">' + esc(bird.name_alt) + '</div>';
    }
    html += '<div class="bird-name-latin">' + esc(bird.name_latin) + '</div>';

    html += '</div>'; // end hero

    // ---- CONTENT ----
    html += '<div class="bird-content">';

    // Quick Facts
    if (bird.quick_facts && bird.quick_facts.length) {
      html += '<div class="quick-facts-card">';
      bird.quick_facts.forEach(function (fact) {
        html += '<div class="quick-fact">';
        html += '<div class="fact-icon fact-icon-emoji">' + getIcon(fact.icon) + '</div>';
        html += '<div class="fact-value">' + esc(fact.value) + '</div>';
        html += '<div class="fact-label">' + esc(fact.label) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Classification
    html += '<div class="classification-card">';
    html += '<div class="classification-item"><div class="clf-label">Отряд</div><div class="clf-value">' + esc(bird.order) + '</div></div>';
    html += '<div class="classification-item"><div class="clf-label">Семейство</div><div class="clf-value">' + esc(bird.family) + '</div></div>';
    html += '</div>';

    // About me
    if (bird.about) {
      html += '<div class="about-card">';
      html += '<div class="section-heading"><span class="icon-emoji">💬</span>Обо мне</div>';
      html += '<p>' + esc(bird.about) + '</p>';
      html += '</div>';
    }

    // Habitat
    if (bird.habitat) {
      html += '<div class="habitat-card">';
      html += '<div class="section-heading"><span class="icon-emoji">🌍</span>Где я живу</div>';
      html += '<p>' + esc(bird.habitat) + '</p>';
      html += '</div>';
    }

    // Photo gallery
    if (bird.gallery_count && bird.gallery_count > 0) {
      html += '<div class="photo-gallery">';
      html += '<div class="section-heading" style="padding: 0 4px; margin-bottom: 10px;"><span class="icon-emoji">📷</span>Фотографии</div>';
      html += '<div class="gallery-scroll">';
      for (var g = 1; g <= bird.gallery_count; g++) {
        var pad = g < 10 ? '0' + g : '' + g;
        var src = 'images/gallery/' + esc(bird.id) + '/' + pad + '.png';
        html += '<div class="gallery-item"><img src="' + src + '" alt="' + esc(bird.name_ru) + ' фото ' + g + '" loading="lazy"></div>';
      }
      html += '</div></div>';
    }

    // Fun facts
    if (bird.fun_facts && bird.fun_facts.length) {
      html += '<div class="section-heading" style="padding: 0 4px; margin-bottom: 10px;"><span class="icon-emoji">⭐</span>Удивительные факты</div>';
      html += '<div class="fun-facts-grid">';
      bird.fun_facts.forEach(function (fact) {
        html += '<div class="fun-fact-item">';
        html += '<span class="fact-emoji">' + esc(fact.emoji) + '</span>';
        html += '<span class="fact-text">' + esc(fact.text) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    // Safety rules
    html += '<div class="safety-card">';
    html += '<div class="section-heading"><span class="icon-emoji">🛡️</span>Правила поведения</div>';
    html += '<div class="safety-rules-list">';
    SAFETY_RULES.forEach(function (rule) {
      html += '<div class="safety-rule">';
      html += '<span class="rule-icon">' + rule.icon + '</span>';
      html += '<span class="rule-text">' + esc(rule.text) + '</span>';
      html += '</div>';
    });
    html += '</div></div>';

    html += '</div>'; // end content

    PAGE_EL.innerHTML = html;
  }

  // ---- MAIN ----
  function init() {
    var birdId = getBirdId();
    if (!birdId) {
      showError('Птица не найдена', 'Не указан ID птицы в параметрах.');
      return;
    }

    showLoading();

    Promise.all([
      fetchJSON('data/birds.json'),
      fetchJSON('data/sections.json')
    ]).then(function (results) {
      var birdsData = results[0];
      var sectionsData = results[1];

      var bird = null;
      for (var i = 0; i < birdsData.birds.length; i++) {
        if (birdsData.birds[i].id === birdId) {
          bird = birdsData.birds[i];
          break;
        }
      }

      if (!bird) {
        showError('Птица не найдена', 'Нет данных для «' + birdId + '».');
        return;
      }

      var section = findSection(sectionsData.sections, bird.section_id);
      render(bird, section);

    }).catch(function (err) {
      console.error('Failed to load data:', err);
      showError('Ошибка загрузки', 'Не удалось загрузить данные. Попробуйте обновить страницу.');
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
