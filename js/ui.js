// ============================================================
// НАВИГАЦИЯ
// ============================================================
function switchSection(section) {
        // Останавливаем авто-обновление магазина если уходим из него
        if (section !== 'shop') {
            if (typeof stopShopAutoRefresh === 'function') stopShopAutoRefresh();
        }
        
        document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        
        const map = {
            'mine': 'section-mine', 'mycards': 'section-mycards',
            'catalog': 'section-catalog', 'sets': 'section-sets',
            'packs': 'section-packs', 'event': 'section-event',
            'chat': 'section-chat', /*'trade': 'section-trade'*/
            'top': 'section-top', 'profile': 'section-profile',
            'settings': 'section-settings', 'minigames': 'section-minigames',
            'market': 'section-market', 'quests': 'section-quests', 
            'news': 'section-news', 'shop': 'section-shop', 'suggest': 'section-suggest'
        };
        
        const target = document.getElementById(map[section]);
        if (target) target.classList.add('active');
        
        const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);
        if (navItem) navItem.classList.add('active');

        // ===== ЛОГИКА ПО СЕКЦИЯМ =====
        if (section === 'mycards') renderCollection();
        if (section === 'catalog') renderCatalog();
        if (section === 'sets') renderSets();
        if (section === 'packs') updatePackButton();
        if (section === 'event') updateEventUI();
        if (section === 'profile') { updateProfileUI(); updateProfileLinkUI(); }
        if (section === 'top') loadTopFromSupabase();
        if (section === 'news') loadGameNews();
        
        if (section === 'suggest') {
            setTimeout(() => { initSuggest(); }, 50);
        }

        if (section === 'minigames') {
            setTimeout(() => {
                fgInit();
                fgRenderIdle();
                fgUpdateSideStats();
                fgUpdateDailyUI();
            }, 50);
        }
        
        if (section === 'market') {
            setTimeout(() => { loadMarketData(); subscribeToMarket(); }, 100);
        }
        
        if (section === 'shop') { 
            setTimeout(() => {
                loadShopData();
                if (typeof refreshGemsBalance === 'function') refreshGemsBalance();
                if (typeof startShopAutoRefresh === 'function') startShopAutoRefresh();
            }, 100); 
        }
        
        if (section === 'quests') {
            loadDailyQuests();
        }
        
/*        if (section === 'trade') {
            setTimeout(async () => { 
                await loadTrades(); 
                await renderSenderCards(); 
                renderReceiverCards(); 
            }, 100);
        }*/
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.updateUI = updateUI;
    window.updatePickaxeVisual = updatePickaxeVisual;
    window.updateBonusUI = updateBonusUI;
    window.updateSoundUI = updateSoundUI;
    window.updateProfileUI = updateProfileUI;
    window.updateAchievements = updateAchievements;
    window.switchSection = switchSection;
    window.showToast = showToast;
    window.showFloatingNumber = showFloatingNumber;
    window.generatePlayerId = generatePlayerId;
    window.copyPlayerId = copyPlayerId;
    window.getStarsHtml = getStarsHtml;
    window.hexToRgb = hexToRgb;
    window.getTotalMultiplier = getTotalMultiplier;
    window.initAudioContext = initAudioContext;
    window.playClickSound = playClickSound;