// ============================================================
// КОПИРОВАНИЕ ID ИЗ ТОПа
// ============================================================
async function copyPlayerIdFromTop(playerId, playerName, evt) {
        if (!playerId) {
            showToast('❌ ID не найден', '#ff6b6b');
            return;
        }

        try {
            // Пробуем современный API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(playerId);
            } else {
                // Fallback для старых браузеров
                const input = document.createElement('input');
                input.value = playerId;
                input.style.position = 'fixed';
                input.style.opacity = '0';
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                input.remove();
            }

            // Показываем красивый тост
            showToast(`📋 ID ${playerName ? `«${playerName}»` : ''} скопирован!`, '#44ff44');

            // Вибрация
            if (navigator.vibrate) navigator.vibrate(30);

            // ===== Анимация на кнопке (безопасно) =====
            // Берём event из параметра или из window.event (для onclick)
            const e = evt || window.event;
            if (e && e.target) {
                const btn = e.target.closest ? e.target.closest('.top-copy-id-btn') : null;
                if (btn) {
                    btn.classList.add('copied');
                    setTimeout(() => btn.classList.remove('copied'), 1000);
                }
            }

        } catch(e) {
            console.warn('copyPlayerIdFromTop error:', e);
            showToast('❌ Не удалось скопировать', '#ff6b6b');
        }
    }

    window.copyPlayerIdFromTop = copyPlayerIdFromTop;

// ============================================================
// КАЛЕНДАРЬ
// ============================================================
function getDailyReward(day) {
        const rewards = {
            1: { type: 'ore', amount: 50, text: '50 ⛏️' },
            2: { type: 'essence', amount: 2, text: '2 💠' },
            3: { type: 'ore', amount: 100, text: '100 ⛏️' },
            4: { type: 'essence', amount: 3, text: '3 💠' },
            5: { type: 'ore', amount: 150, text: '150 ⛏️' },
            6: { type: 'essence', amount: 5, text: '5 💠' },
            7: { type: 'event_currency', amount: 3, text: '3 🍂' },
            8: { type: 'ore', amount: 200, text: '200 ⛏️' },
            9: { type: 'essence', amount: 5, text: '5 💠' },
            10: { type: 'ore', amount: 250, text: '250 ⛏️' },
            11: { type: 'essence', amount: 7, text: '7 💠' },
            12: { type: 'ore', amount: 300, text: '300 ⛏️' },
            13: { type: 'essence', amount: 10, text: '10 💠' },
            14: { type: 'event_currency', amount: 5, text: '5 🍂' },
            15: { type: 'ore', amount: 400, text: '400 ⛏️' },
            16: { type: 'essence', amount: 12, text: '12 💠' },
            17: { type: 'ore', amount: 500, text: '500 ⛏️' },
            18: { type: 'essence', amount: 15, text: '15 💠' },
            19: { type: 'ore', amount: 600, text: '600 ⛏️' },
            20: { type: 'essence', amount: 20, text: '20 💠' },
            21: { type: 'event_currency', amount: 8, text: '8 🍂' },
            22: { type: 'ore', amount: 800, text: '800 ⛏️' },
            23: { type: 'essence', amount: 25, text: '25 💠' },
            24: { type: 'ore', amount: 1000, text: '1000 ⛏️' },
            25: { type: 'essence', amount: 30, text: '30 💠' },
            26: { type: 'ore', amount: 1200, text: '1200 ⛏️' },
            27: { type: 'essence', amount: 40, text: '40 💠' },
            28: { type: 'event_currency', amount: 12, text: '12 🍂' },
            29: { type: 'ore', amount: 1500, text: '1500 ⛏️' },
            30: { type: 'event_currency', amount: 20, text: '20 🍂' }
        };
        return rewards[day] || { type: 'ore', amount: 50, text: '50 ⛏️' };
    }

    function checkDailyLogin() {
        const today = new Date().toDateString();
        if (!_lastLoginDate) { _lastLoginDate = today; _dailyStreak = 1; saveGame(); updateCalendarUI(); return; }
        const lastDate = new Date(_lastLoginDate);
        const currentDate = new Date(today);
        const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) { _dailyStreak = Math.min(_dailyStreak + 1, 30); _lastLoginDate = today; saveGame(); }
        else if (diffDays > 1) { _dailyStreak = 1; _lastLoginDate = today; saveGame(); showToast("⚠️ Стрик сброшен!", "#ffaa88"); }
        updateCalendarUI();
    }

    function claimDailyReward() {
        const today = new Date().toDateString();
        if (_calendarClaimed[today]) { showToast("❌ Уже получено сегодня!", "#ffaa88"); return; }
        checkDailyLogin();
        const reward = getDailyReward(_dailyStreak);
        const event = getCurrentEvent();
        const emoji = event ? event.emoji : '🍂';
        if (reward.type === 'ore') { _ore += reward.amount; showToast(`⛏️ +${reward.text}!`, "#ffdd99"); }
        else if (reward.type === 'essence') { _essence += reward.amount; showToast(`💠 +${reward.text}!`, "#aaffdd"); }
        else if (reward.type === 'event_currency') { _eventCurrency += reward.amount; showToast(`${emoji} +${reward.text}!`, "#ffd966"); }
        addXP(XP_CALENDAR);
        showToast(`✨ +${XP_CALENDAR} XP за календарь!`, '#ffcc66');
        _calendarClaimed[today] = true;
        saveGame(); updateUI(); updateCalendarUI(); updateEventUI();
    }

    function updateCalendarUI() {
        const grid = document.getElementById('calendarGrid');
        const streakSpan = document.getElementById('calendarStreak');
        const bonusSpan = document.getElementById('calendarBonus');
        if (!grid) return;
        const today = new Date().toDateString();
        const isClaimed = _calendarClaimed[today];
        if (streakSpan) streakSpan.textContent = `🔥 День ${_dailyStreak}`;
        let html = '';
        for (let i = 0; i < 7; i++) {
            const dayNum = _dailyStreak + i;
            if (dayNum > 30) break;
            const reward = getDailyReward(dayNum);
            const isToday = (i === 0);
            const isClaimedDay = (i === 0 && isClaimed);
            const event = getCurrentEvent();
            const emoji = reward.type === 'ore' ? '⛏️' : reward.type === 'essence' ? '💠' : (event ? event.emoji : '🎁');
            html += `
                <div style="background:${isToday ? 'linear-gradient(135deg,#3a6b58,#1e3e31)' : 'rgba(0,0,0,0.2)'};border-radius:12px;padding:6px 2px;border:${isToday ? '2px solid #ffcc66' : '1px solid rgba(255,255,255,0.04)'};opacity:${isClaimedDay ? '0.5' : '1'};cursor:${isToday && !isClaimed ? 'pointer' : 'default'};text-align:center;" onclick="${isToday && !isClaimed ? 'claimDailyReward()' : ''}">
                    <div style="font-size:9px;opacity:0.5;">${dayNum}</div>
                    <div style="font-size:18px;margin:2px 0;">${emoji}</div>
                    <div style="font-size:8px;opacity:0.7;">${reward.text}</div>
                    <div style="font-size:8px;color:#ffcc66;">+${XP_CALENDAR}XP</div>
                    ${isClaimedDay ? '<div style="font-size:10px;color:#44ff44;">✅</div>' : ''}
                </div>
            `;
        }
        grid.innerHTML = html;
        if (bonusSpan) {
            if (_dailyStreak >= 7) bonusSpan.textContent = `🔥 Бонус за стрик ${_dailyStreak} дней: +${Math.floor(_dailyStreak / 7) * 5}% к добыче!`;
            else bonusSpan.textContent = `⭐ Ещё ${7 - _dailyStreak} дней до первого бонуса!`;
        }
    }

// ============================================================
// ИВЕНТ
// ============================================================
function getCurrentEvent() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const year = now.getFullYear();
        if (month === 10 && day >= 25) return { id: 'halloween', emoji: '🎃', name: `Хэллоуин ${year}`, rank: 'H', color: '#ff6600', year, end: new Date(year, 9, 31, 23, 59, 59) };
        if (month === 12 || month === 1 || month === 2) {
            let eventYear = month === 12 ? year : year - 1;
            let endMonth = 2, endDay = 28;
            if (month === 12) { endMonth = 1; endDay = 31; }
            return { id: 'winter', emoji: '❄️', name: `Зима ${eventYear}`, rank: 'N', color: '#4a9eff', year: eventYear, end: new Date(year + (month === 12 ? 1 : 0), endMonth, endDay, 23, 59, 59) };
        }
        if (month >= 3 && month <= 5) return { id: 'spring', emoji: '🌸', name: `Весна ${year}`, rank: 'V', color: '#ff6b9d', year, end: new Date(year, 4, 31, 23, 59, 59) };
        if (month >= 6 && month <= 8) return { id: 'summer', emoji: '☀️', name: `Лето ${year}`, rank: 'L', color: '#ffcc00', year, end: new Date(year, 7, 31, 23, 59, 59) };
        return null;
    }

    function getNextEvent() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const year = now.getFullYear();
        if (month < 10 || (month === 10 && day < 25)) return { id: 'halloween', emoji: '🎃', name: `Хэллоуин ${year}`, rank: 'H', color: '#ff6600', start: new Date(year, 9, 25, 0, 0, 0), year };
        if (month < 12 || (month === 12 && day < 1)) return { id: 'winter', emoji: '❄️', name: `Зима ${year}`, rank: 'N', color: '#4a9eff', start: new Date(year, 11, 1, 0, 0, 0), year };
        if (month < 3 || (month === 3 && day < 1)) return { id: 'spring', emoji: '🌸', name: `Весна ${year}`, rank: 'V', color: '#ff6b9d', start: new Date(year, 2, 1, 0, 0, 0), year };
        if (month < 6 || (month === 6 && day < 1)) return { id: 'summer', emoji: '☀️', name: `Лето ${year}`, rank: 'L', color: '#ffcc00', start: new Date(year, 5, 1, 0, 0, 0), year };
        return { id: 'halloween', emoji: '🎃', name: `Хэллоуин ${year + 1}`, rank: 'H', color: '#ff6600', start: new Date(year + 1, 9, 25, 0, 0, 0), year: year + 1 };
    }

    function openEventPack() {
        const event = getCurrentEvent();
        if (!event) { showToast('❌ Нет активного ивента!', '#ff6b6b'); return; }
        if (_eventCurrency < _eventPackPrice) { showToast(`❌ Нужно ${_eventPackPrice} ${event.emoji}!`, '#ff6b6b'); return; }
        if (pendingPack && pendingPack.cards && pendingPack.cards.length > 0 && pendingPack.selected === null) {
            showToast('❌ Сначала выбери карту!', '#ff6b6b'); return;
        }
        _eventCurrency -= _eventPackPrice;
        const eventCards = ALL_CARDS.filter(c => c.event === event.id && c.year === event.year);
        if (eventCards.length === 0) { showToast('❌ Нет ивентовых карт!', '#ff6b6b'); _eventCurrency += _eventPackPrice; return; }
        const cards = [];
        const usedIds = new Set();
        let attempts = 0;
        while (cards.length < 3 && attempts < 50) {
            attempts++;
            const rc = eventCards[Math.floor(Math.random() * eventCards.length)];
            if (!usedIds.has(rc.id)) { usedIds.add(rc.id); cards.push({ ...rc }); }
        }
        pendingPack = { cards, selected: null };
        savePendingPack();
        startPackOpeningAnimation(cards);
        updateUI(); updateEventUI(); updatePackButton(); saveGame();
    }

    function updateEventUI() {
        const event = getCurrentEvent();
        const el = (id) => document.getElementById(id);
        const sectionTitle = el('eventSectionTitle');
        const sectionIcon = el('eventSectionIcon');
        const sectionName = el('eventSectionName');
        const sectionRank = el('eventSectionRank');
        const sectionDesc = el('eventSectionDesc');
        const sectionTimer = el('eventSectionTimer');
        const eventBadge = el('eventBadge');
        const packIcon = el('eventPackIcon');
        const packName = el('eventPackName');
        const packRank = el('eventPackRank');
        const packPrice = el('eventPackPrice');
        const packCurrency = el('eventPackCurrencyDisplay');
        const openBtn = el('openEventPackBtn');
        const currencyValue = el('eventCurrencyValue');
        const currencyStat = el('eventCurrencyStat');
        const packCard = el('eventPackCard');
        const eventCardsOwned = el('eventCardsOwned');
        const eventTotalCards = el('eventTotalCards');
        const eventCardsCount = el('eventCardsCount');

        if (!event) {
            if (sectionTitle) sectionTitle.textContent = '⏳ Ожидание ивента';
            if (sectionIcon) sectionIcon.textContent = '📅';
            if (sectionName) sectionName.textContent = 'Нет активного ивента';
            if (sectionDesc) sectionDesc.textContent = 'Следующий ивент скоро начнётся!';
            if (packCard) packCard.style.display = 'none';
            if (eventBadge) { eventBadge.textContent = '📅'; eventBadge.style.background = '#6b7084'; }
            if (sectionTimer) {
                const nextEvent = getNextEvent();
                if (nextEvent && nextEvent.start) {
                    const diff = nextEvent.start - new Date();
                    if (diff > 0) {
                        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        sectionTimer.textContent = `⏳ До ${nextEvent.emoji} ${nextEvent.name}: ${days}д ${hours}ч`;
                    }
                }
            }
            if (eventCardsOwned) eventCardsOwned.textContent = '0/0 собрано';
            if (eventTotalCards) eventTotalCards.textContent = '0';
            if (eventCardsCount) eventCardsCount.textContent = '0';
            if (currencyValue) currencyValue.textContent = _eventCurrency;
            if (currencyStat) currencyStat.textContent = _eventCurrency;
            renderEventCards();
            return;
        }
        if (sectionTitle) sectionTitle.textContent = `${event.emoji} ${event.name}`;
        if (sectionIcon) sectionIcon.textContent = event.emoji;
        if (sectionName) sectionName.textContent = event.name;
        if (sectionRank) { sectionRank.textContent = event.rank; sectionRank.style.color = event.color; }
        if (sectionDesc) sectionDesc.innerHTML = `Ивентовые карты ранга <strong style="color:${event.color};">${event.rank}</strong>`;
        if (sectionTimer && event.end) {
            const diff = event.end - new Date();
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                sectionTimer.textContent = `⏳ До конца ивента: ${days}д ${hours}ч ${minutes}м`;
                sectionTimer.style.color = event.color;
            } else { sectionTimer.textContent = '⏳ Ивент завершён!'; sectionTimer.style.color = '#6b7084'; }
        }
        if (eventBadge) { eventBadge.textContent = event.emoji; eventBadge.style.background = event.color; }
        if (packCard) packCard.style.display = 'block';
        if (packIcon) packIcon.textContent = event.emoji;
        if (packName) packName.textContent = `${event.emoji} ${event.name} пак`;
        if (packRank) { packRank.textContent = event.rank; packRank.style.color = event.color; }
        if (packPrice) packPrice.textContent = `${_eventPackPrice} ${event.emoji}`;
        if (packCurrency) packCurrency.textContent = `У вас: ${_eventCurrency} ${event.emoji}`;
        if (openBtn) {
            const colors = {
                'halloween': 'linear-gradient(135deg,#ff6600,#cc3300)',
                'winter': 'linear-gradient(135deg,#4a9eff,#1a6aaf)',
                'spring': 'linear-gradient(135deg,#ff6b9d,#cc4477)',
                'summer': 'linear-gradient(135deg,#ffcc00,#cc9900)'
            };
            openBtn.style.background = colors[event.id] || 'linear-gradient(135deg,#d4a373,#b5835a)';
            openBtn.textContent = `🎴 Открыть за ${_eventPackPrice} ${event.emoji}`;
        }
        if (currencyValue) currencyValue.textContent = _eventCurrency;
        if (currencyStat) currencyStat.textContent = _eventCurrency;
        renderEventCards();
    }

    function renderEventCards() {
        const grid = document.getElementById('eventCardsGrid');
        const event = getCurrentEvent();
        if (!event) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#6b7084;"><div style="font-size:48px;margin-bottom:8px;">📅</div><div style="font-size:17px;font-weight:700;">Нет активного ивента</div></div>`;
            return;
        }
        const eventCards = ALL_CARDS.filter(c => c.event === event.id && c.year === event.year);
        const collectionMap = getCollectionMap();
        let owned = 0;
        for (const card of eventCards) if (collectionMap.has(card.id)) owned++;
        const ownedEl = document.getElementById('eventCardsOwned');
        const totalEl = document.getElementById('eventTotalCards');
        const countEl = document.getElementById('eventCardsCount');
        if (ownedEl) ownedEl.textContent = `${owned}/${eventCards.length} собрано`;
        if (totalEl) eventTotalCards.textContent = eventCards.length;
        if (countEl) countEl.textContent = owned;
        if (eventCards.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#6b7084;"><div style="font-size:48px;margin-bottom:8px;">${event.emoji}</div><div style="font-size:17px;font-weight:700;">Нет карт в этом ивенте</div></div>`;
            return;
        }
        grid.innerHTML = eventCards.map(card => {
            const isOwned = collectionMap.has(card.id);
            const imgPath = getCardImage(card);
            return `
                <div class="card-item rank-${card.rank}" onclick="openCardModal('${card.id}')">
                    <div class="card-image">${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}</div>
                    <div class="card-rank">${card.rank}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-rarity">${isOwned ? '✅ В коллекции' : '❌ Не собрана'}</div>
                </div>
            `;
        }).join('');
    }

    window.copyPlayerIdFromTop = copyPlayerIdFromTop;
    window.getDailyReward = getDailyReward;
    window.checkDailyLogin = checkDailyLogin;
    window.claimDailyReward = claimDailyReward;
    window.updateCalendarUI = updateCalendarUI;
    window.getCurrentEvent = getCurrentEvent;
    window.getNextEvent = getNextEvent;
    window.openEventPack = openEventPack;
    window.updateEventUI = updateEventUI;
    window.renderEventCards = renderEventCards;