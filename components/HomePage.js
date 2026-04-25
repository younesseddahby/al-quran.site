
import { t, getCurrentLanguage } from '../i18n.js';
import { createSpinner } from './Spinner.js';
import { BookOpenIcon, ListenIcon, HadithIcon, ClockIcon, CalendarIcon, ShieldIcon, BeadsIcon, ChevronRightIcon, QuizIcon, BookmarkIcon, EmailIcon, CheckCircleIcon, QuranIcon, QiblaIcon, SparklesIcon, UsersIcon, MoonIcon } from './Icons.js';
import { fetchWithRetry } from '../utils/fetchUtils.js';

// --- HELPER FUNCTIONS ---
const getGreeting = () => {    
    const hour = new Date().getHours();
    if (hour < 12) return t('greetingMorning');
    if (hour < 18) return t('greetingAfternoon');
    return t('greetingEvening');
};

const getHijriDate = async () => {
    const CACHE_KEY = 'hijri_date';
    const cachedData = localStorage.getItem(CACHE_KEY);
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (cachedData) {
        const { date, hijri } = JSON.parse(cachedData);
        if (date === today) return hijri;
    }
    
    try {
        const response = await fetchWithRetry(`https://api.aladhan.com/v1/gToH?date=${now.getDate()}-${now.getMonth()+1}-${now.getFullYear()}`);
        const data = await response.json();
        if (data.code === 200) {
            const hijri = data.data.hijri;
            const formattedHijri = `${hijri.day} ${hijri.month[getCurrentLanguage() === 'ar' ? 'ar' : 'en']} ${hijri.year} ${t('hijriSuffix')}`;
            localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, hijri: formattedHijri }));
            return formattedHijri;
        }
        return null;
    } catch (e) {
        console.error("Failed to fetch Hijri date:", e);
        return null;
    }
};

const getPrayerTimes = async () => {
    const location = JSON.parse(localStorage.getItem('prayerLocation'));
    if (!location) return null;
    
    const CACHE_KEY = `prayer_times_${location.city}`;
    const cachedData = localStorage.getItem(CACHE_KEY);
    const today = new Date().toISOString().split('T')[0];

    if (cachedData) {
        const { date, times } = JSON.parse(cachedData);
        if (date === today) return times;
    }

    try {
        const response = await fetchWithRetry(`https://api.aladhan.com/v1/timingsByCity?city=${location.city}&country=${location.country}`);
        const data = await response.json();
        if (data.code === 200) {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, times: data.data }));
            return data.data;
        }
        return null;
    } catch (e) {
        console.error("Failed to fetch prayer times:", e);
        return null;
    }
};

const getDailyAyah = async () => {
    const CACHE_KEY = 'daily_ayah';
    const cachedData = localStorage.getItem(CACHE_KEY);
    const today = new Date().toISOString().split('T')[0];
    const lang = getCurrentLanguage();
    const edition = lang === 'ar' ? 'quran-uthmani' : (lang === 'id' ? 'id.indonesian' : (lang === 'tr' ? 'tr.diyanet' : 'en.asad'));

    if (cachedData) {
        const { date, ayah, lang: cachedLang } = JSON.parse(cachedData);
        if (date === today && cachedLang === lang) return ayah;
    }

    try {
        // Use day of year to get a consistent random ayah for the day (1 to 6236)
        const start = new Date(new Date().getFullYear(), 0, 0);
        const diff = new Date() - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // Pseudo-random but consistent for the day
        const ayahNumber = (dayOfYear * 137) % 6236 + 1; 

        const response = await fetchWithRetry(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${edition}`);
        const data = await response.json();
        
        if (data.code === 200) {
            const ayahData = {
                text: data.data.text,
                surahName: lang === 'ar' ? data.data.surah.name : data.data.surah.englishName,
                surahNumber: data.data.surah.number,
                numberInSurah: data.data.numberInSurah
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, ayah: ayahData, lang }));
            return ayahData;
        }
        return null;
    } catch (e) {
        console.error("Failed to fetch daily ayah:", e);
        return null;
    }
};

const getDailyHadith = async () => {
    const CACHE_KEY = 'daily_hadith';
    const cachedData = localStorage.getItem(CACHE_KEY);
    const today = new Date().toISOString().split('T')[0];
    const lang = getCurrentLanguage();
    
    const langMap = { 'en': 'eng', 'ar': 'ara', 'id': 'ind', 'tr': 'tur' };
    const langCode = langMap[lang] || 'eng';
    const edition = `${langCode}-bukhari`;

    if (cachedData) {
        const { date, hadith, lang: cachedLang } = JSON.parse(cachedData);
        if (date === today && cachedLang === lang) return hadith;
    }

    try {
        const start = new Date(new Date().getFullYear(), 0, 0);
        const diff = new Date() - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        // Bukhari has around 7563 hadiths
        const hadithNumber = (dayOfYear * 47) % 7000 + 1; 

        const response = await fetchWithRetry(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${edition}/${hadithNumber}.json`);
        const data = await response.json();
        
        if (data && data.hadiths && data.hadiths.length > 0) {
            const hadithData = {
                text: data.hadiths[0].text || data.hadiths[0].hadith,
                collection: 'Sahih al-Bukhari',
                number: data.hadiths[0].hadithnumber || data.hadiths[0].number
            };
            
            // Clean up HTML tags
            if (typeof hadithData.text === 'string') {
                hadithData.text = hadithData.text.replace(/<[^>]*>?/gm, '');
            }
            
            localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, hadith: hadithData, lang }));
            return hadithData;
        }
        return null;
    } catch (e) {
        console.error("Failed to fetch daily hadith:", e);
        return null;
    }
};

// --- RENDER FUNCTIONS ---
const renderHeroSection = (container, state) => {
    const heroContainer = document.createElement('div');
    heroContainer.className = "p-4 md:p-6 rounded-3xl glass border border-white/20 dark:border-slate-800/50 shadow-sm relative overflow-hidden group transition-all duration-700 fade-in";
    
    const greetingText = getGreeting();

    const renderHeroContent = () => {
        let nextPrayerHtml = '';
        if (state.prayerTimes) {
            const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
            const timings = state.prayerTimes.timings;
            const now = new Date();
            let nextPrayerName = null;
            let nextPrayerTime = Infinity;

            prayerOrder.forEach(name => {
                const [hours, minutes] = timings[name].split(':').map(Number);
                const prayerDate = new Date(now);
                prayerDate.setHours(hours, minutes, 0, 0);
                if (prayerDate > now && prayerDate < nextPrayerTime) {
                    nextPrayerTime = prayerDate;
                    nextPrayerName = name;
                }
            });

            if (!nextPrayerName) nextPrayerName = 'Fajr';
            
            nextPrayerHtml = `
                <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-theme-500/10 border border-theme-500/20 text-theme-700 dark:text-theme-400">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-theme-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-theme-500"></span>
                    </span>
                    <span class="text-[10px] font-bold uppercase tracking-wider">${t(`prayer_${nextPrayerName}`) || nextPrayerName} ${timings[nextPrayerName]}</span>
                </div>
            `;
        }

        heroContainer.innerHTML = `
            <div class="absolute top-0 right-0 w-48 h-48 bg-theme-500/5 rounded-full blur-[60px] -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-1000"></div>
            
            <div class="flex flex-col md:flex-row justify-between items-center relative z-10 gap-4">
                <div class="flex flex-col md:flex-row items-center gap-4 text-center md:text-left rtl:md:text-right">
                    <div class="w-12 h-12 rounded-2xl bg-theme-500/10 flex items-center justify-center text-theme-600 dark:text-theme-400 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.94 10.94 19 8"/><path d="m3 21 9-9"/><path d="M12.26 5.74a5 5 0 1 0-5.96 5.96"/><path d="M17.07 17.07 20 20"/></svg>
                    </div>
                    <div class="space-y-0.5">
                        <h1 class="text-xl md:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">${greetingText}</h1>
                        <div class="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <p class="text-slate-500 dark:text-slate-400 text-xs font-medium">${t('welcomeMessage')}</p>
                            ${nextPrayerHtml}
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center gap-4 md:gap-6">
                    <div class="text-center md:text-right rtl:md:text-left">
                        <div id="live-clock" class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-display tracking-tight tabular-nums"></div>
                    </div>
                    <div class="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
                    <div class="flex flex-col items-center md:items-end gap-0.5 text-slate-500 dark:text-slate-400 text-[9px] md:text-[10px]">
                        <span class="flex items-center gap-1 font-medium">
                            ${CalendarIcon({className: 'w-3 h-3'})} <span id="gregorian-date"></span>
                        </span>
                        <span class="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                            ${CalendarIcon({className: 'w-3 h-3'})} <span id="hijri-date">${createSpinner('...').outerHTML}</span>
                        </span>
                    </div>
                </div>
            </div>
        `;
    };

    renderHeroContent();
    state.renderHeroContent = renderHeroContent;
    container.appendChild(heroContainer);
};

const renderPrayerWidget = (container, state) => {
    const prayerContainer = document.createElement('div');
    prayerContainer.id = 'prayer-times-widget';
    prayerContainer.className = 'h-full fade-in stagger-1';
    
    if (state.prayerTimes) {
        const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const timings = state.prayerTimes.timings;
        const now = new Date();
        const location = JSON.parse(localStorage.getItem('prayerLocation'));
        let nextPrayerName = null;
        let nextPrayerTime = Infinity;

        prayerOrder.forEach(name => {
            const [hours, minutes] = timings[name].split(':').map(Number);
            const prayerDate = new Date(now);
            prayerDate.setHours(hours, minutes, 0, 0);
            if (prayerDate > now && prayerDate < nextPrayerTime) {
                nextPrayerTime = prayerDate;
                nextPrayerName = name;
            }
        });

        if (!nextPrayerName) nextPrayerName = 'Fajr';
        
        prayerContainer.innerHTML = `
            <div class="p-6 glass-card rounded-3xl h-full flex flex-col transition-all duration-500 hover:shadow-theme-500/5 border border-slate-200/50 dark:border-slate-700/50">
                <div class="flex justify-between items-start mb-6">
                    <div class="flex flex-col gap-1">
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-theme-500/10 flex items-center justify-center text-theme-600 dark:text-theme-400">
                                ${ClockIcon({className: 'w-5 h-5'})}
                            </div>
                            <h3 class="font-bold font-display text-lg text-slate-900 dark:text-white">${t('prayerTimes')}</h3>
                        </div>
                        ${location ? `<p class="text-xs font-bold text-theme-600 dark:text-theme-400 uppercase tracking-[0.2em] pl-10">${location.city}</p>` : ''}
                    </div>
                    <a href="#" data-nav="adhan" class="text-xs font-bold text-theme-600 dark:text-theme-400 hover:underline flex items-center gap-1 mt-1">
                        ${t('viewAll')}
                    </a>
                </div>
                <div class="space-y-2 flex-grow">
                    ${prayerOrder.map(name => {
                        const isActive = name === nextPrayerName;
                        return `
                        <div class="p-3.5 rounded-2xl flex items-center justify-between transition-all duration-500 ${isActive ? 'bg-theme-600 text-white shadow-lg shadow-theme-500/20 scale-[1.02] z-10' : 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'}">
                            <div class="flex items-center gap-3">
                                <span class="text-[10px] font-black uppercase tracking-widest opacity-60">${t(`prayer_${name}`)}</span>
                            </div>
                            <p class="text-base font-display font-bold tabular-nums">${timings[name]}</p>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;
    } else {
         prayerContainer.innerHTML = `
            <div class="p-6 glass-card rounded-3xl text-center h-full flex flex-col justify-center items-center border border-slate-200/50 dark:border-slate-700/50">
                 <div class="w-12 h-12 glass rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
                    ${ClockIcon({className: 'w-6 h-6'})}
                 </div>
                 <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-1">${t('prayerTimes')}</h4>
                 <p class="text-slate-500 dark:text-slate-400 mb-6 text-xs max-w-[180px]">${t('setupPrayerTimes')}</p>
                 <a href="#" data-nav="adhan" class="w-full py-3 bg-theme-600 text-white text-xs font-bold rounded-xl hover:bg-theme-700 shadow-lg shadow-theme-500/20 transition-all active:scale-95">${t('setupNow')}</a>
            </div>
        `;
    }
    
    container.appendChild(prayerContainer);
};

const renderQuickLinks = (container) => {
    // Quick Links Section - Now at the top
    const linksHeader = document.createElement('h3');
    linksHeader.className = "font-bold font-display text-lg md:text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2";
    linksHeader.innerHTML = `
        <span class="w-1.5 h-6 bg-theme-500 rounded-full"></span>
        ${t('explore') || 'Explore'}
    `;
    container.appendChild(linksHeader);

    const lastReadData = JSON.parse(localStorage.getItem('quran_last_read'));

    const linksContainer = document.createElement('div');
    linksContainer.className = "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12";
    const linkItems = [
        { nav: "seerah", icon: BookOpenIcon({className: 'w-6 h-6'}), title: t('prophetSeerah') || "Prophet's Seerah", desc: t('seerahHeroDesc') || "Explore the life and legacy of the Prophet Muhammad (PBUH)", meta: 'Biography', color: 'indigo' },
        { nav: "stories", icon: SparklesIcon({className: 'w-6 h-6'}), title: t('prophetStories') || "Prophet Stories", desc: t('prophetStoriesDesc') || "Stories of the Prophets from Adam to Muhammad (PBUH)", meta: 'Prophets', color: 'amber' },
        { nav: "sahaba", icon: UsersIcon({className: 'w-6 h-6'}), title: t('sahabaStories') || "Sahaba Stories", desc: t('sahabaStoriesDesc') || "Life of the Companions of the Prophet (PBUH)", meta: 'Sahaba', color: 'teal' },
        { nav: "bookmarks", icon: BookmarkIcon({className: 'w-6 h-6'}), title: t('bookmarks') || 'Bookmarks', desc: t('bookmarksTab') || 'View your saved verses.', meta: 'Saved', color: 'pink' },
        { nav: "quiz", icon: QuizIcon({className: 'w-6 h-6'}), title: t('islamicQuiz'), desc: t('testYourKnowledge') || 'Test your Islamic knowledge.', meta: 'Learn', color: 'orange' },
        { nav: "asma", icon: BookOpenIcon({className: 'w-6 h-6'}), title: t('asmaUlHusna'), desc: t('asmaUlHusnaDesc') || 'The 99 Names of Allah', meta: '99 Names', color: 'violet' },
        { nav: "quran", subNav: "read", icon: BookOpenIcon({className: 'w-6 h-6'}), title: t('readQuran'), desc: t('readQuranDesc') || 'Read the Holy Quran', meta: '114 Surahs', color: 'theme' },
        { nav: "quran", subNav: "listen", icon: ListenIcon({className: 'w-6 h-6'}), title: t('exploreRecitations'), desc: t('exploreRecitationsDesc'), meta: 'Audio', color: 'indigo' },
        { nav: "hadith", icon: HadithIcon({className: 'w-6 h-6'}), title: t('discoverHadith'), desc: t('discoverHadithDesc'), meta: '9 Collections', color: 'emerald' },
        { nav: "hisn", icon: ShieldIcon({className: 'w-6 h-6'}), title: t('readHisn'), desc: t('readHisnDesc'), meta: '132 Chapters', color: 'amber' },
        { nav: "tasbih", icon: BeadsIcon({className: 'w-6 h-6'}), title: t('tasbih'), desc: t('tasbihDesc'), meta: 'Dhikr', color: 'rose' },
        { nav: "qibla", icon: QiblaIcon({className: 'w-6 h-6'}), title: t('qiblaFinder') || 'Qibla Finder', desc: t('qiblaDesc') || 'Find the direction of the Kaaba', meta: 'Compass', color: 'cyan' },
    ];
    linksContainer.innerHTML = linkItems.map((link, i) => `
        <a href="#" data-nav="${link.nav}" ${link.subNav ? `data-sub-nav="${link.subNav}"` : ''} ${link.surah ? `data-surah="${link.surah}"` : ''} ${link.ayah ? `data-ayah="${link.ayah}"` : ''} class="quick-link-card fade-in group p-3 glass-card rounded-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-2 hover:shadow-lg hover:shadow-${link.color}-500/10 border border-slate-200/50 dark:border-slate-700/50 hover:border-${link.color}-500/30 active:scale-[0.98] relative overflow-hidden" style="animation-delay: ${0.1 + (i * 0.05)}s">
            <div class="absolute -right-8 -top-8 w-24 h-24 bg-${link.color}-500/5 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div class="flex items-center justify-between relative z-10">
                <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-${link.color}-500/10 group-hover:text-${link.color}-600 dark:group-hover:text-${link.color}-400 transition-all duration-300 shadow-sm">
                    ${link.icon.toString().replace('w-6 h-6', 'w-4 h-4')}
                </div>
                <span class="text-[8px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md group-hover:bg-${link.color}-500/10 group-hover:text-${link.color}-600 dark:group-hover:text-${link.color}-400 transition-colors shadow-sm">${link.meta}</span>
            </div>
            <div class="mt-0.5 relative z-10">
                <h4 class="font-bold text-sm text-slate-800 dark:text-slate-200 mb-0.5 group-hover:text-${link.color}-600 dark:group-hover:text-${link.color}-400 transition-colors">${link.title}</h4>
                <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight font-medium line-clamp-2">${link.desc}</p>
            </div>
        </a>
    `).join('');
    container.appendChild(linksContainer);
};

const renderProphetStoriesSection = (container, state) => {
    const sectionHeader = document.createElement('h3');
    sectionHeader.className = "font-bold font-display text-lg md:text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2";
    sectionHeader.innerHTML = `
        <span class="w-1.5 h-6 bg-amber-500 rounded-full"></span>
        ${t('prophetStories') || 'Prophet Stories'}
    `;
    container.appendChild(sectionHeader);

    const storiesContainer = document.createElement('div');
    storiesContainer.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8";
    
    const prophets = [
        { id: 'adam', name: 'Adam', nameAr: 'آدم' },
        { id: 'nuh', name: 'Noah', nameAr: 'نوح' },
        { id: 'ibrahim', name: 'Abraham', nameAr: 'إبراهيم' },
        { id: 'musa', name: 'Moses', nameAr: 'موسى' },
        { id: 'isa', name: 'Jesus', nameAr: 'عيسى' },
        { id: 'muhammad', name: 'Muhammad', nameAr: 'محمد' }
    ];

    storiesContainer.innerHTML = prophets.map((p, i) => `
        <a href="#" data-nav="stories" data-prophet-id="${p.id}" class="group p-3 glass-card rounded-2xl border border-slate-200/50 dark:border-slate-700/50 hover:border-amber-500/30 hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center gap-2 fade-in" style="animation-delay: ${0.2 + (i * 0.05)}s">
            <div class="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-sm font-amiri text-lg">
                ${p.nameAr}
            </div>
            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 transition-colors">${getCurrentLanguage() === 'ar' ? p.nameAr : p.name}</span>
        </a>
    `).join('');
    
    container.appendChild(storiesContainer);
};

// --- MAIN COMPONENT ---
export const renderHomePage = (container, props) => {
    const { setActiveTab, setQuranMode } = props;
    
    let clockInterval;
    
    const state = {
        prayerTimes: null,
        hijriDate: null,
    };

    const init = () => {
        container.innerHTML = '';
        const homeWrapper = document.createElement('div');
        homeWrapper.className = 'w-full space-y-6 fade-in';
        
        // --- Render static layout ---
        renderHeroSection(homeWrapper, state);

        const mainGrid = document.createElement('div');
        mainGrid.className = 'grid grid-cols-1 lg:grid-cols-3 gap-6';
        
        const prayerTimesContainer = document.createElement('div');
        prayerTimesContainer.className = 'lg:col-span-1 h-full';
        
        const quickLinksContainer = document.createElement('div');
        quickLinksContainer.className = 'lg:col-span-2 space-y-6';

        mainGrid.append(prayerTimesContainer, quickLinksContainer);
        
        homeWrapper.append(mainGrid);
        container.appendChild(homeWrapper);

        // --- Asynchronously fetch and render dynamic content ---
        getPrayerTimes().then(times => {
            state.prayerTimes = times;
            renderPrayerWidget(prayerTimesContainer, state);
            if (state.renderHeroContent) {
                state.renderHeroContent();
                setupLiveClock();
                setupHijriDate();
            }
        });
        
        renderQuickLinks(quickLinksContainer);
        renderProphetStoriesSection(quickLinksContainer, state);
        
        getDailyAyah().then(ayah => {
            if (ayah) {
                const widget = container.querySelector('#daily-ayah-widget');
                if (widget) {
                    widget.dataset.surah = ayah.surahNumber;
                    widget.dataset.ayah = ayah.numberInSurah;
                    widget.querySelector('#daily-ayah-ref').textContent = `${ayah.surahName} ${ayah.surahNumber}:${ayah.numberInSurah}`;
                    widget.querySelector('#daily-ayah-text').textContent = `"${ayah.text}"`;
                }
            }
        });

        getDailyHadith().then(hadith => {
            if (hadith) {
                const widget = container.querySelector('#daily-hadith-widget');
                if (widget) {
                    widget.querySelector('#daily-hadith-ref').textContent = `${hadith.collection} ${hadith.number}`;
                    widget.querySelector('#daily-hadith-text').textContent = `"${hadith.text}"`;
                }
            }
        });
        
        setupLiveClock();
        setupHijriDate();
        
        container.addEventListener('click', handleNavigation);
    };

    const setupLiveClock = () => {
        const clockEl = container.querySelector('#live-clock');
        const gregorianEl = container.querySelector('#gregorian-date');

        if (!clockEl || !gregorianEl) return;
        const update = () => {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString(getCurrentLanguage(), { hour: '2-digit', minute: '2-digit' });
            gregorianEl.textContent = now.toLocaleDateString(getCurrentLanguage(), { weekday: 'long', day: 'numeric', month: 'long' });
        };
        clearInterval(clockInterval);
        update();
        clockInterval = setInterval(update, 1000);
    };

    const setupHijriDate = () => {
        const hijriEl = container.querySelector('#hijri-date');
        if (!hijriEl) return;
        getHijriDate().then(dateStr => {
            if (dateStr) hijriEl.textContent = dateStr;
            else hijriEl.textContent = t('notAvailable');
        });
    };
    
    const handleNavigation = (e) => {
        const link = e.target.closest('[data-nav]');
        if (link) {
            e.preventDefault();
            const tabId = link.dataset.nav;
            const prophetId = link.dataset.prophetId;
            
            if (tabId === 'stories' && prophetId) {
                localStorage.setItem('last_prophet_story', prophetId);
            }
            
            const surah = link.dataset.surah;
            const ayah = link.dataset.ayah;
            
            if (tabId === 'quran' && surah && ayah && props.navigateTo) {
                props.navigateTo({ surahNumber: parseInt(surah), ayahNumber: parseInt(ayah) });
                return;
            }
            
            const subNav = link.dataset.subNav;
            if (subNav === 'listen') {
                setQuranMode('listen');
            } else {
                 setQuranMode('read');
            }
            setActiveTab(tabId);
        }
    };
    
    init();

    return () => {
        clearInterval(clockInterval);
        container.removeEventListener('click', handleNavigation);
    };
};
