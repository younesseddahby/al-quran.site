import { renderQuranHub } from './components/QuranHub.js';
import { renderHadithViewer } from './components/HadithViewer.js';
import { renderAdhanTimes } from './components/AdhanTimes.js';
import { renderSettingsPage, resetSettingsPageState } from './components/SettingsPage.js';
import { renderHomePage } from './components/HomePage.js';
import { renderHisnMuslim } from './components/HisnMuslim.js';
import { renderTasbih } from './components/Tasbih.js';
import { renderSeerah } from './components/Seerah.js';
import { renderBookmarks } from './components/Bookmarks.js';
import { renderQuiz } from './components/Quiz.js';
import { renderProphetStories } from './components/ProphetStories.js';
import { renderAsmaUlHusna } from './components/AsmaUlHusna.js';
import { renderQiblaFinder } from './components/QiblaFinder.js';
import { renderAIAssistant } from './components/AIAssistant.js';
import { 
    HomeIcon, QuranIcon, HadithIcon, PrayerIcon, SettingsIcon, ShieldIcon, BeadsIcon, 
    ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, BookmarkIcon, QuizIcon, SparklesIcon
} from './components/Icons.js';
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
        baseTheme: localStorage.getItem('baseTheme') || 'classic',
        language: localStorage.getItem('language') || 'en',
        fontSize: localStorage.getItem('fontSize') || 'small',
        arabicFont: localStorage.getItem('arabicFont') || 'noto_naskh_arabic',
        animationsEnabled: localStorage.getItem('animationsEnabled') !== 'false',
        surahListLayout: localStorage.getItem('surahListLayout') || 'grid',
        surahGridCols: localStorage.getItem('surahGridCols') || '3',
        readerDisplayMode: localStorage.getItem('readerDisplayMode') || 'both', // 'both', 'translation'
        debugMode: localStorage.getItem('debugMode') === 'true',
        bookmarks: JSON.parse(localStorage.getItem('bookmarks') || '{"quran": [], "hadith": []}'),
        isReaderMode: false,
        readerConfig: null,
        quranMode: 'read',
    };

    const appContainer = document.createElement('div');
    const header = document.createElement('header');
    const mainContent = document.createElement('main');
    const mobileNav = document.createElement('nav');
    const mobileNavPlaceholder = document.createElement('div');

    let currentContentCleanup = null;
    let lastRenderedTab = null;

    const getTabs = () => [
        { id: 'home', label: t('home'), icon: HomeIcon, mobileLabel: t('home') },
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
        
        // Remove old base theme classes
        root.classList.remove('theme-classic', 'theme-emerald', 'theme-midnight', 'theme-sepia');
        root.classList.add(`theme-${state.baseTheme}`);
        
        root.className = `${effectiveTheme} theme-${state.baseTheme} ${state.arabicFont}`;
        if (!state.animationsEnabled) root.classList.add('animations-disabled');
        
        const colors = THEME_COLORS[state.themeColor] || THEME_COLORS.sapphire;
        Object.entries(colors).forEach(([shade, hex]) => {
            const rgb = hexToRgb(hex);
            if (rgb) root.style.setProperty(`--theme-color-${shade}-rgb`, rgb);
        });

        // Update theme-color meta tag
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', colors[600] || colors[500]);
        }
    };

    let lastScrollY = window.scrollY;
    let isHeaderVisible = true;

    window.addEventListener('scroll', () => {
        if (state.isReaderMode && state.activeTab === 'quran') {
            const currentScrollY = window.scrollY;
            const readerTopbar = document.getElementById('reader-topbar');
            
            // Always show at the top or when scrolling up
            if (currentScrollY < 50 || currentScrollY < lastScrollY) {
                if (!isHeaderVisible) {
                    header.style.transform = 'translateY(0)';
                    if (readerTopbar) readerTopbar.style.transform = 'translateY(0)';
                    isHeaderVisible = true;
                }
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                if (isHeaderVisible) {
                    header.style.transform = 'translateY(-100%)';
                    if (readerTopbar) readerTopbar.style.transform = 'translateY(-100%)';
                    isHeaderVisible = false;
                }
            }
            lastScrollY = currentScrollY;
        } else {
            header.style.transform = 'translateY(0)';
            const readerTopbar = document.getElementById('reader-topbar');
            if (readerTopbar) readerTopbar.style.transform = 'translateY(0)';
            isHeaderVisible = true;
        }
    }, { passive: true });

    const renderHeader = () => {
        const isHidden = state.activeTab === 'settings' || (state.activeTab === 'quran' && state.isReaderMode);
        header.className = isHidden ? 'hidden' : 'glass sticky top-0 z-40 transition-all duration-500 ease-out border-b border-slate-200/50 dark:border-slate-800/50 animate-fade';
        if (isHidden) return;

        const isHome = state.activeTab === 'home';
        const isRtl = state.language === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        header.innerHTML = `
            <div class="container mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-14 md:h-16">
                    <div class="flex items-center gap-2 md:gap-3">
                        ${!isHome ? `
                            <button id="header-back-btn" class="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 flex items-center gap-1 text-slate-600 dark:text-slate-300">
                                ${BackIcon({className: "w-5 h-5"})}
                            </button>
                        ` : ''}
                        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white font-display tracking-tight">${t('appName')}</h1>
                    </div>
                    <nav class="hidden lg:flex items-center gap-1 text-sm font-medium">
                         ${getTabs().map(tab => `
                            <button data-tab="${tab.id}" class="flex items-center gap-2 px-4 py-1.5 rounded-full transition-all duration-300 ${state.activeTab === tab.id ? 'text-theme-700 dark:text-theme-300 bg-theme-500/15 shadow-sm font-bold ring-1 ring-theme-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}">
                                ${tab.icon({className: "w-4 h-4"})} <span>${tab.label}</span>
                            </button>
                        `).join('')}
                    </nav>
                    <div class="flex items-center gap-2">
                        <button id="header-settings-btn" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90 text-slate-600 dark:text-slate-300">
                            ${SettingsIcon({className: "w-5 h-5"})}
                        </button>
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
        mobileNav.className = isHidden ? 'hidden' : 'lg:hidden fixed bottom-0 left-0 right-0 glass z-50 transition-all duration-500 ease-out border-t border-slate-200/50 dark:border-slate-800/50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.2)] animate-fade';
        mobileNavPlaceholder.className = isHidden ? 'hidden' : 'lg:hidden h-16';
        if (isHidden) return;

        mobileNav.innerHTML = `
            <div class="flex items-center justify-around h-16 px-2 overflow-x-auto hide-scrollbar relative">
                ${getTabs().map(tab => `
                    <button data-tab="${tab.id}" class="relative flex-shrink-0 flex flex-col items-center justify-center w-16 h-full space-y-1 transition-all duration-300 ${state.activeTab === tab.id ? 'text-theme-600 dark:text-theme-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}">
                        <div class="p-1.5 rounded-xl transition-all duration-300 ${state.activeTab === tab.id ? 'bg-theme-500/10' : ''}">
                            ${tab.icon({className: `w-5 h-5 transition-transform duration-300 ${state.activeTab === tab.id ? 'scale-110' : ''}`})}
                        </div>
                        <span class="text-[10px] font-bold tracking-tight truncate w-full text-center transition-all duration-300">${tab.mobileLabel}</span>
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
            setBaseTheme: (b) => { state.baseTheme = b; applyStyles(); localStorage.setItem('baseTheme', b); render(); },
            setThemeColor: (c) => { state.themeColor = c; applyStyles(); localStorage.setItem('themeColor', c); render(); },
            setLanguage: (l) => { state.language = l; setI18nLanguage(l); localStorage.setItem('language', l); render(); },
            setArabicFont: (f) => { state.arabicFont = f; applyStyles(); localStorage.setItem('arabicFont', f); render(); },
            setFontSize: (s) => { state.fontSize = s; applyStyles(); localStorage.setItem('fontSize', s); render(); },
            setSurahListLayout: (l) => { state.surahListLayout = l; localStorage.setItem('surahListLayout', l); render(); },
            setSurahGridCols: (c) => { state.surahGridCols = c; localStorage.setItem('surahGridCols', c); render(); },
            setReaderDisplayMode: (m) => { state.readerDisplayMode = m; localStorage.setItem('readerDisplayMode', m); render(); },
            setDebugMode: (d) => { state.debugMode = d; localStorage.setItem('debugMode', d); render(); },
            setAnimationsEnabled: (e) => { state.animationsEnabled = e; applyStyles(); localStorage.setItem('animationsEnabled', e); render(); },
            navigateTo: ({ surahNumber, ayahNumber }) => {
                state.activeTab = 'quran';
                state.quranMode = 'read';
                CACHE.selectedSurah = { number: surahNumber };
                CACHE.activeAyahForNav = ayahNumber;
                CACHE.readerView = 'reader';
                state.isAIModalOpen = false;
                render();
            },
            toggleBookmark: (type, item) => {
                const bookmarks = { ...state.bookmarks };
                const list = bookmarks[type];
                const index = list.findIndex(b => b.id === item.id);
                if (index > -1) {
                    list.splice(index, 1);
                    window.showToast?.(t('bookmarkRemoved') || 'Removed from bookmarks', 'info');
                } else {
                    list.push(item);
                    window.showToast?.(t('bookmarkAdded') || 'Added to bookmarks', 'success');
                }
                state.bookmarks = bookmarks;
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                render();
            },
            onBack: () => { state.activeTab = 'home'; state.isReaderMode = false; render(); }
        };

        switch (state.activeTab) {
            case 'home': currentContentCleanup = renderHomePage(mainContent, props); break;
            case 'quran': currentContentCleanup = renderQuranHub(mainContent, CACHE, props); break;
            case 'hadith': renderHadithViewer(mainContent, props); break;
            case 'hisn': renderHisnMuslim(mainContent, props); break;
            case 'tasbih': renderTasbih(mainContent, props); break;
            case 'seerah': renderSeerah(mainContent, props); break;
            case 'bookmarks': renderBookmarks(mainContent, props); break;
            case 'quiz': renderQuiz(mainContent, props); break;
            case 'stories': renderProphetStories(mainContent, props); break;
            case 'asma': renderAsmaUlHusna(mainContent, props); break;
            case 'qibla': renderQiblaFinder(mainContent, props); break;
            case 'adhan': currentContentCleanup = renderAdhanTimes(mainContent, props); break;
            case 'settings': renderSettingsPage(mainContent, props); break;
        }
        lastRenderedTab = state.activeTab;
    };

    const renderAIModal = () => {
        const existing = document.getElementById('ai-modal-overlay');
        if (!state.isAIModalOpen) {
            if (existing) existing.remove();
            return;
        }

        if (existing) return;

        const overlay = document.createElement('div');
        overlay.id = 'ai-modal-overlay';
        overlay.className = "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade";
        overlay.innerHTML = `
            <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" id="ai-modal-backdrop"></div>
            <div class="relative w-full max-w-2xl glass rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col h-[85vh] animate-scale-in">
                <div id="ai-modal-content" class="flex-1 overflow-hidden"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        const content = overlay.querySelector('#ai-modal-content');
        renderAIAssistant(content, {
            ...state,
            onBack: () => {
                state.isAIModalOpen = false;
                render();
            },
            navigateTo: (nav) => {
                state.activeTab = 'quran';
                state.quranMode = 'read';
                CACHE.selectedSurah = { number: nav.surahNumber };
                CACHE.activeAyahForNav = nav.ayahNumber;
                CACHE.readerView = 'reader';
                state.isAIModalOpen = false;
                render();
            }
        });

        overlay.querySelector('#ai-modal-backdrop').onclick = () => {
            state.isAIModalOpen = false;
            render();
        };
    };

    const renderFloatingAI = () => {
        const existing = document.getElementById('floating-ai-btn');
        if (existing) existing.remove();

        // Hide if in reader mode
        if (state.isReaderMode && state.activeTab === 'quran') return;

        const btn = document.createElement('button');
        btn.id = 'floating-ai-btn';
        btn.className = "fixed bottom-20 right-4 lg:bottom-8 lg:right-8 w-14 h-14 rounded-2xl bg-theme-500 text-white shadow-2xl shadow-theme-500/40 flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce-subtle group";
        btn.innerHTML = `
            <div class="absolute -top-12 right-0 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-bold px-3 py-1.5 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                ${t('aiAssistant') || 'AI Assistant'}
            </div>
            ${SparklesIcon({className: "w-7 h-7"})}
        `;

        btn.addEventListener('click', () => {
            state.isAIModalOpen = true;
            render();
        });

        document.body.appendChild(btn);
    };

    const render = () => {
        renderHeader(); renderMobileNav(); renderContent(); renderFloatingAI(); renderAIModal();
    };

    initI18n(state.language);
    applyStyles();
    appContainer.className = 'min-h-screen bg-parchment dark:bg-night text-ink transition-colors duration-300';
    [header, mainContent, mobileNavPlaceholder, mobileNav].forEach(el => appContainer.appendChild(el));
    rootElement.innerHTML = ''; rootElement.appendChild(appContainer);

    // Global Event Listeners
    window.addEventListener('ask-ai-tafsir', (e) => {
        const { surahName, ayahNum, text } = e.detail;
        window.aiAssistantInitialPrompt = `Please explain this verse: Surah ${surahName} (${ayahNum}). The text is: "${text}"`;
        state.isAIModalOpen = true;
        render();
    });

    render();
};

export default App;
