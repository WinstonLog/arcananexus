// ============================================================
// УВЕДОМЛЕНИЯ
// ============================================================

let _notifications = [];
let _notifChannel = null;

// ===== ЗАГРУЗКА =====
async function loadNotifications() {
    if (!supabaseClient || !_playerId) return;

    try {
        const { data, error } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('player_id', _playerId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        _notifications = data || [];
        renderNotifBadge();
        renderNotificationsList();
    } catch(e) {
        console.warn('loadNotifications error:', e);
    }
}

// ===== СОЗДАНИЕ (для других скриптов) =====
async function createNotification(playerId, type, title, message, data = {}) {
    if (!supabaseClient || !playerId) return;

    try {
        await supabaseClient.from('notifications').insert({
            player_id: playerId,
            type: type,
            title: title,
            message: message,
            data: data
        });
    } catch(e) {
        console.warn('createNotification error:', e);
    }
}

// ===== БЕЙДЖ =====
function renderNotifBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;

    const unread = _notifications.filter(n => !n.read).length;

    if (unread > 0) {
        badge.textContent = unread > 99 ? '99+' : unread;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// ===== СПИСОК =====
function renderNotificationsList() {
    const list = document.getElementById('notificationsList');
    if (!list) return;

    if (_notifications.length === 0) {
        list.innerHTML = `<div style="text-align:center; opacity:0.4; padding:40px 20px;">
            <div style="font-size:48px; margin-bottom:8px;">🔔</div>
            <div style="font-size:14px;">Пока нет уведомлений</div>
        </div>`;
        return;
    }

    const typeIcons = {
        'order_fulfilled': '🎉',
        'market_sold':     '💰',
        'market_bought':   '🛒',
        'chat_mention':    '💬',
        'quest_complete':  '🎯',
        'level_up':        '⭐',
        'pack_opened':     '🎴',
        'admin':           '📢',
        'default':         '🔔'
    };

    const typeColors = {
        'order_fulfilled': '#44ff44',
        'market_sold':     '#ffcc66',
        'market_bought':   '#4a9eff',
        'chat_mention':    '#b388ff',
        'quest_complete':  '#44ff44',
        'level_up':        '#ffcc66',
        'pack_opened':     '#b388ff',
        'admin':           '#ff6b6b',
        'default':         '#b388ff'
    };

    list.innerHTML = _notifications.map(n => {
        const icon = typeIcons[n.type] || typeIcons.default;
        const color = typeColors[n.type] || typeColors.default;
        const time = formatNotifTime(n.created_at);

        return `
            <div class="notif-item ${n.read ? '' : 'unread'}"
                 style="--notif-color:${color};"
                 onclick="markNotificationRead(${n.id})">
                <div class="notif-icon">${icon}</div>
                <div class="notif-body">
                    <div class="notif-title">${escapeHtml(n.title)}</div>
                    <div class="notif-text">${escapeHtml(n.message)}</div>
                    <div class="notif-time">${time}</div>
                </div>
                ${!n.read ? '<div class="notif-dot"></div>' : ''}
            </div>
        `;
    }).join('');
}

// ===== ВРЕМЯ =====
function formatNotifTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'только что';
    if (min < 60) return `${min} мин назад`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h} ч назад`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d} дн назад`;
    return new Date(iso).toLocaleDateString('ru-RU');
}

// ===== ОТКРЫТИЕ / ЗАКРЫТИЕ =====
function openNotificationsModal() {
    loadNotifications();
    document.getElementById('notificationsModal').classList.add('show');
}

function closeNotificationsModal() {
    document.getElementById('notificationsModal').classList.remove('show');
}

// ===== ПРОЧИТАНО =====
async function markNotificationRead(id) {
    if (!supabaseClient || !_playerId) return;

    const n = _notifications.find(x => x.id === id);
    if (!n || n.read) return;

    try {
        await supabaseClient.from('notifications')
            .update({ read: true })
            .eq('id', id)
            .eq('player_id', _playerId);

        n.read = true;
        renderNotifBadge();
        renderNotificationsList();
    } catch(e) {
        console.warn('markNotificationRead error:', e);
    }
}

async function markAllNotificationsRead() {
    if (!supabaseClient || !_playerId) return;

    try {
        await supabaseClient.from('notifications')
            .update({ read: true })
            .eq('player_id', _playerId)
            .eq('read', false);

        _notifications.forEach(n => n.read = true);
        renderNotifBadge();
        renderNotificationsList();
        showToast('✅ Все уведомления прочитаны', '#44ff44');
    } catch(e) {
        console.warn('markAllNotificationsRead error:', e);
    }
}

// ===== REALTIME =====
function subscribeToNotifications() {
    if (!supabaseClient || !_playerId) return;
    if (_notifChannel) {
        try { supabaseClient.removeChannel(_notifChannel); } catch(e) {}
        _notifChannel = null;
    }

    _notifChannel = supabaseClient
        .channel('notif-channel-' + _playerId)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `player_id=eq.${_playerId}`
        }, (payload) => {
            const n = payload.new;
            _notifications.unshift(n);
            renderNotifBadge();
            renderNotificationsList();
            showToast(`🔔 ${n.title}`, '#b388ff');
            if (navigator.vibrate) navigator.vibrate(50);
        })
        .subscribe();
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function initNotifications() {
    const btn = document.getElementById('notificationsBtn');
    if (btn) btn.addEventListener('click', openNotificationsModal);

    const modal = document.getElementById('notificationsModal');
    if (modal) modal.addEventListener('click', function(e) {
        if (e.target === this) closeNotificationsModal();
    });

    loadNotifications();
    subscribeToNotifications();
}

// ===== ЭКСПОРТ =====
window.loadNotifications = loadNotifications;
window.createNotification = createNotification;
window.renderNotifBadge = renderNotifBadge;
window.renderNotificationsList = renderNotificationsList;
window.openNotificationsModal = openNotificationsModal;
window.closeNotificationsModal = closeNotificationsModal;
window.markNotificationRead = markNotificationRead;
window.markAllNotificationsRead = markAllNotificationsRead;
window.subscribeToNotifications = subscribeToNotifications;
window.initNotifications = initNotifications;