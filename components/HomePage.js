
import { t, getCurrentLanguage } from '../i18n.js';
import { createSpinner } from './Spinner.js';
import { BookOpenIcon, ListenIcon, HadithIcon, ClockIcon, CalendarIcon, ShieldIcon, BeadsIcon, ChevronRightIcon, QuizIcon, BookmarkIcon, EmailIcon, CheckCircleIcon } from './Icons.js';
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

// --- RENDER FUNCTIONS ---
const renderHeroSection = (container) => {
    const heroContainer = document.createElement('div');
    heroContainer.className = "p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group";
    
    const greetingText = getGreeting();

    heroContainer.innerHTML = `
        <div class="absolute top-0 right-0 w-64 h-64 bg-theme-500/5 rounded-bl-[10rem] -mr-20 -mt-20 transition-transform group-hover:scale-110 duration-1000"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center relative z-10">
            <div class="space-y-3 md:space-y-4">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-theme-50 dark:bg-theme-900/20 text-theme-700 dark:text-theme-400 text-[10px] md:text-xs font-bold tracking-wider uppercase">
                    ${ClockIcon({className: 'w-3 h-3'})} ${t('welcome') || 'Welcome'}
                </div>
                <h1 class="text-4xl sm:text-5xl md:text-7xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-tight">${greetingText}</h1>
                <p class="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-md leading-relaxed">${t('welcomeMessage')}</p>
                <div class="pt-2">
                    <button id="hero-suggest-btn" class="px-6 py-3 bg-theme-600 text-white rounded-full font-bold text-sm shadow-lg shadow-theme-500/20 hover:bg-theme-700 transition-all active:scale-95">
                        ${t('suggestFeatures')}
                    </button>
                </div>
            </div>
            <div class="text-center md:text-right rtl:md:text-left space-y-3 md:space-y-4">
                <div id="live-clock" class="text-5xl sm:text-6xl md:text-8xl font-bold text-theme-600 dark:text-theme-400 font-display tracking-tighter"></div>
                <div class="flex flex-col md:items-end gap-1 md:gap-2 text-slate-500 dark:text-slate-400">
                    <span class="flex items-center justify-center md:justify-end gap-2 text-xs md:text-sm font-medium">
                        ${CalendarIcon({className: 'w-4 h-4 text-theme-500'})} <span id="gregorian-date"></span>
                    </span>
                    <span class="flex items-center justify-center md:justify-end gap-2 text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">
                        ${CalendarIcon({className: 'w-4 h-4 text-theme-500'})} <span id="hijri-date">${createSpinner('...').outerHTML}</span>
                    </span>
                </div>
            </div>
        </div>
    `;
    container.appendChild(heroContainer);
};

const renderPrayerWidget = (container, state) => {
    const prayerContainer = document.createElement('div');
    prayerContainer.id = 'prayer-times-widget';
    prayerContainer.className = 'h-full';
    
    if (state.prayerTimes) {
        const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        const timings = state.prayerTimes.timings;
        const now = new Date();
        let nextPrayerName = null;
        let nextPrayerTime = Infinity;

        // Find next prayer
        prayerOrder.forEach(name => {
            const [hours, minutes] = timings[name].split(':').map(Number);
            const prayerDate = new Date(now);
            prayerDate.setHours(hours, minutes, 0, 0);
            if (prayerDate > now && prayerDate < nextPrayerTime) {
                nextPrayerTime = prayerDate;
                nextPrayerName = name;
            }
        });

        // If past Isha, next is Fajr tomorrow
        if (!nextPrayerName) {
            nextPrayerName = 'Fajr';
        }
        
        prayerContainer.innerHTML = `
            <div class="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] h-full border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none flex flex-col">
                <div class="flex justify-between items-center mb-6 md:mb-8">
                    <h3 class="font-bold font-display text-xl md:text-2xl text-slate-900 dark:text-white">${t('prayerTimes')}</h3>
                    <a href="#" data-nav="adhan" class="text-xs md:text-sm font-bold text-theme-600 dark:text-theme-400 hover:text-theme-700 transition-colors flex items-center gap-1">
                        ${t('viewAll')} ${ChevronRightIcon({className: 'w-4 h-4'})}
                    </a>
                </div>
                <div class="grid grid-cols-1 gap-2 md:gap-3 flex-grow">
                    ${prayerOrder.map(name => {
                        const isActive = name === nextPrayerName;
                        return `
                        <div class="p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center justify-between transition-all duration-300 ${isActive ? 'bg-theme-600 text-white shadow-lg shadow-theme-500/30 scale-[1.02]' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}">
                            <div class="flex items-center gap-2 md:gap-3">
                                <div class="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}"></div>
                                <p class="text-[10px] md:text-sm font-bold uppercase tracking-wider">${t(`prayer_${name}`)}</p>
                            </div>
                            <p class="text-lg md:text-xl font-display font-bold">${timings[name]}</p>
                        </div>
                    `}).join('')}
                </div>
            </div>
        `;
    } else {
         prayerContainer.innerHTML = `
            <div class="p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] text-center h-full flex flex-col justify-center items-center border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none">
                 <div class="w-12 h-12 md:w-16 md:h-16 bg-theme-50 dark:bg-theme-900/20 rounded-full flex items-center justify-center text-theme-600 dark:text-theme-400 mb-4 md:mb-6">
                    ${ClockIcon({className: 'w-6 h-6 md:w-8 md:h-8'})}
                 </div>
                 <h4 class="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">${t('prayerTimes')}</h4>
                 <p class="text-slate-500 dark:text-slate-400 mb-6 md:mb-8 text-xs md:text-sm max-w-[200px]">${t('setupPrayerTimes')}</p>
                 <a href="#" data-nav="adhan" class="w-full py-3 md:py-4 bg-theme-600 text-white text-xs md:text-sm font-bold rounded-xl md:rounded-2xl hover:bg-theme-700 shadow-lg shadow-theme-500/20 transition-all active:scale-95">${t('setupNow')}</a>
            </div>
        `;
    }
    
    container.appendChild(prayerContainer);
};

const renderQuickLinks = (container) => {
    const linksContainer = document.createElement('div');
    linksContainer.className = "grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6";
    const linkItems = [
        { nav: "quran", subNav: "read", icon: BookOpenIcon({className: 'w-8 h-8 md:w-10 md:h-10'}), title: t('readQuran'), desc: t('continueReadingDesc') },
        { nav: "quran", subNav: "listen", icon: ListenIcon({className: 'w-8 h-8 md:w-10 md:h-10'}), title: t('exploreRecitations'), desc: t('exploreRecitationsDesc') },
        { nav: "hisn", icon: ShieldIcon({className: 'w-8 h-8 md:w-10 md:h-10'}), title: t('readHisn'), desc: t('readHisnDesc') },
        { nav: "tasbih", icon: BeadsIcon({className: 'w-8 h-8 md:w-10 md:h-10'}), title: t('tasbih'), desc: t('tasbihDesc') },
        { nav: "hadith", icon: HadithIcon({className: 'w-8 h-8 md:w-10 md:h-10'}), title: t('discoverHadith'), desc: t('discoverHadithDesc') },
        { nav: "bookmarks", icon: BookmarkIcon({className: 'w-8 h-8 md:w-10 md:h-10'}), title: t('bookmarks') || 'Bookmarks', desc: t('bookmarksTab') || 'View your saved verses and hadiths' },
        { nav: "quiz", icon: QuizIcon({className: 'w-8 h-8 md:w-10 md:h-10'}), title: t('islamicQuiz'), desc: t('testYourKnowledge') || 'Test your Islamic knowledge with different levels.' },
        { nav: "stories", icon: BookOpenIcon({className: 'w-8 h-8 md:w-10 md:h-10'}), title: t('prophetStories'), desc: t('prophetStoriesDesc') },
        { nav: "feedback", icon: EmailIcon({className: 'w-8 h-8 md:w-10 md:h-10'}), title: t('suggestFeatures'), desc: t('suggestFeaturesDesc') },
    ];
    linksContainer.innerHTML = linkItems.map(link => `
        <a href="#" data-nav="${link.nav}" ${link.subNav ? `data-sub-nav="${link.subNav}"` : ''} class="quick-link-card group p-6 md:p-8 bg-white dark:bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 flex flex-col gap-4 md:gap-6 border border-slate-100 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-theme-500/10 active:scale-[0.98]">
            <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-theme-50 dark:bg-theme-900/20 flex items-center justify-center text-theme-600 dark:text-theme-400 group-hover:bg-theme-600 group-hover:text-white transition-all duration-500">
                ${link.icon}
            </div>
            <div>
                <h4 class="font-bold font-display text-xl md:text-2xl text-slate-900 dark:text-white mb-1 md:mb-2">${link.title}</h4>
                <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">${link.desc}</p>
            </div>
            <div class="mt-auto pt-2 md:pt-4 flex items-center gap-2 text-theme-600 dark:text-theme-400 font-bold text-xs md:text-sm">
                <span>${t('getStarted') || 'Get Started'}</span>
                ${ChevronRightIcon({className: 'w-4 h-4 group-hover:translate-x-1 transition-transform'})}
            </div>
        </a>
    `).join('');
    container.appendChild(linksContainer);
};

const renderFeedbackSection = (container) => {
    const feedbackContainer = document.createElement('div');
    feedbackContainer.id = 'feedback-section';
    feedbackContainer.className = "mt-12 p-8 md:p-12 rounded-[2.5rem] bg-slate-900 dark:bg-slate-800/50 text-white relative overflow-hidden group border border-slate-800 scroll-mt-20";
    
    feedbackContainer.innerHTML = `
        <div class="absolute top-0 right-0 w-64 h-64 bg-theme-500/10 rounded-bl-[10rem] -mr-20 -mt-20 transition-transform group-hover:scale-110 duration-1000"></div>
        <div class="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div class="space-y-6">
                <div class="w-16 h-16 rounded-2xl bg-theme-500/20 flex items-center justify-center text-theme-400">
                    ${EmailIcon({className: 'w-8 h-8'})}
                </div>
                <h2 class="text-3xl md:text-5xl font-bold font-display tracking-tight">${t('suggestFeatures')}</h2>
                <p class="text-slate-400 text-lg leading-relaxed max-w-md">${t('suggestFeaturesDesc')}</p>
                <div class="flex items-center gap-4 text-slate-500 text-sm font-medium">
                    <span class="flex items-center gap-2">
                        ${CheckCircleIcon({className: 'w-4 h-4 text-theme-500'})} ${t('done')}
                    </span>
                </div>
            </div>
            <form id="feedback-form" class="space-y-4 bg-white/5 p-6 rounded-3xl backdrop-blur-sm border border-white/10">
                <div id="feedback-success-msg" class="hidden p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-emerald-400 text-sm font-bold text-center mb-4">
                    ${t('feedbackSuccess')}
                </div>
                <div class="feedback-inputs space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">${t('subject')}</label>
                        <input type="text" id="feedback-subject" required placeholder="e.g., New Reciter Request" class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-theme-500/50 transition-all text-white text-sm">
                    </div>
                    <div>
                        <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">${t('message')}</label>
                        <textarea id="feedback-message" required rows="4" placeholder="Describe your idea..." class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-theme-500/50 transition-all text-white text-sm resize-none"></textarea>
                    </div>
                    <button type="submit" id="feedback-submit-btn" class="w-full py-4 bg-theme-600 hover:bg-theme-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-theme-600/20 flex items-center justify-center gap-2">
                        <span class="btn-text">${t('sendFeedback')}</span>
                        <span class="btn-spinner hidden">${createSpinner().outerHTML}</span>
                    </button>
                </div>
            </form>
        </div>
    `;
    
    feedbackContainer.querySelector('#feedback-form').onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('#feedback-submit-btn');
        const text = btn.querySelector('.btn-text');
        const spinner = btn.querySelector('.btn-spinner');
        const inputs = e.target.querySelector('.feedback-inputs');
        const successMsg = e.target.querySelector('#feedback-success-msg');

        btn.disabled = true;
        text.classList.add('hidden');
        spinner.classList.remove('hidden');

        // Simulate direct submission
        await new Promise(r => setTimeout(r, 1500));

        successMsg.classList.remove('hidden');
        inputs.classList.add('hidden');
        
        window.showToast?.(t('feedbackSuccess'), 'success');
        
        // Reset after 3 seconds to allow another feedback
        setTimeout(() => {
            e.target.reset();
            successMsg.classList.add('hidden');
            inputs.classList.remove('hidden');
            btn.disabled = false;
            text.classList.remove('hidden');
            spinner.classList.add('hidden');
        }, 5000);
    };

    container.appendChild(feedbackContainer);
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
        prayerTimesContainer.className = 'lg:col-span-1';
        
        const quickLinksContainer = document.createElement('div');
        quickLinksContainer.className = 'lg:col-span-2';

        mainGrid.append(prayerTimesContainer, quickLinksContainer);
        
        homeWrapper.append(mainGrid);
        container.appendChild(homeWrapper);

        // --- Asynchronously fetch and render dynamic content ---
        getPrayerTimes().then(times => {
            state.prayerTimes = times;
            renderPrayerWidget(prayerTimesContainer, state);
        });
        
        renderQuickLinks(quickLinksContainer);
        renderFeedbackSection(homeWrapper);
        
        setupLiveClock();
        setupHijriDate();
        
        container.addEventListener('click', handleNavigation);
    };

    const setupLiveClock = () => {
        const clockEl = container.querySelector('#live-clock');
        const gregorianEl = container.querySelector('#gregorian-date');
        const suggestBtn = container.querySelector('#hero-suggest-btn');

        if (suggestBtn) {
            suggestBtn.onclick = () => {
                document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' });
            };
        }

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
            
            if (tabId === 'feedback') {
                document.getElementById('feedback-section')?.scrollIntoView({ behavior: 'smooth' });
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
