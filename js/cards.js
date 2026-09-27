// ============================================================
// КАРТЫ
// ============================================================
const ALL_CARDS = [
        { id: "Mmythic01", name: "Альбедо", rank: "M", color: "#ff0066", set: "Повелитель", image: "images/Mmythic01.png", rarity: "Мифическая", chance: "0.05%" },
        { id: "Mmythic02", name: "Джейн Доу", rank: "M", color: "#ff0066", set: "ZZZ", image: "images/Mmythic02.png", rarity: "Мифическая", chance: "0.05%" },
        { id: "Mmythic03", name: "Райдэн", rank: "M", color: "#ff0066", set: "Genshin Impact", image: "images/Mmythic03.png", rarity: "Мифическая", chance: "0.05%" },
        { id: "Mmythic04", name: "Ризли", rank: "M", color: "#ff0066", set: "Genshin Impact", image: "images/Mmythic04.png", rarity: "Мифическая", chance: "0.05%" },
        { id: "Mmythic05", name: "Аль-Хайтам", rank: "M", color: "#ff0066", set: "Genshin Impact", image: "images/Mmythic05.png", rarity: "Мифическая", chance: "0.05%" },
       
        { id: "Ttitan01", name: "Девушка", rank: "T", color: "#a8a8a8", set: "Титан", image: "images/Ttitan01.png", rarity: "Титановая", chance: "0.2%" },
        { id: "Ttitan02", name: "Йорха 2Б", rank: "T", color: "#a8a8a8", set: "Nier: Automata", image: "images/Ttitan02.png", rarity: "Титановая", chance: "0.2%" },
        { id: "Ttitan03", name: "Мужчина", rank: "T", color: "#a8a8a8", set: "Титан", image: "images/Ttitan03.png", rarity: "Титановая", chance: "0.2%" },
        { id: "Ttitan04", name: "Годжо Сатору", rank: "T", color: "#a8a8a8", set: "Магическая Битва", image: "images/Ttitan04.png", rarity: "Титановая", chance: "0.2%" },
        { id: "Ttitan05", name: "Сано Манджиро", rank: "T", color: "#a8a8a8", set: "Токийские Мстители", image: "images/Ttitan05.png", rarity: "Титановая", chance: "0.2%" },
        { id: "Ttitan06", name: "Флинс", rank: "T", color: "#a8a8a8", set: "Genshin Impact", image: "images/Ttitan06.png", rarity: "Титановая", chance: "0.2%" },
        { id: "Ttitan07", name: "Флинс", rank: "T", color: "#a8a8a8", set: "Genshin Impact", image: "images/Ttitan07.png", rarity: "Титановая", chance: "0.2%" },
        { id: "Ttitan08", name: "Арлекино", rank: "T", color: "#a8a8a8", set: "Genshin Impact", image: "images/Ttitan08.png", rarity: "Титановая", chance: "0.2%" },
       
        { id: "Kking01", name: "Мужчина", rank: "K", color: "#f4d03f", set: "Королевский", image: "images/Kking01.png", rarity: "Королевская", chance: "0.15%" },
        { id: "Kking02", name: "Мужчина", rank: "K", color: "#f4d03f", set: "Королевский", image: "images/Kking02.png", rarity: "Королевская", chance: "0.15%" },
        { id: "Kking03", name: "Годжо Сатору", rank: "K", color: "#f4d03f", set: "Магическая Битва", image: "images/Kking03.png", rarity: "Королевская", chance: "0.15%" },
        { id: "Kking04", name: "Чжун Ли", rank: "K", color: "#f4d03f", set: "Магическая Битва", image: "images/Kking04.png", rarity: "Королевская", chance: "0.15%" },
        
        { id: "Yyokai01", name: "Девушка", rank: "Y", color: "#2ecc71", set: "Йети", image: "images/Yyokai01.png", rarity: "Ледяная", chance: "0.3%" },
        { id: "Yyokai02", name: "Широко", rank: "Y", color: "#2ecc71", set: "Синий Архив", image: "images/Yyokai02.png", rarity: "Ледяная", chance: "0.3%" },
        { id: "Yyokai03", name: "Нанами Кенто", rank: "Y", color: "#2ecc71", set: "Магическая Битва", image: "images/Yyokai03.png", rarity: "Ледяная", chance: "0.3%" },
        { id: "Yyokai04", name: "Венти", rank: "Y", color: "#2ecc71", set: "Genshin Impact", image: "images/Yyokai04.png", rarity: "Ледяная", chance: "0.3%" },
        { id: "Yyokai05", name: "Шэнь Хэ", rank: "Y", color: "#2ecc71", set: "Genshin Impact", image: "images/Yyokai05.png", rarity: "Ледяная", chance: "0.3%" },
       
        { id: "Uultra01", name: "Девушка", rank: "U", color: "#00d4ff", set: "Ультра", image: "images/Uultra01.png", rarity: "Урановая", chance: "0.8%" },
        { id: "Uultra02", name: "Пара", rank: "U", color: "#00d4ff", set: "Ультра", image: "images/Uultra02.png", rarity: "Урановая", chance: "0.8%" },
        { id: "Uultra03", name: "Девушка", rank: "U", color: "#00d4ff", set: "Ультра", image: "images/Uultra03.png", rarity: "Урановая", chance: "0.8%" },
        { id: "Uultra04", name: "Пара", rank: "U", color: "#00d4ff", set: "Ультра", image: "images/Uultra04.png", rarity: "Урановая", chance: "0.8%" },
        { id: "Uultra05", name: "Мияби", rank: "U", color: "#00d4ff", set: "ZZZ", image: "images/Uultra05.png", rarity: "Урановая", chance: "0.8%" },
        { id: "Uultra06", name: "Аяка", rank: "U", color: "#00d4ff", set: "Genshin Impact", image: "images/Uultra06.png", rarity: "Урановая", chance: "0.8%" },
        { id: "Uultra07", name: "Фурина", rank: "U", color: "#00d4ff", set: "Genshin Impact", image: "images/Uultra07.png", rarity: "Урановая", chance: "0.8%" },
        { id: "Uultra08", name: "Кэйа", rank: "U", color: "#00d4ff", set: "Genshin Impact", image: "images/Uultra08.png", rarity: "Урановая", chance: "0.8%" },
        
        { id: "Qqueen01", name: "Девушка", rank: "Q", color: "#9b59b6", set: "Квантовый", image: "images/Qqueen01.png", rarity: "Квантовая", chance: "0.6%" },
        { id: "Qqueen02", name: "Девушка", rank: "Q", color: "#9b59b6", set: "Квантовый", image: "images/Qqueen02.png", rarity: "Квантовая", chance: "0.6%" },
        { id: "Qqueen03", name: "Сугуру Гето", rank: "Q", color: "#9b59b6", set: "Магическая Битва", image: "images/Qqueen03.png", rarity: "Квантовая", chance: "0.6%" },
        { id: "Qqueen04", name: "Мита", rank: "Q", color: "#9b59b6", set: "Квантовый", image: "images/Qqueen04.png", rarity: "Квантовая", chance: "0.6%" },
        { id: "Qqueen05", name: "Рёмэн Сукуна", rank: "Q", color: "#9b59b6", set: "Магическая Битва", image: "images/Qqueen05.png", rarity: "Квантовая", chance: "0.6%" },
        { id: "Qqueen06", name: "Изана Курокава", rank: "Q", color: "#9b59b6", set: "Токийские Мстители", image: "images/Qqueen06.png", rarity: "Квантовая", chance: "0.6%" },
        { id: "Qqueen07", name: "Скирк", rank: "Q", color: "#9b59b6", set: "Genshin Impact", image: "images/Qqueen07.png", rarity: "Квантовая", chance: "0.6%" },
        { id: "Qqueen08", name: "Яэ Мико", rank: "Q", color: "#9b59b6", set: "Genshin Impact", image: "images/Qqueen08.png", rarity: "Квантовая", chance: "0.6%" },
        
        { id: "Rrare01", name: "Девушка", rank: "R", color: "#ff6b6b", set: "Радужный", image: "images/Rrare01.png", rarity: "Радужная", chance: "0.5%" },
        { id: "Rrare02", name: "Девушка", rank: "R", color: "#ff6b6b", set: "Радужный", image: "images/Rrare02.png", rarity: "Радужная", chance: "0.5%" },
        { id: "Rrare03", name: "Арлекино", rank: "R", color: "#ff6b6b", set: "Genshin Impact", image: "images/Rrare03.png", rarity: "Радужная", chance: "0.5%" },
        { id: "Rrare04", name: "Макима", rank: "R", color: "#ff6b6b", set: "Человек Бензопила", image: "images/Rrare04.png", rarity: "Радужная", chance: "0.5%" },
        { id: "Rrare05", name: "Хуа Чэн", rank: "R", color: "#ff6b6b", set: "Благословение Небожителей", image: "images/Rrare05.png", rarity: "Радужная", chance: "0.5%" },
        { id: "Rrare06", name: "Арлекино", rank: "R", color: "#ff6b6b", set: "Genshin Impact", image: "images/Rrare06.png", rarity: "Радужная", chance: "0.5%" },
        { id: "Rrare07", name: "Арлекино", rank: "R", color: "#ff6b6b", set: "Genshin Impact", image: "images/Rrare07.png", rarity: "Радужная", chance: "0.5%" },
        { id: "Rrare08", name: "Харучиё санзу", rank: "R", color: "#ff6b6b", set: "Токийские Мстители", image: "images/Rrare08.png", rarity: "Радужная", chance: "0.5%" },
        { id: "Rrare09", name: "Дилюк", rank: "R", color: "#ff6b6b", set: "Genshin Impact", image: "images/Rrare09.png", rarity: "Радужная", chance: "0.5%" },
        
        { id: "Zzeus01", name: "Девушка", rank: "Z", color: "#d4a373", set: "Загадочный", image: "images/Zzeus01.png", rarity: "Загадочная", chance: "4%" },
        { id: "Zzeus02", name: "Пара", rank: "Z", color: "#d4a373", set: "Загадочный", image: "images/Zzeus02.png", rarity: "Загадочная", chance: "4%" },
        { id: "Zzeus03", name: "Мияби", rank: "Z", color: "#d4a373", set: "ZZZ", image: "images/Zzeus03.png", rarity: "Загадочная", chance: "4%" },
        { id: "Zzeus04", name: "Леви", rank: "Z", color: "#d4a373", set: "Атака Титанов", image: "images/Zzeus04.png", rarity: "Загадочная", chance: "4%" },
        { id: "Zzeus05", name: "Риндо Хайтани", rank: "Z", color: "#d4a373", set: "Токийские Мстители", image: "images/Zzeus05.png", rarity: "Загадочная", chance: "4%" },
        { id: "Zzeus06", name: "Фурина", rank: "Z", color: "#d4a373", set: "Genshin Impact", image: "images/Zzeus06.png", rarity: "Загадочная", chance: "4%" },
        { id: "Zzeus07", name: "Ху Тао", rank: "Z", color: "#d4a373", set: "Genshin Impact", image: "images/Zzeus07.png", rarity: "Загадочная", chance: "4%" },
        
        { id: "Oobscure01", name: "Девушка", rank: "O", color: "#2d3436", set: "Ониксовый", image: "images/Oobscure01.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure02", name: "Девушка и монстры", rank: "O", color: "#2d3436", set: "Ониксовый", image: "images/Oobscure02.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure03", name: "Широко", rank: "O", color: "#2d3436", set: "Синий Архив", image: "images/Oobscure03.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure04", name: "Пауэр", rank: "O", color: "#2d3436", set: "Человек Бензопила", image: "images/Oobscure04.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure05", name: "Попа Макимы", rank: "O", color: "#2d3436", set: "Человек Бензопила", image: "images/Oobscure05.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure06", name: "Попа Арлекины", rank: "O", color: "#2d3436", set: "Genshin Impact", image: "images/Oobscure06.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure07", name: "Гето Сугуру", rank: "O", color: "#2d3436", set: "Магическая Битва", image: "images/Oobscure07.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure08", name: "Нефер", rank: "O", color: "#2d3436", set: "Genshin Impact", image: "images/Oobscure08.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure09", name: "Дурин", rank: "O", color: "#2d3436", set: "Genshin Impact", image: "images/Oobscure09.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure10", name: "Ёимия", rank: "O", color: "#2d3436", set: "Genshin Impact", image: "images/Oobscure10.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure11", name: "Гань Юй", rank: "O", color: "#2d3436", set: "Genshin Impact", image: "images/Oobscure11.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure12", name: "Коломбина", rank: "O", color: "#2d3436", set: "Genshin Impact", image: "images/Oobscure12.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure13", name: "Нёвиллет", rank: "O", color: "#2d3436", set: "Genshin Impact", image: "images/Oobscure13.png", rarity: "Ониксовая", chance: "3%" },
        { id: "Oobscure14", name: "Нилу", rank: "O", color: "#2d3436", set: "Genshin Impact", image: "images/Oobscure14.png", rarity: "Ониксовая", chance: "3%" },

        // 🎃 ХЭЛЛОУИН (октябрь, с 25 числа) — ранг H
        { id: "Hhalloween01", name: "Тыква", rank: "H", color: "#ff6600", set: "Хэллоуин", image: "images/Hhalloween01.png", rarity: "Хэллоуинская", chance: "3%", event: "halloween", year: 2026 },

        // ❄️ ЗИМА (декабрь–февраль) — ранг N
        { id: "Nwinter01", name: "Снежинка", rank: "N", color: "#4a9eff", set: "Зима", image: "images/Nwinter01.png", rarity: "Зимняя", chance: "3%", event: "winter", year: 2026 },

        // 🌸 ВЕСНА (март–май) — ранг V
        { id: "Vspring01", name: "Цветочек", rank: "V", color: "#ff6b9d", set: "Весна", image: "images/Vspring01.png", rarity: "Весенняя", chance: "3%", event: "spring", year: 2026 },

        // ☀️ ЛЕТО (июнь–август) — ранг L
        { id: "Lsummer01", name: "Солнышко", rank: "L", color: "#ffcc00", set: "Лето", image: "images/Lsummer01.png", rarity: "Летняя", chance: "3%", event: "summer", year: 2026 },
    ];



function getCardImage(card) {
    if (card && card.image) return card.image;
    return '';
}
function getCardData(rank) { return ALL_CARDS.find(c => c.rank === rank) || null; }
function getCardById(id) { return ALL_CARDS.find(c => c.id === id) || null; }

// Загрузка одобренных кастомных карт из БД
async function loadCustomCards() {
    if (!supabaseClient) return;
    try {
        const { data } = await supabaseClient
            .from('custom_cards')
            .select('*');
        
        if (!data || data.length === 0) return;
        
        for (const c of data) {
            if (ALL_CARDS.some(x => x.id === c.id)) continue;
            ALL_CARDS.push({
                id: c.id,
                name: c.name,
                rank: c.rank,
                color: c.color,
                set: c.set_name,
                image: c.image,
                rarity: c.rarity,
                chance: c.chance,
                fromDB: true
            });
        }
        
        // Перерисовываем всё
        setTimeout(() => {
            if (typeof renderCatalog === 'function') renderCatalog();
            if (typeof renderSets === 'function') renderSets();
            if (typeof renderCollection === 'function') renderCollection();
        }, 100);
    } catch(e) {
        console.warn('loadCustomCards error:', e);
    }
}

// ============================================================
// КОЛЛЕКЦИЯ
// ============================================================
function getCollectionMap() {
        const map = new Map();
        for (const item of _cardHistory) {
            const cardId = item.cardId || item.id;
            map.set(cardId, true);
        }
        return map;
    }

    function renderCollection() {
        const grid = document.getElementById('collectionGrid');
        if (!grid) return;
        const countsById = {};
        for (const item of _cardHistory) {
            const cardId = item.cardId || item.id;
            countsById[cardId] = (countsById[cardId] || 0) + 1;
        }
        const uniqueCards = [];
        const seen = new Set();
        for (const item of _cardHistory) {
            const cardId = item.cardId || item.id;
            if (!seen.has(cardId)) {
                seen.add(cardId);
                const cardData = getCardById(cardId);
                if (cardData) uniqueCards.push({ ...cardData });
            }
        }
        let filtered = [...uniqueCards];
        if (collectionFilter !== 'all') filtered = filtered.filter(c => c.rank === collectionFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.rank.toLowerCase().includes(q));
        }
        const rankOrder = ['M', 'T', 'K', 'Y', 'U', 'Q', 'R', 'Z', 'O', 'H', 'N', 'V', 'L'];
        filtered.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));

        document.getElementById('totalCards').textContent = _cardHistory.length;
        document.getElementById('totalRanks').textContent = uniqueCards.length;
        document.getElementById('rareCards').textContent = _cardHistory.filter(item => {
            const cardId = item.cardId || item.id;
            const card = getCardById(cardId);
            return card && ['M', 'K', 'T', 'Y'].includes(card.rank);
        }).length;
        document.getElementById('collectionTotal').textContent = _cardHistory.length + ' карт';

        if (filtered.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#6b7084;"><div style="font-size:48px;margin-bottom:8px;">🎴</div><div style="font-size:17px;font-weight:700;">Коллекция пуста</div></div>`;
            return;
        }
        grid.innerHTML = filtered.map(card => {
            const imgPath = getCardImage(card);
            const count = countsById[card.id] || 1;
            return `
                <div class="card-item rank-${card.rank}" onclick="openCardModal('${card.id}')">
                    ${getStarsHtml(card.rank)}
                    <div class="card-image"> ${imgPath ? `<img src="${imgPath}" loading="lazy" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}</div>
                    <div class="card-rank">${card.rank}</div>
                    ${count > 1 ? `<div class="card-count">${count}</div>` : ''}
                    <div class="card-name">${card.name}</div>
                    <div class="card-rarity">${card.set || 'Коллекция'}</div>
                </div>
            `;
        }).join('');
    }

    function renderCatalog() {
        const grid = document.getElementById('catalogGrid');
        const collectionMap = getCollectionMap();
        let cards = [...ALL_CARDS];
        if (catalogFilter !== 'all') cards = cards.filter(c => c.rank === catalogFilter);
        const rankOrder = ['M', 'T', 'K', 'Y', 'U', 'Q', 'R', 'Z', 'O', 'H', 'N', 'V', 'L'];
        cards.sort((a, b) => rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank));
        document.getElementById('catalogTotal').textContent = cards.length + ' карт';
        if (cards.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;">📚 Нет карт</div>`;
            return;
        }
        grid.innerHTML = cards.map(card => {
            const isOwned = collectionMap.has(card.id);
            const imgPath = getCardImage(card);
            return `
                <div class="card-item rank-${card.rank}" onclick="openCardModal('${card.id}')">
                    ${getStarsHtml(card.rank)}
                    <div class="card-image">${imgPath ? `<img src="${imgPath}" loading="lazy" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}</div>
                    <div class="card-rank">${card.rank}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-rarity">${isOwned ? '✅ В коллекции' : '❌ Не собрана'}</div>
                </div>
            `;
        }).join('');
    }

    function renderSets() {
        const grid = document.getElementById('setsGrid');
        const setsMap = new Map();
        for (const card of ALL_CARDS) {
            const setName = card.set || 'Без сета';
            if (!setsMap.has(setName)) setsMap.set(setName, { name: setName, cards: [] });
            setsMap.get(setName).cards.push(card);
        }
        const collectionMap = getCollectionMap();
        let html = '';
        for (const [setName, setData] of setsMap) {
            const totalCards = setData.cards.length;
            const ownedCards = setData.cards.filter(c => collectionMap.has(c.id)).length;
            const progress = totalCards > 0 ? (ownedCards / totalCards) * 100 : 0;
            const previewRanks = setData.cards.slice(0, 6).map(c => `<span class="preview-rank" style="color:${c.color};border-color:${c.color}44;">${c.rank}</span>`).join('');
            const moreCount = setData.cards.length > 6 ? `+${setData.cards.length - 6}` : '';
            html += `
                <div class="set-card" onclick="showSetCards('${setName}')">
                    <div class="set-name">${setName}</div>
                    <div class="set-count">${ownedCards}/${totalCards} карт</div>
                    <div class="set-cards-preview">${previewRanks}${moreCount ? `<span class="preview-rank" style="opacity:0.3;">${moreCount}</span>` : ''}</div>
                    <div class="set-progress"><div class="progress-fill" style="width:${progress}%;"></div></div>
                </div>
            `;
        }
        grid.innerHTML = html || '<div style="text-align:center;padding:40px;">📦 Нет сетов</div>';
    }

    function showSetCards(setName) {
        const cards = ALL_CARDS.filter(c => c.set === setName);
        if (cards.length === 0) { showToast('❌ Нет карт', '#ff6b6b'); return; }
        const collectionMap = getCollectionMap();
        const counts = {};
        for (const item of _cardHistory) {
            const card = getCardById(item.cardId || item.id);
            if (card && card.set === setName) counts[card.rank] = (counts[card.rank] || 0) + 1;
        }
        const existingModal = document.getElementById('setModal');
        if (existingModal) existingModal.remove();
        let cardsHtml = cards.map(card => {
            const isOwned = collectionMap.has(card.id);
            const count = counts[card.rank] || 0;
            const imgPath = getCardImage(card);
            return `
                <div class="card-item rank-${card.rank}" onclick="openCardModal('${card.id}')" style="min-height:140px;padding:12px 8px;cursor:pointer;">
                    <div class="card-image" style="height:70px;font-size:22px;">
                        ${imgPath ? `<img src="${imgPath}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
                    </div>
                    <div class="card-rank">${card.rank}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-rarity">${isOwned ? `✅ ${count} шт.` : '❌ Не собрана'}</div>
                </div>
            `;
        }).join('');
        const modalHtml = `
            <div class="modal-overlay show" id="setModal" style="display:flex;">
                <div class="modal-content" style="max-width:560px;">
                    <button class="modal-close" onclick="document.getElementById('setModal').remove()">&times;</button>
                    <div class="modal-title">📦 ${setName}</div>
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:10px;">${cardsHtml}</div>
                    <div class="modal-buttons" style="margin-top:12px;">
                        <button class="modal-btn close" onclick="document.getElementById('setModal').remove()">Закрыть</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('setModal').addEventListener('click', function(e) { if (e.target === this) this.remove(); });
    }

    async function openCardModal(cardId) {
        const card = getCardById(cardId);
        if (!card) {
            showToast('❌ Карта не найдена', '#ff6b6b');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.style.display = 'flex';
        modal.id = 'cardInfoModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <button class="modal-close" onclick="document.getElementById('cardInfoModal').remove()">&times;</button>
                <div class="modal-title" style="color:${card.color};">${card.rank} — ${card.name}</div>
                
                <div style="text-align:center;font-size:48px;padding:12px 0;">
                    ${card.image ? `<img src="${card.image}" alt="${card.name}" style="max-width:150px;border-radius:12px;" onerror="this.style.display='none';this.parentElement.textContent='${card.rank}'">` : card.rank}
                </div>
                
                <div class="stat-row"><span class="label">Ранг</span><span class="value" style="color:${card.color};">${card.rank}</span></div>
                <div class="stat-row"><span class="label">Сет</span><span class="value">${card.set}</span></div>
                <div class="stat-row"><span class="label">Редкость</span><span class="value" style="color:${card.color};">${card.rarity}</span></div>
                <div class="stat-row"><span class="label">Шанс выпадения</span><span class="value">${card.chance}</span></div>
                
                <!-- ===== У КОГО ЕСТЬ КАРТА ===== -->
                <div style="margin-top: 16px; background: rgba(0,0,0,0.2); border-radius: 16px; padding: 12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                        <span style="font-weight: 700; font-size: 14px; color: #b388ff;">👥 У кого есть</span>
                        <span id="cardOwnersCount" style="font-size: 12px; color: #6b7084;">Загрузка...</span>
                    </div>
                    <div id="cardOwnersList" style="display:flex; flex-wrap:wrap; gap:6px; max-height: 150px; overflow-y:auto; padding-right: 4px;"></div>
                </div>
                
                <!-- ===== КОММЕНТАРИИ ===== -->
                <div style="margin-top: 16px; background: rgba(0,0,0,0.2); border-radius: 16px; padding: 12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                        <span style="font-weight: 700; font-size: 14px; color: #b388ff;">💬 Комментарии</span>
                        <span id="cardCommentsCount" style="font-size: 12px; color: #6b7084;">0</span>
                    </div>
                    
                    <!-- Форма отправки -->
                    <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                        <input type="text" id="commentInput" placeholder="Написать комментарий..." maxlength="200"
                            style="flex:1; padding: 8px 12px; border-radius: 20px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06); color: #e4e6f0; font-size: 12px; outline: none;">
                        <button onclick="sendCardComment('${card.id}')" 
                            style="padding: 8px 16px; border-radius: 20px; border: none; background: linear-gradient(135deg, #b388ff, #7c4dff); color: #fff; font-weight: 700; font-size: 12px; cursor: pointer;">
                            ➤
                        </button>
                    </div>
                    
                    <!-- Список комментариев -->
                    <div id="cardCommentsList" style="max-height: 250px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;">
                        <div style="text-align: center; opacity: 0.4; font-size: 12px; padding: 10px;">Загрузка...</div>
                    </div>
                </div>
                
                <div class="modal-buttons" style="margin-top: 12px;">
                    <button class="modal-btn close" onclick="document.getElementById('cardInfoModal').remove()">Закрыть</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', function(e) { if (e.target === this) this.remove(); });
        
        // ===== ЗАГРУЖАЕМ ВЛАДЕЛЬЦЕВ И КОММЕНТАРИИ =====
        loadCardOwners(card.id);
        loadCardComments(card.id);
    }

    // ===== У КОГО ЕСТЬ КАРТА =====
    async function loadCardOwners(cardId) {
        const listEl = document.getElementById('cardOwnersList');
        const countEl = document.getElementById('cardOwnersCount');
        if (!listEl || !supabaseClient) return;
        
        try {
            // Загружаем всех владельцев, отсортированных по дате (старые сверху)
            const { data, error } = await supabaseClient
                .from('card_owners')
                .select('player_id, username, obtained_at, is_first')
                .eq('card_id', cardId)
                .order('obtained_at', { ascending: true })
                .limit(100);
            
            if (error) throw error;
            
            if (!data || data.length === 0) {
                listEl.innerHTML = '<div style="text-align:center; opacity:0.4; font-size:12px; padding:10px; width:100%;">Ни у кого нет этой карты</div>';
                countEl.textContent = '0';
                return;
            }
            
            countEl.textContent = `${data.length} игрок${data.length === 1 ? '' : (data.length < 5 ? 'а' : 'ов')}`;
            
            const card = getCardById(cardId);
            const color = card ? card.color : '#b388ff';
            
            // Разделяем: первый владелец + остальные (свежие сверху)
            const firstOwner = data.find(p => p.is_first) || data[0];
            const otherOwners = data
                .filter(p => p !== firstOwner)
                .sort((a, b) => new Date(b.obtained_at) - new Date(a.obtained_at)); // свежие сверху
            
            let html = '';
            
            // ===== ТОП-1 (золотая рамка) =====
            if (firstOwner) {
                const isMe = firstOwner.player_id === _playerId;
                const date = new Date(firstOwner.obtained_at).toLocaleDateString('ru-RU');
                html += `
                    <div style="width: 100%; margin-bottom: 8px;"
                         onclick="showPlayerProfileModal('${firstOwner.player_id}', '${(firstOwner.username || 'Игрок').replace(/'/g, '\\\'')}')">
                        <div style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; 
                                    border-radius: 14px; cursor: pointer;
                                    background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,170,0,0.08));
                                    border: 2px solid #FFD700;
                                    box-shadow: 0 0 20px rgba(255,215,0,0.15);">
                            <div style="font-size: 24px;">🥇</div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="font-weight: 800; font-size: 13px; color: #FFD700; 
                                            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${isMe ? '👑 ' : ''}${(firstOwner.username || 'Игрок').slice(0, 20)}
                                </div>
                                <div style="font-size: 10px; opacity: 0.6; color: #FFD700;">
                                    🌟 Первый получил · ${date}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            // ===== Заголовок "Последние получившие" =====
            if (otherOwners.length > 0) {
                html += `<div style="width: 100%; font-size: 10px; opacity: 0.4; margin: 4px 0 6px; text-align: center;">
                    🆕 Последние получившие (${otherOwners.length})
                </div>`;
            }
            
            // ===== Остальные владельцы (свежие сверху) =====
            html += otherOwners.map(player => {
                const isMe = player.player_id === _playerId;
                const date = new Date(player.obtained_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
                return `
                    <div style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; 
                                background: ${isMe ? 'rgba(179,136,255,0.15)' : 'rgba(0,0,0,0.3)'}; 
                                border: 1px solid ${isMe ? color + '44' : 'rgba(255,255,255,0.05)'};
                                font-size: 11px; cursor: pointer;"
                         onclick="showPlayerProfileModal('${player.player_id}', '${(player.username || 'Игрок').replace(/'/g, '\\\'')}')">
                        <span>${isMe ? '👑' : '👤'}</span>
                        <span style="color: ${isMe ? color : '#e4e6f0'}; font-weight: ${isMe ? '700' : '400'};">
                            ${(player.username || 'Игрок').slice(0, 15)}
                        </span>
                        <span style="font-size: 9px; opacity: 0.4;">${date}</span>
                    </div>
                `;
            }).join('');
            
            listEl.innerHTML = html;
            
        } catch(e) {
            console.warn('loadCardOwners error:', e);
            listEl.innerHTML = '<div style="text-align:center; opacity:0.4; font-size:12px; padding:10px;">Ошибка загрузки</div>';
        }
    }

    // ===== СИНХРОНИЗАЦИЯ ВСЕХ ВЛАДЕЛЬЦЕВ =====
    async function syncCardOwners() {
        if (!supabaseClient || !_playerId || !_playerName || _cardHistory.length === 0) return;
        
        try {
            // Уникальные cardId в коллекции
            const uniqueCardIds = [...new Set(_cardHistory.map(c => c.cardId || c.id).filter(Boolean))];
            
            const rows = uniqueCardIds.map(cardId => ({
                card_id: cardId,
                player_id: _playerId,
                username: _playerName
            }));
            
            await supabaseClient.from('card_owners').upsert(rows, {
                onConflict: 'card_id,player_id'
            });
            
            console.log(`✅ Синхронизировано ${rows.length} карт в card_owners`);
        } catch(e) {
            console.warn('syncCardOwners error:', e);
        }
    }

    // ===== КОММЕНТАРИИ =====
    async function loadCardComments(cardId) {
        const listEl = document.getElementById('cardCommentsList');
        const countEl = document.getElementById('cardCommentsCount');
        if (!listEl || !supabaseClient) return;
        
        try {
            // Загружаем ВСЕ комментарии (и корневые, и ответы)
            const { data: comments, error } = await supabaseClient
                .from('card_comments')
                .select('*')
                .eq('card_id', cardId)
                .order('created_at', { ascending: true })
                .limit(200);
            
            if (error) throw error;
            
            if (!comments || comments.length === 0) {
                countEl.textContent = '0';
                listEl.innerHTML = '<div style="text-align:center; opacity:0.4; font-size:12px; padding:10px;">Комментариев пока нет. Будь первым!</div>';
                return;
            }
            
            // Загружаем лайки
            const commentIds = comments.map(c => c.id);
            const { data: likes } = await supabaseClient
                .from('comment_likes')
                .select('comment_id, player_id')
                .in('comment_id', commentIds);
            
            // Считаем лайки и кто лайкнул
            const likesByComment = {};
            (likes || []).forEach(l => {
                if (!likesByComment[l.comment_id]) likesByComment[l.comment_id] = [];
                likesByComment[l.comment_id].push(l.player_id);
            });
            
            // Строим дерево: корневые + ответы
            const rootComments = comments.filter(c => !c.parent_id);
            const repliesByParent = {};
            comments.filter(c => c.parent_id).forEach(c => {
                if (!repliesByParent[c.parent_id]) repliesByParent[c.parent_id] = [];
                repliesByParent[c.parent_id].push(c);
            });
            
            // Сортируем корневые: свежие сверху
            rootComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            countEl.textContent = comments.length;
            
            // Рендерим каждый корневой комментарий
            listEl.innerHTML = rootComments.map(c => renderComment(c, likesByComment, repliesByParent, cardId)).join('');
            
        } catch(e) {
            console.warn('loadCardComments error:', e);
            listEl.innerHTML = '<div style="text-align:center; opacity:0.4; font-size:12px; padding:10px;">Ошибка загрузки</div>';
        }
    }

    // ===== РЕНДЕР ОДНОГО КОММЕНТАРИЯ =====
    function renderComment(c, likesByComment, repliesByParent, cardId, isReply = false) {
        const isMe = c.player_id === _playerId;
        const likes = likesByComment[c.id] || [];
        const isLiked = likes.includes(_playerId);
        const likeCount = likes.length;
        
        const time = new Date(c.created_at).toLocaleString('ru-RU', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
        
        const replies = repliesByParent[c.id] || [];
        
        // Если лайков >= 5 — показываем огонёк
        const isHot = likeCount >= 5;
        
        let html = `
            <div style="background: ${isMe ? 'rgba(179,136,255,0.08)' : 'rgba(255,255,255,0.03)'}; 
                        border-radius: 12px; padding: 8px 10px; margin-left: ${isReply ? '24px' : '0'};
                        border-left: 3px solid ${isMe ? '#b388ff' : (isHot ? '#ff6600' : '#6b7084')};
                        ${isReply ? 'margin-top: 6px;' : ''}">
                
                <!-- Заголовок: имя + время -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 3px;">
                    <span style="font-weight: 700; font-size: 11px; color: ${isMe ? '#b388ff' : '#e4e6f0'};">
                        ${isMe ? '👑 ' : ''}${(c.username || 'Аноним').slice(0, 20)}
                        ${isHot ? ' 🔥' : ''}
                    </span>
                    <span style="font-size: 9px; opacity: 0.4;">${time}</span>
                </div>
                
                <!-- Текст -->
                <div style="font-size: 12px; color: #e4e6f0; word-break: break-word; margin-bottom: 6px;">
                    ${escapeHtml(c.text)}
                </div>
                
                <!-- Кнопки: лайк, ответ, жалоба -->
                <div style="display: flex; gap: 8px; align-items: center; font-size: 11px;">
                    <button onclick="toggleCommentLike(${c.id}, '${cardId}')" 
                        style="background: ${isLiked ? 'rgba(255,68,68,0.15)' : 'transparent'};
                               border: 1px solid ${isLiked ? 'rgba(255,68,68,0.3)' : 'rgba(255,255,255,0.08)'};
                               color: ${isLiked ? '#ff6b6b' : '#6b7084'};
                               padding: 3px 10px; border-radius: 20px; cursor: pointer; font-size: 11px; font-weight: 600;">
                        ${isLiked ? '❤️' : '🤍'} ${likeCount > 0 ? likeCount : ''}
                    </button>
                    
                    ${!isReply ? `
                        <button onclick="toggleReplyForm(${c.id})" 
                            style="background: transparent; border: 1px solid rgba(255,255,255,0.08);
                                   color: #6b7084; padding: 3px 10px; border-radius: 20px; cursor: pointer; font-size: 11px; font-weight: 600;">
                            💬 Ответить${replies.length > 0 ? ` (${replies.length})` : ''}
                        </button>
                    ` : ''}
                    
                    ${!isMe ? `
                        <button onclick="reportComment(${c.id})" 
                            style="background: transparent; border: none; color: #6b7084; opacity: 0.4;
                                   cursor: pointer; font-size: 10px; margin-left: auto;">
                            ⚠️
                        </button>
                    ` : ''}
                </div>
                
                <!-- Форма ответа (скрыта) -->
                ${!isReply ? `
                    <div id="replyForm-${c.id}" style="display: none; margin-top: 6px; gap: 6px; display: none;">
                        <input type="text" id="replyInput-${c.id}" placeholder="Ответить..." maxlength="200"
                            style="width: 100%; padding: 6px 10px; border-radius: 16px; 
                                   background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); 
                                   color: #e4e6f0; font-size: 11px; outline: none; box-sizing: border-box;">
                        <button onclick="sendReply(${c.id}, '${cardId}')"
                            style="margin-top: 4px; width: 100%; padding: 6px; border-radius: 16px; border: none;
                                   background: linear-gradient(135deg, #b388ff, #7c4dff); color: #fff; 
                                   font-weight: 700; font-size: 11px; cursor: pointer;">
                            Отправить
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Рендерим ответы
        if (replies.length > 0) {
            replies.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            html += replies.map(r => renderComment(r, likesByComment, {}, cardId, true)).join('');
        }
        
        return html;
    }

    // ===== ОТПРАВКА КОММЕНТАРИЯ =====
    async function sendCardComment(cardId) {
        const input = document.getElementById('commentInput');
        const text = input.value.trim();
        
        if (!text) {
            showToast('❌ Введите текст комментария', '#ff6b6b');
            return;
        }
        
        if (text.length < 2) {
            showToast('❌ Минимум 2 символа', '#ff6b6b');
            return;
        }
        
        if (!_playerName) {
            showToast('❌ Сначала введите имя!', '#ff6b6b');
            return;
        }
        
        if (!supabaseClient) {
            showToast('⚠️ Нет подключения', '#ffaa88');
            return;
        }
        
        input.disabled = true;
        
        try {
            const { error } = await supabaseClient.from('card_comments').insert({
                card_id: cardId,
                player_id: _playerId,
                username: _playerName,
                text: text
            });
            
            if (error) throw error;
            
            input.value = '';
            showToast('✅ Комментарий добавлен', '#44ff44');
            
            loadCardComments(cardId);
            
        } catch(e) {
            console.warn('sendCardComment error:', e);
            showToast('❌ Ошибка отправки', '#ff6b6b');
        } finally {
            input.disabled = false;
            input.focus();
        }
    }

    async function toggleCommentLike(commentId, cardId) {
        if (!supabaseClient || !_playerId) return;
        
        try {
            // Проверяем, лайкнул ли уже
            const { data: existing } = await supabaseClient
                .from('comment_likes')
                .select('id')
                .eq('comment_id', commentId)
                .eq('player_id', _playerId)
                .maybeSingle();
            
            if (existing) {
                // Убираем лайк
                await supabaseClient.from('comment_likes').delete().eq('id', existing.id);
            } else {
                // Ставим лайк
                await supabaseClient.from('comment_likes').insert({
                    comment_id: commentId,
                    player_id: _playerId
                });
            }
            
            // Перезагружаем комментарии
            loadCardComments(cardId);
            
        } catch(e) {
            console.warn('toggleCommentLike error:', e);
            showToast('❌ Ошибка лайка', '#ff6b6b');
        }
    }

    // ===== ПОКАЗАТЬ/СКРЫТЬ ФОРМУ ОТВЕТА =====
    function toggleReplyForm(commentId) {
        const form = document.getElementById(`replyForm-${commentId}`);
        if (!form) return;
        
        if (form.style.display === 'none' || !form.style.display) {
            form.style.display = 'block';
            const input = document.getElementById(`replyInput-${commentId}`);
            if (input) input.focus();
        } else {
            form.style.display = 'none';
        }
    }

    // ===== ОТПРАВКА ОТВЕТА =====
    async function sendReply(parentId, cardId) {
        const input = document.getElementById(`replyInput-${parentId}`);
        const text = input.value.trim();
        
        if (!text || text.length < 2) {
            showToast('❌ Минимум 2 символа', '#ff6b6b');
            return;
        }
        
        if (!_playerName) {
            showToast('❌ Сначала введите имя!', '#ff6b6b');
            return;
        }
        
        input.disabled = true;
        
        try {
            await supabaseClient.from('card_comments').insert({
                card_id: cardId,
                player_id: _playerId,
                username: _playerName,
                text: text,
                parent_id: parentId
            });
            
            showToast('✅ Ответ отправлен', '#44ff44');
            loadCardComments(cardId);
            
        } catch(e) {
            console.warn('sendReply error:', e);
            showToast('❌ Ошибка отправки', '#ff6b6b');
        } finally {
            input.disabled = false;
        }
    }

    // ===== ЖАЛОБА НА КОММЕНТАРИЙ =====
    async function reportComment(commentId) {
        if (!supabaseClient || !_playerId) return;
        
        const reasons = ['Спам', 'Оскорбления', 'Реклама', 'Другое'];
        const reasonText = prompt(
            '⚠️ Причина жалобы:\n\n1 — Спам\n2 — Оскорбления\n3 — Реклама\n4 — Другое\n\nВведите номер:',
            '1'
        );
        
        if (!reasonText) return;
        
        const idx = parseInt(reasonText) - 1;
        if (idx < 0 || idx >= reasons.length) {
            showToast('❌ Неверный выбор', '#ff6b6b');
            return;
        }
        
        const reason = reasons[idx];
        
        try {
            // Проверяем, не жаловался ли уже
            const { data: existing } = await supabaseClient
                .from('comment_reports')
                .select('id')
                .eq('comment_id', commentId)
                .eq('player_id', _playerId)
                .maybeSingle();
            
            if (existing) {
                showToast('ℹ️ Вы уже жаловались на этот комментарий', '#ffaa88');
                return;
            }
            
            await supabaseClient.from('comment_reports').insert({
                comment_id: commentId,
                player_id: _playerId,
                reason: reason
            });
            
            showToast('✅ Жалоба отправлена модератору', '#44ff44');
            
        } catch(e) {
            console.warn('reportComment error:', e);
            showToast('❌ Ошибка отправки жалобы', '#ff6b6b');
        }
    }

    // ===== МОДАЛКА ПРОФИЛЯ ИГРОКА (упрощённая) =====
    async function showPlayerProfileModal(playerId, playerName) {
        if (!supabaseClient) return;
        
        try {
            const { data } = await supabaseClient
                .from('leaderboard')
                .select('username, level, diamonds, cards_json, mb_link, last_active')
                .eq('player_id', playerId)
                .single();
            
            if (!data) {
                showToast('❌ Игрок не найден', '#ff6b6b');
                return;
            }
            
            // Используем существующую функцию показа профиля
            let cardsJson = [];
            try {
                cardsJson = data.cards_json || [];
            } catch(e) {}
            
            const rating = (data.level || 0) * 10 + (data.diamonds || 0);
            
            showPlayerProfile(
                playerId,
                data.username || playerName,
                data.level || 1,
                data.diamonds || 0,
                rating,
                cardsJson,
                data.mb_link || ''
            );
            
        } catch(e) {
            console.warn('showPlayerProfileModal error:', e);
        }
    }

    // ===== ЭКРАНИРОВАНИЕ HTML =====
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ============================================================
    // ПАКИ + АНИМАЦИЯ ОТКРЫТИЯ
    // ============================================================
    let _poCurrentCards = [];
    let _poCurrentIndex = 0;
    let _poPickedCard = null;
    let _poAnimating = false;
    let _poAnimationRestored = false;

    function getRandomCardForPack() {
        const weights = { "M": 1, "T": 2, "K": 3, "Y": 4, "U": 8, "Q": 10, "R": 15, "Z": 20, "O": 25 };
        const byRank = {};
        for (const c of ALL_CARDS) {
            if (c.event) continue;
            if (!byRank[c.rank]) byRank[c.rank] = [];
            byRank[c.rank].push(c);
        }
        let total = 0;
        for (const r of Object.keys(byRank)) total += weights[r] || 10;
        let rand = Math.random() * total, acc = 0, selected = 'O';
        for (const r of Object.keys(byRank)) {
            acc += weights[r] || 10;
            if (rand <= acc) { selected = r; break; }
        }
        const pool = byRank[selected] || byRank['O'];
        return { ...pool[Math.floor(Math.random() * pool.length)] };
    }

    function openPack() {
        const cost = 50;
        if (_essence < cost) { showToast(`❌ Нужно ${cost} 💠!`, '#ff6b6b'); return; }
        
        if (pendingPack && pendingPack.cards && pendingPack.cards.length > 0 && pendingPack.selected === null) {
            showToast('🎴 У тебя есть незавершённый пак!', '#ffaa88');
            startPackOpeningAnimation(pendingPack.cards, true);
            return;
        }
        
        _essence -= cost;
        // Логируем списание
        logEssenceTransaction(-cost, 'spend_pack', { pack: 'universal' });
        saveGame();
        const cards = [];
        const usedIds = new Set();
        let attempts = 0;
        while (cards.length < 3 && attempts < 100) {
            attempts++;
            const c = getRandomCardForPack();
            if (!usedIds.has(c.id)) { usedIds.add(c.id); cards.push(c); }
        }
        pendingPack = { cards, selected: null };
        savePendingPack();
        startPackOpeningAnimation(cards);
        updateUI();
        updatePackButton();
        addQuestProgress('pack_open', 1);
    }

    function startPackOpeningAnimation(cards, fromReload = false) {
        _poCurrentCards = cards;
        _poCurrentIndex = 0;
        _poPickedCard = null;
        _poAnimating = false;
        
        const modal = document.getElementById('packOpeningModal');
        if (!modal) { console.warn('packOpeningModal не найден'); return; }
        
        const screen = document.getElementById('poSelectScreen');
        const cardEl = document.getElementById('poCard');
        const bgRays = document.getElementById('poBgRays');
        const particles = document.getElementById('poParticles');
        
        if (screen) screen.classList.remove('show');
        if (cardEl) cardEl.classList.remove('visible', 'exiting');
        if (bgRays) bgRays.classList.remove('active');
        if (particles) particles.innerHTML = '';
        
        modal.classList.add('show');
        updatePackProgressDots(0);
        
        if (fromReload) {
            _poCurrentIndex = cards.length - 1;
            setTimeout(() => showSelectScreen(), 500);
        } else {
            setTimeout(() => showPackCard(0), 350);
        }
    }

    function showPackCard(index) {
        if (index >= _poCurrentCards.length) { showSelectScreen(); return; }
        const card = _poCurrentCards[index];
        _poCurrentIndex = index;
        _poAnimating = true;
        const cardEl = document.getElementById('poCard');
        const cardInner = document.getElementById('poCardInner');
        const bgRays = document.getElementById('poBgRays');
        const info = document.getElementById('poInfo');
        const skipBtn = document.getElementById('poSkipBtn');
        const hint = document.getElementById('poHint');
        if (!cardEl || !cardInner) return;
        cardEl.classList.remove('visible', 'exiting');
        info.classList.remove('visible');
        if (skipBtn) skipBtn.style.display = 'block';
        if (hint) hint.style.display = 'block';
        const glowColor = RANK_GLOW[card.rank] || 'rgba(255,204,102,0.5)';
        document.documentElement.style.setProperty('--glow-color', glowColor);
        document.documentElement.style.setProperty('--card-color', card.color || '#ffcc66');
        document.documentElement.style.setProperty('--ray-color', card.color || '#ffcc66');
        document.documentElement.style.setProperty('--particle-color', card.color || '#ffcc66');
        const imgPath = getCardImage(card);
        const stars = '★'.repeat(RANK_STARS[card.rank] || 1);
        cardInner.innerHTML = `
            <div class="po-card-image">
                ${imgPath ? `<img src="${imgPath}" alt="${card.name}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
            </div>
            <div class="po-card-rank">${card.rank}</div>
            <div class="po-card-name">${card.name}</div>
            <div class="po-card-set">${card.set || 'Коллекция'}</div>
            <div class="po-card-stars">${stars}</div>
        `;
        const flash = document.getElementById('poFlash');
        if (flash) { flash.classList.remove('flash'); void flash.offsetWidth; flash.classList.add('flash'); }
        playPackOpenSound(card.rank);
        setTimeout(() => {
            cardEl.classList.add('visible');
            if (bgRays) bgRays.classList.add('active');
            spawnParticles(24, card.color || '#ffcc66');
            setTimeout(() => {
                if (info) info.classList.add('visible');
                updatePackInfo(card);
                _poAnimating = false;
                updatePackProgressDots(index);
            }, 400);
        }, 100);
    }

    function updatePackInfo(card) {
        const r = document.getElementById('poInfoRank');
        const n = document.getElementById('poInfoName');
        const ra = document.getElementById('poInfoRarity');
        const s = document.getElementById('poInfoStars');
        if (r) { r.textContent = card.rank + ' · ' + (card.rarity || ''); r.style.color = card.color; }
        if (n) n.textContent = card.name;
        if (ra) ra.textContent = card.set || '';
        if (s) {
            s.textContent = '★'.repeat(RANK_STARS[card.rank] || 1);
            s.style.color = card.color;
            s.style.textShadow = `0 0 10px ${card.color}`;
        }
    }

    function updatePackProgressDots(currentIndex) {
        const dots = document.querySelectorAll('.po-progress-dot');
        dots.forEach((dot, i) => {
            dot.classList.remove('active', 'done');
            if (i < currentIndex) dot.classList.add('done');
            else if (i === currentIndex) dot.classList.add('active');
        });
    }

    function spawnParticles(count, color) {
        const container = document.getElementById('poParticles');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'po-particle';
            p.style.setProperty('--particle-color', color);
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            p.style.left = (50 + Math.cos(angle) * 35) + '%';
            p.style.top = (50 + Math.sin(angle) * 35) + '%';
            p.style.setProperty('--px', ((Math.random() - 0.5) * 400) + 'px');
            p.style.setProperty('--py', (-100 - Math.random() * 400) + 'px');
            p.style.animationDelay = (Math.random() * 0.6) + 's';
            container.appendChild(p);
        }
        setTimeout(() => { if (container) container.innerHTML = ''; }, 4500);
    }

    function handlePackModalClick(e) {
        const screen = document.getElementById('poSelectScreen');
        if (screen && screen.classList.contains('show')) return;
        if (e.target.closest('button')) return;
        if (e.target.closest('.po-select-card')) return;
        if (_poAnimating) return;
        if (_poCurrentIndex < _poCurrentCards.length - 1) {
            nextPackCard();
        } else {
            showSelectScreen();
        }
    }

    function nextPackCard() {
        if (_poAnimating) return;
        _poAnimating = true;
        const cardEl = document.getElementById('poCard');
        const bgRays = document.getElementById('poBgRays');
        const info = document.getElementById('poInfo');
        if (cardEl) { cardEl.classList.remove('visible'); cardEl.classList.add('exiting'); }
        if (info) info.classList.remove('visible');
        if (bgRays) bgRays.classList.remove('active');
        setTimeout(() => {
            if (cardEl) cardEl.classList.remove('exiting');
            showPackCard(_poCurrentIndex + 1);
        }, 400);
    }

    function showSelectScreen() {
        const screen = document.getElementById('poSelectScreen');
        const container = document.getElementById('poSelectCards');
        if (!screen || !container) return;
        const cardEl = document.getElementById('poCard');
        const bgRays = document.getElementById('poBgRays');
        const info = document.getElementById('poInfo');
        const skipBtn = document.getElementById('poSkipBtn');
        const hint = document.getElementById('poHint');
        if (cardEl) { cardEl.classList.remove('visible'); cardEl.classList.add('exiting'); }
        if (bgRays) bgRays.classList.remove('active');
        if (info) info.classList.remove('visible');
        if (skipBtn) skipBtn.style.display = 'none';
        if (hint) hint.style.display = 'none';
        container.innerHTML = _poCurrentCards.map((card, i) => {
            const imgPath = getCardImage(card);
            const stars = '★'.repeat(RANK_STARS[card.rank] || 1);
            const colorRgb = hexToRgb(card.color || '#ffcc66');
            return `
                <div class="po-select-card rank-${card.rank}" 
                     data-index="${i}"
                     style="--card-color: ${card.color}; --card-color-rgb: ${colorRgb};"
                     onclick="chooseCardFromSelect(${i})">
                    <div class="po-select-card-inner">
                        <div class="po-select-image">
                            ${imgPath ? `<img src="${imgPath}" alt="${card.name}" onerror="this.parentElement.textContent='${card.rank}'">` : card.rank}
                        </div>
                        <div class="po-select-rank">${card.rank}</div>
                        <div class="po-select-name">${card.name}</div>
                        <div class="po-select-stars">${stars}</div>
                    </div>
                </div>
            `;
        }).join('');
        setTimeout(() => screen.classList.add('show'), 350);
        playSelectSound();
    }

    function chooseCardFromSelect(index) {
        const card = _poCurrentCards[index];
        if (!card) return;
        
        pendingPack = null;
        savePendingPack();
        _poCurrentCards = [];
        _poCurrentIndex = 0;
        _poPickedCard = null;
        
        const allCards = document.querySelectorAll('.po-select-card');
        allCards.forEach((el, i) => {
            if (i === index) el.classList.add('chosen');
            else el.classList.add('dimmed');
        });
        playChooseSound(card.rank);
        setTimeout(() => {
            allCards.forEach((el, i) => {
                if (i !== index) el.classList.add('burning');
            });
        }, 400);
        setTimeout(() => {
            closePackOpeningAnimation();
            setTimeout(() => addCardToCollection(card), 300);
        }, 1400);
    }

    function skipPackAnimation() {
        if (_poAnimating) return;
        const lastIndex = _poCurrentCards.length - 1;
        if (_poCurrentIndex < lastIndex) {
            const cardEl = document.getElementById('poCard');
            const bgRays = document.getElementById('poBgRays');
            if (cardEl) cardEl.classList.remove('visible');
            if (bgRays) bgRays.classList.remove('active');
            setTimeout(() => {
                showPackCard(lastIndex);
                setTimeout(() => showSelectScreen(), 1600);
            }, 200);
        } else {
            showSelectScreen();
        }
    }

    function closePackOpeningAnimation() {
        const modal = document.getElementById('packOpeningModal');
        const bgRays = document.getElementById('poBgRays');
        const particles = document.getElementById('poParticles');
        const screen = document.getElementById('poSelectScreen');
        const cardEl = document.getElementById('poCard');
        if (modal) modal.classList.remove('show');
        if (bgRays) bgRays.classList.remove('active');
        if (particles) particles.innerHTML = '';
        if (screen) screen.classList.remove('show');
        if (cardEl) cardEl.classList.remove('visible', 'exiting');
        _poAnimating = false;
        
        _poCurrentCards = [];
        _poCurrentIndex = 0;
        _poPickedCard = null;
    }

    function playPackOpenSound(rank) {
        if (!_soundEnabled) return;
        try {
            const ctx = initAudioContext();
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
            if (['M', 'T', 'K', 'Y'].includes(rank)) {
                setTimeout(() => {
                    const o2 = ctx.createOscillator();
                    const g2 = ctx.createGain();
                    o2.connect(g2); g2.connect(ctx.destination);
                    o2.type = 'triangle';
                    o2.frequency.setValueAtTime(800, ctx.currentTime);
                    o2.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.2);
                    g2.gain.setValueAtTime(0, ctx.currentTime);
                    g2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.03);
                    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                    o2.start(ctx.currentTime); o2.stop(ctx.currentTime + 0.5);
                }, 150);
            }
        } catch(e) {}
    }

    function playSelectSound() {
        if (!_soundEnabled) return;
        try {
            const ctx = initAudioContext();
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.3);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.4);
        } catch(e) {}
    }

    function playChooseSound(rank) {
        if (!_soundEnabled) return;
        try {
            const ctx = initAudioContext();
            if (!ctx) return;
            if (ctx.state === 'suspended') ctx.resume().catch(() => {});
            const freqs = ['M', 'T', 'K', 'Y'].includes(rank) ? [523, 659, 784, 1047] : [392, 523, 659];
            freqs.forEach((f, i) => {
                setTimeout(() => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.type = 'triangle';
                    osc.frequency.value = f;
                    gain.gain.setValueAtTime(0, ctx.currentTime);
                    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.02);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
                    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.6);
                }, i * 80);
            });
        } catch(e) {}
    }

    function addCardToCollection(card) {
        const existing = _cardHistory.find(item => item.cardId === card.id);
        if (existing) {
            _essence += 7;
            addXP(XP_PACK);
            showToast(`🔄 Дубликат! +7 💠 · ✨ +${XP_PACK} XP`, '#f5b342');
        } else {
            _cardHistory.push({
                cardId: card.id, rank: card.rank,
                text: `🎴 ${card.rank} — ${card.name}`,
                uniqueId: Date.now() + '_' + Math.random().toString(36).substr(2, 6)
            });
            addXP(XP_PACK);
            showToast(`✨ Новая карта! +${XP_PACK} XP ✨`, '#b388ff');
        }
        pendingPack = null;
        savePendingPack();
        if (supabaseClient && _playerId && _playerName && card && card.id) {
            supabaseClient.from('card_owners').upsert({
                card_id: card.id, player_id: _playerId, username: _playerName
            }, { onConflict: 'card_id,player_id' }).then(
                () => console.log('✅ Карта добавлена в card_owners'),
                (err) => console.warn('⚠️ card_owners:', err)
            );
        }
        saveGame();
        updateUI();
        renderCollection();
        addQuestProgress('pack_open', 1);
        renderCatalog();
        renderSets();
        updatePackButton();
    }

    function updatePackButton() {
        const btn = document.getElementById('openPackBtn');
        const cost = 50;
        const essenceDisplay = document.getElementById('packEssenceDisplay');
        if (essenceDisplay) essenceDisplay.textContent = `💠 ${Math.floor(_essence).toLocaleString('ru-RU')}`;
        if (!btn) return;
        if (pendingPack && pendingPack.cards && pendingPack.cards.length > 0 && pendingPack.selected === null) {
            btn.disabled = true;
            btn.textContent = '⏳ Выбери карту';
        } else if (_essence < cost) {
            btn.disabled = true;
            btn.textContent = `❌ Нужно ${cost} 💠`;
        } else {
            btn.disabled = false;
            btn.textContent = '🎴 Открыть';
        }
    }

    // ============================================================
    // ЭКСПОРТ В WINDOW
    // ============================================================
    window.openCardModal = openCardModal;
    window.showSetCards = showSetCards;
    window.sendCardComment = sendCardComment;
    window.toggleCommentLike = toggleCommentLike;
    window.toggleReplyForm = toggleReplyForm;
    window.sendReply = sendReply;
    window.reportComment = reportComment;
    window.showPlayerProfileModal = showPlayerProfileModal;
    window.loadCardOwners = loadCardOwners;
    window.loadCardComments = loadCardComments;
    window.syncCardOwners = syncCardOwners;
    window.escapeHtml = escapeHtml;
    window.getCardImage = getCardImage;
    window.getCardData = getCardData;
    window.getCardById = getCardById;
    window.getCollectionMap = getCollectionMap;

    // Пак и открытие
    window.openPack = openPack;
    window.startPackOpeningAnimation = startPackOpeningAnimation;
    window.showPackCard = showPackCard;
    window.updatePackInfo = updatePackInfo;
    window.updatePackProgressDots = updatePackProgressDots;
    window.spawnParticles = spawnParticles;
    window.handlePackModalClick = handlePackModalClick;
    window.nextPackCard = nextPackCard;
    window.showSelectScreen = showSelectScreen;
    window.chooseCardFromSelect = chooseCardFromSelect;
    window.skipPackAnimation = skipPackAnimation;
    window.closePackOpeningAnimation = closePackOpeningAnimation;
    window.addCardToCollection = addCardToCollection;
    window.updatePackButton = updatePackButton;
    window.getRandomCardForPack = getRandomCardForPack;
    window.loadCustomCards = loadCustomCards;