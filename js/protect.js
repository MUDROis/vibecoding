/**
 * Copyright (c) 2018-2026 ИП Громова Анна Александровна
 * Все права защищены. Код защищен.
 */
(function() {
    'use strict';

    // Блокировка F12
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
    });

    // Блокировка Ctrl+U (просмотр кода)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            return false;
        }
    });

    // Блокировка Ctrl+Shift+I (DevTools)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            return false;
        }
    });

    // Блокировка Ctrl+Shift+J (Console)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            return false;
        }
    });

    // Блокировка Ctrl+Shift+C (Inspector)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'C') {
            e.preventDefault();
            return false;
        }
    });

    // Блокировка правого клика только на изображениях
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });

    // Обнаружение DevTools (размер окна)
    var threshold = 160;
    setInterval(function() {
        if (window.outerWidth - window.innerWidth > threshold ||
            window.outerHeight - window.innerHeight > threshold) {
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0e27;color:#e8edf3;font-family:sans-serif;text-align:center;padding:20px;"><div><h1>Доступ запрещен</h1><p>Использование инструментов разработчика запрещено лицензией.</p></div></div>';
        }
    }, 1000);

    // Предотвращение drag-and-drop для изображений
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });

})();
