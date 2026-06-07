/**
 * about.js — 회사 소개 페이지 전용 스크립트
 * 담당: 네비게이션, 카운터 애니메이션, 스크롤 인터랙션, 캔버스 파티클
 */

document.addEventListener('DOMContentLoaded', () => {

    // ── 1. 햄버거 메뉴 ──────────────────────────────────────
    const hamburger = document.querySelector('.hamburger');
    const navLinks  = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // 외부 클릭 시 닫기
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ── 2. 스크롤 시 Navbar 강조 ────────────────────────────
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.style.background = window.scrollY > 50
            ? 'rgba(5, 5, 10, 0.98)'
            : 'rgba(5, 5, 10, 0.85)';
    }, { passive: true });

    // ── 3. Intersection Observer — 스크롤 애니메이션 ─────────
    const animatedEls = document.querySelectorAll(
        '.fade-in-up, .slide-in-left, .slide-in-right, .fade-in'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12 });

    animatedEls.forEach(el => observer.observe(el));

    // ── 4. 카운터 애니메이션 (플로팅 스탯) ──────────────────
    const counters = [
        { id: 'counter-projects', target: 12, suffix: '' },
        { id: 'counter-robots',   target: 6,  suffix: '' },
        { id: 'counter-since',    target: 2026, suffix: '' },
    ];

    const easeOutQuad = t => t * (2 - t);

    function animateCounter(el, target, duration = 1800) {
        const start = performance.now();
        const startVal = 0;

        function tick(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased    = easeOutQuad(progress);
            el.textContent = Math.floor(startVal + eased * (target - startVal));
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }

        requestAnimationFrame(tick);
    }

    // 히어로 섹션이 보이면 카운터 시작
    const heroSection = document.querySelector('.about-hero');
    const counterStarted = { done: false };

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !counterStarted.done) {
                counterStarted.done = true;
                counters.forEach(({ id, target }) => {
                    const el = document.getElementById(id);
                    if (el) animateCounter(el, target);
                });
                heroObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });

    if (heroSection) heroObserver.observe(heroSection);

    // ── 5. 비전 섹션 — 진행 바 애니메이션 ──────────────────
    const progressFills = document.querySelectorAll('.vision-progress-fill');

    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const targetWidth = fill.style.width; // HTML에 설정된 목표값 읽기
                fill.style.width = '0%';
                // 리플로우 강제 후 애니메이션
                fill.getBoundingClientRect();
                requestAnimationFrame(() => {
                    fill.style.width = targetWidth;
                });
                progressObserver.unobserve(fill);
            }
        });
    }, { threshold: 0.5 });

    progressFills.forEach(fill => {
        const target = fill.style.width;
        fill.setAttribute('data-target', target);
        fill.style.width = '0%';
        progressObserver.observe(fill);
    });

    // ── 6. Canvas 파티클 (비전 섹션 배경) ───────────────────
    const canvas = document.getElementById('vision-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const section = canvas.parentElement;
        canvas.width  = section.offsetWidth;
        canvas.height = section.offsetHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    const PARTICLE_COUNT = 60;
    const particles = [];

    class Particle {
        constructor() { this.reset(); }

        reset() {
            this.x  = Math.random() * canvas.width;
            this.y  = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.r  = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.5 + 0.1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 229, 255, ${this.alpha})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }

    // 파티클 연결선
    function drawConnections() {
        const maxDist = 130;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx   = particles[i].x - particles[j].x;
                const dy   = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const opacity = (1 - dist / maxDist) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
    }

    // 비전 섹션이 뷰포트에 들어올 때만 애니메이션
    let animating = false;
    let rafId;

    const visionSection = document.querySelector('.vision-section');

    const visionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animating) {
                animating = true;
                animate();
            } else if (!entry.isIntersecting && animating) {
                animating = false;
                cancelAnimationFrame(rafId);
            }
        });
    }, { threshold: 0.1 });

    if (visionSection) visionObserver.observe(visionSection);

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        if (animating) rafId = requestAnimationFrame(animate);
    }

    // ── 7. 부드러운 앵커 스크롤 ─────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const navH  = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
                const top   = targetEl.getBoundingClientRect().top + window.scrollY - navH - 20;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ── 8. 히어로 요소 자동 가시화 ──────────────────────────
    setTimeout(() => {
        document.querySelectorAll('.fade-in-up, .fade-in').forEach(el => {
            el.classList.add('visible');
        });
    }, 100);

});
