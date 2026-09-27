// ============================================================
// ПРЕДЛОЖЕНИЕ КАРТ
// ============================================================

// Ранги, которые НЕЛЬЗЯ предлагать
const FORBIDDEN_RANKS = ['M', 'T', 'N', 'H', 'V', 'L'];

// ============================================================
// РЕДКОСТЬ ПО РАНГУ
// ============================================================
const RARITY_BY_RANK = {
    'M': 'Мифическая',
    'T': 'Титановая',
    'K': 'Королевская',
    'Y': 'Ледяная',       // или "Ледяная" — как у тебя в ALL_CARDS
    'U': 'Урановая',
    'Q': 'Квантовая',
    'R': 'Радужная',
    'Z': 'Загадочная',
    'O': 'Ониксовая',
    'H': 'Хэллоуинская',
    'N': 'Зимняя',
    'V': 'Весенняя',
    'L': 'Летняя'
};

let _suggestImageFile = null;

// ===== ЗАГРУЗКА КАРТИНКИ =====
function initSuggestRankChange() {
    const rankSelect = document.getElementById('suggestRank');
    const rarityInput = document.getElementById('suggestRarity');

    if (!rankSelect || !rarityInput) return;

    rankSelect.addEventListener('change', function() {
        const rank = this.value;
        if (!rank) {
            rarityInput.value = '';
            return;
        }
        rarityInput.value = RARITY_BY_RANK[rank] || '';
    });
}

// ===== ОТПРАВКА ЗАЯВКИ =====
async function submitCardSuggestion() {
    if (!supabaseClient || !_playerId || !_playerName) {
        showToast('❌ Сначала введи имя и зайди в игру', '#ff6b6b');
        return;
    }

    const name = document.getElementById('suggestName').value.trim();
    const set = document.getElementById('suggestSet').value.trim();
    const rank = document.getElementById('suggestRank').value;
    const rarity = RARITY_BY_RANK[rank] || 'Обычная';
    const comment = document.getElementById('suggestComment').value.trim();

    // Валидация
    if (!name || name.length < 2) {
        showToast('❌ Введи имя персонажа (мин. 2 символа)', '#ff6b6b');
        return;
    }
    if (!set || set.length < 2) {
        showToast('❌ Введи название сета', '#ff6b6b');
        return;
    }
    if (!rank) {
        showToast('❌ Выбери ранг', '#ff6b6b');
        return;
    }
    if (FORBIDDEN_RANKS.includes(rank)) {
        showToast('❌ Этот ранг добавляют только админы', '#ff6b6b');
        return;
    }
    if (!_suggestImageFile) {
        showToast('❌ Загрузи картинку 512×512', '#ff6b6b');
        return;
    }

    const btn = document.getElementById('suggestSubmitBtn');
    const statusEl = document.getElementById('suggestStatus');
    btn.disabled = true;
    btn.textContent = '⏳ Загрузка картинки...';
    statusEl.innerHTML = '';

    try {
        // 1. Загружаем картинку в Storage
        const ext = _suggestImageFile.name.split('.').pop() || 'png';
        const fileName = `suggest_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabaseClient
            .storage
            .from('card-images')
            .upload(fileName, _suggestImageFile, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw new Error('Загрузка: ' + uploadError.message);

        // 2. Получаем публичный URL
        const { data: urlData } = supabaseClient
            .storage
            .from('card-images')
            .getPublicUrl(fileName);

        const imageUrl = urlData.publicUrl;

        // 3. Отправляем заявку
        btn.textContent = '⏳ Отправка...';

        const { error: insertError } = await supabaseClient
            .from('card_suggestions')
            .insert({
                player_id: _playerId,
                player_name: _playerName,
                card_name: name,
                card_set: set,
                card_rank: rank,
                card_rarity: rarity,
                image_url: imageUrl,
                comment: comment,
                status: 'pending'
            });

        if (insertError) throw new Error('Отправка: ' + insertError.message);

        // 4. Успех
        showToast('✅ Заявка отправлена! Жди решения 🔔', '#44ff44');
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

        // Сброс формы
        document.getElementById('suggestName').value = '';
        document.getElementById('suggestSet').value = '';
        document.getElementById('suggestRank').value = '';
        document.getElementById('suggestComment').value = '';
        document.getElementById('suggestImage').value = '';
        document.getElementById('suggestPreview').innerHTML = '';
        _suggestImageFile = null;

        statusEl.innerHTML = `
            <div style="padding:14px; background:rgba(68,255,68,0.1); border-radius:12px;
                        border-left:3px solid #44ff44; color:#44ff44;">
                ✅ Заявка отправлена! Решение придёт в уведомления
            </div>
        `;

        // Обновляем список своих заявок
        loadMySuggestions();

    } catch(e) {
        console.error('submitCardSuggestion error:', e);
        showToast('❌ Ошибка: ' + e.message, '#ff6b6b');
        statusEl.innerHTML = `
            <div style="padding:14px; background:rgba(255,107,107,0.1); border-radius:12px;
                        border-left:3px solid #ff6b6b; color:#ff6b6b;">
                ❌ ${escapeHtml(e.message)}
            </div>
        `;
    } finally {
        btn.disabled = false;
        btn.textContent = '📤 Отправить заявку';
    }
}

// ===== МОИ ЗАЯВКИ =====
async function loadMySuggestions() {
    if (!supabaseClient || !_playerId) return;

    const container = document.getElementById('mySuggestions');
    if (!container) return;

    try {
        const { data, error } = await supabaseClient
            .from('card_suggestions')
            .select('*')
            .eq('player_id', _playerId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!data || data.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:30px; color:#6b7084;
                            background:rgba(20,24,36,0.5); border-radius:16px;">
                    <div style="font-size:48px; margin-bottom:8px;">🎨</div>
                    <div style="font-size:14px;">Ты пока не предлагал карты</div>
                </div>
            `;
            return;
        }

        const statusLabels = {
            pending:  { text: '⏳ На рассмотрении', color: '#ffcc66' },
            approved: { text: '✅ Одобрена',          color: '#44ff44' },
            rejected: { text: '❌ Отклонена',         color: '#ff6b6b' }
        };

        container.innerHTML = data.map(s => {
            const st = statusLabels[s.status] || { text: s.status, color: '#8b90a8' };
            const rankColors = {
                K: '#f4d03f', Y: '#2ecc71', U: '#00ff88',
                Q: '#9b59b6', R: '#ff6b6b', Z: '#d4a373', O: '#7a8a9a'
            };
            const rankColor = rankColors[s.card_rank] || '#b388ff';

            return `
                <div style="background:rgba(20,24,36,0.7); border-radius:14px; padding:14px 16px;
                            margin-bottom:10px; border-left:3px solid ${st.color};
                            display:flex; gap:14px; align-items:center; flex-wrap:wrap;">
                    <img src="${s.image_url}" style="width:60px; height:60px; border-radius:10px;
                                                     object-fit:cover; flex-shrink:0;
                                                     border:2px solid ${rankColor};">
                    <div style="flex:1; min-width:180px;">
                        <div style="font-weight:700; font-size:14px; color:#e4e6f0;
                                    margin-bottom:4px;">
                            ${escapeHtml(s.card_name)}
                        </div>
                        <div style="font-size:12px; color:#8b90a8;">
                            ${escapeHtml(s.card_set)} · 
                            <b style="color:${rankColor};">${s.card_rank}</b>
                        </div>
                        ${s.admin_comment ? `
                            <div style="font-size:11px; color:#8b90a8; margin-top:6px;
                                        padding:6px 10px; background:rgba(0,0,0,0.3);
                                        border-radius:8px;">
                                💬 ${escapeHtml(s.admin_comment)}
                            </div>
                        ` : ''}
                        <div style="font-size:10px; color:#6b7084; margin-top:4px;">
                            ${new Date(s.created_at).toLocaleString('ru-RU')}
                        </div>
                    </div>
                    <div style="font-size:11px; font-weight:800; color:${st.color};
                                padding:4px 12px; background:${st.color}15;
                                border-radius:20px; white-space:nowrap;">
                        ${st.text}
                    </div>
                </div>
            `;
        }).join('');

    } catch(e) {
        console.warn('loadMySuggestions error:', e);
    }
}

function initSuggestImageUpload() {
    const input = document.getElementById('suggestImage');
    if (!input) return;

    input.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            showToast('❌ Только JPG или PNG', '#ff6b6b');
            input.value = '';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showToast('❌ Файл больше 2 МБ', '#ff6b6b');
            input.value = '';
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);
        const MIN_SIZE = 512;
        const MAX_SIZE = 2048;

        img.onload = function() {
            // Проверка 1: минимум 512×512
            if (img.width < MIN_SIZE || img.height < MIN_SIZE) {
                showToast(`❌ Минимум ${MIN_SIZE}×${MIN_SIZE}, у тебя ${img.width}×${img.height}`, '#ff6b6b');
                URL.revokeObjectURL(url);
                input.value = '';
                return;
            }

            // Проверка 2: должна быть квадратной
            if (img.width !== img.height) {
                showToast(`❌ Картинка должна быть квадратной, у тебя ${img.width}×${img.height}`, '#ff6b6b');
                URL.revokeObjectURL(url);
                input.value = '';
                return;
            }

            // Проверка 3: максимум 2048
            if (img.width > MAX_SIZE) {
                showToast(`❌ Максимум ${MAX_SIZE}×${MAX_SIZE}, у тебя ${img.width}×${img.height}`, '#ff6b6b');
                URL.revokeObjectURL(url);
                input.value = '';
                return;
            }

            _suggestImageFile = file;

            const preview = document.getElementById('suggestPreview');
            preview.innerHTML = `
                <div style="display:inline-block; position:relative;">
                    <img src="${url}" style="width:180px; height:180px; border-radius:12px;
                                              border:2px solid rgba(179,136,255,0.5);
                                              box-shadow:0 0 30px rgba(179,136,255,0.3);">
                    <div style="position:absolute; bottom:6px; left:6px; right:6px;
                                background:rgba(0,0,0,0.7); padding:4px 8px; border-radius:8px;
                                font-size:11px; font-weight:700; color:#44ff44;">
                        ✅ ${img.width}×${img.height}
                    </div>
                </div>
            `;
            URL.revokeObjectURL(url);
        };

        img.onerror = function() {
            showToast('❌ Не удалось прочитать картинку', '#ff6b6b');
            URL.revokeObjectURL(url);
            input.value = '';
        };

        img.src = url;
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initSuggest() {
    initSuggestImageUpload();
    initSuggestRankChange();
    loadMySuggestions();
}

window.submitCardSuggestion = submitCardSuggestion;
window.loadMySuggestions = loadMySuggestions;
window.initSuggest = initSuggest;