// ============================================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================
let _ore = 0;
    let _essence = 0;
    let _level = 1;
    let _xp = 0;                 
    let _pickaxeLevel = 1;
    let _strikesDone = 0;
    let _strikesLimit = 100;
    let _lastBonusDate = null;
    let _cardHistory = [];
    let _totalStrikesEver = 0;
    let _joinDate = new Date().toLocaleDateString();
    let _compensationClaimed = false;

    let _eventCurrency = 0;
    let _eventPackPrice = 20;

    let pendingPack = null;
    let collectionFilter = 'all';
    let catalogFilter = 'all';
    let searchQuery = '';

    let isMining = false;
    let miningCooldown = 150;
    let _shockwaveBought = false;
    let _soundEnabled = true;
    let _audioCtx = null;

    // Ежечасный бонус
    let _lastHourlyClaim = 0, _hourlyStreak = 0;
    const HOURLY_BONUS = {
        cooldown: 60 * 60 * 1000,
        rewards: { essence: 15, ore: 100, xp: 20 },
        streakBonus: true,
        maxStreakMultiplier: 2.0
    };

    // Реклама
    let adWatchedToday = 0;
    let adLastWatchDate = null;
    const MAX_AD_PER_DAY = 3;
    const AD_REWARD_ESSENCE = 7;
    const AD_REWARD_XP = 15;
    let adTimer = 20;
    let adTimerInterval = null;
    let adIsWatched = false;
    let adRewardClaimed = false;
    let adIsActive = false;

    // Календарь
    let _dailyStreak = 1;
    let _lastLoginDate = null;
    let _calendarClaimed = {};

    // Чат
    let chatChannel = null;
    let chatCooldown = false;
    let chatMessagesToday = 0;
    let chatLastMessageDate = null;
    const CHAT_DAILY_LIMIT = 10;
    const CHAT_REWARD_ESSENCE = 7;
    const CHAT_REWARD_XP = 5;

    // Трейд
    let tradeChannel = null;
    let selectedSenderCards = [];
    let selectedReceiverCards = [];
    let receiverCardsData = [];

	// ================================================================
	// МИНИ-ИГРА: «АРКАНА: ЗВЁЗДНЫЙ ЛОВЕЦ»
	// Платформа внизу, ловишь звёзды, уклоняешься от метеоритов
	// ================================================================
	const FG = {
	    canvas: null, ctx: null,
	    running: false, gameOver: false,

	    // Платформа
	    paddle: {
	        x: 180, y: 0,           // y задаётся в fgInit
	        w: 90, h: 14,
	        vx: 0,
	        maxSpeed: 8,
	        targetX: 180            // для тач-управления (плавное движение к пальцу)
	    },

	    // Падающие объекты
	    stars: [],                  // звёзды (ловить)
	    meteors: [],                // метеориты (избегать)
	    particles: [],              // частицы

	    score: 0, best: 0,
	    gamesPlayed: 0,
	    lastTime: 0,
	    starTimer: 0,
	    meteorTimer: 0,
	    lives: 3,                   // жизни
	    maxLives: 3,

	    // Физика
	    baseStarSpeed: 2.4,
	    baseMeteorSpeed: 3.0,
	    scrollSpeed: 3.4,

	    W: 360, H: 640,
	    runEssence: 0,

	    // Дневной лимит
	    dailyCollected: 0, dailyLimit: 50, lastDailyDate: null,

	    // Управление
	    inputLeft: false,
	    inputRight: false,
	    touchActive: false
	};

	const FG_FPS_TARGET = 60;
	const FG_FRAME_TIME = 1000 / FG_FPS_TARGET;
	let _fgBgGrad = null;
	let _fgStarCache = null;
	let _fgNebulaCache = null;

	// --- SVG-иконки ---
	function fgMakeIcon(type) {
	    const icons = {
	        paddle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20">
	            <defs>
	                <linearGradient id="fgPaddleGrad" x1="0" y1="0" x2="0" y2="1">
	                    <stop offset="0%" stop-color="#e0c8ff"/>
	                    <stop offset="40%" stop-color="#b388ff"/>
	                    <stop offset="100%" stop-color="#5a2db8"/>
	                </linearGradient>
	            </defs>
	            <rect x="2" y="2" width="96" height="16" rx="8" fill="url(#fgPaddleGrad)" stroke="#ffffff" stroke-width="1" opacity="0.95"/>
	            <rect x="8" y="4" width="84" height="4" rx="2" fill="#ffffff" opacity="0.5"/>
	            <circle cx="20" cy="10" r="2" fill="#00ffff" opacity="0.9"/>
	            <circle cx="80" cy="10" r="2" fill="#00ffff" opacity="0.9"/>
	        </svg>`,

	        star: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
	            <defs>
	                <radialGradient id="fgStarBody" cx="50%" cy="40%" r="60%">
	                    <stop offset="0%" stop-color="#ffffff"/>
	                    <stop offset="40%" stop-color="#ffdd66"/>
	                    <stop offset="100%" stop-color="#ffaa33"/>
	                </radialGradient>
	            </defs>
	            <polygon points="16,2 20,12 30,13 22,20 25,30 16,25 7,30 10,20 2,13 12,12"
	                fill="url(#fgStarBody)" stroke="#cc7722" stroke-width="0.8"/>
	        </svg>`,

	        meteor: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
	            <defs>
	                <radialGradient id="fgMeteorBody" cx="35%" cy="30%" r="80%">
	                    <stop offset="0%" stop-color="#ffaa66"/>
	                    <stop offset="45%" stop-color="#cc5522"/>
	                    <stop offset="100%" stop-color="#4a1a0a"/>
	                </radialGradient>
	            </defs>
	            <circle cx="32" cy="32" r="26" fill="url(#fgMeteorBody)"/>
	            <circle cx="24" cy="24" r="6" fill="#3a1206" opacity="0.7"/>
	            <circle cx="42" cy="38" r="5" fill="#3a1206" opacity="0.6"/>
	            <circle cx="32" cy="46" r="4" fill="#3a1206" opacity="0.5"/>
	            <path d="M32 6 Q28 16 34 22 Q30 30 36 36" stroke="#ffcc66" stroke-width="1.5" fill="none" opacity="0.6"/>
	        </svg>`,

	        // Маленькая звезда для фона
	        bgStar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8">
	            <circle cx="4" cy="4" r="3" fill="#ffffff"/>
	        </svg>`
	    };
	    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(icons[type]);
	}

	const FG_ICONS = {};
	function fgLoadIcons() {
	    FG_ICONS.paddle = new Image(); FG_ICONS.paddle.src = fgMakeIcon('paddle');
	    FG_ICONS.star = new Image(); FG_ICONS.star.src = fgMakeIcon('star');
	    FG_ICONS.meteor = new Image(); FG_ICONS.meteor.src = fgMakeIcon('meteor');
	}

	// ============================================================
	// Дневной лимит (не меняется)
	// ============================================================
	function fgCheckDailyLimit() {
	    const today = new Date().toDateString();
	    if (FG.lastDailyDate !== today) {
	        FG.dailyCollected = 0;
	        FG.lastDailyDate = today;
	        fgSaveStats();
	    }
	}
	function fgCanCollect(amount) {
	    fgCheckDailyLimit();
	    return Math.min(amount, Math.max(0, FG.dailyLimit - FG.dailyCollected));
	}
	function fgUpdateDailyUI() {
	    const fill = document.getElementById('fgDailyFill');
	    const col = document.getElementById('fgDailyCollected');
	    const bottomEssence = document.getElementById('fgBottomEssence');
	    const todayEssence = document.getElementById('fgTodayEssence');

	    const pct = Math.min((FG.dailyCollected / FG.dailyLimit) * 100, 100);
	    if (fill) fill.style.width = pct + '%';
	    if (col) col.textContent = FG.dailyCollected;
	    if (bottomEssence) bottomEssence.textContent = FG.dailyCollected + '/50';
	    if (todayEssence) todayEssence.textContent = FG.dailyCollected;
	}

	// ============================================================
	// Сохранение
	// ============================================================
	function fgLoadStats() {
	    try {
	        const s = JSON.parse(localStorage.getItem('arcana_flappy') || '{}');
	        FG.best = s.best || 0;
	        FG.gamesPlayed = s.gamesPlayed || 0;
	        FG.dailyCollected = s.dailyCollected || 0;
	        FG.lastDailyDate = s.lastDailyDate || null;
	        fgCheckDailyLimit();
	    } catch(e) {}
	}
	function fgSaveStats() {
	    localStorage.setItem('arcana_flappy', JSON.stringify({
	        best: FG.best,
	        gamesPlayed: FG.gamesPlayed,
	        dailyCollected: FG.dailyCollected,
	        lastDailyDate: FG.lastDailyDate
	    }));
	}

	function fgUpdateSideStats() {
	    const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
	    setT('fgBestPreview', FG.best);
	    setT('fgBottomBest', FG.best);
	    setT('fgBottomGames', FG.gamesPlayed);
	    const livesEl = document.getElementById('fgLives');
	    if (livesEl) livesEl.textContent = FG.lives;
	}

	// ============================================================
	// Инициализация
	// ============================================================
	function fgInit() {
	    FG.canvas = document.getElementById('fgCanvas');
	    if (!FG.canvas || FG.canvas.dataset.inited) return;
	    FG.canvas.dataset.inited = '1';

	    FG.ctx = FG.canvas.getContext('2d', { alpha: false, desynchronized: true });
	    if (FG.ctx) FG.ctx.imageSmoothingEnabled = false;

	    _fgBgGrad = null;
	    _fgStarCache = null;
	    _fgNebulaCache = null;

	    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
	    if (isMobile) {
	        FG.canvas.width = 300;
	        FG.canvas.height = 533;
	    }

	    FG.W = FG.canvas.width;
	    FG.H = FG.canvas.height;

	    // Платформа
	    FG.paddle.w = Math.max(70, FG.W * 0.25);
	    FG.paddle.h = 14;
	    FG.paddle.x = FG.W / 2;
	    FG.paddle.y = FG.H - 40;
	    FG.paddle.vx = 0;
	    FG.paddle.maxSpeed = FG.W / 45;
	    FG.paddle.targetX = FG.paddle.x;

	    fgLoadIcons();
	    fgLoadStats();
	    fgUpdateSideStats();
	    fgUpdateDailyUI();

	    const playBtn = document.getElementById('fgPlayBtn');
	    const retryBtn = document.getElementById('fgRetryBtn');
	    if (playBtn) playBtn.addEventListener('click', fgStart);
	    if (retryBtn) retryBtn.addEventListener('click', fgStart);

	    // ===== КЛАВИАТУРА =====
	    window.addEventListener('keydown', function(e) {
	        if (!FG.running) return;
	        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
	            e.preventDefault();
	            FG.inputLeft = true;
	        }
	        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
	            e.preventDefault();
	            FG.inputRight = true;
	        }
	    });
	    window.addEventListener('keyup', function(e) {
	        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ф' || e.key === 'Ф') {
	            FG.inputLeft = false;
	        }
	        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'в' || e.key === 'В') {
	            FG.inputRight = false;
	        }
	    });

	    // ===== МЫШЬ =====
	    function handleMouseMove(e) {
	        if (!FG.running) return;
	        const rect = FG.canvas.getBoundingClientRect();
	        const scale = FG.W / rect.width;
	        const x = (e.clientX - rect.left) * scale;
	        FG.paddle.targetX = x;
	        FG.touchActive = true;
	    }
	    FG.canvas.addEventListener('mousemove', handleMouseMove);
	    FG.canvas.addEventListener('mouseenter', function() { FG.touchActive = true; });
	    FG.canvas.addEventListener('mouseleave', function() {
	        FG.touchActive = false;
	        FG.inputLeft = false;
	        FG.inputRight = false;
	    });

	    // ===== ТАЧ =====
	    function handleTouch(e) {
	        if (!FG.running) return;
	        e.preventDefault();
	        const touch = e.touches[0];
	        const rect = FG.canvas.getBoundingClientRect();
	        const scale = FG.W / rect.width;
	        const x = (touch.clientX - rect.left) * scale;
	        FG.paddle.targetX = x;
	        FG.touchActive = true;
	    }
	    FG.canvas.addEventListener('touchstart', handleTouch, { passive: false });
	    FG.canvas.addEventListener('touchmove', handleTouch, { passive: false });
	    FG.canvas.addEventListener('touchend', function(e) {
	        e.preventDefault();
	        FG.touchActive = false;
	    }, { passive: false });

	    setInterval(fgUpdateDailyUI, 60000);
	    fgRenderIdle();
	}

	// ============================================================
	// Старт игры
	// ============================================================
	function fgStart() {
	    fgCheckDailyLimit();
	    FG.running = true;
	    FG.gameOver = false;
	    FG.score = 0;
	    FG.runEssence = 0;
	    FG.lives = FG.maxLives;

	    FG.paddle.x = FG.W / 2;
	    FG.paddle.targetX = FG.paddle.x;
	    FG.paddle.vx = 0;

	    FG.stars = [];
	    FG.meteors = [];
	    FG.particles = [];
	    FG.starTimer = 300;
	    FG.meteorTimer = 600;
	    FG.inputLeft = false;
	    FG.inputRight = false;
	    FG.touchActive = false;

	    FG.gamesPlayed += 1;
	    fgSaveStats();

	    const startOverlay = document.getElementById('fgStartOverlay');
	    const overOverlay = document.getElementById('fgOverOverlay');
	    const hud = document.getElementById('fgHUD');
	    if (startOverlay) startOverlay.style.display = 'none';
	    if (overOverlay) overOverlay.style.display = 'none';
	    if (hud) hud.style.display = 'flex';

	    FG.lastTime = 0;
	    requestAnimationFrame(fgLoop);
	}

	// ============================================================
	// Спавн звезды (ловить)
	// ============================================================
	function fgSpawnStar() {
	    if (FG.dailyCollected >= FG.dailyLimit) return;
	    const r = 12;
	    FG.stars.push({
	        x: r + Math.random() * (FG.W - 2 * r),
	        y: -r,
	        r: r,
	        vy: FG.baseStarSpeed + Math.random() * 0.8 + FG.score * 0.02,
	        rotation: 0,
	        vr: 0.03 + Math.random() * 0.03,
	        collected: false
	    });
	}

	// ============================================================
	// Спавн метеорита (избегать)
	// ============================================================
	function fgSpawnMeteor() {
	    const r = 12 + Math.random() * 14;
	    FG.meteors.push({
	        x: r + Math.random() * (FG.W - 2 * r),
	        y: -r,
	        r: r,
	        vy: FG.baseMeteorSpeed + Math.random() * 1.2 + FG.score * 0.03,
	        vx: (Math.random() - 0.5) * 0.6,        // лёгкий снос в сторону
	        rotation: Math.random() * Math.PI * 2,
	        vr: (Math.random() - 0.5) * 0.05
	    });
	}

	// ============================================================
	// Конец игры
	// ============================================================
	function fgGameOver() {
	    if (FG.gameOver) return;
	    FG.running = false;
	    FG.gameOver = true;

	    const newRecord = FG.score > FG.best;
	    const essenceReward = FG.runEssence;
	    const oreReward = newRecord ? 10 : 0;

	    if (essenceReward > 0) _essence += essenceReward;
	    if (oreReward > 0) _ore += oreReward;

	    if (newRecord) FG.best = FG.score;
	    fgSaveStats();
	    saveGame();
	    updateUI();

	    const finalScore = document.getElementById('fgFinalScore');
	    if (finalScore) finalScore.textContent = FG.score;

	    let rewardsHtml = '';
	    if (essenceReward > 0) rewardsHtml += `<div class="reward-line" style="color:#b388ff;">💠 +${essenceReward} эссенции</div>`;
	    if (oreReward > 0) rewardsHtml += `<div class="reward-line" style="color:#f5b342;">⛏️ +${oreReward} руды (рекорд!)</div>`;
	    if (FG.dailyCollected >= FG.dailyLimit) {
	        rewardsHtml += `<div class="reward-line" style="color:#ff6b6b;font-size:10px;">🚫 Лимит 50 💠 исчерпан</div>`;
	    } else {
	        const left = FG.dailyLimit - FG.dailyCollected;
	        rewardsHtml += `<div class="reward-line" style="color:#8b90a8;">Осталось сегодня: ${left} 💠</div>`;
	    }
	    if (rewardsHtml === '') rewardsHtml = '<div style="color:#6b7084;font-size:11px;">Пока нечего начислять</div>';
	    const rewardsEl = document.getElementById('fgRewards');
	    if (rewardsEl) rewardsEl.innerHTML = rewardsHtml;

	    const hud = document.getElementById('fgHUD');
	    const overOverlay = document.getElementById('fgOverOverlay');
	    if (hud) hud.style.display = 'none';
	    if (overOverlay) overOverlay.style.display = 'flex';

	    fgUpdateSideStats();
	    fgUpdateDailyUI();

	    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
	    if (FG.score > 0) {
	        addQuestProgress('minigame_play', 1);
	    }
	}

	// ============================================================
	// Обновление кадра
	// ============================================================
	function fgUpdate(dt) {
	    const timeScale = dt / FG_FRAME_TIME;

	    // ===== УПРАВЛЕНИЕ ПЛАТФОРМОЙ =====
	    // Клавиатура
	    if (FG.inputLeft && !FG.touchActive) {
	        FG.paddle.vx = -FG.paddle.maxSpeed;
	    } else if (FG.inputRight && !FG.touchActive) {
	        FG.paddle.vx = FG.paddle.maxSpeed;
	    } else {
	        FG.paddle.vx *= 0.85;                  // затухание
	        if (Math.abs(FG.paddle.vx) < 0.1) FG.paddle.vx = 0;
	    }

	    // Мышь / тач — плавное движение к targetX
	    if (FG.touchActive) {
	        const dx = FG.paddle.targetX - FG.paddle.x;
	        FG.paddle.vx = Math.max(-FG.paddle.maxSpeed, Math.min(FG.paddle.maxSpeed, dx * 0.35));
	    }

	    FG.paddle.x += FG.paddle.vx * timeScale;

	    // Границы
	    const halfW = FG.paddle.w / 2;
	    if (FG.paddle.x - halfW < 0) {
	        FG.paddle.x = halfW;
	        FG.paddle.vx = 0;
	    }
	    if (FG.paddle.x + halfW > FG.W) {
	        FG.paddle.x = FG.W - halfW;
	        FG.paddle.vx = 0;
	    }

	    // ===== СПАВН ОБЪЕКТОВ =====
	    FG.starTimer -= dt;
	    if (FG.starTimer <= 0) {
	        fgSpawnStar();
	        FG.starTimer = 700 + Math.random() * 900;
	    }

	    FG.meteorTimer -= dt;
	    if (FG.meteorTimer <= 0) {
	        fgSpawnMeteor();
	        const interval = Math.max(400, 1100 - FG.score * 20);
	        FG.meteorTimer = interval;
	    }

	    // ===== ДВИЖЕНИЕ ЗВЁЗД =====
	    const paddleTop = FG.paddle.y - FG.paddle.h / 2;
	    const paddleLeft = FG.paddle.x - halfW;
	    const paddleRight = FG.paddle.x + halfW;

	    for (let i = FG.stars.length - 1; i >= 0; i--) {
	        const s = FG.stars[i];
	        s.y += s.vy * timeScale;
	        s.rotation += s.vr * timeScale;

	        // Проверка: попала ли звезда на платформу
	        // Считаем, что звезда поймана, если её центр по X внутри платформы,
	        // а по Y она коснулась верхнего края платформы
	        const hitX = s.x > paddleLeft - s.r * 0.5 && s.x < paddleRight + s.r * 0.5;
	        const hitY = s.y + s.r >= paddleTop && s.y - s.r <= FG.paddle.y + FG.paddle.h;

	        if (hitX && hitY) {
	            // Поймали
	            const canCollect = fgCanCollect(1);
	            if (canCollect > 0) {
	                FG.dailyCollected = Math.min(FG.dailyCollected + 1, FG.dailyLimit);
	                fgSaveStats();
	                FG.runEssence += 1;
	                FG.score += 1;
	                fgUpdateDailyUI();

	                const rect = FG.canvas.getBoundingClientRect();
	                showFloatingNumber('💠', rect.left + (s.x / FG.W) * rect.width, rect.top + (s.y / FG.H) * rect.height, false);
	                fgSpawnBurst(s.x, s.y, '#ffdd66', 10);

	                if (FG.dailyCollected >= FG.dailyLimit) {
	                    showToast(`🚫 Лимит ${FG.dailyLimit} 💠 исчерпан!`, '#ff6b6b');
	                }
	            } else {
	                const rect = FG.canvas.getBoundingClientRect();
	                const div = document.createElement('div');
	                div.className = 'floating-number';
	                div.textContent = '🚫';
	                div.style.left = rect.left + (s.x / FG.W) * rect.width + 'px';
	                div.style.top = rect.top + (s.y / FG.H) * rect.height + 'px';
	                div.style.fontSize = '20px';
	                document.body.appendChild(div);
	                setTimeout(() => div.remove(), 1000);
	            }
	            FG.stars.splice(i, 1);
	            continue;
	        }

	        // Улетела вниз
	        if (s.y - s.r > FG.H) {
	            FG.stars.splice(i, 1);
	        }
	    }

	    // ===== ДВИЖЕНИЕ МЕТЕОРИТОВ =====
	    for (let i = FG.meteors.length - 1; i >= 0; i--) {
	        const m = FG.meteors[i];
	        m.y += m.vy * timeScale;
	        m.x += m.vx * timeScale;
	        m.rotation += m.vr * timeScale;

	        // Отскок от боковых границ
	        if (m.x - m.r < 0) { m.x = m.r; m.vx = -m.vx; }
	        if (m.x + m.r > FG.W) { m.x = FG.W - m.r; m.vx = -m.vx; }

	        // Проверка: столкновение с платформой
	        const hitX = m.x > paddleLeft - m.r * 0.5 && m.x < paddleRight + m.r * 0.5;
	        const hitY = m.y + m.r >= paddleTop && m.y - m.r <= FG.paddle.y + FG.paddle.h;

	        if (hitX && hitY) {
	            // Взрыв + минус жизнь
	            fgSpawnBurst(m.x, m.y, '#ff6633', 20);
	            FG.lives -= 1;
	            fgUpdateSideStats();
	            if (navigator.vibrate) navigator.vibrate([80, 40, 80]);

	            FG.meteors.splice(i, 1);

	            if (FG.lives <= 0) {
	                fgGameOver();
	                return;
	            }
	            continue;
	        }

	        // Улетел вниз
	        if (m.y - m.r > FG.H) {
	            FG.meteors.splice(i, 1);
	        }
	    }

	    // ===== ЧАСТИЦЫ =====
	    for (let i = FG.particles.length - 1; i >= 0; i--) {
	        const p = FG.particles[i];
	        p.x += p.vx * timeScale;
	        p.y += p.vy * timeScale;
	        p.vy += 0.15 * timeScale;
	        p.vx *= 0.98;
	        p.life -= dt;
	        if (p.life <= 0) FG.particles.splice(i, 1);
	    }

	    // ===== HUD =====
	    const scoreEl = document.getElementById('fgScore');
	    const essenceEl = document.getElementById('fgEssence');
	    if (scoreEl) scoreEl.textContent = FG.score;
	    if (essenceEl) essenceEl.textContent = FG.runEssence;
	}

	// ============================================================
	// Частицы (взрыв)
	// ============================================================
	function fgSpawnBurst(x, y, color, count) {
	    for (let i = 0; i < count; i++) {
	        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
	        const speed = 1.5 + Math.random() * 3.5;
	        FG.particles.push({
	            x: x, y: y,
	            vx: Math.cos(angle) * speed,
	            vy: Math.sin(angle) * speed - 1,
	            r: 2 + Math.random() * 3,
	            life: 500 + Math.random() * 300,
	            maxLife: 800,
	            color: color
	        });
	    }
	}

	// ============================================================
	// Отрисовка
	// ============================================================
	function fgRender() {
	    const ctx = FG.ctx;
	    const now = performance.now();

	    // Фон
	    if (!_fgBgGrad) {
	        _fgBgGrad = ctx.createLinearGradient(0, 0, 0, FG.H);
	        _fgBgGrad.addColorStop(0, '#05050f');
	        _fgBgGrad.addColorStop(0.5, '#0f0a1f');
	        _fgBgGrad.addColorStop(1, '#05050f');
	    }
	    ctx.fillStyle = _fgBgGrad;
	    ctx.fillRect(0, 0, FG.W, FG.H);

	    // Туманности — рисуем кругами через arc, а не прямоугольниками
	    if (!_fgNebulaCache) {
	        _fgNebulaCache = [
	            { x: FG.W * 0.2, y: FG.H * 0.25, r: FG.W * 0.5, color: 'rgba(123, 77, 255, 0.10)' },
	            { x: FG.W * 0.8, y: FG.H * 0.6, r: FG.W * 0.6, color: 'rgba(179, 136, 255, 0.07)' },
	            { x: FG.W * 0.5, y: FG.H * 0.85, r: FG.W * 0.4, color: 'rgba(74, 158, 255, 0.06)' }
	        ];
	    }
	    for (const n of _fgNebulaCache) {
	        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
	        g.addColorStop(0, n.color);
	        g.addColorStop(0.6, n.color.replace(/[\d.]+\)$/, '0.02)'));
	        g.addColorStop(1, 'rgba(0,0,0,0)');
	        ctx.fillStyle = g;
	        ctx.beginPath();
	        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
	        ctx.fill();
	    }

	    // Звёздный фон
	    if (!_fgStarCache) {
	        _fgStarCache = [];
	        for (let i = 0; i < 60; i++) {
	            _fgStarCache.push({
	                x: (i * 137.5) % FG.W,
	                y: (i * 73.3) % FG.H,
	                r: ((i * 31) % 3) * 0.35 + 0.3,
	                speed: 0.05 + ((i * 17) % 10) * 0.015,
	                brightness: 0.3 + ((i * 7) % 10) * 0.05
	            });
	        }
	    }
	    const scroll = FG.running ? (now * 0.02) : 0;
	    for (const s of _fgStarCache) {
	        const sy = (s.y + scroll * s.speed * 60) % FG.H;
	        ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness})`;
	        ctx.beginPath();
	        ctx.arc(s.x, sy, s.r, 0, Math.PI * 2);
	        ctx.fill();
	    }

	    // ===== ПАДАЮЩИЕ ЗВЁЗДЫ =====
	    for (const s of FG.stars) {
	        // Свечение — круглое, через arc
	        const glowR = s.r * 3;
	        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowR);
	        glow.addColorStop(0, 'rgba(255, 221, 102, 0.55)');
	        glow.addColorStop(0.5, 'rgba(255, 200, 80, 0.15)');
	        glow.addColorStop(1, 'rgba(255, 200, 80, 0)');
	        ctx.fillStyle = glow;
	        ctx.beginPath();
	        ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
	        ctx.fill();

	        // Сама звезда
	        ctx.save();
	        ctx.translate(s.x, s.y);
	        ctx.rotate(s.rotation);
	        if (FG_ICONS.star && FG_ICONS.star.complete) {
	            ctx.drawImage(FG_ICONS.star, -s.r, -s.r, s.r * 2, s.r * 2);
	        } else {
	            ctx.fillStyle = '#ffdd66';
	            ctx.beginPath();
	            ctx.arc(0, 0, s.r, 0, Math.PI * 2);
	            ctx.fill();
	        }
	        ctx.restore();
	    }

	    // ===== МЕТЕОРИТЫ =====
	    for (const m of FG.meteors) {
	        // Огненный шлейф (сзади, по направлению движения)
	        const trailLen = m.r * 2.5;
	        const trailGrad = ctx.createLinearGradient(m.x, m.y - m.r, m.x, m.y - trailLen);
	        trailGrad.addColorStop(0, 'rgba(255, 102, 51, 0.55)');
	        trailGrad.addColorStop(0.5, 'rgba(255, 102, 51, 0.2)');
	        trailGrad.addColorStop(1, 'rgba(255, 102, 51, 0)');
	        ctx.fillStyle = trailGrad;
	        ctx.beginPath();
	        ctx.moveTo(m.x - m.r * 0.5, m.y - m.r * 0.3);
	        ctx.lineTo(m.x + m.r * 0.5, m.y - m.r * 0.3);
	        ctx.lineTo(m.x, m.y - trailLen);
	        ctx.closePath();
	        ctx.fill();

	        // Круглое свечение
	        const glowR = m.r * 2.2;
	        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, glowR);
	        glow.addColorStop(0, 'rgba(255, 120, 60, 0.5)');
	        glow.addColorStop(0.5, 'rgba(255, 90, 40, 0.15)');
	        glow.addColorStop(1, 'rgba(255, 90, 40, 0)');
	        ctx.fillStyle = glow;
	        ctx.beginPath();
	        ctx.arc(m.x, m.y, glowR, 0, Math.PI * 2);
	        ctx.fill();

	        // Сам метеорит
	        ctx.save();
	        ctx.translate(m.x, m.y);
	        ctx.rotate(m.rotation);
	        if (FG_ICONS.meteor && FG_ICONS.meteor.complete) {
	            ctx.drawImage(FG_ICONS.meteor, -m.r, -m.r, m.r * 2, m.r * 2);
	        } else {
	            ctx.fillStyle = '#cc5522';
	            ctx.beginPath();
	            ctx.arc(0, 0, m.r, 0, Math.PI * 2);
	            ctx.fill();
	        }
	        ctx.restore();
	    }

	    // Частицы
	    for (const p of FG.particles) {
	        const alpha = Math.max(0, p.life / p.maxLife);
	        ctx.globalAlpha = alpha;
	        ctx.fillStyle = p.color;
	        ctx.beginPath();
	        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
	        ctx.fill();
	    }
	    ctx.globalAlpha = 1;

	    // ===== ПЛАТФОРМА =====
	    const px = FG.paddle.x;
	    const py = FG.paddle.y;
	    const pw = FG.paddle.w;
	    const ph = FG.paddle.h;

	    // Круглое свечение под платформой
	    const pGlowR = pw * 0.9;
	    const pGlow = ctx.createRadialGradient(px, py, 0, px, py, pGlowR);
	    pGlow.addColorStop(0, 'rgba(179, 136, 255, 0.35)');
	    pGlow.addColorStop(0.5, 'rgba(179, 136, 255, 0.1)');
	    pGlow.addColorStop(1, 'rgba(179, 136, 255, 0)');
	    ctx.fillStyle = pGlow;
	    ctx.beginPath();
	    ctx.arc(px, py, pGlowR, 0, Math.PI * 2);
	    ctx.fill();

	    // Сама платформа
	    if (FG_ICONS.paddle && FG_ICONS.paddle.complete) {
	        ctx.drawImage(FG_ICONS.paddle, px - pw / 2, py - ph / 2, pw, ph);
	    } else {
	        ctx.fillStyle = '#b388ff';
	        ctx.beginPath();
	        if (ctx.roundRect) {
	            ctx.roundRect(px - pw / 2, py - ph / 2, pw, ph, ph / 2);
	        } else {
	            ctx.rect(px - pw / 2, py - ph / 2, pw, ph);
	        }
	        ctx.fill();
	    }

	    // Индикаторы жизни над платформой
	    if (FG.running && FG.lives > 0) {
	        for (let i = 0; i < FG.maxLives; i++) {
	            const filled = i < FG.lives;
	            const cx = px - (FG.maxLives - 1) * 8 / 2 + i * 8;
	            const cy = py - ph - 12;

	            // Свечение жизни
	            if (filled) {
	                const lGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
	                lGlow.addColorStop(0, 'rgba(255, 51, 102, 0.6)');
	                lGlow.addColorStop(1, 'rgba(255, 51, 102, 0)');
	                ctx.fillStyle = lGlow;
	                ctx.beginPath();
	                ctx.arc(cx, cy, 8, 0, Math.PI * 2);
	                ctx.fill();
	            }

	            ctx.fillStyle = filled ? '#ff3366' : 'rgba(255, 51, 102, 0.2)';
	            ctx.beginPath();
	            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
	            ctx.fill();
	        }
	    }
	}

	function fgRenderIdle() {
	    if (!FG.ctx) return;
	    const ctx = FG.ctx;
	    if (!_fgBgGrad) {
	        _fgBgGrad = ctx.createLinearGradient(0, 0, 0, FG.H);
	        _fgBgGrad.addColorStop(0, '#05050f');
	        _fgBgGrad.addColorStop(0.5, '#0f0a1f');
	        _fgBgGrad.addColorStop(1, '#05050f');
	    }
	    ctx.fillStyle = _fgBgGrad;
	    ctx.fillRect(0, 0, FG.W, FG.H);
	}

	function fgLoop(t) {
	    if (!FG.running) return;
	    FG.lastTime = FG.lastTime || t;
	    const elapsed = t - FG.lastTime;
	    if (elapsed < FG_FRAME_TIME) {
	        requestAnimationFrame(fgLoop);
	        return;
	    }
	    const dt = Math.min(elapsed, FG_FRAME_TIME * 2);
	    FG.lastTime = t;
	    fgUpdate(dt);
	    if (FG.running || FG.particles.length > 0) fgRender();
	    requestAnimationFrame(fgLoop);
	}

    // ================================================================
    // СИСТЕМА ОПЫТА
    // ================================================================

    // Компенсация за уровень
    function getLevelUpCost(level) {
        if (level < 5) return Math.floor(10 + level * 5);
        return Math.floor(35 + (level - 1) * 8 + Math.pow(level, 1.2));
    }

    // Формула: XP для след. уровня = 50 + (уровень × 25)
    function xpForLevel(level) {
        return 50 + (level * 25);
    }

    // Начисление опыта с автоматическим повышением уровня
    function addXP(amount) {
        if (amount <= 0) return;
        _xp += amount;
        let leveledUp = false;
        while (_xp >= xpForLevel(_level)) {
            _xp -= xpForLevel(_level);
            _level++;
            leveledUp = true;
        }
        if (leveledUp) {
            showToast(`🎉 УРОВЕНЬ ${_level}!`, '#ffcc66');

		    // 🔔 Уведомление
		    if (typeof createNotification === 'function') {
		        createNotification(
		            _playerId,
		            'level_up',
		            `⭐ Уровень ${_level}!`,
		            `Ты достиг ${_level} уровня. Продолжай в том же духе!`,
		            { level: _level }
		        );
		    }
            
            // Показываем всплывашку
            const el = document.getElementById('pickaxeBtn') || document.body;
            const rect = el.getBoundingClientRect ? el.getBoundingClientRect() : { left: window.innerWidth/2, top: 200, width: 0, height: 0 };
            const div = document.createElement('div');
            div.className = 'floating-number xp-float';
            div.textContent = `⭐ LVL ${_level}!`;
            div.style.left = (rect.left + rect.width / 2) + 'px';
            div.style.top = (rect.top + rect.height / 2 - 60) + 'px';
            div.style.fontSize = '32px';
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 1200);
        }
        saveGame();
        updateUI();
    }

    // Награды XP
    const XP_MINE = 1;
    const XP_CHAT = 5;
    const XP_AD = 15;
    const XP_PACK = 10;
    const XP_BONUS = 20;
    const XP_CALENDAR = 10;

    // ============================================================
    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    // ============================================================

    const RANK_STARS = {
        'M': 9, 'T': 8, 'K': 7, 'Y': 6, 'U': 5, 'Q': 4,
        'R': 3, 'Z': 2, 'O': 1, 'H': 1, 'N': 1, 'V': 1, 'L': 1
    };

    const RANK_GLOW = {
        'M': 'rgba(255, 0, 102, 0.6)',
        'T': 'rgba(192, 192, 192, 0.5)',
        'K': 'rgba(244, 208, 63, 0.5)',
        'Y': 'rgba(46, 204, 113, 0.5)',
        'U': 'rgba(0, 212, 255, 0.5)',
        'Q': 'rgba(155, 89, 182, 0.5)',
        'R': 'rgba(255, 107, 107, 0.5)',
        'Z': 'rgba(212, 163, 115, 0.5)',
        'O': 'rgba(122, 138, 154, 0.5)',
        'H': 'rgba(255, 102, 0, 0.6)',
        'N': 'rgba(74, 158, 255, 0.5)',
        'V': 'rgba(255, 107, 157, 0.5)',
        'L': 'rgba(255, 204, 0, 0.5)'
    };

    function getStarsHtml(rank) {
        const count = RANK_STARS[rank] || 1;
        let html = '<div class="card-stars">';
        for (let i = 0; i < count; i++) html += '<span class="star">★</span>';
        html += '</div>';
        return html;
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result 
            ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
            : '255, 204, 102';
    }

    function addQuestProgress(key, amount) {
        // Заглушка
    }

    function getTotalMultiplier() {
        const day = new Date().getDay();
        if (day === 6 || day === 0) return 2;
        return 1;
    }

    function initAudioContext() {
        if (_audioCtx) return _audioCtx;
        try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return _audioCtx; }
        catch(e) { return null; }
    }

    function playClickSound() {
        if (!_soundEnabled) return;
        try {
            const ctx = initAudioContext();
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 800; osc.type = 'sine';
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.08);
        } catch(e) {}
    }

// ============================================================
// МЕНЮ
// ============================================================
(function() {
        const hamburger = document.getElementById('hamburgerBtn');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        function openSidebar() {
            sidebar.classList.add('open'); overlay.classList.add('show');
            hamburger.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        function closeSidebar() {
            sidebar.classList.remove('open'); overlay.classList.remove('show');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
        }
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (sidebar.classList.contains('open')) closeSidebar(); else openSidebar();
        });
        overlay.addEventListener('click', closeSidebar);
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() { if (window.innerWidth <= 768) closeSidebar(); });
        });
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && window.innerWidth <= 768) closeSidebar();
        });
        window.addEventListener('resize', function() { if (window.innerWidth > 768) closeSidebar(); });
    })();

// ============================================================
// ПРОВЕРКА СБРОСА ЛИМИТА
// ============================================================
function checkChatDailyReset() {
        const today = new Date().toDateString();
        
        // Если дата уже сегодня — ничего не делаем
        if (chatLastMessageDate === today) {
            return;
        }
        
        // Сброс только при смене дня
        chatMessagesToday = 0;
        chatLastMessageDate = today;
        saveChatData();
        console.log('🔄 Лимит чата сброшен на новый день');
    }

// ============================================================
// UI
// ============================================================
function updateUI() {
        // Верхняя панель (header-balance) — единственное место, где показываем валюту
        const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

        setText('oreDisplayHeader', Math.floor(_ore));
        setText('essenceDisplayHeader', Math.floor(_essence));
        setText('xpDisplayHeader', `${_xp}/${xpForLevel(_level)}`);
        setText('strikesDone', _strikesDone);
        setText('strikesLimit', _strikesLimit);

        const essenceChat = document.getElementById('essenceDisplayChat');
        if (essenceChat) essenceChat.textContent = Math.floor(_essence);
        const essenceTrade = document.getElementById('essenceDisplayTrade');
        if (essenceTrade) essenceTrade.textContent = Math.floor(_essence);
        const tradeCardsCount = document.getElementById('tradeCardsCount');
        if (tradeCardsCount) tradeCardsCount.textContent = _cardHistory.length;

        const fill = document.getElementById('strikesBarFill');
        if (fill) fill.style.width = Math.min((_strikesDone / _strikesLimit) * 100, 100) + '%';

        updatePickaxeVisual();

        const slider = document.getElementById('exchangeSlider');
        if (slider) {
            const maxS = Math.min(_ore, 10000);
            slider.max = maxS;
            if (slider.value > maxS) slider.value = maxS;
            document.getElementById('exchangeAmount').textContent = slider.value;
        }

        const historyContainer = document.getElementById('historyContainer');
        if (historyContainer) {
            if (!_cardHistory.length) historyContainer.innerHTML = '<span style="opacity:0.6;">— нет событий —</span>';
            else historyContainer.innerHTML = _cardHistory.slice(0, 20).map(item => `<div class="history-item">${item.text}</div>`).join('');
        }

        const badge = document.getElementById('collectionBadge');
        if (badge) badge.textContent = _cardHistory.length;

        updateBonusUI();
        updateProfileUI();
        updatePackButton();
        updateAdUI();
        updateEventUI();
        updateHourlyBtn();
        if (typeof AutoMine !== 'undefined') AutoMine.refresh();
    }

    function updatePickaxeVisual() {
        const pickaxe = document.getElementById('pickaxeBtn');
        pickaxe.className = 'pickaxe-btn';
        pickaxe.classList.add(`pickaxe-lvl${Math.min(_pickaxeLevel, 5)}`);
        document.getElementById('pickaxeLevelDisplay').textContent = `Ур.${_pickaxeLevel}`;
        const multiplier = getTotalMultiplier();
        const eventEl = document.getElementById('eventMultiplier');
        if (multiplier > 1) { eventEl.style.display = 'block'; eventEl.textContent = `×${multiplier.toFixed(1)}`; }
        else eventEl.style.display = 'none';
    }

    function updateBonusUI() {
        const today = new Date().toDateString();
        const block = document.getElementById('bonusBlock');
        if (_lastBonusDate && _lastBonusDate.toDateString() === today) block.classList.add('hidden');
        else block.classList.remove('hidden');
    }

    function updateSoundUI() {
        const checkbox = document.getElementById('soundToggle');
        if (checkbox) checkbox.checked = _soundEnabled;
    }

    function updateProfileUI() {
        document.getElementById('profileName').textContent = _playerName || 'Игрок';
        document.getElementById('headerUserName').textContent = _playerName || 'Игрок';
        document.getElementById('playerIdDisplay').textContent = `🆔 ${_playerId ? _playerId.slice(-12) : '...'}`;
        document.getElementById('profileJoinDate').textContent = _joinDate;
        document.getElementById('profileLevel').textContent = _level;
        document.getElementById('profileEssence').textContent = _essence;
        document.getElementById('profileCardsCount').textContent = _cardHistory.length;
        document.getElementById('profileOre').textContent = _ore;
        document.getElementById('expLevelLabel').textContent = _level;

        // Прогресс опыта
        const nextCost = xpForLevel(_level);
        const progress = Math.min(100, Math.max(0, (_xp / nextCost) * 100));
        document.getElementById('expPercent').textContent = Math.round(progress) + '%';
        document.getElementById('expBarFill').style.width = progress + '%';
        document.getElementById('expCurrentLabel').textContent = _xp;
        document.getElementById('expNextLabel').textContent = nextCost;

        let rank = 'Новичок';
        if (_level >= 100) rank = 'Легенда 🏆';
        else if (_level >= 75) rank = 'Король шахты 👑';
        else if (_level >= 50) rank = 'Барон руды 🎩';
        else if (_level >= 25) rank = 'Мастер рудника 💠';
        else if (_level >= 10) rank = 'Горняк 🔥';
        else if (_level >= 5) rank = 'Шахтёр ⛏️';
        document.getElementById('profileRankTag').textContent = '🏆 ' + rank;

        const avatar = document.getElementById('profileAvatar');
        const headerAvatar = document.getElementById('headerAvatar');
        let avatarEmoji = '🧙';
        if (rank.includes('Легенда')) avatarEmoji = '🏆';
        else if (rank.includes('Король')) avatarEmoji = '👑';
        else if (rank.includes('Барон')) avatarEmoji = '🎩';
        else if (rank.includes('Мастер')) avatarEmoji = '💠';
        else if (rank.includes('Горняк')) avatarEmoji = '🔥';
        else if (rank.includes('Шахтёр')) avatarEmoji = '⛏️';
        avatar.textContent = avatarEmoji;
        headerAvatar.textContent = avatarEmoji;

        updateAchievements();
    }

    function updateAchievements() {
        const grid = document.getElementById('achievementsGrid');
        if (!grid) return;
        const achievements = [
            { emoji: '🔨', unlocked: _totalStrikesEver >= 1, tooltip: 'Первый удар' },
            { emoji: '🎴', unlocked: _cardHistory.length >= 1, tooltip: 'Первая карта' },
            { emoji: '⭐', unlocked: _level >= 10, tooltip: 'Уровень 10' },
            { emoji: '👑', unlocked: _level >= 25, tooltip: 'Уровень 25' },
            { emoji: '🏆', unlocked: _level >= 50, tooltip: 'Уровень 50' },
            { emoji: '💠', unlocked: _cardHistory.length >= 50, tooltip: '50 карт' },
            { emoji: '🐉', unlocked: _cardHistory.length >= 100, tooltip: '100 карт' },
            { emoji: '🪙', unlocked: _essence >= 1000, tooltip: '1000 эссенции' }
        ];
        grid.innerHTML = achievements.map(a => `
            <div class="achievement-item ${a.unlocked ? '' : 'locked'}">
                <span>${a.emoji}</span>
                <span class="ach-tooltip">${a.tooltip}${a.unlocked ? ' ✅' : ' 🔒'}</span>
            </div>
        `).join('');
    }

	// ============================================================
	// ПРОВЕРКА ОБНОВЛЕНИЙ КАРТ (для онлайн-игроков)
	// ============================================================
	async function checkCardsUpdate() {
	    if (!supabaseClient || !_playerId) return;
	    
	    try {
	        // Запрашиваем только количество и cards_json
	        const { data, error } = await supabaseClient
	            .from('leaderboard')
	            .select('cards_json')
	            .eq('player_id', _playerId)
	            .single();
	        
	        if (error || !data) return;
	        if (!data.cards_json || !Array.isArray(data.cards_json)) return;
	        
	        const dbCount = data.cards_json.length;
	        const localCount = _cardHistory.length;
	        
	        // Если в БД больше — значит админ добавил карты
	        if (dbCount > localCount) {
	            console.log(`🔄 Админ добавил ${dbCount - localCount} карт — синхронизирую`);
	            
	            _cardHistory = data.cards_json.map(c => ({
	                cardId: c.cardId || c.id,
	                rank: c.rank,
	                text: c.text || `🎴 ${c.rank}`,
	                uniqueId: c.uniqueId || c.date || Date.now()
	            }));
	            
	            // Обновляем localStorage (без syncToSupabase — чтобы не затереть)
	            const saveData = JSON.parse(localStorage.getItem('arcana_save') || '{}');
	            saveData.cardHistory = _cardHistory;
	            localStorage.setItem('arcana_save', JSON.stringify(saveData));
	            
	            // Обновляем UI
	            renderCollection();
	            renderCatalog();
	            renderSets();
	            updateUI();
	            
	            // Уведомление игроку
	            const diff = dbCount - localCount;
	            showToast(`🎴 Восстановлено ${diff} карт(ы) администратором!`, '#44ff44');
	            
	            // Вибрация
	            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
	        }
	    } catch(e) {
	        // Тихо игнорируем — это фоновая проверка
	        console.debug('checkCardsUpdate:', e.message);
	    }
	}

	window.checkCardsUpdate = checkCardsUpdate;

// ============================================================
// ОБРАБОТЧИКИ
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
        initSupabase();
        loadGame();
        setTimeout(() => AutoMine.init(), 200);

        // ===== ЧАТ — ТОЛЬКО LOCALSTORAGE =====
        const savedChat = localStorage.getItem('arcana_chat_data');
        if (savedChat) {
            try {
                const data = JSON.parse(savedChat);
                const today = new Date().toDateString();
                
                if (data.chatLastMessageDate === today) {
                    // Тот же день — восстанавливаем
                    chatMessagesToday = data.chatMessagesToday || 0;
                    chatLastMessageDate = data.chatLastMessageDate;
                    console.log('📊 Восстановлен лимит чата:', chatMessagesToday, '/', CHAT_DAILY_LIMIT);
                } else {
                    // Новый день — сбрасываем
                    chatMessagesToday = 0;
                    chatLastMessageDate = today;
                    saveChatData();
                    console.log('🔄 Новый день — лимит чата сброшен');
                }
            } catch(e) {
                chatMessagesToday = 0;
                chatLastMessageDate = new Date().toDateString();
            }
        } else {
            chatMessagesToday = 0;
            chatLastMessageDate = new Date().toDateString();
            saveChatData();
        }
        
        updateChatStats();

        // Мини-игра — инициализация при первом входе
        if (document.getElementById('fgCanvas')) {
            setTimeout(fgInit, 100);
        }

        document.getElementById('openEventPackBtn').addEventListener('click', openEventPack);
        setInterval(() => {
            if (document.querySelector('#section-event.active')) updateEventUI();
        }, 60000);

		const pickaxeEl = document.getElementById('pickaxeBtn');
		if (pickaxeEl) {
		    let _pickaxeLastTouch = 0;
		    pickaxeEl.addEventListener('pointerdown', function(e) {
		        // Игнорируем события мыши, если только что был тач (защита от дублей)
		        if (e.pointerType === 'mouse') {
		            if (Date.now() - _pickaxeLastTouch < 500) return;
		            mineOre();
		        } else {
		            _pickaxeLastTouch = Date.now();
		            e.preventDefault();
		            mineOre();
		        }
		    }, { passive: false });
		}
        document.getElementById('bonusBtn').addEventListener('click', claimBonus);
        document.getElementById('toessenceBtn').addEventListener('click', exchangeOreToEssence);
        document.getElementById('exchangeSlider').addEventListener('input', function(e) {
            document.getElementById('exchangeAmount').textContent = e.target.value;
        });
        document.getElementById('upgradePickaxeBtn').addEventListener('click', showPickaxeModal);

        document.getElementById('pickaxeModalClose').addEventListener('click', () => document.getElementById('pickaxeModal').classList.remove('show'));
        document.getElementById('pickaxeModalCloseBtn').addEventListener('click', () => document.getElementById('pickaxeModal').classList.remove('show'));
        document.getElementById('pickaxeModalUpgradeBtn').addEventListener('click', performPickaxeUpgrade);
        document.getElementById('pickaxeModal').addEventListener('click', function(e) { if (e.target === this) this.classList.remove('show'); });

        document.getElementById('saveNameBtn').addEventListener('click', function() {
            const name = document.getElementById('playerNameInput').value.trim();
            if (name) {
                _playerName = name;
                document.getElementById('nameModal').classList.remove('show');
                saveGame(); updateProfileUI();
                showToast(`👤 Добро пожаловать, ${_playerName}!`, '#b388ff');
                if (supabaseClient) syncToSupabase();
            } else showToast('❌ Введите имя!', '#ff6b6b');
        });
        document.getElementById('playerNameInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') document.getElementById('saveNameBtn').click();
        });

        document.getElementById('openPackBtn').addEventListener('click', openPack);

        const poModal = document.getElementById('packOpeningModal');
        if (poModal) poModal.addEventListener('click', handlePackModalClick);

        document.getElementById('poSkipBtn')?.addEventListener('click', (e) => {
            e.stopPropagation();
            skipPackAnimation();
        });

        document.getElementById('hourlyBonusBtn')?.addEventListener('click', claimHourlyBonus);
        setInterval(updateHourlyBtn, 1000);

        document.getElementById('openAdBtn').addEventListener('click', openAdModal);
        document.getElementById('adCloseBtn').addEventListener('click', closeAd);
        document.getElementById('adRewardBtn').addEventListener('click', claimAdReward);
        document.getElementById('adModal').addEventListener('click', function(e) {
            if (e.target === this && adRewardClaimed) closeAd();
            else if (e.target === this && adIsWatched && !adRewardClaimed) showToast('🎁 Заберите награду!', '#ffaa88');
            else if (e.target === this && !adIsWatched && adIsActive) showToast('⏳ Досмотрите!', '#ffaa88');
        });

        document.getElementById('profileLinkModalClose').addEventListener('click', () => document.getElementById('profileLinkModal').classList.remove('show'));
        document.getElementById('profileLinkCancelBtn').addEventListener('click', () => document.getElementById('profileLinkModal').classList.remove('show'));
        document.getElementById('saveProfileLinkBtn').addEventListener('click', function() {
            const input = document.getElementById('profileLinkInput');
            const val = input.value.trim();
            if (!val) { showToast('❌ Введите ID!', '#ff6b6b'); return; }
            let profileId = val;
            const match = val.match(/mangabuff\.ru\/users\/(\d+)/);
            if (match) profileId = match[1];
            if (!/^\d+$/.test(profileId)) { showToast('❌ Только цифры!', '#ff6b6b'); return; }
            saveMbProfileLink(profileId);
        });
        document.getElementById('profileLinkModal').addEventListener('click', function(e) { if (e.target === this) this.classList.remove('show'); });

        document.getElementById('playerProfileClose').addEventListener('click', () => document.getElementById('playerProfileModal').classList.remove('show'));
        document.getElementById('playerProfileCloseBtn').addEventListener('click', () => document.getElementById('playerProfileModal').classList.remove('show'));
        document.getElementById('playerProfileModal').addEventListener('click', function(e) { if (e.target === this) this.classList.remove('show'); });

        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() { switchSection(this.dataset.section); });
        });

        document.querySelectorAll('#collectionFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('#collectionFilters .filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                collectionFilter = this.dataset.filter;
                renderCollection();
            });
        });
        document.querySelectorAll('#catalogFilters .filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('#catalogFilters .filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                catalogFilter = this.dataset.filter;
                renderCatalog();
            });
        });
        document.getElementById('searchInput').addEventListener('input', function() {
            searchQuery = this.value;
            renderCollection();
        });

        document.getElementById('exportDataBtn').addEventListener('click', exportData);
        document.getElementById('importDataBtn').addEventListener('click', function() {
            const area = document.getElementById('importArea');
            area.style.display = area.style.display === 'block' ? 'none' : 'block';
            if (area.style.display === 'block') document.getElementById('importDataInput').focus();
        });
        document.getElementById('confirmImportBtn').addEventListener('click', function() {
            const data = document.getElementById('importDataInput').value.trim();
            if (!data) { showToast('❌ Вставьте данные!', '#ff6b6b'); return; }
            if (confirm('⚠️ Восстановление ЗАМЕНИТ данные!\n\nПродолжить?')) importData(data);
        });
        document.getElementById('deleteDataBtn').addEventListener('click', deleteAllData);
        document.getElementById('soundToggle').addEventListener('change', function() {
            _soundEnabled = this.checked;
            saveGame();
            if (_soundEnabled) playClickSound();
        });

        document.getElementById('loadReceiverCardsBtn')?.addEventListener('click', loadReceiverCards);
        document.getElementById('createTradeBtn')?.addEventListener('click', createTradeOffer);
        document.getElementById('clearTradeSelectionBtn')?.addEventListener('click', clearTradeSelection);
        document.getElementById('clearTradeHistoryBtn')?.addEventListener('click', async () => {
            if (confirm('Очистить историю?')) {
                await supabaseClient.from('trade_offers').delete()
                    .or(`sender_id.eq.${_playerId},receiver_id.eq.${_playerId}`)
                    .in('status', ['accepted', 'rejected', 'cancelled', 'expired']);
                showToast('✅ Очищено', '#44ff44');
                loadTrades();
            }
        });

        document.getElementById('chatSendBtnSection').addEventListener('click', sendChatMessageSection);
        document.getElementById('chatInputSection').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessageSection(); }
        });

        setInterval(() => { checkDailyReset(); updateUI(); loadTopFromSupabase(); }, 60000);
		// 🔄 Проверка обновлений карт из БД каждые 30 секунд
		setInterval(() => {
		    if (supabaseClient && _playerId && _playerName) {
		        checkCardsUpdate();
		    }
		}, 30000);
        setInterval(updateChatOnlineCount, 30000);
        /*setInterval(loadTrades, 30000);*/

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                loadGame();
                // ✅ Проверяем смену дня при возврате на вкладку
                const today = questToday();
                if (_lastKnownQuestDate && _lastKnownQuestDate !== today) {
                    _lastKnownQuestDate = today;
                    loadDailyQuests();
                }
                if (document.querySelector('#section-shop.active')) {
                    refreshGemsBalance();
                }
            }
        });

        document.querySelectorAll('[data-news-filter]').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('[data-news-filter]').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                newsFilter = this.dataset.newsFilter;
                loadGameNews();
            });
        });

        // ===== ОБРАБОТЧИК КНОПКИ ОПЛАТЫ =====
        const buyBtn = document.getElementById('shopBuyConfirmBtn');
        if (buyBtn) {
            buyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                confirmShopBuy();
            });
            console.log('✅ Кнопка оплаты привязана');
        } else {
            console.warn('⚠️ Кнопка shopBuyConfirmBtn не найдена в DOM');
        }

        setTimeout(refreshGemsBalance, 5000);
    });

	window.fgInit = fgInit;
	window.fgLoadStats = fgLoadStats;
	window.fgSaveStats = fgSaveStats;
	window.fgUpdateSideStats = fgUpdateSideStats;
	window.fgUpdateDailyUI = fgUpdateDailyUI;
	window.fgStart = fgStart;
	window.fgGameOver = fgGameOver;
	window.fgRender = fgRender;
	window.fgRenderIdle = fgRenderIdle;
	window.fgLoop = fgLoop;
	window.fgCanCollect = fgCanCollect;
	window.fgSpawnStar = fgSpawnStar;
	window.fgSpawnMeteor = fgSpawnMeteor;
	window.fgSpawnBurst = fgSpawnBurst;

    console.log('⚡ Arcana Nexus — XP Edition загружен!');