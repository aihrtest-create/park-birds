/* ========================================
   Парк Сказка — Bird Page Renderer
   Загружает данные из JSON по URL-параметру ?id=
   ======================================== */

(function () {
  'use strict';

  var PAGE_EL = document.getElementById('bird-page');

  // SVG icons for quick facts
  var ICONS = {
    ruler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M6 8v8"/><path d="M10 10v4"/><path d="M14 10v4"/><path d="M18 8v8"/></svg>',
    weight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a4 4 0 0 0-4 4c0 2 2 4 4 4s4-2 4-4a4 4 0 0 0-4-4z"/><path d="M4 21h16l-2-8H6L4 21z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    wingspan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12C2 8 5 4 12 4s10 4 10 8"/><path d="M2 12l3-2"/><path d="M2 12l3 2"/><path d="M22 12l-3-2"/><path d="M22 12l-3 2"/></svg>',
    egg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4.418 0 7-4.03 7-9s-2.582-11-7-11S5 8.03 5 13s2.582 9 7 9z"/></svg>',
    tail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h20"/><path d="M6 8v8"/><path d="M18 8v8"/></svg>'
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

  // Get icon SVG
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

    // Section badge
    if (sectionName) {
      html += '<div class="section-badge">📍 ' + esc(sectionName) + '</div>';
    }

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
        html += '<div class="fact-icon">' + getIcon(fact.icon) + '</div>';
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
      html += '<div class="section-heading"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Обо мне</div>';
      html += '<p>' + esc(bird.about) + '</p>';
      html += '</div>';
    }

    // Habitat
    if (bird.habitat) {
      html += '<div class="habitat-card">';
      html += '<div class="section-heading"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>Где я живу</div>';
      html += '<p>' + esc(bird.habitat) + '</p>';
      html += '</div>';
    }

    // Fun facts
    if (bird.fun_facts && bird.fun_facts.length) {
      html += '<div class="section-heading" style="padding: 0 4px; margin-bottom: 10px;"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Удивительные факты</div>';
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
    html += '<div class="section-heading"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Правила поведения</div>';
    html += '<div class="safety-rules-list">';
    SAFETY_RULES.forEach(function (rule) {
      html += '<div class="safety-rule">';
      html += '<span class="rule-icon">' + rule.icon + '</span>';
      html += '<span class="rule-text">' + esc(rule.text) + '</span>';
      html += '</div>';
    });
    html += '</div></div>';

    // CTA
    html += '<div class="cta-block">';
    html += '<h3>🎂 День Рождения в парке!</h3>';
    html += '<p>Отметьте праздник в окружении удивительных птиц и животных!</p>';
    html += '<a href="#" class="cta-button">Узнать подробнее</a>';
    html += '</div>';

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
