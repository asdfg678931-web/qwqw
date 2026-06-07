/* ================================================
   careers.js — 인재채용 페이지 인터랙션
   ================================================ */

/* ── 1. 파티클 캔버스 ────────────────────────── */
(function () {
    const canvas = document.getElementById('cr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    const resize = () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    };

    const randomP = () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + .4,
        vx: (Math.random() - .5) * .3,
        vy: (Math.random() - .5) * .3,
        a: Math.random() * .45 + .08
    });

    const draw = () => {
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
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < 90) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0,229,255,${.07 * (1 - d / 90)})`;
                    ctx.lineWidth = .5;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    particles = Array.from({ length: 100 }, randomP);
    draw();
})();

/* ── 2. KPI 카운트업 ──────────────────────────── */
function countUp(el, target, duration = 1600) {
    if (!el) return;
    const start = performance.now();
    const isStr = String(target).includes('%');
    const num = parseFloat(target);
    function step(now) {
        const p = Math.min((now - start) / duration, 1);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = isStr
            ? Math.floor(e * num)
            : Math.floor(e * num);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = isStr ? num : Math.floor(num);
    }
    requestAnimationFrame(step);
}

const statsObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    countUp(document.getElementById('cs-positions'), 7, 1200);
    countUp(document.getElementById('cs-team'),      8, 1400);
    countUp(document.getElementById('cs-growth'),   180, 1800);
    statsObs.disconnect();
}, { threshold: .5 });

const statsEl = document.querySelector('.cr-stats');
if (statsEl) statsObs.observe(statsEl);

/* ── 3. 진입 애니메이션 ───────────────────────── */
const animEls = document.querySelectorAll(
    '.fade-in-up, .fade-in, .slide-in-left, .slide-in-right'
);

animEls.forEach(el => {
    if (el.classList.contains('fade-in-up')) {
        el.style.cssText += 'opacity:0;transform:translateY(30px);transition:opacity .75s cubic-bezier(.25,.8,.25,1),transform .75s cubic-bezier(.25,.8,.25,1);';
    } else if (el.classList.contains('slide-in-left')) {
        el.style.cssText += 'opacity:0;transform:translateX(-40px);transition:opacity .75s cubic-bezier(.25,.8,.25,1),transform .75s cubic-bezier(.25,.8,.25,1);';
    } else if (el.classList.contains('slide-in-right')) {
        el.style.cssText += 'opacity:0;transform:translateX(40px);transition:opacity .75s cubic-bezier(.25,.8,.25,1),transform .75s cubic-bezier(.25,.8,.25,1);';
    } else {
        el.style.cssText += 'opacity:0;transform:translateY(20px);transition:opacity .75s cubic-bezier(.25,.8,.25,1),transform .75s cubic-bezier(.25,.8,.25,1);';
    }
});

const animObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        animObs.unobserve(e.target);
    });
}, { threshold: .1 });

animEls.forEach(el => animObs.observe(el));

/* 지연 */
document.querySelectorAll('.delay-1').forEach(el => el.style.transitionDelay = '.18s');
document.querySelectorAll('.delay-2').forEach(el => el.style.transitionDelay = '.34s');
document.querySelectorAll('.delay-3').forEach(el => el.style.transitionDelay = '.5s');

/* 카드 순서별 지연 */
document.querySelectorAll('.cr-culture-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.08}s`;
});
document.querySelectorAll('.cr-benefit-item').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.06}s`;
});
document.querySelectorAll('.cr-job-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.07}s`;
});
document.querySelectorAll('.cr-step').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.1}s`;
});

/* ── 4. 채용 공고 필터 탭 ────────────────────── */
const tabs   = document.querySelectorAll('.cr-tab');
const cards  = document.querySelectorAll('.cr-job-card');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const filter = tab.dataset.filter;
        cards.forEach(card => {
            const show = filter === 'all' || card.dataset.category === filter;
            card.classList.toggle('hidden', !show);
            // 보이는 카드 재애니메이션
            if (show) {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'none';
                    }, 50);
                });
            }
        });
    });
});

/* ── 5. 지원 모달 ─────────────────────────────── */
window.openApplyModal = function (jobTitle) {
    document.getElementById('modal-job-title').textContent = jobTitle;
    document.getElementById('apply-modal').classList.add('open');
    document.getElementById('modal-backdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
    document.getElementById('ap-name').focus();
};

window.closeApplyModal = function () {
    document.getElementById('apply-modal').classList.remove('open');
    document.getElementById('modal-backdrop').classList.remove('open');
    document.body.style.overflow = '';
};

// ESC 키 닫기
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeApplyModal();
});

/* ── 6. 지원서 제출 ──────────────────────────── */
window.submitApply = function (e) {
    e.preventDefault();

    const name      = document.getElementById('ap-name').value.trim();
    const email     = document.getElementById('ap-email').value.trim();
    const portfolio = document.getElementById('ap-portfolio').value.trim();
    const message   = document.getElementById('ap-message').value.trim();
    const position  = document.getElementById('modal-job-title').textContent;

    if (!name || !email || !message) {
        showToast('⚠️ 이름, 이메일, 자기소개는 필수 항목입니다.');
        return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('⚠️ 올바른 이메일 주소를 입력해 주세요.');
        return;
    }

    // 제출 애니메이션
    const btn = e.target.querySelector('.cr-submit-btn');
    btn.textContent = '전송 중...';
    btn.disabled = true;

    // mailto: 이메일 구성 (실제 이메일 클라이언트로 전송)
    const subject = encodeURIComponent(`[Nextep Dynamics 채용 지원] ${position} — ${name}`);
    const body = encodeURIComponent(
        `안녕하세요, Nextep Dynamics 채용 담당자님.\n\n` +
        `다음과 같이 지원서를 제출합니다.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n` +
        `【 지원 포지션 】${position}\n` +
        `【 이름       】${name}\n` +
        `【 이메일     】${email}\n` +
        `【 포트폴리오 】${portfolio || '미입력'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `【 자기소개 / 지원 동기 】\n${message}\n\n` +
        `감사합니다.`
    );

    const mailtoLink = `mailto:asdfg678931@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
        // 이메일 클라이언트 열기
        window.location.href = mailtoLink;

        closeApplyModal();
        e.target.reset();
        btn.textContent = '지원서 제출하기 🚀';
        btn.disabled = false;
        showToast(`📩 ${name}님의 이메일이 준비되었습니다!\n이메일 클라이언트에서 전송을 확인해 주세요.`);
    }, 800);
};

/* ── 7. 토스트 알림 ──────────────────────────── */
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'cr-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

/* ── 8. 햄버거 메뉴 ──────────────────────────── */
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const open = hamburger.classList.toggle('active');
        navLinks.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open);
    });
}
