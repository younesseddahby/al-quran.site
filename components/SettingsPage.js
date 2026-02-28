import { 
    CloseIcon, SunIcon, MoonIcon, SystemThemeIcon, FacebookIcon, InstagramIcon, TelegramIcon, XIcon, WhatsappIcon, EmailIcon, UserIcon,
    CheckIcon, GridViewIcon, ListViewIcon, ArrowLeftIcon, ArrowRightIcon
} from './Icons.js';
import { t, getCurrentLanguage } from '../i18n.js';
import { RECITERS } from './QuranData.js';

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
        theme, setTheme, themeColor, setThemeColor, language, setLanguage,
        fontSize, setFontSize,
        arabicFont, setArabicFont, surahListLayout, setSurahListLayout, surahGridCols, setSurahGridCols,
        readerDisplayMode, setReaderDisplayMode, debugMode, setDebugMode,
        selectedReciter, setSelectedReciter,
        animationsEnabled, setAnimationsEnabled, onBack 
    } = props;

    const render = () => {
        const isRtl = getCurrentLanguage() === 'ar';
        const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

        container.innerHTML = `
            <div class="fade-in">
                <header class="flex items-center justify-between p-4 sticky top-0 bg-parchment/80 dark:bg-night/80 backdrop-blur-xl z-10 border-b border-line dark:border-line-dark">
                    <div class="flex items-center gap-3">
                        <button id="main-back-btn" aria-label="Back" class="p-2 -ml-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-all active:scale-90 flex items-center gap-1">
                            ${BackIcon({className: "w-6 h-6"})}
                            <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
                        </button>
                        <h1 class="text-2xl font-bold font-display text-ink dark:text-cream">${t('settings')}</h1>
                    </div>
                </header>
 
                <main class="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
                    ${renderSection(t('appearance'), [
                        renderThemeSelector(),
                        renderAccentColorSelector(),
                        renderAnimationsToggle()
                    ])}
                    ${renderSection(t('languageAndText'), [
                        renderLanguageSelector(),
                        language !== 'ar' ? renderReaderSettingsSelector() : ''
                    ])}
                    ${renderSection(t('uiSettings'), [
                        renderSurahLayoutSelector(),
                        renderDebugToggle()
                    ])}
                    ${renderSection(t('playerSettings'), [
                        renderReciterSelector()
                    ])}
                    ${renderSection(t('about'), [
                        renderAboutInfo()
                    ])}
                </main>
            </div>
        `;
        attachEventListeners();
    };

    const renderSection = (title, contentItems) => `
        <section class="space-y-4">
            <h2 class="text-xl font-bold font-display text-ink dark:text-cream border-b border-line dark:border-line-dark pb-2">${title}</h2>
            <div class="space-y-4">
                ${contentItems.join('')}
            </div>
        </section>
    `;
    
    const renderSettingItem = (title, subtitle, controlHTML) => `
        <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-parchment dark:bg-night rounded-lg border border-line dark:border-line-dark gap-4">
            <div>
                <h4 class="font-semibold text-ink dark:text-cream">${title}</h4>
                <p class="text-sm text-ink/70 dark:text-cream/70">${subtitle}</p>
            </div>
            <div>
                ${controlHTML}
            </div>
        </div>
    `;

    // --- Component HTML Generators ---
    
    const renderThemeSelector = () => renderSettingItem(t('theme'), t('themeSettingsSubtitle'), `
        <div class="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button data-theme="light" class="theme-btn px-3 py-1.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">${SunIcon()} ${t('themeLight')}</button>
            <button data-theme="dark" class="theme-btn px-3 py-1.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">${MoonIcon()} ${t('themeDark')}</button>
            <button data-theme="system" class="theme-btn px-3 py-1.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 ${theme === 'system' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">${SystemThemeIcon()} ${t('themeSystem')}</button>
        </div>
    `);
    
    const renderAccentColorSelector = () => renderSettingItem(t('accentColor'), t('themeSettingsSubtitle'), `
        <div class="flex gap-4">
            ${colors.map(color => `
                <button data-color="${color.name}" aria-label="Set accent color to ${color.name}" class="color-btn w-8 h-8 rounded-full ${color.bgClass} flex items-center justify-center transition-transform transform hover:scale-110 focus:outline-none ${themeColor === color.name ? `ring-2 ring-offset-2 ring-offset-parchment dark:ring-offset-night ${color.ringClass}` : ''}">
                    ${themeColor === color.name ? CheckIcon() : ''}
                </button>
            `).join('')}
        </div>
    `);

    const renderAnimationsToggle = () => renderSettingItem(t('interfaceAnimations'), t('interfaceAnimationsSubtitle'), `
        <button id="animations-toggle" role="switch" aria-checked="${animationsEnabled}" class="${animationsEnabled ? 'bg-theme-600' : 'bg-neutral-300 dark:bg-neutral-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out">
            <span class="${animationsEnabled ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'} pointer-events-none h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
        </button>
    `);

    const renderDebugToggle = () => renderSettingItem('Debug Mode', 'Show technical details in error messages', `
        <button id="debug-toggle" role="switch" aria-checked="${debugMode}" class="${debugMode ? 'bg-theme-600' : 'bg-neutral-300 dark:bg-neutral-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out">
            <span class="${debugMode ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'} pointer-events-none h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
        </button>
    `);
    
    const renderLanguageSelector = () => renderSettingItem(t('language'), '', `
        <div class="flex flex-wrap items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg gap-1">
           <button data-lang="en" class="lang-btn px-3 py-1.5 text-sm font-semibold rounded-md ${language === 'en' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">English</button>
           <button data-lang="ar" class="lang-btn px-3 py-1.5 text-sm font-semibold rounded-md ${language === 'ar' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">العربية</button>
           <button data-lang="id" class="lang-btn px-3 py-1.5 text-sm font-semibold rounded-md ${language === 'id' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">Indonesia</button>
           <button data-lang="tr" class="lang-btn px-3 py-1.5 text-sm font-semibold rounded-md ${language === 'tr' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">Türkçe</button>
        </div>
    `);

    const renderReaderSettingsSelector = () => renderSettingItem(t('readerSettings'), '', `
        <div class="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg">
            <button data-mode="translation" class="mode-btn px-3 py-1.5 text-sm font-semibold rounded-md ${readerDisplayMode === 'translation' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">${t('readOnlyTranslation')}</button>
            <button data-mode="both" class="mode-btn px-3 py-1.5 text-sm font-semibold rounded-md ${readerDisplayMode === 'both' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">${t('readArabicTranslation')}</button>
        </div>
    `);


    const renderSurahLayoutSelector = () => {
       const gridColsSelector = surahListLayout === 'grid' ? `
            <div class="mt-4 pt-4 border-t border-line dark:border-line-dark flex items-center justify-between">
                <p class="text-sm text-ink/70 dark:text-cream/70">${t('surahGridColsSubtitle')}</p>
                <div class="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                    <button data-cols="2" class="grid-cols-btn flex-1 py-1 px-3 text-sm font-semibold rounded-md ${surahGridCols === '2' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">2</button>
                    <button data-cols="3" class="grid-cols-btn flex-1 py-1 px-3 text-sm font-semibold rounded-md ${surahGridCols === '3' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">3</button>
                    <button data-cols="4" class="grid-cols-btn flex-1 py-1 px-3 text-sm font-semibold rounded-md ${surahGridCols === '4' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">4</button>
                </div>
            </div>
        ` : '';
        
        return `<div class="p-4 bg-parchment dark:bg-night rounded-lg border border-line dark:border-line-dark">
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="font-semibold text-ink dark:text-cream">${t('surahListLayout')}</h4>
                    <p class="text-sm text-ink/70 dark:text-cream/70">${t('surahListLayoutSubtitle')}</p>
                </div>
                <div class="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                    <button data-layout="grid" class="layout-btn p-1.5 rounded-md ${surahListLayout === 'grid' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">${GridViewIcon()}</button>
                    <button data-layout="list" class="layout-btn p-1.5 rounded-md ${surahListLayout === 'list' ? 'bg-amber-50 dark:bg-neutral-700 text-theme-600' : 'text-ink/60 dark:text-cream/60'}">${ListViewIcon()}</button>
                </div>
            </div>
            ${gridColsSelector}
        </div>`;
    };
    
    const renderReciterSelector = () => `<div class="p-4 bg-parchment dark:bg-night rounded-lg border border-line dark:border-line-dark">
        <h4 class="font-semibold text-ink dark:text-cream mb-2">${t('defaultReciter')}</h4>
        <input id="reciter-search-input" type="text" placeholder="${t('searchReciterPlaceholder')}" value="${playerSearchQuery}" class="block w-full px-4 py-2 text-base border-line dark:border-line-dark bg-amber-50 dark:bg-neutral-800 text-ink dark:text-cream focus:outline-none focus:ring-theme-500 focus:border-theme-500 rounded-md" />
        <ul id="reciter-list-container" class="mt-2 rounded-lg max-h-60 overflow-y-auto border border-line dark:border-line-dark"></ul>
    </div>`;

    const renderAboutInfo = () => `<div class="p-4 bg-parchment dark:bg-night rounded-lg border border-line dark:border-line-dark space-y-4">
        <div class="space-y-3">
           ${getContactInfo().map(item => `<div class="flex items-center space-x-3 rtl:space-x-reverse text-sm text-ink dark:text-cream">
               <span class="text-theme-600 dark:text-theme-400">${item.icon}</span>
               ${item.href ? `<a href="${item.href}" target="_blank" rel="noopener noreferrer" class="hover:underline" dir="ltr">${item.label}</a>` : `<span>${item.label}</span>`}
           </div>`).join('')}
        </div>
        <div class="grid grid-cols-3 gap-2 pt-4 border-t border-line dark:border-line-dark">
            ${socialLinks.map(link => `<a href="${link.href}" target="_blank" rel="noopener noreferrer" class="flex items-center justify-center space-x-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-ink/70 dark:text-cream/70 hover:text-theme-600 dark:hover:text-theme-400 transition-colors">
                ${link.icon} <span class="text-xs font-medium hidden sm:inline">${link.label}</span>
            </a>`).join('')}
        </div>
        <div class="text-center text-xs text-ink/60 dark:text-cream/60 pt-4 border-t border-line dark:border-line-dark">
            ${t('madeWithLove')}
        </div>
    </div>`;
    
    // --- Event Listeners ---
    const attachEventListeners = () => {
        container.querySelector('#main-back-btn')?.addEventListener('click', onBack);
        container.querySelectorAll('.theme-btn').forEach(btn => btn.addEventListener('click', () => setTheme(btn.dataset.theme)));
        container.querySelectorAll('.color-btn').forEach(btn => btn.addEventListener('click', () => setThemeColor(btn.dataset.color)));
        container.querySelector('#animations-toggle')?.addEventListener('click', () => setAnimationsEnabled(!animationsEnabled));
        container.querySelector('#debug-toggle')?.addEventListener('click', () => setDebugMode(!debugMode));
        container.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));
        container.querySelectorAll('.mode-btn').forEach(btn => btn.addEventListener('click', () => setReaderDisplayMode(btn.dataset.mode)));
        container.querySelectorAll('.layout-btn').forEach(btn => btn.addEventListener('click', () => setSurahListLayout(btn.dataset.layout)));
        container.querySelectorAll('.grid-cols-btn').forEach(btn => btn.addEventListener('click', () => setSurahGridCols(btn.dataset.cols)));
        
        const searchInput = container.querySelector('#reciter-search-input');
        const listContainer = container.querySelector('#reciter-list-container');
        if (searchInput && listContainer) {
             const renderReciterList = (query = '') => {
                const lang = getCurrentLanguage();
                const lowerQuery = query.toLowerCase();
                const filtered = RECITERS.filter(r => r.englishName.toLowerCase().includes(lowerQuery) || r.name.includes(lowerQuery));
                if (filtered.length === 0) {
                    listContainer.innerHTML = `<li class="p-4 text-center text-ink/70 dark:text-cream/70">${t('noRecitersFound')}</li>`; return;
                }
                listContainer.innerHTML = filtered.map(r => `<li data-reciter-id="${r.identifier}" class="reciter-item p-3 cursor-pointer hover:bg-amber-50 dark:hover:bg-neutral-800 flex items-center justify-between transition-colors">
                    <div>
                        <p class="font-medium text-ink dark:text-cream">${lang === 'ar' ? r.name : r.englishName}</p>
                    </div>
                    ${selectedReciter === r.identifier ? `<div class="w-5 h-5 text-theme-600">${CheckIcon()}</div>` : ''}
                </li>`).join('');
            };
            searchInput.addEventListener('input', (e) => { playerSearchQuery = e.target.value; renderReciterList(playerSearchQuery); });
            listContainer.addEventListener('click', (e) => {
                const item = e.target.closest('.reciter-item');
                if (item) setSelectedReciter(item.dataset.reciterId);
            });
            renderReciterList(playerSearchQuery);
        }
    };

    render();
};