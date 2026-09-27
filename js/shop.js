// ============================================================
// МАГАЗИН ДОНАТА
// ============================================================
const DONATION_PACKAGES = [
        {
            id: 'small',
            icon: '💠',
            name: 'Малый',
            essence: 50,
            price: 49,
            color: '#4a9eff',
            popular: false
        },
        {
            id: 'medium',
            icon: '💠',
            name: 'Средний',
            essence: 150,
            bonusEssence: 15,   // +10% → 165
            price: 129,
            color: '#b388ff',
            popular: true
        },
        {
            id: 'large',
            icon: '💠',
            name: 'Большой',
            essence: 350,
            bonusEssence: 50,   // +15% → 400
            price: 249,
            color: '#ffcc66',
            popular: false
        },
        {
            id: 'mega',
            icon: '💠',
            name: 'Мега',
            essence: 1000,
            bonusEssence: 250,  // +25% → 1250
            price: 599,
            color: '#ff6600',
            popular: false
        }
    ];
    const YOOMONEY_WALLET = '4100119003253255'; // Твой кошелёк
    const TELEGRAM_ADMIN = 'paytopay';           // Твой Telegram без @

    let _gems = 0;
    let _donationRequests = [];

    // ===== ЗАГРУЗКА =====
    async function loadShopData() {
        if (!supabaseClient || !_playerId) return;
        
        _syncLock = true;   // ← блокируем
        try {
            const { data: profile } = await supabaseClient
                .from('leaderboard')
                .select('essence, gems')
                .eq('player_id', _playerId)
                .single();
            
            if (profile) {
                if (typeof profile.essence === 'number' && profile.essence >= 0) {
                    _essence = profile.essence;
                }
                if (typeof profile.gems === 'number' && profile.gems >= 0) {
                    _gems = profile.gems;
                }
                
                saveGame(true);
                updateUI();
            }
            
            const { data: requests } = await supabaseClient
                .from('donation_requests')
                .select('*')
                .eq('player_id', _playerId)
                .order('created_at', { ascending: false })
                .limit(20);
            
            _donationRequests = requests || [];
            renderShop();
        } catch(e) {
            console.warn('loadShopData error:', e);
        } finally {
            _syncLock = false;   // ← разблокируем
        }
    }

    // ===== РЕНДЕР =====
    function renderShop() {
        // Баланс — показываем эссенцию
        const gemsEl = document.getElementById('shopGemsDisplay');
        if (gemsEl) gemsEl.textContent = Number(_essence) || 0;
        
        // Пакеты
        const grid = document.getElementById('shopPacksGrid');
        if (grid) {
            grid.innerHTML = DONATION_PACKAGES.map(pkg => {
                const totalEssence = (Number(pkg.essence) || 0) + (Number(pkg.bonusEssence) || 0);
                const bonus = pkg.bonusEssence ? `+${pkg.bonusEssence} бонус` : '';
                return `
                    <div class="shop-pack ${pkg.popular ? 'popular' : ''}" 
                         style="--pack-color: ${pkg.color};"
                         onclick="openShopBuyModal('${pkg.id}')">
                        <span class="shop-pack-icon">${pkg.icon}</span>
                        <div class="shop-pack-name">${pkg.name}</div>
                        <div class="shop-pack-gems">${totalEssence} 💠</div>
                        <div class="shop-pack-bonus">${bonus}</div>
                        <div class="shop-pack-price">${pkg.price} ₽</div>
                        <button class="shop-pack-buy-btn">Купить</button>
                    </div>
                `;
            }).join('');
        }
        
        // Мои заявки
        const block = document.getElementById('myDonationsBlock');
        const list = document.getElementById('myDonationsList');
        if (block && list) {
            if (_donationRequests.length === 0) {
                block.style.display = 'none';
            } else {
                block.style.display = 'block';
                list.innerHTML = _donationRequests.map(req => {
                    const pkg = DONATION_PACKAGES.find(p => p.id === req.package_id);
                    
                    // ⚠️ ЗАЩИТА: читаем и package_essence, и package_gems, и пакет
                    let totalEssence = 0;
                    if (typeof req.package_essence === 'number') {
                        totalEssence = req.package_essence;
                    } else if (typeof req.package_gems === 'number') {
                        totalEssence = req.package_gems;
                    } else if (pkg && typeof pkg.essence === 'number') {
                        totalEssence = pkg.essence + (pkg.bonusEssence || 0);
                    }
                    
                    const statusText = {
                        pending: '⏳ Ожидает',
                        approved: '✅ Начислено',
                        rejected: '❌ Отклонено'
                    }[req.status] || req.status;
                    
                    return `
                        <div class="shop-request-item">
                            <div>
                                <div style="font-weight:700;font-size:13px;">
                                    ${pkg ? pkg.name : req.package_id} — ${totalEssence} 💠
                                </div>
                                <div style="font-size:11px;color:#6b7084;">
                                    ${new Date(req.created_at).toLocaleString('ru-RU')} · ${req.price_rub} ₽
                                </div>
                            </div>
                            <div class="shop-request-status ${req.status}">${statusText}</div>
                        </div>
                    `;
                }).join('');
            }
        }
    }

    // ===== МОДАЛКА ПОКУПКИ =====
    let _currentPurchase = null;

    function openShopBuyModal(pkgId) {
        const pkg = DONATION_PACKAGES.find(p => p.id === pkgId);
        if (!pkg) return;
        
        _currentPurchase = pkg;
        const totalEssence = (Number(pkg.essence) || 0) + (Number(pkg.bonusEssence) || 0);
        
        const content = document.getElementById('shopBuyContent');
        content.innerHTML = `
            <div class="shop-buy-preview">
                <span class="shop-buy-icon">${pkg.icon}</span>
                <div class="shop-buy-gems">${totalEssence} 💠</div>
                <div class="shop-buy-price">${pkg.price} ₽</div>
            </div>
            
            <div class="shop-buy-id">
                <span class="shop-buy-id-label">🆔 Ваш ID:</span>
                <span class="shop-buy-id-value" onclick="copyShopPlayerId()">
                    ${_playerId} 📋
                </span>
            </div>
            
            <div class="shop-buy-warning">
                ⚠️ <b>Важно:</b> после оплаты <b>обязательно</b> отправь чек и свой ID в Telegram 
                <a href="https://t.me/${TELEGRAM_ADMIN}" target="_blank" style="color:#ffaa33;font-weight:900;">@${TELEGRAM_ADMIN}</a>.
                Без чека алмазы не начислятся!
            </div>
        `;
        
        document.getElementById('shopBuyModal').classList.add('show');
    }

    function closeShopBuyModal() {
        document.getElementById('shopBuyModal').classList.remove('show');
        _currentPurchase = null;
    }

    function copyShopPlayerId() {
        if (!_playerId) return;
        navigator.clipboard.writeText(_playerId).then(() => {
            showToast('✅ ID скопирован!', '#44ff44');
        }).catch(() => {
            showToast('❌ Не удалось скопировать', '#ff6b6b');
        });
    }

    // ===== ПЕРЕХОД К ОПЛАТЕ =====
    async function confirmShopBuy() {
        if (!_currentPurchase) return;
        
        const pkg = _currentPurchase;
        const totalEssence = pkg.essence + (pkg.bonusEssence || 0);

        try {
            if (supabaseClient && _playerId && _playerName) {
                await supabaseClient.from('donation_requests').insert({
                    player_id: _playerId,
                    player_name: _playerName,
                    package_id: pkg.id,
                    package_essence: totalEssence,   // ← новое
                    price_rub: pkg.price,
                    status: 'pending'
                });
            }
        } catch(e) {
            console.warn('Ошибка создания заявки:', e);
        }
        
        // 2. Формируем ссылку на ЮMoney с суммой
        const yoomoneyUrl = `https://yoomoney.ru/to/${YOOMONEY_WALLET}?amount=${pkg.price}&comment=${encodeURIComponent('Эссенция ' + totalEssence + ' для ' + _playerId)}`;
        
        // 3. Открываем оплату
        window.open(yoomoneyUrl, '_blank');
        
        // 4. Показываем инструкцию
        showToast(`✅ Заявка создана! Отправь чек @${TELEGRAM_ADMIN}`, '#44ff44');
        
        closeShopBuyModal();
        
        // 5. Обновляем список заявок
        setTimeout(loadShopData, 1000);
    }

    // ============================================================
    // АВТООБНОВЛЕНИЕ БАЛАНСА АЛМАЗОВ
    // ============================================================

    let _shopAutoRefreshTimer = null;
    let _lastSeenGems = -1;

    async function refreshGemsBalance() {
        if (!supabaseClient || !_playerId) return;
        
        try {
            const { data, error } = await supabaseClient
                .from('leaderboard')
                .select('essence')
                .eq('player_id', _playerId)
                .single();
            
            if (error) return;
            
            const newEssence = data?.essence || 0;
            
            // Если баланс изменился — показываем уведомление
            if (_lastSeenGems !== -1 && newEssence > _lastSeenGems) {
                const diff = newEssence - _lastSeenGems;
                showToast(`💠 +${diff} эссенции зачислено!`, '#4a9eff');
                if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
            }
            
            _lastSeenGems = newEssence;
            
            // Обновляем UI если мы в магазине
            const gemsEl = document.getElementById('shopGemsDisplay');
            if (gemsEl) gemsEl.textContent = newEssence;
            
            // Обновляем заявки
            if (typeof loadShopData === 'function' && document.querySelector('#section-shop.active')) {
                const { data: requests } = await supabaseClient
                    .from('donation_requests')
                    .select('*')
                    .eq('player_id', _playerId)
                    .order('created_at', { ascending: false })
                    .limit(20);
                _donationRequests = requests || [];
                renderShop();
            }
        } catch(e) {
            console.warn('refreshGemsBalance error:', e);
        }
    }

    function startShopAutoRefresh() {
        if (_shopAutoRefreshTimer) clearInterval(_shopAutoRefreshTimer);
        // Каждые 30 секунд
        _shopAutoRefreshTimer = setInterval(refreshGemsBalance, 30000);
    }

    function stopShopAutoRefresh() {
        if (_shopAutoRefreshTimer) {
            clearInterval(_shopAutoRefreshTimer);
            _shopAutoRefreshTimer = null;
        }
    }

    // ============================================================
    // ЕЖЕЧАСНЫЙ БОНУС
    // ============================================================
    function canClaimHourly() {
        return (Date.now() - _lastHourlyClaim) >= HOURLY_BONUS.cooldown;
    }

    function getHourlyTimeLeft() {
        const ms = HOURLY_BONUS.cooldown - (Date.now() - _lastHourlyClaim);
        if (ms <= 0) return 'Готово!';
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function calculateStreakMultiplier() {
        if (!HOURLY_BONUS.streakBonus) return 1;
        const mult = 1 + Math.min(_hourlyStreak * 0.1, HOURLY_BONUS.maxStreakMultiplier - 1);
        return Math.min(mult, HOURLY_BONUS.maxStreakMultiplier);
    }

    function updateHourlyStreak() {
        if (_lastHourlyClaim === 0) { _hourlyStreak = 0; return; }
        if ((Date.now() - _lastHourlyClaim) > HOURLY_BONUS.cooldown * 2) _hourlyStreak = 0;
    }

    function claimHourlyBonus() {
        if (!canClaimHourly()) { showToast(`⏳ Бонус через ${getHourlyTimeLeft()}`, '#ffaa88'); return null; }
        updateHourlyStreak();
        const multiplier = calculateStreakMultiplier();
        const rewards = {
            essence: Math.floor(HOURLY_BONUS.rewards.essence * multiplier),
            ore: Math.floor(HOURLY_BONUS.rewards.ore * multiplier),
            xp: Math.floor(HOURLY_BONUS.rewards.xp * multiplier),
            multiplier: multiplier
        };
        _essence += rewards.essence;
        _ore += rewards.ore;
        addXP(rewards.xp);
        _hourlyStreak++;
        _lastHourlyClaim = Date.now();
        saveGame(); updateUI();
        const streakText = multiplier > 1 ? ` (×${multiplier.toFixed(1)} 🔥)` : '';
        showToast(`🎁 +${rewards.essence} 💠 · +${rewards.ore} ⛏️ · +${rewards.xp} XP${streakText}`, '#44ff44');
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        return rewards;
    }

    function updateHourlyBtn() {
        const btn = document.getElementById('hourlyBonusBtn');
        const text = document.getElementById('hourlyBonusText');
        if (!btn || !text) return;
        if (canClaimHourly()) {
            btn.disabled = false;
            btn.classList.add('ready');
            btn.classList.remove('cooldown');
            const mult = calculateStreakMultiplier();
            text.textContent = mult > 1 ? `×${mult.toFixed(1)} Забрать` : 'Забрать';
        } else {
            btn.disabled = true;
            btn.classList.remove('ready');
            btn.classList.add('cooldown');
            text.textContent = getHourlyTimeLeft();
        }
    }

// ============================================================
// РЕКЛАМА
// ============================================================
function openAdModal() {
        const today = new Date().toDateString();
        if (adLastWatchDate !== today) { adWatchedToday = 0; adLastWatchDate = today; }
        if (adWatchedToday >= MAX_AD_PER_DAY) { showToast('⛔ 3 рекламы в день!', '#ff6b6b'); return; }
        if (adIsActive) { showToast('⏳ Завершите просмотр!', '#ffaa88'); return; }
        adIsActive = true; adIsWatched = false; adRewardClaimed = false; adTimer = 20;
        const modal = document.getElementById('adModal');
        const placeholder = document.getElementById('adVideoPlaceholder');
        const rewardBlock = document.getElementById('adRewardBlock');
        const timerDisplay = document.getElementById('adTimerDisplay');
        const progressFill = document.getElementById('adProgressFill');
        if (modal) modal.classList.add('show');
        if (placeholder) placeholder.style.display = 'block';
        if (rewardBlock) rewardBlock.style.display = 'none';
        if (timerDisplay) timerDisplay.textContent = adTimer;
        if (progressFill) progressFill.style.width = '0%';
        if (adTimerInterval) clearInterval(adTimerInterval);
        adTimerInterval = setInterval(() => {
            adTimer--;
            const td = document.getElementById('adTimerDisplay');
            const pf = document.getElementById('adProgressFill');
            if (td) td.textContent = adTimer;
            if (pf) pf.style.width = ((20 - adTimer) / 20) * 100 + '%';
            if (adTimer <= 0) { clearInterval(adTimerInterval); adTimerInterval = null; adIsWatched = true; onAdComplete(); }
        }, 1000);
    }

    function onAdComplete() {
        adIsActive = false;
        const placeholder = document.getElementById('adVideoPlaceholder');
        const rewardBlock = document.getElementById('adRewardBlock');
        if (placeholder) placeholder.style.display = 'none';
        if (rewardBlock) rewardBlock.style.display = 'block';
    }

    function closeAd() {
        if (adTimerInterval) { clearInterval(adTimerInterval); adTimerInterval = null; }
        if (!adIsWatched && !adRewardClaimed) showToast('⏹️ Награда не получена', '#ff8888');
        adIsActive = false;
        const modal = document.getElementById('adModal');
        const placeholder = document.getElementById('adVideoPlaceholder');
        const rewardBlock = document.getElementById('adRewardBlock');
        if (modal) modal.classList.remove('show');
        if (placeholder) placeholder.style.display = 'block';
        if (rewardBlock) rewardBlock.style.display = 'none';
    }

    function claimAdReward() {
        if (adRewardClaimed) return;
        adRewardClaimed = true;
        const today = new Date().toDateString();
        adWatchedToday++;
        adLastWatchDate = today;
        _essence += AD_REWARD_ESSENCE;
        addXP(AD_REWARD_XP);
        showToast(`💠 +${AD_REWARD_ESSENCE} · ✨ +${AD_REWARD_XP} XP!`, '#44ff44');
        saveGame(); updateUI(); updateProfileUI(); updateAdUI();
        const modal = document.getElementById('adModal');
        if (modal) modal.classList.remove('show');
    }

    function updateAdUI() {
        const today = new Date().toDateString();
        if (adLastWatchDate !== today) { adWatchedToday = 0; adLastWatchDate = today; }
        const remaining = MAX_AD_PER_DAY - adWatchedToday;
        const badge = document.getElementById('adBadgeCount');
        const btn = document.getElementById('openAdBtn');
        if (remaining <= 0) { badge.textContent = '0'; btn.disabled = true; }
        else { badge.textContent = remaining; btn.disabled = false; }
    }

    window.loadShopData = loadShopData;
    window.renderShop = renderShop;
    window.openShopBuyModal = openShopBuyModal;
    window.closeShopBuyModal = closeShopBuyModal;
    window.copyShopPlayerId = copyShopPlayerId;
    window.confirmShopBuy = confirmShopBuy;
    window.refreshGemsBalance = refreshGemsBalance;
    window.startShopAutoRefresh = startShopAutoRefresh;
    window.stopShopAutoRefresh = stopShopAutoRefresh;
    window.canClaimHourly = canClaimHourly;
    window.getHourlyTimeLeft = getHourlyTimeLeft;
    window.calculateStreakMultiplier = calculateStreakMultiplier;
    window.updateHourlyStreak = updateHourlyStreak;
    window.claimHourlyBonus = claimHourlyBonus;
    window.updateHourlyBtn = updateHourlyBtn;
    window.openAdModal = openAdModal;
    window.onAdComplete = onAdComplete;
    window.closeAd = closeAd;
    window.claimAdReward = claimAdReward;
    window.updateAdUI = updateAdUI;