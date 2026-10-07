/*
 * Переключатель темы, бургер-меню и уведомление о cookie.
 * Тема применяется до отрисовки инлайн-скриптом в <head>, здесь только
 * обработчики: иначе на первом кадре мигал бы светлый фон.
 */
(function () {
  'use strict';

  var THEME_KEY = 'myway.theme';
  var COOKIE_KEY = 'myway.cookieNoticeAccepted';

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(THEME_KEY, JSON.stringify(theme));
    } catch (error) {
      /* приватный режим — тема просто не запомнится */
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-theme-toggle]');
    if (toggle) {
      toggle.addEventListener('click', function () {
        applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
      });
    }

    var burger = document.querySelector('[data-burger]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.getAttribute('data-open') === 'true';
        menu.setAttribute('data-open', String(!open));
        burger.setAttribute('aria-expanded', String(!open));
      });
    }

    var notice = document.querySelector('[data-cookie-notice]');
    if (notice) {
      var accepted = false;
      try {
        accepted = localStorage.getItem(COOKIE_KEY) === 'true';
      } catch (error) {
        accepted = true; // хранилище недоступно — не мозолим глаза
      }
      if (!accepted) {
        notice.hidden = false;
      }
      var accept = notice.querySelector('[data-cookie-accept]');
      if (accept) {
        accept.addEventListener('click', function () {
          notice.hidden = true;
          try {
            localStorage.setItem(COOKIE_KEY, 'true');
          } catch (error) {
            /* см. выше */
          }
        });
      }
    }

    // Аккордеон FAQ на нативных <details> — нужен только один открытый пункт.
    var faq = document.querySelector('[data-faq]');
    if (faq) {
      var items = faq.querySelectorAll('details');
      items.forEach(function (item) {
        item.addEventListener('toggle', function () {
          if (!item.open) return;
          items.forEach(function (other) {
            if (other !== item) other.open = false;
          });
        });
      });
    }
  });
})();
