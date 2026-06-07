/* ================================================
   business.js — 사업 전략 페이지 인터랙션
   ================================================ */

/* ── 1. 파티클 캔버스 (Hero 배경) ──────────────── */
(function () {
    const canvas = document.getElementById('biz-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function randomParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.5 + .4,
            vx: (Math.random() - .5) * .35,
            vy: (Math.random() - .5) * .35,
            a: Math.random() * .5 + .1
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: 120 }, randomParticle);
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0,229,255,${p.a})`;
            ctx.fill();
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > W) p.vx *= -1;
            if (p.y < 0 || p.y > H) p.vy *= -1;
        });

        // 근접 선 연결
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,229,255,${.08 * (1 - dist / 100)})`;
                    ctx.lineWidth = .6;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    init();
    draw();
})();

/* ── 2. KPI 숫자 카운트 업 ───────────────────── */
function countUp(el, target, duration = 1800, suffix = '') {
    if (!el) return;
    const start = performance.now();
    const isFloat = String(target).includes('.');
    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = isFloat
            ? (eased * target).toFixed(1)
            : Math.floor(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
}

const kpiObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        countUp(document.getElementById('kpi-market'), 105, 2000);
        countUp(document.getElementById('kpi-model'),  3,   1200);
        countUp(document.getElementById('kpi-seg'),    6,   1400);
        kpiObs.disconnect();
    });
}, { threshold: .5 });

const kpiRow = document.querySelector('.biz-kpi-row');
if (kpiRow) kpiObs.observe(kpiRow);

/* ── 3. 진입 애니메이션 (Intersection Observer) ── */
const fadeEls  = document.querySelectorAll('.fade-in, .fade-in-up');
const slideEls = document.querySelectorAll('.slide-in-left, .slide-in-right');

[...fadeEls, ...slideEls].forEach(el => {
    el.style.opacity = '0';
    el.style.transform = el.classList.contains('slide-in-left')
        ? 'translateX(-40px)'
        : el.classList.contains('slide-in-right')
            ? 'translateX(40px)'
            : 'translateY(30px)';
    el.style.transition = 'opacity .75s cubic-bezier(.25,.8,.25,1), transform .75s cubic-bezier(.25,.8,.25,1)';
});

const animObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        animObs.unobserve(e.target);
    });
}, { threshold: .12 });

[...fadeEls, ...slideEls].forEach(el => animObs.observe(el));

/* ── 4. 지연 클래스 ─────────────────────────── */
document.querySelectorAll('.delay-1').forEach(el => el.style.transitionDelay = '.18s');
document.querySelectorAll('.delay-2').forEach(el => el.style.transitionDelay = '.34s');
document.querySelectorAll('.delay-3').forEach(el => el.style.transitionDelay = '.5s');

/* ── 5. 진행 바 (Progress bars) ──────────────── */
const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('[data-w]').forEach(fill => {
            fill.style.width = fill.dataset.w + '%';
        });
        barObs.unobserve(e.target);
    });
}, { threshold: .3 });

document.querySelectorAll('.biz-visual-card, .biz-market-section').forEach(el => barObs.observe(el));

/* ── 6. 구독 수익 시뮬레이터 ──────────────── */
const subSlider = document.getElementById('sub-stores');
const subStoresVal = document.getElementById('sub-stores-val');
const subRevenue = document.getElementById('sub-revenue');

if (subSlider) {
    function updateSubSim() {
        const n = parseInt(subSlider.value, 10);
        subStoresVal.textContent = n + '개';
        // 로봇 월 15만 + SaaS 5만 = 20만/매장 (monthly 단위: 만 원)
        const monthly = n * 20;
        if (monthly >= 10000) {
            // 1억 원 이상 → 억 단위 표시
            subRevenue.textContent = (monthly / 10000).toFixed(1) + '억 원';
        } else {
            // 9999만 원 이하 → 만 원 단위 그대로 표시 (천단위 콤마 포함)
            subRevenue.textContent = monthly.toLocaleString() + '만 원';
        }
    }
    subSlider.addEventListener('input', updateSubSim);
    updateSubSim();
}

/* ── 7. ROI 계산기 ────────────────────────── */
const roiSlider = document.getElementById('defect-rate');
const roiRateVal = document.getElementById('defect-rate-val');
const roiSaving  = document.getElementById('roi-saving');

if (roiSlider) {
    function updateROI() {
        const rate = parseInt(roiSlider.value, 10);
        roiRateVal.textContent = rate + '%';
        // 월 생산액 기준, 불량 1%당 월 손실 500만원
        const saving = rate * 500;
        roiSaving.textContent = '약 ' + saving.toLocaleString() + '만 원';
    }
    roiSlider.addEventListener('input', updateROI);
    updateROI();
}

/* ── 8. 도메인 네비게이션 활성 상태 ──────── */
const dnItems = document.querySelectorAll('.biz-dnav-item');
const sections = document.querySelectorAll('section[id^="biz-s"]');

const navObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        const idx = Array.from(sections).indexOf(e.target);
        dnItems.forEach((it, i) => {
            it.classList.toggle('dnav-active', i === idx);
        });
    });
}, { threshold: .45 });

sections.forEach(s => navObs.observe(s));

/* ── 9. 햄버거 메뉴 ──────────────────────── */
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const open = hamburger.classList.toggle('active');
        navLinks.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open);
    });
}
