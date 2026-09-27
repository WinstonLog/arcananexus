// ============================================================
// НОВОСТИ / ЧТО НОВОГО
// ============================================================
const GAME_NEWS = [
        {
            id: 0,
            title: 'Обмен картами временно недоступен',
            content: `⚠️ **Раздел "Обмен" временно убран из игры.**

        Причина: технические неполадки синхронизации между устройствами — карты не всегда корректно списывались и добавлялись при обмене между игроками.

        **Что это значит:**
        • ❌ Раздел "Обмен" больше не доступен
        • ✅ Все остальные функции работают как обычно
        • ✅ Рынок карт работает в полном объёме
        • ✅ Карты, которые были в активных обменах, вернутся в вашу коллекцию

        **Что использовать вместо обмена:**
        • 🏪 **Рынок карт** — выставляйте лоты и создавайте заявки
        • 💰 Продавайте и покупайте карты за другие карты
        • 🔄 Все сделки на рынке проходят мгновенно и безопасно

        Приносим извинения за неудобства. Раздел "Обмен" вернётся, когда мы устраним проблемы синхронизации.

        Спасибо за понимание! 💜`,
            type: 'announcement',
            icon: '🚫',
            color: '#ff6b6b',
            version: '2.2',
            important: true,
            published_at: new Date().toISOString()
        },
        {
            id: 0,
            title: 'Магазин эссенции',
            content: `В игре появился **магазин эссенции**! 🎉

    Что нового:
    • 💠 Пакеты эссенции от 50 до 5000
    • 🎁 Бонусы за большие пакеты (до +25%)
    • 💳 Оплата через ЮMoney
    • 📱 Мгновенное зачисление после проверки чека

    Как купить:
    1. Открой раздел **Магазин** в боковом меню
    2. Выбери пакет
    3. Оплати через ЮMoney
    4. Отправь чек в Telegram — алмазы будут начислены

    ⚠️ Эссенция — премиум-валюта. Их можно обменять на эксклюзивные карты и бустеры.`,
            type: 'update',
            icon: '💠',
            color: '#4a9eff',
            version: '2.1',
            important: true,
            published_at: new Date('2026-01-15T12:00:00').toISOString()
        },
        {
            id: 1,
            title: 'Рынок карт',
            content: `Открыт **рынок карт**! 🏪

    Теперь вы можете:
    • 📤 Выставлять свои карты на продажу
    • 🛒 Создавать заявки на покупку нужных карт
    • 🔄 Обмениваться картами с другими игроками
    • 📊 Видеть все активные лоты и заявки

    Как пользоваться:
    1. Открой раздел **Рынок**
    2. Выбери вкладку **Лоты** или **Заявки**
    3. Создай свой лот или прими чужой
    4. Карты перейдут мгновенно

    💡 Совет: выставляй адекватные цены — редкие карты меняются на 2-5 карт низкого ранга.`,
            type: 'update',
            icon: '🏪',
            color: '#ffcc66',
            version: '2.0',
            important: false,
            published_at: new Date('2026-01-10T12:00:00').toISOString()
        },
        {
            id: 2,
            title: 'Ежедневные квесты',
            content: `Добавлены **ежедневные квесты**! 🎯

    Каждый день выполняй 5 заданий:
    • ⛏️ Сделай удары в шахте
    • 🎴 Открой паки
    • 💬 Напиши сообщения в чате
    • 🎮 Победи в мини-игре
    • 🏪 Обменяйся на рынке

    Награды:
    • 💠 Эссенция
    • ⛏️ Руда
    • ✨ Опыт

    🏆 **Бонус:** выполни все 5 квестов — получишь **+50 💠, +500 ⛏️ и +100 XP**!`,
            type: 'update',
            icon: '🎯',
            color: '#44ff44',
            version: '1.9',
            important: false,
            published_at: new Date('2026-01-05T12:00:00').toISOString()
        },
        {
            id: 0,
            title: 'Мини-игра «Аркана: Звёздный ловец»',
            content: `В игре появилась **новая мини-игра**! 🛸

        **Аркана: Звёздный ловец** — управляй платформой внизу экрана, лови падающие ⭐ звёзды и уклоняйся от ☄️ метеоритов.

        Управление:
        • 🖱️ **Мышь** — платформа следует за курсором
        • ⌨️ **Стрелки ← →** или **A / D** — движение влево-вправо
        • 📱 На телефоне — **веди пальцем** по экрану

        Правила:
        • ⭐ Поймал звезду — **+1 💠** эссенции
        • ☄️ Метеорит попал в платформу — **−1 жизнь** (всего 3)
        • 💀 Кончились жизни — игра окончена

        Награды:
        • 🏆 Рекорд — **+10 ⛏️ руды**
        • 💠 Звёзды дают эссенцию (до **50 💠 в день**)`,
            type: 'event',
            icon: '🛸',
            color: '#b388ff',
            version: '1.9',
            important: false,
            published_at: new Date('2025-12-25T12:00:00').toISOString()
        },
/*        {
            id: 1,
            title: 'Хэллоуин 2026',
            content: `🎃 **Хэллоуинский ивент** стартовал!

    Что вас ждёт:
    • 🎴 Эксклюзивная карта ранга **H** (Тыква)
    • 💰 Ивентовая валюта за активность
    • 📦 Ивентовые паки со скидкой
    • 🎁 Специальные награды в календаре

    Период: **25 октября — 31 октября**.

    Успей собрать эксклюзивную коллекцию! 🕸️`,
            type: 'event',
            icon: '🎃',
            color: '#ff6600',
            version: '1.7',
            important: false,
            published_at: new Date('2025-10-25T12:00:00').toISOString()
        }*/
    ];

    let gameNews = [];  // будет заполнен из GAME_NEWS
    let newsFilter = 'all';

    function loadGameNews() {
        // Новости теперь локально в коде
        let filtered = [...GAME_NEWS];
        
        // Фильтр по типу
        if (newsFilter !== 'all') {
            filtered = filtered.filter(n => n.type === newsFilter);
        }
        
        // Сортировка: важные сверху, потом по дате
        filtered.sort((a, b) => {
            if (a.important && !b.important) return -1;
            if (!a.important && b.important) return 1;
            return new Date(b.published_at) - new Date(a.published_at);
        });
        
        gameNews = filtered;
        renderNews();
    }

    function renderNews() {
        const listEl = document.getElementById('newsList');
        if (!listEl) return;

        const countEl = document.getElementById('newsCount');
        if (countEl) countEl.textContent = `${gameNews.length} обновлений`;

        if (gameNews.length === 0) {
            listEl.innerHTML = `<div class="news-empty">
                <div class="icon">📰</div>
                <div class="title">Новостей пока нет</div>
                <div class="desc">Скоро появятся обновления!</div>
            </div>`;
            return;
        }

        listEl.innerHTML = gameNews.map((news, i) => {
            const date = new Date(news.published_at).toLocaleDateString('ru-RU', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            const time = new Date(news.published_at).toLocaleTimeString('ru-RU', {
                hour: '2-digit', minute: '2-digit'
            });

            const typeNames = {
                update: '🆕 Обновление',
                event: '🎉 Ивент',
                hotfix: '🔧 Фикс',
                announcement: '📢 Анонс'
            };

            // Парсим простой Markdown
            const formattedContent = escapeHtml(news.content)
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.+?)`/g, '<code style="background:rgba(179,136,255,0.15);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px;color:#b388ff;">$1</code>');

            return `
                <div class="news-item ${news.important ? 'important' : ''}"
                     style="--news-color: ${news.color}; animation-delay: ${i * 0.05}s;">
                    <div class="news-header">
                        <div class="news-icon">${news.icon}</div>
                        <div class="news-title-block">
                            <div class="news-title">${escapeHtml(news.title)}</div>
                            <div class="news-meta">
                                <span class="news-version">v${news.version}</span>
                                <span class="news-type ${news.type}">${typeNames[news.type] || news.type}</span>
                                <span>📅 ${date}</span>
                                <span>🕐 ${time}</span>
                            </div>
                        </div>
                    </div>
                    <div class="news-content">${formattedContent}</div>
                </div>
            `;
        }).join('');
    }

    window.loadGameNews = loadGameNews;
    window.renderNews = renderNews;