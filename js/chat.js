let _chatMessagesCache = [];
let _replyToMessage = null; // глобальная переменная — на какое сообщение отвечаем

// ============================================================
// ЧАТ
// ============================================================
function addChatMessageToSection(message, isOwn = false, isSystem = false) {
    const container = document.getElementById('chatMessagesSection');
    if (!container) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${isSystem ? 'system' : (isOwn ? 'own' : 'other')}`;

    if (!isSystem) {
        // Блок с цитатой, если это ответ
        let replyBlock = '';
        if (message.reply_to_id && message.reply_to_text) {
            replyBlock = `
                <div class="msg-reply" onclick="scrollToMessage(${message.reply_to_id})">
                    <div class="msg-reply-sender">${escapeHtml(message.reply_to_sender || 'Аноним')}</div>
                    <div class="msg-reply-text">${escapeHtml(message.reply_to_text)}</div>
                </div>
            `;
        }

        msgDiv.id = 'msg-' + (message.id || Date.now());
        msgDiv.innerHTML = `
            <span class="msg-sender">${escapeHtml(message.sender || 'Аноним')}</span>
            ${replyBlock}
            <span class="msg-text">${escapeHtml(message.text)}</span>
            <span class="msg-time">${message.time || ''}</span>
        `;

        // Клик по сообщению = ответить
        // Но если это своё сообщение или системное — не отвечаем
        if (message.id && message.player_id !== _playerId) {
            msgDiv.style.cursor = 'pointer';
            msgDiv.title = 'Нажми, чтобы ответить';
            msgDiv.addEventListener('click', function(e) {
                // Если кликнули по цитате внутри — не отвечаем, пусть сработает scrollToMessage
                if (e.target.closest('.msg-reply')) return;
                replyToMessage(message.id);
            });
        }
    } else {
        msgDiv.innerHTML = `<span class="msg-text">${escapeHtml(message.text)}</span>`;
    }

    const isAtTop = container.scrollTop < 50;
    container.insertBefore(msgDiv, container.firstChild);
    while (container.children.length > 100) container.removeChild(container.lastChild);
    if (isAtTop || isSystem) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ============================================================
// ОТПРАВКА СООБЩЕНИЯ
// ============================================================
async function sendChatMessageSection() {
    const input = document.getElementById('chatInputSection');
    const text = input.value.trim();

    if (text.length < 4) {
        showToast('❌ Сообщение должно содержать минимум 4 символа!', '#ff6b6b');
        return;
    }
    if (text.length > 200) {
        showToast('❌ Сообщение не может быть длиннее 200 символов!', '#ff6b6b');
        return;
    }
    if (chatCooldown) {
        showToast('⏳ Подождите 3 секунды перед следующим сообщением!', '#ffaa88');
        return;
    }
    if (!_playerName) {
        showToast('❌ Сначала введите имя в профиле!', '#ff6b6b');
        return;
    }
    if (!supabaseClient) {
        showToast('⚠️ Подключение к серверу...', '#ffaa88');
        return;
    }

    checkChatDailyReset();
    const hasReward = chatMessagesToday < CHAT_DAILY_LIMIT;

    chatCooldown = true;
    const sendBtn = document.getElementById('chatSendBtnSection');
    const chatInput = document.getElementById('chatInputSection');
    sendBtn.disabled = true;
    sendBtn.textContent = '3';
    sendBtn.style.opacity = '0.6';
    chatInput.disabled = true;

    let remaining = 3;
    const cooldownInterval = setInterval(() => {
        remaining--;
        if (remaining > 0) {
            sendBtn.textContent = `${remaining}`;
        } else {
            clearInterval(cooldownInterval);
        }
    }, 1000);

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    // Формируем сообщение (с reply, если есть)
    const message = {
        sender: _playerName,
        text: text,
        player_id: _playerId,
        created_at: now.toISOString()
    };

    if (_replyToMessage) {
        message.reply_to_id = _replyToMessage.id;
        message.reply_to_text = _replyToMessage.text;
        message.reply_to_sender = _replyToMessage.sender;
    }

    addQuestProgress('chat_message', 1);

    try {
        const { data, error } = await supabaseClient
            .from('chat_messages')
            .insert(message)
            .select();

        if (error) {
            console.error('Ошибка отправки:', error);
            showToast('❌ Ошибка отправки сообщения', '#ff6b6b');
            chatInput.value = text;
        } else {
            chatInput.value = '';
            // Сбрасываем ответ
            _replyToMessage = null;
            updateReplyPreview();

            if (hasReward) {
                chatMessagesToday++;
                chatLastMessageDate = new Date().toDateString();
                _essence += CHAT_REWARD_ESSENCE;
                addXP(CHAT_REWARD_XP);
                showToast(`💠 +${CHAT_REWARD_ESSENCE} · ✨ +${CHAT_REWARD_XP} XP (${chatMessagesToday}/${CHAT_DAILY_LIMIT})`, '#44ff44');
            } else {
                showToast(`💬 Сообщение отправлено (лимит награды исчерпан)`, '#6b7084');
            }

            // Если это ответ кому-то — отправим уведомление получателю
            if (message.reply_to_id) {
                // Найдём player_id того, кому отвечаем
                const repliedTo = _chatMessagesCache.find(m => m.id === message.reply_to_id);
                if (repliedTo && repliedTo.player_id && repliedTo.player_id !== _playerId) {
                    await createNotification(
                        repliedTo.player_id,
                        'chat_mention',
                        `💬 ${_playerName} ответил вам`,
                        text.slice(0, 80) + (text.length > 80 ? '...' : ''),
                        { chat_message_id: data?.[0]?.id }
                    );
                }
            }

            addChatMessageToSection({
                id: data?.[0]?.id,
                sender: _playerName,
                text: text,
                time: timeStr,
                reply_to_id: message.reply_to_id,
                reply_to_text: message.reply_to_text,
                reply_to_sender: message.reply_to_sender
            }, true);

            updateChatStats();
            saveChatData();
            saveGame();
            updateUI();
        }
    } catch(e) {
        console.error('Ошибка:', e);
        showToast('❌ Ошибка отправки', '#ff6b6b');
    } finally {
        setTimeout(() => {
            chatCooldown = false;
            sendBtn.disabled = false;
            sendBtn.textContent = '➤';
            sendBtn.style.opacity = '1';
            chatInput.disabled = false;
            chatInput.focus();
            clearInterval(cooldownInterval);
        }, 3000);
    }
}

function loadChatHistoryToSection() {
    if (!supabaseClient) return;
    supabaseClient.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(50)
        .then(({ data, error }) => {
            if (error || !data) return;
            const container = document.getElementById('chatMessagesSection');
            if (container) {
                // Системное сообщение будет внизу (т.к. column-reverse его перевернёт)
                container.innerHTML = `<div class="chat-message system"><span class="msg-text">💬 Добро пожаловать! Первые 10 сообщений в день дают 💠 и ✨ XP!</span></div>`;
            }
            // Сортируем: старые в начало (они окажутся внизу визуально)
            const sorted = [...data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            for (const msg of sorted) {
                addChatMessageToSection({
                    id: msg.id,                  // ← ОБЯЗАТЕЛЬНО
                    sender: msg.sender || 'Аноним',
                    text: msg.text,
                    player_id: msg.player_id,    // ← пригодится
                    time: new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                    reply_to_id: msg.reply_to_id,
                    reply_to_text: msg.reply_to_text,
                    reply_to_sender: msg.reply_to_sender
                }, msg.player_id === _playerId);
            }

            // И заполнить кэш
            _chatMessagesCache = sorted.map(m => ({
                id: m.id,
                sender: m.sender || 'Аноним',
                text: m.text,
                player_id: m.player_id,
                reply_to_id: m.reply_to_id,
                reply_to_text: m.reply_to_text,
                reply_to_sender: m.reply_to_sender
            }));
            checkChatDailyReset();
            updateChatStats();
        }).catch(() => {});
}

function subscribeToChatSection() {
    if (!supabaseClient) { setTimeout(subscribeToChatSection, 1000); return; }
    loadChatHistoryToSection();
    if (chatChannel) { try { supabaseClient.removeChannel(chatChannel); } catch(e) {} chatChannel = null; }
    chatChannel = supabaseClient.channel('chat-section-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
            const msg = payload.new;
            if (!msg || msg.player_id === _playerId) return;
            const container = document.getElementById('chatMessagesSection');
            let exists = false;
            const messages = container.querySelectorAll('.chat-message:not(.system)');
            for (let i = messages.length - 1; i >= Math.max(0, messages.length - 5); i--) {
                const el = messages[i];
                const textEl = el.querySelector('.msg-text');
                const senderEl = el.querySelector('.msg-sender');
                if (textEl && senderEl && textEl.textContent === msg.text && senderEl.textContent === msg.sender) {
                    exists = true; break;
                }
            }
            if (!exists) {
                addChatMessageToSection({
                    id: msg.id,                  // ← ОБЯЗАТЕЛЬНО
                    sender: msg.sender || 'Аноним',
                    text: msg.text,
                    player_id: msg.player_id,
                    time: new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                    reply_to_id: msg.reply_to_id,
                    reply_to_text: msg.reply_to_text,
                    reply_to_sender: msg.reply_to_sender
                }, false);

                // Добавить в кэш
                _chatMessagesCache.push({
                    id: msg.id,
                    sender: msg.sender || 'Аноним',
                    text: msg.text,
                    player_id: msg.player_id,
                    reply_to_id: msg.reply_to_id,
                    reply_to_text: msg.reply_to_text,
                    reply_to_sender: msg.reply_to_sender
                });
            }
        }).subscribe();
}

function updateChatOnlineCount() {
    if (!supabaseClient) return;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    supabaseClient.from('leaderboard').select('player_id', { count: 'exact', head: false }).gte('last_active', fiveMinutesAgo)
        .then(({ count }) => {
            const el = document.getElementById('chatOnlineCountSection');
            if (el) el.textContent = `👤 ${count || 0}`;
        }).catch(() => {});
}

function setupChatPollingSection() {
    function pollChat() {
        if (!supabaseClient) return;
        supabaseClient.from('chat_messages').select('*').order('created_at', { ascending: true })
            .gt('created_at', new Date(Date.now() - 10000).toISOString())
            .then(({ data }) => {
                if (!data || !data.length) return;
                const container = document.getElementById('chatMessagesSection');
                const existingTexts = new Set();
                container.querySelectorAll('.chat-message:not(.system)').forEach(el => {
                    const textEl = el.querySelector('.msg-text');
                    const senderEl = el.querySelector('.msg-sender');
                    if (textEl && senderEl) existingTexts.add(`${senderEl.textContent}:${textEl.textContent}`);
                });
                for (const msg of data) {
                    if (msg.player_id === _playerId) continue;
                    const key = `${msg.sender}:${msg.text}`;
                    if (!existingTexts.has(key)) {
                        // Проверяем, нет ли уже в кэше (чтобы не дублировать)
                        if (_chatMessagesCache.some(m => Number(m.id) === Number(msg.id))) continue;

                        addChatMessageToSection({
                            id: msg.id,
                            sender: msg.sender || 'Аноним',
                            text: msg.text,
                            player_id: msg.player_id,
                            time: new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                            reply_to_id: msg.reply_to_id,
                            reply_to_text: msg.reply_to_text,
                            reply_to_sender: msg.reply_to_sender
                        }, false);

                        _chatMessagesCache.push({
                            id: msg.id,
                            sender: msg.sender || 'Аноним',
                            text: msg.text,
                            player_id: msg.player_id,
                            reply_to_id: msg.reply_to_id,
                            reply_to_text: msg.reply_to_text,
                            reply_to_sender: msg.reply_to_sender
                        });
                    }
                }
            }).catch(() => {});
    }
    setInterval(pollChat, 3000);
    pollChat();
}

// ===== ОТВЕТИТЬ НА СООБЩЕНИЕ =====
function replyToMessage(messageId) {
    const msg = _chatMessagesCache.find(m => Number(m.id) === Number(messageId));
    if (!msg) {
        showToast('❌ Сообщение не найдено', '#ff6b6b');
        return;
    }
    if (msg.player_id === _playerId) {
        showToast('❌ Нельзя отвечать самому себе', '#ffaa88');
        return;
    }

    _replyToMessage = msg;
    updateReplyPreview();
    document.getElementById('chatInputSection').focus();
}

// ===== ПРЕВЬЮ ОТВЕТА НАД ПОЛЕМ ВВОДА =====
function updateReplyPreview() {
    let preview = document.getElementById('replyPreview');

    if (!_replyToMessage) {
        if (preview) preview.remove();
        return;
    }

    if (!preview) {
        preview = document.createElement('div');
        preview.id = 'replyPreview';
        preview.className = 'reply-preview';
        const inputRow = document.getElementById('chatInputSection').parentElement;
        inputRow.parentElement.insertBefore(preview, inputRow);
    }

    preview.innerHTML = `
        <div class="reply-preview-icon">↩️</div>
        <div class="reply-preview-body">
            <div class="reply-preview-label">Ответ <b>${escapeHtml(_replyToMessage.sender)}</b></div>
            <div class="reply-preview-text">${escapeHtml(_replyToMessage.text.slice(0, 60))}${_replyToMessage.text.length > 60 ? '...' : ''}</div>
        </div>
        <button class="reply-preview-close" onclick="cancelReply()">✕</button>
    `;
}

// ===== ОТМЕНИТЬ ОТВЕТ =====
function cancelReply() {
    _replyToMessage = null;
    updateReplyPreview();
}

// ===== ПРОКРУТИТЬ К СООБЩЕНИЮ =====
function scrollToMessage(messageId) {
    const el = document.getElementById('msg-' + messageId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.style.transition = 'background 0.3s';
    el.style.background = 'rgba(179, 136, 255, 0.25)';
    setTimeout(() => {
        el.style.background = '';
    }, 1200);
}

// ============================================================
// ОБНОВЛЕНИЕ СТАТИСТИКИ ЧАТА
// ============================================================
function updateChatStats() {
        checkChatDailyReset();
        
        const container = document.getElementById('chatMessagesSection');
        if (!container) return;
        
        const messages = container.querySelectorAll('.chat-message:not(.system)');
        const totalMessages = messages.length;
        
        const totalEl = document.getElementById('chatTotalMessages');
        if (totalEl) totalEl.textContent = totalMessages;
        
        // Показываем только до 10
        const displayCount = Math.min(chatMessagesToday, CHAT_DAILY_LIMIT);
        const soulsToday = document.getElementById('chatSoulsToday');
        if (soulsToday) soulsToday.textContent = `${displayCount}/${CHAT_DAILY_LIMIT}`;
        
        // Прогресс всегда 100% после 10
        const progress = Math.min((chatMessagesToday / CHAT_DAILY_LIMIT) * 100, 100);
        const progressFill = document.getElementById('chatProgressFill');
        if (progressFill) progressFill.style.width = progress + '%';
        
        // Осталось сообщений — 0 после лимита
        const untilReward = document.getElementById('chatMessagesUntilReward');
        if (untilReward) {
            const remaining = Math.max(CHAT_DAILY_LIMIT - chatMessagesToday, 0);
            untilReward.textContent = remaining;
        }
        
        const cooldownDisplay = document.getElementById('chatCooldownDisplay');
        if (cooldownDisplay) {
            if (chatMessagesToday >= CHAT_DAILY_LIMIT) {
                cooldownDisplay.textContent = '✅ Лимит исчерпан';
                cooldownDisplay.style.color = '#44ff44';
            } else {
                cooldownDisplay.textContent = `${chatMessagesToday}/${CHAT_DAILY_LIMIT}`;
                cooldownDisplay.style.color = '#44ff44';
            }
        }
        
        const ratingEl = document.getElementById('chatRating');
        if (ratingEl) {
            ratingEl.textContent = totalMessages * 10;
        }
    }

    function saveChatData() {
        const data = {
            chatMessagesToday: chatMessagesToday,
            chatLastMessageDate: chatLastMessageDate
        };
        localStorage.setItem('arcana_chat_data', JSON.stringify(data));
    }

    window.addChatMessageToSection = addChatMessageToSection;
    window.updateChatStats = updateChatStats;
    window.saveChatData = saveChatData;
    window.sendChatMessageSection = sendChatMessageSection;
    window.loadChatHistoryToSection = loadChatHistoryToSection;
    window.subscribeToChatSection = subscribeToChatSection;
    window.updateChatOnlineCount = updateChatOnlineCount;
    window.setupChatPollingSection = setupChatPollingSection;
    window.checkChatDailyReset = checkChatDailyReset;
    window.replyToMessage = replyToMessage;
    window.cancelReply = cancelReply;
    window.scrollToMessage = scrollToMessage;
    window.updateReplyPreview = updateReplyPreview;