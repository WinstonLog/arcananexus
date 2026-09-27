// ============================================================
// ПОЛНОЭКРАННАЯ РЕКЛАМА (INTERSTITIAL) — VK Ads / Mail.ru
// ============================================================
const Interstitial = (() => {
    const CONFIG = {
        clientId: 'ad-2059283',
        slotId: '2059283',

        // ===== ЧАСТОТА ПОКАЗОВ =====
        // Повторный показ не чаще 1 раза в час (было 5 минут)
        repeatIntervalMs: 60 * 60 * 1000,   // 1 час

        // Максимум показов за сессию (за одну вкладку/игру)
        maxPerSession: 2,

        // Минимум между показами (защита от дублей)
        minCooldownMs: 10 * 60 * 1000,      // 10 минут

        // Не показывать при старте игры — только по таймеру
        showOnInit: true,

        // Задержка перед первым показом (только если showOnInit: true)
        initialDelayMs: 800,

        // Не показывать, если вкладка скрыта
        requireVisible: true,

        // Сколько времени "сессия" считается активной (после — счётчик сбрасывается)
        sessionGapMs: 30 * 60 * 1000,       // 30 минут без активности = новая сессия

        storageKey: 'arcana_interstitial_last',
        sessionStorageKey: 'arcana_interstitial_session'
    };

    let _overlay = null;
    let _repeatTimer = null;
    let _closeTimer = null;
    let _lastShownAt = 0;
    let _sdkReady = false;
    let _sdkLoading = false;

    // ===== Сессионный счётчик =====
    let _sessionShows = 0;
    let _sessionStartedAt = 0;

    // ===== Загрузка/сохранение сессионного состояния =====
    function loadSession() {
        try {
            const raw = sessionStorage.getItem(CONFIG.sessionStorageKey);
            if (!raw) {
                _sessionShows = 0;
                _sessionStartedAt = Date.now();
                saveSession();
                return;
            }
            const data = JSON.parse(raw);
            const now = Date.now();

            // Если прошло больше sessionGapMs с последнего действия — новая сессия
            if (now - (data.lastActive || 0) > CONFIG.sessionGapMs) {
                _sessionShows = 0;
                _sessionStartedAt = now;
            } else {
                _sessionShows = data.shows || 0;
                _sessionStartedAt = data.startedAt || now;
            }
            saveSession();
        } catch(e) {
            _sessionShows = 0;
            _sessionStartedAt = Date.now();
        }
    }

    function saveSession() {
        try {
            sessionStorage.setItem(CONFIG.sessionStorageKey, JSON.stringify({
                shows: _sessionShows,
                startedAt: _sessionStartedAt,
                lastActive: Date.now()
            }));
        } catch(e) {}
    }

    function updateSessionActivity() {
        try {
            const raw = sessionStorage.getItem(CONFIG.sessionStorageKey);
            const data = raw ? JSON.parse(raw) : {};
            data.lastActive = Date.now();
            sessionStorage.setItem(CONFIG.sessionStorageKey, JSON.stringify(data));
        } catch(e) {}
    }

    // ===== Загрузка SDK =====
    function loadSDK() {
        if (_sdkReady || _sdkLoading) return;
        if (window.MRGtag) { _sdkReady = true; return; }

        _sdkLoading = true;
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://ad.mail.ru/static/ads-async.js';
        script.onload = () => {
            _sdkReady = true;
            _sdkLoading = false;
            window.MRGtag = window.MRGtag || [];
            console.log('✅ VK Ads SDK загружен');
        };
        script.onerror = () => {
            _sdkLoading = false;
            console.warn('⚠️ VK Ads SDK не загрузился');
        };
        document.head.appendChild(script);
    }

    // ===== Создание оверлея =====
    function createOverlay() {
        if (_overlay) return _overlay;

        const el = document.createElement('div');
        el.id = 'interstitialOverlay';
        el.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: rgba(5, 5, 15, 0.96);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
            padding: 20px;
            box-sizing: border-box;
            overflow: hidden;
        `;

        el.innerHTML = `
            <div style="position:absolute;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.05);">
                <div id="interstitialProgress" style="height:100%;width:0%;background:linear-gradient(90deg,#b388ff,#7c4dff);transition:width 0.1s linear;"></div>
            </div>

            <div style="text-align:center;margin-bottom:18px;">
                <div style="font-size:13px;letter-spacing:2px;color:#6b7084;text-transform:uppercase;font-weight:700;">
                    ⭐ Реклама
                </div>
                <div style="font-size:11px;color:#4a4a5a;margin-top:4px;">
                    Поддерживает игру — спасибо!
                </div>
            </div>

            <div style="
                width: 100%;
                max-width: 400px;
                min-height: 260px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.4);
                border-radius: 20px;
                border: 1px solid rgba(255,255,255,0.06);
                overflow: hidden;
                position: relative;
            ">
                <div id="interstitialSlotContainer" style="width:100%;display:flex;justify-content:center;align-items:center;"></div>
            </div>

            <div style="margin-top:18px;display:flex;flex-direction:column;align-items:center;gap:10px;">
                <div id="interstitialTimer" style="font-size:12px;color:#6b7084;font-weight:600;">
                    ⏳ Можно закрыть через <span id="interstitialTimerValue">5</span> с
                </div>
                <button id="interstitialCloseBtn" disabled style="
                    padding: 12px 32px;
                    border-radius: 30px;
                    border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.04);
                    color: #6b7084;
                    font-weight: 800;
                    font-size: 14px;
                    cursor: not-allowed;
                    transition: 0.25s;
                    font-family: inherit;
                    letter-spacing: 0.5px;
                ">✕ Закрыть</button>
            </div>
        `;

        document.body.appendChild(el);
        _overlay = el;

        el.querySelector('#interstitialCloseBtn').addEventListener('click', close);

        return el;
    }

    // ===== Вставка рекламного блока (точно как в кабинете) =====
    function injectAd() {
        const container = document.getElementById('interstitialSlotContainer');
        if (!container) return;

        container.innerHTML = '';

        const ins = document.createElement('ins');
        ins.className = 'mrg-tag';
        ins.setAttribute('data-ad-client', CONFIG.clientId);
        ins.setAttribute('data-ad-slot', CONFIG.slotId);

        container.appendChild(ins);

        try {
            window.MRGtag = window.MRGtag || [];
            window.MRGtag.push({});
        } catch(e) {
            console.warn('MRGtag push error:', e);
        }
    }

    // ===== Показ =====
    function show(force = false) {
        const now = Date.now();

        // 1. Минимальный кулдаун между показами
        if (!force && (now - _lastShownAt) < CONFIG.minCooldownMs) {
            return false;
        }

        // 2. Лимит показов на сессию
        if (!force && _sessionShows >= CONFIG.maxPerSession) {
            console.log('ℹ️ Interstitial: лимит показов на сессию исчерпан');
            return false;
        }

        // 3. Не показываем, если вкладка скрыта
        if (CONFIG.requireVisible && document.hidden) {
            return false;
        }

        loadSDK();

        const el = createOverlay();
        _lastShownAt = now;
        _sessionShows++;
        localStorage.setItem(CONFIG.storageKey, String(now));
        saveSession();
        updateSessionActivity();

        injectAd();

        // Блокируем скролл фона
        document.body.style.overflow = 'hidden';

        // Показываем
        requestAnimationFrame(() => {
            el.style.pointerEvents = 'auto';
            el.style.opacity = '1';
        });

        // Таймер 5 секунд
        let secondsLeft = 5;
        const timerValue = el.querySelector('#interstitialTimerValue');
        const progress = el.querySelector('#interstitialProgress');
        const closeBtn = el.querySelector('#interstitialCloseBtn');

        if (timerValue) timerValue.textContent = secondsLeft;
        if (progress) progress.style.width = '0%';

        if (_closeTimer) clearInterval(_closeTimer);
        _closeTimer = setInterval(() => {
            secondsLeft--;
            const total = 5;
            const pct = ((total - Math.max(secondsLeft, 0)) / total) * 100;

            if (timerValue) timerValue.textContent = Math.max(secondsLeft, 0);
            if (progress) progress.style.width = pct + '%';

            if (secondsLeft <= 0) {
                clearInterval(_closeTimer);
                _closeTimer = null;

                if (timerValue) timerValue.parentElement.innerHTML = '✅ Можно закрыть';
                if (closeBtn) {
                    closeBtn.disabled = false;
                    closeBtn.style.background = 'linear-gradient(135deg, #b388ff, #7c4dff)';
                    closeBtn.style.color = '#fff';
                    closeBtn.style.cursor = 'pointer';
                    closeBtn.style.border = 'none';
                    closeBtn.style.boxShadow = '0 8px 24px rgba(123,77,255,0.3)';
                }
            }
        }, 1000);

        return true;
    }

    // ===== Закрытие =====
    function close() {
        if (!_overlay) return;

        if (_closeTimer) { clearInterval(_closeTimer); _closeTimer = null; }

        _overlay.style.opacity = '0';
        _overlay.style.pointerEvents = 'none';

        document.body.style.overflow = '';

        setTimeout(() => {
            const container = document.getElementById('interstitialSlotContainer');
            if (container) container.innerHTML = '';
        }, 450);

        scheduleNext();
    }

    // ===== Планирование следующего показа =====
    function scheduleNext() {
        if (_repeatTimer) clearTimeout(_repeatTimer);

        // Если лимит на сессию уже исчерпан — не планируем
        if (_sessionShows >= CONFIG.maxPerSession) {
            console.log('ℹ️ Interstitial: показы на эту сессию закончились');
            return;
        }

        _repeatTimer = setTimeout(() => {
            if (!document.hidden) {
                show();
            } else {
                scheduleNext();
            }
        }, CONFIG.repeatIntervalMs);
    }

    // ===== Инициализация =====
    function init() {
        loadSession();

        // Первый показ при старте (только если showOnInit: true)
        if (CONFIG.showOnInit) {
            setTimeout(() => {
                const shown = show(true);
                if (!shown) {
                    scheduleNext();
                }
            }, CONFIG.initialDelayMs);
        } else {
            // Не показываем сразу — планируем первый показ через час
            scheduleNext();
        }

        // Пауза таймера, когда вкладка скрыта
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (_repeatTimer) { clearTimeout(_repeatTimer); _repeatTimer = null; }
            } else {
                updateSessionActivity();

                // Лимит на сессию исчерпан — ничего не показываем
                if (_sessionShows >= CONFIG.maxPerSession) {
                    return;
                }

                const last = parseInt(localStorage.getItem(CONFIG.storageKey) || '0', 10);
                if (Date.now() - last >= CONFIG.repeatIntervalMs) {
                    show();
                } else {
                    scheduleNext();
                }
            }
        });

        // Клики/тапы = активность сессии (чтобы sessionGapMs считался корректно)
        document.addEventListener('click', updateSessionActivity, { passive: true });
        document.addEventListener('touchstart', updateSessionActivity, { passive: true });
        document.addEventListener('keydown', updateSessionActivity, { passive: true });

        // Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && _overlay && _overlay.style.opacity === '1') {
                const closeBtn = document.getElementById('interstitialCloseBtn');
                if (closeBtn && !closeBtn.disabled) close();
            }
        });
    }

    return {
        init,
        show,
        close,
        get lastShownAt() { return _lastShownAt; },
        get sessionShows() { return _sessionShows; }
    };
})();

window.Interstitial = Interstitial;