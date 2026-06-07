// 로컬(file://) 환경에서도 작동하도록 ES Module import를 제거하고 전역 firebase 객체를 사용합니다.

// 여기에 본인의 firebaseConfig를 붙여넣으세요!
const firebaseConfig = {
  apiKey: "AIzaSyBz9TpIQOLBVQqR1Xa-S3rkgmgdBKfCVss",
  authDomain: "robot-portfolio.firebaseapp.com",
  projectId: "robot-portfolio",
  storageBucket: "robot-portfolio.firebasestorage.app",
  messagingSenderId: "487599896937",
  appId: "1:487599896937:web:8c43c139cd4bf74efa25f8",
  measurementId: "G-0DC2TZ5YBJ"
};

let db = null;
try {
    // CDN에서 로드된 전역 firebase 객체를 사용해 초기화합니다.
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
} catch (error) {
    console.error("Firebase 초기화 에러: 설정값을 확인해주세요.", error);
}

document.addEventListener('DOMContentLoaded', () => {
    // ── 스크롤 진행 바 ─────────────────────────────────
    const scrollBar = document.getElementById('scroll-progress');
    if (scrollBar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            scrollBar.style.width = docH > 0 ? `${(scrollTop / docH) * 100}%` : '0%';
        }, { passive: true });
    }

    // ── 히어로 Canvas 파티클 네트워크 ──────────────────
    const heroCanvas = document.getElementById('hero-canvas');
    if (heroCanvas) {
        const hCtx = heroCanvas.getContext('2d');
        let hW, hH, hParticles = [];
        const HERO_PARTICLE_COUNT = 80;

        function resizeHeroCanvas() {
            const hero = heroCanvas.parentElement;
            hW = heroCanvas.width  = hero.offsetWidth;
            hH = heroCanvas.height = hero.offsetHeight;
        }
        resizeHeroCanvas();
        window.addEventListener('resize', resizeHeroCanvas, { passive: true });

        class HeroParticle {
            constructor() { this.reset(true); }
            reset(random = false) {
                this.x   = random ? Math.random() * hW : (Math.random() < 0.5 ? -10 : hW + 10);
                this.y   = Math.random() * hH;
                this.vx  = (Math.random() - 0.5) * 0.5;
                this.vy  = (Math.random() - 0.5) * 0.5;
                this.r   = Math.random() * 1.8 + 0.4;
                this.alpha = Math.random() * 0.6 + 0.15;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < -20 || this.x > hW + 20 || this.y < -20 || this.y > hH + 20) {
                    this.reset(false);
                }
            }
            draw() {
                hCtx.beginPath();
                hCtx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                hCtx.fillStyle = `rgba(0, 229, 255, ${this.alpha})`;
                hCtx.fill();
            }
        }

        // 마우스 반응 파티클
        const mouse = { x: null, y: null };
        heroCanvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = heroCanvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        }, { passive: true });
        heroCanvas.parentElement.addEventListener('mouseleave', () => {
            mouse.x = null; mouse.y = null;
        }, { passive: true });

        for (let i = 0; i < HERO_PARTICLE_COUNT; i++) {
            hParticles.push(new HeroParticle());
        }

        function drawHeroConnections() {
            const MAX_DIST = 120;
            const MOUSE_DIST = 160;
            for (let i = 0; i < hParticles.length; i++) {
                // 마우스와의 연결
                if (mouse.x !== null) {
                    const dx = hParticles[i].x - mouse.x;
                    const dy = hParticles[i].y - mouse.y;
                    const d  = Math.sqrt(dx*dx + dy*dy);
                    if (d < MOUSE_DIST) {
                        const op = (1 - d / MOUSE_DIST) * 0.45;
                        hCtx.beginPath();
                        hCtx.moveTo(hParticles[i].x, hParticles[i].y);
                        hCtx.lineTo(mouse.x, mouse.y);
                        hCtx.strokeStyle = `rgba(0, 229, 255, ${op})`;
                        hCtx.lineWidth = 1;
                        hCtx.stroke();
                        // 마우스 근처 파티클 살짝 당기기
                        hParticles[i].vx += -dx / d * 0.015;
                        hParticles[i].vy += -dy / d * 0.015;
                    }
                }
                // 파티클끼리 연결
                for (let j = i + 1; j < hParticles.length; j++) {
                    const dx = hParticles[i].x - hParticles[j].x;
                    const dy = hParticles[i].y - hParticles[j].y;
                    const d  = Math.sqrt(dx*dx + dy*dy);
                    if (d < MAX_DIST) {
                        const op = (1 - d / MAX_DIST) * 0.18;
                        hCtx.beginPath();
                        hCtx.moveTo(hParticles[i].x, hParticles[i].y);
                        hCtx.lineTo(hParticles[j].x, hParticles[j].y);
                        hCtx.strokeStyle = `rgba(0, 229, 255, ${op})`;
                        hCtx.lineWidth = 0.8;
                        hCtx.stroke();
                    }
                }
            }
        }

        // 배경 그라디언트 오버레이
        function drawHeroBg() {
            const grd = hCtx.createRadialGradient(hW/2, hH/2, 0, hW/2, hH/2, hW * 0.7);
            grd.addColorStop(0, 'rgba(0, 229, 255, 0.055)');
            grd.addColorStop(1, 'rgba(5, 5, 10, 0)');
            hCtx.fillStyle = grd;
            hCtx.fillRect(0, 0, hW, hH);
        }

        let heroRafRunning = true;
        function animateHero() {
            if (!heroRafRunning) return;
            hCtx.clearRect(0, 0, hW, hH);
            drawHeroBg();
            hParticles.forEach(p => { p.update(); p.draw(); });
            drawHeroConnections();
            requestAnimationFrame(animateHero);
        }
        animateHero();

        // 히어로가 화면에서 벗어나면 렌더링 중단 (성능 최적화)
        const heroSection = document.getElementById('home');
        if (heroSection) {
            const heroVisObs = new IntersectionObserver((entries) => {
                heroRafRunning = entries[0].isIntersecting;
                if (heroRafRunning) animateHero();
            }, { threshold: 0 });
            heroVisObs.observe(heroSection);
        }
    }

    // ── 히어로 카운터 애니메이션 ────────────────────────
    const heroCounters = [
        { id: 'hc-robots', target: 6  },
        { id: 'hc-tech',   target: 15 },
        { id: 'hc-year',   target: 2026 },
    ];

    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function animateHeroCounter(el, target, duration = 2000) {
        const start = performance.now();
        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            el.textContent = Math.floor(easeOutExpo(t) * target);
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }
        requestAnimationFrame(tick);
    }

    const heroSection2 = document.getElementById('home');
    const countersDone = { done: false };
    if (heroSection2) {
        const counterObs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting && !countersDone.done) {
                    countersDone.done = true;
                    heroCounters.forEach(({ id, target }) => {
                        const el = document.getElementById(id);
                        if (el) animateHeroCounter(el, target);
                    });
                    counterObs.disconnect();
                }
            });
        }, { threshold: 0.4 });
        counterObs.observe(heroSection2);
    }

    // ── 히어로 요소 즉시 가시화 ────────────────────────
    setTimeout(() => {
        document.querySelectorAll('.hero-v2 .fade-in-up').forEach(el => el.classList.add('visible'));
    }, 80);

    // Typing Effect for Hero Title
    const typingText = document.getElementById('typewriter');
    if (typingText) {
        const text = "Robotics";
        let i = 0;
        typingText.textContent = '';
        setTimeout(() => {
            const typingInterval = setInterval(() => {
                if (i < text.length) {
                    typingText.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 150);
        }, 800);
    }


    // Toast Notification System
    const toastContainer = document.getElementById('toast-container');
    function showToast(message, isError = false) {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast ${isError ? 'error' : ''}`;
        toast.innerHTML = `
            <span>${isError ? '⚠️' : '✅'}</span>
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);
        
        toast.offsetHeight; // 렌더링 강제 업데이트 (애니메이션 발동)
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 400);
        }, 3000);
    }

    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');

    function toggleMenu() {
        const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
        hamburger.setAttribute('aria-expanded', !isExpanded);
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    }

    hamburger.addEventListener('click', toggleMenu);
    
    // Keyboard accessibility for hamburger
    hamburger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Scroll Animations using Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right, .fade-in').forEach(el => {
        observer.observe(el);
    });

    // Scroll Spy for Active Navigation Links
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        // Navbar style update
        const navbar = document.querySelector('.navbar');
        if (scrollY > 50) {
            navbar.style.background = 'rgba(5, 5, 10, 0.95)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(5, 5, 10, 0.85)';
            navbar.style.boxShadow = 'none';
        }

        // Active section logic
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(current) && current !== '') {
                item.classList.add('active');
            }
        });
    });

    // Community Board Logic (Firebase V8 Compat)
    const postForm = document.getElementById('post-form');
    const postsContainer = document.getElementById('posts-container');
    const deleteModal = document.getElementById('delete-modal');
    
    // 현재 페이지에 게시판이 없으면 로직을 건너뜁니다. (index.html 오류 방지)
    if (!postForm || !postsContainer || !deleteModal) return;

    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const cancelDeleteBtn = document.getElementById('cancel-delete');
    const closeBtn = document.querySelector('.close-btn');
    const deleteError = document.getElementById('delete-error');
    const deletePasswordInput = document.getElementById('delete-password');

    // Simple SHA-256 Hash Function for password security (with fallback)
    async function hashPassword(password) {
        try {
            if (window.crypto && window.crypto.subtle) {
                const msgBuffer = new TextEncoder().encode(password);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
        } catch(e) {
            console.warn("SubtleCrypto not available, using fallback.");
        }
        return password; // Fallback for file:// environments without crypto
    }

    // Escape HTML to prevent XSS
    function escapeHTML(str) {
        if (!str) return '';
        return str.toString().replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }

    // Delete Modal Logic
    function openDeleteModal(id, hash, raw) {
        const idInput = document.getElementById('delete-post-id');
        idInput.value = id;
        idInput.dataset.hash = hash || '';
        idInput.dataset.raw = raw || '';
        deletePasswordInput.value = '';
        deleteError.style.display = 'none';
        deleteModal.classList.add('active');
        deletePasswordInput.focus();
    }

    function closeDeleteModal() {
        deleteModal.classList.remove('active');
        document.getElementById('delete-post-id').value = '';
        deletePasswordInput.value = '';
    }

    closeBtn.addEventListener('click', (e) => { e.preventDefault(); closeDeleteModal(); });
    cancelDeleteBtn.addEventListener('click', (e) => { e.preventDefault(); closeDeleteModal(); });
    
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && deleteModal.classList.contains('active')) {
            closeDeleteModal();
        }
    });

    // Enter 키로 삭제 확인
    deletePasswordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmDeleteBtn.click();
        }
    });

    // LocalStorage DB 로직으로 대체 (웹사이트를 나갔다 들어와도 유지되도록)
    const LOCAL_STORAGE_KEY = 'nextep_board_posts';
    
    function getLocalPosts() {
        try {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    function saveLocalPosts(posts) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(posts));
    }
    
    function renderPosts() {
        const posts = getLocalPosts();
        postsContainer.innerHTML = '';
        
        if (posts.length === 0) {
            postsContainer.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem 0;">아직 작성된 게시글이 없습니다. 첫 글을 남겨보세요!</p>';
            return;
        }

        // Sort by createdAt desc
        posts.sort((a, b) => b.createdAt - a.createdAt);

        posts.forEach(post => {
            const dateObj = new Date(post.createdAt);
            const pad = (n) => n.toString().padStart(2, '0');
            const dateStr = `${dateObj.getFullYear()}. ${pad(dateObj.getMonth() + 1)}. ${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;

            const postEl = document.createElement('div');
            postEl.className = 'post-item';
            postEl.setAttribute('tabindex', '0');
            postEl.innerHTML = `
                <div class="post-header">
                    <span class="post-author">${escapeHTML(post.author)}</span>
                    <span class="post-date">${dateStr}</span>
                </div>
                <div class="post-content">${escapeHTML(post.content)}</div>
                <button class="btn-delete-small" data-id="${post.id}" data-hash="${escapeHTML(post.passwordHash || '')}" data-raw="${escapeHTML(post.rawPassword || '')}" tabindex="0">삭제하기</button>
            `;
            postsContainer.appendChild(postEl);
        });

        // 삭제 버튼 이벤트 연결
        document.querySelectorAll('.btn-delete-small').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openDeleteModal(
                    btn.getAttribute('data-id'),
                    btn.getAttribute('data-hash'),
                    btn.getAttribute('data-raw')
                );
            });
        });
    }

    // 1. 초기 렌더링
    renderPosts();

    // 2. 글 쓰기 (LocalStorage에 저장)
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const author = document.getElementById('post-author').value.trim();
        const password = document.getElementById('post-password').value.trim();
        const content = document.getElementById('post-content').value.trim();

        if (!author || !password || !content) {
            showToast("모든 항목을 입력해 주세요.", true);
            return;
        }

        const hashedPassword = await hashPassword(password);
        
        const newPost = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            author,
            passwordHash: hashedPassword,
            rawPassword: password, // 안전을 위한 평문 백업 (로컬 환경 지원)
            content,
            createdAt: Date.now()
        };

        const posts = getLocalPosts();
        posts.push(newPost);
        saveLocalPosts(posts);
        
        postForm.reset();
        showToast("게시글이 성공적으로 등록되었습니다.");
        renderPosts(); // 화면 갱신
        
        // (선택) Firebase에도 백업 전송 시도
        if (db) {
            try {
                db.collection("posts").doc(newPost.id).set({
                    ...newPost,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (err) {
                console.warn("Firebase 백업 실패", err);
            }
        }
    });

    // 3. 삭제 처리 (LocalStorage에서 삭제)
    confirmDeleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const idInput = document.getElementById('delete-post-id');
        const id = idInput.value;
        const targetHash = idInput.dataset.hash;
        const targetRaw = idInput.dataset.raw;
        const inputPassword = deletePasswordInput.value.trim();
        
        if (!id) {
            deleteError.textContent = '게시글 ID가 누락되었습니다. 창을 닫고 다시 시도해주세요.';
            deleteError.style.display = 'block';
            return;
        }

        if (!inputPassword) {
            deleteError.textContent = '비밀번호를 입력해주세요.';
            deleteError.style.display = 'block';
            return;
        }

        const inputHash = await hashPassword(inputPassword);
        
        const isPasswordMatch = (targetHash === inputHash) || (targetRaw === inputPassword) || (targetHash === inputPassword);

        if (isPasswordMatch) {
            const posts = getLocalPosts();
            const updatedPosts = posts.filter(p => p.id !== id);
            saveLocalPosts(updatedPosts);
            
            closeDeleteModal();
            showToast("게시글이 삭제되었습니다.");
            renderPosts(); // 화면 갱신
            
            // (선택) Firebase에서도 삭제 시도
            if (db) {
                try {
                    db.collection("posts").doc(id).delete();
                } catch (err) {
                    console.warn("Firebase 백업 삭제 실패", err);
                }
            }
        } else {
            deleteError.textContent = '비밀번호가 일치하지 않습니다.';
            deleteError.style.display = 'block';
            deletePasswordInput.focus();
        }
    });

    // --- 라이브 대시보드 시뮬레이션 로직 ---
    const liveStatus = document.getElementById('live-status');
    const liveBattery = document.getElementById('live-battery');
    const liveBatteryText = document.getElementById('live-battery-text');

    if (liveStatus && liveBattery && liveBatteryText) {
        const statuses = ['자율 주행 중', '경로 탐색 중', '장애물 회피 중', '대기 중', '테이블 배송 중'];
        let currentBattery = 82;

        setInterval(() => {
            currentBattery -= (Math.random() * 0.4 + 0.1);
            if (currentBattery < 20) currentBattery = 100;
            
            const batteryFormatted = currentBattery.toFixed(1);
            liveBattery.style.width = `${batteryFormatted}%`;
            liveBatteryText.textContent = `${batteryFormatted}%`;

            if (Math.random() > 0.7) {
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                liveStatus.textContent = randomStatus;
            }
        }, 3000);
    }

    // ── .feature-img 이미지 페이드인 처리 ───────────────
    document.querySelectorAll('.feature-img img').forEach(img => {
        function onLoaded() {
            img.classList.add('loaded');
            const wrapper = img.closest('.feature-img');
            if (wrapper) wrapper.classList.add('img-ready');
        }
        if (img.complete && img.naturalWidth > 0) {
            onLoaded();
        } else {
            img.addEventListener('load', onLoaded, { once: true });
            img.addEventListener('error', onLoaded, { once: true });
        }
    });

    // ── 카드 3D 마우스 틸트 효과 ────────────────────────
    document.querySelectorAll('.portfolio-feature').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotX = (-y / rect.height * 5).toFixed(2);
            const rotY = (x / rect.width * 5).toFixed(2);
            card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform .5s ease';
        });
    });

    // ── 외부 링크 새 탭 열기 + rel 보안 속성 ────────────
    document.querySelectorAll('a[href^="http"]').forEach(link => {
        if (!link.target) link.target = '_blank';
        link.rel = 'noopener noreferrer';
    });

    // ── Impact 섹션 카운트업 ─────────────────────────────
    const impactData = [
        { id: 'ic-defect',     target: 87  },
        { id: 'ic-efficiency', target: 43  },
        { id: 'ic-cost',       target: 62  },
        { id: 'ic-roi',        target: 8   },
    ];

    const impactSection = document.getElementById('impact');
    if (impactSection) {
        let impactDone = false;
        const impactObs = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting || impactDone) return;
            impactDone = true;

            // 수치 카운트업
            impactData.forEach(({ id, target }) => {
                const el = document.getElementById(id);
                if (!el) return;
                const dur = 1800;
                const start = performance.now();
                function tick(now) {
                    const p = Math.min((now - start) / dur, 1);
                    const e = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.floor(e * target);
                    if (p < 1) requestAnimationFrame(tick);
                    else el.textContent = target;
                }
                requestAnimationFrame(tick);
            });

            // 진행 바 애니메이션
            document.querySelectorAll('.impact-bar').forEach(bar => {
                bar.classList.add('animated');
            });

            impactObs.disconnect();
        }, { threshold: 0, rootMargin: '0px 0px -80px 0px' });
        impactObs.observe(impactSection);
    }

});
