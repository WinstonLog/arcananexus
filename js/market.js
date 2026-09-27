// ============================================================
// РЫНОК КАРТ
// ============================================================
let marketSellLots = [];
    let marketBuyOrders = [];
    let marketMyLots = [];
    let marketMyOrders = [];
    let marketCurrentTab = 'sell';
    let marketSubTab = 'all';
    let marketBuySubTab = 'all';
    let marketChannel = null;

    const MARKET_MAX_LOTS = 3;

    // ============================================================
    // ЗАГРУЗКА
    // ============================================================

    async function loadMarketData() {
        if (!supabaseClient) return;
        try {
            // Авто-истечение
            const now = new Date().toISOString();
            await supabaseClient.from('market_sell_lots').update({ status: 'expired' })
                .eq('status', 'active').lt('expires_at', now);
            await supabaseClient.from('market_buy_orders').update({ status: 'expired' })
                .eq('status', 'active').lt('expires_at', now);

            // Лоты
            const { data: sellLots } = await supabaseClient
                .from('market_sell_lots').select('*')
                .eq('status', 'active').gt('expires_at', now)
                .order('created_at', { ascending: false }).limit(100);

            // Заявки
            const { data: buyOrders } = await supabaseClient
                .from('market_buy_orders').select('*')
                .eq('status', 'active').gt('expires_at', now)
                .order('created_at', { ascending: false }).limit(100);

            marketSellLots = sellLots || [];
            marketBuyOrders = buyOrders || [];
            marketMyLots = marketSellLots.filter(l => l.seller_id === _playerId);
            marketMyOrders = marketBuyOrders.filter(o => o.buyer_id === _playerId);

            renderMarketStats();
            renderMarketContent();
        } catch(e) {
            console.warn('loadMarketData error:', e);
        }
    }

    // ============================================================
    // РЕНДЕР
    // ============================================================

    function renderMarketStats() {
        const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
        setEl('sellCount', marketSellLots.length);
        setEl('buyCount', marketBuyOrders.length);
        setEl('mineCount', marketMyLots.length + marketMyOrders.length);
        setEl('marketStats', `🏪 ${marketSellLots.length} лотов · 🛒 ${marketBuyOrders.length} заявок`);

        const badge = document.getElementById('marketBadge');
        if (badge) {
            const total = marketSellLots.length;
            badge.textContent = total;
            badge.style.display = total > 0 ? 'flex' : 'none';
        }
    }

    function renderMarketContent() {
        if (marketCurrentTab === 'sell') renderMarketSellLots();
        if (marketCurrentTab === 'buy') renderMarketBuyOrders();
        if (marketCurrentTab === 'mine') renderMarketMine();
    }

    function renderMarketSellLots() {
        const container = document.getElementById('marketSellList');
        if (!container) return;
        const search = (document.getElementById('marketSellSearch')?.value || '').toLowerCase().trim();

        let lots = [...marketSellLots];
        if (marketSubTab === 'affordable') {
            lots = lots.filter(l => l.seller_id !== _playerId && marketCanAfford(l.price));
        }
        if (search) {
            lots = lots.filter(l => {
                const card = getCardById(l.card_id);
                return card && card.name.toLowerCase().includes(search);
            });
        }

        if (lots.length === 0) {
            container.innerHTML = `<div class="market-empty">
                <div class="icon">🏪</div>
                <div class="title">Лотов нет</div>
                <div class="desc">${marketSubTab === 'affordable' ? 'У вас не хватает карт' : 'Попробуйте позже'}</div>
            </div>`;
            return;
        }

        container.innerHTML = lots.map(l => renderMarketSellItem(l)).join('');
    }

    function renderMarketSellItem(lot) {
        const card = getCardById(lot.card_id);
        if (!card) return '';
        const isMine = lot.seller_id === _playerId;
        const affordable = !isMine && marketCanAfford(lot.price);

        const priceTags = (lot.price || []).map(p => {
            const color = getCardColor(p.rank);
            return `<div class="market-price-tag" style="border-color:${color};color:${color};">
                <span class="r">${p.rank}</span><span class="c">×${p.count}</span>
            </div>`;
        }).join('');

        const imgPath = getCardImage(card);
        return `
            <div class="market-lot ${isMine ? 'mine' : ''}" onclick="openSellLotDetail(${lot.id})">
                <div class="market-lot-seller">
                    <div class="market-lot-avatar">${lot.seller_avatar || '🧙'}</div>
                    <div class="market-lot-seller-info">
                        <div class="market-lot-seller-name">${lot.seller_name}</div>
                        <div class="market-lot-seller-time">${marketFormatTime(lot.created_at)}</div>
                    </div>
                </div>
                <div class="market-lot-card">
                    <div class="market-lot-card-img" style="color:${card.color};border-color:${card.color};">
                        ${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
                    </div>
                    <div>
                        <div class="market-lot-card-name">${card.name}</div>
                        <div class="market-lot-card-set">${card.set}</div>
                    </div>
                </div>
                <div class="market-lot-price">
                    <span class="market-lot-price-label">Цена</span>
                    <div class="market-lot-price-tags">${priceTags}</div>
                </div>
                <div class="market-lot-action">
                    ${isMine ? `
                        <button class="market-btn cancel" onclick="event.stopPropagation(); cancelSellLot(${lot.id})">
                            🚫 Отменить
                        </button>
                    ` : `
                        <button class="market-btn buy"
                                onclick="event.stopPropagation(); buySellLot(${lot.id})"
                                ${!affordable ? 'disabled' : ''}>
                            ${affordable ? '💳 Купить' : '❌ Не хватает'}
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    function renderMarketBuyOrders() {
        const container = document.getElementById('marketBuyList');
        if (!container) return;
        const search = (document.getElementById('marketBuySearch')?.value || '').toLowerCase().trim();

        let orders = [...marketBuyOrders];
        if (marketBuySubTab === 'canFulfill') {
            orders = orders.filter(o => o.buyer_id !== _playerId && (_cardHistory.some(c => (c.cardId || c.id) === o.card_id)));
        }
        if (search) {
            orders = orders.filter(o => {
                const card = getCardById(o.card_id);
                return card && card.name.toLowerCase().includes(search);
            });
        }

        if (orders.length === 0) {
            container.innerHTML = `<div class="market-empty">
                <div class="icon">🛒</div>
                <div class="title">Заявок нет</div>
                <div class="desc">${marketBuySubTab === 'canFulfill' ? 'У вас нет нужных карт' : 'Никто не покупает'}</div>
            </div>`;
            return;
        }

        container.innerHTML = orders.map(o => renderMarketBuyItem(o)).join('');
    }

    function renderMarketBuyItem(order) {
        const card = getCardById(order.card_id);
        if (!card) return '';
        const isMine = order.buyer_id === _playerId;
        const canSell = !isMine && _cardHistory.some(c => (c.cardId || c.id) === order.card_id);

        // ===== СТРОИМ КОНКРЕТНЫЕ КАРТЫ =====
        const offerCards = order.offer_cards || [];
        const offerRanks = order.offer_ranks || [];
        let offerTags = '';

        if (offerCards.length > 0) {
            // Группируем по cardId
            const grouped = {};
            offerCards.forEach(cid => {
                grouped[cid] = (grouped[cid] || 0) + 1;
            });

            // Показываем каждую карту мини-плиткой с рангом и тултипом
            offerTags = Object.entries(grouped).map(([cardId, count]) => {
                const c = getCardById(cardId);
                if (!c) return '';
                const img = getCardImage(c);
                return `
                    <div class="market-price-tag" 
                         style="border-color:${c.color};color:${c.color};position:relative;padding:4px 8px;min-width:auto;"
                         title="${c.name} (${c.rank})">
                        <span class="r" style="font-size:14px;">${c.rank}</span>
                        ${count > 1 ? `<span class="c" style="font-size:10px;">×${count}</span>` : ''}
                    </div>
                `;
            }).join('');
        } else if (offerRanks.length > 0) {
            // Fallback для старых заявок
            offerTags = offerRanks.map(p => {
                const color = getCardColor(p.rank);
                return `<div class="market-price-tag" style="border-color:${color};color:${color};">
                    <span class="r">${p.rank}</span><span class="c">×${p.count}</span>
                </div>`;
            }).join('');
        }

        const imgPath = getCardImage(card);
        return `
            <div class="market-lot ${isMine ? 'mine' : ''}" onclick="openBuyOrderDetail(${order.id})">
                <div class="market-lot-seller">
                    <div class="market-lot-avatar">${order.buyer_avatar || '🧙'}</div>
                    <div class="market-lot-seller-info">
                        <div class="market-lot-seller-name">${order.buyer_name}</div>
                        <div class="market-lot-seller-time">${marketFormatTime(order.created_at)}</div>
                    </div>
                </div>
                <div class="market-lot-card">
                    <div class="market-lot-card-img" style="color:${card.color};border-color:${card.color};">
                        ${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
                    </div>
                    <div>
                        <div class="market-lot-card-name">${card.name}</div>
                        <div class="market-lot-card-set">${card.set}</div>
                    </div>
                </div>
                <div class="market-lot-price">
                    <span class="market-lot-price-label">Даёт</span>
                    <div class="market-lot-price-tags">${offerTags}</div>
                </div>
                <div class="market-lot-action">
                    ${isMine ? `
                        <button class="market-btn cancel" onclick="event.stopPropagation(); cancelBuyOrder(${order.id})">
                            🚫 Отменить
                        </button>
                    ` : `
                        <button class="market-btn sell"
                                onclick="event.stopPropagation(); sellToBuyOrder(${order.id})"
                                ${!canSell ? 'disabled' : ''}>
                            ${canSell ? '💰 Продать' : '❌ Нет карты'}
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    function renderMarketMine() {
        const container = document.getElementById('marketMineList');
        if (!container) return;

        const mySell = marketSellLots.filter(l => l.seller_id === _playerId);
        const myBuy = marketBuyOrders.filter(o => o.buyer_id === _playerId);

        if (mySell.length === 0 && myBuy.length === 0) {
            container.innerHTML = `<div class="market-empty">
                <div class="icon">📭</div>
                <div class="title">У вас нет активных</div>
                <div class="desc">Нажмите "➕ Выставить" внизу</div>
            </div>`;
            return;
        }

        let html = '';
        if (mySell.length > 0) {
            html += `<div style="font-size:12px;color:#8b90a8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:8px 0 4px;">💰 Мои лоты (${mySell.length})</div>`;
            html += mySell.map(l => renderMarketSellItem(l)).join('');
        }
        if (myBuy.length > 0) {
            html += `<div style="font-size:12px;color:#8b90a8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin:16px 0 4px;">🛒 Мои заявки (${myBuy.length})</div>`;
            html += myBuy.map(o => renderMarketBuyItem(o)).join('');
        }
        container.innerHTML = html;
    }

    // ============================================================
    // УТИЛИТЫ
    // ============================================================

    function marketFormatTime(ts) {
        const diff = Date.now() - new Date(ts).getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'только что';
        if (min < 60) return `${min} мин назад`;
        const h = Math.floor(min / 60);
        if (h < 24) return `${h} ч назад`;
        return `${Math.floor(h / 24)} дн назад`;
    }

    function getCardColor(rank) {
        const c = ALL_CARDS.find(x => x.rank === rank);
        return c ? c.color : '#888';
    }

    function marketCountMyCardsByRank(rank) {
        let total = 0;
        for (const item of _cardHistory) {
            const card = getCardById(item.cardId || item.id);
            if (card && card.rank === rank) total += 1;
        }
        return total;
    }

    function marketHasCard(cardId) {
        return _cardHistory.some(c => (c.cardId || c.id) === cardId);
    }

    function marketCanAfford(priceList) {
        const need = {};
        (priceList || []).forEach(p => { need[p.rank] = (need[p.rank] || 0) + p.count; });
        for (const [rank, count] of Object.entries(need)) {
            if (marketCountMyCardsByRank(rank) < count) return false;
        }
        return true;
    }

    // Списываем карты игрока (по рангам)
    function marketPayWithCards(priceList) {
        for (const p of priceList || []) {
            let remaining = p.count;
            for (let i = _cardHistory.length - 1; i >= 0 && remaining > 0; i--) {
                const card = getCardById(_cardHistory[i].cardId || _cardHistory[i].id);
                if (card && card.rank === p.rank) {
                    _cardHistory.splice(i, 1);
                    remaining--;
                }
            }
        }
    }

    // Удаляем конкретную карту из коллекции
    function marketRemoveCard(cardId) {
        const idx = _cardHistory.findIndex(c => (c.cardId || c.id) === cardId);
        if (idx !== -1) _cardHistory.splice(idx, 1);
        return idx !== -1;
    }

    // Добавляем карту
    function marketAddCard(cardId) {
        const card = getCardById(cardId);
        if (!card) return;
        _cardHistory.push({
            cardId: card.id,
            rank: card.rank,
            text: `🎴 ${card.rank} — ${card.name}`,
            uniqueId: Date.now() + '_' + Math.random().toString(36).substr(2, 6)
        });
    }

    // ============================================================
    // ДЕЙСТВИЯ
    // ============================================================

    async function buySellLot(lotId) {
        const lot = marketSellLots.find(l => l.id === lotId);
        if (!lot) return;
        if (!marketCanAfford(lot.price)) { showToast('❌ Не хватает карт', '#ff6b6b'); return; }
        if (!confirm(`Купить ${getCardById(lot.card_id)?.name}?`)) return;

        // Списываем
        marketPayWithCards(lot.price);
        // Добавляем карту
        marketAddCard(lot.card_id);
        // Обновляем БД
        await supabaseClient.from('market_sell_lots').update({
            status: 'sold', buyer_id: _playerId, buyer_name: _playerName,
            completed_at: new Date().toISOString()
        }).eq('id', lotId);
        // Уведомление продавцу
        showToast('✅ Куплено!', '#44ff44');
        saveGame(); updateUI(); renderCollection();
        addQuestProgress('market_action', 1);
        await loadMarketData();
        if (typeof closeModal === 'function') closeModal();
    }

    async function cancelSellLot(lotId) {
        const lot = marketSellLots.find(l => l.id === lotId);
        if (!lot) return;
        if (!confirm('Отменить лот?')) return;
        // Возвращаем карту
        marketAddCard(lot.card_id);
        await supabaseClient.from('market_sell_lots').update({ status: 'cancelled' }).eq('id', lotId);
        showToast('🚫 Отменено', '#ffaa88');
        saveGame(); updateUI(); renderCollection();
        await loadMarketData();
        if (typeof closeModal === 'function') closeModal();
    }

    async function sellToBuyOrder(orderId) {
        const order = marketBuyOrders.find(o => o.id === orderId);
        if (!order) { showToast('❌ Заявка не найдена', '#ff6b6b'); return; }
        
        // Проверки
        if (order.buyer_id === _playerId) { 
            showToast('❌ Это ваша заявка', '#ff6b6b'); 
            return; 
        }
        if (!marketHasCard(order.card_id)) { 
            showToast('❌ У вас нет этой карты', '#ff6b6b'); 
            return; 
        }
        
        // Проверка истечения
        if (order.expires_at && new Date(order.expires_at) < new Date()) {
            showToast('❌ Заявка истекла', '#ff6b6b');
            await supabaseClient.from('market_buy_orders')
                .update({ status: 'expired' }).eq('id', orderId);
            await loadMarketData();
            return;
        }
        
        // Подтверждение
        const card = getCardById(order.card_id);
        if (!confirm(`Продать «${card.name}» за ${(order.offer_cards || []).length} карт?`)) return;

        // Показываем загрузку
        showToast('⏳ Обмен...', '#ffaa88');

        try {
            // 1. Списываем карту у продавца
            marketRemoveCard(order.card_id);

            // 2. Забираем залог — конкретные карты из заявки
            const offerCards = order.offer_cards || [];
            for (const cardId of offerCards) {
                marketAddCard(cardId);
            }

            // 3. Обновляем заявку в БД
            const { error } = await supabaseClient
                .from('market_buy_orders')
                .update({
                    status: 'fulfilled',
                    seller_id: _playerId,
                    seller_name: _playerName,
                    completed_at: new Date().toISOString()
                })
                .eq('id', orderId);

            if (error) throw error;

            // 4. Синхронизация карт с Supabase
            saveGame();
            updateUI();
            renderCollection();
            if (typeof syncCardOwners === 'function') syncCardOwners();

            // 5. Уведомление покупателю (через отдельную таблицу notifications)
            if (supabaseClient && order.buyer_id) {
                try {
                    await supabaseClient.from('notifications').insert({
                        player_id: order.buyer_id,
                        type: 'order_fulfilled',
                        title: '🎉 Ваша заявка исполнена!',
                        message: `${_playerName} продал вам «${card.name}»`,
                        data: { order_id: orderId, card_id: order.card_id },
                        created_at: new Date().toISOString()
                    });
                } catch(e) {
                    console.warn('Уведомление не отправилось:', e);
                }
            }

            // 6. Вибрация
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

            // 7. Показываем результат
            const grouped = {};
            offerCards.forEach(cid => {
                const c = getCardById(cid);
                if (c) grouped[c.rank] = (grouped[c.rank] || 0) + 1;
            });
            const receivedStr = Object.entries(grouped)
                .map(([rank, count]) => `${rank}×${count}`)
                .join(' + ') || '—';

            showToast(`✅ Продано! Получено: ${receivedStr}`, '#44ff44');
            addQuestProgress('market_action', 1);

            await loadMarketData();
            if (typeof closeMarketModal === 'function') closeMarketModal();

        } catch(e) {
            console.error('sellToBuyOrder error:', e);
            showToast('❌ Ошибка обмена', '#ff6b6b');
            // Откатываем локальные изменения
            await loadMarketData();
            if (supabaseClient && _playerId && _playerName) {
                try {
                    const { data } = await supabaseClient.from('leaderboard')
                        .select('cards_json').eq('player_id', _playerId).single();
                    if (data && data.cards_json) {
                        _cardHistory = data.cards_json.map(c => ({
                            cardId: c.cardId || c.id,
                            rank: c.rank,
                            text: c.text || `🎴 ${c.rank}`,
                            uniqueId: c.uniqueId || Date.now()
                        }));
                        saveGame(); updateUI(); renderCollection();
                    }
                } catch(e2) { console.warn('Откат не удался:', e2); }
            }
        }
    }

    async function cancelBuyOrder(orderId) {
        const order = marketBuyOrders.find(o => o.id === orderId);
        if (!order) return;
        if (order.buyer_id !== _playerId) {
            showToast('❌ Не ваша заявка', '#ff6b6b');
            return;
        }
        if (!confirm('Отменить заявку? Карты вернутся в коллекцию.')) return;

        // Возвращаем карты
        const offerCards = order.offer_cards || [];
        for (const cardId of offerCards) {
            marketAddCard(cardId);
        }

        await supabaseClient.from('market_buy_orders').update({ status: 'cancelled' }).eq('id', orderId);
        showToast(`🚫 Заявка отменена, возвращено ${offerCards.length} карт`, '#ffaa88');

        saveGame(); updateUI(); renderCollection();
        await loadMarketData();
        if (typeof closeMarketModal === 'function') closeMarketModal();
    }

    // ============================================================
    // МОДАЛКА ДЕТАЛЕЙ
    // ============================================================

    function openSellLotDetail(lotId) {
        const lot = marketSellLots.find(l => l.id === lotId);
        if (!lot) return;
        const card = getCardById(lot.card_id);
        if (!card) return;

        const isMine = lot.seller_id === _playerId;
        const affordable = !isMine && marketCanAfford(lot.price);

        const need = {};
        (lot.price || []).forEach(p => { need[p.rank] = (need[p.rank] || 0) + p.count; });

        const checkHtml = Object.entries(need).map(([rank, count]) => {
            const have = marketCountMyCardsByRank(rank);
            const ok = have >= count;
            const color = getCardColor(rank);
            return `<div class="market-check-row">
                <span class="label"><span class="rank-mini" style="color:${color};border-color:${color};">${rank}</span>Нужно ${count} шт</span>
                <span class="value ${ok ? 'ok' : 'fail'}">${ok ? '✅' : '❌'} у вас ${have}</span>
            </div>`;
        }).join('');

        const priceHtml = (lot.price || []).map(p => {
            const color = getCardColor(p.rank);
            return `<div class="market-price-big" style="border-color:${color};color:${color};">
                <div class="rank">${p.rank}</div><div class="count">×${p.count}</div>
            </div>`;
        }).join('');

        const imgPath = getCardImage(card);
        const modal = document.getElementById('marketModal');
        modal.querySelector('.modal-title').textContent = isMine ? '👑 Ваш лот' : '🏪 Лот';
        modal.querySelector('.modal-body').innerHTML = `
            <div class="market-preview">
                <div class="market-preview-img" style="color:${card.color};border-color:${card.color};">
                    ${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
                </div>
                <div class="market-preview-info">
                    <div class="name">${card.name}</div>
                    <div class="rank-badge" style="background:${card.color}22;color:${card.color};border:1px solid ${card.color}55;">
                        ${card.rank} — ${card.rarity || ''}
                    </div>
                    <div class="set">📚 ${card.set}</div>
                    <div style="font-size:12px;color:#8b90a8;">Продавец: <b style="color:#e4e6f0;">${lot.seller_name}</b></div>
                    <div style="font-size:11px;color:#6b7084;">${marketFormatTime(lot.created_at)}</div>
                </div>
            </div>
            <div class="market-check-block">
                <div class="market-check-title">💰 Цена</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">${priceHtml}</div>
            </div>
            ${!isMine ? `
                <div class="market-check-block">
                    <div class="market-check-title">📦 Проверка ваших карт</div>
                    ${checkHtml}
                </div>
            ` : ''}
        `;
        modal.querySelector('.modal-actions').innerHTML = `
            <button class="modal-btn close" onclick="closeMarketModal()">Закрыть</button>
            ${isMine ? `
                <button class="modal-btn upgrade" style="background:linear-gradient(135deg,#ff6b6b,#ee5a24);" onclick="cancelSellLot(${lot.id})">
                    🚫 Отменить
                </button>
            ` : `
                <button class="modal-btn upgrade" onclick="buySellLot(${lot.id})" ${!affordable ? 'disabled' : ''}>
                    ${affordable ? '💳 Купить' : '❌ Не хватает'}
                </button>
            `}
        `;
        modal.classList.add('show');
    }

    function openBuyOrderDetail(orderId) {
        const order = marketBuyOrders.find(o => o.id === orderId);
        if (!order) return;
        const card = getCardById(order.card_id);
        if (!card) return;

        const isMine = order.buyer_id === _playerId;
        const canSell = !isMine && marketHasCard(order.card_id);

        // ===== СТРОИМ КОНКРЕТНЫЕ КАРТЫ =====
        const offerCards = order.offer_cards || [];
        const offerRanks = order.offer_ranks || [];
        let offerHtml = '';

        if (offerCards.length > 0) {
            // Группируем по cardId чтобы показать «R1 ×2»
            const grouped = {};
            offerCards.forEach(cid => {
                grouped[cid] = (grouped[cid] || 0) + 1;
            });

            offerHtml = Object.entries(grouped).map(([cardId, count]) => {
                const c = getCardById(cardId);
                if (!c) return '';
                const img = getCardImage(c);
                return `
                    <div style="display:flex;flex-direction:column;align-items:center;gap:4px;
                                padding:8px 6px;border-radius:12px;border:2px solid ${c.color};
                                background:rgba(0,0,0,0.3);min-width:72px;position:relative;">
                        <div style="width:52px;height:68px;border-radius:8px;
                                    display:flex;align-items:center;justify-content:center;
                                    font-size:22px;font-weight:900;color:${c.color};
                                    border:2px solid ${c.color};overflow:hidden;
                                    background:rgba(0,0,0,0.4);
                                    box-shadow:0 0 15px -5px ${c.color};">
                            ${img ? `<img src="${img}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.textContent='${c.rank}'">` : c.rank}
                        </div>
                        <div style="font-size:10px;font-weight:700;color:#e4e6f0;
                                    max-width:72px;overflow:hidden;text-overflow:ellipsis;
                                    white-space:nowrap;text-align:center;">
                            ${c.name}
                        </div>
                        <div style="font-size:9px;color:#8b90a8;text-transform:uppercase;">
                            ${c.rank}
                        </div>
                        ${count > 1 ? `
                            <div style="position:absolute;top:-6px;right:-6px;
                                background:linear-gradient(135deg,#ffcc66,#ffaa33);
                                color:#1a1a2e;font-size:10px;font-weight:900;
                                padding:2px 7px;border-radius:12px;
                                border:2px solid #0f0f1a;
                                box-shadow:0 2px 8px rgba(0,0,0,0.5);">×${count}</div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        } else if (offerRanks.length > 0) {
            // Fallback для старых заявок
            offerHtml = offerRanks.map(p => {
                const color = getCardColor(p.rank);
                return `<div class="market-price-big" style="border-color:${color};color:${color};">
                    <div class="rank">${p.rank}</div><div class="count">×${p.count}</div>
                </div>`;
            }).join('');
        } else {
            offerHtml = `<div style="color:#6b7084;font-size:12px;padding:10px;">— пусто —</div>`;
        }

        const imgPath = getCardImage(card);
        const modal = document.getElementById('marketModal');
        modal.querySelector('.modal-title').textContent = isMine ? '👑 Ваша заявка' : '🛒 Заявка';

        modal.querySelector('.modal-body').innerHTML = `
            <div class="market-preview">
                <div class="market-preview-img" style="color:${card.color};border-color:${card.color};">
                    ${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
                </div>
                <div class="market-preview-info">
                    <div style="font-size:11px;color:#6b7084;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px;">
                        ${isMine ? 'Вы хотите купить' : 'Хочет купить'}
                    </div>
                    <div class="name">${card.name}</div>
                    <div class="rank-badge" style="background:${card.color}22;color:${card.color};border:1px solid ${card.color}55;">
                        ${card.rank} — ${card.rarity || ''}
                    </div>
                    <div class="set">📚 ${card.set}</div>
                    <div style="font-size:12px;color:#8b90a8;">
                        Покупатель: <b style="color:#e4e6f0;">${isMine ? 'Вы' : order.buyer_name}</b>
                    </div>
                    <div style="font-size:11px;color:#6b7084;">${marketFormatTime(order.created_at)}</div>
                </div>
            </div>

            <div class="market-check-block">
                <div class="market-check-title">💰 Даёт за карту (${offerCards.length} шт)</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;">${offerHtml}</div>
            </div>

            ${!isMine ? `
                <div class="market-check-block">
                    <div class="market-check-title">📦 Проверка</div>
                    <div class="market-check-row">
                        <span class="label">
                            <span class="rank-mini" style="color:${card.color};border-color:${card.color};">${card.rank}</span>
                            Нужна карта «${card.name}»
                        </span>
                        <span class="value ${canSell ? 'ok' : 'fail'}">
                            ${canSell ? '✅ есть' : '❌ нет'}
                        </span>
                    </div>
                </div>
            ` : ''}
        `;

        modal.querySelector('.modal-actions').innerHTML = `
            <button class="modal-btn close" onclick="closeMarketModal()">Закрыть</button>
            ${isMine ? `
                <button class="modal-btn upgrade" style="background:linear-gradient(135deg,#ff6b6b,#ee5a24);" onclick="cancelBuyOrder(${order.id})">
                    🚫 Отменить
                </button>
            ` : `
                <button class="modal-btn upgrade" style="background:linear-gradient(135deg,#2ecc71,#27ae60);" onclick="sellToBuyOrder(${order.id})" ${!canSell ? 'disabled' : ''}>
                    ${canSell ? '💰 Продать' : '❌ Нет карты'}
                </button>
            `}
        `;
        modal.classList.add('show');
    }

    function closeMarketModal() {
        document.getElementById('marketModal').classList.remove('show');
    }

    // ============================================================
    // СОЗДАНИЕ
    // ============================================================

    let marketCreateMode = 'sell';
    let marketCreateCardId = null;
    let marketCreatePrices = [];
    let marketBuyStep = 1;
    let marketCreateOfferCards = []; 

    function openCreateMarketModal() {
        const totalActive = marketMyLots.length + marketMyOrders.length;
        if (totalActive >= MARKET_MAX_LOTS) {
            showToast(`❌ Лимит ${MARKET_MAX_LOTS} активных!`, '#ff6b6b');
            return;
        }
        marketCreateMode = 'sell';
        marketCreateCardId = null;
        marketCreatePrices = [];
        renderCreateMarketModal();
        document.getElementById('marketModal').classList.add('show');
    }

    function renderCreateMarketModal() {
        const modal = document.getElementById('marketModal');
        modal.querySelector('.modal-title').textContent = `➕ ${marketCreateMode === 'sell' ? 'Выставить карту' : 'Создать заявку'}`;

        let bodyHtml = `
            <div class="market-tabs-main" style="margin-bottom:16px;">
                <button class="market-tab-main ${marketCreateMode === 'sell' ? 'active' : ''}"
                        onclick="switchMarketCreateMode('sell')">💰 Продать</button>
                <button class="market-tab-main ${marketCreateMode === 'buy' ? 'active' : ''}"
                        onclick="switchMarketCreateMode('buy')">🛒 Купить</button>
            </div>
        `;

        if (marketCreateMode === 'buy') {
            // ===== ЗАЯВКА НА ПОКУПКУ =====
            if (marketBuyStep === 1) {
                // ШАГ 1: какую карту хотим купить
                const allCards = [...ALL_CARDS];
                const rankOrder = ['M','T','K','Y','U','Q','R','Z','O','H','N','V','L'];
                allCards.sort((a,b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));

                bodyHtml += `
                    <div class="form-hint" style="margin-bottom:12px;">
                        <b>Шаг 1 из 2.</b> Какую карту вы хотите купить?
                    </div>
                    <div class="search-bar" style="margin-bottom:12px;">
                        <input type="text" class="search-input" id="marketCreateSearch"
                               placeholder="🔍 Поиск по названию или рангу..."
                               oninput="filterMarketCreateCards()">
                    </div>
                    <div class="market-sub-tabs" style="margin-bottom:10px;" id="marketCreateRankFilter">
                        <button class="market-sub-tab active" data-crank="all" onclick="filterMarketCreateByRank('all', this)">Все</button>
                        <button class="market-sub-tab" data-crank="M" onclick="filterMarketCreateByRank('M', this)">M</button>
                        <button class="market-sub-tab" data-crank="T" onclick="filterMarketCreateByRank('T', this)">T</button>
                        <button class="market-sub-tab" data-crank="K" onclick="filterMarketCreateByRank('K', this)">K</button>
                        <button class="market-sub-tab" data-crank="Y" onclick="filterMarketCreateByRank('Y', this)">Y</button>
                        <button class="market-sub-tab" data-crank="U" onclick="filterMarketCreateByRank('U', this)">U</button>
                        <button class="market-sub-tab" data-crank="Q" onclick="filterMarketCreateByRank('Q', this)">Q</button>
                        <button class="market-sub-tab" data-crank="R" onclick="filterMarketCreateByRank('R', this)">R</button>
                        <button class="market-sub-tab" data-crank="Z" onclick="filterMarketCreateByRank('Z', this)">Z</button>
                        <button class="market-sub-tab" data-crank="O" onclick="filterMarketCreateByRank('O', this)">O</button>
                    </div>
                    <div class="market-card-grid" id="marketCreateCardsGrid">
                        ${allCards.map(card => {
                            const img = getCardImage(card);
                            const count = _cardHistory.filter(c => (c.cardId || c.id) === card.id).length;
                            return `<div class="market-select-card"
                                         style="--card-color:${card.color};"
                                         data-card-id="${card.id}"
                                         data-card-rank="${card.rank}"
                                         data-card-name="${card.name.toLowerCase()}"
                                         onclick="selectMarketCreateCard('${card.id}')">
                                <div class="c-rank">${card.rank}</div>
                                ${count > 0 ? `<div class="c-count" style="background:linear-gradient(135deg,#44ff44,#2ecc71);">✅${count}</div>` : ''}
                                <div class="c-img">${img ? `<img src="${img}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}</div>
                                <div class="c-name">${card.name}</div>
                            </div>`;
                        }).join('')}
                    </div>
                `;
            } else if (marketBuyStep === 2) {
                // ШАГ 2: какую карту(ы) отдаём
                const targetCard = getCardById(marketCreateCardId);
                const imgPath = getCardImage(targetCard);

                // Свои уникальные карты
                const uniqueMyCards = [];
                const seen = new Set();
                for (const item of _cardHistory) {
                    const cid = item.cardId || item.id;
                    if (!seen.has(cid)) {
                        seen.add(cid);
                        const card = getCardById(cid);
                        if (card) uniqueMyCards.push(card);
                    }
                }
                const rankOrder = ['M','T','K','Y','U','Q','R','Z','O','H','N','V','L'];
                uniqueMyCards.sort((a,b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));

                // Выбранная сумма
                const selectedIds = marketCreateOfferCards;
                const totalSelected = selectedIds.length;

                bodyHtml += `
                    <div class="market-preview">
                        <div class="market-preview-img" style="color:${targetCard.color};border-color:${targetCard.color};">
                            ${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${targetCard.rank}'">` : targetCard.rank}
                        </div>
                        <div class="market-preview-info">
                            <div style="font-size:11px;color:#6b7084;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px;">Вы хотите купить</div>
                            <div class="name">${targetCard.name}</div>
                            <div class="rank-badge" style="background:${targetCard.color}22;color:${targetCard.color};border:1px solid ${targetCard.color}55;">
                                ${targetCard.rank} — ${targetCard.rarity || ''}
                            </div>
                            <div class="set">📚 ${targetCard.set}</div>
                        </div>
                    </div>

                    <div class="form-hint" style="margin-bottom:12px;">
                        <b>Шаг 2 из 2.</b> Выберите карты, которые отдадите за неё.
                        Они <b>сразу спишутся</b> из коллекции и вернутся, если отмените заявку.
                    </div>

                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <span style="font-size:12px;color:#8b90a8;font-weight:700;">
                            🎴 Ваши карты (${uniqueMyCards.length})
                        </span>
                        <span style="font-size:12px;color:#b388ff;font-weight:700;">
                            Выбрано: ${totalSelected}
                        </span>
                    </div>
                `;

                if (uniqueMyCards.length === 0) {
                    bodyHtml += `<div class="market-empty">
                        <div class="icon">📭</div>
                        <div class="title">У вас нет карт</div>
                        <div class="desc">Нечего предложить</div>
                    </div>`;
                } else {
                    bodyHtml += `<div class="market-card-grid" id="marketCreateCardsGrid">`;
                    bodyHtml += uniqueMyCards.map(card => {
                        const img = getCardImage(card);
                        const count = _cardHistory.filter(c => (c.cardId || c.id) === card.id).length;
                        // Сколько уже выбрано
                        const selectedCount = selectedIds.filter(id => id === card.id).length;
                        const maxed = selectedCount >= count;

                        return `<div class="market-select-card ${selectedCount > 0 ? 'selected' : ''}"
                                     style="--card-color:${card.color};${selectedCount > 0 ? 'box-shadow:0 0 0 2px #b388ff, 0 0 20px rgba(123,77,255,0.4);' : ''}"
                                     data-card-id="${card.id}"
                                     onclick="${maxed ? '' : `toggleMarketOfferCard('${card.id}')`}"
                                     title="${maxed ? 'Все копии выбраны' : 'Выбрать'}">
                            <div class="c-rank">${card.rank}</div>
                            ${count > 1 ? `<div class="c-count">${selectedCount}/${count}</div>` : (selectedCount > 0 ? `<div class="c-count">✅</div>` : '')}
                            <div class="c-img">${img ? `<img src="${img}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}</div>
                            <div class="c-name">${card.name}</div>
                            ${selectedCount > 0 ? `<div style="position:absolute;bottom:4px;right:4px;font-size:9px;font-weight:900;color:#b388ff;">×${selectedCount}</div>` : ''}
                        </div>`;
                    }).join('');
                    bodyHtml += `</div>`;
                }

                // Показ того, что уже выбрано
                if (totalSelected > 0) {
                    const grouped = {};
                    selectedIds.forEach(id => {
                        grouped[id] = (grouped[id] || 0) + 1;
                    });
                    const tags = Object.entries(grouped).map(([id, count]) => {
                        const c = getCardById(id);
                        if (!c) return '';
                        return `<div class="market-price-tag" style="border-color:${c.color};color:${c.color};">
                            <span class="r">${c.rank}</span>
                            <span class="c">×${count}</span>
                        </div>`;
                    }).join('');

                    bodyHtml += `
                        <div class="market-check-block" style="margin-top:14px;">
                            <div class="market-check-title">💠 Вы отдаёте (${totalSelected})</div>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;">${tags}</div>
                        </div>
                    `;
                }
            }
        } else {
            // ===== ПРОДАЖА (как было) =====
            if (!marketCreateCardId) {
                // Выбор карты из коллекции
                const uniqueCards = [];
                const seen = new Set();
                for (const item of _cardHistory) {
                    const cid = item.cardId || item.id;
                    if (!seen.has(cid)) {
                        seen.add(cid);
                        const card = getCardById(cid);
                        if (card) uniqueCards.push(card);
                    }
                }
                const rankOrder = ['M','T','K','Y','U','Q','R','Z','O','H','N','V','L'];
                uniqueCards.sort((a,b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));

                bodyHtml += `<div class="form-hint" style="margin-bottom:12px;">
                    💡 Выберите карту, которую хотите продать (${uniqueCards.length} у вас).
                </div>`;

                if (uniqueCards.length === 0) {
                    bodyHtml += `<div class="market-empty">
                        <div class="icon">📭</div>
                        <div class="title">У вас нет карт</div>
                    </div>`;
                } else {
                    bodyHtml += `<div class="market-card-grid" id="marketCreateCardsGrid">`;
                    bodyHtml += uniqueCards.map(card => {
                        const img = getCardImage(card);
                        const count = _cardHistory.filter(c => (c.cardId || c.id) === card.id).length;
                        return `<div class="market-select-card"
                                     style="--card-color:${card.color};"
                                     onclick="selectMarketCreateCard('${card.id}')">
                            <div class="c-rank">${card.rank}</div>
                            ${count > 1 ? `<div class="c-count">×${count}</div>` : ''}
                            <div class="c-img">${img ? `<img src="${img}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}</div>
                            <div class="c-name">${card.name}</div>
                        </div>`;
                    }).join('');
                    bodyHtml += `</div>`;
                }
            } else {
                // Настройка цены (какие ранги хотим получить)
                const card = getCardById(marketCreateCardId);
                const imgPath = getCardImage(card);
                bodyHtml += `
                    <div class="market-preview">
                        <div class="market-preview-img" style="color:${card.color};border-color:${card.color};">
                            ${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
                        </div>
                        <div class="market-preview-info">
                            <div class="name">${card.name}</div>
                            <div class="rank-badge" style="background:${card.color}22;color:${card.color};border:1px solid ${card.color}55;">
                                ${card.rank} — ${card.rarity || ''}
                            </div>
                            <div class="set">📚 ${card.set}</div>
                        </div>
                    </div>
                    <div class="form-hint" style="margin-bottom:12px;">
                        💡 Выберите, <b>какие карты вы хотите получить</b> взамен.
                    </div>
                    <div class="market-rank-picker">
                        ${['M','T','K','Y','U','Q','R','Z','O'].map(r => {
                            const color = getCardColor(r);
                            const sel = marketCreatePrices.some(p => p.rank === r);
                            return `<div class="market-rank-opt ${sel ? 'selected' : ''}"
                                         style="color:${color};border-color:${color};"
                                         onclick="toggleMarketPriceRank('${r}')">
                                <div class="r">${r}</div>
                                <div class="lbl">${r}</div>
                            </div>`;
                        }).join('')}
                    </div>
                    ${marketCreatePrices.map((p, i) => {
                        const color = getCardColor(p.rank);
                        return `<div class="market-qty">
                            <span style="color:${color};font-weight:900;font-size:18px;width:30px;">${p.rank}</span>
                            <button onclick="changeMarketPriceCount(${i}, -1)">−</button>
                            <input type="number" value="${p.count}" min="1" max="99"
                                   onchange="setMarketPriceCount(${i}, this.value)">
                            <button onclick="changeMarketPriceCount(${i}, 1)">+</button>
                            <button class="remove" onclick="removeMarketPriceRank(${i})">✕</button>
                        </div>`;
                    }).join('')}
                `;
            }
        }

        modal.querySelector('.modal-body').innerHTML = bodyHtml;

        // Кнопки действий
        let actionsHtml = `<button class="modal-btn close" onclick="closeMarketModal()">Отмена</button>`;

        if (marketCreateMode === 'buy') {
            if (marketBuyStep === 1 && marketCreateCardId) {
                actionsHtml += `<button class="modal-btn upgrade" onclick="marketBuyNextStep()">
                    Далее →
                </button>`;
            } else if (marketBuyStep === 2) {
                actionsHtml = `<button class="modal-btn close" onclick="marketBuyBackStep()">← Назад</button>`;
                actionsHtml += `<button class="modal-btn upgrade"
                    onclick="submitMarketCreate()"
                    ${marketCreateOfferCards.length === 0 ? 'disabled' : ''}>
                    📤 Создать заявку (${marketCreateOfferCards.length})
                </button>`;
            }
        } else {
            if (marketCreateCardId) {
                actionsHtml += `<button class="modal-btn upgrade"
                    onclick="submitMarketCreate()"
                    ${marketCreatePrices.length === 0 ? 'disabled' : ''}>
                    📤 Выставить
                </button>`;
            }
        }

        modal.querySelector('.modal-actions').innerHTML = actionsHtml;
    }

    // Фильтр карт при создании заявки/лота
    let marketCreateCurrentRank = 'all';

    function filterMarketCreateByRank(rank, btn) {
        marketCreateCurrentRank = rank;
        document.querySelectorAll('#marketCreateRankFilter .market-sub-tab').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        filterMarketCreateCards();
    }

    function filterMarketCreateCards() {
        const grid = document.getElementById('marketCreateCardsGrid');
        if (!grid) return;

        const search = (document.getElementById('marketCreateSearch')?.value || '').toLowerCase().trim();
        const cards = grid.querySelectorAll('.market-select-card');

        cards.forEach(cardEl => {
            const rank = cardEl.dataset.cardRank;
            const name = cardEl.dataset.cardName;

            const matchRank = marketCreateCurrentRank === 'all' || rank === marketCreateCurrentRank;
            const matchSearch = !search || name.includes(search) || rank.toLowerCase().includes(search);

            if (matchRank && matchSearch) {
                cardEl.style.display = '';
            } else {
                cardEl.style.display = 'none';
            }
        });
    }

    function switchMarketCreateMode(mode) {
        marketCreateMode = mode;
        marketCreateCardId = null;
        marketCreatePrices = [];
        marketCreateOfferCards = [];
        marketBuyStep = 1;
        marketCreateCurrentRank = 'all';
        renderCreateMarketModal();
    }
    
    function selectMarketCreateCard(cardId) {
        marketCreateCardId = cardId;
        
        if (marketCreateMode === 'buy') {
            // Для покупки — сразу переходим на шаг 2 (выбор своих карт)
            marketBuyStep = 2;
            marketCreateOfferCards = [];
        } else {
            // Для продажи — сбрасываем цены (нужно выбрать ранги)
            marketCreatePrices = [];
        }
        
        renderCreateMarketModal();
    }

    // Переход к шагу 2 (выбор своих карт)
    function marketBuyNextStep() {
        if (!marketCreateCardId) {
            showToast('❌ Выберите карту', '#ffaa88');
            return;
        }
        marketBuyStep = 2;
        marketCreateOfferCards = [];
        renderCreateMarketModal();
    }

    // Назад к шагу 1
    function marketBuyBackStep() {
        marketBuyStep = 1;
        marketCreateOfferCards = [];
        renderCreateMarketModal();
    }

    // Переключение карты (взять/убрать)
    function toggleMarketOfferCard(cardId) {
        const count = _cardHistory.filter(c => (c.cardId || c.id) === cardId).length;
        const selectedCount = marketCreateOfferCards.filter(id => id === cardId).length;

        if (selectedCount >= count) {
            // Уже все выбраны — убираем всё
            marketCreateOfferCards = marketCreateOfferCards.filter(id => id !== cardId);
        } else {
            // Добавляем ещё одну
            marketCreateOfferCards.push(cardId);
        }
        renderCreateMarketModal();
    }

    function toggleMarketPriceRank(rank) {
        const idx = marketCreatePrices.findIndex(p => p.rank === rank);
        if (idx !== -1) marketCreatePrices.splice(idx, 1);
        else {
            if (marketCreatePrices.length >= 3) { showToast('❌ Максимум 3 ранга', '#ffaa88'); return; }
            marketCreatePrices.push({ rank, count: 1 });
        }
        renderCreateMarketModal();
    }

    function changeMarketPriceCount(i, d) {
        if (!marketCreatePrices[i]) return;
        marketCreatePrices[i].count = Math.max(1, Math.min(99, marketCreatePrices[i].count + d));
        renderCreateMarketModal();
    }

    function setMarketPriceCount(i, v) {
        if (!marketCreatePrices[i]) return;
        marketCreatePrices[i].count = Math.max(1, Math.min(99, parseInt(v) || 1));
    }

    function removeMarketPriceRank(i) {
        marketCreatePrices.splice(i, 1);
        renderCreateMarketModal();
    }

    async function submitMarketCreate() {
        if (marketCreateMode === 'sell') {
            // ===== СОЗДАНИЕ ЛОТА =====
            if (!marketCreateCardId || marketCreatePrices.length === 0) return;

            const totalActive = marketMyLots.length + marketMyOrders.length;
            if (totalActive >= MARKET_MAX_LOTS) { showToast('❌ Лимит активных', '#ff6b6b'); return; }
            if (!marketHasCard(marketCreateCardId)) { showToast('❌ Нет карты', '#ff6b6b'); return; }

            marketRemoveCard(marketCreateCardId);
            const card = getCardById(marketCreateCardId);

            await supabaseClient.from('market_sell_lots').insert({
                seller_id: _playerId,
                seller_name: _playerName,
                seller_avatar: '🧙',
                card_id: marketCreateCardId,
                price: marketCreatePrices
            });
            showToast(`✅ Лот создан: ${card.name}`, '#44ff44');
        } else {
            // ===== СОЗДАНИЕ ЗАЯВКИ =====
            if (!marketCreateCardId || marketCreateOfferCards.length === 0) return;

            const totalActive = marketMyLots.length + marketMyOrders.length;
            if (totalActive >= MARKET_MAX_LOTS) { showToast('❌ Лимит активных', '#ff6b6b'); return; }

            // Проверяем что все карты есть
            for (const cardId of marketCreateOfferCards) {
                if (!marketHasCard(cardId)) {
                    showToast('❌ Нет карты', '#ff6b6b');
                    return;
                }
            }

            // Списываем карты (по одной)
            for (const cardId of marketCreateOfferCards) {
                marketRemoveCard(cardId);
            }

            // Считаем ранги для статистики
            const rankCount = {};
            marketCreateOfferCards.forEach(id => {
                const c = getCardById(id);
                if (c) rankCount[c.rank] = (rankCount[c.rank] || 0) + 1;
            });
            const offerRanks = Object.entries(rankCount).map(([rank, count]) => ({ rank, count }));

            const targetCard = getCardById(marketCreateCardId);
            await supabaseClient.from('market_buy_orders').insert({
                buyer_id: _playerId,
                buyer_name: _playerName,
                buyer_avatar: '🧙',
                card_id: marketCreateCardId,
                offer_ranks: offerRanks,
                offer_cards: marketCreateOfferCards
            });
            showToast(`✅ Заявка создана: хочу ${targetCard.name}`, '#44ff44');
        }

        saveGame(); updateUI(); renderCollection();
        closeMarketModal();
        addQuestProgress('market_action', 1);
        marketCreateCardId = null;
        marketCreatePrices = [];
        marketCreateOfferCards = [];
        marketBuyStep = 1;
        await loadMarketData();
    }

    // ============================================================
    // ПЕРЕКЛЮЧАТЕЛИ
    // ============================================================

    document.addEventListener('click', function(e) {
        const mtab = e.target.closest('.market-tab-main');
        if (mtab && mtab.dataset.mtab) {
            document.querySelectorAll('.market-tab-main').forEach(t => t.classList.remove('active'));
            mtab.classList.add('active');
            marketCurrentTab = mtab.dataset.mtab;
            document.getElementById('market-tab-sell').style.display = marketCurrentTab === 'sell' ? 'block' : 'none';
            document.getElementById('market-tab-buy').style.display = marketCurrentTab === 'buy' ? 'block' : 'none';
            document.getElementById('market-tab-mine').style.display = marketCurrentTab === 'mine' ? 'block' : 'none';
            renderMarketContent();
        }
        const msub = e.target.closest('.market-sub-tab');
        if (msub && msub.dataset.msub) {
            document.querySelectorAll('[data-msub]').forEach(t => t.classList.remove('active'));
            msub.classList.add('active');
            marketSubTab = msub.dataset.msub;
            renderMarketSellLots();
        }
        if (msub && msub.dataset.msubBuy) {
            document.querySelectorAll('[data-msub-buy]').forEach(t => t.classList.remove('active'));
            msub.classList.add('active');
            marketBuySubTab = msub.dataset.msubBuy;
            renderMarketBuyOrders();
        }
    });

    document.addEventListener('input', function(e) {
        if (e.target.id === 'marketSellSearch') renderMarketSellLots();
        if (e.target.id === 'marketBuySearch') renderMarketBuyOrders();
    });

    // Realtime
    function subscribeToMarket() {
        if (!supabaseClient || marketChannel) return;
        marketChannel = supabaseClient.channel('market-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'market_sell_lots' }, () => loadMarketData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'market_buy_orders' }, () => loadMarketData())
            .subscribe();
    }

    function showToast(message, color = '#b388ff') {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.borderLeft = `4px solid ${color}`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2800);
    }

    function showFloatingNumber(value, x, y, isCritical = false) {
        const div = document.createElement('div');
        div.className = 'floating-number' + (isCritical ? ' critical' : '');
        div.textContent = `+${value}`;
        div.style.left = x + 'px';
        div.style.top = y + 'px';
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 1000);
    }

    function generatePlayerId() {
        return 'p_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    function copyPlayerId() {
        if (_playerId) {
            navigator.clipboard.writeText(_playerId).then(() => {
                showToast('✅ ID скопирован!', '#44ff44');
            }).catch(() => {
                const input = document.createElement('input');
                input.value = _playerId;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                input.remove();
                showToast('✅ ID скопирован!', '#44ff44');
            });
        }
    }
    window.copyPlayerId = copyPlayerId;

// ============================================================
// ТРЕЙД
// ============================================================
async function loadReceiverCards() {
        const receiverId = document.getElementById('tradeReceiverId').value.trim();
        if (!receiverId) { showToast('❌ Введите ID получателя!', '#ff6b6b'); return; }
        if (receiverId === _playerId) { showToast('❌ Нельзя с самим собой!', '#ff6b6b'); return; }
        try {
            const { data, error } = await supabaseClient.from('leaderboard').select('cards_json, username').eq('player_id', receiverId).single();
            if (error || !data) { showToast('❌ Игрок не найден!', '#ff6b6b'); return; }
            if (!data.cards_json || data.cards_json.length === 0) { showToast('❌ У игрока нет карт', '#ffaa88'); return; }
            const cardsInTrade = await getCardsInActiveTradesForPlayer(receiverId);
            receiverCardsData = data.cards_json.map(c => {
                const cardId = c.cardId || c.id || c.date;
                return { id: cardId, cardId, rank: c.rank, text: c.text || `🎴 ${c.rank}`, inTrade: cardsInTrade.has(cardId) };
            }).filter(c => !c.inTrade && c.cardId);
            if (receiverCardsData.length === 0) { showToast('❌ Нет доступных карт', '#ffaa88'); return; }
            document.getElementById('receiverLabel').innerHTML = `🎴 Карты получателя (${data.username || receiverId}):`;
            document.getElementById('receiverEmptyState').style.display = 'none';
            renderReceiverCards();
            showToast(`✅ Загружено ${receiverCardsData.length} карт`, '#44ff44');
        } catch(e) { showToast('❌ Ошибка загрузки', '#ff6b6b'); }
    }

    async function getCardsInActiveTradesForPlayer(playerId) {
        if (!supabaseClient || !playerId) return new Set();
        const cardIdsInTrade = new Set();
        try {
            const { data: trades } = await supabaseClient.from('trade_offers')
                .select('sender_cards, receiver_cards, sender_id, receiver_id, status')
                .eq('status', 'pending').or(`sender_id.eq.${playerId},receiver_id.eq.${playerId}`);
            if (trades) {
                for (const trade of trades) {
                    if (trade.sender_id === playerId && trade.sender_cards) {
                        for (const cardId of trade.sender_cards) cardIdsInTrade.add(cardId);
                    }
                    if (trade.receiver_id === playerId && trade.receiver_cards) {
                        for (const cardId of trade.receiver_cards) cardIdsInTrade.add(cardId);
                    }
                }
            }
        } catch(e) {}
        return cardIdsInTrade;
    }

    async function getCardsInActiveTrades() { return await getCardsInActiveTradesForPlayer(_playerId); }

    async function renderSenderCards() {
        const grid = document.getElementById('senderCardsGrid');
        if (!grid) return;
        if (_cardHistory.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:#6b7084;font-size:13px;">🎴 У вас нет карт</div>';
            return;
        }
        try {
            const cardsInTrade = await getCardsInActiveTrades();
            grid.innerHTML = _cardHistory.map(card => {
                const cardId = card.cardId || card.id;
                const cardData = getCardById(cardId);
                const isSelected = selectedSenderCards.includes(cardId);
                const isInTrade = cardsInTrade.has(cardId);
                const color = cardData ? cardData.color : '#6b7084';
                const name = cardData ? cardData.name : (card.rank || '?');
                const imgPath = cardData ? getCardImage(cardData) : '';
                const isDisabled = isInTrade && !isSelected;
                return `
                    <div class="card-item trade-card-select rank-${card.rank} ${isSelected ? 'selected' : ''} ${isDisabled ? 'in-trade' : ''}" 
                         onclick="${isDisabled ? '' : `toggleSenderCard('${cardId}')`}" 
                         style="min-height:110px;padding:5px 4px;cursor:${isDisabled ? 'not-allowed' : 'pointer'};">
                        <div class="card-image" style="height:65px;font-size:24px;${isDisabled ? 'filter:grayscale(1);' : ''}">
                            ${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
                        </div>
                        <div class="card-rank">${card.rank}</div>
                        <div class="card-name">${name}</div>
                        ${isSelected ? '<div style="font-size:8px;color:#44ff44;margin-top:1px;">✅ Выбрана</div>' : ''}
                        ${isDisabled ? '<div style="font-size:8px;color:#ff6b6b;margin-top:1px;">⏳ В обмене</div>' : ''}
                    </div>
                `;
            }).join('');
        } catch(e) {}
    }

    function renderReceiverCards() {
        const grid = document.getElementById('receiverCardsGrid');
        if (!grid) return;
        if (!receiverCardsData || receiverCardsData.length === 0) {
            grid.innerHTML = '';
            document.getElementById('receiverEmptyState').style.display = 'block';
            return;
        }
        document.getElementById('receiverEmptyState').style.display = 'none';
        grid.innerHTML = receiverCardsData.map(card => {
            const cardData = getCardById(card.id);
            const isSelected = selectedReceiverCards.includes(card.id);
            const color = cardData ? cardData.color : '#6b7084';
            const name = cardData ? cardData.name : card.rank;
            const imgPath = cardData ? getCardImage(cardData) : '';
            return `
                <div class="card-item trade-card-select rank-${card.rank} ${isSelected ? 'selected' : ''}" 
                     onclick="toggleReceiverCard('${card.id}')" 
                     style="min-height:110px;padding:5px 4px;cursor:pointer;">
                    <div class="card-image" style="height:65px;font-size:24px;">
                        ${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
                    </div>
                    <div class="card-rank">${card.rank}</div>
                    <div class="card-name">${name}</div>
                    ${isSelected ? '<div style="font-size:8px;color:#44ff44;margin-top:1px;">✅ Выбрана</div>' : ''}
                </div>
            `;
        }).join('');
    }

    async function toggleSenderCard(cardId) {
        const cardsInTrade = await getCardsInActiveTrades();
        if (cardsInTrade.has(cardId)) { showToast('⏳ Карта уже в обмене!', '#ffaa88'); return; }
        const index = selectedSenderCards.indexOf(cardId);
        if (index !== -1) selectedSenderCards.splice(index, 1);
        else {
            if (selectedSenderCards.length >= 9) { showToast('❌ Максимум 9 карт!', '#ffaa88'); return; }
            const hasCard = _cardHistory.some(c => (c.cardId || c.id) === cardId);
            if (!hasCard) { showToast('❌ У вас нет этой карты!', '#ff6b6b'); return; }
            selectedSenderCards.push(cardId);
        }
        document.getElementById('senderSelectedCount').textContent = `${selectedSenderCards.length}/9`;
        const infoEl = document.getElementById('senderSelectedInfo');
        if (infoEl) {
            const ranks = selectedSenderCards.map(id => { const c = getCardById(id); return c ? c.rank : '?'; });
            infoEl.textContent = ranks.length ? `Выбрано: ${ranks.join(', ')}` : '';
        }
        renderSenderCards();
    }

    function toggleReceiverCard(cardId) {
        const index = selectedReceiverCards.indexOf(cardId);
        if (index !== -1) selectedReceiverCards.splice(index, 1);
        else {
            if (selectedReceiverCards.length >= 9) { showToast('❌ Максимум 9 карт!', '#ffaa88'); return; }
            const hasCard = receiverCardsData.some(c => c.id === cardId);
            if (!hasCard) { showToast('❌ У получателя нет карты!', '#ff6b6b'); return; }
            selectedReceiverCards.push(cardId);
        }
        document.getElementById('receiverSelectedCount').textContent = `${selectedReceiverCards.length}/9`;
        renderReceiverCards();
    }

    async function createTradeOffer() {
        const receiverId = document.getElementById('tradeReceiverId').value.trim();
        if (!receiverId) { showToast('❌ Введите ID получателя!', '#ff6b6b'); return; }
        if (receiverId === _playerId) { showToast('❌ Нельзя с самим собой!', '#ff6b6b'); return; }
        if (selectedSenderCards.length === 0) { showToast('❌ Выберите свою карту!', '#ff6b6b'); return; }
        if (selectedReceiverCards.length === 0) { showToast('❌ Выберите карту получателя!', '#ff6b6b'); return; }
        for (const cardId of selectedSenderCards) {
            const hasCard = _cardHistory.some(c => (c.cardId || c.id) === cardId);
            if (!hasCard) { showToast(`❌ У вас нет карты!`, '#ff6b6b'); return; }
        }
        const { data: freshReceiverData } = await supabaseClient.from('leaderboard').select('cards_json').eq('player_id', receiverId).single();
        if (freshReceiverData && freshReceiverData.cards_json) {
            const receiverCardIds = freshReceiverData.cards_json.map(c => c.cardId || c.id);
            for (const cardId of selectedReceiverCards) {
                if (!receiverCardIds.includes(cardId)) {
                    showToast(`❌ У получателя больше нет карты!`, '#ff6b6b');
                    return;
                }
            }
        }
        try {
            const { data: existing } = await supabaseClient.from('trade_offers').select('id')
                .eq('sender_id', _playerId).eq('receiver_id', receiverId).eq('status', 'pending').maybeSingle();
            if (existing) { showToast('❌ Уже есть активное предложение!', '#ffaa88'); return; }
        } catch(e) {}
        try {
            const { error } = await supabaseClient.from('trade_offers').insert({
                sender_id: _playerId, receiver_id: receiverId,
                sender_cards: selectedSenderCards, receiver_cards: selectedReceiverCards,
                expires_at: new Date(Date.now() + 3600000).toISOString()
            });
            if (error) { showToast('❌ Ошибка: ' + error.message, '#ff6b6b'); return; }
            showToast(`✅ Предложение отправлено!`, '#44ff44');
            selectedSenderCards = [];
            selectedReceiverCards = [];
            receiverCardsData = [];
            document.getElementById('senderSelectedCount').textContent = '0/9';
            document.getElementById('receiverSelectedCount').textContent = '0/9';
            document.getElementById('receiverEmptyState').style.display = 'block';
            document.getElementById('receiverLabel').innerHTML = '🎴 Карты получателя (от 1 до 9):';
            document.getElementById('tradeReceiverId').value = '';
            renderSenderCards();
            renderReceiverCards();
            await loadTrades();
        } catch(e) { showToast('❌ Ошибка создания', '#ff6b6b'); }
    }

    async function loadTrades() {
        if (!supabaseClient || !_playerId) return;
        try {
            const { data: incoming } = await supabaseClient.from('trade_offers').select('*')
                .eq('receiver_id', _playerId).eq('status', 'pending').order('created_at', { ascending: false });
            const { data: myTrades } = await supabaseClient.from('trade_offers').select('*')
                .eq('sender_id', _playerId).order('created_at', { ascending: false }).limit(50);
            const { data: history } = await supabaseClient.from('trade_offers').select('*')
                .or(`sender_id.eq.${_playerId},receiver_id.eq.${_playerId}`)
                .in('status', ['accepted', 'rejected', 'cancelled', 'expired'])
                .order('created_at', { ascending: false }).limit(50);
            renderIncomingTrades(incoming || []);
            renderMyTrades(myTrades || []);
            renderTradeHistory(history || []);
            const badge = document.getElementById('tradeBadge');
            if (badge) {
                const count = (incoming || []).length;
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
            document.getElementById('incomingTradesCount').textContent = `${incoming?.length || 0} активных`;
            document.getElementById('myTradesCount').textContent = `${myTrades?.length || 0} всего`;
        } catch(e) {}
    }

    function renderIncomingTrades(trades) {
        const container = document.getElementById('incomingTradesList');
        if (!container) return;
        if (!trades.length) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:#6b7084;font-size:14px;">📭 Нет входящих</div>`;
            return;
        }
        container.innerHTML = trades.map(t => {
            const isExpired = new Date(t.expires_at) < new Date();
            const statusClass = isExpired ? 'expired' : 'pending';
            const statusText = isExpired ? '⏰ Истёк' : '⏳ Ожидает';
            const senderCards = (t.sender_cards || []).map(id => getCardById(id)).filter(Boolean);
            const receiverCards = (t.receiver_cards || []).map(id => getCardById(id)).filter(Boolean);
            return `
                <div class="trade-offer-item">
                    <div class="offer-header">
                        <span class="offer-player">📥 От: <strong>${t.sender_id}</strong></span>
                        <span class="offer-status ${statusClass}">${statusText}</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0;">
                        <span class="offer-cards-label">Отдаёт (${senderCards.length}):</span>
                        <div class="offer-cards">
                            ${senderCards.length ? senderCards.map(card => `
                                <div class="offer-card">
                                    ${card.image ? `<img src="${card.image}" class="card-img" onerror="this.style.display='none'">` : ''}
                                    <span class="card-rank" style="color:${card.color};">${card.rank}</span>
                                </div>
                            `).join('') : '<span style="font-size:11px;opacity:0.3;">—</span>'}
                        </div>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0;">
                        <span class="offer-cards-label">Просит (${receiverCards.length}):</span>
                        <div class="offer-cards">
                            ${receiverCards.length ? receiverCards.map(card => `
                                <div class="offer-card">
                                    ${card.image ? `<img src="${card.image}" class="card-img" onerror="this.style.display='none'">` : ''}
                                    <span class="card-rank" style="color:${card.color};">${card.rank}</span>
                                </div>
                            `).join('') : '<span style="font-size:11px;opacity:0.3;">—</span>'}
                        </div>
                    </div>
                    <div class="offer-actions">
                        ${!isExpired ? `
                            <button class="trade-btn-sm success" onclick="acceptTrade(${t.id})">✅ Принять</button>
                            <button class="trade-btn-sm danger" onclick="rejectTrade(${t.id})">❌ Отклонить</button>
                        ` : ''}
                        <span class="offer-time">${new Date(t.created_at).toLocaleString()}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderMyTrades(trades) {
        const container = document.getElementById('myTradesList');
        if (!container) return;
        if (!trades.length) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:#6b7084;font-size:14px;">📤 Нет отправленных</div>`;
            return;
        }
        container.innerHTML = trades.map(t => {
            const isExpired = new Date(t.expires_at) < new Date();
            const statusText = {
                pending: isExpired ? '⏰ Истёк' : '⏳ Ожидает',
                accepted: '✅ Принят', rejected: '❌ Отклонён',
                cancelled: '🚫 Отменён', expired: '⏰ Истёк'
            }[t.status] || t.status;
            const statusClass = t.status === 'pending' ? (isExpired ? 'expired' : 'pending') : t.status;
            const senderCards = (t.sender_cards || []).map(id => getCardById(id)).filter(Boolean);
            const receiverCards = (t.receiver_cards || []).map(id => getCardById(id)).filter(Boolean);
            return `
                <div class="trade-offer-item">
                    <div class="offer-header">
                        <span class="offer-player">📤 Кому: <strong>${t.receiver_id}</strong></span>
                        <span class="offer-status ${statusClass}">${statusText}</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:6px 0;">
                        <span class="offer-cards-label">Отдаю (${senderCards.length}):</span>
                        <div class="offer-cards">
                            ${senderCards.length ? senderCards.map(card => `
                                <div class="offer-card">
                                    ${card.image ? `<img src="${card.image}" class="card-img" onerror="this.style.display='none'">` : ''}
                                    <span class="card-rank" style="color:${card.color};">${card.rank}</span>
                                </div>
                            `).join('') : '<span style="font-size:11px;opacity:0.3;">—</span>'}
                        </div>
                    </div>
                    <div class="offer-actions">
                        ${t.status === 'pending' && !isExpired ? `<button class="trade-btn-sm danger" onclick="cancelTrade(${t.id})">🚫 Отменить</button>` : ''}
                        <span class="offer-time">${new Date(t.created_at).toLocaleString()}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderTradeHistory(trades) {
        const container = document.getElementById('tradeHistoryList');
        if (!container) return;
        if (!trades.length) {
            container.innerHTML = `<div style="text-align:center;padding:20px;color:#6b7084;font-size:14px;">📜 История пуста</div>`;
            return;
        }
        container.innerHTML = trades.map(t => {
            const statusText = { accepted: '✅ Принят', rejected: '❌ Отклонён', cancelled: '🚫 Отменён', expired: '⏰ Истёк' }[t.status] || t.status;
            const isMine = t.sender_id === _playerId;
            const senderCards = (t.sender_cards || []).map(id => getCardById(id)).filter(Boolean);
            return `
                <div class="trade-offer-item" style="opacity:0.7;">
                    <div class="offer-header">
                        <span class="offer-player">${isMine ? '📤' : '📥'} ${isMine ? 'Кому' : 'От'}: <strong>${isMine ? t.receiver_id : t.sender_id}</strong></span>
                        <span class="offer-status ${t.status}">${statusText}</span>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:4px 0;">
                        <span class="offer-cards-label">${isMine ? 'Отдал' : 'Получил'}:</span>
                        <div class="offer-cards">
                            ${senderCards.length ? senderCards.map(card => `
                                <div class="offer-card">
                                    ${card.image ? `<img src="${card.image}" class="card-img" onerror="this.style.display='none'">` : ''}
                                    <span class="card-rank" style="color:${card.color};">${card.rank}</span>
                                </div>
                            `).join('') : '<span style="font-size:11px;opacity:0.3;">—</span>'}
                        </div>
                    </div>
                    <span class="offer-time">${new Date(t.created_at).toLocaleString()}</span>
                </div>
            `;
        }).join('');
    }

    async function acceptTrade(offerId) {
        if (!confirm('Принять предложение?')) return;
        try {
            const { data: offer } = await supabaseClient.from('trade_offers').select('*').eq('id', offerId).single();
            if (!offer || offer.status !== 'pending') { showToast('❌ Не найдено', '#ff6b6b'); return; }
            if (new Date(offer.expires_at) < new Date()) {
                await supabaseClient.from('trade_offers').update({ status: 'expired' }).eq('id', offerId);
                loadTrades(); return;
            }
            const senderCardIds = offer.sender_cards || [];
            const receiverCardIds = offer.receiver_cards || [];
            const { data: senderData } = await supabaseClient.from('leaderboard').select('cards_json').eq('player_id', offer.sender_id).single();
            const { data: receiverData } = await supabaseClient.from('leaderboard').select('cards_json').eq('player_id', _playerId).single();
            let senderCards = senderData?.cards_json || [];
            let receiverCards = receiverData?.cards_json || [];
            for (const cardId of senderCardIds) {
                if (!senderCards.some(c => (c.cardId || c.id) === cardId)) { showToast('❌ У отправителя нет карты!', '#ff6b6b'); return; }
            }
            for (const cardId of receiverCardIds) {
                if (!receiverCards.some(c => (c.cardId || c.id) === cardId)) { showToast('❌ У вас нет карты!', '#ff6b6b'); return; }
            }
            for (const cardId of senderCardIds) {
                const idx = senderCards.findIndex(c => (c.cardId || c.id) === cardId);
                if (idx !== -1) senderCards.splice(idx, 1);
            }
            for (const cardId of receiverCardIds) {
                const idx = receiverCards.findIndex(c => (c.cardId || c.id) === cardId);
                if (idx !== -1) receiverCards.splice(idx, 1);
            }
            for (const cardId of senderCardIds) {
                const cd = getCardById(cardId);
                receiverCards.push({ cardId, rank: cd ? cd.rank : '?', text: `🎴 ${cd ? cd.rank : '?'}`, uniqueId: Date.now() });
            }
            for (const cardId of receiverCardIds) {
                const cd = getCardById(cardId);
                senderCards.push({ cardId, rank: cd ? cd.rank : '?', text: `🎴 ${cd ? cd.rank : '?'}`, uniqueId: Date.now() });
            }
            await supabaseClient.from('leaderboard').update({ cards_json: senderCards }).eq('player_id', offer.sender_id);
            await supabaseClient.from('leaderboard').update({ cards_json: receiverCards }).eq('player_id', _playerId);
            await supabaseClient.from('trade_offers').update({ status: 'accepted' }).eq('id', offerId);
            _cardHistory = receiverCards;
            saveGame(); updateUI();
            showToast('✅ Обмен совершён!', '#44ff44');
            setTimeout(async () => { await loadTrades(); renderSenderCards(); renderReceiverCards(); }, 500);
        } catch(e) { showToast('❌ Ошибка при обмене', '#ff6b6b'); }
    }

    async function rejectTrade(offerId) {
        if (!confirm('Отклонить?')) return;
        try {
            await supabaseClient.from('trade_offers').update({ status: 'rejected' }).eq('id', offerId);
            showToast('❌ Отклонено', '#ff6b6b');
            loadTrades();
        } catch(e) { showToast('❌ Ошибка', '#ff6b6b'); }
    }

    async function cancelTrade(offerId) {
        if (!confirm('Отменить?')) return;
        try {
            await supabaseClient.from('trade_offers').update({ status: 'cancelled' }).eq('id', offerId);
            showToast('🚫 Отменено', '#ffaa88');
            loadTrades(); renderSenderCards(); renderReceiverCards();
        } catch(e) { showToast('❌ Ошибка', '#ff6b6b'); }
    }

    function clearTradeSelection() {
        selectedSenderCards = [];
        selectedReceiverCards = [];
        receiverCardsData = [];
        document.getElementById('senderSelectedCount').textContent = '0/9';
        document.getElementById('receiverSelectedCount').textContent = '0/9';
        document.getElementById('receiverEmptyState').style.display = 'block';
        document.getElementById('receiverLabel').innerHTML = '🎴 Карты получателя (от 1 до 9):';
        document.getElementById('tradeReceiverId').value = '';
        renderSenderCards(); renderReceiverCards();
    }

    function subscribeToTrades() {
        if (!supabaseClient || !_playerId) return;
        if (tradeChannel) { try { supabaseClient.removeChannel(tradeChannel); } catch(e) {} tradeChannel = null; }
        tradeChannel = supabaseClient.channel('trade-channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trade_offers' }, (payload) => {
                const offer = payload.new;
                if (offer.receiver_id === _playerId) {
                    showToast(`📩 Новое предложение обмена!`, '#b388ff');
                    loadTrades();
                    if (navigator.vibrate) navigator.vibrate(100);
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trade_offers' }, (payload) => {
                const offer = payload.new;
                if (offer.receiver_id === _playerId || offer.sender_id === _playerId) loadTrades();
            })
            .subscribe();
    }

    window.loadMarketData = loadMarketData;
    window.renderMarketStats = renderMarketStats;
    window.renderMarketContent = renderMarketContent;
    window.renderMarketSellLots = renderMarketSellLots;
    window.renderMarketBuyOrders = renderMarketBuyOrders;
    window.renderMarketMine = renderMarketMine;
    window.marketFormatTime = marketFormatTime;
    window.getCardColor = getCardColor;
    window.marketCanAfford = marketCanAfford;
    window.marketHasCard = marketHasCard;
    window.marketCountMyCardsByRank = marketCountMyCardsByRank;
    window.buySellLot = buySellLot;
    window.cancelSellLot = cancelSellLot;
    window.sellToBuyOrder = sellToBuyOrder;
    window.cancelBuyOrder = cancelBuyOrder;
    window.openSellLotDetail = openSellLotDetail;
    window.openBuyOrderDetail = openBuyOrderDetail;
    window.closeMarketModal = closeMarketModal;
    window.openCreateMarketModal = openCreateMarketModal;
    window.renderCreateMarketModal = renderCreateMarketModal;
    window.filterMarketCreateByRank = filterMarketCreateByRank;
    window.filterMarketCreateCards = filterMarketCreateCards;
    window.switchMarketCreateMode = switchMarketCreateMode;
    window.selectMarketCreateCard = selectMarketCreateCard;
    window.marketBuyNextStep = marketBuyNextStep;
    window.marketBuyBackStep = marketBuyBackStep;
    window.toggleMarketOfferCard = toggleMarketOfferCard;
    window.toggleMarketPriceRank = toggleMarketPriceRank;
    window.changeMarketPriceCount = changeMarketPriceCount;
    window.setMarketPriceCount = setMarketPriceCount;
    window.removeMarketPriceRank = removeMarketPriceRank;
    window.submitMarketCreate = submitMarketCreate;
    window.subscribeToMarket = subscribeToMarket;

    // Трейд
    window.loadReceiverCards = loadReceiverCards;
    window.getCardsInActiveTradesForPlayer = getCardsInActiveTradesForPlayer;
    window.getCardsInActiveTrades = getCardsInActiveTrades;
    window.renderSenderCards = renderSenderCards;
    window.renderReceiverCards = renderReceiverCards;
    window.toggleSenderCard = toggleSenderCard;
    window.toggleReceiverCard = toggleReceiverCard;
    window.createTradeOffer = createTradeOffer;
    window.loadTrades = loadTrades;
    window.acceptTrade = acceptTrade;
    window.rejectTrade = rejectTrade;
    window.cancelTrade = cancelTrade;
    window.clearTradeSelection = clearTradeSelection;
    window.subscribeToTrades = subscribeToTrades;
