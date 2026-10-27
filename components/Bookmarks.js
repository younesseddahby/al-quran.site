import { t, getCurrentLanguage } from '../i18n.js';
import { QuranIcon, HadithIcon, BookmarkIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon, BookOpenIcon, UsersIcon, SparklesIcon } from './Icons.js';

export const renderBookmarks = (container, props) => {
    const { bookmarks, toggleBookmark, setActiveTab, setReaderMode } = props;
    const lang = getCurrentLanguage();
    const isRtl = lang === 'ar';
    const BackIcon = isRtl ? ArrowRightIcon : ArrowLeftIcon;

    let state = {
        activeFilter: 'all' // 'all', 'quran', 'hadith'
    };

    const render = () => {
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'max-w-5xl mx-auto px-4 py-8 space-y-8 fade-in';

        const quranCount = bookmarks.quran?.length || 0;
        const hadithCount = bookmarks.hadith?.length || 0;
        const seerahCount = bookmarks.seerah?.length || 0;
        const sahabaCount = bookmarks.sahaba?.length || 0;
        const storiesCount = bookmarks.stories?.length || 0;
        const totalCount = quranCount + hadithCount + seerahCount + sahabaCount + storiesCount;

        wrapper.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div class="flex items-center gap-4">
                    <button id="bookmarks-back-btn" class="p-2 -ml-1 rounded-xl glass hover:bg-theme-100 dark:hover:bg-theme-900/30 transition-all active:scale-90 flex items-center gap-1 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        ${BackIcon({className: "w-5 h-5"})}
                        <span class="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">${t('back')}</span>
                    </button>
                    <div>
                        <h1 class="text-2xl md:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">${t('bookmarks') || 'Bookmarks'}</h1>
                        <p class="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-0.5">${t('bookmarksDescription') || 'Your saved verses and hadiths'}</p>
                    </div>
                </div>
                
                <div class="flex glass p-1 rounded-2xl border border-white/10 shadow-sm overflow-x-auto hide-scrollbar">
                    <button data-filter="all" class="filter-btn px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${state.activeFilter === 'all' ? 'bg-theme-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('all') || 'All'} (${totalCount})</button>
                    <button data-filter="quran" class="filter-btn px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${state.activeFilter === 'quran' ? 'bg-theme-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('quran')} (${quranCount})</button>
                    <button data-filter="hadith" class="filter-btn px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${state.activeFilter === 'hadith' ? 'bg-theme-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('hadith')} (${hadithCount})</button>
                    <button data-filter="seerah" class="filter-btn px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${state.activeFilter === 'seerah' ? 'bg-theme-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('seerah')} (${seerahCount})</button>
                    <button data-filter="sahaba" class="filter-btn px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${state.activeFilter === 'sahaba' ? 'bg-theme-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('sahabaStories') || 'Sahaba'} (${sahabaCount})</button>
                    <button data-filter="stories" class="filter-btn px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${state.activeFilter === 'stories' ? 'bg-theme-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('prophetStories') || 'Stories'} (${storiesCount})</button>
                </div>
            </div>

            <div id="bookmarks-list" class="grid grid-cols-1 gap-4">
                ${renderList()}
            </div>
        `;

        container.appendChild(wrapper);

        wrapper.querySelector('#bookmarks-back-btn')?.addEventListener('click', () => props.onBack());
        wrapper.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                state.activeFilter = btn.dataset.filter;
                render();
            });
        });

        attachItemListeners(wrapper);
    };

    const renderList = () => {
        let items = [];
        if (state.activeFilter === 'all' || state.activeFilter === 'quran') {
            items = [...items, ...(bookmarks.quran || []).map(b => ({ ...b, type: 'quran' }))];
        }
        if (state.activeFilter === 'all' || state.activeFilter === 'hadith') {
            items = [...items, ...(bookmarks.hadith || []).map(b => ({ ...b, type: 'hadith' }))];
        }
        if (state.activeFilter === 'all' || state.activeFilter === 'seerah') {
            items = [...items, ...(bookmarks.seerah || []).map(b => ({ ...b, type: 'seerah' }))];
        }
        if (state.activeFilter === 'all' || state.activeFilter === 'sahaba') {
            items = [...items, ...(bookmarks.sahaba || []).map(b => ({ ...b, type: 'sahaba' }))];
        }
        if (state.activeFilter === 'all' || state.activeFilter === 'stories') {
            items = [...items, ...(bookmarks.stories || []).map(b => ({ ...b, type: 'stories' }))];
        }

        // Sort by date added (assuming we added a timestamp, but for now just reverse)
        items.reverse();

        if (items.length === 0) {
            return `
                <div class="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                        ${BookmarkIcon({className: "w-10 h-10"})}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white">${t('noBookmarks') || 'No bookmarks yet'}</h3>
                        <p class="text-slate-500 dark:text-slate-400 text-sm">${t('noBookmarksDescription') || 'Verses and hadiths you bookmark will appear here'}</p>
                    </div>
                </div>
            `;
        }

        return items.map(item => `
            <div class="group py-4 relative overflow-hidden">
                <div class="flex justify-between items-start mb-4 relative z-10">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-theme-500/10 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-all duration-500 shadow-sm">
                            ${item.type === 'quran' ? QuranIcon({className: "w-5 h-5"}) : 
                              item.type === 'hadith' ? HadithIcon({className: "w-5 h-5"}) : 
                              item.type === 'sahaba' ? UsersIcon({className: "w-5 h-5"}) : 
                              item.type === 'stories' ? SparklesIcon({className: "w-5 h-5"}) : 
                              BookOpenIcon({className: "w-5 h-5"})}
                        </div>
                        <div>
                            <h4 class="font-bold text-base text-slate-800 dark:text-slate-200 group-hover:text-theme-600 dark:group-hover:text-theme-400 transition-colors">${item.title}</h4>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-bold uppercase tracking-wider">${item.subtitle}</p>
                        </div>
                    </div>
                    <button data-id="${item.id}" data-type="${item.type}" class="remove-bookmark-btn p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors" title="${t('removeBookmark') || 'Remove Bookmark'}">
                        ${TrashIcon({className: "w-4 h-4"})}
                    </button>
                </div>
                <div class="relative cursor-pointer bookmark-content z-10" data-id="${item.id}" data-type="${item.type}" data-surah="${item.surahNum || ''}" data-ayah="${item.ayahNum || ''}" data-collection="${item.collection || ''}" data-hadith="${item.hadithNumber || ''}">
                    <p class="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 ${item.lang === 'ar' ? 'font-amiri text-right text-xl md:text-2xl' : 'text-left'} line-clamp-3" dir="${item.lang === 'ar' ? 'rtl' : 'ltr'}">
                        ${item.text}
                    </p>
                    <div class="mt-3 flex items-center justify-end text-theme-600 dark:text-theme-400 text-[10px] font-bold uppercase tracking-widest gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <span>${t('viewDetails') || 'View Details'}</span>
                        ${ChevronRightIcon({className: `w-3 h-3 ${isRtl ? 'rotate-180' : ''}`})}
                    </div>
                </div>
            </div>
        `).join('');
    };

    const attachItemListeners = (wrapper) => {
        wrapper.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const type = btn.dataset.type;
                toggleBookmark(type, { id });
                render();
            });
        });

        wrapper.querySelectorAll('.bookmark-content').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                if (type === 'quran') {
                    const surahNum = parseInt(item.dataset.surah);
                    const ayahNum = parseInt(item.dataset.ayah);
                    setReaderMode({ surah: { number: surahNum }, ayah: ayahNum });
                    setActiveTab('quran');
                } else if (type === 'hadith') {
                    const collection = item.dataset.collection;
                    const hadithNumber = parseInt(item.dataset.hadith);
                    props.setHadithMode({ collection, hadithNumber });
                    setActiveTab('hadith');
                } else if (type === 'seerah') {
                    localStorage.setItem('last_seerah_chapter', item.dataset.id);
                    setActiveTab('seerah');
                } else if (type === 'sahaba') {
                    localStorage.setItem('last_sahaba_story', item.dataset.id);
                    setActiveTab('sahaba');
                } else if (type === 'stories') {
                    localStorage.setItem('last_prophet_story', item.dataset.id);
                    setActiveTab('stories');
                }
            });
        });
    };

    render();
};
