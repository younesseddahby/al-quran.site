import { 
    CloseIcon, SunIcon, MoonIcon, SystemThemeIcon, FacebookIcon, InstagramIcon, TelegramIcon, XIcon, GithubIcon, EmailIcon, UserIcon,
    CheckIcon, GridViewIcon, ListViewIcon, ArrowLeftIcon, ArrowRightIcon, BookOpenIcon
} from './Icons.js';
import { t, getCurrentLanguage } from '../i18n.js';




let playerSearchQuery = '';

export const resetSettingsPageState = () => {
    playerSearchQuery = '';
};

export const renderSettingsPage = (container, props) => {
    const { 
        theme, setTheme, themeColor, setThemeColor, baseTheme, setBaseTheme, language, setLanguage,
        readerDisplayMode, setReaderDisplayMode,
        animationsEnabled, setAnimationsEnabled, onBack 
    } = props;

    const render = () => {
        const isRtl = getCurrentLanguage() === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        container.innerHTML = `
            <div class="fade-in min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
                <header class="sticky top-0 z-30 glass border-b border-slate-200/50 dark:border-slate-800/50">
                    <div class="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <button id="main-back-btn" class="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 border border-slate-200">
                                ${BackIcon({className: "w-5 h-5"})}
                            </button>
                            <div>
                                <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white">${t('settings')}</h1>
                                <p class="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">${t('customizeExperience') || 'Customize your experience'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main class="max-w-5xl mx-auto px-4 py-6 md:py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <!-- Left Column: Navigation/Sections -->
                        <div class="lg:col-span-4 space-y-4">
                                <div>
                                    <h2 class="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-6 px-2">${t('sections') || 'Sections'}</h2>
                                    <nav class="space-y-1.5">
                                        ${renderNavButton('language', t('languageAndText'), BookOpenIcon({className: "w-4 h-4"}), true)}
                                        ${renderNavButton('interface', t('uiSettings'), GridViewIcon({className: "w-4 h-4"}))}
                                    </nav>
                                    <div class="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <button id="reset-settings-btn" class="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg text-slate-500 font-bold text-[11px] uppercase tracking-wider hover:bg-slate-100 transition-colors border border-slate-200">
                                            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                            ${t('resetToDefaults') || 'Reset to Defaults'}
                                        </button>
                                    </div>
                                </div>
                        </div>

                        <!-- Right Column: Content -->
                        <div class="lg:col-span-8 space-y-8">

                            <!-- Language & Text Section -->
                            <section id="section-language" class="scroll-mt-24 space-y-4">
                                <div class="flex items-center gap-3 px-2">
                                    <div class="w-8 h-8 rounded-xl bg-theme-500/10 flex items-center justify-center text-theme-600 dark:text-theme-400 shadow-sm border border-theme-500/10">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                    </div>
                                    <h2 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">${t('languageAndText')}</h2>
                                </div>
                                <div class="divide-y divide-slate-200 dark:divide-slate-800">
                                    ${renderSettingItem(t('language'), t('appLanguageSubtitle') || 'Select your preferred app language', renderLanguageSelector())}
                                    ${language !== 'ar' ? renderSettingItem(t('readerSettings'), t('readerSettingsSubtitle') || 'Configure how the Quran is displayed', renderReaderSettingsSelector()) : ''}
                                </div>
                            </section>

                            <!-- Interface Section -->
                            <section id="section-interface" class="scroll-mt-24 space-y-4">
                                <div class="flex items-center gap-3 px-2">
                                    <div class="w-8 h-8 rounded-xl bg-theme-500/10 flex items-center justify-center text-theme-600 dark:text-theme-400 shadow-sm border border-theme-500/10">
                                        ${GridViewIcon({className: "w-4 h-4"})}
                                    </div>
                                    <h2 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight">${t('uiSettings')}</h2>
                                </div>
                                <div class="divide-y divide-slate-200 dark:divide-slate-800">
                                    ${renderSettingItem(t('interfaceAnimations'), t('interfaceAnimationsSubtitle'), renderAnimationsToggle())}
                                </div>
                            </section>

                            <!-- Footer -->
                            <div class="pt-4 pb-2 text-center space-y-3">
                                <p class="text-sm font-medium text-slate-500">Made with love for the global Muslim community.</p>
                                <div class="flex items-center justify-center gap-5">
                                    <a href="https://github.com/younesseddahby" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-theme-600 transition-colors">
                                        ${GithubIcon({className: "w-4 h-4"})} GitHub
                                    </a>
                                    <a href="mailto:youness@eddahby.dev" class="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-theme-600 transition-colors">
                                        ${EmailIcon({className: "w-4 h-4"})} youness@eddahby.dev
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
        attachEventListeners();
    };

    const renderNavButton = (id, label, icon, isActive = false) => `
        <button data-section="${id}" class="section-nav-btn w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-slate-50 ${isActive ? 'text-theme-600 bg-theme-500/10' : 'text-slate-600'} font-bold text-xs group">
            <span class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                ${icon}
            </span>
            ${label}
        </button>
    `;

    const renderSettingItem = (title, subtitle, controlHTML) => `
        <div class="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <div class="min-w-0 flex-grow">
                <h4 class="font-bold text-slate-900 dark:text-white text-xs md:text-sm">${title}</h4>
                ${subtitle ? `<p class="text-[11px] md:text-xs text-slate-500 mt-0.5 font-medium">${subtitle}</p>` : ''}
            </div>
            <div class="flex-shrink-0">
                ${controlHTML}
            </div>
        </div>
    `;

    // --- Component HTML Generators ---
    

    

    const renderAnimationsToggle = () => `
        <button id="animations-toggle" class="w-14 h-8 rounded-full transition-colors relative ${animationsEnabled ? 'bg-theme-600 shadow-sm' : 'bg-slate-300'}">
            <div class="absolute top-1 start-1 w-6 h-6 rounded-full bg-white transition-transform ${animationsEnabled ? 'ltr:translate-x-6 rtl:-translate-x-6' : ''} shadow-sm"></div>
        </button>
    `;

    
    const renderLanguageSelector = () => `
        <div class="divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden">
            ${['ar', 'en', 'id', 'tr'].map(l => `
                <button data-lang="${l}" class="lang-btn w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${language === l ? 'text-theme-600' : 'text-slate-700 hover:bg-slate-50'}">
                    <span>${l === 'ar' ? 'العربية' : l === 'en' ? 'English' : l === 'id' ? 'Indonesia' : 'Türkçe'}</span>
                    ${language === l ? '<span>✓</span>' : ''}
                </button>
            `).join('')}
        </div>
    `;

    const renderReaderSettingsSelector = () => `
        <div class="divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden">
            <button data-mode="translation" class="mode-btn w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${readerDisplayMode === 'translation' ? 'text-theme-600' : 'text-slate-700 hover:bg-slate-50'}">
                <span>${t('translationOnly')}</span>
                ${readerDisplayMode === 'translation' ? '<span>✓</span>' : ''}
            </button>
            <button data-mode="both" class="mode-btn w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${readerDisplayMode === 'both' ? 'text-theme-600' : 'text-slate-700 hover:bg-slate-50'}">
                <span>${t('showBoth')}</span>
                ${readerDisplayMode === 'both' ? '<span>✓</span>' : ''}
            </button>
        </div>
    `;

    
    
    // --- Event Listeners ---
    const attachEventListeners = () => {
        container.querySelector('#main-back-btn')?.addEventListener('click', onBack);
        
        container.querySelectorAll('.section-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                container.querySelectorAll('.section-nav-btn').forEach(b => {
                    b.classList.remove('text-theme-600', 'bg-theme-500/10');
                    b.classList.add('text-slate-600');
                });
                btn.classList.remove('text-slate-600');
                btn.classList.add('text-theme-600', 'bg-theme-500/10');
                const sectionId = btn.dataset.section;
                const element = container.querySelector(`#section-${sectionId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        container.querySelector('#animations-toggle')?.addEventListener('click', () => setAnimationsEnabled(!animationsEnabled));
        
        container.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));
        
        container.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', () => setReaderDisplayMode(btn.dataset.mode)));

        container.querySelector('#reset-settings-btn')?.addEventListener('click', () => {
            if (confirm(t('confirmResetSettings') || 'Are you sure you want to reset all settings to default?')) {
                localStorage.clear();
                window.location.reload();
            }
        });
    };

    render();
};
