import { renderQuranHub } from './components/QuranHub.js';
import { renderHadithViewer } from './components/HadithViewer.js';
import { renderAdhanTimes } from './components/AdhanTimes.js';
import { renderSettingsPage, resetSettingsPageState } from './components/SettingsPage.js';
import { renderHomePage } from './components/HomePage.js';
import { renderAITafsir } from './components/AITafsir.js';
import { renderHisnMuslim } from './components/HisnMuslim.js';
import { renderTasbih } from './components/Tasbih.js';
import { renderSeerah } from './components/Seerah.js';
import { QuranIcon, HadithIcon, PrayerIcon, SettingsIcon, AiIcon, ShieldIcon, BeadsIcon, ArrowLeftIcon, ArrowRightIcon, BookOpenIcon } from './components/Icons.js';
import { THEME_COLORS } from './theme.js';
import { initI18n, t, setLanguage as setI18nLanguage } from './i18n.js';

const CACHE = { surahs: null, hubMode: 'read', readerView: 'list' };

const App = (rootElement) => {
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : null;
    };
    
    let state = {
        activeTab: 'home',
        theme: localStorage.getItem('theme') || 'system',
        themeColor: localStorage.getItem('themeColor') || 'sapphire',
        language: localStorage.getItem('language') || 'ar',
        fontSize: localStorage.getItem('fontSize') || 'small',
        arabicFont: localStorage.getItem('arabicFont') || 'noto_naskh_arabic',
        selectedReciter: localStorage.getItem('selectedReciter') || 'ar.alafasy',
        animationsEnabled: localStorage.getItem('animationsEnabled') !== 'false',
        surahListLayout: localStorage.getItem('surahListLayout') || 'grid',
        surahGridCols: localStorage.getItem('surahGridCols') || '3',
        readerDisplayMode: localStorage.getItem('readerDisplayMode') || 'both', // 'both', 'translation'
        debugMode: localStorage.getItem('debugMode') === 'true',
        isReaderMode: false,
        readerConfig: null,
        quranMode: 'read',
        isAiChatOpen: false,
        aiInitialPrompt: null,
    };

    const appContainer = document.createElement('div');
    const header = document.createElement('header');
    const mainContent = document.createElement('main');
    const mobileNav = document.createElement('nav');
    const mobileNavPlaceholder = document.createElement('div');
    const aiChatContainer = document.createElement('div');
    aiChatContainer.id = 'ai-chat-widget-container';

    let currentContentCleanup = null;
    let lastRenderedTab = null;

    const getTabs = () => [
        { id: 'home', label: t('home'), icon: (p) => `<svg class="${p.className}" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" /></svg>`, mobileLabel: t('home') },
        { id: 'quran', label: t('quran'), icon: QuranIcon, mobileLabel: t('quran') },
        { id: 'hadith', label: t('hadith'), icon: HadithIcon, mobileLabel: t('hadithTab') },
        { id: 'hisn', label: t('hisnMuslim'), icon: ShieldIcon, mobileLabel: t('adhkarTab') },
        { id: 'tasbih', label: t('tasbih'), icon: BeadsIcon, mobileLabel: t('tasbihTab') },
        { id: 'seerah', label: t('seerah'), icon: BookOpenIcon, mobileLabel: t('seerahTab') },
        { id: 'adhan', label: t('prayerTimes'), icon: PrayerIcon, mobileLabel: t('adhanTab') },
    ];

    const applyStyles = () => {
        const root = document.documentElement;
        let effectiveTheme = state.theme;
        if (effectiveTheme === 'system') effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.className = effectiveTheme;
        if (!state.animationsEnabled) root.classList.add('animations-disabled');
        
        const colors = THEME_COLORS[state.themeColor] || THEME_COLORS.sapphire;
        Object.entries(colors).forEach(([shade, hex]) => {
            const rgb = hexToRgb(hex);
            if (rgb) root.style.setProperty(`--theme-color-${shade}-rgb`, rgb);
        });
    };

    const renderHeader = () => {
        const isHidden = (state.isReaderMode && state.activeTab === 'quran') || state.activeTab === 'settings';
        header.className = isHidden ? 'hidden' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 transition-all duration-300';
        if (isHidden) return;

        const isHome = state.activeTab === 'home';
        const isRtl = state.language === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        header.innerHTML = `
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16 md:h-20">
                    <div class="flex items-center gap-3">
                        ${!isHome ? `
                            <button id="header-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 transition-all active:scale-90 flex items-center gap-1">
                                ${BackIcon({className: "w-6 h-6"})}
                                <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
                            </button>
                        ` : ''}
                        <h1 class="text-base md:text-lg font-bold text-theme-700 dark:text-theme-400 font-display tracking-tight">${t('appName')}</h1>
                    </div>
                    <nav class="hidden md:flex items-center gap-1 text-sm font-semibold">
                         ${getTabs().map(tab => `
                            <button data-tab="${tab.id}" class="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 ${state.activeTab === tab.id ? 'text-theme-600 dark:text-theme-400 bg-theme-50 dark:bg-theme-900/20' : 'text-slate-600 dark:text-slate-400'}">
                                ${tab.icon({className: "w-5 h-5"})} <span>${tab.label}</span>
                            </button>
                        `).join('')}
                    </nav>
                    <div class="flex items-center gap-2">
                        <button id="header-settings-btn" class="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400 transition-colors">${SettingsIcon({className: "w-6 h-6"})}</button>
                    </div>
                </div>
            </div>`;
        
        header.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { 
            state.activeTab = b.dataset.tab; 
            state.isReaderMode = false;
            render(); 
        }));
        header.querySelector('#header-back-btn')?.addEventListener('click', () => { 
            state.activeTab = 'home'; 
            state.isReaderMode = false;
            render(); 
        });
        header.querySelector('#header-settings-btn')?.addEventListener('click', () => { 
            state.activeTab = 'settings'; 
            render(); 
        });
    };

    const renderMobileNav = () => {
        const isHidden = (state.isReaderMode && state.activeTab === 'quran') || state.activeTab === 'settings';
        mobileNav.className = isHidden ? 'hidden' : 'md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50 transition-all duration-300';
        mobileNavPlaceholder.className = isHidden ? 'hidden' : 'md:hidden h-20';
        if (isHidden) return;

        mobileNav.innerHTML = `
            <div class="flex justify-around items-center h-20 px-2">
                ${getTabs().map(tab => `
                    <button data-tab="${tab.id}" class="flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all ${state.activeTab === tab.id ? 'text-theme-600 dark:text-theme-400' : 'text-slate-400 dark:text-slate-500'}">
                        <div class="p-1.5 rounded-xl ${state.activeTab === tab.id ? 'bg-theme-50 dark:bg-theme-900/20' : ''}">
                            ${tab.icon({className: "w-6 h-6"})}
                        </div>
                        <span class="text-[10px] font-bold tracking-tight">${tab.mobileLabel}</span>
                    </button>`).join('')}
            </div>`;
        mobileNav.querySelectorAll('button').forEach(b => b.addEventListener('click', () => { 
            state.activeTab = b.dataset.tab; 
            state.isReaderMode = false;
            render(); 
        }));
    };

    let lastRenderedLanguage = state.language;

    const renderContent = () => {
        const langChanged = lastRenderedLanguage !== state.language;
        if (lastRenderedTab === state.activeTab && !state.isReaderMode && lastRenderedTab !== 'quran' && lastRenderedTab !== 'settings' && !langChanged) return;
        if (currentContentCleanup) currentContentCleanup();
        mainContent.innerHTML = '';
        mainContent.className = 'container mx-auto px-2 sm:px-4 py-4 md:py-6 pb-24 md:pb-8';
        
        lastRenderedLanguage = state.language;

        const props = {
            ...state,
            setActiveTab: (t) => { state.activeTab = t; render(); },
            setQuranMode: (m) => { state.quranMode = m; },
            setReaderMode: (c) => { state.isReaderMode = !!c; state.readerConfig = c; render(); },
            setTheme: (t) => { state.theme = t; applyStyles(); localStorage.setItem('theme', t); render(); },
            setThemeColor: (c) => { state.themeColor = c; applyStyles(); localStorage.setItem('themeColor', c); render(); },
            setLanguage: (l) => { state.language = l; setI18nLanguage(l); localStorage.setItem('language', l); render(); },
            setArabicFont: (f) => { state.arabicFont = f; applyStyles(); localStorage.setItem('arabicFont', f); render(); },
            setFontSize: (s) => { state.fontSize = s; applyStyles(); localStorage.setItem('fontSize', s); render(); },
            setSurahListLayout: (l) => { state.surahListLayout = l; localStorage.setItem('surahListLayout', l); render(); },
            setSurahGridCols: (c) => { state.surahGridCols = c; localStorage.setItem('surahGridCols', c); render(); },
            setReaderDisplayMode: (m) => { state.readerDisplayMode = m; localStorage.setItem('readerDisplayMode', m); render(); },
            setDebugMode: (d) => { state.debugMode = d; localStorage.setItem('debugMode', d); render(); },
            setAnimationsEnabled: (e) => { state.animationsEnabled = e; applyStyles(); localStorage.setItem('animationsEnabled', e); render(); },
            setSelectedReciter: (r) => { state.selectedReciter = r; localStorage.setItem('selectedReciter', r); render(); },
            onBack: () => { state.activeTab = 'home'; state.isReaderMode = false; render(); }
        };

        switch (state.activeTab) {
            case 'home': currentContentCleanup = renderHomePage(mainContent, props); break;
            case 'quran': currentContentCleanup = renderQuranHub(mainContent, CACHE, props); break;
            case 'hadith': renderHadithViewer(mainContent, props); break;
            case 'hisn': renderHisnMuslim(mainContent, props); break;
            case 'tasbih': renderTasbih(mainContent, props); break;
            case 'seerah': renderSeerah(mainContent, props); break;
            case 'adhan': currentContentCleanup = renderAdhanTimes(mainContent, props); break;
            case 'settings': renderSettingsPage(mainContent, props); break;
        }
        lastRenderedTab = state.activeTab;
    };

    const renderAIChat = () => {
        if (state.isAiChatOpen) {
            if (aiChatContainer.dataset.rendered === 'true' && !state.aiInitialPrompt) return;
            aiChatContainer.dataset.rendered = 'true';
            renderAITafsir(aiChatContainer, {
                onClose: () => { 
                    state.isAiChatOpen = false; 
                    aiChatContainer.dataset.rendered = 'false';
                    renderAIChat(); 
                },
                initialPrompt: state.aiInitialPrompt
            });
            state.aiInitialPrompt = null; // Clear it after passing to widget
        } else {
             aiChatContainer.dataset.rendered = 'false';
             aiChatContainer.innerHTML = `
                <button id="open-ai-chat-btn" class="fixed bottom-20 right-4 md:bottom-8 md:right-8 w-14 h-14 bg-theme-600 text-white rounded-full shadow-lg hover:bg-theme-700 transition-transform z-40 flex items-center justify-center">
                    ${AiIcon()}
                </button>`;
            aiChatContainer.querySelector('#open-ai-chat-btn')?.addEventListener('click', () => {
                state.isAiChatOpen = true; state.aiInitialPrompt = null; renderAIChat();
            });
        }
    };

    const render = () => {
        renderHeader(); renderMobileNav(); renderContent(); renderAIChat();
    };

    initI18n(state.language);
    applyStyles();
    appContainer.className = 'min-h-screen bg-parchment dark:bg-night text-ink transition-colors duration-300';
    [header, mainContent, mobileNavPlaceholder, mobileNav, aiChatContainer].forEach(el => appContainer.appendChild(el));
    rootElement.innerHTML = ''; rootElement.appendChild(appContainer);
    render();

    document.addEventListener('ask-ai-tafsir', (e) => {
        state.isAiChatOpen = true; state.aiInitialPrompt = e.detail.prompt; renderAIChat();
    });
};

export default App;