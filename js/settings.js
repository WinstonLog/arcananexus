// ============================================================
// НАСТРОЙКИ
// ============================================================
function exportData() {
        try {
            saveGame();
            const data = {
                ore: _ore, essence: _essence, level: _level, xp: _xp,
                pickaxeLevel: _pickaxeLevel, strikesDone: _strikesDone, strikesLimit: _strikesLimit,
                cardHistory: _cardHistory, playerName: _playerName, playerId: _playerId,
                joinDate: _joinDate, mbProfileLink: _mbProfileLink,
                compensationClaimed: _compensationClaimed,
                version: '2.0'
            };
            const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
            navigator.clipboard.writeText(encoded).then(() => {
                showToast('✅ Скопировано!', '#44ff44');
            }).catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = encoded;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                textarea.remove();
                showToast('✅ Скопировано!', '#44ff44');
            });
        } catch(e) { showToast('❌ Ошибка', '#ff6b6b'); }
    }

    function importData(encoded) {
        try {
            const data = JSON.parse(decodeURIComponent(atob(encoded)));
            if (!data.version) { showToast('⚠️ Неизвестный формат', '#ffaa88'); return; }
            _ore = data.ore || 0;
            _essence = data.essence || 0;
            _level = data.level || 1;
            _xp = data.xp || 0;
            _pickaxeLevel = data.pickaxeLevel || 1;
            _strikesDone = data.strikesDone || 0;
            _strikesLimit = data.strikesLimit || 100;
            _cardHistory = data.cardHistory || [];
            _playerName = data.playerName || 'Игрок';
            _playerId = data.playerId || generatePlayerId();
            _joinDate = data.joinDate || new Date().toLocaleDateString();
            _mbProfileLink = data.mbProfileLink || null;
            _compensationClaimed = data.compensationClaimed !== undefined ? data.compensationClaimed : false;
            saveGame(); updateUI(); renderCollection(); renderCatalog(); renderSets();
            updateProfileUI(); updatePackButton(); updateProfileLinkUI();
            showToast('✅ Восстановлено!', '#44ff44');
            document.getElementById('importArea').style.display = 'none';
            document.getElementById('importDataInput').value = '';
        } catch(e) { showToast('❌ Ошибка импорта', '#ff6b6b'); }
    }

    async function deleteAllData() {
        // Первое подтверждение
        if (!confirm('⚠️ ВЫ ТОЧНО ХОТИТЕ УДАЛИТЬ АККАУНТ?\n\nВсе данные будут удалены БЕЗВОЗВРАТНО!')) {
            return;
        }
        
        // Второе подтверждение (защита от случайного клика)
        if (!confirm('⚠️ ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ!\n\nУдалятся:\n• Профиль\n• Карты\n• Комментарии\n• Лайки\n• Жалобы\n• Сообщения в чате\n\nПродолжить?')) {
            return;
        }
        
        showToast('🗑️ Удаление аккаунта...', '#ffaa88');
        
        // ===== 1. УДАЛЕНИЕ ИЗ SUPABASE =====
        if (supabaseClient && _playerId) {
            try {
                // Удаляем из всех таблиц
                await supabaseClient.from('comment_likes').delete().eq('player_id', _playerId);
                console.log('✅ Удалены лайки');
                
                await supabaseClient.from('comment_reports').delete().eq('player_id', _playerId);
                console.log('✅ Удалены жалобы');
                
                await supabaseClient.from('card_comments').delete().eq('player_id', _playerId);
                console.log('✅ Удалены комментарии');
                
                await supabaseClient.from('card_owners').delete().eq('player_id', _playerId);
                console.log('✅ Удалены карты из card_owners');
                
                await supabaseClient.from('leaderboard').delete().eq('player_id', _playerId);
                console.log('✅ Удалён профиль из leaderboard');
                
                // Также удаляем из chat_messages, если есть
                try {
                    await supabaseClient.from('chat_messages').delete().eq('player_id', _playerId);
                    console.log('✅ Удалены сообщения из чата');
                } catch(e) {
                    console.warn('chat_messages: возможно, нет прав или таблицы', e);
                }
                
                // Удаляем из trade_offers, если есть
                try {
                    await supabaseClient.from('trade_offers')
                        .delete()
                        .or(`sender_id.eq.${_playerId},receiver_id.eq.${_playerId}`);
                    console.log('✅ Удалены предложения обмена');
                } catch(e) {
                    console.warn('trade_offers: возможно, нет прав или таблицы', e);
                }
                
            } catch(e) {
                console.error('❌ Ошибка удаления из Supabase:', e);
                showToast('⚠️ Ошибка удаления из БД. Данные могут остаться.', '#ffaa88');
            }
        }
        
        // ===== 2. УДАЛЕНИЕ ИЗ LOCALSTORAGE =====
        const keysToRemove = [
            'arcana_save',
            'arcana_pending_pack',
            'arcana_last_reset',
            'arcana_chat_data',
            'arcana_chat_messages',
            'minebuff_save',
            'minebuff_skills',
            'minebuff_settings',
            'minebuff_sound',
            'minebuff_shockwave',
            'arcana_skills',
            'arcana_settings',
            'arcana_sound',
            'bloody_pending_pack'
        ];
        
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        console.log('✅ LocalStorage очищен');
        
        // ===== 3. ОЧИЩАЕМ ВСЁ, ЧТО НАЧИНАЕТСЯ С arcana_ =====
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('arcana_') || key.startsWith('minebuff_') || key.startsWith('notiq_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('✅ Очищены все ключи arcana_/minebuff_/notiq_');
        
        // ===== 4. СБРАСЫВАЕМ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
        _ore = 0;
        _essence = 0;
        _level = 1;
        _strikesDone = 0;
        _strikesLimit = 100;
        _pickaxeLevel = 1;
        _cardHistory = [];
        _eventCurrency = 0;
        _mbProfileLink = null;
        _playerName = '';
        // НЕ сбрасываем _playerId — нужно для повторного удаления, если что
        // НО! После перезагрузки сгенерируется новый
        
        showToast('✅ Аккаунт удалён. Перезагрузка...', '#44ff44');
        
        // ===== 5. ПЕРЕЗАГРУЗКА ЧЕРЕЗ 2 СЕКУНДЫ =====
        setTimeout(() => {
            // Генерируем новый ID чтобы игрок начал с нуля
            localStorage.removeItem('arcana_save');
            location.reload();
        }, 2000);
    }

    window.exportData = exportData;
    window.importData = importData;
    window.deleteAllData = deleteAllData;