// ============================================================
// ЕЖЕДНЕВНЫЕ КВЕСТЫ
// ============================================================
// ===== ШАБЛОНЫ КВЕСТОВ =====
    const DAILY_QUESTS_TEMPLATES = [
        {
            id: 'mine_strikes',
            icon: '⛏️',
            title: 'Сделай 50 ударов',
            description: 'Добывай руду в шахте',
            target: 50,
            event: 'mine',
            reward: { essence: 10, ore: 0, xp: 25 }
        },
        {
            id: 'open_packs',
            icon: '🎴',
            title: 'Открой 2 пака',
            description: 'Купи и открой паки',
            target: 2,
            event: 'pack_open',
            reward: { essence: 15, ore: 0, xp: 30 }
        },
        {
            id: 'send_messages',
            icon: '💬',
            title: 'Напиши 3 сообщения',
            description: 'Пообщайся в чате',
            target: 3,
            event: 'chat_message',
            reward: { essence: 10, ore: 0, xp: 20 }
        },
        {
            id: 'play_minigame',
            icon: '🎮',
            title: 'Победи в мини-игре',
            description: 'Сыграй в «Аркана: Полёт»',
            target: 1,
            event: 'minigame_play',
            reward: { essence: 15, ore: 0, xp: 30 }
        }
/*        {
            id: 'market_action',
            icon: '🏪',
            title: 'Обменяйся на рынке',
            description: 'Купи, продай или создай лот',
            target: 1,
            event: 'market_action',
            reward: { essence: 20, ore: 0, xp: 40 }
        }*/
    ];

    // ===== СОСТОЯНИЕ =====
    let _questProgress = {};        // { questId: { progress, claimed } }
    let _questBonusClaimed = false;
    let _questRefreshTimer = null;

    // ===== УТИЛИТЫ =====
    function questToday() {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;  // ✅ локальная дата YYYY-MM-DD
    }

    function formatTimeLeft() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);  // локальная полночь — уже правильно
        const diff = tomorrow - now;
        if (diff <= 0) return '00:00:00';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    // ===== ЗАГРУЗКА =====
    async function loadDailyQuests() {
        if (!supabaseClient || !_playerId) return;
        const today = questToday();

        // ✅ Одноразовая очистка старых записей (можно удалить через день)
        try {
            await supabaseClient.from('daily_quest_progress')
                .delete()
                .eq('player_id', _playerId)
                .lt('quest_date', today);
        } catch(e) { /* игнорируем */ }

        // ✅ Если дата сменилась — принудительно сбрасываем локальное состояние
        if (_lastKnownQuestDate && _lastKnownQuestDate !== today) {
            _questProgress = {};
            _questBonusClaimed = false;
            _lastKnownQuestDate = today;
        }

        try {
            // Загружаем прогресс
            const { data: progress } = await supabaseClient
                .from('daily_quest_progress')
                .select('*')
                .eq('player_id', _playerId)
                .eq('quest_date', today);

            // Загружаем бонус
            const { data: bonus } = await supabaseClient
                .from('daily_quest_bonus')
                .select('*')
                .eq('player_id', _playerId)
                .eq('quest_date', today)
                .maybeSingle();

            // Инициализируем состояние
            _questProgress = {};
            DAILY_QUESTS_TEMPLATES.forEach(t => {
                const saved = (progress || []).find(p => p.quest_id === t.id);
                _questProgress[t.id] = {
                    progress: saved ? saved.progress : 0,
                    claimed: saved ? saved.claimed : false
                };
            });

            _questBonusClaimed = bonus ? bonus.bonus_claimed : false;

            renderDailyQuests();
            updateQuestBadge();
        } catch(e) {
            console.warn('loadDailyQuests error:', e);
        }
    }

    // ===== РЕНДЕР =====
    function renderDailyQuests() {
        const listEl = document.getElementById('dqList');
        if (!listEl) return;

        const today = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
        const dateEl = document.getElementById('questDate');
        if (dateEl) dateEl.textContent = today;

        listEl.innerHTML = DAILY_QUESTS_TEMPLATES.map(quest => {
            const state = _questProgress[quest.id] || { progress: 0, claimed: false };
            const progress = Math.min(state.progress, quest.target);
            const isCompleted = progress >= quest.target;
            const isClaimed = state.claimed;
            const percent = Math.min((progress / quest.target) * 100, 100);

            const rewardTags = [];
            if (quest.reward.essence) rewardTags.push(`<span class="dq-reward-tag essence">💠 +${quest.reward.essence}</span>`);
            if (quest.reward.ore) rewardTags.push(`<span class="dq-reward-tag ore">⛏️ +${quest.reward.ore}</span>`);
            if (quest.reward.xp) rewardTags.push(`<span class="dq-reward-tag xp">✨ +${quest.reward.xp}</span>`);

            return `
                <div class="dq-item ${isCompleted ? 'completed' : ''} ${isClaimed ? 'claimed' : ''}">
                    <div class="dq-icon">${quest.icon}</div>
                    <div class="dq-content">
                        <div class="dq-title">${quest.title}</div>
                        <div class="dq-progress-bar">
                            <div class="dq-progress-fill" style="width:${percent}%"></div>
                        </div>
                        <div class="dq-progress-text">${progress} / ${quest.target}</div>
                    </div>
                    <div class="dq-reward">${rewardTags.join('')}</div>
                    ${isClaimed
                        ? `<button class="dq-claim-btn" disabled>✅ Получено</button>`
                        : isCompleted
                            ? `<button class="dq-claim-btn" onclick="claimQuestReward('${quest.id}')">🎁 Забрать</button>`
                            : `<button class="dq-claim-btn" disabled>⏳</button>`
                    }
                </div>
            `;
        }).join('');

        // Бонус
        const completedCount = DAILY_QUESTS_TEMPLATES.filter(q => {
            const s = _questProgress[q.id];
            return s && s.progress >= q.target;
        }).length;
        const progressEl = document.getElementById('dqBonusProgress');
        if (progressEl) progressEl.textContent = `Выполнено ${completedCount}/4`;

        const bonusBtn = document.getElementById('dqBonusBtn');
        if (bonusBtn) {
            if (_questBonusClaimed) {
                bonusBtn.disabled = true;
                bonusBtn.textContent = '✅ Получено';
            } else if (completedCount >= 4) {
                bonusBtn.disabled = false;
                bonusBtn.textContent = '🎁 Забрать бонус';
            } else {
                bonusBtn.disabled = true;
                bonusBtn.textContent = '🎁 Забрать бонус';
            }
        }
    }

    // ===== ПРОГРЕСС =====
    async function addQuestProgress(event, amount = 1) {
        if (!supabaseClient || !_playerId) return;

        // Находим квесты для этого события
        const quests = DAILY_QUESTS_TEMPLATES.filter(q => q.event === event);
        if (quests.length === 0) return;

        const today = questToday();

        for (const quest of quests) {
            const state = _questProgress[quest.id];
            if (!state || state.claimed) continue;
            if (state.progress >= quest.target) continue;

            const newProgress = Math.min(state.progress + amount, quest.target);
            state.progress = newProgress;

            try {
                // Upsert в БД
                const { error } = await supabaseClient
                    .from('daily_quest_progress')
                    .upsert({
                        player_id: _playerId,
                        quest_id: quest.id,
                        progress: newProgress,
                        quest_date: today,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'player_id,quest_id,quest_date' });

                if (error) console.warn('quest upsert error:', error);
            } catch(e) {
                console.warn('addQuestProgress error:', e);
            }

            // Показываем уведомление о завершении
            if (newProgress >= quest.target && state.progress !== quest.target) {
                showToast(`✅ Квест «${quest.title}» выполнен!`, '#44ff44');
            }
        }

        renderDailyQuests();
        updateQuestBadge();
    }

    // ===== ПОЛУЧЕНИЕ НАГРАДЫ =====
    async function claimQuestReward(questId) {
        const quest = DAILY_QUESTS_TEMPLATES.find(q => q.id === questId);
        if (!quest) return;

        const state = _questProgress[questId];
        if (!state || state.claimed) return;
        if (state.progress < quest.target) return;

        // Начисляем
        if (quest.reward.essence) _essence += quest.reward.essence;
        if (quest.reward.ore) _ore += quest.reward.ore;
        if (quest.reward.xp) addXP(quest.reward.xp);

        state.claimed = true;

        // Сохраняем в БД
        const today = questToday();
        try {
            await supabaseClient
                .from('daily_quest_progress')
                .update({ claimed: true, updated_at: new Date().toISOString() })
                .eq('player_id', _playerId)
                .eq('quest_id', questId)
                .eq('quest_date', today);
        } catch(e) {
            console.warn('claim quest error:', e);
        }

        // Показываем всплывашку
        const rewards = [];
        if (quest.reward.essence) rewards.push(`💠 +${quest.reward.essence}`);
        if (quest.reward.ore) rewards.push(`⛏️ +${quest.reward.ore}`);
        if (quest.reward.xp) rewards.push(`✨ +${quest.reward.xp} XP`);
        showToast(`🎁 ${rewards.join(' · ')}`, '#ffcc66');

        // Вибрация
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

        saveGame();
        updateUI();
        renderDailyQuests();
        updateQuestBadge();
    }

    // ===== БОНУС ЗА ВСЕ 5 =====
    async function claimQuestBonus() {
        if (_questBonusClaimed) return;

        const completedCount = DAILY_QUESTS_TEMPLATES.filter(q => {
            const s = _questProgress[q.id];
            return s && s.progress >= q.target;
        }).length;

        if (completedCount < 5) {
            showToast('❌ Выполни все 5 квестов', '#ffaa88');
            return;
        }

        // Награда за бонус
        const bonusEssence = 50;
        const bonusOre = 500;
        const bonusXP = 100;

        _essence += bonusEssence;
        _ore += bonusOre;
        addXP(bonusXP);

        _questBonusClaimed = true;

        // Сохраняем в БД
        const today = questToday();
        try {
            await supabaseClient
                .from('daily_quest_bonus')
                .upsert({
                    player_id: _playerId,
                    quest_date: today,
                    bonus_claimed: true
                }, { onConflict: 'player_id,quest_date' });
        } catch(e) {
            console.warn('bonus claim error:', e);
        }

        showToast(`🏆 БОНУС: 💠 +${bonusEssence} · ⛏️ +${bonusOre} · ✨ +${bonusXP} XP`, '#ffcc66');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);

        saveGame();
        updateUI();
        renderDailyQuests();
        updateQuestBadge();
    }

    // ===== БЕЙДЖ =====
    function updateQuestBadge() {
        const badge = document.getElementById('questBadge');
        if (!badge) return;

        // Сколько квестов можно забрать
        const claimable = DAILY_QUESTS_TEMPLATES.filter(q => {
            const s = _questProgress[q.id];
            return s && s.progress >= q.target && !s.claimed;
        }).length;

        if (claimable > 0) {
            badge.textContent = claimable;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }

        // Мини-виджет в шапке
        const widget = document.getElementById('questMiniWidget');
        if (widget) {
            if (claimable > 0) {
                widget.style.display = 'flex';
                widget.querySelector('.quest-mini-text').textContent = `${claimable}`;
            } else {
                widget.style.display = 'none';
            }
        }
    }

    // ===== ТАЙМЕР СБРОСА =====
    let _lastKnownQuestDate = null;

    function startQuestTimer() {
        if (_questRefreshTimer) clearInterval(_questRefreshTimer);
        _lastKnownQuestDate = questToday();  // запоминаем дату при старте

        function update() {
            const el = document.getElementById('questResetTimer');
            if (el) el.textContent = formatTimeLeft();

            // ✅ Проверка смены дня КАЖДУЮ СЕКУНДУ
            const today = questToday();
            if (today !== _lastKnownQuestDate) {
                console.log('📅 Новый день! Сброс квестов:', _lastKnownQuestDate, '→', today);
                _lastKnownQuestDate = today;
                loadDailyQuests();
            }
        }
        update();
        _questRefreshTimer = setInterval(update, 1000);
    }

    // ===== ИНИЦИАЛИЗАЦИЯ =====
    function initDailyQuests() {
        startQuestTimer();
        loadDailyQuests();

        // Кнопка бонуса
        const bonusBtn = document.getElementById('dqBonusBtn');
        if (bonusBtn && !bonusBtn.dataset.bound) {
            bonusBtn.dataset.bound = '1';
            bonusBtn.addEventListener('click', claimQuestBonus);
        }
    }

    window.questToday = questToday;
    window.formatTimeLeft = formatTimeLeft;
    window.loadDailyQuests = loadDailyQuests;
    window.renderDailyQuests = renderDailyQuests;
    window.addQuestProgress = addQuestProgress;
    window.claimQuestReward = claimQuestReward;
    window.claimQuestBonus = claimQuestBonus;
    window.updateQuestBadge = updateQuestBadge;
    window.startQuestTimer = startQuestTimer;
    window.initDailyQuests = initDailyQuests;