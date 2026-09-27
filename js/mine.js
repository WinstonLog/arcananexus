    // ============================================================
    // АВТО-ШАХТА
    // ============================================================
    const AutoMine = (() => {
        const CONFIG = {
            baseRate: 60,
            maxOfflineHours: 8,
            minClaimAmount: 100,
            levelBonusPerLevel: 5,
            levelsPerBonus: 5,
            pickaxeBonus: 10,
            storageKey: 'arcana_automine',
            tickInterval: 1000
        };
        let state = { lastCollect: Date.now(), totalCollected: 0, totalClaims: 0 };
        let tickTimer = null;

        function getRate() {
            const level = _level || 1;
            const pickaxe = _pickaxeLevel || 1;
            let rate = CONFIG.baseRate;
            rate += Math.floor(level / CONFIG.levelsPerBonus) * CONFIG.levelBonusPerLevel;
            rate += (pickaxe - 1) * CONFIG.pickaxeBonus;
            rate *= getTotalMultiplier();   // ✅ ×2 в выходные
            return rate;
        }
        function getAccumulated() {
            const hoursPassed = (Date.now() - state.lastCollect) / (1000 * 60 * 60);
            const effectiveHours = Math.min(hoursPassed, CONFIG.maxOfflineHours);
            return Math.floor(effectiveHours * getRate());
        }
        function getHoursPassed() {
            const hours = (Date.now() - state.lastCollect) / (1000 * 60 * 60);
            return Math.min(hours, CONFIG.maxOfflineHours);
        }
        function claim() {
            const amount = getAccumulated();
            if (amount < CONFIG.minClaimAmount) {
                showToast(`⚙️ Накопи хотя бы ${CONFIG.minClaimAmount} руды (сейчас ${amount})`, '#ffaa88');
                return false;
            }
            _ore += amount;
            state.lastCollect = Date.now();
            state.totalCollected += amount;
            state.totalClaims += 1;
            save();
            showToast(`⚙️ Авто-шахта: +${amount.toLocaleString('ru-RU')} ⛏️!`, '#f5b342');
            updateUI();
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
            return amount;
        }
        function save() {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify({
                lastCollect: state.lastCollect,
                totalCollected: state.totalCollected,
                totalClaims: state.totalClaims,
                savedAt: Date.now()
            }));
        }
        function load() {
            try {
                const saved = localStorage.getItem(CONFIG.storageKey);
                if (saved) {
                    const data = JSON.parse(saved);
                    state.lastCollect = data.lastCollect || Date.now();
                    state.totalCollected = data.totalCollected || 0;
                    state.totalClaims = data.totalClaims || 0;
                }
            } catch(e) {}
        }
        function updateUIFn() {
            const panel = document.querySelector('.automine-panel');
            const hoursEl = document.getElementById('automineHours');
            const amountEl = document.getElementById('automineAccumulated');
            const btn = document.getElementById('automineClaimBtn');
            const rateEl = document.getElementById('automineRate');
            const progressEl = document.getElementById('automineProgressFill');
            if (!hoursEl || !amountEl || !btn) return;
            const hours = getHoursPassed();
            const amount = getAccumulated();
            hoursEl.textContent = hours.toFixed(1);
            amountEl.textContent = amount.toLocaleString('ru-RU');
            if (rateEl) rateEl.textContent = `${getRate().toLocaleString('ru-RU')}/ч`;
            if (progressEl) progressEl.style.width = Math.min((hours / CONFIG.maxOfflineHours) * 100, 100) + '%';
            if (panel) {
                if (hours >= CONFIG.maxOfflineHours) panel.classList.add('full');
                else panel.classList.remove('full');
            }
            if (amount < CONFIG.minClaimAmount) {
                btn.disabled = true;
                btn.textContent = `⏳ Ждём ${CONFIG.minClaimAmount - amount} ⛏️`;
            } else {
                btn.disabled = false;
                btn.textContent = `ЗАБРАТЬ +${amount.toLocaleString('ru-RU')} ⛏️`;
            }
        }
        function startTick() {
            if (tickTimer) clearInterval(tickTimer);
            tickTimer = setInterval(updateUIFn, CONFIG.tickInterval);
        }
        function bindUI() {
            const btn = document.getElementById('automineClaimBtn');
            if (btn && !btn.dataset.bound) {
                btn.dataset.bound = '1';
                btn.addEventListener('click', claim);
            }
        }
        return {
            init() {
                load(); bindUI(); updateUIFn(); startTick();
                window.addEventListener('beforeunload', save);
                document.addEventListener('visibilitychange', () => {
                    if (document.hidden) save();
                    else updateUIFn();
                });
            },
            claim,
            getAccumulated,
            getHoursPassed,
            getRate,
            refresh: updateUIFn,
            reset() {
                state = { lastCollect: Date.now(), totalCollected: 0, totalClaims: 0 };
                save(); updateUIFn();
            }
        };
    })();

// ============================================================
// ШАХТА
// ============================================================
    function getOrePerClick() {
        let bonus = Math.floor(_level / 10);
        let pickBonus = _pickaxeLevel - 1;
        let minOre = 5 + bonus + pickBonus;
        let maxOre = 9 + bonus + pickBonus;
        return Math.floor(Math.random() * (maxOre - minOre + 1) + minOre);
    }

    function getCurrentMiningRange() {
        let bonus = Math.floor(_level / 10);
        let pickBonus = _pickaxeLevel - 1;
        return { min: 5 + bonus + pickBonus, max: 9 + bonus + pickBonus };
    }

    function getNextMiningRange() {
        let bonus = Math.floor(_level / 10);
        let pickBonus = _pickaxeLevel;
        return { min: 5 + bonus + pickBonus, max: 9 + bonus + pickBonus };
    }

    function getPickaxeUpgradeCost(level) {
        if (level <= 5) return Math.floor(30 + (level - 1) * 15);
        return Math.floor(100 + (level - 5) * 25);
    }

    // ============================================================
    // КОМПЕНСАЦИЯ ЗА ПОВЫШЕНИЕ УРОВНЯ
    // ============================================================
    // Старая формула стоимости уровня (из предыдущей версии игры)
    function getOldLevelUpCost(level) {
        if (level < 5) return Math.floor(10 + level * 5);
        return Math.floor(35 + (level - 1) * 8 + Math.pow(level, 1.2));
    }

    // Считаем, сколько всего эссенции игрок потратил на уровни
    function calculateLevelCompensation(currentLevel) {
        let total = 0;
        for (let lvl = 1; lvl < currentLevel; lvl++) {
            total += getOldLevelUpCost(lvl);
        }
        return total;
    }

    // Проверка и показ модалки компенсации
    async function checkCompensation() {
        // 1. Сначала читаем флаг из БД (если есть подключение)
        if (supabaseClient && _playerId) {
            try {
                const { data } = await supabaseClient
                    .from('leaderboard')
                    .select('compensation_claimed')
                    .eq('player_id', _playerId)
                    .single();
                
                if (data && data.compensation_claimed === true) {
                    // Уже получил на другом устройстве
                    _compensationClaimed = true;
                    saveGame();
                    console.log('✅ Компенсация уже получена (из БД)');
                    return;
                }
            } catch(e) {
                console.warn('Ошибка проверки компенсации:', e);
            }
        }
        
        // 2. Проверяем локальный флаг
        if (_compensationClaimed) return;
        
        // 3. Уровень 1 — нечего компенсировать
        if (_level < 2) {
            _compensationClaimed = true;
            saveGame();
            if (supabaseClient) syncToSupabase();
            return;
        }
        
        // 4. Считаем сумму
        const compensation = calculateLevelCompensation(_level);
        if (compensation <= 0) {
            _compensationClaimed = true;
            saveGame();
            if (supabaseClient) syncToSupabase();
            return;
        }
        
        // 5. Показываем модалку
        showCompensationModal(compensation);
    }

    function showCompensationModal(amount) {
        // Создаём модалку динамически
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'compensationModal';
        modal.style.display = 'flex';
        modal.style.zIndex = '450';
        modal.innerHTML = `
            <div class="modal-content" style="max-width:420px;text-align:center;">
                <div class="modal-title" style="color:#ffcc66;">💰 КОМПЕНСАЦИЯ</div>
                <div style="font-size:56px;margin:10px 0;">🎁</div>
                <p style="color:#8b90a8;font-size:14px;line-height:1.6;margin-bottom:14px;">
                    Вы повышали уровень за <strong style="color:#b388ff;">💠 Эссенцию</strong>.<br>
                    Теперь уровни качаются за <strong style="color:#ffcc66;">✨ XP</strong>!<br><br>
                    Мы возвращаем всё потраченное:
                </p>
                <div style="background:linear-gradient(135deg,rgba(255,204,102,0.1),rgba(255,204,102,0.03));border-radius:16px;padding:16px;border:1px solid rgba(255,204,102,0.2);margin-bottom:14px;">
                    <div style="font-size:12px;color:#8b90a8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Ваш уровень: ${_level}</div>
                    <div style="font-size:36px;font-weight:900;color:#ffcc66;text-shadow:0 0 30px rgba(255,204,102,0.3);">+${amount.toLocaleString('ru-RU')} 💠</div>
                    <div style="font-size:11px;color:#6b7084;margin-top:6px;">за все потраченные уровни</div>
                </div>
                <div class="modal-buttons" style="margin-top:10px;">
                    <button class="modal-btn upgrade" id="claimCompensationBtn" style="width:100%;background:linear-gradient(135deg,#ffcc66,#ffaa33);color:#1a1a2e;font-size:15px;padding:14px;">
                        ✅ ЗАБРАТЬ КОМПЕНСАЦИЮ
                    </button>
                </div>
                <div style="font-size:11px;color:#4a4a5a;margin-top:10px;">Показывается один раз</div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Обработчик
        document.getElementById('claimCompensationBtn').addEventListener('click', async function() {
            _essence += amount;
            _compensationClaimed = true;
            saveGame();
            
            // 👇 ВАЖНО: сразу отправляем в БД
            if (supabaseClient && _playerId && _playerName) {
                try {
                    await supabaseClient.from('leaderboard')
                        .update({ compensation_claimed: true })
                        .eq('player_id', _playerId);
                    console.log('✅ Флаг компенсации сохранён в БД');
                } catch(e) {
                    console.warn('Ошибка сохранения флага:', e);
                }
            }
            
            updateUI();
            
            showToast(`💰 +${amount.toLocaleString('ru-RU')} 💠 компенсация получена!`, '#ffcc66');
            
            // Всплывашка с числом
            const div = document.createElement('div');
            div.className = 'floating-number';
            div.textContent = `+${amount.toLocaleString('ru-RU')} 💠`;
            div.style.left = (window.innerWidth / 2) + 'px';
            div.style.top = (window.innerHeight / 2) + 'px';
            div.style.fontSize = '48px';
            document.body.appendChild(div);
            setTimeout(() => div.remove(), 1500);
            
            // Закрываем
            setTimeout(() => {
                modal.style.opacity = '0';
                modal.style.transition = 'opacity 0.3s';
                setTimeout(() => modal.remove(), 300);
            }, 300);
        });
        
        // Блокируем закрытие по клику вне модалки (важно!)
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                showToast('👇 Нажмите "ЗАБРАТЬ КОМПЕНСАЦИЮ"', '#ffaa88');
            }
        });
    }

// ============================================================
// ШАХТА
// ============================================================
    function mineOre() {
        _lastActive = new Date().toISOString();
        if (isMining) return;
        isMining = true;
        setTimeout(() => { isMining = false; }, miningCooldown);
        if (_strikesDone >= _strikesLimit) { showToast('⛔ Лимит ударов!', '#ff6b6b'); isMining = false; return; }

        // ===== МНОЖИТЕЛЬ ВЫХОДНЫХ (×2 сб/вс) =====
        const multiplier = getTotalMultiplier();

        // ===== РАСЧЁТ КОЛИЧЕСТВА УДАРОВ =====
        let strikesToAdd = 1;
        if (_shockwaveBought) {
            const remaining = _strikesLimit - _strikesDone;
            strikesToAdd = Math.min(25, remaining);
            if (strikesToAdd <= 0) strikesToAdd = 1;
        }

        // ===== ДОБЫВАЕМ РУДУ =====
        let totalOre = 0;
        let eventCurrencyGained = 0;
        const event = getCurrentEvent();

        for (let i = 0; i < strikesToAdd; i++) {
            // ✅ Умножаем добычу на множитель выходных
            const gain = Math.floor(getOrePerClick() * multiplier);
            _ore += gain;
            totalOre += gain;
            _strikesDone++;
            _totalStrikesEver++;

            // Ивентовая валюта (8% шанс)
            if (event && Math.random() < 0.08) {
                _eventCurrency++;
                eventCurrencyGained++;
            }
        }

        // XP за удар (умножаем на количество ударов)
        addXP(XP_MINE * strikesToAdd);
        addQuestProgress('mine', strikesToAdd);

        // ===== ВИЗУАЛЬНЫЕ ЭФФЕКТЫ =====
        const pickaxe = document.getElementById('pickaxeBtn');
        const rect = pickaxe.getBoundingClientRect();

        // Показываем сколько ударов сделано
        if (strikesToAdd > 1) {
            showFloatingNumber(`⚡+${strikesToAdd}`, rect.left + rect.width / 2, rect.top + rect.height / 2 - 40, true);
            showToast(`⚡ Ударная волна: +${strikesToAdd} ударов!`, '#ffaa33');
        }

        // Показываем руду (если выходные — добавляем ×2 в всплывашку)
        const oreLabel = multiplier > 1 ? `${totalOre} ×2` : totalOre;
        showFloatingNumber(oreLabel, rect.left + rect.width / 2, rect.top + rect.height / 2, totalOre > 100);

        // Показываем ивентовую валюту
        if (eventCurrencyGained > 0) {
            showFloatingNumber(`${event.emoji}+${eventCurrencyGained}`, rect.left + rect.width / 2 - 20 + (Math.random() - 0.5) * 40, rect.top + rect.height / 2 - 80, false);
        }

        // Анимация нажатия
        pickaxe.style.transform = 'scale(0.92)';
        setTimeout(() => pickaxe.style.transform = '', 90);

        playClickSound();
        saveGame();
        updateUI();
    }

    function claimBonus() {
        const today = new Date().toDateString();
        if (_lastBonusDate && _lastBonusDate.toDateString() === today) { showToast('❗ Уже получен сегодня', '#ffaa88'); return; }
        _essence += 5;
        _lastBonusDate = new Date();
        addXP(XP_BONUS);
        showToast(`💠 +5 · ✨ +${XP_BONUS} XP`, '#b388ff');
        saveGame(); updateUI();
    }

    function exchangeOreToEssence() {
        const slider = document.getElementById('exchangeSlider');
        let amt = parseInt(slider.value);
        if (amt <= 0) { showToast('Выберите количество', '#ffaa88'); return; }
        let baseGain = Math.floor(amt / 100);
        if (baseGain <= 0) { showToast('Минимум 100 руды', '#ffaa88'); return; }
        if (_ore < baseGain * 100) { showToast('Недостаточно руды!', '#ffaa88'); return; }
        _ore -= baseGain * 100;
        _essence += baseGain;
        showToast(`💠 +${baseGain} Эссенции!`, '#b388ff');
        slider.value = 0;
        document.getElementById('exchangeAmount').textContent = 0;
        saveGame(); updateUI();
    }

    function showPickaxeModal() {
        const currentRange = getCurrentMiningRange();
        const nextRange = getNextMiningRange();
        const cost = getPickaxeUpgradeCost(_pickaxeLevel);
        const isMaxLevel = _pickaxeLevel >= 10;
        
        document.getElementById('pickaxeModalCurrentLevel').textContent = _pickaxeLevel;
        document.getElementById('pickaxeModalNextLevel').textContent = isMaxLevel ? '—' : Math.min(_pickaxeLevel + 1, 10);
        document.getElementById('pickaxeModalCost').textContent = isMaxLevel ? '—' : cost;
        document.getElementById('pickaxeModalessence').textContent = _essence;
        document.getElementById('pickaxeModalMinOre').textContent = currentRange.min;
        document.getElementById('pickaxeModalMaxOre').textContent = currentRange.max;
        document.getElementById('pickaxeModalNewMinOre').textContent = isMaxLevel ? '—' : nextRange.min;
        document.getElementById('pickaxeModalNewMaxOre').textContent = isMaxLevel ? '—' : nextRange.max;
        
        const progress = (_pickaxeLevel / 10) * 100;
        document.getElementById('pickaxeProgressFill').style.width = Math.min(progress, 100) + '%';

        // ===== БЛОКИРУЕМ КНОПКУ УЛУЧШЕНИЯ ПРИ MAX =====
        const upgradeBtn = document.getElementById('pickaxeModalUpgradeBtn');
        if (upgradeBtn) {
            if (isMaxLevel) {
                upgradeBtn.disabled = true;
                upgradeBtn.textContent = '✅ МАКС. УРОВЕНЬ';
                upgradeBtn.style.background = 'linear-gradient(135deg, #2a6b4a, #1a4a3a)';
                upgradeBtn.style.cursor = 'not-allowed';
                upgradeBtn.style.opacity = '0.7';
            } else {
                upgradeBtn.disabled = false;
                upgradeBtn.textContent = 'Улучшить';
                upgradeBtn.style.background = '';
                upgradeBtn.style.cursor = 'pointer';
                upgradeBtn.style.opacity = '1';
            }
        }

        document.getElementById('pickaxeModal').classList.add('show');
        updateShockwaveUI();
    }

    // ===== УДАРНАЯ ВОЛНА =====
    function updateShockwaveUI() {
        const statusEl = document.getElementById('shockwaveStatus');
        const buyBtn = document.getElementById('shockwaveBuyBtn');
        const infoEl = document.getElementById('shockwaveInfo');
        if (!statusEl || !buyBtn) return;

        if (_shockwaveBought) {
            statusEl.textContent = '✅ КУПЛЕНО';
            statusEl.style.color = '#44ff44';
            buyBtn.textContent = '✅ УЖЕ КУПЛЕНО';
            buyBtn.style.background = 'linear-gradient(135deg, #2a6b4a, #1a4a3a)';
            buyBtn.style.cursor = 'default';
            buyBtn.onclick = null;
            if (infoEl) infoEl.style.display = 'block';
        } else {
            statusEl.textContent = '🔒 НЕ КУПЛЕНО';
            statusEl.style.color = '#ff6b6b';
            buyBtn.textContent = '🛒 КУПИТЬ (50 000 ⛏️)';
            buyBtn.style.background = 'linear-gradient(135deg, #ffaa33, #ff6600)';
            buyBtn.style.cursor = 'pointer';
            buyBtn.onclick = buyShockwave;
            if (infoEl) infoEl.style.display = 'none';
        }
    }

    function buyShockwave() {
        const cost = 50000;
        if (_shockwaveBought) {
            showToast('✅ Улучшение уже куплено!', '#44ff44');
            return;
        }
        if (_ore < cost) {
            showToast(`❌ Нужно ${cost.toLocaleString('ru-RU')} руды! У вас ${Math.floor(_ore).toLocaleString('ru-RU')}`, '#ff6b6b');
            return;
        }
        _ore -= cost;
        _shockwaveBought = true;
        saveGame();
        updateUI();
        updateShockwaveUI();
        showToast('⚡ УДАРНАЯ ВОЛНА АКТИВИРОВАНА! Каждый клик даёт +25 ударов!', '#44ff44');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }

    function performPickaxeUpgrade() {
        if (_pickaxeLevel >= 10) { 
            showToast('🔧 Кирка уже максимального уровня!', '#ffaa88'); 
            return; 
        }
        const cost = getPickaxeUpgradeCost(_pickaxeLevel);
        if (_essence >= cost) {
            _essence -= cost;
            logEssenceTransaction(-cost, 'spend_pickaxe', { level: _pickaxeLevel });
            _pickaxeLevel++;
            showToast(`🔧 Кирка → ${_pickaxeLevel} ур.!`, '#b388ff');
            saveGame(); updateUI();
            // Обновляем модалку, если она открыта
            if (document.getElementById('pickaxeModal').classList.contains('show')) {
                showPickaxeModal();
            }
        } else { 
            showToast(`❗ Нужно ${cost} 💠`, '#ffaa88'); 
        }
    }

    async function logEssenceTransaction(amount, reason, metadata = {}) {
        if (!supabaseClient || !_playerId) return;
        try {
            await supabaseClient.from('essence_transactions').insert({
                player_id: _playerId,
                amount: amount,
                balance_after: Math.round(_essence),
                reason: reason,
                metadata: metadata
            });
        } catch(e) {
            console.warn('logEssenceTransaction error:', e);
        }
    }
    
    window.getOrePerClick = getOrePerClick;
    window.getCurrentMiningRange = getCurrentMiningRange;
    window.getNextMiningRange = getNextMiningRange;
    window.getPickaxeUpgradeCost = getPickaxeUpgradeCost;
    window.checkCompensation = checkCompensation;
    window.showCompensationModal = showCompensationModal;
    window.mineOre = mineOre;
    window.claimBonus = claimBonus;
    window.exchangeOreToEssence = exchangeOreToEssence;
    window.showPickaxeModal = showPickaxeModal;
    window.updateShockwaveUI = updateShockwaveUI;
    window.buyShockwave = buyShockwave;
    window.performPickaxeUpgrade = performPickaxeUpgrade;
    window.logEssenceTransaction = logEssenceTransaction;
    window.AutoMine = AutoMine;