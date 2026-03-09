import { 
    CloseIcon, SunIcon, MoonIcon, SystemThemeIcon, FacebookIcon, InstagramIcon, TelegramIcon, XIcon, WhatsappIcon, EmailIcon, UserIcon,
    CheckIcon, GridViewIcon, ListViewIcon, ArrowLeftIcon, ArrowRightIcon, BookOpenIcon
} from './Icons.js';
import { t, getCurrentLanguage } from '../i18n.js';

const colors = [
    { name: 'amber', bgClass: 'bg-amber-500', ringClass: 'ring-amber-500' },
    { name: 'ruby', bgClass: 'bg-rose-500', ringClass: 'ring-rose-500' },
    { name: 'sapphire', bgClass: 'bg-blue-500', ringClass: 'ring-blue-500' },
    { name: 'jade', bgClass: 'bg-emerald-500', ringClass: 'ring-emerald-500' },
];

const socialLinks = [
    { href: 'https://www.facebook.com/yns.dhb', icon: FacebookIcon({className: "w-5 h-5"}), label: 'Facebook' },
    { href: 'https://www.instagram.com/youness_eddahby', icon: InstagramIcon({className: "w-5 h-5"}), label: 'Instagram' },
    { href: 'https://t.me/youness_eddahby', icon: TelegramIcon({className: "w-5 h-5"}), label: 'Telegram' },
    { href: 'https://x.com/YounessEddahby', icon: XIcon({className: "w-5 h-5"}), label: 'Twitter/X' },
    { href: 'https://wa.me/qr/FCEFAKNUJNCIF1', icon: WhatsappIcon({className: "w-5 h-5"}), label: 'WhatsApp' },
];

const getContactInfo = () => [
    { icon: UserIcon(), label: 'Youness Eddahby' },
];

const getArabicFonts = () => [
    { id: 'noto_naskh_arabic', name: t('font_noto_naskh_arabic') },
    { id: 'amiri', name: t('font_amiri') },
    { id: 'scheherazade', name: t('font_scheherazade') },
    { id: 'reem_kufi', name: t('font_reem_kufi') },
    { id: 'vazirmatn', name: 'Vazirmatn' },
    { id: 'lateef', name: t('font_lateef') },
    { id: 'alkalami', name: t('font_alkalami') },
    { id: 'gulzar', name: 'Gulzar' },
    { id: 'cairo', name: t('font_cairo') },
    { id: 'almarai', name: t('font_almarai') },
    { id: 'tajawal', name: t('font_tajawal') },
    { id: 'el_messiri', name: t('font_el_messiri') },
    { id: 'changa', name: t('font_changa') },
    { id: 'mada', name: t('font_mada') },
    { id: 'harmattan', name: t('font_harmattan') },
    { id: 'lalezar', name: t('font_lalezar') },
    { id: 'kufam', name: t('font_kufam') },
    { id: 'aref_ruqaa', name: t('font_aref_ruqaa') },
    { id: 'mirza', name: t('font_mirza') },
];

let playerSearchQuery = '';

export const resetSettingsPageState = () => {
    playerSearchQuery = '';
};

export const renderSettingsPage = (container, props) => {
    const { 
        theme, setTheme, themeColor, setThemeColor, baseTheme, setBaseTheme, language, setLanguage,
        fontSize, setFontSize,
        arabicFont, setArabicFont, surahListLayout, setSurahListLayout, surahGridCols, setSurahGridCols,
        readerDisplayMode, setReaderDisplayMode, debugMode, setDebugMode,
        animationsEnabled, setAnimationsEnabled, onBack 
    } = props;

    const render = () => {
        const isRtl = getCurrentLanguage() === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        container.innerHTML = `
            <div class="fade-in min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
                <header class="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
                    <div class="max-w-5xl mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <button id="main-back-btn" class="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 text-slate-600 dark:text-slate-300">
                                ${BackIcon({className: "w-6 h-6"})}
                            </button>
                            <div>
                                <h1 class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">${t('settings')}</h1>
                                <p class="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">${t('customizeExperience') || 'Customize your experience'}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main class="max-w-5xl mx-auto px-4 py-8 md:py-12">
                    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <!-- Left Column: Navigation/Sections -->
                        <div class="lg:col-span-4 space-y-4">
                            <div class="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-28">
                                <h2 class="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 px-2">${t('sections') || 'Sections'}</h2>
                                <nav class="space-y-1">
                                    ${renderNavButton('appearance', t('appearance'), SunIcon({className: "w-5 h-5"}))}
                                    ${renderNavButton('language', t('languageAndText'), BookOpenIcon({className: "w-5 h-5"}))}
                                    ${renderNavButton('interface', t('uiSettings'), GridViewIcon({className: "w-5 h-5"}))}
                                    ${renderNavButton('about', t('about'), UserIcon({className: "w-5 h-5"}))}
                                </nav>
                                <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                                    <button id="reset-settings-btn" class="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-bold text-sm hover:bg-rose-100 dark:hover:bg-rose-900/20 transition-all active:scale-95">
                                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        ${t('resetToDefaults') || 'Reset to Defaults'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Right Column: Content -->
                        <div class="lg:col-span-8 space-y-10">
                            <!-- Appearance Section -->
                            <section id="section-appearance" class="scroll-mt-28 space-y-6">
                                <div class="flex items-center gap-3 px-2">
                                    <div class="w-10 h-10 rounded-2xl bg-theme-100 dark:bg-theme-900/30 flex items-center justify-center text-theme-600 dark:text-theme-400 shadow-sm">
                                        ${SunIcon({className: "w-6 h-6"})}
                                    </div>
                                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">${t('appearance')}</h2>
                                </div>
                                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                                    ${renderSettingItem(t('theme'), t('themeSettingsSubtitle'), renderThemeSelector())}
                                    ${renderSettingItem(t('colorTheme'), t('colorThemeSubtitle'), renderBaseThemeSelector())}
                                    ${renderSettingItem(t('accentColor'), t('accentColorSubtitle') || 'Choose your favorite highlight color', renderAccentColorSelector())}
                                    ${renderSettingItem(t('interfaceAnimations'), t('interfaceAnimationsSubtitle'), renderAnimationsToggle())}
                                </div>
                            </section>

                            <!-- Language & Text Section -->
                            <section id="section-language" class="scroll-mt-28 space-y-6">
                                <div class="flex items-center gap-3 px-2">
                                    <div class="w-10 h-10 rounded-2xl bg-theme-100 dark:bg-theme-900/30 flex items-center justify-center text-theme-600 dark:text-theme-400 shadow-sm">
                                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                                    </div>
                                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">${t('languageAndText')}</h2>
                                </div>
                                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                                    ${renderSettingItem(t('language'), t('appLanguageSubtitle') || 'Select your preferred app language', renderLanguageSelector())}
                                    ${language !== 'ar' ? renderSettingItem(t('readerSettings'), t('readerSettingsSubtitle') || 'Configure how the Quran is displayed', renderReaderSettingsSelector()) : ''}
                                    ${renderSettingItem(t('arabicFont'), t('arabicFontSubtitle') || 'Choose a font for Arabic text', renderArabicFontSelector())}
                                    ${renderSettingItem(t('fontSize'), t('fontSizeSubtitle') || 'Adjust text size for better readability', renderFontSizeSelector())}
                                </div>
                            </section>

                            <!-- Interface Section -->
                            <section id="section-interface" class="scroll-mt-28 space-y-6">
                                <div class="flex items-center gap-3 px-2">
                                    <div class="w-10 h-10 rounded-2xl bg-theme-100 dark:bg-theme-900/30 flex items-center justify-center text-theme-600 dark:text-theme-400 shadow-sm">
                                        ${GridViewIcon({className: "w-6 h-6"})}
                                    </div>
                                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">${t('uiSettings')}</h2>
                                </div>
                                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                                    <div class="p-6 md:p-8">
                                        <h4 class="font-bold text-slate-900 dark:text-white mb-4">${t('surahListLayout')}</h4>
                                        ${renderSurahLayoutSelector()}
                                    </div>
                                    ${renderSettingItem('Debug Mode', 'Show technical details for troubleshooting', renderDebugToggle())}
                                </div>
                            </section>

                            <!-- About Section -->
                            <section id="section-about" class="scroll-mt-28 space-y-6">
                                <div class="flex items-center gap-3 px-2">
                                    <div class="w-10 h-10 rounded-2xl bg-theme-100 dark:bg-theme-900/30 flex items-center justify-center text-theme-600 dark:text-theme-400 shadow-sm">
                                        ${UserIcon({className: "w-6 h-6"})}
                                    </div>
                                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white">${t('about')}</h2>
                                </div>
                                <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-6 md:p-10">
                                    ${renderAboutInfo()}
                                </div>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        `;
        attachEventListeners();
    };

    const renderNavButton = (id, label, icon) => `
        <button data-section="${id}" class="section-nav-btn w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 font-bold text-sm">
            <span class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shadow-sm">
                ${icon}
            </span>
            ${label}
        </button>
    `;

    const renderSettingItem = (title, subtitle, controlHTML) => `
        <div class="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="min-w-0 flex-grow">
                <h4 class="font-bold text-slate-900 dark:text-white text-base md:text-lg">${title}</h4>
                ${subtitle ? `<p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">${subtitle}</p>` : ''}
            </div>
            <div class="flex-shrink-0">
                ${controlHTML}
            </div>
        </div>
    `;

    // --- Component HTML Generators ---
    
    const renderThemeSelector = () => `
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.25rem] shadow-inner">
            <button data-theme="light" class="theme-btn flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${theme === 'light' ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-md' : 'text-slate-500'}">
                ${SunIcon({className: "w-4 h-4"})} <span class="text-xs font-bold">${t('light')}</span>
            </button>
            <button data-theme="dark" class="theme-btn flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${theme === 'dark' ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-md' : 'text-slate-500'}">
                ${MoonIcon({className: "w-4 h-4"})} <span class="text-xs font-bold">${t('dark')}</span>
            </button>
            <button data-theme="system" class="theme-btn flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-md' : 'text-slate-500'}">
                ${SystemThemeIcon({className: "w-4 h-4"})} <span class="text-xs font-bold">${t('system')}</span>
            </button>
        </div>
    `;

    const renderBaseThemeSelector = () => `
        <select class="base-theme-select bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold py-3 px-5 rounded-2xl border-none focus:ring-2 focus:ring-theme-500 shadow-sm min-w-[160px]">
            <option value="classic" ${baseTheme === 'classic' ? 'selected' : ''}>✨ ${t('themeClassic')}</option>
            <option value="emerald" ${baseTheme === 'emerald' ? 'selected' : ''}>🌿 ${t('themeEmerald')}</option>
            <option value="midnight" ${baseTheme === 'midnight' ? 'selected' : ''}>🌙 ${t('themeMidnight')}</option>
            <option value="sepia" ${baseTheme === 'sepia' ? 'selected' : ''}>📜 ${t('themeSepia')}</option>
        </select>
    `;
    
    const renderAccentColorSelector = () => {
        const availableColors = [
            { name: 'amber', bg: 'bg-amber-500' },
            { name: 'ruby', bg: 'bg-rose-500' },
            { name: 'sapphire', bg: 'bg-blue-500' },
            { name: 'jade', bg: 'bg-emerald-500' },
            { name: 'violet', bg: 'bg-violet-500' },
            { name: 'rose', bg: 'bg-rose-500' },
            { name: 'orange', bg: 'bg-orange-500' },
            { name: 'slate', bg: 'bg-slate-500' }
        ];
        return `
            <div class="flex flex-wrap items-center justify-end gap-3 max-w-[200px]">
                ${availableColors.map(c => `
                    <button data-color="${c.name}" class="color-btn w-8 h-8 rounded-full ${c.bg} ring-offset-4 dark:ring-offset-slate-900 ${themeColor === c.name ? 'ring-2 ring-slate-400 scale-110 shadow-lg' : 'hover:scale-110'} transition-all active:scale-90"></button>
                `).join('')}
            </div>
        `;
    };

    const renderAnimationsToggle = () => `
        <button id="animations-toggle" class="w-14 h-8 rounded-full transition-all relative ${animationsEnabled ? 'bg-theme-600 shadow-lg shadow-theme-500/20' : 'bg-slate-300 dark:bg-slate-700'}">
            <div class="absolute top-1 start-1 w-6 h-6 rounded-full bg-white transition-transform ${animationsEnabled ? 'ltr:translate-x-6 rtl:-translate-x-6' : ''} shadow-sm"></div>
        </button>
    `;

    const renderDebugToggle = () => `
        <button id="debug-toggle" class="w-14 h-8 rounded-full transition-all relative ${debugMode ? 'bg-theme-600 shadow-lg shadow-theme-500/20' : 'bg-slate-300 dark:bg-slate-700'}">
            <div class="absolute top-1 start-1 w-6 h-6 rounded-full bg-white transition-transform ${debugMode ? 'ltr:translate-x-6 rtl:-translate-x-6' : ''} shadow-sm"></div>
        </button>
    `;
    
    const renderLanguageSelector = () => `
        <div class="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.25rem]">
            ${['ar', 'en', 'id', 'tr'].map(l => `
                <button data-lang="${l}" class="lang-btn px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${language === l ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-md' : 'text-slate-500'}">
                    ${l === 'ar' ? 'العربية' : l === 'en' ? 'English' : l === 'id' ? 'Indonesia' : 'Türkçe'}
                </button>
            `).join('')}
        </div>
    `;

    const renderReaderSettingsSelector = () => `
        <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.25rem]">
            <button data-mode="translation" class="mode-btn px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${readerDisplayMode === 'translation' ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-md' : 'text-slate-500'}">${t('translationOnly')}</button>
            <button data-mode="both" class="mode-btn px-5 py-2.5 text-xs font-bold rounded-xl transition-all ${readerDisplayMode === 'both' ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-md' : 'text-slate-500'}">${t('showBoth')}</button>
        </div>
    `;

    const renderArabicFontSelector = () => `
        <select class="arabic-font-select bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold py-3 px-5 rounded-2xl border-none focus:ring-2 focus:ring-theme-500 shadow-sm min-w-[200px]">
            ${getArabicFonts().map(f => `<option value="${f.id}" ${arabicFont === f.id ? 'selected' : ''}>${f.name}</option>`).join('')}
        </select>
    `;

    const renderFontSizeSelector = () => {
        const sizes = [
            { id: 'x-small', label: 'XS' },
            { id: 'small', label: 'S' },
            { id: 'medium', label: 'M' },
            { id: 'large', label: 'L' },
            { id: 'x-large', label: 'XL' },
            { id: 'xx-large', label: '2XL' },
            { id: 'xxx-large', label: '3XL' }
        ];
        return `
            <div class="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[1.25rem]">
                ${sizes.map(s => `
                    <button data-size="${s.id}" class="font-size-btn w-10 h-10 flex items-center justify-center rounded-xl text-[10px] font-bold transition-all ${fontSize === s.id ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-md scale-110' : 'text-slate-500'}">
                        ${s.label}
                    </button>
                `).join('')}
            </div>
        `;
    };

    const renderSurahLayoutSelector = () => `
        <div class="space-y-6">
            <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-3">
                    <button data-layout="grid" class="layout-btn flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${surahListLayout === 'grid' ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-lg' : 'text-slate-500'}">
                        ${GridViewIcon({className: "w-5 h-5"})} <span class="text-sm font-bold">${t('grid') || 'Grid'}</span>
                    </button>
                    <button data-layout="list" class="layout-btn flex items-center gap-2 px-6 py-3 rounded-2xl transition-all ${surahListLayout === 'list' ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-lg' : 'text-slate-500'}">
                        ${ListViewIcon({className: "w-5 h-5"})} <span class="text-sm font-bold">${t('list') || 'List'}</span>
                    </button>
                </div>
                ${surahListLayout === 'grid' ? `
                    <div class="flex items-center bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-xl">
                        ${['2','3','4'].map(c => `
                            <button data-cols="${c}" class="grid-cols-btn w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${surahGridCols === c ? 'bg-white dark:bg-slate-700 text-theme-600 shadow-sm' : 'text-slate-500'}">${c}</button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    const renderAboutInfo = () => `
        <div class="space-y-8">
            <div class="flex items-center gap-6">
                <div class="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-theme-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-theme-500/20">Y</div>
                <div>
                    <h4 class="text-xl font-bold text-slate-900 dark:text-white">Youness Eddahby</h4>
                    <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Full Stack Developer & Designer</p>
                    <div class="flex items-center gap-2 mt-2">
                        <span class="px-2 py-0.5 rounded-md bg-theme-50 dark:bg-theme-900/20 text-[10px] font-bold text-theme-600 dark:text-theme-400 uppercase tracking-wider border border-theme-100 dark:border-theme-900/30">v1.2.0</span>
                    </div>
                </div>
            </div>
            <div class="grid grid-cols-5 gap-3">
                ${socialLinks.map(link => `
                    <a href="${link.href}" target="_blank" class="flex items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-theme-600 hover:text-white dark:hover:bg-theme-600 transition-all active:scale-90 shadow-sm border border-slate-100 dark:border-slate-800" title="${link.label}">
                        ${link.icon}
                    </a>
                `).join('')}
            </div>
            <div class="pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                <p class="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">${t('madeWithLove')}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">© 2024 The Holy Quran App. All rights reserved.</p>
            </div>
        </div>
    `;
    
    // --- Event Listeners ---
    const attachEventListeners = () => {
        container.querySelector('#main-back-btn')?.addEventListener('click', onBack);
        
        container.querySelectorAll('.section-nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sectionId = btn.dataset.section;
                const element = container.querySelector(`#section-${sectionId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        container.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', () => setTheme(btn.dataset.theme)));
        container.querySelector('.base-theme-select')?.addEventListener('change', (e) => setBaseTheme(e.target.value));
        container.querySelectorAll('.color-btn').forEach(btn => btn.addEventListener('click', () => setThemeColor(btn.dataset.color)));
        container.querySelector('#animations-toggle')?.addEventListener('click', () => setAnimationsEnabled(!animationsEnabled));
        container.querySelector('#debug-toggle')?.addEventListener('click', () => setDebugMode(!debugMode));
        
        container.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));
        
        container.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', () => setReaderDisplayMode(btn.dataset.mode)));
        container.querySelectorAll('.layout-btn').forEach(btn => btn.addEventListener('click', () => setSurahListLayout(btn.dataset.layout)));
        container.querySelectorAll('.grid-cols-btn').forEach(btn => btn.addEventListener('click', () => setSurahGridCols(btn.dataset.cols)));
        
        container.querySelector('.arabic-font-select')?.addEventListener('change', (e) => setArabicFont(e.target.value));
        container.querySelectorAll('.font-size-btn').forEach(btn => btn.addEventListener('click', () => setFontSize(btn.dataset.size)));

        container.querySelector('#reset-settings-btn')?.addEventListener('click', () => {
            if (confirm(t('confirmResetSettings') || 'Are you sure you want to reset all settings to default?')) {
                localStorage.clear();
                window.location.reload();
            }
        });
    };

    render();
};
