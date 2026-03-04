import { t, getCurrentLanguage } from '../i18n.js';
import { QuranIcon, HadithIcon, BookmarkIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon, ChevronRightIcon } from './Icons.js';

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

        const quranCount = bookmarks.quran.length;
        const hadithCount = bookmarks.hadith.length;
        const totalCount = quranCount + hadithCount;

        wrapper.innerHTML = `
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div class="flex items-center gap-4">
                    <button id="bookmarks-back-btn" class="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-90 flex items-center gap-1">
                        ${BackIcon({className: "w-6 h-6"})}
                        <span class="hidden sm:inline text-sm font-bold">${t('back')}</span>
                    </button>
                    <div>
                        <h1 class="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white tracking-tight">${t('bookmarks') || 'Bookmarks'}</h1>
                        <p class="text-slate-500 dark:text-slate-400 text-sm mt-1">${t('bookmarksDescription') || 'Your saved verses and hadiths'}</p>
                    </div>
                </div>
                
                <div class="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                    <button data-filter="all" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${state.activeFilter === 'all' ? 'bg-white dark:bg-slate-700 text-theme-600 dark:text-theme-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('all') || 'All'} (${totalCount})</button>
                    <button data-filter="quran" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${state.activeFilter === 'quran' ? 'bg-white dark:bg-slate-700 text-theme-600 dark:text-theme-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('quran')} (${quranCount})</button>
                    <button data-filter="hadith" class="filter-btn px-4 py-2 rounded-xl text-xs font-bold transition-all ${state.activeFilter === 'hadith' ? 'bg-white dark:bg-slate-700 text-theme-600 dark:text-theme-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}">${t('hadith')} (${hadithCount})</button>
                </div>
            </div>

            <div id="bookmarks-list" class="space-y-6">
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
            items = [...items, ...bookmarks.quran.map(b => ({ ...b, type: 'quran' }))];
        }
        if (state.activeFilter === 'all' || state.activeFilter === 'hadith') {
            items = [...items, ...bookmarks.hadith.map(b => ({ ...b, type: 'hadith' }))];
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
            <div class="group p-6 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-theme-500/30 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${item.type === 'quran' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'} flex items-center justify-center">
                            ${item.type === 'quran' ? QuranIcon({className: "w-5 h-5"}) : HadithIcon({className: "w-5 h-5"})}
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-900 dark:text-white text-sm">${item.title}</h4>
                            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${item.subtitle}</p>
                        </div>
                    </div>
                    <button data-id="${item.id}" data-type="${item.type}" class="remove-bookmark-btn p-2 rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 text-slate-400 transition-colors">
                        ${TrashIcon({className: "w-5 h-5"})}
                    </button>
                </div>
                <div class="relative cursor-pointer bookmark-content" data-id="${item.id}" data-type="${item.type}" data-surah="${item.surahNum}" data-ayah="${item.ayahNum}">
                    <p class="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif ${item.lang === 'ar' ? 'text-right font-amiri' : 'text-left'}" dir="${item.lang === 'ar' ? 'rtl' : 'ltr'}">
                        ${item.text.length > 200 ? item.text.substring(0, 200) + '...' : item.text}
                    </p>
                    <div class="mt-4 flex items-center justify-end text-theme-600 dark:text-theme-400 text-xs font-bold gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        ${t('viewDetails') || 'View Details'} ${ChevronRightIcon({className: "w-3 h-3"})}
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
                    // For hadith, we might need more logic to jump to specific one
                    // For now just go to hadith tab
                    setActiveTab('hadith');
                }
            });
        });
    };

    render();
};
