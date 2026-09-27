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
    }

// ============================================================
// СОХРАНЕНИЕ
// ============================================================
function loadGame() {
        const saved = localStorage.getItem('arcana_save');
        if (saved) {
            try {
                const d = JSON.parse(saved);
                _ore = d.ore || 0;
                _essence = d.essence || 0;
                _level = d.level || 1;
                _xp = d.xp || 0;                  // ← НОВОЕ
                _strikesDone = d.strikesDone || 0;
                _strikesLimit = d.strikesLimit || 100;
                _pickaxeLevel = d.pickaxeLevel || 1;
                _lastBonusDate = d.lastBonusDate ? new Date(d.lastBonusDate) : null;
                _cardHistory = d.cardHistory || [];
                _totalStrikesEver = d.totalStrikesEver || 0;
                _playerId = d.playerId || generatePlayerId();
                _playerName = d.playerName || '';
                _joinDate = d.joinDate || new Date().toLocaleDateString();
                _soundEnabled = d.soundEnabled !== undefined ? d.soundEnabled : true;
                _mbProfileLink = d.mbProfileLink || null;
                adWatchedToday = d.adWatchedToday || 0;
                adLastWatchDate = d.adLastWatchDate || null;
                _eventCurrency = d.eventCurrency || 0;
                _dailyStreak = d.dailyStreak || 1;
                _lastLoginDate = d.lastLoginDate || null;
                _calendarClaimed = d.calendarClaimed || {};
                _compensationClaimed = d.compensationClaimed || false;  
                _shockwaveBought = d.shockwaveBought || false;
                _lastHourlyClaim = d.lastHourlyClaim || 0;
                _hourlyStreak = d.hourlyStreak || 0;

                let migrated = 0;
                _cardHistory = _cardHistory.map(item => {
                    if (item.cardId) return item;
                    const cardByRank = ALL_CARDS.find(c => c.rank === item.rank);
                    if (cardByRank) migrated++;
                    return { cardId: cardByRank ? cardByRank.id : null, rank: item.rank, text: item.text, uniqueId: item.id || Date.now() };
                }).filter(item => item.cardId !== null);
                if (migrated > 0) saveGame();
            } catch(e) {}
        } else { _playerId = generatePlayerId(); }

        const today = new Date().toDateString();
        if (adLastWatchDate !== today) { adWatchedToday = 0; adLastWatchDate = today; }
        checkDailyReset();

        const savedPack = localStorage.getItem('arcana_pending_pack');
        if (savedPack) {
            try {
                const p = JSON.parse(savedPack);
                if (p && p.cards && p.cards.length > 0 && p.selected === null) {
                    pendingPack = p;
                    setTimeout(() => {
                        if (pendingPack && pendingPack.cards && pendingPack.cards.length > 0) {
                            startPackOpeningAnimation(pendingPack.cards, true);
                        }
                    }, 800);
                } else {
                    localStorage.removeItem('arcana_pending_pack');
                    pendingPack = null;
                }
            } catch(e) { 
                localStorage.removeItem('arcana_pending_pack'); 
                pendingPack = null; 
            }
        }

        if (!_playerName) document.getElementById('nameModal').classList.add('show');

        updateUI(); renderCollection(); renderCatalog(); renderSets();
        updateProfileUI(); updatePackButton(); updateSoundUI(); updateAdUI();
        updateProfileLinkUI(); loadTopFromSupabase();
        updateCalendarUI(); updateEventUI(); 
        updateHourlyStreak(); updateHourlyBtn();

        // Компенсация за уровни (только если имя введено и есть что возвращать)
        if (_playerName) {
            setTimeout(checkCompensation, 1500);
        }

        if (supabaseClient && _playerId && _playerName) {
            syncCardOwners();
            syncToSupabase();
        }

        setTimeout(loadMarketData, 3000);
        setTimeout(loadDailyQuests, 3500);

        if (supabaseClient && _playerId && _playerName) syncToSupabase();
    }

    function saveGame() {
        const saveData = {
            ore: _ore, essence: _essence, level: _level, xp: _xp,
            strikesDone: _strikesDone, strikesLimit: _strikesLimit,
            pickaxeLevel: _pickaxeLevel,
            lastBonusDate: _lastBonusDate ? _lastBonusDate.toISOString() : null,
            cardHistory: _cardHistory, totalStrikesEver: _totalStrikesEver,
            playerId: _playerId, playerName: _playerName, joinDate: _joinDate,
            soundEnabled: _soundEnabled, mbProfileLink: _mbProfileLink,
            adWatchedToday, adLastWatchDate, eventCurrency: _eventCurrency,
            dailyStreak: _dailyStreak, lastLoginDate: _lastLoginDate, calendarClaimed: _calendarClaimed,
            compensationClaimed: _compensationClaimed, shockwaveBought: _shockwaveBought,
            lastHourlyClaim: _lastHourlyClaim, hourlyStreak: _hourlyStreak
        };
        localStorage.setItem('arcana_save', JSON.stringify(saveData));
        const badge = document.getElementById('collectionBadge');
        if (badge) badge.textContent = _cardHistory.length;
        if (supabaseClient && _playerId && _playerName) syncToSupabase();
    }

    function savePendingPack() {
        if (pendingPack) localStorage.setItem('arcana_pending_pack', JSON.stringify(pendingPack));
        else localStorage.removeItem('arcana_pending_pack');
    }

    function checkDailyReset() {
        const today = new Date().toDateString();
        const lastReset = localStorage.getItem('arcana_last_reset');
        const baseLimit = 100 + Math.floor(_level / 10);
        const maxLimit = 125;
        if (lastReset !== today) {
            _strikesDone = 0;
            _strikesLimit = Math.min(baseLimit, maxLimit);
            localStorage.setItem('arcana_last_reset', today);
            saveGame();
        } else {
            const newLimit = Math.min(baseLimit, maxLimit);
            if (_strikesLimit !== newLimit) {
                _strikesLimit = newLimit;
                if (_strikesDone > _strikesLimit) _strikesDone = _strikesLimit;
                saveGame();
            }
        }
        if (_strikesDone > _strikesLimit) _strikesDone = _strikesLimit;
    }

    function getOnlineStatus(lastActiveTime) {
        if (!lastActiveTime) return { text: '🕐 Неизвестно', color: '#888888' };
        const last = new Date(lastActiveTime);
        if (isNaN(last.getTime())) return { text: '🕐 Ошибка', color: '#888888' };
        const now = new Date();
        const diffSeconds = Math.floor((now - last) / 1000);
        if (diffSeconds < 60) return { text: '🟢 Онлайн', color: '#44ff44' };
        if (diffSeconds < 300) return { text: `🟡 ${Math.floor(diffSeconds / 60)} мин`, color: '#ffaa44' };
        if (diffSeconds < 3600) return { text: `🟠 ${Math.floor(diffSeconds / 60)} мин`, color: '#ff8844' };
        if (diffSeconds < 86400) return { text: `⚫ ${Math.floor(diffSeconds / 3600)} ч`, color: '#888888' };
        return { text: `⚫ ${Math.floor(diffSeconds / 86400)} д`, color: '#666666' };
    }

    window.loadGame = loadGame;
    window.saveGame = saveGame;
    window.savePendingPack = savePendingPack;
    window.checkDailyReset = checkDailyReset;
    window.fgLoadStats = fgLoadStats;
    window.fgSaveStats = fgSaveStats;
    window.fgUpdateSideStats = fgUpdateSideStats;