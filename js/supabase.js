// ============================================================
// SUPABASE
// ============================================================
function initSupabase() {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = () => {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            if (_playerId && _playerName) { syncToSupabase(); loadFromSupabase(); }
            loadTopFromSupabase();
            setTimeout(() => { subscribeToChatSection(); setupChatPollingSection(); }, 2000);
            setTimeout(() => { subscribeToMarket(); loadMarketData(); }, 3500);
            setTimeout(() => { initDailyQuests(); }, 4000);
            setTimeout(() => { loadGameNews(); }, 4500);
            setTimeout(() => { initNotifications(); }, 5000);
            // ⚠️ Interstitial (реклама при входе) отключён — оставляем только рекламу в профиле
            // setTimeout(() => {
            //     if (window.Interstitial && _playerName) {
            //         Interstitial.init();
            //     }
            // }, 5500);
            setTimeout(() => { loadCustomCards(); }, 500);
        };
        document.head.appendChild(script);
    }

    async function syncToSupabase() {
        if (!supabaseClient || !_playerId || !_playerName) return;

        // Защита: во время чтения из БД не пишем
        if (typeof _syncLock !== 'undefined' && _syncLock) return;

        const cardsForDb = _cardHistory.map(card => ({
            cardId: card.cardId || card.id,
            rank: card.rank,
            text: card.text || `🎴 ${card.rank}`,
            uniqueId: card.uniqueId || Date.now()
        }));

        try {
            await supabaseClient.from('leaderboard')
                .upsert({
                    player_id: _playerId,
                    username: _playerName,
                    level: _level,
                    essence: _essence,
                    ore: _ore,
                    cards_json: cardsForDb,
                    mb_link: _mbProfileLink || null,
                    last_active: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    compensation_claimed: _compensationClaimed,

                    // ✅ Синхронизация ударов
                    strikes_done: _strikesDone,
                    strikes_reset_at: new Date().toISOString()
                }, { onConflict: 'player_id' });
        } catch(e) {
            console.warn('Supabase sync error:', e);
        }
    }

    function loadFromSupabase() {
        if (!supabaseClient || !_playerId) return;

        supabaseClient.from('leaderboard')
            .select('*')
            .eq('player_id', _playerId)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.warn('loadFromSupabase error:', error);
                    return;
                }
                if (!data) return;
                // ===== ЭССЕНЦИЯ =====
                // Если в БД значение БОЛЬШЕ локального — админ начислил → обновляем
                if (typeof data.essence === 'number' && data.essence > _essence) {
                    console.log(`💰 Синхронизация essence: локально ${_essence}, в БД ${data.essence} — обновляю`);
                    _essence = data.essence;
                } else if (_essence === 0 && data.essence > 0) {
                    _essence = data.essence;
                }

                // ===== РУДА =====
                if (typeof data.ore === 'number' && data.ore > _ore) {
                    _ore = data.ore;
                } else if (_ore === 0 && data.ore > 0) {
                    _ore = data.ore;
                }

                // ===== УРОВЕНЬ =====
                if (_level === 1 && data.level > 1) _level = data.level;

                // ===== КАРТЫ =====
                // Если у игрока локально пусто — берём из БД
                // Если в БД карт БОЛЬШЕ, чем локально — значит админ восстановил → обновляем
                if (data.cards_json && Array.isArray(data.cards_json)) {
                    const dbCards = data.cards_json.map(c => ({
                        cardId: c.cardId || c.id,
                        rank: c.rank,
                        text: c.text || `🎴 ${c.rank}`,
                        uniqueId: c.uniqueId || c.date || Date.now()
                    }));

                    const localCount = _cardHistory.length;
                    const dbCount = dbCards.length;

                    // Если в БД больше — перезаписываем (админ добавил карты)
                    if (dbCount > localCount) {
                        console.log(`🔄 Синхронизация карт: локально ${localCount}, в БД ${dbCount} — обновляю`);
                        _cardHistory = dbCards;
                        saveGame();
                        renderCollection();
                        showToast(`🎴 Восстановлено ${dbCount - localCount} карт(ы)!`, '#44ff44');
                    }
                    // Если локально пусто — тоже берём из БД
                    else if (localCount === 0 && dbCount > 0) {
                        _cardHistory = dbCards;
                        saveGame();
                        renderCollection();
                    }
                }

                // ✅ Синхронизация ударов с сервером
                if (typeof data.strikes_done === 'number' && data.strikes_done >= 0) {
                    const resetAt = data.strikes_reset_at
                        ? new Date(data.strikes_reset_at).toDateString()
                        : null;
                    const lastLocalReset = localStorage.getItem('arcana_last_reset');

                    if (resetAt && resetAt !== lastLocalReset) {
                        // Админ сбросил через SQL — обнуляем локально
                        console.log('🔄 Сброс ударов с сервера:', resetAt);
                        _strikesDone = 0;
                        localStorage.setItem('arcana_last_reset', resetAt);
                    } else {
                        // Берём значение с сервера
                        _strikesDone = data.strikes_done;
                    }
                }

                // Эти поля безопасны — они не пересекаются с игровой валютой
                _mbProfileLink = data.mb_link || _mbProfileLink;
                if (data.compensation_claimed !== undefined && data.compensation_claimed !== null) {
                    _compensationClaimed = data.compensation_claimed;
                }

                saveGame();
                updateUI();
                renderCollection();
                renderCatalog();
                renderSets();
                updateProfileUI();
                updatePackButton();
                updateProfileLinkUI();
            })
            .catch((e) => {
                console.warn('loadFromSupabase catch:', e);
            });
    }

    // ============================================================
    // ПРОВЕРКА ЭССЕНЦИИ (для онлайн-игроков — админ мог начислить)
    // ============================================================
    async function checkEssenceUpdate() {
        if (!supabaseClient || !_playerId) return;
        
        try {
            const { data, error } = await supabaseClient
                .from('leaderboard')
                .select('essence, ore')
                .eq('player_id', _playerId)
                .single();
            
            if (error || !data) return;
            
            const dbEssence = data.essence || 0;
            const dbOre = data.ore || 0;
            
            let changed = false;
            
            // Essence стал больше — админ начислил
            if (dbEssence > _essence) {
                const diff = dbEssence - _essence;
                console.log(`💰 Админ начислил ${diff} 💠 — синхронизирую`);
                _essence = dbEssence;
                changed = true;
                showToast(`💰 +${diff} 💠 зачислено!`, '#44ff44');
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
            }
            
            // Руда стала больше (например, админ тоже мог)
            if (dbOre > _ore) {
                _ore = dbOre;
                changed = true;
            }
            
            if (changed) {
                // Сохраняем в localStorage БЕЗ отправки в Supabase
                const saveData = JSON.parse(localStorage.getItem('arcana_save') || '{}');
                saveData.essence = _essence;
                saveData.ore = _ore;
                localStorage.setItem('arcana_save', JSON.stringify(saveData));
                
                // Обновляем UI
                updateUI();
                updateProfileUI();
            }
        } catch(e) {
            console.debug('checkEssenceUpdate:', e.message);
        }
    }

    window.checkEssenceUpdate = checkEssenceUpdate;


    function loadTopFromSupabase() {
        if (!supabaseClient) {
            setTimeout(loadTopFromSupabase, 1000);
            return;
        }

        const container = document.getElementById('topList');
        const rankBlock = document.getElementById('playerRankBlock');
        const rankSpan = document.getElementById('playerRank');
        const totalSpan = document.getElementById('totalPlayersCount');

        if (!container) return; // секции нет — выходим тихо

        // ✅ Читаем essence, а не diamonds — это актуальная валюта
        supabaseClient
            .from('leaderboard')
            .select('username, level, player_id, essence, ore, mb_link, cards_json, last_active')
            .then(({ data, error }) => {
                if (error) {
                    console.error('loadTopFromSupabase error:', error);
                    container.innerHTML = `<li style="justify-content:center;opacity:0.6;color:#ff6b6b;padding:20px;">
                        ⚠️ Ошибка загрузки топа<br>
                        <span style="font-size:11px;opacity:0.7;">${error.message || 'Проверьте консоль'}</span>
                    </li>`;
                    return;
                }

                if (!data || !data.length) {
                    container.innerHTML = '<li style="justify-content:center;opacity:0.4;">Пока никого нет</li>';
                    if (rankBlock) rankBlock.style.display = 'none';
                    if (totalSpan) totalSpan.textContent = '👥 Всего: 0';
                    return;
                }

                // Рейтинг = уровень × 10 + эссенция
                const playersWithRating = data.map(p => ({
                    ...p,
                    rating: (p.level || 0) * 10 + (p.essence || 0)
                }));
                playersWithRating.sort((a, b) => b.rating - a.rating);

                const topPlayers = playersWithRating.slice(0, 10);
                if (totalSpan) totalSpan.textContent = `👥 Всего: ${data.length}`;

                container.innerHTML = topPlayers.map((p, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
                    const isCurrent = p.player_id === _playerId;
                    const status = getOnlineStatus(p.last_active);
                    const rating = p.rating || 0;
                    const safeName = (p.username || 'Игрок').replace(/'/g, "\\'");

                    return `<li class="${isCurrent ? 'current-player' : ''}"
                                data-player-id="${p.player_id}"
                                data-player-name="${p.username || 'Игрок'}"
                                data-player-level="${p.level || 0}"
                                data-player-essence="${p.essence || 0}"
                                data-player-rating="${rating}"
                                data-player-cards='${JSON.stringify(p.cards_json || [])}'
                                data-mb-link="${p.mb_link || ''}">
                            <span class="top-player-name">
                                <span class="medal">${medal}</span>
                                <span class="name">${p.username || 'Игрок'}</span>
                                <span style="font-size:9px;color:${status.color};margin-left:4px;">${status.text}</span>
                            </span>
                            <span class="top-player-stats">
                                <span>⭐ ${p.level || 0}</span>
                                <span style="color:#ffcc66;font-weight:700;">🏆 ${rating}</span>
                                <button class="top-copy-id-btn"
                                        onclick="event.stopPropagation(); copyPlayerIdFromTop('${p.player_id}', '${safeName}', event)"
                                        title="Скопировать ID">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </span>
                        </li>`;
                }).join('');

                // Место текущего игрока
                const playerIndex = playersWithRating.findIndex(p => p.player_id === _playerId);
                if (playerIndex !== -1) {
                    if (playerIndex < 10) {
                        if (rankSpan) rankSpan.textContent = `${playerIndex + 1} место из ${playersWithRating.length}`;
                        if (rankBlock) rankBlock.style.display = 'block';
                    } else {
                        const playerData = playersWithRating[playerIndex];
                        const playerRating = playerData.rating || 0;
                        const safeName = (playerData.username || 'Игрок').replace(/'/g, "\\'");

                        const playerRow = document.createElement('li');
                        playerRow.className = 'current-player';
                        playerRow.style.borderTop = '2px solid rgba(123, 77, 255, 0.2)';
                        playerRow.style.marginTop = '8px';
                        playerRow.style.paddingTop = '12px';
                        playerRow.innerHTML = `
                            <span class="top-player-name">
                                <span class="medal">${playerIndex + 1}.</span>
                                <span class="name">${playerData.username || 'Игрок'}</span>
                                <span style="font-size:9px;color:#44ff44;margin-left:4px;">🟢 Вы</span>
                            </span>
                            <span class="top-player-stats">
                                <span>⭐ ${playerData.level || 0}</span>
                                <span>💠 ${playerData.essence || 0}</span>
                                <span style="color:#ffcc66;font-weight:700;">🏆 ${playerRating}</span>
                                <button class="top-copy-id-btn"
                                        onclick="event.stopPropagation(); copyPlayerIdFromTop('${playerData.player_id}', '${safeName}', event)"
                                        title="Скопировать ID">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </span>
                        `;
                        if (container) container.appendChild(playerRow);
                        if (rankSpan) rankSpan.textContent = `${playerIndex + 1} место из ${playersWithRating.length}`;
                        if (rankBlock) rankBlock.style.display = 'block';
                    }
                } else {
                    if (rankBlock) rankBlock.style.display = 'none';
                }

                // Клик по строке — открыть профиль
                if (container) {
                    container.querySelectorAll('li[data-player-id]').forEach(el => {
                        el.addEventListener('click', function() {
                            const playerId = this.dataset.playerId;
                            const playerName = this.dataset.playerName;
                            const playerLevel = parseInt(this.dataset.playerLevel) || 0;
                            const playerEssence = parseInt(this.dataset.playerEssence) || 0;
                            const playerRating = parseInt(this.dataset.playerRating) || 0;
                            const mbLink = this.dataset.mbLink || '';
                            let cardsJson = [];
                            try { cardsJson = JSON.parse(this.dataset.playerCards || '[]'); } catch(e) {}
                            showPlayerProfile(playerId, playerName, playerLevel, playerEssence, playerRating, cardsJson, mbLink);
                        });
                    });
                }
            })
            .catch((e) => {
                console.error('loadTopFromSupabase catch:', e);
                if (container) {
                    container.innerHTML = '<li style="justify-content:center;opacity:0.4;">⚠️ Ошибка сети</li>';
                }
            });
    }

    function showPlayerProfile(playerId, playerName, level, essence, rating, cardsJson, mbLink) {
        const modal = document.getElementById('playerProfileModal');
        document.getElementById('playerProfileName').textContent = playerName || 'Игрок';
        // Показываем ID + кнопка копирования
        const playerIdEl = document.getElementById('playerProfileId');
        if (playerIdEl) {
            playerIdEl.innerHTML = `
                <span style="font-family: monospace; font-size: 11px; color: #6b7084; cursor: pointer; word-break: break-all;"
                      onclick="copyPlayerIdFromTop('${playerId}', '${(playerName || 'Игрок').replace(/'/g, "\\'")}')"
                      title="Нажми, чтобы скопировать">
                    🆔 ${playerId}
                </span>
                <button class="copy-profile-id-btn" 
                        onclick="copyPlayerIdFromTop('${playerId}', '${(playerName || 'Игрок').replace(/'/g, "\\'")}', event)">
                    <i class="fas fa-copy"></i> Скопировать ID
                </button>
            `;
        }
        document.getElementById('playerProfileLevel').textContent = level || 1;
        document.getElementById('playerprofileEssence').textContent = essence || 0;
        let ratingEl = modal.querySelector('.rating-row');
        if (!ratingEl) {
            ratingEl = document.createElement('div');
            ratingEl.className = 'stat-row rating-row';
            const essenceRow = modal.querySelector('.stat-row:nth-child(3)');
            if (essenceRow) essenceRow.after(ratingEl);
        }
        ratingEl.innerHTML = `<span class="label">🏆 Рейтинг</span><span class="value" style="color:#ffcc66;">${rating || 0}</span>`;
        const avatarEl = document.getElementById('playerProfileAvatar');
        if (level >= 100) avatarEl.textContent = '🏆';
        else if (level >= 75) avatarEl.textContent = '👑';
        else if (level >= 50) avatarEl.textContent = '🎩';
        else if (level >= 25) avatarEl.textContent = '💠';
        else if (level >= 10) avatarEl.textContent = '🔥';
        else if (level >= 5) avatarEl.textContent = '⛏️';
        else avatarEl.textContent = '🧙';
        const previewContainer = document.getElementById('playerProfileCardsPreview');
        const counts = {};
        let totalCards = 0;
        if (cardsJson && Array.isArray(cardsJson)) {
            cardsJson.forEach(c => { if (c.rank) { counts[c.rank] = (counts[c.rank] || 0) + 1; totalCards++; } });
        }
        document.getElementById('playerProfileCards').textContent = totalCards;
        if (Object.keys(counts).length === 0) {
            previewContainer.innerHTML = '<span style="opacity:0.4;font-size:13px;">🎴 Нет карт</span>';
        } else {
            const rankOrder = ['M', 'T', 'K', 'Y', 'U', 'Q', 'R', 'Z', 'O', 'H', 'N', 'V', 'L'];
            const sorted = Object.keys(counts).sort((a, b) => rankOrder.indexOf(a) - rankOrder.indexOf(b));
            previewContainer.innerHTML = sorted.map(rank => {
                const card = getCardData(rank);
                return `<span class="card-chip" style="color:${card ? card.color : '#888'};border-color:${card ? card.color : '#888'}44;">${rank} ×${counts[rank]}</span>`;
            }).join('');
        }
        const mbLinkContainer = document.getElementById('playerProfileMbLink');
        if (mbLink) {
            mbLinkContainer.innerHTML = `<a href="https://mangabuff.ru/users/${mbLink}" target="_blank" class="mb-link-btn">🔗 Открыть профиль на MangaBuff</a>`;
        } else {
            mbLinkContainer.innerHTML = '<span style="opacity:0.3;font-size:12px;">🔗 Профиль не привязан</span>';
        }
        modal.classList.add('show');
    }

    function updateProfileLinkUI() {
        const statusContainer = document.getElementById('profileLinkStatus');
        if (_mbProfileLink) {
            statusContainer.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                    <span style="font-size:13px;color:#7a7f98;">
                        ✅ Привязан: <strong style="color:#b388ff;">${_mbProfileLink}</strong>
                        <a href="https://mangabuff.ru/users/${_mbProfileLink}" target="_blank" style="margin-left:8px;font-size:12px;color:#b388ff;">🔗 Открыть</a>
                    </span>
                    <span style="font-size:11px;opacity:0.4;">Привязан навсегда</span>
                </div>
            `;
        } else {
            statusContainer.innerHTML = `
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
                    <span style="font-size:13px;color:#7a7f98;opacity:0.5;">Не привязан</span>
                    <button id="openProfileLinkBtn" style="padding:8px 20px;border-radius:30px;font-weight:700;font-size:13px;cursor:pointer;border:none;background:rgba(123,77,255,0.15);color:#b388ff;">Привязать</button>
                </div>
            `;
            document.getElementById('openProfileLinkBtn')?.addEventListener('click', () => {
                document.getElementById('profileLinkModal').classList.add('show');
            });
        }
    }

    function saveMbProfileLink(linkId) {
        if (!linkId || linkId.trim() === '') { showToast('❌ Введите ID!', '#ff6b6b'); return false; }
        if (_mbProfileLink) { showToast('❌ Уже привязали!', '#ff6b6b'); return false; }
        if (supabaseClient) {
            supabaseClient.from('leaderboard').select('player_id, username').eq('mb_link', linkId).single()
                .then(({ data }) => {
                    if (data) { showToast(`❌ Профиль уже привязан к ${data.username}!`, '#ff6b6b'); return false; }
                    else executeProfileLink(linkId);
                }).catch((error) => {
                    if (error.code === 'PGRST116') executeProfileLink(linkId);
                    else showToast('❌ Ошибка проверки!', '#ff6b6b');
                });
        } else executeProfileLink(linkId);
        return true;
    }

    function executeProfileLink(linkId) {
        _mbProfileLink = linkId;
        saveGame(); updateProfileLinkUI();
        showToast(`✅ Профиль привязан: ${linkId}`, '#44ff44');
        document.getElementById('profileLinkModal').classList.remove('show');
        if (supabaseClient) syncToSupabase();
    }

    window.initSupabase = initSupabase;
    window.syncToSupabase = syncToSupabase;
    window.loadFromSupabase = loadFromSupabase;
    window.loadTopFromSupabase = loadTopFromSupabase;
    window.showPlayerProfile = showPlayerProfile;
    window.updateProfileLinkUI = updateProfileLinkUI;
    window.saveMbProfileLink = saveMbProfileLink;
    window.executeProfileLink = executeProfileLink;
    window.getOnlineStatus = getOnlineStatus;