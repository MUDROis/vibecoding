/**
 * Copyright (c) 2018-2026 ИП Громова Анна Александровна
 * Все права защищены. Копирование запрещено.
 */

// ===== Mobile menu toggle =====
document.getElementById('menuToggle')?.addEventListener('click', function() {
    document.getElementById('mainNav').classList.toggle('open');
});

// ===== Close mobile menu on any nav link click =====
document.querySelectorAll('#mainNav a').forEach(link => {
    link.addEventListener('click', function() {
        document.getElementById('mainNav')?.classList.remove('open');
    });
});

// ===== FAQ accordion =====
document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', function() {
        const isActive = this.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) this.classList.add('active');
    });
});

// ===== Scroll animations (Intersection Observer) =====
const fadeEls = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const siblings = Array.from(el.parentElement.querySelectorAll('.fade-up:not(.visible)'));
            const i = siblings.indexOf(el);
            if (i >= 0 && siblings.length > 1) {
                const delay = Math.min(i, 6);
                el.classList.add('visible', 'visible-delay-' + delay);
            } else {
                el.classList.add('visible');
            }
            observer.unobserve(el);
        }
    });
}, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
fadeEls.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
        const siblings = Array.from(el.parentElement.querySelectorAll('.fade-up:not(.visible)'));
        const i = siblings.indexOf(el);
        if (i >= 0 && siblings.length > 1) {
            const delay = Math.min(i, 6);
            el.classList.add('visible', 'visible-delay-' + delay);
        } else {
            el.classList.add('visible');
        }
    } else {
        observer.observe(el);
    }
});

// ===== Animated counters =====
const statNumbers = document.querySelectorAll('.hero-stats .number');
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10);
            let current = 0;
            const increment = Math.ceil(target / 30);
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    el.textContent = target;
                    clearInterval(timer);
                } else {
                    el.textContent = current;
                }
            }, 40);
            statObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });
statNumbers.forEach(el => statObserver.observe(el));

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            document.getElementById('mainNav')?.classList.remove('open');
        }
    });
});
